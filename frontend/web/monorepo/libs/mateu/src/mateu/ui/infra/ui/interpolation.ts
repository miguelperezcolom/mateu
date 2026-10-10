import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { evaluate } from "@infra/ui/expression.ts";

/**
 * Extra named variables made available to an interpolated expression, besides
 * `state` and `data` (e.g. `{ appState, appData }`).
 */
export type InterpolationContext = Record<string, unknown>

// ---------------------------------------------------------------------------------------------
// Template parsing
//
// SECURITY: a text is NEVER turned into JS source as a whole. It used to be wrapped in backticks
// and handed to `new Function`, so a backtick or a `${` anywhere in the text — including in DATA
// that an earlier substitution had put there — became code running in every viewer's browser.
// Now the text is split into literal segments, copied as plain strings, and `${ expr }`
// expression segments; only the expression bodies (which come from the UI definition/metadata,
// never from data) are compiled and evaluated. A substituted value is never evaluated again.
//
// Literal segments: the only escapes recognised are `\${` → a literal `${` (no expression) and
// `\\` → `\`. Every other character — including a backtick, a lone `$`, a `}` and any other
// backslash sequence such as `\n` — is kept verbatim. (Under the old template-literal evaluation
// `\n`, `\t`, `\u…` were cooked into control characters and an unknown escape like `\d` lost its
// backslash; a text that relied on that now shows the backslash sequence as written. Put real
// newlines in the text instead.)
//
// Expression segments: the body runs from `${` to the matching `}`, honouring nested braces and
// string literals ('…', "…" and `…` with backslash escapes; a `…` literal may itself contain
// `${ … }`). Comments and regex literals are not recognised, so a `}` inside one of them ends
// the expression early — not a concern for the short expressions labels use.
// ---------------------------------------------------------------------------------------------

type Segment = { lit: string } | { expr: string }

/** `i` is at the opening quote; returns the index just after the closing quote. */
const skipQuoted = (s: string, i: number): number => {
    const q = s[i]
    for (let j = i + 1; j < s.length; j++) {
        const c = s[j]
        if (c === '\\') { j++; continue }
        if (c === q) return j + 1
    }
    throw new SyntaxError('Unterminated string literal in template expression')
}

/** `i` is at the opening backtick; returns the index just after the closing backtick. */
const skipBacktick = (s: string, i: number): number => {
    for (let j = i + 1; j < s.length; j++) {
        const c = s[j]
        if (c === '\\') { j++; continue }
        if (c === '`') return j + 1
        if (c === '$' && s[j + 1] === '{') {
            j = findExpressionEnd(s, j + 2) // index of the matching '}', the loop moves past it
        }
    }
    throw new SyntaxError('Unterminated template literal in template expression')
}

/** `i` is just after a `${`; returns the index of the matching `}`. */
const findExpressionEnd = (s: string, i: number): number => {
    let depth = 0
    let j = i
    while (j < s.length) {
        const c = s[j]
        if (c === "'" || c === '"') { j = skipQuoted(s, j); continue }
        if (c === '`') { j = skipBacktick(s, j); continue }
        if (c === '{') depth++
        else if (c === '}') {
            if (depth === 0) return j
            depth--
        }
        j++
    }
    throw new SyntaxError('Unterminated ${ expression in "' + s + '"')
}

const parseTemplate = (text: string): Segment[] => {
    const segments: Segment[] = []
    let lit = ''
    let i = 0
    while (i < text.length) {
        const c = text[i]
        if (c === '\\' && text[i + 1] === '\\') { lit += '\\'; i += 2; continue }
        if (c === '\\' && text[i + 1] === '$' && text[i + 2] === '{') { lit += '${'; i += 3; continue }
        if (c === '$' && text[i + 1] === '{') {
            const end = findExpressionEnd(text, i + 2)
            if (lit) segments.push({ lit })
            lit = ''
            segments.push({ expr: text.substring(i + 2, end) })
            i = end + 1
            continue
        }
        lit += c
        i++
    }
    if (lit) segments.push({ lit })
    return segments
}

// ---------------------------------------------------------------------------------------------
// Expression evaluation: only metadata-provided expression bodies are ever evaluated, and by
// Mateu's own sandboxed evaluator (expression.ts) — never `new Function`/`eval`, so the client
// runs under a Content Security Policy without 'unsafe-eval'.
// ---------------------------------------------------------------------------------------------

