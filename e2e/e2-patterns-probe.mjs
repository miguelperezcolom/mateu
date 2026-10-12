#!/usr/bin/env node
// Real-browser probe of the four E2 patterns on the Vaadin renderer, against demo-admin-panel:
//   node e2-patterns-probe.mjs [baseUrl] [shotsDir]
// 1. compare & merge (/record-merge-demo)
// 2. app shortcuts + "?" + quick launch (the root app, Home2, and /e2-demo)
// 3. live header values across tabs AND sessions (/e2-business-day publishes)
// 4. the idle-session warning (/e2-demo, ≈ 70 s; SKIP_IDLE=1 skips it)
// Exits non-zero when a check fails. Screenshots go to shotsDir.
import { chromium } from 'playwright'
import fs from 'node:fs'

const base = process.argv[2] ?? 'http://localhost:8595'
const shots = process.argv[3] ?? './e2-shots'
const skipIdle = process.env.SKIP_IDLE === '1'
fs.mkdirSync(shots, { recursive: true })

const results = []
const check = (name, ok, detail = '') => {
    results.push({ name, ok })
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`)
}
const settle = (page, ms = 1200) => page.waitForTimeout(ms)
const headerText = async (page) => (await page.locator('mateu-header-values .value').allInnerTexts()).join(' | ').replace(/\s+/g, ' ')
const dateOf = (text) => text.match(/\d+ \w{3} \d{4}/)?.[0] ?? ''
const blur = (page) => page.mouse.click(5, 700)

const browser = await chromium.launch()
try {
    // ---- 1. compare & merge -------------------------------------------------------------
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    const page = await ctx.newPage()
    await page.goto(base + '/record-merge-demo')
    await page.waitForSelector('mateu-record-merge')
    await settle(page)
    await page.screenshot({ path: `${shots}/vaadin-merge.png`, fullPage: true })
    const differing = await page.locator('mateu-record-merge tr.differs').count()
    check('merge: differing rows are highlighted', differing === 5, `${differing} rows`)
    await page.getByLabel('Use value from Profile 3388 for Last name').check()
    await page.getByRole('textbox', { name: 'Custom value for Phone' }).fill('+34 611 000 000')
    await page.getByLabel('Show only differences').check()
    await settle(page, 400)
    const shown = await page.locator('mateu-record-merge tbody tr').count()
    check('merge: "Show only differences" hides equal rows', shown === 5, `${shown} rows`)
    await page.screenshot({ path: `${shots}/vaadin-merge-picked.png`, fullPage: true })
    await page.getByRole('button', { name: 'Merge into profile 1021' }).click()
    await settle(page)
    const notice = await page.locator('mateu-notice').evaluateAll((els) => els.map((e) => (e.shadowRoot?.textContent ?? '') + e.textContent).join(' '))
    check('merge: the action receives the picks', notice.includes('lastName=Garcia') && notice.includes('+34 611 000 000'), notice.slice(0, 140))
    const bothFirstName = await Promise.all(['1021', '3388'].map((r) => page.getByLabel(`Use value from Profile ${r} for First name`).isChecked()))
    check('merge: every row keeps exactly one pick after a re-render', bothFirstName.filter(Boolean).length === 1, String(bothFirstName))
    await page.screenshot({ path: `${shots}/vaadin-merge-done.png`, fullPage: true })

    // ---- 2. app shortcuts, "?" and quick launch -----------------------------------------
    await page.goto(base + '/')
    await page.waitForSelector('mateu-header-values .value')
    await settle(page)
    const header = await headerText(page)
    check('header values are on the header', header.includes('Business date'), header)
    await blur(page)
    await page.keyboard.press('Shift+Slash')
    await settle(page, 500)
    const helpVisible = await page.getByRole('dialog', { name: 'Keyboard shortcuts' }).isVisible().catch(() => false)
    check('"?" opens the keyboard shortcuts list', helpVisible)
    await page.screenshot({ path: `${shots}/vaadin-shortcuts-help.png` })
    await page.keyboard.press('Escape')
    await settle(page, 300)
    await page.keyboard.press('F8')
    await page.waitForSelector('text=Close the day', { timeout: 10_000 }).catch(() => undefined)
    check('F8 goes to the end of day (app shortcut)', page.url().includes('e2-business-day'), page.url())
    await page.screenshot({ path: `${shots}/vaadin-shortcut-f8.png` })
    await page.keyboard.press('Control+k')
    await settle(page, 500)
    await page.keyboard.type('MRG')
    await settle(page, 400)
    await page.screenshot({ path: `${shots}/vaadin-quick-launch-command-center.png` })
    await page.keyboard.press('Enter')
    await page.waitForSelector('mateu-record-merge', { timeout: 10_000 }).catch(() => undefined)
    check('quick launch (command center): MRG + Enter opens the merge screen', page.url().includes('record-merge-demo'), page.url())

    // the ⌘K palette of an app WITHOUT the command center
    const fd = await ctx.newPage()
    await fd.goto(base + '/e2-demo')
    await fd.waitForSelector('mateu-header-values .value')
    await settle(fd)
    await blur(fd)
    await fd.keyboard.press('Control+k')
    await settle(fd, 400)
    await fd.keyboard.type('home')
    await settle(fd, 300)
    await fd.screenshot({ path: `${shots}/vaadin-quick-launch-palette.png` })
    const paletteRow = await fd.locator('.cmd-result--selected').first().innerText().catch(() => '')
    check('quick launch (palette): the code match is the first row', paletteRow.includes('Front desk home'), paletteRow.replace(/\s+/g, ' '))
    await fd.keyboard.press('Escape')
    await fd.close()

    // ---- 3. live header values: other tab (storage) and other session (event stream) -----
    await page.goto(base + '/')
    await page.waitForSelector('mateu-header-values .value')
    const tab2 = await ctx.newPage()
    await tab2.goto(base + '/')
    await tab2.waitForSelector('mateu-header-values .value')
    const otherCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const otherSession = await otherCtx.newPage()
    await otherSession.goto(base + '/e2-demo')
    await otherSession.waitForSelector('mateu-header-values .value')
    await settle(otherSession, 2500) // the stream connects on the leader's first tick
    await blur(page)
    await page.keyboard.press('F8')
    await page.waitForSelector('text=Close the day', { timeout: 10_000 })
    await settle(page, 800)
    const before = await headerText(otherSession)
    await page.getByRole('button', { name: /close the day/i }).click()
    await settle(page, 3000)
    const afterTab2 = await headerText(tab2)
    const afterOther = await headerText(otherSession)
    check('live: another TAB of the browser follows the new business date', dateOf(afterTab2) && dateOf(afterTab2) !== dateOf(before), `${before} → ${afterTab2}`)
    check('live: another SESSION follows it through the event stream', dateOf(afterOther) && dateOf(afterOther) !== dateOf(before), afterOther)
    await tab2.screenshot({ path: `${shots}/vaadin-live-other-tab.png` })
    await otherSession.screenshot({ path: `${shots}/vaadin-live-other-session.png` })
    await page.getByRole('button', { name: /change shift/i }).click()
    await settle(page, 2000)
    const shiftTab2 = await headerText(tab2)
    const shiftOther = await headerText(otherSession)
    check('live: a command changes this browser\'s tabs only', shiftTab2 !== afterTab2 && shiftOther === afterOther, `${shiftTab2} | ${shiftOther}`)
    await otherCtx.close()
    await tab2.close()

    // ---- 4. idle-session warning (1 minute, 30 s countdown) -----------------------------
    if (!skipIdle) {
        const idleCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
        const idle = await idleCtx.newPage()
        await idle.goto(base + '/e2-demo')
        await idle.waitForSelector('mateu-header-values .value')
        await idle.waitForSelector('[role="alertdialog"]', { timeout: 45_000 })
        await settle(idle, 300)
        const focused = await idle.evaluate(() => {
            let el = document.activeElement
            while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement
            return el?.textContent?.trim()
        })
        check('idle: the warning appears and focus is on "Stay signed in"', focused === 'Stay signed in', String(focused))
        await idle.screenshot({ path: `${shots}/vaadin-idle-warning.png` })
        await idle.keyboard.press('Enter')
        await settle(idle, 1500)
        check('idle: "Stay signed in" dismisses it', !(await idle.locator('[role="alertdialog"]').isVisible().catch(() => false)))
        await idle.waitForSelector('[role="alertdialog"]', { timeout: 45_000 })
        await idle.getByRole('button', { name: 'Sign out' }).click()
        await idle.waitForURL(/signed-out-demo/, { timeout: 10_000 }).catch(() => undefined)
        check('idle: "Sign out" goes to the sign-out url', idle.url().includes('signed-out-demo'), idle.url())
        await idleCtx.close()
    }
    await ctx.close()
} finally {
    await browser.close()
}
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
