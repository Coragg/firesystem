/**
 * Datos de ejemplo del Dashboard, tomados del boceto de Penpot.
 * Son provisionales: cuando el backend exponga estos datos, este módulo se reemplaza
 * por llamadas a la API manteniendo los mismos tipos, sin tocar los componentes.
 */
import type { CriticalPeriod, Hotspot, Kpi } from '#lib/types.ts';
import { clusters, seeded } from './common.ts';

export const confidenceOptions = ['Confidence: nominal+', 'Confidence: high', 'Confidence: all'];

export const kpis: Kpi[] = [
	{
		label: 'Detections this year',
		value: '24,891',
		highlight: '18.6%',
		tone: 'primary',
		trend: 'up',
		note: 'vs. previous year'
	},
	{
		label: 'Active burn days',
		value: '137',
		highlight: '12 days',
		tone: 'error',
		trend: 'up',
		note: 'across selected area'
	},
	{
		label: 'Peak activity',
		value: 'Feb 14',
		highlight: '1,284 hotspots',
		tone: 'warning',
		note: 'on the busiest day'
	},
	{
		label: 'Sensor agreement',
		value: '87.4%',
		highlight: 'High confidence',
		tone: 'secondary',
		note: 'between MODIS and VIIRS'
	}
];

export const criticalPeriods: CriticalPeriod[] = [
	{
		id: '2024-02-12',
		range: 'Feb 12–18',
		severity: 'critical',
		detail: '6.2× seasonal baseline · 3,814 detections'
	},
	{
		id: '2024-08-03',
		range: 'Aug 03–07',
		severity: 'elevated',
		detail: '2.1× seasonal baseline · 927 detections'
	}
];

export const watchWindow = { label: 'Suggested watch window', value: 'Next elevated risk: Nov 18–24' };

function buildHotspots(total: number): Hotspot[] {
	const random = seeded(total);
	const hotspots: Hotspot[] = [];
	for (let id = 0; id < total; id++) {
		let pick = random();
		const cluster = clusters.find((c) => (pick -= c.weight) <= 0) ?? clusters[0];
		// La suma de dos aleatorios concentra los puntos hacia el centro del cúmulo.
		const offset = () => (random() + random() - 1) * cluster.spread;
		hotspots.push({
			id,
			lat: cluster.lat + offset(),
			lng: cluster.lng + offset() * 1.3,
			sensor: random() > 0.45 ? 'VIIRS' : 'MODIS',
			// La mayoría son de baja potencia; pocas detecciones superan los 20 MW.
			frp: Math.round(Math.pow(random(), 12) * 700) / 10 + 1
		});
	}
	return hotspots;
}

export const hotspots = buildHotspots(386);
