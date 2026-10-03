// Task-based quality evaluation of the Mateu visual editor (the shared web bundle IntelliJ/VSCode embed).
//
// Each task is something a real author does. It is driven the way a person would — through the
// editor's own UI (clicks, typing, dialogs) — and it falls back to editing the YAML only when the UI
// offers no way, which is recorded as a DEAD END. Every task reports: pass / partial / fail, the UI
// steps it took, whether YAML had to be typed, console errors, and a screenshot.
//
// The same script runs against any build, so a before/after comparison is the same tasks on two
// bundles. It needs:
//   - the editor bundle served with /mateu proxied to a Mateu backend (e.g. demo-starwars on :8600),
//   - the demo-static-vcn external API on :8790 (rows for the listing tasks),
//   - the real app on --app (default http://localhost:8600) for the fidelity reference.
//
// Usage: node visual-editor-tasks.mjs --url http://localhost:5197/ --label after --out ./shots
import { chromium } from '@playwright/test'
import { parseArgs } from 'node:util'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
// `yaml` comes from the frontend monorepo (the e2e package does not depend on it).
const { parse } = createRequire(new URL('../frontend/web/monorepo/package.json', import.meta.url))('yaml')

const { values } = parseArgs({
    options: {
        url: { type: 'string', default: 'http://localhost:5197/' },
        app: { type: 'string', default: 'http://localhost:8600' },
        label: { type: 'string', default: 'run' },
        out: { type: 'string', default: './visual-editor-shots' },
        only: { type: 'string' },
    },
})
const here = path.dirname(new URL(import.meta.url).pathname)
const VCN = path.resolve(here, '../demo/demo-static-vcn/yaml/src/main/resources/specs/ui')
const SW = path.resolve(here, '../demo/demo-starwars/src/main/resources/specs/ui')
const readDir = (dir) => Object.fromEntries(fs.readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).map((f) => [f, fs.readFileSync(path.join(dir, f), 'utf8')]))
fs.mkdirSync(values.out, { recursive: true })

const browser = await chromium.launch()
const results = []

/** One task in a fresh browser context (clean localStorage), with a seeded project. */
async function task(id, title, seed, body) {
    if (values.only && !values.only.split(',').includes(id)) return
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()
    const r = { id, title, status: 'fail', steps: 0, yaml: false, notes: [], errors: [], ms: 0 }
    page.on('pageerror', (e) => r.errors.push(e.message.slice(0, 160)))
    page.on('console', (m) => {
        if (m.type() !== 'error') return
        const t = m.text()
        // Network noise from the sandbox / external hosts is not the editor's fault.
        if (/ERR_CERT|net::ERR|Failed to load resource/.test(t)) return
        r.errors.push(t.slice(0, 160))
    })
    const answers = []
    page.on('dialog', async (d) => {
        const a = answers.shift()
        if (d.type() === 'confirm') await d.accept()
        else if (d.type() === 'alert') { r.notes.push(`alert: ${d.message().slice(0, 100)}`); await d.accept() }
        else await d.accept(a ?? '')
    })
    await page.addInitScript((s) => {
        if (sessionStorage.getItem('ve-seeded')) return
        sessionStorage.setItem('ve-seeded', '1')
        localStorage.clear()
        if (s.files) localStorage.setItem('mateu-visual-editor-project', JSON.stringify(s.files))
        if (s.path) localStorage.setItem('mateu-visual-editor-path', s.path)
        localStorage.setItem('mateu-visual-editor-yaml', s.yaml ?? '')
        localStorage.setItem('mateu-visual-editor-preview-source', JSON.stringify({ mode: s.mode ?? 'remote', baseUrl: s.baseUrl ?? '' }))
        if (s.renderer) localStorage.setItem('mateu-visual-editor-renderer', s.renderer)
    }, seed)
    const t0 = Date.now()
    const h = helpers(page, r, answers)
    h.r = r
    try {
        await page.goto(values.url, { waitUntil: 'domcontentloaded' })
        await page.waitForSelector('mateu-visual-editor')
        await page.waitForTimeout(2500)
        await body(h)
    } catch (e) {
        r.notes.push(`threw: ${String(e?.message ?? e).split('\n')[0].slice(0, 200)}`)
    }
    r.ms = Date.now() - t0
    await page.screenshot({ path: path.join(values.out, `${values.label}-${id}.png`) }).catch(() => {})
    await ctx.close()
    results.push(r)
    console.log(`${r.status.padEnd(7)} ${id} ${title} — ${r.steps} steps${r.yaml ? ', YAML typed' : ''}${r.errors.length ? `, ${r.errors.length} console error(s)` : ''}${r.notes.length ? `\n         ${r.notes.join('\n         ')}` : ''}`)
}

