// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import './mateu-chat'
import type { MateuChat } from './mateu-chat'
import { CHAT_WIDTH_KEY } from './chatPanel'
import { chromeText } from './chromeTexts'

/**
 * The chat beyond the happy stream: dragging its edge, attaching files, the agent's events reaching
 * the page, the ways an answer fails, and dictation that sends what was said.
 */
Element.prototype.scrollTo = () => {}

const enc = new TextEncoder()
const sseResponse = (...payloads: unknown[]) => new Response(new ReadableStream<Uint8Array>({
    start(c) {
        for (const p of payloads) c.enqueue(enc.encode(`data:${typeof p === 'string' ? p : JSON.stringify(p)}\n\n`))
        c.close()
    },
}), { status: 200, headers: { 'Content-Type': 'text/event-stream' } })

async function chat(setup?: (el: MateuChat) => void): Promise<MateuChat> {
    const el = document.createElement('mateu-chat') as MateuChat
    el.sseUrl = '/ai/stream'
    ;(el as unknown as { menu: unknown[] }).menu = []
    setup?.(el)
    document.body.appendChild(el)
    await el.updateComplete
    return el
}

const $ = (el: MateuChat, sel: string) => el.shadowRoot!.querySelector(sel)
const items = (el: MateuChat) => (el as unknown as { items: { text: string }[] }).items
const settle = async () => { for (let i = 0; i < 10; i++) await new Promise(r => setTimeout(r, 0)) }

afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    localStorage.clear()
    document.body.innerHTML = ''
    document.documentElement.lang = 'en'
    delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition
})

describe('resizing by dragging the edge', () => {
    const pointer = (type: string, clientX: number, button = 0) =>
        Object.assign(new MouseEvent(type, { clientX, button, bubbles: true, composed: true, cancelable: true }), { pointerId: 1 })

    it('follows the pointer while dragging and remembers the width on release', async () => {
        const el = await chat()
        const edge = $(el, '.resize-handle') as HTMLElement
        edge.dispatchEvent(pointer('pointerdown', 500))
        await el.updateComplete
        expect(edge.classList.contains('resizing')).toBe(true)
        edge.dispatchEvent(pointer('pointermove', 600))
        await el.updateComplete
        expect(el.width).toBe(560)
        edge.dispatchEvent(pointer('pointerup', 600))
        await el.updateComplete
        expect(edge.classList.contains('resizing')).toBe(false)
        expect(localStorage.getItem(CHAT_WIDTH_KEY)).toBe('560')
        // a move with no drag in progress changes nothing
        edge.dispatchEvent(pointer('pointermove', 700))
        expect(el.width).toBe(560)
    })

    it('a secondary button does not start a drag', async () => {
        const el = await chat()
        const edge = $(el, '.resize-handle') as HTMLElement
        edge.dispatchEvent(pointer('pointerdown', 500, 2))
        edge.dispatchEvent(pointer('pointermove', 600))
        expect(el.width).toBe(460)
    })
})

describe('attachments', () => {
    it('uploads the picked files, shows them as removable chips and sends them with the message', async () => {
        const calls: { url: string, init: RequestInit }[] = []
        vi.stubGlobal('fetch', vi.fn((url: string, init: RequestInit) => {
            calls.push({ url, init })
            return Promise.resolve(url === '/ai/upload'
                ? new Response(JSON.stringify({ files: [{ name: 'a.pdf', path: 'up/a.pdf' }, { name: 'b.pdf', path: 'up/b.pdf' }] }), { status: 200 })
                : sseResponse('Got them.'))
        }))
        const el = await chat(c => { (c as unknown as { uploadUrl: string }).uploadUrl = '/ai/upload' })
        const input = $(el, '.file-input') as HTMLInputElement
        Object.defineProperty(input, 'files', { value: [new File(['x'], 'a.pdf'), new File(['y'], 'b.pdf')], configurable: true })
        input.dispatchEvent(new Event('change'))
        await settle()
        await el.updateComplete
        expect(calls[0].url).toBe('/ai/upload')
        expect((calls[0].init.body as FormData).getAll('files')).toHaveLength(2)
        const chips = Array.from(el.shadowRoot!.querySelectorAll('.attachment-chip'))
        expect(chips.map(c => c.textContent!.replace('✕', '').trim())).toEqual(['📎 a.pdf', '📎 b.pdf'])
        ;(chips[1].querySelector('.attachment-remove') as HTMLButtonElement).click()
        await el.updateComplete
        expect(el.shadowRoot!.querySelectorAll('.attachment-chip')).toHaveLength(1)

        await el.send(new CustomEvent('submit', { detail: { value: '' } }))
        const body = JSON.parse(String(calls[1].init.body))
        expect(body.attachments).toEqual([{ name: 'a.pdf', path: 'up/a.pdf' }])
        expect(items(el)[0].text).toBe('📎 a.pdf')
        expect(el.shadowRoot!.querySelectorAll('.attachment-chip')).toHaveLength(0)
    })

    it('a failed upload says so in the conversation', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('no', { status: 500 }))))
        const el = await chat(c => { (c as unknown as { uploadUrl: string }).uploadUrl = '/ai/upload' })
        const input = $(el, '.file-input') as HTMLInputElement
        Object.defineProperty(input, 'files', { value: [new File(['x'], 'a.pdf')], configurable: true })
        input.dispatchEvent(new Event('change'))
        await settle()
        expect(items(el).at(-1)?.text).toContain('Upload failed: 500')
    })
})

