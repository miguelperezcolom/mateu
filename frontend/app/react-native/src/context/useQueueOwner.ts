import { useEffect, useRef, useState } from 'react';
import type { TokenProvider } from '../core/auth';
import { followSignIns, sameSessionFor } from '../core/outboxOwner';

/**
 * Who owns the offline send queue of a UI session (core/outboxOwner.ts), kept in step with who is
 * signed in — read when the session becomes `active` and again after every interactive sign-in a
 * 401 opened through `provider` (somebody else may sign in on a shared phone).
 *
 * `owner`: undefined while it is read (or while inactive), null = nobody (nothing is queued).
 * `generation`: the key of the session to mount — it moves only when a different PERSON signs in
 * ({@link sameSessionFor}): their screen and queue are not the previous person's. Somebody signing
 * in where nobody was keeps the session (and the screen) and only gets their own queue.
 */
export function useQueueOwner(
  active: boolean,
  provider: TokenProvider | null | undefined,
  ownerNow: () => Promise<string | null>,
  onOwner?: (owner: string | null) => void,
): { owner: string | null | undefined; generation: number; forget: () => void } {
  const [owner, setOwner] = useState<string | null | undefined>(undefined);
  const [generation, setGeneration] = useState(0);
  const sessionOwner = useRef<string | null | undefined>(undefined);
  const onOwnerRef = useRef(onOwner);
  onOwnerRef.current = onOwner;

  useEffect(() => {
    if (!active) return;
    let alive = true;
    const take = (next: string | null) => {
      if (!alive) return;
      if (!sameSessionFor(sessionOwner.current, next)) setGeneration((g) => g + 1);
      if (next) sessionOwner.current = next;
      setOwner(next);
      onOwnerRef.current?.(next);
    };
    void ownerNow().then(take, () => take(null));
    const stop = followSignIns(provider, ownerNow, take);
    return () => {
      alive = false;
      stop();
    };
  }, [active, provider, ownerNow]);

  /** Signed out: the next session starts from scratch (whoever signs in). */
  const forget = () => {
    sessionOwner.current = undefined;
    setOwner(undefined);
  };
  return { owner, generation, forget };
}
