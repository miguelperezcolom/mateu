import React, { useEffect, useRef, useState } from 'react'
import { Banner, Button, ButtonGroup, Heading, Label, Link, ProgressBar, Stack, Text } from '@primer/react'
import { Blankslate, SkeletonText, UnderlinePanels } from '@primer/react/experimental'
import { interpolate } from '@rn/core/expressions'
import { headingLevel } from '@rn/core/uxRules'
import { buttonGroupMembers } from '@rn/core/buttonGroup'
import { useController, ViewHost } from './ViewHost'
import { FieldRenderer } from './FieldRenderer'
import { PageRenderer } from './PageRenderer'
import { CrudRenderer } from './CrudRenderer'
import { useButtonPress } from './useButtonPress'
import { usePending } from './usePending'
import { buttonVariantOf, labelVariantOf } from './looks'

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

export const SUPPORTED_TYPES = new Set([
  'Page', 'Form', 'Crud', 'FormField', 'FormLayout', 'VerticalLayout', 'FormRow', 'HorizontalLayout',
  'Div', 'Container', 'FullWidth', 'Scroller', 'FormSection', 'FormSubSection', 'Card', 'TabLayout', 'Tab',
  'AccordionLayout', 'AccordionPanel', 'Button', 'Text', 'Separator', 'Badge', 'Anchor', 'ProgressBar',
  'EmptyState', 'Notice', 'Skeleton', 'Image', 'Markdown', 'BulletedList', 'ResponsiveGrid', 'CustomField',
])

