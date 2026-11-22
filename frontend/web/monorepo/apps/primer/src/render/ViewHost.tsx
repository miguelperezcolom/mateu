import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { MateuSession, NavTarget, OverlayOpenerContext } from '@rn/core/MateuSession'
import { MateuViewController, type RenderedView } from '@rn/core/MateuViewController'
import { ViewBody } from './ViewBody'

const ControllerContext = createContext<MateuViewController | null>(null)

/** The controller of the view a component belongs to: fields write state through it, buttons run actions. */
export function useController(): MateuViewController {
  const c = useContext(ControllerContext)
  if (!c) throw new Error('useController must be used inside a ViewHost')
  return c
}

export const ControllerProvider = ControllerContext.Provider

interface Props {
  session: MateuSession
  /** A route to load. */
  target?: NavTarget
  /** An inline ServerSide node to mount (an island, an overlay's content). */
  serverSideNode?: unknown
  /** The navigation context of the view that opened an overlay. */
  opener?: OverlayOpenerContext
  embedded?: boolean
  onNavigate?: (target: NavTarget, replace?: boolean) => void
}

/**
 * Hosts ONE Mateu view: owns its MateuViewController (the React Native renderer's controller, as
 * is) and re-renders on every increment it applies. The web twin of RN's MateuViewHost, without
 * its native concerns (keyboard avoidance, the FAB band, the screen stack).
 */
export function ViewHost({ session, target, serverSideNode, opener, embedded, onNavigate }: Props) {
  const controller = useMemo(() => new MateuViewController(session), [session])
  const [view, setView] = useState<RenderedView>(controller.rendered)

  useEffect(() => {
    controller.onRender = (v) => setView({ ...v })
    controller.windowless = !!embedded || !!serverSideNode
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
      }
      controller.mountServerSide(serverSideNode)
    } else if (target) {
      void controller.navigate(target.route, target.consumedRoute, target.serverSideType)
    }
    return () => {
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
      <ViewBody controller={controller} view={view} retry={retry} embedded={embedded || !!serverSideNode} />
    </ControllerProvider>
  )
}
