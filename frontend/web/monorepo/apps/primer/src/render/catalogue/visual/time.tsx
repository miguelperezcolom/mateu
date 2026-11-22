import React, { useEffect, useRef, useState } from 'react'
import { SegmentedControl, Text } from '@primer/react'
import {
  agenda, anchorOf, dayA11yLabel, dayInfo, dayOfMonth, dayParameters, eventA11yLabel, eventsOn, initialView,
  isDayActionable, monthWeeks, periodDates, periodTitle, switcherViews, timeRange, todayIso, viewLabel, weekdayShort,
  dateLabel, WEEKDAY_HEADERS, type CalendarEventMeta, type CalendarMeta, type CalendarView,
} from '@rn/renderer/calendar'
import { DAY_MS, ganttLayout, laneBlocks, parseDay, planningRows, planningWindow, todayDayNumber, todayOffset } from '@rn/renderer/timeline'
import { ganttSelection } from '@rn/renderer/ganttSelection'
import { addDaysIso } from '@rn/renderer/planningDrag'
import type { GanttTask, PlanningBlock as WireBlock, PlanningResource as WireResource } from '@rn/api/metadata'

// the wire carries more than the RN types name (PlanningBlockDto.summary/icon, PlanningResourceDto.attributes)
type PlanningBlock = WireBlock & { summary?: string; icon?: string }
type PlanningResource = WireResource & { attributes?: string[] }
import { useController } from '../../ViewHost'
import { BOX_STYLE, styleOf } from '../../styleOf'
import type { CatalogueProps } from '../types'
import { activate, arr, colorOf, str, toneBg, toneFg, type Dict } from './common'
import { tx } from '../../../i18n/texts'

// ── Calendar ──────────────────────────────────────────────────────────────────────────────────────

/**
 * Calendar: month (anchor = the wire's `month`), week, day and list views — switched in the browser
 * when the server offers several (`views`); per-date labels/tones (`days`); a clickable day runs
 * `dayActionId` with `_date`, an event its `actionId` with `_clickedEvent` (the RN core's rules).
 */
export function Calendar({ component, metadata }: CatalogueProps) {
  const controller = useController()
  const m = metadata as unknown as CalendarMeta
  const [view, setView] = useState<CalendarView>(() => initialView(m))
  useEffect(() => setView(initialView(m)), [metadata]) // eslint-disable-line react-hooks/exhaustive-deps
  const anchor = anchorOf(m)
  const today = todayIso()
  const views = switcherViews(m)
  const dayActionable = isDayActionable(m)
  const pressDay = (date: string) => void controller.runAction(String(m.dayActionId), { ...dayParameters(date) })
  const pressEvent = (e: CalendarEventMeta) => e.actionId && void controller.runAction(e.actionId, { _clickedEvent: e })

  const eventChip = (e: CalendarEventMeta, i: number) => {
    const color = colorOf(e.color, 'var(--borderColor-accent-emphasis)')
    const label = `${timeRange(e) ? timeRange(e) + ' ' : ''}${e.title ?? ''}`
    return e.actionId ? (
      <button key={i} type="button" className="mv-cal-ev mv-clickable" style={{ borderLeftColor: color }} aria-label={eventA11yLabel(e)}
        onClick={(ev) => { ev.stopPropagation(); pressEvent(e) }}>{label}</button>
    ) : <div key={i} className="mv-cal-ev" style={{ borderLeftColor: color }} title={label}>{label}</div>
  }
  const dayCell = (date: string | null, i: number, tall = false) => {
    if (!date) return <div key={i} className="mv-cal-day mv-out" />
    const info = dayInfo(m, date)
    const tone = info.tone
    const props = dayActionable ? { ...activate(() => pressDay(date)), 'aria-label': dayA11yLabel(m, date), className: 'mv-cal-day mv-clickable' } : { className: 'mv-cal-day', 'aria-label': dayA11yLabel(m, date) }
    return (
      <div key={date} {...props} style={{ minHeight: tall ? '16rem' : undefined, background: tone ? toneBg(tone) : undefined }}>
        <span className={'mv-cal-num' + (date === today ? ' mv-today' : '')}>{dayOfMonth(date)}</span>
        {info.label && <span className="mv-cal-label" style={{ color: tone ? toneFg(tone) : 'var(--fgColor-muted)' }}>{info.label}</span>}
        {eventsOn(m, date).map((e, i) => eventChip(e, i))}
      </div>
    )
  }

  let body: React.ReactNode
  if (view === 'list') {
    const groups = agenda(m, anchor)
    body = groups.length === 0 ? <Text className="mv-muted">{tx('noEvents')}</Text> : (
      <div className="mv-agenda">
        {groups.map((g) => (
          <div key={g.date}>
            <Text as="div" weight="semibold" size="small" style={{ marginBottom: 'var(--base-size-4)' }}>{dateLabel(g.date)}</Text>
            <div style={{ display: 'grid', gap: 4 }}>{g.events.map((e, i) => eventChip(e, i))}</div>
          </div>
        ))}
      </div>
    )
  } else if (view === 'month') {
    body = (
      <div className="mv-cal-grid" role="grid">
        {WEEKDAY_HEADERS.map((d) => <div key={d} className="mv-cal-wd" role="columnheader">{d}</div>)}
        {monthWeeks(anchor).flat().map((d, i) => dayCell(d, i))}
      </div>
    )
  } else {
    const dates = periodDates(view, anchor)
    body = (
      <div className="mv-cal-grid" style={{ gridTemplateColumns: `repeat(${dates.length}, minmax(0, 1fr))` }}>
        {dates.map((d) => <div key={`h${d}`} className="mv-cal-wd">{weekdayShort(d)} {dayOfMonth(d)}</div>)}
        {dates.map((d, i) => dayCell(d, i, true))}
      </div>
    )
  }
  return (
    <div style={styleOf(component, BOX_STYLE)}>
      <div className="mv-cal-head">
        <Text as="h3" weight="semibold" style={{ margin: 0, fontSize: 'var(--text-title-size-small)' }}>{periodTitle(view, anchor)}</Text>
        {views.length > 1 && (
          <SegmentedControl aria-label={tx('calendarView')} size="small" onChange={(i) => setView(views[i])}>
            {views.map((v) => <SegmentedControl.Button key={v} selected={v === view}>{viewLabel(v)}</SegmentedControl.Button>)}
          </SegmentedControl>
        )}
      </div>
      {body}
    </div>
  )
}

