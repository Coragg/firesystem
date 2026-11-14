<script lang="ts">
	import CalendarRange from '@lucide/svelte/icons/calendar-range';

	type Props = {
		/** Fechas en formato ISO (`AAAA-MM-DD`). */
		from: string;
		to: string;
	};

	let { from = $bindable(), to = $bindable() }: Props = $props();

	const dayMonth = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: '2-digit',
		timeZone: 'UTC'
	});
	const full = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: '2-digit',
		year: 'numeric',
		timeZone: 'UTC'
	});

	let summary = $derived(
		from && to ? `${dayMonth.format(new Date(from))} — ${full.format(new Date(to))}` : 'Select dates'
	);
</script>

<details class="dropdown w-full">
	<summary class="select w-full text-label-lg">
		<CalendarRange class="size-4 shrink-0 text-base-content/70" aria-hidden="true" />
		<span class="truncate">{summary}</span>
	</summary>
	<div class="dropdown-content card z-10 mt-2 w-72 bg-base-100 shadow-lg">
		<div class="card-body gap-3 p-4">
			<label class="flex flex-col gap-1 text-caption text-base-content/70">
				From
				<input type="date" class="input w-full text-label" bind:value={from} max={to} />
			</label>
			<label class="flex flex-col gap-1 text-caption text-base-content/70">
				To
				<input type="date" class="input w-full text-label" bind:value={to} min={from} />
			</label>
		</div>
	</div>
</details>
