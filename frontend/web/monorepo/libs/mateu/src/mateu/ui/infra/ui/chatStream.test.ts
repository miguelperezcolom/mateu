import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { ChatAnswer, ChatProgress, classifyChatPayload, formatToolDuration, isEmptyUsage, SseParser } from './chatStream'

const parseAll = (...pieces: string[]) => {
    const parser = new SseParser()
    const out = pieces.flatMap(p => parser.push(p))
    return [...out, ...parser.end()]
}

describe('SseParser', () => {
    it('reads one payload per EVENT, whatever the pieces the bytes arrive in', () => {
        expect(parseAll('data: uno\n\ndata: d', 'os\n', '\n')).toEqual(['uno', 'dos'])
    })

    it("joins an event's data lines with a newline: a multi-line answer is one payload", () => {
        expect(parseAll('data:## Estado\ndata:\ndata:- **MRU01**\n\n')).toEqual(['## Estado\n\n- **MRU01**'])
    })

    it('drops only the ONE optional space after data:, so markdown indentation survives', () => {
        expect(parseAll('data:   - anidado\n\n')).toEqual(['  - anidado'])
        expect(parseAll('data:x\n\n')).toEqual(['x'])
    })

    it('ignores comments (keep-alives) and fields other than data', () => {
        expect(parseAll(':keep-alive\n\nevent: message\nid: 1\ndata: hola\n\n')).toEqual(['hola'])
    })

    it('copes with CRLF, a CR split from its LF, and a last event with no blank line after it', () => {
        expect(parseAll('data: a\r', '\n\r\ndata: b\r\n\r\n', 'data: c')).toEqual(['a', 'b', 'c'])
    })

    it('keeps a JSON event whole even if its bytes are split mid-string', () => {
        const event = 'data:{"event":"agent-delta","detail":{"text":"línea\\nsiguiente"}}\n\n'
        expect(parseAll(event.slice(0, 20), event.slice(20))).toEqual([event.slice(5, -2)])
    })
})

describe('classifyChatPayload', () => {
    it('tells usage, deltas, status, tools, errors, UI events and text apart', () => {
        expect(classifyChatPayload('{"inputTokens":1,"outputTokens":2,"totalTokens":3}'))
            .toEqual({ kind: 'usage', usage: { inputTokens: 1, outputTokens: 2, totalTokens: 3 } })
        expect(classifyChatPayload('{"event":"agent-delta","detail":{"text":" hola"}}'))
            .toEqual({ kind: 'delta', text: ' hola' })
        expect(classifyChatPayload('{"event":"agent-status","detail":{"phase":"thinking","text":"Pensando…"}}'))
            .toEqual({ kind: 'status', detail: { phase: 'thinking', text: 'Pensando…' } })
        expect(classifyChatPayload('{"event":"agent-tool","detail":{"name":"t","phase":"start"}}'))
            .toEqual({ kind: 'tool', detail: { name: 't', phase: 'start' } })
        expect(classifyChatPayload('{"event":"agent-error","detail":{"message":"boom"}}'))
            .toEqual({ kind: 'error', message: 'boom' })
        expect(classifyChatPayload('{"event":"navigation-requested","detail":{"route":"/x"}}'))
            .toEqual({ kind: 'event', event: 'navigation-requested', detail: { route: '/x' } })
        expect(classifyChatPayload('Hola {no es json')).toEqual({ kind: 'text', text: 'Hola {no es json' })
        expect(classifyChatPayload('  sangrado')).toEqual({ kind: 'text', text: '  sangrado' })
    })

    it('knows a zero usage placeholder says nothing', () => {
        expect(isEmptyUsage({ inputTokens: 0, outputTokens: 0, totalTokens: 0 })).toBe(true)
        expect(isEmptyUsage({})).toBe(true)
        expect(isEmptyUsage({ inputTokens: 0, totalTokens: 12 })).toBe(false)
    })
})

describe('ChatAnswer', () => {
    it('appends deltas and lets the final text REPLACE them', () => {
        const a = new ChatAnswer()
        a.delta('Te ')
        expect(a.delta('llevo.')).toBe('Te llevo.')
        expect(a.line('Te llevo ahora.')).toBe('Te llevo ahora.')
    })

    it('without deltas, each text event is a line — the contract line-per-event agents use', () => {
        const a = new ChatAnswer()
        a.line('## Estado')
        a.line('')
        expect(a.line('- MRU01')).toBe('## Estado\n\n- MRU01')
    })

    it('shows an error as the answer', () => {
        const a = new ChatAnswer()
        a.delta('Empie')
        expect(a.error('boom')).toBe('⚠️ boom')
    })
})

describe('ChatProgress', () => {
    // the chat speaks the page's language; these expectations are the Spanish catalogue's
    beforeAll(() => { vi.stubGlobal('navigator', { language: 'es-ES' }) })
    afterAll(() => { vi.unstubAllGlobals() })

    it('says nothing for an agent that reports nothing', () => {
        expect(new ChatProgress(0).line(5000)).toBeNull()
    })

    it('shows the phase, the tool being called with its seconds, then the answering', () => {
        const p = new ChatProgress(0)
        p.status({ phase: 'connecting', text: 'Conectando con 2 servidores MCP…' }, 0)
        expect(p.line(2500)).toBe('Conectando con 2 servidores MCP… 2 s')
        p.tool({ name: 'booking_findBookings', server: 'booking', kind: 'mcp', phase: 'start' }, 3000)
        expect(p.line(3200)).toBe('Llamando a booking_findBookings…')
        expect(p.line(6100)).toBe('Llamando a booking_findBookings… 3 s')
        p.tool({ name: 'booking_findBookings', server: 'booking', phase: 'end', ms: 3100 }, 6100)
        p.status({ phase: 'thinking', text: 'Pensando…' }, 6100)
        expect(p.line(6200)).toBe('Pensando…')
        p.text(7000)
        expect(p.line(9000)).toBe('Respondiendo…')
        expect(p.steps).toEqual([{ name: 'booking_findBookings', server: 'booking', kind: undefined, ms: 3100, error: undefined, running: false }])
    })

    it('records a failed call with its reason', () => {
        const p = new ChatProgress(0)
        p.tool({ name: 'ask_ventas', phase: 'start' }, 0)
        p.tool({ name: 'ask_ventas', phase: 'end', ms: 20, error: 'unreachable' }, 20)
        expect(p.steps[0]).toMatchObject({ name: 'ask_ventas', error: 'unreachable', running: false })
        expect(p.runningTool).toBeUndefined()
    })

    it('formats durations short', () => {
        expect(formatToolDuration(850)).toBe('850 ms')
        expect(formatToolDuration(1234)).toBe('1,2 s')
        expect(formatToolDuration(undefined)).toBe('')
    })
})
