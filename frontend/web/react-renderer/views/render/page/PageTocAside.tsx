import React from 'react'
import { NavList } from '@kit'
import { type TocEntry } from '@mr/page/toc'
import { tx } from '@mr/i18n/texts'

// Split out of PageToc.tsx: a design system with its own markup for it overrides only this file.

/** Where the index sits: beside the content here; a design system whose index is the header's anchor bar (Fiori) says true. */
export const TOC_IN_HEADER = false

/** The index: Primer's NavList, the active entry `aria-current`, its Ctrl+Alt shortcut shown. */
export function PageTocAside({ entries, active, onJump }: { entries: TocEntry[]; active: number; onJump: (i: number) => void }) {
  return (
    <aside className="mateu-page-toc" aria-label={tx('sections')}>
      <NavList aria-label={tx('sections')}>
        {entries.map((e, i) => (
          <NavList.Item
            key={i}
            href="#"
            aria-current={i === active ? 'location' : undefined}
            aria-keyshortcuts={i < 9 ? `Control+Alt+${i + 1}` /* i18n-ok: key names */ : undefined}
            title={i < 9 ? `${e.title || tx('sectionN', { n: i + 1 })} (Ctrl+Alt+${i + 1})` : e.title || tx('sectionN', { n: i + 1 })}
            onClick={(ev: React.MouseEvent) => { ev.preventDefault(); onJump(i) }}
          >
            {e.title || tx('sectionN', { n: i + 1 })}
            {i < 9 && <NavList.TrailingVisual><span className="mateu-page-toc-key" aria-hidden="true">{i + 1}</span></NavList.TrailingVisual>}
          </NavList.Item>
        ))}
      </NavList>
    </aside>
  )
}