const evalExpr = (expr: string, ctx: InterpolationContext): unknown => evaluate(expr, ctx)

/**
 * Evaluates the `${…}` expressions of a text that is SHOWN and concatenates them with its
 * literal parts. A null/undefined value renders as nothing: an untagged template literal turned
 * them into the words "null"/"undefined", so a field left null painted "null" in a label, a
 * notice or a text — and a {@code @Notice} whose blank value should hide it showed a banner
 * saying "null". Any other value is converted like a template literal does (`String(value)`).
 * Throws on a failing expression — callers decide the error behaviour.
 */
const renderDisplayTemplate = (text: string, ctx: InterpolationContext): string => {
    let out = ''
    for (const seg of parseTemplate(text)) {
        out += 'lit' in seg ? seg.lit : String(evalExpr(seg.expr, ctx) ?? '')
    }
    return out
}

const buildContext = (
    state?: ComponentState,
    data?: ComponentData,
    extra?: InterpolationContext
): InterpolationContext => ({ state: state ?? {}, data: data ?? {}, ...extra })

/**
 * Single source of truth for `${...}` label/title interpolation.
 *
 * Any string attribute that accepts a label or title (tab labels, section titles,
 * field labels, button labels, column headers, banner texts, KPI titles, …)
 * supports `${...}` template expressions evaluated against the current component
 * `state` and `data`. Pass `extra` to expose additional named variables to the
 * expression (e.g. `{ appState, appData }`).
 *
 * Texts without a `${` marker are returned unchanged (no evaluation cost).
 * A failing expression (syntax error, reference to an undeclared variable, …)
 * does NOT break rendering: the raw text is returned and a warning is logged.
 */
export function interpolate(text: string, state?: ComponentState, data?: ComponentData, extra?: InterpolationContext): string
export function interpolate(text: string | undefined, state?: ComponentState, data?: ComponentData, extra?: InterpolationContext): string | undefined
export function interpolate(
    text: string | undefined,
    state?: ComponentState,
    data?: ComponentData,
    extra?: InterpolationContext
): string | undefined {
    if (!text?.includes('${')) return text
    try {
        return renderDisplayTemplate(text, buildContext(state, data, extra))
    } catch (e) {
        console.warn(`Mateu: could not interpolate "${text}":`, e)
        return text
    }
}

/**
 * Like {@link interpolate} but keeps the historical error behaviour of page
 * titles/subtitles/KPI texts: on a failing expression the error message is
 * returned (so the problem is visible in the rendered page). The result is
 * meant to be rendered as HTML — callers must sanitize it (see `safeHtml`).
 */
export const possiblyHtml = (
    text: string | undefined,
    state: ComponentState,
    data: ComponentData
): string | undefined => {
    if (text && text.indexOf("${") >= 0) {
        try {
            return renderDisplayTemplate(text, buildContext(state, data))
        } catch (e) {
            return (e as Error).message
        }
    }
    return text;
}

/**
 * Interpolation used by text components, notices and dialog/drawer header titles.
 * Expressions see `state`, `data`, `appState` and `appData`. On a failing
 * expression a descriptive error message is returned as the content (so the
 * problem is visible in the rendered page) and the error is logged.
 *
 * SINGLE pass. It used to evaluate the result a second time when it still
 * contained a `${` marker, which executed any `${…}` found in substituted DATA
 * (stored XSS). A value that itself contains a template is now shown literally.
 * The name is kept so callers don't change.
 */
export const interpolateNested = (
    text: string | undefined,
    state: ComponentState,
    data: ComponentData,
    appState: ComponentState,
    appData: ComponentData
): string | undefined => {
    if (!text?.includes('${')) return text
    const ctx = buildContext(state, data, { appState: appState ?? {}, appData: appData ?? {} })
    let content = text
    try {
        content = renderDisplayTemplate(text, ctx)
    } catch (e) {
        content = 'when evaluating ' + text + ' :' + e + ', where data is ' + data
            + ' and state is ' + state + ' and app state is ' + appState + ' and app data is ' + appData
        console.error(e, content, state, data, appState, appData)
    }
    return content
}

// ---------------------------------------------------------------------------------------------
// interpolateAndEvaluate: substituting values into SOURCE CODE safely
// ---------------------------------------------------------------------------------------------

type LexState = 'code' | "'" | '"' | '`'

