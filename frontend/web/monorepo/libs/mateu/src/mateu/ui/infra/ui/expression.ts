/**
 * Mateu's own JavaScript-EXPRESSION evaluator: a tokenizer, a precedence-climbing parser and a
 * tree-walking interpreter for the expression subset rules, conditions and `${…}` templates use.
 *
 * WHY: those expressions used to run through `new Function`, which a Content Security Policy
 * without `'unsafe-eval'` blocks — so a strict CSP broke every rule, every condition and every
 * interpolated label. Parsing and walking the tree needs no `eval` at all.
 *
 * It is also a SANDBOX, which `new Function` never was. An expression sees only:
 *  - the named context variables (state, data, appState, appData, component, …) and the parameters
 *    of its own arrow functions;
 *  - a short allow-list of side-effect-free globals ({@link GLOBALS}: Math, JSON, Number, String,
 *    Boolean, Array, Object, Date, Intl, parseInt, …) — no window, document, fetch, eval, Function;
 *  - no access to `constructor`, `__proto__`, `prototype` or `call`/`apply`/`bind`, which closes the
 *    classic `''.constructor.constructor('code')()` escape; `new` only on allow-listed constructors;
 *  - no assignment operators, no `++`/`--`, no `delete`, no statements.
 *
 * Supported syntax: number/string/boolean/null/undefined literals, template literals, regex
 * literals, array and object literals (incl. spread and shorthand), member access (`.`, `[]`,
 * `?.`), calls (incl. `?.()` and spread), `new`, arrow functions with an expression body (for
 * `.filter(x => …)`, `.some(…)`, `.map(…)`), unary `! - + ~ typeof void`, every binary operator
 * (`?? || && | ^ & == != === !== < > <= >= in instanceof << >> >>> + - * / % **`), the ternary
 * and the comma operator. Statements (RunJS, an action's `js`) are NOT expressions; they stay
 * behind an explicit opt-in (see runJs.ts).
 */

// ── tokens ──────────────────────────────────────────────────────────────────────────────────

type Token =
    | { t: 'num'; v: number | bigint; s: number }
    | { t: 'str'; v: string; s: number }
    | { t: 'tpl'; quasis: string[]; exprs: string[]; s: number }
    | { t: 're'; pattern: string; flags: string; s: number }
    | { t: 'id'; v: string; s: number }
    | { t: 'p'; v: string; s: number }
    | { t: 'eof'; s: number }

const PUNCTUATORS = [
    '>>>=', '...', '===', '!==', '**=', '<<=', '>>=', '>>>', '&&=', '||=', '??=',
    '=>', '==', '!=', '<=', '>=', '&&', '||', '??', '?.', '++', '--', '**', '<<', '>>',
    '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=',
    '{', '}', '(', ')', '[', ']', ';', ',', '<', '>', '+', '-', '*', '/', '%', '&', '|', '^',
    '!', '~', '?', ':', '=', '.',
]

const isIdStart = (c: string) => /[A-Za-z_$À-￿]/.test(c)
const isIdPart = (c: string) => /[A-Za-z0-9_$À-￿]/.test(c)

export class ExpressionSyntaxError extends SyntaxError {
    constructor(message: string, readonly source: string, readonly position: number) {
        super(`${message} at ${position} in: ${source}`)
        this.name = 'SyntaxError'
    }
}

const readEscape = (src: string, i: number): [string, number] => {
    const c = src[i]
    switch (c) {
        case 'n': return ['\n', i + 1]
        case 't': return ['\t', i + 1]
        case 'r': return ['\r', i + 1]
        case 'b': return ['\b', i + 1]
        case 'f': return ['\f', i + 1]
        case 'v': return ['\v', i + 1]
        case '0': return ['\0', i + 1]
        case 'x': return [String.fromCharCode(parseInt(src.substr(i + 1, 2), 16)), i + 3]
        case 'u':
            if (src[i + 1] === '{') {
                const end = src.indexOf('}', i)
                return [String.fromCodePoint(parseInt(src.substring(i + 2, end), 16)), end + 1]
            }
            return [String.fromCharCode(parseInt(src.substr(i + 1, 4), 16)), i + 5]
        case '\r': return ['', src[i + 1] === '\n' ? i + 2 : i + 1]
        case '\n': case ' ': case ' ': return ['', i + 1]
        default: return [c, i + 1]
    }
}

