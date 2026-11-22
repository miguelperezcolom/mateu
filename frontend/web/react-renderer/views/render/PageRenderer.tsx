import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Banner, Breadcrumbs, IconButton, Label, PageHeader, Stack, Text } from '@kit'
import { ArrowLeftIcon } from '@kit/icons'
import { interpolate } from '@rn/core/expressions'
import type { PageBanner } from '@rn/core/MateuViewController'
import { useController, useEmbeddedChrome } from '@mr/render/ViewHost'
import { usePageFabs, type FabLike } from '@mr/shell/fabs'
import { ComponentRenderer } from './ComponentRenderer'
import { labelVariantOf } from './looks'
import { WireIcon } from './catalogue/display/shared'
import { HeaderButton, HeaderButtons, splitToolbar, useHeaderPress } from './page/HeaderButtons'
import { PageStatus, PeerNav, RecordSwitcherControl, useHeaderNavigate } from './page/HeaderExtras'
import { PageTocAside, usePageLayout } from './page/PageToc'
import { sectionsOf, showsToc } from '@mr/page/toc'
import './page/page.css'
import { tx } from '@mr/i18n/texts'

export { ActionButton } from './page/HeaderButtons'

type Dict = Record<string, unknown>
type Ctx = { state: Dict; data?: unknown; appState?: unknown }

const HEADING = ['h2', 'h3', 'h4', 'h5', 'h6'] as const

/**
 * A Page or a Form — the whole Mateu page contract (PageDto / FormDto) in Primer's grammar:
 * PageHeader (crumbs and the overline as its context; the way back, the avatar, the title — or its
 * dimmed placeholder —, the status, badges and the record switcher in the title area; the header
 * widgets, peer arrows, Cancel-like buttons apart and the toolbar — groups and split buttons — as its
 * actions; subtitle, timestamp and facts as its description), then the banners (static and the ones
 * an action returned), the content — with the @Toc index beside it, the header pinned and the
 * sticky sections stacked under it —, the bottom buttons and the footer.
 */
export function PageRenderer({ component, metadata, state, data }: { component: Dict; metadata: Dict; state: Dict; data?: unknown }) {
  const controller = useController()
  const ctx: Ctx = { state, data, appState: controller.session.appState }
  // a micro frontend's declared chrome: NONE = no header, COMPACT = its actions only, PAGE = no trail
  const chrome = useEmbeddedChrome()
  const level = Math.max(0, Number(metadata['level'] ?? 0) || 0)
  const noHeader = metadata['noHeader'] === true
  const readOnly = metadata['readOnly'] === true
  const children = (component['children'] as unknown[] | undefined) ?? []
  const buttons = ((metadata['buttons'] as Dict[] | undefined) ?? []).filter((b) => b && b['label'])
  const footer = (metadata['footer'] as unknown[] | undefined) ?? []
  const compactDensity = /--mateu-compact\s*:\s*1/.test(String(component['style'] ?? ''))
  // the page's floating buttons join the ONE floating column of the global layer (a page in an
  // overlay or an island has none of its own on screen)
  usePageFabs(controller.windowless ? [] : (metadata['fabs'] as FabLike[] | undefined), (id) => void controller.runAction(id), (l) => interpolate(l, ctx))

  // @Toc: tri-state, the page's own section cards (a top-level page only)
  const sections = useMemo(() => sectionsOf(children), [children])
  const toc = level === 0 && !controller.windowless && showsToc(metadata['toc'], sections)
  const rootRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const { active, jump } = usePageLayout(rootRef, headerRef, { toc, count: sections.entries.length, layoutKey: children })

  const header = chrome === 'NONE' && level === 0 ? null : (
    <PageHeaderBlock metadata={metadata} ctx={ctx} level={level} compact={chrome === 'COMPACT'} noCrumbs={!!chrome} noHeader={noHeader} readOnly={readOnly} />
  )

  return (
    <div ref={rootRef} className={'mateu-page' + (compactDensity ? ' mateu-compact' : '')} data-page-level={level}>
      <Stack gap={compactDensity ? 'normal' : 'spacious'}>
        {header && <div ref={headerRef} className={'mateu-page-header-wrap' + (toc ? ' is-sticky' : '')}>{header}</div>}
        <Banners metadata={metadata} state={state} data={data} />
        <div className={'mateu-page-body' + (toc ? ' with-toc' : '')}>
          <Stack gap="normal">
            {children.map((child, i) => <ComponentRenderer key={i} component={child} state={state} data={data} />)}
            {!readOnly && buttons.length > 0 && (
              <Stack direction="horizontal" justify="end" gap="condensed" wrap="wrap" className="mateu-page-buttons"
                style={{ borderTop: 'var(--borderWidth-thin) solid var(--borderColor-muted)', paddingTop: 'var(--base-size-16)' }}>
                {buttons.map((b, i) => <HeaderButton key={i} button={b} ctx={ctx} />)}
              </Stack>
            )}
          </Stack>
          {toc && <PageTocAside entries={sections.entries} active={active} onJump={jump} />}
        </div>
        {footer.length > 0 && (
          <div className="mateu-page-footer">
            {footer.map((f, i) => <ComponentRenderer key={i} component={f} state={state} data={data} />)}
          </div>
        )}
      </Stack>
    </div>
  )
}

