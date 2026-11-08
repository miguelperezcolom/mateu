// Publishing a built site. Both functions take the `fetch` to use, so they are tested against a
// recording double, and tell progress through `log`. Tokens are only ever sent as Authorization.
import { blake3 } from '@noble/hashes/blake3'

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
 * Netlify: creates the site the first time (no `siteId`), then deploys the zip. Netlify's API
 * answers CORS for any origin, so a plugin calls it directly.
 * Returns `{url, siteId}`: keep the id, the next publish updates the same site.
 */
export async function publishNetlify({ token, siteId, siteName, zipBytes, fetch: f = fetch, log = () => {}, pollMs = 1500, api = 'https://api.netlify.com/api/v1' }) {
  const auth = { Authorization: `Bearer ${token}` }
  let id = siteId
  if (!id) {
    log('Creating the site…')
    const site = await json(await f(`${api}/sites`, { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify(siteName ? { name: siteName } : {}) }), 'Netlify, creating the site')
    id = site.id
  }
  log('Uploading…')
  let deploy = await json(await f(`${api}/sites/${id}/deploys`, { method: 'POST', headers: { ...auth, 'Content-Type': 'application/zip' }, body: zipBytes }), 'Netlify, uploading')
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
  const base = relayUrl.replace(/\/$/, '') + '/client/v4'
  const auth = { Authorization: `Bearer ${token}` }
  const projectUrl = `${base}/accounts/${accountId}/pages/projects/${project}`
  const exists = await f(projectUrl, { headers: auth })
  if (exists.status === 404) {
    log('Creating the project…')
    await json(await f(`${base}/accounts/${accountId}/pages/projects`, { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: project, production_branch: 'main' }) }), 'Cloudflare, creating the project')
  } else if (!exists.ok) {
    await json(exists, 'Cloudflare, reading the project')
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
  return { url: `https://${project}.pages.dev`, deploymentUrl: deployed.result?.url }
}
