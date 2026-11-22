import React, { useEffect, useRef, useState } from 'react'
import { ActionList, ActionMenu, Banner, Button, ButtonGroup, Heading, IconButton, Label, Link, ProgressBar, Spinner, Stack, Text } from '@primer/react'
import { TriangleDownIcon } from '@primer/octicons-react'
import { Blankslate, SkeletonText, UnderlinePanels } from '@primer/react/experimental'
import { interpolate } from '@rn/core/expressions'
import { headingLevel, rowJustification } from '@rn/core/uxRules'
import { shortcutMatches } from '@rn/core/keyShortcuts'
import { buttonGroupMembers, splitButtonParts } from '@rn/core/buttonGroup'
import { useController, ViewHost } from './ViewHost'
import { FieldRenderer } from './FieldRenderer'
import { PageRenderer } from './PageRenderer'
import { CrudRenderer } from './CrudRenderer'
import { useButtonPress } from './useButtonPress'
import { usePending } from './usePending'
import { buttonVariantOf, labelVariantOf } from './looks'
import { LAYOUT_STYLE, styleOf } from './styleOf'
import { Markdown } from './Markdown'
import { CATALOGUE } from './catalogue'
import { RenderBoundary } from './RenderBoundary'
import { Element, MicroFrontend } from './Embedded'

type Dict = Record<string, unknown>

interface Props {
  component: unknown
  state: Dict
  data?: unknown
}

const meta = (c: unknown): Dict => (((c as Dict | null)?.['metadata'] as Dict | undefined) ?? {})
const childrenOf = (c: unknown): unknown[] => (((c as Dict | null)?.['children'] as unknown[] | undefined) ?? [])
const node = (v: unknown): Dict | null => (v && typeof v === 'object' ? (v as Dict) : null)

/**
 * One wire node → Primer. The wire types this renderer does not draw yet are an explicit
 * <mateu-unsupported> (what e2e/conformance.mjs counts), never a silent hole.
 */
export function ComponentRenderer({ component, state, data }: Props) {
  if (!component || typeof component !== 'object') return null
  const comp = component as Dict
  if (comp['type'] === 'ServerSide') return <Island component={comp} />
  return <ClientSide component={comp} state={state} data={data} />
}

/** A nested ServerSide node is an embedded island with its own controller (its state, its actions). */
function Island({ component }: { component: Dict }) {
  const { session } = useController()
  return <ViewHost session={session} serverSideNode={component} embedded />
}


/** What a core drawer of a wire type gets (the switch's locals, worked out once). */
interface NodeProps {
  component: Dict
  m: Dict
  type: string
  state: Dict
  data?: unknown
  controller: ReturnType<typeof useController>
  ctx: { state: Dict; data?: unknown; appState: Dict }
  kids: (c?: unknown) => React.ReactNode[]
}
type Draw = (p: NodeProps) => React.ReactNode

function ClientSide({ component, state, data }: { component: Dict; state: Dict; data?: unknown }) {
  const controller = useController()
  const m = meta(component)
  const type = String(m['type'] ?? '')
  const p: NodeProps = {
    component, m, type, state, data, controller,
    ctx: { state, data, appState: controller.session.appState },
    kids: (c: unknown = component) => childrenOf(c).map((child, i) => <ComponentRenderer key={i} component={child} state={state} data={data} />),
  }
  const draw = CORE[type]
  if (draw) return <>{draw(p)}</>
  // the families drawn in catalogue/ (display, status, visualisation, structure)
  const Drawn = CATALOGUE[type]
  // each catalogue component contained: one that fails is a note in its place, not a dead screen
  // (display/status/visual load on demand: a placeholder line while the family's chunk arrives)
  if (Drawn) return <RenderBoundary compact><React.Suspense fallback={<SkeletonText />}><Drawn component={component} metadata={m} state={state} data={data} /></React.Suspense></RenderBoundary>
  // a type this renderer does not draw yet — said, never silently dropped
  return React.createElement('mateu-unsupported', { 'data-type': type || 'unknown' }, `Not drawn by the Primer renderer yet: ${type || 'unknown'}`)
}

const page: Draw = ({ component, m, state, data }) => <PageRenderer component={component} metadata={m} state={state} data={data} />

