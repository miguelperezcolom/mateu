#!/usr/bin/env node
// Trims a `GET /v1/files/:key` payload to what the converter reads, so a real design can be kept as a
// fixture: the screen pages, the components their instances use, and no geometry, paint or file
// metadata (the payload's thumbnail is a signed url).
//   node trim.mjs design.json real-sample-screens.figma.json
import { readFileSync, writeFileSync } from 'node:fs'

const KEEP = ['id', 'name', 'type', 'visible', 'componentId', 'componentProperties', 'componentPropertyReferences', 'characters', 'layoutMode']
const [from, to] = process.argv.slice(2)
const file = JSON.parse(readFileSync(from, 'utf8'))
const used = new Set()

function trim(node) {
  const out = {}
  for (const k of KEEP) if (node[k] !== undefined) out[k] = node[k]
  if (node.style?.fontSize) out.style = { fontSize: node.style.fontSize }
  if (node.componentId) used.add(node.componentId)
  if (node.children) out.children = node.children.map(trim)
  return out
}

const pages = file.document.children.filter((c) => c.type === 'CANVAS' && !/^Mateu ·/.test(c.name)).map(trim)
const components = {}
const componentSets = {}
for (const id of used) {
  const c = file.components[id]
  if (!c) continue
  components[id] = { key: c.key, name: c.name, ...(c.componentSetId ? { componentSetId: c.componentSetId } : {}) }
  if (c.componentSetId && file.componentSets[c.componentSetId]) {
    const s = file.componentSets[c.componentSetId]
    componentSets[c.componentSetId] = { key: s.key, name: s.name }
  }
}
writeFileSync(to, JSON.stringify({ document: { type: 'DOCUMENT', children: pages }, components, componentSets }, null, 1) + '\n')
