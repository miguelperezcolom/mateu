/**
 * Built-in sign-in probe for the SALESFORCE (SLDS) renderer (same scenarios as sign-in-probe.mjs, SLDS's chooser) — the web client's sign-in providers in a real browser, against a page
 * that declares them (<meta name="mateu-auth">) and a MOCK OpenID provider, both played by this
 * script through Playwright routing (no server, no Mateu backend needed: the sync endpoint is a stub that answers 401 without the right
 * Bearer token).
 *
 *   1. two providers, no session → the chooser (a labelled dialog, one button each, focus on the first)
 *   2. picking the OIDC one → the authorize endpoint with response_type=code, PKCE S256, state, nonce
 *   3. the callback → the code is redeemed with a verifier whose S256 IS the challenge, the token is
 *      stored, the URL is clean and back on the route the user asked for, the sync call carries
 *      `Authorization: Bearer <token>`
 *   4. the token is revoked → the next load's 401 is answered by the refresh token and retried
 *   5. one provider + loginOnStart → straight to the IdP, no chooser
 *
 * Usage (from e2e/, after `npm run copy` in apps/primer — it reads the mateu-slds jar's static/):
 *   node slds-sign-in-probe.mjs
 * Exits non-zero if any check fails.
 */
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

// The page, the sync stub and the mock OpenID provider are played by intercepting the browser's
// requests (Playwright routing) — no HTTP server is started. The renderer's files are read from
// the jar's static/ folder, looked up by name in a list made up front (never a path from a url).
const here = path.dirname(fileURLToPath(import.meta.url))
const STATIC = path.resolve(here, '../backend/shared/frontend/slds/src/main/resources/static')
const ASSETS = new Map(fs.readdirSync(path.join(STATIC, 'assets')).map((name) => [name, path.join(STATIC, 'assets', name)]))
const APP = 'https://app.probe.test'
const IDP = 'https://idp.probe.test'
const ISSUER = `${IDP}/realms/probe`

