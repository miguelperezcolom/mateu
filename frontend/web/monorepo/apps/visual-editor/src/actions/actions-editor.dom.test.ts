// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { parse } from 'yaml'

// The action catalogue editor: what an edit on a card writes to actions.yaml (`actions-save`), with
// what the card does not show (a REST call, unknown keys) kept verbatim.

beforeAll(async () => { await import('./actions-editor') })
afterEach(() => { document.body.innerHTML = '' })

const CATALOGUE = `type: Actions
actions:
  - id: newOrder
    description: Start a new order
    steps:
      - type: MarkClean
      - type: Navigate
        route: orders/new
  - id: refreshCustomers
    restAction:
      source: {url: https://example.test/api/customers, method: POST}
    confirmationRequired: true
`

async function editor(yaml = CATALOGUE) {
    const el = document.createElement('actions-editor') as any
    el.yaml = yaml
    el.project = { routes: [{ route: 'orders', definition: 'orders.yaml' }, { route: '' }] }
    const saved: string[] = []
    el.addEventListener('actions-save', (e: CustomEvent) => saved.push(e.detail.yaml))
    document.body.appendChild(el)
    await el.updateComplete
    await el.updateComplete
    return { el, root: el.shadowRoot as ShadowRoot, saved, last: () => parse(saved.at(-1)!) }
}
const card = (root: ShadowRoot, id: string) => root.querySelector(`.card[data-action="${id}"]`) as HTMLElement
const btn = (scope: ParentNode, text: string) => [...scope.querySelectorAll('button')].find((b) => b.textContent!.trim() === text) as HTMLButtonElement
const change = (input: HTMLElement, value: string) => { (input as HTMLInputElement).value = value; input.dispatchEvent(new Event('change', { bubbles: true, composed: true })) }

describe('<actions-editor>', () => {
    it('shows one card per action: a flow with its steps, a REST call with what it keeps as written', async () => {
        const { root } = await editor()
        expect(root.querySelector('.head .sub')?.textContent).toContain('2 actions')
        expect(card(root, 'newOrder').querySelectorAll('.step')).toHaveLength(2)
        const rest = card(root, 'refreshCustomers')
        expect(rest.querySelector('.kind')?.textContent).toBe('REST call')
        expect(rest.querySelector('.steps')).toBeNull()
        expect(rest.textContent).toContain('restAction, confirmationRequired kept as written')
    })

    it('an empty catalogue says so; + Flow adds one by id (Enter too), never a duplicate', async () => {
        const { el, root, last } = await editor('type: Actions\nactions: []\n')
        expect(root.querySelector('.empty')?.textContent).toContain('No actions yet')
        const input = root.querySelector('.add input') as HTMLInputElement
        input.value = 'goHome'
        input.dispatchEvent(new Event('input'))
        await el.updateComplete
        btn(root, '+ Flow').click()
        await el.updateComplete
        expect(last().actions).toEqual([{ id: 'goHome', steps: [] }])
        input.value = 'goHome'
        input.dispatchEvent(new Event('input'))
        await el.updateComplete
        expect(btn(root, '+ Flow').disabled).toBe(true)
        input.value = 'other'
        input.dispatchEvent(new Event('input'))
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
        await el.updateComplete
        expect(last().actions.map((a: any) => a.id)).toEqual(['goHome', 'other'])
    })

    it('renames an action, but a blank or taken id is put back', async () => {
        const { el, root, saved, last } = await editor()
        const id = card(root, 'newOrder').querySelector('input.id') as HTMLInputElement
        change(id, 'refreshCustomers')
        expect(id.value).toBe('newOrder')
        expect(saved).toEqual([])
        change(id, 'startOrder')
        await el.updateComplete
        expect(last().actions[0].id).toBe('startOrder')
        expect(last().actions[1].restAction.source.url).toBe('https://example.test/api/customers')
    })

    it('edits the description and the steps: type, route, order, removal', async () => {
        const { el, root, last } = await editor()
        const c = () => card(root, 'newOrder')
        change(c().querySelectorAll('.grid input')[1] as HTMLElement, 'Open the order form')
        await el.updateComplete
        expect(last().actions[0].description).toBe('Open the order form')
        btn(c(), '+ Step').click()
        await el.updateComplete
        expect(last().actions[0].steps).toHaveLength(3)
        // the new third step becomes an Emit with an event
        change(c().querySelectorAll('.step')[2].querySelector('ve-select') as HTMLElement, 'Emit')
        await el.updateComplete
        change(c().querySelectorAll('.step')[2].querySelector('input') as HTMLElement, 'order-opened')
        await el.updateComplete
        expect(last().actions[0].steps[2]).toEqual({ type: 'Emit', event: 'order-opened' })
        // the route of the Navigate step, through its combo
        change(c().querySelectorAll('.step')[1].querySelector('ve-combo') as HTMLElement, 'orders')
        await el.updateComplete
        expect(last().actions[0].steps[1]).toEqual({ type: 'Navigate', route: 'orders' })
        btn(c().querySelectorAll('.step')[0] as HTMLElement, '↓').click()
        await el.updateComplete
        expect(last().actions[0].steps.map((s: any) => s.type)).toEqual(['Navigate', 'MarkClean', 'Emit'])
        btn(c().querySelectorAll('.step')[2] as HTMLElement, '✕').click()
        await el.updateComplete
        expect(last().actions[0].steps).toHaveLength(2)
    })

    it('Delete removes the action; its own save echoed back does not re-parse the edit away', async () => {
        const { el, root, saved, last } = await editor()
        btn(card(root, 'refreshCustomers'), 'Delete').click()
        await el.updateComplete
        expect(last().actions.map((a: any) => a.id)).toEqual(['newOrder'])
        el.yaml = saved.at(-1)
        await el.updateComplete
        expect(root.querySelectorAll('.card')).toHaveLength(1)
        // an external change does re-parse
        el.yaml = CATALOGUE
        await el.updateComplete
        await el.updateComplete
        expect(root.querySelectorAll('.card')).toHaveLength(2)
    })
})
