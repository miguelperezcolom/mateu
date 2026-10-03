import { describe, expect, it } from 'vitest'
import { ACTIVE_NAV_CLASS, markActiveSection } from './activeSection'

/** The menu band marks the section on screen: the top-level item that is, or holds, the selected route. */
describe('the active section of the menu band', () => {
    it('marks a selected top-level entry', () => {
        const [home, orders] = markActiveSection([
            { text: 'Home', selected: false },
            { text: 'Orders', selected: true, className: 'own' },
        ])
        expect(home.className).toBeUndefined()
        expect(orders.className).toBe(`own ${ACTIVE_NAV_CLASS}`)
    })

    it('marks the group that holds the selected route, at any depth, and only the top level', () => {
        const [admin, sales] = markActiveSection([
            { text: 'Admin', children: [{ text: 'Users', children: [{ text: 'Roles', selected: true }] }] },
            { text: 'Sales', children: [{ text: 'Quotes', selected: false }] },
        ])
        expect(admin.className).toBe(ACTIVE_NAV_CLASS)
        expect((admin.children![0] as { className?: string }).className).toBeUndefined()
        expect(sales.className).toBeUndefined()
    })

    it('does not take a menu filter (a truthy string) for a selection', () => {
        const [item] = markActiveSection([{ text: 'Orders', selected: 'ord' as unknown as boolean }])
        expect(item.className).toBeUndefined()
    })
})
