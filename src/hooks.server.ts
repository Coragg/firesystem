import type { Handle } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '#lib/paraglide/server.js';
import { defaultTheme, isTheme, themeCookie } from '#lib/theme-preference.ts';

/**
 * Cada solicitud se resuelve con su idioma (cookie, idioma del navegador o español) y su
 * tema (cookie). Ambos se escriben en `<html>` antes de enviar la página.
 */
export const handle: Handle = ({ event, resolve }) =>
	// Sin estrategia de URL, Paraglide no reescribe la solicitud: solo se usa el idioma.
	paraglideMiddleware(event.request, ({ locale }) => {
		const saved = event.cookies.get(themeCookie);
		const theme = isTheme(saved) ? saved : defaultTheme;
		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html.replace('%paraglide.lang%', locale).replace('%app.theme%', theme)
		});
	});
