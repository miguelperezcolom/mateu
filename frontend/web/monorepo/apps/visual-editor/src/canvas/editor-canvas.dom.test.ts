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

    it('positions the drop against the frame\'s node boxes, and shows what is being dragged', async () => {
        const canvas = document.createElement('editor-canvas') as any
        canvas.renderer = 'redwood'
        canvas.clientRender = true
        canvas.doc = parsePage(PAGE)
        document.body.appendChild(canvas)
        await canvas.updateComplete
        const frame = canvas.shadowRoot.querySelector('redwood-frame') as any
        // the frame's DOM is out of the pointer's reach while dragging: its nodes' boxes come from the frame
        frame.nodeBoxes = () => [
            { id: 've-root', left: 0, top: 0, width: 800, height: 600 },
            { id: 've-0', left: 20, top: 100, width: 400, height: 40 },
        ]
        const dropped: any[] = []
        canvas.addEventListener('node-dropped', (e: CustomEvent) => dropped.push(e.detail))
        document.dispatchEvent(new CustomEvent('ve-drag-start', { detail: { node: { type: 'Button', id: 'b' }, clientX: 900, clientY: 50 } }))
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 105 })) // the Text's upper half
        await canvas.updateComplete
        const ghost = canvas.shadowRoot.querySelector('.drag-ghost') as HTMLElement
        expect(ghost?.textContent).toContain('Button')
        expect(canvas.shadowRoot.querySelector('.drop-line')).toBeTruthy()

        window.dispatchEvent(new MouseEvent('mouseup', { clientX: 100, clientY: 105 }))
        await canvas.updateComplete
        expect(dropped).toEqual([{ node: { type: 'Button', id: 'b' }, to: { parentPath: [], index: 0 } }])
        expect(canvas.shadowRoot.querySelector('.drag-ghost')).toBeNull()
    })
})

describe('withContainerBoxes', () => {
    it('gives a container Redwood did not stamp the box around its painted descendants', async () => {
        const { withContainerBoxes } = await import('./editor-canvas')
        const boxes = withContainerBoxes([
            { id: 've-1-0', left: 10, top: 10, width: 100, height: 20 },
            { id: 've-1-1', left: 130, top: 10, width: 100, height: 30 },
            { id: 've-2', left: 10, top: 60, width: 50, height: 20 }, // stamped itself: kept as is
        ])
        expect(boxes.find((b) => b.id === 've-1')).toEqual({ id: 've-1', left: 10, top: 10, width: 220, height: 30 })
        expect(boxes.filter((b) => b.id === 've-2')).toHaveLength(1)
        expect(boxes.some((b) => b.id === 've-root')).toBe(false) // the page itself is the canvas
    })
})
