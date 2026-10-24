import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from '../../ui/Text';
import { buttonA11y, fieldA11y, headingA11y } from '../../a11y/a11y';
import { theme, themed } from '../../theme';
import { domainOf } from '../links';
import { searchEntries, type HubEntry } from '../uiStore';
import { PrimaryButton, SecondaryButton, UiIcon, hubStyles } from './common';

interface Props {
  entries: HubEntry[];
  openIds: string[];
  onOpen: (entry: HubEntry) => void;
  onAdd: (mode: 'scan' | 'type') => void;
  onAddDemo: () => void;
  onRemove: (entry: HubEntry) => void;
  onMove: (entry: HubEntry, delta: number) => void;
  onExport: () => void;
}

/** "My UIs": the list, search, add, edit (reorder / remove) and export. */
export function HomeScreen({ entries, openIds, onOpen, onAdd, onAddDemo, onRemove, onMove, onExport }: Props) {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(false);
  const shown = useMemo(() => searchEntries(entries, query), [entries, query]);

  return (
    <View style={hubStyles.screen}>
      <View style={hubStyles.header}>
        <Text style={hubStyles.headerTitle} {...headingA11y(1)}>My UIs</Text>
        <View style={hubStyles.headerActions}>
          {entries.length > 0 && <SecondaryButton label="Export" a11yLabel="Export my UIs" onPress={onExport} />}
          {entries.length > 0 && (
            <SecondaryButton label={editing ? 'Done' : 'Edit'} a11yLabel={editing ? 'Done editing' : 'Edit list'} onPress={() => setEditing((e) => !e)} />
          )}
        </View>
      </View>

      {entries.length === 0 ? (
        <View style={hubStyles.centered}>
          <Text style={hubStyles.title} {...headingA11y(2)}>No UIs yet</Text>
          <Text style={hubStyles.text}>
            Add a Mateu UI by scanning its QR code — usually shown in the app's web version under "Open on mobile" — or by typing its address.
          </Text>
          <PrimaryButton label="Scan a QR code" onPress={() => onAdd('scan')} style={styles.emptyButton} />
          <SecondaryButton label="Type an address" onPress={() => onAdd('type')} />
          <SecondaryButton label="Try a demo" a11yLabel="Add the demo UI" onPress={onAddDemo} />
        </View>
      ) : (
        <>
          {entries.length > 3 && (
            <View style={styles.searchBox}>
              <TextInput
                {...fieldA11y({ label: 'Search your UIs' })}
                accessibilityRole="search"
                placeholder="Search"
                placeholderTextColor={theme.faint}
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                autoCorrect={false}
                style={hubStyles.input}
              />
            </View>
          )}
          <FlatList
            data={shown}
            keyExtractor={(e) => e.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={[hubStyles.text, styles.noMatch]}>No UI matches "{query}".</Text>}
            renderItem={({ item, index }) => (
              <EntryRow
                entry={item}
                running={openIds.includes(item.id)}
                editing={editing && !query}
                first={index === 0}
                last={index === shown.length - 1}
                onOpen={() => onOpen(item)}
                onRemove={() => onRemove(item)}
                onMove={(d) => onMove(item, d)}
              />
            )}
          />
          <View style={styles.footer}>
            <PrimaryButton label="Scan a QR code" onPress={() => onAdd('scan')} style={styles.footerButton} />
            <SecondaryButton label="Type an address" onPress={() => onAdd('type')} />
          </View>
        </>
      )}
    </View>
  );
}

function EntryRow({
  entry,
  running,
  editing,
  first,
  last,
  onOpen,
  onRemove,
  onMove,
}: {
  entry: HubEntry;
  running: boolean;
  editing: boolean;
  first: boolean;
  last: boolean;
  onOpen: () => void;
  onRemove: () => void;
  onMove: (delta: number) => void;
}) {
  const domain = domainOf(entry.baseUrl);
  // The row is one control ("Acme CRM, crm.acme.com, open"); in edit mode the reorder/remove buttons
  // are separate controls, and the same actions are also offered as accessibility actions on the
  // row so a screen-reader user can reorder without hunting for the small buttons.
  return (
    <View style={styles.row}>
      <TouchableOpacity
        {...buttonA11y({ label: `${entry.name}, ${domain}${running ? ', open' : ''}`, hint: 'Opens this UI' })}
        style={styles.rowMain}
        onPress={onOpen}
        accessibilityActions={[
          ...(!first ? [{ name: 'moveUp', label: 'Move up' }] : []),
          ...(!last ? [{ name: 'moveDown', label: 'Move down' }] : []),
          { name: 'remove', label: 'Remove' },
        ]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'moveUp') onMove(-1);
          else if (e.nativeEvent.actionName === 'moveDown') onMove(1);
          else if (e.nativeEvent.actionName === 'remove') onRemove();
        }}
      >
        <UiIcon name={entry.name} icon={entry.icon} color={entry.themeColor} />
        <View style={styles.rowText}>
          <Text style={styles.rowName} numberOfLines={1}>{entry.name}</Text>
          <Text style={styles.rowDomain} numberOfLines={1}>{domain}</Text>
        </View>
        {running && <View style={styles.runningDot} />}
      </TouchableOpacity>
      {editing && (
        <View style={styles.editActions}>
          <TouchableOpacity {...buttonA11y({ label: `Move ${entry.name} up`, disabled: first })} disabled={first} onPress={() => onMove(-1)} style={styles.editButton}>
            <Text style={[styles.editGlyph, first && styles.editGlyphDisabled]}>▲</Text>
          </TouchableOpacity>
          <TouchableOpacity {...buttonA11y({ label: `Move ${entry.name} down`, disabled: last })} disabled={last} onPress={() => onMove(1)} style={styles.editButton}>
            <Text style={[styles.editGlyph, last && styles.editGlyphDisabled]}>▼</Text>
          </TouchableOpacity>
          <TouchableOpacity {...buttonA11y({ label: `Remove ${entry.name}` })} onPress={onRemove} style={styles.editButton}>
            <Text style={[styles.editGlyph, { color: theme.danger }]}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  searchBox: { paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md },
  list: { padding: theme.spacing.md, gap: theme.spacing.sm },
  noMatch: { alignSelf: 'center', marginTop: theme.spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.white, borderRadius: theme.radiusMd },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, minHeight: 64 },
  rowText: { flex: 1 },
  rowName: { fontSize: 16, fontWeight: '600', color: theme.ink },
  rowDomain: { fontSize: 13, color: theme.muted, marginTop: 2 },
  runningDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.success },
  editActions: { flexDirection: 'row', paddingRight: 4 },
  editButton: { width: theme.minTouch, height: theme.minTouch, alignItems: 'center', justifyContent: 'center' },
  editGlyph: { fontSize: 16, color: theme.primary },
  editGlyphDisabled: { color: theme.disabled },
  footer: { padding: theme.spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border, backgroundColor: theme.white, alignItems: 'stretch' },
  footerButton: { alignSelf: 'stretch' },
  emptyButton: { marginTop: theme.spacing.md, alignSelf: 'stretch', maxWidth: 340 },
}));
