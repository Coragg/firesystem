<script lang="ts">
	import { heatScale } from '#lib/charts/heat.ts';
	import { formatDate, formatNumber, weekdayNames } from '#lib/format.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { DailyActivity } from '#lib/types.ts';

	type Props = {
		/** Días consecutivos, en orden. Cada columna es una semana (lunes a domingo). */
		days: DailyActivity[];
		/** Descripción para lectores de pantalla. */
		label: string;
		/** Etiquetas de mes: todas, o una sí y una no cuando el panel es angosto. */
		months?: 'all' | 'alternate';
	};

	let { days, label, months = 'alternate' }: Props = $props();

	/** Iniciales de lunes a domingo en el idioma activo ("L M X J V S D" en español). */
	const weekdays = weekdayNames('narrow').map((label, index) => ({ id: index, label }));

	let level = $derived(heatScale(days.map((day) => day.count)));

	/** Celdas vacías para que el primer día caiga en su fila (lunes arriba). */
	let offset = $derived(days.length ? (new Date(days[0].date).getUTCDay() + 6) % 7 : 0);
	let weeks = $derived(Math.ceil((offset + days.length) / 7));

	/** Etiqueta de mes en la columna donde empieza. */
	let monthLabels = $derived.by(() => {
		const labels = Array.from({ length: weeks }, (_, week) => ({ week, text: '' }));
		days.forEach((day, index) => {
			const date = new Date(day.date);
			const shown = months === 'all' || date.getUTCMonth() % 2 === 0;
			if (date.getUTCDate() === 1 && shown) {
				labels[Math.floor((offset + index) / 7)].text = formatDate(date, 'monthShort');
			}
		});
		return labels;
	});

	function describe(day: DailyActivity): string {
		return m.heatmap_day({
			date: formatDate(day.date, 'dayYear'),
			count: formatNumber(day.count)
		});
	}
</script>

<div class="my-auto overflow-x-auto">
	<!--
		Rangos largos: ancho mínimo y scroll horizontal. Rangos cortos: las celdas no crecen
		más de 6 unidades (24 px) para que unas pocas semanas no llenen el panel.
	-->
	<div
		class={['flex flex-col gap-2', weeks >= 20 && 'min-w-140']}
		style:max-width="calc(var(--spacing) * 7 * {weeks + 1})"
		role="img"
		aria-label={label}
	>
		<div class="grid auto-cols-fr grid-flow-col grid-rows-7 gap-1">
			{#each weekdays as weekday (weekday.id)}
				<span class="grid place-items-center text-overline text-base-content/70">
					{weekday.label}
				</span>
			{/each}
			{#each { length: offset }}
				<span></span>
			{/each}
			{#each days as day (day.date)}
				<span class={['aspect-square rounded-xs', level(day.count)]} title={describe(day)}></span>
			{/each}
		</div>
		<div class="grid auto-cols-fr grid-flow-col gap-1 text-overline text-base-content/70 uppercase">
			<span></span>
			{#each monthLabels as month (month.week)}
				<span class="whitespace-nowrap">{month.text}</span>
			{/each}
		</div>
	</div>
</div>