describe('what the agent streams besides text', () => {
    it('an event of its own is dispatched to the page; an agent error is shown as the answer', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(sseResponse(
            { event: 'booking-changed', detail: { id: 7 } },
            { event: 'agent-error', detail: { message: 'quota exceeded' } },
        ))))
        const el = await chat()
        const seen: unknown[] = []
        document.addEventListener('booking-changed', (e) => seen.push((e as CustomEvent).detail), { once: true })
        await el.send(new CustomEvent('submit', { detail: { value: 'hi' } }))
        expect(seen).toEqual([{ id: 7 }])
        expect(items(el).at(-1)?.text).toContain('quota exceeded')
    })

    it('a stream that ends with nothing said says there was no answer', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(sseResponse())))
        const el = await chat()
        await el.send(new CustomEvent('submit', { detail: { value: 'hi' } }))
        expect(items(el).at(-1)?.text).toBe(chromeText('chatNoAnswer'))
    })

    it('a server error shows the status and its text', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('boom', { status: 500 }))))
        vi.spyOn(console, 'error').mockImplementation(() => {})
        const el = await chat()
        await el.send(new CustomEvent('submit', { detail: { value: 'hi' } }))
        const text = items(el).at(-1)!.text
        expect(text).toContain('500')
        expect(text).toContain('boom')
    })

    it('a dropped connection says the connection closed, not a raw error', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Failed to fetch'))))
        vi.spyOn(console, 'error').mockImplementation(() => {})
        const el = await chat()
        await el.send(new CustomEvent('submit', { detail: { value: 'hi' } }))
        expect(items(el).at(-1)!.text).toBe(chromeText('chatConnectionClosed'))
    })
})

describe('dictation', () => {
    it('what was recognised is put in the field and sent', async () => {
        let instance: { onresult?: (e: unknown) => void, onend?: () => void, onerror?: (e: unknown) => void } | undefined
        const started: string[] = []
        class FakeRecognition {
            lang = ''
            onresult?: (e: unknown) => void
            constructor() { instance = this }
            start() { started.push('start') }
            stop() { started.push('stop') }
        }
        ;(window as unknown as Record<string, unknown>).webkitSpeechRecognition = FakeRecognition
        const fetchMock = vi.fn(() => Promise.resolve(sseResponse('Hello back')))
        vi.stubGlobal('fetch', fetchMock)
        const el = await chat()
        instance!.onresult!({ results: [[{ transcript: 'show my bookings' }]] })
        await settle()
        const init = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
        expect(JSON.parse(String(init.body)).message).toBe('show my bookings')
        expect(items(el)[0].text).toBe('show my bookings')
        // while dictating, the recogniser is restarted when it stops on its own
        vi.useFakeTimers()
        try {
            ;($(el, '.input-bar .mic-btn') as HTMLButtonElement).click()
            expect(started).toEqual(['start'])
            instance!.onend!()
            vi.advanceTimersByTime(250)
            expect(started).toEqual(['start', 'start'])
            const err = vi.spyOn(console, 'error').mockImplementation(() => {})
            instance!.onerror!({ error: 'network' })
            vi.advanceTimersByTime(250)
            expect(started).toEqual(['start', 'start', 'start'])
            err.mockRestore()
        } finally {
            vi.useRealTimers()
        }
    })
})
