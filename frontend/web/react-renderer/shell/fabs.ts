import { useEffect, useSyncExternalStore } from 'react'
import { tx } from '@mr/i18n/texts'

/** A floating action button as the wire carries it (FabDto). */
export interface FabLike {
  id?: string | null
  label?: string | null
  actionId?: string | null
  icon?: string | null
}

/** One FAB on screen: what it shows and what pressing it does. */
export interface ShownFab {
  key: string
  label: string
  icon?: string | null
  /** The accessible name of an icon-only button: its action, humanised. */
  name: string
  run: () => void
}

/** `createOrder` / `create-order` → "Create order". */
export const humanizeId = (raw: string): string => {
  const words = raw.replace(/[-_]+/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2').trim().toLowerCase()
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : tx('action')
}

/**
 * The PAGE's floating buttons. A page registers them here (usePageFabs) instead of drawing them
 * itself, so the global layer stacks every floating button — the page's, the app's, the command
 * center, the assistant — in ONE column at the bottom right, and none covers another.
 */
class PageFabStore {
  private entries = new Map<number, ShownFab[]>()
  private seq = 0
  private listeners = new Set<() => void>()
  private snapshot: ShownFab[] = []

  set(fabs: ShownFab[]): () => void {
    const id = ++this.seq
    this.entries.set(id, fabs)
    this.emit()
    return () => {
      this.entries.delete(id)
      this.emit()
    }
  }

  subscribe = (l: () => void) => {
    this.listeners.add(l)
    return () => { this.listeners.delete(l) }
  }

  get = () => this.snapshot

  private emit() {
    this.snapshot = [...this.entries.values()].flat()
    this.listeners.forEach((l) => l())
  }
}

export const pageFabs = new PageFabStore()

export const usePageFabList = () => useSyncExternalStore(pageFabs.subscribe, pageFabs.get)

/** A page's `fabs` (PageDto / FormDto), shown in the global FAB column while the page is on screen. */
export function usePageFabs(fabs: FabLike[] | null | undefined, run: (actionId: string) => void, labelOf: (label: string) => string = (l) => l) {
  const signature = JSON.stringify(fabs ?? [])
  useEffect(() => {
    const list = (fabs ?? []).filter((f) => f && (f.actionId || f.id))
    if (list.length === 0) return undefined
    return pageFabs.set(list.map((f, i) => ({
      key: `page-${i}-${f.actionId ?? f.id}`,
      label: f.label ? labelOf(f.label) : '',
      icon: f.icon,
      name: humanizeId(String(f.actionId ?? f.id ?? '')),
      run: () => run(String(f.actionId ?? f.id ?? '')),
    })))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])
}
