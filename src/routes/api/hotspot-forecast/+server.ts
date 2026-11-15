import { json } from '@sveltejs/kit';
import { m } from '#lib/paraglide/messages.js';
import { backendUrl } from '#lib/server/backend.ts';
import type { RequestHandler } from './$types';

/** Parámetros que se reenvían al backend; el resto se descarta. */
const forwarded = ['date', 'lat', 'lon'] as const;

/**
 * Reenvía la consulta al pronóstico de focos del backend y devuelve su respuesta tal cual
 * (código HTTP y cuerpo `{success, data}` o `{detail}`).
 */
export const GET: RequestHandler = async ({ url, fetch }) => {
	const target = backendUrl('api/v1/hotspot/forecast');
	for (const name of forwarded) {
		const value = url.searchParams.get(name);
		if (value === null) return json({ detail: m.predict_error_missing_param({ name }) }, { status: 400 });
		target.searchParams.set(name, value);
	}

	let response: Response;
	try {
		response = await fetch(target, { headers: { accept: 'application/json' } });
	} catch {
		return json(
			{ detail: m.predict_error_backend_down() },
			{ status: 502 }
		);
	}

	const body: unknown = await response.json().catch(() => null);
	return json(body ?? { detail: m.predict_error_unexpected({ status: response.status }) }, {
		status: response.ok && body === null ? 502 : response.status
	});
};
