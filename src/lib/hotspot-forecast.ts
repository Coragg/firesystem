/**
 * Pronóstico de focos con el modelo XGBoost del backend (`GET /api/v1/hotspot/forecast`).
 * El navegador llama a `/api/hotspot-forecast` de esta app, que reenvía la consulta al backend
 * (ver `src/routes/api/hotspot-forecast/+server.ts`), así no hace falta CORS.
 */

/** Modelo que respondió: región de entrenamiento, meses y variables de entrada. */
export type HotspotModelInfo = {
	region: string;
	/** Primer y último mes (`AAAA-MM`) de las filas de entrenamiento. */
	trained_months: string[];
	features: string[];
};

export type HotspotForecast = {
	/** Mes pronosticado (`AAAA-MM`). */
	month: string;
	lat: number;
	lon: number;
	/** Centro del píxel de 500 m usado por el modelo. */
	pixel_lat: number;
	pixel_lon: number;
	/** Probabilidad estimada de al menos un foco FIRMS en el píxel durante el mes. */
	hotspot_probability: number;
	/** Salida cruda del modelo en la escala de muestreo: sirve solo para ordenar. */
	hotspot_score: number;
	/** Valores de las variables que recibió el modelo (`null` si faltan). */
	features: Record<string, number | null>;
	model: HotspotModelInfo;
};

export type ForecastQuery = {
	/** Mes a pronosticar (`AAAA-MM`). */
	month: string;
	lat: number;
	lon: number;
};

/**
 * Región en la que se entrenó el modelo (Maule). Límites tomados de `metadata.json` del
 * backend: fuera de ellos la API responde 422.
 */
export const forecastRegion = {
	name: 'Maule',
	/** [[sur, oeste], [norte, este]] */
	bounds: [
		[-36.55, -72.79],
		[-34.68, -70.31]
	] as [[number, number], [number, number]],
	center: [-35.55, -71.6] as [number, number],
	zoom: 8
};

export function insideRegion(lat: number, lon: number): boolean {
	const [[south, west], [north, east]] = forecastRegion.bounds;
	return lat >= south && lat <= north && lon >= west && lon <= east;
}

/** Error de la API con su código HTTP y el mensaje que se muestra al usuario. */
export class ForecastError extends Error {
	constructor(
		message: string,
		readonly status: number
	) {
		super(message);
	}
}

/**
 * Mensaje legible de un error de FastAPI: `detail` es texto en los `HTTPException` y una lista
 * de `{loc, msg}` en los errores de validación.
 */
export function errorDetail(body: unknown, status: number): string {
	const detail = (body as { detail?: unknown } | null)?.detail;
	if (typeof detail === 'string' && detail) return detail;
	if (Array.isArray(detail) && detail.length) {
		return detail
			.map((item: { loc?: unknown[]; msg?: string }) => {
				const field = item.loc?.at(-1);
				return field ? `${field}: ${item.msg}` : (item.msg ?? '');
			})
			.filter(Boolean)
			.join('; ');
	}
	if (status === 503) return 'The prediction model is not available on the server.';
	if (status === 502) return 'The backend could not reach one of its data sources.';
	return `The prediction request failed (HTTP ${status}).`;
}

/** Fecha que espera el backend: cualquier día del mes, se usa el primero. */
export function forecastParams({ month, lat, lon }: ForecastQuery): URLSearchParams {
	return new URLSearchParams({ date: `${month}-01`, lat: String(lat), lon: String(lon) });
}

/** Corre el modelo para un píxel y un mes. Lanza `ForecastError` si la API responde con error. */
export async function fetchHotspotForecast(
	query: ForecastQuery,
	options: { fetch?: typeof fetch; signal?: AbortSignal } = {}
): Promise<HotspotForecast> {
	const request = options.fetch ?? fetch;
	const response = await request(`/api/hotspot-forecast?${forecastParams(query)}`, {
		signal: options.signal
	});
	const body: unknown = await response.json().catch(() => null);
	if (!response.ok) throw new ForecastError(errorDetail(body, response.status), response.status);
	const data = (body as { data?: HotspotForecast } | null)?.data;
	if (!data) throw new ForecastError('The backend returned an empty forecast.', response.status);
	return data;
}
