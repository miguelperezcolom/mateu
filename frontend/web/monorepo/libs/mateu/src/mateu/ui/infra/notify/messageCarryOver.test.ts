// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type Message from '@mateu/shared/apiClients/dtos/Message.ts'
import {
    CARRY_TTL_MS,
    RECENT_WINDOW_MS,
    carryOverRecentMessages,
    noteShownMessage,
    reloadsThePage,
    resetCarryOver,
    takeCarriedMessages,
    toastOfCarried,
} from './messageCarryOver'

const msg = (m: Partial<Message>): Message => ({ title: '', text: '', position: 'bottomEnd', variant: 'success', duration: 3000, ...m }) as Message

/**
 * An answer with a success message AND a NavigateTo: the NavigateTo loads a new page, so the toast
 * travels across the load (this tab's sessionStorage) and the next page shows it.
 */
describe('messageCarryOver', () => {
    beforeEach(() => { resetCarryOver(); sessionStorage.clear() })
    afterEach(() => { resetCarryOver(); sessionStorage.clear() })

    it('the message the answer just showed is shown again on the page the NavigateTo loads', () => {
        noteShownMessage(msg({ text: 'Ticket created', title: 'Done' }), 1000)
        expect(carryOverRecentMessages(1200)).toBe(1)
        const carried = takeCarriedMessages(2000)
        expect(carried.map(toastOfCarried)).toEqual([
            { text: 'Ticket created', title: 'Done', variant: 'success', position: 'bottomEnd', duration: 3000, persistence: null, key: null },
        ])
        // taken once
        expect(takeCarriedMessages(2100)).toEqual([])
    })

    it('a message shown long before the NavigateTo belongs to another answer and stays behind', () => {
        noteShownMessage(msg({ text: 'old' }), 0)
        noteShownMessage(msg({ text: 'new' }), RECENT_WINDOW_MS + 500)
        expect(carryOverRecentMessages(RECENT_WINDOW_MS + 600)).toBe(1)
        expect(takeCarriedMessages(RECENT_WINDOW_MS + 700).map((m) => m.text)).toEqual(['new'])
    })

    it('nothing shown, nothing carried; a carried message is not carried twice', () => {
        expect(carryOverRecentMessages(10)).toBe(0)
        expect(sessionStorage.getItem('mateu-carried-messages')).toBeNull()
        noteShownMessage(msg({ text: 'x' }), 10)
        carryOverRecentMessages(20)
        expect(carryOverRecentMessages(30)).toBe(0)
        expect(takeCarriedMessages(40)).toHaveLength(1)
    })

    it('only the text travels: actions run on a screen the load destroys; an inbox message is a toast', () => {
        noteShownMessage(msg({ text: 'Deleted', undoActionId: 'undo', actions: [{ label: 'Undo', actionId: 'undo' }], persistence: 'inbox', key: 'k' }), 0)
        carryOverRecentMessages(1)
        const [toast] = takeCarriedMessages(2).map(toastOfCarried)
        expect(toast).toEqual({ text: 'Deleted', title: undefined, variant: 'success', position: 'bottomEnd', duration: 3000, persistence: null, key: 'k' })
    })

    it('a stale carried message (a load that never came, a later visit) is dropped', () => {
        noteShownMessage(msg({ text: 'x' }), 0)
        carryOverRecentMessages(0)
        expect(takeCarriedMessages(CARRY_TTL_MS + 1)).toEqual([])
    })

    it('garbage in storage is ignored', () => {
        sessionStorage.setItem('mateu-carried-messages', '{"not":"a list"}')
        expect(takeCarriedMessages()).toEqual([])
        sessionStorage.setItem('mateu-carried-messages', '[{"text":3},null,"x"]')
        expect(takeCarriedMessages()).toEqual([])
    })

    it('a fragment move on the same document does not load a page; anything else does', () => {
        expect(reloadsThePage('/tickets', 'https://a.test/tickets/new')).toBe(true)
        expect(reloadsThePage('/tickets/new', 'https://a.test/tickets/new')).toBe(true)
        expect(reloadsThePage('#top', 'https://a.test/tickets/new')).toBe(false)
        expect(reloadsThePage('/tickets/new?x=1#top', 'https://a.test/tickets/new')).toBe(true)
    })
})
