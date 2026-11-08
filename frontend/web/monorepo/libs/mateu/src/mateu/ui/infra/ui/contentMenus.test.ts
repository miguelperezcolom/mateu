// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { html, LitElement, render } from 'lit'
import { isMenuGroup, selectContentMenuOption } from './contentMenus'
import { renderDirectory } from './renderers/directoryRenderer'
import { renderMenuBar } from './renderers/menuRenderer'

/**
 * The menus a page carries in its content (MenuBar, ContextMenu, Directory): a leaf arrives with
 * `submenus: []` and is a link, not an empty group; picking it navigates to its route or runs its
 * action. Both were broken (Mateu Explorer, 3.0-beta.51).
 */
const leaf = (label: string, extra: Record<string, unknown> = {}) =>
    ({ label, path: label.toLowerCase(), submenus: [], separator: false, ...extra }) as never
const group = (label: string, submenus: unknown[]) =>
    ({ label, path: label.toLowerCase(), submenus, separator: false }) as never

const heard = (el: EventTarget) => {
    const events: { type: string, detail: unknown }[] = []
    for (const type of ['route-changed', 'navigate-to-requested', 'action-requested']) {
        el.addEventListener(type, (e) => events.push({ type, detail: (e as CustomEvent).detail }))
    }
    return events
}

afterEach(() => { document.body.innerHTML = '' })

describe('content menus', () => {
    it('an option is a group only when it has entries', () => {
        expect(isMenuGroup(leaf('Kanban'))).toBe(false)
        expect(isMenuGroup(group('Collections', [leaf('Kanban')]))).toBe(true)
        expect(isMenuGroup({ label: 'x' } as never)).toBe(false)
    })

    it('picking a leaf with a route navigates; one with an action id runs it', () => {
        const el = document.createElement('div')
        document.body.appendChild(el)
        const events = heard(document.body)
        selectContentMenuOption(el, leaf('Kanban', { route: '/components/kanban' }))
        expect(events.map(e => e.type)).toEqual(['route-changed', 'navigate-to-requested'])
        expect(events[0].detail).toEqual({ route: '/components/kanban' })
        events.length = 0
        selectContentMenuOption(el, leaf('Refresh', { actionId: 'refresh' }))
        expect(events).toEqual([{ type: 'action-requested', detail: { actionId: 'refresh' } }])
        events.length = 0
        selectContentMenuOption(el, leaf('Off', { route: '/x', disabled: true }))
        selectContentMenuOption(el, group('G', [leaf('a', { route: '/a' })]))
        expect(events).toEqual([])
    })

    it('a Directory draws a leaf as a link that navigates, a group as a section', () => {
        const host = document.createElement('div')
        document.body.appendChild(host)
        render(renderDirectory({ type: 'ClientSide', id: 'd', metadata: { type: 'Directory', menu: [
            group('Visualise', [leaf('Charts', { route: '/components/charts' })]),
        ] } } as never, undefined, {}, {}), host)
        expect(host.querySelectorAll('details')).toHaveLength(1)
        const link = host.querySelector('a')!
        expect(link.textContent).toBe('Charts')
        expect(link.closest('details')!.querySelector('summary')!.textContent).toBe('Visualise')
        const events = heard(document.body)
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }))
        expect(events.map(e => e.type)).toEqual(['route-changed', 'navigate-to-requested'])
    })

    it('the neutral MenuBar draws leaves as items that navigate when picked', () => {
        const host = document.createElement('div')
        document.body.appendChild(host)
        render(renderMenuBar({} as LitElement, { type: 'ClientSide', id: 'm', metadata: { type: 'MenuBar', options: [
            leaf('Home', { route: '/home' }),
        ] } } as never, undefined, {}, {}), host)
        expect(host.querySelector('details')).toBeNull()
        const events = heard(document.body)
        ;(host.querySelector('[role="menuitem"]') as HTMLElement).click()
        expect(events[0]).toEqual({ type: 'route-changed', detail: { route: '/home' } })
        void html
    })
})
