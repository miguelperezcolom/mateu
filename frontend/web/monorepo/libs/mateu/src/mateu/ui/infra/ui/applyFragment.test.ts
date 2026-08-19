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

describe('willUpdate data preservation', () => {

    // Reproduces the "listing goes blank on navigation" race: the row DATA arrives from the search
    // straight into this component; a data-less route LOAD then re-renders the parent, which
    // re-binds our .data with a fresh EMPTY object. That empty re-bind must not wipe the rows.
    // A plain stand-in (like componentElement above): .data is a normal field, so assigning it does
    // not run Lit's reactive setter. willUpdate keeps its super binding to LitElement's no-op.
    const withProto = (over: Record<string, any>) => ({
        data: {} as Record<string, any>,
        _lastFragmentData: undefined as Record<string, any> | undefined,
        _lastViewKey: undefined as string | undefined,
        component: undefined as ServerSideComponent | undefined,
        willUpdate: ComponentElement.prototype.willUpdate,
        ...over,
    })

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
