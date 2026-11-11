import { safeExternalUrl } from '../core/linkTarget.ts';
import { inAppRouteOf } from '../core/chatStream.ts';

/** One inline span of a light-markdown line. */
export type InlineSpan =
  | { kind: 'text'; text: string }
  | { kind: 'bold'; text: string }
  | { kind: 'italic'; text: string }
  | { kind: 'boldItalic'; text: string }
  | { kind: 'strike'; text: string }
  /** `inline code`: monospace, never parsed further */
  | { kind: 'code'; text: string }
  | { kind: 'link'; text: string; url: string }
  /** `[text](/an/app/route)` — only when the caller can open app routes (the assistant's answers). */
  | { kind: 'route'; text: string; route: string };

/** Only links a phone may open: http(s), mailto and tel — never javascript: or data:. */
export const safeLinkUrl = (url: string): string | null => safeExternalUrl(url);

// Earliest match wins; the alternatives, in order:
//  1 `code` (any number of backticks)   3 ***bold italic***   4 **bold** / 5 __bold__
//  6 *italic* / 7 _italic_ (word-bounded, so snake_case stays text)   8 ~~strike~~
//  9/10 [text](url)   11 a backslash escape
const PATTERN =
  /(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)|\*\*\*(?=\S)([\s\S]+?)\*\*\*|\*\*(?=\S)([\s\S]+?)\*\*|(?<![\w])__(?=\S)([\s\S]+?)__(?![\w])|\*(?=[^\s*])([^*]+?)\*|(?<![\w])_(?=[^\s_])([^_]+?)_(?![\w])|~~(?=\S)([\s\S]+?)~~|\[([^\]]+)\]\(([^)\s]+)\)|\\([\\`*_{}[\]()#+\-.!|~$])/g;

/** The inline spans of a markdown text: bold, italic, `code`, ~~strike~~ and [links](url). */
export function inlineSpans(line: string, appRoutes = false): InlineSpan[] {
  const out: InlineSpan[] = [];
  const pushText = (text: string) => {
    if (!text) return;
    const last = out[out.length - 1];
    if (last && last.kind === 'text') last.text += text;
    else out.push({ kind: 'text', text });
  };
  let last = 0;
  PATTERN.lastIndex = 0;
  for (let m = PATTERN.exec(line); m; m = PATTERN.exec(line)) {
    pushText(line.slice(last, m.index));
    if (m[1] !== undefined) out.push({ kind: 'code', text: m[2].replace(/^ (.*) $/, '$1') });
    else if (m[3] !== undefined) out.push({ kind: 'boldItalic', text: m[3] });
    else if (m[4] !== undefined) out.push({ kind: 'bold', text: m[4] });
    else if (m[5] !== undefined) out.push({ kind: 'bold', text: m[5] });
    else if (m[6] !== undefined) out.push({ kind: 'italic', text: m[6] });
    else if (m[7] !== undefined) out.push({ kind: 'italic', text: m[7] });
    else if (m[8] !== undefined) out.push({ kind: 'strike', text: m[8] });
    else if (m[9] !== undefined) {
      const url = safeLinkUrl(m[10]);
      const route = appRoutes ? inAppRouteOf(m[10]) : undefined;
      if (url) out.push({ kind: 'link', text: m[9], url });
      else if (route) out.push({ kind: 'route', text: m[9], route });
      else pushText(m[9]);
    } else pushText(m[11]);
    last = PATTERN.lastIndex;
  }
  pushText(line.slice(last));
  return out;
}