/** `i` just after `${` inside a template: index of the matching `}`. */
const templateExprEnd = (src: string, i: number): number => {
    let depth = 0
    while (i < src.length) {
        const c = src[i]
        if (c === "'" || c === '"') {
            const q = c
            i++
            while (i < src.length && src[i] !== q) i += src[i] === '\\' ? 2 : 1
            i++
            continue
        }
        if (c === '`') {
            i++
            while (i < src.length && src[i] !== '`') {
                if (src[i] === '\\') { i += 2; continue }
                if (src[i] === '$' && src[i + 1] === '{') { i = templateExprEnd(src, i + 2) + 1; continue }
                i++
            }
            i++
            continue
        }
        if (c === '{') depth++
        if (c === '}') {
            if (depth === 0) return i
            depth--
        }
        i++
    }
    throw new ExpressionSyntaxError('Unterminated template expression', src, i)
}

const tokenize = (src: string): Token[] => {
    const out: Token[] = []
    let i = 0
    const regexAllowed = () => {
        const prev = out[out.length - 1]
        if (!prev) return true
        if (prev.t === 'num' || prev.t === 'str' || prev.t === 'tpl' || prev.t === 're') return false
        if (prev.t === 'id') return ['typeof', 'void', 'in', 'instanceof', 'new', 'return', 'delete'].includes(prev.v)
        if (prev.t === 'p') return ![')', ']', '}'].includes(prev.v)
        return true
    }
    while (i < src.length) {
        const c = src[i]
        if (/\s/.test(c)) { i++; continue }
        if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue }
        if (c === '/' && src[i + 1] === '*') {
            const end = src.indexOf('*/', i + 2)
            if (end < 0) throw new ExpressionSyntaxError('Unterminated comment', src, i)
            i = end + 2
            continue
        }
        const start = i
        if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] ?? ''))) {
            const m = /^(0[xX][0-9a-fA-F_]+|0[oO][0-7_]+|0[bB][01_]+|(?:[0-9][0-9_]*)?\.?[0-9_]*(?:[eE][+-]?[0-9]+)?)(n?)/.exec(src.slice(i))!
            const text = m[1].replace(/_/g, '')
            i += m[0].length
            out.push({ t: 'num', v: m[2] ? BigInt(text) : Number(text), s: start })
            continue
        }
        if (c === "'" || c === '"') {
            let v = ''
            i++
            while (i < src.length && src[i] !== c) {
                if (src[i] === '\\') {
                    const [e, next] = readEscape(src, i + 1)
                    v += e
                    i = next
                } else {
                    if (src[i] === '\n') throw new ExpressionSyntaxError('Unterminated string', src, start)
                    v += src[i++]
                }
            }
            if (i >= src.length) throw new ExpressionSyntaxError('Unterminated string', src, start)
            i++
            out.push({ t: 'str', v, s: start })
            continue
        }
        if (c === '`') {
            const quasis: string[] = []
            const exprs: string[] = []
            let q = ''
            i++
            for (;;) {
                if (i >= src.length) throw new ExpressionSyntaxError('Unterminated template literal', src, start)
                const ch = src[i]
                if (ch === '`') { i++; break }
                if (ch === '\\') {
                    const [e, next] = readEscape(src, i + 1)
                    q += e
                    i = next
                    continue
                }
                if (ch === '$' && src[i + 1] === '{') {
                    const end = templateExprEnd(src, i + 2)
                    quasis.push(q)
                    q = ''
                    exprs.push(src.substring(i + 2, end))
                    i = end + 1
                    continue
                }
                q += ch
                i++
            }
            quasis.push(q)
            out.push({ t: 'tpl', quasis, exprs, s: start })
            continue
        }
        if (c === '/' && regexAllowed()) {
            let j = i + 1
            let inClass = false
            while (j < src.length) {
                const ch = src[j]
                if (ch === '\\') { j += 2; continue }
                if (ch === '[') inClass = true
                else if (ch === ']') inClass = false
                else if (ch === '/' && !inClass) break
                else if (ch === '\n') break
                j++
            }
            if (src[j] !== '/') throw new ExpressionSyntaxError('Unterminated regular expression', src, start)
            const pattern = src.substring(i + 1, j)
            j++
            let flags = ''
            while (j < src.length && /[a-z]/i.test(src[j])) flags += src[j++]
            i = j
            out.push({ t: 're', pattern, flags, s: start })
            continue
        }
        if (isIdStart(c)) {
            let j = i + 1
            while (j < src.length && isIdPart(src[j])) j++
            out.push({ t: 'id', v: src.substring(i, j), s: start })
            i = j
            continue
        }
        const p = PUNCTUATORS.find((x) => src.startsWith(x, i))
        if (!p) throw new ExpressionSyntaxError(`Unexpected character '${c}'`, src, i)
        // `?.` followed by a digit is a ternary and a number (a?.5:1)
        if (p === '?.' && /[0-9]/.test(src[i + 2] ?? '')) {
            out.push({ t: 'p', v: '?', s: start })
            i += 1
            continue
        }
        out.push({ t: 'p', v: p, s: start })
        i += p.length
    }
    out.push({ t: 'eof', s: i })
    return out
}

