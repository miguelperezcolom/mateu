/**
 * The icons the icon picker offers, per renderer — what that renderer actually paints for an icon
 * property (`icon`, a button's `iconOnLeft`/`iconOnRight`, a tile's `actionIcon`…):
 *
 *  - **Vaadin**: the Vaadin icon set (`vaadin:cart`), from `@vaadin/icons` (Apache-2.0) — the same
 *    iconset the Vaadin renderer registers. It is read from the package as text, lazily (a chunk of
 *    its own, loaded the first time a picker opens), and previewed as inline SVG.
 *  - **Redwood**: the renderer translates a NEUTRAL name (`vaadin:cart`) to its icon font through a
 *    fixed table (apps/redwood/poc/core/shellNav.mjs `OJ_ICONS` — mirrored below, pinned by a test),
 *    shows a generic icon for any other neutral name, and takes an `oj-ux-ico-*` class as it is. So
 *    its picker offers the translated names first (they stay portable), then every class of the
 *    Redwood icon font. Neither the font nor its stylesheet is bundled (Oracle's licence): they load
 *    from Oracle's CDN at run time, exactly as the Redwood canvas does — offline, the picker still
 *    lists the translated names, previewed with the Vaadin glyph they are named after.
 *
 * Free text always stays possible: the picker fills the text field, it never replaces it.
 */
import type { CanvasRendererId } from '../canvas/canvasRenderer'

export interface IconChoice {
    /** What is written to the property. */
    value: string
    /** A quiet hint (the Redwood class a neutral name becomes, "Redwood icon font"…). */
    hint?: string
    /** The SVG body of a Vaadin icon (16×16 viewBox), for its preview. */
    svg?: string
    /** The Redwood icon-font class that previews it (`oj-ux-ico-cart`). */
    ojClass?: string
}

/** Which icon set a renderer paints. The DS-neutral canvas renders Vaadin names. */
export type IconSet = 'vaadin' | 'redwood'

export function iconSetOf(renderer: CanvasRendererId | string | undefined): IconSet {
    return renderer === 'redwood' ? 'redwood' : 'vaadin'
}

/** Whether a property holds an icon NAME (a string), so it gets the icon picker. */
export function isIconProp(prop: string, hint: { kind?: string } = {}): boolean {
    if (hint.kind && hint.kind !== 'string') return false
    return prop === 'icon' || /^iconOn(Left|Right)$/.test(prop) || /^actionIcon\d*$/.test(prop)
}

/** The icons of a Vaadin iconset module's text (`<g id="vaadin:name">…</g>`). Pure. */
export function parseVaadinIconset(text: string): IconChoice[] {
    const out: IconChoice[] = []
    for (const m of (text ?? '').matchAll(/<g id="([a-z0-9-]+:[a-z0-9-]+)">([\s\S]*?)<\/g>/g)) {
        out.push({ value: m[1], svg: m[2] })
    }
    return out
}

