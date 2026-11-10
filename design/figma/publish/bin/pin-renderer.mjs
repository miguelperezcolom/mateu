#!/usr/bin/env node
// Points src/renderer.json at a release: the renderer's files and digests, read off the git tag.
//   node design/figma/publish/bin/pin-renderer.mjs 3.0-beta.55
// Called by scripts/bump-example-version.sh, in a checkout with no npm install.
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { RENDERER_DIR, rendererPin } from '../src/rendererPin.mjs'

const version = process.argv[2]
if (!/^\d+\.\d+(\.\d+)?(-[a-z]+\.\d+)?$/.test(version ?? '')) throw new Error('usage: pin-renderer.mjs <version, e.g. 3.0-beta.55>')

const tag = `v${version}`
const git = (args) => execFileSync('git', args, { maxBuffer: 256 * 1024 * 1024 })
const files = git(['ls-tree', '-r', '--name-only', tag, '--', RENDERER_DIR]).toString().trim().split('\n')
  .map((p) => p.substring(RENDERER_DIR.length))
const digestOf = (path) => createHash('sha256').update(git(['cat-file', 'blob', `${tag}:${RENDERER_DIR}${path}`])).digest('hex')

writeFileSync(new URL('../src/renderer.json', import.meta.url), `${JSON.stringify(rendererPin(version, files, digestOf), null, 1)}\n`)
