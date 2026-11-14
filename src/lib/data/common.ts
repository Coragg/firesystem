/**
 * Datos de ejemplo compartidos por varias pantallas. Son provisionales: se reemplazan
 * por la API cuando exista, manteniendo los mismos tipos.
 */

export const currentUser = { initials: 'AM', name: 'Analyst Mode', detail: 'Pacific region' };

export const years = [2024, 2023, 2022, 2021, 2020];

export const areas = ['Chile · Biobío Region', 'Chile · Araucanía Region', 'Chile · Maule Region'];

export const region = {
	name: 'Biobío Region · Chile',
	shortName: 'Biobío, Chile',
	center: [-37.45, -72.4] as [number, number],
	zoom: 8
};

export const lastUpdate = '12 min ago';

/** Generador pseudoaleatorio con semilla: los datos de ejemplo son siempre los mismos. */
export function seeded(seed: number): () => number {
	let state = seed;
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Cúmulos de detecciones dentro de la región de ejemplo. */
export const clusters = [
	{ lat: -37.47, lng: -72.35, spread: 0.45, weight: 0.3 },
	{ lat: -37.0, lng: -72.6, spread: 0.4, weight: 0.2 },
	{ lat: -37.85, lng: -72.9, spread: 0.4, weight: 0.2 },
	{ lat: -37.35, lng: -71.7, spread: 0.5, weight: 0.15 },
	{ lat: -36.85, lng: -73.0, spread: 0.25, weight: 0.15 }
];
