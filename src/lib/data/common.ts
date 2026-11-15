/**
 * Datos de ejemplo compartidos por varias pantallas. Son provisionales: se reemplazan
 * por la API cuando exista, manteniendo los mismos tipos.
 *
 * Los textos visibles se leen con getters (`get name()`) o funciones: así se traducen al
 * idioma de cada solicitud y no al del momento en que se cargó el módulo.
 */
import { m } from '#lib/paraglide/messages.js';
import type { Confidence } from '#lib/types.ts';

export const currentUser = {
	initials: 'AM',
	name: 'Analyst Mode',
	get detail() {
		return m.user_region_pacific();
	}
};

export const years = [2024, 2023, 2022, 2021, 2020];

/** Áreas de interés (identificadores). El texto visible sale de `areaLabel`. */
export const areas = ['biobio', 'araucania', 'maule'] as const;
export type AreaId = (typeof areas)[number];

/** Minutos desde la última actualización de los datos (de ejemplo). */
export const minutesSinceUpdate = 12;

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

/** Cúmulos de detecciones dentro de la región de ejemplo (Biobío). */
export const clusters = [
	{ lat: -37.47, lng: -72.35, spread: 0.45, weight: 0.3 },
	{ lat: -37.0, lng: -72.6, spread: 0.4, weight: 0.2 },
	{ lat: -37.85, lng: -72.9, spread: 0.4, weight: 0.2 },
	{ lat: -37.35, lng: -71.7, spread: 0.5, weight: 0.15 },
	{ lat: -36.85, lng: -73.0, spread: 0.25, weight: 0.15 }
];

/** Opciones del filtro de confianza (identificadores) y los niveles que acepta cada una. */
export type ConfidenceFilter = 'nominal_high' | 'high' | 'all';
export const confidenceFilters: Record<ConfidenceFilter, Confidence[]> = {
	nominal_high: ['nominal', 'high'],
	high: ['high'],
	all: ['low', 'nominal', 'high']
};
export const confidenceOptions = Object.keys(confidenceFilters) as ConfidenceFilter[];

export function confidenceFilterLabel(id: ConfidenceFilter): string {
	return { nominal_high: m.confidence_nominal_high, high: m.confidence_high_only, all: m.confidence_all }[
		id
	]();
}

/** Nombre de un nivel de confianza ("Nominal", "Alta"...). */
export function confidenceLabel(level: Confidence): string {
	return { low: m.confidence_low, nominal: m.confidence_nominal, high: m.confidence_high }[level]();
}

export type Cluster = (typeof clusters)[number];

/** Región de un área de interés: vista del mapa, actividad relativa y cúmulos de focos. */
export type Region = {
	/** "Región del Biobío · Chile" (traducido). */
	readonly name: string;
	/** "Biobío, Chile" (nombre propio, igual en todos los idiomas). */
	shortName: string;
	center: [number, number];
	zoom: number;
	/** Actividad relativa a Biobío (1 = igual). */
	activity: number;
	clusters: Cluster[];
};

const biobioCenter: [number, number] = [-37.45, -72.4];

/** Mueve los cúmulos de Biobío al centro de otra región (coordenadas aproximadas). */
function shiftClusters(center: [number, number]): Cluster[] {
	const [dLat, dLng] = [center[0] - biobioCenter[0], center[1] - biobioCenter[1]];
	return clusters.map((cluster) => ({ ...cluster, lat: cluster.lat + dLat, lng: cluster.lng + dLng }));
}

const regionNames: Record<AreaId, () => string> = {
	biobio: m.region_biobio,
	araucania: m.region_araucania,
	maule: m.region_maule
};

/** Texto del área en los filtros: "Chile · Región del Biobío". */
export function areaLabel(id: AreaId): string {
	return `${m.country_chile()} · ${regionNames[id]()}`;
}

/** Regiones por área. Centros aproximados. */
export const regions: Record<AreaId, Region> = {
	biobio: {
		get name() {
			return `${m.region_biobio()} · ${m.country_chile()}`;
		},
		shortName: 'Biobío, Chile',
		center: biobioCenter,
		zoom: 8,
		activity: 1,
		clusters
	},
	araucania: {
		get name() {
			return `${m.region_araucania()} · ${m.country_chile()}`;
		},
		shortName: 'Araucanía, Chile',
		center: [-38.75, -72.45],
		zoom: 8,
		activity: 0.8,
		clusters: shiftClusters([-38.75, -72.45])
	},
	maule: {
		get name() {
			return `${m.region_maule()} · ${m.country_chile()}`;
		},
		shortName: 'Maule, Chile',
		center: [-35.55, -71.6],
		zoom: 8,
		activity: 0.65,
		clusters: shiftClusters([-35.55, -71.6])
	}
};

/** Región de ejemplo de las pantallas que aún no filtran por área. */
export const region = regions.biobio;
