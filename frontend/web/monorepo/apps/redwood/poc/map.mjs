// Map sobre Leaflet: JET no tiene mapa de calles (oj-thematic-map pinta geografía GeoJSON, no
// teselas), así que el átomo `isMap` es un contenedor que esto llena, una vez por documento como el
// texto enriquecido o el MatrixGrid:
//   - Leaflet (1.9.4) y su CSS se cargan del CDN de cdnjs al pintarse el primer mapa — nada se
//     vendoriza; con requirejs presente (VB) se pide por require, porque un <script> UMD con
//     requirejs cargado choca con su define anónimo;
//   - teselas de OpenStreetMap, como el <mateu-map> del web;
//   - un marcador = un círculo de su color con la etiqueta al lado (y la descripción al pasar);
//     pulsarlo lanza markerActionId con { _markerId };
//   - con marcadores y sin posición, la vista los encuadra (mapViewPlanOf, la misma regla que
//     planMapView en libs/mateu).

export const LEAFLET_JS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js'
export const LEAFLET_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css'
export const OSM_TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const DEFAULT_PIN = '#c74634'
export const DEFAULT_ZOOM = 3
export const SINGLE_MARKER_ZOOM = 15

let mapSink = null
/** Quién ejecuta la acción de un marcador (la shell reutiliza el sumidero de los Element). */
export function setMapActionSink(fn) { mapSink = typeof fn === 'function' ? fn : null }

/** "lat, lon" → { lat, lon }, o null si no son dos números. */
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

/** Qué enseña el mapa al abrirse: la posición explícita manda; si no, los marcadores (uno se
 *  centra, varios se encuadran); si no, el mundo. Misma regla que planMapView (libs/mateu). */
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

/** Los parámetros de la acción de un marcador. */
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
  L.tileLayer(OSM_TILES, {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map)
  for (const m of spec.markers || []) {
    const pin = L.circleMarker([m.latitude, m.longitude], {
      radius: 8, color: '#ffffff', weight: 2, fillColor: m.color || DEFAULT_PIN, fillOpacity: 1,
      bubblingMouseEvents: false,
    }).addTo(map)
    if (m.label) pin.bindTooltip(m.label, { permanent: true, direction: 'right', offset: [8, 0], className: 'mateu-map-label' })
    const hover = [m.label, m.description].filter(Boolean).join(' · ')
    if (hover && pin.getElement && pin.getElement()) pin.getElement().setAttribute('aria-label', hover)
    if (spec.markerActionId) {
      pin.on('click', () => { if (mapSink) mapSink(spec.markerActionId, mapMarkerParams(m.id), {}) })
      if (pin.getElement && pin.getElement()) pin.getElement().style.cursor = 'pointer'
    }
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
  // el contenedor puede haber cambiado de tamaño al asentarse la página (VB pinta por pasos)
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
      // la especificación pudo cambiar (o el contenedor desaparecer) mientras cargaba
      if (el.__mateuMapSpec === raw && el.isConnected) drawMap(L, el, spec)
    }).catch(() => {
      el.textContent = 'The map could not be loaded.'
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
