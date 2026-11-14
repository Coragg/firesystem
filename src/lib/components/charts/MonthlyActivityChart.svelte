<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import { sensors } from '#lib/sensors.ts';
	import type { SensorSeries } from '#lib/types.ts';
	import EChart, { type ChartTokens } from './EChart.svelte';

	type Props = {
		/** Nombres completos de los meses, en orden. */
		months: string[];
		series: SensorSeries[];
		class?: ClassValue;
	};

	let { months, series, class: className }: Props = $props();

	function compact(value: number): string {
		return value >= 1000 ? `${value / 1000}k` : String(value);
	}

	function options(tokens: ChartTokens) {
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
				axisLabel: { ...axisLabel, interval: 0, formatter: (month: string) => month.charAt(0) }
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

<EChart {options} label="Monthly detections by sensor" class={className} />
