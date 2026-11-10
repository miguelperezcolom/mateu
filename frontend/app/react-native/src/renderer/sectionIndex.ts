// The @Toc sections index on a phone (pure, tested by node's runner). The server marks every
// @Section card `mateu-section` (`mateu-section--sticky` when pinned) and puts its title in the
// card's title slot or as the first heading of its content; `PageDto.toc` is tri-state: true =
// always, false = never, absent = when more than four sections stack up (the web's rule).

type Dict = Record<string, unknown>;

export const isSectionCard = (node: unknown): boolean =>
  /(^|\s)mateu-section(\s|$)/.test(String((node as Dict)?.['cssClasses'] ?? ''));

export const isStickySection = (node: unknown): boolean =>
  /(^|\s)mateu-section--sticky(\s|$)/.test(String((node as Dict)?.['cssClasses'] ?? ''));

/** A section card's title: its title slot (text or a Text node), else its content's first heading. */
export function sectionTitleOf(card: unknown): string {
  const m = ((card as Dict)?.['metadata'] as Dict) ?? {};
  const title = m['title'];
  if (typeof title === 'string' && title.trim()) return title.trim();
  const titleText = ((title as Dict)?.['metadata'] as Dict | undefined)?.['text'];
  if (typeof titleText === 'string' && titleText.trim()) return titleText.trim();
  const heading = (node: unknown): string => {
    const nm = ((node as Dict)?.['metadata'] as Dict) ?? {};
    if (nm['type'] === 'Text' && /^h[1-6]$/.test(String(nm['container'] ?? '')) && String(nm['text'] ?? '').trim()) return String(nm['text']).trim();
    for (const slot of ['content']) {
      const found = nm[slot] ? heading(nm[slot]) : '';
      if (found) return found;
    }
    for (const c of ((node as Dict)?.['children'] as unknown[] | undefined) ?? []) {
      const found = heading(c);
      if (found) return found;
    }
    return '';
  };
  return heading(m['content']) || heading({ children: (card as Dict)?.['children'] });
}

/** Whether the index shows, for `toc` (true | false | absent) and the sections on the page. */
export function showsSectionIndex(toc: unknown, sections: number): boolean {
  if (toc === false) return false;
  if (toc === true) return sections > 0;
  return sections > 4;
}
