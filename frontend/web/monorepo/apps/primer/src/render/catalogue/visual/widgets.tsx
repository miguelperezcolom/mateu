import React, { useEffect, useState } from 'react'
import { Button, Label, Link, Text } from '@primer/react'
import { CheckIcon, ChevronDownIcon, ChevronRightIcon, LocationIcon, PlusIcon } from '@primer/octicons-react'
import { mapRows, markerParameters, type MapMeta } from '@rn/renderer/mapRows'
import { gridCellParameters, gridCellText, gridHeader, gridRowsOf, visibleTreeRows } from '@rn/renderer/wireWidgets'
import { addOnTotal, fmtAmount, toggleAddOn } from '@rn/renderer/displayModels'
import { initialPaymentMethod } from '@rn/renderer/displayFigures'
import { parseBpmn, workflowDiagram, type Diagram } from '@rn/renderer/diagrams'
import { parseFormEditorValue } from '@rn/renderer/definitionModel'
import { useController } from '../../ViewHost'
import { ComponentRenderer } from '../../ComponentRenderer'
import { BOX_STYLE, styleOf } from '../../styleOf'
import type { CatalogueProps } from '../types'
import { activate, arr, colorOf, str, toneBg, toneFg, toneOf, type Dict } from './common'

// ── Map ───────────────────────────────────────────────────────────────────────────────────────────

/**
 * Map: no tile service is bundled (a map SDK would bring its own look and a third-party host), so —
 * like the native renderers — the markers as a list: each opens OpenStreetMap centred on it, and a
 * marker runs markerActionId with `_markerId`.
 */
export function MapView({ component, metadata }: CatalogueProps) {
  const controller = useController()
  const rows = mapRows(metadata as unknown as MapMeta)
  if (rows.length === 0) return <Text className="mv-muted">No locations.</Text>
  return (
    <ul className="mv-box" style={{ listStyle: 'none', margin: 0, padding: 0, ...styleOf(component, BOX_STYLE) }} aria-label="Map locations">
      {rows.map((r, i) => (
        <li key={r.key} className="mv-row" style={{ padding: 'var(--base-size-8) var(--base-size-12)', borderTop: i ? 'var(--borderWidth-thin) solid var(--borderColor-muted)' : undefined }}>
          <span style={{ color: colorOf(r.markerId ? undefined : 'neutral', 'var(--fgColor-danger)') }}><LocationIcon /></span>
          <span style={{ flex: 1, display: 'grid' }}>
            {r.actionable
              ? <Link as="button" onClick={() => void controller.runAction(String(metadata['markerActionId']), markerParameters(r))} style={{ textAlign: 'left', fontWeight: 600 }}>{r.label}</Link>
              : <Text weight="semibold">{r.label}</Text>}
            {r.description && <Text size="small" className="mv-muted">{r.description}</Text>}
          </span>
          <Link href={r.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12 }}>
            {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)} ↗
          </Link>
        </li>
      ))}
    </ul>
  )
}

// ── Grid ──────────────────────────────────────────────────────────────────────────────────────────

