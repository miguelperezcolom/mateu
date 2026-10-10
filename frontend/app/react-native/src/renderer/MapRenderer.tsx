import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useViewController } from './MateuViewHost';
import { theme } from '../theme';
import { buttonA11y } from '../a11y/a11y';
import { mapRows, markerParameters, type MapMeta, type MapRow } from './mapRows';

/**
 * Street map (wire `Map`). No native map SDK ships with this renderer, so the map is shown honestly
 * as a card listing its points — coloured dot, label, description — with an "Open in Maps" link per
 * point (OpenStreetMap in the system browser / maps handler). Tapping a marker row runs
 * `markerActionId` with `{ _markerId }`, exactly like the web map's marker click. Row building lives
 * in `mapRows.ts`.
 */
export function MapRenderer({ metadata }: { metadata: Record<string, unknown> }) {
  const controller = useViewController();
  const meta = metadata as MapMeta;
  const rows = mapRows(meta);

  const open = (row: MapRow) => { void Linking.openURL(row.url); };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>🗺 Map</Text>
      {rows.length === 0 && <Text style={styles.empty}>No location</Text>}
      {rows.map((row) => {
        const body = (
          <>
            <View style={[styles.dot, { backgroundColor: row.color }]} />
            <View style={styles.texts}>
              <Text numberOfLines={1} style={styles.label}>{row.label}</Text>
              {!!row.description && <Text numberOfLines={2} style={styles.description}>{row.description}</Text>}
            </View>
          </>
        );
        return (
          <View key={row.key} style={styles.row}>
            {row.actionable ? (
              <TouchableOpacity
                {...buttonA11y({ label: row.description ? `${row.label}, ${row.description}` : row.label })}
                style={styles.main}
                onPress={() => void controller.runAction(meta.markerActionId!, markerParameters(row))}
              >
                {body}
              </TouchableOpacity>
            ) : (
              <View style={styles.main}>{body}</View>
            )}
            <TouchableOpacity
              {...buttonA11y({ label: `Open ${row.label} in Maps`, role: 'link' })}
              style={styles.open}
              onPress={() => open(row)}
            >
              <Text style={styles.openText}>Open in Maps</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth, borderColor: theme.border, borderRadius: theme.radiusMd,
    backgroundColor: theme.white, padding: theme.spacing.sm,
  },
  title: { fontSize: 13, fontWeight: '700', color: theme.muted, marginBottom: theme.spacing.xs },
  empty: { fontSize: 13, color: theme.faint, paddingVertical: theme.spacing.sm },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.divider,
  },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: theme.spacing.sm },
  texts: { flex: 1 },
  label: { fontSize: 14, color: theme.ink, fontWeight: '600' },
  description: { fontSize: 12, color: theme.muted },
  open: { paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs },
  openText: { fontSize: 13, color: theme.info, textDecorationLine: 'underline' },
});
