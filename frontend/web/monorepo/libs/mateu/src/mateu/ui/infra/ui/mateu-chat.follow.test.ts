// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const rendered: unknown[] = []
vi.mock('./builtInRenderTarget', () => ({
    renderScreenInShell: (_origin: unknown, request: unknown) => { rendered.push(request); return Promise.resolve() },
}))
const navigated: string[] = []
vi.mock('./rowRoute', () => ({
    navigateToRoute: (_from: unknown, route: string) => { navigated.push(route) },
    leaveToRoute: (_from: unknown, route: string) => { navigated.push(route); return true },
}))

import './mateu-chat'
import type { MateuChat } from './mateu-chat'
import { declareAgentEvent } from './agentEventPolicy'
import { CHAT_FOLLOW_KEY } from './chatPanel'

/**
 * Follow mode (the robot "Follow" button in the chat header): on, the agent's navigations and generated screens are
 * applied as they arrive; off, they wait on the answer as buttons and the view stays where it is.
 */

Element.prototype.scrollTo = () => {}
const sse = (payload: unknown) => `data:${JSON.stringify(payload)}\n\n`
const settle = async () => { for (let i = 0; i < 10; i++) await new Promise(r => setTimeout(r, 0)) }

function chat(): MateuChat {
    const el = document.createElement('mateu-chat') as MateuChat
    el.sseUrl = '/agent'
    document.body.appendChild(el)
    return el
}

const stream = (...payloads: unknown[]) =>
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(payloads.map(p => typeof p === 'string' ? p : sse(p)).join(''), { status: 200 }))))

const followButton = (el: MateuChat) => el.shadowRoot!.querySelector('.chat-follow') as HTMLElement
const deferredButtons = (el: MateuChat) => [...el.shadowRoot!.querySelectorAll('.chat-deferred-action')] as HTMLButtonElement[]

beforeEach(() => localStorage.clear())
afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
    rendered.length = 0
    navigated.length = 0
    localStorage.clear()
})

describe('mateu-chat follow mode', () => {
    it("reads Following while on and Follow while off, in the page language, unless the app gives its own labels", async () => {
        const el = chat()
        await el.updateComplete
        expect(followButton(el).textContent?.trim()).toBe('Following')
        followButton(el).click()
        await el.updateComplete
        expect(followButton(el).textContent?.trim()).toBe('Follow')
        el.followLabel = 'Follow the copilot'
        el.followingLabel = 'Following the copilot'
        await el.updateComplete
        expect(followButton(el).textContent?.trim()).toBe('Follow the copilot')
        followButton(el).click()
        await el.updateComplete
        expect(followButton(el).textContent?.trim()).toBe('Following the copilot')
        el.followLabel = '   '
        el.followingLabel = ''
        document.documentElement.lang = 'es'
        el.requestUpdate()
        await el.updateComplete
        expect(followButton(el).textContent?.trim()).toBe('Siguiendo')
        followButton(el).click()
        await el.updateComplete
        expect(followButton(el).textContent?.trim()).toBe('Seguir')
        document.documentElement.lang = ''
    })

    it('is on by default: the button reads Following, pressed, and the agent moves the view as it always did', async () => {
        const el = chat()
        await el.updateComplete
        expect(followButton(el).getAttribute('aria-pressed')).toBe('true')
        expect(followButton(el).textContent?.trim()).toBe('Following')
        stream({ event: 'navigation-requested', detail: { route: '/orders' } }, { event: 'render-screen', detail: { yaml: 'type: Text' } }, 'data:done\n\n')
        await el.send(new CustomEvent('submit', { detail: { value: 'x' } }))
        await settle()
        expect(navigated).toEqual(['/orders'])
        expect(rendered).toHaveLength(1)
        await el.updateComplete
        expect(deferredButtons(el)).toHaveLength(0)
    })

    it('off, the view stays put: navigations and generated screens wait on the answer until clicked', async () => {
        const el = chat()
        await el.updateComplete
        followButton(el).click()
        await el.updateComplete
        expect(followButton(el).getAttribute('aria-pressed')).toBe('false')
        expect(followButton(el).textContent?.trim()).toBe('Follow')
        expect(localStorage.getItem(CHAT_FOLLOW_KEY)).toBe('off')

        stream({ event: 'navigation-requested', detail: { route: '/orders' } }, { event: 'render-screen', detail: { yaml: 'type: Text' } }, 'data:Here they are.\n\n')
        await el.send(new CustomEvent('submit', { detail: { value: 'x' } }))
        await settle()
        expect(navigated).toEqual([])
        expect(rendered).toEqual([])

        await el.updateComplete
        const buttons = deferredButtons(el)
        expect(buttons.map(b => b.textContent?.trim())).toEqual(['Open /orders', 'Show the generated screen'])
        buttons[0].click()
        buttons[1].click()
        await settle()
        expect(navigated).toEqual(['/orders'])
        expect(rendered).toEqual([{ yaml: 'type: Text', target: 'content' }])
    })

    it('off, the events that do not move the view still apply', async () => {
        localStorage.setItem(CHAT_FOLLOW_KEY, 'off')
        const el = chat()
        await el.updateComplete
        expect(followButton(el).getAttribute('aria-pressed')).toBe('false') // remembered
        const heard: unknown[] = []
        document.addEventListener('highlight-row', e => heard.push((e as CustomEvent).detail.id))
        const release = declareAgentEvent('highlight-row')
        stream({ event: 'highlight-row', detail: { id: 7 } }, 'data:ok\n\n')
        await el.send(new CustomEvent('submit', { detail: { value: 'x' } }))
        await settle()
        release()
        expect(heard).toEqual([7])
        await el.updateComplete
        expect(deferredButtons(el)).toHaveLength(0)
    })
})
