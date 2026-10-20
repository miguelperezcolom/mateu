// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import './mateu-component'
import type { MateuComponent } from './mateu-component'
import { setNotifier, ToastMessage } from '@application/Notifier.ts'
import { pendingActions } from './pendingActions'
import { setActionCatalogue } from './actionCatalogue'
import { ComponentType } from '@mateu/shared/apiClients/dtos/ComponentType'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import { TriggerType } from '@mateu/shared/apiClients/dtos/componentmetadata/TriggerType'
import { isEventClaimed } from './chatEvents'
import { dirtyGuard } from './dirtyGuard'

/**
 * How mateu-component turns an `action-requested` into what the user relies on: a request to the
 * server (with this component's route, state and type), a bubble to the component that owns the
 * action, or a client-side refusal (validation, missing selection, confirmation). Driven on a real
 * element mounted in the document; the transport is the `server-side-action-requested` event.
 */

const toasts: ToastMessage[] = []
const sent: CustomEvent[] = []
const recordSent = (e: Event) => sent.push(e as CustomEvent)

const serverSide = (over: Record<string, unknown> = {}) => ({
    id: 'c1', type: ComponentType.ServerSide, serverSideType: 'x.Form', route: '/form', children: [],
    actions: [], triggers: [], ...over,
})

const mount = async (component: Record<string, unknown>, state: Record<string, unknown> = {}, parent: Node = document.body) => {
    const el = document.createElement('mateu-component') as MateuComponent & Record<string, any>
    // the element carries its component's id, as renderComponent stamps it
    el.id = (component.id as string) ?? 'cmp'
    el.route = '/form'
    el.consumedRoute = '_empty'
    el.component = component as any
    el.state = state
    el.data = {}
    parent.appendChild(el)
    await el.updateComplete
    return el
}

const request = (el: HTMLElement, actionId: string, detail: Record<string, unknown> = {}) =>
    (el as any).manageActionRequestedEvent(new CustomEvent('action-requested', {
        detail: { actionId, ...detail }, bubbles: true, composed: true,
    }))

beforeEach(() => {
    toasts.length = 0
    sent.length = 0
    setNotifier({ show: (m) => toasts.push(m) })
    document.addEventListener('server-side-action-requested', recordSent)
})

afterEach(() => {
    document.removeEventListener('server-side-action-requested', recordSent)
    document.body.innerHTML = ''
    pendingActions.reset()
    setActionCatalogue([])
    setNotifier({ show: () => {} })
    vi.useRealTimers()
    vi.restoreAllMocks()
})

