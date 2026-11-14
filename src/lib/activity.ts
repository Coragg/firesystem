/** Cálculos sobre series de actividad diaria (patrones por mes y por día de la semana). */
import type { DailyActivity } from '#lib/types.ts';

export type SeasonalSummary = {
	total: number;
	/** Mes con más detecciones (0 = enero). */
	busiestMonth: { month: number; count: number; share: number };
	/** Día de la semana (0 = domingo) con más actividad en temporada alta y su razón con el día típico. */
	weekday: { day: number; ratio: number };
	/** Proporción de las detecciones del año que cae en temporada alta (0 a 1). */
	peakSeasonShare: number;
	/** Día con más detecciones. */
	peakDay: DailyActivity;
};

function median(values: number[]): number {
	if (!values.length) return 0;
	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/**
 * Resume una serie diaria. La temporada alta son los meses con más detecciones
 * que el promedio mensual.
 */
export function summarize(days: DailyActivity[]): SeasonalSummary {
	const total = days.reduce((sum, day) => sum + day.count, 0);
	const months = Array.from({ length: 12 }, () => 0);
	for (const day of days) months[new Date(day.date).getUTCMonth()] += day.count;

	const busiest = months.indexOf(Math.max(...months));
	const peakMonths = new Set(months.flatMap((count, month) => (count > total / 12 ? [month] : [])));
	const inSeason = days.filter((day) => peakMonths.has(new Date(day.date).getUTCMonth()));
	const seasonTotal = inSeason.reduce((sum, day) => sum + day.count, 0);

	// Se compara el día típico (mediana), para que un solo día extremo no decida el patrón.
	const byWeekday = Array.from({ length: 7 }, (): number[] => []);
	for (const day of inSeason) byWeekday[new Date(day.date).getUTCDay()].push(day.count);
	const typical = byWeekday.map(median);
	const topWeekday = typical.indexOf(Math.max(...typical));
	const seasonTypical = median(inSeason.map((day) => day.count));

	return {
		total,
		busiestMonth: { month: busiest, count: months[busiest], share: total ? months[busiest] / total : 0 },
		weekday: { day: topWeekday, ratio: seasonTypical ? typical[topWeekday] / seasonTypical : 0 },
		peakSeasonShare: total ? seasonTotal / total : 0,
		peakDay: days.reduce((top, day) => (day.count > top.count ? day : top), days[0])
	};
}
