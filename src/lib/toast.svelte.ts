/**
 * Avisos breves de la app (exportaciones, ubicación, errores). Cualquier componente llama
 * a `notify` y el `Toaster` del layout los muestra en la esquina inferior.
 */
export type ToastTone = 'success' | 'info' | 'warning' | 'error';

export type Toast = { id: number; message: string; tone: ToastTone };

/** Avisos visibles, del más antiguo al más reciente. */
export const toasts = $state<Toast[]>([]);

let nextId = 0;

export function notify(message: string, tone: ToastTone = 'info', duration = 4000): void {
	const id = nextId++;
	toasts.push({ id, message, tone });
	setTimeout(() => dismiss(id), duration);
}

export function dismiss(id: number): void {
	const index = toasts.findIndex((toast) => toast.id === id);
	if (index >= 0) toasts.splice(index, 1);
}
