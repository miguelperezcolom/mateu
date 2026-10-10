import { describe, expect, it } from 'vitest'
import { evaluate, parse } from './expression'

const ctx = {
    state: { name: 'Ana', age: 41, active: true, tags: ['a', 'b'], n: 0, empty: '', nested: { x: { y: 3 } }, nil: null },
    data: { rows: [{ id: 1, total: 10 }, { id: 2, total: 5 }] },
    appState: { hotel: 'H1' },
    appData: {},
    component: { type: 'ServerSide', id: 'c1' },
}
const ev = (src: string, c: Record<string, unknown> = ctx) => evaluate(src, c)

/** The same expression through the real JS engine, as the reference semantics. */
// eslint-disable-next-line no-new-func
const js = (src: string, c: Record<string, unknown> = ctx) => new Function(...Object.keys(c), 'return (' + src + '\n)')(...Object.values(c))

describe('expression evaluator — JavaScript semantics on the subset Mateu uses', () => {
    const SAME_AS_JS = [
        // literals
        '1', '1.5', '.5', '1e3', '0x1F', '1_000', "'x'", '"y"', "'it\\'s'", '"a\\nb"', 'true', 'false', 'null', 'undefined',
        '`plain`', '`hi ${state.name}!`', '`${state.age + 1} years`', '`nested ${`${state.name}`}`',
        '[1, 2, ...state.tags]', '({ a: 1, "b": 2, [state.name]: 3, ...state.nested })', '({ name: state.name }).name',
        // member access
        'state.name', "state['name']", 'state.nested.x.y', 'state.tags[1]', 'state.tags.length', 'data.rows[0].total',
        'state.missing', 'state.nil?.x', 'state.nil?.x.y.z', 'state.nested?.x?.y', 'state.missing?.[0]', 'state.nil?.()',
        // operators
        "state.name == 'Ana'", "state.name === 'Ana'", "state.name != 'Bob'", "state.name !== 'Ana'",
        'state.age > 40', 'state.age >= 41', 'state.age < 41', 'state.age <= 41', '1 + 2 * 3', '(1 + 2) * 3', '2 ** 3 ** 2',
        '7 % 3', '10 / 4', "'a' + state.age", '-state.age', '+"3"', '!state.active', '!!state.empty', '~1', 'typeof state.name',
        'typeof nope', 'void 0', 'state.active && state.age', 'state.empty || "default"', 'state.nil ?? "fallback"', 'state.n ?? 5',
        "'name' in state", 'state.tags instanceof Array', 'state.age > 40 ? "senior" : "junior"',
        'state.active ? state.age > 40 ? 1 : 2 : 3', '1 << 2', '-8 >> 1', '-8 >>> 28', '5 & 3', '5 | 3', '5 ^ 3', '(1, 2)',
        "state.name == 'Ana' && state.age > 40 || !state.active",
        // calls, methods and arrow functions
        "state.tags.includes('a')", "state.name.toUpperCase()", "state.name.startsWith('A')", "state.tags.join('-')",
        'data.rows.filter(r => r.total > 6).length', 'data.rows.map((r) => r.id)', 'data.rows.some(r => r.id === 2)',
        'data.rows.reduce((sum, r) => sum + r.total, 0)', 'data.rows.find(r => r.id == 2).total', 'state.tags.map((t, i) => t + i)',
        'Math.max(1, state.age)', 'Math.round(2.5)', 'Number("42")', 'String(42)', 'parseInt("12px")', 'parseFloat("1.5")',
        'Object.keys(state.nested)', 'JSON.stringify({ a: 1 })', 'Array.isArray(state.tags)', 'isNaN(NaN)', 'Boolean(state.empty)',
        "new Date(2024, 0, 2).getFullYear()", "new Intl.NumberFormat('en-US').format(1234.5)", '(41).toFixed(2)',
        "'a-b-c'.split('-')", "/^A/.test(state.name)", "state.name.replace(/a/g, 'o')", "state.name.match(/n(a)/)[1]",
        "[3, 1, 2].slice().sort()", 'Math.max(...[1, 5, 3])', '((...xs) => xs.length)(1, 2, 3)',
        // whitespace, comments and a trailing semicolon
        '  state.age  /* the age */ > 1 // trailing comment',
        // context variables
        "appState.hotel == 'H1'", "component.type == 'ServerSide'",
    ]
    for (const src of SAME_AS_JS) {
        it(src, () => expect(ev(src)).toEqual(js(src)))
    }

    it('throws the same kinds of error as the engine', () => {
        expect(() => ev('nope.x')).toThrow(ReferenceError)
        expect(() => ev('nope.x')).toThrow('nope is not defined')
        expect(() => ev('state.nil.x')).toThrow(TypeError)
        expect(() => ev('state.name()')).toThrow(TypeError)
        expect(() => ev('state.')).toThrow(SyntaxError)
        expect(() => ev("'unterminated")).toThrow(SyntaxError)
        expect(() => ev('1 +')).toThrow(SyntaxError)
    })

    it('tolerates one trailing semicolon (a filter written as a statement)', () => {
        expect(ev('state.active;')).toBe(true)
    })

    it('arrow parameters shadow context variables only inside their body', () => {
        expect(ev('data.rows.map(state => state.id).concat([state.age])')).toEqual([1, 2, 41])
    })
})

describe('expression evaluator — the sandbox', () => {
    it('refuses assignments, increments, delete and statements', () => {
        for (const bad of ['state.age = 1', 'state.age += 1', 'state.age++', '--state.age', 'delete state.age',
            'state.a ||= 1', 'if (x) y', 'function f() {}', 'x => { return 1 }']) {
            expect(() => ev(bad), bad).toThrow()
        }
        expect(ctx.state.age).toBe(41)
    })

    it('closes the routes to the Function constructor', () => {
        for (const bad of ["''.constructor.constructor('return 1')()", "state.constructor", "state.__proto__",
            "[].map.constructor('alert(1)')()", "(() => 1).constructor", "Object.prototype", "Math.max.call(null, 1)",
            "(x => x).bind(null)", "state['constr' + 'uctor']", "({}).__proto__", "Object.getPrototypeOf(() => 1).constructor"]) {
            expect(() => ev(bad), bad).toThrow()
        }
    })

    it('sees no browser globals and forbids dangerous functions', () => {
        for (const bad of ['window', 'document.cookie', 'globalThis', 'fetch("/x")', 'eval("1")', 'Function("1")',
            'setTimeout', 'localStorage', 'self', 'Object.defineProperty(state, "x", {})', 'Object.assign(state, { a: 1 })',
            'new Function("1")', 'new Proxy({}, {})', 'import("x")']) {
            expect(() => ev(bad), bad).toThrow()
        }
    })

    it('lets a data field be called like a function property name', () => {
        expect(ev('state.call', { state: { call: 'x', bind: 2 } })).toBe('x')
        expect(ev('state.bind', { state: { call: 'x', bind: 2 } })).toBe(2)
    })

    it('parses once and caches', () => {
        expect(() => parse('state.a ? state.b : state.c')).not.toThrow()
        expect(ev('state.age > 1')).toBe(true)
        expect(ev('state.age > 1')).toBe(true)
    })
})
