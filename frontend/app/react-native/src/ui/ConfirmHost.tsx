/**
 * A yes/no question as a Material 3 dialog: extra-large corners, headline, supporting text, and text
 * buttons at the end, in sentence case. (Android's native alert is the older look, in capitals.) It
 * is its own Modal, not a Paper Portal, because a question may come from inside a drawer or a sheet,
 * which are native Modals themselves: a Portal would open behind them.
 */
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { modalA11y } from '../a11y/a11y';
import { theme, themed } from '../theme';
import { MateuButton } from './controls';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
}

type Pending = ConfirmRequest & { resolve: (answer: boolean) => void };

let show: ((request: Pending) => void) | undefined;

/** Ask, and answer false when dismissed. Without a host on screen, nothing can be asked: false. */
export function askConfirm(request: ConfirmRequest): Promise<boolean> {
  return new Promise((resolve) => {
    if (!show) resolve(false);
    else show({ ...request, resolve });
  });
}

export function ConfirmHost() {
  const [queue, setQueue] = useState<Pending[]>([]);
  useEffect(() => {
    show = (request) => setQueue((q) => [...q, request]);
    return () => { show = undefined; };
  }, []);
  const current = queue[0];
  const answer = (value: boolean) => {
    current?.resolve(value);
    setQueue((q) => q.slice(1));
  };
  return (
    <Modal visible={!!current} transparent animationType="fade" statusBarTranslucent onRequestClose={() => answer(false)}>
      <View style={styles.center}>
        <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Dismiss" onPress={() => answer(false)} />
        {!!current && (
          <Surface elevation={3} style={styles.dialog} {...modalA11y(current.title)}>
            <Text variant="headlineSmall" style={styles.title} accessibilityRole="header">{current.title}</Text>
            {!!current.message && <Text variant="bodyMedium" style={styles.message}>{current.message}</Text>}
            <View style={styles.actions}>
              <MateuButton label={current.cancelLabel ?? 'Cancel'} buttonStyle="tertiary" onPress={() => answer(false)} />
              <MateuButton label={current.confirmLabel} buttonStyle="tertiary" color={current.destructive ? 'error' : undefined} onPress={() => answer(true)} />
            </View>
          </Surface>
        )}
      </View>
    </Modal>
  );
}

const styles = themed(() => StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.32)' },
  dialog: { width: '100%', maxWidth: 400, borderRadius: theme.radiusLg, padding: 24, backgroundColor: theme.surface },
  title: { color: theme.ink, marginBottom: 16 },
  message: { color: theme.muted, marginBottom: 24 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 8 },
}));
