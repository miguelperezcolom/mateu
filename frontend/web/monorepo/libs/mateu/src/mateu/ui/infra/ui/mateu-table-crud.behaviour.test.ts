// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import './mateu-table-crud'
import type { MateuTableCrud } from './mateu-table-crud'
import { componentRenderer, ComponentRenderer } from './renderers/ComponentRenderer'
import { BasicComponentRenderer } from './renderers/BasicComponentRenderer'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import { registerExternalJsonMock } from '@infra/http/externalOptions'
import { writeColumnPrefs } from '../columnPrefsStore'
import { setRestSourceCatalogue } from '@infra/http/restSourceCatalogue'

/**
 * mateu-table-crud's behaviour around the rows: the URL as the source of truth for page/sort/
 * filters, the toolbar (routes, import, selection-gated bulk actions), row actions in the list/
 * card/tree/master-detail layouts, external-REST listings and the user's column prefs.
 */
class TestRenderer extends BasicComponentRenderer {}
beforeAll(() => componentRenderer.set(new TestRenderer() as unknown as ComponentRenderer))
afterAll(() => componentRenderer.set({} as ComponentRenderer))

const col = (id: string, over: Record<string, unknown> = {}) => ({ id: 'col-' + id, type: 'ClientSide', metadata: { type: 'GridColumn', id, label: id.toUpperCase(), dataType: 'string', ...over } })

const crud = (over: Record<string, unknown> = {}, id = 'crud') => ({
    id, type: 'ClientSide', children: [],
    metadata: {
        type: ComponentMetadataType.Crud, title: 'Orders', pageSize: 10, toolbar: [],
        filters: [{ fieldId: 'customer', label: 'Customer', dataType: 'string' },
            { fieldId: 'date', label: 'Date', dataType: 'date', stereotype: 'dateRange' }],
        columns: [col('id', { identifier: true }), col('customer'), col('paid', { dataType: 'bool' })],
        ...over,
    },
})

const rows = [{ id: 'A1', customer: 'Ana', paid: true }, { id: 'B2', customer: 'Bob', paid: false }]

type Captured = { type: string, detail: any }

const mount = async (component: unknown, content: unknown[] | undefined, extra: Record<string, unknown> = {}, parent: HTMLElement = document.body) => {
    const el = document.createElement('mateu-table-crud') as MateuTableCrud & Record<string, any>
    el.id = (component as { id: string }).id
    el.component = component as never
    el.state = {}
    el.appState = {}
    el.appData = {}
    el.data = content ? { [el.id]: { page: { pageNumber: 0, pageSize: 10, totalElements: content.length, content } } } : {}
    el.baseUrl = ''
    Object.assign(el, extra)
    const events: Captured[] = []
    for (const type of ['action-requested', 'route-changed', 'navigate-to-requested']) {
        el.addEventListener(type, (e) => events.push({ type, detail: (e as CustomEvent).detail }))
    }
    parent.appendChild(el)
    await el.updateComplete
    await el.updateComplete
    const actions = () => events.filter(e => e.type === 'action-requested').map(e => e.detail)
    return { el, events, actions, root: (el.shadowRoot ?? el) as ParentNode }
}

const settle = () => new Promise(r => setTimeout(r, 0))

beforeEach(() => history.replaceState(null, '', '/orders'))
afterEach(() => {
    document.body.innerHTML = ''
    localStorage.clear()
    registerExternalJsonMock(null)
    setRestSourceCatalogue([])
    history.replaceState(null, '', '/')
})

