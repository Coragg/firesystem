/** Tipos de dominio compartidos por componentes y datos. */
import type { Sensor } from '#lib/sensors.ts';

export type KpiTone = 'primary' | 'secondary' | 'warning' | 'error' | 'success' | 'neutral';

export type Kpi = {
	label: string;
	value: string;
	/** Dato destacado junto al valor (variación, conteo, estado). */
	highlight?: string;
	tone?: KpiTone;
	trend?: 'up' | 'down';
	note?: string;
};

export type Hotspot = {
	id: number;
	lat: number;
	lng: number;
	sensor: Sensor;
	/** Fire radiative power, en MW. */
	frp: number;
};

export type Confidence = 'low' | 'nominal' | 'high';

/** Detección con los datos de su adquisición. */
export type Detection = Hotspot & {
	/** Satélite que la registró (por ejemplo "VIIRS NOAA-20"). */
	satellite: string;
	confidence: Confidence;
	/** Momento de adquisición, ISO en UTC. */
	acquired: string;
};

/** Detecciones de un día. `date` en formato ISO (`AAAA-MM-DD`). */
export type DailyActivity = { date: string; count: number };

export type SensorSeries = { sensor: Sensor; values: number[] };

export type Severity = 'critical' | 'elevated';

export type CriticalPeriod = {
	id: string;
	range: string;
	severity: Severity;
	detail: string;
};

/** Fuente de datos: un sensor o la capa armonizada (sin `sensor`). */
export type DataSource = {
	id: string;
	name: string;
	origin: string;
	sensor?: Sensor;
	status: string;
	detections: number;
	resolution: string;
};

/** Producto que alimenta la plataforma. `since` es el primer año con datos. */
export type Feed = {
	id: string;
	name: string;
	product?: string;
	since: number;
	resolution: string;
	status: string;
};

export type CoverageMetric = {
	id: string;
	label: string;
	/** Proporción de 0 a 1. */
	share: number;
	tone: 'primary' | 'secondary' | 'success';
};

export type PipelineStep = { id: string; title: string; detail: string };
