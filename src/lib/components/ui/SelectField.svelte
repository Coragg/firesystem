<script lang="ts" generics="T extends string | number">
	import type { Component } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	type Props = {
		value: T;
		options: readonly T[];
		/** Nombre accesible del control. */
		label: string;
		/** Ícono de Lucide a la izquierda (opcional). */
		icon?: Component;
		class?: ClassValue;
	};

	let { value = $bindable(), options, label, icon: Icon, class: className }: Props = $props();
</script>

<!--
	Mismo formato para todos los selects: ícono en línea, flecha de daisyUI y borde del tema.
	`ms-0 ps-0` anula el margen negativo que daisyUI le da al select interno, que si no tapa el ícono.
-->
<label class={['select text-label-lg', className]}>
	{#if Icon}
		<Icon class="size-4 shrink-0 text-base-content/70" aria-hidden="true" />
	{/if}
	<select class="ms-0 ps-0 text-label-lg" aria-label={label} bind:value>
		{#each options as option (option)}
			<option value={option}>{option}</option>
		{/each}
	</select>
</label>
