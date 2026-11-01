import type { KeyValueStore } from '../core/sessionId.ts';
import { randomUuid } from '../core/sessionId.ts';
import { uiSecretKeys } from './uiStore.ts';

/**
 * The X-Session-Id of ONE UI (pure, unit-tested). The single-backend renderer has one per install;
 * the hub draws one per UI, so two unrelated servers never see the same identifier for this phone.
 */
export async function uiSessionId(store: KeyValueStore, uiId: string, make: () => string = () => randomUuid()): Promise<string> {
  const key = uiSecretKeys(uiId).sessionId;
  try {
    const existing = await store.get(key);
    if (existing) return existing;
  } catch {
    return make();
  }
  const id = make();
  await store.set(key, id).catch(() => {});
  return id;
}

/**
 * Whether the hub's own top bar offers "Sign out" for the open UI: when the UI signs in and is on
 * screen. A UI whose app shell has a drawer CLAIMS the bar (the drawer has its own entry) and the bar
 * is not drawn at all then; a bottom-tabs shell, or one with no menu, keeps the hub's bar — which, before
 * this, left no way to sign out of it but removing the UI.
 */
export function hubBarSignsOut(signsIn: boolean, phase: string): boolean {
  return signsIn && phase === 'ready';
}
