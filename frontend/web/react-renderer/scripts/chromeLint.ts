import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

/**
 * The chrome-text lint every React renderer app runs (its src/i18n/texts.lint.test.ts calls
 * chromeTextsLint): a renderer's chrome speaks the page's language, so every word it draws by itself
 * comes from the texts (tx / appText). It finds a NEW hard-coded chrome string — JSX text, an
 * aria-label / title / placeholder / alt / label written as text, a toast or dialog button word, a
 * sentence in a string literal — in the app's src/ and in this shared tree. A literal that is not
 * chrome (a protocol value, a CSS name) carries `i18n-ok` on its line. Designer tools are excluded,
 * as in the web renderer's lint (chromeTexts.lint.test.ts).
 */
const SHARED = new URL('../', import.meta.url).pathname

const EXCLUDED = [
  /i18n\//,
  /catalogue\/visual\/definitions\.tsx$/, // the workflow / form designers (the web excludes its own)
  /catalogue\/display\/shared\.tsx$/, // wire icon tokens → the design system's icon names
  /catalogue\/families\.ts$/, // wire type names
  /\/scripts\//, /\/vite\//, // build-time tooling
]

const WORDS = 'Retry|Cancel|Clear filters|Show more|Filter|Filter by|No data\\.?|Ask AI|Save|Close|Delete|Search|Loading…?|'
  + 'Previous|Next|Expand|Collapse|Upload|Replace|Apply|Clear|Undo|Dismiss|Remove|Edit|Select|Reset|Send|Maximize|Back|Menu|'
  + 'Yes|No|Columns|Notifications|Copied|Add|Added|Done|OK|Stay|Discard|Information|Warning|Error|Success|Details|Dialog|'
  + 'Confirm|Today|Sign out|Sign in|Rows|Actions|Message|Options|Try again'

const ATTRS = 'aria-label|title|placeholder|alt|srText|label|inputLabel|loadingMessage|confirmButtonContent|cancelButtonContent|description|text'

const PATTERNS: { name: string; re: RegExp }[] = [
  { name: 'attribute text', re: new RegExp(`\\b(?:${ATTRS})="[A-Za-z¿¡][^"{}$]*[a-z][^"{}$]*"`) },
  { name: 'attribute literal', re: new RegExp(`\\b(?:${ATTRS})=\\{\\s*['"\`][A-Z][a-z]`) },
  { name: 'JSX text', re: /(?<![=-])>\s*[A-Z¿][a-záéíóúñ']+(?:\s+[a-zA-Záéíóúñ'’,]+){0,20}[.…!?]?\s*<\// },
  { name: 'JSX text line', re: /^\s*[A-Z][a-z']+(?:\s+[a-zA-Z'’,]+){1,20}[.…!?]?\s*$/ },
  { name: 'chrome word literal', re: new RegExp(`['"\`](?:${WORDS})['"\`]`) },
  { name: 'sentence literal', re: /['"`][A-Z][a-z']+(?:\s+[a-z'’,]+){2,}[.…!?]?['"`]/ },
  // a fallback or a choice that is a word: `label || 'Open'`, `x ? 'Hide details' : …`, `return 'Yes'`
  { name: 'fallback text', re: /(?:\|\||\?\?)\s*['"`][A-Z][a-z]/ },
  { name: 'choice text', re: /[?:]\s*['"`][A-Z][a-z][^'"`]*['"`]\s*[:)}]/ },
  { name: 'returned text', re: /\breturn\s+['"`][A-Z][a-z]+(?:\s+[a-z]+)*['"`]/ },
]

const files = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name)
  if (statSync(path).isDirectory()) return files(path)
  return /\.tsx?$/.test(name) && !/\.test\.ts$/.test(name) ? [path] : []
})

const offending = (path: string, root: string, protocolWords?: RegExp): string[] => {
  const out: string[] = []
  let inComment = false
  readFileSync(path, 'utf8').split('\n').forEach((line, i) => {
    const code = line.trim()
    if (inComment) { if (code.includes('*/')) inComment = false; return }
    if (code.startsWith('/*') && !code.includes('*/')) { inComment = true; return }
    if (code.startsWith('//') || code.startsWith('*') || code.startsWith('/*') || line.includes('i18n-ok')) return
    if (/\bconsole\.(warn|error|debug|log|info)\(|^\s*import |^\s*(case |if \(|else if)/.test(line)) return
    const text = protocolWords ? line.replace(protocolWords, "''") : line
    const hit = PATTERNS.find(({ re }) => re.test(text))
    if (hit) out.push(`${relative(root, path)}:${i + 1} (${hit.name}): ${code.slice(0, 140)}`)
  })
  return out
}

export interface LintOptions {
  /** The app's src/ folder. */
  appSrc: string
  /** A design system's enumerated property values (protocol words, not chrome), blanked before the patterns run. */
  protocolWords?: RegExp
}

/** The offending lines of the app's src/ and of the shared tree: none is the pass. */
export function chromeTextsLint({ appSrc, protocolWords }: LintOptions): string[] {
  const all = [...files(appSrc), ...files(SHARED)].filter((f) => !EXCLUDED.some((re) => re.test(f)))
  return all.flatMap((f) => offending(f, f.startsWith(appSrc) ? appSrc : SHARED, protocolWords))
}
