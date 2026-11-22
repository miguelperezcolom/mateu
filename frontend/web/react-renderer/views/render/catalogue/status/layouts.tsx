import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Heading, IconButton, Label, Text } from '@kit'
import { ChevronLeftIcon, ChevronRightIcon, ArrowLeftIcon, PencilIcon, FoldIcon, UnfoldIcon, PlayIcon, PauseIcon } from '@kit/icons'
import { foldoutOpenStates } from '@rn/core/foldoutFit'
import { foldoutSummaryOf } from '@rn/renderer/patternGaps'
import { useController } from '@mr/render/ViewHost'
import { ComponentRenderer } from '../../ComponentRenderer'
import { BOX_STYLE, styleOf } from '@mr/render/styleOf'
import { type CatalogueProps, type Dict, childrenOf, list, metaOf, slotOf, str, useText } from './common'
import { tx } from '@mr/i18n/texts'

/** The width an element is given (ResizeObserver); 0 before the first layout. */
function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T | null>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => setWidth(entries[0]?.contentRect.width ?? 0))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width]
}

const Kids = ({ list: kids, state, data }: { list: unknown[]; state: Dict; data?: unknown }) =>
  <>{kids.map((c, i) => <ComponentRenderer key={i} component={c} state={state} data={data} />)}</>

/** Dashboard tiles on a grid: the declared column count, else as many ~18rem columns as fit. */
export function DashboardLayout({ component, metadata: m, state, data }: CatalogueProps) {
  const columns = Number(m['columns'] ?? 0) || 0
  return (
    <div className="mateu-st-dashboard" style={{
      gridTemplateColumns: columns > 0 ? `repeat(${columns}, minmax(0, 1fr))` : 'repeat(auto-fit, minmax(min(18rem, 100%), 1fr))',
      ...styleOf(component),
    }}>
      {childrenOf(component).map((c, i) => {
        const cm = metaOf(c)
        const col = Math.max(1, Number(cm['colSpan'] ?? 1) || 1)
        const row = Math.max(1, Number(cm['rowSpan'] ?? 1) || 1)
        return (
          <div key={i} style={{ gridColumn: col > 1 ? `span ${columns > 0 ? Math.min(col, columns) : col}` : undefined, gridRow: row > 1 ? `span ${row}` : undefined, minWidth: 0 }}>
            <ComponentRenderer component={c} state={state} data={data} />
          </div>
        )
      })}
    </div>
  )
}

/** A dashboard tile: a titled box around its content. */
export function DashboardPanel({ component, metadata: m, state, data }: CatalogueProps) {
  const t = useText(state, data)
  return (
    <section className="mateu-st-card mateu-st-panel" aria-label={t(m['title']) || undefined}>
      {(m['title'] || m['subtitle']) ? (
        <header className="mateu-st-stack-xs">
          {m['title'] ? <Heading as="h3" className="mateu-st-h">{t(m['title'])}</Heading> : null}
          {m['subtitle'] ? <Text size="small" className="mateu-st-muted">{t(m['subtitle'])}</Text> : null}
        </header>
      ) : null}
      <div className="mateu-st-stack"><Kids list={childrenOf(component)} state={state} data={data} /></div>
    </section>
  )
}

/** A board: rows of items side by side (weighted by boardCols), stacked when narrow. */
export function BoardLayout({ component, metadata: m, state, data }: CatalogueProps) {
  const rows = list<Dict>(m['rows'])
  return (
    <div className="mateu-st-stack" style={styleOf(component)}>
      {rows.length > 0
        ? rows.map((r, i) => <BoardRow key={i} items={list<unknown>(r['content'])} state={state} data={data} />)
        : <Kids list={childrenOf(component)} state={state} data={data} />}
    </div>
  )
}

export function BoardLayoutRow({ component, state, data }: CatalogueProps) {
  return <BoardRow items={childrenOf(component)} state={state} data={data} />
}

export function BoardLayoutItem({ component, state, data }: CatalogueProps) {
  return <div className="mateu-st-stack"><Kids list={childrenOf(component)} state={state} data={data} /></div>
}