describe('a claimed action', () => {
    it('is sent to the server with this component route, state and type', async () => {
        const el = await mount(serverSide({ actions: [{ id: 'save', sse: true, timeoutMillis: 5000 }] }), { name: 'Ana' })
        request(el, 'save', { parameters: { a: 1 } })
        expect(sent).toHaveLength(1)
        expect(sent[0].detail).toMatchObject({
            route: '/form', consumedRoute: '_empty', actionId: 'save', serverSideType: 'x.Form',
            serverSideComponentRoute: '/form', componentState: { name: 'Ana' }, parameters: { a: 1 },
            initiatorComponentId: 'c1', initiator: el, sse: true, timeoutMillis: 5000,
        })
    })

    it('a wildcard claims every id with its prefix, but the exact declaration wins', async () => {
        const el = await mount(serverSide({ actions: [{ id: 'row-*' }, { id: 'row-delete', sse: true }] }))
        request(el, 'row-edit')
        request(el, 'row-delete')
        expect(sent.map(e => [e.detail.actionId, e.detail.sse])).toEqual([['row-edit', undefined], ['row-delete', true]])
    })

    it('a listing selection travels in the state, and a selection-required action refuses without one', async () => {
        const el = await mount(serverSide({ actions: [{ id: 'bulk', rowsSelectedRequired: true }] }))
        request(el, 'bulk')
        expect(sent).toHaveLength(0)
        expect(toasts[0].variant).toBe('error')

        request(el, 'bulk', { parameters: { crud_selected_items: [{ id: 1 }] } })
        expect(sent).toHaveLength(1)
        expect(sent[0].detail.componentState.crud_selected_items).toEqual([{ id: 1 }])
    })

    it('a validation-required action is refused while the form is invalid, naming the field by its label', async () => {
        const el = await mount(serverSide({
            actions: [{ id: 'save', validationRequired: true }],
            validations: [{ fieldId: 'startDate', condition: "state['startDate']", message: 'Cannot be empty' }],
            // a crud's form fields travel inside METADATA records, not as children
            metadata: { form: { sections: [{ fields: [
                { type: ComponentMetadataType.FormField, fieldId: 'startDate', label: 'Arrival' }] }] } },
        }), { startDate: '' })
        request(el, 'save')
        expect(sent).toHaveLength(0)
        expect(el.data.errors.startDate).toEqual(['Cannot be empty'])
        expect(toasts[0].text).toContain('• Arrival: Cannot be empty')

        el.state = { startDate: '2026-01-01' }
        request(el, 'save')
        expect(sent).toHaveLength(1)
    })

    it('a field without a label anywhere is named by its humanized id', async () => {
        const el = await mount(serverSide({
            actions: [{ id: 'save', validationRequired: true }],
            validations: [{ fieldId: 'startDate', condition: "state['startDate']", message: 'Required' }],
        }), {})
        request(el, 'save')
        expect(toasts[0].text).toContain('Start date: Required')
    })

    it('focuses the first field flagged invalid after a refused submit', async () => {
        const el = await mount(serverSide({
            actions: [{ id: 'save', validationRequired: true }],
            validations: [{ fieldId: 'name', condition: "state['name']", message: 'Required' }],
        }))
        const host = document.createElement('div')
        const shadow = host.attachShadow({ mode: 'open' })
        const input = document.createElement('input') as HTMLInputElement & { invalid?: boolean }
        input.invalid = true
        shadow.appendChild(input)
        el.renderRoot.appendChild(host)
        request(el, 'save')
        await new Promise(r => setTimeout(r, 60))
        expect(shadow.activeElement).toBe(input)
    })

    it('a validation of only some fields re-checks them even when other fields already had errors', async () => {
        // A wizard step validates ITS fields: a previous full check that failed on another field
        // must not leave the step looking valid (or invalid) with the old messages.
        const el = await mount(serverSide({
            actions: [{ id: 'next', validationRequired: true, fieldsToValidate: 'a' }],
            validations: [
                { fieldId: 'a', condition: "state['a']", message: 'A is required' },
                { fieldId: 'b', condition: "state['b']", message: 'B is required' },
            ],
        }), { a: 'x', b: '' })
        el.checkValidations()
        expect(el.data.errors).toEqual({ a: [], b: ['B is required'] })

        el.state = { a: '', b: '' }
        request(el, 'next')
        expect(sent).toHaveLength(0)
        expect(el.data.errors.a).toEqual(['A is required'])
    })

    it('asks for confirmation first: deny sends nothing, accept sends', async () => {
        const el = await mount(serverSide({ actions: [{ id: 'delete', confirmationRequired: true,
            confirmationTexts: { title: 'Delete?', message: 'Sure?', confirmationText: 'Yes', denialText: 'No' } }] }))
        request(el, 'delete')
        const dialog = document.querySelector('[role="alertdialog"]') as HTMLElement
        expect(dialog).not.toBeNull()
        ;(dialog.querySelector('.mateu-confirm-deny') as HTMLButtonElement).click()
        expect(document.querySelector('[role="alertdialog"]')).toBeNull()
        expect(sent).toHaveLength(0)

        request(el, 'delete')
        ;(document.querySelector('.mateu-confirm-accept') as HTMLButtonElement).click()
        expect(sent).toHaveLength(1)
        expect(document.querySelector('[role="alertdialog"]')).toBeNull()
    })

    it('the confirmation closes on Escape, on the backdrop, and when the component goes away', async () => {
        const el = await mount(serverSide({ actions: [{ id: 'delete', confirmationRequired: true }] }))
        request(el, 'delete')
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        expect(document.querySelector('[role="alertdialog"]')).toBeNull()

        request(el, 'delete')
        const backdrop = document.querySelector('[role="alertdialog"]')!.parentElement as HTMLElement
        backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(document.querySelector('[role="alertdialog"]')).toBeNull()

        request(el, 'delete')
        el.remove()
        expect(document.querySelector('[role="alertdialog"]')).toBeNull()
        expect(sent).toHaveLength(0)
    })
})

