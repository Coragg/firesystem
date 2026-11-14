<script lang="ts" module>
	export type FilterName = 'year' | 'area' | 'dates' | 'sensors' | 'confidence';

	/** Opción del menú de exportar: qué se descarga y la acción que lo genera. */
	export type ExportOption = { label: string; detail?: string; run: () => void };
</script>

<script lang="ts">
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Download from '@lucide/svelte/icons/download';
	import Earth from '@lucide/svelte/icons/earth';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import { dismissable } from '#lib/dropdown.ts';
	import type { Sensor } from '#lib/sensors.ts';
	import DateRangeField, { type DatePreset } from './DateRangeField.svelte';
	import DropdownSelect from './DropdownSelect.svelte';
	import FilterField from './FilterField.svelte';
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
		/** Atajos del rango de fechas y sus límites. */
		datePresets?: DatePreset[];
		minDate?: string;
		maxDate?: string;
		sensors?: Sensor[];
		confidence?: string;
		confidenceOptions?: readonly string[];
		/** Etiqueta del rango de fechas. */
		dateLabel?: string;
		/** Etiqueta visible del filtro de confianza. Sin ella, el campo va sin título. */
		confidenceLabel?: string;
		/** Texto del botón de exportar. */
		exportLabel?: string;
		/** Formatos de exportación. Sin opciones, el botón queda como acción simple. */
		exportOptions?: ExportOption[];
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
		datePresets = [],
		minDate,
		maxDate,
		sensors = $bindable([]),
		confidence = $bindable(''),
		confidenceOptions = [],
		dateLabel = 'Time range',
		confidenceLabel,
		exportLabel = 'Export analysis',
		exportOptions = [],
		onreset
	}: Props = $props();

	let exportOpen = $state(false);

	function runExport(option: ExportOption) {
		exportOpen = false;
		option.run();
	}
</script>

<form
	class="flex flex-wrap items-end gap-4"
	aria-label="Filters"
	onsubmit={(event) => event.preventDefault()}
>
	{#if fields.includes('year')}
		<FilterField label="Year" class="min-w-36 flex-1">
			<DropdownSelect
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
			<DropdownSelect
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
			<DateRangeField bind:from bind:to presets={datePresets} min={minDate} max={maxDate} />
		</FilterField>
	{/if}

	{#if fields.includes('sensors')}
		<FilterField label="Sensors" class="min-w-48 flex-1">
			<SensorToggle bind:selected={sensors} />
		</FilterField>
	{/if}

	{#if fields.includes('confidence')}
		<FilterField label={confidenceLabel} class="min-w-56 flex-1">
			<DropdownSelect
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

	<FilterField class="min-w-48 flex-1">
		{#if exportOptions.length}
			<details class="dropdown dropdown-end w-full" bind:open={exportOpen} {@attach dismissable}>
				<summary class="btn w-full text-label-lg whitespace-nowrap btn-info">
					<Download class="size-4" aria-hidden="true" />
					{exportLabel}
					<ChevronDown
						class={['size-4 transition-transform', exportOpen && 'rotate-180']}
						aria-hidden="true"
					/>
				</summary>
				<ul
					class="dropdown-content menu z-30 mt-2 w-72 gap-1 rounded-box border border-base-content/10 bg-base-100 p-2 shadow-lg"
				>
					{#each exportOptions as option (option.label)}
						<li>
							<button type="button" onclick={() => runExport(option)}>
								<span class="flex flex-col items-start gap-0.5">
									<span class="text-label">{option.label}</span>
									{#if option.detail}
										<span class="text-caption text-base-content/70">{option.detail}</span>
									{/if}
								</span>
							</button>
						</li>
					{/each}
				</ul>
			</details>
		{:else}
			<button type="button" class="btn w-full text-label-lg btn-info">
				<Download class="size-4" aria-hidden="true" />
				{exportLabel}
			</button>
		{/if}
	</FilterField>
</form>
