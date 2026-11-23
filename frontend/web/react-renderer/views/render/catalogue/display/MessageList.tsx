import { Text } from '@kit'
import { CatalogueProps, Dict } from '../types'
import { displayColor, list, MateuAvatar, str } from './shared'

// Split out of activity.tsx: a design system with its own markup for it overrides only this file.

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

export function Comment({ c, depth, text }: { c: Dict; depth: number; text: (t: unknown) => string }) {
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
