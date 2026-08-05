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
