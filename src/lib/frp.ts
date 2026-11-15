/**
 * Niveles de potencia radiativa del fuego (FRP, en MW). Única fuente para el mapa,
 * su leyenda y el panel de detalle. Los colores son los alias `--color-frp-*` de colors.css.
 * Las etiquetas son getters para que se traduzcan al idioma de cada solicitud.
 */
import { m } from '#lib/paraglide/messages.js';

export type FrpLevel = {
	/** Potencia mínima del nivel, en MW. */
	min: number;
	readonly label: string;
	/** Variable CSS, para el mapa (que no usa clases). */
	colorVar: string;
	dotClass: string;
	textClass: string;
};

export const frpLevels: FrpLevel[] = [
	{
		min: 0,
		get label() {
			return m.frp_low();
		},
		colorVar: '--color-frp-1',
		dotClass: 'bg-frp-1',
		textClass: 'text-frp-1'
	},
	{
		min: 20,
		get label() {
			return m.frp_moderate();
		},
		colorVar: '--color-frp-2',
		dotClass: 'bg-frp-2',
		textClass: 'text-frp-2'
	},
	{
		min: 35,
		get label() {
			return m.frp_high();
		},
		colorVar: '--color-frp-3',
		dotClass: 'bg-frp-3',
		textClass: 'text-frp-3'
	},
	{
		min: 50,
		get label() {
			return m.frp_extreme();
		},
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
