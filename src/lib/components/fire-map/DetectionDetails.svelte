<script lang="ts">
	import ChartLine from '@lucide/svelte/icons/chart-line';
	import StatusBadge, { type BadgeTone } from '#lib/components/ui/StatusBadge.svelte';
	import { frpLevel, frpScaleMax } from '#lib/frp.ts';
	import type { Confidence, Detection } from '#lib/types.ts';

	type Props = {
		detection: Detection;
		/** Nombre del lugar (por ejemplo "Biobío, Chile"). */
		location: string;
		/** Otras detecciones dentro del radio `nearbyRadiusKm`. */
		nearbyCount: number;
		nearbyRadiusKm: number;
		/** Minutos de diferencia con la detección MODIS cercana, si existe. */
		modisOverlapMinutes?: number;
	};

	let { detection, location, nearbyCount, nearbyRadiusKm, modisOverlapMinutes }: Props = $props();

	const confidence: Record<Confidence, { label: string; tone: BadgeTone }> = {
		low: { label: 'Low', tone: 'warning' },
		nominal: { label: 'Nominal', tone: 'success' },
		high: { label: 'High', tone: 'success' }
	};

	const dateFormat = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: '2-digit',
		year: 'numeric',
		timeZone: 'UTC'
	});
	const timeFormat = new Intl.DateTimeFormat('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
		timeZone: 'UTC'
	});

	let level = $derived(frpLevel(detection.frp));
	let acquired = $derived(new Date(detection.acquired));
	// Signo menos tipográfico, como en el boceto.
	let coordinates = $derived(
		[detection.lat, detection.lng].map((value) => `${value.toFixed(2).replace('-', '−')}°`).join(', ')
	);
</script>

<section class="card h-full min-w-0 bg-base-100" aria-label="Detection details">
	<div class="card-body gap-0 p-5 2xl:p-6">
		<header class="flex items-start justify-between gap-3 border-b border-base-content/10 pb-4">
			<div class="flex flex-col gap-1">
				<span class="text-overline text-base-content/70 uppercase">Selected hotspot</span>
				<h2 class="card-title text-title-md">Detection details</h2>
			</div>
			<StatusBadge variant="solid">{detection.sensor}</StatusBadge>
		</header>

		<dl class="flex flex-col divide-y divide-base-content/10">
			<div class="flex flex-col gap-1 py-4">
				<dt class="text-overline text-base-content/70 uppercase">Location</dt>
				<dd class="text-title-xs">{location}</dd>
				<dd class="text-body text-base-content/70 tabular-nums">{coordinates}</dd>
			</div>

			<div class="flex flex-col gap-1 py-4">
				<dt class="text-overline text-base-content/70 uppercase">Acquisition time</dt>
				<dd class="text-title-xs tabular-nums">
					{dateFormat.format(acquired)} · {timeFormat.format(acquired)} UTC
				</dd>
			</div>

			<div class="flex flex-col gap-2 py-4">
				<dt class="text-overline text-base-content/70 uppercase">Fire radiative power</dt>
				<dd class="text-display tabular-nums">{detection.frp.toFixed(1)} MW</dd>
				<dd>
					<!-- El color del nivel va en la barra y el punto; el texto queda legible. -->
					<progress
						class={['progress', level.textClass]}
						value={Math.min(detection.frp, frpScaleMax)}
						max={frpScaleMax}
						aria-label="Fire radiative power"
					></progress>
				</dd>
				<dd class="flex items-center gap-2 text-overline text-base-content/70 uppercase">
					<span class={['size-2 rounded-full', level.dotClass]} aria-hidden="true"></span>
					{level.label}
				</dd>
			</div>

			<div class="flex flex-col gap-4 py-4">
				<div class="flex flex-col gap-1">
					<dt class="text-overline text-base-content/70 uppercase">Sensor</dt>
					<dd class="text-title-xs">{detection.satellite}</dd>
				</div>
				<div class="flex flex-col items-start gap-2">
					<dt class="text-overline text-base-content/70 uppercase">Confidence</dt>
					<dd>
						<StatusBadge tone={confidence[detection.confidence].tone}>
							{confidence[detection.confidence].label}
						</StatusBadge>
					</dd>
				</div>
			</div>

			<div class="flex flex-col gap-2 py-4">
				<dt class="text-overline text-base-content/70 uppercase">Nearby activity</dt>
				<dd class="text-body-lg">
					{nearbyCount}
					{nearbyCount === 1 ? 'detection' : 'detections'} within {nearbyRadiusKm} km
				</dd>
				<dd class="flex items-center justify-between gap-3 text-body">
					<span class="text-base-content/70">MODIS overlap</span>
					{#if modisOverlapMinutes === undefined}
						<span class="text-base-content/70">No</span>
					{:else}
						<span class="font-semibold text-secondary-strong">
							Yes · {modisOverlapMinutes} min apart
						</span>
					{/if}
				</dd>
			</div>
		</dl>

		<a href="/activity-calendar" class="btn mt-2 w-full text-label-lg">
			<ChartLine class="size-4" aria-hidden="true" />
			View local time series
		</a>
	</div>
</section>
