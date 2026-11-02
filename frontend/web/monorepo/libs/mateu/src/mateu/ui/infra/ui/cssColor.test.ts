import { describe, expect, it } from 'vitest'
import { cssColorOf } from './cssColor'

describe('cssColorOf', () => {
    it('keeps colours', () => {
        for (const c of ['#c00', '#11223344', 'rgb(1, 2, 3)', 'rgba(0,0,0,.5)', 'hsl(120 50% 50% / 0.3)', 'var(--lumo-error-color)', 'tomato']) {
            expect(cssColorOf(c)).toBe(c)
        }
        expect(cssColorOf('  red ')).toBe('red')
    })
    it('drops anything that could write another declaration', () => {
        for (const c of ['red;background:url(x)', 'rgba(0;color:red)', 'url(https://x/y)', 'var(--a);x:y', 'expression(alert(1))', '', null, 7]) {
            expect(cssColorOf(c)).toBe('')
        }
    })
})
