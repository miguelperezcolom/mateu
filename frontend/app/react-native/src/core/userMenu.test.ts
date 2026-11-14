import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  USER_MENU_LANGUAGES,
  headerAccountControl,
  initialsOf,
  pictureOf,
  signedInUserOf,
  userMenuLabel,
  userMenuTexts,
} from './userMenu.ts';
import { CHROME_LANGUAGES } from './chromeLanguage.ts';

// the same cases as libs/mateu infra/ui/userMenu.test.ts: the rules are one rule

test('draws up to two initials, the first and the last word', () => {
  assert.equal(initialsOf('Ana María López'), 'AL');
  assert.equal(initialsOf('miguelperezcolom'), 'M');
  assert.equal(initialsOf('ana.lopez@example.com'), 'AL');
  assert.equal(initialsOf('élodie durand'), 'ÉD');
  assert.equal(initialsOf('   '), '?');
  assert.equal(initialsOf('Иван Петров'), 'ИП');
});

test('draws only an http(s) picture', () => {
  assert.equal(pictureOf({ name: 'a', picture: 'https://avatars.example/1' }), 'https://avatars.example/1');
  assert.equal(pictureOf({ name: 'a', picture: 'javascript:alert(1)' }), undefined);
  assert.equal(pictureOf({ name: 'a', picture: 'data:image/png;base64,AAAA' }), undefined);
  assert.equal(pictureOf({ name: 'a' }), undefined);
});

test('shows the menu for a named user, the bare Sign out for an unnamed session, else nothing', () => {
  assert.equal(headerAccountControl({ name: 'Ana' }, true), 'menu');
  assert.equal(headerAccountControl({ name: 'Ana' }, false), 'menu');
  assert.equal(headerAccountControl(undefined, true), 'signOut');
  assert.equal(headerAccountControl(undefined, false), 'none');
});

test('reads the wire user: a name is required', () => {
  assert.deepEqual(signedInUserOf({ name: 'Ana', email: 'ana@example.com', picture: 'https://p/1' }), {
    name: 'Ana',
    email: 'ana@example.com',
    picture: 'https://p/1',
  });
  assert.deepEqual(signedInUserOf({ name: 'Ana', email: ' ' }), { name: 'Ana', email: undefined, picture: undefined });
  assert.equal(signedInUserOf({ name: '  ' }), undefined);
  assert.equal(signedInUserOf({ email: 'x@y' }), undefined);
  assert.equal(signedInUserOf(null), undefined);
  assert.equal(signedInUserOf('Ana'), undefined);
});

test('speaks the six chrome languages', () => {
  assert.deepEqual([...USER_MENU_LANGUAGES].sort(), [...CHROME_LANGUAGES].sort());
  assert.equal(userMenuLabel({ name: 'Ana' }, 'es-ES'), 'Cuenta: Ana');
  assert.equal(userMenuLabel({ name: 'Ana' }, 'fr'), 'Compte : Ana');
  assert.equal(userMenuLabel({ name: 'Ana' }, 'nl'), 'Account: Ana');
  assert.equal(userMenuTexts('de').signOut, 'Abmelden');
  for (const lang of USER_MENU_LANGUAGES) {
    const t = userMenuTexts(lang);
    assert.ok(t.userMenuOf.includes('{name}'), lang);
    assert.ok(t.signOut.trim(), lang);
  }
});
