/**
 * Mapa base (teselas PNG). Es un servicio externo: para cambiar de proveedor
 * basta con editar este archivo. La atribución es obligatoria por licencia.
 */
export const basemap = {
	url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
	attribution:
		'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	maxZoom: 19
};
