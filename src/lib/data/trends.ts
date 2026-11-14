/**
 * Datos de ejemplo de la pantalla Trends & reports, tomados del boceto de Penpot.
 * Son provisionales: se reemplazan por la API cuando exista, manteniendo los mismos tipos.
 */
import type { CriticalPeriod, SensorSeries } from '#lib/types.ts';

export const periods = ['2020 — 2024', '2015 — 2019', '2010 — 2014'];

/** Detecciones por año del periodo. Suman 118.420, con máximo en 2023, como el boceto. */
export const yearlyDetections = [
	{ year: 2020, count: 19480 },
	{ year: 2021, count: 20984 },
	{ year: 2022, count: 21860 },
	{ year: 2023, count: 31205 },
	{ year: 2024, count: 24891 }
];

/** Variación del promedio anual frente al periodo anterior. */
export const averageChange = { value: '8.2%', trend: 'up' as const };

export const sensorMatchRate = '87.4%';

/** Promedio mensual de detecciones por sensor en el periodo. */
export const monthlyAverages: SensorSeries[] = [
	{ sensor: 'MODIS', values: [640, 990, 930, 790, 680, 540, 470, 490, 580, 710, 830, 1010] },
	{ sensor: 'VIIRS', values: [550, 850, 800, 700, 600, 500, 430, 450, 510, 620, 720, 880] }
];

export const notablePeriods: CriticalPeriod[] = [
	{
		id: '2023-02-14',
		range: 'Feb 14–18, 2023',
		severity: 'critical',
		detail: '6.2× seasonal baseline, 3,814 detections'
	},
	{
		id: '2022-08-03',
		range: 'Aug 03–07, 2022',
		severity: 'elevated',
		detail: '2.1× seasonal baseline, 927 detections'
	},
	{
		id: '2021-01-10',
		range: 'Jan 10–12, 2021',
		severity: 'elevated',
		detail: '1.8× seasonal baseline, 614 detections'
	}
];

/** Detecciones relativas por región (0 a 1). */
export const regionalShares = [
	{ region: 'Biobío', share: 0.86 },
	{ region: 'Araucanía', share: 0.68 },
	{ region: 'Maule', share: 0.54 },
	{ region: 'Ñuble', share: 0.39 },
	{ region: 'Los Ríos', share: 0.27 }
];