// ── Gantt ─────────────────────────────────────────────────────────────────────────────────────────

/** Gantt: the RN core's layout (day width, month ticks, bars, today); a bar runs onTaskSelectionActionId. */
export function Gantt({ component, metadata }: CatalogueProps) {
  const controller = useController()
  const selectAction = metadata['onTaskSelectionActionId'] as string | undefined
  const layout = ganttLayout(arr<GanttTask>(metadata['tasks']))
  if (!layout) return <Text className="mv-muted">No tasks.</Text>
  const { tasks, minDay, maxDay, dayW, laneW, months, bars } = layout
  const todayX = todayOffset(todayDayNumber(), minDay, maxDay, dayW)
  const select = (t: GanttTask) => {
    const s = ganttSelection(selectAction, t.id)
    if (s) void controller.runAction(s.actionId, s.parameters)
  }
  return (
    <div className="mv-tl mv-box" style={styleOf(component, BOX_STYLE)}>
      <div className="mv-tl-labels">
        <div className="mv-tl-head" />
        {tasks.map((t, i) => <div key={t.id ?? i} className="mv-tl-label" title={t.title}>{t.title ?? t.id}</div>)}
      </div>
      <div className="mv-tl-scroll">
        <div style={{ width: Math.max(laneW, 200), position: 'relative' }}>
          <div className="mv-tl-head">
            {months.map((mth, i) => <span key={i} style={{ position: 'absolute', left: mth.left + 4, top: 6 }}>{mth.label}</span>)}
          </div>
          {bars.map(({ task: t, left, width, progress }, i) => (
            <div key={t.id ?? i} className="mv-tl-lane">
              <button type="button" className={'mv-tl-bar' + (selectAction ? ' mv-clickable' : '')} disabled={!selectAction}
                style={{ left, width, background: colorOf(t.color, 'var(--bgColor-accent-emphasis)'), cursor: selectAction ? 'pointer' : 'default' }}
                title={`${t.title ?? ''}: ${t.start} → ${t.end}, ${progress}%`} aria-label={`${t.title ?? ''}, ${t.start} to ${t.end}, ${progress}% done`}
                onClick={() => select(t)}>
                <span className="mv-tl-progress" style={{ width: `${progress}%` }} />
                <span style={{ position: 'relative' }}>{width > 60 ? t.title : ''}</span>
              </button>
            </div>
          ))}
          {todayX != null && <div className="mv-tl-today" style={{ left: todayX }} aria-hidden />}
        </div>
      </div>
    </div>
  )
}

// ── Planning board ────────────────────────────────────────────────────────────────────────────────

const DAY_W = 36

interface Drag { mode: 'move' | 'resize' | 'range'; block?: PlanningBlock; resourceId: string; x0: number; startIdx: number; endIdx: number; dx: number; target?: string }