describe('the URL is the listing\'s memory', () => {
    it('a deep link with page, sort and filters searches for exactly that on mount', async () => {
        history.replaceState(null, '', '/orders?page=2&sort=customer:asc&customer=An&date_from=2024-01-01&other=x')
        const { actions } = await mount(crud(), undefined)
        const search = actions().find(a => a.actionId === 'search')
        expect(search).toBeDefined()
        expect(search.parameters._searchState).toMatchObject({
            page: 2, size: 10, sort: [{ fieldId: 'customer', direction: 'asc' }],
            customer: 'An', date_from: '2024-01-01',
        })
        // a param that is not a filter of this listing is not hydrated into its state
        expect(search.parameters._searchState.other).toBeUndefined()
        // and the URL keeps saying the same thing
        expect(window.location.search).toContain('page=2')
        expect(window.location.search).toContain('other=x')
    })

    it('?q= is read as the search text and rewritten as searchText once the listing owns the URL', async () => {
        history.replaceState(null, '', '/orders?q=madrid')
        const { actions } = await mount(crud(), undefined)
        expect(actions().find(a => a.actionId === 'search').parameters._searchState.searchText).toBe('madrid')
        expect(window.location.search).toBe('?searchText=madrid')
    })

    it('a plain URL does not search on mount (the server trigger does that)', async () => {
        const { actions } = await mount(crud(), rows)
        expect(actions().filter(a => a.actionId === 'search')).toHaveLength(0)
    })

    it('search() starts from page 0, clears the selection, writes the filters to the URL and asks the server', async () => {
        const { el, actions } = await mount(crud(), rows)
        el.state = { ...el.state, page: 3, customer: 'Bo', date_to: '2024-02-01', crud_selected_items: [rows[0]] }
        el.search()
        const search = actions().at(-1)
        expect(search.actionId).toBe('search')
        expect(search.parameters).toMatchObject({ crudId: 'crud', _searchState: { page: 0, size: 10, customer: 'Bo', crud_selected_items: [] } })
        const params = new URLSearchParams(window.location.search)
        expect(params.get('customer')).toBe('Bo')
        expect(params.get('date_to')).toBe('2024-02-01')
        expect(params.has('page')).toBe(false)
    })

    it('a page change keeps the page in the URL and asks for that page at the declared size', async () => {
        const { el, actions } = await mount(crud(), rows)
        el.state = { ...el.state, sort: [{ fieldId: 'customer', direction: 'desc' }] }
        el.pageChanged(new CustomEvent('page-changed', { detail: { page: 4 } }))
        expect(actions().at(-1).parameters._searchState).toMatchObject({ page: 4, size: 10 })
        const params = new URLSearchParams(window.location.search)
        expect(params.get('page')).toBe('4')
        expect(params.get('sort')).toBe('customer:desc')
        // the rows being replaced are cleared so the listing shows it is loading
        expect(el.data.crud.page.content).toEqual([])
    })

    it('infinite scrolling asks for more with the page and size the grid gives, without clearing rows', async () => {
        const { el, actions } = await mount(crud({ infiniteScrolling: true, pageSize: 0 }), rows)
        const callback = () => {}
        el.fetchMoreElements(new CustomEvent('fetch-more-elements', { detail: { params: { page: 1, pageSize: 25 }, callback } }))
        const search = actions().at(-1)
        expect(search.parameters._searchState).toMatchObject({ page: 1, size: 25 })
        expect(search.callback).toBe(callback)
        expect(el.data.crud.page.content).toHaveLength(2)
    })

    it('a read-only filter (the listing\'s scope) never reaches the query string', async () => {
        const { el } = await mount(crud({ filters: [{ fieldId: 'hotel', dataType: 'string', readOnly: true }] }), rows)
        el.state = { ...el.state, hotel: 'H1' }
        el.search()
        expect(window.location.search).toBe('')
    })

    it('the same listing reached again with another query starts over from the URL', async () => {
        history.replaceState(null, '', '/orders?customer=Ana')
        const { el, actions } = await mount(crud(), undefined)
        expect(actions().at(-1).parameters._searchState.customer).toBe('Ana')
        history.replaceState(null, '', '/orders?date_from=2024-03-01')
        el.component = { ...crud() } as never
        await el.updateComplete
        const last = actions().at(-1).parameters._searchState
        expect(last.date_from).toBe('2024-03-01')
        expect(last.customer).toBeUndefined()
    })

    it('a re-render with a fresh server state puts back the filters the URL still names', async () => {
        history.replaceState(null, '', '/orders?customer=Ana')
        const { el } = await mount(crud(), undefined)
        el.state = { page: 0 }
        el.component = { ...el.component } as never
        await el.updateComplete
        expect(el.state.customer).toBe('Ana')
    })
})

