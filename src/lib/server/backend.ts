import { BACKEND_URL } from '$app/env/private';

/**
 * URL base del backend FastAPI (`firesystem-backend`). Se lee en el servidor desde
 * `BACKEND_URL` (declarada en `src/env.ts`); por defecto, el puerto que fija su `pyproject.toml`.
 */
export function backendUrl(path: string): URL {
	const base = BACKEND_URL;
	return new URL(path, base.endsWith('/') ? base : `${base}/`);
}
