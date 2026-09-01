import { describe, expect, it } from 'vitest'
import ComponentElement from './ComponentElement'
import { ComponentType } from '@mateu/shared/apiClients/dtos/ComponentType'
import { UIFragmentAction } from '@mateu/shared/apiClients/dtos/UIFragmentAction.ts'
import UIFragment from '@mateu/shared/apiClients/dtos/UIFragment'
import ServerSideComponent from '@mateu/shared/apiClients/dtos/ServerSideComponent.ts'

// applyFragment lives on a LitElement, and every branch of it is plain data handling: it decides
// what of the component, the state and the data survives a fragment. Called on a stand-in `this`
// with the handful of members it touches, so the decisions can be asserted without a DOM.
const componentElement = (over: Record<string, any> = {}) => ({
    id: 'target',
    component: undefined as ServerSideComponent | undefined,
    state: {} as Record<string, any>,
    data: {} as Record<string, any>,
    _locallyEdited: new Set<string>(),
    callbackToken: '',
    requestUpdate: () => {},
    registerCustomEventListeners: () => {},
    isOverlayChild: () => false,
    triggerOnLoad: () => {},
    applyFragment: ComponentElement.prototype.applyFragment,
    ...over,
})

const serverSide = (serverSideType: string, id = crypto.randomUUID()): ServerSideComponent =>
    ({ id, type: ComponentType.ServerSide, serverSideType, children: [] }) as unknown as ServerSideComponent

const fragment = (component: ServerSideComponent, state: Record<string, any>): UIFragment =>
    ({
        targetComponentId: 'target',
        action: UIFragmentAction.Replace,
        component,
        state,
    }) as unknown as UIFragment

describe('applyFragment', () => {

    it('keeps the state its surroundings put there when a view re-renders itself', () => {
        // The case this exists for: a detail view that polls itself every couple of seconds. Its
        // fragment carries its own state and nothing else, so wiping the map first threw away
        // what the CRUD around it had stored — its chrome vanished on the first refresh.
        const el = componentElement({
            component: serverSide('ProcessDetail'),
            state: { crudChrome: 'back to list', status: 'Running (33%)' },
            data: { rows: [1, 2, 3] },
        })

        el.applyFragment(fragment(serverSide('ProcessDetail'), { status: 'Running (66%)' }))

        expect(el.state.crudChrome).toBe('back to list')
        expect(el.state.status).toBe('Running (66%)')
        expect(el.data.rows).toEqual([1, 2, 3])
    })

    it('wipes the state when a different component replaces this one', () => {
        // The case it was written for, and still the right thing: nothing of the outgoing
        // component may leak into the incoming one.
        const el = componentElement({
            component: serverSide('ProcessDetail'),
            state: { crudChrome: 'back to list' },
            data: { rows: [1, 2, 3] },
        })

        el.applyFragment(fragment(serverSide('SomethingElse'), { title: 'other' }))

        expect(el.state.crudChrome).toBeUndefined()
        expect(el.state.title).toBe('other')
        expect(el.data.rows).toBeUndefined()
    })

    it('keeps everything on ReplaceKeepData, as before', () => {
        const el = componentElement({
            component: serverSide('ProcessDetail'),
            state: { crudChrome: 'back to list' },
            data: { rows: [1] },
        })
        const f = fragment(serverSide('SomethingElse'), { title: 'other' })
        ;(f as any).action = UIFragmentAction.ReplaceKeepData

        el.applyFragment(f)

        expect(el.state.crudChrome).toBe('back to list')
        expect(el.data.rows).toEqual([1])
    })

    it('ignores a fragment aimed at another component', () => {
        const el = componentElement({
            component: serverSide('ProcessDetail'),
            state: { untouched: true },
        })
        const f = fragment(serverSide('ProcessDetail'), { status: 'new' })
        ;(f as any).targetComponentId = 'somebody-else'

        el.applyFragment(f)

        expect(el.state).toEqual({ untouched: true })
    })
})

// Reproduces the "listing goes blank on navigation" race: the row DATA arrives from the search
// straight into this component; a data-less route LOAD then re-renders the parent, which
// re-binds our .data with a fresh EMPTY object. That empty re-bind must not wipe the rows.
// A plain stand-in (like componentElement above): .data is a normal field, so assigning it does
// not run Lit's reactive setter. willUpdate keeps its super binding to LitElement's no-op.
// `willUpdate` is Lit's protected lifecycle hook and stays protected on ComponentElement:
// widening a framework base class's public surface so a test can reach it is the wrong way
// round. This test-only subclass is the single place that reaches it, and it hands the method
// out with its REAL type (a structural cast here would keep compiling if the signature moved).
class WillUpdateProbe extends ComponentElement {
    static readonly hook = WillUpdateProbe.prototype.willUpdate
    // willUpdate delegates the state half to this one, so the stand-in needs the real
    // implementation too — handed out the same way, with its real type.
    static readonly keepEdited = WillUpdateProbe.prototype._keepEditedFieldValues
}

const withProto = (over: Record<string, any>) => ({
    data: {} as Record<string, any>,
    state: {} as Record<string, any>,
    _lastFragmentData: undefined as Record<string, any> | undefined,
    _lastOwnState: undefined as Record<string, any> | undefined,
    _locallyEdited: new Set<string>(),
    _lastViewKey: undefined as string | undefined,
    component: undefined as ServerSideComponent | undefined,
    willUpdate: WillUpdateProbe.hook,
    _keepEditedFieldValues: WillUpdateProbe.keepEdited,
    ...over,
})

