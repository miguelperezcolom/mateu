import React from 'react'
import type { Catalogue, CatalogueProps } from './types'
import { LAZY_FAMILIES, type LazyFamily } from './families'
import { structure } from './structure'

/**
 * The wire types drawn outside the core switch (ComponentRenderer), grouped by family. display,
 * status and visual load on demand — a screen pays only for the families it draws, and all of them
 * are fetched once the first screen is up (`preloadCatalogue`), so a later screen rarely waits.
 * structure stays in the main chunk: it is small and registers `window.MateuPrimer` at boot.
 */
const LOADERS: Record<LazyFamily, () => Promise<Catalogue>> = {
  display: () => import('./display').then((m) => m.display),
  status: () => import('./status').then((m) => m.status),
  visual: () => import('./visual').then((m) => m.visual),
}

const loading = new Map<LazyFamily, Promise<Catalogue>>()
const familyOf = (f: LazyFamily): Promise<Catalogue> => {
  let p = loading.get(f)
  if (!p) {
    p = LOADERS[f]()
    // a failed chunk (a deploy replaced it) must be fetchable again on the next render
    p.catch(() => loading.delete(f))
    loading.set(f, p)
  }
  return p
}

const lazyTypes: Catalogue = {}
for (const [family, types] of Object.entries(LAZY_FAMILIES) as [LazyFamily, readonly string[]][]) {
  for (const type of types) {
    lazyTypes[type] = React.lazy(async () => {
      const drawn = (await familyOf(family))[type]
      return { default: drawn ?? (() => null) } as { default: React.ComponentType<CatalogueProps> }
    })
  }
}

export const CATALOGUE: Catalogue = { ...lazyTypes, ...structure }

/** Fetches every lazy family while the browser is idle (called once the first screen is drawn). */
export function preloadCatalogue(): void {
  const run = () => (Object.keys(LOADERS) as LazyFamily[]).forEach((f) => void familyOf(f).catch(() => undefined))
  const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback
  if (idle) idle(run)
  else setTimeout(run, 1500)
}