function BoardRow({ items, state, data }: { items: unknown[]; state: Dict; data?: unknown }) {
  return (
    <div className="mateu-st-board-row">
      {items.map((c, i) => (
        <div key={i} style={{ flex: `${Number(metaOf(c)['boardCols'] ?? 1) || 1} 1 16rem`, minWidth: 0 }}>
          <ComponentRenderer component={c} state={state} data={data} />
        </div>
      ))}
    </div>
  )
}

/** Two panes side by side (or one over the other) with a splitter: dragged, or moved with the arrow keys. */
export function SplitLayout({ component, metadata: m, state, data }: CatalogueProps) {
  const vertical = str(m['orientation']) === 'vertical'
  const kids = childrenOf(component)
  const box = useRef<HTMLDivElement>(null)
  const [pct, setPct] = useState(50)
  const clamp = (n: number) => Math.max(10, Math.min(90, n))
  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    const el = box.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const move = (ev: PointerEvent) => setPct(clamp(vertical ? ((ev.clientY - rect.top) / rect.height) * 100 : ((ev.clientX - rect.left) / rect.width) * 100))
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2
    if (e.key === (vertical ? 'ArrowUp' : 'ArrowLeft')) { e.preventDefault(); setPct((p) => clamp(p - step)) }
    if (e.key === (vertical ? 'ArrowDown' : 'ArrowRight')) { e.preventDefault(); setPct((p) => clamp(p + step)) }
    if (e.key === 'Home') { e.preventDefault(); setPct(10) }
    if (e.key === 'End') { e.preventDefault(); setPct(90) }
  }
  return (
    <div ref={box} className={`mateu-st-split-layout mateu-st-splitter-host${vertical ? ' mateu-st-vertical' : ''}${str(m['variant']) === 'minimal' ? ' mateu-st-minimal' : ''}`} style={styleOf(component, BOX_STYLE)}>
      <div className="mateu-st-pane" style={{ flex: `0 0 ${pct}%` }}>{kids[0] ? <ComponentRenderer component={kids[0]} state={state} data={data} /> : null}</div>
      <div className="mateu-st-splitter" role="separator" tabIndex={0} aria-orientation={vertical ? 'horizontal' : 'vertical'}
        aria-valuemin={10} aria-valuemax={90} aria-valuenow={Math.round(pct)} aria-label={tx('resizePanes')}
        onPointerDown={onPointerDown} onKeyDown={onKeyDown} />
      <div className="mateu-st-pane">{kids[1] ? <ComponentRenderer component={kids[1]} state={state} data={data} /> : null}</div>
    </div>
  )
}

/** Master and detail: side by side (detail below when `vertical`, or when narrow). The detail is
 *  the server's `data.detailComponent` (a row picked) or the static second child. */
export function MasterDetailLayout({ component, metadata: m, state, data }: CatalogueProps) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const kids = childrenOf(component)
  const d = (data as Dict | undefined) ?? {}
  const detail = (d['detailComponent'] as unknown) ?? kids[1]
  const stacked = str(m['orientation']) === 'vertical' || (width > 0 && width < 640)
  return (
    <div ref={ref} className={`mateu-st-split-layout${stacked ? ' mateu-st-vertical' : ''}`} style={styleOf(component, BOX_STYLE)}>
      <div className="mateu-st-pane">{kids[0] ? <ComponentRenderer component={kids[0]} state={state} data={data} /> : null}</div>
      <div className="mateu-st-pane">
        {detail ? <ComponentRenderer component={detail} state={state} data={data} /> : <Text className="mateu-st-muted">{tx('selectItemForDetails')}</Text>}
      </div>
    </div>
  )
}

