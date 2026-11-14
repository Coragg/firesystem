<script lang="ts" generics="T extends string | number">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import type { Component } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import { dismissable } from '#lib/dropdown.ts';

	type Props = {
		value: T;
		options: readonly T[];
		/** Nombre accesible del control. */
		label: string;
		/** Ícono de Lucide a la izquierda (opcional). */
		icon?: Component;
		/** Texto de cada opción, si no es el valor tal cual. */
		format?: (option: T) => string;
		class?: ClassValue;
	};

	let {
		value = $bindable(),
		options,
		label,
		icon: Icon,
		format = String,
		class: className
	}: Props = $props();

	let open = $state(false);
	const name = $props.id();
</script>

<!--
	Patrón "Theme controller using a dropdown" de daisyUI: un botón con el valor actual y una
	lista de radios con forma de botón. Sin `theme-controller`: aquí no cambia el tema.
-->
<details class={['dropdown', className]} bind:open {@attach dismissable}>
	<summary class="btn w-full btn-field justify-start text-label-lg">
		{#if Icon}
			<Icon class="size-4 shrink-0 text-base-content/70" aria-hidden="true" />
		{/if}
		<span class="sr-only">{label}:</span>
		<span class="flex-1 truncate text-start">{format(value)}</span>
		<ChevronDown
			class={['size-4 shrink-0 text-base-content/70 transition-transform', open && 'rotate-180']}
			aria-hidden="true"
		/>
	</summary>
	<ul
		class="dropdown-content z-30 mt-2 flex w-full min-w-52 flex-col gap-1 rounded-box border border-base-content/10 bg-base-100 p-2 shadow-lg"
		aria-label={label}
	>
		{#each options as option (option)}
			<li>
				<input
					type="radio"
					{name}
					class="btn w-full btn-ghost btn-sm justify-start text-label font-normal checked:bg-primary/15 checked:font-semibold checked:text-base-content"
					aria-label={format(option)}
					value={option}
					bind:group={value}
					onchange={() => (open = false)}
				/>
			</li>
		{/each}
	</ul>
</details>
