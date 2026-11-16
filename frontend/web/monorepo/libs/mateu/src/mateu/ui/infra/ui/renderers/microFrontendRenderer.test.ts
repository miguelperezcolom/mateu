import { describe, expect, it } from 'vitest'
import { microFrontendConsumedRoute, microFrontendUxId } from './microFrontendRenderer'
import MicroFrontend from '@mateu/shared/apiClients/dtos/componentmetadata/MicroFrontend'

// The id handed to an embedded micro-frontend's <mateu-ux> USED to be a fresh nanoid() per render.
// mateu-ux.updated() reloads the route (a non-background request → the loading veil) whenever its
// `id` changes, so every shell re-render reloaded the micro-frontend over content already on screen
// — the "page loads, then dims, then comes back" flash, worst on a self-refreshing shell whose
// active app root returns a component: null routing hop (it pushes the re-renders past first paint).
// The id must instead be DETERMINISTIC in what the micro-frontend points at, so successive renders
// reuse the same mateu-ux and a re-render stops reloading it.
const mfe = (over: Partial<MicroFrontend> = {}): MicroFrontend =>
    ({ baseUrl: 'http://localhost:8085/remote', route: '/my-tasks', consumedRoute: '', serverSideType: 'TasksWidget', ...over }) as unknown as MicroFrontend

describe('microFrontendUxId', () => {

    it('is stable across renders for the same target (the fix — a nanoid would differ every call)', () => {
        expect(microFrontendUxId(mfe())).toBe(microFrontendUxId(mfe()))
    })

    it('differs when the target differs, so two micro-frontends do not collide on one id', () => {
        expect(microFrontendUxId(mfe({ route: '/a' }))).not.toBe(microFrontendUxId(mfe({ route: '/b' })))
        expect(microFrontendUxId(mfe({ baseUrl: 'http://a' }))).not.toBe(microFrontendUxId(mfe({ baseUrl: 'http://b' })))
        expect(microFrontendUxId(mfe({ consumedRoute: '/x' }))).not.toBe(microFrontendUxId(mfe({ consumedRoute: '/y' })))
        expect(microFrontendUxId(mfe({ serverSideType: 'A' }))).not.toBe(microFrontendUxId(mfe({ serverSideType: 'B' })))
    })

    it('is a valid id token (no characters that would break an attribute selector)', () => {
        expect(microFrontendUxId(mfe())).toMatch(/^[a-zA-Z0-9_]+$/)
    })

    it('tolerates missing optional fields without throwing', () => {
        const id = microFrontendUxId({ baseUrl: 'http://x/remote', route: '/r' } as unknown as MicroFrontend)
        expect(id).toMatch(/^[a-zA-Z0-9_]+$/)
    })

    it('is the same with no consumed route and an empty one (the host resolves both as one island)', () => {
        expect(microFrontendUxId(mfe({ consumedRoute: undefined }))).toBe(microFrontendUxId(mfe({ consumedRoute: '' })))
    })
})

// A missing consumed route reached the server as a FRESH load ("_empty"): a remote APP answered its
// shell aimed at the route, and the shell painted inside the island loaded "_empty/…/route", got
// another shell, and the browser looped forever (resolve = SERVER sent the null; the host now asks
// with "" too). The island's loads always carry a consumed route — "" when none is declared.
describe('microFrontendConsumedRoute', () => {

    it('is "" when the micro frontend declares none (a content load, never a fresh one)', () => {
        expect(microFrontendConsumedRoute(mfe({ consumedRoute: undefined }))).toBe('')
        expect(microFrontendConsumedRoute(mfe({ consumedRoute: null as unknown as string }))).toBe('')
    })

    it('is never the fresh-load marker unless declared', () => {
        expect(microFrontendConsumedRoute(mfe({ consumedRoute: undefined }))).not.toBe('_empty')
    })

    it('keeps a declared one', () => {
        expect(microFrontendConsumedRoute(mfe({ consumedRoute: '/orders' }))).toBe('/orders')
    })
})
