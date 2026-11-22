import React, { useEffect, useMemo, useState } from 'react'
import { ActionList, ActionMenu, Button, ButtonGroup, IconButton, Label, SelectPanel, type SelectPanelItemInput } from '@kit'
import { ChevronLeftIcon, ChevronRightIcon, TriangleDownIcon } from '@kit/icons'
import { interpolate, interpolateUrl } from '@rn/core/expressions'
import { fetchExternalJson, mapItemsToOptions } from '@rn/core/restFetch'
import { filterSwitcherOptions, switcherCurrentLabel, switcherPick, type RecordSwitcher, type SwitcherOption } from '@rn/renderer/patternGaps'
import { useController } from '@mr/render/ViewHost'
import type { LabelVariant } from '../looks'
import { tx } from '@mr/i18n/texts'

type Dict = Record<string, unknown>
type Ctx = { state: Dict; data?: unknown }

/**
 * A navigation the page header asks for (a crumb, a peer arrow, a switcher's route): unsaved edits
 * are asked about first, like a menu click; an address outside the app is a browser load.
 */
export function useHeaderNavigate() {
  const controller = useController()
  const session = controller.session
  return async (route: string, label = '') => {
    if (!route) return
    if (session.anyUnsavedChanges() && !(await session.confirmDiscard())) return
    if (/^[a-z][a-z0-9+.-]*:/i.test(route)) {
      if (/^https?:/i.test(route)) window.location.assign(route)
      return
    }
    session.openView({ label: label || route, route, consumedRoute: '', serverSideType: '' })
  }
}

/** `PeerNavDto`: previous / next record, a side with no route drawn disabled (the first / last). */
export function PeerNav({ peerNav, ctx }: { peerNav: Dict; ctx: Ctx }) {
  const go = useHeaderNavigate()
  const route = (r: unknown) => (typeof r === 'string' && r.trim() ? interpolate(r, ctx) : '')
  const prev = route(peerNav['prevRoute'])
  const next = route(peerNav['nextRoute'])
  const label = (v: unknown, fallback: string) => (typeof v === 'string' && v.trim() ? interpolate(v, ctx) : fallback)
  const prevLabel = label(peerNav['prevLabel'], tx('previous'))
  const nextLabel = label(peerNav['nextLabel'], tx('next'))
  return (
    <ButtonGroup className="mateu-peer-nav">
      <IconButton icon={ChevronLeftIcon} aria-label={prevLabel} tooltipDirection="s" disabled={!prev} onClick={() => void go(prev, prevLabel)} />
      <IconButton icon={ChevronRightIcon} aria-label={nextLabel} tooltipDirection="s" disabled={!next} onClick={() => void go(next, nextLabel)} />
    </ButtonGroup>
  )
}

/**
 * `RecordSwitcherDto` (Redwood's select-object / select-context header element): the current
 * entry beside the title; a pick runs the page's action with `{_record}`, or — a YAML page's —
 * NAVIGATES to its `route` with the value in `${state._record}`. Entries listed or fetched from
 * `optionsSource`; `searchable` adds the filter box.
 */
