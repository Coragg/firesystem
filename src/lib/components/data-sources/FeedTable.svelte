<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { Feed } from '#lib/types.ts';

	type Props = { feeds: Feed[] };

	let { feeds }: Props = $props();
</script>

<!-- En pantallas angostas la tabla se desplaza dentro de su panel, no la página. -->
<div class="overflow-x-auto">
	<table class="table text-body">
		<thead>
			<tr class="text-overline text-base-content/70 uppercase">
				<th scope="col">{m.feed_col_sensor()}</th>
				<th scope="col">{m.feed_col_coverage()}</th>
				<th scope="col">{m.sources_resolution()}</th>
				<th scope="col">{m.feed_col_status()}</th>
			</tr>
		</thead>
		<tbody>
			{#each feeds as feed (feed.id)}
				<tr>
					<th scope="row" class="text-label-lg whitespace-nowrap">
						{feed.name}
						{#if feed.product}
							<span class="ms-2 text-caption text-base-content/70">{feed.product}</span>
						{/if}
					</th>
					<td class="whitespace-nowrap text-base-content/70">{m.feed_since({ year: feed.since })}</td>
					<td class="whitespace-nowrap text-base-content/70">{feed.resolution}</td>
					<td>
						<!-- El color va en el punto; el texto queda legible. -->
						<span class="flex items-center gap-2 text-label">
							<span class="status status-success" aria-hidden="true"></span>
							{feed.status}
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