describe('a leave action on a screen with unsaved changes (dirtyGuard)', () => {
    afterEach(() => dirtyGuard.markClean())

    it('Cancel asks the navigation question first: "stay" sends nothing, "leave" sends it and clears the flag', async () => {
        const el = await mount(serverSide({ actions: [{ id: 'cancel-edit' }] }))
        dirtyGuard.markDirty()
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
        request(el, 'cancel-edit')
        expect(confirm).toHaveBeenCalledWith(dirtyGuard.message)
        expect(sent).toHaveLength(0)
        expect(dirtyGuard.dirty).toBe(true)

        confirm.mockReturnValue(true)
        request(el, 'cancel-edit')
        expect(sent).toHaveLength(1)
        expect(dirtyGuard.dirty).toBe(false)
    })

    it('covers the ids the server treats as leave actions, and no others', async () => {
        const ids = ['cancel', 'cancel-new', 'cancel-create', 'cancel-view', 'back', 'backToList']
        const el = await mount(serverSide({ actions: [...ids, 'save', 'cancelBooking', 'backup'].map(id => ({ id })) }))
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
        for (const id of ids) {
            dirtyGuard.markDirty()
            request(el, id)
        }
        expect(confirm).toHaveBeenCalledTimes(ids.length)
        expect(sent).toHaveLength(0)
        for (const id of ['save', 'cancelBooking', 'backup']) request(el, id)
        expect(confirm).toHaveBeenCalledTimes(ids.length)
        expect(sent.map(e => e.detail.actionId)).toEqual(['save', 'cancelBooking', 'backup'])
    })

    it('does not ask when nothing was edited', async () => {
        const el = await mount(serverSide({ actions: [{ id: 'cancel-edit' }] }))
        const confirm = vi.spyOn(window, 'confirm')
        request(el, 'cancel-edit')
        expect(confirm).not.toHaveBeenCalled()
        expect(sent).toHaveLength(1)
    })

    it('a Cancel that bubbles to the component that owns it asks once, there', async () => {
        const outer = await mount(serverSide({ id: 'outer', actions: [{ id: 'cancel-edit' }] }))
        const holder = document.createElement('div')
        document.body.appendChild(holder)
        const inner = await mount(serverSide({ id: 'inner', serverSideType: 'x.Inner' }), {}, holder)
        holder.addEventListener('action-requested', (e) => outer.manageActionRequestedEvent(e as CustomEvent))
        dirtyGuard.markDirty()
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
        request(inner, 'cancel-edit')
        expect(confirm).toHaveBeenCalledTimes(1)
        expect(sent).toHaveLength(1)
    })
})

