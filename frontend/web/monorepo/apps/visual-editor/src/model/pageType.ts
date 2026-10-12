import type { PageDoc } from './pageModel'

/**
 * `pageType:` on a YAML page definition — the coarse page family, the YAML twin of Java's
 * `@PageTemplate(PageType.X)` (and of the wire's `pageType`): it drives the page-width default and
 * the template a renderer lays the page out with. Optional: without it the page type is INFERRED
 * from the page's shape (a listing → collection, a wizard → process…), so the editor offers an empty
 * "inferred" choice and writes nothing for it.
 *
 * Where it lives: beside the definition's other page-level keys (`viewModel`, `actions`, `triggers`)
 * — on the root object of a bare definition, next to `layout:` in an envelope. The values are
 * io.mateu.uidl.annotations.PageType's, lower-cased as on the wire. The key is read defensively: a
 * schema (or a hand-edited file) carrying a value this list does not know keeps it, shown as unknown.
 */
export const PAGE_TYPES = ['landing', 'collection', 'detail', 'form', 'process', 'dashboard'] as const

export type PageType = (typeof PAGE_TYPES)[number]

export const PAGE_TYPE_LABELS: Record<PageType, string> = {
    landing: 'Landing/entry pages — welcome, hero search',
    collection: 'Collection pages — listings, search, CRUDs, to-do lists, calendars',
    detail: 'Record/overview pages — overview, foldout, master-detail',
    form: 'Form pages — create & edit',
    process: 'Guided process pages — wizards, imports',
    dashboard: 'Dashboard pages — KPIs and chart tiles',
}

/** Whether a page can carry page-level settings at all (a partial — a fragment inlined elsewhere — cannot). */
export function hasPageSettings(doc: PageDoc | undefined): boolean {
    return !!doc && !doc.fragment
}

/** The page's `pageType`, or undefined when it does not declare one (inferred). */
export function pageTypeOf(doc: PageDoc | undefined): string | undefined {
    if (!doc) return undefined
    const v = doc.bare ? doc.layout.pageType : doc.rest?.pageType
    return typeof v === 'string' && v ? v : undefined
}

/**
 * The page with its `pageType` set — or removed, for '' / undefined ("inferred"). A bare definition
 * carries it on its root object; an envelope beside `layout:`.
 */
export function withPageType(doc: PageDoc, value: string | undefined): PageDoc {
    const v = (value ?? '').trim()
    if (doc.bare) {
        const layout = { ...doc.layout }
        if (v) layout.pageType = v
        else delete layout.pageType
        return { ...doc, layout }
    }
    const rest = { ...(doc.rest ?? {}) }
    if (v) rest.pageType = v
    else delete rest.pageType
    return { ...doc, rest: Object.keys(rest).length ? rest : undefined }
}
