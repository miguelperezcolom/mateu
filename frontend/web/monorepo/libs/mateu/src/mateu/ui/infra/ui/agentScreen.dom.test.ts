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
})