describe('the double-submit guard', () => {
    it('drops a second run of a write while the first is in flight, and lets it through once settled', async () => {
        const el = await mount(serverSide({ actions: [{ id: 'save' }] }))
        const button = document.createElement('button')
        el.renderRoot.appendChild(button)
        request(el, 'save', { _originElement: button })
        request(el, 'save', { _originElement: button })
        expect(sent).toHaveLength(1)
        expect(button.hasAttribute('data-mateu-pending')).toBe(true)
        expect(button.getAttribute('aria-busy')).toBe('true')

        // a CHILD's outcome passing through does not release this component's run
        const child = document.createElement('div')
        el.appendChild(child)
        child.dispatchEvent(new CustomEvent('backend-succeeded-event', { detail: { actionId: 'save' }, bubbles: true, composed: true }))
        request(el, 'save')
        expect(sent).toHaveLength(1)

        el.dispatchEvent(new CustomEvent('backend-failed-event', { detail: { actionId: 'save' } }))
        expect(button.hasAttribute('data-mateu-pending')).toBe(false)
        request(el, 'save')
        expect(sent).toHaveLength(2)
    })

    it('a cancellation releases every run of the component', async () => {
        const el = await mount(serverSide({ actions: [{ id: 'a' }, { id: 'b' }] }))
        request(el, 'a')
        request(el, 'b')
        el.dispatchEvent(new CustomEvent('backend-cancelled-event', { detail: {} }))
        request(el, 'a')
        request(el, 'b')
        expect(sent).toHaveLength(4)
    })

    it('reads (search) are never exclusive, and background actions mark nothing', async () => {
        const el = await mount(serverSide({ actions: [{ id: 'search' }, { id: 'poll', background: true }] }))
        const button = document.createElement('button')
        el.renderRoot.appendChild(button)
        request(el, 'search')
        request(el, 'search')
        request(el, 'poll', { _originElement: button })
        request(el, 'poll', { _originElement: button })
        expect(sent.map(e => e.detail.actionId)).toEqual(['search', 'search', 'poll', 'poll'])
        expect(sent[2].detail.background).toBe(true)
        expect(button.hasAttribute('data-mateu-pending')).toBe(false)
    })

    it('a component torn down mid-request frees its slot for when it is mounted again', async () => {
        const el = await mount(serverSide({ actions: [{ id: 'save' }] }))
        request(el, 'save')
        el.remove()
        document.body.appendChild(el)
        request(el, 'save')
        expect(sent).toHaveLength(2)
    })
})

describe('the search action', () => {
    it('starts on page 0 of 10 rows unless the state already says which page', async () => {
        const el = await mount(serverSide({ actions: [{ id: 'search' }] }), { page: 2 })
        request(el, 'search')
        expect(sent[0].detail.componentState).toMatchObject({ size: 10, page: 2, sort: [] })
    })

    it('adopts the filters the listing read off the URL', async () => {
        const el = await mount(serverSide({ actions: [{ id: 'search' }] }))
        request(el, 'search', { parameters: { _searchState: { searchText: 'mad', page: 1 } } })
        expect(el.state).toMatchObject({ searchText: 'mad', page: 1 })
    })
})

describe('an action this component does not own', () => {
    it('bubbles up with this component state as the initiator state, and the owner validates the initiator', async () => {
        const outer = await mount(serverSide({ id: 'outer', actions: [{ id: 'save', validationRequired: true }] }))
        const holder = document.createElement('div')
        document.body.appendChild(holder)
        const inner = await mount(serverSide({
            id: 'inner', serverSideType: 'x.Inner',
            validations: [{ fieldId: 'name', condition: "state['name']", message: 'Required' }],
        }), { name: '' }, holder)
        const bubbled: CustomEvent[] = []
        holder.addEventListener('action-requested', (e) => {
            bubbled.push(e as CustomEvent)
            outer.manageActionRequestedEvent(e as CustomEvent)
        })
        request(inner, 'save')
        expect(bubbled[0].detail.parameters.initiatorState).toEqual({ name: '' })
        expect(sent).toHaveLength(0)
        expect(inner.data.errors.name).toEqual(['Required'])

        inner.state = { name: 'Ana' }
        request(inner, 'save')
        expect(sent).toHaveLength(1)
        // the server sees the form the button lives on
        expect(sent[0].detail.componentState).toEqual({ name: 'Ana' })
    })

    it('a declared bubble action is handed to the parent instead of the server', async () => {
        const el = await mount(serverSide({ actions: [{ id: 'back', bubble: true }] }), { id: 7 })
        const bubbled: CustomEvent[] = []
        document.body.addEventListener('action-requested', (e) => bubbled.push(e as CustomEvent))
        request(el, 'back')
        expect(sent).toHaveLength(0)
        expect(bubbled[0].detail).toMatchObject({ actionId: 'back', parameters: { initiatorState: { id: 7 } } })
    })

    it('runs from the action catalogue when no component on the way up declares it', async () => {
        setActionCatalogue([{ id: 'refresh' } as any])
        const el = await mount(serverSide())
        request(el, 'refresh')
        expect(sent.map(e => e.detail.actionId)).toEqual(['refresh'])
    })

    it('leaves a catalogue id to an ancestor that declares it (owner first)', async () => {
        setActionCatalogue([{ id: 'refresh' } as any])
        const outer = await mount(serverSide({ id: 'outer', actions: [{ id: 'refresh' }] }))
        const inner = await mount(serverSide({ id: 'inner' }), {}, outer.renderRoot)
        const bubbled: string[] = []
        outer.addEventListener('action-requested', (e) => bubbled.push((e as CustomEvent).detail.actionId))
        request(inner, 'refresh')
        expect(sent).toHaveLength(0)
        expect(bubbled).toEqual(['refresh'])
    })

    it('runs an id the server named in its answer to this component (an undo)', async () => {
        const el = await mount(serverSide())
        request(el, 'undoDelete', { serverNamed: true })
        expect(sent.map(e => e.detail.actionId)).toEqual(['undoDelete'])
    })
})

