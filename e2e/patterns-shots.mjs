// One-shot screenshots of the Redwood pattern-gap affordances against a running SUT (mvc-app1).
// usage: node patterns-shots.mjs <baseUrl> <outDir> [prefix]
import { chromium } from '@playwright/test'

const base = process.argv[2] ?? 'http://localhost:8080'
const out = process.argv[3] ?? '.'
const prefix = process.argv[4] ?? 'patterns-vaadin'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
const settle = (ms = 1500) => page.waitForTimeout(ms)
const shot = async (name) => {
    await page.screenshot({ path: `${out}/${prefix}-${name}.png`, fullPage: false })
    console.log('shot', name)
}
const go = async (route) => {
    await page.goto(base + route)
    await page.waitForSelector('mateu-page, mateu-component', { timeout: 20000 }).catch(() => {})
    await settle()
}

try {
    // header record switcher (searchable) + section affordances
    await go('/patterns/switcher')
    await shot('switcher')
    const combo = page.locator('mateu-record-switcher input[role=combobox]')
    if (await combo.count()) {
        await combo.click()
        await combo.fill('gra')
        await settle(500)
        await shot('switcher-open')
        await combo.press('Enter')
        await settle()
        await shot('switcher-picked')
    }

    // wizard: Save / Save and close / Skip / Finish now
    await go('/patterns/wizard')
    await shot('wizard-step1')
    await page.getByText('Next', { exact: true }).first().click().catch(() => {})
    await settle()
    await shot('wizard-step2')

    // crud drawer: Save and next + error banner
    await go('/patterns/rooms')
    await shot('rooms-listing')
    await page.getByText('101', { exact: true }).first().click().catch(() => {})
    await settle()
    await shot('rooms-drawer')
    // Save and next: the open drawer moves on to the next row (102 Garden)
    await page.locator('mateu-drawer').getByText('Save and next', { exact: true }).first().click().catch(() => {})
    await settle()
    await shot('rooms-drawer-next')
    // a failing save keeps the drawer open with an error banner
    const name = page.locator('mateu-drawer vaadin-text-field').nth(1)
    if (await name.count()) {
        await name.locator('input').fill('Boom room')
        await settle(300)
        await page.locator('mateu-drawer').getByText('Save', { exact: true }).first().click().catch(() => {})
        await settle()
        await shot('rooms-drawer-error')
    }

    await go('/patterns/overview')
    await shot('overview-info')
    await go('/patterns/foldout')
    await shot('foldout-summary')
    await go('/patterns/data')
    await shot('data-docked')
    await go('/patterns/search')
    await shot('search-presearch')
    await go('/patterns/welcome')
    await shot('welcome-tone')
} finally {
    await browser.close()
}
