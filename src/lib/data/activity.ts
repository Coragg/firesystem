/**
 * Series de actividad del año de ejemplo, compartidas por el Dashboard y Activity calendar.
 * Son provisionales: se reemplazan por la API cuando exista, manteniendo los mismos tipos.
 */
import type { DailyActivity, SensorSeries } from '#lib/types.ts';
import { seeded } from './common.ts';

/** Año al que corresponden los datos de ejemplo. */
export const dataYear = 2024;

/** Totales del boceto: los datos diarios se generan para que cuadren con ellos. */
export const yearTotal = 24891;
export const peakDay: DailyActivity = { date: '2024-02-14', count: 1284 };

/** Nombres de los meses en el idioma activo (enero a diciembre). */
export { monthNames } from '#lib/format.ts';

export const monthlyActivity: SensorSeries[] = [
	{ sensor: 'MODIS', values: [520, 1060, 790, 650, 570, 370, 290, 330, 460, 600, 700, 890] },
	{ sensor: 'VIIRS', values: [320, 850, 590, 490, 430, 270, 210, 260, 350, 450, 540, 670] }
];

function buildDailyActivity(year: number, total: number, peak: DailyActivity): DailyActivity[] {
	const random = seeded(year);
	const raw: { date: string; weight: number }[] = [];
	const cursor = new Date(Date.UTC(year, 0, 1));
	while (cursor.getUTCFullYear() === year) {
		// Temporada alta en el verano austral, con máximo en febrero y mínimo en invierno.
		const season = 0.5 + 0.5 * Math.cos(((cursor.getUTCMonth() - 1) / 12) * 2 * Math.PI);
		const spike = random() > 0.9 ? 2.5 : 1;
		// En temporada alta los viernes concentran más actividad.
		const friday = cursor.getUTCDay() === 5 && season > 0.6 ? 1.4 : 1;
		raw.push({
			date: cursor.toISOString().slice(0, 10),
			weight: (40 + 420 * season) * (0.3 + random()) * spike * friday
		});
		cursor.setUTCDate(cursor.getUTCDate() + 1);
	}

	// Se reparte el total del año entre los días, dejando fijo el día de máxima actividad.
	const others = raw.filter((day) => day.date !== peak.date);
	const scale = (total - peak.count) / others.reduce((sum, day) => sum + day.weight, 0);
	const days = raw.map((day) =>
		day.date === peak.date ? { ...peak } : { date: day.date, count: Math.round(day.weight * scale) }
	);
	// El redondeo deja una diferencia mínima: se ajusta en el primer día para cuadrar el total.
	days[0].count += total - days.reduce((sum, day) => sum + day.count, 0);
	return days;
}

export const dailyActivity = buildDailyActivity(dataYear, yearTotal, peakDay);
