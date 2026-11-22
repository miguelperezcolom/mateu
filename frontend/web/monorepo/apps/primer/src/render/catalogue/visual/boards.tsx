import React, { useEffect, useState } from 'react'
import { ActionList, ActionMenu, Avatar, Button, Checkbox, CounterLabel, FormControl, IconButton, Radio, Text, TextInput } from '@primer/react'
import { KebabHorizontalIcon, ChevronDownIcon, ChevronRightIcon } from '@primer/octicons-react'
import type { KanbanCard, KanbanColumn } from '@rn/api/metadata'
import { interpolate, interpolateUrl } from '@rn/core/expressions'
import { cardRouteOf, cardsFromRows, itemsOf, moveCard, moveParameters, movesOf, type BoardCard, type BoardColumn, type KanbanMove } from '@rn/core/kanban'
import { fetchExternalJson } from '@rn/core/restFetch'
import { isExternalRoute } from '@rn/core/rowOpen'
import {
  cellA11yLabel, cellParameters, cellTone, groupHeaders, initialCollapsed, isActionableLink, matrixLines, shouldCommit, toggleSection,
  type MatrixGridMeta, type MatrixRowMeta,
} from '@rn/renderer/matrixGrid'
import { initialOrgPath, orgAncestors, orgChildren, orgDisplay, orgInitials, orgNodeLabel, reportsLabel, type OrgChartNode } from '@rn/renderer/orgChart'
import {
  CUSTOM, initialPicks, mergeParameters, mergeSummary, pickLabel, summaryText, valueText, visibleFields, type MergePicks, type RecordMergeMeta,
} from '@rn/renderer/recordMerge'
import { useController } from '../../ViewHost'
import { BOX_STYLE, styleOf } from '../../styleOf'
import type { CatalogueProps } from '../types'
import { arr, colorOf, str, toneBg, toneFg, type Dict } from './common'

// ── Kanban ────────────────────────────────────────────────────────────────────────────────────────

/**
 * Kanban: declared columns, or a LIVE board read from `rowsSource` (proxied by the board id, or
 * direct) and re-read after each move. A card is dragged (HTML drag and drop) or moved with its
 * "…" menu (the keyboard path); the move runs moveActionId with the RN core's parameters
 * (`_cardId`, `_from`, `_to`, `_index`, the order field…). A card opens its cardRoute, or runs its
 * actionId with its row and `_clickedCard`.
 */
