// The built-in sign-in (signIn.mjs): the flows against a fake page and IdP, the chooser's DOM, and
// the 401 path through resilience.mjs. Run: node test-sign-in.mjs (npm test runs it).
import './test-locale.mjs' // first: off English the suite reruns in English (see the module)
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { makeDom, FakeEvent } from './test-harness-dom.mjs'
import {
  bootSignIn, completeSignInCallback, oidcAuthorizeUrlOf, oidcCallbackOf, oidcEndpointAllowed, oidcJwtClaims,
  pkceChallengeOf, readSignInConfig, readSignInSession, redirectProviderUrlOf, refreshSignIn, resetSignIn,
  setSignInEnv, showSignInChooser, signInConfigOf, signInGlyphOf, signOut, signOutAvailable, storedSignInToken,
  withSignOutAction, withoutOidcCallback, oidcRedirectUriOf, SIGN_OUT_ACTION,
} from './signIn.mjs'
import { askForReauthentication } from './resilience.mjs'
import { resetTokenStore } from './authStore.mjs'

let passed = 0
const queue = []
const test = (name, fn) => queue.push({ name, fn })

class MemoryStorage {
  constructor() { this.map = new Map() }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null }
  setItem(k, v) { this.map.set(k, String(v)) }
  removeItem(k) { this.map.delete(k) }
  clear() { this.map.clear() }
}
globalThis.localStorage = new MemoryStorage()
globalThis.sessionStorage = new MemoryStorage()

const ISSUER = 'https://idp.example/realms/acme'
const DISCOVERY = { issuer: ISSUER, authorization_endpoint: ISSUER + '/auth', token_endpoint: ISSUER + '/token', end_session_endpoint: ISSUER + '/logout' }
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
const idToken = (claims) => 'h.' + Buffer.from(JSON.stringify(claims)).toString('base64url') + '.s'
const acme = { id: 'acme', type: 'oidc', label: 'Acme', issuer: ISSUER, clientId: 'ui' }
const github = { id: 'github', type: 'redirect', label: 'GitHub', icon: 'github', url: '/oauth2/authorization/github' }

/** A page with the meta, a fake IdP and recorded side effects. */
const page = (auth, { href = 'https://app.example/orders?page=2', choose, tokenAnswer } = {}) => {
  const { doc } = makeDom()
  const meta = doc.createElement('meta')
  meta.setAttribute('name', 'mateu-auth')
  meta.setAttribute('content', JSON.stringify(auth))
  doc.head.appendChild(meta)
  const state = { href, assigned: [], replaced: [], tokenRequests: [] }
  setSignInEnv({
    href: () => state.href,
    assign: (url) => state.assigned.push(url),
    replaceUrl: (url) => { state.replaced.push(url); state.href = new URL(url, state.href).href },
    fetch: async (url, init) => {
      if (url.endsWith('/.well-known/openid-configuration')) return json(DISCOVERY)
      if (url === DISCOVERY.token_endpoint) {
        state.tokenRequests.push(Object.fromEntries(new URLSearchParams(init.body)))
        return (tokenAnswer || (() => json({ access_token: 'access-1', refresh_token: 'refresh-1', id_token: idToken({ nonce: 'no' }), expires_in: 300 })))()
      }
      return json({}, 404)
    },
    now: () => 1000000,
    choose: choose || (async () => null),
  })
  return { doc, state }
}
const reset = () => {
  resetSignIn()
  resetTokenStore()
  localStorage.clear()
  sessionStorage.clear()
}

test('the meta is read; nothing to do without one', async () => {
  const { doc } = makeDom()
  assert.equal(readSignInConfig(doc), null)
  assert.equal(await bootSignIn('', doc), true)
  assert.equal(signOutAvailable(), false)
  assert.equal(signInConfigOf({ providers: [{ id: 'x', type: 'oidc', issuer: 'https://i/', clientId: 'c', scopes: 'openid email' }] }).providers[0].issuer, 'https://i')
})