// ── AST ─────────────────────────────────────────────────────────────────────────────────────

type Node =
    | { k: 'lit'; v: unknown }
    | { k: 're'; pattern: string; flags: string }
    | { k: 'id'; name: string }
    | { k: 'tpl'; quasis: string[]; exprs: Node[] }
    | { k: 'arr'; items: (Node | { k: 'spread'; arg: Node } | null)[] }
    | { k: 'obj'; props: ({ key: Node | string; value: Node } | { k: 'spread'; arg: Node })[] }
    | { k: 'member'; obj: Node; prop: Node | string; optional: boolean }
    | { k: 'call'; callee: Node; args: (Node | { k: 'spread'; arg: Node })[]; optional: boolean }
    | { k: 'chain'; expr: Node }
    | { k: 'new'; callee: Node; args: (Node | { k: 'spread'; arg: Node })[] }
    | { k: 'unary'; op: string; arg: Node }
    | { k: 'bin'; op: string; left: Node; right: Node }
    | { k: 'logic'; op: string; left: Node; right: Node }
    | { k: 'cond'; test: Node; then: Node; else: Node }
    | { k: 'seq'; items: Node[] }
    | { k: 'arrow'; params: string[]; rest: string | undefined; body: Node }
    | { k: 'spread'; arg: Node }

const BINARY: Record<string, number> = {
    '??': 1, '||': 2, '&&': 3, '|': 4, '^': 5, '&': 6,
    '==': 7, '!=': 7, '===': 7, '!==': 7,
    '<': 8, '>': 8, '<=': 8, '>=': 8, 'in': 8, 'instanceof': 8,
    '<<': 9, '>>': 9, '>>>': 9,
    '+': 10, '-': 10,
    '*': 11, '/': 11, '%': 11,
    '**': 12,
}

const ASSIGNMENT_OPS = new Set(['=', '+=', '-=', '*=', '/=', '%=', '**=', '<<=', '>>=', '>>>=', '&=', '|=', '^=', '&&=', '||=', '??='])

class Parser {
    private i = 0
    constructor(private readonly tokens: Token[], private readonly src: string) {}

    private peek(offset = 0): Token { return this.tokens[Math.min(this.i + offset, this.tokens.length - 1)] }
    private next(): Token { return this.tokens[this.i++] }
    private isP(v: string, offset = 0) { const t = this.peek(offset); return t.t === 'p' && t.v === v }
    private isId(v: string, offset = 0) { const t = this.peek(offset); return t.t === 'id' && t.v === v }
    private fail(msg: string, tok: Token = this.peek()): never { throw new ExpressionSyntaxError(msg, this.src, tok.s) }
    private expectP(v: string) {
        if (!this.isP(v)) this.fail(`Expected '${v}'`)
        this.i++
    }

