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

/** What the map shows first: an explicit position wins; else the markers (one is centred, several
 *  are fitted with `fit`); else the world view. */
export type MapViewPlan =
    | { kind: 'center', center: LonLat, zoom: number }
    | { kind: 'fit', min: LonLat, max: LonLat }

/** The zoom a single marker is shown at when the wire gives none. */
export const SINGLE_MARKER_ZOOM = 15

export const planMapView = (
    position: string | undefined | null,
    zoom: string | undefined | null,
    markers: { latitude: number, longitude: number }[] | undefined | null,
): MapViewPlan => {
    const center = parsePosition(position)
    if (center) {
        return { kind: 'center', center, zoom: parseZoom(zoom) }
    }
    const points = (markers ?? []).filter(m => Number.isFinite(m.latitude) && Number.isFinite(m.longitude))
    if (points.length === 1) {
        const hasZoom = zoom != null && zoom.trim() !== ''
        return {
            kind: 'center',
            center: { lat: points[0].latitude, lon: points[0].longitude },
            zoom: hasZoom ? parseZoom(zoom) : SINGLE_MARKER_ZOOM,
        }
    }
    if (points.length > 1) {
        return {
            kind: 'fit',
            min: { lat: Math.min(...points.map(p => p.latitude)), lon: Math.min(...points.map(p => p.longitude)) },
            max: { lat: Math.max(...points.map(p => p.latitude)), lon: Math.max(...points.map(p => p.longitude)) },
        }
    }
    return { kind: 'center', center: DEFAULT_CENTER, zoom: parseZoom(zoom) }
}

/** What the tile layer needs: an OpenLayers XYZ url template and its attribution (or the OSM default). */
export interface TileSourcePlan {
    /** undefined → OpenLayers' own OSM source. */
    url?: string
    attributions?: string
}

/**
 * The tile provider of a Map (wire `tileUrl` + `attribution`). The wire template is Leaflet-style,
 * which writes the subdomain as `{s}`; OpenLayers expands `{a-c}` instead. No `tileUrl` → OSM.
 */
export const tileSourceOf = (tileUrl: string | undefined | null, attribution: string | undefined | null): TileSourcePlan => {
    const url = tileUrl?.trim()
    if (!url) {
        return {}
    }
    return {
        url: url.replace(/\{s\}/g, '{a-c}'),
        attributions: attribution?.trim() || undefined,
    }
}
