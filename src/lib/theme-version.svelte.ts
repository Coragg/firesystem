/**
 * Cambia cada vez que el usuario cambia de tema. ECharts y Leaflet leen los colores del
 * tema una sola vez (no usan CSS), así que lo observan para volver a dibujarse.
 */
export const themeVersion = $state({ value: 0 });
