/**
 * Datos de ejemplo de la pantalla Activity calendar, tomados del boceto de Penpot.
 * Son provisionales: se reemplazan por la API cuando exista, manteniendo los mismos tipos.
 * Los textos se arman al llamar a cada función, en el idioma de la solicitud.
 */
import { formatDate, formatNumber, formatPercent } from '#lib/format.ts';
import { m } from '#lib/paraglide/messages.js';
import type { Kpi } from '#lib/types.ts';
import { dataYear } from './activity.ts';

export function kpis(): Kpi[] {
	return [
		{
			label: m.kpi_detections_in_year({ year: dataYear }),
			value: formatNumber(24891),
			highlight: formatPercent(0.186, 1),
			tone: 'error',
			trend: 'up',
			note: m.kpi_vs_previous_year()
		},
		{
			label: m.kpi_active_days(),
			value: formatNumber(137),
			note: m.kpi_across_region()
		},
		{
			label: m.kpi_peak_activity(),
			value: formatDate('2024-02-14', 'day'),
			highlight: m.detections_count({ count: formatNumber(1284) }),
			tone: 'warning',
			note: m.kpi_busiest_day()
		},
		{
			label: m.kpi_sensor_agreement(),
			value: formatPercent(0.874, 1),
			highlight: m.agreement_high(),
			tone: 'success',
			note: m.kpi_sensor_overlap()
		}
	];
}

export function heatmapInsight(): string {
	return m.calendar_insight();
}

export function watchWindow(): { label: string; value: string } {
	return { label: m.watch_next_label(), value: m.watch_next_value() };
}
