// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * The app-level extras the shell mounts from its updated(): app shortcuts (a key runs them, "?" lists
 * them, a screen's own shortcut wins, plain keys stand down while typing), the dirty guard before a
 * shortcut navigates, the idle-session warning, and nested MEDIATOR shells leaving all of it alone.
 */

const mocks = vi.hoisted(() => ({
    navigateToRoute: vi.fn(),
    dispatchAppHeaderAction: vi.fn(() => Promise.resolve()),
    syncLiveUpdates: vi.fn(),
}))
vi.mock('@infra/ui/rowRoute.ts', () => ({ navigateToRoute: mocks.navigateToRoute }))
vi.mock('@infra/ui/renderers/appHeaderActions.ts', () => ({ dispatchAppHeaderAction: mocks.dispatchAppHeaderAction }))
vi.mock('@infra/ui/liveUpdates.ts', () => ({ syncLiveUpdates: mocks.syncLiveUpdates }))

import * as extras from './appExtrasMount'
import { dirtyGuard as guard } from './dirtyGuard'

const shortcuts = [
    { key: 'f9', label: 'Reservations', route: '/reservations', code: 'RES' },
    { key: 'g', label: 'Guests', route: '/guests' },
    { key: 'alt+y', label: 'End of day', actionId: 'endOfDay', code: 'EOD' },
]

const host = (metadata: Record<string, unknown>) => {
    const el = document.createElement('div') as unknown as HTMLElement & { renderRoot: ParentNode, component: unknown, baseUrl?: string }
    el.attachShadow({ mode: 'open' })
    el.renderRoot = el.shadowRoot!
    el.component = { metadata: { type: 'App', serverSideType: 'com.example.App', ...metadata } }
    el.baseUrl = '/app'
    document.body.appendChild(el)
    return el
}

const press = (key: string, extra: KeyboardEventInit = {}, target: EventTarget = document.body) => {
    const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...extra })
    target.dispatchEvent(e)
    return e
}

afterEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
    vi.restoreAllMocks()
})

describe('app shortcuts', () => {
    it('a key runs its shortcut: a route navigates, an action goes on the app-level rail', async () => {
        const el = host({ shortcuts })
        extras.syncAppExtras(el)

        const e = press('F9')
        expect(e.defaultPrevented).toBe(true)
        expect(mocks.navigateToRoute).toHaveBeenCalledWith(el, '/reservations')

        press('y', { altKey: true, code: 'KeyY' })
        expect(mocks.dispatchAppHeaderAction).toHaveBeenCalledWith(expect.objectContaining({ serverSideType: 'com.example.App' }), el, 'endOfDay')
        expect(extras.activeAppShortcuts()).toHaveLength(3)
    })

    it('a key the screen already took (preventDefault) is not run again by the app', () => {
        extras.syncAppExtras(host({ shortcuts }))
        const onDoc = (e: KeyboardEvent) => e.preventDefault()
        document.addEventListener('keydown', onDoc)
        press('F9')
        document.removeEventListener('keydown', onDoc)
        expect(mocks.navigateToRoute).not.toHaveBeenCalled()
    })

    it('a plain-letter shortcut stands down while the user types in a field', () => {
        extras.syncAppExtras(host({ shortcuts }))
        const input = document.createElement('input')
        document.body.appendChild(input)
        input.focus()
        press('g', {}, input)
        expect(mocks.navigateToRoute).not.toHaveBeenCalled()
        input.blur()
        press('g')
        expect(mocks.navigateToRoute).toHaveBeenCalledWith(expect.anything(), '/guests')
    })

    it('a shortcut that navigates asks before leaving unsaved changes', () => {
        extras.syncAppExtras(host({ shortcuts }))
        guard.markDirty()
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
        press('F9')
        expect(confirm).toHaveBeenCalled()
        expect(mocks.navigateToRoute).not.toHaveBeenCalled()
        guard.markClean()
    })

    it('"?" opens the shortcuts list, mounted in the shell', async () => {
        const el = host({ shortcuts })
        extras.syncAppExtras(el)
        const help = el.shadowRoot!.querySelector('mateu-shortcuts-help') as HTMLElement & { open: boolean, shortcuts: unknown[], run: (s: unknown) => void, updateComplete: Promise<unknown> }
        expect(help).not.toBeNull()
        expect(help.shortcuts).toHaveLength(3)
        expect(press('?', { shiftKey: true }).defaultPrevented).toBe(true)
        expect(help.open).toBe(true)
        // picking a row in it runs the shortcut
        help.run(shortcuts[0])
        expect(mocks.navigateToRoute).toHaveBeenCalledWith(el, '/reservations')
    })

    it('an app without shortcuts takes the list down again', () => {
        const el = host({ shortcuts })
        extras.syncAppExtras(el)
        expect(el.shadowRoot!.querySelector('mateu-shortcuts-help')).not.toBeNull()
        el.component = { metadata: { type: 'App', shortcuts: [] } }
        extras.syncAppExtras(el)
        expect(el.shadowRoot!.querySelector('mateu-shortcuts-help')).toBeNull()
        press('F9')
        expect(mocks.navigateToRoute).not.toHaveBeenCalled()
    })

})

describe('ownership', () => {
    it('a nested MEDIATOR shell is skipped, and a second top shell does not steal a connected owner', () => {
        const mediator = host({ variant: 'MEDIATOR', shortcuts })
        extras.syncAppExtras(mediator)
        expect(mocks.syncLiveUpdates).not.toHaveBeenCalled()

        const top = host({ shortcuts })
        extras.syncAppExtras(top)
        const other = host({ shortcuts: [] })
        extras.syncAppExtras(other)
        expect(extras.activeAppShortcuts()).toHaveLength(3)
        expect(mocks.syncLiveUpdates).toHaveBeenCalledTimes(1)
        expect(mocks.syncLiveUpdates).toHaveBeenCalledWith(expect.objectContaining({ serverSideType: 'com.example.App' }), '/app')
    })
})

describe('the idle-session warning', () => {
    it('is mounted on the body when the app configures one, and removed when it stops', () => {
        const el = host({ idleSession: { timeoutSeconds: 600, warningSeconds: 60 } })
        extras.syncAppExtras(el)
        const idle = document.body.querySelector('mateu-idle-warning') as HTMLElement & { app: unknown, baseUrl: string }
        expect(idle).not.toBeNull()
        expect(idle.baseUrl).toBe('/app')
        expect((idle.app as { idleSession: { timeoutSeconds: number } }).idleSession.timeoutSeconds).toBe(600)

        el.component = { metadata: { type: 'App' } }
        extras.syncAppExtras(el)
        expect(document.body.querySelector('mateu-idle-warning')).toBeNull()
    })
})