function helpers(page, r, answers) {
    const ed = page.locator('mateu-visual-editor')
    const h = {
        page, ed,
        answer: (...a) => answers.push(...a),
        async step(fn) { r.steps++; await fn(); await page.waitForTimeout(350) },
        async has(loc) { return (await loc.count()) > 0 },
        /** Click the first visible button whose text starts with one of the labels, if any. */
        async button(scope, ...labels) {
            for (const l of labels) {
                const b = scope.locator('button', { hasText: l }).first()
                if (await b.count() && await b.isVisible().catch(() => false)) return b
            }
            return null
        },
        async savedYaml() { return page.evaluate(() => localStorage.getItem('mateu-visual-editor-yaml') ?? '') },
        async saved() { try { return parse(await h.savedYaml()) } catch { return null } },
        async canvasText() {
            return page.evaluate(() => {
                const out = []
                const walk = (n) => { if (!n) return; if (n.nodeType === 3) out.push(n.textContent); if (n.shadowRoot) walk(n.shadowRoot); for (const c of (n.childNodes || [])) walk(c) }
                walk(document.querySelector('mateu-visual-editor')?.shadowRoot?.querySelector('editor-canvas'))
                return out.join(' ').replace(/\s+/g, ' ')
            })
        },
        async canvasCount(selector) {
            return page.evaluate((sel) => {
                let n = 0
                const walk = (root) => { if (!root) return; n += root.querySelectorAll(sel).length; for (const el of root.querySelectorAll('*')) if (el.shadowRoot) walk(el.shadowRoot) }
                const canvas = document.querySelector('mateu-visual-editor')?.shadowRoot?.querySelector('editor-canvas')
                walk(canvas?.shadowRoot)
                return n
            }, selector)
        },
        /** Select a node from the Layers tree by its label text (type + hint). */
        async layer(type, hint) {
            const row = ed.locator('editor-outline .row').filter({ hasText: type }).filter({ hasText: hint ?? '' }).first()
            if (!(await row.count())) return false
            await h.step(() => row.click())
            return true
        },
        /** The properties panel input following a label. */
        prop(name) { return ed.locator(`editor-properties label:text-is("${name}") + input, editor-properties label:text-is("${name}") + select, editor-properties label:text-is("${name}") + div input`).first() },
        async setProp(name, value) {
            const input = h.prop(name)
            if (!(await input.count())) return false
            await h.step(async () => {
                if ((await input.evaluate((e) => e.tagName)) === 'SELECT') await input.selectOption(value)
                else { await input.fill(String(value)); await input.press('Enter'); await input.evaluate((e) => e.dispatchEvent(new Event('change', { bubbles: true }))) }
            })
            return true
        },
        /** Open the YAML view and replace the whole file — the dead end every missing affordance falls back to. */
        async editYaml(mutate) {
            r.yaml = true
            const open = await h.button(ed, 'YAML', 'Show YAML')
            if (!open) { r.notes.push('no YAML view'); return false }
            await h.step(() => open.click())
            const ta = ed.locator('.source textarea, textarea.source').first()
            const text = await ta.inputValue()
            const next = mutate(text)
            await h.step(async () => { await ta.fill(next); await ta.evaluate((e) => e.dispatchEvent(new Event('change', { bubbles: true }))) })
            return true
        },
    }
    return h
}

const vcn = readDir(VCN)
const sw = readDir(SW)
const note = (h, n) => h.r.notes.push(n)
const status = (h, ok, partial) => { h.r.status = ok ? 'pass' : partial ? 'partial' : 'fail' }
const deepCount = (sel) => { let n = 0; const walk = (root) => { n += root.querySelectorAll(sel).length; for (const el of root.querySelectorAll('*')) if (el.shadowRoot) walk(el.shadowRoot) }; walk(document); return n }

