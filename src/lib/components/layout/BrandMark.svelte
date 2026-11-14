<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import logo from '#lib/assets/firewatch-logo.svg';

	type Props = {
		/** Tamaño del cuadro (por ejemplo `size-8`). */
		class?: ClassValue;
	};

	let { class: className }: Props = $props();
</script>

<!--
	Logo de Firewatch: llama pixel art sobre un cuadrado oscuro con bordes redondeados.
	El fondo oscuro es fijo (no cambia con el tema) para que la llama siempre contraste.
	Es decorativo: el nombre de la marca va siempre en texto a su lado.
-->
<span
	class={['grid shrink-0 place-items-center rounded-field bg-primary-900 p-1', className]}
	aria-hidden="true"
>
	<img src={logo} alt="" class="size-full [image-rendering:pixelated]" />
</span>
