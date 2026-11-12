// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { nudged, pendingChanged, rangeOf, resizedDays } from './mateu-planning-board'

describe('planning board interactions', () => {
    it('a range selection is the days between anchor and pointer, either direction', () => {
        expect(rangeOf(3, 7)).toEqual({ startIdx: 3, endIdx: 7 })
        expect(rangeOf(7, 3)).toEqual({ startIdx: 3, endIdx: 7 })
        expect(rangeOf(5, 5)).toEqual({ startIdx: 5, endIdx: 5 })
    })

    it('resizing moves only the dragged edge and never past the other one', () => {
        expect(resizedDays('end', 2, 5, 9)).toEqual({ startIdx: 2, endIdx: 9 })
        expect(resizedDays('end', 2, 5, 0)).toEqual({ startIdx: 2, endIdx: 2 })
        expect(resizedDays('start', 2, 5, 0)).toEqual({ startIdx: 0, endIdx: 5 })
        expect(resizedDays('start', 2, 5, 8)).toEqual({ startIdx: 5, endIdx: 5 })
    })
})

describe('nudged — a move or resize without dragging', () => {
    const p = { blockId: 'b', mode: 'move' as const, resourceId: 'r1', startIdx: 2, endIdx: 4, originResourceId: 'r1', originStartIdx: 2, originEndIdx: 4 }
    it('moves inside the window and walks the rows; a resize moves the end edge, never before the start', () => {
        expect(nudged(p, { days: 10 }, ['r1', 'r2'], 10)).toMatchObject({ startIdx: 7, endIdx: 9 })
        expect(nudged(p, { days: -5 }, ['r1', 'r2'], 10)).toMatchObject({ startIdx: 0, endIdx: 2 })
        expect(nudged(p, { rows: 5 }, ['r1', 'r2'], 10)).toMatchObject({ resourceId: 'r2' })
        expect(nudged(p, { length: -5 }, ['r1', 'r2'], 10)).toMatchObject({ mode: 'resize', startIdx: 2, endIdx: 2 })
        expect(pendingChanged(p)).toBe(false)
        expect(pendingChanged(nudged(p, { days: 1 }, ['r1'], 10))).toBe(true)
    })
})