function ClientSide({ component, state, data }: { component: Dict; state: Dict; data?: unknown }) {
  const controller = useController()
  const m = meta(component)
  const type = String(m['type'] ?? '')
  const ctx = { state, data, appState: controller.session.appState }
  const kids = (c: unknown = component) =>
    childrenOf(c).map((child, i) => <ComponentRenderer key={i} component={child} state={state} data={data} />)

  switch (type) {
    case 'Page':
    case 'Form':
      return <PageRenderer component={component} metadata={m} state={state} data={data} />

    case 'Crud':
      return <CrudRenderer component={component} metadata={m} state={state} data={data} />

    case 'FormField':
      return <FieldRenderer metadata={m} state={state} />

    case 'FormLayout': {
      // the form's columns (the server inferred or was told how many): a responsive grid
      const columns = Math.max(1, Number(m['maxColumns'] ?? m['columns'] ?? 1) || 1)
      return (
        <div style={{
          display: 'grid', gap: 'var(--stack-gap-normal)',
          gridTemplateColumns: columns > 1 ? `repeat(auto-fit, minmax(min(16rem, 100%), 1fr))` : '1fr',
        }}>
          {childrenOf(component).map((child, i) => (
            <div key={i} style={{ gridColumn: spansAll(child) ? '1 / -1' : undefined, minWidth: 0 }}>
              <ComponentRenderer component={child} state={state} data={data} />
            </div>
          ))}
        </div>
      )
    }

    case 'VerticalLayout':
    case 'Div':
    case 'Container':
    case 'FullWidth':
    case 'Scroller':
      return <Stack direction="vertical" gap={m['spacing'] === false ? 'none' : 'normal'} style={styleOf(component)}>{kids()}</Stack>

    case 'ResponsiveGrid':
      return <ResponsiveGrid component={component} state={state} data={data} />

    case 'CustomField': {
      // a ComponentAdapter's nested island / a custom field: its content node, under its label
      if (!node(m['content'])) return null
      return (
        <div>
          {m['label'] ? <Text as="div" size="small" weight="semibold" style={{ marginBottom: 'var(--base-size-4)' }}>{interpolate(String(m['label']), ctx)}</Text> : null}
          <ComponentRenderer component={m['content']} state={state} data={data} />
        </div>
      )
    }

    case 'FormRow':
      return (
        <div style={{ display: 'grid', gap: 'var(--stack-gap-normal)', gridTemplateColumns: `repeat(auto-fit, minmax(min(14rem, 100%), 1fr))` }}>
          {kids()}
        </div>
      )

    case 'HorizontalLayout':
      return (
        <Stack direction="horizontal" wrap="wrap" gap={m['spacing'] === false ? 'none' : 'normal'} align="center" style={styleOf(component)}>
          {kids()}
        </Stack>
      )

    case 'FormSection':
    case 'FormSubSection':
    case 'Card':
      return <Box component={component} state={state} data={data} level={type === 'FormSubSection' ? 3 : 2} />

    case 'TabLayout': {
      const tabs = childrenOf(component)
      return (
        <UnderlinePanels aria-label={String(m['label'] ?? 'Tabs')}>
          {tabs.map((tab, i) => (
            <UnderlinePanels.Tab key={`t${i}`} aria-selected={undefined}>
              {interpolate(String(meta(tab)['label'] ?? ''), ctx)}
            </UnderlinePanels.Tab>
          ))}
          {tabs.map((tab, i) => (
            <UnderlinePanels.Panel key={`p${i}`}>
              <div style={{ paddingTop: 'var(--base-size-16)' }}>{kids(tab)}</div>
            </UnderlinePanels.Panel>
          ))}
        </UnderlinePanels>
      )
    }

    case 'Tab':
      return <>{kids()}</>

    case 'AccordionLayout':
      return <Stack gap="condensed">{childrenOf(component).map((panel, i) => <AccordionPanel key={i} panel={panel} state={state} data={data} />)}</Stack>

    case 'AccordionPanel':
      return <AccordionPanel panel={component} state={state} data={data} />

    case 'Button':
      return <ContentButton metadata={m} state={state} data={data} id={String(component['id'] ?? '')} />

    case 'Text': {
      const text = interpolate(String(m['text'] ?? ''), ctx)
      const level = headingLevel(m['container'] as string | undefined)
      if (level > 0) {
        return <Heading as={`h${level}` as 'h2'} variant={level <= 2 ? 'medium' : 'small'}>{text}</Heading>
      }
      const size = m['size'] === 'xl' || m['size'] === 'l' ? 'large' : m['size'] === 's' || m['size'] === 'xs' ? 'small' : 'medium'
      return <Text as="p" size={size} style={{ margin: m['noMargins'] ? 0 : undefined }}>{text}</Text>
    }

    case 'Separator':
      return <hr style={{ border: 0, borderTop: 'var(--borderWidth-thin) solid var(--borderColor-muted)', margin: 'var(--base-size-8) 0', gridColumn: '1 / -1' }} />

    case 'Badge':
      return <Label variant={labelVariantOf(m)}>{interpolate(String(m['text'] ?? ''), ctx)}</Label>

    case 'Anchor': {
      const url = String(m['url'] ?? '')
      return <Link href={safeHref(url)} target={m['target'] ? String(m['target']) : undefined}>{interpolate(String(m['text'] ?? url), ctx)}</Link>
    }

    case 'ProgressBar': {
      const value = Number(m['value'] ?? 0)
      const max = Number(m['max'] ?? 1) || 1
      return <ProgressBar progress={Math.round((value / max) * 100)} aria-label={String(m['label'] ?? 'Progress')} />
    }

    case 'EmptyState':
      return (
        <Blankslate>
          {m['title'] ? <Blankslate.Heading>{String(m['title'])}</Blankslate.Heading> : null}
          {m['description'] ? <Blankslate.Description>{String(m['description'])}</Blankslate.Description> : null}
          {m['actionId'] && m['actionLabel'] ? (
            <Blankslate.PrimaryAction onClick={() => void controller.runAction(String(m['actionId']))}>{String(m['actionLabel'])}</Blankslate.PrimaryAction>
          ) : null}
        </Blankslate>
      )

    case 'Notice': {
      const text = interpolate(String(m['text'] ?? ''), ctx)
      const content = childrenOf(component)
      if (!text.trim() && content.length === 0) return null
      const theme = String(m['theme'] ?? 'info')
      const variant = theme === 'danger' ? 'critical' : theme === 'warning' ? 'warning' : theme === 'success' ? 'success' : 'info'
      return (
        <Banner
          title={text || 'Notice'}
          hideTitle={!text}
          description={content.length ? <>{kids()}</> : undefined}
          variant={variant}
          layout={m['slim'] ? 'compact' : 'default'}
          primaryAction={m['actionId'] && m['actionLabel'] ? (
            <Banner.PrimaryAction onClick={() => void controller.runAction(String(m['actionId']))}>{String(m['actionLabel'])}</Banner.PrimaryAction>
          ) : undefined}
        />
      )
    }

    case 'Skeleton':
      return <SkeletonText lines={Math.max(1, Number(m['count'] ?? 3) || 3)} />

    case 'Image': {
      const src = controller.session.backendUrl(interpolate(String(m['src'] ?? ''), ctx))
      return <img src={src} alt={interpolate(String(m['alt'] ?? ''), ctx)} style={{ maxWidth: '100%', ...styleOf(component) }} />
    }

    case 'Markdown':
      // the markdown source as text for now — a sanitised markdown view is a Standard-level item
      return <Text as="p" style={{ whiteSpace: 'pre-wrap' }}>{String(m['markdown'] ?? m['text'] ?? '')}</Text>

    case 'BulletedList':
      return <ul style={{ margin: 0, paddingInlineStart: 'var(--base-size-20)' }}>{((m['items'] as unknown[]) ?? []).map((it, i) => <li key={i}>{String(it)}</li>)}</ul>

    default:
      // a type this renderer does not draw yet — said, never silently dropped
      return React.createElement('mateu-unsupported', { 'data-type': type || 'unknown' }, `Not drawn by the Primer renderer yet: ${type || 'unknown'}`)
  }
}

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
          <div key={i} style={{ minWidth: 0, gridArea: !stacked && areas && slot ? slot : undefined, gridColumn: !stacked && spans[i] && spans[i] > 1 ? `span ${spans[i]}` : undefined }}>
            <ComponentRenderer component={child} state={state} data={data} />
          </div>
        )
      })}
    </div>
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
  const title = typeof m['title'] === 'string' ? interpolate(m['title'], ctx) : ''
  const subtitle = typeof m['subtitle'] === 'string' ? interpolate(m['subtitle'], ctx) : ''
  const frameless = (component['cssClasses'] as string | undefined)?.includes('frameless')
  return (
    <section
      aria-label={title || undefined}
      style={{
        border: frameless ? 'none' : 'var(--borderWidth-thin) solid var(--borderColor-default)',
        borderRadius: 'var(--borderRadius-medium)',
        background: 'var(--bgColor-default)',
        padding: frameless ? 0 : 'var(--base-size-16)',
        ...styleOf(component, ['width', 'max-width', 'min-width']),
      }}
    >
      {(title || subtitle) && (
        <div style={{ marginBottom: 'var(--base-size-12)' }}>
          {title && <Heading as={`h${level}` as 'h2'} variant="small">{title}</Heading>}
          {subtitle && <Text as="p" size="small" style={{ color: 'var(--fgColor-muted)', margin: 0 }}>{subtitle}</Text>}
        </div>
      )}
      <Stack gap="normal">
        {node(m['header']) && <ComponentRenderer component={m['header']} state={state} data={data} />}
        {node(m['content']) && <ComponentRenderer component={m['content']} state={state} data={data} />}
        {childrenOf(component).map((child, i) => <ComponentRenderer key={i} component={child} state={state} data={data} />)}
        {node(m['footer']) && <ComponentRenderer component={m['footer']} state={state} data={data} />}
      </Stack>
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

/** A Button in content: runs its action when somebody claims it (the web's rule), or navigates by `route`. */
function ContentButton({ metadata, state, data, id }: { metadata: Dict; state: Dict; data?: unknown; id: string }) {
  const controller = useController()
  const press = useButtonPress()
  const members = buttonGroupMembers(metadata)
  if (members) {
    return (
      <ButtonGroup aria-label={String(metadata['label'] ?? '') || undefined}>
        {members.map((member, i) => <ContentButton key={`${id}-${i}`} id={`${id}-${i}`} metadata={member as Dict} state={state} data={data} />)}
      </ButtonGroup>
    )
  }
  const actionId = String(metadata['actionId'] ?? metadata['id'] ?? '')
  const pending = usePending(actionId)
  const label = interpolate(String(metadata['label'] ?? ''), { state, data })
  const { onPress, disabled } = press(metadata, { state, data }, () => {
    if (actionId && controller.claimsButtonAction(actionId)) void controller.runAction(actionId, (metadata['parameters'] as Dict | undefined) ?? undefined)
  }, label)
  return (
    <Button
      variant={buttonVariantOf(metadata)}
      disabled={disabled || metadata['disabled'] === true}
      loading={pending}
      onClick={onPress}
      title={metadata['shortcut'] ? String(metadata['shortcut']) : undefined}
    >
      {label}
    </Button>
  )
}

/** A child that takes the whole row of a form layout (a separator, a notice marked fullWidth, a grid). */
function spansAll(child: unknown): boolean {
  const m = meta(child)
  const attrs = (m['attributes'] as Dict | undefined) ?? {}
  return m['type'] === 'Separator' || attrs['data-colspan'] != null || m['fullWidth'] === true
    || m['stereotype'] === 'grid' || m['dataType'] === 'array' || m['type'] === 'Crud'
}

/** The few layout properties of a node's own `style` worth keeping in Primer (sizes, gaps). */
function styleOf(component: unknown, keep: string[] = ['width', 'max-width', 'min-width', 'gap', 'padding']): React.CSSProperties {
  const raw = String((component as Dict | null)?.['style'] ?? '')
  const out: Record<string, string> = {}
  for (const decl of raw.split(';')) {
    const at = decl.indexOf(':')
    if (at < 0) continue
    const prop = decl.slice(0, at).trim().toLowerCase()
    const value = decl.slice(at + 1).trim()
    if (!keep.includes(prop) || !value || /url\(|expression\(/i.test(value)) continue
    out[prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = value
  }
  return out as React.CSSProperties
}

/** A server-sent href: http(s), mailto, tel or a relative path — never javascript:. */
function safeHref(url: string): string {
  return /^(https?:|mailto:|tel:|\/|#|[^:]*$)/i.test(url.trim()) ? url : '#'
}
