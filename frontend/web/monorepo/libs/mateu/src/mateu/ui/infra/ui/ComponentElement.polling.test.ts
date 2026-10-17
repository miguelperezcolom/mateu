// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MateuComponent } from './mateu-component'

/**
 * A timed OnLoad trigger (`timeoutMillis > 0`: the polling idiom) fires after its delay whatever
 * the element's DOM id is. An element filled by a fragment keeps the id the fragment TARGETED
 * while its component carries the server's fresh uuid — the two differ by design, and the
 * schedule used to be dropped silently when they did.
 */
const poll = { type: 'OnLoad', actionId: 'refresh', timeoutMillis: 50, times: 0 }

const element = (elementId: string, componentId: string) => {
    const el = new MateuComponent() as any
    el.id = elementId
    el.component = { id: componentId, type: 'ServerSide', serverSideType: 'x.Poll', children: [], triggers: [{ ...poll }] }
    el.state = {}
    el.data = {}
    const fired: string[] = []
    el.manageActionRequestedEvent = (e: CustomEvent) => fired.push(e.detail.actionId)
    document.body.appendChild(el)
    return { el, fired }
}

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers(); document.body.innerHTML = '' })

describe('timed OnLoad triggers', () => {
    it('fire after their delay when the element id is not the component id', () => {
        const { el, fired } = element('target-of-the-fragment', 'fresh-uuid')
        el.triggerOnLoad()
        expect(fired).toEqual([])
        vi.advanceTimersByTime(60)
        expect(fired).toEqual(['refresh'])
    })

    it('fire when the ids match too', () => {
        const { el, fired } = element('same', 'same')
        el.triggerOnLoad()
        vi.advanceTimersByTime(60)
        expect(fired).toEqual(['refresh'])
    })

    it('do not fire once the element left the page', () => {
        const { el, fired } = element('a', 'b')
        el.triggerOnLoad()
        el.remove()
        vi.advanceTimersByTime(60)
        expect(fired).toEqual([])
    })

    it('do not fire for a component that was replaced by a different one meanwhile', () => {
        const { el, fired } = element('a', 'b')
        el.triggerOnLoad()
        el.component = { ...el.component, serverSideType: 'x.Other', triggers: [] }
        vi.advanceTimersByTime(60)
        expect(fired).toEqual([])
    })
})
