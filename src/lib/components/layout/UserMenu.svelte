<script lang="ts">
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import { onMount } from 'svelte';
	import { dismissable } from '#lib/dropdown.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, locales, setLocale, type Locale } from '#lib/paraglide/runtime.js';
	import { applyTheme, defaultTheme, isTheme, type ThemeName } from '#lib/theme-preference.ts';

	type Props = {
		user: { initials: string; name: string; detail: string };
	};

	let { user }: Props = $props();

	/** Cada idioma en su propio nombre, para que cada persona reconozca el suyo. */
	const localeNames: Record<Locale, string> = {
		es: 'Español',
		en: 'English',
		pt: 'Português',
		fr: 'Français',
		id: 'Bahasa Indonesia',
		ru: 'Русский'
	};

	const themeOptions: { id: ThemeName; label: string; icon: typeof Sun }[] = [
		{ id: 'firewatch-light', label: m.theme_light(), icon: Sun },
		{ id: 'firewatch', label: m.theme_dark(), icon: Moon }
	];

	let open = $state(false);
	const locale = getLocale();
	let theme = $state<ThemeName>(defaultTheme);

	// El tema activo lo fija el servidor en <html>; aquí solo se lee para marcar la opción.
	onMount(() => {
		const current = document.documentElement.dataset.theme;
		if (isTheme(current)) theme = current;
	});

	/** Cambiar el idioma recarga la página con los textos nuevos (y guarda la elección). */
	function chooseLocale(next: Locale) {
		if (next !== locale) setLocale(next);
	}

	function chooseTheme(next: ThemeName) {
		theme = next;
		applyTheme(next);
	}
</script>

<!-- Se abre hacia arriba: está al pie del menú lateral. -->
<details class="dropdown dropdown-top w-full" bind:open {@attach dismissable}>
	<summary
		class="flex cursor-pointer list-none items-center gap-3 rounded-field p-2 hover:bg-base-content/5"
		aria-label={m.user_menu_open()}
	>
		<span class="avatar avatar-placeholder">
			<span class="w-10 rounded-full bg-base-content/10">
				<span class="text-overline uppercase">{user.initials}</span>
			</span>
		</span>
		<span class="flex min-w-0 flex-1 flex-col">
			<span class="truncate text-body-lg">{user.name}</span>
			<span class="truncate text-caption text-base-content/70 italic">{user.detail}</span>
		</span>
		<ChevronsUpDown class="size-4 shrink-0 text-base-content/70" aria-hidden="true" />
	</summary>

	<div
		class="dropdown-content z-30 mb-2 flex w-full min-w-60 flex-col gap-3 rounded-box border border-base-content/10 bg-base-100 p-3 shadow-lg"
	>
		<fieldset class="flex flex-col gap-1">
			<legend class="mb-1 px-2 text-overline text-base-content/70 uppercase">
				{m.user_language()}
			</legend>
			{#each locales as option (option)}
				<input
					type="radio"
					name="locale"
					class="btn w-full btn-ghost btn-sm justify-start text-label checked:bg-primary/15 checked:text-base-content"
					aria-label={localeNames[option]}
					lang={option}
					value={option}
					checked={option === locale}
					onchange={() => chooseLocale(option)}
				/>
			{/each}
		</fieldset>

		<fieldset class="flex flex-col gap-1 border-t border-base-content/10 pt-3">
			<legend class="sr-only">{m.user_theme()}</legend>
			<span class="mb-1 px-2 text-overline text-base-content/70 uppercase" aria-hidden="true">
				{m.user_theme()}
			</span>
			<div class="join w-full">
				{#each themeOptions as option (option.id)}
					<label
						class={[
							'btn join-item btn-sm flex-1 btn-field text-label',
							theme === option.id && 'border-primary bg-primary/15'
						]}
					>
						<input
							type="radio"
							name="theme"
							class="theme-controller sr-only"
							value={option.id}
							checked={theme === option.id}
							onchange={() => chooseTheme(option.id)}
						/>
						<option.icon class="size-4" aria-hidden="true" />
						{option.label}
					</label>
				{/each}
			</div>
		</fieldset>
	</div>
</details>
