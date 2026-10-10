// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { rangeOf, resizedDays } from './mateu-planning-board'

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
