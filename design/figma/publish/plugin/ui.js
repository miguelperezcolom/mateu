// The plugin's panel: what the design leaves open, then build and publish. Names coming from the
// design are only ever written as text or input values.
import contract from '../../contract.json'
import schema from '../../../../backend/shared/uidl/uidl-schema.json'
import manifest from './manifest.json'
import renderer from '../src/renderer.json'
import { checkRendererFile } from '../src/rendererPin.mjs'
import { sha256 } from '@noble/hashes/sha2'
import { bytesToHex } from '@noble/hashes/utils'
import { FigmaToYaml } from '../../to-yaml/src/convert.mjs'
import { buildManifest, defaultConfig, siteFiles } from '../src/site.mjs'
import { zip } from '../src/zip.mjs'
import { publishCloudflare, publishNetlify } from '../src/hosts.mjs'
import { targetDescription } from './target.js'

const app = document.getElementById('app')
// tokens travel in these messages: name the plugin and the only window that may read them
const post = (m) => parent.postMessage({ pluginMessage: m, pluginId: manifest.id }, 'https://www.figma.com')
const el = (tag, props = {}, ...kids) => {
  const e = Object.assign(document.createElement(tag), props)
  e.append(...kids)
  return e
}
const field = (label, input) => el('div', {}, el('label', { textContent: label }), input)
const input = (value, onInput, props = {}) => el('input', { value: value ?? '', oninput: (e) => onInput(e.target.value), ...props })

let files, warnings, config, secrets, target
const saveConfig = () => post({ type: 'save-config', config })
const saveSecrets = () => post({ type: 'save-secrets', secrets })
const saveTarget = () => {
  post({ type: 'save-target', target })
  drawTarget()
}

// a save that failed stays on screen until a later one of the same part succeeds
const saveProblems = new Map()
const saveBanner = el('div', { className: 'warn' })
const SAVE_WHAT = { settings: 'The settings could not be saved in this file', tokens: 'The tokens could not be kept on this device', target: 'Where this file publishes could not be kept on this device' }
function drawSaveProblems() {
  saveBanner.replaceChildren(...[...saveProblems].map(([what, message]) => el('div', { textContent: `${SAVE_WHAT[what] ?? what} (${message}): they last until you close the plugin.` })))
}

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
        saveConfig()
      } catch {
        error.textContent = 'That is not valid JSON yet.'
      }
    },
  })
  const error = el('div', { className: 'warn' })
  return el('div', {}, field(`Rows of "${ref}" (they travel with the site)`, area), error, field('…or read them from a public API (https://…)', input(d.url, (v) => { if (v) d.url = v; else delete d.url; saveConfig() })))
}

function actionPanel(id) {
  const a = config.actions[id]
  const details = el('div')
  const draw = () => {
    details.replaceChildren(
      ...(a.kind === 'navigate' ? [] : [field('Message when done', input(a.message, (v) => { a.message = v; saveConfig() }))]),
      ...(a.kind === 'url' ? [field('POST the form to (https://…)', input(a.url, (v) => { a.url = v; saveConfig() })), el('div', { className: 'hint', textContent: 'Runs in the visitor\'s browser: the URL and whatever it needs are public. Never put a key in it.' })] : []),
      field(a.kind === 'navigate' ? 'Go to route' : 'Then go to route (optional)', input(a.route, (v) => { a.route = v; saveConfig() })),
    )
  }
  const kind = el('select', { onchange: (e) => { a.kind = e.target.value; saveConfig(); draw() } }, ...[['message', 'Confirm with a message'], ['navigate', 'Go to a screen'], ['url', 'Send the form to a URL']].map(([value, textContent]) => el('option', { value, textContent, selected: a.kind === value })))
  draw()
  return el('div', {}, field(`Button action "${id}"`, kind), details)
}

