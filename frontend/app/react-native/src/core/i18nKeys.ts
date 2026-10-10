// `${i18n.key}` is the translation scope of the `${…}` expressions. The server resolves it for the
// request's locale before the wire leaves it (TranslationRegistry); the app has no catalogue, so an
// expression that still arrives renders as its KEY — never a blank, never the raw syntax.

const I18N_KEY = /^\s*i18n\.([A-Za-z0-9_][A-Za-z0-9_.-]*)\s*$/;

/** The key of an `i18n.<key>` expression body, or undefined when it is anything else. */
export function i18nKeyOf(expr: string): string | undefined {
  const m = I18N_KEY.exec(expr);
  return m ? m[1] : undefined;
}
