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