/**
 * PlanningBoard (resources × days, the tape chart): a block clicked runs selectActionId
 * (`_blockId`), double-clicked openActionId; dragged runs moveActionId, its right edge
 * resizeActionId, a drag across empty days rangeSelectActionId — all with
 * {_blockId?, _resourceId, _start, _end}, like the web and RN boards.
 */
export function PlanningBoard({ component, metadata }: CatalogueProps) {
  const controller = useController()
  const resources = arr<PlanningResource>(metadata['resources'])
  const blocks = arr<PlanningBlock>(metadata['blocks'])
  const attrCols = arr<string>(metadata['attributeColumns']).map(str)
  const win = planningWindow(blocks, metadata['from'] as string | undefined, metadata['to'] as string | undefined)
  const [drag, setDrag] = useState<Drag | null>(null)
  const dragRef = useRef<Drag | null>(null)
  dragRef.current = drag
  const moved = useRef(false)
  if (resources.length === 0 || !win) return <Text className="mv-muted">No planning data.</Text>
  const { minDay, maxDay, totalDays } = win
  const fromIso = new Date(minDay * DAY_MS).toISOString().slice(0, 10)
  const iso = (idx: number) => addDaysIso(fromIso, idx)
  const rows = planningRows(resources)
  const todayDay = todayDayNumber()
  const days = Array.from({ length: totalDays }, (_, i) => new Date((minDay + i) * DAY_MS))
  const act = (id: unknown, params: Dict) => typeof id === 'string' && id && void controller.runAction(id, params)

  const begin = (e: React.PointerEvent, d: Drag) => {
    if (e.button > 0) return
    moved.current = false
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    setDrag(d)
  }
  const onMove = (e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d) return
    const dx = e.clientX - d.x0
    if (Math.abs(dx) > 4) moved.current = true
    const lane = document.elementsFromPoint(e.clientX, e.clientY).find((el) => (el as HTMLElement).dataset?.resource) as HTMLElement | undefined
    setDrag({ ...d, dx, target: lane?.dataset.resource ?? d.target })
  }
  const end = () => {
    const d = dragRef.current
    setDrag(null)
    if (!d || !moved.current) return
    const shift = Math.round(d.dx / DAY_W)
    if (d.mode === 'move' && d.block) {
      const len = d.endIdx - d.startIdx
      const s = Math.max(0, Math.min(totalDays - 1 - len, d.startIdx + shift))
      const target = d.target ?? d.resourceId
      if (s !== d.startIdx || target !== d.resourceId) act(metadata['moveActionId'], { _blockId: d.block.id, _resourceId: target, _start: iso(s), _end: iso(s + len) })
    } else if (d.mode === 'resize' && d.block) {
      const e2 = Math.max(d.startIdx, Math.min(totalDays - 1, d.endIdx + shift))
      if (e2 !== d.endIdx) act(metadata['resizeActionId'], { _blockId: d.block.id, _resourceId: d.resourceId, _start: iso(d.startIdx), _end: iso(e2) })
    } else if (d.mode === 'range') {
      const a = d.startIdx, b = Math.max(0, Math.min(totalDays - 1, d.startIdx + shift))
      act(metadata['rangeSelectActionId'], { _resourceId: d.resourceId, _start: iso(Math.min(a, b)), _end: iso(Math.max(a, b)) })
    }
  }
  const canMove = !!metadata['moveActionId'], canResize = !!metadata['resizeActionId'], canRange = !!metadata['rangeSelectActionId']

  return (
    <div className="mv-tl mv-box" style={styleOf(component, BOX_STYLE)} onPointerMove={onMove} onPointerUp={end} onPointerCancel={() => setDrag(null)}>
      <div className="mv-tl-labels" style={{ display: 'grid', gridTemplateColumns: `repeat(${1 + attrCols.length}, auto)` }}>
        <div className="mv-tl-head" style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'subgrid' }}>
          <span />{attrCols.map((c) => <span key={c} style={{ padding: '6px 8px' }}>{c}</span>)}
        </div>
        {rows.map((row, i) => row.kind === 'group'
          ? <div key={i} className="mv-tl-group" style={{ gridColumn: '1 / -1' }}>{row.label}</div>
          : <React.Fragment key={i}>
              <div className="mv-tl-label">{row.resource.label ?? row.resource.id}</div>
              {attrCols.map((_, ci) => <div key={ci} className="mv-tl-label mv-muted">{str(((row.resource as PlanningResource).attributes ?? [])[ci])}</div>)}
            </React.Fragment>)}
      </div>
      <div className="mv-tl-scroll">
        <div style={{ width: totalDays * DAY_W, position: 'relative' }}>
          <div className="mv-tl-head">
            {days.map((d, i) => {
              const weekend = d.getUTCDay() === 0 || d.getUTCDay() === 6
              return (
                <div key={i} className={'mv-tl-day' + (weekend ? ' mv-tl-weekend' : '')} style={{ left: i * DAY_W, width: DAY_W, fontWeight: minDay + i === todayDay ? 600 : undefined, color: minDay + i === todayDay ? 'var(--fgColor-accent)' : undefined }}>
                  {'SMTWTFS'[d.getUTCDay()]}<br />{d.getUTCDate()}
                </div>
              )
            })}
          </div>
          {rows.map((row, i) => {
            if (row.kind === 'group') return <div key={i} className="mv-tl-lane mv-group" />
            const rid = row.resource.id ?? ''
            const hovered = drag?.mode === 'move' && drag.target === rid
            return (
              <div key={i} className="mv-tl-lane" data-resource={rid} style={{ background: hovered ? 'var(--bgColor-accent-muted)' : undefined }}
                onPointerDown={canRange ? (e) => {
                  if (e.target !== e.currentTarget) return
                  const x = e.clientX - (e.currentTarget as HTMLElement).getBoundingClientRect().left
                  const idx = Math.floor(x / DAY_W)
                  begin(e, { mode: 'range', resourceId: rid, x0: e.clientX, startIdx: idx, endIdx: idx, dx: 0 })
                } : undefined}>
                {days.map((d, di) => (d.getUTCDay() === 0 || d.getUTCDay() === 6) && <div key={di} className="mv-tl-weekend" style={{ position: 'absolute', top: 0, bottom: 0, left: di * DAY_W, width: DAY_W, pointerEvents: 'none' }} />)}
                {drag?.mode === 'range' && drag.resourceId === rid && (() => {
                  const b = Math.max(0, Math.min(totalDays - 1, drag.startIdx + Math.round(drag.dx / DAY_W)))
                  const lo = Math.min(drag.startIdx, b), hi = Math.max(drag.startIdx, b)
                  return <div style={{ position: 'absolute', top: 4, bottom: 4, left: lo * DAY_W, width: (hi - lo + 1) * DAY_W, background: 'var(--bgColor-accent-muted)', border: 'var(--borderWidth-thin) dashed var(--borderColor-accent-emphasis)', borderRadius: 4, pointerEvents: 'none' }} />
                })()}
                {laneBlocks(blocks, rid, minDay, maxDay, DAY_W).map(({ block: wb, left, width }) => {
                  const block = wb as PlanningBlock
                  const startIdx = Math.max(0, (parseDay(block.start) ?? minDay) - minDay)
                  const endIdx = Math.min(totalDays - 1, (parseDay(block.end) ?? minDay) - minDay)
                  const mine = drag?.block?.id === block.id
                  const shift = mine ? Math.round((drag!.dx) / DAY_W) * DAY_W : 0
                  const l = mine && drag!.mode === 'move' ? left + shift : left
                  const w = mine && drag!.mode === 'resize' ? Math.max(DAY_W, width + shift) : width
                  return (
                    <button key={block.id} type="button" className="mv-tl-bar mv-clickable"
                      style={{ left: l, width: w, background: colorOf(block.color ?? block.status, 'var(--bgColor-accent-emphasis)'), opacity: mine ? 0.75 : 1, touchAction: 'none', cursor: canMove ? 'grab' : 'pointer' }}
                      title={[block.label, block.summary, `${block.start} → ${block.end}`].filter(Boolean).join('\n')}
                      aria-label={`${block.label ?? block.id}, ${block.start} to ${block.end}`}
                      onPointerDown={canMove ? (e) => { e.stopPropagation(); begin(e, { mode: 'move', block, resourceId: rid, target: rid, x0: e.clientX, startIdx, endIdx, dx: 0 }) } : undefined}
                      onClick={() => { if (!moved.current) act(metadata['selectActionId'], { _blockId: block.id }) }}
                      onDoubleClick={() => act(metadata['openActionId'], { _blockId: block.id })}>
                      {block.icon && !block.icon.includes(':') ? block.icon + ' ' : ''}{block.label}
                      {canResize && (
                        <span aria-hidden style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, cursor: 'ew-resize' }}
                          onPointerDown={(e) => { e.stopPropagation(); begin(e, { mode: 'resize', block, resourceId: rid, x0: e.clientX, startIdx, endIdx, dx: 0 }) }} />
                      )}
                    </button>
                  )
                })}
                {minDay <= todayDay && todayDay <= maxDay && <div className="mv-tl-today" style={{ left: (todayDay - minDay) * DAY_W + DAY_W / 2 }} aria-hidden />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

