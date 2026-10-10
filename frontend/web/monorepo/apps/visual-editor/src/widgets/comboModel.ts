/** One entry of a <ve-combo>: what gets written, how it is shown, and a quiet hint (e.g. its file). */
export interface ComboOption {
    value: string
    label?: string
    hint?: string
}

/** The options a combo shows for what is typed: every one when nothing is, else the ones whose value,
 *  label or hint contains the text (case-insensitive), the ones STARTING with it first. Duplicate
 *  values are shown once. Pure — the unit of the picker. */
export function comboMatches(options: ReadonlyArray<string | ComboOption>, typed: string): ComboOption[] {
    const seen = new Set<string>()
    const all: ComboOption[] = []
    for (const o of options ?? []) {
        const opt = typeof o === 'string' ? { value: o } : o
        if (!opt || typeof opt.value !== 'string' || seen.has(opt.value)) continue
        seen.add(opt.value)
        all.push(opt)
    }
    const q = (typed ?? '').trim().toLowerCase()
    if (!q) return all
    const text = (o: ComboOption) => [o.value, o.label ?? '', o.hint ?? ''].join(' ').toLowerCase()
    const starts = all.filter((o) => o.value.toLowerCase().startsWith(q) || (o.label ?? '').toLowerCase().startsWith(q))
    const contains = all.filter((o) => !starts.includes(o) && text(o).includes(q))
    return [...starts, ...contains]
}
