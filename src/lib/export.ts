/** Descargas generadas en el navegador (CSV, GeoJSON) a partir de los datos en pantalla. */
import type { Detection } from '#lib/types.ts';

/** Descarga un texto como archivo. */
export function download(filename: string, content: string, type: string): void {
	const url = URL.createObjectURL(new Blob([content], { type }));
	const link = Object.assign(document.createElement('a'), { href: url, download: filename });
	link.click();
	URL.revokeObjectURL(url);
}

/** CSV con encabezado; los textos con comas, comillas o saltos de línea van entre comillas. */
export function toCsv(header: string[], rows: (string | number)[][]): string {
	const cell = (value: string | number) => {
		const text = String(value);
		return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
	};
	return [header, ...rows].map((row) => row.map(cell).join(',')).join('\n');
}

export function detectionsCsv(detections: Detection[]): string {
	return toCsv(
		['id', 'sensor', 'satellite', 'latitude', 'longitude', 'frp_mw', 'confidence', 'acquired_utc'],
		detections.map((d) => [
			d.id,
			d.sensor,
			d.satellite,
			d.lat.toFixed(5),
			d.lng.toFixed(5),
			d.frp,
			d.confidence,
			d.acquired
		])
	);
}

/** GeoJSON (RFC 7946): las coordenadas van en orden longitud, latitud. */
export function detectionsGeoJson(detections: Detection[]): string {
	return JSON.stringify({
		type: 'FeatureCollection',
		features: detections.map(({ lat, lng, ...properties }) => ({
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [Number(lng.toFixed(5)), Number(lat.toFixed(5))] },
			properties
		}))
	});
}
