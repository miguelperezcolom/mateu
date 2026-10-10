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