function PageHeaderBlock({ metadata, ctx, level, compact, noCrumbs, noHeader, readOnly }: {
  metadata: Dict; ctx: Ctx; level: number; compact: boolean; noCrumbs: boolean; noHeader: boolean; readOnly: boolean
}) {
  const controller = useController()
  const navigate = useHeaderNavigate()
  const run = useHeaderPress(ctx)
  const text = (v: unknown) => (typeof v === 'string' && v ? interpolate(v, ctx) : '')
  // COMPACT chrome keeps the actions only: the toolbar, the header widgets, the record navigation
  const full = !compact && !noHeader
  const title = full ? text(metadata['title']) : ''
  const placeholder = full && !title.trim() ? text(metadata['titlePlaceholder']) : ''
  const overline = full ? text(metadata['overline']) : ''
  const subtitle = full ? text(metadata['subtitle']) : ''
  const timestamp = full ? text(metadata['timestamp']) : ''
  const badges = full ? ((metadata['badges'] as Dict[] | undefined) ?? []) : []
  const kpis = full ? ((metadata['kpis'] as Dict[] | undefined) ?? []) : []
  const avatar = full ? metadata['avatar'] : null
  const icon = full ? metadata['icon'] : null
  const status = full ? (metadata['status'] as Dict | null | undefined) : null
  const switcher = noHeader ? null : (metadata['switcher'] as Dict | null | undefined)
  const peerNav = metadata['peerNav'] as Dict | null | undefined
  const hasPeers = !!peerNav && !!(peerNav['prevRoute'] || peerNav['nextRoute'])
  const widgets = (metadata['header'] as unknown[] | undefined) ?? []
  const toolbarAll = ((metadata['toolbar'] as Dict[] | undefined) ?? []).filter((b) => b && (b['label'] || (b['children'] as unknown[] | undefined)?.length))
  // the declared @Action buttons a read-only page does not offer
  const declared = readOnly ? [] : ((metadata['actions'] as Dict[] | undefined) ?? []).filter((a) => a && a['label'])
  // Back reads as a chevron before the title — only where there IS a title area to put it in
  const { back, nav, actions } = splitToolbar([...toolbarAll, ...declared], !noHeader)
  // the trail: a top-level page's own, not inside a micro frontend
  const crumbs = metadata['noBreadcrumbs'] === true || noCrumbs || level > 0 ? [] : ((metadata['breadcrumbs'] as Dict[] | undefined) ?? [])
  const shownBadges = badges.filter((b) => text(String(b['text'] ?? b['label'] ?? '')).trim())

  const hasTitleArea = !!(title || placeholder || back || avatar || icon || shownBadges.length || switcher || (status && status['message']))
  const hasActions = hasPeers || nav.length > 0 || actions.length > 0
  // the header widgets (HeaderSupplier: facts, chips…) take their own row under the title: beside
  // it, Primer's actions area squeezed the title into a narrow column
  const hasDescription = !!(subtitle || timestamp || kpis.length || widgets.length)
  if (!hasTitleArea && !hasActions && !hasDescription && !crumbs.length && !overline) return null
  const hasTitleRow = hasTitleArea || !!crumbs.length || !!overline

  const Heading = HEADING[Math.min(level, HEADING.length - 1)]
  const actionsNode = hasActions && (
    <Stack direction="horizontal" gap="condensed" wrap="wrap" align="center">
      {hasPeers && <PeerNav peerNav={peerNav!} ctx={ctx} />}
      <HeaderButtons nav={nav} actions={actions} ctx={ctx} />
    </Stack>
  )

  // a header with no title area (noHeader, COMPACT chrome): the widgets and actions on one row
  if (!hasTitleRow) {
    return (
      <Stack direction="horizontal" justify="end" gap="condensed" wrap="wrap" align="center">
        {widgets.map((w, i) => <ComponentRenderer key={`w${i}`} component={w} state={ctx.state} data={ctx.data} />)}
        {actionsNode}
      </Stack>
    )
  }

  return (
    <PageHeader role={level === 0 && !controller.windowless ? 'banner' : undefined} aria-label={title || placeholder || undefined}>
      {(crumbs.length > 0 || overline) && (
        <PageHeader.ContextArea hidden={false}>
          <Stack gap="condensed">
            {crumbs.length > 0 && (
              <Breadcrumbs>
                {crumbs.map((c, i) => {
                  const route = String(c['link'] ?? c['route'] ?? '')
                  const last = i === crumbs.length - 1
                  return (
                    <Breadcrumbs.Item key={i} href={route ? '#' : undefined} selected={last && !route}
                      onClick={(e: React.MouseEvent) => { e.preventDefault(); if (route) void navigate(route, String(c['label'] ?? '')) }}>
                      {text(String(c['label'] ?? c['text'] ?? ''))}
                    </Breadcrumbs.Item>
                  )
                })}
              </Breadcrumbs>
            )}
            {overline && <span className="mateu-page-overline">{overline}</span>}
          </Stack>
        </PageHeader.ContextArea>
      )}
      {hasTitleArea && (
        <PageHeader.TitleArea variant={level === 0 ? 'medium' : 'subtitle'}>
          {back && (
            <PageHeader.LeadingAction>
              <IconButton icon={ArrowLeftIcon} aria-label={interpolate(String(back['label'] ?? tx('back')), ctx)} variant="invisible" onClick={run(back).onPress} />
            </PageHeader.LeadingAction>
          )}
          {(!!avatar || !!icon) && (
            <PageHeader.LeadingVisual>
              {avatar ? <ComponentRenderer component={avatar} state={ctx.state} data={ctx.data} /> : <WireIcon token={icon} size={24} />}
            </PageHeader.LeadingVisual>
          )}
          <PageHeader.Title as={Heading}>
            {title || (placeholder ? <span className="mateu-page-title-placeholder">{placeholder}</span> : null)}
          </PageHeader.Title>
          {(shownBadges.length > 0 || switcher || status) && (
            <PageHeader.TrailingVisual>
              <Stack direction="horizontal" gap="condensed" align="center" wrap="wrap">
                {status && <PageStatus status={status} ctx={ctx} />}
                {shownBadges.map((b, i) => <Label key={i} variant={labelVariantOf(b)} size={b['small'] === true ? 'small' : undefined}>{text(String(b['text'] ?? b['label'] ?? ''))}</Label>)}
                {switcher && <RecordSwitcherControl switcher={switcher} ctx={ctx} />}
              </Stack>
            </PageHeader.TrailingVisual>
          )}
        </PageHeader.TitleArea>
      )}
      {actionsNode && <PageHeader.Actions>{actionsNode}</PageHeader.Actions>}
      {hasDescription && (
        <PageHeader.Description>
          <Stack gap="condensed">
            {subtitle && <Text className="mateu-page-subtitle">{subtitle}</Text>}
            {timestamp && <Text className="mateu-page-timestamp">{timestamp}</Text>}
            {widgets.length > 0 && (
              <Stack direction="horizontal" gap="normal" wrap="wrap" align="center" className="mateu-page-widgets">
                {widgets.map((w, i) => <ComponentRenderer key={`w${i}`} component={w} state={ctx.state} data={ctx.data} />)}
              </Stack>
            )}
            {kpis.length > 0 && (
              <div className="mateu-page-facts">
                {kpis.map((k, i) => (
                  <div key={i} className="mateu-page-fact">
                    <span className="mateu-page-fact-label">{text(String(k['title'] ?? ''))}</span>
                    <span className="mateu-page-fact-value">{text(String(k['text'] ?? ''))}</span>
                  </div>
                ))}
              </div>
            )}
          </Stack>
        </PageHeader.Description>
      )}
    </PageHeader>
  )
}