    parseAll(): Node {
        const node = this.sequence()
        if (this.isP(';')) this.i++ // a single trailing semicolon is tolerated
        if (this.peek().t !== 'eof') {
            const t = this.peek()
            if (t.t === 'p' && (ASSIGNMENT_OPS.has(t.v) || t.v === '++' || t.v === '--')) this.fail('Assignments are not allowed in expressions')
            this.fail('Unexpected token')
        }
        return node
    }

    private sequence(): Node {
        const first = this.assignment()
        if (!this.isP(',')) return first
        const items = [first]
        while (this.isP(',')) { this.i++; items.push(this.assignment()) }
        return { k: 'seq', items }
    }

    /** An "assignment expression" slot: arrow function or conditional (assignment itself is refused). */
    private assignment(): Node {
        const arrow = this.tryArrow()
        if (arrow) return arrow
        const node = this.conditional()
        const t = this.peek()
        if (t.t === 'p' && ASSIGNMENT_OPS.has(t.v)) this.fail('Assignments are not allowed in expressions')
        return node
    }

    private tryArrow(): Node | undefined {
        const t = this.peek()
        if (t.t === 'id' && this.isP('=>', 1) && !BINARY[t.v]) {
            this.i += 2
            return { k: 'arrow', params: [t.v], rest: undefined, body: this.arrowBody() }
        }
        if (!this.isP('(')) return undefined
        // ( [id [, id]* [, ...id]] ) =>
        let j = 1
        const params: string[] = []
        let rest: string | undefined
        if (!this.isP(')', j)) {
            for (;;) {
                if (this.isP('...', j)) {
                    const id = this.peek(j + 1)
                    if (id.t !== 'id') return undefined
                    rest = id.v
                    j += 2
                    break
                }
                const id = this.peek(j)
                if (id.t !== 'id') return undefined
                params.push(id.v)
                j++
                if (this.isP(',', j)) { j++; continue }
                break
            }
        }
        if (!this.isP(')', j) || !this.isP('=>', j + 1)) return undefined
        this.i += j + 2
        return { k: 'arrow', params, rest, body: this.arrowBody() }
    }

    private arrowBody(): Node {
        if (this.isP('{')) this.fail('Arrow functions with a block body are not supported; use an expression body')
        return this.assignment()
    }

    private conditional(): Node {
        const test = this.binary(0)
        if (!this.isP('?')) return test
        this.i++
        const then = this.assignment()
        this.expectP(':')
        const otherwise = this.assignment()
        return { k: 'cond', test, then, else: otherwise }
    }

    private binaryOp(): string | undefined {
        const t = this.peek()
        if (t.t === 'p' && BINARY[t.v] !== undefined) return t.v
        if (t.t === 'id' && (t.v === 'in' || t.v === 'instanceof')) return t.v
        return undefined
    }

    private binary(minPrec: number): Node {
        let left = this.unary()
        for (;;) {
            const op = this.binaryOp()
            if (!op) return left
            const prec = BINARY[op]
            if (prec < minPrec) return left
            this.i++
            // ** is right-associative; the rest are left-associative
            const right = op === '**' ? this.binary(prec) : this.binary(prec + 1)
            left = (op === '&&' || op === '||' || op === '??')
                ? { k: 'logic', op, left, right }
                : { k: 'bin', op, left, right }
        }
    }

    private unary(): Node {
        const t = this.peek()
        if (t.t === 'p' && ['!', '-', '+', '~'].includes(t.v)) {
            this.i++
            return { k: 'unary', op: t.v, arg: this.unary() }
        }
        if (t.t === 'p' && (t.v === '++' || t.v === '--')) this.fail('Assignments are not allowed in expressions')
        if (t.t === 'id' && (t.v === 'typeof' || t.v === 'void')) {
            this.i++
            return { k: 'unary', op: t.v, arg: this.unary() }
        }
        if (t.t === 'id' && t.v === 'delete') this.fail("'delete' is not allowed in expressions")
        const node = this.postfix()
        if (this.isP('++') || this.isP('--')) this.fail('Assignments are not allowed in expressions')
        return node
    }

