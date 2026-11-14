// Where the plugin keeps what it remembers, and in what shape — pure, so it is tested without Figma.
//
//  - the panel's settings (routes, data, actions) live IN THE FILE (plugin data): they are the design's,
//    shared with whoever edits it. Pasted rows can pass Figma's limit for one plugin-data entry, so
//    the text is split over several entries (`<key>:1`, `<key>:2`…; the key itself names how many).
//  - the TOKENS are the user's: clientStorage, on this device only, for every file.
//  - the TARGET (which Netlify site / Cloudflare project this file publishes to) is per user AND per
//    file: clientStorage under a key naming the file. Kept once for every file, the next file
//    published silently replaced the previous file's site. A DUPLICATED file carries the original's
//    id (Figma copies plugin data), so the target also keeps the file's name and first page: when
//    they are not the open file's, the site is only offered, never applied.

export const CONFIG = 'mateu-publish-config'
export const SECRETS = 'mateu-publish-secrets'
export const FILE_ID = 'mateu-publish-file-id'
export const TARGET = 'mateu-publish-target:'
/** Characters per plugin-data entry: at most ~96 kB in UTF-8, under Figma's 100 kB per entry. */
export const CHUNK = 32_000

/** The tokens: what clientStorage keeps for every file. */
export const TOKEN_KEYS = ['netlifyToken', 'cfToken', 'cfAccount', 'cfRelay']
/** Where a file publishes: what clientStorage keeps per file. */
export const TARGET_KEYS = ['host', 'netlifySite', 'netlifySiteId', 'netlifyUrl', 'cfProject', 'cfUrl']

const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o?.[k] !== undefined && o[k] !== '').map((k) => [k, o[k]]))

/**
 * The stored secrets of an older version (tokens AND one target for every file) split in two: the
 * tokens, and the site id it remembered — never applied to a file on its own, only offered.
 */
export function splitSecrets(stored) {
  const secrets = pick(stored, TOKEN_KEYS)
  const legacy = stored?.legacyNetlifySiteId ?? stored?.netlifySiteId
  if (legacy) secrets.legacyNetlifySiteId = legacy
  const legacyUrl = stored?.legacyNetlifyUrl ?? stored?.netlifyUrl
  if (legacy && legacyUrl) secrets.legacyNetlifyUrl = legacyUrl
  // the host choice is a preference; a site name or a Cloudflare project would aim this file at
  // another file's site, exactly the bug this split closes
  return { secrets, legacyTarget: pick(stored, ['host']) }
}

export const onlyTokens = (secrets) => pick(secrets, [...TOKEN_KEYS, 'legacyNetlifySiteId', 'legacyNetlifyUrl'])
export const onlyTarget = (target) => pick(target, TARGET_KEYS)

/** What tells this file from a duplicate of it that carries the same id: its name and first page. */
export const fileMarkOf = (root) => ({ name: String(root?.name ?? ''), page: String(root?.children?.[0]?.id ?? '') })

/** The target as stored: what [onlyTarget] keeps, plus the mark of the file it was saved for. */
export const storedTarget = (target, mark) => ({ ...onlyTarget(target), $file: mark })

/** Where a site / project is named: what a duplicate must not inherit on its own. */
const SITE_KEYS = ['netlifySiteId', 'netlifyUrl', 'netlifySite', 'cfProject', 'cfUrl']

/**
 * The stored [stored] target read for the file marked [mark]: applied when it was saved for this
 * file (or by a version that kept no mark); else only the host is applied, and the site is OFFERED
 * (`offered`) — the file is a copy of the one published there, or was renamed.
 */
export function targetFor(stored, mark) {
  if (!stored) return { target: undefined, offered: undefined }
  const target = onlyTarget(stored)
  const saved = stored.$file
  if (!saved || (saved.name === mark.name && saved.page === mark.page)) return { target, offered: undefined }
  const hasSite = SITE_KEYS.some((k) => target[k] !== undefined)
  if (!hasSite) return { target, offered: undefined }
  const kept = Object.fromEntries(Object.entries(target).filter(([k]) => !SITE_KEYS.includes(k)))
  return { target: kept, offered: { ...target, fileName: saved.name } }
}

/** [text] cut in parts of at most [size] UTF-16 units, never between the two halves of a surrogate pair. */
export function splitText(text, size) {
  const parts = []
  for (let i = 0; i < text.length; ) {
    let end = Math.min(i + size, text.length)
    const last = text.charCodeAt(end - 1)
    if (end < text.length && end - i > 1 && last >= 0xd800 && last <= 0xdbff) end--
    parts.push(text.substring(i, end))
    i = end
  }
  return parts
}

/** The entry of part [i] (1-based) of generation [gen]; the unnamed generation is the older layout. */
const partKey = (key, gen, i) => (gen ? `${key}:${gen}:${i}` : `${key}:${i}`)

/**
 * Writes [text] under [key] of [node], split in entries of [size]. Atomic: the parts go under a NEW
 * generation, then the header switches to it in one write, then the previous generation's parts are
 * cleared — a failure midway leaves the previous text readable.
 */
export function writeChunked(node, key, text, size = CHUNK) {
  const parts = splitText(text, size)
  const before = readHeader(node, key)
  if (parts.length <= 1) {
    node.setPluginData(key, text)
  } else {
    let gen = Date.now().toString(36)
    if (before && before.$gen === gen) gen += 'b'
    let written = 0
    try {
      parts.forEach((p, i) => { node.setPluginData(partKey(key, gen, i + 1), p); written = i + 1 })
      node.setPluginData(key, JSON.stringify({ $chunks: parts.length, $gen: gen }))
    } catch (e) {
      // a write that fails midway leaves no orphan parts behind (the header still names the old ones)
      for (let i = 1; i <= written; i++) { try { node.setPluginData(partKey(key, gen, i), '') } catch { /* best effort */ } }
      throw e
    }
  }
  if (before) for (let i = 1; i <= before.$chunks; i++) node.setPluginData(partKey(key, before.$gen, i), '')
}

function readHeader(node, key) {
  const raw = node.getPluginData(key)
  if (!raw) return null
  try {
    const v = JSON.parse(raw)
    return v && typeof v === 'object' && typeof v.$chunks === 'number' ? v : null
  } catch {
    return null
  }
}

/** The text written by writeChunked (or by an older version, in one entry); '' when there is none. */
export function readChunked(node, key) {
  const header = readHeader(node, key)
  if (!header) return node.getPluginData(key)
  let text = ''
  for (let i = 1; i <= header.$chunks; i++) text += node.getPluginData(partKey(key, header.$gen, i))
  return text
}

/** A message for the panel out of anything thrown. */
export const messageOf = (e) => String(e?.message ?? e)
