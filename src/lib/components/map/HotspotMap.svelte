<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import type { Map as LeafletMap } from 'leaflet';
	import type { Attachment } from 'svelte/attachments';
	import type { ClassValue } from 'svelte/elements';
	import { basemap } from '#lib/map/basemap.ts';
	import { sensors } from '#lib/sensors.ts';
	import { cssVar, spacingUnit } from '#lib/theme.ts';
	import type { Hotspot } from '#lib/types.ts';

	type Props = {
		hotspots: Hotspot[];
		center: [number, number];
		zoom: number;
		/** Descripción del mapa para lectores de pantalla. */
		label: string;
		/** Alto del mapa (por ejemplo `h-80`). */
		class?: ClassValue;
	};

	let { hotspots, center, zoom, label, class: className }: Props = $props();

	/**
	 * Color según la potencia radiativa (MW). Bajo ese umbral el punto solo
	 * muestra el color de su sensor.
	 */
	function intensityVar(frp: number): string | undefined {
		if (frp >= 50) return '--color-error';
		if (frp >= 35) return '--color-primary';
		if (frp >= 20) return '--color-warning';
	}

	const map: Attachment<HTMLElement> = (node) => {
		// Leer las props aquí hace que el mapa se vuelva a crear si cambian.
		const points = hotspots;
		const view = { center, zoom };
		let instance: LeafletMap | undefined;
		let cancelled = false;

		// Leaflet necesita el navegador: se carga solo en cliente.
		import('leaflet').then(({ default: L }) => {
			if (cancelled) return;
			// Radios de los puntos en unidades de spacing.css (1 unidad = 4 px).
			const unit = spacingUnit(node);
			const radius = { dot: unit, intense: unit * 1.5, halo: unit * 3 };
			instance = L.map(node, { ...view, scrollWheelZoom: false });
			L.tileLayer(basemap.url, {
				attribution: basemap.attribution,
				maxZoom: basemap.maxZoom,
				// Mapa base en grises y atenuado, para que destaquen las detecciones.
				className: 'opacity-70 grayscale'
			}).addTo(instance);

			// Primero los halos, para que los puntos queden siempre encima.
			for (const point of points) {
				const intensity = intensityVar(point.frp);
				if (!intensity) continue;
				L.circleMarker([point.lat, point.lng], {
					radius: radius.halo,
					stroke: false,
					fillColor: cssVar(node, intensity),
					fillOpacity: 0.2,
					interactive: false
				}).addTo(instance);
			}
			for (const point of points) {
				const intensity = intensityVar(point.frp);
				L.circleMarker([point.lat, point.lng], {
					radius: intensity ? radius.intense : radius.dot,
					stroke: false,
					fillColor: cssVar(node, intensity ?? sensors[point.sensor].colorVar),
					fillOpacity: 1
				})
					.bindTooltip(`${point.sensor} · ${point.frp.toFixed(1)} MW`)
					.addTo(instance);
			}
		});

		return () => {
			cancelled = true;
			instance?.remove();
		};
	};
</script>

<!--
	`isolate` evita que las capas de Leaflet tapen el menú y los desplegables.
	Las utilidades con `!` son necesarias: leaflet.css fija fuente y fondo propios.
-->
<div
	{@attach map}
	class={['isolate w-full rounded-box bg-base-200! font-sans!', className]}
	role="application"
	aria-label={label}
></div>
