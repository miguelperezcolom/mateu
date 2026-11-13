// From the converted screens to a UI with no backend: a static site whose manifest carries the raw
// definitions, the routes, the data and the actions, and whose pages the renderer expands in the
// browser (a `specsOnly` bundle, written without Java). What a design cannot say is proposed here
// (`defaultConfig`) and edited by the plugin's panel: the UI that gets published is the product, so
// the data travels with the site and every button does something a browser can do on its own.
import { slugify } from '../../to-yaml/src/convert.mjs'

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const LOCAL_SOURCE = '__mateu_local__'
const SHELL = '__shell.yaml'

/**
 * The file of the site each source's rows are written to, by source name: `data/<slug>.json`, the
 * slug plain ASCII (a space, a `/` or an accent in a name would make a file the host serves under
 * another path than the one the page asks for), distinct names kept distinct (`-2`).
 */
export function dataPaths(refs) {
  const out = new Map()
  const used = new Set()
  for (const ref of refs) {
    const base =
      trimDashes(
        String(ref)
          .normalize('NFKD')
          .replace(/[̀-ͯ]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-'),
      ) || 'data'
    let slug = base
    for (let i = 2; used.has(slug); i++) slug = `${base}-${i}`
    used.add(slug)
    out.set(ref, `data/${slug}.json`)
  }
  return out
}

const FIELD_ID = /^[A-Za-z_][A-Za-z0-9_-]*$/

function walk(value, visit) {
  if (Array.isArray(value)) value.forEach((v) => walk(v, visit))
  else if (isObject(value)) {
    visit(value)
    Object.values(value).forEach((v) => walk(v, visit))
  }
}

const pages = (files) => files.filter((f) => !f.partial && f.value.type !== 'AppShell')
const routeOf = (f) => f.path.replace(/\.yaml$/, '')
const labelOf = (f) => f.value.title ?? f.frame

/** A target with `${…}` segments as a route pattern: `artworks/${row.id}` → `artworks/:id`. */
export function routePattern(target) {
  return target.replace(/^\//, '').replace(/\$\{\s*(?:\w+\.)*(\w+)\s*\}/g, ':$1')
}

/** Everything the screens navigate to through a template: the routes a frame has to answer. */
function dynamicTargets(files) {
  const out = new Set()
  for (const f of files) {
    walk(f.value, (o) => {
      for (const target of [o.rowRoute, o.route]) {
        if (typeof target === 'string' && target.includes('${')) out.add(routePattern(target))
      }
    })
  }
  return [...out]
}

function bindDynamic(pattern, frames, taken) {
  const head = pattern.split('/')[0]
  return frames.find((f) => !taken.has(f) && [head, head.replace(/s$/, '')].includes(routeOf(f)) && !isListingPage(f, head))
}

const isListingPage = (f, head) => routeOf(f) === head && hasListing(f)

function hasListing(f) {
  let found = false
  walk(f.value, (o) => { found ||= o.type === 'Listing' })
  return found
}

function listings(files) {
  const out = new Map()
  for (const f of files) walk(f.value, (o) => { if (o.type === 'Listing' && o.rowsSource?.ref && !out.has(o.rowsSource.ref)) out.set(o.rowsSource.ref, o) })
  return out
}

/** Rows that look like the columns drawn, until the designer pastes real ones. */
export function proposedRows(listing, count = 3) {
  const params = [...String(listing.rowRoute ?? '').matchAll(/\$\{\s*row\.(\w+)\s*\}/g)].map((m) => m[1])
  return Array.from({ length: count }, (_, i) => {
    const row = {}
    for (const p of params) row[p] = i + 1
    for (const c of listing.columns ?? []) {
      row[c.id] = ['integer', 'number'].includes(c.dataType) ? i + 1 : `${c.label ?? c.id} ${i + 1}`
    }
    return row
  })
}

function actionsOf(files) {
  const out = new Map()
  for (const f of files) {
    walk(f.value, (o) => {
      for (const [k, v] of Object.entries(o)) {
        if (typeof v !== 'string' || !/^(actionId|.+ActionId)$/.test(k)) continue
        const known = out.get(v) ?? { id: v, label: null, primary: false, page: f }
        if (o.type === 'Button') {
          known.label ??= o.label ?? null
          known.primary ||= o.buttonStyle === 'primary'
        }
        out.set(v, known)
      }
    })
  }
  return out
}

/** The sources the options of a field name (`optionsSource.ref`). */
function optionRefs(files) {
  const out = new Set()
  for (const f of files) walk(f.value, (o) => { if (o.type === 'FormField' && o.optionsSource?.ref) out.add(o.optionsSource.ref) })
  return out
}

/** What the design leaves open, with a working answer for each: the panel starts from this. */
export function defaultConfig(files, title) {
  const frames = pages(files)
  const routes = {}
  for (const f of frames) routes[f.path] = routeOf(f)
  const taken = new Set()
  for (const pattern of dynamicTargets(files)) {
    const frame = bindDynamic(pattern, frames, taken)
    if (frame) {
      routes[frame.path] = pattern
      taken.add(frame)
    }
  }
  const home = frames.find((f) => ['home', 'welcome', 'inicio'].includes(routeOf(f)) && !routes[f.path].includes(':')) ?? frames.find((f) => !routes[f.path].includes(':'))
  const data = {}
  for (const [ref, listing] of listings(files)) data[ref] = { rows: proposedRows(listing) }
  for (const ref of optionRefs(files)) data[ref] ??= { rows: [1, 2, 3].map((i) => ({ value: `${ref}-${i}`, label: `${ref} ${i}` })) }
  const actions = {}
  for (const [id, a] of actionsOf(files)) actions[id] = { kind: 'message', message: `${a.label ?? id}: done` }
  return { title: title ?? 'Mateu UI', home: home?.path, routes, data, actions }
}

/** The JSON a POST carries: every field of the page, its values escaped by the interpolator. */
function bodyOf(page) {
  const ids = new Set()
  walk(page.value, (o) => { if (o.type === 'FormField' && o.id && !o.readOnly) ids.add(o.id) })
  for (const id of ids) {
    // the id is written into a JSON template and an expression: a quote would break both
    if (!FIELD_ID.test(id)) throw new Error(`the field id "${id}" (screen "${page.frame}") cannot be sent: use letters, digits, _ and - only`)
  }
  return `{${[...ids].map((id) => `"${id}": "\${state['${id}'] ?? ''}"`).join(', ')}}`
}

function actionEntry(found, chosen) {
  const validationRequired = found.primary
  const base = { id: found.id, ...(validationRequired ? { validationRequired } : {}) }
  if (chosen.kind === 'navigate') {
    return { ...base, commands: [{ targetComponentId: null, type: 'NavigateTo', data: chosen.route }] }
  }
  if (chosen.kind === 'url') {
    if (!/^https:\/\//.test(chosen.url ?? '')) throw new Error(`action "${found.id}": a URL has to start with https://`)
    return {
      ...base,
      restAction: {
        source: { url: chosen.url, method: 'POST', headers: { 'Content-Type': 'application/json' }, body: bodyOf(found.page) },
        successMessage: chosen.message ?? 'Sent',
        ...(chosen.route ? { successRoute: chosen.route } : {}),
      },
    }
  }
  return { ...base, restAction: { source: { ref: LOCAL_SOURCE }, successMessage: chosen.message ?? 'Done', ...(chosen.route ? { successRoute: chosen.route } : {}) } }
}

function withPartials(value, partials) {
  if (Array.isArray(value)) return value.map((v) => withPartials(v, partials))
  if (!isObject(value)) return value
  if (value.type === 'Partial' && partials.has(slugify(value.ref))) {
    const p = partials.get(slugify(value.ref))
    return withPartials(p.type ? p : { type: 'VerticalLayout', ...p }, partials)
  }
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, withPartials(v, partials)]))
}