test('PKCE S256 (RFC 7636 appendix B) and the authorize url', async () => {
  assert.equal(await pkceChallengeOf('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'), 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM')
  const url = new URL(oidcAuthorizeUrlOf(ISSUER + '/auth', { clientId: 'ui', redirectUri: 'https://app/', scopes: ['openid'], state: 's', nonce: 'n', codeChallenge: 'c' }))
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256')
  assert.equal(url.searchParams.get('response_type'), 'code')
  assert.equal(oidcEndpointAllowed('http://evil/token', 'http://localhost:1'), false)
  assert.equal(oidcEndpointAllowed('http://127.0.0.1:2/token', 'http://localhost:1'), true)
  assert.deepEqual(oidcJwtClaims('nope'), {})
  assert.deepEqual(oidcCallbackOf('?code=c'), undefined)
  assert.equal(withoutOidcCallback('https://app/x?a=1&code=c&state=s#h'), '/x?a=1#h')
  assert.equal(redirectProviderUrlOf({ url: 'javascript:x', continueParam: true }, 'https://app/'), undefined)
  assert.equal(oidcRedirectUriOf('/admin', 'https://app/admin/x'), 'https://app/admin/')
  assert.equal(signInGlyphOf({ icon: 'google', label: 'G' }), 'G')
  assert.equal(signInGlyphOf({ icon: 'key', label: 'A' }), '')
})

test('one oidc provider, no session: straight to the authorize endpoint (no chooser)', async () => {
  reset()
  let chosen = 0
  const { doc, state } = page({ providers: [acme] }, { choose: async () => { chosen++; return null } })
  assert.equal(await bootSignIn('', doc), false)
  assert.equal(chosen, 0)
  const url = new URL(state.assigned[0])
  assert.equal(url.origin + url.pathname, DISCOVERY.authorization_endpoint)
  assert.equal(url.searchParams.get('redirect_uri'), 'https://app.example/')
  const pending = JSON.parse(sessionStorage.getItem('__mateu_sign_in_pending'))
  assert.equal(url.searchParams.get('state'), pending.state)
  assert.equal(url.searchParams.get('code_challenge'), createHash('sha256').update(pending.codeVerifier).digest('base64url'))
  assert.equal(pending.returnTo, 'https://app.example/orders?page=2')
})

test('the callback: token stored where storedToken reads it, URL back on the route', async () => {
  reset()
  sessionStorage.setItem('__mateu_sign_in_pending', JSON.stringify({ providerId: 'acme', state: 'st', nonce: 'no', codeVerifier: 'v',
    redirectUri: 'https://app.example/', returnTo: 'https://app.example/orders?page=2', tokenEndpoint: DISCOVERY.token_endpoint, createdAt: 1000000 }))
  const { doc, state } = page({ providers: [acme] }, { href: 'https://app.example/?code=the-code&state=st' })
  assert.equal(await bootSignIn('', doc), true)
  assert.equal(storedSignInToken(), 'access-1')
  // no cookies in Node: the default cookie store falls back to sessionStorage (authStore.mjs)
  assert.equal(sessionStorage.getItem('__mateu_auth_token'), 'access-1')
  assert.equal(readSignInSession().refreshToken, 'refresh-1')
  assert.deepEqual(state.replaced, ['/orders?page=2'])
  assert.equal(state.tokenRequests[0].code_verifier, 'v')
  assert.equal(signOutAvailable(), true)
  assert.deepEqual(withSignOutAction([{ actionId: 'a' }]).map((a) => a.actionId), ['a', SIGN_OUT_ACTION])
})

test('a callback with another state is not ours; a forged nonce is refused', async () => {
  reset()
  localStorage.setItem('__mateu_auth_token', 'mine')
  const other = page({ providers: [acme] }, { href: 'https://app.example/r?code=x&state=theirs' })
  assert.equal(await completeSignInCallback(signInConfigOf({ providers: [acme] })), 'none')
  assert.equal(other.state.replaced.length, 0)
  reset()
  sessionStorage.setItem('__mateu_sign_in_pending', JSON.stringify({ providerId: 'acme', state: 'st', nonce: 'no', codeVerifier: 'v',
    redirectUri: 'https://app.example/', returnTo: 'https://app.example/', tokenEndpoint: DISCOVERY.token_endpoint, createdAt: 1000000 }))
  const shown = []
  const { doc } = page({ providers: [acme] }, {
    href: 'https://app.example/?code=c&state=st', tokenAnswer: () => json({ access_token: 'a', id_token: idToken({ nonce: 'forged' }) }),
    choose: async (o) => { shown.push(o); return null },
  })
  assert.equal(await bootSignIn('', doc), false)
  assert.equal(storedSignInToken(), null)
  assert.match(shown[0].message, /did not work/)
})

test('several providers: the chooser; a redirect provider with continue=', async () => {
  reset()
  const { doc, state } = page({ providers: [acme, github] }, { choose: async (o) => o.providers[1] })
  assert.equal(await bootSignIn('', doc), false)
  assert.equal(state.assigned[0], 'https://app.example/oauth2/authorization/github?continue=https%3A%2F%2Fapp.example%2Forders%3Fpage%3D2')
  assert.deepEqual(readSignInSession(), { providerId: 'github', kind: 'redirect' })
})

test('an expired session is refreshed at boot; loginOnStart false loads without one', async () => {
  reset()
  localStorage.setItem('__mateu_auth_token', 'old')
  localStorage.setItem('__mateu_auth_session', JSON.stringify({ providerId: 'acme', kind: 'oidc', refreshToken: 'r0', expiresAt: 1 }))
  const { doc } = page({ providers: [acme] }, { tokenAnswer: () => json({ access_token: 'renewed' }) })
  assert.equal(await bootSignIn('', doc), true)
  assert.equal(storedSignInToken(), 'renewed')
  reset()
  const off = page({ loginOnStart: false, providers: [acme] })
  assert.equal(await bootSignIn('', off.doc), true)
  assert.equal(await refreshSignIn(signInConfigOf({ providers: [acme] })), false)
})

test('a 401 nobody claims reaches the built-in through resilience.mjs: refreshed and resent', async () => {
  reset()
  const { doc } = page({ providers: [acme, github] }, { tokenAnswer: () => json({ access_token: 'new' }) })
  globalThis.document = doc
  globalThis.CustomEvent = FakeEvent
  try {
    await bootSignIn('', doc)
    localStorage.setItem('__mateu_auth_token', 'old')
    localStorage.setItem('__mateu_auth_session', JSON.stringify({ providerId: 'acme', kind: 'oidc', refreshToken: 'r0', expiresAt: 9e12 }))
    assert.equal(await askForReauthentication(), true)
    assert.equal(storedSignInToken(), 'new')
    // no refresh token: the chooser, which the user may decline → the request fails as always
    localStorage.removeItem('__mateu_auth_session')
    let options = null
    setSignInEnv({ choose: async (o) => { options = o; return null }, fetch: async () => json({}, 404) })
    assert.equal(await askForReauthentication(), false)
    assert.equal(options.cancellable, true)
    // a page that claims the event still wins
    let claimed = 0
    const claim = (e) => { claimed++; e.preventDefault(); e.detail.retry() }
    doc.addEventListener('mateu-session-expired', claim)
    assert.equal(await askForReauthentication(), true)
    doc.removeEventListener('mateu-session-expired', claim)
    assert.equal(claimed, 1)
  } finally {
    delete globalThis.document
    delete globalThis.CustomEvent
  }
})

test('sign-out: end_session with id_token_hint, else logoutUrl', async () => {
  reset()
  localStorage.setItem('__mateu_auth_token', 't')
  localStorage.setItem('__mateu_auth_session', JSON.stringify({ providerId: 'acme', kind: 'oidc', idToken: 'idt' }))
  const a = page({ providers: [acme], logoutUrl: '/logout' })
  await bootSignIn('/admin', a.doc)
  await signOut()
  assert.equal(storedSignInToken(), null)
  const url = new URL(a.state.assigned.at(-1))
  assert.equal(url.origin + url.pathname, DISCOVERY.end_session_endpoint)
  assert.equal(url.searchParams.get('id_token_hint'), 'idt')
  assert.equal(url.searchParams.get('post_logout_redirect_uri'), 'https://app.example/admin/')
  reset()
  localStorage.setItem('__mateu_auth_session', JSON.stringify({ providerId: 'github', kind: 'redirect' }))
  const b = page({ providers: [github], logoutUrl: '/logout' })
  await bootSignIn('', b.doc)
  await signOut()
  assert.equal(b.state.assigned.at(-1), 'https://app.example/logout')
})

test('the chooser: a labelled modal dialog, focus on the first provider, Tab stays inside, Esc only when declinable', async () => {
  const { doc } = makeDom()
  const providers = signInConfigOf({ providers: [acme, github] }).providers
  const chosen = showSignInChooser(doc, { providers, cancellable: false })
  const dialog = doc.querySelector('[role="dialog"]')
  assert.equal(dialog.getAttribute('aria-modal'), 'true')
  assert.equal(doc.getElementById(dialog.getAttribute('aria-labelledby')).textContent, 'Sign in')
  const buttons = doc.querySelectorAll('button.mateu-sign-in-provider')
  assert.deepEqual(buttons.map((b) => b.textContent), ['⚿Continue with Acme', 'GContinue with GitHub'])
  assert.equal(doc.activeElement, buttons[0])
  const overlay = doc.querySelector('.mateu-sign-in')
  overlay.dispatchEvent(new FakeEvent('keydown', { key: 'Tab', bubbles: true }))
  assert.equal(doc.activeElement, buttons[1])
  overlay.dispatchEvent(new FakeEvent('keydown', { key: 'Tab', bubbles: true }))
  assert.equal(doc.activeElement, buttons[0])
  overlay.dispatchEvent(new FakeEvent('keydown', { key: 'Escape', bubbles: true }))
  assert.ok(doc.querySelector('.mateu-sign-in'), 'Esc does not dismiss at boot')
  buttons[1].click()
  assert.equal((await chosen).id, 'github')
  assert.equal(doc.querySelector('.mateu-sign-in'), null)

  const declinable = showSignInChooser(doc, { providers, cancellable: true, message: 'Signing in did not work.' })
  assert.equal(doc.querySelector('[role="alert"]').textContent, 'Signing in did not work.')
  doc.querySelector('.mateu-sign-in').dispatchEvent(new FakeEvent('keydown', { key: 'Escape', bubbles: true }))
  assert.equal(await declinable, null)
})

for (const { name, fn } of queue) {
  try {
    await fn()
    passed++
  } catch (e) {
    console.error('✗ ' + name)
    console.error(e)
    process.exit(1)
  }
}
reset()
console.log(`test-sign-in: ${passed} OK`)
