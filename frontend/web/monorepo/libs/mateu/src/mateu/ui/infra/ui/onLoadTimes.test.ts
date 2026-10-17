import { describe, expect, it } from 'vitest'
import { carryOnLoadCounts, claimOnLoadFiring, standInForOnLoad } from './onLoadTimes'

const onLoad = (actionId: string, times = 1) => ({ type: 'OnLoad', actionId, times })

describe('OnLoad times across in-place re-renders', () => {

    it('fires once by default, even when the action re-renders the view (returns `this`)', () => {
        const first = [onLoad('load')]
        expect(claimOnLoadFiring(first[0])).toBe(true)
        // the answer re-renders the same view: fresh triggers, carried count
        const second = [onLoad('load')]
        carryOnLoadCounts(first, second)
        expect(claimOnLoadFiring(second[0])).toBe(false)
    })

    it('times = 0 keeps firing on every render (the polling idiom)', () => {
        let previous = [onLoad('poll', 0)]
        expect(claimOnLoadFiring(previous[0])).toBe(true)
        for (let i = 0; i < 5; i++) {
            const next = [onLoad('poll', 0)]
            carryOnLoadCounts(previous, next)
            expect(claimOnLoadFiring(next[0])).toBe(true)
            previous = next
        }
    })

    it('times = 3 fires three times, then stops', () => {
        let previous = [onLoad('refresh', 3)]
        const fired = [claimOnLoadFiring(previous[0])]
        for (let i = 0; i < 4; i++) {
            const next = [onLoad('refresh', 3)]
            carryOnLoadCounts(previous, next)
            fired.push(claimOnLoadFiring(next[0]))
            previous = next
        }
        expect(fired).toEqual([true, true, true, false, false])
    })

    it('a trigger already claimed in this render does not fire twice', () => {
        const t = onLoad('load', 0)
        expect(claimOnLoadFiring(t)).toBe(true)
        expect(claimOnLoadFiring(t)).toBe(false)
    })

    it('a different view (no carried count) fires again', () => {
        const fresh = [onLoad('load')]
        carryOnLoadCounts(undefined, fresh)
        expect(claimOnLoadFiring(fresh[0])).toBe(true)
    })

    describe("a listing's own search stands in for the component's OnLoad search", () => {

        it('claims the OnLoad search so the trigger does not fire a second, identical search', () => {
            const triggers = [onLoad('search')]
            expect(standInForOnLoad(triggers, 'search')).toBe(true)
            expect(claimOnLoadFiring(triggers[0])).toBe(false)
        })

        it('leaves other OnLoad triggers alone', () => {
            const triggers = [onLoad('load'), onLoad('search')]
            standInForOnLoad(triggers, 'search')
            expect(claimOnLoadFiring(triggers[0])).toBe(true)
        })

        it('is a no-op on a component without that trigger', () => {
            expect(standInForOnLoad([onLoad('load')], 'search')).toBe(false)
            expect(standInForOnLoad(undefined, 'search')).toBe(false)
        })

        it('after the trigger already fired (a later search by the user) nothing changes', () => {
            const triggers = [onLoad('search')]
            expect(claimOnLoadFiring(triggers[0])).toBe(true)
            expect(standInForOnLoad(triggers, 'search')).toBe(false)
        })
    })
})
