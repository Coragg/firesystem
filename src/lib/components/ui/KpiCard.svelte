<script lang="ts">
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import type { Kpi, KpiTone } from '#lib/types.ts';

	let { label, value, highlight, tone = 'neutral', trend, note }: Kpi = $props();

	/** El color va en el ícono o el punto; el texto queda en base-content para que se lea. */
	const iconClass: Record<KpiTone, string> = {
		primary: 'text-primary',
		secondary: 'text-secondary',
		warning: 'text-warning',
		error: 'text-error',
		success: 'text-success',
		neutral: 'text-base-content/70'
	};

	const dotClass: Record<KpiTone, string> = {
		primary: 'status-primary',
		secondary: 'status-secondary',
		warning: 'status-warning',
		error: 'status-error',
		success: 'status-success',
		neutral: 'status-neutral'
	};
</script>

<div class="stats bg-base-100">
	<div class="stat gap-2 p-5 2xl:p-6">
		<div class="stat-title text-overline text-base-content/70 uppercase">{label}</div>
		<div class="stat-value text-display tabular-nums">{value}</div>
		{#if highlight || note}
			<!-- Dato destacado junto a su contexto: "↑ 18.6% vs. previous year". -->
			<div class="stat-desc flex flex-wrap items-center gap-x-1.5 text-body text-base-content/70">
				{#if highlight}
					<span class="flex items-center gap-1 font-semibold text-base-content">
						{#if trend === 'up'}
							<ArrowUp class={['size-4', iconClass[tone]]} aria-hidden="true" />
						{:else if trend === 'down'}
							<ArrowDown class={['size-4', iconClass[tone]]} aria-hidden="true" />
						{:else}
							<span class={['status me-1', dotClass[tone]]} aria-hidden="true"></span>
						{/if}
						{highlight}
					</span>
				{/if}
				{#if note}
					<span>{note}</span>
				{/if}
			</div>
		{/if}
	</div>
</div>
