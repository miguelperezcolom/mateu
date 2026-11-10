/** Removes every tag, repeating until nothing changes: a single pass over `<scr<b>ipt>` leaves
 *  `<script>` behind (removing one tag can splice two halves into a new one). A stray `<` left
 *  after that is dropped too — a literal one arrives encoded as `&lt;`, decoded below. */
const stripTags = (s: string): string => {
  let previous: string;
  do {
    previous = s;
    s = s.replace(/<[^<>]*>/g, '');
  } while (s !== previous);
  return s.replace(/[<>]/g, '');
};

/**
 * An HTML value (a rich-text field's, an html stereotype's) as the Markdown that draws the same
 * structure natively: headings, paragraphs, line breaks, bold/italic/code, lists, links and
 * blockquotes; every other tag is dropped (stripHtml's repeat-until-stable pass), so no markup
 * survives into the text. Rendered by MarkdownView.
 */
export function htmlToMarkdown(html: string): string {
  const md = (html ?? '')
    .replace(/\r?\n/g, ' ')
    .replace(/<\s*h([1-6])[^>]*>/gi, (_, n: string) => `\n\n${'#'.repeat(Number(n))} `)
    .replace(/<\/\s*h[1-6]\s*>/gi, '\n\n')
    .replace(/<\s*(strong|b)(\s[^>]*)?>/gi, '**').replace(/<\/\s*(strong|b)\s*>/gi, '**')
    .replace(/<\s*(em|i)(\s[^>]*)?>/gi, '*').replace(/<\/\s*(em|i)\s*>/gi, '*')
    .replace(/<\s*(s|strike|del)(\s[^>]*)?>/gi, '~~').replace(/<\/\s*(s|strike|del)\s*>/gi, '~~')
    .replace(/<\s*code[^>]*>/gi, '`').replace(/<\/\s*code\s*>/gi, '`')
    .replace(/<\s*a\s[^>]*href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/\s*a\s*>/gi, (_, href: string, text: string) => `[${text}](${href})`)
    .replace(/<\s*li[^>]*>/gi, '\n- ').replace(/<\/\s*li\s*>/gi, '')
    .replace(/<\/?\s*(ul|ol)[^>]*>/gi, '\n\n')
    .replace(/<\s*blockquote[^>]*>/gi, '\n\n\u0001 ').replace(/<\/\s*blockquote\s*>/gi, '\n\n')
    .replace(/<\s*br\s*\/?>/gi, '  \n')
    .replace(/<\s*\/?\s*(p|div)[^>]*>/gi, '\n\n');
  // the quote marker is parked: stripHtml drops every stray > (a literal one arrives as &gt;)
  return stripHtml(md).replace(/\u0001/g, '>').replace(/\n{3,}/g, '\n\n').trim();
}

export const stripHtml = (html: string): string =>
  stripTags(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• '),
  )
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    // &amp; LAST: decoding it first turned a literal "&amp;lt;" into "<" (double unescaping)
    .replace(/&amp;/g, '&')
    .trim();
