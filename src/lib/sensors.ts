/**
 * Sensores y su color semántico. Única fuente para leyendas, filtros, mapa y gráficos:
 * MODIS usa `primary` y VIIRS usa `secondary` en toda la app.
 */
export type Sensor = 'MODIS' | 'VIIRS';

export type SensorInfo = {
	id: Sensor;
	label: string;
	longLabel: string;
	/** Variable CSS del tema, para mapa y gráficos (que no usan clases). */
	colorVar: string;
	statusClass: string;
	/** Borde y relleno del chip de filtro cuando el sensor está activo. */
	chipClass: string;
	/** Recuadro relleno con el color del sensor (ícono de la fuente). */
	tileClass: string;
};

export const sensors: Record<Sensor, SensorInfo> = {
	MODIS: {
		id: 'MODIS',
		label: 'MODIS',
		longLabel: 'MODIS Terra/Aqua',
		colorVar: '--color-primary',
		statusClass: 'status-primary',
		chipClass: 'has-checked:border-primary has-checked:bg-primary/15',
		tileClass: 'bg-primary text-primary-content'
	},
	VIIRS: {
		id: 'VIIRS',
		label: 'VIIRS',
		longLabel: 'VIIRS SNPP/NOAA-20',
		colorVar: '--color-secondary',
		statusClass: 'status-secondary',
		chipClass: 'has-checked:border-secondary has-checked:bg-secondary/15',
		tileClass: 'bg-secondary text-secondary-content'
	}
};

export const sensorList: SensorInfo[] = [sensors.MODIS, sensors.VIIRS];
