import { describe, expect, it } from 'vitest'
import { CHAT_FOLLOW_KEY, CHAT_WIDTH, CHAT_WIDTH_KEY, clampChatWidth, dragChatWidth, loadChatFollow, loadChatWidth, saveChatFollow, saveChatWidth } from './chatPanel'
import { chatText } from './chatTexts'

const memory = () => {
    const data = new Map<string, string>()
    return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => { data.set(k, v) } }
}
const broken = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('full') } }

describe('the chat panel width', () => {
    it('is 460px by default and stays between 320 and 720', () => {
        expect(CHAT_WIDTH.default).toBe(460)
        expect(clampChatWidth(undefined)).toBe(460)
        expect(clampChatWidth(Number.NaN)).toBe(460)
        expect(clampChatWidth(100)).toBe(320)
        expect(clampChatWidth(5000)).toBe(720)
        expect(clampChatWidth(512.6)).toBe(513)
    })

    it('is remembered per browser, clamped', () => {
        const store = memory()
        expect(loadChatWidth(store)).toBe(460)
        expect(saveChatWidth(600, store)).toBe(600)
        expect(store.getItem(CHAT_WIDTH_KEY)).toBe('600')
        expect(loadChatWidth(store)).toBe(600)
        store.setItem(CHAT_WIDTH_KEY, '9999')
        expect(loadChatWidth(store)).toBe(720)
        store.setItem(CHAT_WIDTH_KEY, 'garbage')
        expect(loadChatWidth(store)).toBe(460)
    })

    it('never fails when the storage is blocked or full', () => {
        expect(loadChatWidth(broken)).toBe(460)
        expect(saveChatWidth(500, broken)).toBe(500)
        expect(loadChatWidth(undefined)).toBe(460)
    })

    it('grows when its edge is dragged towards the end side, in either direction of text', () => {
        expect(dragChatWidth(460, 460, 560)).toBe(560)
        expect(dragChatWidth(460, 460, 400)).toBe(400)
        expect(dragChatWidth(460, 900, 800, true)).toBe(560)
        expect(dragChatWidth(460, 460, 2000)).toBe(720)
    })
})

describe('the chat panel follow mode', () => {
    it('is on unless the user turned it off, and is remembered per browser', () => {
        const store = memory()
        expect(loadChatFollow(store)).toBe(true)
        expect(saveChatFollow(false, store)).toBe(false)
        expect(store.getItem(CHAT_FOLLOW_KEY)).toBe('off')
        expect(loadChatFollow(store)).toBe(false)
        saveChatFollow(true, store)
        expect(loadChatFollow(store)).toBe(true)
        store.setItem(CHAT_FOLLOW_KEY, 'garbage')
        expect(loadChatFollow(store)).toBe(true)
    })

    it('never fails when the storage is blocked or full', () => {
        expect(loadChatFollow(broken)).toBe(true)
        expect(saveChatFollow(false, broken)).toBe(false)
        expect(loadChatFollow(undefined)).toBe(true)
    })
})

describe("the chat panel's words", () => {
    it('follow the page language', () => {
        expect(chatText('title', 'es')).toBe('Asistente')
        expect(chatText('send', 'es-ES')).toBe('Enviar')
        expect(chatText('placeholder', 'en')).toBe('Write a message…')
        expect(chatText('close', 'fr')).toBe("Fermer l'assistant")
        expect(chatText('close', 'nl')).toBe('Close the assistant')
    })
})
