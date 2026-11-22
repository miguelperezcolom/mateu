import React from 'react'
import type { MateuSession } from '@rn/core/MateuSession'
import type { HeaderValue } from '@rn/core/appShellExtras'
import type { MateuViewController } from '@rn/core/MateuViewController'
import { useHeaderValues, usePresence } from '@mr/shell/live'
import { tx } from '@mr/i18n/texts'

export { useLiveUpdates } from '@mr/shell/live'

/** The header values ("Business date 12 Oct 2026"), repainted from the session's store. */
export function HeaderValues({ session, declared }: { session: MateuSession; declared: HeaderValue[] | undefined }) {
  const values = useHeaderValues(session, declared)
  if (values.length === 0) return null
  return (
    <ul className="mateu-header-values" aria-label={tx('headerValues')}>
      {values.map((v) => (
        <li key={v.id} className="mateu-header-value">
          {!!v.label && <span className="mateu-header-muted">{v.label}</span>}
          <span className="mateu-header-value-text">{v.value}</span>
        </li>
      ))}
    </ul>
  )
}

/** Record presence above a record screen, in an attention tone while someone else edits it. */
export function PresenceChip({ controller }: { controller: MateuViewController }) {
  const summary = usePresence(controller)
  if (!summary) return null
  return (
    <div className={'mateu-presence' + (summary.tone === 'warning' ? ' is-editing' : '')} role="status" aria-label={`${tx('presenceLabel')}: ${summary.text}`}>
      {summary.text}
    </div>
  )
}
