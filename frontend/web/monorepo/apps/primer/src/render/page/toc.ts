import { isSectionCard, isStickySection, sectionTitleOf, showsSectionIndex } from '../../../../../../../app/react-native/src/renderer/sectionIndex.ts' // relative: node's test runner reads it too

type Dict = Record<string, unknown>

export interface TocEntry { title: string; sticky: boolean }

/** Containers that lay their children side by side: sections inside them are not "stacked". */
const ACROSS = new Set(['HorizontalLayout', 'ResponsiveGrid', 'SplitLayout', 'FoldoutLayout', 'TabLayout', 'AccordionLayout', 'BoardLayout', 'DashboardLayout'])

const metaOf = (n: unknown): Dict => ((n as Dict | null)?.['metadata'] as Dict | undefined) ?? {}
const kids = (n: unknown): unknown[] => ((n as Dict | null)?.['children'] as unknown[] | undefined) ?? []

/**
 * The page's @Section cards in document order (an island — a nested ServerSide — is another view and
 * not walked), and how many of them are STACKED (not inside a side-by-side container: @Zones and
 * @FoldedLayout pages lay sections across, and an index of columns is no index).
 */
export function sectionsOf(children: unknown[]): { entries: TocEntry[]; stacked: number } {
  const entries: TocEntry[] = []
  let stacked = 0
  const walk = (node: unknown, across: boolean) => {
    if (!node || typeof node !== 'object') return
    if ((node as Dict)['type'] === 'ServerSide') return
    if (isSectionCard(node)) {
      entries.push({ title: sectionTitleOf(node) || '' /* untitled: PageToc names it by position */, sticky: isStickySection(node) })
      if (!across) stacked++
      return
    }
    const type = String(metaOf(node)['type'] ?? '')
    const nowAcross = across || ACROSS.has(type)
    for (const c of kids(node)) walk(c, nowAcross)
  }
  for (const c of children) walk(c, false)
  return { entries, stacked }
}

/** Whether the index shows: `toc` true = any section, false = never, absent = more than four stacked. */
export function showsToc(toc: unknown, sections: { entries: TocEntry[]; stacked: number }): boolean {
  if (toc === true || toc === false) return showsSectionIndex(toc, sections.entries.length)
  return showsSectionIndex(undefined, sections.stacked)
}

/** Ctrl+Alt+1..9 (top row or keypad, by code: layout- and AltGr-proof) → 0..8, else -1. */
export function tocShortcutIndex(e: { ctrlKey: boolean; altKey: boolean; metaKey: boolean; shiftKey: boolean; code: string }): number {
  if (!e.ctrlKey || !e.altKey || e.metaKey || e.shiftKey) return -1
  const m = /^(?:Digit|Numpad)([1-9])$/.exec(e.code)
  return m ? Number(m[1]) - 1 : -1
}