describe('willUpdate data preservation', () => {

    it('keeps the rows when a data-less parent re-render re-binds an empty data map', () => {
        const rows = { crud: { page: { content: [1, 2] } } }
        const el = withProto({ data: rows, _lastFragmentData: rows })
        // Lit has already assigned the incoming empty object to .data before willUpdate runs;
        // the previous value (the rows) travels in the changed map.
        el.data = {}
        el.willUpdate(new Map([['data', rows]]) as any)
        expect(el.data).toBe(rows)
    })

    it('respects an authoritative empty data set by our own applyFragment (different view replaces this one)', () => {
        const cleared = {}
        const el = withProto({ data: cleared, _lastFragmentData: cleared })
        el.willUpdate(new Map([['data', { old: 1 }]]) as any)
        expect(el.data).toBe(cleared)
    })

    it('drops the rows when a DIFFERENT view arrives in this reused element', () => {
        // Navigating from one listing to another: Lit reuses this element, so the new view's
        // component and its still-empty data map are bound together. Preserving the previous
        // rows there showed the outgoing listing's rows under the incoming listing's header.
        const rows = { crud: { page: { content: [1, 2] } } }
        const el = withProto({
            data: rows,
            _lastFragmentData: rows,
            _lastViewKey: 'WorkflowDefinitions',
            component: serverSide('Processes'),
        })
        el.data = {}
        el.willUpdate(new Map<string, any>([['data', rows], ['component', serverSide('WorkflowDefinitions')]]) as any)
        expect(el.data).toEqual({})
    })

    it('still keeps the rows when the SAME view re-renders', () => {
        const rows = { crud: { page: { content: [1, 2] } } }
        const el = withProto({
            data: rows,
            _lastFragmentData: rows,
            _lastViewKey: 'Processes',
            component: serverSide('Processes'),
        })
        el.data = {}
        el.willUpdate(new Map([['data', rows]]) as any)
        expect(el.data).toBe(rows)
    })

    it('lets a non-empty parent re-render through unchanged', () => {
        const fresh = { crud: { page: { content: [9] } } }
        const el = withProto({ data: fresh, _lastFragmentData: { crud: { page: { content: [1] } } } })
        el.willUpdate(new Map([['data', { crud: { page: { content: [1] } } }]]) as any)
        expect(el.data).toBe(fresh)
    })
})

/**
 * The same race one property over. A form field's value lives in `state`, and the parent re-binds
 * `.state` from its own older copy on every render — so a save, which answers first with a
 * view-less fragment and only then with the saved record, paints the pre-edit value in between.
 */
describe('willUpdate keeps what the user typed', () => {

    const edited = (over: Record<string, any> = {}) => withProto({
        _lastViewKey: 'BookingViewModel',
        component: serverSide('BookingViewModel'),
        _locallyEdited: new Set(['leadName']),
        ...over,
    })

    it('restores an edited field when the parent re-binds its older copy', () => {
        const el = edited({ state: { leadName: 'aaayhyyhyyhy', crudChrome: 'back to list' } })
        // Lit has already assigned the parent's copy; what we typed travels in the changed map.
        el.willUpdate(new Map([['state', { leadName: 'the name just typed', crudChrome: 'back to list' }]]) as any)
        expect(el.state.leadName).toBe('the name just typed')
    })

    it('takes the parent value for everything the user did not touch', () => {
        const el = edited({ state: { leadName: 'stale', crudChrome: 'back to list', status: 'Confirmed' } })
        el.willUpdate(new Map([['state', { leadName: 'typed', crudChrome: 'gone', status: 'Pending' }]]) as any)
        expect(el.state.leadName).toBe('typed')
        expect(el.state.crudChrome).toBe('back to list')
        expect(el.state.status).toBe('Confirmed')
    })

    it('respects our own change — the keystroke that just happened is not a stale re-bind', () => {
        // Without the identity check this would restore the previous keystroke and the field
        // would refuse to accept typing at all.
        const typed = { leadName: 'ab' }
        const el = edited({ state: typed, _lastOwnState: typed })
        el.willUpdate(new Map([['state', { leadName: 'a' }]]) as any)
        expect(el.state.leadName).toBe('ab')
    })

    it('stops defending a field once a fragment carries it', () => {
        // The server is authoritative again: a server-computed field has to be able to change on
        // screen after the user has touched it.
        const el = componentElement({
            component: serverSide('BookingViewModel'),
            state: { leadName: 'typed' },
            _locallyEdited: new Set(['leadName']),
        })
        el.applyFragment({
            targetComponentId: 'target',
            action: UIFragmentAction.Replace,
            state: { leadName: 'NORMALISED BY THE SERVER' },
        } as unknown as UIFragment)
        expect(el._locallyEdited.has('leadName')).toBe(false)
        expect(el.state.leadName).toBe('NORMALISED BY THE SERVER')
    })

    it('does not carry an edit across a change of view in a reused element', () => {
        const el = edited({
            state: { leadName: 'stale' },
            _lastViewKey: 'BookingViewModel',
            component: serverSide('Processes'),
        })
        el.willUpdate(new Map<string, any>([
            ['state', { leadName: 'typed in the outgoing view' }],
            ['component', serverSide('Processes')],
        ]) as any)
        expect(el.state.leadName).toBe('stale')
        expect(el._locallyEdited.size).toBe(0)
    })
})
