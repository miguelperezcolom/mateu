// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import './mateu-planning-board'
import type { MateuPlanningBoard } from './mateu-planning-board'

/**
 * The planning board / tape chart as a user drives it: resources × days, blocks on lanes, a click
 * selects, a drag moves (to another row and/or day), an edge drag resizes, a drag over empty cells
 * selects a range, Escape cancels, a double click opens.
 */
describe('mateu-planning-board (DOM)', () => {
    // 10 visible days; each lane is 1000px wide → 100px per day; lanes stacked 40px tall
    const LANE_W = 1000
    const RESOURCES = [
        { id: 'r1', label: 'Room 101', group: 'Floor 1', attributes: ['Double'] },
        { id: 'r2', label: 'Room 102', group: 'Floor 1', attributes: ['Single'] },
        { id: 'r3', label: 'Room 201', group: 'Floor 2' },
    ]
    const BLOCKS = [
        { id: 'b1', resourceId: 'r1', start: '2026-03-02', end: '2026-03-04', label: 'Smith', status: 'confirmed' },
        { id: 'b2', resourceId: 'r2', start: '2026-03-06', end: '2026-03-07', label: 'Jones', summary: 'VIP', color: '#000000' },
        { id: 'b3', resourceId: 'r3', start: '2026-04-01', end: '2026-04-03', label: 'Out of window' },
    ]
    let events: { actionId: string, parameters: Record<string, unknown> }[]
    const listener = (e: Event) => events.push((e as CustomEvent).detail)
    const origCapture = Element.prototype.setPointerCapture

    const mount = async (props: Partial<MateuPlanningBoard> = {}) => {
        const board = document.createElement('mateu-planning-board') as MateuPlanningBoard
        board.resources = RESOURCES as never
        board.blocks = BLOCKS as never
        board.from = '2026-03-01'
        board.to = '2026-03-10'
        Object.assign(board, props)
        document.body.appendChild(board)
        await board.updateComplete
        board.shadowRoot!.querySelectorAll<HTMLElement>('.lane[data-resource-id]').forEach((lane, i) => {
            lane.getBoundingClientRect = () => ({ left: 0, top: i * 40, width: LANE_W, height: 40, right: LANE_W, bottom: i * 40 + 40, x: 0, y: i * 40, toJSON() {} }) as DOMRect
        })
        return board
    }
    const $ = (b: MateuPlanningBoard, sel: string) => b.shadowRoot!.querySelector(sel) as HTMLElement
    const $$ = (b: MateuPlanningBoard, sel: string) => Array.from(b.shadowRoot!.querySelectorAll(sel)) as HTMLElement[]
    const block = (b: MateuPlanningBoard, label: string) => $$(b, '.block').find(x => x.textContent!.includes(label))!
    const pointer = (el: Element, type: string, x: number, y: number, button = 0) => {
        const e = new MouseEvent(type, { clientX: x, clientY: y, button, bubbles: true, composed: true, cancelable: true })
        Object.defineProperty(e, 'pointerId', { value: 1 })
        el.dispatchEvent(e)
    }

    beforeEach(() => {
        events = []
        document.addEventListener('action-requested', listener)
        Element.prototype.setPointerCapture = () => {}
    })
    afterEach(() => {
        document.removeEventListener('action-requested', listener)
        document.body.innerHTML = ''
        Element.prototype.setPointerCapture = origCapture
    })

    it('renders nothing without resources or without a window', async () => {
        const b = await mount({ resources: [] })
        expect($(b, '.frame')).toBeNull()
        const c = await mount({ from: undefined, to: undefined, blocks: [] })
        expect($(c, '.frame')).toBeNull()
    })

    it('renders a day header per day, group captions, labels with attributes and the visible blocks', async () => {
        const b = await mount({ attributeColumns: ['Type'] })
        const heads = $$(b, '.day-head')
        expect(heads).toHaveLength(10)
        expect(heads.map(h => h.querySelector('.num')!.textContent)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])
        // 2026-03-01 is a Sunday, 03-07 a Saturday, 03-08 a Sunday
        expect(heads.filter(h => h.classList.contains('weekend')).map(h => h.querySelector('.num')!.textContent)).toEqual(['1', '7', '8'])
        expect($$(b, '.group').map(g => g.textContent)).toEqual(['Floor 1', 'Floor 2'])
        expect($(b, '.corner').textContent).toContain('Resource')
        expect($(b, '.corner .attr').textContent).toBe('Type')
        expect($$(b, '.label .attr').map(a => a.textContent)).toEqual(['Double', 'Single', ''])
        // the out-of-window block is not drawn
        expect($$(b, '.block').map(x => x.textContent!.trim())).toEqual(['Smith', 'Jones'])
        const smith = block(b, 'Smith')
        expect(smith.style.left).toBe('10%')
        expect(smith.style.width).toBe('30%')
        expect(smith.title).toBe('Smith · 2026-03-02 → 2026-03-04 · confirmed')
        const jones = block(b, 'Jones')
        expect(jones.title).toBe('VIP')
        expect(jones.getAttribute('style')).toContain('--mateu-planning-block: #000000')
        expect(jones.getAttribute('style')).toContain('--mateu-planning-block-ink')
    })

    it('derives the window from the blocks when no from/to is declared', async () => {
        const b = await mount({ from: undefined, to: undefined, blocks: [BLOCKS[0], BLOCKS[1]] as never })
        // 2026-03-02 .. 2026-03-07
        expect($$(b, '.day-head')).toHaveLength(6)
        expect(block(b, 'Smith').style.left).toBe('0%')
    })

    it('a click on a block dispatches selectActionId with the block id', async () => {
        const b = await mount({ selectActionId: 'select' })
        const smith = block(b, 'Smith')
        expect(smith.classList.contains('clickable')).toBe(true)
        pointer(smith, 'pointerdown', 150, 20)
        pointer(smith, 'pointermove', 151, 21) // under the click threshold
        pointer(smith, 'pointerup', 151, 21)
        expect(events).toEqual([{ actionId: 'select', parameters: { _blockId: 'b1' } }])
    })

    it('a board with no select/move action ignores pointer interaction', async () => {
        const b = await mount()
        const smith = block(b, 'Smith')
        pointer(smith, 'pointerdown', 150, 20)
        pointer(smith, 'pointerup', 150, 20)
        expect(events).toEqual([])
    })

    it('dragging a block to another row and day dispatches moveActionId with the new resource and dates', async () => {
        const b = await mount({ moveActionId: 'move', selectActionId: 'select' })
        const smith = block(b, 'Smith')
        expect(smith.classList.contains('draggable')).toBe(true)
        // grab the block on its second day (03-03, x=250), drop it on lane r2 at day idx 6 (03-07)
        pointer(smith, 'pointerdown', 250, 20)
        pointer(smith, 'pointermove', 650, 60)
        await b.updateComplete
        expect(block(b, 'Smith').classList.contains('dragging')).toBe(true)
        const ghost = $(b, '.lane[data-resource-id="r2"] .ghost')
        expect(ghost).not.toBeNull()
        expect(ghost.style.left).toBe('50%')
        expect(ghost.style.width).toBe('30%')
        pointer(block(b, 'Smith'), 'pointerup', 650, 60)
        expect(events).toEqual([{ actionId: 'move', parameters: { _blockId: 'b1', _resourceId: 'r2', _start: '2026-03-06', _end: '2026-03-08' } }])
        await b.updateComplete
        expect($(b, '.ghost')).toBeNull()
    })

    it('a drag is clamped to the window and a drop where it started is a no-op', async () => {
        const b = await mount({ moveActionId: 'move' })
        const smith = block(b, 'Smith')
        pointer(smith, 'pointerdown', 150, 20)
        pointer(smith, 'pointermove', 990, 20) // far right: start clamped to idx 7 (3 days fit)
        pointer(smith, 'pointerup', 990, 20)
        expect(events[0].parameters).toMatchObject({ _resourceId: 'r1', _start: '2026-03-08', _end: '2026-03-10' })
        events = []
        const again = block(b, 'Smith')
        pointer(again, 'pointerdown', 150, 20)
        pointer(again, 'pointermove', 400, 20)
        pointer(again, 'pointermove', 150, 20) // back where it started
        pointer(again, 'pointerup', 150, 20)
        expect(events).toEqual([])
    })

    it('a click-only board never enters drag mode', async () => {
        const b = await mount({ selectActionId: 'select' })
        const smith = block(b, 'Smith')
        pointer(smith, 'pointerdown', 150, 20)
        pointer(smith, 'pointermove', 600, 20)
        await b.updateComplete
        expect($(b, '.ghost')).toBeNull()
        pointer(smith, 'pointerup', 600, 20)
        // still a click: nothing "moved"
        expect(events).toEqual([{ actionId: 'select', parameters: { _blockId: 'b1' } }])
    })

    it('Escape cancels a drag: nothing is dispatched on release', async () => {
        const b = await mount({ moveActionId: 'move', selectActionId: 'select' })
        const smith = block(b, 'Smith')
        pointer(smith, 'pointerdown', 150, 20)
        pointer(smith, 'pointermove', 650, 60)
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        await b.updateComplete
        expect($(b, '.ghost')).toBeNull()
        pointer(block(b, 'Smith'), 'pointerup', 650, 60)
        expect(events).toEqual([])
    })

    it('dragging an edge resizes the block and dispatches resizeActionId; the other edge stays put', async () => {
        const b = await mount({ resizeActionId: 'resize' })
        const end = block(b, 'Smith').querySelector('.handle.end')!
        pointer(end, 'pointerdown', 350, 20)
        pointer(end, 'pointermove', 650, 20)
        await b.updateComplete
        expect(block(b, 'Smith').style.width).toBe('60%') // 03-02 .. 03-07
        pointer(end, 'pointerup', 650, 20)
        expect(events).toEqual([{ actionId: 'resize', parameters: { _blockId: 'b1', _resourceId: 'r1', _start: '2026-03-02', _end: '2026-03-07' } }])

        events = []
        const start = block(b, 'Smith').querySelector('.handle.start')!
        pointer(start, 'pointerdown', 150, 20)
        pointer(start, 'pointermove', 50, 20)
        pointer(start, 'pointerup', 50, 20)
        expect(events[0].parameters).toMatchObject({ _start: '2026-03-01', _end: '2026-03-04' })

        events = []
        pointer(start, 'pointerdown', 150, 20)
        pointer(start, 'pointerup', 150, 20) // unchanged → nothing
        expect(events).toEqual([])
    })

    it('without resizeActionId a block has no handles', async () => {
        const b = await mount({ moveActionId: 'move' })
        expect(block(b, 'Smith').querySelector('.handle')).toBeNull()
    })

    it('dragging over empty cells selects a range and dispatches rangeSelectActionId', async () => {
        const b = await mount({ rangeSelectActionId: 'range' })
        const cells = $(b, '.lane[data-resource-id="r3"] .cells')
        expect(cells.classList.contains('selectable')).toBe(true)
        pointer(cells, 'pointerdown', 750, 100)
        pointer(cells, 'pointermove', 350, 100) // backwards
        await b.updateComplete
        const range = $(b, '.lane[data-resource-id="r3"] .range')
        expect(range.style.left).toBe('30%')
        expect(range.style.width).toBe('50%')
        pointer(cells, 'pointerup', 350, 100)
        expect(events).toEqual([{ actionId: 'range', parameters: { _resourceId: 'r3', _start: '2026-03-04', _end: '2026-03-08' } }])
        await b.updateComplete
        expect($(b, '.range')).toBeNull()
    })

    it('a secondary-button press or a board without rangeSelectActionId selects nothing', async () => {
        const b = await mount({ rangeSelectActionId: 'range' })
        const cells = $(b, '.lane[data-resource-id="r3"] .cells')
        pointer(cells, 'pointerdown', 750, 100, 2)
        pointer(cells, 'pointerup', 750, 100, 2)
        expect(events).toEqual([])
        document.body.innerHTML = ''
        const c = await mount()
        const plain = $(c, '.lane[data-resource-id="r3"] .cells')
        pointer(plain, 'pointerdown', 750, 100)
        pointer(plain, 'pointerup', 750, 100)
        expect(events).toEqual([])
    })

    it('Escape cancels a range selection', async () => {
        const b = await mount({ rangeSelectActionId: 'range' })
        const cells = $(b, '.lane[data-resource-id="r3"] .cells')
        pointer(cells, 'pointerdown', 750, 100)
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        pointer(cells, 'pointerup', 750, 100)
        expect(events).toEqual([])
    })

    it('a double click on a block dispatches openActionId', async () => {
        const b = await mount({ openActionId: 'open' })
        block(b, 'Jones').dispatchEvent(new MouseEvent('dblclick', { bubbles: true, composed: true }))
        expect(events).toEqual([{ actionId: 'open', parameters: { _blockId: 'b2' } }])
    })

    it('marks today when it falls inside the window', async () => {
        const d = new Date()
        const pad = (n: number) => String(n).padStart(2, '0')
        const iso = (x: Date) => `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`
        const from = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 2)
        const to = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 2)
        const b = await mount({ from: iso(from), to: iso(to) })
        expect($$(b, '.day-head')[2].classList.contains('today')).toBe(true)
        expect($$(b, '.today-line')).toHaveLength(3)
    })
})
