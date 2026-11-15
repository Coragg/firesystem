<script lang="ts">
	import type { Component } from 'svelte';
	import { page } from '$app/state';
	import BrainCircuit from '@lucide/svelte/icons/brain-circuit';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import ChartNoAxesCombined from '@lucide/svelte/icons/chart-no-axes-combined';
	import Database from '@lucide/svelte/icons/database';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import MapPinned from '@lucide/svelte/icons/map-pinned';
	import { m } from '#lib/paraglide/messages.js';
	import BrandMark from './BrandMark.svelte';
	import UserMenu from './UserMenu.svelte';

	type NavItem = { label: string; href: string; icon: Component };
	type NavSection = { title: string; items: NavItem[] };

	type Props = {
		user: { initials: string; name: string; detail: string };
	};

	let { user }: Props = $props();

	const sections: NavSection[] = [
		{
			title: m.nav_workspace(),
			items: [
				{ label: m.nav_overview(), href: '/', icon: LayoutDashboard },
				{ label: m.nav_fire_map(), href: '/fire-map', icon: MapPinned },
				{ label: m.nav_activity_calendar(), href: '/activity-calendar', icon: CalendarDays },
				{ label: m.nav_trends(), href: '/trends', icon: ChartNoAxesCombined },
				{ label: m.nav_predictions(), href: '/predictions', icon: BrainCircuit }
			]
		},
		{
			title: m.nav_data(),
			items: [{ label: m.nav_data_sources(), href: '/data-sources', icon: Database }]
		}
	];
</script>

<aside class="flex min-h-full w-sidebar flex-col bg-base-300 text-base-content">
	<a href="/" class="flex items-center gap-3 border-b border-base-content/10 px-6 py-6 2xl:py-8">
		<BrandMark class="size-8 2xl:size-10" />
		<span class="flex flex-col">
			<span class="text-title-sm uppercase">Firewatch</span>
			<span class="text-overline whitespace-nowrap text-base-content/70 uppercase">
				{m.brand_tagline()}
			</span>
		</span>
	</a>

	<nav class="flex-1 overflow-y-auto px-3 py-4" aria-label={m.nav_main()}>
		{#each sections as section (section.title)}
			<ul class="menu w-full gap-1 p-0 pb-4 text-body-lg">
				<li class="menu-title px-3 text-overline text-base-content/70 uppercase">
					{section.title}
				</li>
				{#each section.items as item (item.href)}
					{@const active = page.url.pathname === item.href}
					<li>
						<a
							href={item.href}
							aria-current={active ? 'page' : undefined}
							class={['gap-3 px-3 py-3', active ? 'font-semibold' : 'text-base-content/70']}
						>
							<item.icon class={['size-5 shrink-0', active && 'text-secondary']} aria-hidden="true" />
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		{/each}
	</nav>

	<div class="mx-3 border-t border-base-content/10 py-4">
		<UserMenu {user} />
	</div>
</aside>
