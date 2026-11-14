/**
 * Lectura de los tokens del tema activo para librerías que dibujan fuera del CSS
 * (ECharts, Leaflet). Así sus colores salen de colors.css y del tema de daisyUI,
 * nunca de valores escritos a mano.
 */

/** Valor resuelto de una variable CSS (por ejemplo `--color-primary`) en un elemento. */
export function cssVar(node: Element, name: string): string {
	return getComputedStyle(node).getPropertyValue(name).trim();
}

/** Mismo color con transparencia, en una forma que entienden canvas y SVG. */
export function withAlpha(color: string, alpha: number): string {
	return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}

/**
 * Unidad de spacing.css (`--spacing`, 4 px) en píxeles. Las librerías que piden números
 * (ECharts, Leaflet) expresan sus medidas como múltiplos de esta unidad.
 */
export function spacingUnit(node: Element): number {
	return remToPx(cssVar(node, '--spacing'));
}

/** Convierte un tamaño en rem (por ejemplo el de `--text-caption`) a píxeles. */
export function remToPx(value: string): number {
	const root = parseFloat(getComputedStyle(document.documentElement).fontSize);
	return parseFloat(value) * root;
}
