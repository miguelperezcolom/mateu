import { describe, expect, it } from 'vitest'
import { contentBaseUrl, contentServerSideType, reachableBaseUrl } from './appContentTarget'

/**
 * Where a federated shell loads its content from (found building the Mateu Explorer's /fed console
 * on 3.0-beta.51): a bookmarked remote screen went to the SHELL's backend, and a YAML-only remote's
 * leaf was sent with the SHELL's view type.
 */
const shell = { serverSideType: 'io.acme.FederatedConsole', homeServerSideType: 'io.acme.Welcome', homeBaseUrl: '/fed' }

describe('the base the content is loaded from', () => {
    it('a fresh deep link to a REMOTE screen loads it from the remote the server mounted', () => {
        const mounted = { ...shell, homeServerSideType: 'io.remote.InventoryApp', homeBaseUrl: 'http://remote:8641/inventory' }
        // it used to answer the shell's own base ('/fed'), whose backend refused the remote's type
        expect(contentBaseUrl({ baseUrl: '/fed' }, mounted)).toBe('http://remote:8641/inventory')
        expect(contentBaseUrl({ baseUrl: '' }, mounted)).toBe('http://remote:8641/inventory')
    })

    it('an app reached through a shell keeps the base the browser used for its own home', () => {
        // the remote app calls itself '/inventory' from its own origin; the browser reached it elsewhere
        expect(contentBaseUrl({ baseUrl: 'http://remote:8641/inventory' }, { homeBaseUrl: '/inventory' })).toBe('http://remote:8641/inventory')
        expect(reachableBaseUrl({ homeBaseUrl: '/inventory' }, undefined)).toBe('/inventory')
    })

    it('a selected option goes to its own backend, else the shell\'s', () => {
        expect(contentBaseUrl({ selectedRoute: '/stock', selectedBaseUrl: 'http://remote:8641/inventory', baseUrl: '/fed' }, shell)).toBe('http://remote:8641/inventory')
        expect(contentBaseUrl({ selectedRoute: '/welcome', baseUrl: '/fed' }, shell)).toBe('/fed')
    })
})

describe('the view type named on the content load', () => {
    it('a YAML-only remote leaf (no type of its own) names NONE — never the shell\'s', () => {
        expect(contentServerSideType({ selectedRoute: '/order/o-1', selectedBaseUrl: 'http://remote:8642/orders', baseUrl: '/fed' }, shell)).toBeUndefined()
        // a relative remote (same deployment, another path) is a remote too
        expect(contentServerSideType({ selectedRoute: '/tasks', selectedBaseUrl: '/_forms', baseUrl: '' }, shell)).toBeUndefined()
    })

    it('a remote leaf with a type names its own', () => {
        expect(contentServerSideType({ selectedRoute: '/stock', selectedBaseUrl: 'http://remote:8641/inventory', selectedServerSideType: 'io.remote.InventoryApp', baseUrl: '/fed' }, shell)).toBe('io.remote.InventoryApp')
    })

    it('an option of the shell\'s own backend falls back to the shell\'s type, as before', () => {
        expect(contentServerSideType({ selectedRoute: '/welcome', baseUrl: '/fed' }, shell)).toBe('io.acme.FederatedConsole')
        expect(contentServerSideType({ selectedRoute: '/welcome', selectedBaseUrl: '/fed/', baseUrl: '/fed' }, shell)).toBe('io.acme.FederatedConsole')
    })

    it('nothing selected: the home\'s type', () => {
        expect(contentServerSideType({ baseUrl: '/fed' }, shell)).toBe('io.acme.Welcome')
    })
})
