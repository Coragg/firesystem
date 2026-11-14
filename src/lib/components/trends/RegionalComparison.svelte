<script lang="ts">
	import Meter from '#lib/components/ui/Meter.svelte';

	type Props = {
		/** Detecciones relativas por región (0 a 1). */
		regions: { region: string; share: number }[];
	};

	let { regions }: Props = $props();

	let top = $derived(regions.reduce((best, item) => (item.share > best.share ? item : best), regions[0]));
</script>

<div class="flex flex-col gap-6 lg:flex-row lg:items-stretch">
	<!-- La región con más detecciones va en el color principal; el resto, en el secundario. -->
	<ul class="flex flex-1 flex-col justify-center gap-4">
		{#each regions as item (item.region)}
			<li>
				<Meter
					label={item.region}
					value={item.share}
					tone={item === top ? 'primary' : 'secondary'}
					layout="inline"
				/>
			</li>
		{/each}
	</ul>

	{#if top}
		<aside class="flex flex-col justify-center gap-2 rounded-box bg-base-200 p-5 lg:w-80">
			<span class="text-overline text-base-content/70 uppercase">Key takeaway</span>
			<p class="text-body-lg">
				{top.region} accounts for the largest share of harmonized detections in this period.
			</p>
		</aside>
	{/if}
</div>
