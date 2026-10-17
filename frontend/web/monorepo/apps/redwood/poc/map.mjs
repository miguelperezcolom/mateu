import { chromeText } from './i18n.mjs'
// Map on Leaflet: JET has no street map (oj-thematic-map paints GeoJSON geography, not
// tiles), so the `isMap` atom is a container this fills, once per document like the
// rich text or the MatrixGrid:
//   - Leaflet (1.9.4) and its CSS are loaded from the cdnjs CDN when the first map is painted — nothing is
//     vendored; with requirejs present (VB) it is requested through require, because a UMD <script> with
//     requirejs loaded clashes with its anonymous define;
//   - OpenStreetMap tiles, like the web's <mateu-map> — or those of the provider the Map
//     declares on the wire (tileUrl, Leaflet template, + attribution): tileLayerOf;
//   - a marker = a circle of its colour with the label beside it (and the description on hover);
//     clicking it launches markerActionId with { _markerId };
//   - with markers and no position, the view frames them (mapViewPlanOf, the same rule as
//     planMapView in libs/mateu).

export const LEAFLET_JS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js'
export const LEAFLET_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css'
export const OSM_TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const DEFAULT_PIN = '#c74634'
export const DEFAULT_ZOOM = 3
export const SINGLE_MARKER_ZOOM = 15

export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

/** A map's tile layer: the wire's (tileUrl + attribution) or, without tileUrl, OSM. The
 *  wire's template is already Leaflet's ({s}, {z}, {x}, {y}), so it passes through as is. */
export function tileLayerOf(spec) {
  const url = spec && typeof spec.tileUrl === 'string' ? spec.tileUrl.trim() : ''
  if (!url) return { url: OSM_TILES, options: { maxZoom: 19, attribution: OSM_ATTRIBUTION } }
  const attribution = spec.attribution ? String(spec.attribution).trim() : ''
  return { url, options: { maxZoom: 19, ...(attribution ? { attribution } : {}) } }
}

let mapSink = null
/** Who runs a marker's action (the shell reuses the Elements' sink). */
export function setMapActionSink(fn) { mapSink = typeof fn === 'function' ? fn : null }

/** "lat, lon" → { lat, lon }, or null if they are not two numbers. */
export function parseMapPosition(position) {
  if (!position) return null
  const parts = String(position).split(',').map((p) => p.trim())
  if (parts.length !== 2 || parts[0] === '' || parts[1] === '') return null
  const lat = Number(parts[0])
  const lon = Number(parts[1])
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null
}

export function parseMapZoom(zoom) {
  if (zoom == null || String(zoom).trim() === '') return DEFAULT_ZOOM
  const z = Number(zoom)
  return Number.isFinite(z) ? z : DEFAULT_ZOOM
}

/** What the map shows on opening: the explicit position wins; otherwise, the markers (one is
 *  centred, several are framed); otherwise, the world. Same rule as planMapView (libs/mateu). */
export function mapViewPlanOf(spec) {
  const center = parseMapPosition(spec.position)
  if (center) return { kind: 'center', center, zoom: parseMapZoom(spec.zoom) }
  const points = (spec.markers || []).filter((m) => Number.isFinite(m.latitude) && Number.isFinite(m.longitude))
  if (points.length === 1) {
    const hasZoom = spec.zoom != null && String(spec.zoom).trim() !== ''
    return { kind: 'center', center: { lat: points[0].latitude, lon: points[0].longitude },
      zoom: hasZoom ? parseMapZoom(spec.zoom) : SINGLE_MARKER_ZOOM }
  }
  if (points.length > 1) {
    return {
      kind: 'fit',
      min: { lat: Math.min(...points.map((p) => p.latitude)), lon: Math.min(...points.map((p) => p.longitude)) },
      max: { lat: Math.max(...points.map((p) => p.latitude)), lon: Math.max(...points.map((p) => p.longitude)) },
    }
  }
  return { kind: 'center', center: { lat: 0, lon: 0 }, zoom: parseMapZoom(spec.zoom) }
}

/** The parameters of a marker's action. */
export const mapMarkerParams = (markerId) => ({ _markerId: markerId })

