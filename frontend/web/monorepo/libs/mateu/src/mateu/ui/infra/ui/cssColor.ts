/**
 * A colour value a server or a row may name, or '' when it is not one: a hex colour, rgb()/hsl()
 * with plain arguments, a design-token `var(--x)`, or a colour keyword. Anything else — a value
 * carrying `;`, `:` or a url() — is dropped, never interpolated into a `style` (CSS injection from a
 * live row's `color`; Redwood's display.mjs `cssColorOf` applies the same idea).
 */
const CSS_COLOR = /^(#[0-9a-f]{3,8}|(rgb|rgba|hsl|hsla)\([\d\s.,%/+-]*\)|var\(--[\w-]+\)|[a-z]+)$/i

export const cssColorOf = (color: unknown): string => {
    const c = typeof color === 'string' ? color.trim() : ''
    return c && CSS_COLOR.test(c) ? c : ''
}
