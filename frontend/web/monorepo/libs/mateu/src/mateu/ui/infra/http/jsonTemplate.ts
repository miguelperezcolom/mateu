/**
 * Escaping for values substituted into a JSON body template.
 *
 * A `body:` is a shape with holes, and the holes are filled with data the author does not control.
 * `{"name":"${state.name}"}` is broken by any value carrying a quote, a backslash or a newline — and
 * it breaks INVISIBLY: the endpoint answers 400 and all the user sees is that saving does nothing.
 *
 * The template itself must never be escaped, only what goes into it, which is why this cannot be
 * done to the finished string. Instead the STATE is wrapped before interpolation, so every value
 * read through `${state.x}` arrives already safe.
 */

/**
 * Escapes a value for the inside of a JSON string — the characters JSON does not allow raw, and
 * nothing else. It does NOT add the surrounding quotes: the template already wrote those, and a
 * second pair would break exactly what this exists to protect.
 */
export function jsonEscape(value: string): string {
    let out = ''
    for (const ch of value) {
        switch (ch) {
            case '"': out += '\\"'; break
            case '\\': out += '\\\\'; break
            case '\n': out += '\\n'; break
            case '\r': out += '\\r'; break
            case '\t': out += '\\t'; break
            case '\b': out += '\\b'; break
            case '\f': out += '\\f'; break
            default:
                out += ch < ' ' ? '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0') : ch
        }
    }
    return out
}

/**
 * A copy of `value` whose strings are JSON-escaped, so interpolating it into a JSON template is
 * safe. Non-strings are left alone: a number or a boolean has no representation to break, and
 * quoting one would change what the body says.
 */
export function jsonSafe<T>(value: T): T {
    if (typeof value === 'string') return jsonEscape(value) as unknown as T
    if (Array.isArray(value)) return value.map(jsonSafe) as unknown as T
    if (value && typeof value === 'object') {
        const out: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = jsonSafe(v)
        return out as unknown as T
    }
    return value
}

/** Whether a request declares a JSON body, which is when its values need escaping. */
export function declaresJson(headers: Record<string, string> | undefined): boolean {
    if (!headers) return false
    return Object.entries(headers).some(
        ([name, value]) => name.toLowerCase() === 'content-type' && (value ?? '').toLowerCase().includes('json'),
    )
}