describe('the crud header and toolbar', () => {
    it('shows the title and subtitle interpolated against the state', async () => {
        const { root } = await mount(crud({ title: 'Orders of ${state.who}', subtitle: 'since ${state.since}' }), rows, { state: { who: 'Ana', since: '2024' } })
        expect(root.querySelector('h2')?.textContent).toBe('Orders of Ana')
        expect(root.textContent).toContain('since 2024')
    })

    it('a back button reads as a chevron and dispatches its action; cancel and actions are split by a divider', async () => {
        const { root, actions } = await mount(crud({ toolbar: [
            { id: 'back', actionId: 'back', label: 'Back' },
            { id: 'cancel', actionId: 'cancel-edit', label: 'Cancel' },
            { id: 'save', actionId: 'save', label: 'Save' },
        ] }), rows)
        const chevron = root.querySelector('.back-chevron') as HTMLButtonElement
        expect(chevron.getAttribute('aria-label')).toBe('Back')
        chevron.click()
        expect(actions().at(-1).actionId).toBe('back')
        expect(root.querySelector('.toolbar-divider')).not.toBeNull()
    })

    it('a toolbar button with a route navigates on the client instead of running an action', async () => {
        const { root, events } = await mount(crud({ toolbar: [{ id: 'new', actionId: 'new', label: 'New', route: '/orders/new/${state.kind}' }] }), rows, { state: { kind: 'b2b' } })
        ;(root.querySelector('[data-action-id="new"]') as HTMLButtonElement).click()
        expect(events.map(e => e.type)).toEqual(['route-changed', 'navigate-to-requested'])
        expect(events[0].detail.route).toBe('/orders/new/b2b')
    })

    it('a route that cannot be resolved yet falls back to the action', async () => {
        const { root, actions } = await mount(crud({ toolbar: [{ id: 'new', actionId: 'new', label: 'New', route: '/orders/${state.order.id}' }] }), rows)
        ;(root.querySelector('[data-action-id="new"]') as HTMLButtonElement).click()
        expect(actions().at(-1).actionId).toBe('new')
    })

    it('a bulk action is disabled with nothing selected, enabled with a selection, and carries it', async () => {
        const { el, root, actions } = await mount(crud({ toolbar: [{ id: 'del', actionId: 'delete', label: 'Delete', rowsSelectedRequired: true }] }), rows)
        const button = () => root.querySelector('[data-action-id="del"]') as HTMLButtonElement
        expect(button().disabled).toBe(true)
        el.state = { ...el.state, crud_selected_items: [rows[1]] }
        await el.updateComplete
        expect(button().disabled).toBe(false)
        button().click()
        expect(actions().at(-1)).toMatchObject({ actionId: 'delete', parameters: { crud_selected_items: [rows[1]] } })
    })

    it('an older server: the selection gate is read off the enclosing component\'s advertised action', async () => {
        const host = document.createElement('mateu-component') as HTMLElement & { component?: unknown }
        host.component = { actions: [{ id: 'archive', rowsSelectedRequired: true }] }
        document.body.appendChild(host)
        const { root } = await mount(crud({ toolbar: [{ id: 'arch', actionId: 'archive', label: 'Archive' }] }), rows, {}, host)
        expect((root.querySelector('[data-action-id="arch"]') as HTMLButtonElement).disabled).toBe(true)
    })

    it('Import opens the upload dialog; Cancel and a click on the backdrop close it', async () => {
        const { el, root } = await mount(crud({ toolbar: [{ id: 'imp', actionId: 'import', label: 'Import' }] }), rows)
        ;(root.querySelector('[data-action-id="imp"]') as HTMLButtonElement).click()
        await el.updateComplete
        expect(root.querySelector('.crud-modal input[type="file"]')).not.toBeNull()
        ;(root.querySelector('.crud-modal .crud-btn') as HTMLButtonElement).click()
        await el.updateComplete
        expect(root.querySelector('.crud-modal')).toBeNull()
        el.showImportDialog = true
        await el.updateComplete
        ;(root.querySelector('.crud-modal-backdrop') as HTMLElement).click()
        await el.updateComplete
        expect(root.querySelector('.crud-modal')).toBeNull()
    })

    it('a finished upload asks the server to process the file', async () => {
        const { el, actions } = await mount(crud(), rows)
        el.showImportDialog = true
        el.handleImportUploadSuccess(new CustomEvent('x', { detail: { xhr: { responseText: 'file-7' } } }))
        expect(el.showImportDialog).toBe(false)
        expect(actions().at(-1)).toMatchObject({ actionId: 'process-import', parameters: { fileId: 'file-7' } })
    })

    it('inside a page that shows the toolbar, the crud does not repeat it', async () => {
        const page = document.createElement('mateu-page') as HTMLElement & { component?: unknown }
        page.component = { metadata: { toolbar: [{ id: 'x' }] } }
        document.body.appendChild(page)
        const { root } = await mount(crud({ title: '', toolbar: [{ id: 'new', actionId: 'new', label: 'New' }] }), rows, {}, page)
        expect(root.querySelector('[data-action-id="new"]')).toBeNull()
    })

    it('standalone it renders the shared content header and a search-only filter bar', async () => {
        const { root } = await mount(crud(), rows, { standalone: true })
        expect(root.querySelector('mateu-content-header')).not.toBeNull()
        expect(root.querySelector('mateu-filter-bar')).not.toBeNull()
        expect(root.querySelector('h2')).toBeNull()
    })
})

