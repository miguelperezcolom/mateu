// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { MateuUx } from './mateu-ux.ts'
import { ComponentType } from '@mateu/shared/apiClients/dtos/ComponentType'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import { UIFragmentAction } from '@mateu/shared/apiClients/dtos/UIFragmentAction.ts'
import UIFragment from '@mateu/shared/apiClients/dtos/UIFragment'
import ServerSideComponent from '@mateu/shared/apiClients/dtos/ServerSideComponent.ts'

// The page chrome (data-page-width, data-page-type, data-has-welcome-banner) is stamped on the ux
// host and read by the renderer stylesheets. What these assert is WHEN it is stamped, not what it
// resolves to — resolvePageWidth is pure and has its own tests next door.
//
// Called on a stand-in `this` with the handful of members applyFragment touches, so the decision
// can be asserted without a DOM: the real element is a LitElement whose host is the thing being
// tagged, and `dataset` is the only part of it that matters here.
const ux = (over: Record<string, any> = {}) => ({
    id: 'target',
    top: false,
    dataset: {} as Record<string, string>,
    fragment: undefined as UIFragment | undefined,
    lastStampedComponent: undefined as unknown,
    lastAuthoritativeKey: undefined as string | undefined,
    currentStructureHash: undefined as string | undefined,
    pendingRouteFocus: false,
    hasRenderedContent: false,
    structureCacheKey: () => 'a-route',
    applyFragment: MateuUx.prototype.applyFragment,
    stampPageChrome: (MateuUx.prototype as any).stampPageChrome,
    ...over,
})

let ids = 0
const nextId = () => `c${++ids}`

/** A page that declares a width, wrapped the way a routed view arrives. */
const page = (pageWidth: string | undefined, pageType?: string): ServerSideComponent =>
    ({
        id: nextId(),
        type: ComponentType.ServerSide,
        serverSideType: 'AView',
        pageWidth,
        children: [{
            id: nextId(),
            type: ComponentType.ClientSide,
            metadata: { type: ComponentMetadataType.Page, pageType },
            children: [],
        }],
    }) as unknown as ServerSideComponent

const routeLoad = (component: ServerSideComponent | undefined, state: Record<string, any> = {}): UIFragment =>
    ({
        targetComponentId: 'target',
        action: UIFragmentAction.Replace,
        component,
        state,
        data: {},
    }) as unknown as UIFragment

describe('page chrome', () => {

    it('stamps the width a routed structure declares', () => {
        const el = ux()

        el.applyFragment(routeLoad(page('edgeToEdge')))

        expect(el.dataset.pageWidth).toBe('edge')
    })

    it('re-stamps when the next route declares a different width', () => {
        const el = ux()

        el.applyFragment(routeLoad(page('edgeToEdge')))
        el.applyFragment(routeLoad(page('fixed')))

        expect(el.dataset.pageWidth).toBe('fixed')
    })

    it('stamps a structure that was seeded from the client cache and answered state-only', () => {
        // THE bug this was written for. A cached structure is seeded straight onto `fragment`
        // before the request goes out; the server recognises the echoed ETag and replies with
        // state and no component. Nothing in that round trip carries a full structure, so the
        // chrome used to keep the PREVIOUS route's width — which is what made a width look like
        // it stuck to the session rather than to the screen.
        const el = ux({ dataset: { pageWidth: 'fixed' } })
        el.fragment = routeLoad(page('edgeToEdge'))

        el.applyFragment(routeLoad(undefined, { title: 'fresh data' }))

        expect(el.dataset.pageWidth).toBe('edge')
    })

    it('leaves the chrome alone while a state-only fragment refreshes the same structure', () => {
        // The polling case: same structure, new data, several times a second. Re-walking the tree
        // to arrive at the answer already on the host is the cost this guards against — asserted
        // through the identity guard, since the stamped value is the same either way.
        const structure = page('fullWidth')
        const el = ux()
        el.applyFragment(routeLoad(structure))
        expect(el.dataset.pageWidth).toBe('full')

        el.dataset.pageWidth = 'tampered'
        el.applyFragment(routeLoad(undefined, { status: 'Running (66%)' }))

        expect(el.dataset.pageWidth).toBe('tampered')
    })

    it('stamps the coarse page type beside the width', () => {
        const el = ux()

        el.applyFragment(routeLoad(page(undefined, 'collection')))

        expect(el.dataset.pageType).toBe('collection')
    })
})
