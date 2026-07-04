import { afterEach, describe, expect, it, vi } from 'vitest'
import { interpolate, possiblyHtml } from './interpolation'

describe('interpolate', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('returns undefined/plain texts unchanged (no evaluation)', () => {
        expect(interpolate(undefined)).toBeUndefined()
        expect(interpolate('')).toBe('')
        expect(interpolate('Customers')).toBe('Customers')
        expect(interpolate('50$ discount')).toBe('50$ discount')
    })

    it('evaluates ${...} expressions against state', () => {
        expect(interpolate('${state.nombre} — Details', { nombre: 'ACME' }))
            .toBe('ACME — Details')
    })

    it('evaluates ${...} expressions against data', () => {
        expect(interpolate('Total: ${data.total}', {}, { total: 42 }))
            .toBe('Total: 42')
    })

    it('supports full JS expressions', () => {
        expect(interpolate('${state.items.length > 1 ? "items" : "item"}', { items: [1, 2] }))
            .toBe('items')
    })

    it('defaults state and data to empty objects', () => {
        expect(interpolate('${state.missing ?? "n/a"}')).toBe('n/a')
        expect(interpolate('${data.missing ?? "n/a"}')).toBe('n/a')
    })

    it('returns the raw text and warns instead of throwing on a bad expression', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        expect(interpolate('${undeclaredVariable}', {})).toBe('${undeclaredVariable}')
        expect(interpolate('${state.', {})).toBe('${state.')
        expect(warn).toHaveBeenCalledTimes(2)
    })
})

describe('possiblyHtml', () => {
    it('returns undefined/plain texts unchanged', () => {
        expect(possiblyHtml(undefined, {}, {})).toBeUndefined()
        expect(possiblyHtml('<b>Title</b>', {}, {})).toBe('<b>Title</b>')
    })

    it('evaluates ${...} expressions against state and data', () => {
        expect(possiblyHtml('Hola ${state.user}', { user: 'Ana' }, {})).toBe('Hola Ana')
        expect(possiblyHtml('KPI: ${data.kpi}', {}, { kpi: 99 })).toBe('KPI: 99')
    })

    it('returns the error message when the expression fails (historical behaviour)', () => {
        const result = possiblyHtml('${noSuchVar}', {}, {})
        expect(result).toContain('noSuchVar')
    })
})
