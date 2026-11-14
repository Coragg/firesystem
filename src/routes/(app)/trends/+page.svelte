<script lang="ts">
	import MonthlyActivityChart from '#lib/components/charts/MonthlyActivityChart.svelte';
	import CriticalPeriods from '#lib/components/dashboard/CriticalPeriods.svelte';
	import PageHeader from '#lib/components/layout/PageHeader.svelte';
	import RegionalComparison from '#lib/components/trends/RegionalComparison.svelte';
	import FilterBar from '#lib/components/ui/FilterBar.svelte';
	import KpiCard from '#lib/components/ui/KpiCard.svelte';
	import Panel from '#lib/components/ui/Panel.svelte';
	import SensorLegend from '#lib/components/ui/SensorLegend.svelte';
	import { monthNames } from '#lib/data/activity.ts';
	import { areas } from '#lib/data/common.ts';
	import {
		averageChange,
		monthlyAverages,
		notablePeriods,
		periods,
		regionalShares,
		sensorMatchRate,
		yearlyDetections
	} from '#lib/data/trends.ts';
	import type { Kpi } from '#lib/types.ts';

	// Periodo y región aún no cambian los datos: se conectarán cuando exista la API.
	let period = $state(periods[0]);
	let area = $state(areas[0]);

	const countFormat = new Intl.NumberFormat('en-US');

	// Las cifras de arriba se calculan de las detecciones por año.
	const total = yearlyDetections.reduce((sum, item) => sum + item.count, 0);
	const peak = yearlyDetections.reduce((best, item) => (item.count > best.count ? item : best));

	const kpis: Kpi[] = [
		{
			label: `${yearlyDetections.length}-year detections`,
			value: countFormat.format(total),
			note: 'Across selected sensors'
		},
		{
			label: 'Annual average',
			value: countFormat.format(Math.round(total / yearlyDetections.length)),
			highlight: averageChange.value,
			tone: 'secondary',
			trend: averageChange.trend,
			note: 'vs. prior period'
		},
		{
			label: 'Peak year',
			value: String(peak.year),
			highlight: `${countFormat.format(peak.count)} detections`,
			tone: 'warning'
		},
		{
			label: 'Sensor match rate',
			value: sensorMatchRate,
			note: 'MODIS and VIIRS overlap'
		}
	];
</script>

<svelte:head>
	<title>Trends & reports · Firewatch</title>
</svelte:head>

<PageHeader
	title="Trends & reports"
	subtitle="Long-term patterns, sensor comparisons and notable fire periods"
/>

<FilterBar
	fields={['period', 'area']}
	bind:period
	periodOptions={periods}
	bind:area
	areaOptions={areas}
	areaLabel="Region"
	exportLabel="Generate report"
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
	<Panel
		title="Annual fire activity"
		subtitle="Average monthly detections by sensor, {period}"
		class="xl:col-span-8"
	>
		<MonthlyActivityChart
			months={monthNames}
			series={monthlyAverages}
			monthLabels="short"
			class="min-h-80 flex-1"
		/>

		{#snippet footer()}
			<SensorLegend />
		{/snippet}
	</Panel>

	<Panel title="Notable periods" subtitle="Activity above seasonal baseline" class="xl:col-span-4">
		<CriticalPeriods periods={notablePeriods} />
	</Panel>

	<Panel
		title="Regional comparison"
		subtitle="Relative detections across the selected region"
		class="xl:col-span-12"
	>
		<RegionalComparison regions={regionalShares} />
	</Panel>
</div>
