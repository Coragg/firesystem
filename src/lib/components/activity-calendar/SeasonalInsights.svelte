<script lang="ts">
	import type { SeasonalSummary } from '#lib/activity.ts';
	import StatBlock from '#lib/components/ui/StatBlock.svelte';
	import { formatDecimal, formatNumber, formatPercent, weekdayName } from '#lib/format.ts';
	import { m } from '#lib/paraglide/messages.js';

	type Props = {
		summary: SeasonalSummary;
		/** Nombres completos de los meses, en orden. */
		monthNames: string[];
		/** Aviso al pie: etiqueta y periodo sugerido. */
		watch?: { label: string; value: string };
	};

	let { summary, monthNames, watch }: Props = $props();

</script>

<div class="flex flex-col divide-y divide-base-content/10">
	<div class="pb-5">
		<StatBlock
			label={m.seasonal_busiest_month()}
			value={monthNames[summary.busiestMonth.month]}
			size="lg"
			note={m.seasonal_busiest_note({
				count: formatNumber(summary.busiestMonth.count),
				share: formatPercent(summary.busiestMonth.share, 1)
			})}
		/>
	</div>

	<div class="py-5">
		<StatBlock
			label={m.seasonal_weekday()}
			value={m.seasonal_weekday_value({
				day: weekdayName(summary.weekday.day),
				ratio: formatDecimal(summary.weekday.ratio)
			})}
			note={m.seasonal_weekday_note()}
		>
			<!-- El color va en la barra; el texto queda legible. -->
			<progress
				class="progress mt-3 progress-primary"
				value={summary.peakSeasonShare}
				max="1"
				aria-label={m.seasonal_peak_share_label()}
			></progress>
			<span class="text-caption text-base-content/70">
				{m.seasonal_peak_share({ share: formatPercent(summary.peakSeasonShare) })}
			</span>
		</StatBlock>
	</div>

	{#if watch}
		<div class="pt-5">
			<div class="flex flex-col gap-1 rounded-box bg-base-200 p-4">
				<span class="text-overline text-base-content/70 uppercase">{watch.label}</span>
				<span class="text-label-lg text-secondary-strong">{watch.value}</span>
			</div>
		</div>
	{/if}
</div>