let leafletPromise = null
function loadLeaflet(doc) {
  if (typeof window !== 'undefined' && window.L && window.L.map) return Promise.resolve(window.L)
  if (leafletPromise) return leafletPromise
  if (!doc.querySelector('link[data-mateu-leaflet]')) {
    const link = doc.createElement('link')
    link.rel = 'stylesheet'
    link.href = LEAFLET_CSS
    link.setAttribute('data-mateu-leaflet', '')
    doc.head.appendChild(link)
  }
  leafletPromise = new Promise((resolve, reject) => {
    const amd = typeof window !== 'undefined' && typeof window.require === 'function'
      && typeof window.define === 'function' && window.define.amd
    if (amd) {
      window.require([LEAFLET_JS], (L) => resolve(L || window.L), reject)
      return
    }
    const script = doc.createElement('script')
    script.src = LEAFLET_JS
    script.onload = () => resolve(window.L)
    script.onerror = reject
    doc.head.appendChild(script)
  }).catch((e) => { leafletPromise = null; throw e })
  return leafletPromise
}

function drawMap(L, el, spec) {
  if (el.__mateuMap) { el.__mateuMap.remove(); el.__mateuMap = null }
  const map = L.map(el, { scrollWheelZoom: true })
  const tiles = tileLayerOf(spec)
  L.tileLayer(tiles.url, tiles.options).addTo(map)
  for (const m of spec.markers || []) {
    const pin = L.circleMarker([m.latitude, m.longitude], {
      radius: 8, color: '#ffffff', weight: 2, fillColor: m.color || DEFAULT_PIN, fillOpacity: 1,
      bubblingMouseEvents: false,
    }).addTo(map)
    if (m.label) pin.bindTooltip(m.label, { permanent: true, direction: 'right', offset: [8, 0], className: 'mateu-map-label' })
    const hover = [m.label, m.description].filter(Boolean).join(' · ')
    const run = spec.markerActionId ? () => { if (mapSink) mapSink(spec.markerActionId, mapMarkerParams(m.id), {}) } : null
    if (run) pin.on('click', run)
    // the marker's SVG path exists only once the map has a view (Leaflet adds layers whenReady, and
    // the view is set below): decorate it when the layer is ADDED — read right here, getElement()
    // was null and neither the name nor the role ever landed
    let decorated = false
    const decorate = () => {
      const pinEl = pin.getElement && pin.getElement()
      if (!pinEl || decorated) return
      decorated = true
      if (hover) pinEl.setAttribute('aria-label', hover)
      if (!run) return
      pinEl.style.cursor = 'pointer'
      // a marker that runs something is a BUTTON, reachable with the keyboard (like <mateu-map>'s):
      // Leaflet draws it as a bare SVG path with no role and no tab stop
      pinEl.setAttribute('role', 'button')
      pinEl.setAttribute('tabindex', '0')
      if (pinEl.addEventListener) {
        pinEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run() }
        })
      }
    }
    pin.on('add', decorate)
    decorate()
    if (m.description) pin.on('mouseover', () => { el.title = hover }).on('mouseout', () => { el.title = '' })
  }
  const plan = mapViewPlanOf(spec)
  if (plan.kind === 'fit') {
    map.fitBounds([[plan.min.lat, plan.min.lon], [plan.max.lat, plan.max.lon]],
      { paddingTopLeft: [48, 48], paddingBottomRight: [160, 48], maxZoom: 16 })
  } else {
    map.setView([plan.center.lat, plan.center.lon], plan.zoom)
  }
  el.__mateuMap = map
  // the container may have changed size as the page settled (VB paints in steps)
  setTimeout(() => map.invalidateSize(), 300)
}

export function installMaps(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuMaps || typeof MutationObserver === 'undefined') return
  doc.__mateuMaps = true
  const fill = (el) => {
    const raw = el.getAttribute('data-map-spec') || ''
    if (!raw || el.__mateuMapSpec === raw) return
    el.__mateuMapSpec = raw
    let spec
    try { spec = JSON.parse(raw) } catch (e) { return }
    loadLeaflet(doc).then((L) => {
      // the specification may have changed (or the container disappeared) while loading
      if (el.__mateuMapSpec === raw && el.isConnected) drawMap(L, el, spec)
    }).catch(() => {
      el.textContent = chromeText('mapUnavailable')
    })
  }
  const scan = (root) => {
    if (root.nodeType !== 1) return
    if (root.hasAttribute('data-map-spec')) fill(root)
    for (const el of root.querySelectorAll('[data-map-spec]')) fill(el)
  }
  scan(doc.body || doc.documentElement)
  new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'attributes') fill(r.target)
      else for (const n of r.addedNodes) scan(n)
    }
  }).observe(doc.body || doc.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-map-spec'] })
}
