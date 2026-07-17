import { describe, expect, it } from 'vitest'
import { loginRedirectTarget } from './redirectGuard.ts'

const BASE = 'http://app.example.com/some/page'

describe('redirectGuard', () => {
    it('returns the login page URL when the API call was redirected to an HTML page', () => {
        expect(loginRedirectTarget({
            requestedUrl: '/mateu/v3/sync/home',
            finalUrl: 'http://app.example.com/login',
            contentType: 'text/html;charset=UTF-8',
            data: '<!DOCTYPE html><html>…login…</html>',
        }, BASE)).toBe('http://app.example.com/login')
    })

    it('detects the redirect even without a content-type header when the body is an HTML string', () => {
        expect(loginRedirectTarget({
            requestedUrl: '/mateu/v3/sync/home',
            finalUrl: 'http://sso.example.com/auth',
            data: '<html>sign in</html>',
        }, BASE)).toBe('http://sso.example.com/auth')
    })

    it('ignores a response that was not redirected', () => {
        expect(loginRedirectTarget({
            requestedUrl: '/mateu/v3/sync/home',
            finalUrl: 'http://app.example.com/mateu/v3/sync/home',
            contentType: 'application/json',
            data: { fragments: [] },
        }, BASE)).toBeUndefined()
    })

    it('ignores a redirect that still answers JSON (e.g. a trailing-slash rewrite)', () => {
        expect(loginRedirectTarget({
            requestedUrl: '/mateu/v3/sync/home',
            finalUrl: 'http://app.example.com/mateu/v3/sync/home/',
            contentType: 'application/json',
            data: { fragments: [] },
        }, BASE)).toBeUndefined()

        expect(loginRedirectTarget({
            requestedUrl: '/mateu/v3/sync/home',
            finalUrl: 'http://app.example.com/mateu/v3/sync/home/',
            data: { fragments: [] },
        }, BASE)).toBeUndefined()
    })

    it('does nothing when the adapter does not expose the final URL', () => {
        expect(loginRedirectTarget({
            requestedUrl: '/mateu/v3/sync/home',
            contentType: 'text/html',
            data: '<html></html>',
        }, BASE)).toBeUndefined()
    })

    it('resolves a relative requested URL against the given base before comparing', () => {
        expect(loginRedirectTarget({
            requestedUrl: 'mateu/v3/sync/home',
            finalUrl: 'http://app.example.com/some/mateu/v3/sync/home',
            contentType: 'application/json',
            data: {},
        }, BASE)).toBeUndefined()
    })
})