/** The `oj-ux-ico-*` classes a Redwood icon-font stylesheet defines, sorted. Pure. */
export function parseOjIconClasses(css: string): string[] {
    const names = new Set<string>()
    for (const m of (css ?? '').matchAll(/\.(oj-ux-ico-[a-z0-9-]+):before\s*\{/g)) names.add(m[1])
    return [...names].sort()
}

/**
 * The neutral names the Redwood renderer translates to its icon font — a copy of
 * apps/redwood/poc/core/shellNav.mjs `OJ_ICONS` (the editor shares no runtime with the Redwood core);
 * iconCatalog.test.ts fails when the two drift.
 */
export const REDWOOD_ICON_TRANSLATIONS: Record<string, string> = {
    'vaadin:calendar-user': 'oj-ux-ico-calendar-contact',
    'vaadin:calendar': 'oj-ux-ico-calendar',
    'vaadin:tasks': 'oj-ux-ico-task',
    'vaadin:automation': 'oj-ux-ico-robot-action',
    'vaadin:cog': 'oj-ux-ico-settings',
    'vaadin:cogs': 'oj-ux-ico-settings',
    'vaadin:home': 'oj-ux-ico-home',
    'vaadin:user': 'oj-ux-ico-contact',
    'vaadin:users': 'oj-ux-ico-contact-group',
    'vaadin:bed': 'oj-ux-ico-bed',
    'vaadin:chart': 'oj-ux-ico-bar-chart',
    'vaadin:table': 'oj-ux-ico-table',
    'vaadin:money': 'oj-ux-ico-currency-money',
    'vaadin:barcode': 'oj-ux-ico-scan-barcode',
    'vaadin:pencil': 'oj-ux-ico-edit',
    'vaadin:ban': 'oj-ux-ico-do-not-enter',
    'vaadin:rotate-left': 'oj-ux-ico-undo',
    'vaadin:exchange': 'oj-ux-ico-exchange-h',
    'vaadin:wifi': 'oj-ux-ico-connection',
    'vaadin:key': 'oj-ux-ico-key',
    'vaadin:list': 'oj-ux-ico-list',
    'vaadin:pen': 'oj-ux-ico-signature',
    'vaadin:credit-card': 'oj-ux-ico-bank-card',
    'vaadin:gift': 'oj-ux-ico-gift',
    'vaadin:cart': 'oj-ux-ico-cart',
    'vaadin:check': 'oj-ux-ico-check',
    'vaadin:clock': 'oj-ux-ico-clock',
    'vaadin:bell': 'oj-ux-ico-notification',
    'vaadin:bell-o': 'oj-ux-ico-notification',
    'vaadin:envelope': 'oj-ux-ico-email',
    'vaadin:sign-out': 'oj-ux-ico-logout',
    'vaadin:sign-in': 'oj-ux-ico-login',
    'vaadin:cloud': 'oj-ux-ico-cloud',
    'vaadin:trending-up': 'oj-ux-ico-trending-up',
    'vaadin:building': 'oj-ux-ico-building',
    'vaadin:refresh': 'oj-ux-ico-refresh',
    'vaadin:close-circle': 'oj-ux-ico-close-circle',
    'vaadin:tablet': 'oj-ux-ico-tablet-portrait',
}

/** What a value paints as in Redwood: its class (translated, or given), else the generic icon. */
export function redwoodClassOf(value: string): string | undefined {
    const v = (value ?? '').trim()
    if (!v) return undefined
    if (v.startsWith('oj-ux-')) return v
    return REDWOOD_ICON_TRANSLATIONS[v] ?? 'oj-ux-ico-arrow-circle-right'
}

/**
 * The Redwood picker's list: the translated neutral names first (portable — Vaadin paints them too),
 * then every class of the icon font. `vaadin` previews the neutral names when the font is not there.
 */
export function redwoodChoices(ojClasses: string[], vaadin: IconChoice[] = []): IconChoice[] {
    const svgOf = new Map(vaadin.map((v) => [v.value, v.svg]))
    const translated: IconChoice[] = Object.entries(REDWOOD_ICON_TRANSLATIONS)
        .map(([value, ojClass]) => ({ value, ojClass, hint: ojClass, svg: svgOf.get(value) }))
    const font: IconChoice[] = ojClasses.map((c) => ({ value: c, ojClass: c, hint: 'Redwood icon font' }))
    return [...translated, ...font]
}

/** The choices matching what is typed (name or hint, case-insensitive), names starting with it first. Pure. */
export function filterIcons(choices: readonly IconChoice[], typed: string): IconChoice[] {
    const q = (typed ?? '').trim().toLowerCase()
    if (!q) return [...choices]
    const bare = (v: string) => v.replace(/^[a-z]+:/, '').replace(/^oj-ux-ico-/, '')
    const starts = choices.filter((c) => bare(c.value).startsWith(q) || c.value.toLowerCase().startsWith(q))
    const rest = choices.filter((c) => !starts.includes(c) && (c.value + ' ' + (c.hint ?? '')).toLowerCase().includes(q))
    return [...starts, ...rest]
}

// --- the loaders (browser only; cached for the session) ---

let vaadinIcons: Promise<IconChoice[]> | undefined

/** The Vaadin icon set, read from `@vaadin/icons` the first time it is asked for. */
export function loadVaadinIcons(): Promise<IconChoice[]> {
    vaadinIcons ??= import('@vaadin/icons/vaadin-iconset.js?raw')
        .then((m) => parseVaadinIconset(m.default))
        .catch((e) => { console.warn('mateu visual editor: the Vaadin icon set could not be read', e); vaadinIcons = undefined; return [] })
    return vaadinIcons
}

/**
 * The stylesheet of Redwood's icon font, on Oracle's CDN — the one the Redwood shell (oj-sp) loads.
 * Never bundled; fetched by the picker only when the project renders with Redwood.
 */
export const REDWOOD_ICON_CSS = 'https://static.oracle.com/cdn/fnd/gallery/2604.0.2/images/iconfont/ojuxgallerybundle.min.css'

let redwoodCss: Promise<string | undefined> | undefined

/** The Redwood icon-font stylesheet's text, or undefined when Oracle's CDN cannot be reached. */
export function loadRedwoodIconCss(): Promise<string | undefined> {
    redwoodCss ??= fetch(REDWOOD_ICON_CSS)
        .then((r) => (r.ok ? r.text() : undefined))
        .catch(() => undefined)
        .then((t) => { if (!t) redwoodCss = undefined; return t })
    return redwoodCss
}

/**
 * The stylesheet's rules made usable from the editor: font URLs absolute (they are relative to the
 * CDN), and the `html {…}` rules dropped — the font stylesheet also sets the page's font family,
 * which is the Redwood app's business, not the editor's. Pure.
 */
export function redwoodIconRules(css: string, base = REDWOOD_ICON_CSS): { fontFaces: string; classes: string } {
    const abs = (text: string) => text.replace(/url\((['"]?)(?!data:|https?:|\/)([^'")]+)\1\)/g, (_m, q, u) => `url(${q}${new URL(u, base).href}${q})`)
    const noComments = (css ?? '').replace(/\/\*[\s\S]*?\*\//g, '')
    const fontFaces = (noComments.match(/@font-face\s*\{[^}]*\}/g) ?? []).map(abs).join('\n')
    const classes = noComments
        .replace(/@font-face\s*\{[^}]*\}/g, '')
        .replace(/(?<=^|\})\s*html[^{}]*\{[^}]*\}/g, '')
    return { fontFaces, classes: abs(classes) }
}
