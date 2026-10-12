// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import './mateu-dialog'
import type { MateuDialog } from './mateu-dialog'

/**
 * The neutral modal dialog's accessibility contract: it announces itself as a modal dialog with a
 * name, takes the focus on open and gives it back on close, and Esc closes only the dialog the key
 * was pressed in (nested overlays unwind one at a time).
 */
describe('mateu-dialog', () => {
    const frame = () => new Promise((r) => requestAnimationFrame(() => r(undefined)))

    const open = async (metadata: Record<string, unknown>, parent: Node = document.body) => {
        const dialog = document.createElement('mateu-dialog') as MateuDialog
        dialog.component = { type: 'ClientSide', id: 'dlg', children: [],
            metadata: { type: 'Dialog', ...metadata } } as never
        parent.appendChild(dialog)
        await dialog.updateComplete
        return dialog
    }
    const panelOf = (d: MateuDialog) => d.shadowRoot!.querySelector('[role="dialog"]') as HTMLElement

    afterEach(() => { document.body.innerHTML = ''; vi.useRealTimers() })

    it('is a named modal dialog', async () => {
        const d = await open({ headerTitle: 'Edit contact' })
        const panel = panelOf(d)
        expect(panel.getAttribute('aria-modal')).toBe('true')
        expect(panel.getAttribute('aria-label')).toBe('Edit contact')
        expect(d.shadowRoot!.querySelector('.dialog-title')!.textContent).toBe('Edit contact')
    })

    it('falls back to a generic name when it has no title', async () => {
        const d = await open({})
        expect(panelOf(d).getAttribute('aria-label')).toBe('Dialog')
    })

    it('a modeless dialog is not modal', async () => {
        const d = await open({ modeless: true, headerTitle: 'Help' })
        expect(panelOf(d).getAttribute('aria-modal')).toBe('false')
    })

    it('takes the focus on open and gives it back on close', async () => {
        const opener = document.createElement('button')
        opener.textContent = 'open'
        document.body.appendChild(opener)
        opener.focus()
        expect(document.activeElement).toBe(opener)

        const d = await open({ headerTitle: 'T' })
        await frame()
        // nothing tabbable inside (jsdom has no layout) → the panel itself owns the focus
        expect(d.shadowRoot!.activeElement).toBe(panelOf(d))

        d.close()
        expect(document.activeElement).toBe(opener)
    })

    it('a modeless dialog does not steal the focus', async () => {
        const opener = document.createElement('button')
        document.body.appendChild(opener)
        opener.focus()
        await open({ modeless: true })
        await frame()
        expect(document.activeElement).toBe(opener)
    })

    it('Esc closes it, and only the one the key was pressed in', async () => {
        const outer = await open({ headerTitle: 'outer' })
        const inner = await open({ headerTitle: 'inner' }, outer)
        inner.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }))
        expect(inner.opened).toBe(false)
        expect(outer.opened).toBe(true)
    })

    it('the header close button closes it and unmounts it after the fade-out', async () => {
        vi.useFakeTimers()
        const d = await open({ headerTitle: 'T', closeButtonOnHeader: true })
        const btn = d.shadowRoot!.querySelector('.dialog-close') as HTMLButtonElement
        expect(btn.getAttribute('aria-label')).toBeTruthy()
        btn.click()
        expect(d.opened).toBe(false)
        vi.advanceTimersByTime(600)
        expect(d.isConnected).toBe(false)
    })

    it('a click on the backdrop closes a modal one, but not a modeless one', async () => {
        const modal = await open({})
        const backdrop = modal.shadowRoot!.querySelector('.backdrop') as HTMLElement
        backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(modal.opened).toBe(false)

        const modeless = await open({ modeless: true })
        ;(modeless.shadowRoot!.querySelector('.backdrop') as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(modeless.opened).toBe(true)
    })

    it('a click inside the panel does not close it', async () => {
        const d = await open({ headerTitle: 'T' })
        panelOf(d).dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(d.opened).toBe(true)
    })

    it('honours _closeAfterMillis from a fragment', async () => {
        vi.useFakeTimers()
        const d = await open({ headerTitle: 'T' })
        d.applyFragment({ targetComponentId: 'dlg', state: { _closeAfterMillis: 1000 } } as never)
        vi.advanceTimersByTime(1001)
        expect(d.opened).toBe(false)
    })

    it('seeds its state from initialData and interpolates the title with it', async () => {
        const d = await open({ headerTitle: '${state.name}', initialData: { name: 'Ada' } })
        await d.updateComplete
        expect(d.state).toEqual({ name: 'Ada' })
        expect(panelOf(d).getAttribute('aria-label')).toBe('Ada')
    })
})
