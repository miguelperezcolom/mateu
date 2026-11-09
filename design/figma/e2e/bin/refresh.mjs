#!/usr/bin/env node
// npm run e2e:refresh -- <fileKey | Figma file URL> [--out <file>]
//
// Downloads the Figma file where the six sample screens were composed (with the plugin's "Mateu
// Sample Screens" command, by hand, or by an agent) and writes it as the real fixture,
// downloaded-sample-screens.figma.json, next to the synthetic one; `npm run e2e` then runs both.
//
// The token comes from FIGMA_TOKEN, else from ~/.mateu-secrets/figma-token — never from an argument
// (arguments show up in process listings) — and is never printed. What is kept: the canvases that
// hold the screens (the library's `Mateu · …` pages are dropped) and the components/component sets
// their instances name; nothing is renamed or rewritten.
import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { REAL, SCREENS } from '../src/pipeline.mjs'

export function parseFileKey(arg) {
  const s = String(arg ?? '').trim()
  if (/^[A-Za-z0-9]{6,}$/.test(s)) return s
  const m = s.match(/figma\.com\/(?:design|file|proto|board)\/([A-Za-z0-9]+)/)
  if (m) return m[1]
  throw new Error(`"${s}" is neither a Figma file key nor a Figma file URL`)
}

export function readToken(env = process.env, home = homedir()) {
  if (env.FIGMA_TOKEN?.trim()) return env.FIGMA_TOKEN.trim()
  const file = join(home, '.mateu-secrets', 'figma-token')
  if (existsSync(file)) return readFileSync(file, 'utf8').trim()
  return null
}

/** The file with only the canvases holding the sample screens and the components they use. */
export function keepScreens(file) {
  const canvases = (file.document?.children ?? []).filter((c) => c.type === 'CANVAS' && !/^Mateu ·/.test(c.name))
  const holding = canvases.filter((c) => (c.children ?? []).some((n) => SCREENS.includes(n.name)))
  if (holding.length === 0) {
    throw new Error(`no page of the file has frames named ${SCREENS.join(', ')} (pages: ${canvases.map((c) => c.name).join(', ') || 'none'})`)
  }
  const used = new Set()
  const walk = (n) => {
    if (n.componentId) used.add(n.componentId)
    for (const c of n.children ?? []) walk(c)
  }
  holding.forEach(walk)
  const components = Object.fromEntries(Object.entries(file.components ?? {}).filter(([id]) => used.has(id)))
  const sets = new Set(Object.values(components).map((c) => c.componentSetId).filter(Boolean))
  const componentSets = Object.fromEntries(Object.entries(file.componentSets ?? {}).filter(([id]) => sets.has(id)))
  return { name: file.name, lastModified: file.lastModified, version: file.version, document: { ...file.document, children: holding }, components, componentSets }
}

async function main(argv) {
  const target = argv.find((a) => !a.startsWith('--'))
  const out = argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : REAL
  if (!target) throw new Error('usage: npm run e2e:refresh -- <fileKey | Figma file URL> [--out <file>]')
  const key = parseFileKey(target)
  const token = readToken()
  if (!token) {
    throw new Error('No Figma token: put a personal access token (scope "File content: Read only") in FIGMA_TOKEN or in ~/.mateu-secrets/figma-token')
  }
  const api = (process.env.FIGMA_API_URL ?? 'https://api.figma.com').replace(/\/+$/, '')
  const res = await fetch(`${api}/v1/files/${encodeURIComponent(key)}`, { headers: { 'X-Figma-Token': token }, signal: AbortSignal.timeout(120_000) })
  if (res.status === 401 || res.status === 403) throw new Error(`Figma refused the token (HTTP ${res.status})`)
  if (res.status === 404) throw new Error(`Figma file "${key}" not found (or the token's account cannot open it)`)
  if (!res.ok) throw new Error(`the Figma API answered HTTP ${res.status}`)
  const file = keepScreens(await res.json())
  writeFileSync(out, JSON.stringify(file, null, 1) + '\n')
  console.log(`wrote ${out} (${file.document.children.map((c) => c.name).join(', ')}) — now: npm test && npm run e2e`)
}

const isMain = () => {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
  } catch {
    return false
  }
}
if (isMain()) {
  main(process.argv.slice(2)).catch((e) => {
    console.error(e.message)
    process.exit(1)
  })
}
