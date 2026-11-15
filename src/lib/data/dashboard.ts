/**
 * Datos de ejemplo del Overview. Son provisionales: se generan de forma determinista por
 * área, sensor y día para que los filtros tengan efecto visible. Cuando el backend exista,
 * `buildOverview` se reemplaza por llamadas a la API manteniendo los mismos tipos.
 */
import {
	formatDate,
	formatDateRange,
	formatDecimal,
	formatNumber,
	formatPercent
} from '#lib/format.ts';
import { m } from '#lib/paraglide/messages.js';
import type { Sensor } from '#lib/sensors.ts';
import type {
	Confidence,
	CriticalPeriod,
	DailyActivity,
	Detection,
	Kpi,
	SensorSeries
} from '#lib/types.ts';
import { regions, seeded, type AreaId, type Region } from './common.ts';

/** Primer día con datos. El último es hoy (UTC). */
export const firstDataDay = '2020-01-01';
export const today = new Date().toISOString().slice(0, 10);

/** Total anual de Biobío en el boceto: referencia para la escala del resto. */
const baseYearTotal = 24891;
/** Reparto de detecciones entre sensores (proporción del boceto: VIIRS ve menos en esta zona). */
const sensorShare: Record<Sensor, number> = { MODIS: 0.57, VIIRS: 0.43 };
/** Parte de las detecciones en cada nivel de confianza. */
const confidenceShare: Record<Confidence, number> = { low: 0.15, nominal: 0.6, high: 0.25 };
/**
 * Un día cuenta como "activo" si supera en esta proporción el promedio diario del año
 * (con los mismos filtros). Al ser relativo, funciona con uno o dos sensores y cualquier confianza.
 */
const activeDayFactor = 1.2;
/** Semanas por sobre esta proporción de la mediana anual son periodos inusuales. */
const elevatedRatio = 1.6;
const criticalRatio = 2.5;

const satellites: Record<Sensor, string[]> = {
	MODIS: ['MODIS Terra', 'MODIS Aqua'],
	VIIRS: ['VIIRS S-NPP', 'VIIRS NOAA-20']
};

/* ---------------------------------------------------------------- Fechas */

const dayMs = 86_400_000;

export function addDays(iso: string, days: number): string {
	return new Date(Date.parse(iso) + days * dayMs).toISOString().slice(0, 10);
}

/** Días entre dos fechas ISO, ambas incluidas. */
export function daysBetween(from: string, to: string): number {
	return Math.round((Date.parse(to) - Date.parse(from)) / dayMs) + 1;
}

function dayOfYear(iso: string): number {
	return Math.round((Date.parse(iso) - Date.UTC(Number(iso.slice(0, 4)), 0, 1)) / dayMs);
}

/* ---------------------------------------------------------------- Generación */

/** Semilla estable a partir de un texto (FNV-1a). */
function hash(text: string): number {
	let h = 2166136261;
	for (const char of text) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
	return h >>> 0;
}

type YearData = {
	/** Peso de cada día del año (forma de la temporada, compartida por ambos sensores). */
	shape: number[];
	/** Detecciones por día y sensor, todas las confianzas. */
	counts: Record<Sensor, number[]>;
	/** Muestra de detecciones individuales para el mapa. */
	sample: Detection[];
};

const yearCache = new Map<string, YearData>();

function yearData(area: AreaId, year: number): YearData {
	const key = `${area}:${year}`;
	const cached = yearCache.get(key);
	if (cached) return cached;

	const region = regions[area];
	const random = seeded(hash(key));
	const total = baseYearTotal * region.activity * (0.8 + random() * 0.4);

	// Forma de la temporada: alta en el verano austral (máximo en febrero), baja en invierno.
	const shape: number[] = [];
	const cursor = new Date(Date.UTC(year, 0, 1));
	while (cursor.getUTCFullYear() === year) {
		const season = 0.5 + 0.5 * Math.cos(((cursor.getUTCMonth() - 1) / 12) * 2 * Math.PI);
		const spike = random() > 0.9 ? 2.5 : 1;
		const friday = cursor.getUTCDay() === 5 && season > 0.6 ? 1.4 : 1;
		shape.push((40 + 420 * season) * (0.3 + random()) * spike * friday);
		cursor.setUTCDate(cursor.getUTCDate() + 1);
	}

	// Cada sensor sigue la misma temporada con su propio ruido diario.
	const counts = {} as Record<Sensor, number[]>;
	for (const sensor of Object.keys(sensorShare) as Sensor[]) {
		const noise = seeded(hash(`${key}:${sensor}`));
		const weights = shape.map((weight) => weight * (0.7 + noise() * 0.6));
		const scale = (total * sensorShare[sensor]) / weights.reduce((sum, w) => sum + w, 0);
		counts[sensor] = weights.map((weight) => Math.round(weight * scale));
	}

	const data = { shape, counts, sample: buildSample(region, year, shape, random) };
	yearCache.set(key, data);
	return data;
}

