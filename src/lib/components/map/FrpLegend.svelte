<script lang="ts">
	import { frpLevels } from '#lib/frp.ts';
</script>

<div class="flex flex-col gap-2">
	<span class="text-overline text-base-content/70 uppercase">Fire radiative power (MW)</span>
	<div class="flex items-center gap-3 text-caption text-base-content/70">
		<span>Low</span>
		<span class="flex items-center gap-2" aria-hidden="true">
			{#each frpLevels as level (level.min)}
				<span class={['size-3 rounded-full', level.dotClass]}></span>
			{/each}
		</span>
		<span>High</span>
	</div>
</div>
