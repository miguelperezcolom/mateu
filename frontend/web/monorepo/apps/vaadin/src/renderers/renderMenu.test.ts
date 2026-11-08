// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import type { LitElement } from 'lit'
import { mapItems, onContentItemSelected } from './renderMenu'

/**
 * A MenuBar / ContextMenu in the page content (Vaadin): a leaf (`submenus: []`) is an item, not an
 * empty sub-menu, and picking it navigates to its route or runs its action — nothing listened for
 * the selection before (Mateu Explorer, 3.0-beta.51).
 */
const leaf = (label: string, extra: Record<string, unknown> = {}) =>
    ({ label, path: label.toLowerCase(), submenus: [], separator: false, ...extra })

describe('content MenuBar / ContextMenu items', () => {
    it('a leaf is an item with no children; a group keeps its entries', () => {
        const items = mapItems({} as LitElement, [
            leaf('Home', { route: '/home' }),
            { label: 'Collections', path: 'collections', separator: false, submenus: [leaf('Kanban', { route: '/kanban' })] },
        ] as never, undefined, {}, {}, {}, {})
        expect(items[0].children).toBeUndefined()
        expect(items[1].children).toHaveLength(1)
        expect(items[1].children![0].children).toBeUndefined()
    })

    it('picking an item navigates to its route, or runs its action', () => {
        const [home, refresh] = mapItems({} as LitElement, [
            leaf('Home', { route: '/home' }), leaf('Refresh', { actionId: 'refresh' }),
        ] as never, undefined, {}, {}, {}, {})
        const bar = document.createElement('vaadin-menu-bar')
        document.body.appendChild(bar)
        const events: { type: string, detail: unknown }[] = []
        for (const type of ['route-changed', 'navigate-to-requested', 'action-requested']) {
            document.body.addEventListener(type, (e) => events.push({ type, detail: (e as CustomEvent).detail }))
        }
        const pick = (value: unknown) => {
            const e = new CustomEvent('item-selected', { detail: { value } })
            Object.defineProperty(e, 'currentTarget', { value: bar })
            onContentItemSelected(e)
        }
        pick(home)
        expect(events.map(e => e.type)).toEqual(['route-changed', 'navigate-to-requested'])
        expect(events[0].detail).toEqual({ route: '/home' })
        events.length = 0
        pick(refresh)
        expect(events).toEqual([{ type: 'action-requested', detail: { actionId: 'refresh' } }])
    })
})