/** Unas 400 detecciones por año en Biobío, repartidas según la temporada. */
function buildSample(region: Region, year: number, shape: number[], random: () => number) {
	const size = Math.round(400 * region.activity);
	const cumulative: number[] = [];
	shape.reduce((sum, weight, index) => (cumulative[index] = sum + weight), 0);
	const totalWeight = cumulative[cumulative.length - 1];
	const start = Date.UTC(year, 0, 1);

	const sample: Detection[] = [];
	for (let index = 0; index < size; index++) {
		const target = random() * totalWeight;
		const day = cumulative.findIndex((sum) => sum >= target);
		let pick = random();
		const cluster = region.clusters.find((c) => (pick -= c.weight) <= 0) ?? region.clusters[0];
		// La suma de dos aleatorios concentra los puntos hacia el centro del cúmulo.
		const offset = () => (random() + random() - 1) * cluster.spread;
		const sensor: Sensor = random() < sensorShare.MODIS ? 'MODIS' : 'VIIRS';
		const level = random();
		sample.push({
			id: year * 10_000 + index,
			lat: cluster.lat + offset(),
			lng: cluster.lng + offset() * 1.3,
			sensor,
			satellite: satellites[sensor][random() > 0.5 ? 1 : 0],
			// La mayoría son de baja potencia; pocas detecciones superan los 20 MW.
			frp: Math.round(Math.pow(random(), 10) * 700) / 10 + 1,
			confidence: level < confidenceShare.low ? 'low' : level < 0.75 ? 'nominal' : 'high',
			acquired: new Date(start + day * dayMs + Math.floor(random() * dayMs)).toISOString()
		});
	}
	return sample;
}

/* ---------------------------------------------------------------- Consultas */

export type OverviewQuery = {
	area: AreaId;
	/** Fechas ISO, ambas incluidas. */
	from: string;
	to: string;
	sensors: Sensor[];
	confidence: Confidence[];
};

/** Detecciones diarias de un sensor en el rango, filtradas por confianza. */
function dailyCounts(query: OverviewQuery, sensor: Sensor, from = query.from, to = query.to) {
	const share = query.confidence.reduce((sum, level) => sum + confidenceShare[level], 0);
	const days: DailyActivity[] = [];
	for (let date = from; date <= to; date = addDays(date, 1)) {
		const counts = yearData(query.area, Number(date.slice(0, 4))).counts[sensor];
		days.push({ date, count: Math.round(counts[dayOfYear(date)] * share) });
	}
	return days;
}

/** Suma día a día de los sensores seleccionados. */
function combined(query: OverviewQuery, from = query.from, to = query.to): DailyActivity[] {
	const series = query.sensors.map((sensor) => dailyCounts(query, sensor, from, to));
	return series[0].map((day, index) => ({
		date: day.date,
		count: series.reduce((sum, days) => sum + days[index].count, 0)
	}));
}

const sum = (days: DailyActivity[]) => days.reduce((total, day) => total + day.count, 0);

/** Correlación de Pearson entre dos series del mismo largo. */
function correlation(a: number[], b: number[]): number {
	const mean = (values: number[]) => values.reduce((s, v) => s + v, 0) / values.length;
	const [ma, mb] = [mean(a), mean(b)];
	let [cov, va, vb] = [0, 0, 0];
	for (let i = 0; i < a.length; i++) {
		cov += (a[i] - ma) * (b[i] - mb);
		va += (a[i] - ma) ** 2;
		vb += (b[i] - mb) ** 2;
	}
	return va && vb ? cov / Math.sqrt(va * vb) : 0;
}

/* ---------------------------------------------------------------- Formato */

function spansYears(query: OverviewQuery): boolean {
	return query.from.slice(0, 4) !== query.to.slice(0, 4);
}

/* ---------------------------------------------------------------- Overview */

/** Rangos de hasta este largo (días) admiten la vista semanal del gráfico. */
export const weeklyMaxDays = 183;

export type ActivitySeries = {
	/** Nombre completo de cada barra (tooltip). */
	names: string[];
	/** Etiqueta corta de cada barra (eje). */
	labels?: string[];
	series: SensorSeries[];
};

