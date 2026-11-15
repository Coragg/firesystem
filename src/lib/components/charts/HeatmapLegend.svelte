<script lang="ts">
	import { heatLevels } from '#lib/charts/heat.ts';
	import { m } from '#lib/paraglide/messages.js';
</script>

<div class="flex items-center gap-2 text-overline text-base-content/70 uppercase">
	<span>{m.legend_low()}</span>
	<span class="flex gap-1" aria-hidden="true">
		{#each heatLevels as level (level)}
			<span class={['size-3 rounded-xs', level]}></span>
		{/each}
	</span>
	<span>{m.legend_high()}</span>
</div>
