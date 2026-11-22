import React, { useEffect, useState } from 'react'
import { Banner, Breadcrumbs, Button, Label, PageHeader, Stack, Text } from '@primer/react'
import { ArrowLeftIcon } from '@primer/octicons-react'
import { IconButton } from '@primer/react'
import { interpolate } from '@rn/core/expressions'
import type { PageBanner } from '@rn/core/MateuViewController'
import { useController } from './ViewHost'
import { ComponentRenderer } from './ComponentRenderer'
import { useButtonPress } from './useButtonPress'
import { buttonVariantOf, labelVariantOf } from './looks'
import { usePending } from './usePending'

type Dict = Record<string, unknown>

const BACK_IDS = new Set(['back', 'backToList', 'cancel-view'])

/**
 * A Page or a Form under Primer's PageHeader: the way back as the leading action, the title, the
 * badges and facts beside it, the description, the toolbar as the header's actions (one primary at
 * most); then the page banners, the content and the bottom buttons.
 */
export function PageRenderer({ component, metadata, state, data }: { component: Dict; metadata: Dict; state: Dict; data?: unknown }) {
  const controller = useController()
  const press = useButtonPress()
  const ctx = { state, data, appState: controller.session.appState }
  const noHeader = metadata['noHeader'] === true
  const title = noHeader ? '' : interpolate(String(metadata['title'] ?? metadata['pageTitle'] ?? ''), ctx)
  const overline = noHeader ? '' : interpolate(String(metadata['overline'] ?? ''), ctx)
  const subtitle = noHeader ? '' : interpolate(String(metadata['subtitle'] ?? ''), ctx)
  const timestamp = noHeader ? '' : interpolate(String(metadata['timestamp'] ?? ''), ctx)
  const badges = noHeader ? [] : ((metadata['badges'] as Dict[] | undefined) ?? [])
  const kpis = noHeader ? [] : ((metadata['kpis'] as Dict[] | undefined) ?? [])
  const readOnly = metadata['readOnly'] === true
  const toolbarAll = ((metadata['toolbar'] as Dict[] | undefined) ?? []).filter((b) => b && b['label'])
  const back = toolbarAll.find((b) => BACK_IDS.has(String(b['actionId'] ?? b['id'] ?? '')))
  const toolbar = toolbarAll.filter((b) => b !== back)
  const declared = ((metadata['actions'] as Dict[] | undefined) ?? []).filter((a) => a && a['label'])
  const buttons = ((metadata['buttons'] as Dict[] | undefined) ?? []).filter((b) => b && b['label'])
  const crumbs = metadata['noBreadcrumbs'] === true ? [] : ((metadata['breadcrumbs'] as Dict[] | undefined) ?? [])
  const header = metadata['header'] as unknown[] | undefined

  const run = (b: Dict) => press(b, { state, data }, () => {
    const id = String(b['actionId'] ?? b['id'] ?? '')
    if (id) void controller.runAction(id, (b['parameters'] as Dict | undefined) ?? undefined)
  }, String(b['label'] ?? ''))

  const actionButton = (b: Dict, i: number) => {
    const { onPress, disabled } = run(b)
    return <ActionButton key={i} button={b} onPress={onPress} disabled={disabled} label={interpolate(String(b['label'] ?? ''), ctx)} />
  }

  const headerActions = readOnly ? toolbar : [...toolbar, ...declared]
  const showHeader = !!(title || subtitle || overline || badges.length || kpis.length || headerActions.length || back || crumbs.length)

  return (
    <Stack gap="spacious">
      {showHeader && (
        <PageHeader role="banner" aria-label={title || undefined}>
          {crumbs.length > 0 && (
            <PageHeader.ContextArea>
              <Breadcrumbs>
                {crumbs.map((c, i) => (
                  <Breadcrumbs.Item key={i} href="#" onClick={(e: React.MouseEvent) => {
                    e.preventDefault()
                    const route = String(c['link'] ?? c['route'] ?? '')
                    if (route) controller.session.openView({ label: String(c['label'] ?? ''), route, consumedRoute: '', serverSideType: '' })
                  }}>{String(c['label'] ?? '')}</Breadcrumbs.Item>
                ))}
              </Breadcrumbs>
            </PageHeader.ContextArea>
          )}
          <PageHeader.TitleArea>
            {back && (
              <PageHeader.LeadingAction>
                <IconButton icon={ArrowLeftIcon} aria-label={String(back['label'] ?? 'Back')} variant="invisible" onClick={run(back).onPress} />
              </PageHeader.LeadingAction>
            )}
            <PageHeader.Title as="h2">{title}</PageHeader.Title>
            {(badges.length > 0) && (
              <PageHeader.TrailingVisual>
                <Stack direction="horizontal" gap="condensed">
                  {badges.map((b, i) => <Label key={i} variant={labelVariantOf(b)}>{interpolate(String(b['text'] ?? b['label'] ?? ''), ctx)}</Label>)}
                </Stack>
              </PageHeader.TrailingVisual>
            )}
          </PageHeader.TitleArea>
          {headerActions.length > 0 && (
            <PageHeader.Actions>
              <Stack direction="horizontal" gap="condensed" wrap="wrap">{headerActions.map((b, i) => actionButton(b, i))}</Stack>
            </PageHeader.Actions>
          )}
          {(overline || subtitle || timestamp || kpis.length > 0) && (
            <PageHeader.Description>
              <Stack gap="condensed">
                {overline && <Text size="small" weight="semibold" style={{ color: 'var(--fgColor-muted)', textTransform: 'uppercase' }}>{overline}</Text>}
                {subtitle && <Text style={{ color: 'var(--fgColor-muted)' }}>{subtitle}</Text>}
                {timestamp && <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>{timestamp}</Text>}
                {kpis.length > 0 && (
                  <Stack direction="horizontal" gap="spacious" wrap="wrap">
                    {kpis.map((k, i) => (
                      <Stack key={i} gap="none">
                        <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>{interpolate(String(k['title'] ?? ''), ctx)}</Text>
                        <Text weight="semibold">{interpolate(String(k['text'] ?? ''), ctx)}</Text>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Stack>
            </PageHeader.Description>
          )}
        </PageHeader>
      )}
      <Banners metadata={metadata} state={state} />
      {Array.isArray(header) && header.map((h, i) => <ComponentRenderer key={`h${i}`} component={h} state={state} data={data} />)}
      <Stack gap="normal">
        {((component['children'] as unknown[] | undefined) ?? []).map((child, i) => (
          <ComponentRenderer key={i} component={child} state={state} data={data} />
        ))}
      </Stack>
      {!readOnly && buttons.length > 0 && (
        <Stack direction="horizontal" justify="end" gap="condensed" wrap="wrap"
          style={{ borderTop: 'var(--borderWidth-thin) solid var(--borderColor-muted)', paddingTop: 'var(--base-size-16)' }}>
          {buttons.map((b, i) => actionButton(b, i))}
        </Stack>
      )}
    </Stack>
  )
}

/** @Banner + the banners an action returned: Primer Banners under the header. */
function Banners({ metadata, state }: { metadata: Dict; state: Dict }) {
  const controller = useController()
  const all: PageBanner[] = [...(((metadata['banners'] as PageBanner[] | undefined) ?? [])), ...controller.actionBanners]
  const [dismissed, setDismissed] = useState<number[]>([])
  useEffect(() => {
    const timers = all
      .map((b, i) => ({ b, i }))
      .filter(({ b }) => (b.timeoutSeconds ?? 0) > 0)
      .map(({ b, i }) => setTimeout(() => setDismissed((d) => [...d, i]), (b.timeoutSeconds ?? 0) * 1000))
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all.length])
  if (all.length === 0) return null
  return (
    <Stack gap="condensed">
      {all.map((b, i) => {
        if (dismissed.includes(i)) return null
        const theme = String(b.theme ?? 'info').toLowerCase()
        const variant = theme === 'danger' || theme === 'error' ? 'critical' : theme === 'warning' ? 'warning' : theme === 'success' ? 'success' : 'info'
        const title = interpolate(String(b.title ?? ''), { state })
        return (
          <Banner
            key={i}
            title={title || 'Notice'}
            hideTitle={!title}
            description={b.description ? interpolate(b.description, { state }) : undefined}
            variant={variant}
            onDismiss={b.hasCloseButton ? () => setDismissed((d) => [...d, i]) : undefined}
          />
        )
      })}
    </Stack>
  )
}

/** A header / bottom-bar button, busy while its action is on its way. */
export function ActionButton({ button, onPress, disabled, label }: { button: Dict; onPress: () => void; disabled: boolean; label: string }) {
  const pending = usePending(String(button['actionId'] ?? button['id'] ?? ''))
  return (
    <Button variant={buttonVariantOf(button)} disabled={disabled || button['disabled'] === true} loading={pending} onClick={onPress}>
      {label}
    </Button>
  )
}
