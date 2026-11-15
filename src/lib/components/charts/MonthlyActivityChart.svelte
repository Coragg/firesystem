<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import { formatNumber } from '#lib/format.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { sensors } from '#lib/sensors.ts';
	import type { SensorSeries } from '#lib/types.ts';
	import EChart, { type ChartTokens } from './EChart.svelte';

	type Props = {
		/** Nombre completo de cada barra (mes o semana), en orden. Se usa en el tooltip. */
		months: string[];
		series: SensorSeries[];
		/** Etiquetas del eje: inicial ("J") en paneles angostos o abreviatura ("Jan"). */
		monthLabels?: 'initial' | 'short';
		/** Etiquetas del eje ya armadas (por ejemplo, semanas). Reemplazan a `monthLabels`. */
		axisLabels?: string[];
		/** Descripción para lectores de pantalla. */
		label?: string;
		class?: ClassValue;
	};

	let {
		months,
		series,
		monthLabels = 'initial',
		axisLabels,
		label = m.chart_monthly_label(),
		class: className
	}: Props = $props();

	/** Ejes con cifras compactas según el idioma: "1,2 mil", "1.2K"... */
	function compact(value: number): string {
		return formatNumber(value, { notation: 'compact' });
	}

	let empty = $derived(series.every((item) => item.values.every((value) => value === 0)));

	function options(tokens: ChartTokens) {
		const labelLength = monthLabels === 'short' ? 3 : 1;
		const axisLabel = {
			color: tokens.muted,
			fontSize: tokens.fontSize,
			margin: tokens.spacing * 2
		};
		return {
			textStyle: { fontFamily: tokens.fontFamily },
			grid: {
				left: 0,
				right: 0,
				top: tokens.spacing * 3,
				bottom: 0,
				outerBoundsMode: 'same',
				outerBoundsContain: 'axisLabel'
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'shadow', shadowStyle: { color: tokens.grid } },
				backgroundColor: tokens.surface,
				borderColor: tokens.grid,
				padding: [tokens.spacing * 1.5, tokens.spacing * 2],
				textStyle: { color: tokens.text, fontSize: tokens.fontSize }
			},
			xAxis: {
				type: 'category',
				data: months,
				axisTick: { show: false },
				axisLine: { show: false },
				axisLabel: {
					...axisLabel,
					// Con muchas barras (vista semanal), ECharts omite etiquetas para que no se pisen.
					interval: axisLabels ? 'auto' : 0,
					formatter: (month: string, index: number) =>
						axisLabels ? axisLabels[index] : month.slice(0, labelLength)
				}
			},
			yAxis: {
				type: 'value',
				// Pasos automáticos y ~15% de aire sobre la barra más alta.
				splitNumber: 4,
				boundaryGap: [0, '15%'],
				axisLabel: { ...axisLabel, formatter: compact },
				splitLine: { lineStyle: { color: tokens.grid } }
			},
			series: series.map(({ sensor, values }) => ({
				name: sensors[sensor].longLabel,
				type: 'bar',
				data: values,
				// Proporciones relativas al ancho de cada mes, no medidas: no van en spacing.
				barGap: '15%',
				barCategoryGap: '35%',
				itemStyle: { color: tokens.color(sensors[sensor].colorVar), borderRadius: tokens.radius }
			}))
		};
	}
</script>

<EChart {options} {label} {empty} class={className} />
