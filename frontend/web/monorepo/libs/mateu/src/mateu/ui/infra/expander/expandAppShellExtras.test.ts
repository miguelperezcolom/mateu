// The browser expander reads the E2 keys of a `type: AppShell` like the server's AppShellExtrasMapper
// (fixture mount-home/e2-shell/specs/ui/shell.yaml, AppShellExtrasYamlSyncTest).
import { describe, expect, it } from 'vitest'
import { expandAppShell, idleSessionOf, shellShortcuts } from '@infra/expander/expandDefinition'

describe('client-side expander — app shortcuts, header values, idle warning', () => {
    it('keeps the shortcuts that have a key or code AND somewhere to go', () => {
        expect(shellShortcuts([
            { key: 'F9', route: 'guests', label: 'Guests', code: 'GST' },
            { code: 'HOME', route: 'home' },
            { label: 'nothing to press', route: 'x' },
        ])).toEqual([
            { key: 'f9', label: 'Guests', route: '/guests', actionId: null, code: 'GST' },
            { key: null, label: 'Home', route: '/home', actionId: null, code: 'HOME' },
        ])
    })

    it('turns the idle keys into the wire idle session, clamped like the server', () => {
        expect(idleSessionOf({ type: 'AppShell', idleTimeoutMinutes: 15, idleWarningSeconds: 90, idleSignOutUrl: '/logout' }))
            .toEqual({ timeoutSeconds: 900, warningSeconds: 90, signOutUrl: '/logout', keepAliveActionId: null })
        expect(idleSessionOf({ type: 'AppShell' })).toBeNull()
    })

    it('carries the header values and never a live stream (a bundle has no server)', () => {
        const app = (expandAppShell({
            type: 'AppShell', title: 'E2', liveUpdates: true,
            headerValues: [{ id: 'businessDate', label: 'Business date', value: '12 Oct 2026' }],
            menu: [{ type: 'RouteLink', label: 'Home', route: 'home' }],
        }).fragments![0] as any).component.metadata
        expect(app.headerValues).toEqual([{ id: 'businessDate', label: 'Business date', value: '12 Oct 2026' }])
        expect(app.liveUpdates).toBe(false)
    })
})
