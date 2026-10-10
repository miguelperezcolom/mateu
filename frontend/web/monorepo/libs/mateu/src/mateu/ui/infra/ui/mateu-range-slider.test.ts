// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { normalizeRange } from './mateu-range-slider'
import './mateu-range-slider'

describe('normalizeRange', () => {
    it('clamps both ends to [min, max]', () => {
        expect(normalizeRange(-5, 50, 0, 10)).toEqual({ from: 0, to: 10 })
    })
    it('pushes the other thumb when one crosses it', () => {
        expect(normalizeRange(8, 5, 0, 10, 'from')).toEqual({ from: 8, to: 8 })
        expect(normalizeRange(8, 5, 0, 10, 'to')).toEqual({ from: 5, to: 5 })
    })
    it('falls back to the bounds for unparseable values and swaps inverted bounds', () => {
        expect(normalizeRange('x', undefined, 10, 0)).toEqual({ from: 0, to: 10 })
        expect(normalizeRange('3', '7', '0', '10')).toEqual({ from: 3, to: 7 })
    })
})

describe('mateu-range-slider', () => {
    it('renders two named native sliders and emits change with from/to', async () => {
        const el = document.createElement('mateu-range-slider')
        el.setAttribute('start-value', '2')
        el.setAttribute('end-value', '6')
        el.setAttribute('max', '10')
        document.body.appendChild(el)
        await el.updateComplete
        const inputs = el.shadowRoot!.querySelectorAll('input[type=range]')
        expect(inputs.length).toBe(2)
        expect(inputs[0].getAttribute('aria-label')).toBe('From')
        expect(inputs[1].getAttribute('aria-label')).toBe('To')
        let detail: unknown
        el.addEventListener('change', (e) => { detail = (e as CustomEvent).detail })
        const to = inputs[1] as HTMLInputElement
        to.value = '9'
        to.dispatchEvent(new Event('change'))
        expect(detail).toEqual({ from: 2, to: 9 })
        expect(el.endValue).toBe(9)
        el.remove()
    })
})
