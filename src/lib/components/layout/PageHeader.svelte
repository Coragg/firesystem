<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		subtitle?: string;
		/** Controles alineados a la derecha (estado, selectores, botones). */
		actions?: Snippet;
	};

	let { title, subtitle, actions }: Props = $props();
</script>

<header
	class="flex flex-wrap items-center justify-between gap-4 border-b border-base-content/10 pb-5"
>
	<div class="flex flex-col gap-1">
		<h1 class="text-display">{title}</h1>
		{#if subtitle}
			<p class="text-body-lg text-base-content/70">{subtitle}</p>
		{/if}
	</div>
	{#if actions}
		<div class="flex flex-wrap items-center gap-3">
			{@render actions()}
		</div>
	{/if}
</header>
