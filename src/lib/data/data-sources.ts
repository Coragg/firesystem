/**
 * Datos de ejemplo de la pantalla Data sources, tomados del boceto de Penpot.
 * Son provisionales: se reemplazan por la API cuando exista, manteniendo los mismos tipos.
 */
import type { CoverageMetric, DataSource, Feed, PipelineStep } from '#lib/types.ts';

export const dataWindows = ['Jan — Dec 2024', 'Jan — Dec 2023', 'Jan — Dec 2022'];

export const sources: DataSource[] = [
	{
		id: 'modis',
		name: 'MODIS Terra / Aqua',
		origin: 'NASA FIRMS, MOD14 / MYD14',
		sensor: 'MODIS',
		status: 'Connected',
		detections: 24891,
		resolution: '1 km'
	},
	{
		id: 'viirs',
		name: 'VIIRS S-NPP / NOAA-20',
		origin: 'NASA FIRMS, VNP14 / VJ114',
		sensor: 'VIIRS',
		status: 'Connected',
		detections: 19405,
		resolution: '375 m'
	},
	{
		id: 'harmonized',
		name: 'Harmonized archive',
		origin: 'Firewatch processing layer',
		status: 'Harmonized',
		detections: 18212,
		resolution: '1 km grid'
	}
];

export const feeds: Feed[] = [
	{ id: 'mod14', name: 'MODIS Terra', product: 'MOD14', since: 2000, resolution: '1 km', status: 'Active' },
	{ id: 'myd14', name: 'MODIS Aqua', product: 'MYD14', since: 2002, resolution: '1 km', status: 'Active' },
	{ id: 'vnp14', name: 'VIIRS S-NPP', product: 'VNP14', since: 2012, resolution: '375 m', status: 'Active' },
	{ id: 'vj114', name: 'VIIRS NOAA-20', product: 'VJ114', since: 2018, resolution: '375 m', status: 'Active' },
	{ id: 'harmonized', name: 'Harmonized detections', since: 2012, resolution: '1 km grid', status: 'Ready' }
];

/** Cobertura de la región en los últimos 12 meses (0 a 1). */
export const coverage: CoverageMetric[] = [
	{ id: 'modis', label: 'MODIS', share: 0.72, tone: 'primary' },
	{ id: 'viirs', label: 'VIIRS', share: 0.88, tone: 'secondary' },
	{ id: 'match', label: 'Cross-sensor match', share: 0.87, tone: 'success' }
];

/** Pasos de la armonización, en orden. */
export const pipeline: PipelineStep[] = [
	{ id: 'ingest', title: 'Ingest', detail: 'NASA FIRMS feeds' },
	{ id: 'normalize', title: 'Normalize', detail: 'Time, confidence and units' },
	{ id: 'match', title: 'Match', detail: 'Spatial-temporal pairing' },
	{ id: 'publish', title: 'Publish', detail: 'Unified activity layer' }
];
