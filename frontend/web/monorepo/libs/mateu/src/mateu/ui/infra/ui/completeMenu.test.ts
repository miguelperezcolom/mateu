import { describe, expect, it, vi, beforeEach } from 'vitest'
import ConnectedElement from './ConnectedElement'
import { ComponentType } from '@mateu/shared/apiClients/dtos/ComponentType'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import { AppVariant } from '@mateu/shared/apiClients/dtos/componentmetadata/AppVariant'

const published: unknown[] = []
vi.mock('@domain/state', () => ({
    upstream: { next: (message: unknown) => published.push(message), subscribe: () => ({ unsubscribe: () => {} }) },
}))

const runAction = vi.fn()
vi.mock('@infra/http/AxiosMateuApiClient.ts', () => ({
    mateuApiClient: { runAction: (...args: unknown[]) => runAction(...args) },
}))

/**
 * Expanding a shell's remote menus, and what it is not allowed to cost.
 *
 * <p>The shape this pins comes from a measured page load. Entering
 * /workflow/definitions by URL, behind a console fronting six remote menus, ran the page's
 * three-request chain — route, page, listing search — THREE times: once for the first paint, and
 * again for each time the app component was replaced. One of those replacements was this: the menu
 * arriving. applyFragment answers a ClientSide component by setting
 * `this.component.children = [component]`, so republishing the app to update its menu threw away
 * everything the router had mounted underneath.
 */
const elementWith = (menu: unknown[]) => {
    const app = { type: ComponentMetadataType.App, menu, variant: AppVariant.MENU_ON_LEFT } as any
    const clientSideComponent = { id: 'app', type: ComponentType.ClientSide, metadata: app, children: [] } as any
    const element = {
        id: 'target',
        callbackToken: 'token',
        component: clientSideComponent,
        requestUpdate: vi.fn(),
        completeMenu: (ConnectedElement.prototype as any).completeMenu,
        getRemoteMenus: (ConnectedElement.prototype as any).getRemoteMenus,
        updateMenu: (ConnectedElement.prototype as any).updateMenu,
        changeBaseUrl: (ConnectedElement.prototype as any).changeBaseUrl,
    } as any
    return { element, clientSideComponent, app }
}

const remote = (baseUrl: string, label: string) =>
    ({ remote: true, baseUrl, route: '', label, params: undefined, serverSideType: '' })

const remoteAnswer = (baseUrl: string, route: string, options: unknown[]) => ({
    fragments: [{
        targetComponentId: baseUrl + '#' + route,
        component: {
            type: ComponentType.ClientSide,
            metadata: { type: ComponentMetadataType.App, menu: options, route: '', serverSideType: 'Home' },
        },
    }],
})

const appFragment = (component: unknown) => ({ component }) as any

