import type { ProjectFile } from './projectIndex'
import { inlineReferences } from './inlineReferences'
import { catalogueOf, parseTranslationsFile } from './translationsModel'
import { browserLocales, pickLocale, translateDeep } from '@infra/i18n/translations.ts'

/**
 * What the OFFLINE canvas (client-side expander, no backend) has to resolve itself before expanding
 * a page — the same two things Play and Export already resolved from the project's files, which the
 * canvas left as placeholders: a `type: Partial` / `type: ComponentRef` showed "Unknown metadata
 * type", a `${i18n.key}` showed the key.
 *
 * The one constraint is click-to-select: the canvas stamps every node of the EDITED document with a
 * `ve-<path>` id (pageModel.decorateForPreview) and maps a click back through it. Inlined content is
 * not in the document, so it carries no path of its own — the inlined root(s) take the REFERENCE
 * node's id instead (inlineReferences' `keepReferenceId`), which makes a partial ONE node on the
 * canvas: clicking anything it painted selects the reference, the thing the author can actually
 * edit here (the partial's own file is edited as itself). A root that already names itself (a
 * FormField's `id` is its binding) keeps its id; a click on it bubbles to the nearest stamped
 * ancestor, as for any unstamped node.
 *
 * Translations are text substitution, which touches no id: the project's catalogues (any
 * `type: Translations` / `translations/<locale>.yaml` among the files), the locale picked as the
 * runtime picks it (the browser's languages, then the fallback, then the first declared).
 */

/** `definition` with its partials / component refs inlined, each inlined root carrying the reference's stamped id. */
export function inlineForCanvas(definition: unknown, files: ProjectFile[]): unknown {
    return inlineReferences(definition, files, { keepReferenceId: true })
}

/** The `${i18n.key}` expressions of `definition` resolved from the project's catalogues (a copy; the definition itself when there are none). */
export function translateForCanvas(definition: unknown, files: ProjectFile[], preferred: ReadonlyArray<string> = browserLocales()): unknown {
    const catalogues = []
    for (const f of files ?? []) {
        const c = parseTranslationsFile(f.path, f.content)
        if (c) catalogues.push(c)
    }
    if (!catalogues.length) return definition
    const catalogue = catalogueOf(catalogues)
    const locale = pickLocale(catalogue, preferred)
    if (!locale) return definition
    const fallback = pickLocale(catalogue, ['en'])
    return translateDeep(definition, catalogue[locale], fallback ? catalogue[fallback] : undefined)
}

/** Both: references inlined (ids kept on the inlined roots), then texts translated. */
export function resolveForCanvas(definition: unknown, files: ProjectFile[], preferred?: ReadonlyArray<string>): unknown {
    if (!files?.length) return definition
    return translateForCanvas(inlineForCanvas(definition, files), files, preferred)
}