describe('row actions in the shared layouts', () => {
    const actionCols = [
        col('id', { identifier: true }), col('customer'),
        col('state', { dataType: 'status', priority: 1 }),
        col('paid', { dataType: 'bool', priority: 1 }),
        col('owner', { priority: 2 }),
        col('refund', { dataType: 'action', label: 'Refund' }),
        col('more', { dataType: 'actionGroup' }),
    ]
    const actionRows = [{
        id: 'A1', customer: 'Ana', state: { type: 'SUCCESS', message: 'Paid' }, paid: true, owner: { label: 'Marta' },
        more: { actions: [{ methodNameInCrud: 'resend', label: 'Resend' }] },
    }]

    it('list: status, booleans and objects read as text; action buttons run on the row without opening it', async () => {
        const { root, actions } = await mount(crud({ gridLayout: 'list', columns: actionCols }), actionRows)
        const text = root.querySelector('.m-item')!.textContent!
        expect(text).toContain('Paid')
        expect(text).toContain('✓')
        expect(text).toContain('Marta')
        const buttons = Array.from(root.querySelectorAll('.m-item button')) as HTMLButtonElement[]
        expect(buttons.map(b => b.textContent!.trim())).toEqual(['Refund', 'Resend'])
        buttons[0].click()
        buttons[1].click()
        expect(actions().map(a => a.actionId)).toEqual(['action-on-row-refund', 'action-on-row-resend'])
        expect(actions()[0].parameters._clickedRow).toBe(actionRows[0])
    })

    it('list: clicking a row marks it selected', async () => {
        const { el, root } = await mount(crud({ gridLayout: 'list' }), rows)
        ;(root.querySelectorAll('.m-item')[1] as HTMLElement).click()
        await el.updateComplete
        expect(el.state._selectedId).toBe('B2')
        expect(root.querySelectorAll('.m-item')[1].hasAttribute('selected')).toBe(true)
    })

    it('list and cards: a rowRoute opens the record by its route instead of running view', async () => {
        for (const gridLayout of ['list', 'cards']) {
            const { root, events } = await mount(crud({ gridLayout, rowRoute: 'orders/${row.id}' }), rows)
            const item = root.querySelector(gridLayout === 'list' ? '.m-item' : '.crud-card') as HTMLElement
            item.click()
            expect(events.find(e => e.type === 'navigate-to-requested')?.detail.route).toBe('orders/A1')
            expect(events.some(e => e.type === 'action-requested')).toBe(false)
            document.body.innerHTML = ''
        }
    })

    it('cards: the card shows image, title and data, opens the row and runs its action buttons', async () => {
        const cols = [col('photo', { stereotype: 'image' }), ...actionCols]
        const { root, actions } = await mount(crud({ gridLayout: 'cards', columns: cols }), [{ ...actionRows[0], photo: '/p.png' }])
        const card = root.querySelector('.crud-card') as HTMLElement
        expect(card.querySelector('img')?.getAttribute('src')).toBe('/p.png')
        expect(card.querySelector('.crud-card-title')?.textContent).toBe('A1')
        const buttons = Array.from(card.querySelectorAll('button')) as HTMLButtonElement[]
        buttons[1].click()
        expect(actions().at(-1).actionId).toBe('action-on-row-resend')
        ;(card.querySelector('.crud-card-title') as HTMLElement).click()
        expect(actions().at(-1)).toMatchObject({ actionId: 'view', parameters: { id: 'A1' } })
    })

    it('cards on a selector: clicking a card selects the row', async () => {
        const cols = [col('id', { identifier: true }), col('customer'), col('select', { dataType: 'action' })]
        const { root, actions } = await mount(crud({ gridLayout: 'cards', columns: cols }), rows)
        ;(root.querySelector('.crud-card') as HTMLElement).click()
        expect(actions().at(-1)).toMatchObject({ actionId: 'action-on-row-select', parameters: { _clickedRow: rows[0] } })
    })

    it('cards with a content height scroll inside a box of that height', async () => {
        const { root } = await mount(crud({ gridLayout: 'cards', contentHeight: '20rem' }), rows)
        expect((root.querySelector('.m-scroll') as HTMLElement).style.height).toBe('20rem')
    })

    it('master/detail: picking a row in the rail shows its fields in the detail pane', async () => {
        const { el, root } = await mount(crud({ gridLayout: 'masterDetail' }), rows)
        expect(root.textContent).toContain('Select a row')
        ;(root.querySelectorAll('.m-item')[1] as HTMLElement).click()
        await el.updateComplete
        const detail = root.querySelector('.m-formlayout')!
        expect(detail.textContent).toContain('Bob')
        expect(detail.textContent).toContain('CUSTOMER')
    })

    it('master/detail: an empty listing shows the empty state in the rail', async () => {
        const { root } = await mount(crud({ gridLayout: 'masterDetail' }), [])
        expect(root.querySelector('.mateu-empty-state')).not.toBeNull()
    })

    it('tree: a navigable tree gets a View button per row, a selector a Select button', async () => {
        const cols = [col('name', { actionId: 'view', identifier: true }), col('select', { dataType: 'action' })]
        const tree = [{ name: 'Root', children: [{ name: 'Leaf', children: [] }] }]
        const { el, root, actions } = await mount(crud({ gridLayout: 'tree', columns: cols }), tree)
        const trs = Array.from(root.querySelectorAll('tbody tr')) as HTMLElement[]
        expect(trs).toHaveLength(2)
        const [select, view] = Array.from(trs[1].querySelectorAll('button')) as HTMLButtonElement[]
        select.click()
        expect(actions().at(-1)).toMatchObject({ actionId: 'action-on-row-select', parameters: { _clickedRow: { name: 'Leaf' } } })
        view.click()
        expect(actions().at(-1)).toMatchObject({ actionId: 'view', parameters: { name: 'Leaf' } })
        trs[0].click()
        await el.updateComplete
        expect(el.state._selectedId).toBe('Root')
        expect(root.querySelector('tbody tr')!.classList.contains('selected')).toBe(true)
    })

    it('tree: an empty tree shows the empty state', async () => {
        const { root } = await mount(crud({ gridLayout: 'tree' }), [])
        expect(root.querySelector('.mateu-empty-state')).not.toBeNull()
    })

    it('a renderer with its own tree grid renders the tree', async () => {
        const renderer = new TestRenderer() as unknown as ComponentRenderer & Record<string, unknown>
        let received: any
        renderer.renderTreeComponent = ((_c: unknown, opts: unknown) => { received = opts; return 'OWN-TREE' }) as never
        componentRenderer.set(renderer)
        try {
            const { root } = await mount(crud({ gridLayout: 'tree' }), rows)
            expect(root.textContent).toContain('OWN-TREE')
            expect(received).toMatchObject({ idField: 'id', navigable: false, rows })
        } finally {
            componentRenderer.set(new TestRenderer() as unknown as ComponentRenderer)
        }
    })
})

