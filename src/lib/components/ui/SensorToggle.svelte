<script lang="ts">
	import { sensorList, type Sensor } from '#lib/sensors.ts';

	type Props = {
		/** Sensores activos. Admite varios a la vez. */
		selected: Sensor[];
	};

	let { selected = $bindable() }: Props = $props();
</script>

<!-- Dos chips iguales: activos se rellenan con el tono del sensor; inactivos quedan atenuados. -->
<div class="grid grid-cols-2 gap-2">
	{#each sensorList as sensor (sensor.id)}
		<label
			class={[
				'btn gap-2 bg-base-100 text-label-lg text-base-content/60',
				'has-checked:text-base-content has-focus-visible:outline-2 has-focus-visible:outline-offset-2',
				sensor.chipClass
			]}
		>
			<input type="checkbox" class="peer sr-only" value={sensor.id} bind:group={selected} />
			<span
				class={['status opacity-40 peer-checked:opacity-100', sensor.statusClass]}
				aria-hidden="true"
			></span>
			{sensor.label}
		</label>
	{/each}
</div>
