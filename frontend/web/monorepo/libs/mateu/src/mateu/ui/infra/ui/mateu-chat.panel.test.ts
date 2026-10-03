// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import './mateu-chat'
import type { MateuChat } from './mateu-chat'
import { CHAT_WIDTH_KEY } from './chatPanel'

Element.prototype.scrollTo = () => {}

async function chat(setup?: (el: MateuChat) => void): Promise<MateuChat> {
    const el = document.createElement('mateu-chat') as MateuChat
    el.sseUrl = '/ai/api/agent/stream'
    ;(el as unknown as { menu: unknown[] }).menu = []
    setup?.(el)
    document.body.appendChild(el)
    await el.updateComplete
    return el
}

const $ = (el: MateuChat, sel: string) => el.shadowRoot!.querySelector(sel)

afterEach(() => {
    localStorage.clear()
    document.body.innerHTML = ''
})

describe("the chat panel's header", () => {
    it('is a titled panel header: icon, a real title, and the expand/close buttons grouped at the end', async () => {
        const el = await chat()
        const header = $(el, '.chat-header')!
        expect(header.querySelector('h2.chat-title')!.textContent!.trim()).toBe('Assistant')
        const actions = header.querySelector('.chat-header-actions')!
        expect(actions.querySelector('.chat-expand')!.getAttribute('aria-label')).toBe('Widen the assistant')
        expect(actions.querySelector('.chat-close')!.getAttribute('aria-label')).toBe('Close the assistant')
        expect(header.textContent).not.toContain('⤢')
    })

    it("carries the app's brand when it gives one", async () => {
        const el = await chat(c => { c.label = 'Pregunta a RIU' })
        expect($(el, '.chat-title')!.textContent!.trim()).toBe('Pregunta a RIU')
    })

    it('widens and restores from ⤢, and closes through the shell', async () => {
        const el = await chat()
        let closed = 0
        el.addEventListener('close-requested', () => closed++)
        ;($(el, '.chat-expand') as HTMLButtonElement).click()
        await el.updateComplete
        expect(el.hasAttribute('expanded')).toBe(true)
        expect($(el, '.chat-expand')!.getAttribute('aria-label')).toBe('Restore the width')
        ;($(el, '.chat-close') as HTMLButtonElement).click()
        expect(closed).toBe(1)
    })
})

describe('the chat panel before the first message', () => {
    it('says what it is for, and the input speaks the page language', async () => {
        const el = await chat()
        expect($(el, '.chat-empty')!.textContent).toContain('Ask whatever you need')
        expect($(el, '.msg-input')!.getAttribute('placeholder')).toBe('Write a message…')
        expect($(el, '.input-bar .nbtn.primary')!.textContent!.trim()).toBe('Send')
    })
})

describe("the chat panel's width", () => {
    it('is 460px unless this browser remembers another, and the shell lays it out from --mateu-chat-width', async () => {
        expect((await chat()).style.getPropertyValue('--mateu-chat-width')).toBe('460px')
        document.body.innerHTML = ''
        localStorage.setItem(CHAT_WIDTH_KEY, '600')
        expect((await chat()).style.getPropertyValue('--mateu-chat-width')).toBe('600px')
    })

    it('changes from the keyboard on its edge, within bounds, and is remembered', async () => {
        const el = await chat()
        const edge = $(el, '.resize-handle')!
        expect(edge.getAttribute('role')).toBe('separator')
        edge.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
        await el.updateComplete
        expect(el.style.getPropertyValue('--mateu-chat-width')).toBe('484px')
        edge.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
        await el.updateComplete
        expect(el.style.getPropertyValue('--mateu-chat-width')).toBe('720px')
        expect(localStorage.getItem(CHAT_WIDTH_KEY)).toBe('720')
        edge.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
        await el.updateComplete
        expect(el.style.getPropertyValue('--mateu-chat-width')).toBe('460px')
    })
})
