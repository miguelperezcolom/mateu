// Expands the SINGLE atoms template (poc/templates/atoms.html) into every surface of
// main-start-page.html. The page paints the same atoms in 15 places (host, foldout, wizard,
// overviews, dialog, drawer, island…) and VB has no partials that can be nested with their
// $current, so the HTML carries 15 copies — previously maintained BY HAND (and out of sync: the
// island's had no buttons with icons). Now each copy lives between two markers:
//
//   <!-- @atoms host|island — GENERADO … -->   …generated content…   <!-- @end-atoms -->
//
// and this script rewrites what is inside. The variant only changes the listeners (an island
// dispatches against ITS context). Idempotent: it runs inside `npm run bridge`.
// Usage: node make-html.mjs [--check]   (--check fails if the HTML is not up to date)

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const page = join(here, '..', 'webApps', 'vbredwoodapp', 'flows', 'main', 'pages', 'main-start-page.html')
import { CELL_ATOM_FLAGS } from './core/atoms.mjs'
// A CELL of a layout box (isCells: a HorizontalLayout of cards/stats/charts, a styled Container, an
// aligned VerticalLayout…) holds atoms of its own, painted by a SUBSET of the same template: the
// top-level branches of atoms.html whose flag is in CELL_ATOM_FLAGS, copied in at `@cell-atoms`. VB
// cannot recurse into a template, so a cell never holds another box (the visitor flattens it).
export const withCellAtoms = (atoms, flags = CELL_ATOM_FLAGS) => {
  const lines = atoms.split('\n')
  const branches = []
  let top = null
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)<oj-bind-if test="\[\[ \$current\.data\.(is\w+)/)
    if (top == null && m) top = m[1]
    if (!m || m[1] !== top || !flags.includes(m[2])) continue
    let j = i
    while (j < lines.length && lines[j] !== top + '</oj-bind-if>') j++
    branches.push(...lines.slice(i, j + 1).map((l) => l.slice(top.length)))
    i = j
  }
  // the copy is COMPACT — no comments, no indentation: it is repeated in every atoms surface of the
  // page (38), and its deep indentation alone weighed more than its markup
  // comments stripped until none is left (a comment cut out may join two halves into a new one)
  let joined = branches.join('\n')
  for (let prev = null; prev !== joined;) { prev = joined; joined = joined.replace(/<!--[\s\S]*?-->/g, '') }
  const compact = joined.split('\n')
    .map((l) => l.trim()).filter(Boolean).join('\n')
  return lines.map((l) => (/^\s*<!-- @cell-atoms -->$/.test(l) ? compact : l)).join('\n')
}
const partialSource = readFileSync(join(here, 'templates', 'atoms.html'), 'utf8').replace(/\n$/, '')

/** Every atom's ROOT element (a direct child of a top-level `oj-bind-if` of the template) carries
 *  the surface it belongs to — an inline island's, a MicroFrontend's — as `data-mateu-surface-id`, so
 *  whatever fires inside it (a DOM sink, a field's change) finds where to send its action by walking
 *  up (poc/surfaces.mjs). Stamped here, not by hand: an atom added later gets it too. A root that is
 *  itself an `oj-bind-*` (it repeats or switches) has no element of its own: its pieces are found
 *  through the block around them. */
export const stampSurfaces = (text) => {
  const lines = text.split('\n')
  const top = lines.find((l) => /^\s*<oj-bind-if /.test(l))
  const atomIndent = top ? top.match(/^(\s*)/)[1].length + 2 : -1
  const ATTR = ' :data-mateu-surface-id="[[ $current.data.surfaceId ]]"'
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)<([a-z][\w-]*)(?=[\s>/]|$)/)
    if (!m || m[1].length !== atomIndent || /^oj-bind-|^template$/.test(m[2])) continue
    // the attribute goes LAST in the opening tag (before its `>`, outside any quoted value), so the
    // tag still reads as written (`<oj-data-grid class="mateu-matrix"…`)
    let quoted = false
    for (let j = i; j < lines.length; j++) {
      const line = lines[j]
      let at = -1
      for (let k = j === i ? m[0].length : 0; k < line.length; k++) {
        if (line[k] === '"') quoted = !quoted
        else if (line[k] === '>' && !quoted) { at = line[k - 1] === '/' ? k - 1 : k; break }
      }
      if (at < 0) continue
      if (!lines.slice(i, j + 1).join('\n').includes('data-mateu-surface-id')) lines[j] = line.slice(0, at) + ATTR + line.slice(at)
      break
    }
  }
  return lines.join('\n')
}
// stamped FIRST: the cell copies (withCellAtoms) carry the atom roots' surface id too
const partial = withCellAtoms(stampSurfaces(partialSource))
// The field widgets added later (radio, multiple selection, amount, capture) go in a
// SECOND partial, inserted after the oj-select-one of EACH copy of the fields —those of the
// atoms and the 7 outside (drawer, row editor, generic form, wizard, island)—. The only thing
// that changes between copies is the change listener, which carries the marker:
//   <!-- @fields-extra hostInputChanged -->  …  <!-- @end-fields-extra -->
const fieldsPartial = readFileSync(join(here, 'templates', 'fields-extra.html'), 'utf8').replace(/\n$/, '')
// The drawer's BODY (its default slot) in a THIRD partial: the drawer panel picks one of three Spectra
// templates (general / create-edit / bottom) and VB cannot share a body between them, so each carries a
// copy, between `<!-- @drawer-body <template> -->` and `<!-- @end-drawer-body -->`. It is expanded
// FIRST: it brings its own @atoms and @fields-extra markers, which the next passes fill.
const drawerBodyPartial = readFileSync(join(here, 'templates', 'drawer-body.html'), 'utf8').replace(/\n$/, '')

