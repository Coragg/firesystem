/**
 * Datos de ejemplo de la pantalla Activity calendar, tomados del boceto de Penpot.
 * Son provisionales: se reemplazan por la API cuando exista, manteniendo los mismos tipos.
 */
import type { Kpi } from '#lib/types.ts';
import { dataYear } from './activity.ts';

export const kpis: Kpi[] = [
	{
		label: `Detections in ${dataYear}`,
		value: '24,891',
		highlight: '18.6%',
		tone: 'primary',
		trend: 'up',
		note: 'vs. previous year'
	},
	{
		label: 'Active burn days',
		value: '137',
		note: 'Across selected region'
	},
	{
		label: 'Peak activity',
		value: 'Feb 14',
		highlight: '1,284 detections',
		tone: 'warning',
		note: 'on the busiest day'
	},
	{
		label: 'Sensor agreement',
		value: '87.4%',
		highlight: 'High confidence',
		tone: 'success',
		note: 'overlap between sensors'
	}
];

export const heatmapInsight = 'Highest intensity clusters in late summer and early autumn.';

export const watchWindow = { label: 'Next watch window', value: 'Nov 18–24, elevated risk' };
