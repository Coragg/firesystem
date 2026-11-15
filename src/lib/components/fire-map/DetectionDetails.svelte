<script lang="ts">
	import ChartLine from '@lucide/svelte/icons/chart-line';
	import StatusBadge, { type BadgeTone } from '#lib/components/ui/StatusBadge.svelte';
	import { confidenceLabel } from '#lib/data/common.ts';
	import { formatDate, formatDecimal, formatNumber } from '#lib/format.ts';
	import { frpLevel, frpScaleMax } from '#lib/frp.ts';
	import { m } from '#lib/paraglide/messages.js';
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

	const confidenceTone: Record<Confidence, BadgeTone> = {
		low: 'warning',
		nominal: 'success',
		high: 'success'
	};

	let level = $derived(frpLevel(detection.frp));
	let acquired = $derived(new Date(detection.acquired));
	// Coordenadas con el separador decimal del idioma y el signo menos tipográfico del boceto.
	let coordinates = $derived(
		[detection.lat, detection.lng]
			.map((value) => `${formatDecimal(value, 2).replace('-', '−')}°`)
			.join(', ')
	);
</script>

<section class="card h-full min-w-0 bg-base-100" aria-label={m.detail_title()}>
	<div class="card-body gap-0 p-5 2xl:p-6">
		<header class="flex items-start justify-between gap-3 border-b border-base-content/10 pb-4">
			<div class="flex flex-col gap-1">
				<span class="text-overline text-base-content/70 uppercase">{m.detail_selected()}</span>
				<h2 class="card-title text-title-md">{m.detail_title()}</h2>
			</div>
			<StatusBadge variant="solid">{detection.sensor}</StatusBadge>
		</header>

		<dl class="flex flex-col divide-y divide-base-content/10">
			<div class="flex flex-col gap-1 py-4">
				<dt class="text-overline text-base-content/70 uppercase">{m.detail_location()}</dt>
				<dd class="text-title-xs">{location}</dd>
				<dd class="text-body text-base-content/70 tabular-nums">{coordinates}</dd>
			</div>

			<div class="flex flex-col gap-1 py-4">
				<dt class="text-overline text-base-content/70 uppercase">{m.detail_acquired()}</dt>
				<dd class="text-title-xs tabular-nums">
					{formatDate(acquired, 'dayYear')} · {formatDate(acquired, 'time')} UTC
				</dd>
			</div>

			<div class="flex flex-col gap-2 py-4">
				<dt class="text-overline text-base-content/70 uppercase">{m.frp_title()}</dt>
				<dd class="text-display tabular-nums">{formatDecimal(detection.frp)} MW</dd>
				<dd>
					<!-- El color del nivel va en la barra y el punto; el texto queda legible. -->
					<progress
						class={['progress', level.textClass]}
						value={Math.min(detection.frp, frpScaleMax)}
						max={frpScaleMax}
						aria-label={m.frp_title()}
					></progress>
				</dd>
				<dd class="flex items-center gap-2 text-overline text-base-content/70 uppercase">
					<span class={['size-2 rounded-full', level.dotClass]} aria-hidden="true"></span>
					{level.label}
				</dd>
			</div>

			<div class="flex flex-col gap-4 py-4">
				<div class="flex flex-col gap-1">
					<dt class="text-overline text-base-content/70 uppercase">{m.detail_sensor()}</dt>
					<dd class="text-title-xs">{detection.satellite}</dd>
				</div>
				<div class="flex flex-col items-start gap-2">
					<dt class="text-overline text-base-content/70 uppercase">{m.filter_confidence()}</dt>
					<dd>
						<StatusBadge tone={confidenceTone[detection.confidence]}>
							{confidenceLabel(detection.confidence)}
						</StatusBadge>
					</dd>
				</div>
			</div>

			<div class="flex flex-col gap-2 py-4">
				<dt class="text-overline text-base-content/70 uppercase">{m.detail_nearby()}</dt>
				<dd class="text-body-lg">
					{nearbyCount === 1
						? m.detail_nearby_one({ km: nearbyRadiusKm })
						: m.detail_nearby_other({ count: formatNumber(nearbyCount), km: nearbyRadiusKm })}
				</dd>
				<dd class="flex items-center justify-between gap-3 text-body">
					<span class="text-base-content/70">{m.detail_modis_overlap()}</span>
					{#if modisOverlapMinutes === undefined}
						<span class="text-base-content/70">{m.common_no()}</span>
					{:else}
						<span class="font-semibold text-secondary-strong">
							{m.detail_overlap_yes({ minutes: modisOverlapMinutes })}
						</span>
					{/if}
				</dd>
			</div>
		</dl>

		<a href="/activity-calendar" class="btn mt-2 w-full text-label-lg">
			<ChartLine class="size-4" aria-hidden="true" />
			{m.detail_time_series()}
		</a>
	</div>
</section>
