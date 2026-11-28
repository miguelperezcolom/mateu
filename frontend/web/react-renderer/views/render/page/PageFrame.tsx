import React from 'react'
import { Stack } from '@kit'
import type { TocEntry } from '@mr/page/toc'
import type { HeaderParts } from './PageHeaderMarkup'
import { PageTocAside } from './PageToc'
import { TOC_IN_HEADER } from './PageTocAside'

// Split out of PageRenderer.tsx: how a page is laid out around its pieces. A design system whose
// pages are a floorplan (Fiori's dynamic page: a title that stays, a header that collapses, a
// footer bar) overrides this file; it gets the header both drawn and as its parts.

export interface PageFrameProps {
  rootRef: React.RefObject<HTMLDivElement | null>
  headerRef: React.RefObject<HTMLDivElement | null>
  level: number
  /** The view's own page (level 0, not inside an overlay or an island). */
  top: boolean
  compactDensity: boolean
  /** The header as PageHeaderMarkup draws it (or the actions row of a header with no title). */
  header: React.ReactNode
  /** The same header as its parts, when it has a title area. */
  headerParts: HeaderParts | null
  toc: boolean
  tocEntries: TocEntry[]
  activeSection: number
  onJump: (i: number) => void
  banners: React.ReactNode
  content: React.ReactNode
  /** The page's own buttons (@Button: under the content), or null. */
  buttons: React.ReactNode
  footer: React.ReactNode
}

/** The header (pinned with the index when there is one), the banners, the content beside the @Toc, the buttons, the footer. */
export function PageFrame(p: PageFrameProps) {
  const { rootRef, headerRef, level, compactDensity, header, toc } = p
  return (
    <div ref={rootRef} className={'mateu-page' + (compactDensity ? ' mateu-compact' : '')} data-page-level={level}>
      <Stack gap={compactDensity ? 'normal' : 'spacious'}>
        {(header || (toc && TOC_IN_HEADER)) && (
          <div ref={headerRef} className={'mateu-page-header-wrap' + (toc ? ' is-sticky' : '')}>
            {header}
            {/* a design system whose index is the header's anchor bar (Fiori) pins it with the header */}
            {toc && TOC_IN_HEADER && <PageTocAside entries={p.tocEntries} active={p.activeSection} onJump={p.onJump} />}
          </div>
        )}
        {p.banners}
        <div className={'mateu-page-body' + (toc && !TOC_IN_HEADER ? ' with-toc' : '')}>
          <Stack gap="normal">
            {p.content}
            {p.buttons && (
              <Stack direction="horizontal" justify="end" gap="condensed" wrap="wrap" className="mateu-page-buttons"
                style={{ borderTop: 'var(--borderWidth-thin) solid var(--borderColor-muted)', paddingTop: 'var(--base-size-16)' }}>
                {p.buttons}
              </Stack>
            )}
          </Stack>
          {toc && !TOC_IN_HEADER && <PageTocAside entries={p.tocEntries} active={p.activeSection} onJump={p.onJump} />}
        </div>
        {p.footer && <div className="mateu-page-footer">{p.footer}</div>}
      </Stack>
    </div>
  )
}
