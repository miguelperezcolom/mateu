/**
 * Pure helpers for <mateu-map> (kept DOM-free so they are unit-testable under node).
 *
 * The Map wire metadata carries `position` and `zoom` as free-form strings (see
 * io.mateu.uidl.data.Map / Map.ts). `position` is expected as "lat, lon"; anything
 * unparsable falls back to a world view so a bad value still renders a usable map.
 */

export interface LonLat {
    /** Longitude in degrees (EPSG:4326). */
    lon: number
    /** Latitude in degrees (EPSG:4326). */
    lat: number
}

export const DEFAULT_CENTER: LonLat = { lon: 0, lat: 0 }
export const DEFAULT_ZOOM = 3

/** Parses a "lat, lon" position string; returns undefined when it is not two finite numbers. */
export const parsePosition = (position: string | undefined | null): LonLat | undefined => {
    if (!position) {
        return undefined
    }
    const parts = position.split(',').map(part => part.trim())
    if (parts.length !== 2) {
        return undefined
    }
    const lat = Number(parts[0])
    const lon = Number(parts[1])
    if (parts[0] === '' || parts[1] === '' || !Number.isFinite(lat) || !Number.isFinite(lon)) {
        return undefined
    }
    return { lon, lat }
}

/** Parses the zoom string; returns the default zoom when it is not a finite number. */
export const parseZoom = (zoom: string | undefined | null): number => {
    if (zoom == null || zoom.trim() === '') {
        return DEFAULT_ZOOM
    }
    const parsed = Number(zoom)
    return Number.isFinite(parsed) ? parsed : DEFAULT_ZOOM
}
