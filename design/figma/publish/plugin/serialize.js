// The current document in the shape of `GET /v1/files/:key`, with exactly what the converter reads:
// so publishing needs no Figma token (design/figma/to-yaml never knows where its input came from).

function setOf(component) {
  return component.parent && component.parent.type === 'COMPONENT_SET' ? component.parent : null
}

function propertiesOf(instance) {
  const out = {}
  for (const [key, p] of Object.entries(instance.componentProperties)) out[key] = { type: p.type, value: p.value }
  return out
}

async function node(n, ctx) {
  const out = { id: n.id, name: n.name, type: n.type }
  if (n.visible === false) out.visible = false
  if (n.type === 'INSTANCE') {
    const main = await n.getMainComponentAsync()
    if (main) {
      out.componentId = main.id
      const set = setOf(main)
      ctx.components[main.id] = { key: main.key, name: main.name, ...(set ? { componentSetId: set.id } : {}) }
      if (set) ctx.componentSets[set.id] = { key: set.key, name: set.name }
    }
    out.componentProperties = propertiesOf(n)
  }
  if (n.componentPropertyReferences) out.componentPropertyReferences = n.componentPropertyReferences
  if (n.type === 'TEXT') {
    out.characters = n.characters
    if (typeof n.fontSize === 'number') out.style = { fontSize: n.fontSize }
  }
  if ('layoutMode' in n && n.layoutMode && n.layoutMode !== 'NONE') out.layoutMode = n.layoutMode
  if ('children' in n) {
    out.children = []
    for (const child of n.children) out.children.push(await node(child, ctx))
  }
  return out
}

/** `pages`: the Figma pages to read (loaded). The library's own `Mateu ·` pages are the converter's to skip. */
export async function serialize(pages) {
  const ctx = { components: {}, componentSets: {} }
  const children = []
  for (const page of pages) {
    const canvas = { id: page.id, name: page.name, type: 'CANVAS', children: [] }
    if (!/^Mateu ·/.test(page.name)) for (const c of page.children) canvas.children.push(await node(c, ctx))
    children.push(canvas)
  }
  return { document: { type: 'DOCUMENT', children }, ...ctx }
}
