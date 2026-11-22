import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Heading, IconButton, Text, Textarea } from '@primer/react'
import { EyeIcon, PaperAirplaneIcon, XIcon } from '@primer/octicons-react'
import { marked } from 'marked'
import type { MateuSession } from '@rn/core/MateuSession'
import {
  CHAT_TEXTS, ChatTurn, applyChatEvent, chatLinkNavigation, chatRequestBody, menuContextOf, resolveChatUrl, usageLine,
  type ChatTurnUpdate,
} from '@rn/core/chatStream'
import { uiEventHooks } from '@rn/core/uiEvents'
import { sanitizeHtml } from '../../render/safeHtml'
import { deferAgentEvent, isViewMovingAgentEvent, type DeferredAgentAction } from '@infra/ui/chatFollow.ts'
import { loadChatFollow, saveChatFollow } from '@infra/ui/chatPanel.ts'
import { chromeText } from '@infra/ui/chromeTexts.ts'
import { tx } from '../../i18n/texts'

interface Message { id: number; from: 'user' | 'agent'; text: string; deferred?: DeferredAgentAction[] }

/** The app's own wording for the assistant (@AI(askLabel, followLabel, followingLabel)). */
export interface AssistantTexts { title?: string | null; follow?: string | null; following?: string | null }

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e))

/**
 * An answer's markdown: marked + the data-HTML policy, and NO remote image — an image the agent
 * names would be a request to whatever host it points at (a beacon); it is shown by its alt text.
 */
function AnswerMarkdown({ source, onRoute }: { source: string; onRoute: (href: string) => boolean }) {
  const html = useMemo(() => {
    const clean = sanitizeHtml(marked.parse(source, { async: false, gfm: true, breaks: false }) as string)
    const doc = new DOMParser().parseFromString(`<div>${clean}</div>`, 'text/html')
    doc.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') ?? ''
      if (src.startsWith('data:image/')) return
      img.replaceWith(doc.createTextNode(img.getAttribute('alt') || ''))
    })
    return doc.body.firstElementChild?.innerHTML ?? ''
  }, [source])
  return (
    <div
      className="mateu-markdown"
      dangerouslySetInnerHTML={{ __html: html }}
      onClick={(e) => {
        const a = (e.target as HTMLElement).closest('a')
        if (a && onRoute(a.getAttribute('href') ?? '')) e.preventDefault()
      }}
    />
  )
}

/**
 * The assistant (App.sseUrl): a side panel beside the page — not modal, the screen stays usable
 * — that POSTs the message (with what is on screen, the menu on the first message and the app's
 * MCP endpoint) and reads the answer AS IT STREAMS (RN core chatStream: deltas, progress, token
 * usage, the agent's UI events applied mid-stream — navigation, render-screen, close). Stays
 * mounted while hidden, so the conversation survives closing it.
 */