// ---------------------------------------------------------------------------------------------
// T1 — open an existing form and trust its preview (fidelity against the running app)
await task('T1', 'Open an existing form; the preview matches the running app', { files: sw, path: 'person-edit.yaml', yaml: sw['person-edit.yaml'] }, async (h) => {
    await h.page.waitForTimeout(1500)
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    let real = { text: -1, select: -1 }
    try {
        await p.goto(`${values.app}/people/1/edit`); await p.waitForTimeout(4000)
        real = await p.evaluate(`(() => { const deepCount = ${deepCount.toString()}; return { text: deepCount('vaadin-text-field, vaadin-integer-field, vaadin-number-field'), select: deepCount('vaadin-select, vaadin-combo-box') } })()`)
    } catch (e) { note(h, `real app unavailable: ${e.message}`) } finally { await p.close() }
    const mine = {
        text: await h.canvasCount('vaadin-text-field, vaadin-integer-field, vaadin-number-field'),
        select: await h.canvasCount('vaadin-select, vaadin-combo-box'),
    }
    const text = await h.canvasText()
    const labels = ['Name', 'Gender', 'Birth year', 'Height (cm)', 'Mass (kg)', 'Hair', 'Eyes', 'Homeworld', 'Save']
    const shown = labels.filter((l) => text.includes(l)).length
    note(h, `labels ${shown}/${labels.length}; Lumo text fields ${mine.text} (app ${real.text}); selects ${mine.select} (app ${real.select})`)
    status(h, shown === labels.length && mine.text === real.text && mine.select === real.select, shown === labels.length)
})

// T2 — a listing over a REST source, with columns and a filter, from an empty page
await task('T2', 'Create a listing over a REST source with columns and a filter', { files: vcn, path: 'new-list.yaml', yaml: '' }, async (h) => {
    const { ed } = h
    const tpl = await h.button(ed, 'Templates')
    if (tpl) { await h.step(() => tpl.click()); const use = ed.locator('.tg-card', { hasText: 'Listing' }).locator('button'); await h.step(() => use.click()) }
    else note(h, 'no templates')
    await h.page.waitForTimeout(800)
    // the data source
    await h.layer('Listing')
    if (!(await h.setProp('rowsSource', 'vcns'))) {
        note(h, 'no editor for rowsSource → YAML')
        await h.editYaml((t) => t + 'rowsSource:\n  ref: vcns\n')
    }
    // columns: re-point the template's two, add a third
    const addCol = await h.button(ed.locator('editor-properties'), '+ column')
    if (addCol) {
        await h.layer('GridColumn', 'name'); await h.setProp('id', 'displayName'); await h.setProp('label', 'Name')
        await h.layer('GridColumn', 'status'); await h.setProp('id', 'lifecycleState'); await h.setProp('label', 'State')
        await h.layer('Listing'); await h.step(() => h.button(ed.locator('editor-properties'), '+ column').then((b) => b.click()))
        await h.setProp('id', 'cidrBlock'); await h.setProp('label', 'CIDR')
        await h.layer('Listing'); await h.step(() => h.button(ed.locator('editor-properties'), '+ filter').then((b) => b.click()))
        await h.setProp('id', 'compartment'); await h.setProp('label', 'Compartment')
        await h.setProp('stereotype', 'select'); await h.setProp('options', 'prod, dev, sandbox')
    } else {
        note(h, 'columns/filters not reachable in the UI → YAML')
        await h.editYaml(() => `type: Listing
title: Items
searchable: true
rowsSource: {ref: vcns}
columns:
  - {type: GridColumn, id: displayName, label: Name}
  - {type: GridColumn, id: lifecycleState, label: State}
  - {type: GridColumn, id: cidrBlock, label: CIDR}
filters:
  - type: FormField
    id: compartment
    label: Compartment
    stereotype: select
    options: [{value: prod, label: prod}, {value: dev, label: dev}, {value: sandbox, label: sandbox}]
`)
    }
    await h.page.waitForTimeout(2000)
    const y = await h.saved()
    const text = await h.canvasText()
    const yamlOk = y?.rowsSource?.ref === 'vcns' && y?.columns?.map((c) => c.id).join() === 'displayName,lifecycleState,cidrBlock' && y?.filters?.[0]?.options?.length === 3
    const rows = text.includes('vcn-dev-01')
    note(h, `yaml ${yamlOk ? 'complete' : 'incomplete'}; canvas rows ${rows ? 'shown' : 'NOT shown'}`)
    status(h, yamlOk && rows && !h.r.yaml, yamlOk)
})

