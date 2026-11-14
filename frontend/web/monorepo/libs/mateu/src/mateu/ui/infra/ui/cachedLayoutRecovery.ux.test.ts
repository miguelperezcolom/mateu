// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const runAction = vi.fn()
vi.mock('@application/service', () => ({ service: { runAction: (...args: unknown[]) => runAction(...args) } }))
vi.mock('@application/SSEService.ts', () => ({ sseService: { runAction: (...args: unknown[]) => runAction(...args) } }))

import { MateuUx } from './mateu-ux.ts'
import { clearStructureCache, getCachedStructure, putCachedStructure, structureCacheKey } from '@infra/routeStructureCache.ts'
import { ComponentType } from '@mateu/shared/apiClients/dtos/ComponentType'
import { UIFragmentAction } from '@mateu/shared/apiClients/dtos/UIFragmentAction.ts'
import UIFragment from '@mateu/shared/apiClients/dtos/UIFragment'
import ServerSideComponent from '@mateu/shared/apiClients/dtos/ServerSideComponent.ts'
import { mateuApiClient } from '@infra/http/AxiosMateuApiClient.ts'
import { upstream } from '@domain/state'
import { setNotifier, ToastMessage } from '@application/Notifier.ts'
import { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios'

// The live report (an EventConductor console on localhost:8095): another Mateu app had been served
// on the same origin before, and its screens were in the structure cache. The new app painted them
// as the prediction of its own, their listings' OnLoad `search` named the OLD app's view type, the
// server refused it (403, the wire-type allowlist) and every such page showed "No tienes permiso
// para esta acción". A request a cached screen made is now settled with the server's answer.
// The real HttpService and transport run; only the network (the axios adapter) is faked. "Toasts"
// are what the page would show: the notifier's, and the failures the app's mateu-api-caller toasts.

const PAGE = { id: 'ux_orders', baseUrl: '/_orders', route: '/orders' }
const OLD_SST = 'com.example.oldapp.OrdersCrud'
const NEW_SST = 'io.mateu.newapp.OrdersCrud'

const listing = (sst: string): ServerSideComponent => ({
    id: 'list',
    type: ComponentType.ServerSide,
    serverSideType: sst,
    children: [],
}) as unknown as ServerSideComponent

const routeLoadAnswer = (sst: string) => ({
    fragments: [{
        targetComponentId: PAGE.id,
        action: UIFragmentAction.Replace,
        component: listing(sst),
        state: {},
        data: {},
    } as unknown as UIFragment],
})

const searchFrom = (initiator: HTMLElement, sst: string) =>
    new CustomEvent('server-side-action-requested', {
        detail: {
            route: PAGE.route, consumedRoute: '', actionId: 'search', serverSideType: sst,
            initiatorComponentId: 'list', initiator, componentState: {}, parameters: {},
        },
    })

type Pending = {
    body: { actionId: string, serverSideType: string, knownStructureHash?: string },
    url: string,
    answer: (data: unknown) => void,
    fail: (status: number, data?: unknown) => void,
}

describe('a request made by a screen painted from the structure cache', () => {
    let pending: Pending[] = []
    let toasts: ToastMessage[] = []
    let subscription: { unsubscribe(): void } | undefined
    let debug: ReturnType<typeof vi.spyOn>
    let warn: ReturnType<typeof vi.spyOn>

    const settle = () => new Promise(resolve => setTimeout(resolve, 0))

    const requests = async (actionId: string) => {
        await settle()
        return pending.filter(p => p.body.actionId === actionId)
    }

    beforeEach(async () => {
        const actual = await vi.importActual<typeof import('@application/HttpService.ts')>('@application/HttpService.ts')
        runAction.mockReset()
        runAction.mockImplementation((...args: unknown[]) =>
            (actual.httpService.runAction as (...a: unknown[]) => Promise<void>)(...args))
        pending = []
        toasts = []
        clearStructureCache()
        mateuApiClient.axiosInstance.defaults.adapter = (config: InternalAxiosRequestConfig) =>
            new Promise((resolve, reject) => pending.push({
                body: JSON.parse(String(config.data)),
                url: String(config.url),
                answer: data => resolve({ data, status: 200, statusText: 'OK',
                    headers: { 'content-type': 'application/json' }, config, request: {} }),
                // the Java adapters answer Mateu's own refusal with the plain text "Forbidden"
                fail: (status, data = 'Forbidden') => reject(new AxiosError('Request failed with status code ' + status,
                    AxiosError.ERR_BAD_REQUEST, config, {}, { data, status, statusText: '',
                        headers: new AxiosHeaders(), config })),
            }))
        setNotifier({ show: (message: ToastMessage) => { toasts.push(message) } })
        debug = vi.spyOn(console, 'debug').mockImplementation(() => undefined)
        warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    })

    afterEach(() => {
        subscription?.unsubscribe()
        debug.mockRestore()
        warn.mockRestore()
    })

    /** The ux of the route, its fragments applied as ConnectedElement would; seeded when `cached`. */
    const openPage = (cached: ServerSideComponent | undefined) => {
        const key = structureCacheKey({ baseUrl: PAGE.baseUrl, consumedRoute: '', route: PAGE.route,
            serverSideType: undefined, initialState: undefined })
        if (cached) putCachedStructure(key, cached, 'old-hash')
        const ux = new MateuUx()
        ux.id = PAGE.id
        ux.baseUrl = PAGE.baseUrl
        ux.route = PAGE.route
        ux.consumedRoute = ''
        subscription = upstream.subscribe(message => {
            if (message.fragment?.targetComponentId === PAGE.id) ux.applyFragment(message.fragment)
        })
        ;(ux as any).updated(new Map([['route', undefined]]))
        const list = document.createElement('div')
        const outcome = { cancelled: 0, succeeded: 0, failed: 0 }
        list.addEventListener('backend-cancelled-event', () => outcome.cancelled++)
        list.addEventListener('backend-succeeded-event', () => outcome.succeeded++)
        list.addEventListener('backend-failed-event', () => outcome.failed++)
        // what the app's mateu-api-caller would toast: the failure each backend-failed-event carries
        for (const target of [ux as unknown as HTMLElement, list]) {
            target.addEventListener('backend-failed-event', (e: Event) => {
                toasts.push({ text: (e as CustomEvent).detail?.failure?.message } as ToastMessage)
            })
        }
        return { ux, list, outcome, key }
    }

    it('the old app\'s search refused while the seed is on screen: no toast, the cache goes, and the request dies once the server replaces the screen', async () => {
        const { ux, list, outcome, key } = openPage(listing(OLD_SST))
        expect((ux.fragment?.component as ServerSideComponent).serverSideType).toBe(OLD_SST) // the seed
        // the cached listing's OnLoad search, with the type of the app that cached it
        ux.manageActionEvent(searchFrom(list, OLD_SST))
        const [search] = await requests('search')
        search.fail(403)
        await settle()
        expect(toasts).toEqual([])
        expect(getCachedStructure(key)).toBeUndefined()   // dropped, not just hidden

        // the server's answer for the route: the NEW app's listing
        const [load] = await requests('')
        load.answer(routeLoadAnswer(NEW_SST))
        await settle()

        expect((ux.fragment?.component as ServerSideComponent).serverSideType).toBe(NEW_SST)
        expect(toasts).toEqual([])
        expect(outcome).toEqual({ cancelled: 1, succeeded: 0, failed: 0 })
        expect(await requests('search')).toHaveLength(1)   // not re-sent: its listing is gone
    })

    it('a refusal for a seed the server CONFIRMS is asked once more; only a second refusal is told', async () => {
        const { ux, list, outcome } = openPage(listing(NEW_SST))
        ux.manageActionEvent(searchFrom(list, NEW_SST))
        ;(await requests('search'))[0].fail(403)
        await settle()
        expect(toasts).toEqual([])

        // the same structure comes back: the screen on show was right
        ;(await requests(''))[0].answer(routeLoadAnswer(NEW_SST))
        await settle()
        const searches = await requests('search')
        expect(searches).toHaveLength(2)

        searches[1].fail(403)   // a real refusal this time
        await settle()
        expect(toasts.map(t => t.text)).toEqual(['You are not allowed to do this.'])
        expect(outcome.failed).toBe(1)
    })

    it('the seeded screen\'s own route load refused: asked again at once, without the cached ETag', async () => {
        const { ux } = openPage(listing(OLD_SST))
        const [first] = await requests('')
        expect(first.body.knownStructureHash).toBe('old-hash')
        first.fail(404, { messages: [] })
        await settle()

        const loads = await requests('')
        expect(loads).toHaveLength(2)
        expect(loads[1].body.knownStructureHash).toBeUndefined()
        loads[1].answer(routeLoadAnswer(NEW_SST))
        await settle()
        expect(toasts).toEqual([])
        expect((ux.fragment?.component as ServerSideComponent).serverSideType).toBe(NEW_SST)
    })

    it('a screen the server sent (no seed) is told a refusal at once, as always', async () => {
        const { ux, list, outcome } = openPage(undefined)
        ;(await requests(''))[0].answer(routeLoadAnswer(NEW_SST))
        await settle()
        ux.manageActionEvent(searchFrom(list, NEW_SST))
        ;(await requests('search'))[0].fail(403)
        await settle()
        expect(toasts.map(t => t.text)).toEqual(['You are not allowed to do this.'])
        expect(outcome.failed).toBe(1)
        expect(await requests('search')).toHaveLength(1)
    })
})
