import { describe, expect, it } from 'vitest'
import { isBackButton, isCancelButton, isNavButton } from './toolbarButtonKinds'

/**
 * The split matters because two renderers read these: the page header and the crud's own toolbar.
 * They each used to carry a private copy of one `isNavButton`, so a change to the rule in one was
 * a divergence from the other — which is exactly what splitting it in two would have caused.
 */
describe('toolbar button kinds', () => {

    it('treats back and backToList as the way out of a page', () => {
        expect(isBackButton('back')).toBe(true)
        expect(isBackButton('backToList')).toBe(true)
    })

    it("treats a crud's Back to list as the way out, whatever it is called", () => {
        // The id is cancel-view, not "back": ViewToolbarBuilder labels it "Back to list" and gives
        // it a cancel id. Reading the prefix instead of the id is what made the first attempt at
        // this render no chevron at all, on a deployment where every relevant button starts with
        // "cancel".
        expect(isBackButton('cancel-view')).toBe(true)
        expect(isCancelButton('cancel-view')).toBe(false)
    })

    it('leaves the editor Cancel a button, new record or not', () => {
        // cancel-new lands on the list, like cancel-view — but the gesture is abandoning a form
        // being filled in, not stepping out of one being read. It stays beside Save.
        for (const id of ['cancel', 'cancel-edit', 'cancel-new']) {
            expect(isCancelButton(id)).toBe(true)
            expect(isBackButton(id)).toBe(false)
        }
    })

    it('still groups both apart from a page\'s real actions', () => {
        // The layout grouping is unchanged: what changed is how one of the two is drawn.
        for (const id of ['back', 'backToList', 'cancel-view', 'cancel-edit', 'cancel-new']) {
            expect(isNavButton(id)).toBe(true)
        }
    })

    it('leaves ordinary actions alone', () => {
        for (const id of ['save', 'create', 'edit', 'new', 'delete', 'view']) {
            expect(isNavButton(id)).toBe(false)
            expect(isBackButton(id)).toBe(false)
        }
    })

    it('survives an action id that is not there', () => {
        expect(isNavButton(undefined)).toBe(false)
        expect(isBackButton(undefined)).toBe(false)
        expect(isCancelButton(undefined)).toBe(false)
    })

    /** "cancelled" is not a cancel button by intent, but the prefix rule predates this split. */
    it('keeps the prefix rule it inherited, rather than quietly narrowing it', () => {
        expect(isCancelButton('cancellationPolicy')).toBe(true)
    })
})
