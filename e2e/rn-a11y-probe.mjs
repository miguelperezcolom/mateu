/**
 * Accessibility probe for the React Native renderer.
 *
 * React Native for Web maps the accessibility props onto their DOM equivalents —
 * `accessibilityLabel` → `aria-label`, `accessibilityRole` → `role`, `accessibilityState` →
 * `aria-disabled`/`aria-selected` — so the tree RN builds for VoiceOver and TalkBack can be
 * inspected in a browser. That is the only way to check it without a device farm, and it checks
 * the thing that actually matters: whether a control has a NAME.
 *
 * Usage — expo web on :19006. Against the e2e SUT (a plain form at the root) nothing else is
 * needed; against an app shell, name the screen to open and, optionally, submit it:
 *
 *   cd frontend/app/react-native && EXPO_PUBLIC_MATEU_BACKEND_PORT=8080 npx expo start --web --port 19006
 *   cd e2e && RN_SUBMIT=1 node rn-a11y-probe.mjs
 *   cd e2e && RN_SCREEN='Check-in' node rn-a11y-probe.mjs
 */
import { chromium } from 'playwright'

const URL = process.env.RN_URL ?? 'http://localhost:19006'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const results = []
const check = (name, pass, detail = '') => {
    results.push({ name, pass })
    console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 420, height: 860 } })
await page.goto(URL, { waitUntil: 'networkidle' })
await sleep(5000)

// Optional navigation before probing. Against a backend whose root IS a form (the e2e SUT) none
// is needed; against an app shell, RN_SCREEN names the drawer entry to open — the same navigation
// the existing rn-shot tool performs.
const target = process.env.RN_SCREEN
if (target) try {
    if (!process.env.RN_NO_DRAWER) {
        await page.mouse.click(26, 32)      // hamburger
        await sleep(1200)
    }
    await page.getByText(target, { exact: false }).first().click()
    await sleep(4000)
    console.log(`navigated to "${target}"`)
} catch (e) {
    console.log(`could not navigate to "${target}": ${e.message.split('\n')[0]}`)
}

// RN_DRILL=1 taps the first card after navigating, to reach a form (the list screens are mostly
// tappable rows; the fields live one level in).
if (process.env.RN_DRILL) {
    try {
        await page.locator('[role="button"]').first().click()
        await sleep(4500)
        console.log('drilled into the first item')
    } catch (e) {
        console.log(`could not drill in: ${e.message.split('\n')[0]}`)
    }
}

/** Every element that behaves as a control, with whatever name it would be announced by. */
const controls = async () => page.evaluate(() => {
    const named = (el) =>
        el.getAttribute('aria-label')
        || el.getAttribute('aria-labelledby')
        || (el.textContent ?? '').trim()
    const out = []
    document.querySelectorAll('[role="button"], button, [role="link"], input, textarea, select')
        .forEach((el) => {
            out.push({
                tag: el.tagName.toLowerCase(),
                role: el.getAttribute('role') ?? '',
                name: named(el).slice(0, 60),
                isInput: ['input', 'textarea', 'select'].includes(el.tagName.toLowerCase()),
            })
        })
    return out
})

const found = await controls()
check('the screen renders controls at all', found.length > 0, `${found.length} control(s)`)

// A control with no name is announced as "button" / "edit text" and nothing else.
const unnamed = found.filter((c) => !c.name)
check('every control carries an accessible name', unnamed.length === 0,
    unnamed.length ? JSON.stringify(unnamed.slice(0, 5)) : `${found.length} named`)

// Inputs are the case RN cannot infer: there is no labelFor, so a missing label is silent.
const inputs = found.filter((c) => c.isInput)
const unnamedInputs = inputs.filter((c) => !c.name)
check('every text input is named (RN has no labelFor to fall back on)',
    unnamedInputs.length === 0,
    inputs.length ? `${inputs.length} input(s), ${unnamedInputs.length} unnamed` : 'no inputs on this screen')

// A tappable that is not announced as a button reads as plain text.
const buttons = found.filter((c) => c.role === 'button' || c.tag === 'button')
check('tappables are announced as buttons', buttons.length > 0, `${buttons.length} button(s)`)

// A refused save must reach the accessible name, or the user is told nothing at all: RN has no
// aria-describedby, so the message has to travel with the field's own name.
if (process.env.RN_SUBMIT) {
    try {
        await page.locator('[role="button"]').first().click()
        await sleep(1500)
        const invalidNames = (await controls())
            .filter((c) => c.isInput && /invalid/i.test(c.name))
            .map((c) => c.name)
        check('a rejected field carries the error in its accessible name',
            invalidNames.length > 0, JSON.stringify(invalidNames))
    } catch (e) {
        check('a rejected field carries the error in its accessible name', false, e.message.split('\n')[0])
    }
}

console.log('\nsample of named controls:')
found.filter((c) => c.name).slice(0, 12).forEach((c) => console.log(`  ${c.tag}[role=${c.role}] "${c.name}"`))

await page.screenshot({ path: process.env.OUT ?? '/tmp/rn-a11y.png' })
await browser.close()

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
