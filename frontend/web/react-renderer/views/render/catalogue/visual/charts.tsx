import React from 'react'
import { Text } from '@kit'
import { chartTextAlternative, formatTick } from '@rn/core/uxRules'
import { radarGeometry, trendPaths } from '@rn/renderer/chartGeometry'
import { funnelStages } from '@rn/renderer/displayFigures'
import { BOX_STYLE, styleOf } from '@mr/render/styleOf'
import type { CatalogueProps } from '../types'
import { arr, colorOf, seriesColor, str, type Dict } from './common'
import { tx } from '@mr/i18n/texts'

interface Dataset { label?: string; data?: number[] }

const W = 560
const H = 240

/** The figure's drawn width in CSS pixels: the axes are drawn at that size, so their text stays at 11px
 *  in a narrow card (a fixed viewBox scaled down shrank it to ~7px). */
function useWidth(): [React.RefObject<HTMLElement | null>, number] {
  const ref = React.useRef<HTMLElement | null>(null)
  const [w, setW] = React.useState(W)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setW(Math.max(200, Math.round(el.getBoundingClientRect().width)))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w]
}
const PAD = { l: 40, r: 8, t: 8, b: 24 }

/**
 * Chart (the chart.js-shaped wire: chartType + chartData {labels, datasets}): drawn as SVG in
 * Primer's data-vis palette — bar, line/scatter, pie/doughnut/polarArea, radar (bubble → scatter).
 * The text alternative is the RN core's (every renderer names a chart the same way).
 */
export function Chart({ component, metadata }: CatalogueProps) {
  const type = str(metadata['chartType'] || 'bar')
  const data = (metadata['chartData'] as Dict | undefined) ?? {}
  const labels = arr<string>(data['labels']).map(str)
  const datasets = arr<Dataset>(data['datasets']).filter((d) => (d.data?.length ?? 0) > 0)
  if (datasets.length === 0) return null
  const pie = type === 'pie' || type === 'doughnut' || type === 'polarArea'
  const radar = type === 'radar'
  const line = type === 'line' || type === 'scatter' || type === 'bubble'
  const legend = pie ? labels : datasets.map((d) => d.label ?? '')
  // the declared box (`width: 22rem; height: 240px`): the figure takes the width, the drawing the
  // height left after the legend — the SVG scales into it (viewBox, aspect kept)
  const { height, ...box } = styleOf(component, BOX_STYLE)
  const declaredH = typeof height === 'string' && /^\d+(\.\d+)?px$/.test(height) ? parseFloat(height) : undefined
  const drawH = Math.max(120, (declaredH ?? 260) - (legend.some(Boolean) ? 32 : 0))
  const [figRef, figW] = useWidth()
  return (
    <figure ref={figRef as React.RefObject<HTMLElement>} className="mv-chart" style={{ margin: 0, maxWidth: '100%', width: '36rem', ...box }}>
      <svg viewBox={pie || radar ? '-30 -10 300 260' : `0 0 ${figW} ${drawH}`} role="img"
        aria-label={chartTextAlternative(labels, datasets, pie || radar)} style={{ width: '100%', height: drawH }}>
        {pie ? <Pie values={datasets[0].data ?? []} labels={labels} hole={type === 'doughnut'} polar={type === 'polarArea'} />
          : radar ? <Radar labels={labels} datasets={datasets} />
            : <XY w={figW} h={drawH} labels={labels} datasets={datasets} line={line} dots={type === 'scatter' || type === 'bubble'} fromZero={!line || beginsAtZero(metadata)} />}
      </svg>
      {legend.some(Boolean) && (
        <figcaption className="mv-legend" style={{ marginTop: 'var(--base-size-8)', justifyContent: 'center' }}>
          {legend.map((l, i) => l ? <span key={i}><i className="mv-swatch" style={{ background: seriesColor(i) }} />{l}</span> : null)}
        </figcaption>
      )}
    </figure>
  )
}

/** A category label cut to the room its slot has (~6.5px a character at 11px), never overlapping the next. */
/** Labels that all start with the same words ("Episode I", "Episode II"…) lose them on the axis — the
 *  part that tells them apart is what fits; the full label stays as the tick's tooltip. */
function withoutSharedLead(labels: string[]): string[] {
  if (labels.length < 2) return labels
  const words = labels.map((l) => l.split(' '))
  let n = 0
  while (words.every((w) => w.length > n + 1 && w[n] === words[0][n])) n++
  return n === 0 ? labels : words.map((w) => w.slice(n).join(' '))
}

function fitLabel(label: string, slot: number): string {
  const max = Math.max(3, Math.floor((slot - 4) / 6.5))
  return label.length > max ? label.slice(0, max - 1) + '…' : label
}

/** chartOptions.scales.y.beginAtZero (Chart.js's option, what the web renderer hands it): a line's
 *  axis starts at its data otherwise, like Chart.js; bars always stand on zero. */
