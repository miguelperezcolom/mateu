// The session's host hooks: a bare session's defaults are harmless (a screen may run before the
// shell wired them), a derived session (island / navigation to another backend) hands every host
// hook to the app's session AT CALL TIME, and the API client's callbacks reach the session's hosts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MateuSession, islandSession, navigationSession, type NavTarget } from './MateuSession.ts';

test('a bare session: the host hooks do nothing harmful before the shell wires them', async () => {
  const s = new MateuSession('https://app.example', 'sid', {}, null);
  s.notify(null, 'hi', 'info');
  s.reload();
  s.openView({ label: '', route: '/x', consumedRoute: '', serverSideType: '' });
  s.setTitle('t');
  s.openOverlay({}, {}, {});
  assert.equal(s.updateOverlayState('o', {}), false);
  s.closeTopOverlay();
  s.closeAssistant();
  assert.equal(await s.confirmDiscard(), true);
  assert.equal(await s.confirmAction({} as never), true);
  assert.equal(s.currentScreen(), null);
});

test('the api client asks the session: prompts only on screen, wire mismatch and build notices reach the toast host', () => {
  const s = new MateuSession('https://app.example', 'sid', {}, null);
  const toasts: { text: string; variant: string; sticky?: boolean }[] = [];
  s.notify = (_t, text, variant, options) => toasts.push({ text, variant, sticky: options?.sticky });
  assert.equal(s.api.mayPrompt(), true);
  s.onScreen = false;
  assert.equal(s.api.mayPrompt(), false, 'a hub UI kept mounted off screen never pops a sign-in');
  s.api.onWireMismatch('another wire major');
  s.api.onBuildNotice('updated');
  assert.equal(toasts[0].text, 'another wire major');
  assert.equal(toasts[0].variant, 'error');
  assert.equal(toasts[1].variant, 'warning');
  assert.equal(toasts[1].sticky, true);
});

test('a derived session hands every host hook to the app session, wired after it was created', async () => {
  const host = new MateuSession('https://app.example', 'sid', {}, null);
  const island = islandSession(host, 'https://rooms.example');
  assert.notEqual(island, host);
  // the shell wires its hooks LATER (effects): the island still reaches them
  const calls: string[] = [];
  host.notify = (_t, text) => calls.push(`notify:${text}`);
  host.confirmAction = async () => { calls.push('confirmAction'); return false; };
  host.confirmDiscard = async () => { calls.push('confirmDiscard'); return false; };
  host.openOverlay = (_c, _s, _d, opener) => calls.push(`overlay:${opener?.session === island}`);
  host.updateOverlayState = (id) => { calls.push(`update:${id}`); return true; };
  host.closeTopOverlay = () => calls.push('close');
  host.openView = (t: NavTarget) => calls.push(`open:${t.route}`);

  island.notify(null, 'saved', 'info');
  assert.equal(await island.confirmAction({} as never), false);
  assert.equal(await island.confirmDiscard(), false);
  island.openOverlay({}, {}, {});
  island.openOverlay({}, {}, {}, { route: '/r', consumedRoute: '', serverSideType: 'X' });
  assert.equal(island.updateOverlayState('d1', {}), true);
  island.closeTopOverlay();
  island.openView({ label: '', route: '/rooms', consumedRoute: '', serverSideType: '' });
  assert.deepEqual(calls, [
    'notify:saved', 'confirmAction', 'confirmDiscard', 'overlay:true', 'overlay:true', 'update:d1', 'close', 'open:/rooms',
  ]);
});

test('a navigation session names the shell bar; an island does not', () => {
  const host = new MateuSession('https://app.example', 'sid', {}, null);
  const titles: string[] = [];
  host.setTitle = (t) => titles.push(t);
  const nav = navigationSession(host, 'https://other.example');
  nav.setTitle('Planets');
  islandSession(host, 'https://rooms.example').setTitle('ignored');
  assert.deepEqual(titles, ['Planets']);
  assert.equal(navigationSession(host, 'https://app.example'), host, 'the own backend is the host session');
});

test('urls resolve against the session backend; a reattached task navigates through the app session', () => {
  const host = new MateuSession('https://app.example/base', 'sid', {}, null);
  assert.equal(host.backendUrl('https://cdn.example/a.png'), 'https://cdn.example/a.png');
  assert.match(host.backendUrl('/img/a.png'), /^https:\/\/app\.example\/.*img\/a\.png$/);
  const routes: string[] = [];
  host.openView = (t) => routes.push(t.route);
  const island = islandSession(host, 'https://rooms.example');
  island.reattachHost().navigate('/done');
  host.reattachHost().navigate('/also');
  assert.deepEqual(routes, ['/done', '/also']);
});

test('the assistant navigates like a menu click', () => {
  const s = new MateuSession('https://app.example', 'sid', {}, null);
  const opened: NavTarget[] = [];
  s.openView = (t) => opened.push(t);
  s.navigateTo({ route: '/planets', consumedRoute: '', serverSideType: undefined } as never);
  assert.deepEqual(opened, [{ label: '', route: '/planets', consumedRoute: '', serverSideType: '' }]);
});
