// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import './mateu-table-crud'
import type { MateuTableCrud } from './mateu-table-crud'
import { componentRenderer, ComponentRenderer } from './renderers/ComponentRenderer'
import { BasicComponentRenderer } from './renderers/BasicComponentRenderer'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'

/**
 * mateu-table-crud's DS-neutral layouts (list, cards, tree, master-detail), its loading and empty
 * states and the row interactions that reach the server as actions — rendered for real in jsdom.
 */
class TestRenderer extends BasicComponentRenderer {}
beforeAll(() => componentRenderer.set(new TestRenderer() as unknown as ComponentRenderer))
afterAll(() => componentRenderer.set({} as ComponentRenderer))

const col = (id: string, over: Record<string, unknown> = {}) => ({ id: 'col-' + id, type: 'ClientSide', metadata: { type: 'GridColumn', id, label: id.toUpperCase(), dataType: 'string', ...over } })

const crud = (over: Record<string, unknown> = {}) => ({
    id: 'crud', type: 'ClientSide', children: [],
    metadata: {
        type: ComponentMetadataType.Crud, title: 'Orders', pageSize: 10, filters: [], toolbar: [],
        columns: [col('id', { identifier: true }), col('customer'), col('paid', { dataType: 'bool' })],
        ...over,
    },
})

const rows = [{ id: 'A1', customer: 'Ana', paid: true }, { id: 'B2', customer: 'Bob', paid: false }]

const mount = async (component: unknown, content: unknown[] | undefined) => {
    const el = document.createElement('mateu-table-crud') as MateuTableCrud & Record<string, any>
    el.id = 'crud'
    el.component = component as never
    el.state = {}
    el.appState = {}
    el.appData = {}
    el.data = content ? { crud: { page: { pageNumber: 0, pageSize: 10, totalElements: content.length, content } } } : {}
    el.baseUrl = ''
    const actions: { actionId: string, parameters: unknown }[] = []
    el.addEventListener('action-requested', (e) => actions.push((e as CustomEvent).detail))
    document.body.appendChild(el)
    await el.updateComplete
    return { el, actions, root: el.shadowRoot ?? el }
}

afterEach(() => { document.body.innerHTML = ''; document.documentElement.lang = 'en' })

describe('mateu-table-crud layouts', () => {
    it('list: one row per item, identifier first, a click asks to view the row', async () => {
        const { root, actions } = await mount(crud({ gridLayout: 'list' }), rows)
        const items = Array.from(root.querySelectorAll('.m-item'))
        expect(items).toHaveLength(2)
        expect(items[0].textContent).toContain('A1')
        expect(items[1].textContent).toContain('B2')
        ;(items[1] as HTMLElement).click()
        expect(actions.at(-1)).toMatchObject({ actionId: 'view', parameters: rows[1] })
    })

    it('list: rows are keyboard-operable buttons', async () => {
        const { root, actions } = await mount(crud({ gridLayout: 'list' }), rows)
        const item = root.querySelector('.m-item') as HTMLElement
        expect(item.getAttribute('role')).toBe('button')
        expect(item.getAttribute('tabindex')).toBe('0')
        item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        expect(actions.at(-1)?.actionId).toBe('view')
    })

    it('cards: renders a card per row', async () => {
        const { root } = await mount(crud({ gridLayout: 'cards' }), rows)
        expect(root.textContent).toContain('Ana')
        expect(root.textContent).toContain('Bob')
    })

    it('tree: nested rows render under their parents', async () => {
        const tree = [{ id: 'P', customer: 'Parent', children: [{ id: 'C', customer: 'Child', children: [] }] }]
        const { root } = await mount(crud({ gridLayout: 'tree' }), tree)
        expect(root.textContent).toContain('Parent')
        expect(root.textContent).toContain('Child')
    })

    it('an empty listing shows the localized empty state, not a bare "No data."', async () => {
        document.documentElement.lang = 'es'
        const { root } = await mount(crud({ gridLayout: 'list' }), [])
        expect(root.querySelector('.mateu-empty-state')).not.toBeNull()
        expect(root.textContent).toContain('Aún no hay nada aquí.')
    })

    it('while the first rows are awaited it says it is loading (in the page language) and shows a skeleton', async () => {
        document.documentElement.lang = 'es'
        const { el, root } = await mount(crud({ gridLayout: 'list' }), undefined)
        ;(el as any).beginLoading()
        await el.updateComplete
        expect(root.querySelector('[role="status"]')?.textContent).toContain('Cargando…')
        expect(root.querySelector('mateu-skeleton')).not.toBeNull()
    })

    it('infinite scrolling shows the total, localized', async () => {
        const { root } = await mount(crud({ gridLayout: 'list', infiniteScrolling: true }), rows)
        expect(root.textContent).toContain('2 items found.')
    })

    it('the toolbar buttons dispatch their action', async () => {
        const { root, actions } = await mount(crud({ gridLayout: 'list', toolbar: [{ id: 'new', actionId: 'new', label: 'New' }] }), rows)
        const button = root.querySelector('[data-action-id="new"]') as HTMLButtonElement
        expect(button).not.toBeNull()
        button.click()
        expect(actions.map((a) => a.actionId)).toContain('new')
    })
})
