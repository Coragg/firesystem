import { describe, expect, it, vi } from 'vitest';
import {
	errorDetail,
	fetchHotspotForecast,
	ForecastError,
	forecastParams,
	insideRegion
} from './hotspot-forecast.ts';
import { m } from '#lib/paraglide/messages.js';

describe('forecastParams', () => {
	it('sends the first day of the month', () => {
		const params = forecastParams({ month: '2027-01', lat: -35.4, lon: -71.6 });
		expect(params.toString()).toBe('date=2027-01-01&lat=-35.4&lon=-71.6');
	});
});

describe('insideRegion', () => {
	it('accepts points in the Maule box and rejects others', () => {
		expect(insideRegion(-35.4, -71.6)).toBe(true);
		expect(insideRegion(-37.45, -72.4)).toBe(false);
	});
});

describe('errorDetail', () => {
	it('reads FastAPI string and validation details', () => {
		expect(errorDetail({ detail: 'Point outside region' }, 422)).toBe('Point outside region');
		expect(errorDetail({ detail: [{ loc: ['query', 'lat'], msg: 'too small' }] }, 422)).toBe(
			'lat: too small'
		);
		expect(errorDetail(null, 503)).toBe(m.predict_error_unavailable());
	});
});

describe('fetchHotspotForecast', () => {
	it('returns the data of a successful response', async () => {
		const data = { month: '2027-01', hotspot_probability: 0.02 };
		const mock = vi.fn<typeof fetch>(async () => Response.json({ success: true, data }));
		await expect(fetchHotspotForecast({ month: '2027-01', lat: -35, lon: -71 }, { fetch: mock })).resolves.toEqual(data);
		expect(mock).toHaveBeenCalledWith('/api/hotspot-forecast?date=2027-01-01&lat=-35&lon=-71', {
			signal: undefined
		});
	});

	it('throws a ForecastError with the backend detail', async () => {
		const mock = vi.fn<typeof fetch>(async () => Response.json({ detail: 'No leaf area data' }, { status: 422 }));
		const request = fetchHotspotForecast({ month: '2027-01', lat: -35, lon: -71 }, { fetch: mock });
		await expect(request).rejects.toBeInstanceOf(ForecastError);
		await expect(request).rejects.toMatchObject({ status: 422, message: 'No leaf area data' });
	});
});
