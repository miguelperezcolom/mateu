import React, { useEffect, useState } from 'react';
import { AppState, Modal, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../ui/Text';
import { MateuButton } from '../ui/controls';
import { useAppContext } from '../context/AppContext';
import { connectivity } from '../core/connectivity';
import { OUTBOX_TEXTS, type QueuedItem } from '../core/offlineQueue';
import { headingA11y, modalA11y } from '../a11y/a11y';
import { themed } from '../theme';

/**
 * The offline send queue of the UI on screen (@Action(offline = QUEUE), core/offlineQueue.ts): a
 * strip saying how many changes are waiting, with "Send now" and "View" (the list, where each one
 * can be cancelled — or retried after the server refused it). The queue is sent when the UI opens,
 * when the connection comes back and when the app returns to the foreground.
 */
export function OutboxHost({ visible = true }: { visible?: boolean }) {
  const { session } = useAppContext();
  const queue = session.outbox;
  const [items, setItems] = useState<QueuedItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!queue) return;
    const off = queue.subscribe(setItems);
    const send = () => void session.sendOutbox();
    send();
    const offConnectivity = connectivity.subscribe((online) => online && send());
    const foreground = AppState.addEventListener?.('change', (state) => state === 'active' && send());
    return () => {
      off();
      offConnectivity();
      foreground?.remove?.();
    };
  }, [queue, session]);

  if (!queue || !visible || items.length === 0) return null;
  const refused = items.some((i) => i.state === 'refused');
  const summary = refused
    ? `${OUTBOX_TEXTS.refused}. ${items.length === 1 ? '1 change waiting.' : `${items.length} changes waiting.`}`
    : items.length === 1 ? OUTBOX_TEXTS.pendingOne : OUTBOX_TEXTS.pendingMany(items.length);

  return (
    <>
      <View style={[styles.strip, refused && styles.refused]} accessibilityLiveRegion="polite">
        <Text style={styles.text}>{summary}</Text>
        <View style={styles.actions}>
          {!refused && <MateuButton label="Send now" compact onPress={() => void session.sendOutbox()} />}
          <MateuButton label="View" compact onPress={() => setOpen(true)} />
        </View>
      </View>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)} {...modalA11y()}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.title} {...headingA11y(2)}>Pending changes</Text>
            <ScrollView style={styles.list}>
              {items.map((item) => (
                <View key={item.key} style={styles.item}>
                  <Text style={styles.itemLabel}>{item.label || item.request.actionId}</Text>
                  <Text style={styles.itemMeta}>
                    {item.state === 'refused' ? `Not accepted: ${item.error ?? ''}` : `Waiting since ${new Date(item.createdAt).toLocaleString()}`}
                  </Text>
                  <View style={styles.actions}>
                    {item.state === 'refused' && (
                      <MateuButton label="Try again" compact onPress={() => void queue.retry(item.key).then(() => session.sendOutbox())} />
                    )}
                    <MateuButton label="Cancel" compact accessibilityLabel={`Cancel ${item.label}`} onPress={() => void queue.cancel(item.key)} />
                  </View>
                </View>
              ))}
            </ScrollView>
            <MateuButton label="Close" onPress={() => setOpen(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = themed(() => StyleSheet.create({
  // always-light pastels with dark ink, like the connectivity strip
  strip: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#fff4ce', zIndex: 90, gap: 6 },
  refused: { backgroundColor: '#fde7e9' },
  text: { color: '#1a1a1a', fontSize: 14 },
  actions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 },
  sheet: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, maxHeight: '80%', gap: 12 },
  title: { color: '#1a1a1a', fontSize: 16, fontWeight: '600' },
  list: { flexGrow: 0 },
  item: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#c8c8c8', gap: 4 },
  itemLabel: { color: '#1a1a1a', fontSize: 14 },
  itemMeta: { color: '#555555', fontSize: 12 },
}));
