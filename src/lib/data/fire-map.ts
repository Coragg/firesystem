/**
 * Datos de ejemplo de la pantalla Fire map (febrero de 2024), tomados del boceto de Penpot.
 * Son provisionales: se reemplazan por la API cuando exista, manteniendo los mismos tipos.
 */
import type { Confidence, Detection } from '#lib/types.ts';
import { clusters, seeded } from './common.ts';

export const mapPeriod = { from: '2024-02-01', to: '2024-02-29', days: 29 };

/** Día seleccionado al abrir la pantalla (índice desde 0): 14 de febrero. */
export const defaultDayIndex = 13;

/** Opciones del filtro de confianza y los niveles que acepta cada una. */
export const confidenceFilters: Record<string, Confidence[]> = {
	'Nominal & high': ['nominal', 'high'],
	'High only': ['high'],
	'All levels': ['low', 'nominal', 'high']
};

/** Capas del mapa y el modo de color que activa cada una. */
export const mapLayers = {
	'Fire radiative power': 'frp',
	Sensor: 'sensor'
} as const;

const satellites = {
	MODIS: ['MODIS Terra', 'MODIS Aqua'],
	VIIRS: ['VIIRS S-NPP', 'VIIRS NOAA-20']
};

function isoTime(day: number, minutes: number): string {
	const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
	const mins = String(minutes % 60).padStart(2, '0');
	return `2024-02-${String(day).padStart(2, '0')}T${hours}:${mins}:00Z`;
}

function buildDetections(total: number): Detection[] {
	const random = seeded(total + 2);

	// Detección destacada del boceto y su par MODIS, 3 minutos antes y a menos de 5 km.
	const detections: Detection[] = [
		{
			id: 0,
			lat: -37.48,
			lng: -72.35,
			sensor: 'VIIRS',
			satellite: 'VIIRS NOAA-20',
			frp: 42.6,
			confidence: 'nominal',
			acquired: isoTime(14, 18 * 60 + 42)
		},
		{
			id: 1,
			lat: -37.49,
			lng: -72.37,
			sensor: 'MODIS',
			satellite: 'MODIS Aqua',
			frp: 38.2,
			confidence: 'nominal',
			acquired: isoTime(14, 18 * 60 + 39)
		}
	];

	for (let id = detections.length; id < total; id++) {
		let pick = random();
		const cluster = clusters.find((c) => (pick -= c.weight) <= 0) ?? clusters[0];
		// La suma de dos aleatorios concentra los puntos hacia el centro del cúmulo.
		const offset = () => (random() + random() - 1) * cluster.spread;
		const sensor = random() > 0.45 ? 'VIIRS' : 'MODIS';
		// La actividad se concentra hacia mediados de mes, con máximo cerca del día 14.
		const day = Math.min(
			mapPeriod.days,
			Math.max(1, Math.round(14.5 + (random() + random() + random() - 1.5) * 9.6))
		);
		const confidence = random();
		detections.push({
			id,
			lat: cluster.lat + offset(),
			lng: cluster.lng + offset() * 1.3,
			sensor,
			satellite: satellites[sensor][random() > 0.5 ? 1 : 0],
			// La mayoría son de baja potencia; pocas detecciones superan los 20 MW.
			frp: Math.round(Math.pow(random(), 8) * 650) / 10 + 1,
			confidence: confidence < 0.15 ? 'low' : confidence < 0.75 ? 'nominal' : 'high',
			acquired: isoTime(day, Math.floor(random() * 1440))
		});
	}
	return detections;
}

export const detections = buildDetections(386);

/** Detección seleccionada al abrir la pantalla. */
export const defaultDetectionId = 0;
