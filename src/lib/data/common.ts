import type { Confidence } from '#lib/types.ts';

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

/** Opciones del filtro de confianza y los niveles que acepta cada una. */
export const confidenceFilters: Record<string, Confidence[]> = {
	'Nominal & high': ['nominal', 'high'],
	'High only': ['high'],
	'All levels': ['low', 'nominal', 'high']
};

export type Cluster = (typeof clusters)[number];

/** Región de un área de interés: vista del mapa, actividad relativa y cúmulos de focos. */
export type Region = {
	name: string;
	shortName: string;
	center: [number, number];
	zoom: number;
	/** Actividad relativa a Biobío (1 = igual). */
	activity: number;
	clusters: Cluster[];
};

/** Mueve los cúmulos de Biobío al centro de otra región (coordenadas aproximadas). */
function shiftClusters(center: [number, number]): Cluster[] {
	const [dLat, dLng] = [center[0] - region.center[0], center[1] - region.center[1]];
	return clusters.map((cluster) => ({ ...cluster, lat: cluster.lat + dLat, lng: cluster.lng + dLng }));
}

/** Regiones por cada opción de `areas`. Centros aproximados. */
export const regions: Record<string, Region> = {
	[areas[0]]: { ...region, activity: 1, clusters },
	[areas[1]]: {
		name: 'Araucanía Region · Chile',
		shortName: 'Araucanía, Chile',
		center: [-38.75, -72.45],
		zoom: 8,
		activity: 0.8,
		clusters: shiftClusters([-38.75, -72.45])
	},
	[areas[2]]: {
		name: 'Maule Region · Chile',
		shortName: 'Maule, Chile',
		center: [-35.55, -71.6],
		zoom: 8,
		activity: 0.65,
		clusters: shiftClusters([-35.55, -71.6])
	}
};