export function RecordSwitcherControl({ switcher, ctx }: { switcher: Dict; ctx: Ctx }) {
  const controller = useController()
  const go = useHeaderNavigate()
  const fetched = useSwitcherOptions(switcher, ctx)
  const s: RecordSwitcher = useMemo(() => {
    const value = typeof switcher['value'] === 'string' && switcher['value'].includes('${') ? interpolate(switcher['value'], ctx) : switcher['value']
    const listed = (switcher['options'] as SwitcherOption[] | undefined) ?? []
    return { ...(switcher as RecordSwitcher), value: value == null ? null : String(value), options: listed.length ? listed : fetched }
  }, [switcher, ctx, fetched])
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const hint = (typeof switcher['label'] === 'string' ? switcher['label'] : '') || (switcher['type'] === 'context' ? tx('context') : '')
  const current = switcherCurrentLabel(s) || '—'
  if (!s.options?.length && !switcher['optionsSource']) return null

  const pick = (value: unknown) => {
    setOpen(false)
    setFilter('')
    const action = switcherPick(s, value)
    if (!action) return
    const template = typeof switcher['route'] === 'string' ? switcher['route'] : ''
    if (template) {
      const route = interpolate(template, { ...ctx, state: { ...ctx.state, _record: value } })
      if (route && !route.includes('${')) return void go(route)
      return
    }
    void controller.runAction(action.actionId, action.parameters)
  }

  const anchorText = <><span style={{ color: 'var(--fgColor-muted)' }}>{hint ? `${hint}: ` : ''}</span>{current}</>
  if (s.disabled) return <Button size="small" disabled aria-label={`${hint ? `${hint}: ` : ''}${current}`}>{anchorText}</Button>

  if (s.searchable) {
    const items: (SelectPanelItemInput & { value: unknown })[] = filterSwitcherOptions(s.options ?? [], filter)
      .map((o) => ({ id: String(o.value ?? ''), text: String(o.label ?? o.value ?? ''), description: o.description ?? undefined, disabled: o.disabled, value: o.value }))
    return (
      <SelectPanel
        title={hint || tx('switchRecord')}
        placeholder={tx('filter')}
        inputLabel={tx('filterTheList')}
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) setFilter('') }}
        items={items}
        selected={items.find((i) => i.id === String(s.value ?? ''))}
        onSelectedChange={(item: SelectPanelItemInput | undefined) => pick((item as { value?: unknown } | undefined)?.value)}
        filterValue={filter}
        onFilterChange={setFilter}
        renderAnchor={({ children: _p, ...anchorProps }) => <Button size="small" trailingVisual={TriangleDownIcon} {...anchorProps}>{anchorText}</Button>}
        overlayProps={{ width: 'medium', height: 'medium' }}
      />
    )
  }
  return (
    <ActionMenu open={open} onOpenChange={setOpen}>
      <ActionMenu.Button size="small">{anchorText}</ActionMenu.Button>
      <ActionMenu.Overlay width="medium">
        <ActionList selectionVariant="single" aria-label={hint || tx('switchRecord')}>
          {(s.options ?? []).map((o, i) => (
            <ActionList.Item key={i} selected={String(o.value ?? '') === String(s.value ?? '')} disabled={o.disabled} onSelect={() => pick(o.value)}>
              {String(o.label ?? o.value ?? '')}
              {o.description ? <ActionList.Description variant="block">{o.description}</ActionList.Description> : null}
            </ActionList.Item>
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

/** A switcher's entries from its `optionsSource`, fetched by the browser once (a static bundle has no server). */
function useSwitcherOptions(switcher: Dict, ctx: Ctx): SwitcherOption[] {
  const controller = useController()
  const source = (switcher['options'] as unknown[] | undefined)?.length ? null : (switcher['optionsSource'] as Dict | undefined) ?? null
  const [options, setOptions] = useState<SwitcherOption[]>([])
  const key = source ? JSON.stringify(source) : ''
  useEffect(() => {
    if (!source) return
    let cancelled = false
    const sources = controller.session.sources
    const resolved = sources.resolve(source) as Dict & { itemsPath?: string; valuePath?: string; labelPath?: string }
    const appState = controller.session.appState
    fetchExternalJson(source, (t) => interpolate(String(t ?? ''), { ...ctx, appState }), (t) => interpolateUrl(String(t ?? ''), { ...ctx, appState }), sources)
      .then((j) => { if (!cancelled) setOptions(mapItemsToOptions(j, resolved?.itemsPath, resolved?.valuePath, resolved?.labelPath) as SwitcherOption[]) })
      .catch(() => { if (!cancelled) setOptions([]) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return options
}

const STATUS_VARIANT: Record<string, LabelVariant> = { INFO: 'accent', SUCCESS: 'success', WARNING: 'attention', DANGER: 'danger' }

/** `StatusDto` (a page's status): a label beside the title; NONE / empty draws nothing. */
export function PageStatus({ status, ctx }: { status: Dict; ctx: Ctx }) {
  const type = String(status['type'] ?? 'NONE').toUpperCase()
  const message = interpolate(String(status['message'] ?? ''), ctx)
  if (type === 'NONE' || !message.trim()) return null
  return <Label variant={STATUS_VARIANT[type] ?? 'default'}>{message}</Label>
}
