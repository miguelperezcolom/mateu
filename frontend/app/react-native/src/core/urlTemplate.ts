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
    const v = evaluate(expr.trim());
    const value = v === null || v === undefined ? '' : String(v);
    if (offset < origin) {
      if (/^\s*state\b/.test(expr)) throw new Error('A client state value cannot choose the origin of a URL: ' + template);
      return value;
    }
    const before = template.substring(0, offset).replace(/\$\{[^}]*\}/g, '');
    if (/[?#]/.test(before)) return urlEncode(value);
    if (value === '.' || value === '..') throw new Error('A dot segment is not a valid path value: ' + value);
    return urlEncode(value);
  });
}
