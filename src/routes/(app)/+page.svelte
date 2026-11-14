<script lang="ts">
	import ActivityHeatmap from '#lib/components/charts/ActivityHeatmap.svelte';
	import HeatmapLegend from '#lib/components/charts/HeatmapLegend.svelte';
	import MonthlyActivityChart from '#lib/components/charts/MonthlyActivityChart.svelte';
	import CriticalPeriods from '#lib/components/dashboard/CriticalPeriods.svelte';
	import PageHeader from '#lib/components/layout/PageHeader.svelte';
	import HotspotMap from '#lib/components/map/HotspotMap.svelte';
	import type { DatePreset } from '#lib/components/ui/DateRangeField.svelte';
	import FilterBar, { type ExportOption } from '#lib/components/ui/FilterBar.svelte';
	import KpiCard from '#lib/components/ui/KpiCard.svelte';
	import Panel from '#lib/components/ui/Panel.svelte';
	import SensorLegend from '#lib/components/ui/SensorLegend.svelte';
	import StatusBadge from '#lib/components/ui/StatusBadge.svelte';
	import { areas, confidenceFilters, lastUpdate } from '#lib/data/common.ts';
	import {
		addDays,
		buildOverview,
		dailyBySensor,
		firstDataDay,
		today,
		watchWindow
	} from '#lib/data/dashboard.ts';
	import { detectionsCsv, detectionsGeoJson, download, toCsv } from '#lib/export.ts';
	import type { Sensor } from '#lib/sensors.ts';
	import { notify } from '#lib/toast.svelte.ts';

	const confidenceOptions = Object.keys(confidenceFilters);

	/** Atajos del rango: últimos días, temporada de incendios y años completos. */
	const datePresets: DatePreset[] = (() => {
		const year = Number(today.slice(0, 4));
		// Temporada del verano austral (dic–mar): la última que ya empezó.
		const seasonStart = today.slice(5, 7) === '12' ? year : year - 1;
		const seasonEnd = `${seasonStart + 1}-03-31`;
		const presets: DatePreset[] = [
			{ label: 'Last 7 days', from: addDays(today, -6), to: today },
			{ label: 'Last 30 days', from: addDays(today, -29), to: today },
			{ label: 'Last 90 days', from: addDays(today, -89), to: today },
			{
				label: `Fire season ${seasonStart}–${String(seasonStart + 1).slice(2)}`,
				from: `${seasonStart}-12-01`,
				to: seasonEnd < today ? seasonEnd : today
			},
			{ label: `${year} to date`, from: `${year}-01-01`, to: today }
		];
		for (let y = year - 1; y >= Number(firstDataDay.slice(0, 4)); y--) {
			presets.push({ label: String(y), from: `${y}-01-01`, to: `${y}-12-31` });
		}
		return presets;
	})();

	const defaults = {
		area: areas[0],
		from: '2024-01-01',
		to: '2024-12-31',
		sensors: ['MODIS', 'VIIRS'] as Sensor[],
		confidence: confidenceOptions[0]
	};

	let area = $state(defaults.area);
	let from = $state(defaults.from);
	let to = $state(defaults.to);
	let selectedSensors = $state<Sensor[]>([...defaults.sensors]);
	let confidence = $state(defaults.confidence);

	let query = $derived({
		area,
		from,
		to,
		sensors: selectedSensors,
		confidence: confidenceFilters[confidence]
	});
	let overview = $derived(buildOverview(query));

	const countFormat = new Intl.NumberFormat('en-US');
	const rangeFormat = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC'
	});

	/** "2024" si el rango es un año completo; si no, las fechas. */
	let period = $derived(
		from.endsWith('-01-01') && to === `${from.slice(0, 4)}-12-31`
			? from.slice(0, 4)
			: `${rangeFormat.format(new Date(from))} – ${rangeFormat.format(new Date(to))}`
	);

	let sensorText = $derived(
		selectedSensors.length === 2 ? 'MODIS + VIIRS harmonized' : selectedSensors[0]
	);

	/** Nombre base de los archivos: área y periodo. */
	let fileName = $derived(
		`firewatch-${overview.region.shortName.split(',')[0].toLowerCase()}-${from}_${to}`
	);

	function exported(what: string) {
		notify(`${what} exported for ${overview.region.shortName}.`, 'success');
	}

	let exportOptions = $derived<ExportOption[]>([
		{
			label: 'Detections · CSV',
			detail: `${countFormat.format(overview.hotspots.length)} points shown on the map`,
			run: () => {
				download(`${fileName}-detections.csv`, detectionsCsv(overview.hotspots), 'text/csv');
				exported('Detections');
			}
		},
		{
			label: 'Detections · GeoJSON',
			detail: 'Same points, ready for GIS tools',
			run: () => {
				download(
					`${fileName}-detections.geojson`,
					detectionsGeoJson(overview.hotspots),
					'application/geo+json'
				);
				exported('Detections');
			}
		},
		{
			label: 'Daily activity · CSV',
			detail: 'Detections per day and sensor',
			run: () => {
				const rows = dailyBySensor(query).map((day) => [day.date, ...day.counts]);
				download(`${fileName}-daily.csv`, toCsv(['date', ...selectedSensors], rows), 'text/csv');
				exported('Daily activity');
			}
		}
	]);

	function reset() {
		area = defaults.area;
		from = defaults.from;
		to = defaults.to;
		selectedSensors = [...defaults.sensors];
		confidence = defaults.confidence;
	}