export function Kanban({ component, metadata: m }: CatalogueProps) {
  const controller = useController()
  const declared = arr<KanbanColumn>(m['columns'])
  const moveActionId = m['moveActionId'] as string | undefined
  const rowsSource = m['rowsSource'] as Dict | undefined
  const [live, setLive] = useState<BoardColumn[] | undefined>(undefined)
  const [optimistic, setOptimistic] = useState<BoardColumn[] | undefined>(undefined)
  const [reload, setReload] = useState(0)
  const [dragging, setDragging] = useState<{ cardId: string; columnId: string } | null>(null)
  const [over, setOver] = useState<{ columnId: string; index: number } | null>(null)
  useEffect(() => setOptimistic(undefined), [m['columns']]) // eslint-disable-line react-hooks/exhaustive-deps
  const sourceKey = rowsSource ? JSON.stringify(rowsSource) : ''
  useEffect(() => {
    if (!rowsSource) return
    let cancelled = false
    const sources = controller.session.sources
    const resolved = sources.resolve(rowsSource) as { itemsPath?: string }
    const ctx = { state: controller.currentComponentState, appState: controller.session.appState }
    const json = sources.viaProxy(rowsSource)
      ? controller.fetchViaProxy('rows', String(component['id'] ?? 'kanban'))
      : fetchExternalJson(rowsSource, (t) => interpolate(str(t), ctx), (t) => interpolateUrl(str(t), ctx), sources)
    json.then((j) => {
      if (cancelled) return
      setLive(cardsFromRows({
        columns: declared, columnField: m['columnField'] as string | undefined, card: m['card'] as KanbanCard | undefined,
        cardColors: m['cardColors'] as Record<string, string> | undefined, orderField: m['orderField'] as string | undefined,
      }, itemsOf(j, resolved.itemsPath)))
      setOptimistic(undefined)
    }).catch((e) => console.warn('mateu: kanban items fetch failed', e))
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKey, reload])

  const shown: BoardColumn[] = optimistic ?? live ?? declared
  const commit = async (move: KanbanMove) => {
    const card = shown.find((c) => c.id === move.fromColumnId)?.cards?.find((c) => c.id === move.cardId)
    if (!moveActionId || !card) return
    const after = moveCard(shown, move)
    setOptimistic(after)
    const ok = await controller.runAction(moveActionId, moveParameters(card, move, m['orderField'] as string | undefined, after))
    if (!ok) setOptimistic(undefined)
    else if (rowsSource) setReload((r) => r + 1)
  }
  const open = (card: BoardCard) => {
    const route = cardRouteOf(m['cardRoute'] as string | undefined, card)
    if (route) {
      if (isExternalRoute(route)) window.open(route.startsWith('//') ? 'https:' + route : route, '_blank', 'noopener')
      else controller.session.openView({ label: '', route, consumedRoute: '', serverSideType: '' })
      return
    }
    if (card.actionId) {
      const { row, ...plain } = card
      void controller.runAction(card.actionId, { ...(row ?? {}), _clickedCard: plain })
    }
  }
  const dropAt = (columnId: string, index: number) => {
    if (!dragging) return
    const from = shown.find((c) => c.id === dragging.columnId)
    const fromIndex = from?.cards?.findIndex((c) => c.id === dragging.cardId) ?? -1
    // the card leaves its own slot first: an index below it moves up by one
    const toIndex = columnId === dragging.columnId && fromIndex >= 0 && index > fromIndex ? index - 1 : index
    setDragging(null)
    setOver(null)
    if (columnId === dragging.columnId && toIndex === fromIndex) return
    void commit({ cardId: dragging.cardId, fromColumnId: dragging.columnId, toColumnId: columnId, toIndex })
  }

  return (
    <div className="mv-board" style={styleOf(component, BOX_STYLE)}>
      {shown.map((col) => {
        const cards = col.cards ?? []
        const target = over?.columnId === col.id
        return (
          <section key={col.id} className={'mv-col' + (target ? ' mv-drop' : '')} aria-label={col.title}
            onDragOver={moveActionId ? (e) => { e.preventDefault(); if (!target) setOver({ columnId: col.id ?? '', index: cards.length }) } : undefined}
            onDrop={moveActionId ? (e) => { e.preventDefault(); dropAt(col.id ?? '', over && over.columnId === col.id ? over.index : cards.length) } : undefined}>
            <header className="mv-col-head">
              <span className="mv-swatch" style={{ background: colorOf(col.color, 'var(--borderColor-default)'), borderRadius: 999 }} />
              <span style={{ flex: 1 }}>{col.title}</span>
              <CounterLabel>{cards.length}</CounterLabel>
            </header>
            <div className="mv-col-body">
              {cards.map((card, i) => {
                const moves = moveActionId ? movesOf(shown, card.id ?? '', col.id ?? '') : []
                const clickable = !!card.actionId || !!cardRouteOf(m['cardRoute'] as string | undefined, card)
                return (
                  <article key={card.id ?? i} className={'mv-card' + (dragging?.cardId === card.id ? ' mv-dragging' : '')}
                    style={{ borderLeftColor: colorOf(card.color, 'var(--borderColor-default)'), boxShadow: over && over.columnId === col.id && over.index === i ? '0 -3px 0 var(--borderColor-accent-emphasis)' : undefined }}
                    draggable={!!moveActionId}
                    onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', card.id ?? ''); setDragging({ cardId: card.id ?? '', columnId: col.id ?? '' }) }}
                    onDragEnd={() => { setDragging(null); setOver(null) }}
                    onDragOver={moveActionId ? (e) => { e.preventDefault(); e.stopPropagation(); const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); const idx = e.clientY < r.top + r.height / 2 ? i : i + 1; if (!over || over.columnId !== col.id || over.index !== idx) setOver({ columnId: col.id ?? '', index: idx }) } : undefined}>
                    <div style={{ display: 'flex', gap: 'var(--base-size-4)', alignItems: 'flex-start' }}>
                      {clickable
                        ? <button type="button" className="mv-card-title mv-link" onClick={() => open(card)}>{card.title}</button>
                        : <span className="mv-card-title">{card.title}</span>}
                      {moves.length > 0 && (
                        <ActionMenu>
                          <ActionMenu.Anchor><IconButton icon={KebabHorizontalIcon} size="small" variant="invisible" aria-label={`Move ${card.title ?? ''}`} /></ActionMenu.Anchor>
                          <ActionMenu.Overlay>
                            <ActionList>{moves.map((mv, k) => <ActionList.Item key={k} onSelect={() => void commit(mv.move)}>{mv.label}</ActionList.Item>)}</ActionList>
                          </ActionMenu.Overlay>
                        </ActionMenu>
                      )}
                    </div>
                    {card.description && <Text size="small" className="mv-muted">{card.description}</Text>}
                    {card.badge && <span><CounterLabel scheme="secondary">{card.badge}</CounterLabel></span>}
                  </article>
                )
              })}
              {cards.length === 0 && <Text size="small" className="mv-muted" style={{ padding: 'var(--base-size-8)', textAlign: 'center' }}>No cards</Text>}
            </div>
          </section>
        )
      })}
    </div>
  )
}

