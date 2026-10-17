import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { evaluate } from './expression'

/**
 * The client conformance corpus (conformance/client/expressions.json), run against the web
 * evaluator — the REFERENCE: a case's `expected` is what this evaluator answers, and an override
 * for `web` would be a contradiction, so none is honoured. The same file runs in the Redwood,
 * React Native and IntelliJ suites.
 */
interface Case { name: string; expr: string; context?: Record<string, unknown>; expected: unknown; overrides?: Record<string, unknown> }
const corpus = JSON.parse(readFileSync(
    fileURLToPath(new URL('../../../../../../../../../../conformance/client/expressions.json', import.meta.url)), 'utf8',
)) as { context: Record<string, unknown>; cases: Case[] }

const isMarker = (v: unknown, key: string) => !!v && typeof v === 'object' && (v as Record<string, unknown>)[key] === true

describe('client conformance corpus — expressions (web, the reference)', () => {
    it('is not empty and has unique names', () => {
        expect(corpus.cases.length).toBeGreaterThan(50)
        expect(new Set(corpus.cases.map(c => c.name)).size).toBe(corpus.cases.length)
    })
    it('never overrides the reference', () => {
        expect(corpus.cases.filter(c => c.overrides && 'web' in c.overrides).map(c => c.name)).toEqual([])
    })
    for (const c of corpus.cases) {
        it(c.name + ' — ' + c.expr, () => {
            const run = () => evaluate(c.expr, c.context ?? corpus.context)
            if (isMarker(c.expected, '$error')) expect(run).toThrow()
            else if (isMarker(c.expected, '$undefined')) expect(run()).toBeUndefined()
            else expect(run()).toEqual(c.expected)
        })
    }
})
