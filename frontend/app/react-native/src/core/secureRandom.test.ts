import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installSecureRandom, secureRandomBytes } from './secureRandom.ts';
import { newUiSessionIdentity } from './agentPush.ts';

const g = globalThis as { crypto?: unknown };

test('the push channel secret never falls back to Math.random: no secure source, no secret', () => {
  const saved = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  try {
    Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true, writable: true });
    assert.throws(() => newUiSessionIdentity(), /cryptographically secure/);
    assert.throws(() => secureRandomBytes(new Uint8Array(4)), /cryptographically secure/);
    // the app installs expo-crypto's source (App.tsx): then it works
    let calls = 0;
    installSecureRandom(<T extends Uint8Array>(b: T) => { calls++; b.fill(7); return b; });
    const id = newUiSessionIdentity();
    assert.equal(id.secret, '07'.repeat(32));
    assert.ok(calls > 0);
  } finally {
    if (saved) Object.defineProperty(globalThis, 'crypto', saved);
    else delete g.crypto;
  }
});

test('a native source is kept as it is', () => {
  const before = (globalThis as { crypto?: { getRandomValues?: unknown } }).crypto?.getRandomValues;
  installSecureRandom(<T extends Uint8Array>(b: T) => b);
  assert.equal((globalThis as { crypto?: { getRandomValues?: unknown } }).crypto?.getRandomValues, before);
  assert.equal(secureRandomBytes(new Uint8Array(16)).length, 16);
});