/** Lexical state (code, or inside which string literal) after scanning `src` from `state`. */
const advanceLexState = (src: string, state: LexState): LexState => {
    for (let i = 0; i < src.length; i++) {
        const c = src[i]
        if (state === 'code') {
            if (c === "'" || c === '"' || c === '`') state = c
        } else if (c === '\\') {
            i++
        } else if (c === state) {
            state = 'code'
        }
    }
    return state
}

/** Escapes `s` so it can sit inside any JS string literal ('…', "…" or `…`) as plain text. */
const escapeForStringLiteral = (s: string): string =>
    s.replace(/[\\'"`\n\r\u2028\u2029]|\$\{/g, (m) => {
        switch (m) {
            case '\n': return '\\n'
            case '\r': return '\\r'
            case '\u2028': return '\\u2028'
            case '\u2029': return '\\u2029'
            case '${': return '\\${'
            default: return '\\' + m
        }
    })

/** A JS literal for `v` in code position: it can only ever be a value, never code. */
const toCodeLiteral = (v: unknown): string => {
    if (v === null) return 'null'
    if (v === undefined) return 'undefined'
    if (typeof v === 'number' || typeof v === 'boolean') return String(v)
    if (typeof v === 'bigint') return v + 'n'
    return JSON.stringify(v) ?? 'undefined'
}

/**
 * Interpolates `text` and then evaluates the resulting source as a JS expression
 * (historical `eval(eval(...))` of e.g. the confirm dialog's `openedCondition` and
 * rule expressions). Expressions see `state`, `data`, `appState` and `appData`,
 * plus any additional named variables passed in `extra` (e.g. `{ component }` for
 * rule expressions). Throws on failure — callers decide the error behaviour. The
 * typed (non-string) result of the final expression is returned as-is.
 *
 * SECURITY: the `${…}` values are inserted into the source as LITERALS, never as
 * code (they used to be pasted in raw, so a data value became code):
 * - a placeholder inside a string literal of the expression ('${e}', "${e}",
 *   `…${e}…`) gets the value's text (`String(value)`, as a template literal
 *   would) escaped for that literal: backslash, quotes, backtick, newlines and
 *   `${` are escaped;
 * - elsewhere numbers, booleans, null and undefined are inserted as their
 *   literal, and anything else (strings, objects, arrays) as `JSON.stringify(value)`.
 * So `${state.n} > 3` and `component.type == "${state.type}"` behave as before,
 * but an unquoted string value is now a string, not code (a state value "false"
 * is the truthy string "false"; "5" + 1 concatenates).
 */
export const interpolateAndEvaluate = (
    text: string,
    state: ComponentState,
    data: ComponentData,
    appState?: ComponentState,
    appData?: ComponentData,
    extra?: InterpolationContext
): unknown => {
    const ctx = buildContext(state, data, { appState: appState ?? {}, appData: appData ?? {}, ...extra })
    let source = ''
    let lex: LexState = 'code'
    for (const seg of parseTemplate(text)) {
        if ('lit' in seg) {
            source += seg.lit
            lex = advanceLexState(seg.lit, lex)
        } else {
            const v = evalExpr(seg.expr, ctx)
            source += lex === 'code' ? toCodeLiteral(v) : escapeForStringLiteral(String(v))
        }
    }
    // not cached: the source carries data values
    return evaluate(source, ctx, { cache: false })
}

/**
 * Evaluates `expr` as a single JS expression (no template pass) with `state`,
 * `data` and any `extra` named variables in scope, preserving the expression's
 * typed result (e.g. a boolean for a trigger condition or a disabled/visible
 * rule filter). Throws on failure — callers decide the error behaviour.
 */
export const evaluateExpression = (
    expr: string,
    state?: ComponentState,
    data?: ComponentData,
    extra?: InterpolationContext
): unknown => {
    return evaluate(expr, buildContext(state, data, extra))
}

/**
 * Evaluates the `${…}` expressions of `text` with `state`, `data` and any
 * `extra` named variables in scope. Unlike {@link interpolate} it THROWS on a
 * failing expression instead of falling back to the raw text — for callers
 * that implement their own error behaviour (e.g. validation messages).
 */
export const evaluateTemplate = (
    text: string,
    state?: ComponentState,
    data?: ComponentData,
    extra?: InterpolationContext
): string => renderDisplayTemplate(text, buildContext(state, data, extra))
