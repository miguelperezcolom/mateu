import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { isTypingElement } from '../core/keyShortcuts';

/**
 * The hardware keyboard of the session on show: on react-native-web the document's keydown is
 * matched against the session's shortcuts (screen first, then app — core/keyShortcuts.ts), and a
 * key something took does nothing else. React Native has no global key events on iOS or Android
 * (its key events are an experimental, off-by-default Android flag, delivered only to the focused
 * view), so on a device this host listens to nothing.
 */
export function KeyboardShortcutsHost({ visible }: { visible: boolean }) {
  const { session } = useAppContext();
  useEffect(() => {
    if (Platform.OS !== 'web' || !visible || typeof document === 'undefined') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing) return;
      const typing = isTypingElement(document.activeElement as HTMLElement | null);
      if (session.keyShortcuts?.handle(e, typing)) e.preventDefault();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [session, visible]);
  return null;
}
