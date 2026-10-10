// Writes the VB translation bundle (resources/strings/appBundle/nls) from the chrome catalogue in
// i18n.mjs — ONE source for the words the bridge says (chromeText) and the ones the page HTML binds
// (`$application.translations.appBundle.<key>`). VB resolves the language itself from its locale
// (vbInitParams.locale = <html lang>), with the root bundle (English) filling the gaps of a partial
// language, exactly as chromeText does.
// Uso: node make-nls.mjs [--check]   (--check falla si el bundle no está al día)

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { CHROME_TEXTS } from './i18n.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const nls = join(here, '..', 'webApps', 'vbredwoodapp', 'resources', 'strings', 'appBundle', 'nls')
const FILE = 'appBundle-strings.json'

export function nlsFiles(texts = CHROME_TEXTS) {
  const json = (o) => JSON.stringify(o, null, 2) + '\n'
  const files = { [FILE]: json(Object.fromEntries([['root', true], ...Object.keys(texts).filter((l) => l !== 'en').map((l) => [l, true])])) }
  files[join('root', FILE)] = json(texts.en)
  for (const [lang, dict] of Object.entries(texts)) if (lang !== 'en') files[join(lang, FILE)] = json(dict)
  return files
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = nlsFiles()
  const stale = Object.entries(files).filter(([f, c]) => !existsSync(join(nls, f)) || readFileSync(join(nls, f), 'utf8') !== c)
  const extra = readdirSync(nls, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !files[join(d.name, FILE)]).map((d) => d.name)
  if (process.argv.includes('--check')) {
    if (stale.length || extra.length) {
      console.error('el bundle nls no está al día con poc/i18n.mjs: ejecuta npm run bridge')
      process.exit(1)
    }
    console.log(`nls al día (${Object.keys(files).length} ficheros)`)
  } else {
    for (const d of extra) rmSync(join(nls, d), { recursive: true })
    for (const [f, c] of Object.entries(files)) {
      mkdirSync(dirname(join(nls, f)), { recursive: true })
      writeFileSync(join(nls, f), c)
    }
    console.log(`escrito el bundle nls (${Object.keys(files).length} ficheros)`)
  }
}
