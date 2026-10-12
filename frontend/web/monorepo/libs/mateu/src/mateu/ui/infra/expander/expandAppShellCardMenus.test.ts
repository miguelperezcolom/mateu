// A card menu authored on a `type: AppShell` (presentation + description on menu entries) must reach
// the wire in a specsOnly bundle exactly as the server sends it. The golden
// (app-shell-card-menus.golden.json) is captured from the JAVA backend by YamlCardMenusSyncTest
// (-Dmateu.golden.write=true) over mount-home/card-menus/specs/ui/shell.yaml — the same tree as
// `shell` below. Structural subset: everything the expander emits must be present and equal.

import { describe, expect, it } from 'vitest'
import { expandAppShell } from '@infra/expander/expandDefinition'
import type { FluentNode } from '@infra/expander/expandComponent'
import { expectSubset } from '@infra/expander/__fixtures__/structuralSubset'
import golden from '@infra/expander/__fixtures__/app-shell-card-menus.golden.json'

// shell.yaml of the Java fixture, parsed.
const shell: FluentNode = {
    type: 'AppShell',
    title: 'Front office',
    variant: 'MENU_ON_TOP',
    homeRoute: 'home',
    menu: [
        { type: 'RouteLink', label: 'Home', route: 'home' },
        {
            type: 'Menu',
            label: 'Quick access',
            presentation: { display: 'cards' },
            submenu: [
                {
                    type: 'RouteLink', label: 'Check-in', route: 'check-in',
                    description: 'Sign the registration card and scan the ID',
                    presentation: { icon: 'vaadin:clipboard' },
                },
                {
                    type: 'RouteLink', label: 'Floor plan', route: 'floor-plan',
                    description: 'Rooms coloured by housekeeping status',
                    presentation: { image: '/img/floor.png' },
                },
                {
                    type: 'Menu', label: 'Billing',
                    description: 'Folios, charges and payments',
                    presentation: { icon: 'vaadin:invoice' },
                    submenu: [
                        { type: 'RouteLink', label: 'Folio', route: 'billing' },
                        { type: 'RouteLink', label: 'New booking', route: 'bookings/new' },
                    ],
                },
            ],
        },
    ],
}

const goldenMenu = (golden as any).fragments[0].component.metadata.menu

describe('client-side expander — card menus on an app shell', () => {
    const menu = (expandAppShell(shell).fragments![0] as any).component.metadata.menu

    it('reproduces the server menu (structural subset of the Java golden)', () => {
        expectSubset(menu, goldenMenu)
    })

    it('marks the group as cards and carries each card its look', () => {
        const group = menu[1]
        expect(group.display).toBe('cards')
        const [checkIn, floorPlan, billing] = group.submenus
        expect(checkIn).toMatchObject({
            description: 'Sign the registration card and scan the ID', icon: 'vaadin:clipboard', route: '/check-in',
        })
        expect(checkIn.display).toBeUndefined()
        expect(floorPlan).toMatchObject({ description: 'Rooms coloured by housekeeping status', image: '/img/floor.png' })
        expect(billing).toMatchObject({ description: 'Folios, charges and payments', icon: 'vaadin:invoice' })
        // a group inside the cards group: its entries are the card's actions
        expect(billing.submenus.map((o: any) => o.route)).toEqual(['/billing', '/bookings/new'])
    })

    it('leaves a plain entry as before', () => {
        expect(menu[0].display).toBeUndefined()
        expect(menu[0].image).toBeUndefined()
        expect(menu[0].description).toBeUndefined()
    })
})
