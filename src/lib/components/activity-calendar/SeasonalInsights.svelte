<script lang="ts">
	import type { SeasonalSummary } from '#lib/activity.ts';
	import StatBlock from '#lib/components/ui/StatBlock.svelte';

	type Props = {
		summary: SeasonalSummary;
		/** Nombres completos de los meses, en orden. */
		monthNames: string[];
		/** Aviso al pie: etiqueta y periodo sugerido. */
		watch?: { label: string; value: string };
	};

	let { summary, monthNames, watch }: Props = $props();

	const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const countFormat = new Intl.NumberFormat('en-US');
	const percentFormat = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
	const wholePercent = new Intl.NumberFormat('en-US', { style: 'percent' });
</script>

<div class="flex flex-col divide-y divide-base-content/10">
	<div class="pb-5">
		<StatBlock
			label="Busiest month"
			value={monthNames[summary.busiestMonth.month]}
			size="lg"
			note="{countFormat.format(summary.busiestMonth.count)} detections, {percentFormat.format(
				summary.busiestMonth.share
			)} of annual total"
		/>
	</div>

	<div class="py-5">
		<StatBlock
			label="Weekday pattern"
			value="{weekdayNames[summary.weekday.day]} activity is {summary.weekday.ratio.toFixed(1)}× higher"
			note="than a typical day in peak season."
		>
			<!-- El color va en la barra; el texto queda legible. -->
			<progress
				class="progress mt-3 progress-primary"
				value={summary.peakSeasonShare}
				max="1"
				aria-label="Share of annual detections in peak season"
			></progress>
			<span class="text-caption text-base-content/70">
				Peak season holds {wholePercent.format(summary.peakSeasonShare)} of annual detections
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