const beginsAtZero = (metadata: Dict): boolean =>
  ((((metadata['chartOptions'] as Dict | undefined)?.['scales'] as Dict | undefined)?.['y'] as Dict | undefined)?.['beginAtZero']) === true

function XY({ w = W, h = H, labels, datasets, line, dots, fromZero = true }: { w?: number; h?: number; labels: string[]; datasets: Dataset[]; line: boolean; dots: boolean; fromZero?: boolean }) {
  const shortLabels = withoutSharedLead(labels)
  const values = datasets.flatMap((d) => d.data ?? [])
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  // off zero, the data's own range with a little room above and below
  const pad = fromZero ? 0 : (hi - lo || Math.abs(hi) || 1) * 0.08
  const max = fromZero ? Math.max(1, hi) : hi + pad
  const min = fromZero ? Math.min(0, lo) : lo - pad
  const n = Math.max(labels.length, ...datasets.map((d) => d.data?.length ?? 0))
  const iw = w - PAD.l - PAD.r
  const ih = h - PAD.t - PAD.b
  const y = (v: number) => PAD.t + ih - ((v - min) / (max - min || 1)) * ih
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => min + (max - min) * t)
  const slot = iw / Math.max(1, n)
  const x = (i: number) => PAD.l + slot * i + slot / 2
  const barW = Math.max(2, (slot * 0.72) / datasets.length)
  return (
    <g>
      {ticks.map((t, i) => (
        <g key={i}>
          <line className="mv-grid" x1={PAD.l} x2={w - PAD.r} y1={y(t)} y2={y(t)} strokeDasharray={t === 0 ? undefined : '2 3'} />
          <text x={PAD.l - 6} y={y(t) + 4} textAnchor="end">{formatTick(t)}</text>
        </g>
      ))}
      {labels.map((l, i) => (
        <text key={i} x={x(i)} y={h - 6} textAnchor="middle"><title>{l}</title>{fitLabel(shortLabels[i], iw / Math.max(1, labels.length))}</text>
      ))}
      {datasets.map((d, di) => {
        const color = seriesColor(di)
        const pts = (d.data ?? []).map((v, i) => [x(i), y(v)] as const)
        if (line) {
          return (
            <g key={di}>
              {!dots && <polyline fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" points={pts.map((p) => p.join(',')).join(' ')} />}
              {pts.map(([px, py], i) => <circle key={i} cx={px} cy={py} r={dots ? 4 : 3} fill={color}><title>{`${d.label ?? ''} ${labels[i] ?? ''}: ${d.data?.[i]}`}</title></circle>)}
            </g>
          )
        }
        return (d.data ?? []).map((v, i) => {
          const bx = PAD.l + slot * i + (slot - barW * datasets.length) / 2 + barW * di
          const top = y(Math.max(v, 0))
          const h = Math.abs(y(v) - y(0))
          return <rect key={`${di}-${i}`} x={bx} y={top} width={barW - 1} height={Math.max(0.5, h)} rx={2} fill={color}><title>{`${d.label ?? ''} ${labels[i] ?? ''}: ${v}`}</title></rect>
        })
      })}
    </g>
  )
}

function Pie({ values, labels, hole, polar }: { values: number[]; labels: string[]; hole: boolean; polar: boolean }) {
  const total = values.reduce((a, b) => a + Math.max(0, b), 0) || 1
  const max = Math.max(1, ...values)
  const cx = 120, cy = 120, R = 110
  let angle = -Math.PI / 2
  return (
    <g>
      {values.map((v, i) => {
        const span = polar ? (2 * Math.PI) / values.length : (Math.max(0, v) / total) * 2 * Math.PI
        const r = polar ? R * Math.sqrt(Math.max(0, v) / max) : R
        const a0 = angle
        const a1 = angle + span
        angle = a1
        const large = span > Math.PI ? 1 : 0
        const p = (a: number, rr: number) => `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`
        const d = span >= 2 * Math.PI - 1e-6
          ? `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0`
          : `M${cx},${cy} L${p(a0, r)} A${r},${r} 0 ${large} 1 ${p(a1, r)} Z`
        return <path key={i} d={d} fill={seriesColor(i)} stroke="var(--bgColor-default)" strokeWidth={2}><title>{`${labels[i] ?? ''}: ${v}`}</title></path>
      })}
      {hole && <circle cx={cx} cy={cy} r={R * 0.55} fill="var(--bgColor-default)" />}
    </g>
  )
}

function Radar({ labels, datasets }: { labels: string[]; datasets: Dataset[] }) {
  const g = radarGeometry(labels.length, datasets.map((d) => d.data ?? []), 120, 120, 90)
  return (
    <g>
      {g.rings.map((pts, i) => <polygon key={i} className="mv-grid" fill="none" points={pts} />)}
      {g.spokes.map((s, i) => <line key={i} className="mv-grid" x1={120} y1={120} x2={s.x} y2={s.y} />)}
      {g.spokes.map((s, i) => <text key={`l${i}`} x={120 + (s.x - 120) * 1.18} y={120 + (s.y - 120) * 1.18 + 4} textAnchor="middle">{labels[i]}</text>)}
      {g.polygons.map((pts, i) => <polygon key={`s${i}`} points={pts} fill={seriesColor(i, 'muted')} stroke={seriesColor(i)} strokeWidth={2} fillOpacity={0.6} />)}
    </g>
  )
}

