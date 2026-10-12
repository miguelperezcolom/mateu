/**
 * Synthetic users + task metrics for the UX review (doc: ux-patterns/how-ux-is-evaluated.md).
 *
 * Each TASK is written as a person would describe the goal — "press New", "type 'Write report'
 * into Title", "the list shows 'Write report'" — using only the words on the screen, never a CSS
 * selector. Each PROFILE resolves those intents with its own means, the way that kind of user
 * would, and logs what it cost:
 *
 *  - mouse     first-time mouse user at 1440px: finds the control by its visible text/label;
 *              scrolling to reach it, an ambiguous match or a click that changes nothing are
 *              HESITATIONS; a dead end is a target it cannot find at all.
 *  - phone     the same at 390px (scrolling, sideways overflow, targets under 24px).
 *  - keyboard  keyboard-only expert: Tab / Shift+Tab to the control (each press counted), Enter or
 *              Space to activate; a control it cannot reach by Tab in 60 presses is a dead end.
 *  - sr        screen-reader user: navigates by the ACCESSIBILITY TREE only (role + accessible
 *              name); an intent whose control has no matching role/name is a dead end even if a
 *              sighted user can see it.
 *
 * Metrics per task × profile: completed, steps, clicks, keystrokes, tab presses, scrolls,
 * hesitations, recoverable errors (error toasts / invalid fields provoked), dead ends, ms.
 * Saved as JSON so a fix is measured before and after:
 *
 *   node ux/tasks.mjs --base http://localhost:19701 --out before.json [--profiles mouse,keyboard] [--tasks T1,T4]
 */
import { chromium } from 'playwright'
import fs from 'node:fs'

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : 'true'])
    return acc
}, []))
const base = args.base ?? 'http://localhost:8080'
const out = args.out ?? 'ux-tasks.json'
const profiles = (args.profiles ?? 'mouse,phone,keyboard,sr').split(',')
const onlyTasks = args.tasks ? args.tasks.split(',') : null
const stamp = Date.now().toString(36).slice(-4)

// ── the tasks (goal vocabulary only) ─────────────────────────────────────────────────────────────
const TASKS = [
    {
        id: 'T1', name: 'Create a record', route: '/full-crud',
        steps: [
            { press: 'New' },
            { type: ['Title', `Write report ${stamp}`] },
            { type: ['Priority', '2'] },
            { press: 'Save' },
            { expect: `Write report ${stamp}` },
        ],
    },
    {
        id: 'T2', name: 'Find a record and edit it', route: '/full-crud',
        steps: [
            { type: ['Search', 'Gamma'], enter: true },
            // a first-time user opens the record by its TITLE (the thing they are looking for)
            { open: 'Task Gamma', fallback: 't3' },
            { press: 'Edit' },
            { type: ['Description', `Edited ${stamp}`] },
            { press: 'Save' },
            { expect: `Edited ${stamp}` },
        ],
    },
    {
        id: 'T3', name: 'Delete a record (error prevention)', route: '/full-crud',
        steps: [
            // the goal names the action: the most visible "Delete" is tried first
            { press: 'Delete', probe: true },
            { check: 'Select Row', nth: 0 },
            { press: 'Delete' },
            { confirm: true },
            { expectCountChange: true },
        ],
    },
    {
        id: 'T4', name: 'Complete a wizard (with a validation error)', route: '/wizard',
        steps: [
            { press: 'Next', probe: true },   // the classic: Next before filling in
            { type: ['Name', 'Ada'] },
            { type: ['Email', 'ada@example.com'] },
            { press: 'Next' },
            { type: ['Street', 'Main St 1'] },
            { type: ['City', 'Palma'] },
            { pressAny: ['Finish', 'Complete', 'Next', 'Done'] },
            { expect: 'Welcome, Ada' },
        ],
    },
    {
        id: 'T5', name: 'Recover from a validation error', route: '/validation',
        steps: [
            { press: 'Validate', probe: true },
            { focusLandsOnInvalid: true },
            { type: ['Required text', 'hello'] },
            { type: ['Ranged int', '5'] },
            { type: ['Required date', '1/1/2026'], enter: true },
            { press: 'Validate' },
            { expectNoError: true },
        ],
    },
    {
        id: 'T6', name: 'Find a screen through the menu', route: '/app',
        steps: [
            { press: 'Section 2', menu: true },
            { expectUrl: /section2|section-2/i },
        ],
    },
    {
        id: 'T7', name: 'Filter a listing', route: '/catalog-filterable',
        steps: [
            { type: ['Search', 'Engineering'], enter: true },
            { expectRows: 2 },
        ],
    },
]

