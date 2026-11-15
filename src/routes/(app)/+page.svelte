<script lang="ts">
	import ActivityHeatmap from '#lib/components/charts/ActivityHeatmap.svelte';
	import HeatmapLegend from '#lib/components/charts/HeatmapLegend.svelte';
	import MonthlyActivityChart from '#lib/components/charts/MonthlyActivityChart.svelte';
	import CriticalPeriods from '#lib/components/dashboard/CriticalPeriods.svelte';
	import PageHeader from '#lib/components/layout/PageHeader.svelte';
	import FrpLegend from '#lib/components/map/FrpLegend.svelte';
	import HotspotMap from '#lib/components/map/HotspotMap.svelte';
	import type { DatePreset } from '#lib/components/ui/DateRangeField.svelte';
	import FilterBar, { type ExportOption } from '#lib/components/ui/FilterBar.svelte';
	import KpiCard from '#lib/components/ui/KpiCard.svelte';
	import Panel from '#lib/components/ui/Panel.svelte';
	import SensorLegend from '#lib/components/ui/SensorLegend.svelte';
	import StatusBadge from '#lib/components/ui/StatusBadge.svelte';
	import TabSwitch from '#lib/components/ui/TabSwitch.svelte';
	import {
		areaLabel,
		areas,
		confidenceFilterLabel,
		confidenceFilters,
		confidenceOptions,
		minutesSinceUpdate,
		type AreaId,
		type ConfidenceFilter
	} from '#lib/data/common.ts';
	import {
		addDays,
		buildOverview,
		dailyBySensor,
		firstDataDay,
		today,
		weeklyMaxDays
	} from '#lib/data/dashboard.ts';
	import { detectionsCsv, detectionsGeoJson, download, toCsv } from '#lib/export.ts';
	import { formatDateRange, formatMinutesAgo, formatNumber } from '#lib/format.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { Sensor } from '#lib/sensors.ts';
	import { notify } from '#lib/toast.svelte.ts';
	import type { CriticalPeriod } from '#lib/types.ts';

	/** Atajos del rango: últimos días, temporada de incendios y años completos. */
	const datePresets: DatePreset[] = (() => {
		const year = Number(today.slice(0, 4));
		// Temporada del verano austral (dic–mar): la última que ya empezó.
		const seasonStart = today.slice(5, 7) === '12' ? year : year - 1;
		const seasonEnd = `${seasonStart + 1}-03-31`;
		const presets: DatePreset[] = [
			{ label: m.preset_last_days({ days: 7 }), from: addDays(today, -6), to: today },
			{ label: m.preset_last_days({ days: 30 }), from: addDays(today, -29), to: today },
			{ label: m.preset_last_days({ days: 90 }), from: addDays(today, -89), to: today },
			{
				label: m.preset_fire_season({ season: `${seasonStart}–${String(seasonStart + 1).slice(2)}` }),
				from: `${seasonStart}-12-01`,
				to: seasonEnd < today ? seasonEnd : today
			},
			{ label: m.preset_year_to_date({ year }), from: `${year}-01-01`, to: today }
		];
		for (let y = year - 1; y >= Number(firstDataDay.slice(0, 4)); y--) {
			presets.push({ label: String(y), from: `${y}-01-01`, to: `${y}-12-31` });
		}
		return presets;
	})();

	const defaults = {
		area: areas[0] as AreaId,
		from: '2024-01-01',
		to: '2024-12-31',
		sensors: ['MODIS', 'VIIRS'] as Sensor[],
		confidence: confidenceOptions[0] as ConfidenceFilter
	};

	let area = $state(defaults.area);
	let from = $state(defaults.from);
	let to = $state(defaults.to);
	let selectedSensors = $state<Sensor[]>([...defaults.sensors]);
	let confidence = $state(defaults.confidence);
	/** Capa del mapa: color por sensor o por potencia radiativa. */
	let mapLayer = $state<'sensor' | 'frp'>('sensor');
	/** Granularidad del gráfico de actividad. */
	let granularity = $state<'monthly' | 'weekly'>('monthly');
	/** Sube con cada "Reset" para que el mapa vuelva a la vista del área. */
	let viewVersion = $state(0);

	let query = $derived({
		area,
		from,
		to,
		sensors: selectedSensors,
		confidence: confidenceFilters[confidence]
	});
	let overview = $derived(buildOverview(query));

	let atDefaults = $derived(
		area === defaults.area &&
			from === defaults.from &&
			to === defaults.to &&
			confidence === defaults.confidence &&
			selectedSensors.length === defaults.sensors.length
	);

	/** "2024" si el rango es un año completo; si no, el rango con el formato del idioma. */
	let period = $derived(
		from.endsWith('-01-01') && to === `${from.slice(0, 4)}-12-31`
			? from.slice(0, 4)
			: formatDateRange(from, to)
	);

	let sensorText = $derived(
		selectedSensors.length === 2 ? m.overview_subtitle_both() : m.overview_subtitle_one({ sensor: selectedSensors[0] })
	);

	// La vista semanal solo existe en rangos cortos: si el rango crece, vuelve a mensual.
	$effect(() => {
		if (!overview.weekly && granularity === 'weekly') granularity = 'monthly';
	});
	let activity = $derived(
		granularity === 'weekly' && overview.weekly ? overview.weekly : overview.monthly
	);

	/** Nombre base de los archivos: área y periodo. */
	let fileName = $derived(`firewatch-${area}-${from}_${to}`);

	function exported(what: string) {
		notify(m.export_done({ what, region: overview.region.shortName }), 'success');
	}

	let exportOptions = $derived<ExportOption[]>([
		{
			label: m.export_detections_csv(),
			detail: m.export_detections_csv_detail({ count: formatNumber(overview.hotspots.length) }),
			run: () => {
				download(`${fileName}-detections.csv`, detectionsCsv(overview.hotspots), 'text/csv');
				exported(m.export_what_detections());
			}
		},
		{
			label: m.export_detections_geojson(),
			detail: m.export_detections_geojson_detail(),
			run: () => {
				download(
					`${fileName}-detections.geojson`,
					detectionsGeoJson(overview.hotspots),
					'application/geo+json'
				);
				exported(m.export_what_detections());
			}
		},
		{
			label: m.export_daily_csv(),
			detail: m.export_daily_csv_detail(),
			run: () => {
				const rows = dailyBySensor(query).map((day) => [day.date, ...day.counts]);
				download(`${fileName}-daily.csv`, toCsv(['date', ...selectedSensors], rows), 'text/csv');
				exported(m.export_what_daily());
			}
		}
	]);

	function reset() {
		area = defaults.area;
		from = defaults.from;
		to = defaults.to;
		selectedSensors = [...defaults.sensors];
		confidence = defaults.confidence;
		viewVersion += 1;
	}

	/** Al elegir un periodo crítico, todo el panel se enfoca en esa semana. */
	function focusPeriod(item: CriticalPeriod) {
		if (!item.from || !item.to) return;
		from = item.from;
		to = item.to;
	}
