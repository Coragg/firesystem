<script lang="ts" module>
	/**
	 * Cómo se colorean los puntos:
	 *  - `combined`: color del sensor, salvo las detecciones intensas, que toman el de su potencia.
	 *  - `frp`: todas por nivel de potencia radiativa.
	 *  - `sensor`: todas por sensor.
	 */
	export type MapColorMode = 'combined' | 'frp' | 'sensor';
</script>

<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import House from '@lucide/svelte/icons/house';
	import LocateFixed from '@lucide/svelte/icons/locate-fixed';
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';
	import type { ErrorEvent, LayerGroup, Map as LeafletMap, LocationEvent } from 'leaflet';
	import { untrack, type Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import type { ClassValue } from 'svelte/elements';
	import { formatDecimal } from '#lib/format.ts';
	import { frpLevel, frpLevels } from '#lib/frp.ts';
	import { basemap } from '#lib/map/basemap.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { sensors } from '#lib/sensors.ts';
	import { cssVar, spacingUnit } from '#lib/theme.ts';
	import { themeVersion } from '#lib/theme-version.svelte.ts';
	import { notify } from '#lib/toast.svelte.ts';
	import type { Hotspot } from '#lib/types.ts';

	type Leaflet = typeof import('leaflet');

	type Props = {
		hotspots: Hotspot[];
		center: [number, number];
		zoom: number;
		/** Descripción del mapa para lectores de pantalla. */
		label: string;
		colorMode?: MapColorMode;
		/**
		 * Variante completa: controles propios (zoom, vista inicial y "mi ubicación") a la derecha y barra de
		 * escala. Sin esto, el mapa usa el zoom por defecto de Leaflet (variante compacta).
		 */
		controls?: boolean;
		/** Al cambiar, el mapa vuelve a la vista del área (por ejemplo, al restablecer filtros). */
		viewVersion?: number;
		/** Detección seleccionada: se marca con un anillo. */
		selectedId?: number;
		onselect?: (id: number) => void;
		/** Elementos flotantes sobre el mapa (capas, contadores, leyendas). */
		overlay?: Snippet;
		/** Alto y posición del mapa (por ejemplo `h-80`). */
		class?: ClassValue;
	};

	let {
		hotspots,
		center,
		zoom,
		label,
		colorMode = 'combined',
		controls = false,
		viewVersion = 0,
		selectedId,
		onselect,
		overlay,
		class: className
	}: Props = $props();

	let leaflet = $state.raw<Leaflet>();
	let map = $state.raw<LeafletMap>();
	let container: HTMLElement | undefined;
	/** Marcador y círculo de precisión de la ubicación del usuario. */
	let userLayer: LayerGroup | undefined;
	let locating = $state(false);

	/** Detección intensa: a partir del segundo nivel de potencia lleva halo. */
	function isIntense(point: Hotspot): boolean {
		return point.frp >= frpLevels[1].min;
	}

	function colorVar(point: Hotspot): string {
		if (colorMode === 'sensor') return sensors[point.sensor].colorVar;
		if (colorMode === 'frp' || isIntense(point)) return frpLevel(point.frp).colorVar;
		return sensors[point.sensor].colorVar;
	}

	// El mapa se crea una sola vez; los puntos se redibujan aparte (ver el efecto de abajo).
	const mount: Attachment<HTMLElement> = (node) => {
		const initial = untrack(() => ({ center, zoom, controls }));
		let instance: LeafletMap | undefined;
		let cancelled = false;

		// Leaflet necesita el navegador: se carga solo en cliente.
		import('leaflet').then(({ default: L }) => {
			if (cancelled) return;
			instance = L.map(node, {
				center: initial.center,
				zoom: initial.zoom,
				scrollWheelZoom: false,
				zoomControl: !initial.controls
			});
			L.tileLayer(basemap.url, {
				attribution: basemap.attribution,
				maxZoom: basemap.maxZoom,
				// Mapa base en grises y atenuado, para que destaquen las detecciones.
				className: 'opacity-70 grayscale'
			}).addTo(instance);
			if (initial.controls) {
				L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(instance);
			}
			container = node;
			leaflet = L;
			map = instance;
		});

		return () => {
			cancelled = true;
			instance?.remove();
			map = undefined;
		};
	};

	// Si cambia el área (centro o zoom), el mapa vuela hasta ella.
	$effect(() => {
		const view = { center, zoom, version: viewVersion };
		untrack(() => map)?.flyTo(view.center, view.zoom, { duration: 0.8 });
	});

	/** Centra el mapa en la ubicación del navegador (pide permiso la primera vez). */
	function locate() {
		if (!map || !leaflet || !container) return;
		if (!('geolocation' in navigator)) {
			notify(m.map_locate_unsupported(), 'warning');
			return;
		}
		const L = leaflet;
		const node = container;
		const instance = map;
		locating = true;

		function done() {
			locating = false;
			instance.off('locationfound', found);
			instance.off('locationerror', failed);
		}
		function found(event: LocationEvent) {
			done();
			const unit = spacingUnit(node);
			const color = cssVar(node, '--color-info');
			userLayer?.remove();
			userLayer = L.layerGroup([
				L.circle(event.latlng, {
					radius: event.accuracy,
					color,
					weight: 1,
					fillOpacity: 0.1,
					interactive: false
				}),
				L.circleMarker(event.latlng, {
					radius: unit * 2,
					color: cssVar(node, '--color-base-100'),
					weight: unit / 2,
					fillColor: color,
					fillOpacity: 1
				}).bindTooltip(m.map_you_are_here())
			]).addTo(instance);
		}
		function failed(event: ErrorEvent) {
			done();
			// Código 1 de la API de geolocalización: el usuario negó el permiso.
			notify(event.code === 1 ? m.map_locate_denied() : m.map_locate_failed(), 'warning');
		}
		instance.on('locationfound', found);
		instance.on('locationerror', failed);
		instance.locate({ setView: true, maxZoom: 11, timeout: 10000 });
	}

	// Sincroniza los puntos con Leaflet cada vez que cambian los datos, el modo, la selección
	// o el tema (los colores se leen del CSS al dibujar).
	$effect(() => {
		void themeVersion.value;
		if (!leaflet || !map || !container) return;
		const L = leaflet;
		const node = container;
		// Radios en unidades de spacing.css (1 unidad = 4 px).
		const unit = spacingUnit(node);
		const radius = { dot: unit, intense: unit * 1.5, halo: unit * 3 };
		const group = L.layerGroup().addTo(map);

		// Primero los halos, para que los puntos queden siempre encima.
		if (colorMode !== 'sensor') {
			for (const point of hotspots) {
				if (!isIntense(point)) continue;
				L.circleMarker([point.lat, point.lng], {
					radius: radius.halo,
					stroke: false,
					fillColor: cssVar(node, frpLevel(point.frp).colorVar),
					fillOpacity: 0.2,
					interactive: false
				}).addTo(group);
			}
		}
		for (const point of hotspots) {
			L.circleMarker([point.lat, point.lng], {
				radius: isIntense(point) ? radius.intense : radius.dot,
				stroke: false,
				fillColor: cssVar(node, colorVar(point)),
				fillOpacity: 1
			})
				.bindTooltip(`${point.sensor} · ${formatDecimal(point.frp)} MW`)
				.on('click', () => onselect?.(point.id))
				.addTo(group);
		}

		const selected = hotspots.find((point) => point.id === selectedId);
		if (selected) {
			L.circleMarker([selected.lat, selected.lng], {
				radius: radius.halo,
				color: cssVar(node, '--color-base-content'),
				weight: unit / 2,
				fill: false,
				interactive: false
			}).addTo(group);
		}

		return () => {
			group.remove();
		};
	});
</script>

<!--
	`isolate` evita que las capas de Leaflet tapen el menú, los desplegables y los elementos
	flotantes. Las utilidades con `!` son necesarias: leaflet.css fija fuente y fondo propios.
-->
<div class={['relative', className]}>
	<div
		{@attach mount}
		class="isolate size-full rounded-box bg-base-200! font-sans!"
		role="application"
		aria-label={label}
	></div>

	{#if controls}
		<!-- Con elementos flotantes arriba (capas, contador), los controles bajan para no taparlos. -->
		<div class={['join join-vertical absolute end-3 shadow-sm', overlay ? 'top-16' : 'top-3']}>
			<button
				type="button"
				class="btn btn-square join-item bg-base-100"
				aria-label={m.map_zoom_in()}
				onclick={() => map?.zoomIn()}
			>
				<Plus class="size-4" aria-hidden="true" />
			</button>
			<button
				type="button"
				class="btn btn-square join-item bg-base-100"
				aria-label={m.map_zoom_out()}
				onclick={() => map?.zoomOut()}
			>
				<Minus class="size-4" aria-hidden="true" />
			</button>
			<button
				type="button"
				class="btn btn-square join-item bg-base-100"
				aria-label={m.map_area_view()}
				title={m.map_area_view()}
				onclick={() => map?.setView(center, zoom)}
			>
				<House class="size-4" aria-hidden="true" />
			</button>
			<button
				type="button"
				class="btn btn-square join-item bg-base-100"
				aria-label={m.map_locate()}
				title={m.map_locate()}
				disabled={locating}
				onclick={locate}
			>
				{#if locating}
					<span class="loading loading-spinner loading-xs" aria-hidden="true"></span>
				{:else}
					<LocateFixed class="size-4" aria-hidden="true" />
				{/if}
			</button>
		</div>
	{/if}

	<!-- Mientras Leaflet carga: un bloque gris animado del mismo tamaño que el mapa. -->
	{#if !map}
		<div class="skeleton absolute inset-0 rounded-box" aria-hidden="true"></div>
	{:else if !hotspots.length}
		<!-- Sin detecciones para los filtros: aviso centrado, el mapa sigue navegable. -->
		<div class="pointer-events-none absolute inset-0 grid place-items-center p-4">
			<p
				class="rounded-box border border-base-content/10 bg-base-100 px-4 py-3 text-body text-base-content/70 shadow-sm"
			>
				{m.map_empty()}
			</p>
		</div>
	{/if}

	{@render overlay?.()}
</div>
