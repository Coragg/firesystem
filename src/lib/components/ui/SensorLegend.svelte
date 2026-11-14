<script lang="ts">
	import { sensorList } from '#lib/sensors.ts';

	type Props = {
		/** Nombre largo del sensor (con satélites) en vez del corto. */
		long?: boolean;
	};

	let { long = false }: Props = $props();
</script>

<ul class="flex flex-wrap items-center gap-x-6 gap-y-2">
	{#each sensorList as sensor (sensor.id)}
		<li class="flex items-center gap-2">
			<span class={['status', sensor.statusClass]} aria-hidden="true"></span>
			{long ? sensor.longLabel : sensor.label}
		</li>
	{/each}
</ul>