</script>

<svelte:head>
	<title>{m.overview_title()} · Firewatch</title>
</svelte:head>

<PageHeader title={m.overview_title()} subtitle={sensorText}>
	{#snippet actions()}
		<StatusBadge tone="success" dot>
			{m.data_updated({ when: formatMinutesAgo(minutesSinceUpdate) })}
		</StatusBadge>
	{/snippet}
</PageHeader>

<FilterBar
	bind:area
	areaOptions={areas}
	areaFormat={(id) => areaLabel(id as AreaId)}
	bind:from
	bind:to
	{datePresets}
	minDate={firstDataDay}
	maxDate={today}
	bind:sensors={selectedSensors}
	bind:confidence
	{confidenceOptions}
	confidenceFormat={(id) => confidenceFilterLabel(id as ConfidenceFilter)}
	{exportOptions}
	onreset={reset}
	resetDisabled={atDefaults}
/>

<section
	class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:gap-6"
	aria-label={m.key_figures()}
>
	{#each overview.kpis as kpi (kpi.label)}
		<KpiCard {...kpi} />
	{/each}
</section>

<div class="grid grid-cols-1 gap-4 xl:grid-cols-12 2xl:gap-6">
	<Panel title={m.panel_hotspots()} subtitle={overview.region.name} class="xl:col-span-7">
		{#snippet action()}
			<TabSwitch
				bind:value={mapLayer}
				label={m.map_layer()}
				options={[
					{ value: 'sensor', label: m.map_layer_sensor() },
					{ value: 'frp', label: m.map_layer_frp() }
				]}
			/>
		{/snippet}

		<HotspotMap
			hotspots={overview.hotspots}
			center={overview.region.center}
			zoom={overview.region.zoom}
			label={m.map_label({ region: overview.region.name })}
			colorMode={mapLayer}
			controls
			{viewVersion}
			class="h-72 2xl:h-96"
		/>

		{#snippet footer()}
			{#if mapLayer === 'frp'}
				<FrpLegend />
			{:else}
				<SensorLegend only={selectedSensors} />
			{/if}
			<!-- El mapa muestra una muestra de puntos, no todas las detecciones del KPI. -->
			<span class="ms-auto flex items-center gap-2" title={m.map_sample_hint()}>
				<span class="status status-neutral" aria-hidden="true"></span>
				{m.map_sample_count({ count: formatNumber(overview.hotspots.length) })}
			</span>
		{/snippet}
	</Panel>

	<Panel
		title={granularity === 'weekly' && overview.weekly ? m.panel_weekly() : m.panel_monthly()}
		subtitle={m.panel_activity_subtitle({ period })}
		class="xl:col-span-5"
	>
		{#snippet action()}
			<TabSwitch
				bind:value={granularity}
				label={m.chart_granularity()}
				options={[
					{ value: 'monthly', label: m.granularity_monthly() },
					{
						value: 'weekly',
						label: m.granularity_weekly(),
						disabled: !overview.weekly,
						hint: m.granularity_weekly_hint({ months: Math.round(weeklyMaxDays / 30) })
					}
				]}
			/>
		{/snippet}

		<MonthlyActivityChart
			months={activity.names}
			axisLabels={activity.labels}
			series={activity.series}
			monthLabels="short"
			label={m.chart_activity_label()}
			class="min-h-64 flex-1"
		/>

		{#snippet footer()}
			<SensorLegend long only={selectedSensors} />
		{/snippet}
	</Panel>

	<Panel
		title={m.panel_calendar()}
		subtitle={m.panel_calendar_subtitle({ period })}
		class="xl:col-span-7"
	>
		<ActivityHeatmap days={overview.daily} label={m.calendar_label({ period })} />

		{#snippet footer()}
			<HeatmapLegend />
		{/snippet}
	</Panel>

	<Panel title={m.panel_critical()} subtitle={m.panel_critical_subtitle()} class="xl:col-span-5">
		<CriticalPeriods
			periods={overview.critical}
			watch={overview.watch}
			onselect={focusPeriod}
			selectedId={from}
		/>
	</Panel>
</div>
