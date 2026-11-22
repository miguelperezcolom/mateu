import React, { useEffect, useRef, useState } from 'react'
import { Button, Link, Text, Textarea, TextInput, Timeline as PrimerTimeline } from '@kit'
import { FileIcon, FileMediaIcon, FileZipIcon, PaperAirplaneIcon, TableIcon } from '@kit/icons'
import { ChatTurn, applyChatEvent, chatRequestBody, resolveChatUrl, CHAT_TEXTS } from '@rn/core/chatStream'
import { uiEventHooks } from '@rn/core/uiEvents'
import { Markdown } from '@mr/render/Markdown'
import { useController } from '@mr/render/ViewHost'
import type { CatalogueProps, Dict } from '../types'
import { displayColor, list, MateuAvatar, safeColor, safeHref, str, useRun, useText, WireIcon } from './shared'
import { tx } from '@mr/i18n/texts'

/** Timeline: Primer's — a badge per event (its icon, its colour), title, text, when; an event with an action is a link. */
export function Timeline({ metadata, state, data }: CatalogueProps) {
  const text = useText(state, data)
  const run = useRun()
  return (
    <PrimerTimeline>
      {list(metadata['items']).map((it, i) => {
        const color = safeColor(it['color'])
        const title = text(it['title'])
        return (
          <PrimerTimeline.Item key={str(it['id']) || i}>
            <PrimerTimeline.Badge style={color ? { backgroundColor: color, color: 'var(--fgColor-onEmphasis)' } : undefined}>
              {it['icon'] ? <WireIcon token={it['icon']} size={14} /> : null}
            </PrimerTimeline.Badge>
            <PrimerTimeline.Body>
              <div>
                {it['actionId']
                  ? <Link as="button" type="button" className="mateu-link-button" onClick={() => run(it['actionId'], { _itemId: it['id'] })}><Text weight="semibold">{title}</Text></Link>
                  : <Text weight="semibold" style={{ color: 'var(--fgColor-default)' }}>{title}</Text>}
                {it['timestamp'] ? <Text size="small" className="mateu-muted"> · {text(it['timestamp'])}</Text> : null}
              </div>
              {it['description'] ? <Text as="div" size="small">{text(it['description'])}</Text> : null}
            </PrimerTimeline.Body>
          </PrimerTimeline.Item>
        )
      })}
    </PrimerTimeline>
  )
}

function Comment({ c, depth, text }: { c: Dict; depth: number; text: (t: unknown) => string }) {
  return (
    <li className="mateu-comment" style={{ marginInlineStart: depth ? 'var(--base-size-40)' : undefined }}>
      <MateuAvatar name={str(c['author'])} image={c['avatar']} size={32} />
      <div className="mateu-comment__box">
        <div className="mateu-comment__head">
          <Text weight="semibold">{text(c['author'])}</Text>
          {c['timestamp'] ? <Text size="small" className="mateu-muted"> {text(c['timestamp'])}</Text> : null}
        </div>
        <div className="mateu-comment__body">{text(c['text'])}</div>
      </div>
      {list(c['replies']).length > 0 && (
        <ul className="mateu-comment-thread">{list(c['replies']).map((r, i) => <Comment key={str(r['id']) || i} c={r} depth={depth + 1} text={text} />)}</ul>
      )}
    </li>
  )
}

/** CommentThread: comments the way github.com draws them (avatar, a bordered box with its header), replies indented. */
export function CommentThread({ metadata, state, data }: CatalogueProps) {
  const text = useText(state, data)
  return <ul className="mateu-comment-thread">{list(metadata['comments']).map((c, i) => <Comment key={str(c['id']) || i} c={c} depth={0} text={text} />)}</ul>
}

