<script lang="ts">
	import Layers from '@lucide/svelte/icons/layers';
	import Satellite from '@lucide/svelte/icons/satellite';
	import StatBlock from '#lib/components/ui/StatBlock.svelte';
	import StatusBadge from '#lib/components/ui/StatusBadge.svelte';
	import { sensors } from '#lib/sensors.ts';
	import type { DataSource } from '#lib/types.ts';

	type Props = { source: DataSource };

	let { source }: Props = $props();

	const countFormat = new Intl.NumberFormat('en-US');

	// Un sensor usa su color y el ícono de satélite; la capa armonizada, `info` y el de capas.
	let Icon = $derived(source.sensor ? Satellite : Layers);
	let tileClass = $derived(
		source.sensor ? sensors[source.sensor].tileClass : 'bg-info text-info-content'
	);
</script>

<article class="card min-w-0 bg-base-100">
	<div class="card-body gap-4 p-5 2xl:gap-5 2xl:p-6">
		<header class="flex items-center gap-4">
			<span class={['grid size-12 shrink-0 place-items-center rounded-field', tileClass]}>
				<Icon class="size-6" aria-hidden="true" />
			</span>
			<div class="flex min-w-0 flex-col gap-1">
				<h2 class="card-title text-title-md">{source.name}</h2>
				<p class="text-body text-base-content/70">{source.origin}</p>
			</div>
		</header>

		<div>
			<StatusBadge tone="success" dot>{source.status}</StatusBadge>
		</div>

		<div class="flex flex-wrap items-end justify-between gap-4">
			<StatBlock label="Detections" value={countFormat.format(source.detections)} size="lg" />
			<StatBlock label="Resolution" value={source.resolution} />
		</div>
	</div>
</article>
