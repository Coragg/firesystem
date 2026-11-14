<script lang="ts" module>
	export type MeterTone = 'primary' | 'secondary' | 'success';
</script>

<script lang="ts">
	type Props = {
		label: string;
		/** Proporción de 0 a 1. */
		value: number;
		tone?: MeterTone;
		/** `stacked`: etiqueta y porcentaje sobre la barra. `inline`: todo en una fila desde `md`. */
		layout?: 'stacked' | 'inline';
	};

	let { label, value, tone = 'primary', layout = 'stacked' }: Props = $props();

	const percentFormat = new Intl.NumberFormat('en-US', { style: 'percent' });

	// El color va en la barra; el texto queda legible.
	const toneClass: Record<MeterTone, string> = {
		primary: 'progress-primary',
		secondary: 'progress-secondary',
		success: 'progress-success'
	};

	const inline = $derived(layout === 'inline');
</script>

<!-- En `inline`, bajo `md` la barra baja a una segunda línea, como en `stacked`. -->
<div class="grid grid-cols-12 items-center gap-x-4 gap-y-2">
	<span class={['col-span-9', inline ? 'text-body-lg md:col-span-2' : 'text-label']}>{label}</span>
	<span
		class={[
			'col-span-3 text-end tabular-nums',
			inline ? 'text-body-lg text-base-content/70 md:order-last md:col-span-1' : 'text-label'
		]}
	>
		{percentFormat.format(value)}
	</span>
	<span class={['col-span-12 flex', inline && 'md:col-span-9']}>
		<progress class={['progress', toneClass[tone]]} {value} max="1" aria-label={label}></progress>
	</span>
</div>
