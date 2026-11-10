/**
 * Where a link that came from DATA (a field value, a menu route, a button route, an anchor, a
 * result destination, a sign-out url…) may be handed to the OS. Only what a phone should open
 * outside the app — http(s), mailto, tel — passes; anything else (javascript:, data:, file:,
 * intent:, a custom app scheme…) is refused, because `Linking.openURL` would happily launch
 * whatever handler claims it.
 */
const SAFE_SCHEME = /^(https?:|mailto:|tel:)/i;

/** The url when the OS may open it (http/https/mailto/tel), else null. */
export const safeExternalUrl = (url: unknown): string | null => {
  if (typeof url !== 'string') return null;
  // control characters / whitespace inside a scheme ("java\tscript:") are not a link
  const trimmed = url.trim();
  if (!trimmed || /[\u0000-\u001f\u007f]/.test(trimmed)) return null;
  return SAFE_SCHEME.test(trimmed) ? trimmed : null;
};

/**
 * What pressing a link the server sent does. A url with its own scheme leaves the app (the OS, if
 * safeExternalUrl lets it); a RELATIVE one (`/apps/rooms`, `/x/route-params/web/palma?nights=3`) is a
 * place in the SAME backend — on the web it is relative to the page that backend served, and a
 * `target="_blank"` opens it in a new tab. A native app has neither page nor tabs: it opens in the
 * app, as a screen pushed over this one (it used to be handed to the OS and refused as "an
 * unsupported scheme", so these links did nothing). A bare fragment (`#top`) goes nowhere.
 */
export type HrefIntent = { kind: 'external'; url: string } | { kind: 'inApp'; route: string } | { kind: 'none' };

export function hrefIntent(href: unknown): HrefIntent {
  const url = typeof href === 'string' ? href.trim() : '';
  if (!url || url.startsWith('#')) return { kind: 'none' };
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) return { kind: 'external', url };
  if (url.startsWith('//')) return { kind: 'external', url: `https:${url}` };
  return { kind: 'inApp', route: url };
}
