import { useEffect, useState } from 'react'
import { useController } from '@mr/render/ViewHost'

/**
 * Whether `actionId` is waiting for its answer on this view: the pressed button shows its design system's
 * loading state (and takes no second press) until the answer — or the client-side refusal — comes.
 * Subscribed, so the button repaints when its action settles, not only when its view does.
 */
export function usePending(actionId: string | null | undefined): boolean {
  const controller = useController()
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!actionId) return undefined
    return controller.subscribePending(() => setTick((t) => t + 1))
  }, [controller, actionId])
  return !!actionId && controller.isPending(actionId)
}
