// @vitest-environment jsdom
// rc.1 re-verification of GA review 2 area 8 N1 (Vaadin): a page of a NON-ROOT YAML mount rewrites
// the address bar without the mount. The server writes `<mateu-ui baseUrl="/yaml-mount"
// pathPrefix="">` (YamlMounts.indexHtml, unchanged since beta.65); the client reads the route by
// stripping baseUrl from the path and pushes origin + pathPrefix + route back. Round trip of
// /yaml-mount/second → /second. NOT FIXED at rc.1: pinned with it.fails.
import { describe, expect, it } from 'vitest'
import { routeTargetUrl } from './navigationUrl'
import { MateuUi } from './mateu-ui'

const ORIGIN = 'http://localhost:8640'

describe('rc.1 re-verify Explorer N1: non-root YAML mount keeps its URL', () => {
    it('the route the client reads off /yaml-mount/second is /second (input of the push)', () => {
        const P = MateuUi.prototype
        // the page's attributes on a plain object (a Lit element's setters need a connected instance)
        const ui = { baseUrl: '/yaml-mount', pathPrefix: '', extractGrossRouteFromUrl: P.extractGrossRouteFromUrl,
            getContextPathStartingIndex: P.getContextPathStartingIndex }
        const route = P.extractRouteWithoutParamsFromUrl.call(ui as never,
            { location: { pathname: '/yaml-mount/second', search: '' } } as unknown as Window)
        expect(route).toBe('/second')
    })
    it.fails('pushing that route back gives the address the page was opened at', () => {
        const url = routeTargetUrl('/second', '/yaml-mount', '', ORIGIN)
        expect(url.pathname).toBe('/yaml-mount/second')
    })
    it('(control) an @UI("/fed") page — pathPrefix="/fed" — keeps it', () => {
        expect(routeTargetUrl('/welcome', '/fed', '/fed', ORIGIN).pathname).toBe('/fed/welcome')
    })
})
