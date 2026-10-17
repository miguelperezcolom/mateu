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
const partial = readFileSync(join(here, 'templates', 'atoms.html'), 'utf8').replace(/\n$/, '')
// The field widgets added later (radio, multiple selection, amount, capture) go in a
// SECOND partial, inserted after the oj-select-one of EACH copy of the fields —those of the
// atoms and the 7 outside (drawer, row editor, generic form, wizard, island)—. The only thing
// that changes between copies is the change listener, which carries the marker:
//   <!-- @fields-extra hostInputChanged -->  …  <!-- @end-fields-extra -->
const fieldsPartial = readFileSync(join(here, 'templates', 'fields-extra.html'), 'utf8').replace(/\n$/, '')

const VARIANTS = {
  host: { blockAction: 'hostBlockAction', addonToggled: 'hostAddonToggled', menuAction: 'hostMenuAction',
    checkAction: 'hostChecklistToggled', messageAction: 'hostMessageSend', messageKey: 'hostMessageKey' },
  island: { blockAction: 'islandBlockAction', addonToggled: 'addonToggled', menuAction: 'islandMenuAction',
    checkAction: 'islandChecklistToggled', messageAction: 'islandMessageSend', messageKey: 'islandMessageKey' },
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
  const lines = html.split('\n')
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