/** Grid (a plain table of rows, with column groups and an optional tree): the RN core's header/rows/cell text. */
export function Grid({ component, state, data, metadata: m }: CatalogueProps) {
  const controller = useController()
  const { leaves: columns, groups } = gridHeader(component)
  const tree = m['tree'] === true
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const all = gridRowsOf(component, state, data)
  const rows = tree ? visibleTreeRows(all, expanded) : all.map((row, i) => ({ row, depth: 0, key: String(i), hasChildren: false }))
  const cls = ['mv-table', m['compact'] && 'mv-compact', m['rowStripes'] && 'mv-stripes', m['columnBorders'] && 'mv-colborders', m['wrapCellContent'] && 'mv-wrap', m['noRowBorder'] && 'mv-norowborder'].filter(Boolean).join(' ')
  const right = (a?: string) => a === 'end' || a === 'right'
  return (
    <div className={m['noBorder'] ? '' : 'mv-box'} style={{ overflowX: 'auto', ...styleOf(component, BOX_STYLE) }}>
      <table className={cls}>
        <thead>
          {groups && <tr>{groups.map((g, i) => <th key={i} colSpan={g.span} style={{ textAlign: 'center' }}>{g.label}</th>)}</tr>}
          <tr>{columns.map((c) => <th key={c.id} scope="col" style={{ textAlign: right(c.align) ? 'right' : 'left', width: c.width }}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={Math.max(1, columns.length)} className="mv-muted">No data.</td></tr>}
          {rows.map(({ row, depth, key, hasChildren }) => (
            <tr key={key}>
              {columns.map((c, ci) => {
                const text = gridCellText(row[c.id], c)
                const indent = tree && ci === 0 ? depth * 16 : 0
                const style: React.CSSProperties = { textAlign: right(c.align) ? 'right' : 'left', paddingLeft: indent ? `calc(var(--base-size-12) + ${indent}px)` : undefined }
                if (tree && ci === 0 && hasChildren) {
                  const open = expanded.has(key)
                  return (
                    <td key={c.id} style={style}>
                      <Button variant="invisible" size="small" leadingVisual={open ? ChevronDownIcon : ChevronRightIcon} aria-expanded={open}
                        onClick={() => setExpanded((p) => { const n = new Set(p); if (n.has(key)) n.delete(key); else n.add(key); return n })}
                        style={{ padding: '0 4px', height: 'auto' }}>{text}</Button>
                    </td>
                  )
                }
                return (
                  <td key={c.id} style={style}>
                    {c.actionId ? <Link as="button" onClick={() => void controller.runAction(String(c.actionId), gridCellParameters(String(c.actionId), row))}>{text}</Link> : text}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── ResourceGrid ──────────────────────────────────────────────────────────────────────────────────

interface ResourceItem { id?: string; title?: string; subtitle?: string; statusLabel?: string; statusColor?: string; note?: string; noteColor?: string; recommended?: boolean; selected?: boolean; disabled?: boolean }

/** ResourceGrid (pick a room, a slot, a seat): selectable tiles; picking runs actionId with `_item`. */
export function ResourceGrid({ component, metadata: m }: CatalogueProps) {
  const controller = useController()
  const items = arr<ResourceItem>(m['items'])
  const columns = Number(m['columns'] ?? 0) || 0
  const [selected, setSelected] = useState<string | undefined>(() => items.find((it) => it.selected)?.id)
  useEffect(() => setSelected(items.find((it) => it.selected)?.id), [m['items']]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="mv-tiles" role="radiogroup" style={{ gridTemplateColumns: columns > 0 ? `repeat(${columns}, minmax(0, 1fr))` : 'repeat(auto-fill, minmax(12rem, 1fr))', ...styleOf(component, BOX_STYLE) }}>
      {items.map((it, i) => {
        const sel = it.id === selected
        const pick = () => { if (it.disabled) return; setSelected(it.id); if (m['actionId']) void controller.runAction(String(m['actionId']), { _item: it.id }) }
        const statusTone = toneOf(it.statusColor)
        return (
          <div key={it.id ?? i} {...(it.disabled ? {} : activate(pick))} role="radio" aria-checked={sel} aria-disabled={it.disabled || undefined}
            className={'mv-tile' + (sel ? ' mv-selected' : '') + (it.recommended && !sel ? ' mv-recommended' : '') + (it.disabled ? '' : ' mv-clickable')}>
            {it.recommended && <span><Label variant="success">{str(m['recommendedLabel'] || 'Recommended')}</Label></span>}
            <Text weight="semibold">{it.title}</Text>
            {it.subtitle && <Text size="small" className="mv-muted">{it.subtitle}</Text>}
            {it.statusLabel && <span><Label variant={statusTone === 'success' ? 'success' : statusTone === 'danger' ? 'danger' : statusTone === 'warning' ? 'attention' : statusTone === 'info' ? 'accent' : 'secondary'}>{it.statusLabel}</Label></span>}
            {it.note && <Text size="small" style={{ color: toneOf(it.noteColor) ? toneFg(toneOf(it.noteColor)!) : 'var(--fgColor-muted)' }}>● {it.note}</Text>}
          </div>
        )
      })}
    </div>
  )
}

// ── AddOnPicker / PaymentPicker ───────────────────────────────────────────────────────────────────

interface AddOn { id?: string; title?: string; description?: string; icon?: string; price?: number; unit?: string; includedLabel?: string; added?: boolean }

/** AddOnPicker: extras toggled on and off with a running total; a toggle runs actionId with {_item, _added, _total}. */
export function AddOnPicker({ component, metadata: m }: CatalogueProps) {
  const controller = useController()
  const items = arr<AddOn>(m['items'])
  const currency = str(m['currency'])
  const [added, setAdded] = useState<Set<string>>(() => new Set(items.filter((it) => it.added).map((it) => it.id ?? '')))
  const money = (n: number) => `${currency ? currency + ' ' : ''}${fmtAmount(n)}`
  const toggle = (it: AddOn) => {
    const { next, parameters } = toggleAddOn(items, added, it.id ?? '')
    setAdded(next)
    if (m['actionId']) void controller.runAction(String(m['actionId']), parameters)
  }
  return (
    <div style={{ display: 'grid', gap: 'var(--base-size-8)', ...styleOf(component, BOX_STYLE) }}>
      <Text weight="semibold" style={{ justifySelf: 'end' }} aria-live="polite">{m['totalLabel'] ? `${str(m['totalLabel'])}: ` : ''}{money(addOnTotal(items, added))}</Text>
      {items.map((it, i) => {
        const on = added.has(it.id ?? '')
        return (
          <div key={it.id ?? i} className={'mv-tile mv-row' + (on ? ' mv-selected' : '')}>
            {it.icon && !it.icon.includes(':') && <span aria-hidden style={{ fontSize: 20 }}>{it.icon}</span>}
            <span style={{ flex: 1, display: 'grid' }}>
              <Text weight="semibold">{it.title}</Text>
              {it.description && <Text size="small" className="mv-muted">{it.description}</Text>}
            </span>
            {it.includedLabel
              ? <Label variant="success">{it.includedLabel}</Label>
              : <>
                  <Text size="small">{money(it.price ?? 0)}{it.unit ? ` / ${it.unit}` : ''}</Text>
                  <Button size="small" variant={on ? 'primary' : 'default'} leadingVisual={on ? CheckIcon : PlusIcon} aria-pressed={on}
                    aria-label={`${on ? 'Remove' : 'Add'} ${it.title ?? ''}`} onClick={() => toggle(it)}>{on ? 'Added' : 'Add'}</Button>
                </>}
          </div>
        )
      })}
    </div>
  )
}

/** PaymentPicker: one method chosen (methodActionId with `_method`), then confirm (actionId with `_method`). */
export function PaymentPicker({ component, metadata: m }: CatalogueProps) {
  const controller = useController()
  const methods = arr<{ id?: string; label?: string }>(m['methods'])
  const [selected, setSelected] = useState<string | undefined>(() => initialPaymentMethod(m['selected'], methods))
  return (
    <div style={{ display: 'grid', gap: 'var(--base-size-12)', ...styleOf(component, BOX_STYLE) }}>
      <div className="mv-tiles" role="radiogroup" aria-label="Payment method" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(9rem, 1fr))' }}>
        {methods.map((pm, i) => {
          const sel = pm.id === selected
          return (
            <div key={pm.id ?? i} aria-checked={sel} className={'mv-tile mv-clickable' + (sel ? ' mv-selected' : '')}
              {...activate(() => { setSelected(pm.id); if (m['methodActionId']) void controller.runAction(String(m['methodActionId']), { _method: pm.id }) })} role="radio">
              <Text weight={sel ? 'semibold' : 'normal'}>{pm.label}</Text>
            </div>
          )
        })}
      </div>
      {!!m['contextValue'] && (
        <div className="mv-row" style={{ justifyContent: 'space-between' }}>
          <Text className="mv-muted">{str(m['contextLabel'])}</Text>
          <Text weight="semibold" style={{ fontSize: 'var(--text-title-size-medium)' }}>{str(m['contextValue'])}</Text>
        </div>
      )}
      {!!m['confirmLabel'] && (
        <Button variant="primary" block disabled={!selected} onClick={() => m['actionId'] && void controller.runAction(String(m['actionId']), { _method: selected })}>{str(m['confirmLabel'])}</Button>
      )}
    </div>
  )
}

// ── CustomComponent ───────────────────────────────────────────────────────────────────────────────

/**
 * CustomComponent: the per-renderer escape hatch. This renderer has no registry of custom
 * renderers yet, so it says so and still shows the slotted children (never a broken screen).
 */
export function CustomComponent({ component, metadata: m, state, data }: CatalogueProps) {
  const name = str(m['name'])
  const kids = arr(component['children']).map((c, i) => <ComponentRenderer key={i} component={c} state={state} data={data} />)
  return (
    <div className="mv-box" style={{ padding: 'var(--base-size-12)', borderStyle: 'dashed', display: 'grid', gap: 'var(--base-size-8)' }}>
      <Text size="small" className="mv-muted">Custom component “{name}” is not registered on this renderer</Text>
      {kids}
    </div>
  )
}

// ── Bpmn / Workflow / FormEditor (read-only here) ─────────────────────────────────────────────────

const KIND_TONE: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'neutral'> = {
  start: 'success', end: 'danger', event: 'warning', gateway: 'warning', task: 'info', subprocess: 'info', other: 'neutral',
}

/** A parsed diagram drawn as SVG: nodes by kind (Primer tones), edges as polylines with arrows. */
function DiagramView({ diagram, label }: { diagram: Diagram; label: string }) {
  if (diagram.nodes.length === 0) return <Text className="mv-muted">Nothing to show.</Text>
  const pad = 16
  return (
    <div className="mv-box mv-chart" style={{ overflow: 'auto', padding: 'var(--base-size-8)' }}>
      <svg width={diagram.width + pad * 2} height={diagram.height + pad * 2} viewBox={`${-pad} ${-pad} ${diagram.width + pad * 2} ${diagram.height + pad * 2}`} role="img" aria-label={label}>
        <defs><marker id="mv-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--fgColor-muted)" /></marker></defs>
        {diagram.edges.map((e) => <polyline key={e.id} fill="none" stroke="var(--fgColor-muted)" strokeWidth={1.5} markerEnd="url(#mv-arrow)" points={e.points.map((p) => `${p.x},${p.y}`).join(' ')} />)}
        {diagram.nodes.map((n) => {
          const t = KIND_TONE[n.kind] ?? 'neutral'
          const fill = toneBg(t)
          const stroke = toneFg(t)
          const cx = n.x + n.w / 2, cy = n.y + n.h / 2
          const shape = n.kind === 'start' || n.kind === 'end' || n.kind === 'event'
            ? <circle cx={cx} cy={cy} r={Math.min(n.w, n.h) / 2} fill={fill} stroke={stroke} strokeWidth={n.kind === 'end' ? 3 : 1.5} />
            : n.kind === 'gateway'
              ? <polygon points={`${cx},${n.y} ${n.x + n.w},${cy} ${cx},${n.y + n.h} ${n.x},${cy}`} fill={fill} stroke={stroke} strokeWidth={1.5} />
              : <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={8} fill={n.color ? colorOf(n.color, fill) : fill} fillOpacity={n.color ? 0.25 : 1} stroke={stroke} strokeWidth={1.5} />
          const below = n.kind !== 'task' && n.kind !== 'subprocess' && n.kind !== 'other'
          return (
            <g key={n.id}>
              {shape}
              {n.label && <text x={cx} y={below ? n.y + n.h + 14 : cy + 4} textAnchor="middle" style={{ fill: 'var(--fgColor-default)' }}>{n.label.length > 22 ? n.label.slice(0, 21) + '…' : n.label}</text>}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function Bpmn({ component, metadata }: CatalogueProps) {
  return <div style={styleOf(component, BOX_STYLE)}><DiagramView diagram={parseBpmn(str(metadata['xml']))} label="Process diagram" /></div>
}

/** Workflow (an editor elsewhere): its diagram, read-only — editing it is a desktop/web-Vaadin task for now. */
export function Workflow({ component, metadata }: CatalogueProps) {
  const { name, diagram } = workflowDiagram(str(metadata['value']))
  return (
    <div style={{ display: 'grid', gap: 'var(--base-size-8)', ...styleOf(component, BOX_STYLE) }}>
      {name && <Text weight="semibold">{name}</Text>}
      <DiagramView diagram={diagram} label={`Workflow ${name}`} />
      <Text size="small" className="mv-muted">Read-only in the Primer renderer.</Text>
    </div>
  )
}

/** FormEditor (a form definition editor elsewhere): the definition's fields, read-only. */
export function FormEditor({ component, metadata }: CatalogueProps) {
  const form = parseFormEditorValue(str(metadata['value']))
  return (
    <div style={{ display: 'grid', gap: 'var(--base-size-8)', ...styleOf(component, BOX_STYLE) }}>
      {form.name && <Text weight="semibold">{String(form.name)}</Text>}
      <div className="mv-box" style={{ overflowX: 'auto' }}>
        <table className="mv-table">
          <thead><tr><th>Field</th><th>Label</th><th>Type</th><th>Required</th></tr></thead>
          <tbody>
            {form.fields.length === 0 && <tr><td colSpan={4} className="mv-muted">No fields.</td></tr>}
            {form.fields.map((f) => (
              <tr key={f.id}><td><code>{f.id}</code></td><td>{f.label}</td><td>{f.stereotype ? `${f.dataType} · ${f.stereotype}` : f.dataType}</td><td>{f.required ? 'Yes' : ''}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <Text size="small" className="mv-muted">Read-only in the Primer renderer.</Text>
    </div>
  )
}
