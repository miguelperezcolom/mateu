import React, { useEffect, useMemo, useState } from 'react'
import { Button, Dialog, Spinner, Stack, Text } from '@kit'
import { CopilotIcon, LinkIcon } from '@kit/icons'
import type { MateuSession } from '@rn/core/MateuSession'
import { AGENT_UNPAIR_ACTION, agentActionRequest } from '@rn/core/agentPush'
import { AgentPairingModel, connectAiEntry, type PairingButton } from '@rn/core/agentPairing'
import { agentOperatingTexts } from '@rn/core/agentOperatingTexts'
import { announceLive } from '@rn/a11y/a11y'
import { tx } from '@mr/i18n/texts'
import { agentMetaOf as metaOf, useAgentChannel as useSharedAgentChannel, useAgentStatus } from '@mr/shell/agentPush'

type Dict = Record<string, unknown>

/** The live-push channel, naming this renderer (the hook is shared). */
export function useAgentChannel(session: MateuSession, app: Dict) {
  useSharedAgentChannel(session, app, 'primer')
}

/** "Connect AI" on the header (shown only when push is on): opens the pairing dialog. */
export function ConnectAi({ session, app }: { session: MateuSession; app: Dict }) {
  const status = useAgentStatus(session)
  const [open, setOpen] = useState(false)
  if (!metaOf(app).agentPush) return null
  const entry = connectAiEntry(status)
  return (
    <>
      <Button size="small" variant="invisible" leadingVisual={entry.connected ? LinkIcon : CopilotIcon}
        aria-label={entry.label} aria-haspopup="dialog" onClick={() => setOpen(true)}
        className={entry.connected ? 'mateu-connect-ai is-connected' : 'mateu-connect-ai'}>
        {entry.text}
      </Button>
      {open && <ConnectAiDialog session={session} app={app} onClose={() => setOpen(false)} />}
    </>
  )
}

/** The pairing dialog: a one-time code with its countdown, then the connected agents and Disconnect. */
function ConnectAiDialog({ session, app, onClose }: { session: MateuSession; app: Dict; onClose: () => void }) {
  const meta = metaOf(app)
  const model = useMemo(() => new AgentPairingModel({
    state: session.agent,
    run: (actionId) => session.api.runAction(agentActionRequest(meta, actionId, session.agent.session, session.appState) as never),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [session, meta.serverSideType, meta.rootRoute])
  const [, setVersion] = useState(0)
  useEffect(() => {
    const detach = model.attach()
    const off = model.subscribe(() => setVersion((v) => v + 1))
    return () => { off(); detach() }
  }, [model])
  const showingCode = model.phase.name === 'code'
  useEffect(() => {
    if (!showingCode) return undefined
    const timer = setInterval(() => { const said = model.tick(); if (said) announceLive(said, false) }, 1000)
    return () => clearInterval(timer)
  }, [model, showingCode])
  const close = () => { model.reset(); onClose() }
  const press = (b: PairingButton) => {
    if (b.id === 'pair' || b.id === 'newCode') void model.pair().then((said) => said && announceLive(said, false))
    else if (b.id === 'unpair') void model.unpair().then((said) => said && announceLive(said, false))
    else close()
  }
  const view = model.view()
  return (
    <Dialog title={view.title} onClose={close} width="medium"
      footerButtons={view.buttons.map((b) => ({ content: b.label, buttonType: b.primary ? 'primary' : 'default', disabled: b.disabled, onClick: () => press(b) }))}>
      <Stack gap="normal">
        {!!view.intro && <Text as="p">{view.intro}</Text>}
        {view.connected && (
          <div aria-label={tx('agentConnectedTo', { agents: view.agentsText })}>
            <Text weight="semibold" className="mateu-header-muted">{tx('connectedTo')}</Text>
            <ul className="mateu-agents">{view.agents.map((a, i) => <li key={i}>{a}</li>)}</ul>
          </div>
        )}
        {!!view.code && (
          <div className="mateu-pairing-code">
            <span className="mateu-pairing-code__value" aria-label={view.codeLabel}>{view.code}</span>
            <Text as="p" size="small" className="mateu-header-muted" aria-label={view.countdownLabel}>Expires in {view.countdown}</Text>
            <Text as="p">{view.instruction}</Text>
          </div>
        )}
        {!!view.busy && <Stack direction="horizontal" gap="condensed" align="center"><Spinner size="small" /><Text>{view.busy}</Text></Stack>}
        {!!view.message && <Text as="p" role="alert" className="mateu-agent-error">{view.message}</Text>}
      </Stack>
    </Dialog>
  )
}

/**
 * "An AI agent is operating this screen" — a strip on top while an agent reads or operates this
 * UI, with Stop: every pairing removed (`_agent-unpair`) and the channel closed until the user
 * connects an agent again. Announced once when it appears.
 */
export function AgentOperatingNotice({ session, app }: { session: MateuSession; app: Dict }) {
  const registry = session.agentScreen
  const [, setVersion] = useState(0)
  useEffect(() => registry.subscribe(() => setVersion((v) => v + 1)), [registry])
  const operating = registry.operating()
  const until = registry.operatingUntil()
  useEffect(() => {
    if (!operating) return undefined
    const t = setTimeout(() => setVersion((v) => v + 1), Math.max(0, until - Date.now()) + 50)
    return () => clearTimeout(t)
  }, [operating, until])
  const texts = agentOperatingTexts(document.documentElement.lang || navigator.language)
  useEffect(() => { if (operating) announceLive(texts.operating, false) }, [operating, texts.operating])
  if (!metaOf(app).agentPush || !operating) return null
  const stop = () => {
    registry.stopOperating()
    void session.api.runAction(agentActionRequest(metaOf(app), AGENT_UNPAIR_ACTION, session.agent.session, session.appState) as never)
      .catch(() => undefined)
      .finally(() => { session.agent.stopByUser(); announceLive(texts.stopped, false) })
  }
  return (
    <div className="mateu-agent-operating" role="alert">
      <span className="mateu-agent-operating__dot" aria-hidden="true" />
      <Text weight="semibold">{texts.operating}</Text>
      <Button size="small" onClick={stop}>{texts.stop}</Button>
    </div>
  )
}
