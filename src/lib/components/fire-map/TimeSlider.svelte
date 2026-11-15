<script lang="ts">
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import { onDestroy } from 'svelte';
	import { heatScale } from '#lib/charts/heat.ts';
	import { formatDate, formatNumber } from '#lib/format.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { DailyActivity } from '#lib/types.ts';

	type Props = {
		/** Días consecutivos, en orden. */
		days: DailyActivity[];
		/** Índice del día seleccionado. */
		value: number;
		title: string;
		subtitle: string;
	};

	let { days, value = $bindable(), title, subtitle }: Props = $props();

	/** Milisegundos por día durante la reproducción. */
	const stepDuration = 600;

	let playing = $state(false);


	let max = $derived(Math.max(1, ...days.map((day) => day.count)));
	let level = $derived(heatScale(days.map((day) => day.count)));
	let last = $derived(days.length - 1);

	function describe(day: DailyActivity): string {
		return m.timeslider_day({ date: formatDate(day.date, 'day'), count: formatNumber(day.count) });
	}

	/** Etiqueta de fecha cada 7 días, como en el boceto. */
	function tick(index: number): string {
		return index % 7 === 0 ? formatDate(days[index].date, 'day') : '';
	}

	let timer: ReturnType<typeof setInterval> | undefined;

	function stop() {
		clearInterval(timer);
		playing = false;
	}

	/** Reproducción: avanza un día por paso y se detiene al llegar al final. */
	function toggle() {
		if (playing) return stop();
		if (value >= last) value = 0;
		playing = true;
		timer = setInterval(() => {
			if (value >= last) stop();
			else value += 1;
		}, stepDuration);
	}

	// Al desmontar el componente no debe quedar el temporizador corriendo.
	onDestroy(() => clearInterval(timer));
</script>

<section class="card min-w-0 bg-base-100" aria-label={m.timeslider_title()}>
	<div class="card-body flex-col gap-6 p-5 lg:flex-row lg:items-center 2xl:p-6">
		<header class="flex shrink-0 flex-col gap-1 lg:w-56">
			<span class="text-overline text-base-content/70 uppercase">{m.timeslider_title()}</span>
			<h2 class="card-title text-title-md">{title}</h2>
			<p class="text-body text-base-content/70">{subtitle}</p>
		</header>

		<div class="flex min-w-0 flex-1 flex-col gap-2">
			<!-- Una barra por día: el alto es el conteo y el color su nivel de actividad. -->
			<div class="flex h-20 items-end gap-1">
				{#each days as day, index (day.date)}
					<button
						type="button"
						class={[
							'min-w-0 flex-1 rounded-xs',
							index === value ? 'bg-error' : level(day.count)
						]}
						style:height="{Math.max(8, (day.count / max) * 100)}%"
						aria-label={describe(day)}
						aria-pressed={index === value}
						title={describe(day)}
						onclick={() => (value = index)}
					></button>
				{/each}
			</div>

			<input
				type="range"
				class="range w-full range-xs"
				min="0"
				max={last}
				step="1"
				bind:value
				aria-label={m.timeslider_selected_day()}
				aria-valuetext={days[value] ? describe(days[value]) : undefined}
			/>

			<div class="flex gap-1 text-overline text-base-content/70 uppercase" aria-hidden="true">
				{#each days as day, index (day.date)}
					<span class="min-w-0 flex-1 whitespace-nowrap">{tick(index)}</span>
				{/each}
			</div>
		</div>

		<button
			type="button"
			class="btn btn-square shrink-0 btn-action"
			aria-label={playing ? m.timeslider_pause() : m.timeslider_play()}
			onclick={toggle}
		>
			{#if playing}
				<Pause class="size-4" aria-hidden="true" />
			{:else}
				<Play class="size-4" aria-hidden="true" />
			{/if}
		</button>
	</div>
</section>
