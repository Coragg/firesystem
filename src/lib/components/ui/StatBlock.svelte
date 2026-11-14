<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		label: string;
		value: string;
		/** `lg` para el dato principal de un panel; `md` para datos de apoyo. */
		size?: 'md' | 'lg';
		note?: string;
		/** Contenido extra bajo la nota (barra, badge). */
		children?: Snippet;
	};

	let { label, value, size = 'md', note, children }: Props = $props();
</script>

<div class="flex flex-col gap-1">
	<span class="text-overline text-base-content/70 uppercase">{label}</span>
	<span class={[size === 'lg' ? 'text-title-lg' : 'text-title-sm', 'tabular-nums']}>{value}</span>
	{#if note}
		<span class="text-body text-base-content/70">{note}</span>
	{/if}
	{@render children?.()}
</div>
