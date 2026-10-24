import React from 'react';
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../../ui/Text';
import { buttonA11y, headingA11y, modalA11y } from '../../a11y/a11y';
import { theme, themed } from '../../theme';
import { domainOf } from '../links';
import type { HubEntry } from '../uiStore';
import { SecondaryButton, UiIcon } from './common';

/** Jump between UIs without going through the list (long-press the UI bar, or the drawer's top). */
export function Switcher({
  visible,
  entries,
  activeId,
  onPick,
  onHome,
  onClose,
}: {
  visible: boolean;
  entries: HubEntry[];
  activeId?: string;
  onPick: (entry: HubEntry) => void;
  onHome: () => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} accessibilityLabel="Close the switcher" accessibilityRole="button">
        <View />
      </TouchableOpacity>
      <View style={styles.sheet} {...modalA11y('Switch UI')}>
        <View style={styles.head}>
          <Text style={styles.title} {...headingA11y(2)}>Switch UI</Text>
          <SecondaryButton label="My UIs" a11yLabel="Back to my UIs" onPress={onHome} />
        </View>
        <FlatList
          data={entries}
          keyExtractor={(e) => e.id}
          renderItem={({ item }) => {
            const selected = item.id === activeId;
            return (
              <TouchableOpacity
                {...buttonA11y({ label: `${item.name}, ${domainOf(item.baseUrl)}`, selected })}
                style={[styles.row, selected && styles.rowSelected]}
                onPress={() => onPick(item)}
              >
                <UiIcon name={item.name} icon={item.icon} color={item.themeColor} size={36} />
                <View style={styles.rowText}>
                  <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.domain} numberOfLines={1}>{domainOf(item.baseUrl)}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = themed(() => StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '70%', backgroundColor: theme.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 24 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  title: { fontSize: 17, fontWeight: '700', color: theme.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, minHeight: 56 },
  rowSelected: { backgroundColor: theme.infoBg },
  rowText: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: theme.ink },
  domain: { fontSize: 13, color: theme.muted },
}));