    private args(): (Node | { k: 'spread'; arg: Node })[] {
        this.expectP('(')
        const args: (Node | { k: 'spread'; arg: Node })[] = []
        while (!this.isP(')')) {
            if (this.isP('...')) { this.i++; args.push({ k: 'spread', arg: this.assignment() }) }
            else args.push(this.assignment())
            if (!this.isP(')')) this.expectP(',')
        }
        this.i++
        return args
    }

    private postfix(): Node {
        let node: Node
        if (this.isId('new')) {
            this.i++
            let callee: Node = this.primary()
            while (this.isP('.')) {
                this.i++
                const name = this.next()
                if (name.t !== 'id') this.fail('Expected a property name', name)
                callee = { k: 'member', obj: callee, prop: name.v, optional: false }
            }
            const args = this.isP('(') ? this.args() : []
            node = { k: 'new', callee, args }
        } else {
            node = this.primary()
        }
        let chained = false
        for (;;) {
            if (this.isP('.')) {
                this.i++
                const name = this.next()
                if (name.t !== 'id') this.fail('Expected a property name', name)
                node = { k: 'member', obj: node, prop: name.v, optional: false }
            } else if (this.isP('?.')) {
                this.i++
                chained = true
                if (this.isP('(')) {
                    node = { k: 'call', callee: node, args: this.args(), optional: true }
                } else if (this.isP('[')) {
                    this.i++
                    const prop = this.sequence()
                    this.expectP(']')
                    node = { k: 'member', obj: node, prop, optional: true }
                } else {
                    const name = this.next()
                    if (name.t !== 'id') this.fail('Expected a property name', name)
                    node = { k: 'member', obj: node, prop: name.v, optional: true }
                }
            } else if (this.isP('[')) {
                this.i++
                const prop = this.sequence()
                this.expectP(']')
                node = { k: 'member', obj: node, prop, optional: false }
            } else if (this.isP('(')) {
                node = { k: 'call', callee: node, args: this.args(), optional: false }
            } else if (this.peek().t === 'tpl') {
                this.fail('Tagged templates are not supported')
            } else {
                break
            }
        }
        return chained ? { k: 'chain', expr: node } : node
    }

    private primary(): Node {
        const t = this.next()
        switch (t.t) {
            case 'num': return { k: 'lit', v: t.v }
            case 'str': return { k: 'lit', v: t.v }
            case 're': return { k: 're', pattern: t.pattern, flags: t.flags }
            case 'tpl': return { k: 'tpl', quasis: t.quasis, exprs: t.exprs.map((e) => parse(e)) }
            case 'id':
                switch (t.v) {
                    case 'true': return { k: 'lit', v: true }
                    case 'false': return { k: 'lit', v: false }
                    case 'null': return { k: 'lit', v: null }
                    case 'undefined': return { k: 'lit', v: undefined }
                    case 'this': return { k: 'lit', v: undefined }
                    case 'function': case 'class': case 'import': case 'await': case 'yield': case 'super':
                        this.fail(`'${t.v}' is not allowed in expressions`, t)
                }
                return { k: 'id', name: t.v }
            case 'p':
                if (t.v === '(') {
                    const inner = this.sequence()
                    this.expectP(')')
                    return inner
                }
                if (t.v === '[') {
                    const items: (Node | { k: 'spread'; arg: Node } | null)[] = []
                    while (!this.isP(']')) {
                        if (this.isP(',')) { this.i++; items.push(null); continue }
                        if (this.isP('...')) { this.i++; items.push({ k: 'spread', arg: this.assignment() }) }
                        else items.push(this.assignment())
                        if (!this.isP(']')) this.expectP(',')
                    }
                    this.i++
                    return { k: 'arr', items }
                }
                if (t.v === '{') {
                    const props: ({ key: Node | string; value: Node } | { k: 'spread'; arg: Node })[] = []
                    while (!this.isP('}')) {
                        if (this.isP('...')) {
                            this.i++
                            props.push({ k: 'spread', arg: this.assignment() })
                        } else {
                            const keyTok = this.next()
                            let key: Node | string
                            if (keyTok.t === 'id') key = keyTok.v
                            else if (keyTok.t === 'str') key = keyTok.v
                            else if (keyTok.t === 'num') key = String(keyTok.v)
                            else if (keyTok.t === 'p' && keyTok.v === '[') {
                                key = this.assignment()
                                this.expectP(']')
                            } else this.fail('Unexpected token in object literal', keyTok)
                            if (this.isP(':')) {
                                this.i++
                                props.push({ key, value: this.assignment() })
                            } else if (keyTok.t === 'id') {
                                props.push({ key, value: { k: 'id', name: keyTok.v } })
                            } else this.fail("Expected ':'")
                        }
                        if (!this.isP('}')) this.expectP(',')
                    }
                    this.i++
                    return { k: 'obj', props }
                }
        }
        this.fail('Unexpected token', t)
    }
}

