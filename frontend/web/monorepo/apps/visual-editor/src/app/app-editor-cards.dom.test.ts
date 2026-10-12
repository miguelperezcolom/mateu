// @vitest-environment jsdom
// The app-shell editor authors card menus: a Display select on a group (List | Cards), and on each
// entry of a cards group a description, an image and (for a group = a card with actions) an icon.
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { parse } from 'yaml'
import type { AppEditor } from './app-editor'

beforeAll(async () => {
    window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as any
    await import('./app-editor')
})
afterEach(() => { document.body.innerHTML = '' })

const settle = async (el: { updateComplete: Promise<unknown> }) => { await new Promise((r) => setTimeout(r, 0)); await el.updateComplete }

async function mount(yaml: string) {
    const el = document.createElement('app-editor') as AppEditor
    el.yaml = yaml
    const saved: string[] = []
    el.addEventListener('app-save', (e) => saved.push((e as CustomEvent).detail.yaml))
    document.body.appendChild(el)
    await settle(el)
    const $$ = (s: string) => [...el.shadowRoot!.querySelectorAll(s)] as any[]
    const last = () => parse(saved[saved.length - 1])
    return { el, $$, last, saved }
}

const fire = (target: any, value: string) => {
    target.value = value
    target.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
}

const shell = `type: AppShell
menu:
  - type: Menu
    label: Quick access
    submenu:
      - type: RouteLink
        label: Check-in
        route: check-in
`

describe('app-editor — card menus', () => {
    it('offers no card fields until the group displays as cards', async () => {
        const { $$ } = await mount(shell)
        expect($$('ve-select.display')).toHaveLength(1)
        expect($$('input.description')).toHaveLength(0)
    })

    it('authors display, description, image, and a card with actions with its icon', async () => {
        const { el, $$, last } = await mount(shell)
        fire($$('ve-select.display')[0], 'cards')
        await settle(el)
        expect(last().menu[0].presentation).toEqual({ display: 'cards' })

        // the link inside is now a card
        fire($$('input.description')[0], 'Sign the registration card and scan the ID')
        await settle(el)
        fire($$('ve-image-picker.card-image')[0], '/img/checkin.png')
        await settle(el)
        expect(last().menu[0].submenu[0]).toEqual({
            type: 'RouteLink', label: 'Check-in', route: 'check-in',
            description: 'Sign the registration card and scan the ID', presentation: { image: '/img/checkin.png' },
        })

        // + Card with actions: a nested group, with its own icon picker
        const add = $$('.sub .adds button').find((b) => b.textContent.includes('Card with actions'))
        expect(add).toBeTruthy()
        add.click()
        await settle(el)
        fire($$('ve-icon-picker.card-icon')[0], 'vaadin:invoice')
        await settle(el)
        expect(last().menu[0].submenu[1]).toMatchObject({ type: 'Menu', label: 'Group', presentation: { icon: 'vaadin:invoice' } })

        // back to a plain list: the group's presentation goes, the entries keep what they declare
        fire($$('ve-select.display')[0], '')
        await settle(el)
        expect(last().menu[0].presentation).toBeUndefined()
        expect($$('input.description')).toHaveLength(0)
    })
})