// ── helpers evaluated in the page ────────────────────────────────────────────────────────────────
const deepActive = () => {
    let a = document.activeElement
    while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement
    return a
}
const nameOf = (el) => {
    if (!el) return ''
    const aria = el.getAttribute && (el.getAttribute('aria-label') || '')
    if (aria) return aria.trim()
    const labelledby = el.getAttribute && el.getAttribute('aria-labelledby')
    if (labelledby) {
        const root = el.getRootNode()
        const t = labelledby.split(/\s+/).map((id) => root.getElementById?.(id)?.textContent ?? '').join(' ').trim()
        if (t) return t
    }
    if (el.labels && el.labels.length) return [...el.labels].map((l) => l.textContent).join(' ').trim()
    // vaadin field input: the host's label
    const host = el.getRootNode && el.getRootNode().host
    const field = el.closest && el.closest('[label]')
    if (field && field.getAttribute('label')) return field.getAttribute('label').trim()
    if (host && host.getAttribute && host.getAttribute('label')) return host.getAttribute('label').trim()
    if (el.placeholder) return el.placeholder
    return (el.textContent || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 80)
}
const errorsShown = () => {
    // error toasts + invalid fields, across shadow roots
    let n = 0
    const walk = (r) => {
        for (const e of r.querySelectorAll('*')) {
            if (e.hasAttribute && e.hasAttribute('invalid')) n++
            if (e.tagName === 'VAADIN-NOTIFICATION-CARD' && /error/.test(e.getAttribute('theme') || '')) n++
            if (e.shadowRoot) walk(e.shadowRoot)
        }
    }
    walk(document)
    return n
}

/** The listing's own count ("3 items") — vaadin-grid recycles its row elements, so they are no count. */
const itemCount = async (page) => page.evaluate(() => {
    // the data rows actually on screen, across shadow roots (recycled rows are hidden)
    let n = 0
    const walk = (r) => {
        for (const e of r.querySelectorAll('tr[part~="row"], tr.row, tbody tr')) {
            if (e.hidden || e.closest('thead')) continue
            const rect = e.getBoundingClientRect()
            if (rect.height > 0 && e.querySelector('[part~="body-cell"], td') && !/empty-state/.test(e.innerHTML)) n++
        }
        for (const e of r.querySelectorAll('*')) if (e.shadowRoot) walk(e.shadowRoot)
    }
    walk(document)
    return n
})

const listedCount = async (page) => page.evaluate(() => {
    const walk = (r) => {
        for (const e of r.querySelectorAll('*')) {
            if (e.childElementCount === 0 && /^\s*\d+ items?\s*$/.test(e.textContent || '') && e.getBoundingClientRect().height > 0) return parseInt(e.textContent, 10)
            if (e.shadowRoot) { const x = walk(e.shadowRoot); if (x !== null) return x }
        }
        return null
    }
    return walk(document) ?? -1
})

class Run {
    constructor(page, profile) {
        this.page = page
        this.profile = profile
        this.m = { completed: false, steps: 0, clicks: 0, keystrokes: 0, tabs: 0, scrolls: 0, hesitations: [], errors: 0, deadEnds: [], ms: 0 }
    }
    hesitate(what) { this.m.hesitations.push(what) }
    async errors() { return this.page.evaluate(`(${errorsShown})()`) }

