import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { MateuSession, NavTarget, OverlayOpenerContext } from '@rn/core/MateuSession'
import { MateuViewController, type RenderedView } from '@rn/core/MateuViewController'
import { firstComponentFragment } from '@rn/core/chatStream'
import { ViewBody } from './ViewBody'
import { setContentController } from '../shell/header/appLevel'
import { PresenceChip } from '../shell/header/LiveHeader'

const ControllerContext = createContext<MateuViewController | null>(null)

/** The controller of the view a component belongs to: fields write state through it, buttons run actions. */
export function useController(): MateuViewController {
  const c = useContext(ControllerContext)
  if (!c) throw new Error('useController must be used inside a ViewHost')
  return c
}

export const ControllerProvider = ControllerContext.Provider

/** An embedded micro frontend's declared chrome (NONE | COMPACT | PAGE): what its page header keeps. */
const ChromeContext = createContext<string | null>(null)
export const useEmbeddedChrome = () => useContext(ChromeContext)

interface Props {
  session: MateuSession
  /** A route to load. */
  target?: NavTarget
  /** An inline ServerSide node to mount (an island, an overlay's content). */
  serverSideNode?: unknown
  /** The navigation context of the view that opened an overlay. */
  opener?: OverlayOpenerContext
  embedded?: boolean
  /** An answer the host already holds (a micro frontend the server resolved): painted without asking. */
  preview?: { increment: unknown; route: string; consumedRoute: string; serverSideType?: string }
  /** A micro frontend's declared chrome: sent as embeddedChrome, and what its page header keeps. */
  chrome?: string | null
  /** The view's controller, once: the shell tells the assistant what is on screen through it. */
  onController?: (controller: MateuViewController) => void
  onNavigate?: (target: NavTarget, replace?: boolean) => void
}

/**
 * Hosts ONE Mateu view: owns its MateuViewController (the React Native renderer's controller, as
 * is) and re-renders on every increment it applies. The web twin of RN's MateuViewHost, without
 * its native concerns (keyboard avoidance, the FAB band, the screen stack).
 */
export function ViewHost({ session, target, serverSideNode, opener, embedded, preview, chrome, onController, onNavigate }: Props) {
  const controller = useMemo(() => new MateuViewController(session), [session])
  const [view, setView] = useState<RenderedView>(controller.rendered)

  useEffect(() => {
    controller.onRender = (v) => setView({ ...v })
    controller.windowless = !!embedded || !!serverSideNode
    controller.embeddedChrome = chrome ?? undefined
    controller.confirmDiscard = () => session.confirmDiscard()
    if (onNavigate) {
      controller.detailOpener = (t) => onNavigate(t)
      controller.stackNavigator = (t, replaceTop) => onNavigate(t, replaceTop)
    }
    if (serverSideNode) {
      if (opener) {
        controller.currentRoute = opener.route
        controller.currentConsumedRoute = opener.consumedRoute
        controller.currentServerSideType = opener.serverSideType
        // a selector picked in a lookup's dialog writes its value into the form that opened it
        controller.openerController = (opener.controller as MateuViewController | undefined) ?? null
      }
      controller.mountServerSide(serverSideNode)
    } else if (preview) {
      controller.currentRoute = preview.route
      controller.currentConsumedRoute = preview.consumedRoute
      if (preview.serverSideType) controller.currentServerSideType = preview.serverSideType
      const fragment = firstComponentFragment(preview.increment)
      const increment = (preview.increment as Record<string, unknown> | null) ?? {}
      controller.applyIncrement({ ...increment, fragments: fragment ? [fragment] : [] })
    } else if (target) {
      void controller.navigate(target.route, target.consumedRoute, target.serverSideType)
    }
    onController?.(controller)
    // the screen on view: app-level answers (header actions) apply to it
    const isContent = !!target && !embedded && !serverSideNode
    if (isContent) setContentController(session, controller)
    return () => {
      if (isContent) setContentController(session, null)
      controller.onRender = () => {}
      session.unsubscribeAll(controller)
      controller.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controller])

  const retry = () => {
    if (serverSideNode) controller.mountServerSide(serverSideNode)
    else if (target) void controller.navigate(target.route, target.consumedRoute, target.serverSideType)
  }

  return (
    <ControllerProvider value={controller}>
      <ChromeContext.Provider value={chrome ?? null}>
        {!!target && !embedded && !serverSideNode && <PresenceChip controller={controller} />}
        <ViewBody controller={controller} view={view} retry={retry} embedded={embedded || !!serverSideNode} />
      </ChromeContext.Provider>
    </ControllerProvider>
  )
}
