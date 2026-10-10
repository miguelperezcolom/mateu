import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isSafeUrl, resolveSafeUrl, safeHref, safeNavigate } from './safeNavigate'

describe('safeHref', () => {
    it('keeps relative, http(s), mailto and tel links', () => {
        for (const ok of ['/a', 'b/c', '#x', '?q=1', 'https://x.org', 'http://x.org', 'mailto:a@b.c', 'tel:+34600']) {
            expect(safeHref(ok)).toBe(ok)
        }
    })
    it('drops script schemes, also when obfuscated', () => {
        for (const bad of ['javascript:alert(1)', 'JAVASCRIPT:x', 'java\tscript:x', 'java\nscript:x',
            '\u0000javascript:x', '  javascript:x', 'vbscript:x', 'data:text/html,<b>x</b>']) {
            expect(safeHref(bad), JSON.stringify(bad)).toBeUndefined()
        }
        expect(safeHref(undefined)).toBeUndefined()
        expect(safeHref('')).toBeUndefined()
    })
    it('admits data: URLs only when asked (download links of a client-held value)', () => {
        expect(safeHref('data:application/pdf;base64,AAAA', { allowData: true })).toBe('data:application/pdf;base64,AAAA')
        expect(safeHref('data:application/pdf;base64,AAAA')).toBeUndefined()
    })
})

const BASE = 'https://app.example.com/orders/1'

describe('resolveSafeUrl', () => {
    it('accepts relative, same-origin and cross-origin http(s) URLs', () => {
        expect(resolveSafeUrl('/products', BASE)).toEqual({ href: 'https://app.example.com/products', sameOrigin: true })
        expect(resolveSafeUrl('edit', BASE)).toEqual({ href: 'https://app.example.com/orders/edit', sameOrigin: true })
        expect(resolveSafeUrl('https://app.example.com/x', BASE)?.sameOrigin).toBe(true)
        expect(resolveSafeUrl('http://other.org/a', BASE)).toEqual({ href: 'http://other.org/a', sameOrigin: false })
        expect(resolveSafeUrl('//other.org/a', BASE)?.sameOrigin).toBe(false)
    })

    it('refuses script and other non-http schemes, including obfuscated ones', () => {
        for (const bad of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', ' javascript:alert(1)',
            'java\tscript:alert(1)', 'java\nscript:alert(1)', '\u0001javascript:alert(1)',
            'data:text/html,<script>alert(1)</script>', 'vbscript:msgbox(1)', 'file:///etc/passwd']) {
            expect(resolveSafeUrl(bad, BASE), bad).toBeUndefined()
        }
    })

    it('refuses empty and non-string values', () => {
        expect(resolveSafeUrl('', BASE)).toBeUndefined()
        expect(resolveSafeUrl('   ', BASE)).toBeUndefined()
        expect(resolveSafeUrl(undefined, BASE)).toBeUndefined()
        expect(resolveSafeUrl(42, BASE)).toBeUndefined()
        expect(isSafeUrl('/ok', BASE)).toBe(true)
        expect(isSafeUrl('javascript:x', BASE)).toBe(false)
    })
})

describe('safeNavigate', () => {
    const assign = vi.fn()
    const open = vi.fn()
    beforeEach(() => {
        assign.mockReset()
        open.mockReset()
        vi.stubGlobal('window', { location: { href: BASE, assign }, open })
        vi.spyOn(console, 'warn').mockImplementation(() => {})
    })
    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('navigates same-origin URLs in the current tab', () => {
        expect(safeNavigate('/products')).toBe(true)
        expect(assign).toHaveBeenCalledWith('https://app.example.com/products')
        expect(open).not.toHaveBeenCalled()
    })

    it('opens cross-origin URLs in a new tab without an opener', () => {
        expect(safeNavigate('https://docs.other.org/x')).toBe(true)
        expect(open).toHaveBeenCalledWith('https://docs.other.org/x', '_blank', 'noopener,noreferrer')
        expect(assign).not.toHaveBeenCalled()
    })

    it('forces a new tab on request even for same-origin URLs', () => {
        safeNavigate('/products', { newTab: true })
        expect(open).toHaveBeenCalledWith('https://app.example.com/products', '_blank', 'noopener,noreferrer')
    })

    it('never runs a javascript: URL', () => {
        expect(safeNavigate('javascript:alert(document.cookie)')).toBe(false)
        expect(assign).not.toHaveBeenCalled()
        expect(open).not.toHaveBeenCalled()
        expect(console.warn).toHaveBeenCalled()
    })
})