// what pressing Publish will do, always in sight next to the button
const targetLine = el('div', { className: 'hint' })
const targetControls = el('div')
function newSite() {
  delete target.netlifySiteId
  delete target.netlifyUrl
  saveTarget()
}
function drawTarget() {
  targetLine.textContent = targetDescription(target)
  const controls = []
  if (target.host === 'netlify' && target.netlifySiteId) {
    controls.push(el('button', { className: 'secondary', textContent: 'Publish as a new site instead', onclick: newSite }))
  } else if (target.host === 'netlify' && secrets.legacyNetlifySiteId) {
    // an older version kept ONE site for every file: offered, never applied on its own
    const site = secrets.legacyNetlifyUrl ?? `site ${secrets.legacyNetlifySiteId}`
    controls.push(
      el('div', { className: 'hint', textContent: `Before, the plugin kept one site for all your files: ${site}. Publishing now creates a new site for this file, unless this file is the one published there.` }),
      el('button', {
        className: 'secondary',
        textContent: `This file is the one on ${site}: update it`,
        onclick: () => {
          target.netlifySiteId = secrets.legacyNetlifySiteId
          if (secrets.legacyNetlifyUrl) target.netlifyUrl = secrets.legacyNetlifyUrl
          delete secrets.legacyNetlifySiteId
          delete secrets.legacyNetlifyUrl
          saveSecrets()
          saveTarget()
        },
      }),
    )
  }
  targetControls.replaceChildren(...controls)
}

function destinationPanel() {
  target.host ??= 'netlify'
  const details = el('div')
  const s = (key) => (v) => { secrets[key] = v; saveSecrets() }
  const t = (key) => (v) => { target[key] = v; saveTarget() }
  const draw = () => {
    details.replaceChildren(
      ...(target.host === 'netlify'
        ? [field('Netlify personal access token', input(secrets.netlifyToken, s('netlifyToken'), { type: 'password' })), ...(target.netlifySiteId ? [] : [field('Site name (optional, for the new site)', input(target.netlifySite, t('netlifySite')))])]
        : target.host === 'cloudflare'
          ? [field('Relay Worker URL (https://….workers.dev, see the guide)', input(secrets.cfRelay, s('cfRelay'))), field('Account ID', input(secrets.cfAccount, s('cfAccount'))), field('API token (Cloudflare Pages: Edit)', input(secrets.cfToken, s('cfToken'), { type: 'password' })), field('Project name (this file\'s site)', input(target.cfProject, (v) => { target.cfProject = v; delete target.cfUrl; saveTarget() }))]
          : [el('div', { className: 'hint', textContent: 'A zip you can drop on Netlify Drop or a Cloudflare Pages project.' })]),
    )
  }
  const host = el('select', { onchange: (e) => { target.host = e.target.value; saveTarget(); draw() } }, ...[['netlify', 'Netlify'], ['cloudflare', 'Cloudflare Pages'], ['zip', 'Download a zip']].map(([value, textContent]) => el('option', { value, textContent, selected: target.host === value })))
  draw()
  return el('div', {}, host, details, el('div', { className: 'hint', textContent: 'Tokens stay on this device, never in the Figma file. Each file keeps its own site.' }))
}

async function build(log) {
  log(`Fetching the renderer (${renderer.tag})…`)
  const get = async (p) => {
    const r = await fetch(renderer.base + p)
    if (!r.ok) throw new Error(`Could not fetch ${p}: ${r.status}`)
    return r
  }
  const bytesOf = async (p) => checkRendererFile(renderer, p, new Uint8Array(await (await get(p)).arrayBuffer()), (b) => bytesToHex(sha256(b)))
  const assets = new Map(await Promise.all(renderer.files.map(async (p) => [p, await bytesOf(p)])))
  const template = new TextDecoder().decode(await bytesOf(renderer.index))
  return siteFiles(buildManifest(files, config), config, template, assets)
}

