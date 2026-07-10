import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useViewController } from './MateuViewHost';

interface LookupOption {
  value: string;
  label: string;
  description?: string | null;
}

interface Props {
  fieldId: string;
  label?: string;
  value: string;
  editable: boolean;
  /** Remote search action; defaults to the `search-<fieldId>` convention. */
  action?: string | null;
  onChange: (value: string) => void;
}

/**
 * `@Lookup` / searchable selects: a button-like field opening a modal with a search box; typing
 * (debounced) runs the field's `search-<fieldId>` action and the options arrive as a data-only
 * fragment keyed by fieldId (`{ <fieldId>: { content: [{value,label}…] } }`) through the
 * controller's field data handler. The picked label is kept locally so the button can display
 * selections beyond the loaded page (the wire only stores the value).
 */
export function LookupField({ fieldId, label, value, editable, action, onChange }: Props) {
  const controller = useViewController();
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [options, setOptions] = useState<LookupOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [pickedLabel, setPickedLabel] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const searchAction = action || `search-${fieldId}`;

  useEffect(() => {
    controller.registerFieldDataHandler(fieldId, (data) => {
      const page = data as { content?: LookupOption[] } | LookupOption[] | null;
      const content = Array.isArray(page) ? page : page?.content ?? [];
      setOptions(content.filter((o) => o && o.value !== undefined && o.value !== null));
      setLoading(false);
    });
    return () => controller.unregisterFieldDataHandler(fieldId);
  }, [controller, fieldId]);

  const search = (text: string) => {
    setLoading(true);
    void controller.runAction(searchAction, { searchText: text }, true);
  };

  const openPanel = () => {
    if (!editable) return;
    setOpen(true);
    setSearchText('');
    search('');
  };

  const onType = (text: string) => {
    setSearchText(text);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(text), 300);
  };

  const pick = (opt: LookupOption) => {
    setPickedLabel(opt.label);
    onChange(opt.value);
    setOpen(false);
  };

  const display = pickedLabel ?? (value || '');

  return (
    <View>
      <TouchableOpacity style={styles.input} onPress={openPanel} activeOpacity={editable ? 0.7 : 1}>
        <Text style={!display ? styles.placeholder : undefined}>{display || label || 'Select…'}</Text>
      </TouchableOpacity>
      {open && (
        <Modal animationType="fade" transparent onRequestClose={() => setOpen(false)}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
            <TouchableOpacity activeOpacity={1} style={styles.panel} onPress={() => {}}>
              <TextInput
                style={styles.search}
                value={searchText}
                onChangeText={onType}
                placeholder="Search…"
                autoFocus
                autoCapitalize="none"
              />
              {loading && <ActivityIndicator color="#0070f3" style={styles.spinner} />}
              <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
                {!loading && options.length === 0 && <Text style={styles.empty}>No results</Text>}
                {options.map((opt) => (
                  <TouchableOpacity key={opt.value} style={styles.option} onPress={() => pick(opt)}>
                    <Text style={opt.value === value ? styles.optionSelected : undefined}>{opt.label}</Text>
                    {!!opt.description && <Text style={styles.optionDescription}>{opt.description}</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {!!value && (
                <TouchableOpacity style={styles.clear} onPress={() => { setPickedLabel(null); onChange(''); setOpen(false); }}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    minHeight: 42,
    justifyContent: 'center',
  },
  placeholder: { color: '#aaa' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  panel: { backgroundColor: '#fff', borderRadius: 12, padding: 12, maxHeight: '70%' },
  search: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  spinner: { marginTop: 8 },
  list: { marginTop: 8 },
  empty: { padding: 12, color: '#999', fontStyle: 'italic', fontSize: 13 },
  option: { paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  optionSelected: { fontWeight: '700', color: '#0070f3' },
  optionDescription: { fontSize: 12, color: '#888', marginTop: 2 },
  clear: { padding: 10, alignItems: 'center' },
  clearText: { color: '#cc0000', fontWeight: '600', fontSize: 13 },
});
