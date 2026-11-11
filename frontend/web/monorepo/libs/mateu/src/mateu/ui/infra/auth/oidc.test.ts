import { createHash } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import {
    authorizeUrl, callbackParamsOf, endSessionUrl, endpointAllowed, exchangeCode, fetchDiscovery, jwtClaims,
    pkceChallenge, randomToken, refreshDelay, refreshTokens, tokenFresh, withoutCallbackParams,
} from './oidc'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('oidc', () => {
    it('the PKCE challenge is base64url(SHA-256(verifier)) — RFC 7636 appendix B', async () => {
        expect(await pkceChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM')
        const v = randomToken()
        expect(v).toMatch(/^[A-Za-z0-9_-]{43}$/)
        expect(await pkceChallenge(v)).toBe(createHash('sha256').update(v).digest('base64url'))
        expect(randomToken()).not.toBe(v)
    })

    it('discovery: the issuer must be the declared one, endpoints https (http on loopback only)', async () => {
        const doc = { issuer: 'https://idp.example/realms/a', authorization_endpoint: 'https://idp.example/auth', token_endpoint: 'https://idp.example/token', end_session_endpoint: 'javascript:x' }
        const fetchImpl = vi.fn().mockResolvedValue(json(doc))
        const got = await fetchDiscovery('https://idp.example/realms/a/', fetchImpl)
        expect(fetchImpl).toHaveBeenCalledWith('https://idp.example/realms/a/.well-known/openid-configuration', expect.anything())
        expect(got.end_session_endpoint).toBeUndefined()
        await expect(fetchDiscovery('https://other', vi.fn().mockResolvedValue(json(doc)))).rejects.toThrow(/another issuer/)
        await expect(fetchDiscovery('https://idp.example/realms/a', vi.fn().mockResolvedValue(json({ ...doc, token_endpoint: 'http://evil/token' })))).rejects.toThrow(/token_endpoint/)
        await expect(fetchDiscovery('https://x', vi.fn().mockResolvedValue(json({}, 404)))).rejects.toThrow(/404/)
        expect(endpointAllowed('http://localhost:9999/token', 'http://localhost:9999')).toBe(true)
        expect(endpointAllowed('http://evil/token', 'http://localhost:9999')).toBe(false)
        expect(endpointAllowed('nope', 'https://x')).toBe(false)
    })

    it('the authorize url carries the code flow + PKCE parameters', () => {
        const url = new URL(authorizeUrl('https://idp/auth?kc_idp_hint=google', {
            clientId: 'ui', redirectUri: 'https://app/', scopes: ['openid', 'email'], state: 's', nonce: 'n', codeChallenge: 'c', audience: 'api',
        }))
        expect(Object.fromEntries(url.searchParams)).toEqual({
            kc_idp_hint: 'google', response_type: 'code', client_id: 'ui', redirect_uri: 'https://app/', scope: 'openid email',
            state: 's', nonce: 'n', code_challenge: 'c', code_challenge_method: 'S256', audience: 'api',
        })
    })

    it('the end-session url, or none', () => {
        expect(endSessionUrl(undefined, { postLogoutRedirectUri: 'https://app/', clientId: 'ui' })).toBeUndefined()
        expect(endSessionUrl('https://idp/logout', { idToken: 'i', postLogoutRedirectUri: 'https://app/', clientId: 'ui' }))
            .toBe('https://idp/logout?id_token_hint=i&post_logout_redirect_uri=https%3A%2F%2Fapp%2F&client_id=ui')
    })

    it('code exchange and refresh post the form and read the tokens', async () => {
        const fetchImpl = vi.fn().mockResolvedValue(json({ access_token: 'a', refresh_token: 'r', id_token: 'i', expires_in: 300 }))
        expect(await exchangeCode('https://idp/token', { code: 'c', codeVerifier: 'v', clientId: 'ui', redirectUri: 'https://app/' }, fetchImpl, 1000))
            .toEqual({ accessToken: 'a', refreshToken: 'r', idToken: 'i', expiresAt: 301_000 })
        expect(String(fetchImpl.mock.calls[0][1].body)).toBe('grant_type=authorization_code&code=c&code_verifier=v&client_id=ui&redirect_uri=https%3A%2F%2Fapp%2F')
        const noRotation = vi.fn().mockResolvedValue(json({ access_token: 'a2' }))
        expect(await refreshTokens('https://idp/token', { refreshToken: 'r', clientId: 'ui' }, noRotation, 0, { accessToken: 'a', refreshToken: 'r', idToken: 'i' }))
            .toEqual({ accessToken: 'a2', refreshToken: 'r', idToken: 'i' })
        await expect(refreshTokens('https://idp/token', { refreshToken: 'r', clientId: 'ui' }, vi.fn().mockResolvedValue(json({ error: 'invalid_grant', error_description: 'expired' }, 400))))
            .rejects.toThrow('invalid_grant: expired')
        await expect(exchangeCode('https://idp/token', { code: 'c', codeVerifier: 'v', clientId: 'ui', redirectUri: 'x' }, vi.fn().mockResolvedValue(json({}))))
            .rejects.toThrow(/no access token/)
        await expect(exchangeCode('https://idp/token', { code: 'c', codeVerifier: 'v', clientId: 'ui', redirectUri: 'x' }, vi.fn().mockResolvedValue(new Response('x', { status: 500 }))))
            .rejects.toThrow(/500/)
    })

    it('reads a JWT payload (base64url, UTF-8); garbage is {}', () => {
        const payload = Buffer.from(JSON.stringify({ nonce: 'ñ' })).toString('base64url')
        expect(jwtClaims(`h.${payload}.s`)).toEqual({ nonce: 'ñ' })
        expect(jwtClaims('nope')).toEqual({})
        expect(jwtClaims(undefined)).toEqual({})
        expect(jwtClaims('a.!!!.b')).toEqual({})
    })

    it('expiry and refresh timing', () => {
        expect(tokenFresh(undefined)).toBe(true)
        expect(tokenFresh(100_000, 50_000)).toBe(true)
        expect(tokenFresh(60_000, 50_000)).toBe(false)
        expect(refreshDelay(undefined)).toBeUndefined()
        expect(refreshDelay(600_000, 0)).toBe(540_000)
        expect(refreshDelay(10_000, 0)).toBe(5_000)
    })

    it('detects the authorization response and strips it from the URL', () => {
        expect(callbackParamsOf('?code=c&state=s&session_state=x')).toEqual({ code: 'c', state: 's', error: undefined, errorDescription: undefined })
        expect(callbackParamsOf('?error=access_denied&state=s&error_description=no')).toMatchObject({ error: 'access_denied', errorDescription: 'no' })
        expect(callbackParamsOf('?code=c')).toBeUndefined()
        expect(callbackParamsOf('?state=s')).toBeUndefined()
        expect(withoutCallbackParams('https://app/orders?page=2&code=c&state=s&iss=x#top')).toBe('/orders?page=2#top')
        expect(withoutCallbackParams('https://app/?code=c&state=s')).toBe('/')
    })
})