// the form's columns (the server inferred or was told how many): a responsive grid
const formLayout: Draw = ({ component, m, state, data }) => {
  const columns = Math.max(1, Number(m['maxColumns'] ?? m['columns'] ?? 1) || 1)
  // labelsAside (the dense back-office idiom, inferred or declared): label left in a 10rem column
  return (
    <div className={m['labelsAside'] === true ? 'mateu-labels-aside' : undefined} style={{
      display: 'grid', gap: 'var(--stack-gap-normal)',
      gridTemplateColumns: columns > 1 ? `repeat(auto-fit, minmax(min(16rem, 100%), 1fr))` : '1fr',
    }}>
      {childrenOf(component).map((child, i) => (
        <div key={i} style={{ gridColumn: spanOf(child, columns), minWidth: 0 }}>
          <ComponentRenderer component={child} state={state} data={data} />
        </div>
      ))}
    </div>
  )
}

const ALIGN: Record<string, string> = { START: 'flex-start', CENTER: 'center', END: 'flex-end', STRETCH: 'stretch', BASELINE: 'baseline' }
const alignOf = (v: unknown): string | undefined => ALIGN[String(v ?? '').toUpperCase()]

/** A row / column's children, each wrapped in its share when the layout declares `flexGrows`. */
function stackKids({ component, m, state, data, kids }: NodeProps, direction: 'row' | 'column'): React.ReactNode[] {
  const grows = m['flexGrows']
  if (!Array.isArray(grows) || !grows.some((g) => typeof g === 'number' && g > 0)) return kids()
  return childrenOf(component).map((child, i) => {
    const g = typeof grows[i] === 'number' ? (grows[i] as number) : 0
    return (
      <div key={i} style={{ flexGrow: g, flexShrink: 1, flexBasis: g > 0 ? 0 : 'auto', minWidth: 0, ...(direction === 'column' ? { display: 'flex', flexDirection: 'column' } : {}) }}>
        <ComponentRenderer component={child} state={state} data={data} />
      </div>
    )
  })
}

// declared alignment / justification win over Stack's defaults (a toolbar row pushed to the end)
const vertical: Draw = (p) => (
  <Stack direction="vertical" gap={p.m['spacing'] === false ? 'none' : 'normal'}
    style={{ alignItems: alignOf(p.m['horizontalAlignment']), justifyContent: rowJustification(p.m['justification'] as string | undefined) ?? undefined, ...styleOf(p.component) }}>
    {stackKids(p, 'column')}
  </Stack>
)

// an overlay found INSIDE a tree (a page's docked detail panel, a Gantt page's task drawer):
// drawn in place as a panel — an overlay the server opens arrives as an Add fragment instead
const inlineOverlay: Draw = ({ component, m, state, data }) => {
  const panel = { ...component, metadata: { ...m, title: m['headerTitle'] ?? m['title'], content: m['content'] } }
  return <Box component={{ ...panel, style: m['width'] ? `width: ${String(m['width'])}; max-width: 100%` : component['style'] }} state={state} data={data} level={2} />
}

// a ComponentAdapter's nested island / a custom field: its content node, under its label
const customField: Draw = ({ m, ctx, state, data }) => {
  if (!node(m['content'])) return null
  return (
    <div>
      {m['label'] ? <Text as="div" size="small" weight="semibold" style={{ marginBottom: 'var(--base-size-4)' }}>{interpolate(String(m['label']), ctx)}</Text> : null}
      <ComponentRenderer component={m['content']} state={state} data={data} />
    </div>
  )
}

const tabLayout: Draw = ({ component, m, state, data }) => <TabLayout component={component} m={m} state={state} data={data} />

const text: Draw = ({ component, m, ctx }) => {
  const value = interpolate(String(m['text'] ?? ''), ctx)
  const level = headingLevel(m['container'] as string | undefined)
  // its own layout style (a section title's `flex: 1` pushes the toolbar to the row's end)
  const own = styleOf(component)
  if (level > 0) {
    return <Heading as={`h${level}` as 'h2'} variant={level <= 2 ? 'medium' : 'small'} style={{ margin: 0, ...own }}>{value}</Heading>
  }
  // variants: b = bold, i = italic
  const variants = (m['variants'] as string[] | undefined) ?? []
  return (
    <Text as="p" size={TEXT_SIZE[String(m['size'] ?? '')] ?? 'medium'}
      style={{ margin: m['noMargins'] ? 0 : undefined, fontWeight: variants.includes('b') ? 600 : undefined, fontStyle: variants.includes('i') ? 'italic' : undefined, ...own }}>
      {value}
    </Text>
  )
}
const TEXT_SIZE: Record<string, 'large' | 'medium' | 'small'> = { xl: 'large', l: 'large', s: 'small', xs: 'small' }

