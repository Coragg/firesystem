<script lang="ts">
	import StatusBadge, { type BadgeTone } from '#lib/components/ui/StatusBadge.svelte';
	import type { CriticalPeriod, Severity } from '#lib/types.ts';

	type Props = {
		periods: CriticalPeriod[];
		/** Aviso al pie de la lista: etiqueta y periodo sugerido. */
		watch?: { label: string; value: string };
	};

	let { periods, watch }: Props = $props();

	const severity: Record<Severity, { label: string; tone: BadgeTone; dot: string }> = {
		critical: { label: 'Critical', tone: 'error', dot: 'status-error' },
		elevated: { label: 'Elevated', tone: 'warning', dot: 'status-warning' }
	};
</script>

<div class="flex flex-col">
	<ul class="list border-y border-base-content/10">
		{#each periods as period (period.id)}
			{@const level = severity[period.severity]}
			<li class="list-row items-center px-0">
				<span class={['status', level.dot]} aria-hidden="true"></span>
				<div class="flex flex-col gap-1">
					<span class="text-title-xs">{period.range}</span>
					<span class="text-body text-base-content/70">{period.detail}</span>
				</div>
				<StatusBadge tone={level.tone}>{level.label}</StatusBadge>
			</li>
		{/each}
	</ul>

	{#if watch}
		<p class="flex flex-col gap-1 pt-4">
			<span class="text-caption text-base-content/70">{watch.label}</span>
			<span class="text-label text-secondary-strong">{watch.value}</span>
		</p>
	{/if}
</div>
