<script lang="ts">
	import { sensorList, type Sensor } from '#lib/sensors.ts';

	type Props = {
		/** Nombre largo del sensor (con satélites) en vez del corto. */
		long?: boolean;
		/** Sensores a mostrar. Por defecto, todos. */
		only?: Sensor[];
	};

	let { long = false, only }: Props = $props();

	let shown = $derived(only ? sensorList.filter((sensor) => only.includes(sensor.id)) : sensorList);
</script>

<ul class="flex flex-wrap items-center gap-x-6 gap-y-2">
	{#each shown as sensor (sensor.id)}
		<li class="flex items-center gap-2">
			<span class={['status', sensor.statusClass]} aria-hidden="true"></span>
			{long ? sensor.longLabel : sensor.label}
		</li>
	{/each}
</ul>
