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

const TWO = 'type: VerticalLayout\ncontent:\n  - type: Text\n    text: Hello\n  - type: Text\n    text: World\n'

// A press on a node painted INSIDE the Redwood frame never reaches the editor's window (the iframe
// keeps the mouse while the button is down): the frame relays the press, the moves and the release
// by postMessage, in its own viewport, and the canvas runs the same move drag as on Vaadin.
const redwoodCanvas = async (yaml: string) => {
    const canvas = document.createElement('editor-canvas') as any
    canvas.renderer = 'redwood'
    canvas.clientRender = true
    canvas.doc = parsePage(yaml)
    document.body.appendChild(canvas)
    await canvas.updateComplete
    const frame = canvas.shadowRoot.querySelector('redwood-frame') as any
    await frame.updateComplete
    const iframe = frame.shadowRoot.querySelector('iframe') as HTMLIFrameElement
    // the iframe sits 100 px right and 50 px down in the editor; the frame's nodes, in editor coordinates
    iframe.getBoundingClientRect = () => ({ left: 100, top: 50, right: 900, bottom: 650, width: 800, height: 600 } as DOMRect)
    frame.nodeBoxes = () => [
        { id: 've-root', left: 100, top: 50, width: 800, height: 600 },
        { id: 've-0', left: 120, top: 150, width: 400, height: 40 },
        { id: 've-1', left: 120, top: 200, width: 400, height: 40 },
    ]
    const fromFrame = (data: unknown) =>
        window.dispatchEvent(new MessageEvent('message', { data, source: iframe.contentWindow }))
    return { canvas, frame, fromFrame }
}

describe('<editor-canvas renderer="redwood"> — moving a node painted in the frame', () => {
    it('a press and a drag relayed by the frame move the node (editor coordinates), with the ghost and the drop line', async () => {
        const { canvas, frame, fromFrame } = await redwoodCanvas(TWO)
        const moved: any[] = []
        canvas.addEventListener('node-moved', (e: CustomEvent) => moved.push(e.detail))
        // press on «World» (ve-1) at (30, 165) of the frame = (130, 215) of the editor
        fromFrame({ mateuPreview: 'press', id: 've-1', x: 30, y: 165 })
        await canvas.updateComplete
        // a press alone is not a drag yet: the frame keeps the mouse (its click is the selection)
        expect(frame.hasAttribute('dragging')).toBe(false)
        // to the upper half of «Hello» (editor y 160 = frame y 110)
        fromFrame({ mateuPreview: 'pointer', phase: 'move', x: 30, y: 110 })
        await canvas.updateComplete
        expect(frame.hasAttribute('dragging')).toBe(true)
        expect(canvas.shadowRoot.querySelector('.drag-ghost')?.textContent).toContain('Text')
        expect(canvas.shadowRoot.querySelector('.drop-line')).toBeTruthy()
        fromFrame({ mateuPreview: 'pointer', phase: 'up', x: 30, y: 110 })
        await canvas.updateComplete
        expect(moved).toEqual([{ from: [1], to: { parentPath: [], index: 0 } }])
        expect(frame.hasAttribute('dragging')).toBe(false)
        expect(canvas.shadowRoot.querySelector('.drag-ghost')).toBeNull()
    })

    it('a press that does not travel moves nothing and leaves the selection to the frame\'s click', async () => {
        const { canvas, frame, fromFrame } = await redwoodCanvas(TWO)
        const moved: any[] = []
        const selected: any[] = []
        canvas.addEventListener('node-moved', (e: CustomEvent) => moved.push(e.detail))
        canvas.addEventListener('node-selected', (e: CustomEvent) => selected.push(e.detail.path))
        fromFrame({ mateuPreview: 'press', id: 've-1', x: 30, y: 165 })
        fromFrame({ mateuPreview: 'pointer', phase: 'move', x: 31, y: 166 }) // under the threshold
        fromFrame({ mateuPreview: 'pointer', phase: 'up', x: 31, y: 166 })
        fromFrame({ mateuPreview: 'click', id: 've-1' })
        await canvas.updateComplete
        expect(moved).toEqual([])
        expect(selected).toEqual([[1]])
        expect(frame.hasAttribute('dragging')).toBe(false)
        // and the next real drag still works (no session left behind)
        fromFrame({ mateuPreview: 'press', id: 've-1', x: 30, y: 165 })
        fromFrame({ mateuPreview: 'pointer', phase: 'move', x: 30, y: 110 })
        fromFrame({ mateuPreview: 'pointer', phase: 'up', x: 30, y: 110 })
        expect(moved).toEqual([{ from: [1], to: { parentPath: [], index: 0 } }])
    })

    it('the release may reach the editor itself (the frame let the pointer through): the drop lands once', async () => {
        const { canvas, fromFrame } = await redwoodCanvas(TWO)
        const moved: any[] = []
        canvas.addEventListener('node-moved', (e: CustomEvent) => moved.push(e.detail))
        fromFrame({ mateuPreview: 'press', id: 've-1', x: 30, y: 165 })
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 130, clientY: 160 }))
        window.dispatchEvent(new MouseEvent('mouseup', { clientX: 130, clientY: 160 }))
        fromFrame({ mateuPreview: 'pointer', phase: 'up', x: 30, y: 110 }) // late duplicate: ignored
        expect(moved).toEqual([{ from: [1], to: { parentPath: [], index: 0 } }])
    })

    it('the page root and ids that are not the editor\'s do not start a drag', async () => {
        const { canvas, frame, fromFrame } = await redwoodCanvas(TWO)
        fromFrame({ mateuPreview: 'press', id: 've-root', x: 30, y: 165 })
        fromFrame({ mateuPreview: 'press', id: 'fieldId', x: 30, y: 165 })
        fromFrame({ mateuPreview: 'pointer', phase: 'move', x: 30, y: 110 })
        await canvas.updateComplete
        expect(frame.hasAttribute('dragging')).toBe(false)
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
