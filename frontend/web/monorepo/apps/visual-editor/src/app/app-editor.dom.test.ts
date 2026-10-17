// @vitest-environment jsdom
// The app-shell editor's general settings, header switches, the shell's flows, the menu and the
// header widgets: what each edit writes to the AppShell file (`app-save`), the rest kept.
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { parse } from 'yaml'
import type { AppEditor } from './app-editor'

beforeAll(async () => {
    window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as any
    await import('./app-editor')
})
afterEach(() => { document.body.innerHTML = '' })

const settle = async (el: { updateComplete: Promise<unknown> }) => { await new Promise((r) => setTimeout(r, 0)); await el.updateComplete }

const SHELL = `type: AppShell
title: Shop
menu:
  - type: RouteLink
    label: Orders
    route: orders
  - type: Menu
    label: Admin
    submenu:
      - type: RouteLink
        label: Users
        route: users
  - type: Separator
`

async function mount(yaml = SHELL) {
    const el = document.createElement('app-editor') as AppEditor
    el.yaml = yaml
    el.project = { routes: [{ route: 'orders' }, { route: 'users' }], sources: [] } as any
    const saved: string[] = []
    el.addEventListener('app-save', (e) => saved.push((e as CustomEvent).detail.yaml))
    document.body.appendChild(el)
    await settle(el)
    const root = el.shadowRoot!
    const $$ = (s: string) => [...root.querySelectorAll(s)] as any[]
    const btn = (text: string, scope: ParentNode = root) => [...scope.querySelectorAll('button')].find((b) => b.textContent!.trim() === text) as HTMLButtonElement
    return { el, root, $$, btn, saved, last: () => parse(saved[saved.length - 1]) }
}
const fire = (target: any, value: string | boolean) => {
    if (typeof value === 'boolean') target.checked = value
    else target.value = value
    target.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
}
const labelled = (root: ShadowRoot, text: string) => {
    const label = [...root.querySelectorAll('label')].find((l) => l.textContent!.trim() === text)!
    return label.nextElementSibling as any
}

describe('<app-editor> general settings', () => {
    it('writes title, subtitle, variant and accent colour; clearing a field removes the key', async () => {
        const { el, root, last } = await mount()
        fire(labelled(root, 'Subtitle'), 'Back office')
        await settle(el)
        expect(last().subtitle).toBe('Back office')
        fire(labelled(root, 'Variant'), 'MENU_ON_TOP')
        await settle(el)
        expect(last().variant).toBe('MENU_ON_TOP')
        fire(root.querySelector('.accent input[type=color]'), '#d2232a')
        await settle(el)
        expect(last().accentColor).toBe('#d2232a')
        expect((root.querySelector('.accent input[type=color]') as HTMLInputElement).value).toBe('#d2232a')
        fire(root.querySelectorAll('.accent input')[1], '  ')
        await settle(el)
        expect(last().accentColor).toBeUndefined()
        fire(labelled(root, 'Title'), '')
        await settle(el)
        expect(last().title).toBeUndefined()
        // the menu is kept untouched by a settings edit
        expect(last().menu).toEqual(parse(SHELL).menu)
    })

    it('the header switches and "Drawer closed" write true, and unticking removes the key', async () => {
        const { el, root, last } = await mount()
        const check = (text: string) => [...root.querySelectorAll('label.check, div.check')].find((l) => l.textContent!.includes(text))!.querySelector('input')!
        fire(check('Command center'), true)
        await settle(el)
        fire(check('Drawer closed'), true)
        await settle(el)
        expect(last()).toMatchObject({ commandCenter: true, drawerClosed: true })
        fire(check('Command center'), false)
        await settle(el)
        expect(last().commandCenter).toBeUndefined()
    })

    it('the home route is picked from the project\'s routes', async () => {
        const { el, root, last } = await mount()
        const combo = labelled(root, 'Home route')
        expect(combo.options.map((o: any) => o.value)).toEqual(['orders', 'users'])
        fire(combo, 'users')
        await settle(el)
        expect(last().homeRoute).toBe('users')
    })
})

