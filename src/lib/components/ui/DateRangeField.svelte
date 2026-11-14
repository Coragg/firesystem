<script lang="ts" module>
	/** Atajo de rango: etiqueta y fechas ISO (`AAAA-MM-DD`). */
	export type DatePreset = { label: string; from: string; to: string };
</script>

<script lang="ts">
	import CalendarRange from '@lucide/svelte/icons/calendar-range';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { onMount } from 'svelte';
	import { dismissable } from '#lib/dropdown.ts';

	type Props = {
		/** Fechas en formato ISO (`AAAA-MM-DD`). */
		from: string;
		to: string;
		/** Atajos que aparecen a la izquierda del calendario. */
		presets?: DatePreset[];
		/** Límites del calendario (ISO). */
		min?: string;
		max?: string;
	};

	let { from = $bindable(), to = $bindable(), presets = [], min, max }: Props = $props();

	let open = $state(false);
	/** Cally es un web component: se carga solo en el navegador. */
	let ready = $state(false);

	onMount(() => {
		import('cally').then(() => (ready = true));
	});

	const dayMonth = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: '2-digit',
		timeZone: 'UTC'
	});
	const full = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: '2-digit',
		year: 'numeric',
		timeZone: 'UTC'
	});

	let summary = $derived.by(() => {
		if (!from || !to) return 'Select dates';
		const start = new Date(from);
		const end = new Date(to);
		const first = start.getUTCFullYear() === end.getUTCFullYear() ? dayMonth : full;
		return `${first.format(start)} — ${full.format(end)}`;
	});

	let activePreset = $derived(presets.find((preset) => preset.from === from && preset.to === to));

	function choose(preset: DatePreset) {
		from = preset.from;
		to = preset.to;
		open = false;
	}

	/** Cally emite `change` cuando el rango está completo ("inicio/fin"). */
	function onchange(event: Event) {
		const [start, end] = (event.target as HTMLInputElement).value.split('/');
		if (!start || !end) return;
		from = start;
		to = end;
		open = false;
	}
</script>

<details class="dropdown w-full" bind:open {@attach dismissable}>
	<summary class="btn w-full btn-field justify-start text-label-lg">
		<CalendarRange class="size-4 shrink-0 text-base-content/70" aria-hidden="true" />
		<span class="sr-only">Time range:</span>
		<span class="flex-1 truncate text-start">{summary}</span>
		<ChevronDown
			class={['size-4 shrink-0 text-base-content/70 transition-transform', open && 'rotate-180']}
			aria-hidden="true"
		/>
	</summary>

	<div
		class="dropdown-content z-30 mt-2 flex flex-col rounded-box border border-base-content/10 bg-base-100 shadow-lg sm:flex-row"
	>
		{#if presets.length}
			<ul
				class="menu w-full shrink-0 gap-1 border-base-content/10 p-2 text-label sm:w-44 sm:border-e"
				aria-label="Quick ranges"
			>
				{#each presets as preset (preset.label)}
					<li>
						<button
							type="button"
							class={['justify-start', activePreset === preset && 'menu-active']}
							onclick={() => choose(preset)}
						>
							{preset.label}
						</button>
					</li>
				{/each}
			</ul>
		{/if}

		{#if ready && open}
			<calendar-range
				class="cally"
				value="{from}/{to}"
				focusedDate={from}
				months={2}
				{min}
				{max}
				locale="en-US"
				{onchange}
			>
				<!-- Flechas del calendario (mismo trazo que Lucide). `slot` va por spread: los tipos de
				     Svelte no lo admiten en SVG, pero Cally lo necesita para ubicarlas. -->
				<svg
					{...{ slot: 'previous' }}
					aria-label="Previous"
					class="size-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="m15 18-6-6 6-6"></path>
				</svg>
				<svg
					{...{ slot: 'next' }}
					aria-label="Next"
					class="size-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="m9 18 6-6-6-6"></path>
				</svg>
				<div class="flex flex-col gap-4 sm:flex-row">
					<calendar-month></calendar-month>
					<calendar-month offset={1}></calendar-month>
				</div>
			</calendar-range>
		{/if}
	</div>
</details>
