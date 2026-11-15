<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import type { LayerGroup, Map as LeafletMap } from 'leaflet';
	import { untrack, type Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import type { ClassValue } from 'svelte/elements';
	import { basemap } from '#lib/map/basemap.ts';
	import { cssVar, spacingUnit } from '#lib/theme.ts';

	type Leaflet = typeof import('leaflet');

	type Props = {
		/** Punto elegido; un clic en el mapa lo cambia. */
		lat?: number | null;
		lon?: number | null;
		/** Centro del píxel que usó el modelo en el último pronóstico. */
		pixel?: [number, number];
		/** Región del modelo: se dibuja como rectángulo. [[sur, oeste], [norte, este]] */
		bounds: [[number, number], [number, number]];
		center: [number, number];
		zoom: number;
		/** Descripción del mapa para lectores de pantalla. */
		label: string;
		/** Elementos flotantes sobre el mapa (instrucciones, leyendas). */
		overlay?: Snippet;
		class?: ClassValue;
	};

	let {
		lat = $bindable(),
		lon = $bindable(),
		pixel,
		bounds,
		center,
		zoom,
		label,
		overlay,
		class: className
	}: Props = $props();

	let leaflet = $state.raw<Leaflet>();
	let map = $state.raw<LeafletMap>();
	let container: HTMLElement | undefined;

	/** Cinco decimales: ~1 m, más que suficiente para un píxel de 500 m. */
	function round(value: number): number {
		return Math.round(value * 1e5) / 1e5;
	}

	const mount: Attachment<HTMLElement> = (node) => {
		const initial = untrack(() => ({ center, zoom, bounds }));
		let instance: LeafletMap | undefined;
		let cancelled = false;

		// Leaflet necesita el navegador: se carga solo en cliente.
		import('leaflet').then(({ default: L }) => {
			if (cancelled) return;
			instance = L.map(node, { center: initial.center, zoom: initial.zoom, scrollWheelZoom: false });
			L.tileLayer(basemap.url, {
				attribution: basemap.attribution,
				maxZoom: basemap.maxZoom,
				className: 'opacity-70 grayscale'
			}).addTo(instance);
			L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(instance);

			const unit = spacingUnit(node);
			L.rectangle(initial.bounds, {
				color: cssVar(node, '--color-secondary'),
				weight: unit / 2,
				dashArray: `${unit * 2} ${unit * 1.5}`,
				fillOpacity: 0.04,
				interactive: false
			}).addTo(instance);

			instance.on('click', (event) => {
				const point = event.latlng.wrap();
				lat = round(point.lat);
				lon = round(point.lng);
			});
			node.style.cursor = 'crosshair';

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

	// Marca el punto elegido y, si ya hay pronóstico, el centro del píxel del modelo.
	$effect(() => {
		if (!leaflet || !map || !container) return;
		const L = leaflet;
		const node = container;
		const unit = spacingUnit(node);
		const group: LayerGroup = L.layerGroup().addTo(map);

		if (pixel) {
			L.circleMarker(pixel, {
				radius: unit * 3,
				color: cssVar(node, '--color-base-content'),
				weight: unit / 2,
				fill: false
			})
				.bindTooltip('Model pixel (500 m)')
				.addTo(group);
		}
		if (lat != null && lon != null) {
			L.circleMarker([lat, lon], {
				radius: unit * 1.5,
				color: cssVar(node, '--color-base-100'),
				weight: unit / 2,
				fillColor: cssVar(node, '--color-primary'),
				fillOpacity: 1
			})
				.bindTooltip('Selected point')
				.addTo(group);
		}

		return () => {
			group.remove();
		};
	});

	/** Si el punto sale de la vista (por ejemplo, escrito a mano), el mapa lo sigue. */
	$effect(() => {
		if (lat == null || lon == null) return;
		const point: [number, number] = [lat, lon];
		const instance = untrack(() => map);
		if (instance && !instance.getBounds().contains(point)) instance.panTo(point);
	});
</script>

<div class={['relative', className]}>
	<div
		{@attach mount}
		class="isolate size-full rounded-box bg-base-200! font-sans!"
		role="application"
		aria-label={label}
	></div>
	{@render overlay?.()}
</div>