// ── MatrixGrid ────────────────────────────────────────────────────────────────────────────────────

/**
 * MatrixGrid (metrics × dates): grouped column headers, collapsible sections, tones per cell or
 * column; an editable row edits in place (editActionId), a link cell runs cellActionId — both with
 * {_rowId, _columnId, _value}.
 */
export function MatrixGrid({ component, metadata }: CatalogueProps) {
  const controller = useController()
  const m = metadata as unknown as MatrixGridMeta & { rowHeaderLabel?: string }
  const columns = m.columns ?? []
  const [collapsed, setCollapsed] = useState(() => initialCollapsed(m))
  const groups = groupHeaders(columns)
  const lines = matrixLines(m, collapsed)
  const hasGroups = groups.some((g) => g.label)
  const commit = (row: MatrixRowMeta, ci: number, previous: string, next: string) => {
    if (shouldCommit(m, previous, next)) void controller.runAction(String(m.editActionId), { ...cellParameters(row, columns[ci], next) })
  }
  return (
    <div className="mv-matrix mv-box" style={styleOf(component, BOX_STYLE)}>
      <table>
        <thead>
          {hasGroups && (
            <tr>
              <th className="mv-rowhead" />
              {groups.map((g, i) => <th key={i} colSpan={g.span} style={{ textAlign: 'center' }}>{g.label}</th>)}
            </tr>
          )}
          <tr>
            <th className="mv-rowhead" scope="col">{m.rowHeaderLabel ?? ''}</th>
            {columns.map((c, i) => {
              const t = cellTone(undefined, c)
              return <th key={c.id ?? i} scope="col" style={{ textAlign: 'right', background: t ? toneBg(t) : undefined, color: t ? toneFg(t) : undefined }}>{c.label}</th>
            })}
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => line.kind === 'section' ? (
            <tr key={line.key} className="mv-section">
              <td colSpan={columns.length + 1}>
                <Button variant="invisible" size="small" leadingVisual={line.collapsed ? ChevronRightIcon : ChevronDownIcon} aria-expanded={!line.collapsed}
                  onClick={() => setCollapsed((c) => toggleSection(c, line.key))}>{line.title}</Button>
              </td>
            </tr>
          ) : (
            <tr key={line.key}>
              <th scope="row" className="mv-rowhead" style={{ fontWeight: line.row.emphasis ? 600 : 400, color: 'var(--fgColor-default)', background: 'var(--bgColor-default)' }}>{line.row.label}</th>
              {columns.map((c, ci) => {
                const cell = (line.row.cells ?? [])[ci]
                const value = cell?.value ?? ''
                const t = cellTone(cell, c)
                const style = { background: t ? toneBg(t) : undefined, color: t ? toneFg(t) : undefined, fontWeight: line.row.emphasis ? 600 : undefined }
                if (line.row.editable && m.editActionId) {
                  return (
                    <td key={ci} style={style}>
                      <input key={value} defaultValue={value} aria-label={cellA11yLabel(line.row, c, value)}
                        onBlur={(e) => commit(line.row, ci, value, e.currentTarget.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur() }} />
                    </td>
                  )
                }
                if (isActionableLink(m, cell)) {
                  return (
                    <td key={ci} style={style}>
                      <button type="button" className="mv-link" style={{ font: 'inherit', fontWeight: 'inherit', color: 'var(--fgColor-accent)', background: 'none', border: 0, padding: 0 }} aria-label={cellA11yLabel(line.row, c, value)}
                        onClick={() => void controller.runAction(String(m.cellActionId), { ...cellParameters(line.row, c, value) })}>{value}</button>
                    </td>
                  )
                }
                return <td key={ci} style={style}>{value}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── OrgChart ──────────────────────────────────────────────────────────────────────────────────────

type OrgNode = OrgChartNode & { actionId?: string; avatar?: string; color?: string; subtitle?: string; title?: string; id?: string; children?: OrgNode[] }

function OrgCard({ node, onClick, focused }: { node: OrgNode; onClick?: () => void; focused?: boolean }) {
  const controller = useController()
  const run = node.actionId ? () => void controller.runAction(String(node.actionId), { _clickedNode: node }) : undefined
  const press = onClick ?? run
  const avatar = node.avatar && /^(https?:|\/|data:image\/)/.test(node.avatar)
    ? <Avatar src={node.avatar} size={32} alt="" />
    : <span aria-hidden style={{ width: 32, height: 32, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bgColor-neutral-muted)', fontSize: 12, fontWeight: 600 }}>{orgInitials(node)}</span>
  const inner = (
    <>
      {avatar}
      <span style={{ display: 'grid' }}>
        <Text weight="semibold" size="small">{node.title}</Text>
        {node.subtitle && <Text size="small" className="mv-muted">{node.subtitle}</Text>}
      </span>
    </>
  )
  const style: React.CSSProperties = { borderTopColor: colorOf(node.color, 'var(--borderColor-accent-emphasis)'), boxShadow: focused ? '0 0 0 2px var(--borderColor-accent-emphasis)' : undefined }
  return press
    ? <button type="button" className="mv-org-node mv-clickable" style={style} aria-label={orgNodeLabel(node)} onClick={press}>{inner}</button>
    : <div className="mv-org-node" style={style}>{inner}</div>
}

function OrgTree({ node }: { node: OrgNode }) {
  const kids = orgChildren(node) as OrgNode[]
  return (
    <li>
      <OrgCard node={node} />
      {kids.length > 0 && <ul>{kids.map((k, i) => <OrgTree key={k.id ?? i} node={k} />)}</ul>}
    </li>
  )
}

/** OrgChart: the whole tree (connectors drawn in CSS), or `display: focus` — one node, its chain and its reports. */
export function OrgChart({ component, metadata }: CatalogueProps) {
  const root = metadata['root'] as OrgNode | undefined
  const [path, setPath] = useState<OrgNode[]>(() => initialOrgPath(root, metadata['focus']) as OrgNode[])
  useEffect(() => setPath(initialOrgPath(root, metadata['focus']) as OrgNode[]), [root, metadata['focus']]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!root) return null
  if (orgDisplay(metadata['display']) !== 'focus') {
    return <div className="mv-org" style={styleOf(component, BOX_STYLE)}><ul><OrgTree node={root} /></ul></div>
  }
  const focused = path[path.length - 1] ?? root
  const kids = orgChildren(focused) as OrgNode[]
  return (
    <div style={{ display: 'grid', gap: 'var(--base-size-8)', justifyItems: 'start', ...styleOf(component, BOX_STYLE) }}>
      {(orgAncestors(path) as OrgNode[]).map((a, i) => <OrgCard key={`a${i}`} node={a} onClick={() => setPath(path.slice(0, i + 1))} />)}
      <OrgCard node={focused} focused />
      {kids.length > 0 && (
        <>
          <Text size="small" weight="semibold" className="mv-muted">{reportsLabel(kids.length)}</Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--base-size-8)' }}>
            {kids.map((k, i) => <OrgCard key={k.id ?? i} node={k} onClick={() => setPath([...path, k])} />)}
          </div>
        </>
      )}
    </div>
  )
}

// ── RecordMerge ───────────────────────────────────────────────────────────────────────────────────

/**
 * RecordMerge (compare & merge): one column per record, one row per field; the user picks a value
 * per row (or types one when the field is editable); "differences only" hides equal rows. The merge
 * action gets the RN core's `_merged` + `_choices` (+ the component's parameters).
 */
export function RecordMerge({ component, metadata }: CatalogueProps) {
  const controller = useController()
  const merge = metadata as unknown as RecordMergeMeta & { title?: string; mergeLabel?: string }
  const records = merge.records ?? []
  const [picks, setPicks] = useState<MergePicks>(() => initialPicks(merge))
  const [custom, setCustom] = useState<Record<string, string>>({})
  const [differencesOnly, setDifferencesOnly] = useState(merge.differencesOnly === true)
  useEffect(() => { setPicks(initialPicks(merge)); setCustom({}) }, [metadata]) // eslint-disable-line react-hooks/exhaustive-deps
  const fields = visibleFields(merge, differencesOnly)
  const id = String(component['id'] ?? 'merge')
  return (
    <div style={{ display: 'grid', gap: 'var(--base-size-12)', ...styleOf(component, BOX_STYLE) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--base-size-16)', flexWrap: 'wrap' }}>
        {merge.title && <Text as="h3" weight="semibold" style={{ margin: 0 }}>{merge.title}</Text>}
        <FormControl>
          <Checkbox checked={differencesOnly} onChange={(e) => setDifferencesOnly(e.currentTarget.checked)} />
          <FormControl.Label>Differences only</FormControl.Label>
        </FormControl>
        <Text size="small" className="mv-muted" style={{ marginLeft: 'auto' }}>{summaryText(mergeSummary(merge, picks))}</Text>
      </div>
      <div className="mv-box" style={{ overflowX: 'auto' }}>
        <table className="mv-table">
          <thead>
            <tr>
              <th scope="col">Field</th>
              {records.map((r, i) => <th key={r.id ?? i} scope="col">{r.label}{r.caption ? <div style={{ fontWeight: 400 }}>{r.caption}</div> : null}</th>)}
              <th scope="col">Merged</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => {
              const group = `${id}-${f.fieldId}`
              const pick = picks[f.fieldId]
              return (
                <tr key={f.fieldId} style={{ background: f.differs ? 'var(--bgColor-attention-muted)' : undefined }}>
                  <th scope="row" style={{ background: 'transparent', color: 'var(--fgColor-default)' }}>{f.label}</th>
                  {records.map((r, i) => (
                    <td key={r.id ?? i}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--base-size-8)', cursor: 'pointer' }}>
                        <Radio name={group} value={r.id ?? ''} checked={pick === r.id} aria-label={pickLabel(r.label ?? r.id ?? '', f.label ?? f.fieldId)}
                          onChange={() => setPicks((p) => ({ ...p, [f.fieldId]: r.id ?? '' }))} />
                        <span>{valueText((f.values ?? [])[i]) || <span className="mv-muted">—</span>}</span>
                      </label>
                    </td>
                  ))}
                  <td>
                    {(() => { const pickedText = valueText((f.values ?? [])[records.findIndex((r) => r.id === pick)]); return f.editable ? (
                      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--base-size-8)' }}>
                        <Radio name={group} value={CUSTOM} checked={pick === CUSTOM} aria-label={`Type a value for ${f.label ?? f.fieldId}`}
                          onChange={() => setPicks((p) => ({ ...p, [f.fieldId]: CUSTOM }))} />
                        <TextInput size="small" aria-label={`${f.label ?? f.fieldId}, typed value`} value={pick === CUSTOM ? custom[f.fieldId] ?? '' : pickedText} placeholder="Type a value"
                          onChange={(e) => { const v = e.currentTarget.value; setPicks((p) => ({ ...p, [f.fieldId]: CUSTOM })); setCustom((c) => ({ ...c, [f.fieldId]: v })) }} />
                      </label>
                    ) : <Text style={{ color: 'var(--fgColor-accent)' }}>{pickedText}</Text> })()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {merge.mergeActionId && (
        <div><Button variant="primary" onClick={() => void controller.runAction(String(merge.mergeActionId), mergeParameters(merge, picks, custom))}>{merge.mergeLabel || 'Merge'}</Button></div>
      )}
    </div>
  )
}
