import { type ReactNode, useContext, useEffect, useState } from 'react';
import { ViewControllerContextForHooks } from './MateuViewHost';

/**
 * Whether `actionId` is in flight on the view this control belongs to: the pressed control shows
 * itself busy (and takes no second press) until the answer arrives — the web's pendingIndicator.
 * Outside a view host (a shell's own button) it is never pending.
 */
export function usePendingAction(actionId: string | null | undefined): boolean {
  const controller = useContext(ViewControllerContextForHooks);
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!controller || !actionId) return undefined;
    return controller.subscribePending(() => setTick((t) => t + 1));
  }, [controller, actionId]);
  return !!controller && !!actionId && controller.isPending(actionId);
}

/** Render prop over usePendingAction, for a control drawn inside a switch (no hooks there). */
export function PendingAware({ actionId, children }: { actionId: string | null | undefined; children: (pending: boolean) => ReactNode }): ReactNode {
  return children(usePendingAction(actionId));
}
