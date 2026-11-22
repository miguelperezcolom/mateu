import type React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { MateuSession, NavTarget } from '@rn/core/MateuSession'
import { runAppSource, searchHitsOf } from '@rn/core/appSources'
import { keyLabel, quickLaunchMatch, shortcutsMatching } from '@infra/ui/appShortcuts.ts'
import { listRecentRoutes } from '@infra/recentRoutesStore.ts'
import { runAppLevel, routeTarget, type AppMetaLike } from './appActions'
import type { AppShortcutLike } from './shortcuts'
import { tx } from '../i18n/texts'

type Dict = Record<string, unknown>

interface MenuEntry {
  label: string
  breadcrumb: string
  target: NavTarget
}

interface SearchHit {
  label: string
  description?: string | null
  route: string
  category?: string | null
}

/** Every menu leaf that opens a screen, with the path of groups above it ("Bookings › Rooms"). */
export function flattenMenu(menu: unknown, breadcrumb = ''): MenuEntry[] {
  const out: MenuEntry[] = []
  for (const raw of Array.isArray(menu) ? (menu as Dict[]) : []) {
    if (!raw || raw['separator']) continue
    const label = String(raw['label'] ?? '')
    const subs = raw['submenus'] as unknown[] | undefined
    if (Array.isArray(subs) && subs.length) {
      out.push(...flattenMenu(subs, breadcrumb ? `${breadcrumb} › ${label}` : label))
    } else if (raw['route'] != null || raw['serverSideType']) {
      if (Array.isArray(raw['rules']) && (raw['rules'] as unknown[]).length) continue
      out.push({
        label,
        breadcrumb,
        target: {
          label,
          route: String(raw['route'] ?? ''),
          consumedRoute: String(raw['consumedRoute'] ?? ''),
          serverSideType: String(raw['serverSideType'] ?? ''),
        },
      })
    }
  }
  return out
}

/** One row of the palette; `kind` is what the renderer draws as its leading icon. */
export interface PaletteRow {
  key: string
  kind: 'shortcut' | 'recent' | 'menu' | 'hit' | 'ask'
  group: string
  label: string
  description?: string
  trailing?: string
  run: () => void
}

export interface Palette {
  query: string
  onInput: (text: string) => void
  rows: PaletteRow[]
  /** The rows by group, in order, each with its index in `rows`. */
  groups: { name: string; rows: { row: PaletteRow; index: number }[] }[]
  searching: boolean
  searchEnabled: boolean
  /** The highlighted row. */
  current: number
  setActive: React.Dispatch<React.SetStateAction<number>>
  /** ↑ / ↓ move, Enter launches an exact quick-launch code or the highlighted row. */
  onKeyDown: (e: React.KeyboardEvent) => void
}

/**
 * The ⌘K command palette and the command center, without the drawing: ONE search over the whole
 * menu, the app's quick-launch codes, the entities the app-level `_globalsearch` action (or the
 * app's globalSearchSource) finds — grouped by category, debounced 300 ms — and the screens
 * visited lately; with an assistant, an "Ask AI" row hands the query over.
 */
