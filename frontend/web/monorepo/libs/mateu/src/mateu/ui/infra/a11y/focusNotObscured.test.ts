import { describe, expect, it } from 'vitest'
import { obscuredScrollDelta } from './focusNotObscured'

describe('focus not obscured (WCAG 2.4.11)', () => {
    it('scrolls a control hidden under the pinned header down into the free area', () => {
        // pinned region ends at 120; the control sits at 100–130: scroll up by 28 (120 + 8 - 100)
        expect(obscuredScrollDelta({ top: 100, bottom: 130 }, 120, 800)).toBe(-28)
    })
    it('scrolls a control under a floating button up above it, never past the pinned region', () => {
        expect(obscuredScrollDelta({ top: 700, bottom: 740 }, 120, 720)).toBe(28)
        // a tall control: its top must not go under the header
        expect(obscuredScrollDelta({ top: 150, bottom: 900 }, 120, 720)).toBe(22)
    })
    it('leaves a visible control alone', () => {
        expect(obscuredScrollDelta({ top: 300, bottom: 340 }, 120, 720)).toBe(0)
    })
})
