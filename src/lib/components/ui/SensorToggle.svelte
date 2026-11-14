<script lang="ts">
	import { sensorList, type Sensor } from '#lib/sensors.ts';

	type Props = {
		/** Sensores activos. Admite varios a la vez, pero siempre queda al menos uno. */
		selected: Sensor[];
	};

	let { selected = $bindable() }: Props = $props();
</script>

<!--
	Dos chips iguales: activos se rellenan con el tono del sensor; inactivos quedan atenuados.
	El último sensor activo queda bloqueado (con un tooltip que lo explica) para que el mapa y
	los gráficos nunca se queden sin datos.
-->
<div class="grid grid-cols-2 gap-2">
	{#each sensorList as sensor (sensor.id)}
		{@const locked = selected.length === 1 && selected.includes(sensor.id)}
		<div class={['grid', locked && 'tooltip tooltip-bottom']} data-tip="At least one sensor stays on">
			<label
				class={[
					'btn btn-field gap-2 text-label-lg text-base-content/60',
					'has-checked:text-base-content has-focus-visible:outline-2 has-focus-visible:outline-offset-2',
					'has-disabled:cursor-not-allowed',
					sensor.chipClass
				]}
			>
				<input
					type="checkbox"
					class="peer sr-only"
					value={sensor.id}
					bind:group={selected}
					disabled={locked}
				/>
				<span
					class={['status opacity-40 peer-checked:opacity-100', sensor.statusClass]}
					aria-hidden="true"
				></span>
				{sensor.label}
			</label>
		</div>
	{/each}
</div>
