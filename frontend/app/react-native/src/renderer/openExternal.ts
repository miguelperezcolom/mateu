import { Linking } from 'react-native';
import { safeExternalUrl } from '../core/linkTarget.ts';

/**
 * The ONLY way the renderer hands a data-derived url to the OS: http(s)/mailto/tel are opened,
 * anything else (javascript:, file:, intent:, a custom scheme) is dropped with a warning.
 * Returns whether the url was opened.
 */
export function openExternal(url: unknown): boolean {
  const safe = safeExternalUrl(url);
  if (!safe) {
    console.warn('[mateu] refused to open a link with an unsupported scheme:', String(url).slice(0, 80));
    return false;
  }
  void Linking.openURL(safe);
  return true;
}
