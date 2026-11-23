import { Tab, TabContainer } from '@ui5/webcomponents-react'
import { type TocEntry } from '@mr/page/toc'
import { tx } from '@mr/i18n/texts'

/** Fiori: the index is the object page's anchor bar, pinned with the header. */
export const TOC_IN_HEADER = true

/**
 * The index as the object page's anchor bar (Fiori): one tab per section across the top, pinned
 * with the header, the section in view selected; each tab names its Ctrl+Alt shortcut.
 */
export function PageTocAside({ entries, active, onJump }: { entries: TocEntry[]; active: number; onJump: (i: number) => void }) {
  return (
    <nav className="mateu-page-toc" aria-label={tx('sections')}>
      <TabContainer collapsed noAutoSelection tabLayout="Inline" overflowMode="End"
        onTabSelect={(e: CustomEvent<{ tabIndex: number }>) => onJump(e.detail.tabIndex)}>
        {entries.map((e, i) => {
          const name = e.title || tx('sectionN', { n: i + 1 })
          return (
            <Tab key={i} text={name} selected={i === active || undefined}
              additionalText={i < 9 ? `Ctrl+Alt+${i + 1}` /* i18n-ok: key names */ : undefined}
              aria-keyshortcuts={i < 9 ? `Control+Alt+${i + 1}` /* i18n-ok: key names */ : undefined} />
          )
        })}
      </TabContainer>
    </nav>
  )
}
