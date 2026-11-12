import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  providerGlyph,
  providerName,
  rememberProvider,
  signInPlanFrom,
  signInPlanOf,
  signInProvidersFrom,
  signInTexts,
  signedInProviderOf,
} from './signInProviders.ts';

const auth = {
  type: 'oidc', issuer: 'https://accounts.google.com', clientId: 'g', loginOnStart: false,
  providers: [
    { id: 'google', type: 'oidc', label: 'Google', icon: 'google', issuer: 'https://accounts.google.com/', clientId: 'g', scopes: ['openid'] },
    { id: 'acme', type: 'oidc', issuer: 'https://id.acme.com/realms/acme', clientId: 'a', icon: 'acme-logo', audience: 'api' },
    { id: 'github', type: 'redirect', url: '/oauth2/authorization/github' },
  ],
};

test('a provider keeps its own issuer, client, scopes and audience; loginOnStart comes from the block', () => {
  const [g, a] = signInProvidersFrom(auth, 'mobile');
  assert.equal(g.issuer, 'https://accounts.google.com');
  assert.deepEqual(g.scopes, ['openid']);
  assert.equal(g.loginOnStart, false);
  assert.equal(a.audience, 'api');
  assert.equal(a.clientId, 'a');
});

test('labels fall back to the brand, then the host; unknown icons draw the key', () => {
  const [g, a] = signInProvidersFrom(auth, 'mobile');
  assert.equal(g.label, 'Google');
  assert.equal(a.label, 'id.acme.com');
  assert.equal(a.icon, 'key');
  const [m] = signInProvidersFrom({ providers: [{ id: 'microsoft', issuer: 'https://login.microsoftonline.com/common/v2.0', clientId: 'm' }] });
  assert.equal(m.label, 'Microsoft');
  assert.equal(m.icon, 'key', 'null icon → key');
});

test('a label is plain text with a cap', () => {
  const [p] = signInProvidersFrom({ providers: [{ id: 'x1', issuer: 'https://i.example', clientId: 'c', label: '‮Evil\u0000 ' + 'x'.repeat(80) }] });
  assert.ok(!p.label!.includes('‮'));
  assert.ok(p.label!.length <= 40);
});

test('the legacy single keys are provider default, for native apps only', () => {
  const legacy = { type: 'oidc', issuer: 'https://id.acme.com', clientId: 'c' };
  assert.deepEqual(signInProvidersFrom(legacy, 'mobile').map((p) => p.id), ['default']);
  assert.deepEqual(signInProvidersFrom(legacy, 'web'), []);
  assert.deepEqual(signInProvidersFrom('nonsense'), []);
});

test('plan: a held session skips the question; one provider goes straight; several ask, last used first', () => {
  const ps = signInProvidersFrom(auth, 'mobile');
  const tokens = { accessToken: 't', expiresAt: null, issuer: 'https://id.acme.com/realms/acme', clientId: 'a' };
  const held = signedInProviderOf(tokens, ps);
  assert.equal(held?.id, 'acme');
  assert.equal(signInPlanOf(ps, held, null).provider?.id, 'acme');
  const ask = signInPlanOf(ps, undefined, 'acme');
  assert.equal(ask.mode, 'chooser');
  assert.equal(ask.provider, undefined);
  assert.deepEqual(ask.ordered.map((p) => p.id), ['acme', 'google']);
  assert.equal(ask.lastUsed, 'acme');
  assert.equal(signInPlanOf(ps, undefined, 'gone').lastUsed, undefined);
  assert.equal(signInPlanOf([ps[0]], undefined, null).provider?.id, 'google');
  assert.equal(signedInProviderOf({ accessToken: 't', expiresAt: null, issuer: 'https://other', clientId: 'a' }, ps), undefined);
  assert.equal(signedInProviderOf(null, ps), undefined);
});

const memoryStore = (data: Record<string, string> = {}) => ({
  data,
  get: async (k: string) => data[k] ?? null,
  set: async (k: string, v: string) => void (data[k] = v),
  remove: async (k: string) => void delete data[k],
});

test('plan from the device: the stored tokens name the provider; the remembered one leads the chooser', async () => {
  const ps = signInProvidersFrom(auth, 'mobile');
  const store = memoryStore({ tok: JSON.stringify({ accessToken: 't', expiresAt: null, issuer: 'https://accounts.google.com', clientId: 'g' }) });
  assert.equal((await signInPlanFrom(ps, store, 'tok', 'rem')).provider?.id, 'google');
  const empty = memoryStore();
  await rememberProvider(empty, 'rem', { id: 'acme' });
  const plan = await signInPlanFrom(ps, empty, 'tok', 'rem');
  assert.equal(plan.provider, undefined);
  assert.equal(plan.ordered[0].id, 'acme');
  const broken = { get: async () => { throw new Error('locked'); }, set: async () => {}, remove: async () => {} };
  assert.equal((await signInPlanFrom(ps, broken, 'tok', 'rem')).mode, 'chooser');
  assert.equal((await signInPlanFrom([], empty, 'tok', 'rem')).mode, 'none');
});

test('glyphs are neutral: an initial or a key, never brand artwork', () => {
  assert.deepEqual(providerGlyph({ icon: 'google', label: 'Google' }), { kind: 'initial', text: 'G' });
  assert.deepEqual(providerGlyph({ icon: 'key', label: 'Acme' }), { kind: 'key' });
  assert.deepEqual(providerGlyph({ icon: 'github', label: '' }), { kind: 'key' });
});

test('texts in English and Spanish', () => {
  assert.equal(signInTexts('en').continueWith('Google'), 'Continue with Google');
  assert.equal(signInTexts('es').continueWith('Google'), 'Continuar con Google');
  assert.equal(signInTexts('de').continueWith('Google'), 'Weiter mit Google');
  for (const lang of ['en', 'es', 'fr', 'de', 'pt', 'it'] as const) {
    const texts = signInTexts(lang);
    // every sentence names what it is given
    assert.ok(texts.title('Acme').includes('Acme'), lang);
    assert.ok(texts.single('id.acme.com').includes('id.acme.com'), lang);
    assert.ok(texts.continueWith('Google').includes('Google'), lang);
    assert.ok(texts.noPassword && texts.cancelled && texts.signIn && texts.lastUsed && texts.intro, lang);
  }
  assert.equal(providerName({ issuer: 'https://id.acme.com/x' }), 'id.acme.com');
});
