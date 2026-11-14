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
