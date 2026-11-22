import { useEffect, useState } from 'react'
import type { MateuSession } from '@rn/core/MateuSession'
import { AGENT_CHANNEL_ACTION, AgentChannel, agentActionRequest, type AgentAppMeta } from '@rn/core/agentPush'
import { AGENT_SCREEN_ACTION, answerParameters, answerQuery, waitIdle } from '@rn/core/agentScreen'
import { applyUiEvent } from '@rn/core/uiEvents'
import { announceLive } from '@rn/a11y/a11y'
import { tx } from '../i18n/texts'

type Dict = Record<string, unknown>

export const agentMetaOf = (app: Dict): AgentAppMeta & { agentPush?: boolean; homeRoute?: string } => app as never

const metaOf = (app: Dict): AgentAppMeta & { agentPush?: boolean; homeRoute?: string } => app as never

/**
 * LIVE UI PUSH (`AppDto.agentPush`, MCP phase C): an AI agent the user paired sends screens to THIS
 * tab. The RN core runs it all — the `_agent-channel` stream, pairing, the agent's queries answered
 * from what this tab shows (agentScreen) — and every pushed event goes through the very function
 * the assistant's events go through (uiEvents). The channel is open while the tab is visible (the
 * server keeps a pairing 120 s after its stream ends, so switching tabs does not lose it).
 */
/** `renderer` is the name the live-push session gives (the server only logs it): 'primer', 'ui5'… */
export function useAgentChannel(session: MateuSession, app: Dict, renderer: string) {
  const meta = agentMetaOf(app)
  useEffect(() => {
    if (!meta.agentPush) return undefined
    const channel = new AgentChannel({
      state: session.agent,
      request: () => agentActionRequest(meta, AGENT_CHANNEL_ACTION, session.agent.session, session.appState, {
        route: session.currentScreen()?.route ?? meta.homeRoute ?? meta.rootRoute ?? '',
        renderer,
      }),
      open: (request, onIncrement, signal) => session.api.runActionStream(request as never, onIncrement, signal),
      onEvent: (event) => {
        applyUiEvent(session, event)
        if (event.event === 'render-screen') announceLive(tx('agentSentScreen'), false)
      },
      onAnnounce: (text) => announceLive(text, false),
      onQuery: (query) => {
        if (session.agent.stoppedByUser) return
        session.agentScreen.noteQuery()
        void answerQuery(query, {
          registry: session.agentScreen,
          appState: session.appState,
          idle: () => waitIdle(() => session.activity.busy, (l) => session.activity.subscribe(l)),
        }).then((answer) => session.api.runAction({
          ...agentActionRequest(meta, AGENT_SCREEN_ACTION, session.agent.session, session.appState, answerParameters(query, answer)),
          background: true,
        } as never)).catch(() => undefined)
      },
      log: () => undefined,
    })
    const visible = () => document.visibilityState === 'visible'
    const onVisibility = () => (visible() ? channel.start() : channel.stop())
    document.addEventListener('visibilitychange', onVisibility)
    const offStopped = session.agent.subscribe(() => {
      if (session.agent.stoppedByUser) channel.stop()
      else if (visible()) channel.start()
    })
    if (visible()) channel.start()
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      offStopped()
      channel.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.agentPush, meta.serverSideType, meta.rootRoute, session])
}

/** The pairing's status (connected, waiting…), kept current. */
export function useAgentStatus(session: MateuSession) {
  const [, setVersion] = useState(0)
  useEffect(() => session.agent.subscribe(() => setVersion((v) => v + 1)), [session])
  return session.agent.status
}

