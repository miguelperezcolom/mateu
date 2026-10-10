// Screenshots of the pattern-gap affordances on the Redwood/VB renderer (SUT built with
// -Dmateu.renderer=mateu-redwood). usage: node patterns-shots-vb.mjs <baseUrl> <outDir>
import { chromium } from '@playwright/test'

const base = process.argv[2] ?? 'http://localhost:8080'
const out = process.argv[3] ?? '.'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1366, height: 860 } })
const shot = async (name) => {
    await page.screenshot({ path: `${out}/patterns-redwood-${name}.png` })
    console.log('shot', name)
}
const go = async (route) => {
    await page.goto(base + route)
    // the VB runtime and JET come from Oracle's CDN: give them time
    await page.waitForTimeout(9000)
}

try {
    for (const [route, name] of [
        ['/patterns/switcher', 'switcher'],
        ['/patterns/wizard', 'wizard'],
        ['/patterns/rooms', 'rooms-listing'],
        ['/patterns/overview', 'overview-info'],
        ['/patterns/foldout', 'foldout-summary'],
        ['/patterns/data', 'data-docked'],
        ['/patterns/search', 'search-presearch'],
        ['/patterns/welcome', 'welcome-tone'],
    ]) {
        await go(route)
        await shot(name)
    }
} finally {
    await browser.close()
}
