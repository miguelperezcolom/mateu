// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const runAction = vi.fn()
vi.mock('@application/service', () => ({ service: { runAction: (...args: unknown[]) => runAction(...args) } }))
vi.mock('@application/SSEService.ts', () => ({ sseService: { runAction: (...args: unknown[]) => runAction(...args) } }))

import { MateuUx } from './mateu-ux.ts'
import { actionIsForCurrentView, uxIdentity } from './staleViewGuard.ts'
import { putCachedStructure, structureCacheKey } from '@infra/routeStructureCache.ts'
import { ComponentType } from '@mateu/shared/apiClients/dtos/ComponentType'
import { UIFragmentAction } from '@mateu/shared/apiClients/dtos/UIFragmentAction.ts'
import UIFragment from '@mateu/shared/apiClients/dtos/UIFragment'
import ServerSideComponent from '@mateu/shared/apiClients/dtos/ServerSideComponent.ts'
import { mateuApiClient } from '@infra/http/AxiosMateuApiClient.ts'
import { upstream } from '@domain/state'
import Message from '@domain/Message'
import { setNotifier, ToastMessage } from '@application/Notifier.ts'
import { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios'

// The two pages of the live report (ec1 control plane, HAMBURGER_SECTIONS, one remote per section):
// a front-office integration listing served by /_integrations, then the registration rules listing
// served by /_registration-rules, both shown through the SAME content mateu-ux (Lit reuses the
// element and re-binds its id, baseUrl and route).
const A = { id: 'ux__integrations_frontoffice_FrontOfficeIntegrationCrud', baseUrl: '/_integrations',
    route: '/integrations/frontoffice', sst: 'io.mateu.ecdemo1.integrations.ui.pages.FrontOfficeIntegrationCrud' }
const B = { id: 'ux__registro_reglas_RuleCrud', baseUrl: '/_registration-rules',
    route: '/registro/reglas', sst: 'io.mateu.ecdemo1.registration.infra.in.ui.pages.RuleCrud' }

const listing = (sst: string): ServerSideComponent => ({
    id: 'list',
    type: ComponentType.ServerSide,
    serverSideType: sst,
    children: [],
}) as unknown as ServerSideComponent

const routeLoadAnswer = (target: string, sst: string): UIFragment => ({
    targetComponentId: target,
    action: UIFragmentAction.Replace,
    component: listing(sst),
    state: {},
    data: {},
}) as unknown as UIFragment

/** What a listing's mateu-component sends up when its OnLoad trigger (or the user) asks for rows. */
const searchFrom = (initiator: HTMLElement, page: { route: string, sst: string }) =>
    new CustomEvent('server-side-action-requested', {
        detail: {
            route: page.route, consumedRoute: '', actionId: 'search', serverSideType: page.sst,
            initiatorComponentId: 'list', initiator, componentState: {}, parameters: {},
        },
    })

const newUx = (page: { id: string, baseUrl: string, route: string, sst: string }) => {
    const ux = new MateuUx()
    ux.id = page.id
    ux.baseUrl = page.baseUrl
    ux.route = page.route
    ux.serverSideType = page.sst
    return ux
}

/** Lit re-binding the reused element to the next page. */
const navigate = (ux: MateuUx, page: { id: string, baseUrl: string, route: string, sst: string }) => {
    ux.id = page.id
    ux.baseUrl = page.baseUrl
    ux.route = page.route
    ux.serverSideType = page.sst
}

/** [baseUrl, actionId, serverSideType] of every request sent. */
const sent = () => runAction.mock.calls.map(c => [c[1], c[4], c[7]])

describe('navigating between pages of two remotes through one reused mateu-ux', () => {

    beforeEach(() => runAction.mockReset())

    it('sends the second page\'s search with the second page\'s serverSideType, and nothing of the first page to the second server', () => {
        const ux = newUx(A)
        const listA = document.createElement('div')
        const listB = document.createElement('div')

        ux.applyFragment(routeLoadAnswer(A.id, A.sst))
        ux.manageActionEvent(searchFrom(listA, A))

        navigate(ux, B)
        // the outgoing listing fires once more (its OnLoad, a poll…) before the new page lands
        const cancelled = vi.fn()
        listA.addEventListener('backend-cancelled-event', cancelled)
        ux.manageActionEvent(searchFrom(listA, A))

        ux.applyFragment(routeLoadAnswer(B.id, B.sst))
        ux.manageActionEvent(searchFrom(listB, B))

        expect(sent()).toEqual([
            ['/_integrations', 'search', A.sst],
            ['/_registration-rules', 'search', B.sst],
        ])
        expect(cancelled).toHaveBeenCalledTimes(1)
        expect(sent().filter(([url, , sst]) => url === B.baseUrl && sst !== B.sst)).toEqual([])
    })

    it('drops the search of a listing seeded from the structure cache once the element moved on to another remote', () => {
        // The live sequence: the first page's listing had been visited before, so its structure is
        // in the client cache; re-entering its route paints the cached listing at once, whose
        // OnLoad search only leaves a tick later — by when the element already belongs to page B.
        putCachedStructure(structureCacheKey({ baseUrl: A.baseUrl, consumedRoute: '', route: A.route,
            serverSideType: A.sst, initialState: undefined }), listing(A.sst), undefined)
        const ux = newUx(A)
        ux.consumedRoute = ''
        ;(ux as any).updated(new Map([['route', undefined]]))
        expect(ux.fragment?.component).toBeDefined() // the seed is on screen

        // page B not visited yet in this session: nothing of its own to seed (the structure cache
        // is module-wide, so a route the test above did not visit)
        const B2 = { ...B, id: B.id + '_2', route: B.route + '/2' }
        navigate(ux, B2)
        ;(ux as any).updated(new Map([['route', A.route]]))
        ux.manageActionEvent(searchFrom(document.createElement('div'), A))

        expect(sent()).toEqual([
            ['/_integrations', '', A.sst],        // page A's route load
            ['/_registration-rules', '', B.sst],  // page B's route load
        ])
    })

    it('keeps sending the actions of the page on screen', () => {
        const ux = newUx(A)
        ux.applyFragment(routeLoadAnswer(A.id, A.sst))
        // a re-render that re-binds the very same identity is not a navigation
        navigate(ux, A)
        ux.manageActionEvent(searchFrom(document.createElement('div'), A))
        expect(sent()).toEqual([['/_integrations', 'search', A.sst]])
    })
})

describe('actionIsForCurrentView', () => {
    it('always lets the route load through', () => {
        expect(actionIsForCurrentView(uxIdentity('a', '/x'), uxIdentity('b', '/y'), '')).toBe(true)
    })
    it('lets anything through before any content was rendered', () => {
        expect(actionIsForCurrentView(undefined, uxIdentity('b', '/y'), 'search')).toBe(true)
    })
    it('refuses an action of content produced for another identity', () => {
        expect(actionIsForCurrentView(uxIdentity('a', '/x'), uxIdentity('a', '/y'), 'search')).toBe(false)
        expect(actionIsForCurrentView(uxIdentity('a', '/x'), uxIdentity('b', '/x'), 'search')).toBe(false)
        expect(actionIsForCurrentView(uxIdentity('a', '/x'), uxIdentity('a', '/x'), 'search')).toBe(true)
    })
})

// ---------------------------------------------------------------------------------------------
// The answers: a request sent while its view was on screen and answered after the user moved on.
// The real HttpService and transport run here; only the network (the axios adapter) is faked, so
// each request can be answered — or failed — at the moment the test decides.
// ---------------------------------------------------------------------------------------------

type Pending = {
    body: { actionId: string, serverSideType: string, initiatorComponentId: string },
    url: string,
    answer: (data: unknown) => void,
    fail: (status: number) => void,
}

const PAGE_A = A
const PAGE_B = B

describe('an answer that arrives for a view no longer on screen', () => {

    let pending: Pending[] = []
    let toasts: ToastMessage[] = []
    let published: Message[] = []
    let sessionExpired = 0
    const onSessionExpired = () => { sessionExpired++ }
    let subscription: { unsubscribe(): void } | undefined
    let debug: ReturnType<typeof vi.spyOn>

    beforeEach(async () => {
        const actual = await vi.importActual<typeof import('@application/HttpService.ts')>('@application/HttpService.ts')
        runAction.mockReset()
        runAction.mockImplementation((...args: unknown[]) =>
            (actual.httpService.runAction as (...a: unknown[]) => Promise<void>)(...args))
        pending = []
        toasts = []
        published = []
        sessionExpired = 0
        mateuApiClient.axiosInstance.defaults.adapter = (config: InternalAxiosRequestConfig) =>
            new Promise((resolve, reject) => pending.push({
                body: JSON.parse(String(config.data)),
                url: String(config.url),
                answer: data => resolve({ data, status: 200, statusText: 'OK',
                    headers: { 'content-type': 'application/json' }, config, request: {} }),
                fail: status => reject(new AxiosError('Request failed with status code ' + status,
                    AxiosError.ERR_BAD_RESPONSE, config, {}, { data: {}, status, statusText: '',
                        headers: new AxiosHeaders(), config })),
            }))
        setNotifier({ show: (message: ToastMessage) => { toasts.push(message) } })
        subscription = upstream.subscribe(message => { published.push(message) })
        document.addEventListener('mateu-session-expired', onSessionExpired)
        debug = vi.spyOn(console, 'debug').mockImplementation(() => undefined)
    })

    afterEach(() => {
        subscription?.unsubscribe()
        document.removeEventListener('mateu-session-expired', onSessionExpired)
        debug.mockRestore()
    })

    const settle = () => new Promise(resolve => setTimeout(resolve, 0))

    const request = async (actionId: string, baseUrl: string) => {
        await settle()
        const found = pending.find(p => p.body.actionId === actionId && p.url.startsWith(baseUrl))
        if (!found) throw new Error('no request ' + actionId + ' to ' + baseUrl + ' in ' + JSON.stringify(pending.map(p => [p.url, p.body.actionId])))
        return found
    }

    /** What the listing's search answers: its rows, and a toast. */
    const searchAnswer = (sst: string) => ({
        fragments: [{ targetComponentId: 'list', action: UIFragmentAction.Replace, component: listing(sst),
            state: {}, data: { rows: ['row of ' + sst] } }],
        messages: [{ text: 'Loaded ' + sst, variant: 'success', position: 'bottom-end', duration: 1000 }],
        commands: [{ targetComponentId: 'list', type: 'SetWindowTitle', data: 'from ' + sst }],
        appState: { from: sst },
    })

    /** The ux on page A with its listing; the listing's search in flight. */
    const onPageAWithSearchInFlight = async () => {
        const ux = newUx(A)
        ;(ux as any).updated(new Map([['route', undefined]]))
        ;(await request('', A.baseUrl)).answer({ fragments: [routeLoadAnswer(A.id, A.sst)] })
        await settle()
        const list = document.createElement('div')
        const outcome = { cancelled: 0, succeeded: 0, failed: 0 }
        list.addEventListener('backend-cancelled-event', () => outcome.cancelled++)
        list.addEventListener('backend-succeeded-event', () => outcome.succeeded++)
        list.addEventListener('backend-failed-event', () => outcome.failed++)
        ux.manageActionEvent(searchFrom(list, A))
        published = []
        toasts = []
        return { ux, list, outcome, search: await request('search', A.baseUrl) }
    }

    const nothingOfAApplied = () => {
        expect(published.filter(m => m.fragment || m.command)).toEqual([])
        expect(toasts).toEqual([])
    }

    it('does not apply a search answered after navigating to another remote, and releases the listing', async () => {
        const { ux, outcome, search } = await onPageAWithSearchInFlight()
        navigate(ux, B)
        ;(ux as any).updated(new Map([['route', A.route]]))

        search.answer(searchAnswer(A.sst))
        await settle()

        nothingOfAApplied()
        expect(outcome).toEqual({ cancelled: 1, succeeded: 0, failed: 0 })
        expect(debug).toHaveBeenCalled()
    })

    it('shows no error for a search that failed after navigating away', async () => {
        const { ux, outcome, search } = await onPageAWithSearchInFlight()
        navigate(ux, B)
        ;(ux as any).updated(new Map([['route', A.route]]))

        search.fail(500)
        await settle()

        nothingOfAApplied()
        expect(outcome).toEqual({ cancelled: 1, succeeded: 0, failed: 0 })
    })

    it('does not ask the user to log in again for a 401 of a view no longer on screen', async () => {
        const { ux, outcome, search } = await onPageAWithSearchInFlight()
        navigate(ux, B)
        ;(ux as any).updated(new Map([['route', A.route]]))

        search.fail(401)
        await settle()

        expect(sessionExpired).toBe(0)
        nothingOfAApplied()
        expect(outcome).toEqual({ cancelled: 1, succeeded: 0, failed: 0 })
    })

    it('also drops it after moving to another route of the same ux, even when coming back to the first one', async () => {
        const { ux, search } = await onPageAWithSearchInFlight()
        const detail = { ...A, route: A.route + '/42' }
        navigate(ux, detail)
        ;(ux as any).updated(new Map([['route', A.route]]))
        navigate(ux, A)
        ;(ux as any).updated(new Map([['route', detail.route]]))

        search.answer(searchAnswer(A.sst))
        await settle()

        nothingOfAApplied()
    })

    it('ignores a route load superseded by a newer one, even of the same route', async () => {
        // a route not visited by the tests above (the structure cache would seed it)
        const A = { ...PAGE_A, id: PAGE_A.id + '_3', route: PAGE_A.route + '/3' }
        const B = { ...PAGE_B, id: PAGE_B.id + '_3', route: PAGE_B.route + '/3' }
        const ux = newUx(A)
        ;(ux as any).updated(new Map([['route', undefined]]))
        const firstLoad = await request('', A.baseUrl)
        navigate(ux, B)
        ;(ux as any).updated(new Map([['route', A.route]]))
        // the user comes back and the route reloads (a new instant): two newer loads of A's route
        navigate(ux, A)
        ;(ux as any).updated(new Map([['route', B.route]]))
        ux.instant = 'reload'
        ;(ux as any).updated(new Map([['instant', undefined]]))
        await settle()
        const loadsOfA = pending.filter(p => p.body.actionId === '' && p.url.startsWith(A.baseUrl))
        expect(loadsOfA).toHaveLength(3)

        const failedEvents = vi.fn()
        ux.addEventListener('backend-call-failed', failedEvents)
        published = []
        firstLoad.answer({ fragments: [routeLoadAnswer(A.id, 'first load')],
            messages: [{ text: 'from the first load', variant: 'error' }] })
        loadsOfA[1].fail(500)
        await settle()
        expect(published).toEqual([])
        expect(toasts).toEqual([])
        expect(failedEvents).not.toHaveBeenCalled() // which would paint "Not found"

        loadsOfA[2].answer({ fragments: [routeLoadAnswer(A.id, A.sst)] })
        await settle()
        expect(published.map(m => (m.fragment?.component as ServerSideComponent | undefined)?.serverSideType))
            .toEqual([A.sst])
    })

    it('keeps applying the answers of the view on screen', async () => {
        const { outcome, search } = await onPageAWithSearchInFlight()

        search.answer(searchAnswer(A.sst))
        await settle()

        expect(published.filter(m => m.fragment).map(m => m.fragment?.targetComponentId)).toEqual(['list'])
        expect(published.filter(m => m.command)).toHaveLength(1)
        expect(toasts.map(t => t.text)).toEqual(['Loaded ' + A.sst])
        expect(outcome).toEqual({ cancelled: 0, succeeded: 1, failed: 0 })
    })

    it('keeps reporting the failures of the view on screen', async () => {
        const { outcome, search } = await onPageAWithSearchInFlight()

        search.fail(400)
        await settle()

        expect(outcome).toEqual({ cancelled: 0, succeeded: 0, failed: 1 })
    })
})
