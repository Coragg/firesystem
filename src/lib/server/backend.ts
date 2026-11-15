import { env } from '$env/dynamic/private';

/**
 * URL base del backend FastAPI (`firesystem-backend`). Se lee en el servidor desde
 * `BACKEND_URL`; por defecto, el puerto que fija su `pyproject.toml`.
 */
export function backendUrl(path: string): URL {
	const base = env.BACKEND_URL || 'http://localhost:5000';
	return new URL(path, base.endsWith('/') ? base : `${base}/`);
}
