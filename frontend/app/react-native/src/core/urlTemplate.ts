/** Percent-encodes all but the RFC 3986 unreserved characters — the same bytes as the server's
 *  `TemplateInterpolator.urlEncode` (and libs/mateu `urlEncode`). */
export function urlEncode(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

/** Index in a url template where its origin ends (after the authority of an absolute url, after a
 *  leading placeholder, or 0 for a relative template) — mirrors `TemplateInterpolator.originEnd`. */
function originEnd(t: string): number {
  const scheme = t.indexOf('://');
  const firstPlaceholder = t.indexOf('${');
  if (scheme >= 0 && (firstPlaceholder < 0 || scheme < firstPlaceholder)) {
    let i = scheme + 3;
    while (i < t.length) {
      if (t.startsWith('${', i)) {
        const close = t.indexOf('}', i);
        i = close < 0 ? t.length : close + 1;
        continue;
      }
      if ('/?#'.includes(t[i])) return i;
      i++;
    }
    return t.length;
  }
  if (t.startsWith('${')) {
    const close = t.indexOf('}');
    return close < 0 ? t.length : close + 1;
  }
  return 0;
}

/**
 * Interpolates a URL template encoding every value by where it lands, exactly like the server's
 * proxied leg (`TemplateInterpolator.interpolateUrl`): raw in the origin (but a `${state…}` there is
 * refused — the client state must not choose the host), a path segment in the path (`.`/`..`
 * refused, URL parsers resolve them even encoded), a query component after `?`/`#`. Without it a
 * value like `1/../../admin?x=` steered the request. Throws when a value is refused.
 */
export function interpolateUrlWith(template: string, evaluate: (expr: string) => unknown): string {
  if (!template || !template.includes('${')) return template;
  const origin = originEnd(template);
  return template.replace(/\$\{([^}]+)\}/g, (_, expr: string, offset: number) => {
    // `${encodeURIComponent(x)}` — how a value had to be written before Mateu encoded it — means
    // `${x}` encoded ONCE (encoding it again sent `a%252Cb` for `a,b`), like libs/mateu
    const explicitlyEncoded = encodeCallArgument(expr);
    const valueExpr = (explicitlyEncoded ?? expr).trim();
    const value = textOf(evaluate(valueExpr));
    if (offset < origin) {
      if (/^\s*state\b/.test(valueExpr)) throw new Error('A client state value cannot choose the origin of a URL: ' + template);
      return explicitlyEncoded !== undefined ? urlEncode(value) : value;
    }
    const before = template.substring(0, offset).replace(/\$\{[^}]*\}/g, '');
    if (/[?#]/.test(before)) return urlEncode(value);
    if (value === '.' || value === '..') throw new Error('A dot segment is not a valid path value: ' + value);
    return urlEncode(value);
  });
}

/** A value as the text that lands in a url: nothing for null/undefined, a MONEY value's amount
 *  (`{value, currency}` — it used to land as `[object Object]`), anything else as String(). */
function textOf(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object' && !Array.isArray(v) && 'value' in v && 'currency' in v) {
    return textOf((v as { value: unknown }).value);
  }
  return String(v);
}

const ENCODE_CALL = 'encodeURIComponent';

/** The argument of a whole-expression `encodeURIComponent(x)`, or undefined — libs/mateu's rule. */
export function encodeCallArgument(expr: string): string | undefined {
  const e = expr.trim();
  if (!e.startsWith(ENCODE_CALL)) return undefined;
  const rest = e.substring(ENCODE_CALL.length).trim();
  if (!rest.startsWith('(') || !rest.endsWith(')')) return undefined;
  let depth = 0;
  let quote = '';
  for (let i = 0; i < rest.length; i++) {
    const c = rest[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = '';
      continue;
    }
    if (c === "'" || c === '"' || c === '`') quote = c;
    else if (c === '(') depth++;
    else if (c === ')') {
      depth--;
      // the call closes before the end: something follows it
      if (depth === 0 && i !== rest.length - 1) return undefined;
    }
  }
  return depth === 0 ? rest.substring(1, rest.length - 1) : undefined;
}
