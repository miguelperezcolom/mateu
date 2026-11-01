/**
 * Escaping for values substituted into a JSON body template — the React Native twin of libs/mateu
 * `infra/http/jsonTemplate.ts` and the server's `TemplateInterpolator.jsonEscape`.
 *
 * A `body:` is a shape with holes filled with data the author does not control:
 * `{"name":"${state.name}"}` breaks on any value carrying a quote, a backslash or a newline, and it
 * breaks invisibly (the endpoint answers 400). The template itself is never escaped, only what goes
 * into it: the STATE is wrapped before interpolation (`jsonSafeContext`), so every value read through
 * `${state.x}` arrives already safe.
 */

type Json = Record<string, unknown>;

/** Escapes a value for the inside of a JSON string — without adding the surrounding quotes. */
export function jsonEscape(value: string): string {
  let out = '';
  for (const ch of value) {
    switch (ch) {
      case '"': out += '\\"'; break;
      case '\\': out += '\\\\'; break;
      case '\n': out += '\\n'; break;
      case '\r': out += '\\r'; break;
      case '\t': out += '\\t'; break;
      case '\b': out += '\\b'; break;
      case '\f': out += '\\f'; break;
      default:
        out += ch < ' ' ? '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0') : ch;
    }
  }
  return out;
}

/** A copy of `value` whose strings are JSON-escaped; numbers and booleans are left alone. */
export function jsonSafe<T>(value: T): T {
  if (typeof value === 'string') return jsonEscape(value) as unknown as T;
  if (Array.isArray(value)) return value.map(jsonSafe) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Json = {};
    for (const [k, v] of Object.entries(value as Json)) out[k] = jsonSafe(v);
    return out as unknown as T;
  }
  return value;
}

/** Whether a request declares a JSON body, which is when its values need escaping. */
export function declaresJson(headers: Record<string, unknown> | undefined): boolean {
  if (!headers) return false;
  return Object.entries(headers).some(
    ([name, value]) => name.toLowerCase() === 'content-type' && String(value ?? '').toLowerCase().includes('json'),
  );
}

/** The interpolation context a JSON body is filled from: every scope's strings escaped. */
export function jsonSafeContext<C extends Json>(ctx: C): C {
  const out: Json = { ...ctx };
  for (const scope of ['state', 'data', 'appState', 'appData']) {
    if (scope in ctx) out[scope] = jsonSafe(ctx[scope]);
  }
  return out as C;
}

/**
 * A body template filled through an opaque `interpolate` (when no context is at hand): when the
 * request declares JSON, each placeholder's value is escaped on its own — the template around it
 * never is.
 */
export function interpolateBody(
  template: string,
  headers: Record<string, unknown> | undefined,
  interpolate: (t: string) => string,
): string {
  if (!declaresJson(headers)) return interpolate(template);
  return template.replace(/\$\{[^}]*\}/g, (placeholder) => jsonEscape(interpolate(placeholder)));
}
