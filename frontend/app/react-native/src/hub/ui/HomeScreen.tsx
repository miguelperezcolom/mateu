import React, { useMemo, useState } from 'react';
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Appbar, Divider, FAB, Icon, IconButton, List, Searchbar, TouchableRipple } from 'react-native-paper';
import { Text } from '../../ui/Text';
import { headingA11y, modalA11y } from '../../a11y/a11y';
import { theme, themed } from '../../theme';
import { domainOf } from '../links';
import { searchEntries, type HubEntry } from '../uiStore';
import { HubBar, PrimaryButton, SecondaryButton, UiIcon, hubStyles } from './common';

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

/**
 * "My UIs", laid out like an authenticator app in Material 3: a top app bar (export / edit actions), the list of UIs, and a "+" FAB that offers "Scan a QR code" / "Type an address".
 */
export function HomeScreen({ entries, openIds, onOpen, onAdd, onAddDemo, onRemove, onMove, onExport }: Props) {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const shown = useMemo(() => searchEntries(entries, query), [entries, query]);

  return (
    <View style={hubStyles.screen}>
      <HubBar title={editing ? 'Edit list' : 'My UIs'} onNavigate={editing ? () => setEditing(false) : undefined} navigateIcon="check" navigateLabel="Done editing">
        {entries.length > 0 && !editing && (
          <>
            <Appbar.Action icon="qrcode" onPress={onExport} accessibilityLabel="Export my UIs" />
            <Appbar.Action icon="pencil-outline" onPress={() => setEditing(true)} accessibilityLabel="Edit list" />
          </>
        )}
      </HubBar>

      {entries.length === 0 ? (
        <View style={hubStyles.centered}>
          <View style={styles.emptyIcon}>
            <Icon source="apps" size={40} color={theme.onPrimaryContainer} />
          </View>
          <Text style={hubStyles.title} {...headingA11y(2)}>No UIs yet</Text>
          <Text style={hubStyles.text}>
            Add a Mateu UI by scanning its QR code — usually shown in the app's web version under "Open on mobile" — or by typing its address.
          </Text>
          <PrimaryButton label="Scan a QR code" icon="qrcode-scan" onPress={() => onAdd('scan')} style={styles.emptyButton} />
          <SecondaryButton label="Type an address" icon="keyboard-outline" onPress={() => onAdd('type')} />
          <SecondaryButton label="Try a demo" a11yLabel="Add the demo UI" onPress={onAddDemo} />
        </View>
      ) : (
        <>
          {entries.length > 3 && !editing && (
            <Searchbar
              placeholder="Search your UIs"
              accessibilityLabel="Search your UIs"
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              mode="bar"
              style={styles.search}
            />
          )}
          <FlatList
            data={shown}
            keyExtractor={(e) => e.id}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <Divider style={styles.divider} />}
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
          {!editing && (
            <FAB icon="plus" style={styles.fab} onPress={() => setFabOpen(true)} accessibilityLabel="Add a UI" />
          )}
          <AddSheet
            visible={fabOpen}
            onClose={() => setFabOpen(false)}
            onPick={(mode) => {
              setFabOpen(false);
              onAdd(mode);
            }}
          />
        </>
      )}
    </View>
  );
}

/** The "+" FAB's choices, as a Material bottom sheet (what an authenticator app shows). */
function AddSheet({ visible, onClose, onPick }: { visible: boolean; onClose: () => void; onPick: (mode: 'scan' | 'type') => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" accessibilityRole="button">
        <View />
      </TouchableOpacity>
      <View style={styles.sheet} {...modalA11y('Add a UI')}>
        <View style={styles.handle} />
        <Text style={styles.sheetTitle} {...headingA11y(2)}>Add a UI</Text>
        <List.Item
          title="Scan a QR code"
          description="Shown in the app's web version under “Open on mobile”"
          accessibilityRole="button"
          accessibilityLabel="Scan a QR code"
          onPress={() => onPick('scan')}
          left={(p) => <List.Icon {...p} icon="qrcode-scan" />}
          style={styles.sheetItem}
        />
        <List.Item
          title="Type an address"
          description="The https address of the UI"
          accessibilityRole="button"
          accessibilityLabel="Type an address"
          onPress={() => onPick('type')}
          left={(p) => <List.Icon {...p} icon="keyboard-outline" />}
          style={styles.sheetItem}
        />
      </View>
    </Modal>
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
      <TouchableRipple
        style={styles.rowMain}
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`${entry.name}, ${domain}${running ? ', open' : ''}`}
        accessibilityHint="Opens this UI"
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
        <View style={styles.rowInner}>
          <View>
            <UiIcon name={entry.name} icon={entry.icon} color={entry.themeColor} size={40} />
            {running && <View style={styles.runningDot} />}
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowName} numberOfLines={1}>{entry.name}</Text>
            <Text style={styles.rowDomain} numberOfLines={1}>{running ? `${domain} · open` : domain}</Text>
          </View>
          {!editing && <Icon source="chevron-right" size={24} color={theme.muted} />}
        </View>
      </TouchableRipple>
      {editing && (
        <View style={styles.editActions}>
          <IconButton icon="arrow-up" disabled={first} onPress={() => onMove(-1)} accessibilityLabel={`Move ${entry.name} up`} />
          <IconButton icon="arrow-down" disabled={last} onPress={() => onMove(1)} accessibilityLabel={`Move ${entry.name} down`} />
          <IconButton icon="delete-outline" iconColor={theme.danger} onPress={onRemove} accessibilityLabel={`Remove ${entry.name}`} />
        </View>
      )}
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  search: { marginHorizontal: theme.spacing.md, marginTop: theme.spacing.sm, backgroundColor: theme.background },
  list: { paddingVertical: theme.spacing.sm, paddingBottom: 96 },
  divider: { marginLeft: 72 },
  noMatch: { alignSelf: 'center', marginTop: theme.spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface },
  rowMain: { flex: 1 },
  rowInner: { flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: 72, paddingLeft: theme.spacing.md, paddingRight: 12 },
  rowText: { flex: 1 },
  rowName: { fontSize: 16, color: theme.ink },
  rowDomain: { fontSize: 14, color: theme.muted },
  runningDot: { position: 'absolute', right: -1, bottom: 12, width: 12, height: 12, borderRadius: 6, backgroundColor: theme.success, borderWidth: 2, borderColor: theme.surface },
  editActions: { flexDirection: 'row', alignItems: 'center', paddingRight: 4 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: theme.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 24 },
  handle: { alignSelf: 'center', width: 32, height: 4, borderRadius: 2, backgroundColor: theme.border, marginTop: 12 },
  sheetTitle: { fontSize: 22, color: theme.ink, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  sheetItem: { paddingHorizontal: 12 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primaryContainer, marginBottom: theme.spacing.sm },
  emptyButton: { marginTop: theme.spacing.md, alignSelf: 'stretch', maxWidth: 340 },
}));