/** Slides one at a time: previous / next, dots, keys, and auto-advance (stopped while hovered or focused, or under reduced motion). */
export function CarouselLayout({ component, metadata: m, state, data }: CatalogueProps) {
  const slides = childrenOf(component)
  const n = slides.length
  const loop = m['loop'] === true
  const disabled = m['disabled'] === true
  const [index, setIndex] = useState(() => Math.max(0, Math.min(n - 1, Number(m['selected'] ?? 0) || 0)))
  const [paused, setPaused] = useState(false)
  // the user's own stop (WCAG 2.2.2): auto-advance stays off until they press play again
  const [stopped, setStopped] = useState(false)
  const go = (i: number) => { if (!n || disabled) return; setIndex(loop ? (i + n) % n : Math.max(0, Math.min(n - 1, i))) }
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const auto = m['auto'] === true && n > 1 && !reduced
  useEffect(() => {
    if (!auto || paused || stopped) return
    const timer = setTimeout(() => setIndex((i) => (i + 1) % n), Number(m['duration'] ?? 0) || 5000)
    return () => clearTimeout(timer)
  }, [index, paused, stopped, n, auto, m])
  // a horizontal swipe changes slide (unless the carousel says it may not)
  const swipe = useRef<number | null>(null)
  const onPointerDown = (e: React.PointerEvent) => { if (m['disableSwipe'] !== true && e.pointerType !== 'mouse') swipe.current = e.clientX }
  const onPointerUp = (e: React.PointerEvent) => {
    if (swipe.current == null) return
    const dx = e.clientX - swipe.current
    swipe.current = null
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1))
  }
  return (
    <section className="mateu-st-carousel" aria-roledescription="carousel" aria-label={str(m['alt']) || undefined}
      onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { swipe.current = null }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      onKeyDown={(e) => { if (m['disableKeys'] === true) return; if (e.key === 'ArrowLeft') go(index - 1); if (e.key === 'ArrowRight') go(index + 1) }}
      style={styleOf(component, BOX_STYLE)}>
      <div aria-live={auto && !paused && !stopped ? 'off' : 'polite'}>
        {slides.map((s, i) => (
          <div key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${n}`} hidden={i !== index}>
            <ComponentRenderer component={s} state={state} data={data} />
          </div>
        ))}
      </div>
      {n > 1 && (
        <div className="mateu-st-row mateu-st-center">
          {m['nav'] !== false && <IconButton icon={ChevronLeftIcon} aria-label={tx('previousSlide')} variant="invisible" disabled={disabled || (!loop && index === 0)} onClick={() => go(index - 1)} />}
          {m['dots'] !== false && slides.map((_, i) => (
            <button key={i} type="button" className={`mateu-st-dot${i === index ? ' mateu-st-dot-on' : ''}`} aria-label={tx('slideN', { n: i + 1 })} aria-current={i === index ? 'true' : undefined} onClick={() => go(i)} disabled={disabled} />
          ))}
          {m['nav'] !== false && <IconButton icon={ChevronRightIcon} aria-label={tx('nextSlide')} variant="invisible" disabled={disabled || (!loop && index === n - 1)} onClick={() => go(index + 1)} />}
          {auto && <IconButton icon={stopped ? PlayIcon : PauseIcon} aria-label={stopped ? tx('carouselPlay') : tx('carouselPause')} variant="invisible" onClick={() => setStopped((v) => !v)} />}
        </div>
      )}
    </section>
  )
}

interface FoldoutPanel { title?: string; subtitle?: string; icon?: string; open?: boolean | null; autoOpen?: boolean | null; width?: string | null }

/** A record laid out as an overview and side panels that fold to a strip (the shared fit rule
 *  decides which auto panels start open); its own navigation (parent, previous / next) on top. */
export function FoldoutLayout({ component, metadata: m, state, data }: CatalogueProps) {
  const controller = useController()
  const t = useText(state, data)
  const [ref, width] = useWidth<HTMLDivElement>()
  const panels = list<FoldoutPanel>(m['panels'])
  const children = childrenOf(component)
  const overview = children.find((c) => slotOf(c) === 'overview')
  const fitted = useMemo(() => foldoutOpenStates(panels.map((p) => ({ open: p.open === true ? true : p.open === false ? false : p.open, autoOpen: p.autoOpen, width: p.width })), width || null), [panels, width])
  const [toggled, setToggled] = useState<Record<number, boolean>>({})
  const isOpen = (i: number) => toggled[i] ?? fitted[i] ?? true
  const nav = (m['navigation'] as Dict | undefined) ?? null
  const run = (id: unknown) => { if (str(id)) void controller.runAction(str(id)) }
  return (
    <div className="mateu-st-stack" ref={ref}>
      {(m['headerTitle'] || nav) ? (
        <div className="mateu-st-row mateu-st-between">
          <div className="mateu-st-row">
            {nav && nav['parentActionId'] ? <IconButton icon={ArrowLeftIcon} variant="invisible" aria-label={t(nav['parentLabel']) || tx('back')} onClick={() => run(nav['parentActionId'])} /> : null}
            {m['headerTitle'] || nav?.['title'] ? <Heading as="h2" className="mateu-st-h2">{t(m['headerTitle'] ?? nav?.['title'])}</Heading> : null}
            {list<string>(m['badges']).map((b, i) => <Label key={i} variant="secondary">{t(b)}</Label>)}
          </div>
          {nav && (nav['previousActionId'] || nav['nextActionId']) ? (
            <div className="mateu-st-row">
              <IconButton icon={ChevronLeftIcon} aria-label={tx('previous')} disabled={!nav['previousActionId']} onClick={() => run(nav['previousActionId'])} />
              <IconButton icon={ChevronRightIcon} aria-label={tx('next')} disabled={!nav['nextActionId']} onClick={() => run(nav['nextActionId'])} />
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="mateu-st-foldout">
        {overview ? (
          <section className="mateu-st-card mateu-st-foldout-overview">
            {m['overviewEditActionId'] ? <div className="mateu-st-row" style={{ justifyContent: 'flex-end' }}><IconButton icon={PencilIcon} size="small" variant="invisible" aria-label={tx('edit')} onClick={() => run(m['overviewEditActionId'])} /></div> : null}
            <ComponentRenderer component={overview} state={state} data={data} />
          </section>
        ) : null}
        {panels.map((p, i) => {
          const open = isOpen(i)
          const content = children.find((c) => slotOf(c) === `panel-${i}`)
          const summary = foldoutSummaryOf(children, i)
          const title = t(p.title)
          if (!open) {
            return (
              <section key={i} className="mateu-st-card mateu-st-foldout-strip" aria-label={title}>
                <IconButton icon={UnfoldIcon} size="small" variant="invisible" aria-label={tx('openNamed', { name: title })} aria-expanded={false} onClick={() => setToggled({ ...toggled, [i]: true })} />
                <span className="mateu-st-strip-title">{title}</span>
                {summary ? <div className="mateu-st-strip-summary"><ComponentRenderer component={summary} state={state} data={data} /></div> : null}
              </section>
            )
          }
          return (
            <section key={i} className="mateu-st-card mateu-st-foldout-panel" style={{ flexBasis: p.width || '22rem' }} aria-label={title}>
              <header className="mateu-st-row mateu-st-between">
                <div className="mateu-st-stack-xs">
                  <Heading as="h3" className="mateu-st-h">{p.icon && !/:/.test(p.icon) ? `${p.icon} ` : ''}{title}</Heading>
                  {p.subtitle ? <Text size="small" className="mateu-st-muted">{t(p.subtitle)}</Text> : null}
                </div>
                <IconButton icon={FoldIcon} size="small" variant="invisible" aria-label={tx('foldNamed', { name: title })} aria-expanded onClick={() => setToggled({ ...toggled, [i]: false })} />
              </header>
              {content ? <ComponentRenderer component={content} state={state} data={data} /> : null}
            </section>
          )
        })}
      </div>
    </div>
  )
}

/** A long list in a scrolling box (its declared height, else 24rem): components or plain values. */
export function VirtualList({ component, metadata: m, state, data }: CatalogueProps) {
  const items = list<unknown>((m['page'] as Dict | undefined)?.['content'])
  const box = styleOf(component, BOX_STYLE)
  return (
    <ul className="mateu-st-virtual" tabIndex={0} aria-label={tx('list')} style={{ maxHeight: box.height ?? box.maxHeight ?? '24rem', ...box }}>
      {items.map((it, i) => (
        <li key={i}>
          {it && typeof it === 'object' && ('metadata' in (it as Dict) || 'type' in (it as Dict))
            ? <ComponentRenderer component={it} state={state} data={data} />
            : <Text>{str(it)}</Text>}
        </li>
      ))}
    </ul>
  )
}