// `${state.vip ? 'VIP' : ''}`: a badge whose text comes out empty is not shown
const badge: Draw = ({ m, ctx }) => {
  const value = interpolate(String(m['text'] ?? ''), ctx)
  return value.trim() ? <Label variant={labelVariantOf(m)}>{value}</Label> : null
}

const anchor: Draw = ({ m, ctx }) => {
  const url = String(m['url'] ?? '')
  return <Link href={safeHref(url)} target={m['target'] ? String(m['target']) : undefined}>{interpolate(String(m['text'] ?? url), ctx)}</Link>
}

// `valueKey` reads the value off the state (a LongTask's progress); `indeterminate` = busy, no amount
const progressBar: Draw = ({ m, state }) => {
  const label = String(m['text'] ?? m['label'] ?? '') || 'Progress'
  if (m['indeterminate'] === true) return <Spinner size="small" srText={label} />
  const key = typeof m['valueKey'] === 'string' && m['valueKey'] ? m['valueKey'] : ''
  const value = Number((key ? state[key] : undefined) ?? m['value'] ?? 0) || 0
  const min = Number(m['min'] ?? 0) || 0
  const max = Number(m['max'] ?? 1) || 1
  const progress = max > min ? Math.round(((value - min) / (max - min)) * 100) : 0
  return (
    <div>
      {m['text'] ? <Text as="div" size="small" style={{ marginBottom: 'var(--base-size-4)' }}>{label}</Text> : null}
      <ProgressBar progress={Math.min(100, Math.max(0, progress))} aria-label={label} />
    </div>
  )
}

const emptyState: Draw = ({ m, controller }) => (
  <Blankslate>
    {m['title'] ? <Blankslate.Heading>{String(m['title'])}</Blankslate.Heading> : null}
    {m['description'] ? <Blankslate.Description>{String(m['description'])}</Blankslate.Description> : null}
    {m['actionId'] && m['actionLabel'] ? (
      <Blankslate.PrimaryAction onClick={() => void controller.runAction(String(m['actionId']))}>{String(m['actionLabel'])}</Blankslate.PrimaryAction>
    ) : null}
  </Blankslate>
)

const NOTICE_VARIANT: Record<string, 'critical' | 'warning' | 'success' | 'info'> = { danger: 'critical', warning: 'warning', success: 'success' }
const notice: Draw = ({ component, m, ctx, controller, kids }) => {
  const value = interpolate(String(m['text'] ?? ''), ctx)
  const content = childrenOf(component)
  if (!value.trim() && content.length === 0) return null
  return (
    <Banner
      title={value || 'Notice'}
      hideTitle={!value}
      description={content.length ? <>{kids()}</> : undefined}
      variant={NOTICE_VARIANT[String(m['theme'] ?? 'info')] ?? 'info'}
      layout={m['slim'] ? 'compact' : 'default'}
      primaryAction={m['actionId'] && m['actionLabel'] ? (
        <Banner.PrimaryAction onClick={() => void controller.runAction(String(m['actionId']))}>{String(m['actionLabel'])}</Banner.PrimaryAction>
      ) : undefined}
    />
  )
}

const image: Draw = ({ component, m, ctx, controller }) => {
  const src = controller.session.backendUrl(interpolate(String(m['src'] ?? ''), ctx))
  return <img src={src} alt={interpolate(String(m['alt'] ?? ''), ctx)} style={{ maxWidth: '100%', ...styleOf(component) }} />
}

