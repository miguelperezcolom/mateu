import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { neutralizeUntrusted } from './untrustedDefinition'

/**
 * The untrusted-definition rules (conformance/untrusted/cases.json) — the same file pins the Java,
 * .NET and Python `__preview__` with `_untrusted` and the Redwood renderer.
 */
interface Case { name: string; input: unknown; expected: unknown }
const corpus = JSON.parse(readFileSync(
    fileURLToPath(new URL('../../../../../../../../../../conformance/untrusted/cases.json', import.meta.url)), 'utf8',
)) as { cases: Case[] }

describe('untrusted definitions (agent-authored screens)', () => {
    it('has cases', () => expect(corpus.cases.length).toBeGreaterThan(5))
    for (const c of corpus.cases) {
        it(c.name, () => expect(JSON.parse(JSON.stringify(neutralizeUntrusted(c.input)))).toEqual(c.expected))
    }
    it('does not change its input', () => {
        const input = { type: 'Element', name: 'img', attributes: { onerror: 'x()' }, html: true }
        neutralizeUntrusted(input)
        expect(input.attributes.onerror).toBe('x()')
    })
})

describe('element names (final review H3)', () => {
    it('turns a name that is not a plain tag name into an empty div', () => {
        for (const name of ['img src=x onerror=alert(1)', '<svg>', 'a'.repeat(200), '1abc']) {
            const out = neutralizeUntrusted({ type: 'Element', name, attributes: { title: 't' }, content: 'x' }) as
                { name: string, attributes: Record<string, unknown>, content: unknown }
            expect(out.name).toBe('div')
            expect(out.attributes).toEqual({})
            expect(out.content).toBeNull()
        }
    })

    it('keeps an ordinary or custom tag name', () => {
        for (const name of ['p', 'h2', 'my-widget']) {
            const out = neutralizeUntrusted({ type: 'Element', name, content: 'x' }) as { name: string }
            expect(out.name).toBe(name)
        }
    })
})
