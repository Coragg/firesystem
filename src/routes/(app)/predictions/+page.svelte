<script lang="ts">
	import MousePointerClick from '@lucide/svelte/icons/mouse-pointer-click';
	import Play from '@lucide/svelte/icons/play';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import PageHeader from '#lib/components/layout/PageHeader.svelte';
	import ForecastResult from '#lib/components/predictions/ForecastResult.svelte';
	import LocationPicker from '#lib/components/predictions/LocationPicker.svelte';
	import FilterField from '#lib/components/ui/FilterField.svelte';
	import Panel from '#lib/components/ui/Panel.svelte';
	import StatusBadge from '#lib/components/ui/StatusBadge.svelte';
	import {
		fetchHotspotForecast,
		ForecastError,
		forecastRegion,
		insideRegion,
		type HotspotForecast
	} from '#lib/hotspot-forecast.ts';
	import { notify } from '#lib/toast.svelte.ts';

	const [[south, west], [north, east]] = forecastRegion.bounds;

	// Punto inicial: el centro de la región del modelo, en el mes actual.
	let month = $state(new Date().toISOString().slice(0, 7));
	let lat = $state<number | null>(forecastRegion.center[0]);
	let lon = $state<number | null>(forecastRegion.center[1]);

	let forecast = $state<HotspotForecast>();
	let error = $state<string>();
	let loading = $state(false);
	/** Cancela la consulta anterior si se lanza otra antes de que responda. */
	let controller: AbortController | undefined;

	let ready = $derived(Boolean(month) && lat != null && lon != null);
	let outside = $derived(lat != null && lon != null && !insideRegion(lat, lon));

	async function run(event: SubmitEvent) {
		event.preventDefault();
		if (!ready || lat == null || lon == null) return;
		controller?.abort();
		const current = new AbortController();
		controller = current;
		loading = true;
		error = undefined;
		try {
			forecast = await fetchHotspotForecast({ month, lat, lon }, { signal: current.signal });
		} catch (failure) {
			if (current.signal.aborted) return;
			error =
				failure instanceof ForecastError ? failure.message : 'Could not reach the prediction API.';
			notify(error, 'error');
		} finally {
			if (controller === current) loading = false;
		}
	}
</script>

<svelte:head>
	<title>Predictions · Firewatch</title>
</svelte:head>

<PageHeader
	title="Predictions"
	subtitle="Estimate the monthly hotspot probability of a 500 m pixel with the XGBoost model"
>
	{#snippet actions()}
		<StatusBadge tone="info" dot>Model region · {forecastRegion.name}</StatusBadge>
	{/snippet}
</PageHeader>

<div class="grid grid-cols-1 gap-4 xl:grid-cols-12 2xl:gap-6">
	<LocationPicker
		bind:lat
		bind:lon
		pixel={forecast ? [forecast.pixel_lat, forecast.pixel_lon] : undefined}
		bounds={forecastRegion.bounds}
		center={forecastRegion.center}
		zoom={forecastRegion.zoom}
		label="Map to choose the point to predict in {forecastRegion.name}"
		class="h-128 xl:col-span-8 xl:h-auto xl:min-h-160"
	>
		{#snippet overlay()}
			<div
				class="card absolute start-14 top-3 flex-row items-center gap-2 bg-base-100 px-3 py-2 text-caption text-base-content/70 shadow-sm"
			>
				<MousePointerClick class="size-4 shrink-0" aria-hidden="true" />
				Click the map to choose a point inside the dashed area
			</div>
		{/snippet}
	</LocationPicker>

	<div class="flex flex-col gap-4 xl:col-span-4 2xl:gap-6">
		<Panel title="Run prediction" subtitle="Choose a month and a point">
			<form class="flex flex-col gap-3" onsubmit={run}>
				<FilterField label="Month">
					<input class="input w-full text-label-lg" type="month" bind:value={month} required />
				</FilterField>
				<div class="grid grid-cols-2 gap-3">
					<FilterField label="Latitude">
						<input
							class="input w-full text-label-lg tabular-nums"
							type="number"
							step="any"
							min="-90"
							max="90"
							bind:value={lat}
							required
						/>
					</FilterField>
					<FilterField label="Longitude">
						<input
							class="input w-full text-label-lg tabular-nums"
							type="number"
							step="any"
							min="-180"
							max="180"
							bind:value={lon}
							required
						/>
					</FilterField>
				</div>

				{#if outside}
					<p class="flex items-start gap-2 text-caption text-warning-strong">
						<TriangleAlert class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
						The point is outside the model region ({south}° to {north}° lat, {west}° to {east}° lon).
						The API will reject it.
					</p>
				{/if}

				<button type="submit" class="btn btn-primary text-label-lg" disabled={!ready || loading}>
					{#if loading}
						<span class="loading loading-spinner loading-xs" aria-hidden="true"></span>
						Running model…
					{:else}
						<Play class="size-4" aria-hidden="true" />
						Run prediction
					{/if}
				</button>
			</form>
		</Panel>

		{#if error}
			<div role="alert" class="alert alert-soft alert-error text-body">
				<TriangleAlert class="size-5 shrink-0" aria-hidden="true" />
				<span>{error}</span>
			</div>
		{/if}

		{#if forecast}
			<ForecastResult {forecast} />
		{:else if !error}
			<Panel title="Prediction result">
				<p class="text-body text-base-content/70">
					Run the model to see the hotspot probability, the pixel it used and its inputs.
				</p>
			</Panel>
		{/if}
	</div>
</div>