export function usePalette({ session, app, open, onClose, onNavigate, onLaunch, onAskAi }: {
  session: MateuSession
  app: AppMetaLike
  open: boolean
  onClose: () => void
  onNavigate: (target: NavTarget) => void
  onLaunch: (s: AppShortcutLike) => void
  onAskAi?: (query: string) => void
}): Palette {
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<SearchHit[]>([])
  const [searching, setSearching] = useState(false)
  const [active, setActive] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const seq = useRef(0)
  const menu = useMemo(() => flattenMenu(app['menu']), [app])
  const shortcuts = (app['shortcuts'] as AppShortcutLike[] | undefined) ?? []
  const scope = String(app.serverSideType ?? '')
  const searchEnabled = app['globalSearchEnabled'] === true || !!app['globalSearchSource']

  useEffect(() => {
    if (!open) {
      setQuery('')
      setHits([])
      setActive(0)
    }
  }, [open])

  const remoteSearch = (text: string) => {
    const mine = ++seq.current
    setSearching(true)
    const done = (list: SearchHit[]) => { if (mine === seq.current) { setHits(list); setSearching(false) } }
    const source = app['globalSearchSource'] as Dict | null | undefined
    if (source) {
      runAppSource({ api: session.api as never, sources: session.sources, appState: session.appState, rootRoute: String(app.rootRoute ?? ''), serverSideType: (app.serverSideType as string) ?? null },
        'globalSearch', source, { searchText: text })
        .then((json) => done(searchHitsOf(json, source, session.sources) as SearchHit[]))
        .catch(() => done([]))
      return
    }
    runAppLevel(session, app, '_globalsearch', { searchText: text }, 'cmd-palette')
      .then((inc) => {
        for (const f of ((inc as Dict)?.['fragments'] as Dict[] | undefined) ?? []) {
          const list = (f['data'] as Dict | undefined)?.['_globalsearch']
          if (Array.isArray(list)) return done(list as SearchHit[])
        }
        done([])
      })
      .catch(() => done([]))
  }

  const onInput = (text: string) => {
    setQuery(text)
    setActive(0)
    if (timer.current) clearTimeout(timer.current)
    if (!text.trim() || !searchEnabled) {
      seq.current++
      setHits([])
      setSearching(false)
      return
    }
    timer.current = setTimeout(() => remoteSearch(text.trim()), 300)
  }

  const go = (target: NavTarget) => { onClose(); onNavigate(target) }
  const q = query.trim().toLowerCase()

  const rows: PaletteRow[] = []
  for (const s of shortcutsMatching(shortcuts as never, query)) {
    if (!q && !s.code) continue
    rows.push({
      key: `sc-${s.code ?? s.label}`, group: tx('quickLaunch'), label: s.label, kind: 'shortcut',
      trailing: [s.code, keyLabel(s.key)].filter(Boolean).join(' · '),
      run: () => { onClose(); onLaunch(s as AppShortcutLike) },
    })
  }
  if (!q) {
    for (const r of listRecentRoutes(scope)) {
      rows.push({ key: `recent-${r.route}`, group: tx('recent'), label: r.label, kind: 'recent', run: () => go(routeTarget(r.route, r.label)) })
    }
  }
  const menuMatches = q ? menu.filter((m) => m.label.toLowerCase().includes(q) || m.breadcrumb.toLowerCase().includes(q)) : menu
  for (const m of menuMatches.slice(0, q ? 20 : 50)) {
    rows.push({ key: `menu-${m.breadcrumb}-${m.label}-${m.target.route}`, kind: 'menu', group: tx('menu'), label: m.label, description: m.breadcrumb || undefined, run: () => go(m.target) })
  }
  for (const h of hits) {
    rows.push({
      key: `hit-${h.category ?? ''}-${h.route}-${h.label}`, group: h.category || tx('results'), label: h.label,
      description: h.description ?? undefined, kind: 'hit', run: () => go(routeTarget(h.route, h.label)),
    })
  }
  if (onAskAi && q) {
    rows.push({ key: 'ask-ai', group: tx('chat'), label: tx('askAi', { query: query.trim() }), kind: 'ask', run: () => { onClose(); onAskAi(query.trim()) } })
  }

  const current = Math.min(active, Math.max(0, rows.length - 1))
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(rows.length - 1, i + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      const exact = quickLaunchMatch(shortcuts as never, query)
      if (exact) { onClose(); onLaunch(exact as AppShortcutLike); return }
      rows[current]?.run()
    }
  }
  const groups: Palette['groups'] = []
  rows.forEach((row, index) => {
    let g = groups.find((x) => x.name === row.group)
    if (!g) groups.push(g = { name: row.group, rows: [] })
    g.rows.push({ row, index })
  })
  return { query, onInput, rows, groups, searching, searchEnabled, current, setActive, onKeyDown }
}
