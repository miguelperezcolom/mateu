// @vitest-environment jsdom
// An item that does something only when the server gave it an action (a kanban card, a timeline
// entry, a stat tile, an org-chart node, a feature, a status row, a gantt bar, a calendar event) is
// a button — role, tab stop, Enter/Space — ONLY then. They used to carry an unconditional
// role="button" tabindex="0": an inert item was announced as a button, took a tab stop and did
// nothing when pressed (found walking the display gallery, where most items have no action).
import { describe, expect, it } from 'vitest'
import './mateu-kanban'
import './mateu-timeline'
import './mateu-stat'
import './mateu-org-chart'
import './mateu-feature-grid'
import './mateu-status-list'
import './mateu-gantt'
import './mateu-calendar'

const mount = async (tag: string, props: Record<string, unknown>) => {
    const el = document.createElement(tag) as any
    Object.assign(el, props)
    document.body.appendChild(el)
    await el.updateComplete
    return el as HTMLElement & { shadowRoot: ShadowRoot }
}

const buttons = (el: HTMLElement & { shadowRoot: ShadowRoot }) =>
    [...el.shadowRoot.querySelectorAll('[role="button"]')].map((b) => b.getAttribute('tabindex'))

const cases: [string, (action: boolean) => Record<string, unknown>][] = [
    ['mateu-kanban', (a) => ({ columns: [{ id: 'c', title: 'C', cards: [{ id: 'k', title: 'K', actionId: a ? 'open' : undefined }] }] })],
    ['mateu-timeline', (a) => ({ items: [{ id: 'i', title: 'I', actionId: a ? 'open' : undefined }] })],
    ['mateu-stat', (a) => ({ label: 'L', value: '1', actionId: a ? 'open' : undefined })],
    ['mateu-org-chart', (a) => ({ root: { id: 'r', title: 'R', children: [], actionId: a ? 'open' : undefined } })],
    ['mateu-feature-grid', (a) => ({ features: [{ title: 'F', actionId: a ? 'open' : undefined }] })],
    ['mateu-status-list', (a) => ({ items: [{ id: 's', title: 'S' }], rowActionId: a ? 'open' : undefined })],
    ['mateu-gantt', (a) => ({ tasks: [{ id: 't', title: 'T', start: '2026-10-01', end: '2026-10-05' }], onTaskSelectionActionId: a ? 'pick' : '' })],
    ['mateu-calendar', (a) => ({ month: '2026-10-01', events: [{ id: 'e', title: 'E', date: '2026-10-05', actionId: a ? 'open' : undefined }] })],
]

describe('items that act only with an action are buttons only then', () => {
    for (const [tag, props] of cases) {
        it(`${tag}: inert → no button; with an action → a focusable button`, async () => {
            const inert = await mount(tag, props(false))
            expect(buttons(inert)).toEqual([])
            inert.remove()
            const active = await mount(tag, props(true))
            const found = buttons(active)
            expect(found.length).toBeGreaterThan(0)
            expect(found.every((t) => t === '0')).toBe(true)
            active.remove()
        })
    }
})

describe('a folded foldout panel', () => {
    it('is a strip the keyboard can reach and open', async () => {
        await import('./mateu-foldout')
        const el = await mount('mateu-foldout', { panels: [{ title: 'Notes', open: false }] })
        const strip = el.shadowRoot.querySelector('.strip') as HTMLElement
        expect(strip.getAttribute('role')).toBe('button')
        expect(strip.getAttribute('tabindex')).toBe('0')
        strip.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        await (el as any).updateComplete
        expect(el.shadowRoot.querySelector('.strip')).toBeNull()
        el.remove()
    })
})
