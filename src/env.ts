import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	BACKEND_URL: {
		description: 'URL base del backend FastAPI (firesystem-backend). Solo se usa en el servidor.',
		schema: (value) => value || 'http://localhost:5000'
	}
});
