import type { MenuBarItem } from "@infra/ui/mateu-app.ts"

/**
 * The class the app shell's top navigation puts on the top-level item whose section is on screen.
 * mateu-app's styles paint it quietly — the primary text colour and a thin underline — so the menu
 * band says where you are without a selection highlight.
 */
export const ACTIVE_NAV_CLASS = 'mateu-nav-active'

const isActive = (item: MenuBarItem): boolean =>
    item.selected === true || (item.children ?? []).some(isActive)

/**
 * The top-level items with the active section marked: the item that is the selected route, or the
 * group holding it at any depth. Only the top level is marked — a submenu's items live in an
 * overlay and are not part of the band.
 */
export const markActiveSection = (items: MenuBarItem[]): MenuBarItem[] =>
    items.map(item => isActive(item)
        ? { ...item, className: [item.className, ACTIVE_NAV_CLASS].filter(Boolean).join(' ') }
        : item)
