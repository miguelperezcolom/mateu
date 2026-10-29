import React from 'react';
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, List } from 'react-native-paper';
import { Text } from '../../ui/Text';
import { headingA11y, modalA11y } from '../../a11y/a11y';
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
        <View style={styles.handle} />
        <View style={styles.head}>
          <Text style={styles.title} {...headingA11y(2)}>Switch UI</Text>
          <SecondaryButton label="My UIs" icon="view-list-outline" a11yLabel="Back to my UIs" onPress={onHome} />
        </View>
        <FlatList
          data={entries}
          keyExtractor={(e) => e.id}
          renderItem={({ item }) => {
            const selected = item.id === activeId;
            return (
              <List.Item
                title={item.name}
                description={domainOf(item.baseUrl)}
                titleNumberOfLines={1}
                descriptionNumberOfLines={1}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}, ${domainOf(item.baseUrl)}`}
                accessibilityState={{ selected }}
                style={[styles.row, selected && styles.rowSelected]}
                titleStyle={styles.name}
                descriptionStyle={styles.domain}
                onPress={() => onPick(item)}
                left={() => (
                  <View style={styles.avatar}>
                    <UiIcon name={item.name} icon={item.icon} color={item.themeColor} size={36} />
                  </View>
                )}
                right={() => (selected ? <View style={styles.avatar}><Icon source="check" size={22} color={theme.onPrimaryContainer} /></View> : null)}
              />
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = themed(() => StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '70%', backgroundColor: theme.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 24 },
  handle: { alignSelf: 'center', width: 32, height: 4, borderRadius: 2, backgroundColor: theme.border, marginTop: 12 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  title: { fontSize: 22, fontWeight: '400', color: theme.ink },
  row: { paddingHorizontal: 16, minHeight: 56, marginHorizontal: 8, borderRadius: 28 },
  avatar: { justifyContent: 'center' },
  rowSelected: { backgroundColor: theme.primaryContainer },
  name: { fontSize: 16, color: theme.ink },
  domain: { fontSize: 14, color: theme.muted },
}));