/** Parses an expression into its tree; throws a SyntaxError on anything outside the subset. */
export const parse = (source: string): Node => new Parser(tokenize(source), source).parseAll()

// ── evaluation ──────────────────────────────────────────────────────────────────────────────

/** Properties an expression may never read: the routes from a value back to `Function`. */
const BLOCKED_PROPERTIES = new Set([
    'constructor', '__proto__', 'prototype', '__defineGetter__', '__defineSetter__',
    '__lookupGetter__', '__lookupSetter__',
])

/** Blocked only ON A FUNCTION (a data field may well be called `call`). */
const BLOCKED_FUNCTION_PROPERTIES = new Set(['call', 'apply', 'bind', 'caller', 'arguments'])

/** The globals an expression may use: side-effect-free values and helpers only. */
export const GLOBALS: Readonly<Record<string, unknown>> = Object.freeze({
    Math, JSON, Number, String, Boolean, Array, Object, Date, Intl, RegExp, Set, Map,
    parseInt, parseFloat, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent, encodeURI, decodeURI,
    NaN, Infinity,
})

const CONSTRUCTIBLE = new Set<unknown>([Date, RegExp, Set, Map, Array, Number, String, Boolean, Object,
    Intl.NumberFormat, Intl.DateTimeFormat, Intl.Collator, Intl.PluralRules, Intl.RelativeTimeFormat,
    Intl.ListFormat])

/** Functions that would hand an expression arbitrary code execution or global mutation. */
const FORBIDDEN_FUNCTIONS = new Set<unknown>([
    // referenced only to be REFUSED, never called
    // eslint-disable-next-line no-eval
    Function, eval,
    Object.defineProperty, Object.defineProperties, Object.setPrototypeOf, Object.assign,
    Object.freeze, Object.seal, Object.preventExtensions, Reflect?.set, Reflect?.defineProperty,
    Reflect?.setPrototypeOf, Reflect?.deleteProperty,
].filter(Boolean))

type Scope = { vars: Record<string, unknown>; parent?: Scope }

const SHORT_CIRCUIT = Symbol('mateu.expression.shortCircuit')

const propertyKey = (v: unknown): string | symbol => (typeof v === 'symbol' ? v : String(v))

const checkProperty = (key: string | symbol) => {
    if (typeof key === 'string' && BLOCKED_PROPERTIES.has(key)) {
        throw new TypeError(`Access to '${key}' is not allowed in expressions`)
    }
}

const describe = (node: Node): string => {
    if (node.k === 'id') return node.name
    if (node.k === 'member') return describe(node.obj) + (typeof node.prop === 'string' ? '.' + node.prop : '[…]')
    if (node.k === 'call') return describe(node.callee) + '(…)'
    return 'expression'
}

const lookup = (scope: Scope, name: string): { found: boolean; value: unknown } => {
    for (let s: Scope | undefined = scope; s; s = s.parent) {
        if (Object.prototype.hasOwnProperty.call(s.vars, name)) return { found: true, value: s.vars[name] }
    }
    if (Object.prototype.hasOwnProperty.call(GLOBALS, name)) return { found: true, value: GLOBALS[name] }
    return { found: false, value: undefined }
}

