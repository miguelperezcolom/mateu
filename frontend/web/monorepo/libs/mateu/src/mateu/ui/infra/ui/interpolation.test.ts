import { afterEach, describe, expect, it, vi } from 'vitest'
import { interpolate, interpolateAndEvaluate, interpolateNested, possiblyHtml } from './interpolation'

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

    it('exposes extra named variables passed as extra context', () => {
        expect(interpolate('${appState.user} / ${state.section}', { section: 'Home' }, {},
            { appState: { user: 'Ana' } }))
            .toBe('Ana / Home')
        expect(interpolate('${item.name}', {}, {}, { item: { name: 'Row 1' } }))
            .toBe('Row 1')
    })
})

describe('interpolateNested', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('returns undefined/empty texts unchanged', () => {
        expect(interpolateNested(undefined, {}, {}, {}, {})).toBeUndefined()
        expect(interpolateNested('', {}, {}, {}, {})).toBe('')
    })

    it('evaluates against state, data, appState and appData', () => {
        expect(interpolateNested('${state.a}-${data.b}-${appState.c}-${appData.d}',
            { a: 1 }, { b: 2 }, { c: 3 }, { d: 4 }))
            .toBe('1-2-3-4')
    })

    it('runs a second pass when the first result still contains ${...}', () => {
        // first pass resolves state.template to a text that itself interpolates data
        expect(interpolateNested('${state.template}', { template: 'Total: ${data.total}' }, { total: 7 }, {}, {}))
            .toBe('Total: 7')
    })

    it('returns a descriptive error message and logs on a failing expression (historical behaviour)', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {})
        const result = interpolateNested('${noSuchVar}', {}, {}, {}, {})
        expect(result).toContain('when evaluating ${noSuchVar}')
        expect(error).toHaveBeenCalledTimes(1)
    })
})

describe('interpolateAndEvaluate', () => {
    it('interpolates the template and evaluates the result as an expression', () => {
        expect(interpolateAndEvaluate('${state.count} > 2', { count: 5 }, {})).toBe(true)
        expect(interpolateAndEvaluate('${state.count} > 2', { count: 1 }, {})).toBe(false)
    })

    it('sees appState and appData', () => {
        expect(interpolateAndEvaluate('${appState.on} && ${appData.ready}', {}, {}, { on: true }, { ready: true }))
            .toBe(true)
    })

    it('lets the expression reference the context directly after interpolation', () => {
        expect(interpolateAndEvaluate('state.opened', { opened: true }, {})).toBe(true)
    })

    it('throws on a failing expression (callers decide the error behaviour)', () => {
        expect(() => interpolateAndEvaluate('${noSuchVar}', {}, {})).toThrow()
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
