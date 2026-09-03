// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { MateuTableCrud } from './mateu-table-crud'

/**
 * measureBottomInset totals the space UNDER the listing box that other things need, so the box can
 * be given exactly the rest of the window. The subject here is a single rule: a "following sibling"
 * only sits under the box if it is laid out under it — its top at or after the box's bottom.
 *
 * <p>The bug this guards: on the way into a detail view the shell mounts the incoming view as a
 * sibling of the listing's branch, anchored at the TOP of the viewport, while the outgoing listing
 * is still in the DOM. Counted as "space below", it made available collapse far below the minimum on
 * a tall window, which cleared the fill and dropped the grid to its 400px default for the frame
 * before the listing was replaced — a visible shrink. A sibling above the box's bottom is not under
 * it. The same rule excludes a detail pane sitting BESIDE the listing in a split master-detail row.
 */
const rect = (top: number, height: number): DOMRect =>
    ({ top, height, bottom: top + height, left: 0, right: 0, width: 0, x: 0, y: top, toJSON: () => ({}) })

const withRect = <T extends HTMLElement>(el: T, top: number, height: number): T => {
    el.getBoundingClientRect = () => rect(top, height)
    return el
}

describe('measureBottomInset', () => {
    const measure = (box: HTMLElement) => (MateuTableCrud.prototype as any).measureBottomInset.call({}, box)

    it('counts a sibling laid out below the box, and ignores one anchored above it', () => {
        const container = document.createElement('div')
        // The box's natural bottom is 500.
        const box = withRect(document.createElement('div'), 100, 400)
        // Directly under the box: a 40px pager/gutter row — this is the real bottom inset.
        const below = withRect(document.createElement('div'), 500, 40)
        // The incoming view during a route change: a tall sibling anchored at the top of the window.
        const shell = withRect(document.createElement('div'), 0, 600)
        container.append(box, below, shell)
        document.body.append(container)

        // 40 for the row below; the 600px shell at the top of the viewport is not under the box.
        expect(measure(box)).toBe(40)
    })

    it('ignores a detail pane sitting beside the box in a split row', () => {
        const row = document.createElement('div')
        const box = withRect(document.createElement('div'), 100, 400)      // bottom 500
        const detail = withRect(document.createElement('div'), 100, 700)   // beside it, same top
        row.append(box, detail)
        document.body.append(row)

        expect(measure(box)).toBe(0)
    })
})
