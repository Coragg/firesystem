<script lang="ts">
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Info from '@lucide/svelte/icons/info';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import X from '@lucide/svelte/icons/x';
	import type { Component } from 'svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { dismiss, toasts, type ToastTone } from '#lib/toast.svelte.ts';

	const tones: Record<ToastTone, { alert: string; icon: Component }> = {
		success: { alert: 'alert-success', icon: CircleCheck },
		info: { alert: 'alert-info', icon: Info },
		warning: { alert: 'alert-warning', icon: TriangleAlert },
		error: { alert: 'alert-error', icon: CircleAlert }
	};
</script>

<!-- Región viva: los lectores de pantalla anuncian cada aviso nuevo. -->
<div class="toast toast-end toast-bottom z-50" role="status" aria-live="polite">
	{#each toasts as toast (toast.id)}
		{@const tone = tones[toast.tone]}
		<div class={['alert alert-soft border-base-content/10 shadow-lg', tone.alert]}>
			<tone.icon class="size-5 shrink-0" aria-hidden="true" />
			<span class="text-body">{toast.message}</span>
			<button
				type="button"
				class="btn btn-square btn-ghost btn-xs"
				aria-label={m.toast_dismiss()}
				onclick={() => dismiss(toast.id)}
			>
				<X class="size-4" aria-hidden="true" />
			</button>
		</div>
	{/each}
</div>
