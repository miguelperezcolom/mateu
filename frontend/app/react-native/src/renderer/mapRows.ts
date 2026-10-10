/**
 * Street maps (wire type `Map`): centre (`position` = "lat, lon"), zoom, markers and the action a
 * marker tap runs (`markerActionId`, with the marker id in `_markerId`).
 *
 * The native renderer ships no map SDK, so the map is rendered as a LIST of its points: one row per
 * marker (or one row for the bare position when there are no markers), each with an "Open in Maps"
 * link to OpenStreetMap. This module builds those rows; the component only paints them.
 */

export interface MapMarkerMeta {
  id?: string;
  latitude?: number;
  longitude?: number;
  label?: string | null;
  description?: string | null;
  color?: string | null;
}

export interface MapMeta {
  position?: string | null;
  zoom?: string | null;
  markers?: MapMarkerMeta[] | null;
  markerActionId?: string | null;
}

export interface MapRow {
  key: string;
  /** The marker id — null for the position row, which runs no action. */
  markerId: string | null;
  label: string;
  description: string;
  color: string;
  latitude: number;
  longitude: number;
  /** OpenStreetMap URL centred on the point, with a pin. */
  url: string;
  /** Whether tapping the row runs `markerActionId`. */
  actionable: boolean;
}

export const DEFAULT_MARKER_COLOR = '#2763B1';

/** OpenStreetMap URL with a pin on the point. */
export const osmUrl = (latitude: number, longitude: number, zoom = 16): string =>
  `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}/${latitude}/${longitude}`;

/** Parses "lat, lon" — null when it is missing or not two finite numbers. */
export const parsePosition = (position: string | null | undefined): { latitude: number; longitude: number } | null => {
  if (!position) return null;
  const parts = position.split(',').map((p) => p.trim());
  if (parts.length !== 2 || parts.some((p) => p === '')) return null;
  const [latitude, longitude] = parts.map(Number);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
};

const formatPoint = (latitude: number, longitude: number) => `${latitude}, ${longitude}`;

/** The rows the map renders as: markers first; the bare position only when there are none. */
export const mapRows = (meta: MapMeta): MapRow[] => {
  const action = meta.markerActionId || null;
  const markers = (meta.markers ?? []).filter(
    (m) => Number.isFinite(m.latitude) && Number.isFinite(m.longitude),
  );
  if (markers.length > 0) {
    return markers.map((m, i) => {
      const latitude = m.latitude as number;
      const longitude = m.longitude as number;
      const markerId = m.id ?? null;
      return {
        key: markerId ?? `m${i}`,
        markerId,
        label: m.label || formatPoint(latitude, longitude),
        description: m.description ?? '',
        color: m.color || DEFAULT_MARKER_COLOR,
        latitude,
        longitude,
        url: osmUrl(latitude, longitude),
        actionable: !!action && markerId !== null,
      };
    });
  }
  const centre = parsePosition(meta.position);
  if (!centre) return [];
  return [{
    key: 'position',
    markerId: null,
    label: formatPoint(centre.latitude, centre.longitude),
    description: '',
    color: DEFAULT_MARKER_COLOR,
    latitude: centre.latitude,
    longitude: centre.longitude,
    url: osmUrl(centre.latitude, centre.longitude),
    actionable: false,
  }];
};

/** Parameters a marker tap sends with `markerActionId`. */
export const markerParameters = (row: MapRow): Record<string, unknown> => ({ _markerId: row.markerId });