/** TrendChart: one series as a line (area-filled when `area`), its title above and labels under. */
export function TrendChart({ component, metadata }: CatalogueProps) {
  const values = arr<number>(metadata['values']).map(Number)
  const labels = arr<string>(metadata['labels']).map(str)
  const title = str(metadata['title'])
  const color = colorOf(metadata['color'], seriesColor(0))
  const w = 300, h = 80
  const paths = trendPaths(values, w, h)
  return (
    <figure className="mv-chart" style={{ margin: 0, maxWidth: '100%', width: '20rem', ...styleOf(component, BOX_STYLE) }}>
      {title && <Text as="div" size="small" weight="semibold" style={{ marginBottom: 'var(--base-size-4)' }}>{title}</Text>}
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label={`${title || tx('trend')}: ${values.join(', ')}`}>
        {paths && metadata['area'] === true && <path d={paths.area} fill={color} fillOpacity={0.15} />}
        {paths && <path d={paths.line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />}
      </svg>
      {labels.length > 0 && (
        <div className="mv-small mv-muted" style={{ display: 'flex', justifyContent: 'space-between' }}>
          {labels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      )}
    </figure>
  )
}

/** Funnel: each stage's bar (width = its share of the widest) with the conversion from the previous. */
export function Funnel({ component, metadata }: CatalogueProps) {
  const stages = funnelStages(arr<Dict & { value?: number }>(metadata['stages']))
  return (
    <div className="mv-funnel" style={styleOf(component, BOX_STYLE)} role="list">
      {stages.map(({ stage, value, conversion, widthPct }, i) => (
        <div key={i} className="mv-funnel-row" role="listitem">
          <div>
            <Text as="div" size="small" weight="semibold">{str(stage['label'])}</Text>
            {conversion && <Text as="div" size="small" className="mv-muted">{conversion}</Text>}
          </div>
          <div className="mv-funnel-bar" style={{ width: `${widthPct}%`, background: colorOf(stage['color'], seriesColor(0)) }}>
            {value.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Heatmap: a contribution graph (github.com's own idiom) — weeks as columns, days as rows. */
export function Heatmap({ component, metadata }: CatalogueProps) {
  const declared = arr<{ date?: string; value?: number; label?: string }>(metadata['cells']).filter((c) => !!c.date && !Number.isNaN(Date.parse(c.date + 'T00:00:00Z')))
    .sort((a, b) => str(a.date).localeCompare(str(b.date)))
  if (declared.length === 0) return null
  // every day between the first and the last: a day with no cell is an empty square, so each
  // date sits on its weekday row and its week column
  const byDate = new Map(declared.map((c) => [c.date!, c]))
  const cells: { date: string; value?: number; label?: string }[] = []
  const last = Date.parse(declared[declared.length - 1].date + 'T00:00:00Z')
  for (let t = Date.parse(declared[0].date + 'T00:00:00Z'); t <= last; t += 86400000) {
    const d = new Date(t).toISOString().slice(0, 10)
    const c = byDate.get(d)
    cells.push(c ? { ...c, date: d } : { date: d })
  }
  const max = Math.max(1, ...declared.map((c) => c.value ?? 0))
  const level = (v: number) => (v <= 0 ? 0 : v / max > 0.75 ? 4 : v / max > 0.5 ? 3 : v / max > 0.25 ? 2 : 1)
  const fill = ['var(--bgColor-neutral-muted)', 'var(--data-green-color-muted)', 'var(--data-green-color-emphasis)', 'var(--bgColor-success-emphasis)', 'var(--fgColor-success)']
  // leading blanks so the first date sits on its weekday row (Monday first)
  const first = new Date(cells[0].date + 'T00:00:00Z')
  const lead = (first.getUTCDay() + 6) % 7
  return (
    <div style={{ overflowX: 'auto', ...styleOf(component, BOX_STYLE) }}>
      <div className="mv-heatmap" role="img" aria-label={`${declared.length} days, highest ${max}`}>
        {Array.from({ length: lead }, (_, i) => <span key={`b${i}`} />)}
        {cells.map((c, i) => (
          <span key={i} className="mv-heat" style={{ background: fill[level(c.value ?? 0)] }} title={`${c.label ?? c.date}: ${c.value ?? 0}`} />
        ))}
      </div>
      <div className="mv-legend" style={{ marginTop: 'var(--base-size-8)' }}>
        <span>Less {fill.map((f, i) => <i key={i} className="mv-heat" style={{ background: f, display: 'inline-block' }} />)} More</span>
      </div>
    </div>
  )
}
