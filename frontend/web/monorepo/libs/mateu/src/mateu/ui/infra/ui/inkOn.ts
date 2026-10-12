/**
 * The ink (text colour) that reads on a DATA-supplied background — a planning block's or a funnel
 * stage's own colour. Those components used to write white on whatever colour the data brought,
 * and white on a mid blue or an amber fails WCAG 1.4.3 (UX review W-V-INK). Returns the light or
 * the dark ink, whichever has the higher contrast ratio; `undefined` when the colour is not a
 * literal it can read (a CSS variable — the theme already pairs those with their contrast colour).
 */
const DARK = '#1a1a1a' // design-token-ok: the ink paired with a data colour, not a theme colour
const LIGHT = '#fff' // design-token-ok: idem

const channels = (color: string): [number, number, number] | undefined => {
    const c = color.trim().toLowerCase()
    const hex = c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/)
    if (hex) {
        const h = hex[1].length === 3 ? hex[1].split('').map((x) => x + x).join('') : hex[1]
        return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number]
    }
    const rgb = c.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/)
    return rgb ? [+rgb[1], +rgb[2], +rgb[3]] : undefined
}

const luminance = ([r, g, b]: [number, number, number]) => {
    const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4) }
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

export const contrastRatio = (a: string, b: string): number | undefined => {
    const ca = channels(a), cb = channels(b)
    if (!ca || !cb) return undefined
    const [l1, l2] = [luminance(ca), luminance(cb)].sort((x, y) => y - x)
    return (l1 + 0.05) / (l2 + 0.05)
}

export const inkOn = (background: string | undefined | null): string | undefined => {
    if (!background || !channels(background)) return undefined
    return (contrastRatio(background, LIGHT) ?? 0) >= (contrastRatio(background, DARK) ?? 0) ? LIGHT : DARK
}
