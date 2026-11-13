/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// The standalone page is what a browser-hosted editor serves, and a share link (#mateuz=…) can put
// any definition in it: its policy is the second line behind the untrusted strip (V-4).
describe('the standalone editor page', () => {
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8')
    const meta = /<meta http-equiv="Content-Security-Policy" data-mateu-standalone-csp\s+content="([^"]+)"/.exec(html)

    it('ships a CSP that runs no inline script, inline event handler or javascript: url', () => {
        expect(meta).toBeTruthy()
        const scriptSrc = /script-src ([^;]+)/.exec(meta![1])![1]
        expect(scriptSrc).toContain("'self'")
        expect(scriptSrc).not.toContain("'unsafe-inline'")
        expect(scriptSrc).not.toMatch(/\*|https?:|data:|blob:/)
        expect(meta![1]).toContain("object-src 'none'")
        expect(meta![1]).toContain("base-uri 'self'")
    })

    it('carries no inline script of its own (the policy would block it)', () => {
        expect(html).not.toMatch(/<script(?![^>]*\ssrc=)[^>]*>/)
    })
})
