/**
 * Datos de ejemplo de la pantalla Data sources, tomados del boceto de Penpot.
 * Son provisionales: se reemplazan por la API cuando exista, manteniendo los mismos tipos.
 * Los textos traducibles son getters: se leen en el idioma de cada solicitud.
 */
import { formatMonthRange } from '#lib/format.ts';
import { m } from '#lib/paraglide/messages.js';
import type { CoverageMetric, DataSource, Feed, PipelineStep } from '#lib/types.ts';

/** Ventanas de datos (años). El texto sale de `dataWindowLabel`: "ene–dic 2024". */
export const dataWindows = ['2024', '2023', '2022'];

export function dataWindowLabel(year: string): string {
	return formatMonthRange(`${year}-01-01`, `${year}-12-31`);
}

export const sources: DataSource[] = [
	{
		id: 'modis',
		name: 'MODIS Terra / Aqua',
		origin: 'NASA FIRMS, MOD14 / MYD14',
		sensor: 'MODIS',
		get status() {
			return m.status_connected();
		},
		detections: 24891,
		resolution: '1 km'
	},
	{
		id: 'viirs',
		name: 'VIIRS S-NPP / NOAA-20',
		origin: 'NASA FIRMS, VNP14 / VJ114',
		sensor: 'VIIRS',
		get status() {
			return m.status_connected();
		},
		detections: 19405,
		resolution: '375 m'
	},
	{
		id: 'harmonized',
		get name() {
			return m.source_harmonized_name();
		},
		get origin() {
			return m.source_harmonized_origin();
		},
		get status() {
			return m.status_harmonized();
		},
		detections: 18212,
		get resolution() {
			return m.resolution_grid({ size: '1 km' });
		}
	}
];

export const feeds: Feed[] = [
	{ id: 'mod14', name: 'MODIS Terra', product: 'MOD14', since: 2000, resolution: '1 km', get status() { return m.status_active(); } },
	{ id: 'myd14', name: 'MODIS Aqua', product: 'MYD14', since: 2002, resolution: '1 km', get status() { return m.status_active(); } },
	{ id: 'vnp14', name: 'VIIRS S-NPP', product: 'VNP14', since: 2012, resolution: '375 m', get status() { return m.status_active(); } },
	{ id: 'vj114', name: 'VIIRS NOAA-20', product: 'VJ114', since: 2018, resolution: '375 m', get status() { return m.status_active(); } },
	{
		id: 'harmonized',
		get name() {
			return m.feed_harmonized();
		},
		since: 2012,
		get resolution() {
			return m.resolution_grid({ size: '1 km' });
		},
		get status() {
			return m.status_ready();
		}
	}
];

/** Cobertura de la región en los últimos 12 meses (0 a 1). */
export const coverage: CoverageMetric[] = [
	{ id: 'modis', label: 'MODIS', share: 0.72, tone: 'primary' },
	{ id: 'viirs', label: 'VIIRS', share: 0.88, tone: 'secondary' },
	{
		id: 'match',
		get label() {
			return m.coverage_match();
		},
		share: 0.87,
		tone: 'success'
	}
];

/** Pasos de la armonización, en orden. */
export const pipeline: PipelineStep[] = [
	{ id: 'ingest', get title() { return m.pipeline_ingest(); }, get detail() { return m.pipeline_ingest_detail(); } },
	{ id: 'normalize', get title() { return m.pipeline_normalize(); }, get detail() { return m.pipeline_normalize_detail(); } },
	{ id: 'match', get title() { return m.pipeline_match(); }, get detail() { return m.pipeline_match_detail(); } },
	{ id: 'publish', get title() { return m.pipeline_publish(); }, get detail() { return m.pipeline_publish_detail(); } }
];
