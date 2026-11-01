// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../a11y/announcer', () => ({ announce: vi.fn() }))
import { announce } from '../a11y/announcer'
import { ANNOUNCE_DELAY_MS, notePageTitle, resetWindowTitleForTests, setServerWindowTitle } from './windowTitle'

/**
 * A YAML record page (`title: ${state.name}`, record from `data:`) is named by the server before its
 * record exists ("28"). The tab follows the page title once it resolves, and the screen reader hears
 * the page's name ONCE — the record's, when it lands within the beat (Fable review A9).
 */
describe('window title', () => {
    beforeEach(() => { vi.useFakeTimers(); resetWindowTitleForTests(); (announce as any).mockClear() })
    afterEach(() => { vi.useRealTimers() })

    it("the record's name replaces the route fallback, and is the one announcement", () => {
        setServerWindowTitle('28')
        expect(document.title).toBe('28')
        notePageTitle('Voyager 1')
        expect(document.title).toBe('Voyager 1')
        vi.advanceTimersByTime(ANNOUNCE_DELAY_MS)
        expect(announce).toHaveBeenCalledTimes(1)
        expect(announce).toHaveBeenCalledWith('Voyager 1')
    })

    it('a name resolved after the announcement updates the tab silently (never read twice)', () => {
        setServerWindowTitle('28')
        vi.advanceTimersByTime(ANNOUNCE_DELAY_MS)
        notePageTitle('Voyager 1')
        expect(document.title).toBe('Voyager 1')
        expect(announce).toHaveBeenCalledTimes(1)
        expect(announce).toHaveBeenCalledWith('28')
    })

    it('an unresolved or empty title changes nothing', () => {
        setServerWindowTitle('Missions')
        notePageTitle('')
        notePageTitle('${state.name}')
        expect(document.title).toBe('Missions')
    })
})
