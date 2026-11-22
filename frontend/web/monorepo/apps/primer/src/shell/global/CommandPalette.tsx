import React, { useEffect, useRef } from 'react'
import { ActionList, Dialog, Text, TextInput } from '@primer/react'
import { CommentDiscussionIcon, HistoryIcon, RocketIcon, SearchIcon } from '@primer/octicons-react'
import type { MateuSession, NavTarget } from '@rn/core/MateuSession'
import type { AppMetaLike } from '@mr/shell/appActions'
import { usePalette, type PaletteRow } from '@mr/shell/palette'
import type { AppShortcutLike } from '@mr/shell/shortcuts'
import { tx } from '@mr/i18n/texts'

const ICONS: Record<PaletteRow['kind'], React.ElementType | undefined> = {
  shortcut: RocketIcon, recent: HistoryIcon, menu: undefined, hit: SearchIcon, ask: CommentDiscussionIcon,
}

/**
 * The ⌘K command palette (App.globalSearchEnabled) and the command center (commandCenterEnabled /
 * chromeless) as a Primer Dialog over an ActionList listbox; what it finds is shared (usePalette).
 */
export function CommandPalette(props: {
  session: MateuSession
  app: AppMetaLike
  open: boolean
  onClose: () => void
  onNavigate: (target: NavTarget) => void
  onLaunch: (s: AppShortcutLike) => void
  onAskAi?: (query: string) => void
}) {
  const { app, open, onClose } = props
  const { query, onInput, rows, groups, searching, searchEnabled, current, setActive, onKeyDown } = usePalette(props)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.getElementById(`mateu-cmd-${current}`)?.scrollIntoView({ block: 'nearest' })
  }, [current])

  if (!open) return null
  return (
    <Dialog
      title={app['commandCenterEnabled'] ? tx('commandCenter') : tx('goTo')}
      onClose={onClose}
      width="large"
      initialFocusRef={inputRef as React.RefObject<HTMLElement>}
      renderBody={() => (
        <div className="mateu-cmd">
          <TextInput
            ref={inputRef}
            block
            size="large"
            leadingVisual={SearchIcon}
            placeholder={searchEnabled ? tx('searchScreensRecordsCodes') : tx('searchScreensAndCodes')}
            aria-label={tx('search')}
            aria-controls="mateu-cmd-list"
            aria-activedescendant={rows.length ? `mateu-cmd-${current}` : undefined}
            value={query}
            onChange={(e) => onInput(e.target.value)}
            onKeyDown={onKeyDown}
            loading={searching}
          />
          <div className="mateu-cmd__list" id="mateu-cmd-list" role="listbox" aria-label={tx('results')}>
            {rows.length === 0 && <Text as="p" className="mateu-cmd__empty">{searching ? tx('searching') : tx('noMatches')}</Text>}
            {groups.map((g) => (
              <div key={g.name} role="group" aria-label={g.name}>
                <div className="mateu-cmd__group" aria-hidden="true">{g.name}</div>
                <ActionList role="presentation">
                  {g.rows.map(({ row, index }) => {
                    const Icon = ICONS[row.kind]
                    return (
                      <ActionList.Item
                        key={row.key}
                        id={`mateu-cmd-${index}`}
                        role="option"
                        aria-selected={index === current}
                        active={index === current}
                        onMouseEnter={() => setActive(index)}
                        onSelect={() => row.run()}
                      >
                        {Icon ? <ActionList.LeadingVisual><Icon /></ActionList.LeadingVisual> : null}
                        {row.label}
                        {row.description ? <ActionList.Description variant="block">{row.description}</ActionList.Description> : null}
                        {row.trailing ? <ActionList.TrailingVisual><span className="mateu-kbd">{row.trailing}</span></ActionList.TrailingVisual> : null}
                      </ActionList.Item>
                    )
                  })}
                </ActionList>
              </div>
            ))}
          </div>
          <div className="mateu-cmd__footer" aria-hidden="true">
            <span><span className="mateu-kbd">↑</span><span className="mateu-kbd">↓</span> {tx('paletteMove')}</span>
            <span><span className="mateu-kbd">{'Enter' /* i18n-ok: a key name */}</span> {tx('paletteOpen')}</span>
            <span><span className="mateu-kbd">{'Esc' /* i18n-ok: a key name */}</span> {tx('paletteClose')}</span>
          </div>
        </div>
      )}
    />
  )
}