// T3 — a form with a section and validation
await task('T3', 'Build a form with a section and a required field', { files: vcn, path: 'new-form.yaml', yaml: '' }, async (h) => {
    const { ed } = h
    const tpl = await h.button(ed, 'Templates')
    await h.step(() => tpl.click())
    await h.step(() => ed.locator('.tg-card', { hasText: 'Form' }).first().locator('button').click())
    await h.page.waitForTimeout(800)
    // a section: drop a FormSection from the palette into the page
    await h.step(() => ed.locator('.left-tabs button', { hasText: 'Insert' }).click())
    const search = ed.locator('editor-palette input').first()
    await h.step(() => search.fill('FormSection'))
    const item = ed.locator('editor-palette button, editor-palette .item').filter({ hasText: /^FormSection$/ }).first()
    if (await item.count()) await h.step(() => item.click()); else note(h, 'FormSection not in palette')
    await h.step(() => ed.locator('.left-tabs button', { hasText: 'Layers' }).click())
    await h.setProp('title', 'Contact')
    // validation: make a field required
    const field = (await h.layer('FormField', 'email')) || (await h.layer('FormField', 'name'))
    const req = ed.locator('editor-properties .check', { hasText: 'required' }).locator('input')
    if (field && await req.count()) { if (!(await req.isChecked())) await h.step(() => req.check()) }
    await h.page.waitForTimeout(1500)
    const y = await h.savedYaml()
    const hasSection = /FormSection/.test(y)
    const required = (y.match(/required: true/g) ?? []).length >= 1
    const marker = (await h.canvasCount('[required], [has-required]')) > 0 || (await h.canvasText()).includes('*')
    note(h, `section ${hasSection}; required ${required}; required marker on canvas ${marker}`)
    status(h, hasSection && required && marker, hasSection && required)
})

// T4 — edit an existing page's layout; the file keeps its comments and only the edit changes
await task('T4', 'Edit an existing page: reorder a field, relabel one; the file stays reviewable', { files: sw, path: 'person-edit.yaml', yaml: sw['person-edit.yaml'] }, async (h) => {
    const before = sw['person-edit.yaml']
    await h.layer('FormField', 'gender')
    await h.setProp('label', 'Sex')
    await h.layer('FormField', 'homeworldId')
    const up = h.ed.locator('editor-properties button', { hasText: 'Up' }).first()
    await h.step(() => up.click())
    await h.page.waitForTimeout(800)
    const after = await h.savedYaml()
    const comments = (t) => t.split('\n').filter((l) => l.trim().startsWith('#')).length
    const v = parse(after)
    const fields = v?.content?.[0]?.content?.map((f) => f.id) ?? []
    const edited = fields.indexOf('homeworldId') === fields.length - 2 && JSON.stringify(v).includes('"Sex"')
    const a = before.split('\n'), b = after.split('\n')
    const changed = b.filter((l, i) => l !== a[i]).length + Math.abs(a.length - b.length)
    note(h, `edits applied ${edited}; comment lines ${comments(after)}/${comments(before)}; lines changed ${changed} of ${a.length}`)
    status(h, edited && comments(after) === comments(before) && changed <= 30, edited)
})

// T5 — a button that calls a REST endpoint and shows a toast
await task('T5', 'Add a button that calls a REST endpoint and shows a toast', { files: vcn, path: 'vcn.yaml', yaml: vcn['vcn.yaml'] }, async (h) => {
    const { ed } = h
    const actionsTab = await h.button(ed.locator('.dock-tabs'), 'Actions')
    if (actionsTab) {
        await h.step(() => actionsTab.click())
        h.answer('refresh')
        await h.step(() => h.button(ed.locator('.dock-body'), '+ REST action').then((b) => b.click()))
        const calls = ed.locator('.act-form select').first()
        await h.step(() => calls.selectOption('vcn'))
        const toast = ed.locator('.act-form input[placeholder^="Saved"]')
        await h.step(async () => { await toast.fill('Refreshed'); await toast.evaluate((e) => e.dispatchEvent(new Event('change', { bubbles: true }))) })
        const add = await h.button(ed.locator('.act-form'), 'Add a button')
        if (add) await h.step(() => add.click())
    } else {
        const qs = await h.button(ed, 'Quick Start')
        await h.step(() => qs.click())
        h.answer('refresh', 'Refresh')
        await h.step(() => h.button(ed, 'Wire an action').then((b) => b.click()))
        note(h, 'the action stub points at api.example.com; source + toast need YAML')
        await h.editYaml((t) => t.replace(/source:\n(\s+)url: https:\/\/api\.example\.com\/resource\n\s+method: POST/, 'source:\n$1ref: vcn').replace('successMessage: Done', 'successMessage: Refreshed'))
    }
    await h.page.waitForTimeout(800)
    const v = await h.saved()
    const actions = v?.actions ?? v?.layout?.actions ?? []
    const a = actions.find((x) => x.id === 'refresh')
    const okAction = a?.restAction?.source?.ref === 'vcn' && a?.restAction?.successMessage === 'Refreshed'
    const button = JSON.stringify(v).includes('"actionId":"refresh"')
    const shape = v?.type === 'Form' // the definition keeps its authored shape
    note(h, `action ${okAction}; button ${button}; file shape kept ${shape}`)
    status(h, okAction && button && shape && !h.r.yaml, okAction && button)
})

