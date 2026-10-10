// Expande la plantilla ÚNICA de átomos (poc/templates/atoms.html) en cada superficie de
// main-start-page.html. La página pinta los mismos átomos en 15 sitios (host, foldout, wizard,
// overviews, diálogo, drawer, isla…) y VB no tiene parciales que se puedan anidar con su
// $current, así que el HTML lleva 15 copias — antes mantenidas A MANO (y desfasadas: las de
// la isla no tenían botones con icono). Ahora cada copia vive entre dos marcadores:
//
//   <!-- @atoms host|island — GENERADO … -->   …contenido generado…   <!-- @end-atoms -->
//
// y este script reescribe lo de dentro. La variante solo cambia los listeners (una isla
// despacha contra SU contexto). Idempotente: se ejecuta dentro de `npm run bridge`.
// Uso: node make-html.mjs [--check]   (--check falla si el HTML no está al día)

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const page = join(here, '..', 'webApps', 'vbredwoodapp', 'flows', 'main', 'pages', 'main-start-page.html')
const partial = readFileSync(join(here, 'templates', 'atoms.html'), 'utf8').replace(/\n$/, '')
// Los widgets de campo que se añadieron después (radio, selección múltiple, importe, captura) van
// en un SEGUNDO parcial, insertado tras el oj-select-one de CADA copia de los campos —las de los
// átomos y las 7 de fuera (drawer, editor de fila, formulario genérico, wizard, isla)—. Lo único
// que cambia entre copias es el listener de cambio, que lleva el marcador:
//   <!-- @fields-extra hostInputChanged -->  …  <!-- @end-fields-extra -->
const fieldsPartial = readFileSync(join(here, 'templates', 'fields-extra.html'), 'utf8').replace(/\n$/, '')

const VARIANTS = {
  host: { blockAction: 'hostBlockAction', addonToggled: 'hostAddonToggled', menuAction: 'hostMenuAction',
    checkAction: 'hostChecklistToggled', messageAction: 'hostMessageSend', messageKey: 'hostMessageKey' },
  island: { blockAction: 'islandBlockAction', addonToggled: 'addonToggled', menuAction: 'islandMenuAction',
    checkAction: 'islandChecklistToggled', messageAction: 'islandMessageSend', messageKey: 'islandMessageKey' },
}

const reindent = (text, indent) => text.split('\n').map((l) => (l ? indent + l : l))

/** Expande los marcadores @fields-extra (el parcial va sin sangrar: toma el del marcador). */
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
    // la plantilla está escrita al sangrado de una copia; se re-sangra al del marcador para que
    // el HTML siga legible (el marcador va al sangrado del <template> que abre la plantilla)
    const shift = m[1].length - partial.match(/^(\s*)/)[1].length
    out.push(...partial
      .replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k])
      .split('\n')
      .map((l) => (shift >= 0 ? ' '.repeat(shift) + l : l.slice(Math.min(-shift, l.match(/^\s*/)[0].length)))))
    out.push(lines[j])
    i = j
    count++
  }
  // los átomos traen sus propios marcadores de campos: se expanden después
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
