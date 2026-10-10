import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    evaluateExpression,
    evaluateTemplate,
    interpolate,
    interpolateAndEvaluate,
    interpolateNested,
    possiblyHtml
} from './interpolation'

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

    it('is a single pass: a substituted value that itself contains ${...} is shown literally', () => {
        expect(interpolateNested('${state.template}', { template: 'Total: ${data.total}' }, { total: 7 }, {}, {}))
            .toBe('Total: ${data.total}')
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

    it('exposes extra named variables (rule expressions see component)', () => {
        const component = { serverSideType: 'io.mateu.Demo' }
        expect(interpolateAndEvaluate('component.serverSideType == "${state.type}"',
            { type: 'io.mateu.Demo' }, {}, {}, {}, { component }))
            .toBe(true)
    })

    it('preserves the typed result of the evaluated expression', () => {
        expect(interpolateAndEvaluate('${state.count} + 1', { count: 2 }, {}, {}, {}, {})).toBe(3)
        expect(interpolateAndEvaluate('[1, 2]', {}, {}, {}, {}, {})).toEqual([1, 2])
    })
})

describe('evaluateExpression', () => {
    it('evaluates an expression against state and data preserving its type', () => {
        expect(evaluateExpression('state.total > 100', { total: 150 }, {})).toBe(true)
        expect(evaluateExpression('state.total > 100', { total: 5 }, {})).toBe(false)
        expect(evaluateExpression('data.items.length', {}, { items: [1, 2, 3] })).toBe(3)
    })

    it('exposes extra named variables (component, appState, appData)', () => {
        const component = { rules: [{ filter: 'true' }] }
        expect(evaluateExpression('component.rules.length', {}, {}, { component })).toBe(1)
        expect(evaluateExpression('appState.on && appData.ready', {}, {},
            { appState: { on: true }, appData: { ready: true } })).toBe(true)
    })

    it('defaults state and data to empty objects', () => {
        expect(evaluateExpression('state.missing ?? "n/a"')).toBe('n/a')
    })

    it('throws on a failing expression (callers decide the error behaviour)', () => {
        expect(() => evaluateExpression('noSuchVar', {}, {})).toThrow()
    })
})