// T6 — rename a field and keep its bindings
await task('T6', 'Rename a bound field and keep every reference', { files: vcn, path: 'vcns.yaml', yaml: vcn['vcns.yaml'] }, async (h) => {
    await h.layer('GridColumn', 'compartment')
    const rename = await h.button(h.ed.locator('editor-properties'), 'Rename')
    if (rename) { h.answer('zone'); await h.step(() => rename.click()) }
    else { note(h, 'no rename — only the id text field'); await h.setProp('id', 'zone') }
    await h.page.waitForTimeout(800)
    const v = await h.saved()
    const col = v?.columns?.some((c) => c.id === 'zone')
    const filter = v?.filters?.some((f) => f.id === 'zone')
    const stale = JSON.stringify(v).includes('compartment"')
    note(h, `column ${col}; filter ${filter}; stale references ${stale}`)
    status(h, col && filter && !stale, col)
})

// T7 — undo / redo
await task('T7', 'Undo and redo an edit', { files: sw, path: 'person-edit.yaml', yaml: sw['person-edit.yaml'] }, async (h) => {
    await h.layer('FormField', 'mass')
    await h.step(() => h.page.keyboard.press('Delete'))
    const removed = !(await h.savedYaml()).includes('id: mass')
    await h.step(() => h.page.keyboard.press('Meta+z'))
    const back = (await h.savedYaml()).includes('id: mass')
    await h.step(() => h.page.keyboard.press('Meta+Shift+z'))
    const again = !(await h.savedYaml()).includes('id: mass')
    note(h, `delete ${removed}; undo restores ${back}; redo re-applies ${again}`)
    status(h, removed && back && again, false)
})

// T8 — preview in both web renderers, and with no backend at all
await task('T8', 'Preview in Vaadin and DS-neutral renderers, and offline', { files: sw, path: 'person-edit.yaml', yaml: sw['person-edit.yaml'] }, async (h) => {
    const sel = h.ed.locator('select.renderer')
    let vaadin = await h.canvasCount('vaadin-text-field')
    let neutral = -1
    if (await sel.count()) {
        await h.step(() => sel.selectOption('neutral')); await h.page.waitForTimeout(1500)
        neutral = await h.canvasCount('input')
        await h.step(() => sel.selectOption('vaadin')); await h.page.waitForTimeout(1500)
        vaadin = await h.canvasCount('vaadin-text-field')
    } else note(h, 'no renderer choice (DS-neutral only)')
    const src = h.ed.locator('.preview-source select')
    await h.step(() => src.selectOption('client')); await h.page.waitForTimeout(1500)
    const offline = (await h.canvasText()).includes('Birth year')
    note(h, `Vaadin fields ${vaadin}; neutral inputs ${neutral}; offline render ${offline}`)
    status(h, vaadin > 0 && neutral > 0 && offline, offline || vaadin > 0)
})

// T9 — a master with routed page tabs (routes.yaml), keeping the rest of the table intact
await task('T9', 'Add a master route whose tabs are pages (children + defaultChild)', { files: vcn, path: 'routes.yaml', yaml: vcn['routes.yaml'] }, async (h) => {
    const before = parse(vcn['routes.yaml'])
    const master = await h.button(h.ed.locator('routes-editor'), '+ Master with routed tabs')
    if (master) { h.answer('regions/:id', 'overview, quotas'); await h.step(() => master.click()) }
    else {
        note(h, 'no children/defaultChild in the routes table → YAML')
        // the table itself: add a route the way it allows, then YAML for the nesting
        const add = await h.button(h.ed.locator('routes-editor'), '+ Add route')
        await h.step(() => add.click())
        h.r.yaml = true
        note(h, 'a YAML text view is not available for route files')
    }
    await h.page.waitForTimeout(800)
    const v = await h.saved()
    const m = v?.routes?.find((r) => r.route === 'regions/:id')
    const tabs = m?.children?.map((c) => c.route).join() === 'overview,quotas' && m?.defaultChild === 'overview'
    const lost = before.routes.filter((r) => r.data && !v?.routes?.some((x) => x.route === r.route && JSON.stringify(x.data) === JSON.stringify(r.data))).length
    note(h, `master+tabs ${tabs}; existing routes that lost their data: ${lost}`)
    status(h, tabs && lost === 0, lost === 0)
})

