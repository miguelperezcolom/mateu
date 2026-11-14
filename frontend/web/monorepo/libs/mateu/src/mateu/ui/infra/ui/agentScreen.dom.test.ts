// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * An agent operating the tab (live UI push `set-fields` / `run-action`) does what the USER does:
 * an edit is the field's own `value-changed`, a press is a click on the action's own control, a
 * row action goes from the listing with the row — and nothing the screen does not offer.
 */

vi.mock('@infra/http/AxiosMateuApiClient.ts', () => ({ mateuCallsInFlight: () => 0, mateuApiClient: { runAction: vi.fn() } }))
const headerActions: string[] = []
vi.mock('@infra/ui/renderers/appHeaderActions.ts', () => ({
    dispatchAppHeaderAction: (_app: unknown, _owner: unknown, id: string) => { headerActions.push(id); return Promise.resolve() },
}))

import { describeScreen, runAction, setFields } from './agentScreen'

const field = (fieldId: string, over: Record<string, unknown> = {}) =>
    ({ type: 'ClientSide', metadata: { type: 'FormField', fieldId, label: fieldId, dataType: 'string', ...over } })

/** A mateu-component holding a form, with one drawn field element and a Save button. */
const mount = () => {
    const component = document.createElement('mateu-component') as unknown as HTMLElement & Record<string, unknown>
    component.component = {
        type: 'ServerSide', id: 'form', actions: [{ id: 'save' }, { id: 'recalculate' }],
        children: [field('name'), field('code', { readOnly: true }), field('notes'),
            { type: 'ClientSide', metadata: { type: 'Button', actionId: 'save', label: 'Save' } },
            { type: 'ClientSide', id: 'lines', metadata: { type: 'Crud', columns: [{ metadata: { id: 'sku', label: 'SKU', actionId: 'view' } }] } }],
    }
    component.state = { name: 'Ada', code: 'X1' }
    component.data = {}
    const edits: unknown[] = []
    const actions: unknown[] = []
    component.addEventListener('value-changed', (e) => edits.push((e as CustomEvent).detail))
    component.addEventListener('action-requested', (e) => actions.push((e as CustomEvent).detail))
    const nameField = document.createElement('x-field') as HTMLElement & Record<string, unknown>
    nameField.field = { fieldId: 'name' }
    component.appendChild(nameField)
    const save = document.createElement('button')
    save.setAttribute('data-action-id', 'save')
    const clicks: string[] = []
    save.addEventListener('click', () => clicks.push('save'))
    component.appendChild(save)
    const crud = document.createElement('mateu-table-crud') as unknown as HTMLElement & Record<string, unknown>
    crud.id = 'lines'
    crud.component = (component.component as any).children[4]
    crud.state = {}
    crud.data = { lines: { page: { content: [{ sku: 'A' }, { sku: 'B' }], totalElements: 2, pageNumber: 0, pageSize: 20 } } }
    component.appendChild(crud)
    document.body.appendChild(component)
    return { component, edits, actions, clicks, crud }
}

beforeEach(() => { headerActions.length = 0 })
afterEach(() => { document.body.innerHTML = '' })

