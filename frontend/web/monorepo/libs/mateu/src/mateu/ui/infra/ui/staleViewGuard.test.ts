// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

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
