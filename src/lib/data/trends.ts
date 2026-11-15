/**
 * Datos de ejemplo de la pantalla Trends & reports, tomados del boceto de Penpot.
 * Son provisionales: se reemplazan por la API cuando exista, manteniendo los mismos tipos.
 */
import { formatDateRange, formatDecimal, formatNumber } from '#lib/format.ts';
import { m } from '#lib/paraglide/messages.js';
import type { CriticalPeriod, SensorSeries } from '#lib/types.ts';

/** Periodos del reporte (identificadores "AAAA-AAAA"). El texto sale de `periodLabel`. */
export const periods = ['2020-2024', '2015-2019', '2010-2014'];

export function periodLabel(id: string): string {
	return id.replace('-', ' – ');
}

/** Detecciones por año del periodo. Suman 118.420, con máximo en 2023, como el boceto. */
export const yearlyDetections = [
	{ year: 2020, count: 19480 },
	{ year: 2021, count: 20984 },
	{ year: 2022, count: 21860 },
	{ year: 2023, count: 31205 },
	{ year: 2024, count: 24891 }
];

/** Variación del promedio anual frente al periodo anterior (proporción). */
export const averageChange = 0.082;

/** Coincidencia entre sensores (proporción). */
export const sensorMatchRate = 0.874;

/** Promedio mensual de detecciones por sensor en el periodo. */
export const monthlyAverages: SensorSeries[] = [
	{ sensor: 'MODIS', values: [640, 990, 930, 790, 680, 540, 470, 490, 580, 710, 830, 1010] },
	{ sensor: 'VIIRS', values: [550, 850, 800, 700, 600, 500, 430, 450, 510, 620, 720, 880] }
];

const notable = [
	{ from: '2023-02-14', to: '2023-02-18', severity: 'critical', ratio: 6.2, count: 3814 },
	{ from: '2022-08-03', to: '2022-08-07', severity: 'elevated', ratio: 2.1, count: 927 },
	{ from: '2021-01-10', to: '2021-01-12', severity: 'elevated', ratio: 1.8, count: 614 }
] as const;

/** Periodos destacados, con textos en el idioma activo. */
export function notablePeriods(): CriticalPeriod[] {
	return notable.map((item) => ({
		id: item.from,
		from: item.from,
		to: item.to,
		range: formatDateRange(item.from, item.to),
		severity: item.severity,
		detail: m.critical_detail({ ratio: formatDecimal(item.ratio), count: formatNumber(item.count) })
	}));
}

/** Detecciones relativas por región (0 a 1). Los nombres de región son nombres propios. */
export const regionalShares = [
	{ region: 'Biobío', share: 0.86 },
	{ region: 'Araucanía', share: 0.68 },
	{ region: 'Maule', share: 0.54 },
	{ region: 'Ñuble', share: 0.39 },
	{ region: 'Los Ríos', share: 0.27 }
];
