/**
 * DOM ids for the tabs of a TabLayout.
 *
 * A vaadin-tabsheet links each panel to its tab by id (`<div tab="X">` ↔ `<vaadin-tab id="X">`).
 * Using the tab LABEL as that id broke nested tab strips: an inner and an outer strip sharing a
 * label (e.g. «General») produced two tabs with the same id in the same render root, so a panel
 * could be linked to the wrong strip. Ids are therefore derived from the strip and the tab index,
 * never from the label.
 *
 * The strip key is the TabLayout's own id (the backend sends a distinct one per nested strip)
 * scoped by the tab that contains it, so even two strips with the same (or no) id — e.g. a
 * fluent UI that reuses an id, or an older backend that sent "_tabs" everywhere — stay distinct.
 */

/** Strip key for a TabLayout rendered inside the tab `parentTabId` ('' at top level). */
export const tabStripKey = (componentId: string | undefined | null, parentTabId: string = ''): string => {
    const own = sanitize(componentId) || 'tabs'
    return parentTabId ? `${parentTabId}.${own}` : own
}

/** DOM id for the tab at `index` of the strip `stripKey`. */
export const tabDomId = (stripKey: string, index: number): string => `${stripKey}-tab-${index}`

const sanitize = (id: string | undefined | null): string => (id ?? '').trim().replace(/\s+/g, '_')

/**
 * Nesting scope while a strip renders its panels. Lit evaluates the template values (and so the
 * recursive renderComponent calls for the panel content) synchronously, so a stack is enough to
 * know which tab a nested strip lives in.
 */
const scope: string[] = []

export const currentTabScope = (): string => (scope.length ? scope[scope.length - 1] : '')

export const withinTab = <T>(tabId: string, render: () => T): T => {
    scope.push(tabId)
    try {
        return render()
    } finally {
        scope.pop()
    }
}
