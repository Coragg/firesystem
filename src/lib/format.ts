/**
 * Formato de números y fechas según el idioma activo. Única fuente para toda la app: ningún
 * componente crea su propio `Intl.*` con un idioma fijo.
 *
 * Las fechas de los datos son días ISO (`AAAA-MM-DD`) o instantes UTC, y se muestran en UTC
 * para que un día no cambie según la zona horaria de quien mira.
 */
import { getLocale } from '#lib/paraglide/runtime.js';

const cache = new Map<string, unknown>();

/** Crea (o reutiliza) un formateador por idioma y opciones. */
function cached<T>(kind: string, options: object, create: (locale: string) => T): T {
	const locale = getLocale();
	const key = `${kind}|${locale}|${JSON.stringify(options)}`;
	let formatter = cache.get(key) as T | undefined;
	if (!formatter) {
		formatter = create(locale);
		cache.set(key, formatter);
	}
	return formatter;
}

function dateFormat(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
	const withZone = { timeZone: 'UTC', ...options };
	return cached('date', withZone, (locale) => new Intl.DateTimeFormat(locale, withZone));
}

function toDate(value: string | Date): Date {
	return typeof value === 'string' ? new Date(value) : value;
}

/* ---------------------------------------------------------------- Números */

export function formatNumber(value: number, options: Intl.NumberFormatOptions = {}): string {
	return cached('number', options, (locale) => new Intl.NumberFormat(locale, options)).format(value);
}

/** Proporción de 0 a 1 como porcentaje ("87,4 %" en español). */
export function formatPercent(share: number, digits = 0): string {
	return formatNumber(share, {
		style: 'percent',
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	});
}

/** Número con decimales fijos (por ejemplo la potencia en MW). */
export function formatDecimal(value: number, digits = 1): string {
	return formatNumber(value, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/* ---------------------------------------------------------------- Fechas */

/**
 * Estilos de fecha de la app:
 *  - `day`: "14 feb" · `dayYear`: "14 feb 2024"
 *  - `month`: "febrero" · `monthShort`: "feb" · `monthYear`: "febrero de 2024"
 *  - `time`: "18:42" (24 h)
 */
const dateStyles = {
	day: { month: 'short', day: 'numeric' },
	dayYear: { month: 'short', day: 'numeric', year: 'numeric' },
	month: { month: 'long' },
	monthShort: { month: 'short' },
	monthYear: { month: 'long', year: 'numeric' },
	time: { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export type DateStyle = keyof typeof dateStyles;

export function formatDate(value: string | Date, style: DateStyle = 'dayYear'): string {
	return dateFormat(dateStyles[style]).format(toDate(value));
}

/**
 * Rango de fechas con el formato del idioma, sin repetir mes ni año cuando coinciden:
 * "1 ene – 31 dic 2024", "12–18 feb 2024". `withYear: false` lo omite ("12–18 feb").
 */
export function formatDateRange(from: string, to: string, withYear = true): string {
	const style = withYear ? dateStyles.dayYear : dateStyles.day;
	return dateFormat(style).formatRange(toDate(from), toDate(to));
}

/** Rango de meses: "ene–dic 2024". */
export function formatMonthRange(from: string, to: string): string {
	return dateFormat({ month: 'short', year: 'numeric' }).formatRange(toDate(from), toDate(to));
}

/** Nombres de los 12 meses, de enero a diciembre. */
export function monthNames(style: 'long' | 'short' = 'long'): string[] {
	const format = dateFormat({ month: style });
	return Array.from({ length: 12 }, (_, month) => format.format(new Date(Date.UTC(2024, month, 1))));
}

/** Días de la semana de lunes a domingo (`narrow`: "L", "M"…; `long`: "lunes"…). */
export function weekdayNames(style: 'narrow' | 'long' = 'narrow'): string[] {
	const format = dateFormat({ weekday: style });
	// 1 de enero de 2024 fue lunes.
	return Array.from({ length: 7 }, (_, day) => format.format(new Date(Date.UTC(2024, 0, 1 + day))));
}

/** Nombre del día de la semana con 0 = domingo (como `Date#getUTCDay`). */
export function weekdayName(day: number): string {
	return weekdayNames('long')[(day + 6) % 7];
}

/** Tiempo relativo: "hace 12 minutos". */
export function formatMinutesAgo(minutes: number): string {
	return cached(
		'relative',
		{},
		(locale) => new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
	).format(-minutes, 'minute');
}
