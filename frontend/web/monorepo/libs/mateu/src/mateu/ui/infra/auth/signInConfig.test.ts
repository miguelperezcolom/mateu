// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { normaliseProvider, oidcRedirectUri, parseSignInConfig, readSignInConfig, redirectProviderUrl, signInGlyph } from './signInConfig'

afterEach(() => { document.head.innerHTML = '' })

describe('signInConfig', () => {
    it('reads the page meta; an absent or broken one is null', () => {
        expect(readSignInConfig()).toBeNull()
        document.head.innerHTML = '<meta name="mateu-auth" content="{not json">'
        expect(readSignInConfig()).toBeNull()
        const meta = document.createElement('meta')
        meta.name = 'mateu-auth'
        meta.content = JSON.stringify({ providers: [{ id: 'gh', type: 'redirect', url: '/oauth2/authorization/github' }], logoutUrl: '/logout' })
        document.head.replaceChildren(meta)
        expect(readSignInConfig()).toMatchObject({ loginOnStart: true, logoutUrl: '/logout', providers: [{ id: 'gh', continueParam: true }] })
    })

    it('normalises an oidc provider: trailing slash, scopes, platforms, audience', () => {
        expect(normaliseProvider({ id: 'a', type: 'OIDC', issuer: 'https://idp/realms/x/', clientId: 'ui', audience: 'api', scopes: 'openid email' }))
            .toEqual({ id: 'a', type: 'oidc', label: 'a', icon: 'key', issuer: 'https://idp/realms/x', clientId: 'ui', scopes: ['openid', 'email'],
                audience: 'api', platforms: ['web', 'mobile', 'desktop'], continueParam: true })
        expect(normaliseProvider({ id: 'a', type: 'redirect', url: '/l', continueParam: false })?.continueParam).toBe(false)
        expect(normaliseProvider(null)).toBeNull()
        expect(normaliseProvider({ type: 'oidc' })).toBeNull()
        expect(parseSignInConfig('nope')).toBeNull()
    })

    it('a redirect provider adds continue= and follows only http(s)', () => {
        expect(redirectProviderUrl({ url: '/oauth2/authorization/github', continueParam: true }, 'https://app.example/orders?x=1'))
            .toBe('https://app.example/oauth2/authorization/github?continue=https%3A%2F%2Fapp.example%2Forders%3Fx%3D1')
        expect(redirectProviderUrl({ url: 'https://auth.example/login', continueParam: false }, 'https://app.example/')).toBe('https://auth.example/login')
        expect(redirectProviderUrl({ url: 'javascript:alert(1)', continueParam: true }, 'https://app.example/')).toBeUndefined()
        expect(redirectProviderUrl({ continueParam: true }, 'https://app.example/')).toBeUndefined()
    })

    it('the OIDC redirect uri is the mount root on the page origin', () => {
        expect(oidcRedirectUri('', 'https://app.example/orders/3')).toBe('https://app.example/')
        expect(oidcRedirectUri('/admin', 'https://app.example/admin/orders')).toBe('https://app.example/admin/')
        expect(oidcRedirectUri('https://api.other.example/x', 'https://app.example/a')).toBe('https://app.example/')
    })

    it('a neutral glyph: the brand initial, nothing for the key', () => {
        expect(signInGlyph({ icon: 'google', label: 'Google' })).toBe('G')
        expect(signInGlyph({ icon: 'x', label: 'X' })).toBe('X')
        expect(signInGlyph({ icon: 'key', label: 'Acme' })).toBe('')
    })
})