async function publish(button, status) {
  const log = (text) => { status.textContent = text }
  button.disabled = true
  try {
    const site = await build(log)
    let result
    if (target.host === 'netlify') {
      if (!secrets.netlifyToken) throw new Error('The Netlify token is missing.')
      result = await publishNetlify({ token: secrets.netlifyToken, siteId: target.netlifySiteId, siteName: target.netlifySiteId ? undefined : target.netlifySite || undefined, files: site, log })
      target.netlifySiteId = result.siteId
      target.netlifyUrl = result.url
      saveTarget()
    } else if (target.host === 'cloudflare') {
      for (const k of ['cfRelay', 'cfAccount', 'cfToken']) if (!secrets[k]) throw new Error('Fill in every Cloudflare field.')
      if (!target.cfProject) throw new Error('Fill in every Cloudflare field.')
      result = await publishCloudflare({ relayUrl: secrets.cfRelay, token: secrets.cfToken, accountId: secrets.cfAccount, project: target.cfProject, files: site, log })
      target.cfUrl = result.url
      saveTarget()
    } else {
      const a = el('a', { href: URL.createObjectURL(new Blob([zip(site)], { type: 'application/zip' })), download: 'site.zip', textContent: 'Download site.zip' })
      status.replaceChildren(a)
      return
    }
    status.replaceChildren('Published: ', el('a', { textContent: result.url, onclick: () => post({ type: 'open', url: result.url }) }))
  } catch (e) {
    status.replaceChildren(String(e.message ?? e))
    if (e.code === 'SITE_NOT_FOUND') status.append(el('div', {}, el('button', { className: 'secondary', textContent: 'Publish as a new site', onclick: () => { newSite(); void publish(button, status) } })))
  } finally {
    button.disabled = false
  }
}

function render() {
  const status = el('div', { id: 'status' })
  const button = el('button', { textContent: 'Publish', onclick: () => publish(button, status) })
  drawTarget()
  app.replaceChildren(
    saveBanner,
    field('Title', input(config.title, (v) => { config.title = v; saveConfig() })),
    el('h2', { textContent: 'Screens and routes' }),
    ...Object.keys(config.routes).map((p) => field(p.replace(/\.yaml$/, ''), input(config.routes[p], (v) => { config.routes[p] = v; saveConfig() }))),
    ...(Object.keys(config.data).length ? [el('h2', { textContent: 'Data' })] : []),
    ...Object.keys(config.data).map(dataPanel),
    ...(Object.keys(config.actions).length ? [el('h2', { textContent: 'What each button does' })] : []),
    ...Object.keys(config.actions).map(actionPanel),
    ...(warnings.length ? [el('h2', { textContent: 'Warnings' }), ...warnings.map((w) => el('div', { className: 'warn', textContent: w }))] : []),
    el('h2', { textContent: 'Publish to' }),
    destinationPanel(),
    targetLine,
    targetControls,
    button,
    status,
  )
}

onmessage = ({ data }) => {
  const m = data.pluginMessage
  if (m?.type === 'error') {
    app.textContent = m.message
    return
  }
  if (m?.type === 'save-failed') {
    saveProblems.set(m.what, m.message)
    drawSaveProblems()
    return
  }
  if (m?.type === 'saved') {
    if (saveProblems.delete(m.what)) drawSaveProblems()
    return
  }
  if (m?.type !== 'document') return
  try {
    const out = new FigmaToYaml({ contract, schema, drawnValues: true }).convert(m.file)
    files = out.files
    warnings = out.warnings
    if (!files.length) {
      app.textContent = 'No screens found: add a top-level frame built with the Mateu UI Kit.'
      return
    }
    secrets = m.secrets ?? {}
    target = m.target ?? {}
    config = merge(defaultConfig(files, m.name), m.config)
    render()
  } catch (e) {
    app.textContent = `Could not read the design: ${String(e?.message ?? e)}`
  }
}
post({ type: 'ready' })
