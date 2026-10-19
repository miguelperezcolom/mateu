import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { AGENT_BUILT_IN_EVENTS, agentMayDispatch, declareAgentEvent, RESERVED_EVENT_NAMES, RESERVED_EVENT_PATTERNS, RESERVED_EVENT_PREFIXES } from './agentEventPolicy'

/** NM9: the agent-event allow-list, pinned by conformance/client/agent-events.json (Redwood reads it too). */
const corpus = JSON.parse(readFileSync(
    fileURLToPath(new URL('../../../../../../../../../../conformance/client/agent-events.json', import.meta.url)), 'utf8',
)) as { builtIn: string[], reserved: string[], reservedPrefixes: string[], reservedPatterns: string[], cases: { name: string, subscribed: string[], allowed: boolean }[] }

describe('which events an agent may dispatch', () => {
    it('the lists are the shared ones', () => {
        expect([...AGENT_BUILT_IN_EVENTS]).toEqual(corpus.builtIn)
        expect([...RESERVED_EVENT_NAMES]).toEqual(corpus.reserved)
        expect([...RESERVED_EVENT_PREFIXES]).toEqual(corpus.reservedPrefixes)
        expect(RESERVED_EVENT_PATTERNS.map((p) => p.source)).toEqual(corpus.reservedPatterns)
    })
    for (const c of corpus.cases) {
        it(`${c.name || '(empty)'} with ${JSON.stringify(c.subscribed)} → ${c.allowed}`, () => {
            expect(agentMayDispatch(c.name, (n) => c.subscribed.includes(n))).toBe(c.allowed)
        })
    }
    it('follows what the components on screen declare, while they are there', () => {
        expect(agentMayDispatch('highlight-row')).toBe(false)
        const a = declareAgentEvent('highlight-row')
        const b = declareAgentEvent('highlight-row')
        expect(agentMayDispatch('highlight-row')).toBe(true)
        a(); a()
        expect(agentMayDispatch('highlight-row')).toBe(true)
        b()
        expect(agentMayDispatch('highlight-row')).toBe(false)
    })
})