// The LISTING's body (search results: cards / table / paging) in a FOURTH partial: the listing page
// paints it, and so does a YAML CollectionDetailPage in its collection slot — never both (the listing
// page stands aside while a collection detail is on), so the copies keep the SAME ids (the chains
// address #mateuTable). Between `<!-- @listing-body <where> -->` and `<!-- @end-listing-body -->`,
// expanded first like the drawer body (it brings its own @atoms markers).
const listingBodyPartial = readFileSync(join(here, 'templates', 'listing-body.html'), 'utf8').replace(/\n$/, '')

/** Expands the @listing-body markers (the partial is unindented: it takes the marker's indentation). */
export const expandListingBodies = (html) => {
  const lines = html.split('\n')
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)<!-- @listing-body (\w+) -->/)
    if (!m) { out.push(lines[i]); continue }
    out.push(lines[i])
    let j = i + 1
    while (j < lines.length && !/<!-- @end-listing-body -->/.test(lines[j])) j++
    if (j === lines.length) throw new Error(`@listing-body sin @end-listing-body (línea ${i + 1})`)
    out.push(...reindent(listingBodyPartial, m[1]))
    out.push(lines[j])
    i = j
  }
  return out.join('\n')
}

/** A copy's literal ids suffixed with its template (`id="x"` → `id="x-general"`): the three copies
 *  live in ONE page, where an id must be unique. Bound ids (`:id=`) and `data-*-id` are left alone. */
export const uniqueIds = (html, copy) => html.replace(/(^|\s)id="([^"]+)"/g, (all, lead, id) => `${lead}id="${id}-${copy}"`)

/** Expands the @drawer-body markers (the partial is unindented: it takes the marker's indentation). */
export const expandDrawerBodies = (html) => {
  const lines = html.split('\n')
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)<!-- @drawer-body (\w+) -->/)
    if (!m) { out.push(lines[i]); continue }
    out.push(lines[i])
    let j = i + 1
    while (j < lines.length && !/<!-- @end-drawer-body -->/.test(lines[j])) j++
    if (j === lines.length) throw new Error(`@drawer-body sin @end-drawer-body (línea ${i + 1})`)
    out.push(...reindent(uniqueIds(drawerBodyPartial, m[2]), m[1]))
    out.push(lines[j])
    i = j
  }
  return out.join('\n')
}

const VARIANTS = {
  host: { blockAction: 'hostBlockAction', addonToggled: 'hostAddonToggled', menuAction: 'hostMenuAction',
    checkAction: 'hostChecklistToggled', messageAction: 'hostMessageSend', messageKey: 'hostMessageKey',
    sectionPrimary: 'sectionPrimaryAction', sectionViewMore: 'sectionViewMoreAction' },
  island: { blockAction: 'islandBlockAction', addonToggled: 'addonToggled', menuAction: 'islandMenuAction',
    checkAction: 'islandChecklistToggled', messageAction: 'islandMessageSend', messageKey: 'islandMessageKey',
    sectionPrimary: 'islandSectionPrimaryAction', sectionViewMore: 'islandSectionViewMoreAction' },
}

const reindent = (text, indent) => text.split('\n').map((l) => (l ? indent + l : l))

/** Expands the @fields-extra markers (the partial is unindented: it takes the marker's indentation). */
export const expandFields = (html) => {
  const lines = html.split('\n')
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)<!-- @fields-extra (\w+) -->/)
    if (!m) { out.push(lines[i]); continue }
    out.push(lines[i])
    let j = i + 1
    while (j < lines.length && !/<!-- @end-fields-extra -->/.test(lines[j])) j++
    if (j === lines.length) throw new Error(`@fields-extra sin @end-fields-extra (línea ${i + 1})`)
    out.push(...reindent(fieldsPartial.replace(/\{\{change\}\}/g, m[2]), m[1]))
    out.push(lines[j])
    i = j
  }
  return out.join('\n')
}

export const expand = (html) => {
  const lines = expandDrawerBodies(expandListingBodies(html)).split('\n')
  const out = []
  let count = 0
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)<!-- @atoms (\w+) /)
    if (!m) { out.push(lines[i]); continue }
    const vars = VARIANTS[m[2]]
    if (!vars) throw new Error(`variante de átomos desconocida: ${m[2]} (línea ${i + 1})`)
    out.push(lines[i])
    let j = i + 1
    while (j < lines.length && !/<!-- @end-atoms -->/.test(lines[j])) j++
    if (j === lines.length) throw new Error(`@atoms sin @end-atoms (línea ${i + 1})`)
    // the template is written at one copy's indentation; it is re-indented to the marker's so that
    // the HTML stays readable (the marker sits at the indentation of the <template> that opens the template)
    const shift = m[1].length - partial.match(/^(\s*)/)[1].length
    out.push(...partial
      .replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k])
      .split('\n')
      .map((l) => (shift >= 0 ? ' '.repeat(shift) + l : l.slice(Math.min(-shift, l.match(/^\s*/)[0].length)))))
    out.push(lines[j])
    i = j
    count++
  }
  // the atoms bring their own field markers: they are expanded afterwards
  return { html: expandFields(out.join('\n')), count }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const before = readFileSync(page, 'utf8')
  const { html, count } = expand(before)
  if (process.argv.includes('--check')) {
    if (html !== before) { console.error('main-start-page.html no está al día: ejecuta npm run bridge'); process.exit(1) }
    console.log(`átomos al día (${count} superficies)`)
  } else {
    writeFileSync(page, html)
    console.log(`expandidos ${count} bloques de átomos en main-start-page.html`)
  }
}
