import { describe, expect, it } from 'vitest'
import { elementAttributeValue as v } from './elementAttributes'

describe('elementAttributeValue (M-S7)', () => {
    it('a literal attribute is the author\'s and passes as written, except srcdoc', () => {
        expect(v('a', 'href', 'javascript:void(0)', 'javascript:void(0)')).toBe('javascript:void(0)')
        expect(v('iframe', 'srcdoc', '<p>hi</p>', '<p>hi</p>')).toBeUndefined()
        expect(v('x-el', 'onclick', 'f()', 'f()')).toBe('f()')
    })

    it('a data-bound url passes only as a safe link, and never on a code-loading element', () => {
        expect(v('a', 'href', '${state.u}', 'javascript:alert(1)')).toBeUndefined()
        expect(v('a', 'HREF', '${state.u}', ' java\tscript:alert(1)')).toBeUndefined()
        expect(v('a', 'href', '${state.u}', 'data:text/html,x')).toBeUndefined()
        expect(v('a', 'href', '${state.u}', '/orders/1')).toBe('/orders/1')
        expect(v('img', 'src', '${state.u}', 'https://cdn.example/a.png')).toBe('https://cdn.example/a.png')
        expect(v('script', 'src', '${state.u}', 'https://cdn.example/a.js')).toBeUndefined()
        expect(v('x-el', 'onload', 'x(${state.id})', 'x(1)')).toBeUndefined()
        expect(v('x-el', 'label', '${state.l}', 'javascript:1')).toBe('javascript:1')
    })
})
