// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { configureAuthToken, resetAuthTokenConfig, setAuthToken } from '@infra/http/authToken.ts'
import { handleSessionExpired, onSessionExpired } from '@infra/http/sessionGuard.ts'
import { resetSignIn, signInGate, signOutAvailable } from './signIn'
import { writeAuthSession } from './authSession'
import { resetSignInFlow, setSignInEnv } from './signInFlow'

const meta = (auth: object) => {
    const m = document.createElement('meta')
    m.name = 'mateu-auth'
    m.content = JSON.stringify(auth)
    document.head.replaceChildren(m)
}
const auth = { loginOnStart: false, providers: [{ id: 'acme', type: 'oidc', issuer: 'https://idp.acme', clientId: 'ui' }] }

afterEach(() => {
    resetSignIn()
    resetSignInFlow()
    resetAuthTokenConfig()
    onSessionExpired(undefined)
    document.head.innerHTML = ''
    localStorage.clear()
})

describe('signIn (the eager entry)', () => {
    it('no meta: no gate, the app loads as before', () => {
        expect(signInGate('')).toBeNull()
        expect(signOutAvailable()).toBe(false)
    })

    it('an app that supplies its own token keeps its own sign-in', () => {
        meta(auth)
        configureAuthToken({ provider: () => 'theirs' })
        expect(signInGate('')).toBeNull()
    })

    it('with the meta: boot runs the flow; Sign out shows once there is a session', async () => {
        meta(auth)
        const gate = signInGate('')
        expect(gate).not.toBeNull()
        expect(await gate).toBe(true)
        expect(signOutAvailable()).toBe(false)
        setAuthToken('t')
        writeAuthSession({ providerId: 'acme', kind: 'oidc' })
        expect(signOutAvailable()).toBe(true)
    })

    it('a 401 nobody handles reaches the built-in; an app handler still wins', async () => {
        meta({ ...auth, providers: [...auth.providers, { id: 'gh', type: 'redirect', url: '/gh' }] })
        const choose = vi.fn().mockResolvedValue(null)
        setSignInEnv({ choose })
        await signInGate('')
        const original = new Error('401')
        await expect(handleSessionExpired(original, vi.fn())).rejects.toBe(original)
        expect(choose).toHaveBeenCalledWith(expect.objectContaining({ cancellable: true }))

        choose.mockClear()
        onSessionExpired((context) => context.retry())
        await expect(handleSessionExpired(original, vi.fn().mockResolvedValue('ok'))).resolves.toBe('ok')
        expect(choose).not.toHaveBeenCalled()
    })

    it('a claimed mateu-session-expired event also wins over the built-in', async () => {
        meta(auth)
        const choose = vi.fn()
        setSignInEnv({ choose })
        await signInGate('')
        const claim = (e: Event) => { e.preventDefault(); (e as CustomEvent).detail.giveUp() }
        document.addEventListener('mateu-session-expired', claim)
        await expect(handleSessionExpired(new Error('401'), vi.fn())).rejects.toThrow('401')
        document.removeEventListener('mateu-session-expired', claim)
        expect(choose).not.toHaveBeenCalled()
    })
})
