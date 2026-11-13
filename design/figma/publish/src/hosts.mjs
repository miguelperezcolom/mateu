// Publishing a built site. Both functions take the `fetch` to use, so they are tested against a
// recording double, and tell progress through `log`. Tokens are only ever sent as Authorization.
import { blake3 } from '@noble/hashes/blake3'
import { sha1 } from '@noble/hashes/legacy'

const hex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
const toBytes = (v) => (typeof v === 'string' ? new TextEncoder().encode(v) : v)

function base64(bytes) {
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(s)
}

async function json(res, what) {
  if (res.ok) return res.json()
  const body = await res.text().catch(() => '')
  throw new Error(`${what}: ${res.status} ${body.slice(0, 200)}`)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Netlify: creates the site the first time (no `siteId`), then deploys file by file. NOT the zip
 * endpoint: it answers with its CORS header twice (`*, *`), so the deploy happens and a browser
 * refuses to read the answer. Returns `{url, siteId}`: keep the id, the next publish updates the site.
 */
export async function publishNetlify({ token, siteId, siteName, files, fetch: f = fetch, log = () => {}, pollMs = 1500, api = 'https://api.netlify.com/api/v1' }) {
  const auth = { Authorization: `Bearer ${token}` }
  let id = siteId
  if (!id) {
    log('Creating the site…')
    const site = await json(await f(`${api}/sites`, { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify(siteName ? { name: siteName } : {}) }), 'Netlify, creating the site')
    id = site.id
  }
  const digests = {}
  const bySha = new Map()
  for (const [path, value] of files) {
    const bytes = toBytes(value)
    const sha = hex(sha1(bytes))
    digests['/' + path] = sha
    if (!bySha.has(sha)) bySha.set(sha, { path, bytes })
  }
  log('Preparing the deploy…')
  const prepared = await f(`${api}/sites/${encodeURIComponent(id)}/deploys`, { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ files: digests }) })
  if (siteId && prepared.status === 404) {
    // deleted in Netlify, or another account's token: say so, so the panel can offer a new site
    const e = new Error('Netlify does not know the site this file published to (deleted, or another account\'s token). Publish it as a new site.')
    e.code = 'SITE_NOT_FOUND'
    throw e
  }
  let deploy = await json(prepared, 'Netlify, preparing the deploy')
  const required = deploy.required ?? []
  let done = 0
  for (const sha of required) {
    const file = bySha.get(sha)
    if (!file) throw new Error(`Netlify asked for a file this site does not have (${sha})`)
    log(`Uploading ${++done}/${required.length}…`)
    const encoded = file.path.split('/').map(encodeURIComponent).join('/')
    const res = await f(`${api}/deploys/${deploy.id}/files/${encoded}`, { method: 'PUT', headers: { ...auth, 'Content-Type': 'application/octet-stream' }, body: file.bytes })
    await json(res, `Netlify, uploading ${file.path}`)
  }
  for (let i = 0; i < 60 && !['ready', 'error'].includes(deploy.state); i++) {
    await sleep(pollMs)
    log('Netlify is processing it…')
    deploy = await json(await f(`${api}/deploys/${deploy.id}`, { headers: auth }), 'Netlify, checking the deploy')
  }
  if (deploy.state !== 'ready') throw new Error(`Netlify did not finish the deploy: ${deploy.error_message ?? deploy.state}`)
  return { url: deploy.ssl_url ?? deploy.url, siteId: id }
}

const TYPES = { html: 'text/html', js: 'text/javascript', css: 'text/css', json: 'application/json', svg: 'image/svg+xml' }
const extensionOf = (path) => (path.includes('.') ? path.substring(path.lastIndexOf('.') + 1) : '')
/** The key Cloudflare Pages stores a file under (what wrangler computes). */
export const pagesHash = (b64, extension) => hex(blake3(new TextEncoder().encode(b64 + extension))).slice(0, 32)