/** The wire types the core draws itself; the rest are the catalogue's. */
const CORE: Record<string, Draw> = {
  Page: page,
  Form: page,
  Crud: ({ component, m, state, data }) => <CrudRenderer component={component} metadata={m} state={state} data={data} />,
  FormField: ({ m, state }) => <FieldRenderer metadata={m} state={state} />,
  FormLayout: formLayout,
  VerticalLayout: vertical,
  Div: vertical,
  Container: vertical,
  FullWidth: vertical,
  Scroller: vertical,
  Drawer: inlineOverlay,
  Dialog: inlineOverlay,
  MicroFrontend: ({ component, m }) => <MicroFrontend component={component} metadata={m} />,
  Element: ({ m, state, data }) => <Element metadata={m} state={state} data={data} />,
  ResponsiveGrid: ({ component, state, data }) => <ResponsiveGrid component={component} state={state} data={data} />,
  CustomField: customField,
  FormRow: ({ kids }) => (
    <div style={{ display: 'grid', gap: 'var(--stack-gap-normal)', gridTemplateColumns: `repeat(auto-fit, minmax(min(14rem, 100%), 1fr))` }}>
      {kids()}
    </div>
  ),
  HorizontalLayout: (p) => (
    <Stack direction="horizontal" wrap="wrap" gap={p.m['spacing'] === false ? 'none' : 'normal'} align="center"
      style={{ alignItems: alignOf(p.m['verticalAlignment']), justifyContent: rowJustification(p.m['justification'] as string | undefined) ?? undefined, ...styleOf(p.component) }}>
      {stackKids(p, 'row')}
    </Stack>
  ),
  FormSection: ({ component, state, data }) => <Box component={component} state={state} data={data} level={2} />,
  Card: ({ component, state, data }) => <Box component={component} state={state} data={data} level={2} />,
  FormSubSection: ({ component, state, data }) => <Box component={component} state={state} data={data} level={3} />,
  TabLayout: tabLayout,
  Tab: ({ kids }) => <>{kids()}</>,
  AccordionLayout: ({ component, state, data }) => <Stack gap="condensed">{childrenOf(component).map((panel, i) => <AccordionPanel key={i} panel={panel} state={state} data={data} />)}</Stack>,
  AccordionPanel: ({ component, state, data }) => <AccordionPanel panel={component} state={state} data={data} />,
  Button: ({ component, m, state, data }) => <ContentButton metadata={m} state={state} data={data} id={String(component['id'] ?? '')} />,
  Text: text,
  Separator: () => <hr style={{ border: 0, borderTop: 'var(--borderWidth-thin) solid var(--borderColor-muted)', margin: 'var(--base-size-8) 0', gridColumn: '1 / -1' }} />,
  Badge: badge,
  Anchor: anchor,
  ProgressBar: progressBar,
  EmptyState: emptyState,
  Notice: notice,
  Skeleton: ({ m }) => <SkeletonText lines={Math.max(1, Number(m['count'] ?? 3) || 3)} />,
  Image: image,
  // never interpolated (a page documenting `${state.x}` shows it as written), a reading measure
  Markdown: ({ component, m }) => <div style={{ maxWidth: '72ch', ...styleOf(component) }}><Markdown source={String(m['markdown'] ?? m['text'] ?? '')} /></div>,
  BulletedList: ({ m }) => <ul style={{ margin: 0, paddingInlineStart: 'var(--base-size-20)' }}>{((m['items'] as unknown[]) ?? []).map((it, i) => <li key={i}>{String(it)}</li>)}</ul>,
  // no type, only children: a root the core composed (a component-tree archetype's page)
  '': ({ component, kids }) => <Stack direction="vertical" gap="normal" style={styleOf(component)}>{kids()}</Stack>,
}

/** The wire types drawn here or in the catalogue (what a conformance count reads). */
// a function, not a constant: the catalogue modules import this one (read after both have loaded)
export const supportedTypes = (): Set<string> => new Set([...Object.keys(CORE).filter(Boolean), ...Object.keys(CATALOGUE)])

/**
 * A ResponsiveGrid as the CSS grid it describes (tracks, named areas, spans), stacked into one
 * column while the grid itself is narrower than its `stackBelow` — measured on the grid, not the
 * window: a grid inside a drawer is narrow on a wide screen.
 */
