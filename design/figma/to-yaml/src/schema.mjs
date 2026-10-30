// Reads the generated authoring schema (backend/shared/uidl/uidl-schema.json) to answer one
// question: what does a dotted path under a YAML type accept? The converter uses it to type a
// value it read as text (a `#config` "true", a "3") and to refuse a target the schema does not
// describe — the same check the contract test runs over every mapping, so a name nobody declared
// never reaches a generated file.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
export const REPO = join(here, '../../../..')

export function loadSchema(path = join(REPO, 'backend/shared/uidl/uidl-schema.json')) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function loadContract(path = join(REPO, 'design/figma/contract.json')) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export class Schema {
  constructor(json) {
    this.defs = json.$defs
  }

  def(name) {
    return this.defs[name]
  }

  /** The YAML component types of the `Component` union. */
  componentTypes() {
    return this.defs.Component.oneOf.map((r) => r.$ref.split('/').pop())
  }

  deref(node) {
    let n = node
    for (let i = 0; n && n.$ref && i < 20; i++) n = this.defs[n.$ref.split('/').pop()]
    return n
  }

  /** Branches of a union node, dereferenced. */
  branches(node) {
    const n = this.deref(node)
    return n && n.oneOf ? n.oneOf.map((b) => this.deref(b)) : null
  }

  /**
   * The schema of `path` (dotted) under the object schema `root`; `typeAt(prefix)` answers the
   * `type` already chosen for the object at a prefix, to pick a union's branch. Null when the
   * schema does not describe the path.
   */
  resolve(root, path, typeAt = () => undefined) {
    let node = this.deref(root)
    const segs = path.split('.')
    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i]
      node = this.objectBranch(node, segs.slice(0, i).join('.'), seg, typeAt)
      if (!node || !node.properties || !(seg in node.properties)) return null
      node = this.deref(node.properties[seg])
      if (node && node.type === 'array' && i < segs.length - 1) node = this.deref(node.items)
    }
    return node
  }

  objectBranch(node, prefix, seg, typeAt) {
    const n = this.deref(node)
    if (!n) return null
    const branches = this.branches(n)
    if (!branches) return n
    const chosen = typeAt(prefix)
    if (chosen) return branches.find((b) => b.properties?.type?.const === chosen) ?? null
    return branches.find((b) => b.properties && seg in b.properties) ?? null
  }
}
