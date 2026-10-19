/**
 * Per-install session id (pure, unit-tested). Every Mateu request carries `X-Session-Id`; it used
 * to be the hard-coded 'native-session-1', so EVERY installation of the app shared one server-side
 * session. Now each install draws a random id once and keeps it in persistent storage, so it
 * survives restarts (same as a browser's session cookie surviving a reload) but is never shared.
 */

/** The minimal key/value persistence this needs (secure store on devices, localStorage on web). */
export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

import { secureRandomBytes } from './secureRandom.ts';

export const SESSION_ID_KEY = 'mateu.sessionId';

/** An RFC 4122 v4 UUID, from the secure random source (secureRandom.ts — App.tsx installs it on
 *  Hermes); throws when there is none. */
export function randomUuid(random: (bytes: Uint8Array) => Uint8Array = defaultRandom): string {
  const b = random(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

// the secure source or nothing: an X-Session-Id drawn from Math.random could be predicted (N9)
const defaultRandom = (bytes: Uint8Array): Uint8Array => secureRandomBytes(bytes);

/** The install's session id: read it, or create + persist it on first launch. A failing store
 *  still yields a usable (in-memory, per-launch) id rather than a shared constant. */
export async function installSessionId(store: KeyValueStore, make: () => string = () => randomUuid()): Promise<string> {
  try {
    const existing = await store.get(SESSION_ID_KEY);
    if (existing) return existing;
  } catch {
    return make();
  }
  const id = make();
  try {
    await store.set(SESSION_ID_KEY, id);
  } catch {
    // not persisted: this launch still gets its own id
  }
  return id;
}
