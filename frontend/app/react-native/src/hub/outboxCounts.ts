import { useEffect, useState } from 'react';
import { OfflineQueue } from '../core/offlineQueue.ts';
import type { KeyValueStore } from '../core/sessionId.ts';

/** How many changes each UI of the hub list has waiting in its offline send queue (the list's
 *  "pending" badge), kept current as any queue changes. */
export function usePendingCounts(store: KeyValueStore, ids: string[]): Record<string, number> {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const key = ids.join('|');
  useEffect(() => {
    let alive = true;
    const count = async (id: string) => {
      const n = await OfflineQueue.countOf(store, id);
      if (alive) setCounts((c) => (c[id] === n ? c : { ...c, [id]: n }));
    };
    for (const id of ids) void count(id);
    const off = OfflineQueue.onAnyChange((id) => ids.includes(id) && void count(id));
    return () => {
      alive = false;
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, key]);
  return counts;
}
