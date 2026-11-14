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
 *
 * <p>ONE section at most: the user is in one place. Two sections can both hold the selected route —
 * two federated apps with an entry of the same route — and the band marked both. The shell tells
 * them apart by where the screen came from (navTree.selectionSourceFor); when even that cannot, the
 * first one is marked, as the active tab is.
 */
export const markActiveSection = (items: MenuBarItem[]): MenuBarItem[] => {
    const active = items.findIndex(isActive)
    return active < 0 ? items : items.map((item, i) => i === active
        ? { ...item, className: [item.className, ACTIVE_NAV_CLASS].filter(Boolean).join(' ') }
        : item)
}
