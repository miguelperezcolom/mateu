import { Link, Text, Timeline as PrimerTimeline } from '@kit'
import { CatalogueProps } from '../types'
import { list, safeColor, str, useRun, useText, WireIcon } from './shared'

// Split out of activity.tsx: a design system with its own markup for it overrides only this file.

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
