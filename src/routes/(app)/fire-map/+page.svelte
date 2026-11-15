<script lang="ts">
	import DetectionDetails from '#lib/components/fire-map/DetectionDetails.svelte';
	import TimeSlider from '#lib/components/fire-map/TimeSlider.svelte';
	import PageHeader from '#lib/components/layout/PageHeader.svelte';
	import FrpLegend from '#lib/components/map/FrpLegend.svelte';
	import HotspotMap from '#lib/components/map/HotspotMap.svelte';
	import FilterBar from '#lib/components/ui/FilterBar.svelte';
	import DropdownSelect from '#lib/components/ui/DropdownSelect.svelte';
	import SelectField from '#lib/components/ui/SelectField.svelte';
	import SensorLegend from '#lib/components/ui/SensorLegend.svelte';
	import StatusBadge from '#lib/components/ui/StatusBadge.svelte';
	import {
		areaLabel,
		areas,
		confidenceFilterLabel,
		confidenceOptions,
		minutesSinceUpdate,
		region,
		years,
		type AreaId,
		type ConfidenceFilter
	} from '#lib/data/common.ts';
	import {
		confidenceFilters,
		defaultDayIndex,
		defaultDetectionId,
		detections,
		mapLayerLabel,
		mapLayers,
		mapPeriod,
		type MapLayer
	} from '#lib/data/fire-map.ts';
	import { formatDate, formatMinutesAgo, formatNumber } from '#lib/format.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { Sensor } from '#lib/sensors.ts';
	import type { DailyActivity, Detection } from '#lib/types.ts';

	/** Radio para contar la actividad cercana a la detección seleccionada. */
	const nearbyRadiusKm = 5;
	/** Ventana para considerar que MODIS y VIIRS vieron el mismo fuego. */
	const overlapWindowMinutes = 60;

	// Área, fechas y año aún no cambian los datos: se conectarán cuando exista la API.
	let year = $state(years[0]);
	let area = $state<AreaId>(areas[0]);
	let from = $state(mapPeriod.from);
	let to = $state(mapPeriod.to);
	let selectedSensors = $state<Sensor[]>(['MODIS', 'VIIRS']);
	let confidence = $state<ConfidenceFilter>(confidenceOptions[0]);
	let layer = $state<MapLayer>(mapLayers[0]);
	let dayIndex = $state(defaultDayIndex);
	let selectedId = $state(defaultDetectionId);


	function dayOf(detection: Detection): number {
		return new Date(detection.acquired).getUTCDate();
	}

	/** Distancia en km entre dos puntos (fórmula del haversine). */
	function distanceKm(a: Detection, b: Detection): number {
		const rad = Math.PI / 180;
		const dLat = (b.lat - a.lat) * rad;
		const dLng = (b.lng - a.lng) * rad;
		const h =
			Math.sin(dLat / 2) ** 2 +
			Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
		return 6371 * 2 * Math.asin(Math.sqrt(h));
	}

	let filtered = $derived(
		detections.filter(
			(detection) =>
				selectedSensors.includes(detection.sensor) &&
				confidenceFilters[confidence].includes(detection.confidence)
		)
	);

	let days = $derived.by<DailyActivity[]>(() => {
		const counts = Array.from({ length: mapPeriod.days }, () => 0);
		for (const detection of filtered) counts[dayOf(detection) - 1] += 1;
		return counts.map((count, index) => ({
			date: `${mapPeriod.from.slice(0, 8)}${String(index + 1).padStart(2, '0')}`,
			count
		}));
	});

	/** El mapa acumula las detecciones desde el inicio del mes hasta el día seleccionado. */
	let visible = $derived(filtered.filter((detection) => dayOf(detection) <= dayIndex + 1));

	let selected = $derived(detections.find((detection) => detection.id === selectedId));

	let nearby = $derived.by(() => {
		if (!selected) return [];
		const origin = selected;
		return detections.filter(
			(other) => other.id !== origin.id && distanceKm(origin, other) <= nearbyRadiusKm
		);
	});

	let modisOverlapMinutes = $derived.by(() => {
		if (!selected) return undefined;
		const time = new Date(selected.acquired).getTime();
		const gaps = nearby
			.filter((other) => other.sensor === 'MODIS')
			.map((other) => Math.round(Math.abs(new Date(other.acquired).getTime() - time) / 60000))
			.filter((minutes) => minutes <= overlapWindowMinutes);
		return gaps.length ? Math.min(...gaps) : undefined;
	});

	function reset() {
		area = areas[0];
		from = mapPeriod.from;
		to = mapPeriod.to;
		selectedSensors = ['MODIS', 'VIIRS'];
		confidence = confidenceOptions[0];
		layer = mapLayers[0];
		dayIndex = defaultDayIndex;
		selectedId = defaultDetectionId;
	}
</script>

<svelte:head>
	<title>{m.nav_fire_map()} · Firewatch</title>
</svelte:head>

<PageHeader title={m.nav_fire_map()} subtitle={m.fire_map_subtitle()}>
	{#snippet actions()}
		<StatusBadge tone="success" dot>
			{m.data_updated({ when: formatMinutesAgo(minutesSinceUpdate) })}
		</StatusBadge>
		<SelectField bind:value={year} options={years} label={m.filter_year()} class="w-auto" />
	{/snippet}
</PageHeader>

<FilterBar
	bind:area
	areaOptions={areas}
	areaFormat={(id) => areaLabel(id as AreaId)}
	bind:from
	bind:to
	bind:sensors={selectedSensors}
	bind:confidence
	{confidenceOptions}
	confidenceFormat={(id) => confidenceFilterLabel(id as ConfidenceFilter)}
	dateLabel={m.filter_date()}
	exportLabel={m.export_short()}
	onreset={reset}
/>

<div class="grid grid-cols-1 gap-4 xl:grid-cols-12 2xl:gap-6">
	<HotspotMap
		hotspots={visible}
		center={region.center}
		zoom={region.zoom + 1}
		label={m.map_label({ region: region.name })}
		colorMode={layer}
		controls
		{selectedId}
		onselect={(id) => (selectedId = id)}
		class="h-128 xl:col-span-8 xl:h-auto xl:min-h-160"
	>
		{#snippet overlay()}
			<div class="absolute start-3 top-3 w-56">
				<DropdownSelect
					bind:value={layer}
					options={mapLayers}
					format={mapLayerLabel}
					label={m.map_layer()}
					class="w-full"
				/>
			</div>
			<div class="absolute end-3 top-3 rounded-full bg-base-100 shadow-sm">
				<StatusBadge tone="neutral" dot>
					{m.detections_count({ count: formatNumber(visible.length) })}
				</StatusBadge>
			</div>
			<div class="card absolute end-3 bottom-8 bg-base-100 p-3 text-caption text-base-content/70 shadow-sm">
				{#if layer === 'frp'}
					<FrpLegend />
				{:else}
					<SensorLegend />
				{/if}
			</div>
		{/snippet}
	</HotspotMap>

	<div class="xl:col-span-4">
		{#if selected}
			<DetectionDetails
				detection={selected}
				location={region.shortName}
				nearbyCount={nearby.length}
				{nearbyRadiusKm}
				{modisOverlapMinutes}
			/>
		{/if}
	</div>
</div>

<TimeSlider
	{days}
	bind:value={dayIndex}
	title={formatDate(mapPeriod.from, 'monthYear')}
	subtitle={m.detections_count({ count: formatNumber(filtered.length) })}
/>
