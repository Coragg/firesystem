<script lang="ts" generics="T extends string">
	type Option = {
		value: T;
		label: string;
		/** Opción no disponible por ahora (con `hint` explicando por qué). */
		disabled?: boolean;
		hint?: string;
	};

	type Props = {
		value: T;
		options: Option[];
		/** Nombre accesible del grupo. */
		label: string;
	};

	let { value = $bindable(), options, label }: Props = $props();

	const name = $props.id();
</script>

<!--
	Tabs de daisyUI (`tabs-box`) hechos con radios: se recorren con las flechas del teclado
	y el lector de pantalla los anuncia como un grupo de opciones.
-->
<div class="tabs-box tabs tabs-sm flex-nowrap" role="radiogroup" aria-label={label}>
	{#each options as option (option.value)}
		<label
			class={[
				'tab gap-1 text-label whitespace-nowrap',
				option.value === value && 'tab-active',
				option.disabled && 'tab-disabled tooltip tooltip-bottom'
			]}
			data-tip={option.disabled ? option.hint : undefined}
		>
			<input
				type="radio"
				class="sr-only"
				{name}
				value={option.value}
				disabled={option.disabled}
				bind:group={value}
			/>
			{option.label}
		</label>
	{/each}
</div>
