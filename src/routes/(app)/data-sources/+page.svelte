<script lang="ts">
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import FeedTable from '#lib/components/data-sources/FeedTable.svelte';
	import PipelineSteps from '#lib/components/data-sources/PipelineSteps.svelte';
	import SourceCard from '#lib/components/data-sources/SourceCard.svelte';
	import PageHeader from '#lib/components/layout/PageHeader.svelte';
	import FilterBar from '#lib/components/ui/FilterBar.svelte';
	import Meter from '#lib/components/ui/Meter.svelte';
	import Panel from '#lib/components/ui/Panel.svelte';
	import StatusBadge from '#lib/components/ui/StatusBadge.svelte';
	import { areas, lastUpdate, region } from '#lib/data/common.ts';
	import { coverage, dataWindows, feeds, pipeline, sources } from '#lib/data/data-sources.ts';

	// Ventana y región aún no cambian los datos: se conectarán cuando exista la API.
	let period = $state(dataWindows[0]);
	let area = $state(areas[0]);
</script>

<svelte:head>
	<title>Data sources · Firewatch</title>
</svelte:head>

<PageHeader
	title="Data sources"
	subtitle="Sensor coverage, feed health and harmonization pipeline"
>
	{#snippet actions()}
		<StatusBadge tone="success" dot>Last sync {lastUpdate}</StatusBadge>
	{/snippet}
</PageHeader>

<FilterBar
	fields={['period', 'area']}
	bind:period
	periodOptions={dataWindows}
	periodLabel="Data window"
	bind:area
	areaOptions={areas}
	areaLabel="Region"
>
	{#snippet action()}
		<!-- Sin efecto todavía: consultará el estado de las fuentes cuando exista la API. -->
		<button type="button" class="btn w-full border-base-content/20 bg-base-100 text-label-lg">
			<RefreshCw class="size-4" aria-hidden="true" />
			Refresh status
		</button>
	{/snippet}
</FilterBar>

<section class="grid grid-cols-1 gap-4 xl:grid-cols-3 2xl:gap-6" aria-label="Sources">
	{#each sources as source (source.id)}
		<SourceCard {source} />
	{/each}
</section>

<div class="grid grid-cols-1 gap-4 xl:grid-cols-12 2xl:gap-6">
	<Panel title="Feed coverage" subtitle="Products and collection windows" class="xl:col-span-8">
		<FeedTable {feeds} />
	</Panel>

	<Panel
		title="Coverage snapshot"
		subtitle="{region.shortName}, last 12 months"
		class="xl:col-span-4"
	>
		<ul class="flex flex-1 flex-col gap-6">
			{#each coverage as metric (metric.id)}
				<li><Meter label={metric.label} value={metric.share} tone={metric.tone} /></li>
			{/each}
		</ul>

		{#snippet footer()}
			Coverage varies by overpass and cloud conditions.
		{/snippet}
	</Panel>

	<Panel
		title="Harmonization pipeline"
		subtitle="How satellite observations become comparable activity records"
		class="xl:col-span-12"
	>
		<PipelineSteps steps={pipeline} />
	</Panel>
</div>