function ResponsiveGrid({ component, state, data }: { component: Dict; state: Dict; data?: unknown }) {
  const m = meta(component)
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(Infinity)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => setWidth(entries[0]?.contentRect.width ?? Infinity))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const stackBelow = lengthPx(String(m['stackBelow'] ?? ''))
  const stacked = stackBelow > 0 && width < stackBelow
  const areas = String(m['gridTemplateAreas'] ?? '').trim()
  const spans = (m['colSpans'] as number[] | undefined) ?? []
  // a slot listed in stickyAreas stays pinned while the rest of the grid scrolls
  const sticky = new Set(((m['stickyAreas'] as string[] | undefined) ?? []).map(String))
  const kids = childrenOf(component)
  return (
    <div
      ref={ref}
      style={{
        display: 'grid',
        gap: String(m['gap'] ?? '') || 'var(--stack-gap-normal)',
        gridTemplateColumns: stacked ? '1fr' : String(m['gridTemplateColumns'] ?? '') || undefined,
        // the wire carries CSS's own quoted rows (`"main aside"`); a slot names its area
        gridTemplateAreas: stacked || !areas ? undefined : areas,
        alignItems: 'start',
      }}
    >
      {kids.map((child, i) => {
        const slot = String((child as Dict)?.['slot'] ?? meta(child)['slot'] ?? '')
        return (
          <div key={i} style={{
            minWidth: 0, gridArea: !stacked && areas && slot ? slot : undefined, gridColumn: !stacked && spans[i] && spans[i] > 1 ? `span ${spans[i]}` : undefined,
            ...(!stacked && areas && sticky.has(slot) ? { position: 'sticky', top: 'var(--base-size-16)', alignSelf: 'start', height: 'fit-content' } : {}),
          }}>
            <ComponentRenderer component={child} state={state} data={data} />
          </div>
        )
      })}
    </div>
  )
}

/**
 * A TabLayout as Primer's UnderlinePanels: the tab marked `active` (@Tab(open = true)) starts selected,
 * and each tab's `shortcut` (@Tab(shortcut = "alt+1")) selects it from anywhere on the page.
 */
