import { describe, expect, it } from 'vitest'
import { buildScreenSummary, editableIds, MAX_OPTIONS, MAX_ROWS, MAX_TEXT, offeredAction, offers } from './agentScreenSummary'

/**
 * The summary an agent reads of a live tab (`describe-screen`): only what the wire gave the tab,
 * the desktop's shape (ScreenSummary.kt), capped with the cuts named.
 */

const field = (fieldId: string, over: Record<string, unknown> = {}) =>
    ({ type: 'ClientSide', metadata: { type: 'FormField', fieldId, label: fieldId.toUpperCase(), dataType: 'string', ...over } })
const button = (actionId: string, label: string, over: Record<string, unknown> = {}) =>
    ({ type: 'ClientSide', metadata: { type: 'Button', actionId, label, ...over } })

const form = (children: unknown[], actions: { id: string }[] = []) => ({
    type: 'ServerSide', id: 'c1', serverSideType: 'com.example.Form', actions,
    initialData: { name: 'from the server' },
    children: [{ type: 'ClientSide', metadata: { type: 'Page', title: 'Order ${state.id}', subtitle: 'Edit' }, children }],
})

describe('the screen summary', () => {
    it('describes the fields with the values the tab shows, and the actions the user can press', () => {
        const summary = buildScreenSummary({
            route: '/orders/42',
            windowTitle: 'Order 42',
            views: [{
                content: form([
                    field('name', { required: true }),
                    field('status', { options: [{ value: 'OPEN', label: 'Open' }, { value: 'DONE', label: 'Done' }] }),
                    field('notes', { readOnly: true }),
                    field('password', { stereotype: 'password' }),
                    field('hidden'),
                    button('save', 'Save'),
                    button('delete', 'Delete', { disabled: true }),
                ], [{ id: 'save' }, { id: 'recalculate' }, { id: 'search' }]),
                state: { id: 42, name: 'Ada', status: 'OPEN', password: 's3cr3t' },
                fieldErrors: { name: 'Too short' },
                fieldAttributes: { hidden: { hidden: true } },
            }],
        })
        expect(summary.route).toBe('/orders/42')
        expect(summary.focus).toBe('page')
        expect(summary.header).toEqual({ title: 'Order 42', subtitle: 'Edit' })
        expect(summary.fields).toEqual([
            { id: 'name', label: 'NAME', type: 'string', required: true, value: 'Ada', error: 'Too short' },
            { id: 'status', label: 'STATUS', type: 'string', value: 'OPEN', options: [{ value: 'OPEN', label: 'Open' }, { value: 'DONE', label: 'Done' }] },
            { id: 'notes', label: 'NOTES', type: 'string', readOnly: true, value: null },
            { id: 'password', label: 'PASSWORD', type: 'string', stereotype: 'password', value: '••••••' },
        ])
        expect(summary.errors).toEqual({ name: 'Too short' })
        expect(summary.actions).toEqual([
            { id: 'save', label: 'Save', enabled: true },
            { id: 'delete', label: 'Delete', enabled: false },
        ])
        // a declared action with no button of its own; the listing's search is not an option
        expect(summary.otherActionIds).toEqual(['recalculate'])
        expect(offers(summary, 'recalculate')).toBe(true)
        expect(offers(summary, 'drop-database')).toBe(false)
        expect(offeredAction(summary, 'delete')?.enabled).toBe(false)
        expect([...editableIds(summary)].sort()).toEqual(['name', 'password', 'status'])
    })

    it('caps long text, data values, options and rows, and names what it cut', () => {
        const options = Array.from({ length: MAX_OPTIONS + 5 }, (_, i) => ({ value: 'v' + i, label: 'L' + i }))
        const rows = Array.from({ length: MAX_ROWS + 3 }, (_, i) => ({ id: i, name: 'Row ' + i }))
        const summary = buildScreenSummary({
            route: '/x',
            views: [{
                content: {
                    type: 'ServerSide', id: 'c', children: [
                        field('long'), field('photo'), field('pick', { options }),
                        { type: 'ClientSide', id: 'crud', metadata: { type: 'Crud', searchable: true, columns: [{ metadata: { id: 'name', label: 'Name', actionId: 'view' } }], toolbar: [{ metadata: { type: 'Button', actionId: 'new', label: 'New' } }] } },
                    ],
                },
                state: { long: 'x'.repeat(MAX_TEXT + 10), photo: 'data:image/png;base64,AAAA' },
                listings: { crud: { state: { searchText: 'ro', page: 1 }, page: { content: rows, totalElements: 103, pageNumber: 1, pageSize: 53 } } },
            }],
        })
        const fields = summary.fields as Record<string, unknown>[]
        expect((fields[0].value as string).length).toBe(MAX_TEXT + 1)
        expect(fields[1].value).toBe('[data:image/png data, 26 characters]')
        expect((fields[2].options as unknown[]).length).toBe(MAX_OPTIONS)
        const listing = (summary.listings as Record<string, any>[])[0]
        expect(listing).toMatchObject({
            id: 'crud', columns: [{ id: 'name', label: 'Name' }], actions: [{ id: 'new', label: 'New', enabled: true }],
            searchText: 'ro', page: 1, pageSize: 53, totalElements: 103,
            rowActions: [{ id: 'open-row', label: 'Open' }], builtInActions: ['search', 'nextPage', 'prevPage'],
        })
        expect(listing.rows).toHaveLength(MAX_ROWS)
        expect(listing.rows[0]).toEqual({ name: 'Row 0' })
        expect(summary.truncated).toEqual(['fields.long', 'fields.photo', 'fields.pick.options', 'listings.crud.rows'])
        expect(offers(summary, 'open-row')).toBe(true)
        expect(offers(summary, 'nextPage')).toBe(true)
        expect(editableIds(summary).has('searchText')).toBe(true)
    })

    it('an open dialog or drawer is in front: its part is the focus, the page stays below', () => {
        const summary = buildScreenSummary({
            route: '/p',
            views: [{ content: form([field('name'), button('save', 'Save')]), state: { name: 'page' } }],
            overlay: {
                component: { metadata: { type: 'Drawer', headerTitle: 'Edit ${state.who}' } },
                views: [{ content: { type: 'ServerSide', children: [field('email'), button('ok', 'OK')] }, state: { email: 'a@b', who: 'Ana' } }],
            },
            messages: Array.from({ length: 12 }, (_, i) => ({ variant: 'info', text: 'm' + i })),
        })
        expect(summary.focus).toBe('overlay')
        const overlay = summary.overlay as Record<string, any>
        expect(overlay.kind).toBe('drawer')
        expect(overlay.title).toBe('Edit Ana')
        expect(overlay.fields).toEqual([{ id: 'email', label: 'EMAIL', type: 'string', value: 'a@b' }])
        expect((summary.page as Record<string, any>).fields[0].value).toBe('page')
        expect(offers(summary, 'ok')).toBe(true)
        expect(offers(summary, 'save')).toBe(false) // behind the drawer
        expect([...editableIds(summary)]).toEqual(['email'])
        const messages = summary.messages as { text: string }[]
        expect(messages.map(m => m.text)).toEqual(['m2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11'])
    })

    it('a nested component is its own view: its fields carry ITS state, not the parent tree', () => {
        const island = { type: 'ServerSide', id: 'island', initialData: { inner: 'stale' }, children: [field('inner')] }
        const summary = buildScreenSummary({
            route: '/',
            views: [
                { content: { type: 'ServerSide', id: 'outer', children: [field('outer'), island] }, state: { outer: 'o' }, ownViewsForNested: true },
                { content: island, state: { inner: 'live' }, ownViewsForNested: true },
            ],
        })
        expect((summary.fields as Record<string, unknown>[]).map(f => [f.id, f.value])).toEqual([['outer', 'o'], ['inner', 'live']])
    })

    it('the app shell: context selectors, header actions and the user — never a token', () => {
        const summary = buildScreenSummary({
            route: '/',
            views: [],
            app: {
                title: 'Ops',
                user: { name: 'Ana', email: 'ana@x', accessToken: 'eyJ…' },
                contextSelectors: [{ fieldName: 'hotel', label: 'Hotel', options: [{ value: 'h1', label: 'Hotel One' }] }],
                contextActions: [{ actionId: 'help', label: 'Help', children: [{ actionId: 'docs', label: 'Docs' }] }],
            },
            appState: { hotel: 'h1' },
        })
        expect(summary.ui).toEqual({ appTitle: 'Ops' })
        expect(summary.user).toEqual({ name: 'Ana', email: 'ana@x' })
        expect(summary.appContext).toEqual([{ field: 'hotel', label: 'Hotel', value: 'h1', valueLabel: 'Hotel One', options: [{ value: 'h1', label: 'Hotel One' }] }])
        expect(summary.appActions).toEqual([{ id: 'help', label: 'Help', children: [{ id: 'docs', label: 'Docs' }] }])
        expect(offers(summary, 'docs')).toBe(true)
    })
})