describe('evaluateTemplate', () => {
    it('evaluates a template literal against state, data and extra context', () => {
        expect(evaluateTemplate('Hola ${state.user}', { user: 'Ana' }, {})).toBe('Hola Ana')
        expect(evaluateTemplate('${component.id}: ${data.total}', {}, { total: 9 },
            { component: { id: 'c1' } })).toBe('c1: 9')
    })

    it('throws on a failing expression, unlike interpolate', () => {
        expect(() => evaluateTemplate('${noSuchVar}', {}, {})).toThrow()
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

describe('a null or undefined value in a displayed text', () => {
    it('renders as nothing, not as the word "null" or "undefined"', () => {
        expect(interpolate('${state.x}', { x: null })).toBe('')
        expect(interpolate('Hi ${state.x}!', {})).toBe('Hi !')
        expect(interpolateNested('${state.quejas}', { quejas: null }, {}, {}, {})).toBe('')
        expect(possiblyHtml('${state.x}', { x: null }, {})).toBe('')
        expect(evaluateTemplate('${state.x}', { x: undefined })).toBe('')
    })

    it('keeps falsy values that are real values', () => {
        expect(interpolate('${state.n} ${state.b} ${state.s}|', { n: 0, b: false, s: '' })).toBe('0 false |')
    })

    it('keeps null a literal where the text is then evaluated as an expression', () => {
        expect(interpolateAndEvaluate('${state.x} === null', { x: null }, {})).toBe(true)
    })
})

// ---------------------------------------------------------------------------------------------
// Security regressions (H2: stored XSS through template interpolation). Every case here ran the
// attacker's code with the previous `new Function('return `' + text + '`')` implementation.
// ---------------------------------------------------------------------------------------------
describe('security: data never becomes code', () => {
    const g = globalThis as Record<string, unknown>
    afterEach(() => {
        delete g.__pwned
        delete g.__pwned2
        delete g.__pwned3
        delete g.__pwned4
        vi.restoreAllMocks()
    })

    it('a state value containing ${...} is not evaluated by interpolateNested (text/notice/dialog path)', () => {
        const payload = '${globalThis.__pwned=1}'
        expect(interpolateNested('Hello ${state.name}', { name: payload }, {}, {}, {}, ))
            .toBe('Hello ' + payload)
        expect(g.__pwned).toBeUndefined()
    })

    it('a state value containing ${...} is not evaluated by interpolate/possiblyHtml/evaluateTemplate', () => {
        const payload = '${globalThis.__pwned=1}'
        expect(interpolate('${state.x}', { x: payload })).toBe(payload)
        expect(possiblyHtml('${state.x}', { x: payload }, {})).toBe(payload)
        expect(evaluateTemplate('${state.x}', { x: payload })).toBe(payload)
        expect(g.__pwned).toBeUndefined()
    })

    it('a literal text with a backtick cannot break out of the template', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const text = 'a`;globalThis.__pwned2=1;`${state.x}'
        expect(interpolate(text, { x: 'b' })).toBe('a`;globalThis.__pwned2=1;`b')
        expect(interpolateNested(text, { x: 'b' }, {}, {}, {})).toBe('a`;globalThis.__pwned2=1;`b')
        expect(possiblyHtml(text, { x: 'b' }, {})).toBe('a`;globalThis.__pwned2=1;`b')
        expect(g.__pwned2).toBeUndefined()
        expect(warn).not.toHaveBeenCalled()
    })

    it('interpolateAndEvaluate: a quoted placeholder cannot be broken out of by a quote in the value', () => {
        const component = { serverSideType: 'x' }
        const evil = 'x" || (globalThis.__pwned3=1) || "'
        expect(interpolateAndEvaluate('component.serverSideType == "${state.type}"',
            { type: evil }, {}, {}, {}, { component })).toBe(false)
        const evil1 = "x' || (globalThis.__pwned3=1) || '"
        expect(interpolateAndEvaluate("component.serverSideType == '${state.type}'",
            { type: evil1 }, {}, {}, {}, { component })).toBe(false)
        const evil2 = 'a\\\\" + (globalThis.__pwned3=1) + "`${globalThis.__pwned3=1}`\n'
        expect(interpolateAndEvaluate('"${state.v}"', { v: evil2 }, {})).toBe(evil2)
        expect(interpolateAndEvaluate('`<${state.v}>`', { v: evil2 }, {})).toBe('<' + evil2 + '>')
        expect(g.__pwned3).toBeUndefined()
    })

    it('interpolateAndEvaluate: an unquoted placeholder inserts a string as a literal, not code', () => {
        expect(interpolateAndEvaluate('${state.v}', { v: 'globalThis.__pwned4=1' }, {}))
            .toBe('globalThis.__pwned4=1')
        expect(interpolateAndEvaluate('${state.v}', { v: { a: '"); globalThis.__pwned4=1; ("' } }, {}))
            .toEqual({ a: '"); globalThis.__pwned4=1; ("' })
        expect(g.__pwned4).toBeUndefined()
    })
})

describe('template parsing', () => {
    it('handles several expressions', () => {
        expect(interpolate('${state.a} and ${state.b}', { a: 1, b: 'two' })).toBe('1 and two')
    })

    it('honours nested braces inside an expression', () => {
        expect(interpolate('${ {a:1}.a }')).toBe('1')
        expect(interpolate('${ [{x: {y: 2}}][0].x.y }!')).toBe('2!')
    })

    it('honours a } inside a string literal of the expression', () => {
        expect(interpolate("${state.x ?? '}'}", {})).toBe('}')
        expect(interpolate('${state.x ?? "}"}|', {})).toBe('}|')
        expect(interpolate("${'it\\'s }'}")).toBe("it's }")
    })

    it('honours a template literal (with its own ${...}) inside the expression', () => {
        expect(interpolate('${`n=${state.n + 1}`}', { n: 1 })).toBe('n=2')
    })

    it('keeps an escaped \\${ literal and unescapes \\\\', () => {
        expect(interpolate('cost: \\${state.x} = ${state.x}', { x: 5 })).toBe('cost: ${state.x} = 5')
        expect(interpolate('a\\\\b ${state.x}', { x: 1 })).toBe('a\\b 1')
    })

    it('keeps other characters verbatim (lone $, }, other backslash sequences)', () => {
        expect(interpolate('$5 } \\n ${state.x}', { x: 'y' })).toBe('$5 } \\n y')
    })

    it('renders null/undefined as blank in displayed texts', () => {
        expect(interpolate('[${state.x}]', { x: null })).toBe('[]')
        expect(interpolateNested('[${state.x}]', {}, {}, {}, {})).toBe('[]')
    })

    it('interpolateAndEvaluate keeps numbers numeric', () => {
        expect(interpolateAndEvaluate('${state.n} > 3', { n: 5 }, {})).toBe(true)
        expect(interpolateAndEvaluate('${state.n} * 2', { n: 21 }, {})).toBe(42)
        expect(interpolateAndEvaluate('${state.b} && true', { b: false }, {})).toBe(false)
    })

    it('interpolateAndEvaluate escapes a quoted value but keeps it equal to itself', () => {
        expect(interpolateAndEvaluate("'${state.s}' === state.s", { s: `it's "q" \`b\` \\ \${x}` }, {})).toBe(true)
    })

    it('an unterminated expression is reported like a syntax error', () => {
        expect(() => evaluateTemplate('${state.x', {})).toThrow(SyntaxError)
        expect(() => evaluateTemplate("${'}", {})).toThrow(SyntaxError)
    })
})

describe('an unresolved i18n expression', () => {
    // The server (or the bundle store) resolves these; one that still arrives has no catalogue
    // behind it: it shows as the key, never blank or raw.
    it('renders as its key', () => {
        expect(interpolate('${i18n.orders.title}', {}, {})).toBe('orders.title')
        expect(interpolate('Hi ${state.name}, ${i18n.welcome}', { name: 'Ana' }, {})).toBe('Hi Ana, welcome')
        expect(interpolateNested('${i18n.a.b}', {}, {}, {}, {})).toBe('a.b')
        expect(possiblyHtml('${i18n.title}', {}, {})).toBe('title')
    })
})
