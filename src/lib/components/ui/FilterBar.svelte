<script lang="ts" module>
	export type FilterName = 'year' | 'area' | 'dates' | 'sensors' | 'confidence';
</script>

<script lang="ts">
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
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
		year?: number;
		yearOptions?: readonly number[];
		area?: string;
		areaOptions?: readonly string[];
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
	};

	let {
		fields = ['area', 'dates', 'sensors', 'confidence'],
		year = $bindable(0),
		yearOptions = [],
		area = $bindable(''),
		areaOptions = [],
		from = $bindable(''),
		to = $bindable(''),
		sensors = $bindable([]),
		confidence = $bindable(''),
		confidenceOptions = [],
		dateLabel = 'Time range',
		confidenceLabel,
		exportLabel = 'Export analysis',
		onreset
	}: Props = $props();
</script>

<form
	class="flex flex-wrap items-end gap-4"
	aria-label="Filters"
	onsubmit={(event) => event.preventDefault()}
>
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
		<FilterField label="Area of interest" class="min-w-60 flex-1">
			<SelectField
				bind:value={area}
				options={areaOptions}
				label="Area of interest"
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
		<button type="button" class="btn w-full text-label-lg btn-info">
			<Download class="size-4" aria-hidden="true" />
			{exportLabel}
		</button>
	</FilterField>
</form>