const fileIconOf = (type: string) => {
  const t = type.toLowerCase()
  if (/^image\//.test(t) || /png|jpe?g|gif|svg|webp/.test(t)) return FileMediaIcon
  if (/zip|compressed|tar|gzip/.test(t)) return FileZipIcon
  if (/spreadsheet|excel|sheet|csv|xlsx?/.test(t)) return TableIcon
  return FileIcon
}

/** FileList: one row per file — its kind's icon, the name (a download link or an action), the size. */
export function FileList({ metadata }: CatalogueProps) {
  const run = useRun()
  return (
    <ul className="mateu-file-list">
      {list(metadata['files']).map((f, i) => {
        const Icon = fileIconOf(str(f['type']))
        const url = safeHref(f['url'])
        const name = str(f['name'])
        return (
          <li key={i}>
            <Icon />
            {f['actionId']
              ? <Link as="button" type="button" className="mateu-link-button" onClick={() => run(f['actionId'], { _fileName: name })}>{name}</Link>
              : url ? <Link href={url} target="_blank" rel="noopener noreferrer" download={name}>{name}</Link>
              : <Text>{name}</Text>}
            {f['size'] ? <Text size="small" className="mateu-muted">{str(f['size'])}</Text> : null}
          </li>
        )
      })}
    </ul>
  )
}

/** MessageList: chat messages — who (avatar in their colour), when, what. */
export function MessageList({ metadata }: CatalogueProps) {
  return (
    <ul className="mateu-message-list">
      {list(metadata['items']).map((m, i) => (
        <li key={i}>
          <MateuAvatar name={str(m['userName'])} image={m['userImg']} abbreviation={m['userAbbr']} size={32}
            colorIndex={m['userColorIndex'] == null ? undefined : Number(m['userColorIndex'])} />
          <div>
            <div>
              <Text weight="semibold" style={m['userColorIndex'] == null ? undefined : { color: `var(--display-${displayColor(Number(m['userColorIndex']))}-fgColor)` }}>{str(m['userName'])}</Text>
              {m['time'] ? <Text size="small" className="mateu-muted"> {str(m['time'])}</Text> : null}
            </div>
            <Text as="div">{str(m['text'])}</Text>
          </div>
        </li>
      ))}
    </ul>
  )
}

/** MessageInput: a message box whose Send runs the action with `{ message }`. */
export function MessageInput({ metadata }: CatalogueProps) {
  const run = useRun()
  const [value, setValue] = useState('')
  const submit = () => {
    if (!value.trim() || !metadata['actionId']) return
    run(metadata['actionId'], { message: value })
    setValue('')
  }
  return (
    <form className="mateu-message-input" onSubmit={(e) => { e.preventDefault(); submit() }}>
      <TextInput aria-label={tx('message')} placeholder={tx('chatPlaceholder')} value={value} onChange={(e) => setValue(e.target.value)} block />
      <Button type="submit" variant="primary" leadingVisual={PaperAirplaneIcon} disabled={!value.trim()}>{tx('send')}</Button>
    </form>
  )
}

interface ChatMessage { id: number; from: 'user' | 'agent'; text: string }

/**
 * Chat: a conversation with an agent over its SSE endpoint — the RN core's chat protocol as is
 * (request body, the streamed turn, the agent's UI events applied mid-stream), drawn inline.
 */
export function Chat({ metadata }: CatalogueProps) {
  const { session } = useController()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const nextId = useRef(1)
  const turnRef = useRef<ChatTurn | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const url = resolveChatUrl(str(metadata['sseUrl']), session.api.baseUrl)

  useEffect(() => {
    if (!busy) return
    const timer = setInterval(() => { const t = turnRef.current; if (t) setProgress(t.progress.line(Date.now())) }, 1000)
    return () => clearInterval(timer)
  }, [busy])
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight }) }, [messages])

  if (!url) return null
  const setAgent = (id: number, text: string) => setMessages((m) => m.map((x) => (x.id === id ? { ...x, text } : x)))

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    const user = { id: nextId.current++, from: 'user' as const, text }
    const agent = { id: nextId.current++, from: 'agent' as const, text: '' }
    setMessages((m) => [...m, user, agent])
    const turn = new ChatTurn(Date.now())
    turnRef.current = turn
    setBusy(true)
    const hooks = uiEventHooks(session, () => {})
    try {
      const body = chatRequestBody({ message: text, sessionId: session.agent.session.sessionId, screen: session.currentScreen(), appState: session.appState })
      await session.api.postStream(url, JSON.stringify(body), (chunk) => {
        const update = turn.push(chunk, Date.now())
        if (update.answer) setAgent(agent.id, turn.answer.text)
        for (const e of update.events) applyChatEvent(e, hooks)
      })
      turn.end(Date.now())
      setAgent(agent.id, turn.finalText)
    } catch (e) {
      setAgent(agent.id, `${turn.answer.text ? turn.answer.text + '\n\n' : ''}${CHAT_TEXTS.errorPrefix}${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setBusy(false)
      setProgress(null)
      turnRef.current = null
    }
  }

  return (
    <div className="mateu-chat">
      <div className="mateu-chat__messages" ref={listRef} aria-live="polite">
        {messages.length === 0 && <Text className="mateu-muted">{tx('chatEmpty')}</Text>}
        {messages.map((m) => (
          <div key={m.id} className={`mateu-chat__bubble mateu-chat__bubble--${m.from}`}>
            {m.from === 'agent' ? <Markdown source={m.text || '…'} /> : m.text}
          </div>
        ))}
        {busy && progress && <Text size="small" className="mateu-muted">{progress}</Text>}
      </div>
      <form className="mateu-message-input" onSubmit={(e) => { e.preventDefault(); void send() }}>
        <Textarea aria-label={tx('message')} placeholder={tx('chatPlaceholder')} value={input} rows={2} resize="vertical" block
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send() } }} />
        <Button type="submit" variant="primary" leadingVisual={PaperAirplaneIcon} loading={busy} disabled={!input.trim()}>{tx('send')}</Button>
      </form>
    </div>
  )
}
