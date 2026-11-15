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
	import { areaLabel, areas, minutesSinceUpdate, region, type AreaId } from '#lib/data/common.ts';
	import {
		coverage,
		dataWindowLabel,
		dataWindows,
		feeds,
		pipeline,
		sources
	} from '#lib/data/data-sources.ts';
	import { formatMinutesAgo } from '#lib/format.ts';
	import { m } from '#lib/paraglide/messages.js';

	// Ventana y región aún no cambian los datos: se conectarán cuando exista la API.
	let period = $state(dataWindows[0]);
	let area = $state<AreaId>(areas[0]);
</script>

<svelte:head>
	<title>{m.nav_data_sources()} · Firewatch</title>
</svelte:head>

<PageHeader title={m.nav_data_sources()} subtitle={m.sources_subtitle()}>
	{#snippet actions()}
		<StatusBadge tone="success" dot>
			{m.sources_last_sync({ when: formatMinutesAgo(minutesSinceUpdate) })}
		</StatusBadge>
	{/snippet}
</PageHeader>

<FilterBar
	fields={['period', 'area']}
	bind:period
	periodOptions={dataWindows}
	periodFormat={dataWindowLabel}
	periodLabel={m.sources_data_window()}
	bind:area
	areaOptions={areas}
	areaFormat={(id) => areaLabel(id as AreaId)}
	areaLabel={m.filter_region()}
>
	{#snippet action()}
		<!-- Sin efecto todavía: consultará el estado de las fuentes cuando exista la API. -->
		<button type="button" class="btn w-full btn-field text-label-lg">
			<RefreshCw class="size-4" aria-hidden="true" />
			{m.sources_refresh()}
		</button>
	{/snippet}
</FilterBar>

<section class="grid grid-cols-1 gap-4 xl:grid-cols-3 2xl:gap-6" aria-label={m.sources_aria()}>
	{#each sources as source (source.id)}
		<SourceCard {source} />
	{/each}
</section>

<div class="grid grid-cols-1 gap-4 xl:grid-cols-12 2xl:gap-6">
	<Panel
		title={m.sources_feed_title()}
		subtitle={m.sources_feed_subtitle()}
		class="xl:col-span-8"
	>
		<FeedTable {feeds} />
	</Panel>

	<Panel
		title={m.sources_coverage_title()}
		subtitle={m.sources_coverage_subtitle({ region: region.shortName })}
		class="xl:col-span-4"
	>
		<ul class="flex flex-1 flex-col gap-6">
			{#each coverage as metric (metric.id)}
				<li><Meter label={metric.label} value={metric.share} tone={metric.tone} /></li>
			{/each}
		</ul>

		{#snippet footer()}
			{m.sources_coverage_note()}
		{/snippet}
	</Panel>

	<Panel
		title={m.sources_pipeline_title()}
		subtitle={m.sources_pipeline_subtitle()}
		class="xl:col-span-12"
	>
		<PipelineSteps steps={pipeline} />
	</Panel>
</div>
