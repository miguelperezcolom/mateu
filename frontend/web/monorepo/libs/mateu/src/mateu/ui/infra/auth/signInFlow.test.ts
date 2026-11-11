// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAuthToken, resetAuthTokenConfig, setAuthToken } from '@infra/http/authToken.ts'
import { readAuthSession, readPendingSignIn, writeAuthSession, writePendingSignIn } from './authSession'
import { bootSignIn, reauthenticate, refresh, resetSignInFlow, setSignInEnv, signOut, SignInEnv } from './signInFlow'
import { parseSignInConfig, SignInConfig } from './signInConfig'

const ISSUER = 'https://idp.example/realms/acme'
const discovery = {
    issuer: ISSUER,
    authorization_endpoint: ISSUER + '/auth',
    token_endpoint: ISSUER + '/token',
    end_session_endpoint: ISSUER + '/logout',
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
const idToken = (claims: object) => 'h.' + Buffer.from(JSON.stringify(claims)).toString('base64url') + '.s'

const acme = { id: 'acme', type: 'oidc', label: 'Acme', issuer: ISSUER, clientId: 'ui' }
const github = { id: 'github', type: 'redirect', label: 'GitHub', icon: 'github', url: '/oauth2/authorization/github' }
const config = (...providers: object[]): SignInConfig => parseSignInConfig({ providers, logoutUrl: '/logout' })!

let href: string
let tokenAnswer: () => Response
let env: SignInEnv & { assign: ReturnType<typeof vi.fn>, replaceUrl: ReturnType<typeof vi.fn>, choose: ReturnType<typeof vi.fn>, fetch: ReturnType<typeof vi.fn> }

beforeEach(() => {
    href = 'https://app.example/orders/3?tab=2'
    tokenAnswer = () => json({ access_token: 'access-1', refresh_token: 'refresh-1', id_token: idToken({ nonce: 'no' }), expires_in: 300 })
    const fetchMock = vi.fn(async (url: string) => {
        if (url.endsWith('/.well-known/openid-configuration')) return json(discovery)
        if (url === discovery.token_endpoint) return tokenAnswer()
        return json({}, 404)
    })
    env = {
        href: () => href,
        assign: vi.fn(),
        replaceUrl: vi.fn((url: string) => { href = new URL(url, href).href }),
        fetch: fetchMock as unknown as SignInEnv['fetch'] & ReturnType<typeof vi.fn>,
        crypto: globalThis.crypto,
        now: () => 1_000_000,
        choose: vi.fn(),
    } as typeof env
    setSignInEnv(env)
})

afterEach(() => {
    resetSignInFlow()
    setAuthToken(null) // the token cookie outlives a test in jsdom
    resetAuthTokenConfig()
    localStorage.clear()
    sessionStorage.clear()
})

describe('the built-in sign-in', () => {
    it('one oidc provider and no session: straight to the authorize endpoint with PKCE, state and nonce', async () => {
        expect(await bootSignIn(config(acme), '')).toBe(false)
        const url = new URL(env.assign.mock.calls[0][0])
        expect(url.origin + url.pathname).toBe(discovery.authorization_endpoint)
        const pending = readPendingSignIn(1_000_000)!
        expect(Object.fromEntries(url.searchParams)).toMatchObject({
            response_type: 'code', client_id: 'ui', redirect_uri: 'https://app.example/', scope: 'openid profile',
            state: pending.state, nonce: pending.nonce, code_challenge_method: 'S256',
        })
        expect(url.searchParams.get('code_challenge')).toMatch(/^[\w-]{43}$/)
        expect(pending.returnTo).toBe('https://app.example/orders/3?tab=2')
        expect(env.choose).not.toHaveBeenCalled()
    })

    it('the callback: code redeemed, token stored, URL back on the route the user was on', async () => {
        writePendingSignIn({ providerId: 'acme', state: 'st', nonce: 'no', codeVerifier: 'v', redirectUri: 'https://app.example/',
            returnTo: 'https://app.example/orders/3?tab=2', tokenEndpoint: discovery.token_endpoint, createdAt: 1_000_000 })
        href = 'https://app.example/?code=the-code&state=st&session_state=x'
        expect(await bootSignIn(config(acme), '')).toBe(true)
        expect(getAuthToken()).toBe('access-1')
        expect(readAuthSession()).toMatchObject({ providerId: 'acme', kind: 'oidc', refreshToken: 'refresh-1', expiresAt: 1_300_000 })
        expect(env.replaceUrl).toHaveBeenCalledWith('/orders/3?tab=2')
        expect(readPendingSignIn()).toBeNull()
        const body = String(env.fetch.mock.calls.find((c) => c[0] === discovery.token_endpoint)![1].body)
        expect(body).toContain('code=the-code')
        expect(body).toContain('code_verifier=v')
    })

    it('a callback whose state is not ours is left alone', async () => {
        setAuthToken('mine')
        href = 'https://app.example/report?code=x&state=someone-elses'
        expect(await bootSignIn(config(acme), '')).toBe(true)
        expect(env.replaceUrl).not.toHaveBeenCalled()
    })

    it('a failed callback shows the chooser with a message, even for one provider (no redirect loop)', async () => {
        writePendingSignIn({ providerId: 'acme', state: 'st', nonce: 'no', codeVerifier: 'v', redirectUri: 'https://app.example/',
            returnTo: href, tokenEndpoint: discovery.token_endpoint, createdAt: 1_000_000 })
        href = 'https://app.example/?error=access_denied&state=st'
        env.choose.mockResolvedValueOnce(null)
        expect(await bootSignIn(config(acme), '')).toBe(false)
        expect(env.replaceUrl).toHaveBeenCalledWith('/')
        expect(env.choose).toHaveBeenCalledWith(expect.objectContaining({ cancellable: false, message: expect.stringMatching(/did not work/) }))
        expect(env.assign).not.toHaveBeenCalled()
    })

    it('an id token with another nonce is refused', async () => {
        writePendingSignIn({ providerId: 'acme', state: 'st', nonce: 'no', codeVerifier: 'v', redirectUri: 'https://app.example/',
            returnTo: href, tokenEndpoint: discovery.token_endpoint, createdAt: 1_000_000 })
        tokenAnswer = () => json({ access_token: 'a', id_token: idToken({ nonce: 'forged' }) })
        href = 'https://app.example/?code=c&state=st'
        env.choose.mockResolvedValueOnce(null)
        expect(await bootSignIn(config(acme), '')).toBe(false)
        expect(getAuthToken()).toBeNull()
    })

    it('several providers: the chooser; a redirect provider goes to its url with continue=', async () => {
        env.choose.mockImplementationOnce(async ({ providers }) => providers[1])
        expect(await bootSignIn(config(acme, github), '')).toBe(false)
        expect(env.choose).toHaveBeenCalledWith(expect.objectContaining({ cancellable: false, message: undefined }))
        expect(env.assign).toHaveBeenCalledWith('https://app.example/oauth2/authorization/github?continue=https%3A%2F%2Fapp.example%2Forders%2F3%3Ftab%3D2')
        expect(readAuthSession()).toEqual({ providerId: 'github', kind: 'redirect' })
    })

    it('a session already there loads the app; an expired one is refreshed first', async () => {
        setAuthToken('t')
        expect(await bootSignIn(config(acme), '')).toBe(true)
        writeAuthSession({ providerId: 'acme', kind: 'oidc', refreshToken: 'r0', expiresAt: 1 })
        tokenAnswer = () => json({ access_token: 'renewed', expires_in: 60 })
        expect(await bootSignIn(config(acme), '')).toBe(true)
        expect(getAuthToken()).toBe('renewed')
        expect(readAuthSession()?.refreshToken).toBe('r0')
    })

    it('an expired token that cannot be refreshed means signing in again', async () => {
        setAuthToken('t')
        writeAuthSession({ providerId: 'acme', kind: 'oidc', refreshToken: 'r0', expiresAt: 1 })
        tokenAnswer = () => json({ error: 'invalid_grant' }, 400)
        expect(await bootSignIn(config(acme), '')).toBe(false)
        expect(getAuthToken()).toBeNull()
        expect(env.assign).toHaveBeenCalled()
    })

    it('loginOnStart false loads the app without a session', async () => {
        expect(await bootSignIn(parseSignInConfig({ loginOnStart: false, providers: [acme] })!, '')).toBe(true)
    })

    it('a 401: refreshed and retried', async () => {
        setAuthToken('old')
        writeAuthSession({ providerId: 'acme', kind: 'oidc', refreshToken: 'r0', expiresAt: 2_000_000 })
        tokenAnswer = () => json({ access_token: 'new' })
        const context = { retry: vi.fn(), giveUp: vi.fn() }
        reauthenticate(context, config(acme), '')
        await vi.waitFor(() => expect(context.retry).toHaveBeenCalled())
        expect(getAuthToken()).toBe('new')
    })

    it('a 401 with no refresh and several providers: the chooser, which the user may decline', async () => {
        setAuthToken('old')
        env.choose.mockResolvedValueOnce(null)
        const context = { retry: vi.fn(), giveUp: vi.fn() }
        reauthenticate(context, config(acme, github), '')
        await vi.waitFor(() => expect(context.giveUp).toHaveBeenCalled())
        expect(env.choose).toHaveBeenCalledWith(expect.objectContaining({ cancellable: true }))
        expect(getAuthToken()).toBeNull()
    })

    it('a 401 with one provider goes to it and leaves the request pending', async () => {
        const context = { retry: vi.fn(), giveUp: vi.fn() }
        reauthenticate(context, config(acme), '')
        await vi.waitFor(() => expect(env.assign).toHaveBeenCalled())
        expect(context.retry).not.toHaveBeenCalled()
        expect(context.giveUp).not.toHaveBeenCalled()
    })

    it('a provider that cannot start (no discovery) asks again with a message', async () => {
        env.fetch.mockImplementation(async () => json({}, 500))
        env.choose.mockResolvedValueOnce(parseSignInConfig({ providers: [acme] })!.providers[0]).mockResolvedValueOnce(null)
        expect(await bootSignIn(config(acme, github), '')).toBe(false)
        expect(env.choose).toHaveBeenCalledTimes(2)
        expect(env.choose.mock.calls[1][0].message).toMatch(/did not work/)
    })

    it('refresh without a session is false', async () => {
        expect(await refresh(config(acme))).toBe(false)
    })

    it('sign-out: oidc ends the IdP session with id_token_hint and comes back to the mount', async () => {
        setAuthToken('t')
        writeAuthSession({ providerId: 'acme', kind: 'oidc', idToken: 'idt' })
        await signOut(config(acme), '/admin')
        expect(getAuthToken()).toBeNull()
        expect(readAuthSession()).toBeNull()
        const url = new URL(env.assign.mock.calls[0][0])
        expect(url.origin + url.pathname).toBe(discovery.end_session_endpoint)
        expect(url.searchParams.get('id_token_hint')).toBe('idt')
        expect(url.searchParams.get('post_logout_redirect_uri')).toBe('https://app.example/admin/')
    })

    it('sign-out: a redirect session goes to logoutUrl; without one, to the mount', async () => {
        writeAuthSession({ providerId: 'github', kind: 'redirect' })
        await signOut(config(github), '')
        expect(env.assign).toHaveBeenLastCalledWith('https://app.example/logout')
        await signOut(parseSignInConfig({ providers: [github] })!, '')
        expect(env.assign).toHaveBeenLastCalledWith('https://app.example/')
    })
})
