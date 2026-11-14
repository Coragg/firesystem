<script lang="ts">
	import { summarize } from '#lib/activity.ts';
	import SeasonalInsights from '#lib/components/activity-calendar/SeasonalInsights.svelte';
	import ActivityHeatmap from '#lib/components/charts/ActivityHeatmap.svelte';
	import HeatmapLegend from '#lib/components/charts/HeatmapLegend.svelte';
	import MonthlyActivityChart from '#lib/components/charts/MonthlyActivityChart.svelte';
	import PageHeader from '#lib/components/layout/PageHeader.svelte';
	import FilterBar from '#lib/components/ui/FilterBar.svelte';
	import KpiCard from '#lib/components/ui/KpiCard.svelte';
	import Panel from '#lib/components/ui/Panel.svelte';
	import SensorLegend from '#lib/components/ui/SensorLegend.svelte';
	import StatBlock from '#lib/components/ui/StatBlock.svelte';
	import { dailyActivity, dataYear, monthlyActivity, monthNames } from '#lib/data/activity.ts';
	import { heatmapInsight, kpis, watchWindow } from '#lib/data/activity-calendar.ts';
	import { areas, years } from '#lib/data/common.ts';
	import type { Sensor } from '#lib/sensors.ts';

	// Año y área aún no cambian los datos (siempre son los de `dataYear`): se conectarán
	// cuando exista la API. Los sensores sí filtran el gráfico mensual.
	let year = $state(years[0]);
	let area = $state(areas[0]);
	let selectedSensors = $state<Sensor[]>(['MODIS', 'VIIRS']);

	const countFormat = new Intl.NumberFormat('en-US');
	const dayFormat = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC'
	});

	const summary = summarize(dailyActivity);
	const weeks = Math.ceil(dailyActivity.length / 7);

	let monthlySeries = $derived(
		monthlyActivity.filter((series) => selectedSensors.includes(series.sensor))
	);
</script>

<svelte:head>
	<title>Activity calendar · Firewatch</title>
</svelte:head>

<PageHeader
	title="Activity calendar"
	subtitle="Daily fire activity harmonized across MODIS and VIIRS in {dataYear}"
/>

<FilterBar
	fields={['year', 'area', 'sensors']}
	bind:year
	yearOptions={years}
	bind:area
	areaOptions={areas}
	bind:sensors={selectedSensors}
	exportLabel="Export calendar"
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
		title="Daily activity intensity"
		subtitle="Each cell represents one day of {dataYear}"
		class="xl:col-span-8"
	>
		<ActivityHeatmap
			days={dailyActivity}
			months="all"
			label="Daily fire detections during {dataYear}"
		/>

		<p class="border-t border-base-content/10 pt-4 text-body-lg text-secondary-strong">
			{heatmapInsight}
		</p>

		{#snippet footer()}
			<HeatmapLegend />
			<span class="ms-auto">Weekly view, {weeks} weeks</span>
		{/snippet}
	</Panel>

	<Panel title="Seasonal insights" subtitle="Patterns across selected period" class="xl:col-span-4">
		<SeasonalInsights {summary} {monthNames} watch={watchWindow} />
	</Panel>

	<Panel
		title="Monthly activity"
		subtitle="Detections by month for the selected sensors"
		class="xl:col-span-12"
	>
		<div class="flex flex-col gap-6 lg:flex-row lg:items-center">
			<MonthlyActivityChart months={monthNames} series={monthlySeries} class="h-64 flex-1" />
			<div class="border-base-content/10 lg:w-56 lg:border-s lg:ps-6">
				<StatBlock
					label="Top detection day"
					value={dayFormat.format(new Date(summary.peakDay.date))}
					note="{countFormat.format(summary.peakDay.count)} hotspots"
				/>
			</div>
		</div>

		{#snippet footer()}
			<SensorLegend long />
		{/snippet}
	</Panel>
</div>
