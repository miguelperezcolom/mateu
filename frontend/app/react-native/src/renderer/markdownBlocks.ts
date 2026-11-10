/**
 * The block structure of a Markdown text, parsed without a rendering dependency (RN has no DOM to
 * hand a markdown library's HTML to). What a Mateu text really carries — descriptions, a Markdown
 * component, an Explorer Code tab — and what the line-by-line reader used to get wrong:
 * - a paragraph is the run of non-blank lines, joined with a SPACE (a single newline is a soft
 *   break, so hard-wrapped source no longer breaks mid-sentence); two trailing spaces or a `\` keep
 *   a hard break;
 * - a ``` fence is a code block: its lines are kept verbatim (indentation, ` * ` javadoc lines,
 *   `#` comments — none of them is markdown inside a fence);
 * - `>` blockquotes (nested blocks), pipe tables, `---` rules;
 * - list items carry their nesting depth (from the indentation) and an indented continuation line
 *   joins its item instead of becoming a paragraph of its own.
 */
export type MdBlock =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'code'; lang: string; text: string }
  | { kind: 'quote'; blocks: MdBlock[] }
  | { kind: 'rule' }
  | { kind: 'table'; header: string[]; align: ('left' | 'center' | 'right')[]; rows: string[][] }
  | { kind: 'list'; items: MdListItem[] };

export interface MdListItem {
  /** 0 = top level, 1 = nested once… */
  depth: number;
  /** the marker as it is drawn: "•" for an unordered item, "3." for an ordered one */
  marker: string;
  text: string;
}

const FENCE = /^\s{0,3}(`{3,}|~{3,})\s*([\w+#.-]*)/;
const HEADING = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
const RULE = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/;
const LIST = /^(\s*)([-*+•]|\d{1,9}[.)])\s+(.*)$/;
const QUOTE = /^\s{0,3}>\s?(.*)$/;
const TABLE_SEPARATOR = /^\s*\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)*\|?\s*$/;

const isBlank = (line: string) => line.trim() === '';

/** The cells of one pipe-table row: outer pipes optional, `\|` is a literal pipe. */
export function tableCells(line: string): string[] {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  // no lookbehind (older Hermes engines lack it): park the escaped pipes first
  return s.replace(/\\\|/g, '\u0000').split('|').map((c) => c.trim().replace(/\u0000/g, '|'));
}

const startsBlock = (line: string, next: string | undefined) =>
  FENCE.test(line) || HEADING.test(line) || RULE.test(line) || QUOTE.test(line) || LIST.test(line)
  || (line.includes('|') && next !== undefined && TABLE_SEPARATOR.test(next) && next.includes('-'));

/** Joins paragraph lines: a soft break is a space, a hard one (two trailing spaces, `\`) a newline. */
function joinLines(lines: string[]): string {
  let out = '';
  lines.forEach((raw, i) => {
    const hard = / {2,}$/.test(raw) || /\\$/.test(raw);
    const line = raw.replace(/\\$/, '').trim();
    out += line;
    if (i < lines.length - 1) out += hard ? '\n' : ' ';
  });
  return out;
}

export function parseMarkdown(source: string): MdBlock[] {
  const lines = (source ?? '').replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n');
  const blocks: MdBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (isBlank(line)) { i++; continue; }

    const fence = FENCE.exec(line);
    if (fence) {
      const marker = fence[1];
      const indent = line.length - line.trimStart().length;
      const body: string[] = [];
      i++;
      while (i < lines.length && !new RegExp(`^\\s{0,3}${marker[0]}{${marker.length},}\\s*$`).test(lines[i])) {
        // a fence indented in a list keeps its content's own indentation, minus the fence's
        body.push(lines[i].startsWith(' '.repeat(indent)) ? lines[i].slice(indent) : lines[i].trimStart());
        i++;
      }
      i++; // the closing fence (or the end of the text)
      blocks.push({ kind: 'code', lang: fence[2] ?? '', text: body.join('\n') });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push({ kind: 'heading', level: heading[1].length, text: heading[2] });
      i++;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push({ kind: 'rule' });
      i++;
      continue;
    }

    if (QUOTE.test(line)) {
      const inner: string[] = [];
      while (i < lines.length && !isBlank(lines[i])) {
        const q = QUOTE.exec(lines[i]);
        // a line without `>` right after a quoted one is a lazy continuation of it
        inner.push(q ? q[1] : lines[i]);
        i++;
      }
      blocks.push({ kind: 'quote', blocks: parseMarkdown(inner.join('\n')) });
      continue;
    }

    if (line.includes('|') && i + 1 < lines.length && TABLE_SEPARATOR.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      const header = tableCells(line);
      const align = tableCells(lines[i + 1]).map((c) =>
        c.startsWith(':') && c.endsWith(':') ? 'center' as const : c.endsWith(':') ? 'right' as const : 'left' as const);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && !isBlank(lines[i]) && lines[i].includes('|')) {
        const cells = tableCells(lines[i]);
        rows.push(header.map((_, c) => cells[c] ?? ''));
        i++;
      }
      blocks.push({ kind: 'table', header, align: header.map((_, c) => align[c] ?? 'left'), rows });
      continue;
    }

    if (LIST.test(line)) {
      const items: MdListItem[] = [];
      // indentation → depth: each distinct deeper indentation opens one more level
      const indents: number[] = [];
      const counters: number[] = [];
      while (i < lines.length) {
        const current = lines[i];
        if (isBlank(current)) {
          // a blank line ends the list unless the next line is another item (a "loose" list)
          if (i + 1 < lines.length && LIST.test(lines[i + 1])) { i++; continue; }
          break;
        }
        const item = LIST.exec(current);
        if (item) {
          const indent = item[1].length;
          while (indents.length && indent < indents[indents.length - 1]) { indents.pop(); counters.pop(); }
          if (!indents.length || indent > indents[indents.length - 1]) { indents.push(indent); counters.push(0); }
          const depth = indents.length - 1;
          const ordered = /\d/.test(item[2]);
          const n = ordered ? (counters[depth] === 0 ? parseInt(item[2], 10) : counters[depth] + 1) : 0;
          counters[depth] = n;
          items.push({ depth, marker: ordered ? `${n}.` : '•', text: item[3].trim() });
          i++;
          continue;
        }
        // an indented (or lazy) line that is not a new block continues the last item
        if (items.length && !startsBlock(current, lines[i + 1])) {
          items[items.length - 1].text += ' ' + current.trim();
          i++;
          continue;
        }
        break;
      }
      blocks.push({ kind: 'list', items });
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && !isBlank(lines[i]) && (para.length === 0 || !startsBlock(lines[i], lines[i + 1]))) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ kind: 'paragraph', text: joinLines(para) });
  }
  return blocks;
}
