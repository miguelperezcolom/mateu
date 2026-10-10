import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useViewController } from './MateuViewHost';
import { filterSwitcherOptions, switcherCurrentLabel, switcherPick, type RecordSwitcher, type SwitcherOption } from './patternGaps';
import { theme } from '../theme';
import { buttonA11y, modalA11y } from '../a11y/a11y';

/**
 * The page header's record/context switcher (`PageDto.switcher`): a compact pill under the title
 * showing the current entry, opening a bottom sheet with the options (plus a filter box when
 * `searchable`). Picking another entry runs the switcher's action with `{_record: value}`.
 * `disabled` → the current value as plain text, nothing to open.
 */
export function RecordSwitcherRenderer({ switcher }: { switcher: RecordSwitcher }) {
  const controller = useViewController();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const current = switcherCurrentLabel(switcher);
  const hint = switcher.label ?? (switcher.type === 'context' ? 'Context' : '');
  const options = filterSwitcherOptions(switcher.options ?? [], switcher.searchable ? query : '');

  const pick = (o: SwitcherOption) => {
    if (o.disabled) return;
    const action = switcherPick(switcher, o.value);
    setOpen(false);
    setQuery('');
    if (action) void controller.runAction(action.actionId, action.parameters);
  };

  if (switcher.disabled) {
    return (
      <View style={styles.pill} accessible accessibilityLabel={`${hint ? `${hint}: ` : ''}${current}`} accessibilityState={{ disabled: true }}>
        {!!hint && <Text style={styles.hint}>{hint}</Text>}
        <Text style={[styles.value, styles.valueDisabled]} numberOfLines={1}>{current}</Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        {...buttonA11y({ label: `${hint ? `${hint}: ` : ''}${current}`, hint: 'Opens the list to switch', expanded: open })}
        style={styles.pill}
        onPress={() => setOpen(true)}
      >
        {!!hint && <Text style={styles.hint}>{hint}</Text>}
        <Text style={styles.value} numberOfLines={1}>{current}</Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet} {...modalA11y()}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{hint || 'Switch'}</Text>
              <TouchableOpacity {...buttonA11y({ label: 'Close' })} onPress={() => setOpen(false)}>
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>
            {switcher.searchable && (
              <TextInput
                style={styles.search}
                value={query}
                onChangeText={setQuery}
                placeholder="Search…"
                placeholderTextColor={theme.faint}
                accessibilityLabel="Filter the list"
                autoFocus
              />
            )}
            <FlatList
              data={options}
              keyExtractor={(o, i) => `${String(o.value ?? '')}#${i}`}
              ListEmptyComponent={<Text style={styles.empty}>No matches</Text>}
              renderItem={({ item }) => {
                const selected = String(item.value ?? '') === String(switcher.value ?? '');
                return (
                  <TouchableOpacity
                    {...buttonA11y({ role: 'radio', selected, disabled: !!item.disabled })}
                    style={[styles.option, selected && styles.optionSelected]}
                    disabled={!!item.disabled}
                    onPress={() => pick(item)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected, item.disabled && styles.valueDisabled]}>
                        {String(item.label ?? item.value ?? '')}
                      </Text>
                      {!!item.description && <Text style={styles.optionDescription}>{item.description}</Text>}
                    </View>
                    {selected && <Text style={styles.check}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radiusPill,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.background,
    maxWidth: '100%',
  },
  hint: { fontSize: 12, color: theme.muted },
  value: { fontSize: 14, fontWeight: '600', color: theme.ink, flexShrink: 1 },
  valueDisabled: { color: theme.faint },
  chevron: { fontSize: 12, color: theme.muted },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { maxHeight: '75%', backgroundColor: theme.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 24 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.divider },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: theme.ink },
  close: { fontSize: 16, color: theme.muted, paddingHorizontal: 4 },
  search: { margin: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: theme.border, borderRadius: theme.radiusSm, fontSize: 14, color: theme.ink },
  option: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.divider },
  optionSelected: { backgroundColor: theme.infoBg },
  optionLabel: { fontSize: 15, color: theme.ink },
  optionLabelSelected: { fontWeight: '700' },
  optionDescription: { fontSize: 12, color: theme.muted, marginTop: 2 },
  check: { fontSize: 16, color: theme.primary, marginLeft: 8 },
  empty: { padding: 16, color: theme.muted, textAlign: 'center' },
});
