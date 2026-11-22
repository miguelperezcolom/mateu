import React, { useEffect, useMemo, useRef, useState } from 'react'
import { IconButton } from '@primer/react'
import { DashIcon, PlusIcon } from '@primer/octicons-react'
import { planMapView, type LonLat } from '@infra/ui/mapPosition.ts'
import { tx } from '../../../i18n/texts'

/**
 * A slippy map with no SDK: Web Mercator tiles (the wire's `tileUrl`, Leaflet-style `{s}{z}{x}{y}`,
 * else OpenStreetMap's — the web renderers' default) laid out as plain images, markers on top. Drag
 * or the arrow keys pan, the buttons / + − zoom, Ctrl + wheel zooms (a plain wheel scrolls the
 * page). The first view is the web's `planMapView`: the position, else the markers fitted.
 */
export interface TileMarker { id: string; latitude: number; longitude: number; label: string; color?: string; actionable: boolean }

const TILE = 256
const MIN_Z = 1
const MAX_Z = 19
const OSM = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const OSM_ATTRIBUTION = '© OpenStreetMap contributors'

const worldX = (lon: number, z: number) => ((lon + 180) / 360) * TILE * 2 ** z
const worldY = (lat: number, z: number) => {
  const s = Math.sin((Math.max(-85.0511, Math.min(85.0511, lat)) * Math.PI) / 180)
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * TILE * 2 ** z
}
const lonOf = (x: number, z: number) => (x / (TILE * 2 ** z)) * 360 - 180
const latOf = (y: number, z: number) => {
  const n = Math.PI - (2 * Math.PI * y) / (TILE * 2 ** z)
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
}

/** The zoom that fits a box of points into the view (the web's "fit" plan). */
function fitZoom(min: LonLat, max: LonLat, w: number, h: number): number {
  for (let z = MAX_Z - 3; z >= MIN_Z; z--) {
    const dx = Math.abs(worldX(max.lon, z) - worldX(min.lon, z))
    const dy = Math.abs(worldY(min.lat, z) - worldY(max.lat, z))
    if (dx <= w * 0.8 && dy <= h * 0.8) return z
  }
  return MIN_Z
}

const tileUrlOf = (template: string, z: number, x: number, y: number) =>
  template.replace('{s}', 'abc'[(x + y) % 3]).replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y))

export function TileMap({ position, zoom, markers, tileUrl, attribution, height, onMarker }: {
  position?: string | null; zoom?: string | number | null; markers: TileMarker[]
  tileUrl?: string | null; attribution?: string | null; height: number; onMarker: (m: TileMarker) => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = box.current
    if (!el) return undefined
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const plan = useMemo(() => planMapView(position ?? null, zoom == null ? null : String(zoom), markers), [position, zoom, markers])
  const [view, setView] = useState<{ center: LonLat; z: number } | null>(null)
  // the first view, once the width is known (a fit needs it)
  useEffect(() => {
    if (view || !width) return
    if (plan.kind === 'center') setView({ center: plan.center, z: Math.round(Math.max(MIN_Z, Math.min(MAX_Z, plan.zoom))) })
    else setView({ center: { lat: (plan.min.lat + plan.max.lat) / 2, lon: (plan.min.lon + plan.max.lon) / 2 }, z: fitZoom(plan.min, plan.max, width, height) })
  }, [plan, width, height, view])

  const template = tileUrl?.trim() || OSM
  const credit = tileUrl?.trim() ? attribution?.trim() ?? '' : OSM_ATTRIBUTION
  const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null)

  const zoomBy = (d: number) => setView((v) => (v ? { ...v, z: Math.max(MIN_Z, Math.min(MAX_Z, v.z + d)) } : v))
  const panBy = (dx: number, dy: number) => setView((v) => {
    if (!v) return v
    const cx = worldX(v.center.lon, v.z) + dx
    const cy = worldY(v.center.lat, v.z) + dy
    return { z: v.z, center: { lon: lonOf(cx, v.z), lat: latOf(cy, v.z) } }
  })

  let tiles: React.ReactNode = null
  let pins: React.ReactNode = null
  if (view && width) {
    const { z } = view
    const cx = worldX(view.center.lon, z)
    const cy = worldY(view.center.lat, z)
    const left = cx - width / 2
    const top = cy - height / 2
    const n = 2 ** z
    const out: React.ReactNode[] = []
    for (let tx = Math.floor(left / TILE); tx <= Math.floor((left + width) / TILE); tx++) {
      for (let ty = Math.max(0, Math.floor(top / TILE)); ty <= Math.min(n - 1, Math.floor((top + height) / TILE)); ty++) {
        const wx = ((tx % n) + n) % n
        out.push(<img key={`${z}/${tx}/${ty}`} className="mv-map-tile" alt="" draggable={false}
          src={tileUrlOf(template, z, wx, ty)} style={{ left: tx * TILE - left, top: ty * TILE - top }} />)
      }
    }
    tiles = out
    pins = markers.map((m) => {
      const x = worldX(m.longitude, z) - left
      const y = worldY(m.latitude, z) - top
      if (x < -20 || y < -20 || x > width + 20 || y > height + 20) return null
      const style = { left: x, top: y, ['--mv-pin' as never]: m.color || 'var(--bgColor-danger-emphasis)' } as React.CSSProperties
      return m.actionable
        ? <button key={m.id} type="button" className="mv-pin" style={style} aria-label={m.label} title={m.label} onClick={() => onMarker(m)} />
        : <span key={m.id} className="mv-pin" style={style} role="img" aria-label={m.label} title={m.label} />
    })
  }

  return (
    <div ref={box} className="mv-map" style={{ height }} tabIndex={0} role="application" aria-roledescription="map"
      aria-label={tx('mapKeys')}
      onKeyDown={(e) => {
        const step = 80
        if (e.key === 'ArrowLeft') panBy(-step, 0)
        else if (e.key === 'ArrowRight') panBy(step, 0)
        else if (e.key === 'ArrowUp') panBy(0, -step)
        else if (e.key === 'ArrowDown') panBy(0, step)
        else if (e.key === '+' || e.key === '=') zoomBy(1)
        else if (e.key === '-') zoomBy(-1)
        else return
        e.preventDefault()
      }}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('button')) return
        if (!view) return
        drag.current = { x: e.clientX, y: e.clientY, cx: worldX(view.center.lon, view.z), cy: worldY(view.center.lat, view.z) }
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        const d = drag.current
        if (!d || !view) return
        const cx = d.cx - (e.clientX - d.x)
        const cy = d.cy - (e.clientY - d.y)
        setView({ z: view.z, center: { lon: lonOf(cx, view.z), lat: latOf(cy, view.z) } })
      }}
      onPointerUp={() => { drag.current = null }}
      onWheel={(e) => { if (e.ctrlKey) { e.preventDefault(); zoomBy(e.deltaY < 0 ? 1 : -1) } }}>
      <div className="mv-map-tiles" aria-hidden="true">{tiles}</div>
      {pins}
      <div className="mv-map-zoom">
        <IconButton icon={PlusIcon} size="small" aria-label={tx('zoomIn')} onClick={() => zoomBy(1)} />
        <IconButton icon={DashIcon} size="small" aria-label={tx('zoomOut')} onClick={() => zoomBy(-1)} />
      </div>
      {credit && <div className="mv-map-credit">{credit}</div>}
    </div>
  )
}
