<script lang="ts">
	import { frpLevels } from '#lib/frp.ts';
	import { m } from '#lib/paraglide/messages.js';
</script>

<div class="flex flex-col gap-2">
	<span class="text-overline text-base-content/70 uppercase">{m.frp_legend_title()}</span>
	<div class="flex items-center gap-3 text-caption text-base-content/70">
		<span>{m.legend_low()}</span>
		<span class="flex items-center gap-2" aria-hidden="true">
			{#each frpLevels as level (level.min)}
				<span class={['size-3 rounded-full', level.dotClass]}></span>
			{/each}
		</span>
		<span>{m.legend_high()}</span>
	</div>
</div>
