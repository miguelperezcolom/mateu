import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../ui/Text';
import { announceLive } from '../a11y/a11y';
import { theme, themed } from '../theme';
import type { MateuViewController } from '../core/MateuViewController';
import { newEditors, presenceRouteOf, presenceSummary, type PresenceEntry } from '../core/presence';

/**
 * Record presence on the phone (`@App(presence = true)`): a line above a record screen — "Ana is
 * editing this record" in a warning tone when someone else edits it, "Bob is viewing it" otherwise.
 * Nothing when nobody else is there. Someone STARTING to edit is announced once, politely.
 */
export function PresenceChip({ controller, route, view }: { controller: MateuViewController; route: string; view: string }) {
  const session = controller.session;
  const [entries, setEntries] = React.useState<PresenceEntry[]>([]);
  const recordRoute = presenceRouteOf(route, session.presence.rootRoute);
  const edits = controller.trackDirty;
  React.useEffect(() => {
    if (!session.presence.enabled) return;
    let previous: PresenceEntry[] | null = null;
    const watch = session.presence.watch(recordRoute, view, edits, controller.dirty, (next) => {
      if (previous) for (const name of newEditors(previous, next)) announceLive(`${name} started editing this record`, false);
      previous = next;
      setEntries(next);
    });
    // editing = this screen holds unsaved changes: told at once, not on the next heartbeat
    const before = controller.onDirtyChanged;
    controller.onDirtyChanged = (dirty) => {
      before(dirty);
      watch.setEditing(dirty);
    };
    return () => {
      controller.onDirtyChanged = before;
      watch.stop();
    };
  }, [session, controller, recordRoute, view, edits]);
  const summary = presenceSummary(entries);
  if (!summary) return null;
  return (
    <View style={[styles.chip, summary.tone === 'warning' && styles.warning]} accessible
      accessibilityRole="text" accessibilityLabel={`Also on this record: ${summary.text}`}>
      <Text style={[styles.text, summary.tone === 'warning' && styles.warningText]} numberOfLines={2}>{summary.text}</Text>
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  chip: { marginHorizontal: 16, marginTop: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, alignSelf: 'flex-start', borderWidth: StyleSheet.hairlineWidth, borderColor: theme.border },
  warning: { backgroundColor: theme.warningBg, borderColor: theme.warning },
  text: { fontSize: 12, color: theme.muted },
  warningText: { color: theme.warning },
}));
