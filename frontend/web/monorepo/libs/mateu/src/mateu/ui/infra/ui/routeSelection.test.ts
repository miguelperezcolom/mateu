import { describe, expect, it } from 'vitest'
import type MenuOption from '@mateu/shared/apiClients/dtos/componentmetadata/MenuOption'
import { isMostSpecificFor, menuSpellingOf } from './navTree'
import { pathBelowConsumedRoute } from './navigationUrl'

const entry = (label: string, route: string, submenus: MenuOption[] = []) =>
    ({ label, route, submenus } as unknown as MenuOption)

/**
 * One entry of the menu is the active one: the most specific match (exact, else the longest
 * prefix). «Open orders» (/shop/orders) used to stay highlighted beside «Pending»
 * (/shop/orders/pending) on /shop/orders/pending — and, being first, was the one the band marked.
 */
describe('isMostSpecificFor', () => {
    const open = entry('Open orders', '/shop/orders')
    const pending = entry('Pending', '/shop/orders/pending')
    const menu = [open, pending]

    it('the longest match wins over a prefix', () => {
        expect(isMostSpecificFor(pending, menu, '/shop/orders/pending')).toBe(true)
        expect(isMostSpecificFor(open, menu, '/shop/orders/pending')).toBe(false)
    })

    it('a prefix is still active when nothing longer matches (a record opened from it)', () => {
        expect(isMostSpecificFor(open, menu, '/shop/orders/42')).toBe(true)
        expect(isMostSpecificFor(pending, menu, '/shop/orders/42')).toBe(false)
    })

    it('a group holding the most specific entry is active, a sibling prefix is not', () => {
        const group = entry('Sales', '/shop/sales', [entry('Orders', '/shop/sales/orders'), entry('Pending', '/shop/sales/orders/pending')])
        const tree = [group, entry('Customers', '/shop/customers')]
        expect(isMostSpecificFor(group, tree, '/shop/sales/orders/pending')).toBe(true)
        expect(isMostSpecificFor(group.submenus[0], tree, '/shop/sales/orders/pending')).toBe(false)
        expect(isMostSpecificFor(group.submenus[1], tree, '/shop/sales/orders/pending')).toBe(true)
    })

    it('the query does not count', () => {
        expect(isMostSpecificFor(pending, menu, '/shop/orders/pending?status=archived')).toBe(true)
        expect(isMostSpecificFor(open, menu, '/shop/orders/pending?status=archived')).toBe(false)
    })
})

/**
 * A fresh load under a non-root mount holds the mount-relative route (/orders/pending) while an
 * entry authored with the full path carries the mount: compared as they were, no entry was active.
 */
describe('menuSpellingOf', () => {
    const menu = [entry('Probe', '/probe'), entry('Open orders', '/shop/orders'), entry('Pending', '/shop/orders/pending')]

    it('puts the mount in front when the menu spells its entries with it', () => {
        expect(menuSpellingOf(menu, '/orders/pending', '/shop')).toBe('/shop/orders/pending')
        expect(isMostSpecificFor(menu[2], menu, menuSpellingOf(menu, '/orders/pending', '/shop'))).toBe(true)
    })

    it('keeps the route when an entry answers it as it is, or it already carries the mount', () => {
        expect(menuSpellingOf(menu, '/probe', '/shop')).toBe('/probe')
        expect(menuSpellingOf(menu, '/shop/orders', '/shop')).toBe('/shop/orders')
        expect(menuSpellingOf(menu, '/elsewhere', '/shop')).toBe('/elsewhere')
    })

    it('the root mount changes nothing', () => {
        expect(menuSpellingOf(menu, '/orders/pending', '/')).toBe('/orders/pending')
    })
})

/**
 * A record master's tab (a routes.yaml child of customers/:customerId) under a NON-root mount: the
 * consumed route is mount-relative, so it has to be taken off below the mount — compared with the
 * whole pathname it was found only on the root mount, and the tab pushed
 * /shop/customers/7/customers/7/notes.
 */
describe('pathBelowConsumedRoute', () => {
    it('takes the consumed route off below a non-root mount', () => {
        expect(pathBelowConsumedRoute('/shop/customers/7/notes', '/shop', '/customers/7')).toBe('/shop/notes')
        expect(pathBelowConsumedRoute('/shop/customers/7/notes', '/shop/', '/customers/7')).toBe('/shop/notes')
    })

    it('the root mount behaves as before', () => {
        expect(pathBelowConsumedRoute('/customers/7/notes', '/', '/customers/7')).toBe('/notes')
        expect(pathBelowConsumedRoute('/customers/7/notes', '', '/customers/7')).toBe('/notes')
        expect(pathBelowConsumedRoute('/customers/7', '', '/customers/7')).toBe('/')
    })

    it('a consumed route spelt with the mount is taken off as it is', () => {
        expect(pathBelowConsumedRoute('/shop/customers/7/notes', '/shop', '/shop/customers/7')).toBe('/notes')
    })

    it('nothing to take off', () => {
        expect(pathBelowConsumedRoute('/shop/orders', '/shop', '/customers/7')).toBeUndefined()
        expect(pathBelowConsumedRoute('/shop/orders', '/shop', undefined)).toBeUndefined()
        expect(pathBelowConsumedRoute('/shop/orders', '/shop', '')).toBeUndefined()
    })
})
