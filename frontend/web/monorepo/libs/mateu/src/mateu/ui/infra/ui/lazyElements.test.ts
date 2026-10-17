// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'lit'
import { ensureElement, lazyElementTags, registerLazyElement, requireElement } from './lazyElements'
import { renderGantt } from './renderers/ganttRenderer'

/**
 * The optional elements load on first use: a renderer starts the import and draws the tag at
 * once; the element upgrades in place when its chunk arrives, keeping what it was given.
 */
afterEach(() => { vi.restoreAllMocks(); document.body.innerHTML = '' })

describe('lazy elements', () => {
    it('knows the optional elements Mateu ships', () => {
        expect(lazyElementTags()).toEqual(expect.arrayContaining([
            'mateu-chat', 'mateu-workflow', 'mateu-form-editor', 'mateu-planning-board',
            'mateu-gantt', 'mateu-matrix-grid', 'mateu-signature-pad', 'mateu-camera-capture',
        ]))
    })

    it('loads a tag once, however many callers ask at the same time, and then it is defined', async () => {
        const load = vi.fn(async () => { customElements.define('x-lazy-once', class extends HTMLElement {}) })
        registerLazyElement('x-lazy-once', load)
        await Promise.all([ensureElement('x-lazy-once'), ensureElement('x-lazy-once'), ensureElement('x-lazy-once')])
        expect(load).toHaveBeenCalledTimes(1)
        expect(customElements.get('x-lazy-once')).toBeDefined()
        await ensureElement('x-lazy-once')
        expect(load).toHaveBeenCalledTimes(1)
    })

    it('an already defined tag resolves without loading anything', async () => {
        customElements.define('x-already-there', class extends HTMLElement {})
        const load = vi.fn(async () => {})
        registerLazyElement('x-already-there', load)
        await ensureElement('x-already-there')
        expect(load).not.toHaveBeenCalled()
    })

    it('an unknown tag is refused', async () => {
        await expect(ensureElement('x-nobody-knows')).rejects.toThrow('x-nobody-knows')
    })

    it('a failed load is reported and forgotten, so the next call tries again', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        let attempt = 0
        registerLazyElement('x-flaky', async () => {
            if (++attempt === 1) throw new Error('offline')
            customElements.define('x-flaky', class extends HTMLElement {})
        })
        requireElement('x-flaky')
        await vi.waitFor(() => expect(warn).toHaveBeenCalled())
        await ensureElement('x-flaky')
        expect(attempt).toBe(2)
        expect(customElements.get('x-flaky')).toBeDefined()
    })

    it('the first registration of a tag wins', async () => {
        const mine = vi.fn(async () => { customElements.define('x-first-wins', class extends HTMLElement {}) })
        const theirs = vi.fn(async () => {})
        registerLazyElement('x-first-wins', mine)
        registerLazyElement('x-first-wins', theirs)
        await ensureElement('x-first-wins')
        expect(mine).toHaveBeenCalled()
        expect(theirs).not.toHaveBeenCalled()
    })

    it('a renderer draws the tag at once and the element upgrades with the properties it was given', async () => {
        const host = document.createElement('div')
        document.body.appendChild(host)
        const tasks = [{ id: 't1', title: 'Design', start: '2026-01-01', end: '2026-01-10', progress: 50 }]
        render(renderGantt({ id: 'g', type: 'ClientSide', metadata: { type: 'Gantt', tasks } } as never), host)
        const el = host.querySelector('mateu-gantt') as HTMLElement & { tasks?: unknown, updateComplete?: Promise<unknown> }
        expect(el).not.toBeNull()
        await ensureElement('mateu-gantt')
        expect(el.updateComplete).toBeDefined()
        await el.updateComplete
        expect(el.tasks).toEqual(tasks)
        expect(el.shadowRoot?.textContent).toContain('Design')
    })
})
