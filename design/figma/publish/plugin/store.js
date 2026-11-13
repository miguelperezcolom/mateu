// Where the plugin keeps what it remembers, and in what shape — pure, so it is tested without Figma.
//
//  - the panel's settings (routes, data, actions) live IN THE FILE (plugin data): they are the design's,
//    shared with whoever edits it. Pasted rows can pass Figma's limit for one plugin-data entry, so
//    the text is split over several entries (`<key>:1`, `<key>:2`…; the key itself names how many).
//  - the TOKENS are the user's: clientStorage, on this device only, for every file.
//  - the TARGET (which Netlify site / Cloudflare project this file publishes to) is per user AND per
//    file: clientStorage under a key naming the file. Kept once for every file, the next file
//    published silently replaced the previous file's site.

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

/** Writes [text] under [key] of [node], split in entries of [size]; stale entries are cleared. */
export function writeChunked(node, key, text, size = CHUNK) {
  const parts = []
  for (let i = 0; i < text.length; i += size) parts.push(text.substring(i, i + size))
  const before = Number((readHeader(node, key) ?? {}).$chunks ?? 0)
  if (parts.length <= 1) {
    node.setPluginData(key, text)
  } else {
    parts.forEach((p, i) => node.setPluginData(`${key}:${i + 1}`, p))
    node.setPluginData(key, JSON.stringify({ $chunks: parts.length }))
  }
  const now = parts.length <= 1 ? 0 : parts.length
  for (let i = now + 1; i <= before; i++) node.setPluginData(`${key}:${i}`, '')
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
  for (let i = 1; i <= header.$chunks; i++) text += node.getPluginData(`${key}:${i}`)
  return text
}

/** A message for the panel out of anything thrown. */
export const messageOf = (e) => String(e?.message ?? e)
