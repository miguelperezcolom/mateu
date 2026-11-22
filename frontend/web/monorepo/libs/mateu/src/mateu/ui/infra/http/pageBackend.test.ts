import { describe, expect, it, vi } from 'vitest'
import { effectiveBaseUrl, normalizePageBackend, pageBackendOf } from './pageBackend'

const docWith = (content: string | null) => ({
    querySelector: (sel: string) => (content == null || sel !== 'meta[name="mateu-backend"]'
        ? null
        : { getAttribute: (n: string) => (n === 'content' ? content : null) }),
}) as unknown as Document

const element = (attrs: Record<string, string>, baseUrl = '') => ({
    baseUrl,
    hasAttribute: (n: string) => Object.keys(attrs).some((k) => k.toLowerCase() === n.toLowerCase()),
})

describe('pageBackend', () => {
    it('no tag, an empty one or only blanks = the page origin', () => {
        expect(pageBackendOf(docWith(null))).toBe('')
        expect(pageBackendOf(docWith(''))).toBe('')
        expect(pageBackendOf(docWith('   '))).toBe('')
        expect(pageBackendOf(null)).toBe('')
    })

    it('an absolute backend, without its trailing slashes', () => {
        expect(pageBackendOf(docWith('https://api.example.com/'))).toBe('https://api.example.com')
        expect(pageBackendOf(docWith(' http://localhost:8080 '))).toBe('http://localhost:8080')
        expect(pageBackendOf(docWith('https://api.example.com/crm//'))).toBe('https://api.example.com/crm')
    })

    it('a root-relative path (a mount on the same origin)', () => {
        expect(normalizePageBackend('/admin/')).toBe('/admin')
        expect(normalizePageBackend('/')).toBe('')
    })

    it('refuses what cannot be a backend', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        for (const bad of ['javascript:alert(1)', 'api.example.com', '//evil.example', '/\\evil', 'https://a b', 'https://x/?q=1', 'ftp://x']) {
            expect(normalizePageBackend(bad), bad).toBe('')
        }
        expect(warn).toHaveBeenCalled()
        warn.mockRestore()
    })

    it('the baseUrl the page wrote always wins over the tag', () => {
        const doc = docWith('https://api.example.com')
        expect(effectiveBaseUrl(element({ baseUrl: '/console' }, '/console'), doc)).toBe('/console')
        // a server page at the root writes baseUrl="": that is the root, not "unset"
        expect(effectiveBaseUrl(element({ baseurl: '' }, ''), doc)).toBe('')
        // set as a property (an element built in script)
        expect(effectiveBaseUrl(element({}, 'https://other.example'), doc)).toBe('https://other.example')
    })

    it('an element its page wrote no baseUrl for takes the tag', () => {
        expect(effectiveBaseUrl(element({}), docWith('https://api.example.com/'))).toBe('https://api.example.com')
        expect(effectiveBaseUrl(element({}), docWith(null))).toBe('')
    })
})
