import React, { createContext, useContext } from 'react'
import type { MateuViewController, RenderedView } from '@rn/core/MateuViewController'

/** What a renderer draws for one hosted view: its body (loading, failure, the component tree). */
export interface ViewBodyProps {
  controller: MateuViewController
  view: RenderedView
  retry: () => void
  embedded: boolean
}

/**
 * The views the SHARED tree hosts but cannot draw — each renderer app supplies them in its own
 * design system, once, at the root (`<RendererKitProvider kit={…}>`). ViewHost (shared) owns the
 * controller and its lifecycle; the kit's ViewBody draws what the controller rendered.
 */
export interface RendererKit {
  ViewBody: React.ComponentType<ViewBodyProps>
  /** Who else has the record on screen open (`@App(presence)`), drawn above a content view. */
  PresenceChip?: React.ComponentType<{ controller: MateuViewController }>
}

const KitContext = createContext<RendererKit | null>(null)

export const RendererKitProvider = KitContext.Provider

export function useRendererKit(): RendererKit {
  const kit = useContext(KitContext)
  if (!kit) throw new Error('a ViewHost must be inside a RendererKitProvider (the renderer app supplies its views)')
  return kit
}