function TabLayout({ component, m, state, data }: { component: Dict; m: Dict; state: Dict; data?: unknown }) {
  const controller = useController()
  const tabs = childrenOf(component)
  const initial = Math.max(0, tabs.findIndex((t) => meta(t)['active'] === true))
  const [selected, setSelected] = useState(`t${initial}`)
  const shortcuts = tabs.map((t) => String(meta(t)['shortcut'] ?? '')).join('|')
  useEffect(() => {
    const keys = shortcuts.split('|')
    if (!keys.some(Boolean)) return
    const onKey = (e: KeyboardEvent) => {
      const i = keys.findIndex((k) => shortcutMatches(k, e))
      if (i < 0) return
      e.preventDefault()
      setSelected(`t${i}`)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [shortcuts])
  const ctx = { state, data, appState: controller.session.appState }
  return (
    <UnderlinePanels aria-label={String(m['label'] ?? 'Tabs')} value={selected} onChange={({ value }) => setSelected(value)}>
      {tabs.map((tab, i) => (
        <UnderlinePanels.Tab key={`t${i}`} value={`t${i}`} counter={meta(tab)['badge'] != null && meta(tab)['badge'] !== '' ? String(meta(tab)['badge']) : undefined}>
          {interpolate(String(meta(tab)['label'] ?? ''), ctx)}
        </UnderlinePanels.Tab>
      ))}
      {tabs.map((tab, i) => (
        <UnderlinePanels.Panel key={`p${i}`} value={`t${i}`}>
          <div style={{ paddingTop: 'var(--base-size-16)' }}>
            {childrenOf(tab).map((c, k) => <ComponentRenderer key={k} component={c} state={state} data={data} />)}
          </div>
        </UnderlinePanels.Panel>
      ))}
    </UnderlinePanels>
  )
}

/** A CSS length in px for a width comparison (`40rem` → 640); 0 when it is not one. */
function lengthPx(v: string): number {
  const match = /^(\d+(?:\.\d+)?)(rem|em|px)?$/.exec(v.trim())
  if (!match) return 0
  const n = Number(match[1])
  return match[2] === 'px' ? n : n * 16
}

/** A titled, outlined region: Primer has no Card component, its boxes are a bordered surface with a heading. */
function Box({ component, state, data, level }: { component: Dict; state: Dict; data?: unknown; level: 2 | 3 }) {
  const m = meta(component)
  const ctx = { state, data }
  // a Card's slots may be text or components (a title with a badge, a media image, header extras)
  const slot = (v: unknown) => (node(v) ? <ComponentRenderer component={v} state={state} data={data} /> : null)
  const title = typeof m['title'] === 'string' ? interpolate(m['title'], ctx) : ''
  const subtitle = typeof m['subtitle'] === 'string' ? interpolate(m['subtitle'], ctx) : ''
  const titleNode = title ? <Heading as={`h${level}` as 'h2'} variant="small">{title}</Heading> : slot(m['title'])
  const subtitleNode = subtitle ? <Text as="p" size="small" style={{ color: 'var(--fgColor-muted)', margin: 0 }}>{subtitle}</Text> : slot(m['subtitle'])
  const prefix = slot(m['headerPrefix'])
  const suffix = slot(m['headerSuffix'])
  const media = slot(m['media'])
  const frameless = (component['cssClasses'] as string | undefined)?.includes('frameless')
  const variants = ((m['variants'] as string[] | undefined) ?? []).map(String)
  const elevated = variants.includes('elevated')
  const horizontal = variants.includes('horizontal') && !!media
  return (
    <section
      aria-label={title || undefined}
      style={{
        border: frameless || (elevated && !variants.includes('outlined')) ? 'none' : 'var(--borderWidth-thin) solid var(--borderColor-default)',
        boxShadow: elevated ? 'var(--shadow-resting-medium)' : undefined,
        display: horizontal ? 'flex' : undefined,
        gap: horizontal ? 'var(--base-size-16)' : undefined,
        borderRadius: 'var(--borderRadius-medium)',
        background: 'var(--bgColor-default)',
        padding: frameless ? 0 : 'var(--base-size-16)',
        overflow: 'hidden',
        ...styleOf(component, LAYOUT_STYLE.filter((k) => k !== 'gap' && k !== 'padding')),
      }}
    >
      {media && (horizontal
        ? <div style={{ flex: '0 0 40%', maxWidth: '40%', margin: frameless ? 0 : 'calc(-1 * var(--base-size-16)) 0 calc(-1 * var(--base-size-16)) calc(-1 * var(--base-size-16))' }}>{media}</div>
        : <div style={{ margin: frameless ? 0 : 'calc(-1 * var(--base-size-16)) calc(-1 * var(--base-size-16)) var(--base-size-12)' }}>{media}</div>)}
      <div style={{ flex: 1, minWidth: 0 }}>
      {(titleNode || subtitleNode || prefix || suffix) && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--base-size-12)', marginBottom: 'var(--base-size-12)' }}>
          {prefix}
          <div style={{ flex: 1, minWidth: 0 }}>
            {titleNode}
            {subtitleNode}
          </div>
          {suffix}
        </div>
      )}
      <Stack gap="normal">
        {slot(m['header'])}
        {slot(m['content'])}
        {childrenOf(component).map((child, i) => <ComponentRenderer key={i} component={child} state={state} data={data} />)}
        {slot(m['footer'])}
      </Stack>
      </div>
    </section>
  )
}

