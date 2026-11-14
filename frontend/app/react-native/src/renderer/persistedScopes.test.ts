import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { KeyValueStore } from '../core/sessionId.ts';
import { PersistedScopes, clearListingPrefsOf, listingPrefsStorage, listingScopeOf, setListingPrefsStorage } from './persistedScopes.ts';

class Scopes extends PersistedScopes<string> {
  get(scope: string) {
    return this.read(scope);
  }
  put(scope: string, value: string | undefined) {
    this.write(scope, value);
  }
}

function memoryKv(initial: Record<string, string> = {}, failing: string[] = []): KeyValueStore & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    data,
    get: async (k) => data.get(k) ?? null,
    set: async (k, v) => void data.set(k, v),
    remove: async (k) => {
      if (failing.includes(k)) throw new Error('unavailable');
      data.delete(k);
    },
  };
}

test('whenReady waits for what was stored; an unsubscribed listener hears no more loads', async () => {
  const s = new Scopes('views');
  await s.whenReady(); // nothing attached: at once
  let heard = 0;
  const off = s.subscribe(() => heard++);
  const kv = memoryKv({ 'views:ui-a': JSON.stringify({ '#orders': 'mine' }) });
  void s.attach(kv, 'ui-a');
  await s.whenReady();
  assert.equal(s.get('#orders'), 'mine');
  assert.equal(heard, 1);
  off();
  void s.attach(memoryKv({ 'views:ui-b': JSON.stringify({ '#x': 'y' }) }), 'ui-b');
  await s.whenReady();
  assert.equal(s.get('#orders'), undefined); // the previous UI's choices are gone
  assert.equal(s.get('#x'), 'y');
  assert.equal(heard, 1);
});

test('the listing prefs store is set once at boot; clearing a UI forgets both kinds, even when one remove fails', async () => {
  assert.equal(listingPrefsStorage(), null);
  const kv = memoryKv({ 'mateu-saved-views:ui-a': '{}', 'mateu-column-prefs:ui-a': '{}', 'mateu-column-prefs:ui-b': '{}' }, ['mateu-saved-views:ui-a']);
  setListingPrefsStorage(kv);
  assert.equal(listingPrefsStorage(), kv);
  await clearListingPrefsOf(kv, 'ui-a');
  assert.deepEqual([...kv.data.keys()].sort(), ['mateu-column-prefs:ui-b', 'mateu-saved-views:ui-a']);
  setListingPrefsStorage(null);
  assert.equal(listingPrefsStorage(), null);
  assert.equal(listingScopeOf('/orders/', 'crud'), 'orders#crud');
  assert.equal(listingScopeOf(null, undefined), '#');
});