describe('listings fed by an external endpoint', () => {
    const external = (over: Record<string, unknown> = {}) => crud({
        gridLayout: 'list', pageSize: 2,
        filters: [{ fieldId: 'customer', dataType: 'string' }],
        rowsSource: { url: 'https://api.test/orders' }, ...over,
    })
    const remote = [
        { id: 'A1', customer: 'Ana' }, { id: 'B2', customer: 'Bob' }, { id: 'C3', customer: 'Carla' },
    ]

    it('fetches on mount, pages the whole collection here and identifies rows by their id', async () => {
        registerExternalJsonMock(() => remote)
        const { el, root, actions } = await mount(external(), undefined)
        await settle()
        await el.updateComplete
        expect(actions().filter(a => a.actionId === 'search')).toHaveLength(0)
        const page = el.data.crud.page
        expect(page.totalElements).toBe(3)
        expect(page.content.map((r: any) => r._rowNumber)).toEqual(['A1', 'B2'])
        expect(root.querySelectorAll('.m-item')).toHaveLength(2)
    })

    it('search() filters the fetched rows here, since the endpoint cannot', async () => {
        registerExternalJsonMock(() => remote)
        const { el } = await mount(external(), undefined)
        await settle()
        el.state = { ...el.state, customer: 'carla' }
        el.search()
        await settle()
        expect(el.data.crud.page.content.map((r: any) => r.id)).toEqual(['C3'])
        expect(el.data.crud.page.totalElements).toBe(1)
    })

    it('a source that declares its total paged server-side: its page and total are taken as they come', async () => {
        registerExternalJsonMock(() => ({ items: remote, total: 42 }))
        setRestSourceCatalogue([{ name: 'orders', source: { url: 'https://api.test/orders', itemsPath: 'items' }, totalPath: 'total' } as never])
        const { el } = await mount(external({ rowsSource: { ref: 'orders' } }), undefined)
        await settle()
        expect(el.data.crud.page.totalElements).toBe(42)
        expect(el.data.crud.page.content).toHaveLength(3)
    })

    it('a proxied source asks the server through __restfetch__ and shapes its answer', async () => {
        const { el, actions } = await mount(external({ rowsSource: { url: 'https://api.test/orders', proxy: true } }), undefined)
        const ask = actions().find(a => a.actionId === '__restfetch__')
        expect(ask.parameters).toEqual({ _sourceKind: 'rows', _sourceId: 'crud' })
        ask.callback({ appData: { _restfetch: [{ id: 'Z9', customer: 'Zoe' }] } })
        await settle()
        expect(el.data.crud.page.content[0]).toMatchObject({ id: 'Z9', customer: 'Zoe', _rowNumber: 'Z9' })
    })

    it('rows fetched here survive the parent pushing down empty data', async () => {
        registerExternalJsonMock(() => remote)
        const { el } = await mount(external(), undefined)
        await settle()
        el.data = {}
        await el.updateComplete
        expect(el.data.crud.page.content).toHaveLength(2)
    })
})

