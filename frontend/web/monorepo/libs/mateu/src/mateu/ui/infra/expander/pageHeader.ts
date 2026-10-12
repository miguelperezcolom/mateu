/**
 * The page-header keys of an authored `type: Form` (a YAML page's header), shaped into the wire
 * fields the server's FormMapper emits — the same names a reflected page's header has, so the
 * renderers read them alike. Mutates `metadata` (the expander's in-progress Form metadata).
 *
 * Authored → wire:
 *  - `badges: [{label, color}]`                → BadgeDto `{text, color ?? 'normal', …}`
 *  - `kpis: [{label, value}]`                  → KPIDto `{title, text}`
 *  - `recordSwitcher: {…}`                     → `switcher` (type 'object', actionId '_switchRecord')
 *  - `banners: [{theme, title, …, closeable}]` → BannerDto `{theme, hasIcon, hasCloseButton, …}`
 *  - `fabs: [{icon, label, actionId, order}]`  → FabDto `{id, label, icon, actionId, buttonStyle}`, by order
 *  - `overline`/`titlePlaceholder`/`timestamp`/`peerNav` travel as authored (blank texts dropped).
 */
type Node = Record<string, unknown>

const list = (value: unknown): Node[] =>
    Array.isArray(value) ? value.filter((v): v is Node => !!v && typeof v === 'object') : []

const nonBlank = (value: unknown): string | undefined =>
    typeof value === 'string' && value.trim() !== '' ? value : undefined

export function expandFormHeader(metadata: Node): void {
    for (const key of ['overline', 'titlePlaceholder', 'timestamp']) {
        if (key in metadata && !nonBlank(metadata[key])) delete metadata[key]
    }
    if ('badges' in metadata) {
        metadata.badges = list(metadata.badges).map((chip) => ({
            text: chip.label, iconOnLeft: null, iconOnRight: null,
            color: nonBlank(chip.color) ?? 'normal', primary: false, small: false, pill: false,
        }))
    }
    if ('kpis' in metadata) {
        const kpis = list(metadata.kpis)
        if (kpis.length) metadata.kpis = kpis.map((fact) => ({ title: fact.label, text: fact.value }))
        else delete metadata.kpis
    }
    if ('recordSwitcher' in metadata) {
        const s = metadata.recordSwitcher as Node | undefined
        delete metadata.recordSwitcher
        if (s && typeof s === 'object') {
            metadata.switcher = {
                options: list(s.options).map((o) => ({ value: o.value, label: o.label, description: o.description })),
                value: s.value,
                type: s.type === 'context' ? 'context' : 'object',
                label: s.label,
                searchable: s.searchable === true,
                disabled: s.disabled === true,
                actionId: nonBlank(s.actionId) ?? '_switchRecord',
                optionsSource: s.optionsSource ?? null,
                route: nonBlank(s.route) ?? null,
            }
        }
    }
    if ('banners' in metadata) {
        metadata.banners = list(metadata.banners).map((b) => ({
            theme: typeof b.theme === 'string' ? b.theme.toUpperCase() : 'NONE',
            hasIcon: false,
            hasCloseButton: b.closeable === true,
            title: b.title,
            description: b.description,
            timeoutSeconds: typeof b.timeoutSeconds === 'number' ? b.timeoutSeconds : 0,
        }))
    }
    if ('fabs' in metadata) {
        const fabs = list(metadata.fabs)
            .map((fab, index) => ({ fab, index }))
            .sort((a, b) => (Number(a.fab.order ?? 0) - Number(b.fab.order ?? 0)) || (a.index - b.index))
            .map(({ fab }) => ({
                id: fab.actionId, label: fab.label, icon: fab.icon, actionId: fab.actionId,
                buttonStyle: nonBlank(fab.buttonStyle) ?? 'primary',
            }))
        if (fabs.length) metadata.fabs = fabs
        else delete metadata.fabs
    }
}