export function ChatPanel({ session, sseUrl, open, onClose, seed, texts = {} }: {
  session: MateuSession
  texts?: AssistantTexts
  sseUrl: string
  open: boolean
  onClose: () => void
  /** A question handed over (the palette's "Ask AI"): sent once. */
  seed?: { text: string; version: number } | null
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const [usage, setUsage] = useState<string | null>(null)
  // follow mode (the web's robot "Follow" button): on, the agent's navigations and screens apply as
  // they stream; off, they wait on the answer as buttons. Remembered per browser (mateu-chat-follow).
  const [follow, setFollow] = useState(loadChatFollow)
  const followRef = useRef(follow)
  followRef.current = follow
  const nextId = useRef(1)
  const turnRef = useRef<ChatTurn | null>(null)
  const menuContextSent = useRef(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const base = session.api.baseUrl
  const url = resolveChatUrl(sseUrl, base)
  const hooks = uiEventHooks(session, onClose)

  useEffect(() => {
    if (!busy) return undefined
    const timer = setInterval(() => { const t = turnRef.current; if (t) setProgress(t.progress.line(Date.now())) }, 1000)
    return () => clearInterval(timer)
  }, [busy])
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight }) }, [messages, progress])
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 0) }, [open])

  const setAgent = (id: number, text: string) => setMessages((m) => m.map((x) => (x.id === id ? { ...x, text } : x)))

  const send = async (raw: string) => {
    const text = raw.trim()
    if (!text || busy || !url) return
    setInput('')
    const user = { id: nextId.current++, from: 'user' as const, text }
    const agent = { id: nextId.current++, from: 'agent' as const, text: '' }
    setMessages((m) => [...m, user, agent])
    const turn = new ChatTurn(Date.now())
    turnRef.current = turn
    setBusy(true)
    setProgress(turn.progress.line(Date.now()))
    const apply = (update: ChatTurnUpdate) => {
      if (update.answer) setAgent(agent.id, turn.answer.text)
      if (update.progress) { setProgress(turn.progress.line(Date.now())); setUsage(usageLine(turn.usage) ?? null) }
      for (const event of update.events) {
        if (!followRef.current && isViewMovingAgentEvent(event.event)) {
          const held = deferAgentEvent(event.event, event.detail)
          setMessages((m) => m.map((x) => (x.id === agent.id ? { ...x, deferred: [...(x.deferred ?? []), held] } : x)))
        } else applyChatEvent(event, hooks)
      }
    }
    try {
      const mcpUrl = session.chatApp.mcpUrl ? resolveChatUrl(session.chatApp.mcpUrl, base) : undefined
      const body = chatRequestBody({
        message: text,
        sessionId: session.agent.session.sessionId,
        screen: session.currentScreen(),
        appState: session.appState,
        mcpUrl,
        menuContext: menuContextSent.current ? undefined : menuContextOf(session.chatApp.menu),
      })
      menuContextSent.current = true
      await session.api.postStream(url, JSON.stringify(body), (chunk) => apply(turn.push(chunk, Date.now())))
      apply(turn.end(Date.now()))
      setAgent(agent.id, turn.finalText)
    } catch (e) {
      setAgent(agent.id, `${turn.answer.text ? turn.answer.text + '\n\n' : ''}${CHAT_TEXTS.errorPrefix}${errorText(e)}`)
    } finally {
      setBusy(false)
      setProgress(null)
      turnRef.current = null
    }
  }

  // a question handed over by the palette
  const seeded = useRef(0)
  useEffect(() => {
    if (seed && seed.version !== seeded.current) {
      seeded.current = seed.version
      void send(seed.text)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed])

  const openRoute = (href: string): boolean => {
    const nav = chatLinkNavigation(session.chatApp.menu, href)
    if (!nav) return false
    hooks.navigate(nav)
    return true
  }

  return (
    <aside className="mateu-assistant" aria-label={texts.title || tx('chat')} hidden={!open}
      onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }}>
      <div className="mateu-assistant__header">
        <Heading as="h2" variant="small">{texts.title || tx('chat')}</Heading>
        <Button size="small" variant={follow ? 'primary' : 'default'} leadingVisual={EyeIcon} aria-pressed={follow}
          title={chromeText(follow ? 'chatFollowOn' : 'chatFollowOff')}
          onClick={() => setFollow(saveChatFollow(!follow))}>
          {follow ? (texts.following || chromeText('chatFollowing')) : (texts.follow || chromeText('chatFollow'))}
        </Button>
        <IconButton icon={XIcon} aria-label={tx('closeChat')} variant="invisible" onClick={onClose} />
      </div>
      <div className="mateu-assistant__messages" ref={listRef} aria-live="polite">
        {messages.length === 0 && <Text as="p" className="mateu-muted">{tx('chatEmpty')}</Text>}
        {messages.map((m) => (
          <div key={m.id} className={`mateu-chat__bubble mateu-chat__bubble--${m.from}`}>
            {m.from === 'agent' ? <AnswerMarkdown source={m.text || '…'} onRoute={openRoute} /> : m.text}
            {!!m.deferred?.length && (
              <div className="mateu-chat__deferred">
                {m.deferred.map((d, i) => (
                  <Button key={i} size="small" onClick={() => applyChatEvent({ event: d.name, detail: d.detail }, hooks)}>{d.label}</Button>
                ))}
              </div>
            )}
          </div>
        ))}
        {busy && progress && <Text as="p" size="small" className="mateu-muted">{progress}</Text>}
        {!busy && usage && <Text as="p" size="small" className="mateu-muted">{usage}</Text>}
      </div>
      <form className="mateu-assistant__input" onSubmit={(e) => { e.preventDefault(); void send(input) }}>
        <Textarea ref={inputRef} aria-label={tx('message')} placeholder={tx('chatPlaceholder')} value={input} rows={2} resize="vertical" block
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(input) } }} />
        <Button type="submit" variant="primary" leadingVisual={PaperAirplaneIcon} loading={busy} disabled={!input.trim()}>{tx('send')}</Button>
      </form>
    </aside>
  )
}
