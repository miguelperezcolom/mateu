#!/usr/bin/env node
/**
 * Builds a React renderer app (Primer, SAP, Salesforce…) and packages it into its jar
 * (backend/shared/frontend/<name>/src/main/resources/static): `_index.html` (the page template the
 * server fills — title, favicon, the <mateu-ui> root between AQUIUI / HASTAAQUIUI) and `assets/`
 * (the bundle + THIRD-PARTY-LICENSES.txt). The folder is emptied first, so a file the build no
 * longer makes does not ship. ONE copy for every renderer app: its `npm run copy` names itself.
 *
 * Usage (from the app's folder, after its `npm ci`): node ../../../react-renderer/scripts/package-renderer.mjs
 * The renderer is the app's folder name, and only a known renderer is packaged (no argument is read).
 */
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'

// the React renderer apps this script packages — a new one is added here (and to the checklist)
const RENDERERS = new Set(['primer', 'ui5', 'slds'])
const app = process.cwd()
const name = [...RENDERERS].find((r) => r === basename(app))
if (!name) {
  console.error(`package-renderer.mjs runs from a renderer app's folder (${[...RENDERERS].join(', ')})`)
  process.exit(2)
}
const repo = resolve(app, '../../../../..')
const target = join(repo, 'backend/shared/frontend', name, 'src/main/resources/static')
const bin = (tool) => join(app, 'node_modules/.bin', tool)
const run = (cmd, args) => execFileSync(cmd, args, { cwd: app, stdio: 'inherit' })

run(bin('tsc'), ['-p', '.'])
run(bin('vite'), ['build'])
run(process.execPath, [join(repo, 'scripts/third-party-notices.mjs'), name, '--out', join(app, 'dist/assets/THIRD-PARTY-LICENSES.txt')])
renameSync(join(app, 'dist/index.html'), join(app, 'dist/_index.html'))

if (existsSync(target)) rmSync(target, { recursive: true })
mkdirSync(target, { recursive: true })
cpSync(join(app, 'dist'), target, { recursive: true })
console.log(`Packaged into ${target}`)