const results = []
const check = (name, pass, detail = '') => {
    results.push({ name, pass })
    console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`)
}

// ── the mock OpenID provider ────────────────────────────────────────────────────────────────────
const idp = { authorizeRequests: [], tokenRequests: [], codes: new Map(), issued: 0, valid: new Set() }
const issue = () => {
    idp.issued += 1
    const token = 'access-' + idp.issued
    idp.valid.add(token)
    return token
}
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
// the IdP answers the app's origin only (what a real provider configured for this client would do)
const json = (status, body, cors = false) => ({
    status, contentType: 'application/json', body: JSON.stringify(body),
    headers: cors ? { 'Access-Control-Allow-Origin': APP, 'Access-Control-Allow-Headers': 'content-type' } : {},
})

const answerIdp = (rq, url) => {
    if (rq.method() === 'OPTIONS') return { status: 204, headers: { 'Access-Control-Allow-Origin': APP, 'Access-Control-Allow-Headers': 'content-type' } }
    if (url.pathname === '/realms/probe/.well-known/openid-configuration') {
        return json(200, { issuer: ISSUER, authorization_endpoint: ISSUER + '/auth', token_endpoint: ISSUER + '/token', end_session_endpoint: ISSUER + '/logout' }, true)
    }
    if (url.pathname === '/realms/probe/auth') {
        const q = Object.fromEntries(url.searchParams)
        idp.authorizeRequests.push(q)
        // the user "signs in" at once: back to the redirect uri with a code
        const code = 'code-' + idp.authorizeRequests.length
        idp.codes.set(code, q)
        const back = new URL(q.redirect_uri)
        back.searchParams.set('code', code)
        back.searchParams.set('state', q.state)
        back.searchParams.set('session_state', 'x')
        return { status: 200, contentType: 'text/html', body: `<script>location.replace(${JSON.stringify(back.href)})</script>` }
    }
    if (url.pathname === '/realms/probe/token' && rq.method() === 'POST') {
        const form = Object.fromEntries(new URLSearchParams(rq.postData() ?? ''))
        idp.tokenRequests.push(form)
        if (form.grant_type === 'authorization_code') {
            const authorize = idp.codes.get(form.code)
            const challenge = createHash('sha256').update(form.code_verifier ?? '').digest('base64url')
            if (!authorize || challenge !== authorize.code_challenge || form.redirect_uri !== authorize.redirect_uri) {
                return json(400, { error: 'invalid_grant' }, true)
            }
            idp.codes.delete(form.code)
            return json(200, { access_token: issue(), refresh_token: 'refresh-1', id_token: `h.${b64({ nonce: authorize.nonce })}.s`, expires_in: 300, token_type: 'Bearer' }, true)
        }
        if (form.grant_type === 'refresh_token' && form.refresh_token === 'refresh-1') {
            return json(200, { access_token: issue(), expires_in: 300, token_type: 'Bearer' }, true)
        }
        return json(400, { error: 'unsupported_grant_type' }, true)
    }
    return { status: 404, body: '' }
}

// ── the page and a stub of the sync endpoint ────────────────────────────────────────────────────
let auth = {}
const syncCalls = []
const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const indexHtml = () => fs.readFileSync(path.join(STATIC, '_index.html'), 'utf8')
    .replace('AQUIELTITULODELAPAGINA', 'Sign-in probe')
    .replace('<!-- AQUIFAVICON -->', `<meta name="mateu-auth" content="${escapeAttr(JSON.stringify(auth))}">`)
const TYPES = { '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.txt': 'text/plain' }

const answerApp = (rq, url) => {
    if (rq.method() === 'POST' && url.pathname.startsWith('/mateu/')) {
        const header = rq.headers()['authorization'] ?? ''
        const token = header.replace(/^Bearer /, '')
        if (!url.pathname.startsWith('/mateu/v3/sync')) return { status: 204, body: '' }
        syncCalls.push({ path: url.pathname, authorization: header })
        if (!idp.valid.has(token)) return json(401, { message: 'unauthorized' })
        return json(200, { commands: [], messages: [], fragments: [] })
    }
    if (url.pathname.startsWith('/assets/')) {
        const file = ASSETS.get(url.pathname.slice('/assets/'.length))
        if (!file) return { status: 404, body: '' }
        return { status: 200, contentType: TYPES[path.extname(file)] ?? 'application/octet-stream', body: fs.readFileSync(file) }
    }
    return { status: 200, contentType: 'text/html; charset=utf-8', body: indexHtml() }
}

/** A context whose every request is answered here: the app, the IdP, nothing else. */
const probeContext = async () => {
    const context = await browser.newContext()
    await context.route('**/*', (route) => {
        const rq = route.request()
        const url = new URL(rq.url())
        if (url.origin === APP) return route.fulfill(answerApp(rq, url))
        if (url.origin === IDP) return route.fulfill(answerIdp(rq, url))
        return route.abort()
    })
    return context
}

const acme = { id: 'acme', type: 'oidc', label: 'Acme SSO', icon: 'key', issuer: ISSUER, clientId: 'mateu-ui', scopes: ['openid', 'profile', 'offline_access'] }
const github = { id: 'github', type: 'redirect', label: 'GitHub', icon: 'github', url: '/oauth2/authorization/github' }

const browser = await chromium.launch()
try {
    // 1-4: two providers
    auth = { loginOnStart: true, providers: [acme, github], logoutUrl: '/logout' }
    const context = await probeContext()
    const page = await context.newPage()
    if (process.env.DEBUG) { page.on('console', (m) => console.log('DEBUG console', m.text().slice(0, 300))); page.on('request', (r) => console.log('DEBUG req', r.method(), r.url().slice(0, 160))) }
    await page.goto(APP + '/orders?page=2')
    const chooser = page.locator('[data-mateu-sign-in]')
    await chooser.waitFor({ timeout: 15000 })
    const buttons = chooser.locator('button[data-provider]')
    check('two providers: the chooser shows one button each', (await buttons.count()) === 2,
        (await buttons.allTextContents()).map((s) => s.trim()).join(' | '))
    check('the chooser is a labelled modal dialog', await chooser.locator('[role="dialog"][aria-modal="true"][aria-labelledby]').count() === 1)
    const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-provider'))
    check('the focus is on the first provider', focused === 'acme', String(focused))
    check('nothing was loaded before signing in', syncCalls.length === 0, `${syncCalls.length} sync calls`)
    // SHOT=<file.png>: a picture of the chooser
    if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT })

    await buttons.first().click()
    await page.waitForURL((u) => u.pathname === '/orders', { timeout: 15000 })
    if (process.env.DEBUG) { await new Promise((r) => setTimeout(r, 4000)); console.log('DEBUG', page.url(), JSON.stringify(idp.authorizeRequests), JSON.stringify(idp.tokenRequests), await page.evaluate(() => document.cookie)) }
    await page.waitForFunction(() => document.cookie.includes('__mateu_auth_token='), null, { timeout: 15000 })
    const authorize = idp.authorizeRequests[0] ?? {}
    check('authorize: code flow + PKCE S256 + state + nonce + redirect uri = the mount root',
        authorize.response_type === 'code' && authorize.code_challenge_method === 'S256' && /^[\w-]{43}$/.test(authorize.code_challenge ?? '')
        && !!authorize.state && !!authorize.nonce && authorize.redirect_uri === APP + '/' && authorize.client_id === 'mateu-ui'
        && authorize.scope === 'openid profile offline_access', JSON.stringify(authorize))
    const exchange = idp.tokenRequests.find((r) => r.grant_type === 'authorization_code')
    check('the code was redeemed with the matching verifier', !!exchange && idp.issued >= 1)
    check('the URL is back on the route asked for, without code/state', new URL(page.url()).search === '?page=2', page.url())
    // the default store is a cookie (authToken.ts): Path = the mount, SameSite=Strict, no Domain
    const cookie = (await context.cookies(APP)).find((c) => c.name === '__mateu_auth_token')
    check('the token is stored in the cookie authToken.ts keeps it in', cookie?.value === 'access-1', JSON.stringify(cookie))
    check('the cookie: SameSite=Strict, host-only, Path = the mount, not HttpOnly (the client wrote it)',
        cookie?.sameSite === 'Strict' && !cookie.domain.startsWith('.') && cookie.path === '/' && cookie.httpOnly === false, JSON.stringify(cookie))
    const leaked = await page.evaluate(() => [localStorage.getItem('__mateu_auth_token'), document.cookie.includes('refresh-')])
    check('nothing else keeps the token, and no refresh token in a cookie', leaked[0] === null && leaked[1] === false, JSON.stringify(leaked))
    await page.waitForFunction(() => true)
    await new Promise((r) => setTimeout(r, 1500))
    check('the sync call carries the Bearer token', syncCalls.some((c) => c.authorization === 'Bearer access-1'), JSON.stringify(syncCalls.slice(0, 3)))

    // 4: revoke the access token: the next load's 401 is refreshed and retried
    idp.valid.delete('access-1')
    syncCalls.length = 0
    await page.reload()
    await new Promise((r) => setTimeout(r, 2500))
    const refreshed = idp.tokenRequests.some((r) => r.grant_type === 'refresh_token')
    check('a 401 is answered by the refresh token…', refreshed)
    check('…and the request retried with the new token', syncCalls.some((c) => c.authorization === 'Bearer access-2'), JSON.stringify(syncCalls.map((c) => c.authorization)))
    check('no chooser after a successful refresh', await page.locator('[data-mateu-sign-in]').count() === 0)
    await context.close()

    // 5: one provider → straight to it
    auth = { loginOnStart: true, providers: [acme] }
    idp.authorizeRequests.length = 0
    const direct = await probeContext()
    const page2 = await direct.newPage()
    await page2.goto(APP + '/reports')
    await page2.waitForFunction(() => document.cookie.includes('__mateu_auth_token='), null, { timeout: 15000 })
    check('one provider: straight to the IdP, no chooser', idp.authorizeRequests.length === 1 && new URL(page2.url()).pathname === '/reports', page2.url())
    await direct.close()

    // 6: the redirect provider
    auth = { loginOnStart: true, providers: [acme, github] }
    const redirect = await probeContext()
    const page3 = await redirect.newPage()
    await page3.goto(APP + '/orders')
    await page3.locator('[data-mateu-sign-in] button[data-provider]').nth(1).click()
    await page3.waitForURL((u) => u.pathname === '/oauth2/authorization/github', { timeout: 15000 })
    check('a redirect provider goes to its url with continue=', new URL(page3.url()).searchParams.get('continue') === APP + '/orders', page3.url())
    await redirect.close()
} catch (error) {
    check('the probe ran to the end', false, String(error?.stack ?? error))
} finally {
    await browser.close()
}

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
