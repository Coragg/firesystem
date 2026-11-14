/**
 * Escala de actividad de 5 pasos (de menor a mayor), compartida por el calendario y el
 * selector de tiempo. Los colores son los alias `--color-heat-*` de colors.css.
 */
export const heatLevels = ['bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4', 'bg-heat-5'];

/**
 * Devuelve la función que asigna a cada conteo su clase de color. Los cortes entre
 * niveles salen de la distribución de los propios datos (cuantiles).
 */
export function heatScale(counts: number[]): (count: number) => string {
	const sorted = [...counts].sort((a, b) => a - b);
	const thresholds = [0.3, 0.55, 0.8, 0.93].map(
		(quantile) => sorted[Math.floor(quantile * (sorted.length - 1))] ?? 0
	);
	return (count) => heatLevels[thresholds.filter((threshold) => count > threshold).length];
}
