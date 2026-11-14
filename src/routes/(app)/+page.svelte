<script lang="ts">
	import ActivityHeatmap from '#lib/components/charts/ActivityHeatmap.svelte';
	import HeatmapLegend from '#lib/components/charts/HeatmapLegend.svelte';
	import MonthlyActivityChart from '#lib/components/charts/MonthlyActivityChart.svelte';
	import CriticalPeriods from '#lib/components/dashboard/CriticalPeriods.svelte';
	import PageHeader from '#lib/components/layout/PageHeader.svelte';
	import HotspotMap from '#lib/components/map/HotspotMap.svelte';
	import FilterBar from '#lib/components/ui/FilterBar.svelte';
	import KpiCard from '#lib/components/ui/KpiCard.svelte';
	import SelectField from '#lib/components/ui/SelectField.svelte';
	import Panel from '#lib/components/ui/Panel.svelte';
	import SensorLegend from '#lib/components/ui/SensorLegend.svelte';
	import StatusBadge from '#lib/components/ui/StatusBadge.svelte';
	import { dailyActivity, dataYear, monthlyActivity, monthNames } from '#lib/data/activity.ts';
	import { areas, lastUpdate, region, years } from '#lib/data/common.ts';
	import {
		confidenceOptions,
		criticalPeriods,
		hotspots,
		kpis,
		watchWindow
	} from '#lib/data/dashboard.ts';
	import type { Sensor } from '#lib/sensors.ts';

	// Los filtros aún no cambian los datos (siempre son los de `dataYear`): se conectarán
	// cuando exista la API.
	let year = $state(years[0]);
	let area = $state(areas[0]);
	let from = $state('2024-01-01');
	let to = $state('2024-12-31');
	let selectedSensors = $state<Sensor[]>(['MODIS', 'VIIRS']);
	let confidence = $state(confidenceOptions[0]);

	const countFormat = new Intl.NumberFormat('en-US');
</script>

<svelte:head>
	<title>Fire activity overview · Firewatch</title>
</svelte:head>

<PageHeader
	title="Fire activity overview"
	subtitle="MODIS + VIIRS harmonized hotspot intelligence"
>
	{#snippet actions()}
		<StatusBadge tone="success" dot>Data updated {lastUpdate}</StatusBadge>
		<SelectField bind:value={year} options={years} label="Year" class="w-auto" />
	{/snippet}
</PageHeader>

<FilterBar
	bind:area
	areaOptions={areas}
	bind:from
	bind:to
	bind:sensors={selectedSensors}
	bind:confidence
	{confidenceOptions}
/>

<section
	class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:gap-6"
	aria-label="Key figures"
>
	{#each kpis as kpi (kpi.label)}
		<KpiCard {...kpi} />
	{/each}
</section>

<div class="grid grid-cols-1 gap-4 xl:grid-cols-12 2xl:gap-6">
	<Panel title="Hotspot distribution" subtitle={region.name} class="xl:col-span-7">
		{#snippet action()}
			<StatusBadge>Fire radiative power</StatusBadge>
		{/snippet}

		<HotspotMap
			{hotspots}
			center={region.center}
			zoom={region.zoom}
			label="Map of fire detections in {region.name}"
			class="h-72 2xl:h-96"
		/>

		{#snippet footer()}
			<SensorLegend />
			<span class="ms-auto flex items-center gap-2">
				<span class="status status-neutral" aria-hidden="true"></span>
				{countFormat.format(hotspots.length)} detections shown
			</span>
		{/snippet}
	</Panel>

	<Panel
		title="Monthly fire activity"
		subtitle="Detections by sensor · {dataYear}"
		class="xl:col-span-5"
	>
		{#snippet action()}
			<StatusBadge tone="info">Monthly</StatusBadge>
		{/snippet}

		<MonthlyActivityChart months={monthNames} series={monthlyActivity} class="min-h-64 flex-1" />

		{#snippet footer()}
			<SensorLegend long />
		{/snippet}
	</Panel>

	<Panel
		title="Burning activity calendar"
		subtitle="Daily detections aggregated by week · {dataYear}"
		class="xl:col-span-7"
	>
		<ActivityHeatmap days={dailyActivity} label="Daily fire detections during {dataYear}" />

		{#snippet footer()}
			<HeatmapLegend />
		{/snippet}
	</Panel>

	<Panel title="Critical periods" subtitle="Unusual activity detected" class="xl:col-span-5">
		<CriticalPeriods periods={criticalPeriods} watch={watchWindow} />
	</Panel>
</div>
