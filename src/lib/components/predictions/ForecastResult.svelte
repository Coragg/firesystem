<script lang="ts">
	import Panel from '#lib/components/ui/Panel.svelte';
	import StatBlock from '#lib/components/ui/StatBlock.svelte';
	import StatusBadge from '#lib/components/ui/StatusBadge.svelte';
	import { formatDate, formatNumber } from '#lib/format.ts';
	import type { HotspotForecast } from '#lib/hotspot-forecast.ts';
	import { m } from '#lib/paraglide/messages.js';

	type Props = { forecast: HotspotForecast };

	let { forecast }: Props = $props();

	const percentStyle = { style: 'percent', maximumFractionDigits: 1 } as const;

	function number(value: number): string {
		return formatNumber(value, { maximumFractionDigits: 3 });
	}

	/** Las probabilidades suelen ser pequeñas: se muestran con un decimal y un piso visible. */
	function percent(value: number): string {
		if (value > 0 && value < 0.001) return `<${formatNumber(0.001, percentStyle)}`;
		return formatNumber(value, percentStyle);
	}

	function month(value: string): string {
		return formatDate(`${value}-01T00:00:00Z`, 'monthYear');
	}

	/** Cuatro decimales; se separan con " · " porque en varios idiomas la coma es decimal. */
	function coordinates(lat: number, lon: number): string {
		const digits = { minimumFractionDigits: 4, maximumFractionDigits: 4 };
		return [lat, lon].map((value) => `${formatNumber(value, digits)}°`).join(' · ');
	}

	/** Variables resumidas que se muestran primero; el resto queda en la lista completa. */
	const summary: { key: string; label: () => string; unit?: string }[] = [
		{ key: 'lai_mean_24_35', label: m.feature_lai_mean },
		{ key: 'lai_min_24_35', label: m.feature_lai_min },
		{ key: 'lai_max_24_35', label: m.feature_lai_max },
		{ key: 'lai_valid_months_24_35', label: m.feature_lai_months },
		{ key: 'elevation_m', label: m.feature_elevation, unit: 'm' },
		{ key: 'slope_deg', label: m.feature_slope, unit: '°' },
		{ key: 'land_cover', label: m.feature_land_cover }
	];

	function featureValue(value: number | null | undefined, unit = ''): string {
		if (value === null || value === undefined) return '—';
		return `${number(value)}${unit && unit !== '°' ? ` ${unit}` : unit}`;
	}

	let shown = $derived(summary.filter((item) => item.key in forecast.features));
</script>

<Panel title={m.predict_result_title()} subtitle={month(forecast.month)}>
	{#snippet action()}
		<StatusBadge tone="info">{forecast.model.region}</StatusBadge>
	{/snippet}

	<div class="flex flex-col gap-2">
		<StatBlock
			label={m.predict_probability()}
			value={percent(forecast.hotspot_probability)}
			size="lg"
			note={m.predict_probability_note()}
		/>
		<progress
			class="progress progress-secondary"
			value={forecast.hotspot_probability}
			max="1"
			aria-label={m.predict_probability()}
		></progress>
	</div>

	<dl class="grid grid-cols-2 gap-4 border-t border-base-content/10 pt-4">
		<div class="flex flex-col gap-1">
			<dt class="text-overline text-base-content/70 uppercase">{m.predict_score()}</dt>
			<dd class="text-title-xs tabular-nums">{number(forecast.hotspot_score)}</dd>
			<dd class="text-caption text-base-content/70">{m.predict_score_note()}</dd>
		</div>
		<div class="flex flex-col gap-1">
			<dt class="text-overline text-base-content/70 uppercase">{m.predict_pixel_center()}</dt>
			<dd class="text-title-xs tabular-nums">
				{coordinates(forecast.pixel_lat, forecast.pixel_lon)}
			</dd>
		</div>
	</dl>

	<div class="flex flex-col gap-2 border-t border-base-content/10 pt-4">
		<h3 class="text-overline text-base-content/70 uppercase">{m.predict_inputs()}</h3>
		<dl class="flex flex-col divide-y divide-base-content/10 text-body">
			{#each shown as item (item.key)}
				<div class="flex items-center justify-between gap-3 py-2">
					<dt class="text-base-content/70">{item.label()}</dt>
					<dd class="tabular-nums">{featureValue(forecast.features[item.key], item.unit)}</dd>
				</div>
			{/each}
		</dl>

		<details class="collapse-arrow collapse rounded-box border border-base-content/10">
			<summary class="collapse-title text-label">
				{m.predict_all_features({ count: formatNumber(Object.keys(forecast.features).length) })}
			</summary>
			<div class="collapse-content">
				<dl class="flex flex-col divide-y divide-base-content/10 text-caption">
					{#each Object.entries(forecast.features) as [name, value] (name)}
						<div class="flex items-center justify-between gap-3 py-1.5">
							<dt class="font-mono text-base-content/70">{name}</dt>
							<dd class="tabular-nums">{featureValue(value)}</dd>
						</div>
					{/each}
				</dl>
			</div>
		</details>
	</div>

	{#snippet footer()}
		<span>
			{m.predict_trained_on({ range: forecast.model.trained_months.map(month).join(' – ') })}
		</span>
	{/snippet}
</Panel>
