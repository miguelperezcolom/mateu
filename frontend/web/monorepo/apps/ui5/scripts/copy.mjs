#!/usr/bin/env node
/**
 * Builds the SAP renderer and packages it into the io.mateu:mateu-ui5 jar
 * (backend/shared/frontend/ui5/src/main/resources/static): `_index.html` (the page template the
 * server fills — title, favicon, the <mateu-ui> root between AQUIUI / HASTAAQUIUI) and `assets/`
 * (the bundle + THIRD-PARTY-LICENSES.txt). The folder is emptied first, so a file the build no
 * longer makes does not ship.
 *
 * Usage: npm run copy   (after `npm ci` in this directory)
 */
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repo = resolve(app, '../../../../..')
const target = join(repo, 'backend/shared/frontend/ui5/src/main/resources/static')
const bin = (name) => join(app, 'node_modules/.bin', name)
const run = (cmd, args) => execFileSync(cmd, args, { cwd: app, stdio: 'inherit' })

run(bin('tsc'), ['-p', '.'])
run(bin('vite'), ['build'])
run(process.execPath, [join(repo, 'scripts/third-party-notices.mjs'), 'ui5', '--out', join(app, 'dist/assets/THIRD-PARTY-LICENSES.txt')])
renameSync(join(app, 'dist/index.html'), join(app, 'dist/_index.html'))

if (existsSync(target)) rmSync(target, { recursive: true })
mkdirSync(target, { recursive: true })
cpSync(join(app, 'dist'), target, { recursive: true })
console.log(`Packaged into ${target}`)