    /** The control a user of this profile would act on, by its name. */
    async find(name, kind) {
        const p = this.page
        if (this.profile === 'sr') {
            const roles = kind === 'field' ? ['textbox', 'spinbutton', 'combobox', 'searchbox'] : kind === 'check' ? ['checkbox'] : ['button', 'link', 'menuitem', 'tab', 'option', 'gridcell', 'row']
            for (const role of roles) {
                const l = p.getByRole(role, { name, exact: kind !== 'row' })
                if (await l.count()) return l.first()
            }
            return null
        }
        const cands = kind === 'field'
            ? [p.getByLabel(name, { exact: true }), p.getByPlaceholder(name), p.getByRole('textbox', { name })]
            : kind === 'check'
                ? [p.getByRole('checkbox', { name })]
                : [p.getByRole('button', { name, exact: true }), p.getByRole('link', { name, exact: true }), p.getByRole('menuitem', { name }), p.getByRole('tab', { name }), p.getByText(name, { exact: true })]
        for (const l of cands) {
            const n = await l.count()
            if (n) {
                // only VISIBLE ones count for a sighted user
                for (let i = 0; i < n; i++) if (await l.nth(i).isVisible()) {
                    if (n > 1 && kind !== 'check') this.hesitate(`ambiguous "${name}" (${n} matches)`)
                    return l.nth(i)
                }
            }
        }
        return null
    }

    async reach(loc, name) {
        if (this.profile === 'keyboard') {
            const target = await loc.elementHandle()
            for (let i = 0; i < 60; i++) {
                const hit = await this.page.evaluate(([t, deepActiveSrc]) => {
                    const deep = new Function(`return (${deepActiveSrc})()`)()
                    let a = deep
                    while (a) { if (a === t) return true; a = a.parentNode || (a.getRootNode && a.getRootNode().host) }
                    return false
                }, [target, deepActive.toString()]).catch(() => false)
                if (hit) return true
                // inside a grid the expert uses the ARROWS (WAI-ARIA grid pattern), not Tab
                const inGrid = await this.page.evaluate(([t0, wanted]) => {
                    let a = document.activeElement
                    while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement
                    const grid = a && a.getRootNode && a.getRootNode().host
                    if (!grid || grid.tagName !== 'VAADIN-GRID') return null
                    // is the target in this grid, and where is it relative to the focused cell?
                    const t = grid.contains(t0) ? t0
                        : [...grid.querySelectorAll('vaadin-grid-cell-content')].find((c) => (c.textContent || '').trim() === wanted)
                    if (!t) return null
                    const slot = a.querySelector && a.querySelector('slot')
                    const content = slot && slot.assignedNodes()[0]
                    const tt = (t.textContent || '').trim()
                    if (content && (content === t || content.contains(t) || (tt && (content.textContent || '').trim() === tt))) return 'here'
                    const tr = t.getBoundingClientRect(), ar = a.getBoundingClientRect()
                    return tr.top > ar.bottom - 2 ? 'ArrowDown' : tr.bottom < ar.top + 2 ? 'ArrowUp' : tr.left > ar.right - 2 ? 'ArrowRight' : 'ArrowLeft'
                }, [target, name]).catch(() => null)
                if (inGrid === 'here') return true
                if (inGrid) { await this.page.keyboard.press(inGrid); this.m.keystrokes++; continue }
                await this.page.keyboard.press('Tab'); this.m.tabs++; this.m.keystrokes++
            }
            this.m.deadEnds.push(`keyboard cannot reach "${name}"`)
            return false
        }
        // sighted: is it on screen already, or does the user have to scroll for it?
        const inView = await loc.evaluate((e) => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth }).catch(() => true)
        if (!inView) { this.m.scrolls++; this.hesitate(`scrolled to reach "${name}"`) }
        const box = await loc.boundingBox().catch(() => null)
        if (box && this.profile === 'phone' && (box.width < 24 || box.height < 24)) this.hesitate(`small target "${name}" ${Math.round(box.width)}x${Math.round(box.height)}`)
        return true
    }

    async activate(loc) {
        if (this.profile === 'keyboard') { await this.page.keyboard.press('Enter'); this.m.keystrokes++ }
        else { await loc.click({ timeout: 5000 }); this.m.clicks++ }
    }

    async press(name, opts = {}) {
        const loc = await this.find(name, 'button')
        if (!loc) { this.m.deadEnds.push(`no control "${name}"`); return false }
        const disabled = await loc.evaluate((e) => e.hasAttribute('disabled') || e.getAttribute('aria-disabled') === 'true').catch(() => false)
        if (disabled) { this.hesitate(`"${name}" is disabled (prevented)`); return 'disabled' }
        if (!(await this.reach(loc, name))) return false
        const before = await this.errors()
        await this.activate(loc)
        await this.page.waitForTimeout(900)
        const after = await this.errors()
        if (after > before) this.m.errors++
        return true
    }

    async type(label, text, enter) {
        const loc = await this.find(label, 'field')
        if (!loc) { this.m.deadEnds.push(`no field "${label}"`); return false }
        if (!(await this.reach(loc, label))) return false
        if (this.profile !== 'keyboard') { await loc.click(); this.m.clicks++ }
        await loc.fill('')
        await this.page.keyboard.type(text); this.m.keystrokes += text.length
        if (enter) {
            await this.page.keyboard.press('Enter'); this.m.keystrokes++
            // a phone date picker opens FULL SCREEN and keeps the page inert until it is closed
            if (await this.page.locator('vaadin-date-picker-overlay[opened]').count()) {
                this.hesitate(`a full-screen picker stayed open after typing "${label}"`)
                await this.page.keyboard.press('Escape'); this.m.keystrokes++
            }
        }
        else { await this.page.keyboard.press('Tab'); this.m.keystrokes++ }
        await this.page.waitForTimeout(500)
        return true
    }
}

