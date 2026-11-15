<script lang="ts">
	import Panel from '#lib/components/ui/Panel.svelte';
	import StatBlock from '#lib/components/ui/StatBlock.svelte';
	import StatusBadge from '#lib/components/ui/StatusBadge.svelte';
	import type { HotspotForecast } from '#lib/hotspot-forecast.ts';

	type Props = { forecast: HotspotForecast };

	let { forecast }: Props = $props();

	const monthFormat = new Intl.DateTimeFormat('en-US', {
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	});
	const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 });

	/** Las probabilidades suelen ser pequeñas: se muestran con un decimal y un piso visible. */
	function percent(value: number): string {
		if (value > 0 && value < 0.001) return '<0.1%';
		return new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 }).format(
			value
		);
	}

	function month(value: string): string {
		return monthFormat.format(new Date(`${value}-01T00:00:00Z`));
	}

	function coordinates(lat: number, lon: number): string {
		return [lat, lon].map((value) => `${value.toFixed(4).replace('-', '−')}°`).join(', ');
	}

	/** Variables resumidas que se muestran primero; el resto queda en la lista completa. */
	const summary: { key: string; label: string; unit?: string }[] = [
		{ key: 'lai_mean_24_35', label: 'Leaf area index · mean' },
		{ key: 'lai_min_24_35', label: 'Leaf area index · min' },
		{ key: 'lai_max_24_35', label: 'Leaf area index · max' },
		{ key: 'lai_valid_months_24_35', label: 'Months with LAI data' },
		{ key: 'elevation_m', label: 'Elevation', unit: 'm' },
		{ key: 'slope_deg', label: 'Slope', unit: '°' },
		{ key: 'land_cover', label: 'Land cover class' }
	];

	function featureValue(value: number | null | undefined, unit = ''): string {
		if (value === null || value === undefined) return '—';
		return `${numberFormat.format(value)}${unit && unit !== '°' ? ` ${unit}` : unit}`;
	}

	let shown = $derived(summary.filter((item) => item.key in forecast.features));
</script>

<Panel title="Prediction result" subtitle={month(forecast.month)}>
	{#snippet action()}
		<StatusBadge tone="info">{forecast.model.region}</StatusBadge>
	{/snippet}

	<div class="flex flex-col gap-2">
		<StatBlock
			label="Hotspot probability"
			value={percent(forecast.hotspot_probability)}
			size="lg"
			note="Chance of at least one FIRMS vegetation-fire hotspot in the pixel this month"
		/>
		<progress
			class="progress progress-secondary"
			value={forecast.hotspot_probability}
			max="1"
			aria-label="Hotspot probability"
		></progress>
	</div>

	<dl class="grid grid-cols-2 gap-4 border-t border-base-content/10 pt-4">
		<div class="flex flex-col gap-1">
			<dt class="text-overline text-base-content/70 uppercase">Model score</dt>
			<dd class="text-title-xs tabular-nums">{numberFormat.format(forecast.hotspot_score)}</dd>
			<dd class="text-caption text-base-content/70">For ranking only</dd>
		</div>
		<div class="flex flex-col gap-1">
			<dt class="text-overline text-base-content/70 uppercase">Pixel centre</dt>
			<dd class="text-title-xs tabular-nums">
				{coordinates(forecast.pixel_lat, forecast.pixel_lon)}
			</dd>
		</div>
	</dl>

	<div class="flex flex-col gap-2 border-t border-base-content/10 pt-4">
		<h3 class="text-overline text-base-content/70 uppercase">Model inputs</h3>
		<dl class="flex flex-col divide-y divide-base-content/10 text-body">
			{#each shown as item (item.key)}
				<div class="flex items-center justify-between gap-3 py-2">
					<dt class="text-base-content/70">{item.label}</dt>
					<dd class="tabular-nums">{featureValue(forecast.features[item.key], item.unit)}</dd>
				</div>
			{/each}
		</dl>

		<details class="collapse-arrow collapse rounded-box border border-base-content/10">
			<summary class="collapse-title text-label">
				All {Object.keys(forecast.features).length} features
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
			XGBoost · trained on {forecast.model.trained_months.map(month).join(' – ')}
		</span>
	{/snippet}
</Panel>
