// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { parsePage } from '../model/pageModel'

// The canvas's drag & drop over the REDWOOD canvas: the page is painted in an iframe, which takes
// the mouse events for itself unless the frame is told a drag is on (`dragging` → pointer-events:
// none). Without that the palette drop never reached the editor (nothing inserted until the next
// click, nothing selected, no undo) while the Vaadin canvas worked.

const PAGE = 'type: VerticalLayout\ncontent:\n  - type: Text\n    text: Hello\n'

beforeEach(async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 404 })))
    ;(globalThis as any).ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }
    await import('./editor-canvas')
})
afterEach(() => {
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
})

describe('<editor-canvas renderer="redwood"> — a component dragged from the palette', () => {
    it('lets the pointer through the frame while dragging, and the drop lands', async () => {
        const canvas = document.createElement('editor-canvas') as any
        canvas.renderer = 'redwood'
        canvas.clientRender = true
        canvas.doc = parsePage(PAGE)
        document.body.appendChild(canvas)
        await canvas.updateComplete
        const frame = canvas.shadowRoot.querySelector('redwood-frame') as HTMLElement
        expect(frame).toBeTruthy()
        expect(frame.hasAttribute('dragging')).toBe(false)

        const dropped: any[] = []
        canvas.addEventListener('node-dropped', (e: CustomEvent) => dropped.push(e.detail))
        document.dispatchEvent(new CustomEvent('ve-drag-start', { detail: { node: { type: 'FormField', id: 'f' }, clientX: 0, clientY: 0 } }))
        await canvas.updateComplete
        // the frame's iframe stops taking the mouse: the moves and the release reach the editor
        expect(frame.hasAttribute('dragging')).toBe(true)

        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 0, clientY: 0 }))
        window.dispatchEvent(new MouseEvent('mouseup', { clientX: 0, clientY: 0 }))
        await canvas.updateComplete
        expect(dropped).toEqual([{ node: { type: 'FormField', id: 'f' }, to: { parentPath: [], index: 1 } }])
        // and once dropped the frame takes the mouse again (a click in it selects)
        expect(frame.hasAttribute('dragging')).toBe(false)
    })
})