describe('client-side actions', () => {
    it('an href action navigates without calling the server', async () => {
        const open = vi.spyOn(window, 'open').mockImplementation(() => null)
        const el = await mount(serverSide({ actions: [{ id: 'go', href: 'https://example.com/docs' }] }))
        request(el, 'go')
        expect(open).toHaveBeenCalledWith('https://example.com/docs', '_blank', 'noopener,noreferrer')
        expect(sent).toHaveLength(0)
    })

    it('a custom-event action emits the event instead of calling the server', async () => {
        const el = await mount(serverSide({ actions: [{ id: 'ping', customEvent: { name: 'pinged', detail: { n: 1 } } }] }))
        const seen: unknown[] = []
        document.addEventListener('pinged', (e) => seen.push((e as CustomEvent).detail), { once: true })
        request(el, 'ping')
        expect(seen).toEqual([{ n: 1 }])
        expect(sent).toHaveLength(0)
    })

    it('a declared flow runs its commands: an in-app Navigate moves the app in place', async () => {
        const el = await mount(serverSide({ actions: [{ id: 'flow', commands: [
            { type: 'NavigateTo', data: '/orders' },
            { type: 'SetWindowTitle', data: 'Orders' },
        ] }] }))
        const routes: string[] = []
        document.addEventListener('navigate-to-requested', (e) => routes.push((e as CustomEvent).detail.route), { once: true })
        request(el, 'flow')
        expect(routes).toEqual(['orders'])
        expect(document.title).toBe('Orders')
        expect(sent).toHaveLength(0)
    })
})