/** The manifest of the site: what `<mateu-ui bundleUrl>` reads. */
export function buildManifest(files, config) {
  const frames = pages(files)
  const partials = new Map(files.filter((f) => f.partial).map((f) => [f.path.replace(/^partials\//, '').replace(/\.yaml$/, ''), f.value]))
  const definitions = {}
  const routes = []
  const homeFrame = frames.find((f) => f.path === config.home) ?? frames[0]
  for (const f of frames) {
    definitions[f.path] = withPartials(f.value, partials)
    // a file of the site cannot search: better no box than a box that does nothing
    walk(definitions[f.path], (o) => { if (o.type === 'Listing' && config.data[o.rowsSource?.ref] && !config.data[o.rowsSource.ref].url) delete o.searchable })
    routes.push({ route: config.routes[f.path] ?? routeOf(f), definition: f.path, ...(f.drawn ? { state: f.drawn } : {}) })
  }
  const declaredShell = files.find((f) => f.value.type === 'AppShell')
  const navigable = frames.filter((f) => !(config.routes[f.path] ?? '').includes(':'))
  if (declaredShell) {
    definitions[declaredShell.path] = declaredShell.value
    routes.unshift({ route: '', definition: declaredShell.path })
  } else if (navigable.length > 1) {
    definitions[SHELL] = {
      type: 'AppShell',
      title: config.title,
      variant: navigable.length > 7 ? 'HAMBURGER_MENU' : 'MENU_ON_TOP',
      menu: [homeFrame, ...navigable.filter((f) => f !== homeFrame)].map((f) => ({ type: 'RouteLink', label: labelOf(f), route: config.routes[f.path] })),
    }
    routes.unshift({ route: '', definition: SHELL })
  } else if (homeFrame) {
    routes.unshift({ route: '', definition: homeFrame.path })
  }

  const sources = [{ name: LOCAL_SOURCE, source: { url: `/${LOCAL_SOURCE}`, method: 'POST' }, sample: { ok: true } }]
  const paths = dataPaths(Object.keys(config.data))
  for (const [ref, data] of Object.entries(config.data)) {
    if (data.url) sources.push({ name: ref, source: { url: data.url } })
    else sources.push({ name: ref, source: { url: `/${paths.get(ref)}` } })
  }
  const found = actionsOf(files)
  const actions = [...found.values()].map((a) => actionEntry(a, config.actions[a.id] ?? { kind: 'message' }))
  // A listing reads a real file of the site (see siteFiles). "mock" only serves the local source that
  // lets a button confirm with no network: the sources with a url and no sample are really called.
  return { baseUrl: '', staticOnly: true, entries: [], routes: { routes }, sources: { sources }, actions, definitions, mockSources: true }
}

const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

/** The renderer's page template, booting the manifest. */
export function stampIndex(template, title) {
  const ui = '<mateu-ui baseUrl="" bundleUrl="/manifest.json" style="width:100%;height:100vh;"></mateu-ui>'
  const start = template.indexOf('<!-- AQUIUI -->')
  const end = template.indexOf('<!-- HASTAAQUIUI -->')
  if (start < 0 || end < 0) throw new Error('the renderer page has no mount markers')
  return (template.substring(0, start) + ui + template.substring(end + '<!-- HASTAAQUIUI -->'.length))
    .replace('AQUIELTITULODELAPAGINA', () => escapeHtml(title)) // a function: a title may hold $& or $'
    .replace(/<!--\s*(?:HASTA)?AQUI\w+\s*-->\n?/g, '')
}

/** Every file of the site: path → string | Uint8Array. `assets` = the renderer's files. */
export function siteFiles(manifest, config, indexTemplate, assets) {
  const out = new Map(assets)
  out.set('index.html', stampIndex(indexTemplate, config.title))
  out.set('manifest.json', JSON.stringify(manifest))
  const paths = dataPaths(Object.keys(config.data))
  for (const [ref, data] of Object.entries(config.data)) {
    if (!data.url) out.set(paths.get(ref), JSON.stringify(data.rows ?? []))
  }
  out.set('_redirects', '/*    /index.html    200\n')
  return out
}

// '-'s off both ends, in linear time (a /^-+|-+$/g regex backtracks on a long run of dashes)
function trimDashes(s) {
  let start = 0
  let end = s.length
  while (start < end && s[start] === '-') start++
  while (end > start && s[end - 1] === '-') end--
  return s.slice(start, end)
}
