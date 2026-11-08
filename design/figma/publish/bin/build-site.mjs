#!/usr/bin/env node
// build-site <design.json> --out <dir> --assets <renderer static dir> [--config <config.json>]
// The plugin's build with no Figma around: a real file, a folder you can serve.
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { FigmaToYaml } from '../../to-yaml/src/convert.mjs'
import { loadContract, loadSchema } from '../../to-yaml/src/load.mjs'
import { buildManifest, defaultConfig, siteFiles } from '../src/site.mjs'
import { zip } from '../src/zip.mjs'

const args = process.argv.slice(2)
const flag = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined)
const list = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? list(join(d, n)) : [join(d, n)]))
const assetsDir = flag('--assets')
const { files } = new FigmaToYaml({ contract: loadContract(), schema: loadSchema(), drawnValues: true }).convert(JSON.parse(readFileSync(args[0], 'utf8')))
const config = { ...defaultConfig(files, flag('--title')), ...(flag('--config') ? JSON.parse(readFileSync(flag('--config'), 'utf8')) : {}) }
const assets = new Map(list(assetsDir).map((p) => [relative(assetsDir, p), new Uint8Array(readFileSync(p))]).filter(([p]) => p !== '_index.html'))
const site = siteFiles(buildManifest(files, config), config, readFileSync(join(assetsDir, '_index.html'), 'utf8'), assets)
for (const [path, value] of site) {
  mkdirSync(dirname(join(flag('--out'), path)), { recursive: true })
  writeFileSync(join(flag('--out'), path), value)
}
if (flag('--zip')) writeFileSync(flag('--zip'), zip(site))
console.log(JSON.stringify(config, null, 1))