describe('column personalisation', () => {
    it('offers the chooser when some column can be hidden, and applies the stored prefs', async () => {
        writeColumnPrefs('/orders', { hidden: ['customer'], order: [] })
        const { el, root } = await mount(crud({ gridLayout: 'cards' }), rows)
        expect(root.querySelector('mateu-column-chooser')).not.toBeNull()
        expect(root.querySelector('.crud-card')!.textContent).toContain('PAID')
        expect(root.querySelector('.crud-card')!.textContent).not.toContain('CUSTOMER')
        writeColumnPrefs('/orders', { hidden: [], order: [] })
        root.querySelector('mateu-column-chooser')!.dispatchEvent(new CustomEvent('column-prefs-changed', { bubbles: true, composed: true }))
        await el.updateComplete
        expect(root.querySelector('.crud-card')!.textContent).toContain('CUSTOMER')
    })

    it('no chooser when every column is protected', async () => {
        const { root } = await mount(crud({ columns: [col('id', { identifier: true })] }), rows)
        expect(root.querySelector('mateu-column-chooser')).toBeNull()
    })
})

describe('filling the window', () => {
    it('a routed listing box is given the height left in the window', async () => {
        const { el, root } = await mount(crud(), rows)
        el.requestUpdate()
        await el.updateComplete
        await el.updateComplete
        const box = root.querySelector('[data-crud-box]') as HTMLElement
        expect(box.style.height).toBe(`${window.innerHeight - 16}px`)
    })

    it('inside a drawer the listing is bounded by the overlay, not the window', async () => {
        const drawer = document.createElement('mateu-drawer')
        document.body.appendChild(drawer)
        const host = document.createElement('div')
        drawer.appendChild(host)
        const { el, root } = await mount(crud(), rows, {}, host)
        el.requestUpdate()
        await el.updateComplete
        expect((root.querySelector('[data-crud-box]') as HTMLElement).style.height).toBe('')
    })
})