</script>

<svelte:head>
	<title>Fire activity overview · Firewatch</title>
</svelte:head>

<PageHeader title="Fire activity overview" subtitle="{sensorText} hotspot intelligence">
	{#snippet actions()}
		<StatusBadge tone="success" dot>Data updated {lastUpdate}</StatusBadge>
	{/snippet}
</PageHeader>

<FilterBar
	bind:area
	areaOptions={areas}
	bind:from
	bind:to
	{datePresets}
	minDate={firstDataDay}
	maxDate={today}
	bind:sensors={selectedSensors}
	bind:confidence
	{confidenceOptions}
	confidenceLabel="Confidence"
	{exportOptions}
	onreset={reset}
/>

<section
	class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:gap-6"
	aria-label="Key figures"
>
	{#each overview.kpis as kpi (kpi.label)}
		<KpiCard {...kpi} />
	{/each}
</section>

<div class="grid grid-cols-1 gap-4 xl:grid-cols-12 2xl:gap-6">
	<Panel title="Hotspot distribution" subtitle={overview.region.name} class="xl:col-span-7">
		{#snippet action()}
			<StatusBadge>Fire radiative power</StatusBadge>
		{/snippet}

		<HotspotMap
			hotspots={overview.hotspots}
			center={overview.region.center}
			zoom={overview.region.zoom}
			label="Map of fire detections in {overview.region.name}"
			controls
			class="h-72 2xl:h-96"
		/>

		{#snippet footer()}
			<SensorLegend only={selectedSensors} />
			<span class="ms-auto flex items-center gap-2">
				<span class="status status-neutral" aria-hidden="true"></span>
				{countFormat.format(overview.hotspots.length)} detections shown
			</span>
		{/snippet}
	</Panel>

	<Panel
		title="Monthly fire activity"
		subtitle="Detections by sensor · {period}"
		class="xl:col-span-5"
	>
		{#snippet action()}
			<StatusBadge tone="info">Monthly</StatusBadge>
		{/snippet}

		<MonthlyActivityChart
			months={overview.monthly.months}
			series={overview.monthly.series}
			class="min-h-64 flex-1"
		/>

		{#snippet footer()}
			<SensorLegend long only={selectedSensors} />
		{/snippet}
	</Panel>

	<Panel
		title="Burning activity calendar"
		subtitle="Daily detections aggregated by week · {period}"
		class="xl:col-span-7"
	>
		<ActivityHeatmap days={overview.daily} label="Daily fire detections, {period}" />

		{#snippet footer()}
			<HeatmapLegend />
		{/snippet}
	</Panel>

	<Panel title="Critical periods" subtitle="Unusual activity detected" class="xl:col-span-5">
		<CriticalPeriods periods={overview.critical} watch={watchWindow} />
	</Panel>
</div>
