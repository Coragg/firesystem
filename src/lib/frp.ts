/**
 * Niveles de potencia radiativa del fuego (FRP, en MW). Única fuente para el mapa,
 * su leyenda y el panel de detalle. Los colores son los alias `--color-frp-*` de colors.css.
 */
export type FrpLevel = {
	/** Potencia mínima del nivel, en MW. */
	min: number;
	label: string;
	/** Variable CSS, para el mapa (que no usa clases). */
	colorVar: string;
	dotClass: string;
	textClass: string;
};

export const frpLevels: FrpLevel[] = [
	{
		min: 0,
		label: 'Low intensity',
		colorVar: '--color-frp-1',
		dotClass: 'bg-frp-1',
		textClass: 'text-frp-1'
	},
	{
		min: 20,
		label: 'Moderate intensity',
		colorVar: '--color-frp-2',
		dotClass: 'bg-frp-2',
		textClass: 'text-frp-2'
	},
	{
		min: 35,
		label: 'High intensity',
		colorVar: '--color-frp-3',
		dotClass: 'bg-frp-3',
		textClass: 'text-frp-3'
	},
	{
		min: 50,
		label: 'Extreme intensity',
		colorVar: '--color-frp-4',
		dotClass: 'bg-frp-4',
		textClass: 'text-frp-4'
	}
];

/** Tope de la barra de potencia del panel de detalle, en MW. */
export const frpScaleMax = 60;

export function frpLevel(frp: number): FrpLevel {
	return frpLevels.findLast((level) => frp >= level.min) ?? frpLevels[0];
}
