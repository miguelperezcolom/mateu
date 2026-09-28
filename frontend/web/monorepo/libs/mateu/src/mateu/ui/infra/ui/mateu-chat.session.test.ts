// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { onSessionExpired } from '@infra/http/sessionGuard.ts'
import './mateu-chat'
import type { MateuChat } from './mateu-chat'

// jsdom lays nothing out, so it has no scrolling; the chat scrolls to its last message.
Element.prototype.scrollTo = () => {}

const stream = (text: string) => new Response(`data: ${text}\n\n`, { status: 200 })

function chat(): MateuChat {
    const el = document.createElement('mateu-chat') as MateuChat
    el.sseUrl = '/ai/api/agent/stream'
    ;(el as unknown as { menu: unknown[] }).menu = []
    document.body.appendChild(el)
    return el
}

async function say(el: MateuChat, text: string) {
    await el.send(new CustomEvent('submit', { detail: { value: text } }))
}

const items = (el: MateuChat) => (el as unknown as { items: { text: string }[] }).items

afterEach(() => {
    onSessionExpired(undefined)
    vi.unstubAllGlobals()
    localStorage.clear()
    document.body.innerHTML = ''
})

describe('mateu-chat, when the token expired while the panel sat open', () => {
    it('lets the page refresh the token and sends the message again with the new one', async () => {
        localStorage.setItem('__mateu_auth_token', 'expired')
        const answers = [new Response('', { status: 401 }), stream('hola')]
        const fetch = vi.fn((url: string) => url === '/ai/api/agent/stream'
            ? Promise.resolve(answers.shift()!)
            : Promise.reject(new Error('no local agent')))
        vi.stubGlobal('fetch', fetch)
        onSessionExpired(context => {
            localStorage.setItem('__mateu_auth_token', 'fresh')
            context.retry()
        })

        const el = chat()
        await say(el, '¿llegadas de hoy?')

        const sent = fetch.mock.calls.filter(([url]) => url === '/ai/api/agent/stream')
            .map(call => (call as unknown as [string, RequestInit])[1].headers as Record<string, string>)
        expect(sent.map(h => h.Authorization)).toEqual(['Bearer expired', 'Bearer fresh'])
        expect(items(el).at(-1)?.text).toContain('hola')
    })

    it('still shows the 401 when nobody re-authenticates', async () => {
        vi.stubGlobal('fetch', vi.fn((url: string) => url === '/ai/api/agent/stream'
            ? Promise.resolve(new Response('', { status: 401 }))
            : Promise.reject(new Error('no local agent'))))

        const el = chat()
        await say(el, 'hola')

        expect(items(el).at(-1)?.text).toContain('401')
    })
})
