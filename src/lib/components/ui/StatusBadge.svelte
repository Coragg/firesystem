<script lang="ts" module>
	export type BadgeTone = 'error' | 'warning' | 'success' | 'info' | 'neutral';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		tone?: BadgeTone;
		/** `soft`: fondo tenue del color. `solid`: fondo oscuro para destacar sobre paneles. */
		variant?: 'soft' | 'solid';
		/** Punto de estado antes del texto. */
		dot?: boolean;
		children: Snippet;
	};

	let { tone = 'neutral', variant = 'soft', dot = false, children }: Props = $props();

	const softClass: Record<BadgeTone, string> = {
		error: 'badge-soft badge-error text-error-strong',
		warning: 'badge-soft badge-warning text-warning-strong',
		success: 'badge-soft badge-success text-success-strong',
		info: 'badge-soft badge-info text-info-strong',
		neutral: 'badge-ghost text-base-content/70'
	};

	const solidClass: Record<BadgeTone, string> = {
		error: 'badge-error',
		warning: 'badge-warning',
		success: 'badge-success',
		info: 'badge-info',
		neutral: 'badge-neutral text-accent'
	};

	const dotClass: Record<BadgeTone, string> = {
		error: 'status-error',
		warning: 'status-warning',
		success: 'status-success',
		info: 'status-info',
		neutral: 'status-neutral'
	};
</script>

<span
	class={[
		'badge badge-lg rounded-full text-overline-lg whitespace-nowrap uppercase 2xl:badge-xl',
		variant === 'solid' ? solidClass[tone] : softClass[tone]
	]}
>
	{#if dot}
		<span class={['status', dotClass[tone]]} aria-hidden="true"></span>
	{/if}
	{@render children()}
</span>