/**
 * Cloudflare Pages, direct upload. Its API answers no CORS, so a browser (a plugin) reaches it through
 * `relayUrl`: the small Worker in design/figma/publish/cloudflare-relay, in the user's own account.
 * Returns `{url}`.
 */
export async function publishCloudflare({ relayUrl, token, accountId, project, files, fetch: f = fetch, log = () => {} }) {
  // the token travels to the relay: never over plain http
  if (!/^https:\/\/[^/]/.test(String(relayUrl ?? ''))) throw new Error('The relay Worker URL has to start with https://')
  const base = relayUrl.replace(/\/$/, '') + '/client/v4'
  const auth = { Authorization: `Bearer ${token}` }
  const projectUrl = `${base}/accounts/${encodeURIComponent(accountId)}/pages/projects/${encodeURIComponent(project)}`
  const exists = await f(projectUrl, { headers: auth })
  let projectInfo
  if (exists.status === 404) {
    log('Creating the project…')
    projectInfo = (await json(await f(`${base}/accounts/${encodeURIComponent(accountId)}/pages/projects`, { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: project, production_branch: 'main' }) }), 'Cloudflare, creating the project')).result
  } else {
    projectInfo = (await json(exists, 'Cloudflare, reading the project')).result
  }
  const { result: jwt } = await json(await f(`${projectUrl}/upload-token`, { headers: auth }), 'Cloudflare, asking to upload').then((r) => ({ result: r.result.jwt }))
  const upload = { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' }

  const assets = []
  let redirects
  for (const [path, value] of files) {
    if (path === '_redirects') {
      redirects = value
      continue
    }
    const bytes = toBytes(value)
    const b64 = base64(bytes)
    const ext = extensionOf(path)
    assets.push({ path, key: pagesHash(b64, ext), value: b64, size: bytes.length, contentType: TYPES[ext] ?? 'application/octet-stream' })
  }
  const hashes = [...new Set(assets.map((a) => a.key))]
  const missing = new Set((await json(await f(`${base}/pages/assets/check-missing`, { method: 'POST', headers: upload, body: JSON.stringify({ hashes }) }), 'Cloudflare, checking files')).result)
  log(`Uploading ${missing.size} files…`)
  let batch = []
  let size = 0
  const flush = async () => {
    if (!batch.length) return
    await json(await f(`${base}/pages/assets/upload`, { method: 'POST', headers: upload, body: JSON.stringify(batch) }), 'Cloudflare, uploading')
    batch = []
    size = 0
  }
  for (const a of assets.filter((x, i) => missing.has(x.key) && assets.findIndex((y) => y.key === x.key) === i)) {
    if (size + a.value.length > 20_000_000) await flush()
    batch.push({ key: a.key, value: a.value, metadata: { contentType: a.contentType }, base64: true })
    size += a.value.length
  }
  await flush()
  await json(await f(`${base}/pages/assets/upsert-hashes`, { method: 'POST', headers: upload, body: JSON.stringify({ hashes }) }), 'Cloudflare, registering files')

  log('Deploying…')
  const form = new FormData()
  form.append('manifest', JSON.stringify(Object.fromEntries(assets.map((a) => ['/' + a.path, a.key]))))
  form.append('branch', 'main')
  if (redirects) form.append('_redirects', new Blob([redirects]), '_redirects')
  const deployed = await json(await f(`${projectUrl}/deployments`, { method: 'POST', headers: auth, body: form }), 'Cloudflare, deploying')
  // Cloudflare gives another subdomain when the project name is taken on pages.dev: never assume it
  const subdomain = typeof projectInfo?.subdomain === 'string' && /^[a-z0-9.-]+$/i.test(projectInfo.subdomain) ? projectInfo.subdomain : null
  return { url: subdomain ? `https://${subdomain}` : deployed.result?.url ?? `https://${project}.pages.dev`, deploymentUrl: deployed.result?.url }
}