const getMember = (obj: unknown, key: string | symbol, node: Node): unknown => {
    checkProperty(key)
    if (typeof obj === 'function' && typeof key === 'string' && BLOCKED_FUNCTION_PROPERTIES.has(key)) {
        throw new TypeError(`Access to '${key}' is not allowed in expressions`)
    }
    if (obj === null || obj === undefined) {
        throw new TypeError(`Cannot read properties of ${obj} (reading '${String(key)}') in ${describe(node)}`)
    }
    return (obj as Record<string | symbol, unknown>)[key]
}

const evalArgs = (args: (Node | { k: 'spread'; arg: Node })[], scope: Scope): unknown[] => {
    const out: unknown[] = []
    for (const a of args) {
        if (a.k === 'spread') out.push(...(evaluateNode(a.arg, scope) as Iterable<unknown>))
        else out.push(evaluateNode(a, scope))
    }
    return out
}

const invoke = (fn: unknown, self: unknown, args: unknown[], node: Node): unknown => {
    if (typeof fn !== 'function') throw new TypeError(`${describe(node)} is not a function`)
    if (FORBIDDEN_FUNCTIONS.has(fn)) throw new TypeError(`${describe(node)} is not allowed in expressions`)
    return Reflect.apply(fn as (...a: unknown[]) => unknown, self, args)
}

const binary = (op: string, l: unknown, r: unknown): unknown => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const a = l as any
    const b = r as any
    switch (op) {
        case '+': return a + b
        case '-': return a - b
        case '*': return a * b
        case '/': return a / b
        case '%': return a % b
        case '**': return a ** b
        case '==': return a == b
        case '!=': return a != b
        case '===': return a === b
        case '!==': return a !== b
        case '<': return a < b
        case '>': return a > b
        case '<=': return a <= b
        case '>=': return a >= b
        case '|': return a | b
        case '^': return a ^ b
        case '&': return a & b
        case '<<': return a << b
        case '>>': return a >> b
        case '>>>': return a >>> b
        case 'in': return propertyKey(a) in Object(b)
        case 'instanceof': return a instanceof b
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
    throw new SyntaxError('Unknown operator ' + op)
}

