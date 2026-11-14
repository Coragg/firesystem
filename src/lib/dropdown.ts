import type { Attachment } from 'svelte/attachments';

/**
 * Para desplegables hechos con `<details class="dropdown">`: se cierran al hacer clic
 * fuera o al pulsar Escape (en ese caso el foco vuelve al botón que lo abrió).
 */
export const dismissable: Attachment<HTMLDetailsElement> = (node) => {
	function onpointerdown(event: PointerEvent) {
		if (node.open && !node.contains(event.target as Node)) node.open = false;
	}
	function onkeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape' || !node.open) return;
		node.open = false;
		node.querySelector('summary')?.focus();
	}
	document.addEventListener('pointerdown', onpointerdown);
	node.addEventListener('keydown', onkeydown);
	return () => {
		document.removeEventListener('pointerdown', onpointerdown);
		node.removeEventListener('keydown', onkeydown);
	};
};