const runTask = async (browser, task, profile) => {
    const phone = profile === 'phone'
    const ctx = await browser.newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 }, hasTouch: phone })
    const page = await ctx.newPage()
    const r = new Run(page, profile)
    const t0 = Date.now()
    try {
        await page.goto(base + task.route)
        await page.waitForSelector('mateu-page, mateu-app, mateu-component', { timeout: 15000 }).catch(() => {})
        await page.waitForTimeout(1500)
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)
        if (overflow) r.hesitate('page scrolls sideways')
        let rowsBefore = null
        let ok = true
        for (const s of task.steps) {
            r.m.steps++
            if (s.press) {
                const res = await r.press(s.press)
                if (!res && !s.probe) { ok = false; break }
            } else if (s.pressAny) {
                let done = false
                for (const n of s.pressAny) { if (await r.find(n, 'button')) { done = await r.press(n); break } }
                if (!done) { r.m.deadEnds.push(`none of ${s.pressAny}`); ok = false; break }
            } else if (s.type) {
                if (!(await r.type(s.type[0], s.type[1], s.enter))) { ok = false; break }
            } else if (s.open) {
                rowsBefore = page.url()
                const loc = await r.find(s.open, 'row')
                if (loc && await r.reach(loc, s.open)) {
                    await r.activate(loc); await page.waitForTimeout(1200)
                }
                const moved = await page.getByRole('button', { name: 'Edit' }).count()
                if (!moved) {
                    r.hesitate(`opening "${s.open}" did nothing — looked for another way in`)
                    const alt = await r.find(s.fallback, 'button')
                    if (!alt || !(await r.reach(alt, s.fallback))) { r.m.deadEnds.push(`cannot open "${s.open}"`); ok = false; break }
                    await r.activate(alt); await page.waitForTimeout(1200)
                }
            } else if (s.check) {
                // visible rows (vaadin-grid recycles row elements, so only VISIBLE ones count)
                rowsBefore = await listedCount(page)
                r.checkName = s.check
                const boxes = page.getByRole('checkbox', { name: s.check })
                if (!(await boxes.count())) { r.m.deadEnds.push(`no "${s.check}"`); ok = false; break }
                const box = boxes.nth(s.nth ?? 0)
                if (!(await r.reach(box, s.check))) { ok = false; break }
                if (profile === 'keyboard') { await page.keyboard.press('Space'); r.m.keystrokes++ } else { await box.click(); r.m.clicks++ }
                await page.waitForTimeout(500)
            } else if (s.confirm) {
                await page.waitForTimeout(600)
                // the confirmation is the LAST visible button with an affirmative name (the dialog is
                // appended at the end of the body); the keyboard user is already inside it, or not
                const dialog = page.getByRole('alertdialog')
                const scope = (await dialog.count()) ? dialog.last() : page
                for (const n of ['Yes', 'Delete', 'OK', 'Confirm']) {
                    const all = scope.getByRole('button', { name: n, exact: true })
                    const k = await all.count()
                    if (k > (n === 'Delete' && scope === page ? 1 : 0)) {
                        const btn = all.nth(k - 1)
                        if (!(await btn.isVisible())) continue
                        if (profile === 'keyboard') {
                            const inside = await btn.evaluate((b) => { const d = b.closest('[role=alertdialog],[role=dialog]'); return !!d && d.contains(document.activeElement) })
                            if (!inside) r.hesitate('confirmation opened without taking the focus')
                            await btn.focus(); await page.keyboard.press('Enter'); r.m.keystrokes++
                        } else { await btn.click(); r.m.clicks++ }
                        r.m.steps++
                        break
                    }
                }
                await page.waitForTimeout(1200)
            } else if (s.expect) {
                await page.waitForTimeout(800)
                if (!(await page.getByText(s.expect).count())) { r.m.deadEnds.push(`did not see "${s.expect}"`); ok = false; break }
            } else if (s.expectCountChange) {
                // the listing's own total ("6 items") went down — read on screen, then after a reload
                await page.waitForTimeout(1500)
                const onScreen = await listedCount(page)
                await page.reload(); await page.waitForTimeout(2500)
                const reloaded = await listedCount(page)
                if (reloaded >= rowsBefore) { r.m.deadEnds.push(`not deleted (${rowsBefore} → ${reloaded})`); ok = false; break }
            } else if (s.expectRows) {
                await page.waitForTimeout(800)
                const n = await itemCount(page)
                if (n !== s.expectRows) { r.m.deadEnds.push(`expected ${s.expectRows} rows, saw ${n}`); ok = false; break }
            } else if (s.expectUrl) {
                await page.waitForTimeout(800)
                if (!s.expectUrl.test(page.url())) { r.m.deadEnds.push(`url ${page.url()}`); ok = false; break }
            } else if (s.expectNoError) {
                await page.waitForTimeout(800)
                const invalid = await page.evaluate(() => { let n = 0; const w = (r) => { for (const e of r.querySelectorAll('[invalid]')) n++; for (const e of r.querySelectorAll('*')) if (e.shadowRoot) w(e.shadowRoot) }; w(document); return n })
                if (invalid) { r.m.deadEnds.push(`${invalid} field(s) still invalid`); ok = false; break }
            } else if (s.focusLandsOnInvalid) {
                await page.waitForTimeout(300)
                const onInvalid = await page.evaluate(`(() => { let a = (${deepActive})(); while (a) { if (a.hasAttribute && a.hasAttribute('invalid')) return true; a = a.parentNode || (a.getRootNode && a.getRootNode().host) } return false })()`)
                if (!onInvalid) r.hesitate('focus did not move to the rejected field')
            }
        }
        r.m.completed = ok
        if (!ok && args.shots) await page.screenshot({ path: `${args.shots}/${task.id}-${profile}.png` }).catch(() => {})
    } catch (e) {
        r.m.deadEnds.push('exception: ' + String(e.message).split('\n').slice(0, 6).join(' / '))
    }
    r.m.ms = Date.now() - t0
    await ctx.close()
    return r.m
}

const browser = await chromium.launch()
const results = []
for (const task of TASKS) {
    if (onlyTasks && !onlyTasks.includes(task.id)) continue
    for (const profile of profiles) {
        const m = await runTask(browser, task, profile)
        results.push({ task: task.id, name: task.name, profile, ...m })
        console.log(`${task.id} ${profile.padEnd(8)} ${m.completed ? 'OK  ' : 'FAIL'} steps=${m.steps} clicks=${m.clicks} keys=${m.keystrokes} tabs=${m.tabs} scrolls=${m.scrolls} errors=${m.errors} hes=${m.hesitations.length} dead=${m.deadEnds.join('; ')} ${m.hesitations.length ? '| ' + m.hesitations.join('; ') : ''}`)
    }
}
await browser.close()
fs.writeFileSync(out, JSON.stringify({ base, at: new Date().toISOString(), results }, null, 1))
