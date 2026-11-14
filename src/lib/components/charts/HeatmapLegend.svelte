<script lang="ts">
	import { heatLevels } from './ActivityHeatmap.svelte';
</script>

<div class="flex items-center gap-2 text-overline text-base-content/70 uppercase">
	<span>Low</span>
	<span class="flex gap-1" aria-hidden="true">
		{#each heatLevels as level (level)}
			<span class={['size-3 rounded-xs', level]}></span>
		{/each}
	</span>
	<span>High</span>
</div>