export type Overview = {
	region: Region;
	kpis: Kpi[];
	/** Detecciones diarias de los sensores seleccionados. */
	daily: DailyActivity[];
	monthly: ActivitySeries;
	/** Solo en rangos de hasta `weeklyMaxDays` días. */
	weekly?: ActivitySeries;
	critical: CriticalPeriod[];
	watch: { label: string; value: string };
	hotspots: Detection[];
};

export function buildOverview(query: OverviewQuery): Overview {
	const region = regions[query.area];
	const length = daysBetween(query.from, query.to);
	const daily = combined(query);
	const previous = combined(query, addDays(query.from, -length), addDays(query.from, -1));

	return {
		region,
		kpis: buildKpis(query, daily, previous),
		daily,
		monthly: buildMonthly(query),
		weekly: length <= weeklyMaxDays ? buildWeekly(query) : undefined,
		critical: buildCritical(query, daily),
		watch: buildWatch(query),
		hotspots: buildHotspots(query)
	};
}

/**
 * Regla de color de las tendencias: más fuego es malo (error), menos es bueno (success),
 * en todos los indicadores.
 */
function trend(change: number): Pick<Kpi, 'tone' | 'trend'> {
	return change >= 0 ? { tone: 'error', trend: 'up' } : { tone: 'success', trend: 'down' };
}

function buildKpis(query: OverviewQuery, daily: DailyActivity[], previous: DailyActivity[]): Kpi[] {
	const total = sum(daily);
	const change = (total - sum(previous)) / Math.max(1, sum(previous));
	const year = query.from.slice(0, 4);
	const yearDays = combined(query, `${year}-01-01`, `${year}-12-31`);
	const threshold = (activeDayFactor * sum(yearDays)) / yearDays.length;
	const active = daily.filter((day) => day.count >= threshold).length;
	const activeChange = active - previous.filter((day) => day.count >= threshold).length;
	const peak = daily.reduce((top, day) => (day.count > top.count ? day : top), daily[0]);

	const both = query.sensors.length === 2;
	const agreement = both
		? correlation(
				dailyCounts(query, 'MODIS').map((day) => day.count),
				dailyCounts(query, 'VIIRS').map((day) => day.count)
			)
		: 0;

	return [
		{
			label: m.kpi_detections_period(),
			value: formatNumber(total),
			highlight: formatPercent(Math.abs(change), 1),
			...trend(change),
			note: m.kpi_vs_previous_period()
		},
		{
			label: m.kpi_active_days(),
			value: formatNumber(active),
			highlight:
				Math.abs(activeChange) === 1
					? m.kpi_day_one()
					: m.kpi_days({ count: formatNumber(Math.abs(activeChange)) }),
			...trend(activeChange),
			note: m.kpi_vs_previous_period()
		},
		{
			label: m.kpi_peak_activity(),
			// Con un rango de varios años, la fecha lleva el año para no ser ambigua.
			value: formatDate(peak.date, spansYears(query) ? 'dayYear' : 'day'),
			highlight: m.kpi_hotspots({ count: formatNumber(peak.count) }),
			tone: 'warning',
			note: m.kpi_busiest_day()
		},
		both
			? {
					label: m.kpi_sensor_agreement(),
					value: formatPercent(agreement, 1),
					highlight:
						agreement >= 0.85
							? m.agreement_high()
							: agreement >= 0.7
								? m.agreement_moderate()
								: m.agreement_low(),
					tone: agreement >= 0.85 ? 'secondary' : 'warning',
					note: m.kpi_between_sensors()
				}
			: {
					label: m.kpi_sensor_agreement(),
					value: '—',
					highlight: m.agreement_needs_both(),
					tone: 'neutral',
					note: m.agreement_turn_on_both()
				}
	];
}

/** Totales por mes y sensor dentro del rango. */
function buildMonthly(query: OverviewQuery): ActivitySeries {
	const keys: string[] = [];
	const series = query.sensors.map((sensor) => {
		const totals = new Map<string, number>();
		for (const day of dailyCounts(query, sensor)) {
			const key = day.date.slice(0, 7);
			totals.set(key, (totals.get(key) ?? 0) + day.count);
		}
		if (!keys.length) keys.push(...totals.keys());
		return { sensor, values: keys.map((key) => totals.get(key) ?? 0) };
	});
	const style = spansYears(query) ? 'monthYear' : 'month';
	return { names: keys.map((key) => formatDate(`${key}-01`, style)), series };
}

