import React, { useEffect, useMemo, useRef } from 'react'
import { Button, Heading, IconButton, Text, Textarea } from '@kit'
import { EyeIcon, PaperAirplaneIcon, XIcon } from '@kit/icons'
import type { MateuSession } from '@rn/core/MateuSession'
import { chromeText } from '@infra/ui/chromeTexts.ts'
import { answerHtml, useAssistant, type AssistantTexts } from '@mr/shell/assistant'
import { tx } from '@mr/i18n/texts'

export type { AssistantTexts } from '@mr/shell/assistant'

/** An answer's markdown (no remote images: answerHtml); its in-app links navigate here. */
function AnswerMarkdown({ source, onRoute }: { source: string; onRoute: (href: string) => boolean }) {
  const html = useMemo(() => answerHtml(source), [source])
  return (
    <div
      className="mateu-markdown"
      dangerouslySetInnerHTML={{ __html: html }}
      // an in-app link of the answer navigates here (a link's Enter arrives as a click; the key is heard too)
      onClick={(e) => {
        const a = (e.target as HTMLElement).closest('a')
        if (a && onRoute(a.getAttribute('href') ?? '')) e.preventDefault()
      }}
      onKeyDown={(e) => {
        if (e.key !== 'Enter') return
        const a = (e.target as HTMLElement).closest('a')
        if (a && onRoute(a.getAttribute('href') ?? '')) e.preventDefault()
      }}
    />
  )
}

/**
 * The assistant as a Primer side panel beside the page — not modal, the screen stays usable. Stays
 * mounted while hidden, so the conversation survives closing it. The conversation is shared (useAssistant).
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
  const { messages, input, setInput, busy, progress, usage, follow, send, openRoute, toggleFollow, replay } = useAssistant({ session, sseUrl, onClose, seed })
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight }) }, [messages, progress])
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 0) }, [open])

  return (
    <aside className="mateu-assistant" aria-label={texts.title || tx('chat')} hidden={!open}
      onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }}>
      <div className="mateu-assistant__header">
        <Heading as="h2" variant="small">{texts.title || tx('chat')}</Heading>
        <Button size="small" variant={follow ? 'primary' : 'default'} leadingVisual={EyeIcon} aria-pressed={follow}
          title={chromeText(follow ? 'chatFollowOn' : 'chatFollowOff')}
          onClick={toggleFollow}>
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
                  <Button key={i} size="small" onClick={() => replay(d)}>{d.label}</Button>
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
