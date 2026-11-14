<script lang="ts" module>
	export type FilterName = 'period' | 'year' | 'area' | 'dates' | 'sensors' | 'confidence';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import CalendarRange from '@lucide/svelte/icons/calendar-range';
	import Download from '@lucide/svelte/icons/download';
	import Earth from '@lucide/svelte/icons/earth';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import type { Sensor } from '#lib/sensors.ts';
	import DateRangeField from './DateRangeField.svelte';
	import FilterField from './FilterField.svelte';
	import SelectField from './SelectField.svelte';
	import SensorToggle from './SensorToggle.svelte';

	type Props = {
		/** Filtros que muestra esta pantalla. El orden en pantalla es siempre el mismo. */
		fields?: FilterName[];
		/** Periodo elegido de una lista (por ejemplo "2020 — 2024" o "Jan — Dec 2024"). */
		period?: string;
		periodOptions?: readonly string[];
		/** Etiqueta del filtro de periodo. */
		periodLabel?: string;
		year?: number;
		yearOptions?: readonly number[];
		area?: string;
		areaOptions?: readonly string[];
		/** Etiqueta del filtro de área. */
		areaLabel?: string;
		/** Fechas en formato ISO (`AAAA-MM-DD`). */
		from?: string;
		to?: string;
		sensors?: Sensor[];
		confidence?: string;
		confidenceOptions?: readonly string[];
		/** Etiqueta del rango de fechas. */
		dateLabel?: string;
		/** Etiqueta visible del filtro de confianza. Sin ella, el campo va sin título. */
		confidenceLabel?: string;
		/** Texto del botón de exportar. */
		exportLabel?: string;
		/** Si se pasa, aparece el botón "Reset". */
		onreset?: () => void;
		/** Botón que reemplaza al de exportar en pantallas que no exportan. */
		action?: Snippet;
	};

	let {
		fields = ['area', 'dates', 'sensors', 'confidence'],
		period = $bindable(''),
		periodOptions = [],
		periodLabel = 'Reporting period',
		year = $bindable(0),
		yearOptions = [],
		area = $bindable(''),
		areaOptions = [],
		areaLabel = 'Area of interest',
		from = $bindable(''),
		to = $bindable(''),
		sensors = $bindable([]),
		confidence = $bindable(''),
		confidenceOptions = [],
		dateLabel = 'Time range',
		confidenceLabel,
		exportLabel = 'Export analysis',
		onreset,
		action
	}: Props = $props();
</script>

<form
	class="flex flex-wrap items-end gap-4"
	aria-label="Filters"
	onsubmit={(event) => event.preventDefault()}
>
	{#if fields.includes('period')}
		<FilterField label={periodLabel} class="min-w-56 flex-1">
			<SelectField
				bind:value={period}
				options={periodOptions}
				label={periodLabel}
				icon={CalendarRange}
				class="w-full"
			/>
		</FilterField>
	{/if}

	{#if fields.includes('year')}
		<FilterField label="Year" class="min-w-36 flex-1">
			<SelectField
				bind:value={year}
				options={yearOptions}
				label="Year"
				icon={CalendarDays}
				class="w-full"
			/>
		</FilterField>
	{/if}

	{#if fields.includes('area')}
		<FilterField label={areaLabel} class="min-w-60 flex-1">
			<SelectField
				bind:value={area}
				options={areaOptions}
				label={areaLabel}
				icon={Earth}
				class="w-full"
			/>
		</FilterField>
	{/if}

	{#if fields.includes('dates')}
		<FilterField label={dateLabel} class="min-w-56 flex-1">
			<DateRangeField bind:from bind:to />
		</FilterField>
	{/if}

	{#if fields.includes('sensors')}
		<FilterField label="Sensors" class="min-w-48 flex-1">
			<SensorToggle bind:selected={sensors} />
		</FilterField>
	{/if}

	{#if fields.includes('confidence')}
		<FilterField label={confidenceLabel} class="min-w-56 flex-1">
			<SelectField
				bind:value={confidence}
				options={confidenceOptions}
				label="Confidence"
				icon={ShieldCheck}
				class="w-full"
			/>
		</FilterField>
	{/if}

	{#if onreset}
		<FilterField>
			<button type="button" class="btn text-label-lg btn-ghost" onclick={onreset}>
				<RotateCcw class="size-4" aria-hidden="true" />
				Reset
			</button>
		</FilterField>
	{/if}

	<FilterField class="min-w-44 flex-1">
		{#if action}
			{@render action()}
		{:else}
			<button type="button" class="btn w-full text-label-lg btn-info">
				<Download class="size-4" aria-hidden="true" />
				{exportLabel}
			</button>
		{/if}
	</FilterField>
</form>
