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
	import { areaLabel, areas, type AreaId } from '#lib/data/common.ts';
	import {
		averageChange,
		monthlyAverages,
		notablePeriods,
		periodLabel,
		periods,
		regionalShares,
		sensorMatchRate,
		yearlyDetections
	} from '#lib/data/trends.ts';
	import { formatNumber, formatPercent } from '#lib/format.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { Kpi } from '#lib/types.ts';

	// Periodo y región aún no cambian los datos: se conectarán cuando exista la API.
	let period = $state(periods[0]);
	let area = $state<AreaId>(areas[0]);

	// Las cifras de arriba se calculan de las detecciones por año.
	const total = yearlyDetections.reduce((sum, item) => sum + item.count, 0);
	const peak = yearlyDetections.reduce((best, item) => (item.count > best.count ? item : best));

	// Regla de tendencias de la app: más fuego = error (rojo), menos = success.
	const rising = averageChange >= 0;

	const kpis: Kpi[] = [
		{
			label: m.trends_kpi_years({ years: yearlyDetections.length }),
			value: formatNumber(total),
			note: m.kpi_across_sensors()
		},
		{
			label: m.trends_annual_average(),
			value: formatNumber(Math.round(total / yearlyDetections.length)),
			highlight: formatPercent(Math.abs(averageChange), 1),
			tone: rising ? 'error' : 'success',
			trend: rising ? 'up' : 'down',
			note: m.kpi_vs_previous_period()
		},
		{
			label: m.trends_peak_year(),
			value: String(peak.year),
			highlight: m.detections_count({ count: formatNumber(peak.count) }),
			tone: 'warning'
		},
		{
			label: m.trends_match_rate(),
			value: formatPercent(sensorMatchRate, 1),
			note: m.kpi_sensor_overlap()
		}
	];
</script>

<svelte:head>
	<title>{m.nav_trends()} · Firewatch</title>
</svelte:head>

<PageHeader title={m.nav_trends()} subtitle={m.trends_subtitle()} />

<FilterBar
	fields={['period', 'area']}
	bind:period
	periodOptions={periods}
	periodFormat={periodLabel}
	bind:area
	areaOptions={areas}
	areaFormat={(id) => areaLabel(id as AreaId)}
	areaLabel={m.filter_region()}
	exportLabel={m.trends_generate_report()}
/>

<section
	class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:gap-6"
	aria-label={m.key_figures()}
>
	{#each kpis as kpi (kpi.label)}
		<KpiCard {...kpi} />
	{/each}
</section>

<div class="grid grid-cols-1 gap-4 xl:grid-cols-12 2xl:gap-6">
	<Panel
		title={m.trends_annual_title()}
		subtitle={m.trends_annual_subtitle({ period: periodLabel(period) })}
		class="xl:col-span-8"
	>
		<MonthlyActivityChart
			months={monthNames()}
			series={monthlyAverages}
			monthLabels="short"
			class="min-h-80 flex-1"
		/>

		{#snippet footer()}
			<SensorLegend />
		{/snippet}
	</Panel>

	<Panel
		title={m.trends_notable_title()}
		subtitle={m.trends_notable_subtitle()}
		class="xl:col-span-4"
	>
		<CriticalPeriods periods={notablePeriods()} />
	</Panel>

	<Panel
		title={m.trends_regional_title()}
		subtitle={m.trends_regional_subtitle()}
		class="xl:col-span-12"
	>
		<RegionalComparison regions={regionalShares} />
	</Panel>
</div>
