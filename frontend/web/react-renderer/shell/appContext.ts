import { useEffect, useRef, useState } from 'react'
import type { MateuSession } from '@rn/core/MateuSession'
import { contextOptionsOf, runAppSource } from '@rn/core/appSources'
import { AccessibilityInfo } from '../shims/react-native'
import { answerData, runAppLevel, saveAppContext, storedContextLabel, type AppTarget } from './appLevel'
import { tx } from '../i18n/texts'

type Dict = Record<string, unknown>
export interface ContextOption { value: unknown; label?: string }
export interface ContextSelector { fieldName: string; label?: string; options?: ContextOption[]; optionsSource?: Dict | null }

/** Beyond this many options the picker is a searchable panel (the web picker's rule). */
export const SEARCHABLE_THRESHOLD = 7

export const contextOptionLabel = (o: ContextOption) => o.label ?? String(o.value ?? '')

/**
 * The app's @AppContext pickers (active hotel, company, fiscal year…), without the drawing: the
 * value is stored for the origin, merged into the appState of every request, and choosing another
 * one reloads the page so the screen rebuilds against it (other tabs follow through the storage
 * event). Call once with every selector the header draws.
 */
export function useAppContextSelectors(session: MateuSession, selectors: ContextSelector[]): void {
  // the user's context: never handed to an untrusted island (credentialScope)
  for (const s of selectors) session.appContextKeys.add(s.fieldName)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'mateu-app-context') window.location.reload()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
}

/** Picks an option (null = none): stored, announced (WCAG 3.2.2), then the page reloads. */
export function chooseAppContext(session: MateuSession, selector: ContextSelector, option: ContextOption | null): void {
  const value = option?.value == null ? '' : String(option.value)
  const current = session.appState[selector.fieldName] == null ? '' : String(session.appState[selector.fieldName])
  if (value === current) return
  const name = selector.label ?? selector.fieldName
  saveAppContext(selector.fieldName, value, option ? contextOptionLabel(option) : undefined)
  AccessibilityInfo.announceForAccessibility(`${name}: ${option ? contextOptionLabel(option) : 'not set'}. Reloading…`)
  window.setTimeout(() => window.location.reload(), 700)
}

/** One picker's options (declared or from its source), the current value and its label. */
export function useAppContextPicker(session: MateuSession, app: AppTarget, selector: ContextSelector) {
  const [sourced, setSourced] = useState<ContextOption[] | null>(null)
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
    : tx('notSet')
  return {
    options, current, currentLabel,
    name: selector.label ?? selector.fieldName,
    searchable: options.length > SEARCHABLE_THRESHOLD,
    choose: (option: ContextOption | null) => chooseAppContext(session, selector, option),
  }
}

/**
 * A searchable picker's filter: typing filters what is loaded at once and, debounced, asks the server
 * (`_appcontext-search-<field>`) for what is not. `visible` is what the panel lists.
 */
export function useAppContextSearch(session: MateuSession, app: AppTarget, selector: ContextSelector, options: ContextOption[]) {
  const [filter, setFilter] = useState('')
  const [searched, setSearched] = useState<ContextOption[] | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const onFilter = (text: string) => {
    setFilter(text)
    window.clearTimeout(timer.current)
    if (!text.trim()) { setSearched(null); return }
    timer.current = window.setTimeout(() => {
      runAppLevel(session, app, `_appcontext-search-${selector.fieldName}`, { searchText: text }, `appcontext-${selector.fieldName}`)
        .then((answer) => {
          const page = answerData(answer, `_appcontext_${selector.fieldName}`) as { content?: ContextOption[] } | undefined
          if (Array.isArray(page?.content)) setSearched(page.content)
        })
        .catch(() => { /* the client-side filter still applies */ })
    }, 300)
  }
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const text = filter.trim().toLowerCase()
  const visible = (text ? searched ?? options : options).filter((o) => !text || contextOptionLabel(o).toLowerCase().includes(text))
  const reset = () => { setFilter(''); setSearched(null) }
  return { filter, onFilter, visible, reset }
}
