import { useEffect, useState } from 'react';
import { OfflineQueue } from '../core/offlineQueue.ts';
import { storedOwnerOf } from '../core/outboxOwner.ts';
import type { KeyValueStore } from '../core/sessionId.ts';
import { manifestProviders, type UiManifest } from './manifest.ts';
import { uiSecretKeys } from './uiStore.ts';

/** What the badge needs of a hub entry: its id and whether it signs in. */
export interface CountedUi {
  id: string;
  manifest?: Pick<UiManifest, 'auth' | 'providers'>;
}

/** Whose queue a UI's badge counts now: the identity its stored tokens sign in as, nobody when it
 *  signs in and nobody is signed in, the anonymous owner when it does not sign in. */
export function badgeOwnerOf(store: KeyValueStore, ui: CountedUi): Promise<string | null> {
  return storedOwnerOf(store, uiSecretKeys(ui.id).tokens, manifestProviders(ui.manifest).length > 0);
}

/** How many changes each UI of the hub list has waiting in its offline send queue (the list's
 *  "pending" badge) — the queue of whoever is signed in to it now, never another user's (a
 *  suspended queue is not counted) — kept current as any queue changes or someone signs in/out. */
export function usePendingCounts(store: KeyValueStore, uis: CountedUi[]): Record<string, number> {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const key = uis.map((u) => `${u.id}:${manifestProviders(u.manifest).length > 0}`).join('|');
  useEffect(() => {
    let alive = true;
    const count = async (ui: CountedUi) => {
      const n = await OfflineQueue.countOf(store, ui.id, await badgeOwnerOf(store, ui));
      if (alive) setCounts((c) => (c[ui.id] === n ? c : { ...c, [ui.id]: n }));
    };
    for (const ui of uis) void count(ui);
    const off = OfflineQueue.onAnyChange((id) => {
      const ui = uis.find((u) => u.id === id);
      if (ui) void count(ui);
    });
    return () => {
      alive = false;
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, key]);
  return counts;
}
