<script lang="ts">
	import StatusBadge, { type BadgeTone } from '#lib/components/ui/StatusBadge.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { CriticalPeriod, Severity } from '#lib/types.ts';

	type Props = {
		periods: CriticalPeriod[];
		/** Aviso al pie de la lista: etiqueta y periodo sugerido. */
		watch?: { label: string; value: string };
		/** Si se pasa, cada periodo es un botón (por ejemplo, para filtrar por esa semana). */
		onselect?: (period: CriticalPeriod) => void;
		/** Periodo marcado como activo. */
		selectedId?: string;
	};

	let { periods, watch, onselect, selectedId }: Props = $props();

	const severity: Record<Severity, { label: string; tone: BadgeTone; dot: string }> = {
		critical: { label: m.severity_critical(), tone: 'error', dot: 'status-error' },
		elevated: { label: m.severity_elevated(), tone: 'warning', dot: 'status-warning' }
	};
</script>

<div class="flex flex-col">
	<ul class="list border-y border-base-content/10">
		{#each periods as period (period.id)}
			{@const level = severity[period.severity]}
			{@const active = period.id === selectedId}
			<!--
				Fila completa clicable: el botón es el título y su ::after cubre toda la fila
				(así el lector de pantalla anuncia un solo botón con el nombre del periodo).
			-->
			<li
				class={[
					'list-row relative items-center px-0',
					onselect && 'rounded-field hover:bg-base-content/5',
					active && 'bg-primary/10'
				]}
			>
				<span class={['status', level.dot]} aria-hidden="true"></span>
				<div class="flex flex-col gap-1">
					{#if onselect}
						<button
							type="button"
							class="text-start text-title-xs after:absolute after:inset-0 after:rounded-field focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2"
							aria-pressed={active}
							title={m.critical_filter_hint()}
							onclick={() => onselect(period)}
						>
							{period.range}
						</button>
					{:else}
						<span class="text-title-xs">{period.range}</span>
					{/if}
					<span class="text-body text-base-content/70">{period.detail}</span>
				</div>
				<StatusBadge tone={level.tone}>{level.label}</StatusBadge>
			</li>
		{:else}
			<li class="list-row px-0 text-body text-base-content/70">
				{m.critical_empty()}
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