/**
 * @Banner (theme, closeable, timeoutSeconds) + the banners an action returned (replace or append —
 * the core keeps them, and drops them on navigation): Primer Banners under the header.
 */
function Banners({ metadata, state, data }: { metadata: Dict; state: Dict; data?: unknown }) {
  const controller = useController()
  const statics = (metadata['banners'] as PageBanner[] | undefined) ?? []
  const fromActions = controller.actionBanners
  const all = useMemo(() => [
    ...statics.map((b, i) => ({ b, key: `s${i}` })),
    ...fromActions.map((b, i) => ({ b, key: `a${i}:${b.title ?? ''}:${b.description ?? ''}` })),
  ], [statics, fromActions])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  // a new set of action banners is a new message: what was closed before does not hide it
  useEffect(() => setDismissed((d) => new Set([...d].filter((k) => k.startsWith('s')))), [fromActions])
  useEffect(() => {
    const timers = all
      .filter(({ b }) => (b.timeoutSeconds ?? 0) > 0)
      .map(({ b, key }) => setTimeout(() => setDismissed((d) => new Set(d).add(key)), (b.timeoutSeconds ?? 0) * 1000))
    return () => timers.forEach(clearTimeout)
  }, [all])
  const visible = all.filter(({ key }) => !dismissed.has(key))
  if (visible.length === 0) return null
  return (
    <Stack gap="condensed" className="mateu-page-banners">
      {visible.map(({ b, key }) => {
        const theme = String(b.theme ?? 'info').toLowerCase()
        const variant = theme === 'danger' || theme === 'error' ? 'critical' : theme === 'warning' ? 'warning' : theme === 'success' ? 'success' : 'info'
        const title = interpolate(String(b.title ?? ''), { state, data })
        return (
          <Banner
            key={key}
            title={title || tx('toastInfo')}
            hideTitle={!title}
            description={b.description ? interpolate(b.description, { state, data }) : undefined}
            variant={variant}
            onDismiss={b.hasCloseButton ? () => setDismissed((d) => new Set(d).add(key)) : undefined}
          />
        )
      })}
    </Stack>
  )
}
