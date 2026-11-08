// The plugin's panel: what the design leaves open, then build and publish. Names coming from the
// design are only ever written as text or input values.
import contract from '../../contract.json'
import schema from '../../../../backend/shared/uidl/uidl-schema.json'
import renderer from '../src/renderer.json'
import { FigmaToYaml } from '../../to-yaml/src/convert.mjs'
import { buildManifest, defaultConfig, siteFiles } from '../src/site.mjs'
import { zip } from '../src/zip.mjs'
import { publishCloudflare, publishNetlify } from '../src/hosts.mjs'

const app = document.getElementById('app')
const post = (m) => parent.postMessage({ pluginMessage: m }, '*')
const el = (tag, props = {}, ...kids) => {
  const e = Object.assign(document.createElement(tag), props)
  e.append(...kids)
  return e
}
const field = (label, input) => el('div', {}, el('label', { textContent: label }), input)
const input = (value, onInput, props = {}) => el('input', { value: value ?? '', oninput: (e) => onInput(e.target.value), ...props })

let files, warnings, config, secrets
const save = () => post({ type: 'save', config, secrets })

function merge(proposed, saved) {
  if (!saved) return proposed
  const keep = (a, b) => Object.fromEntries(Object.keys(a).map((k) => [k, b?.[k] ?? a[k]]))
  return { title: saved.title ?? proposed.title, home: saved.home ?? proposed.home, routes: keep(proposed.routes, saved.routes), data: keep(proposed.data, saved.data), actions: keep(proposed.actions, saved.actions) }
}

function dataPanel(ref) {
  const d = config.data[ref]
  const area = el('textarea', {
    value: JSON.stringify(d.rows ?? [], null, 1),
    oninput: (e) => {
      try {
        d.rows = JSON.parse(e.target.value)
        delete d.url
        error.textContent = ''
        save()
      } catch {
        error.textContent = 'That is not valid JSON yet.'
      }
    },
  })
  const error = el('div', { className: 'warn' })
  return el('div', {}, field(`Rows of "${ref}" (they travel with the site)`, area), error, field('…or read them from a public API (https://…)', input(d.url, (v) => { if (v) d.url = v; else delete d.url; save() })))
}

function actionPanel(id) {
  const a = config.actions[id]
  const details = el('div')
  const draw = () => {
    details.replaceChildren(
      ...(a.kind === 'navigate' ? [] : [field('Message when done', input(a.message, (v) => { a.message = v; save() }))]),
      ...(a.kind === 'url' ? [field('POST the form to (https://…)', input(a.url, (v) => { a.url = v; save() })), el('div', { className: 'hint', textContent: 'Runs in the visitor\'s browser: the URL and whatever it needs are public. Never put a key in it.' })] : []),
      field(a.kind === 'navigate' ? 'Go to route' : 'Then go to route (optional)', input(a.route, (v) => { a.route = v; save() })),
    )
  }
  const kind = el('select', { onchange: (e) => { a.kind = e.target.value; save(); draw() } }, ...[['message', 'Confirm with a message'], ['navigate', 'Go to a screen'], ['url', 'Send the form to a URL']].map(([value, textContent]) => el('option', { value, textContent, selected: a.kind === value })))
  draw()
  return el('div', {}, field(`Button action "${id}"`, kind), details)
}

function destinationPanel(status) {
  secrets.host ??= 'netlify'
  const details = el('div')
  const s = (key) => (v) => { secrets[key] = v; save() }
  const draw = () => {
    details.replaceChildren(
      ...(secrets.host === 'netlify'
        ? [field('Netlify personal access token', input(secrets.netlifyToken, s('netlifyToken'), { type: 'password' })), field('Site name (optional)', input(secrets.netlifySite, s('netlifySite')))]
        : secrets.host === 'cloudflare'
          ? [field('Relay Worker URL (see the guide)', input(secrets.cfRelay, s('cfRelay'))), field('Account ID', input(secrets.cfAccount, s('cfAccount'))), field('API token (Cloudflare Pages: Edit)', input(secrets.cfToken, s('cfToken'), { type: 'password' })), field('Project name', input(secrets.cfProject, s('cfProject')))]
          : [el('div', { className: 'hint', textContent: 'A zip you can drop on Netlify Drop or a Cloudflare Pages project.' })]),
    )
  }
  const host = el('select', { onchange: (e) => { secrets.host = e.target.value; save(); draw() } }, ...[['netlify', 'Netlify'], ['cloudflare', 'Cloudflare Pages'], ['zip', 'Download a zip']].map(([value, textContent]) => el('option', { value, textContent, selected: secrets.host === value })))
  draw()
  return el('div', {}, host, details, el('div', { className: 'hint', textContent: 'Tokens stay on this device, never in the Figma file.' }))
}

