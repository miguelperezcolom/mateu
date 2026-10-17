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