describe('<app-editor> the shell\'s flows', () => {
    it('adds a flow, gives it steps, reorders and removes them, then removes the flow', async () => {
        const { el, root, btn, last } = await mount()
        const input = root.querySelector('.adds input') as HTMLInputElement
        input.value = 'signOut'
        input.dispatchEvent(new Event('input'))
        await settle(el)
        btn('+ Flow').click()
        await settle(el)
        expect(last().actions).toEqual([{ id: 'signOut', steps: [] }])
        btn('+ Step').click()
        await settle(el)
        btn('+ Step').click()
        await settle(el)
        const steps = () => [...root.querySelectorAll('.menu-row.step')] as HTMLElement[]
        fire(steps()[1].querySelector('ve-select'), 'MarkClean')
        await settle(el)
        fire(steps()[0].querySelector('ve-combo'), 'orders')
        await settle(el)
        expect(last().actions[0].steps).toEqual([{ type: 'Navigate', route: 'orders' }, { type: 'MarkClean' }])
        btn('↑', steps()[1]).click()
        await settle(el)
        expect(last().actions[0].steps.map((s: any) => s.type)).toEqual(['MarkClean', 'Navigate'])
        btn('✕', steps()[0]).click()
        await settle(el)
        expect(last().actions[0].steps).toEqual([{ type: 'Navigate', route: 'orders' }])
        ;(root.querySelector('button[title="Remove action"]') as HTMLButtonElement).click()
        await settle(el)
        expect(last().actions).toBeUndefined()
    })
})

describe('<app-editor> the menu', () => {
    it('edits a link\'s label and route, its access, and adds entries at the top and inside a group', async () => {
        const { el, root, btn, last } = await mount()
        const firstRow = root.querySelector('.menu-item .menu-row') as HTMLElement
        fire(firstRow.querySelector('input[placeholder=Label]'), 'All orders')
        await settle(el)
        fire(firstRow.querySelector('ve-combo'), 'users')
        await settle(el)
        fire(firstRow.querySelector('input.access'), 'admin, hr')
        await settle(el)
        expect(last().menu[0]).toMatchObject({ label: 'All orders', route: 'users' })
        expect(JSON.stringify(last().menu[0].access)).toContain('admin')
        fire(root.querySelector('.menu-item .menu-row input.access'), '')
        await settle(el)
        expect(last().menu[0].access).toBeUndefined()

        // + Action at the top level, + Link inside the Admin group
        const topAdds = [...root.querySelectorAll('.adds')].find((a) => a.textContent!.includes('+ Group'))!
        btn('+ Action', topAdds).click()
        await settle(el)
        // a menu leaf that runs an action is a RuleLink with one RunAction rule
        expect(last().menu.at(-1)).toEqual({ type: 'RuleLink', label: 'Action', rules: [{ action: 'RunAction', actionId: 'actionId' }] })
        const groupAdds = root.querySelector('.sub .adds') as HTMLElement
        btn('+ Link', groupAdds).click()
        await settle(el)
        expect(last().menu[1].submenu.map((x: any) => x.label)).toEqual(['Users', 'Label'])
        btn('+ Separator', groupAdds).click()
        await settle(el)
        expect(last().menu[1].submenu).toHaveLength(3)
    })

    it('an action entry names the flow it runs; ✕ removes an entry (a separator too)', async () => {
        const { el, root, btn, last } = await mount('type: AppShell\nmenu:\n  - type: MenuSeparator\n  - type: RuleLink\n    label: Sign out\n    rules: [{action: RunAction, actionId: signOut}]\n')
        const action = [...root.querySelectorAll('.menu-item')].find((m) => m.textContent!.includes('Action'))! as HTMLElement
        fire(action.querySelector('ve-combo'), 'logout')
        await settle(el)
        expect(last().menu[1].rules).toEqual([{ action: 'RunAction', actionId: 'logout' }])
        btn('✕', root.querySelector('.menu-item') as HTMLElement).click()
        await settle(el)
        expect(last().menu).toHaveLength(1)
        expect(last().menu[0].label).toBe('Sign out')
    })
})

describe('<app-editor> header widgets', () => {
    it('adds a widget, edits its text, reorders and removes it', async () => {
        const { el, root, btn, last } = await mount()
        const widgetAdds = [...root.querySelectorAll('.adds')].at(-1) as HTMLElement
        const kinds = [...widgetAdds.querySelectorAll('button')]
        kinds[0].click()
        await settle(el)
        kinds[0].click()
        await settle(el)
        expect(last().widgets).toHaveLength(2)
        const rows = () => [...root.querySelectorAll('.menu-item')].filter((m) => m.querySelector('button[title="Move up"]')) as HTMLElement[]
        fire(rows()[1].querySelector('input'), 'Hello')
        await settle(el)
        expect(last().widgets[1]).toEqual({ type: 'Button', label: 'Hello' })
        ;(rows()[1].querySelector('button[title="Move up"]') as HTMLButtonElement).click()
        await settle(el)
        expect(last().widgets[0]).toEqual({ type: 'Button', label: 'Hello' })
        ;(rows()[0].querySelector('button[title="Remove"]') as HTMLButtonElement).click()
        await settle(el)
        expect(last().widgets).toHaveLength(1)
        expect(btn('↓', rows()[0]).disabled).toBe(true)
    })
})