// T10 — create a REST source (the catalogue the listings and actions name)
await task('T10', 'Declare a new REST source in sources.yaml', { files: vcn, path: 'sources.yaml', yaml: vcn['sources.yaml'] }, async (h) => {
    const add = await h.button(h.ed.locator('sources-editor'), '+ Add source')
    if (add) {
        await h.step(() => add.click())
        const card = h.ed.locator('sources-editor .card').last()
        await h.step(async () => { const i = card.locator('input.name'); await i.fill('regions'); await i.evaluate((e) => e.dispatchEvent(new Event('change', { bubbles: true }))) })
        await h.step(async () => { const t = card.locator('textarea'); await t.fill('http://localhost:8790/api/regions'); await t.evaluate((e) => e.dispatchEvent(new Event('change', { bubbles: true }))) })
    } else note(h, 'sources.yaml opens as a page canvas — no sources editor')
    await h.page.waitForTimeout(600)
    const text = await h.savedYaml()
    const v = parse(text || '{}')
    const added = v?.sources?.some((s) => s.name === 'regions' && s.source?.url?.includes('/api/regions'))
    const kept = v?.sources?.length === 5 && text.includes('# The whole collection')
    note(h, `added ${added}; others + comments kept ${kept}`)
    status(h, added && kept, added)
})

// T11 — the app shell: title and a menu entry
await task('T11', 'Edit the app shell: title and a new menu entry', { files: vcn, path: 'app.yaml', yaml: vcn['app.yaml'] }, async (h) => {
    const app = h.ed.locator('app-editor')
    const title = app.locator('label', { hasText: /^title$/i }).locator('xpath=following-sibling::input[1]')
    if (await title.count()) await h.step(async () => { await title.fill('Cloud console'); await title.evaluate((e) => e.dispatchEvent(new Event('change', { bubbles: true }))) })
    const add = await h.button(app, '+ Link', '+ link', 'Add link')
    if (add) await h.step(() => add.click())
    await h.page.waitForTimeout(600)
    const text = await h.savedYaml()
    const v = parse(text || '{}')
    const titled = v?.title === 'Cloud console'
    const linked = (v?.menu?.length ?? 0) > (parse(vcn['app.yaml'])?.menu?.length ?? 0)
    const comments = text.split('\n').filter((l) => l.trim().startsWith('#')).length >= vcn['app.yaml'].split('\n').filter((l) => l.trim().startsWith('#')).length
    note(h, `title ${titled}; menu entry ${linked}; comments kept ${comments}`)
    status(h, titled && linked && comments, titled || linked)
})

// T12 — no backend reachable: the author still sees the page
await task('T12', 'Backend down: a classless page still previews', { files: vcn, path: 'vcns.yaml', yaml: vcn['vcns.yaml'], mode: 'remote', baseUrl: 'http://localhost:1' }, async (h) => {
    await h.page.waitForTimeout(2500)
    const text = await h.canvasText()
    const shown = text.includes('Virtual cloud networks')
    const rows = text.includes('vcn-dev-01')
    const told = /offline|did not answer/i.test(await h.ed.evaluate((e) => e.shadowRoot.textContent + (e.shadowRoot.querySelector('editor-canvas')?.shadowRoot?.textContent ?? '')))
    note(h, `page shown ${shown}; rows ${rows}; the author is told why ${told}`)
    status(h, shown && rows && told, shown)
})

await browser.close()
fs.writeFileSync(path.join(values.out, `${values.label}-results.json`), JSON.stringify(results, null, 2))
const passed = results.filter((r) => r.status === 'pass').length
console.log(`\n${values.label}: ${passed}/${results.length} pass, ${results.filter((r) => r.status === 'partial').length} partial, ${results.filter((r) => r.yaml).length} needed YAML`)
