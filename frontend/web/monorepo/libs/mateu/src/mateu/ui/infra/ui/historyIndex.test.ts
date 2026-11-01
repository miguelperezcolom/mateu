import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installHistoryIndex, notePopState, resetHistoryIndexForTests, stay } from './historyIndex'

/**
 * Staying after a refused back/forward ("unsaved changes") undoes the move in its own direction.
 * Pushing a copy of our URL — the old way — after a FORWARD built [A, B, C, B*] (Fable review A19).
 */
const fakeWindow = () => {
    const entries: Array<{ state: any, url: string }> = [{ state: null, url: 'https://x/a' }]
    let at = 0
    const location = { href: 'https://x/a' }
    const history: any = {
        get state() { return entries[at].state },
        pushState(state: any, _t: string, url: string) { entries.splice(at + 1); entries.push({ state, url }); at++; location.href = url },
        replaceState(state: any, _t: string, url?: string) { entries[at] = { state, url: url ?? entries[at].url }; location.href = entries[at].url },
        go: vi.fn((delta: number) => { at += delta; location.href = entries[at].url }),
    }
    return { win: { history, location } as any, entries, pos: () => at, moveTo: (i: number) => { at = i; location.href = entries[i].url } }
}

describe('history index', () => {
    beforeEach(() => resetHistoryIndexForTests())

    it('a refused FORWARD goes back to where the user was, keeping the forward entries', () => {
        const w = fakeWindow()
        installHistoryIndex(w.win)
        w.win.history.pushState(null, '', 'https://x/b')
        w.win.history.pushState(null, '', 'https://x/c')
        w.moveTo(1) // Back to b (popstate)
        const back = notePopState(w.win.history.state, w.win)!
        expect(back.to).toBe(1)
        w.moveTo(2) // Forward to c (popstate) — the user refuses to leave b
        const moved = notePopState(w.win.history.state, w.win)!
        expect(moved.from.idx).toBe(1)
        stay(moved, w.win)
        expect(w.win.history.go).toHaveBeenCalledWith(-1)
        expect(w.entries.map(e => e.url)).toEqual(['https://x/a', 'https://x/b', 'https://x/c'])
        // the popstate our own go() fires is not a navigation
        expect(notePopState(w.win.history.state, w.win)).toBeNull()
    })

    it('without indexes (an entry we did not write) it falls back to pushing the URL we were on', () => {
        const w = fakeWindow()
        const pushSpy = vi.spyOn(w.win.history, 'pushState')
        stay({ from: { idx: 0, href: 'https://x/b' } }, w.win)
        expect(pushSpy).toHaveBeenCalledWith({}, '', 'https://x/b')
    })
})
