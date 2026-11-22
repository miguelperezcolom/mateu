import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

/**
 * This tree is the design-system-NEUTRAL half of every React renderer (Primer, SAP, Salesforce): a
 * design system's import here would ship it inside the others. A renderer's looks live in its app.
 */
const ROOT = new URL('.', import.meta.url).pathname
const FORBIDDEN = [
  /from\s+['"]@primer\//, /import\(\s*['"]@primer\//,
  /from\s+['"]@ui5\//, /import\(\s*['"]@ui5\//,
  /from\s+['"]@salesforce-ux\//, /import\(\s*['"]@salesforce-ux\//,
  /import\s+['"][^'"]+\.css['"]/, /from\s+['"][^'"]+\.css['"]/,
  // nor an app's own source
  /from\s+['"][^'"]*apps\/(primer|ui5|slds)\//,
]

const files = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
  const p = join(dir, name)
  return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(name) ? [p] : []
})

test('the shared React renderer tree imports no design system, no stylesheet and no app', () => {
  const offences = files(ROOT).flatMap((file) => {
    if (file.endsWith('boundary.test.ts')) return []
    return readFileSync(file, 'utf8').split('\n')
      .map((line, i) => ({ line, i }))
      .filter(({ line }) => FORBIDDEN.some((re) => re.test(line)))
      .map(({ line, i }) => `${relative(ROOT, file)}:${i + 1}: ${line.trim()}`)
  })
  assert.deepEqual(offences, [])
})