describe('an agent operating the tab', () => {
    it('reads what the elements hold', () => {
        mount()
        const answer = describeScreen(undefined) as { screen: Record<string, any> }
        expect(answer.screen.fields.map((f: any) => [f.id, f.value])).toEqual([['name', 'Ada'], ['code', 'X1'], ['notes', null]])
        expect(answer.screen.listings[0].rows).toEqual([{ sku: 'A' }, { sku: 'B' }])
    })

    it('types into a field as the user does, and refuses the whole call for a field it may not edit', async () => {
        const { edits } = mount()
        expect(await setFields(undefined, { name: 'Grace', code: 'Y' })).toEqual({ error: { code: 'unknownField', id: 'code' } })
        expect(await setFields(undefined, { secret: 1 })).toEqual({ error: { code: 'unknownField', id: 'secret' } })
        expect(edits).toEqual([]) // nothing changed
        const answer = await setFields(undefined, { name: 'Grace', notes: 'hi' })
        expect('screen' in answer).toBe(true)
        // drawn: from the field element; not drawn: from the component that declares it
        expect(edits).toEqual([{ fieldId: 'name', value: 'Grace' }, { fieldId: 'notes', value: 'hi' }])
    })

    it('presses the action’s own control, and only what the screen offers', async () => {
        const { clicks, actions, crud } = mount()
        expect(await runAction(undefined, document.body, 'drop', undefined, undefined, undefined)).toEqual({ error: { code: 'unknownAction', id: 'drop' } })
        await runAction(undefined, document.body, 'save', undefined, undefined, undefined)
        expect(clicks).toEqual(['save'])
        // a declared action with no control: the action-requested its control would send
        await runAction(undefined, document.body, 'recalculate', { x: 1 }, undefined, undefined)
        expect(actions.at(-1)).toMatchObject({ actionId: 'recalculate', parameters: { x: 1 } })
        // a row: opened as a click on it does (the listing's `view`, with the row)
        const seen: unknown[] = []
        crud.addEventListener('action-requested', (e) => seen.push((e as CustomEvent).detail))
        expect(await runAction(undefined, document.body, 'open-row', undefined, 5, 'lines')).toEqual({ error: { code: 'unknownRow', id: '5' } })
        await runAction(undefined, document.body, 'open-row', undefined, 1, 'lines')
        expect(seen.at(-1)).toEqual({ actionId: 'view', parameters: { sku: 'B' } })
    })

    it('an action with no control goes from the INNERMOST component claiming it (the form, not its crud mediator)', async () => {
        // live test of PR #1209: a crud's `create` is advertised by the mediator AND the form; sent
        // from the mediator it carried no typed values and the save answered "Cannot be empty"
        const outer = document.createElement('mateu-component') as unknown as HTMLElement & Record<string, unknown>
        outer.component = { type: 'ServerSide', id: 'crud', actions: [{ id: 'create' }], children: [] }
        outer.state = {}
        const outerSeen: unknown[] = []
        outer.addEventListener('action-requested', (e) => { if (e.target === outer) outerSeen.push((e as CustomEvent).detail) })
        document.body.appendChild(outer)
        const inner = document.createElement('mateu-component') as unknown as HTMLElement & Record<string, unknown>
        inner.component = { type: 'ServerSide', id: 'form', actions: [{ id: 'create' }], children: [field('name')] }
        inner.state = { name: 'Ada' }
        const innerSeen: unknown[] = []
        inner.addEventListener('action-requested', (e) => innerSeen.push((e as CustomEvent).detail))
        outer.appendChild(inner)
        await runAction(undefined, document.body, 'create', undefined, undefined, undefined)
        expect(innerSeen).toEqual([{ actionId: 'create', parameters: {} }])
        expect(outerSeen).toEqual([])
    })

    it('a disabled action is refused as such', async () => {
        const { component } = mount()
        ;(component.component as any).children[3].metadata.disabled = true
        expect(await runAction(undefined, document.body, 'save', undefined, undefined, undefined)).toEqual({ error: { code: 'disabledAction', id: 'save' } })
    })

    it('the app header’s actions run as the header does', async () => {
        mount()
        const app = { contextActions: [{ actionId: 'help', label: 'Help' }] }
        await runAction(app, document.body, 'help', undefined, undefined, undefined)
        expect(headerActions).toEqual(['help'])
    })

    it('the errors and the rule-set attributes the component holds reach the summary', () => {
        const { component } = mount()
        component.data = { errors: { name: ['', 'Too short'], notes: 'Required', _component: ['x'], code: [] }, 'notes.disabled': 'true' }
        component.state = { ...(component.state as object), 'code.hidden': true }
        const screen = (describeScreen(undefined) as { screen: Record<string, any> }).screen
        expect(screen.errors).toEqual({ name: 'Too short', notes: 'Required' })
        expect(screen.fields.map((f: any) => f.id)).toEqual(['name', 'notes'])
        expect(screen.fields[1].readOnly).toBe(true)
    })

    it('a listing: its search text written to its own state, then searched and paged as its controls do', async () => {
        const { crud } = mount()
        ;(crud.component as any).metadata.searchable = true
        const searched: unknown[] = []
        const paged: number[] = []
        crud.handleSearchRequested = () => searched.push(true)
        crud.pageChanged = (e: CustomEvent) => paged.push(e.detail.page)
        await setFields(undefined, { searchText: 'ab' })
        expect(crud.state).toEqual({ searchText: 'ab' })
        await runAction(undefined, document.body, 'search', undefined, undefined, 'lines')
        expect(searched).toEqual([true])
        await runAction(undefined, document.body, 'nextPage', undefined, undefined, undefined)
        expect(paged).toEqual([1])
        crud.state = { page: 2 }
        await runAction(undefined, document.body, 'prevPage', undefined, undefined, undefined)
        expect(paged).toEqual([1, 1])
        crud.state = { page: 0 }
        expect(await runAction(undefined, document.body, 'prevPage', undefined, undefined, undefined)).toEqual({ error: { code: 'disabledAction', id: 'prevPage' } })
        expect(await runAction(undefined, document.body, 'search', undefined, undefined, 'nope')).toEqual({ error: { code: 'unknownAction', id: 'search' } })
    })

    it('a row action goes from the listing with the row; open-row needs a row; a route row navigates', async () => {
        const { crud } = mount()
        const meta = (crud.component as any).metadata
        meta.columns.push({ metadata: { id: 'print', label: 'Print', actionId: 'print' } })
        const seen: any[] = []
        crud.addEventListener('action-requested', (e) => seen.push((e as CustomEvent).detail))
        await runAction(undefined, document.body, 'print', { copies: 2 }, 0, undefined)
        expect(seen.at(-1)).toEqual({ actionId: 'print', parameters: { copies: 2, _clickedRow: { sku: 'A' } } })
        expect(await runAction(undefined, document.body, 'open-row', undefined, undefined, undefined)).toEqual({ error: { code: 'unknownRow', id: '' } })
        meta.rowRoute = 'lines/${row.sku}'
        const routes: any[] = []
        crud.addEventListener('route-changed', (e) => routes.push((e as CustomEvent).detail))
        await runAction(undefined, document.body, 'open-row', undefined, 1, 'lines')
        expect(routes.length).toBe(1)
        expect(JSON.stringify(routes[0])).toContain('lines/B')
    })

    it('an open dialog is in front: its fields and actions are the ones offered; a closed one is not', async () => {
        const { component } = mount()
        const closed = document.createElement('mateu-drawer') as unknown as HTMLElement & Record<string, unknown>
        closed.opened = false
        document.body.appendChild(closed)
        expect((describeScreen(undefined) as any).screen.focus).toBe('page')
        const dialog = document.createElement('mateu-dialog') as unknown as HTMLElement & Record<string, unknown>
        dialog.component = { metadata: { type: 'Dialog', title: 'Sure?', content: { type: 'ServerSide', children: [field('reason')] } } }
        dialog.state = { reason: 'because' }
        document.body.appendChild(dialog)
        const screen = (describeScreen(undefined) as any).screen
        expect(screen.focus).toBe('overlay')
        expect(screen.overlay.fields).toEqual([{ id: 'reason', label: 'reason', type: 'string', value: 'because' }])
        // the page's field is behind it, and its Save too
        expect(await setFields(undefined, { name: 'x' })).toEqual({ error: { code: 'unknownField', id: 'name' } })
        expect(await runAction(undefined, document.body, 'save', undefined, undefined, undefined)).toEqual({ error: { code: 'unknownAction', id: 'save' } })
        // a component rendered inside the dialog is described by its own view
        const inner = document.createElement('mateu-component') as unknown as HTMLElement & Record<string, unknown>
        inner.component = { type: 'ServerSide', id: 'in', actions: [{ id: 'confirm' }], children: [field('why')] }
        inner.state = { why: 'w' }
        const got: unknown[] = []
        inner.addEventListener('action-requested', (e) => got.push((e as CustomEvent).detail))
        dialog.appendChild(inner)
        expect((describeScreen(undefined) as any).screen.overlay.fields.map((f: any) => f.id)).toEqual(['why'])
        await runAction(undefined, document.body, 'confirm', undefined, undefined, undefined)
        expect(got).toEqual([{ actionId: 'confirm', parameters: {} }])
        expect(component).toBeTruthy()
    })
})

describe('waiting for the screen to settle', () => {
    it('waits while calls are in flight, and gives up at its limit', async () => {
        const { settled } = await import('./agentScreen')
        let calls = 3
        const started = Date.now()
        await settled(2_000, () => (calls-- > 0 ? 1 : 0))
        expect(calls).toBeLessThan(0)
        await settled(150, () => 1)
        expect(Date.now() - started).toBeLessThan(3_000)
    })
})