function AccordionPanel({ panel, state, data }: { panel: unknown; state: Dict; data?: unknown }) {
  const m = meta(panel)
  const [open, setOpen] = useState(m['active'] === true || m['open'] === true)
  return (
    <details open={open} onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      style={{ border: 'var(--borderWidth-thin) solid var(--borderColor-default)', borderRadius: 'var(--borderRadius-medium)', padding: 'var(--base-size-8) var(--base-size-16)' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{interpolate(String(m['label'] ?? ''), { state, data })}</summary>
      <div style={{ paddingTop: 'var(--base-size-12)' }}>
        {childrenOf(panel).map((c, i) => <ComponentRenderer key={i} component={c} state={state} data={data} />)}
      </div>
    </details>
  )
}

/**
 * A Button in content: runs its action when somebody claims it (the web's rule), or navigates by
 * `route`. A button with `children` is a SPLIT button when it says `split` (its own action + a ▾
 * menu of the others), else — no action of its own — a dropdown of them (the web's rule: `split`
 * is checked before the group).
 */
function ContentButton({ metadata, state, data, id }: { metadata: Dict; state: Dict; data?: unknown; id: string }) {
  const split = splitButtonParts(metadata)
  if (split) {
    return (
      <ButtonGroup>
        <SingleButton metadata={split.primary} state={state} data={data} />
        <ActionMenu>
          <ActionMenu.Anchor>
            <IconButton icon={TriangleDownIcon} aria-label={`More ${String(metadata['label'] ?? '')}`.trim()} variant={buttonVariantOf(metadata) === 'primary' ? 'primary' : 'default'} />
          </ActionMenu.Anchor>
          <ActionMenu.Overlay><MenuItems members={split.more} state={state} data={data} /></ActionMenu.Overlay>
        </ActionMenu>
      </ButtonGroup>
    )
  }
  const members = buttonGroupMembers(metadata)
  if (members) {
    return (
      <ActionMenu>
        <ActionMenu.Button variant={buttonVariantOf(metadata)}>{interpolate(String(metadata['label'] ?? ''), { state, data }) || 'Actions'}</ActionMenu.Button>
        <ActionMenu.Overlay><MenuItems members={members} state={state} data={data} key={id} /></ActionMenu.Overlay>
      </ActionMenu>
    )
  }
  return <SingleButton metadata={metadata} state={state} data={data} />
}

function MenuItems({ members, state, data }: { members: Dict[]; state: Dict; data?: unknown }) {
  const controller = useController()
  const press = useButtonPress()
  return (
    <ActionList>
      {members.map((member, i) => {
        const label = interpolate(String(member['label'] ?? ''), { state, data })
        const actionId = String(member['actionId'] ?? member['id'] ?? '')
        const { onPress, disabled } = press(member, { state, data }, () => {
          if (actionId && controller.claimsButtonAction(actionId)) void controller.runAction(actionId, (member['parameters'] as Dict | undefined) ?? undefined)
        }, label)
        return <ActionList.Item key={i} disabled={disabled || member['disabled'] === true} onSelect={onPress}>{label}</ActionList.Item>
      })}
    </ActionList>
  )
}

const BUTTON_SIZE: Record<string, 'small' | 'medium' | 'large'> = { small: 'small', large: 'large' }

function SingleButton({ metadata, state, data }: { metadata: Dict; state: Dict; data?: unknown }) {
  const controller = useController()
  const press = useButtonPress()
  const actionId = String(metadata['actionId'] ?? metadata['id'] ?? '')
  const pending = usePending(actionId)
  const label = interpolate(String(metadata['label'] ?? ''), { state, data })
  const { onPress, disabled } = press(metadata, { state, data }, () => {
    if (actionId && controller.claimsButtonAction(actionId)) void controller.runAction(actionId, (metadata['parameters'] as Dict | undefined) ?? undefined)
  }, label)
  return (
    <>
      {/* `separatorBefore`: a divider ahead of it in its row */}
      {metadata['separatorBefore'] === true && <span aria-hidden="true" style={{ alignSelf: 'stretch', borderInlineStart: 'var(--borderWidth-thin) solid var(--borderColor-muted)', marginInline: 'var(--base-size-4)' }} />}
      <Button
        variant={buttonVariantOf(metadata)}
        disabled={disabled || metadata['disabled'] === true}
        loading={pending}
        onClick={onPress}
        autoFocus={metadata['autofocus'] === true || undefined}
        size={BUTTON_SIZE[String(metadata['size'] ?? '').toLowerCase()]}
        title={metadata['shortcut'] ? String(metadata['shortcut']) : undefined}
      >
        {label}
      </Button>
    </>
  )
}

/** How many of the form layout's columns a child takes: the whole row, its declared colspan, or one. */
function spanOf(child: unknown, columns: number): string | undefined {
  if (spansAll(child)) return '1 / -1'
  const span = Number(meta(child)['colspan'] ?? 0)
  return span > 1 && columns > 1 ? `span ${Math.min(span, columns)}` : undefined
}

/** A child that takes the whole row of a form layout (a separator, a notice marked fullWidth, a grid). */
function spansAll(child: unknown): boolean {
  const m = meta(child)
  const attrs = (m['attributes'] as Dict | undefined) ?? {}
  return m['type'] === 'Separator' || attrs['data-colspan'] != null || m['fullWidth'] === true
    || m['stereotype'] === 'grid' || m['dataType'] === 'array' || m['type'] === 'Crud'
}

/** The few layout properties of a node's own `style` worth keeping in Primer (sizes, gaps). */
/** A server-sent href: http(s), mailto, tel or a relative path — never javascript:. */
function safeHref(url: string): string {
  return /^(https?:|mailto:|tel:|\/|#|[^:]*$)/i.test(url.trim()) ? url : '#'
}
