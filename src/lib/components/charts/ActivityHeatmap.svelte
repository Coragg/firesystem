<script lang="ts" module>
	/** Escala de menor a mayor actividad. Los colores son alias definidos en colors.css. */
	export const heatLevels = ['bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4', 'bg-heat-5'];
</script>

<script lang="ts">
	import type { DailyActivity } from '#lib/types.ts';

	type Props = {
		/** Días consecutivos, en orden. Cada columna es una semana (lunes a domingo). */
		days: DailyActivity[];
		/** Descripción para lectores de pantalla. */
		label: string;
	};

	let { days, label }: Props = $props();

	const weekdays = [
		{ id: 'mon', label: 'M' },
		{ id: 'tue', label: 'T' },
		{ id: 'wed', label: 'W' },
		{ id: 'thu', label: 'T' },
		{ id: 'fri', label: 'F' },
		{ id: 'sat', label: 'S' },
		{ id: 'sun', label: 'S' }
	];

	const dayFormat = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC'
	});
	const monthFormat = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
	const countFormat = new Intl.NumberFormat('en-US');

	/** Cortes entre niveles, según la distribución de los propios datos. */
	let thresholds = $derived.by(() => {
		const sorted = days.map((day) => day.count).sort((a, b) => a - b);
		return [0.3, 0.55, 0.8, 0.93].map((q) => sorted[Math.floor(q * (sorted.length - 1))] ?? 0);
	});

	/** Celdas vacías para que el primer día caiga en su fila (lunes arriba). */
	let offset = $derived(days.length ? (new Date(days[0].date).getUTCDay() + 6) % 7 : 0);
	let weeks = $derived(Math.ceil((offset + days.length) / 7));

	/** Etiqueta de mes en la columna donde empieza, un mes sí y uno no, como en el boceto. */
	let monthLabels = $derived.by(() => {
		const labels = Array.from({ length: weeks }, (_, week) => ({ week, text: '' }));
		days.forEach((day, index) => {
			const date = new Date(day.date);
			if (date.getUTCDate() === 1 && date.getUTCMonth() % 2 === 0) {
				labels[Math.floor((offset + index) / 7)].text = monthFormat.format(date);
			}
		});
		return labels;
	});

	function level(count: number): string {
		return heatLevels[thresholds.filter((threshold) => count > threshold).length];
	}

	function describe(day: DailyActivity): string {
		return `${dayFormat.format(new Date(day.date))} · ${countFormat.format(day.count)} detections`;
	}
</script>

<div class="my-auto overflow-x-auto">
	<div class="flex min-w-140 flex-col gap-2" role="img" aria-label={label}>
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
