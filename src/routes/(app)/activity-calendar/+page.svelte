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
	import { areaLabel, areas, years, type AreaId } from '#lib/data/common.ts';
	import { formatDate, formatNumber } from '#lib/format.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { Sensor } from '#lib/sensors.ts';

	// Año y área aún no cambian los datos (siempre son los de `dataYear`): se conectarán
	// cuando exista la API. Los sensores sí filtran el gráfico mensual.
	let year = $state(years[0]);
	let area = $state<AreaId>(areas[0]);
	let selectedSensors = $state<Sensor[]>(['MODIS', 'VIIRS']);

	const months = monthNames();

	const summary = summarize(dailyActivity);
	const weeks = Math.ceil(dailyActivity.length / 7);

	let monthlySeries = $derived(
		monthlyActivity.filter((series) => selectedSensors.includes(series.sensor))
	);
</script>

<svelte:head>
	<title>{m.nav_activity_calendar()} · Firewatch</title>
</svelte:head>

<PageHeader
	title={m.nav_activity_calendar()}
	subtitle={m.calendar_subtitle({ year: dataYear })}
/>

<FilterBar
	fields={['year', 'area', 'sensors']}
	bind:year
	yearOptions={years}
	bind:area
	areaOptions={areas}
	areaFormat={(id) => areaLabel(id as AreaId)}
	bind:sensors={selectedSensors}
	exportLabel={m.export_calendar()}
/>

<section
	class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:gap-6"
	aria-label={m.key_figures()}
>
	{#each kpis() as kpi (kpi.label)}
		<KpiCard {...kpi} />
	{/each}
</section>

<div class="grid grid-cols-1 gap-4 xl:grid-cols-12 2xl:gap-6">
	<Panel
		title={m.calendar_intensity_title()}
		subtitle={m.calendar_intensity_subtitle({ year: dataYear })}
		class="xl:col-span-8"
	>
		<ActivityHeatmap
			days={dailyActivity}
			months="all"
			label={m.calendar_label({ period: String(dataYear) })}
		/>

		<p class="border-t border-base-content/10 pt-4 text-body-lg text-secondary-strong">
			{heatmapInsight()}
		</p>

		{#snippet footer()}
			<HeatmapLegend />
			<span class="ms-auto">{m.calendar_weekly_view({ weeks })}</span>
		{/snippet}
	</Panel>

	<Panel
		title={m.seasonal_title()}
		subtitle={m.seasonal_subtitle()}
		class="xl:col-span-4"
	>
		<SeasonalInsights {summary} monthNames={months} watch={watchWindow()} />
	</Panel>

	<Panel
		title={m.calendar_monthly_title()}
		subtitle={m.calendar_monthly_subtitle()}
		class="xl:col-span-12"
	>
		<div class="flex flex-col gap-6 lg:flex-row lg:items-center">
			<MonthlyActivityChart months={months} series={monthlySeries} class="h-64 flex-1" />
			<div class="border-base-content/10 lg:w-56 lg:border-s lg:ps-6">
				<StatBlock
					label={m.calendar_top_day()}
					value={formatDate(summary.peakDay.date, 'day')}
					note={m.kpi_hotspots({ count: formatNumber(summary.peakDay.count) })}
				/>
			</div>
		</div>

		{#snippet footer()}
			<SensorLegend long />
		{/snippet}
	</Panel>
</div>
