/**
 * The cryptographically secure random source of the app. Hermes does not ship
 * `crypto.getRandomValues`, so App.tsx installs expo-crypto's ({@link installSecureRandom}) before
 * anything draws from it; on the web and in Node it is native. What must be unguessable — the live
 * push channel's secret (core/agentPush.ts) — draws through {@link secureRandomBytes}, which FAILS
 * rather than fall back to `Math.random()`: a predictable secret would let anyone who guesses it
 * take over the tab's agent channel.
 */

type Fill = <T extends Uint8Array>(bytes: T) => T;

const cryptoOf = () => (globalThis as { crypto?: { getRandomValues?: Fill } }).crypto;

/** Installs `getRandomValues` as `globalThis.crypto.getRandomValues` when the runtime has none. */
export function installSecureRandom(getRandomValues: Fill): void {
  if (cryptoOf()?.getRandomValues) return;
  const g = globalThis as unknown as { crypto?: Record<string, unknown> };
  const existing = g.crypto ?? {};
  try {
    existing['getRandomValues'] = getRandomValues;
    if (!g.crypto) g.crypto = existing;
  } catch {
    Object.defineProperty(globalThis, 'crypto', { value: { ...existing, getRandomValues }, configurable: true });
  }
}

/** Fills `bytes` from the secure source; throws when the runtime has none. */
export function secureRandomBytes(bytes: Uint8Array): Uint8Array {
  const c = cryptoOf();
  if (!c?.getRandomValues) throw new Error('No cryptographically secure random source (crypto.getRandomValues)');
  return c.getRandomValues(bytes);
}