describe('completeMenu', () => {

    beforeEach(() => {
        published.length = 0
        runAction.mockReset()
    })

    it('asks a remote menu that sits INSIDE a group, not just the ones on the bar', async () => {
        // The regression this fixes. A shell that groups its remote sections under one entry —
        // "Admin", holding Workflow, Forms and Worker — rendered the group with the labels the
        // shell had written and nothing under them: the resolver only ever looked at the top
        // level, so nobody asked those pods for their screens. It reads as three empty services.
        const { element, clientSideComponent } = elementWith([
            { label: 'Admin', remote: false, submenus: [remote('/_workflow', 'Workflow')] },
            remote('/_booking', 'Booking'),
        ])
        runAction.mockImplementation((baseUrl: string) =>
            Promise.resolve(remoteAnswer(baseUrl, '', [{ label: 'Processes', route: '/processes' }])))

        element.completeMenu(appFragment(clientSideComponent))
        await Promise.resolve(); await Promise.resolve()

        const asked = runAction.mock.calls.map((c: unknown[]) => c[0]).sort()
        expect(asked).toEqual(['/_booking', '/_workflow'])
    })

    it('puts a nested remote answer under its group, leaving the rest of the bar alone', async () => {
        const { element, clientSideComponent } = elementWith([
            { label: 'Admin', remote: false, submenus: [remote('/_workflow', 'Workflow')] },
            { label: 'Contenidos', remote: false, submenus: [{ label: 'Contents', route: '/contents' }] },
        ])
        runAction.mockImplementation((baseUrl: string) =>
            Promise.resolve(remoteAnswer(baseUrl, '', [{ label: 'Workflow', route: '', submenus: [
                { label: 'Processes', route: '/processes' },
            ] }])))

        element.completeMenu(appFragment(clientSideComponent))
        await Promise.resolve(); await Promise.resolve()

        const menu = (clientSideComponent.metadata as any).menu
        expect(menu.map((o: any) => o.label)).toEqual(['Admin', 'Contenidos'])
        // The group now holds what the pod answered, not the placeholder label the shell wrote.
        expect(menu[0].submenus.map((o: any) => o.label)).toEqual(['Workflow'])
        expect(menu[0].submenus[0].submenus.map((o: any) => o.label)).toEqual(['Processes'])
        // An ordinary group with no remote in it is untouched.
        expect(menu[1].submenus.map((o: any) => o.label)).toEqual(['Contents'])
    })

    it('asks each remote menu for its app once', async () => {
        const { element, clientSideComponent } = elementWith([
            remote('/_workflow', 'Workflow'), remote('/_booking', 'Booking'),
        ])
        runAction.mockImplementation((baseUrl: string) =>
            Promise.resolve(remoteAnswer(baseUrl, '', [{ label: 'Processes', route: '/processes' }])))

        element.completeMenu(appFragment(clientSideComponent))
        await Promise.resolve(); await Promise.resolve()

        expect(runAction).toHaveBeenCalledTimes(2)
    })

    /**
     * The assertion this file exists for, and it is a negative one: nothing goes upstream. A
     * fragment published here reaches applyFragment as a ClientSide component, whose branch
     * replaces the host's children — the routed page included.
     */
    it('does not republish the app component, which would rebuild the routed page', async () => {
        const { element, clientSideComponent } = elementWith([remote('/_workflow', 'Workflow')])
        runAction.mockImplementation((baseUrl: string) =>
            Promise.resolve(remoteAnswer(baseUrl, '', [{ label: 'Processes', route: '/processes' }])))

        element.completeMenu(appFragment(clientSideComponent))
        await Promise.resolve(); await Promise.resolve()

        expect(published).toHaveLength(0)
    })

    it('hands the renderer a new metadata object, so the menu actually repaints', async () => {
        const { element, clientSideComponent, app } = elementWith([remote('/_workflow', 'Workflow')])
        runAction.mockImplementation((baseUrl: string) =>
            Promise.resolve(remoteAnswer(baseUrl, '', [{ label: 'Processes', route: '/processes' }])))

        element.completeMenu(appFragment(clientSideComponent))
        await Promise.resolve(); await Promise.resolve()

        // A new reference: mutating in place would leave the child element holding the same
        // object and Lit would repaint nothing.
        expect(clientSideComponent.metadata).not.toBe(app)
        expect(clientSideComponent.metadata.menu).toEqual([{ label: 'Processes', route: '/processes',
            baseUrl: '/_workflow', consumedRoute: '', serverSideType: 'Home', uriPrefix: '' }])
        expect(clientSideComponent.metadata.variant).toBe(AppVariant.MENU_ON_TOP)
        expect(element.requestUpdate).toHaveBeenCalled()
    })

    it('leaves the mounted children alone', async () => {
        const { element, clientSideComponent } = elementWith([remote('/_workflow', 'Workflow')])
        const mounted = [{ id: 'the-routed-page' }]
        clientSideComponent.children = mounted
        runAction.mockImplementation((baseUrl: string) =>
            Promise.resolve(remoteAnswer(baseUrl, '', [{ label: 'Processes', route: '/processes' }])))

        element.completeMenu(appFragment(clientSideComponent))
        await Promise.resolve(); await Promise.resolve()

        expect(clientSideComponent.children).toBe(mounted)
    })

    it('does nothing at all when there is no remote menu to expand', async () => {
        const { element, clientSideComponent } = elementWith([{ label: 'Local', route: '/local' }])

        element.completeMenu(appFragment(clientSideComponent))
        await Promise.resolve()

        expect(runAction).not.toHaveBeenCalled()
        expect(published).toHaveLength(0)
        expect(element.requestUpdate).not.toHaveBeenCalled()
    })
})
