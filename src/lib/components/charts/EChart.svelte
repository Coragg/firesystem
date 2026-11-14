<script lang="ts" module>
	/** Valores del tema activo, ya resueltos, para armar las opciones de un gráfico. */
	export type ChartTokens = {
		/** Resuelve cualquier variable de color del tema, por ejemplo `--color-primary`. */
		color: (cssVariable: string) => string;
		text: string;
		muted: string;
		grid: string;
		surface: string;
		fontFamily: string;
		fontSize: number;
		/** Unidad de spacing.css en px (4): las medidas se dan como múltiplos. */
		spacing: number;
		/** Radio pequeño de spacing.css (`--radius-xs`) en px. */
		radius: number;
	};
</script>

<script lang="ts">
	import type { EChartsCoreOption, EChartsType } from 'echarts/core';
	import type { Attachment } from 'svelte/attachments';
	import type { ClassValue } from 'svelte/elements';
	import { cssVar, remToPx, spacingUnit, withAlpha } from '#lib/theme.ts';

	type Props = {
		/** Recibe los tokens del tema y devuelve las opciones de ECharts. */
		options: (tokens: ChartTokens) => EChartsCoreOption;
		/** Descripción del gráfico para lectores de pantalla. */
		label: string;
		/** Alto del gráfico (por ejemplo `h-72`). */
		class?: ClassValue;
	};

	let { options, label, class: className }: Props = $props();

	function readTokens(node: HTMLElement): ChartTokens {
		const text = cssVar(node, '--color-base-content');
		return {
			color: (cssVariable) => cssVar(node, cssVariable),
			text,
			muted: withAlpha(text, 0.7),
			grid: withAlpha(text, 0.1),
			surface: cssVar(node, '--color-base-100'),
			fontFamily: getComputedStyle(node).fontFamily,
			fontSize: remToPx(cssVar(node, '--text-caption')),
			spacing: spacingUnit(node),
			radius: remToPx(cssVar(node, '--radius-xs'))
		};
	}

	let instance = $state.raw<EChartsType>();
	let host: HTMLElement | undefined;

	// El gráfico se crea una sola vez; las opciones se aplican aparte (ver el efecto de abajo).
	const chart: Attachment<HTMLElement> = (node) => {
		let cancelled = false;
		let created: EChartsType | undefined;
		const observer = new ResizeObserver(() => created?.resize());

		// ECharts necesita el navegador: se carga solo en cliente.
		import('#lib/charts/echarts.ts').then(({ echarts }) => {
			if (cancelled) return;
			created = echarts.init(node);
			host = node;
			instance = created;
			observer.observe(node);
		});

		return () => {
			cancelled = true;
			observer.disconnect();
			created?.dispose();
			instance = undefined;
		};
	};

	// Se vuelve a aplicar cada vez que cambian los datos que lee `options` (series, meses...).
	$effect(() => {
		if (!instance || !host) return;
		instance.setOption(options(readTokens(host)), { notMerge: true });
	});
</script>

<div {@attach chart} class={['w-full', className]} role="img" aria-label={label}></div>
