/**
 * Slow-network probe — drives a real Mateu app under a deliberately bad connection and asserts
 * what the USER ends up seeing. The unit tests cover the decisions (classify, retry, guard); this
 * covers the thing those decisions exist for, which no unit test can reach: a real renderer, real
 * shadow DOM, real Vaadin controls.
 *
 * Six scenarios:
 *   1. slow first load  → a skeleton, not a blank page
 *   2. slow action      → the pressed control shows it was heard
 *   3. double press     → the second press sends nothing
 *   4. connection lost  → a standing banner and a human error message, and recovery is announced
 *   5. failed write     → an explicit Retry that re-runs the action AND applies its response
 *   6. 503              → a read recovers by itself; a write is sent exactly once
 *
 * Usage (with a SUT app running, e.g. e2e/sut/apps/mvc-app1 on :8080):
 *   cd e2e && node slow-network-probe.mjs
 *   BASE=http://localhost:8081 OUT=/tmp/shots node slow-network-probe.mjs
 *
 * Exits non-zero if any check fails, so it can gate a change to the transport layer.
 */
import { chromium } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:8080'
const OUT = process.env.OUT ?? '/tmp/mateu-slow-network-probe'
const SYNC = '**/mateu/v3/sync/**'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const results = []
const check = (name, pass, detail = '') => {
    results.push({ name, pass, detail })
    console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

await import('node:fs').then(fs => fs.mkdirSync(OUT, { recursive: true }))

const browser = await chromium.launch()

// ---------------------------------------------------------------------------------------------
// 1. Slow first load — the skeleton
// ---------------------------------------------------------------------------------------------
{
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    await page.route(SYNC, async (route) => { await sleep(2500); await route.continue() })
    page.goto(`${BASE}/validation`).catch(() => {})
    await sleep(1200)  // past the 400ms skeleton delay, well before the response
    const skeletons = await page.locator('mateu-skeleton').count()
    check('slow load shows a skeleton instead of a blank page', skeletons > 0, `${skeletons} skeleton(s)`)
    await page.screenshot({ path: `${OUT}/1-skeleton.png` })
    await page.close()
}

// ---------------------------------------------------------------------------------------------
// 2 & 3. Slow action — busy control on the pressed button, and no double submit
// ---------------------------------------------------------------------------------------------
{
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    let posts = 0
    await page.goto(`${BASE}/`)
    await page.waitForSelector('mateu-page')
    await sleep(1200)
    // Satisfy the field validation, or the action never leaves the browser and this would be
    // measuring the validation guard instead of the transport.
    await page.locator('vaadin-text-field input').first().fill('Ada')
    await page.locator('vaadin-text-field input').first().blur()
    await sleep(300)

    // Throttle only the ACTION calls, once the page is up.
    await page.route(SYNC, async (route) => {
        const body = route.request().postData() ?? ''
        if (!body.includes('"actionId":""')) { posts++; await sleep(3000) }
        await route.continue()
    })

    const button = page.locator('vaadin-button', { hasText: /greet/i }).first()
    const label = (await button.count()) ? (await button.innerText()).trim() : '(none)'
    if (await button.count()) {
        await button.click()
        await sleep(600)
        const busy = await button.getAttribute('data-mateu-pending')
        const ariaBusy = await button.getAttribute('aria-busy')
        check('the pressed control is marked busy while the action runs',
            busy !== null && ariaBusy === 'true', `button "${label}"`)
        await page.screenshot({ path: `${OUT}/2-pending-button.png` })

        // Double press while in flight — dispatch the event directly so the guard, not the
        // veil's pointer-events, is what is being tested (a keyboard shortcut arrives this way).
        const before = posts
        await button.dispatchEvent('click')
        await button.dispatchEvent('click')
        await sleep(400)
        check('a repeat press while in flight sends no second request',
            posts === before, `${posts - before} extra request(s)`)
        await sleep(3200)
    } else {
        check('the pressed control is marked busy while the action runs', false, 'no button found')
    }
    await page.close()
}

// ---------------------------------------------------------------------------------------------
// 4. Connection lost — standing banner + human error text
// ---------------------------------------------------------------------------------------------
{
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    await page.goto(`${BASE}/`)
    await page.waitForSelector('mateu-page')
    await sleep(1200)
    await page.locator('vaadin-text-field input').first().fill('Ada')
    await page.locator('vaadin-text-field input').first().blur()
    await sleep(300)

    await page.context().setOffline(true)
    await page.evaluate(() => window.dispatchEvent(new Event('offline')))
    await sleep(400)

    const bannerText = await page.evaluate(() =>
        document.querySelector('mateu-connectivity-banner')?.shadowRoot?.textContent?.trim() ?? '(not mounted)')
    check('losing the connection raises a standing banner',
        /no connection/i.test(bannerText), JSON.stringify(bannerText))

    // Now act while offline and read the toast.
    const button = page.locator('vaadin-button', { hasText: /greet/i }).first()
    if (await button.count()) await button.click().catch(() => {})
    await sleep(2500)
    const toast = await page.evaluate(() => {
        const texts = []
        document.querySelectorAll('vaadin-notification-card, [role="status"]').forEach((n) => {
            const t = (n.textContent ?? '').trim()
            if (t) texts.push(t)
        })
        return texts
    })
    const joined = toast.join(' | ')
    check('the failure is explained in plain language, not axios jargon',
        joined.length > 0
        && !/Network Error|ECONNABORTED|status code|timeout of/i.test(joined),
        JSON.stringify(joined))
    await page.screenshot({ path: `${OUT}/3-offline.png` })

    // …and recovers.
    await page.context().setOffline(false)
    await page.evaluate(() => window.dispatchEvent(new Event('online')))
    await sleep(500)
    const backText = await page.evaluate(() =>
        document.querySelector('mateu-connectivity-banner')?.shadowRoot?.textContent?.trim() ?? '(not mounted)')
    check('recovery is announced', /restored/i.test(backText), JSON.stringify(backText))
    await page.screenshot({ path: `${OUT}/4-recovered.png` })
    await page.close()
}

// ---------------------------------------------------------------------------------------------
// 5. The Retry control re-runs the action end to end (not just the HTTP request)
// ---------------------------------------------------------------------------------------------
{
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    await page.goto(`${BASE}/`)
    await page.waitForSelector('mateu-page')
    await sleep(1200)
    await page.locator('vaadin-text-field input').first().fill('Ada')
    await page.locator('vaadin-text-field input').first().blur()
    await sleep(300)

    // Fail the action once, then let everything through.
    let failNext = true
    await page.route(SYNC, async (route) => {
        const body = route.request().postData() ?? ''
        if (failNext && !body.includes('"actionId":""')) { failNext = false; await route.abort('failed'); return }
        await route.continue()
    })
    await page.locator('vaadin-button', { hasText: /greet/i }).first().click()
    await sleep(1200)

    const retry = page.locator('vaadin-notification-card button', { hasText: /retry/i }).first()
    check('a failed write offers an explicit Retry', await retry.count() > 0)
    if (await retry.count()) {
        await retry.click()
        await sleep(1500)
        // The greeting only appears if the RESPONSE was handled, not merely re-sent.
        const texts = await page.evaluate(() => [...document.querySelectorAll('vaadin-notification-card')]
            .map(n => (n.textContent ?? '').trim()))
        check('Retry re-runs the action and its response is applied',
            texts.some(t => /Hello Ada/.test(t)), JSON.stringify(texts))
    }
    await page.close()
}

// ---------------------------------------------------------------------------------------------
// 6. Reads recover by themselves; writes never do
// ---------------------------------------------------------------------------------------------
{
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    let loadAttempts = 0
    // The route load ('' action) is a read: fail it once and it should retry itself.
    await page.route(SYNC, async (route) => {
        const body = route.request().postData() ?? ''
        if (body.includes('"actionId":""')) {
            loadAttempts++
            if (loadAttempts === 1) { await route.fulfill({ status: 503, body: 'nope' }); return }
        }
        await route.continue()
    })
    await page.goto(`${BASE}/`)
    await page.waitForSelector('mateu-page', { timeout: 15000 }).catch(() => {})
    await sleep(2500)
    const heading = await page.locator('h1, h2').first().innerText().catch(() => '')
    check('a read that hits a 503 retries itself and the page still loads',
        loadAttempts >= 2 && /Simple Form/i.test(heading), `${loadAttempts} attempt(s), heading=${JSON.stringify(heading)}`)

    // Now a write against a 503: it must NOT be repeated behind the user's back.
    let writeAttempts = 0
    await page.unroute(SYNC)
    await page.locator('vaadin-text-field input').first().fill('Ada')
    await page.locator('vaadin-text-field input').first().blur()
    await page.route(SYNC, async (route) => {
        const body = route.request().postData() ?? ''
        if (!body.includes('"actionId":""')) { writeAttempts++; await route.fulfill({ status: 503, body: 'nope' }); return }
        await route.continue()
    })
    await page.locator('vaadin-button', { hasText: /greet/i }).first().click()
    await sleep(3000)
    check('a write that hits a 503 is sent exactly once', writeAttempts === 1, `${writeAttempts} attempt(s)`)
    await page.close()
}

await browser.close()

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
