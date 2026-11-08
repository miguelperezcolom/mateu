// Reads the contract and the schema off the repository: Node only (the Figma publish plugin imports
// the converter in a browser and hands it both objects).

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
