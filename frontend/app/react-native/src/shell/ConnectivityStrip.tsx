import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Text } from '../ui/Text';
import { connectivity } from '../core/connectivity';
import { announceLive } from '../a11y/a11y';
import { themed } from '../theme';

export const OFFLINE_TEXT = 'No connection — changes you make now will not be saved.';
export const RESTORED_TEXT = 'Connection restored.';

/**
 * The sustained "no connection" strip (the web's mateu-connectivity-banner): shown while the backend
 * cannot be reached — a request that never got to the network, or the platform saying it is offline
 * — and, once an answer comes back, "Connection restored." for a moment, said to the screen reader.
 */
export function ConnectivityStrip({ visible = true }: { visible?: boolean }) {
  const [online, setOnline] = useState(connectivity.isOnline);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const off = connectivity.subscribe((now) => {
      setOnline(now);
      if (now) {
        announceLive(RESTORED_TEXT, false);
        setRestored(true);
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => setRestored(false), 4000);
      } else {
        announceLive(OFFLINE_TEXT, true);
        setRestored(false);
      }
    });
    // the web build hears the browser's own offline / online events
    const w = Platform.OS === 'web' && typeof window !== 'undefined' ? window : null;
    const onOffline = () => connectivity.notePlatform(false);
    const onOnline = () => connectivity.notePlatform(true);
    w?.addEventListener?.('offline', onOffline);
    w?.addEventListener?.('online', onOnline);
    return () => {
      off();
      if (timer) clearTimeout(timer);
      w?.removeEventListener?.('offline', onOffline);
      w?.removeEventListener?.('online', onOnline);
    };
  }, []);

  if (!visible || (online && !restored)) return null;
  return (
    <View style={[styles.strip, online ? styles.restored : styles.offline]} pointerEvents="none" accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Text style={styles.text}>{online ? RESTORED_TEXT : OFFLINE_TEXT}</Text>
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  strip: { position: 'absolute', top: 0, left: 0, right: 0, paddingVertical: 8, paddingHorizontal: 16, zIndex: 100 },
  // always-light pastels with dark ink, like the web strip (readable in both themes)
  offline: { backgroundColor: '#fde7e9' },
  restored: { backgroundColor: '#e3f4e8' },
  text: { color: '#1a1a1a', fontSize: 14, textAlign: 'center' },
}));