describe('the screen summary, the rest of what a screen can show', () => {
    it('the header extras, the breadcrumbs, button groups and links', () => {
        const summary = buildScreenSummary({
            route: '/r',
            views: [{
                content: {
                    type: 'ServerSide', id: 'c', children: [{
                        type: 'ClientSide', metadata: {
                            type: 'Form', title: 'T', overline: 'Over ${state.n}', timestamp: 'Last updated today',
                            badges: [{ text: 'Open' }, { label: 'VIP' }],
                            kpis: [{ title: 'Total', text: '${state.n} €' }],
                            breadcrumbs: [{ text: 'Home', link: '/' }, { text: 'Here' }],
                            actions: [{ id: 'other' }, { id: 'bulk*' }],
                        },
                        children: [
                            button('', 'More', { children: [button('a', 'A'), { metadata: { actionId: 'b', label: 'B' } }] }),
                            button('', 'Go', { route: '/elsewhere' }),
                            button('approve', 'Approve', { rowsSelectedRequired: true }),
                            button('', 'Nothing'),
                            button('approve', 'Approve'),
                            field('country', { optionsSource: { ref: 'countries' }, stereotype: 'regular', description: 'Pick one' }),
                            field('blob', {}),
                            field('pw', { dataType: 'password' }),
                        ],
                    }],
                },
                state: { n: 3, blob: { a: { b: { c: { d: { e: 1 } } } }, f: () => 1, list: Array.from({ length: 60 }, (_, i) => i) }, pw: '' },
            }],
            messages: [{ variant: 'error', title: 'Oops', text: 'Broken' }],
        })
        expect(summary.header).toEqual({
            title: 'T', overline: 'Over 3', timestamp: 'Last updated today',
            badges: ['Open', 'VIP'], kpis: [{ title: 'Total', value: '3 €' }],
        })
        expect(summary.breadcrumbs).toEqual([{ label: 'Home', route: '/' }, { label: 'Here' }])
        expect(summary.actions).toEqual([
            { id: 'More', label: 'More', enabled: true, children: [{ id: 'a', label: 'A', enabled: true }, { id: 'b', label: 'B', enabled: true }] },
            { id: '/elsewhere', label: 'Go', enabled: true, navigatesTo: '/elsewhere' },
            { id: 'approve', label: 'Approve', enabled: true, needsSelectedRows: true },
        ])
        expect(summary.otherActionIds).toEqual(['other'])
        const fields = summary.fields as Record<string, any>[]
        expect(fields[0]).toEqual({ id: 'country', label: 'COUNTRY', type: 'string', help: 'Pick one', value: null, optionsFrom: 'a source the renderer fetches' })
        expect(fields[1].value.f).toBeNull()
        expect(fields[1].value.a.b.c).toEqual({ d: '{…}' })
        expect(fields[1].value.list).toHaveLength(50)
        expect(fields[2].value).toBe('')
        expect(summary.messages).toEqual([{ variant: 'error', title: 'Oops', text: 'Broken' }])
        expect(summary.truncated).toEqual(['fields.blob'])
        expect(offeredAction(summary, 'b')?.label).toBe('B')
        expect(offeredAction(summary, 'nope')).toBeUndefined()
    })

    it('a listing: filters, sort, cells that are objects or labelled values, and what a row offers', () => {
        const summary = buildScreenSummary({
            route: '/l',
            views: [{
                content: {
                    type: 'ServerSide', id: 'c', children: [{
                        type: 'ClientSide', id: 'orders', metadata: {
                            type: 'Crud', title: 'Orders of ${state.who}', rowsSelectionEnabled: true, rowRoute: 'orders/${row.id}',
                            columns: [
                                { metadata: { id: 'status', label: 'Status' } },
                                { metadata: { id: 'kind', label: 'Kind', valueLabels: { A: 'Alpha' } } },
                                { id: 'link', label: 'Print', actionId: 'print' },
                                { metadata: { id: 'acts', label: 'Actions', dataType: 'actionGroup' } },
                                { metadata: { id: 'one', label: 'One', dataType: 'action' } },
                            ],
                            filters: [
                                { metadata: { fieldId: 'q', dataType: 'string' } },
                                { fieldId: 'date', label: 'Date', dataType: 'dateRange' },
                                { fieldId: 'kind', label: 'Kind', dataType: 'string', options: [{ value: 'A', label: 'Alpha' }] },
                            ],
                            toolbar: [button('new', 'New')],
                        },
                    }],
                },
                listings: {
                    orders: {
                        state: { who: 'Ana', q: 'x', date_from: '2026-01-01', date_to: '2026-02-01', sort: [{ field: 'status' }] },
                        page: {
                            content: [
                                { status: { message: 'Paid', type: 'success' }, kind: 'A', link: 'p', acts: { actions: [{ methodNameInCrud: 'refund', label: 'Refund' }, { methodNameInCrud: 'refund' }] }, one: { methodNameInCrud: 'cancel' } },
                                { status: { nothing: {} }, kind: 'B', one: 'not an action' },
                                null,
                            ],
                        },
                    },
                },
            }],
        })
        const l = (summary.listings as Record<string, any>[])[0]
        expect(l.title).toBe('Orders of Ana')
        expect(l.filters).toEqual([
            { id: 'q', label: 'q', type: 'string', value: 'x' },
            { id: 'date', label: 'Date', type: 'dateRange', from: '2026-01-01', to: '2026-02-01' },
            { id: 'kind', label: 'Kind', type: 'string', options: [{ value: 'A', label: 'Alpha' }] },
        ])
        expect(l.sort).toEqual([{ field: 'status' }])
        expect(l.page).toBe(0)
        expect(l.pageSize).toBe(3)
        expect(l.totalElements).toBeUndefined()
        expect(l.rows[0]).toMatchObject({ status: 'Paid', kind: 'Alpha', link: 'p' })
        expect(l.rows[1].status).toEqual({ nothing: {} })
        expect(l.rows[1].kind).toBe('B')
        expect(l.rows[2]).toEqual({})
        expect(l.rowActions).toEqual([
            { id: 'open-row', label: 'Open' },
            { id: 'print', label: 'Print' },
            { id: 'action-on-row-refund', label: 'Refund' },
            { id: 'action-on-row-cancel', label: 'cancel' },
        ])
        expect(l.rowsSelectable).toBe(true)
        expect(offeredAction(summary, 'action-on-row-refund')?.label).toBe('Refund')
        expect(offeredAction(summary, 'new')?.label).toBe('New')
        expect([...editableIds(summary)].sort()).toEqual(['date', 'kind', 'q'])
    })

    it('a listing fed by a REST source offers no search or paging; one without a page offers only search', () => {
        const crud = (id: string, over: Record<string, unknown>) => ({ type: 'ClientSide', id, metadata: { type: 'Crud', columns: [], ...over } })
        const summary = buildScreenSummary({
            route: '/l',
            views: [{
                content: { type: 'ServerSide', children: [crud('a', { rowsSource: { ref: 'people' } }), crud('b', {})] },
                listings: { a: { page: { content: [{ name: 'Luke', _hidden: 1 }], totalElements: 1 } } },
            }],
        })
        const [a, b] = summary.listings as Record<string, any>[]
        expect(a.rows).toEqual([{ name: 'Luke' }])
        expect(a.rowsFrom).toContain('REST source')
        expect(a.builtInActions).toBeUndefined()
        expect(b.builtInActions).toEqual(['search'])
        expect(b.rows).toEqual([])
    })

    it('caps how many fields and actions it lists, and a user given as plain text', () => {
        const many = Array.from({ length: 205 }, (_, i) => field('f' + i))
        const buttons = Array.from({ length: 205 }, (_, i) => button('b' + i, 'B' + i))
        const summary = buildScreenSummary({ route: '/', views: [{ content: { type: 'ServerSide', children: [...many, ...buttons] } }], app: { user: 'ana' } })
        expect((summary.fields as unknown[]).length).toBe(200)
        expect((summary.actions as unknown[]).length).toBe(200)
        expect(summary.truncated).toEqual(['actions', 'fields'])
        expect(summary.user).toBe('ana')
    })

    it('an overlay with its own header and footer, a subtitle, and an app with many context options', () => {
        const options = Array.from({ length: 55 }, (_, i) => ({ value: 'h' + i, label: 'H' + i }))
        const summary = buildScreenSummary({
            route: '/',
            views: [],
            overlay: {
                component: { metadata: { type: 'Dialog', title: 'Confirm', subtitle: 'For ${state.who}', header: button('help', 'Help'), footer: button('ok', 'OK') } },
                views: [{ content: null, state: { who: 'Ana' } }],
            },
            app: { contextSelectors: [{ fieldName: 'hotel', options }], user: 42 },
        })
        const overlay = summary.overlay as Record<string, any>
        expect(overlay).toMatchObject({ kind: 'dialog', title: 'Confirm', subtitle: 'For Ana' })
        expect(overlay.actions.map((a: any) => a.id)).toEqual(['help', 'ok'])
        expect(summary.user).toBeUndefined()
        const ctx = (summary.appContext as Record<string, any>[])[0]
        expect(ctx).toMatchObject({ field: 'hotel', label: 'hotel', value: '' })
        expect(ctx.options).toHaveLength(50)
        expect(summary.truncated).toEqual(['appContext.hotel.options'])
        // an overlay with no component at all
        expect((buildScreenSummary({ route: '/', views: [], overlay: { component: undefined, views: [] } }).overlay as any).kind).toBe('overlay')
    })
})