/** Totales por semana (bloques de 7 días desde el inicio del rango) y sensor. */
function buildWeekly(query: OverviewQuery): ActivitySeries {
	const starts: string[] = [];
	for (let date = query.from; date <= query.to; date = addDays(date, 7)) starts.push(date);
	const series = query.sensors.map((sensor) => {
		const days = dailyCounts(query, sensor);
		return {
			sensor,
			values: starts.map((_, index) => sum(days.slice(index * 7, index * 7 + 7)))
		};
	});
	const withYear = spansYears(query);
	return {
		names: starts.map((start) => {
			const end = addDays(start, 6) < query.to ? addDays(start, 6) : query.to;
			return formatDateRange(start, end, withYear);
		}),
		labels: starts.map((start) => formatDate(start, 'day')),
		series
	};
}

/** Mediana de las semanas del año: la "semana típica" contra la que se compara. */
function weeklyBaseline(query: OverviewQuery, year: string): number {
	const yearDays = combined(query, `${year}-01-01`, `${year}-12-31`);
	const weeks: number[] = [];
	for (let i = 0; i + 7 <= yearDays.length; i += 7) weeks.push(sum(yearDays.slice(i, i + 7)));
	weeks.sort((a, b) => a - b);
	return Math.max(1, weeks[Math.floor(weeks.length / 2)]);
}

/**
 * Semanas del rango muy por encima de la semana típica (mediana) del año en que empieza.
 * Se muestran hasta tres, de la más a la menos intensa.
 */
function buildCritical(query: OverviewQuery, daily: DailyActivity[]): CriticalPeriod[] {
	const baseline = weeklyBaseline(query, query.from.slice(0, 4));
	const withYear = spansYears(query);
	const weeks: (CriticalPeriod & { ratio: number })[] = [];
	for (let i = 0; i + 7 <= daily.length; i += 7) {
		const week = daily.slice(i, i + 7);
		const count = sum(week);
		const ratio = count / baseline;
		if (ratio < elevatedRatio) continue;
		weeks.push({
			id: week[0].date,
			from: week[0].date,
			to: week[6].date,
			range: formatDateRange(week[0].date, week[6].date, withYear),
			severity: ratio >= criticalRatio ? 'critical' : 'elevated',
			detail: m.critical_detail({ ratio: formatDecimal(ratio), count: formatNumber(count) }),
			ratio
		});
	}
	return weeks
		.sort((a, b) => b.ratio - a.ratio)
		.slice(0, 3)
		.map(({ ratio: _, ...period }) => period);
}

/**
 * Ventana de vigilancia sugerida: de las cuatro semanas que siguen al rango, la que tuvo más
 * actividad el año anterior en las mismas fechas (análogo estacional).
 */
function buildWatch(query: OverviewQuery): Overview['watch'] {
	const start = addDays(query.to, 1);
	const lastYear = (iso: string) => `${Number(iso.slice(0, 4)) - 1}${iso.slice(4)}`;
	let best = { from: start, count: -1 };
	for (let week = 0; week < 4; week++) {
		const from = addDays(start, week * 7);
		const count = sum(combined(query, lastYear(from), lastYear(addDays(from, 6))));
		if (count > best.count) best = { from, count };
	}
	const ratio = best.count / weeklyBaseline(query, lastYear(best.from).slice(0, 4));
	const range = formatDateRange(best.from, addDays(best.from, 6), spansYears(query));
	return {
		label: m.watch_label(),
		value: ratio >= elevatedRatio ? m.watch_elevated({ range }) : m.watch_normal({ range })
	};
}

/** Muestra de detecciones del rango para el mapa, filtrada por sensor y confianza. */
function buildHotspots(query: OverviewQuery): Detection[] {
	const hotspots: Detection[] = [];
	for (let year = Number(query.from.slice(0, 4)); year <= Number(query.to.slice(0, 4)); year++) {
		for (const detection of yearData(query.area, year).sample) {
			const date = detection.acquired.slice(0, 10);
			if (
				date >= query.from &&
				date <= query.to &&
				query.sensors.includes(detection.sensor) &&
				query.confidence.includes(detection.confidence)
			) {
				hotspots.push(detection);
			}
		}
	}
	return hotspots;
}

/** Filas diarias por sensor, para exportar. */
export function dailyBySensor(query: OverviewQuery): { date: string; counts: number[] }[] {
	const series = query.sensors.map((sensor) => dailyCounts(query, sensor));
	return series[0].map((day, index) => ({
		date: day.date,
		counts: series.map((days) => days[index].count)
	}));
}
