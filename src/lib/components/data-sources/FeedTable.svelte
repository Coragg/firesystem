<script lang="ts">
	import type { Feed } from '#lib/types.ts';

	type Props = { feeds: Feed[] };

	let { feeds }: Props = $props();
</script>

<!-- En pantallas angostas la tabla se desplaza dentro de su panel, no la página. -->
<div class="overflow-x-auto">
	<table class="table text-body">
		<thead>
			<tr class="text-overline text-base-content/70 uppercase">
				<th scope="col">Sensor / product</th>
				<th scope="col">Coverage</th>
				<th scope="col">Resolution</th>
				<th scope="col">Status</th>
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
					<td class="whitespace-nowrap text-base-content/70">Since {feed.since}</td>
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
