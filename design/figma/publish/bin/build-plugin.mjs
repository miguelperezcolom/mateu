#!/usr/bin/env node
// plugin/dist/code.js + plugin/dist/ui.html (one file: Figma loads the UI as a single document).
import { build } from 'esbuild'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const plugin = join(dirname(fileURLToPath(import.meta.url)), '../plugin')
mkdirSync(join(plugin, 'dist'), { recursive: true })
await build({ entryPoints: [join(plugin, 'code.js')], bundle: true, target: 'es2017', outfile: join(plugin, 'dist/code.js') })
const ui = await build({ entryPoints: [join(plugin, 'ui.js')], bundle: true, minify: true, target: 'es2020', platform: 'browser', format: 'iife', write: false })
const script = ui.outputFiles[0].text.replace(/<\/script/gi, '<\\/script')
writeFileSync(join(plugin, 'dist/ui.html'), readFileSync(join(plugin, 'ui.html'), 'utf8').replace('<!--SCRIPT-->', () => `<script>${script}</script>`))
