// @vitest-environment jsdom
// rc.1 re-verification of GA review 2:
//  - N-8: the leave paths without a prompt — here the agent's navigation with no shell around, run
//    through the REAL rowRoute/dirtyGuard (agentEvents.test.ts mocks rowRoute away).
//  - N-14: a same-mount micro frontend under a public base is taken for another mount
//    (embeddingMountOf compares the server-named base `/admin` with the page's `/crm/admin`).
//    NOT FIXED at rc.1: pinned with it.fails.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyAgentEvent } from './agentEvents'
import { dirtyGuard } from './dirtyGuard'
import { embeddingMountOf } from './rowRoute'
import { setPublicBase } from '@infra/http/publicBase.ts'

afterEach(() => {
    dirtyGuard.markClean()
    vi.restoreAllMocks()
    document.body.innerHTML = ''
    setPublicBase('')
})

describe('rc.1 re-verify N-8: an agent navigation outside a shell asks about unsaved changes', () => {
    it('«stay» navigates nowhere; «leave» navigates', () => {
        const origin = document.createElement('div')
        document.body.appendChild(origin)
        const navs: string[] = []
        document.addEventListener('navigate-to-requested', (e) => navs.push((e as CustomEvent).detail.route))
        dirtyGuard.markDirty()
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
        applyAgentEvent(origin, 'navigation-requested', { route: '/orders' })
        expect(confirm).toHaveBeenCalledTimes(1)
        expect(navs).toEqual([])
        confirm.mockReturnValue(true)
        applyAgentEvent(origin, 'navigation-requested', { route: '/orders' })
        expect(navs).toEqual(['/orders'])
    })
})

describe('rc.1 re-verify N-14: a same-mount island under a public base', () => {
    const island = (pageBase: string, islandBase: string) => {
        const ui = document.createElement('mateu-ui') as HTMLElement & { baseUrl?: string }
        ui.baseUrl = pageBase
        const ux = document.createElement('mateu-ux') as HTMLElement & { baseUrl?: string }
        ux.setAttribute('micro-frontend', '')
        ux.baseUrl = islandBase
        const button = document.createElement('button')
        ux.appendChild(button)
        ui.appendChild(ux)
        document.body.appendChild(ui)
        return button
    }
    it('(control) without a public base the same mount is recognised', () => {
        expect(embeddingMountOf(island('/admin', '/admin'))).toBeUndefined()
    })
    it.fails('under /crm the island of the page\'s own mount is not another mount', () => {
        setPublicBase('/crm')
        expect(embeddingMountOf(island('/crm/admin', '/admin'))).toBeUndefined()
    })
})
