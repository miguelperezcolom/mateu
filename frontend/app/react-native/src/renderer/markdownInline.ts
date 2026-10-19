import { safeExternalUrl } from '../core/linkTarget.ts';
import { inAppRouteOf } from '../core/chatStream.ts';

/** One inline span of a light-markdown line: plain text, **bold**, or a [link](url). */
export type InlineSpan =
  | { kind: 'text'; text: string }
  | { kind: 'bold'; text: string }
  | { kind: 'link'; text: string; url: string }
  /** `[text](/an/app/route)` — only when the caller can open app routes (the assistant's answers). */
  | { kind: 'route'; text: string; route: string };

/** Only links a phone may open: http(s), mailto and tel — never javascript: or data:. */
export const safeLinkUrl = (url: string): string | null => safeExternalUrl(url);

/**
 * The spans of one markdown line. It used to know only **bold**: a [link](url) — what a Markdown
 * component most often holds — showed its raw brackets and url.
 */
export function inlineSpans(line: string, appRoutes = false): InlineSpan[] {
  const out: InlineSpan[] = [];
  const pattern = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (let m = pattern.exec(line); m; m = pattern.exec(line)) {
    if (m.index > last) out.push({ kind: 'text', text: line.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ kind: 'bold', text: m[1] });
    else {
      const url = safeLinkUrl(m[3]);
      const route = appRoutes ? inAppRouteOf(m[3]) : undefined;
      out.push(url ? { kind: 'link', text: m[2], url } : route ? { kind: 'route', text: m[2], route } : { kind: 'text', text: m[2] });
    }
    last = pattern.lastIndex;
  }
  if (last < line.length) out.push({ kind: 'text', text: line.slice(last) });
  return out;
}
