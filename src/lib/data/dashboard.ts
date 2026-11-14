/**
 * Datos de ejemplo del Dashboard, tomados del boceto de Penpot.
 * Son provisionales: cuando el backend exponga estos datos, este módulo se reemplaza
 * por llamadas a la API manteniendo los mismos tipos, sin tocar los componentes.
 */
import type { CriticalPeriod, DailyActivity, Hotspot, Kpi, SensorSeries } from '#lib/types.ts';

export const currentUser = { initials: 'AM', name: 'Analyst Mode', detail: 'Pacific region' };

export const filterOptions = {
	years: [2024, 2023, 2022, 2021, 2020],
	areas: ['Chile · Biobío Region', 'Chile · Araucanía Region', 'Chile · Maule Region'],
	confidence: ['Confidence: nominal+', 'Confidence: high', 'Confidence: all']
};

export const region = {
	name: 'Biobío Region · Chile',
	center: [-37.45, -72.4] as [number, number],
	zoom: 8
};

export const lastUpdate = '12 min ago';

/** Año al que corresponden los datos de ejemplo. */
export const dataYear = 2024;

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

export const monthNames = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

export const monthlyActivity: SensorSeries[] = [
	{ sensor: 'MODIS', values: [520, 1060, 790, 650, 570, 370, 290, 330, 460, 600, 700, 890] },
	{ sensor: 'VIIRS', values: [320, 850, 590, 490, 430, 270, 210, 260, 350, 450, 540, 670] }
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

/** Generador pseudoaleatorio con semilla: los datos de ejemplo son siempre los mismos. */
function seeded(seed: number): () => number {
	let state = seed;
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function buildDailyActivity(year: number): DailyActivity[] {
	const random = seeded(year);
	const days: DailyActivity[] = [];
	const cursor = new Date(Date.UTC(year, 0, 1));
	while (cursor.getUTCFullYear() === year) {
		const month = cursor.getUTCMonth();
		// Temporada alta en el verano austral (dic–mar), mínima en invierno.
		const season = 0.5 + 0.5 * Math.cos((month / 12) * 2 * Math.PI);
		const spike = random() > 0.9 ? 2.5 : 1;
		const count = Math.round((40 + 420 * season) * (0.3 + random()) * spike);
		days.push({ date: cursor.toISOString().slice(0, 10), count });
		cursor.setUTCDate(cursor.getUTCDate() + 1);
	}
	return days;
}

function buildHotspots(total: number): Hotspot[] {
	const random = seeded(total);
	const clusters = [
		{ lat: -37.47, lng: -72.35, spread: 0.45, weight: 0.3 },
		{ lat: -37.0, lng: -72.6, spread: 0.4, weight: 0.2 },
		{ lat: -37.85, lng: -72.9, spread: 0.4, weight: 0.2 },
		{ lat: -37.35, lng: -71.7, spread: 0.5, weight: 0.15 },
		{ lat: -36.85, lng: -73.0, spread: 0.25, weight: 0.15 }
	];
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

export const dailyActivity = buildDailyActivity(dataYear);
export const hotspots = buildHotspots(386);
