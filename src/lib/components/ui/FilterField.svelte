<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	type Props = {
		/** Etiqueta sobre el control. Sin etiqueta, el control se alinea con los demás. */
		label?: string;
		class?: ClassValue;
		children: Snippet;
	};

	let { label, class: className, children }: Props = $props();
</script>

<fieldset class={['fieldset p-0', className]}>
	{#if label}
		<legend class="fieldset-legend text-overline text-base-content/70 uppercase">{label}</legend>
	{/if}
	{@render children()}
</fieldset>
