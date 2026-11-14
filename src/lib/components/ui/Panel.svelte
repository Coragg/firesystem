<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	type Props = {
		title: string;
		subtitle?: string;
		/** Control o etiqueta a la derecha del título. */
		action?: Snippet;
		/** Pie del panel (leyendas, totales). */
		footer?: Snippet;
		/** Clases de posición en la grilla de la página (por ejemplo `xl:col-span-7`). */
		class?: ClassValue;
		children: Snippet;
	};

	let { title, subtitle, action, footer, class: className, children }: Props = $props();
</script>

<section class={['card min-w-0 bg-base-100', className]}>
	<div class="card-body gap-4 p-5 2xl:gap-5 2xl:p-6">
		<header class="flex flex-wrap items-start justify-between gap-3">
			<div class="flex flex-col gap-1">
				<h2 class="card-title text-title-md">{title}</h2>
				{#if subtitle}
					<p class="text-body text-base-content/70">{subtitle}</p>
				{/if}
			</div>
			{@render action?.()}
		</header>

		{@render children()}

		{#if footer}
			<footer class="flex flex-wrap items-center gap-x-6 gap-y-2 text-caption text-base-content/70">
				{@render footer()}
			</footer>
		{/if}
	</div>
</section>