async function build(log) {
  log(`Fetching the renderer (${renderer.tag})…`)
  const get = async (p) => {
    const r = await fetch(renderer.base + p)
    if (!r.ok) throw new Error(`Could not fetch ${p}: ${r.status}`)
    return r
  }
  const assets = new Map(await Promise.all(renderer.files.map(async (p) => [p, new Uint8Array(await (await get(p)).arrayBuffer())])))
  const template = await (await get(renderer.index)).text()
  return siteFiles(buildManifest(files, config), config, template, assets)
}

async function publish(button, status) {
  const log = (t) => { status.textContent = t }
  button.disabled = true
  try {
    const site = await build(log)
    let result
    if (secrets.host === 'netlify') {
      if (!secrets.netlifyToken) throw new Error('The Netlify token is missing.')
      result = await publishNetlify({ token: secrets.netlifyToken, siteId: secrets.netlifySiteId, siteName: secrets.netlifySite || undefined, files: site, log })
      secrets.netlifySiteId = result.siteId
      save()
    } else if (secrets.host === 'cloudflare') {
      for (const k of ['cfRelay', 'cfAccount', 'cfToken', 'cfProject']) if (!secrets[k]) throw new Error('Fill in every Cloudflare field.')
      result = await publishCloudflare({ relayUrl: secrets.cfRelay, token: secrets.cfToken, accountId: secrets.cfAccount, project: secrets.cfProject, files: site, log })
    } else {
      const a = el('a', { href: URL.createObjectURL(new Blob([zip(site)], { type: 'application/zip' })), download: 'site.zip', textContent: 'Download site.zip' })
      status.replaceChildren(a)
      return
    }
    status.replaceChildren('Published: ', el('a', { textContent: result.url, onclick: () => post({ type: 'open', url: result.url }) }))
  } catch (e) {
    status.textContent = String(e.message ?? e)
  } finally {
    button.disabled = false
  }
}

function render() {
  const status = el('div', { id: 'status' })
  const button = el('button', { textContent: 'Publish', onclick: () => publish(button, status) })
  app.replaceChildren(
    field('Title', input(config.title, (v) => { config.title = v; save() })),
    el('h2', { textContent: 'Screens and routes' }),
    ...Object.keys(config.routes).map((p) => field(p.replace(/\.yaml$/, ''), input(config.routes[p], (v) => { config.routes[p] = v; save() }))),
    ...(Object.keys(config.data).length ? [el('h2', { textContent: 'Data' })] : []),
    ...Object.keys(config.data).map(dataPanel),
    ...(Object.keys(config.actions).length ? [el('h2', { textContent: 'What each button does' })] : []),
    ...Object.keys(config.actions).map(actionPanel),
    ...(warnings.length ? [el('h2', { textContent: 'Warnings' }), ...warnings.map((w) => el('div', { className: 'warn', textContent: w }))] : []),
    el('h2', { textContent: 'Publish to' }),
    destinationPanel(status),
    button,
    status,
  )
}

onmessage = ({ data }) => {
  const m = data.pluginMessage
  if (m?.type !== 'document') return
  const out = new FigmaToYaml({ contract, schema, drawnValues: true }).convert(m.file)
  files = out.files
  warnings = out.warnings
  if (!files.length) {
    app.textContent = 'No screens found: add a top-level frame built with the Mateu UI Kit.'
    return
  }
  secrets = m.secrets
  config = merge(defaultConfig(files, m.name), m.config)
  render()
}
post({ type: 'ready' })
