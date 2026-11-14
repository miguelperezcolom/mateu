import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { agentNavigationFieldsOf, applyChatEvent, type ChatNavigation } from './chatStream.ts';
import { trustedNavigationOf } from './uiEvents.ts';
import { MateuSession } from './MateuSession.ts';

// S7: the `navigations` section of conformance/client/agent-events.json — the same cases the web
// (agentEvents.trustedNavigationOf) and Redwood (chatNavigationOf) run. An agent's
// navigation-requested carries WHERE TO GO only; a menu leaf's rules and an actionId never travel.

const corpus = JSON.parse(readFileSync(
  fileURLToPath(new URL('../../../../../conformance/client/agent-events.json', import.meta.url)), 'utf8',
)) as { navigations: { name: string; detail: unknown; expected: Record<string, string> }[] };

for (const c of corpus.navigations) {
  test(`S7 corpus: ${c.name}`, () => {
    assert.deepEqual(agentNavigationFieldsOf(c.detail), c.expected);
  });
}

test('S7: a pushed navigation carrying rules and an actionId opens the place and runs nothing', () => {
  const session = new MateuSession('https://app.example', 'sid', {}, null);
  const seen: ChatNavigation[] = [];
  session.navigateTo = (nav) => seen.push(nav);
  const hooks = {
    dispatch: () => false,
    navigate: (nav: ChatNavigation) => session.navigateTo(trustedNavigationOf(session, nav)),
    close: () => {},
    renderScreen: () => {},
  };
  const outcome = applyChatEvent({
    event: 'navigation-requested',
    detail: { route: '/orders', actionId: 'deleteEverything', rules: [{ action: 'RunAction', actionId: 'deleteEverything' }, { action: 'RunJS', value: 'alert(1)' }], baseUrl: '/_pod' },
  }, hooks);
  assert.equal(outcome, 'navigated');
  assert.equal(seen.length, 1);
  assert.equal(seen[0].actionId, '');
  assert.equal(seen[0].route, '/orders');
  assert.equal('rules' in seen[0], false);
  assert.equal(seen[0].baseUrl, '/_pod', 'a same-origin base url is kept');
  // an action alone is not a navigation
  assert.equal(applyChatEvent({ event: 'navigation-requested', detail: { actionId: 'deleteEverything' } }, hooks), 'ignored');
  // whatever built the navigation, the session never hands an action id on
  assert.equal(trustedNavigationOf(session, { route: '/x', consumedRoute: '', actionId: 'wipe' }).actionId, '');
});

// B1 (GA review 2): the `trustedNavigations` cases — a base url survives only for an origin the
// session trusts with the credentials (its backend, a remote its menu names); the desktop, the web
// and Redwood run the same cases.
const trusted = JSON.parse(readFileSync(
  fileURLToPath(new URL('../../../../../conformance/client/agent-events.json', import.meta.url)), 'utf8',
)) as { trustedNavigations: { name: string; shell: string; declared: string[]; detail: unknown; expected: Record<string, string> }[] };

test('B1: the corpus has trusted-navigation cases', () => assert.ok(trusted.trustedNavigations.length >= 5));

for (const c of trusted.trustedNavigations) {
  test(`B1 corpus: ${c.name}`, () => {
    const session = new MateuSession(c.shell, 'sid', {}, null);
    session.credentials.declare(c.shell, c.declared);
    const fields = agentNavigationFieldsOf(c.detail) as ChatNavigation;
    const place = trustedNavigationOf(session, { ...fields, consumedRoute: fields.consumedRoute ?? '' });
    const { actionId: _a, consumedRoute: _c, ...rest } = place;
    assert.deepEqual(rest, c.expected);
    // navigating never makes an origin trusted
    if (!('baseUrl' in c.expected)) {
      assert.equal(session.credentials.mayCarryCredentials((c.detail as { baseUrl: string }).baseUrl), false);
    }
  });
}
