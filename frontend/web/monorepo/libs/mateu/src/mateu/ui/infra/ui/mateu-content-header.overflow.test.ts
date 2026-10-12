import { describe, expect, it } from 'vitest'
import { actionsOverflow } from './mateu-content-header'

const box = (top: number, bottom: number, right = 0) => ({ top, bottom, right, height: bottom - top })

describe('the header actions overflow into "…" only when they do not fit', () => {
    const row = box(0, 120, 1200)

    it('a TALL title block (overline + title + subtitle + timestamp) beside centred actions is no overflow', () => {
        // the actions sit centred, 40px below the row top — they used to read as "wrapped"
        const title = box(0, 120, 700)
        const actions = box(40, 76, 1150)
        expect(actionsOverflow(actions, [title], actions, row)).toBe(false)
    })

    it('actions that wrapped onto a line below the title block overflow', () => {
        const title = box(0, 80, 1200)
        const actions = box(90, 126, 400)
        expect(actionsOverflow(actions, [title], actions, row)).toBe(true)
    })

    it('actions past the right edge overflow', () => {
        const title = box(0, 40, 700)
        expect(actionsOverflow(box(0, 36, 1300), [title], box(0, 36, 1300), row)).toBe(true)
    })

    it('an empty sibling (no height) is ignored', () => {
        expect(actionsOverflow(box(40, 76, 1150), [box(0, 0, 0)], box(40, 76, 1150), row)).toBe(false)
    })
})
