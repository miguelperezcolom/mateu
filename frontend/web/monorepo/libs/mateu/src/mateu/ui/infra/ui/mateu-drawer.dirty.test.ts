// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import './mateu-drawer'
import './mateu-dialog'
import type { MateuDrawer } from './mateu-drawer'
import type { MateuDialog } from './mateu-dialog'
import { dirtyGuard, enclosingOverlay } from './dirtyGuard'

/**
 * Closing a dialog/drawer whose form holds unsaved changes (the crud create/edit drawer the user
 * typed in) asks first: ✕, Esc and the backdrop go through dirtyGuard.confirmDiscard(overlay).
 * "Stay" keeps the overlay and what was typed; "discard" closes it and forgets its edits; a close
 * the SERVER commands (CloseModal after a save → close()) never asks. The question is about THIS
 * overlay: a clean drawer over a dirty page closes without asking, and discarding the drawer's
 * edits leaves the page's own state alone.
 */
describe('closing an overlay with unsaved changes', () => {
    let confirmSpy: MockInstance<(message?: string) => boolean>

    beforeEach(() => {
        dirtyGuard.install()
        dirtyGuard.markClean()
        confirmSpy = vi.spyOn(window, 'confirm')
    })

    afterEach(() => {
        confirmSpy.mockRestore()
        dirtyGuard.markClean()
        document.body.innerHTML = ''
    })

    const drawer = async () => {
        const el = document.createElement('mateu-drawer') as MateuDrawer
        el.component = { type: 'ClientSide', id: 'd', children: [],
            metadata: { type: 'Drawer', id: 'crud-edit-drawer', initialData: { id: '1' } } } as never
        document.body.appendChild(el)
        await el.updateComplete
        return el
    }

    const dialog = async () => {
        const el = document.createElement('mateu-dialog') as MateuDialog
        el.component = { type: 'ClientSide', id: 'g', children: [],
            metadata: { type: 'Dialog', headerTitle: 'Edit', closeButtonOnHeader: true } } as never
        document.body.appendChild(el)
        await el.updateComplete
        return el
    }

    /** What mateu-component sends when a tracked form inside the overlay changes / (re)loads. */
    const fromInside = (overlay: HTMLElement, type: 'dirty' | 'clean', detail: object = {}) => {
        const field = document.createElement('div')
        overlay.appendChild(field)
        field.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }))
        field.remove()
    }

    it('closes a clean drawer without asking', async () => {
        const el = await drawer()
        const close = vi.spyOn(el, 'close')
        el.requestClose()
        expect(confirmSpy).not.toHaveBeenCalled()
        expect(close).toHaveBeenCalled()
    })

    it('asks before dropping a dirty drawer; "stay" keeps it open and dirty', async () => {
        const el = await drawer()
        fromInside(el, 'dirty')
        expect(dirtyGuard.overlayDirty(el)).toBe(true)
        confirmSpy.mockReturnValue(false)
        const close = vi.spyOn(el, 'close')
        el.requestClose()
        expect(confirmSpy).toHaveBeenCalledWith(dirtyGuard.discardMessage)
        expect(close).not.toHaveBeenCalled()
        expect(dirtyGuard.overlayDirty(el)).toBe(true)
    })

    it('"discard" closes the drawer and forgets its edits', async () => {
        const el = await drawer()
        fromInside(el, 'dirty')
        confirmSpy.mockReturnValue(true)
        const close = vi.spyOn(el, 'close')
        el.requestClose()
        expect(close).toHaveBeenCalled()
        expect(dirtyGuard.dirty).toBe(false)
    })

    it('Esc and the ✕ ask too', async () => {
        const el = await drawer()
        fromInside(el, 'dirty')
        confirmSpy.mockReturnValue(false)
        const close = vi.spyOn(el, 'close')
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        ;(el.shadowRoot!.querySelector('.drawer-close') as HTMLButtonElement).click()
        ;(el.shadowRoot!.querySelector('.backdrop') as HTMLElement).click()
        expect(confirmSpy).toHaveBeenCalledTimes(3)
        expect(close).not.toHaveBeenCalled()
    })

    it('a close the server commands (CloseModal after a save) never asks', async () => {
        const el = await drawer()
        fromInside(el, 'dirty')
        el.close()
        expect(confirmSpy).not.toHaveBeenCalled()
        expect(dirtyGuard.dirty).toBe(false)
    })

    it('scopes the question to the overlay: a dirty page behind is neither asked about nor cleaned', async () => {
        dirtyGuard.markDirty()
        const el = await drawer()
        el.requestClose()
        expect(confirmSpy).not.toHaveBeenCalled()

        const other = await drawer()
        fromInside(other, 'dirty')
        confirmSpy.mockReturnValue(true)
        other.requestClose()
        expect(confirmSpy).toHaveBeenCalledTimes(1)
        // the page's own unsaved changes are still there
        expect(dirtyGuard.dirty).toBe(true)
    })

    it('a refused save re-sending the drawer in place keeps it dirty; MarkAsClean cleans it', async () => {
        const el = await drawer()
        fromInside(el, 'dirty')
        // the server re-sends the same drawer (error banner + typed values)
        el.component = { type: 'ClientSide', id: 'd', children: [],
            metadata: { type: 'Drawer', id: 'crud-edit-drawer', initialData: { id: '1', name: 'typed' } } } as never
        await el.updateComplete
        // ...whose form reloads, sending its load-clean
        fromInside(el, 'clean', { reason: 'load' })
        expect(dirtyGuard.overlayDirty(el)).toBe(true)
        // a MarkAsClean command from the host (save and next, a successful save) is authoritative
        document.body.dispatchEvent(new CustomEvent('clean', { detail: {}, bubbles: true, composed: true }))
        expect(dirtyGuard.dirty).toBe(false)
    })

    it('a form loading inside the drawer cleans only the drawer', async () => {
        dirtyGuard.markDirty()
        const el = await drawer()
        fromInside(el, 'dirty')
        fromInside(el, 'clean', { reason: 'load' })
        expect(dirtyGuard.overlayDirty(el)).toBe(false)
        expect(dirtyGuard.dirty).toBe(true)
    })

    it('the dialog asks the same way (✕, Esc, backdrop)', async () => {
        const el = await dialog()
        fromInside(el, 'dirty')
        confirmSpy.mockReturnValue(false)
        ;(el.shadowRoot!.querySelector('.dialog-close') as HTMLButtonElement).click()
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        const backdrop = el.shadowRoot!.querySelector('.backdrop') as HTMLElement
        backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(confirmSpy).toHaveBeenCalledTimes(3)
        expect(el.opened).toBe(true)
        confirmSpy.mockReturnValue(true)
        el.requestClose()
        expect(el.opened).toBe(false)
        expect(dirtyGuard.dirty).toBe(false)
    })

    it('enclosingOverlay finds the dialog/drawer around an element, across shadow roots', async () => {
        const el = await drawer()
        const host = document.createElement('div')
        el.shadowRoot!.appendChild(host)
        const inner = host.attachShadow({ mode: 'open' })
        const button = document.createElement('button')
        inner.appendChild(button)
        expect(enclosingOverlay(button)).toBe(el)
        expect(enclosingOverlay(el)).toBe(el)
        expect(enclosingOverlay(document.body)).toBeUndefined()
    })
})