describe('keyboard shortcuts', () => {
    it('an action shortcut runs the action; runOnEnter binds Enter', async () => {
        const el = await mount(serverSide({ actions: [{ id: 'save', shortcut: 'ctrl+s' }, { id: 'go', runOnEnter: true }] }))
        const ctrlS = new KeyboardEvent('keydown', { key: 's', code: 'KeyS', ctrlKey: true, cancelable: true })
        document.dispatchEvent(ctrlS)
        expect(ctrlS.defaultPrevented).toBe(true)
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter' }))
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', code: 'KeyX' }))
        expect(sent.map(e => e.detail.actionId)).toEqual(['save', 'go'])
        el.remove()
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', code: 'KeyS', ctrlKey: true }))
        expect(sent).toHaveLength(2)
    })

    it('a tab shortcut selects the tab in place, also inside an overlay of this component', async () => {
        const el = await mount(serverSide({ actions: [{ id: 'save', shortcut: 'alt+1' }] }))
        const tabs = document.createElement('vaadin-tabs') as HTMLElement & { selected?: number }
        tabs.innerHTML = '<vaadin-tab>A</vaadin-tab><vaadin-tab data-shortcut="alt+2">B</vaadin-tab>'
        el.renderRoot.appendChild(tabs)

        const drawerHost = document.createElement('mateu-drawer') as HTMLElement & Record<string, any>
        drawerHost.component = { metadata: {} }
        el.renderRoot.appendChild(drawerHost)
        await drawerHost.updateComplete
        const drawerShadow = drawerHost.shadowRoot!
        const drawerTabs = document.createElement('vaadin-tabs') as HTMLElement & { selected?: number }
        drawerTabs.innerHTML = '<vaadin-tab data-shortcut="alt+3">X</vaadin-tab><vaadin-tab data-shortcut="alt+4">Y</vaadin-tab>'
        drawerShadow.appendChild(drawerTabs)

        document.dispatchEvent(new KeyboardEvent('keydown', { key: '2', code: 'Digit2', altKey: true }))
        expect(tabs.selected).toBe(1)
        document.dispatchEvent(new KeyboardEvent('keydown', { key: '4', code: 'Digit4', altKey: true }))
        expect(drawerTabs.selected).toBe(1)
        // the tab shortcut does not run the component's actions
        expect(sent).toHaveLength(0)
        document.dispatchEvent(new KeyboardEvent('keydown', { key: '1', code: 'Digit1', altKey: true }))
        expect(sent.map(e => e.detail.actionId)).toEqual(['save'])
    })
})

describe('what the fields tell the component', () => {
    const fire = (el: any, listener: string, type: string, detail: unknown) =>
        el[listener](new CustomEvent(type, { detail, bubbles: true, composed: true }))

    it('value-changed writes the state, marks a tracked form dirty and runs its OnValueChange triggers', async () => {
        const el = await mount(serverSide({ confirmOnNavigationIfDirty: true, triggers: [
            { type: TriggerType.OnValueChange, actionId: 'recalc', propertyName: 'qty' },
            { type: TriggerType.OnValueChange, actionId: 'big', condition: 'state.qty > 10' },
        ], actions: [{ id: 'recalc' }, { id: 'big' }] }), { qty: 1 })
        const dirty: unknown[] = []
        document.addEventListener('dirty', (e) => dirty.push((e as CustomEvent).detail))
        fire(el, 'valueChangedListener', 'value-changed', { fieldId: 'qty', value: 3 })
        expect(el.state.qty).toBe(3)
        expect(dirty).toEqual([{ fieldId: 'qty', value: 3 }])
        expect(sent.map(e => e.detail.actionId)).toEqual(['recalc'])

        el.dispatchEvent(new CustomEvent('backend-succeeded-event', { detail: { actionId: 'recalc' } }))
        fire(el, 'valueChangedListener', 'value-changed', { fieldId: 'qty', value: 20 })
        expect(sent.map(e => e.detail.actionId)).toEqual(['recalc', 'recalc', 'big'])
        fire(el, 'valueChangedListener', 'value-changed', { fieldId: 'other', value: 'x' })
        expect(sent).toHaveLength(3)
    })

    it('an AutoSave trigger runs once the user stops typing', async () => {
        vi.useFakeTimers()
        const el = await mount(serverSide({ triggers: [{ type: TriggerType.AutoSave, actionId: 'save', debounceMillis: 500 }],
            actions: [{ id: 'save' }] }))
        fire(el, 'valueChangedListener', 'value-changed', { fieldId: 'a', value: '1' })
        vi.advanceTimersByTime(300)
        fire(el, 'valueChangedListener', 'value-changed', { fieldId: 'a', value: '12' })
        vi.advanceTimersByTime(300)
        expect(sent.filter(e => e.detail.actionId == 'save')).toHaveLength(0)
        vi.advanceTimersByTime(300)
        const saves = sent.filter(e => e.detail.actionId == 'save')
        expect(saves).toHaveLength(1)
        expect(saves[0].detail.componentState.a).toBe('12')
    })

    it('after a refused submit, the errors follow the typing', async () => {
        const el = await mount(serverSide({ validations: [{ fieldId: 'name', condition: "state['name']", message: 'Required' }] }), { name: '' })
        el.checkValidations()
        expect(el.data.errors.name).toEqual(['Required'])
        fire(el, 'valueChangedListener', 'value-changed', { fieldId: 'name', value: 'Ana' })
        expect(el.data.errors.name).toEqual([])
        expect(el.data._valid).toBe(true)
    })

    it('data-changed writes the data, filter-reset clears the filters and the search text', async () => {
        const el = await mount(serverSide(), { status: 'open', searchText: 'x', other: 1 })
        fire(el, 'dataChangedListener', 'data-changed', { key: 'total', value: 9 })
        expect(el.data.total).toBe(9)
        fire(el, 'resetFilters', 'filter-reset-requested', { fieldIds: ['status'] })
        expect(el.state).toEqual({ status: undefined, searchText: undefined, other: 1 })
    })

    it('a close-modal request from inside closes this component overlay', async () => {
        const el = await mount(serverSide())
        const overlay = document.createElement('mateu-dialog') as HTMLElement & Record<string, any>
        overlay.component = { metadata: {} }
        overlay.close = vi.fn()
        el.renderRoot.appendChild(overlay)
        fire(el, 'closeModalRequestedListener', 'close-modal-requested', {})
        expect(overlay.close).toHaveBeenCalled()
    })

    it('an action-requested from a child element goes through the dispatch', async () => {
        const el = await mount(serverSide({ actions: [{ id: 'save' }] }))
        fire(el, 'actionRequestedListener', 'action-requested', { actionId: 'save' })
        expect(sent).toHaveLength(1)
    })
})

