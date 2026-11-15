/**
 * Tema elegido por el usuario. Se guarda en una cookie para que el servidor pinte la
 * página ya con el tema correcto (sin parpadeo). Los nombres son los temas de daisyUI.
 */
import { themeVersion } from './theme-version.svelte.ts';

export const themes = ['firewatch-light', 'firewatch'] as const;
export type ThemeName = (typeof themes)[number];

export const themeCookie = 'FIREWATCH_THEME';
export const defaultTheme: ThemeName = 'firewatch-light';

export function isTheme(value: unknown): value is ThemeName {
	return themes.includes(value as ThemeName);
}

/** Aplica el tema en la página actual y lo recuerda un año. Solo en el navegador. */
export function applyTheme(theme: ThemeName): void {
	document.documentElement.dataset.theme = theme;
	document.cookie = `${themeCookie}=${theme}; path=/; max-age=31536000; samesite=lax`;
	themeVersion.value += 1;
}