const evaluateNode = (node: Node, scope: Scope): unknown => {
    switch (node.k) {
        case 'lit': return node.v
        case 're': return new RegExp(node.pattern, node.flags)
        case 'id': {
            const { found, value } = lookup(scope, node.name)
            if (!found) throw new ReferenceError(`${node.name} is not defined`)
            return value
        }
        case 'tpl': {
            let out = node.quasis[0]
            for (let i = 0; i < node.exprs.length; i++) {
                out += String(evaluateNode(node.exprs[i], scope)) + node.quasis[i + 1]
            }
            return out
        }
        case 'arr': {
            const out: unknown[] = []
            for (const item of node.items) {
                if (item === null) out.length++
                else if (item.k === 'spread') out.push(...(evaluateNode(item.arg, scope) as Iterable<unknown>))
                else out.push(evaluateNode(item, scope))
            }
            return out
        }
        case 'obj': {
            const out: Record<string | symbol, unknown> = {}
            for (const p of node.props) {
                if ('k' in p && p.k === 'spread') {
                    Object.assign(out, evaluateNode(p.arg, scope))
                    continue
                }
                const prop = p as { key: Node | string; value: Node }
                const key = typeof prop.key === 'string' ? prop.key : propertyKey(evaluateNode(prop.key, scope))
                checkProperty(key)
                out[key] = evaluateNode(prop.value, scope)
            }
            return out
        }
        case 'chain':
            try {
                return evaluateNode(node.expr, scope)
            } catch (e) {
                if (e === SHORT_CIRCUIT) return undefined
                throw e
            }
        case 'member': {
            const obj = evaluateNode(node.obj, scope)
            if (node.optional && (obj === null || obj === undefined)) throw SHORT_CIRCUIT
            const key = typeof node.prop === 'string' ? node.prop : propertyKey(evaluateNode(node.prop, scope))
            return getMember(obj, key, node)
        }
        case 'call': {
            let self: unknown
            let fn: unknown
            if (node.callee.k === 'member') {
                const callee = node.callee
                self = evaluateNode(callee.obj, scope)
                if (callee.optional && (self === null || self === undefined)) throw SHORT_CIRCUIT
                const key = typeof callee.prop === 'string' ? callee.prop : propertyKey(evaluateNode(callee.prop, scope))
                fn = getMember(self, key, callee)
            } else {
                fn = evaluateNode(node.callee, scope)
            }
            if (node.optional && (fn === null || fn === undefined)) throw SHORT_CIRCUIT
            return invoke(fn, self, evalArgs(node.args, scope), node.callee)
        }
        case 'new': {
            const ctor = evaluateNode(node.callee, scope)
            if (!CONSTRUCTIBLE.has(ctor)) throw new TypeError(`'new ${describe(node.callee)}' is not allowed in expressions`)
            return Reflect.construct(ctor as new (...a: unknown[]) => unknown, evalArgs(node.args, scope))
        }
        case 'unary': {
            if (node.op === 'typeof') {
                if (node.arg.k === 'id' && !lookup(scope, node.arg.name).found) return 'undefined'
                return typeof evaluateNode(node.arg, scope)
            }
            const v = evaluateNode(node.arg, scope)
            switch (node.op) {
                case '!': return !v
                case '-': return -(v as number)
                case '+': return +(v as number)
                case '~': return ~(v as number)
                case 'void': return undefined
            }
            throw new SyntaxError('Unknown operator ' + node.op)
        }
        case 'logic': {
            const l = evaluateNode(node.left, scope)
            if (node.op === '&&') return l ? evaluateNode(node.right, scope) : l
            if (node.op === '||') return l ? l : evaluateNode(node.right, scope)
            return l ?? evaluateNode(node.right, scope)
        }
        case 'bin': return binary(node.op, evaluateNode(node.left, scope), evaluateNode(node.right, scope))
        case 'cond': return evaluateNode(node.test, scope) ? evaluateNode(node.then, scope) : evaluateNode(node.else, scope)
        case 'seq': {
            let v: unknown
            for (const item of node.items) v = evaluateNode(item, scope)
            return v
        }
        case 'arrow': {
            const { params, rest, body } = node
            return (...args: unknown[]) => {
                const vars: Record<string, unknown> = Object.create(null)
                params.forEach((p, i) => { vars[p] = args[i] })
                if (rest) vars[rest] = args.slice(params.length)
                return evaluateNode(body, { vars, parent: scope })
            }
        }
        case 'spread': throw new SyntaxError('Unexpected spread')
    }
}

// ── public API ──────────────────────────────────────────────────────────────────────────────

const MAX_CACHED = 500
const cache = new Map<string, Node>()

/** The parsed tree of `source`, cached (expressions come from metadata and repeat a lot). */
const compiled = (source: string): Node => {
    let node = cache.get(source)
    if (!node) {
        node = parse(source)
        if (cache.size >= MAX_CACHED) cache.delete(cache.keys().next().value!)
        cache.set(source, node)
    }
    return node
}

/**
 * Evaluates a JavaScript expression against named context variables — the CSP-safe, sandboxed
 * replacement for `new Function(...Object.keys(ctx), 'return (' + source + ')')(...values)`.
 * Throws a SyntaxError for anything outside the supported subset, a ReferenceError for an unknown
 * name, a TypeError for a forbidden access — the same kinds of error `new Function` threw.
 *
 * `cache: false` for sources that embed data values (they would only pollute the cache).
 */
export const evaluate = (source: string, context: Record<string, unknown> = {}, options: { cache?: boolean } = {}): unknown => {
    const node = options.cache === false ? parse(source) : compiled(source)
    const vars: Record<string, unknown> = Object.create(null)
    for (const key of Object.keys(context)) vars[key] = context[key]
    return evaluateNode(node, { vars })
}
