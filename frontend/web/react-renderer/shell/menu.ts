import type { MateuSession, NavTarget } from '@rn/core/MateuSession'
import { isCurrentDestination } from '@rn/core/uxRules'
import { isRuleLeaf, menuLeafEffects, type ShellAction } from '@rn/core/shellFlows'
import { safeNavigate } from '@infra/ui/safeNavigate.ts'
import { runAndApply, type AppTarget } from './appLevel'

type Dict = Record<string, unknown>

/** The app shell's menu, as the wire sends it (MenuOptionDto), and the rules every renderer's navs follow. */
export interface MenuItem {
  label?: string
  separator?: boolean
  route?: string
  consumedRoute?: string
  serverSideType?: string
  /** A federated entry: the backend that serves it (another Mateu app the shell's menu names). */
  baseUrl?: string | null
  actionId?: string | null
  submenus?: MenuItem[]
  description?: string | null
  icon?: string | null
  image?: string | null
  display?: string | null
  rules?: { action?: string; actionId?: string | null }[] | null
  disabled?: boolean
  visible?: boolean
}

/** The entries worth drawing: labelled or separators, not hidden. */
export const visibleItems = (items: MenuItem[] | undefined): MenuItem[] =>
  (items ?? []).filter((m) => m && m.visible !== false && (m.label || m.separator))

export const subsOf = (item: MenuItem) => visibleItems(item.submenus)
export const isGroup = (item: MenuItem) => subsOf(item).length > 0

/** A group holds the screen on view when one of its entries (at any depth) does. */
export function holdsCurrent(item: MenuItem, currentRoute: string): boolean {
  if (!isGroup(item)) return isCurrentDestination(item, currentRoute)
  return subsOf(item).some((s) => holdsCurrent(s, currentRoute))
}

/** What happens when an entry is chosen; the shell passes it to every nav. */
export interface MenuHandlers {
  currentRoute: string
  /** A leaf: navigate, run its action or its rules. */
  activate: (item: MenuItem) => void
  /** A `display: "cards"` group: its cards. */
  openCards: (group: MenuItem) => void
}

/**
 * The shell's leaf rule: a rule leaf runs its rules (a flow the browser runs), an action leaf runs
 * its app-level action, any other leaf navigates (remote and uriPrefix entries keep the shell's
 * navigation path, which the server resolves).
 */
export function useMenuActivation(session: MateuSession, app: Dict, target: AppTarget, onNavigate: (t: NavTarget) => void) {
  return (item: MenuItem) => {
    if (item.disabled) return
    if (isRuleLeaf(item)) {
      for (const effect of menuLeafEffects(item, app['actions'] as ShellAction[] | undefined, (app['actionCatalogue'] as ShellAction[] | undefined) ?? [])) {
        switch (effect.kind) {
          case 'navigate': {
            const root = (target.rootRoute ?? '').replace(/\/+$/, '')
            onNavigate({ label: item.label ?? '', route: `${root}/${effect.route}`, consumedRoute: target.rootRoute ?? '', serverSideType: '' })
            break
          }
          case 'url':
            safeNavigate(effect.url)
            break
          case 'runAction':
          case 'restAction':
            void runAndApply(session, target, effect.actionId)
            break
          case 'event':
            session.dispatchEvent(effect.eventName, effect.payload)
            break
          case 'closeOverlay':
            session.closeTopOverlay()
            if (effect.eventName) session.dispatchEvent(effect.eventName, effect.payload ?? null)
            break
        }
      }
      return
    }
    if (item.actionId && !item.route) {
      void runAndApply(session, target, item.actionId)
      return
    }
    // a federated entry loads from ITS backend (the shell declared it trusted: declareMenuRemotes)
    onNavigate({ label: item.label ?? '', route: item.route ?? '', consumedRoute: item.consumedRoute ?? '', serverSideType: item.serverSideType ?? '', ...(item.baseUrl ? { baseUrl: item.baseUrl } : {}) } as NavTarget)
  }
}

/** The menu reduced to the entries whose label holds every word typed (a group stays for its matches, or whole when it matches). */
export function filterMenu(menu: MenuItem[], query: string): MenuItem[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  const hit = (m: MenuItem) => words.every((w) => (m.label ?? '').toLowerCase().includes(w))
  const walk = (items: MenuItem[]): MenuItem[] => items.flatMap((m) => {
    if (m.separator) return []
    const subs = m.submenus?.length ? walk(m.submenus) : []
    if (hit(m)) return [m]
    return subs.length ? [{ ...m, submenus: subs }] : []
  })
  return walk(menu)
}

/** A group's first navigable entry (where a section or a tab group opens). */
export function firstLeaf(item: MenuItem): MenuItem | undefined {
  for (const s of subsOf(item)) {
    if (s.separator) continue
    if (!isGroup(s)) return s
    const deeper = firstLeaf(s)
    if (deeper) return deeper
  }
  return undefined
}
