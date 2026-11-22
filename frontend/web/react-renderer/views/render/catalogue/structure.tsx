import React, { useEffect, useRef, useState } from 'react'
import { Banner, Dialog, Text } from '@kit'
import { evaluateExpression } from '@rn/core/expressions'
import { contentSlots } from '@rn/renderer/wireWidgets'
import { useController, ViewHost } from '@mr/render/ViewHost'
import { ComponentRenderer } from '../ComponentRenderer'
import { styleOf } from '@mr/render/styleOf'
import type { Catalogue, CatalogueProps, Dict } from './types'
import { CustomComponent } from './custom'
import { tx } from '@mr/i18n/texts'

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v))
const kidsOf = (c: Dict): unknown[] => ((c['children'] as unknown[] | undefined) ?? [])

function Kids({ list, state, data }: { list: unknown[]; state: Dict; data?: unknown }) {
  return <>{list.map((c, i) => <ComponentRenderer key={i} component={c} state={state} data={data} />)}</>
}

/**
 * ContentLayout: the page's main column with an aside (start or end, its declared width, sticky when
 * asked) and a footer under both — slots `aside-N` / `footer-N`, the rest is main. The aside drops
 * under the main column while the layout is narrower than ~48rem (measured on the layout itself).
 */
function ContentLayout({ component, metadata: m, state, data }: CatalogueProps) {
  const { main, aside, footer } = contentSlots(kidsOf(component))
  const ref = useRef<HTMLDivElement>(null)
  const [wide, setWide] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((e) => setWide((e[0]?.contentRect.width ?? 1000) >= 768))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const asideFirst = m['asidePosition'] === 'start'
  const asideWidth = str(m['asideWidth']) || '18rem'
  const side = aside.length > 0 && wide
  const mainCol = <div key="main" style={{ minWidth: 0, display: 'grid', gap: 'var(--stack-gap-normal)', alignContent: 'start' }}><Kids list={main} state={state} data={data} /></div>
  const asideCol = aside.length > 0 ? (
    <aside key="aside" style={{ minWidth: 0, display: 'grid', gap: 'var(--stack-gap-normal)', alignContent: 'start', ...(side && m['asideSticky'] ? { position: 'sticky', top: 'var(--base-size-16)', alignSelf: 'start' } : {}) }}>
      <Kids list={aside} state={state} data={data} />
    </aside>
  ) : null
  const columns = asideFirst ? `${asideWidth} minmax(0, 1fr)` : `minmax(0, 1fr) ${asideWidth}`
  return (
    <div ref={ref} style={{ display: 'grid', gap: 'var(--stack-gap-normal)', ...styleOf(component) }}>
      <div style={{ display: 'grid', gap: 'var(--stack-gap-normal)', gridTemplateColumns: side ? columns : 'minmax(0, 1fr)', alignItems: 'start' }}>
        {asideFirst ? [asideCol, mainCol] : [mainCol, asideCol]}
      </div>
      {footer.length > 0 && <div style={{ display: 'grid', gap: 'var(--stack-gap-normal)' }}><Kids list={footer} state={state} data={data} /></div>}
    </div>
  )
}

/**
 * A ConfirmDialog in a tree: Primer's Dialog, open while its `openedCondition` holds (no condition =
 * open as soon as it arrives), answered ONCE — confirm / reject / cancel run the ids the server named.
 */
function ConfirmDialog({ component, metadata: m, state, data }: CatalogueProps) {
  const controller = useController()
  const [answered, setAnswered] = useState(false)
  useEffect(() => setAnswered(false), [m])
  let opened = !m['openedCondition']
  if (m['openedCondition']) {
    try {
      opened = Boolean(evaluateExpression(str(m['openedCondition']), { state, data, appState: controller.session.appState }))
    } catch {
      opened = false
    }
  }
  if (!opened || answered) return null
  const answer = (actionId: unknown) => {
    setAnswered(true)
    if (typeof actionId === 'string' && actionId) void controller.runAction(actionId)
  }
  const footer: { content: string; buttonType?: 'default' | 'primary'; onClick: () => void }[] = []
  if (m['canCancel']) footer.push({ content: str(m['cancelText']) || (m['rejectText'] && !m['canReject'] ? str(m['rejectText']) : tx('cancel')), onClick: () => answer(m['cancelActionId']) })
  if (m['canReject']) footer.push({ content: str(m['rejectText']) || tx('no'), onClick: () => answer(m['rejectActionId']) })
  footer.push({ content: str(m['confirmText']) || tx('ok'), buttonType: 'primary', onClick: () => answer(m['confirmActionId']) })
  return (
    <Dialog title={str(m['header']) || tx('confirm')} onClose={() => answer(m['cancelActionId'])} footerButtons={footer} width="medium">
      <Kids list={kidsOf(component)} state={state} data={data} />
      {m['content'] && typeof m['content'] === 'object' ? <ComponentRenderer component={m['content']} state={state} data={data} /> : null}
    </Dialog>
  )
}

/** A Notification found in a tree (one an action returns arrives as a toast instead): an inline banner. */
function Notification({ metadata: m }: CatalogueProps) {
  const title = str(m['title'])
  const text = str(m['text'])
  if (!title && !text) return null
  return <Banner title={title || text} description={title ? text || undefined : undefined} variant="info" hideTitle={false} />
}

/**
 * An App inside content (a federated shell, a crud mediator's own shell): hosted as an embedded view
 * aimed at its home — its chrome is the page's, its screens load in place.
 */
function NestedApp({ metadata: m }: CatalogueProps) {
  const { session } = useController()
  const target = {
    label: str(m['title']),
    route: str(m['homeRoute']) || str(m['route']),
    consumedRoute: str(m['homeConsumedRoute']),
    serverSideType: str(m['homeServerSideType']) || str(m['serverSideType']),
  }
  return <ViewHost key={`${target.route}|${target.serverSideType}`} session={session} target={target} embedded />
}

/** A grid column (or a group of them) outside its Grid / Crud: its header text. */
function GridColumn({ metadata: m }: CatalogueProps) {
  return <Text weight="semibold" size="small">{str(m['label'] ?? m['id'])}</Text>
}

/** The structural wire types the core switch leaves to the catalogue. */
export const structure: Catalogue = {
  ContentLayout,
  ConfirmDialog,
  Notification,
  App: NestedApp,
  GridColumn,
  GridGroupColumn: GridColumn,
  CustomComponent,
}
