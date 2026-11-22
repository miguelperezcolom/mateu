import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ActionList, ActionMenu, Button, SelectPanel, type SelectPanelItemInput as ItemInput } from '@primer/react'
import { TriangleDownIcon } from '@primer/octicons-react'
import type { MateuSession } from '@rn/core/MateuSession'
import { contextOptionsOf, runAppSource } from '@rn/core/appSources'
import { AccessibilityInfo } from '../../shims/react-native'
import { answerData, runAppLevel, saveAppContext, storedContextLabel, type AppTarget } from './appLevel'

type Dict = Record<string, unknown>
interface Option { value: unknown; label?: string }
interface Selector { fieldName: string; label?: string; options?: Option[]; optionsSource?: Dict | null }

/** Beyond this many options the picker is a searchable panel (the web picker's rule). */
const SEARCHABLE_THRESHOLD = 7

const labelOf = (o: Option) => o.label ?? String(o.value ?? '')

/**
 * The app's @AppContext pickers (active hotel, company, fiscal year…) in the header: the value is
 * stored for the origin, merged into the appState of every request, and choosing another one
 * reloads the page so the screen rebuilds against it (other tabs follow through the storage event).
 */
export function ContextPickers({ session, app, selectors }: { session: MateuSession; app: AppTarget; selectors: Selector[] }) {
  // the user's context: never handed to an untrusted island (credentialScope)
  for (const s of selectors) session.appContextKeys.add(s.fieldName)

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'mateu-app-context') window.location.reload()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  if (selectors.length === 0) return null
  return <>{selectors.map((s) => <ContextPicker key={s.fieldName} session={session} app={app} selector={s} />)}</>
}

function choose(session: MateuSession, selector: Selector, option: Option | null) {
  const value = option?.value == null ? '' : String(option.value)
  const current = session.appState[selector.fieldName] == null ? '' : String(session.appState[selector.fieldName])
  if (value === current) return
  const name = selector.label ?? selector.fieldName
  saveAppContext(selector.fieldName, value, option ? labelOf(option) : undefined)
  // WCAG 3.2.2: the change of context is said, then the page reloads
  AccessibilityInfo.announceForAccessibility(`${name}: ${option ? labelOf(option) : 'not set'}. Reloading…`)
  window.setTimeout(() => window.location.reload(), 700)
}

function ContextPicker({ session, app, selector }: { session: MateuSession; app: AppTarget; selector: Selector }) {
  const [sourced, setSourced] = useState<Option[] | null>(null)
  useEffect(() => {
    const source = selector.optionsSource
    if (!source) return
    runAppSource({ api: session.api as never, sources: session.sources, appState: session.appState, rootRoute: app.rootRoute, serverSideType: app.serverSideType ?? null },
      'contextOptions', source, {}, selector.fieldName)
      .then((json) => setSourced(contextOptionsOf(json, source, session.sources)))
      .catch(() => setSourced([]))
  }, [session, app, selector])

  const options = sourced ?? selector.options ?? []
  const current = session.appState[selector.fieldName] == null ? '' : String(session.appState[selector.fieldName])
  const currentLabel = current
    ? options.find((o) => String(o.value) === current)?.label ?? storedContextLabel(selector.fieldName) ?? current
    : 'Not set'
  const name = selector.label ?? selector.fieldName
  const describedBy = `mateu-ctx-hint-${selector.fieldName}`
  const hint = <span id={describedBy} className="sr-only">Choosing another value reloads the page</span>

  if (options.length <= SEARCHABLE_THRESHOLD) {
    return (
      <>
        {hint}
        <ActionMenu>
          <ActionMenu.Button size="small" aria-describedby={describedBy}>
            <span className="mateu-header-muted">{name}:</span> {currentLabel}
          </ActionMenu.Button>
          <ActionMenu.Overlay width="small">
            <ActionList selectionVariant="single" aria-label={name}>
              <ActionList.Item selected={current === ''} onSelect={() => choose(session, selector, null)}>None</ActionList.Item>
              {options.map((o) => (
                <ActionList.Item key={String(o.value)} selected={String(o.value) === current} onSelect={() => choose(session, selector, o)}>
                  {labelOf(o)}
                </ActionList.Item>
              ))}
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </>
    )
  }
  return <SearchablePicker session={session} app={app} selector={selector} options={options} current={current}
    currentLabel={currentLabel} name={name} hint={hint} describedBy={describedBy} />
}

function SearchablePicker({ session, app, selector, options, current, currentLabel, name, hint, describedBy }: {
  session: MateuSession; app: AppTarget; selector: Selector; options: Option[]; current: string; currentLabel: string
  name: string; hint: React.ReactNode; describedBy: string
}) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const [searched, setSearched] = useState<Option[] | null>(null)
  const timer = useRef<number | undefined>(undefined)

  // typing filters what is loaded at once and, debounced, asks the server for what is not
  const onFilter = (text: string) => {
    setFilter(text)
    window.clearTimeout(timer.current)
    if (!text.trim()) { setSearched(null); return }
    timer.current = window.setTimeout(() => {
      runAppLevel(session, app, `_appcontext-search-${selector.fieldName}`, { searchText: text }, `appcontext-${selector.fieldName}`)
        .then((answer) => {
          const page = answerData(answer, `_appcontext_${selector.fieldName}`) as { content?: Option[] } | undefined
          if (Array.isArray(page?.content)) setSearched(page.content)
        })
        .catch(() => { /* the client-side filter still applies */ })
    }, 300)
  }
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const text = filter.trim().toLowerCase()
  const visible = (text ? searched ?? options : options).filter((o) => !text || labelOf(o).toLowerCase().includes(text))
  const items: (ItemInput & { option: Option })[] = useMemo(
    () => visible.map((o) => ({ id: String(o.value), text: labelOf(o), option: o })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visible.map((o) => String(o.value)).join('|')],
  )
  const selected = items.find((i) => i.id === current)

  return (
    <>
      {hint}
      <SelectPanel
        title={name}
        placeholder={`Search ${name.toLowerCase()}`}
        inputLabel={`Search ${name.toLowerCase()}`}
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) { setFilter(''); setSearched(null) } }}
        items={items}
        selected={selected}
        onSelectedChange={(item: ItemInput | undefined) => {
          setOpen(false)
          choose(session, selector, (item as { option?: Option } | undefined)?.option ?? null)
        }}
        filterValue={filter}
        onFilterChange={onFilter}
        renderAnchor={({ children: _placeholder, ...anchorProps }) => (
          <Button size="small" trailingVisual={TriangleDownIcon} aria-describedby={describedBy} {...anchorProps}>
            <span className="mateu-header-muted">{name}:</span> {currentLabel}
          </Button>
        )}
        overlayProps={{ width: 'medium', height: 'medium' }}
      />
    </>
  )
}
