import { describe, expect, it } from 'vitest'
import { applySizing, SizableHost } from './sizing'

/** A tiny stub of the parts of an element applySizing touches. */
const host = () => {
    const attrs: Record<string, string> = {}
    const style = { flexBasis: '' }
    return {
        attrs,
        style,
        setAttribute: (n: string, v: string) => { attrs[n] = v },
        removeAttribute: (n: string) => { delete attrs[n] },
    } as SizableHost & { attrs: Record<string, string>; style: { flexBasis: string } }
}

describe('applySizing — the sizing intent decode (coherence-plan #8)', () => {

    it('fill and hug set data-sizing and no basis', () => {
        const fill = host(); applySizing(fill, 'fill')
        expect(fill.attrs['data-sizing']).toBe('fill')
        expect(fill.style.flexBasis).toBe('')

        const hug = host(); applySizing(hug, 'hug')
        expect(hug.attrs['data-sizing']).toBe('hug')
    })

    it('fixed:<len> sets data-sizing=fixed and the flex-basis', () => {
        const h = host(); applySizing(h, 'fixed:15rem')
        expect(h.attrs['data-sizing']).toBe('fixed')
        expect(h.style.flexBasis).toBe('15rem')
    })

    it('an absent intent clears the attribute and basis', () => {
        const h = host()
        applySizing(h, 'fixed:20rem')
        applySizing(h, undefined)
        expect(h.attrs['data-sizing']).toBeUndefined()
        expect(h.style.flexBasis).toBe('')
    })
})