describe('triggers', () => {
    it('OnLoad runs the action once the component is on screen; a timed one waits', async () => {
        vi.useFakeTimers()
        const el = await mount(serverSide({
            triggers: [
                { type: TriggerType.OnLoad, actionId: 'load', times: 1 },
                { type: TriggerType.OnLoad, actionId: 'poll', timeoutMillis: 1000, times: 1, background: true },
                { type: TriggerType.OnLoad, actionId: 'never', condition: 'state.go', times: 1 },
            ],
            actions: [{ id: 'load' }, { id: 'poll' }, { id: 'never' }],
        }))
        vi.advanceTimersByTime(0)
        expect(sent.map(e => e.detail.actionId)).toEqual(['load'])
        vi.advanceTimersByTime(1000)
        expect(sent.map(e => e.detail.actionId)).toEqual(['load', 'poll'])
        expect(sent[1].detail.background).toBe(true)
        void el
    })

    it('OnSuccess runs the follow-up action when the named action succeeds (now or after a delay)', async () => {
        vi.useFakeTimers()
        const el = await mount(serverSide({
            triggers: [
                { type: TriggerType.OnSuccess, calledActionId: 'save', actionId: 'refresh' },
                { type: TriggerType.OnSuccess, calledActionId: 'save', actionId: 'later', timeoutMillis: 200 },
                { type: TriggerType.OnError, calledActionId: 'save', actionId: 'recover' },
            ],
            actions: [{ id: 'refresh' }, { id: 'later' }, { id: 'recover' }],
        }))
        vi.advanceTimersByTime(0)
        el.dispatchEvent(new CustomEvent('backend-call-succeeded', { detail: { actionId: 'save' } }))
        expect(sent.map(e => e.detail.actionId)).toEqual(['refresh'])
        vi.advanceTimersByTime(200)
        expect(sent.map(e => e.detail.actionId)).toEqual(['refresh', 'later'])
        el.dispatchEvent(new CustomEvent('backend-call-failed', { detail: { actionId: 'save' } }))
        el.dispatchEvent(new CustomEvent('backend-call-failed', { detail: { actionId: 'other' } }))
        expect(sent.map(e => e.detail.actionId)).toEqual(['refresh', 'later', 'recover'])
    })

    it('OnCustomEvent subscriptions: the document bus, a named source, and the component itself', async () => {
        vi.useFakeTimers()
        const el = await mount(serverSide({
            triggers: [
                { type: TriggerType.OnCustomEvent, eventName: 'pax-selected', actionId: 'reload', source: 'DOCUMENT' },
                { type: TriggerType.OnCustomEvent, eventName: 'saved', actionId: 'fromGuests', source: 'COMPONENT', from: 'guests' },
                { type: TriggerType.OnCustomEvent, eventName: 'picked', actionId: 'own' },
            ],
            actions: [{ id: 'reload' }, { id: 'fromGuests' }, { id: 'own' }],
        }))
        vi.advanceTimersByTime(0)
        // a sibling anywhere in the page
        const sibling = document.createElement('div')
        document.body.appendChild(sibling)
        sibling.dispatchEvent(new CustomEvent('pax-selected', { detail: { paxIndex: 2 }, bubbles: true }))
        expect(sent[0].detail).toMatchObject({ actionId: 'reload', parameters: { paxIndex: 2 } })

        document.dispatchEvent(new CustomEvent('saved', { detail: { __source: 'invoices' } }))
        document.dispatchEvent(new CustomEvent('saved', { detail: { __source: 'guests' } }))
        expect(sent.map(e => e.detail.actionId)).toEqual(['reload', 'fromGuests'])

        // SELF: only from a descendant, and the event goes no further
        sibling.dispatchEvent(new CustomEvent('picked', { bubbles: true }))
        const child = document.createElement('span')
        el.appendChild(child)
        const above: Event[] = []
        document.body.addEventListener('picked', (e) => above.push(e))
        child.dispatchEvent(new CustomEvent('picked', { bubbles: true, detail: {} }))
        expect(sent.map(e => e.detail.actionId)).toEqual(['reload', 'fromGuests', 'own'])
        expect(above.filter(e => e.target === child)).toHaveLength(0)

        // gone with the component, back when it is re-attached
        el.remove()
        document.dispatchEvent(new CustomEvent('pax-selected', { detail: {} }))
        expect(sent).toHaveLength(3)
        document.body.appendChild(el)
        document.dispatchEvent(new CustomEvent('pax-selected', { detail: {} }))
        expect(sent).toHaveLength(4)
    })

    it('a subscriber CLAIMS the event it takes, so the chat knows not to render the screen itself', async () => {
        vi.useFakeTimers()
        await mount(serverSide({
            triggers: [{ type: TriggerType.OnCustomEvent, eventName: 'render-screen', actionId: 'renderScreen', source: 'DOCUMENT' }],
            actions: [{ id: 'renderScreen' }],
        }))
        vi.advanceTimersByTime(0)
        const taken = new CustomEvent('render-screen', { detail: { yaml: 'type: Text' }, bubbles: true, composed: true, cancelable: true })
        document.body.dispatchEvent(taken)
        expect(isEventClaimed(taken)).toBe(true)
        expect(sent.at(-1)!.detail).toMatchObject({ actionId: 'renderScreen', parameters: { yaml: 'type: Text' } })
        // an event nobody subscribes to is not claimed: the shell falls back to its own handling
        const free = new CustomEvent('highlight-row', { detail: {}, bubbles: true, composed: true })
        document.body.dispatchEvent(free)
        expect(isEventClaimed(free)).toBe(false)
    })
})

describe('rendering', () => {
    it('a fresh tracked form announces it is clean, and errors of the whole component are listed', async () => {
        const clean: Event[] = []
        document.addEventListener('clean', (e) => clean.push(e), { once: true })
        const el = await mount(serverSide({ confirmOnNavigationIfDirty: true, sizing: 'fill' }))
        expect(clean).toHaveLength(1)
        expect(el.getAttribute('data-sizing')).toBe('fill')
        el.data = { errors: { _component: ['Dates overlap'] } }
        await el.updateComplete
        expect(el.renderRoot.querySelector('li')?.textContent).toBe('Dates overlap')
    })
})
