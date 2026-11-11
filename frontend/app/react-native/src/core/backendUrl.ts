// Where a url the server sent points to. On the web a root-relative url (`/explorer/bay.svg`,
// `/apps/rooms`, `/explorer-api/planets`) is relative to the PAGE, which the Mateu server served —
// so it reaches the backend. A native app has no page: the same url must be resolved against the
// backend's base url, or it goes to whatever origin the app happens to run on (the Expo dev server
// answered HTML, so images were grey boxes, listings "Unexpected token '<'", embedded apps failed).
import { withoutTrailingSlashes } from './trailingSlashes.ts';

/** Whether `url` already names its own scheme (http:, data:, mailto:…) or is protocol-relative. */
export function hasScheme(url: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url) || url.startsWith('//');
}

/**
 * `url` made absolute against `base` (the backend's base url): a root-relative one keeps its path
 * under the base's ORIGIN (what a browser does), any other relative one goes under the base itself.
 * An absolute url, a data: uri, an empty url or a base that is not http(s) are returned as they are.
 */
export function againstBase(url: string | null | undefined, base: string | null | undefined): string {
  const u = url ?? '';
  if (!u || !base || hasScheme(u)) return u;
  const origin = /^(https?:\/\/[^/?#]+)/i.exec(base)?.[1];
  if (!origin) return u;
  return u.startsWith('/') ? `${origin}${u}` : `${withoutTrailingSlashes(base)}/${u}`;
}
