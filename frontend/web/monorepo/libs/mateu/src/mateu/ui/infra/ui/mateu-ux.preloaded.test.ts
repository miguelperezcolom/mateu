// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import './mateu-ux'
import { service } from '@application/service'
import { UIFragmentAction } from '@mateu/shared/apiClients/dtos/UIFragmentAction.ts'
import type UIIncrement from '@mateu/shared/apiClients/dtos/UIIncrement'
import { componentRenderer } from './renderers/ComponentRenderer'
import { html } from 'lit'

// what paints a component is the renderer's business, not this test's
componentRenderer.set({ renderClientSideComponent: () => html`` } as any)

// A micro frontend the HOST resolved (resolve = SERVER) arrives with the remote's answer to its
// load. The island paints it instead of asking — no request from the client — and everything
// after the first paint still goes to the island's baseUrl: the remote, never the host.

const REMOTE = 'https://content.acme.com/hub'

const answer = (id: string): UIIncrement => ({
    commands: [],
    messages: [],
    fragments: [{
        targetComponentId: id,
        action: UIFragmentAction.Replace,
        component: {
            type: 'ClientSide', id: 't', children: [],
            metadata: { type: 'Text', text: 'hello from the remote', container: 'p' },
        },
        state: {},
        data: {},
    }],
} as unknown as UIIncrement)

const island = (preloaded?: UIIncrement) => {
    const ux = document.createElement('mateu-ux') as any
    ux.id = 'mfe_island'
    ux.baseUrl = REMOTE
    ux.route = '/widget'
    ux.consumedRoute = ''
    ux.serverSideType = 'remote.Widget'
    ux.preloaded = preloaded
    document.body.appendChild(ux)
    return ux
}

const settle = async (ux: any) => {
    await ux.updateComplete
    await new Promise(resolve => setTimeout(resolve, 0))
    await ux.updateComplete
}

afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
})

describe('mateu-ux with a preloaded answer', () => {

    it('paints it and does not ask anybody', async () => {
        const runAction = vi.spyOn(service, 'runAction').mockResolvedValue(undefined as never)
        const ux = island(answer('mfe_island'))
        await settle(ux)
        expect(runAction).not.toHaveBeenCalled()
        expect(ux.fragment?.component?.metadata?.text).toBe('hello from the remote')
    })

    it('without one, loads from its remote as always', async () => {
        const runAction = vi.spyOn(service, 'runAction').mockResolvedValue(undefined as never)
        const ux = island()
        await settle(ux)
        expect(runAction).toHaveBeenCalledTimes(1)
        expect(runAction.mock.calls[0][1]).toBe(REMOTE)
    })

    it('sends an action fired inside the embedded fragment to the remote', async () => {
        const runAction = vi.spyOn(service, 'runAction').mockResolvedValue(undefined as never)
        const ux = island(answer('mfe_island'))
        await settle(ux)
        const inside = document.createElement('div')
        ux.appendChild(inside)
        inside.dispatchEvent(new CustomEvent('server-side-action-requested', {
            detail: {
                route: '/widget', consumedRoute: '', actionId: 'like', serverSideType: 'remote.Widget',
                initiatorComponentId: 'w', initiator: inside, componentState: {}, parameters: {},
            },
            bubbles: true,
            composed: true,
        }))
        expect(runAction).toHaveBeenCalledTimes(1)
        expect(runAction.mock.calls[0][1]).toBe(REMOTE)
        expect(runAction.mock.calls[0][4]).toBe('like')
    })
})
