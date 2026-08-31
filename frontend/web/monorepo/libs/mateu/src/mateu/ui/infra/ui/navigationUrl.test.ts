import { describe, expect, it } from 'vitest'
import { nextHistoryUrl } from './navigationUrl'

const at = (url: string) => {
    const [pathname, search] = url.split('?')
    return { pathname, search: search ? '?' + search : '' }
}

/**
 * The address bar has to follow the filters, not just the path.
 *
 * A listing keeps its filters in the query string, so "the same page with different filters" is a
 * different destination. Comparing paths alone made a navigation to the page already on screen do
 * nothing — silently, which is the part that cost an afternoon.
 */
describe('nextHistoryUrl', () => {

    it('pushes when the path changes', () => {
        expect(nextHistoryUrl(at('/orders'), at('/processes'))).toBe('/processes')
    })

    it('pushes when only the query string changes — the case that used to be missed', () => {
        expect(nextHistoryUrl(at('/processes'), at('/processes?status=RUNNING')))
            .toBe('/processes?status=RUNNING')
    })

    it('pushes when the filters change from one value to another', () => {
        expect(nextHistoryUrl(at('/processes?status=ERROR'), at('/processes?status=RUNNING')))
            .toBe('/processes?status=RUNNING')
    })

    it('pushes when the filters are cleared', () => {
        expect(nextHistoryUrl(at('/processes?status=RUNNING'), at('/processes'))).toBe('/processes')
    })

    it('does not push the destination already showing', () => {
        expect(nextHistoryUrl(at('/processes?status=RUNNING'), at('/processes?status=RUNNING')))
            .toBeNull()
    })

    it('does not push when nothing is addressed at all', () => {
        expect(nextHistoryUrl(at(''), at(''))).toBeNull()
    })

    it('leads with a slash even when the target does not', () => {
        expect(nextHistoryUrl(at('/orders'), at('processes'))).toBe('/processes')
    })
})
