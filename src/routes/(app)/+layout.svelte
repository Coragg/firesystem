<script lang="ts">
	import Menu from '@lucide/svelte/icons/menu';
	import Sidebar from '#lib/components/layout/Sidebar.svelte';
	import { currentUser } from '#lib/data/dashboard.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div class="drawer lg:drawer-open">
	<input id="app-drawer" type="checkbox" class="drawer-toggle" />

	<div class="drawer-content flex min-h-dvh min-w-0 flex-col bg-base-200">
		<div class="navbar border-b border-base-content/10 bg-base-300 lg:hidden">
			<label for="app-drawer" class="btn btn-square btn-ghost" aria-label="Open menu">
				<Menu class="size-5" aria-hidden="true" />
			</label>
			<span class="px-2 text-title-sm uppercase">Firewatch</span>
		</div>

		<main class="w-full flex-1 px-gutter py-6 2xl:py-10">
			<div class="mx-auto flex max-w-app flex-col gap-4 2xl:gap-6">
				{@render children()}
			</div>
		</main>
	</div>

	<div class="drawer-side z-20">
		<label for="app-drawer" aria-label="Close menu" class="drawer-overlay"></label>
		<Sidebar user={currentUser} />
	</div>
</div>
