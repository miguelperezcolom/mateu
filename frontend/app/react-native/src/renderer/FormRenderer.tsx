import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ComponentRenderer } from './ComponentRenderer';
import { useViewController } from './MateuViewHost';

interface ButtonDto {
  actionId?: string;
  id?: string;
  label?: string;
  buttonStyle?: string;
}

interface Props {
  component: Record<string, unknown>;
  metadata: Record<string, unknown>;
  state: Record<string, unknown>;
}

export function FormRenderer({ component, metadata, state }: Props) {
  const controller = useViewController();

  const title = (metadata['title'] as string) ?? '';
  const subtitle = (metadata['subtitle'] as string) ?? '';
  const readOnly = Boolean(metadata['readOnly']);
  const buttons = (metadata['buttons'] as ButtonDto[]) ?? [];
  const actions = (metadata['actions'] as ButtonDto[]) ?? [];
  const children = (component['children'] as unknown[]) ?? [];

  const handleAction = (actionId: string) => void controller.runAction(actionId);

  // Children render through the shared dispatcher: nested layouts, sections, grids and fields
  // all reach FormFieldRenderer wired to the controller's live state.
  const renderChild = (child: unknown) => <ComponentRenderer component={child} state={state} />;

  return (
    <View style={styles.root}>
      {(title || subtitle || (actions.length > 0 && !readOnly)) && (
        <View style={styles.header}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {!readOnly && actions.length > 0 && (
            <View style={styles.actionBar}>
              {actions.map((a, i) => {
                const id = a.actionId ?? a.id ?? '';
                return (
                  <TouchableOpacity key={i} style={styles.btnPrimary} onPress={() => handleAction(id)}>
                    <Text style={styles.btnPrimaryText}>{a.label ?? id}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.fields}>
        {children.map((child, i) => (
          <View key={i}>{renderChild(child)}</View>
        ))}
      </ScrollView>

      {!readOnly && buttons.length > 0 && (
        <View style={styles.bottomBar}>
          {buttons.map((btn, i) => {
            const id = btn.actionId ?? btn.id ?? '';
            const isPrimary = btn.buttonStyle?.toLowerCase() === 'primary';
            return (
              <TouchableOpacity key={i} style={isPrimary ? styles.btnPrimary : styles.btnDefault} onPress={() => handleAction(id)}>
                <Text style={isPrimary ? styles.btnPrimaryText : styles.btnDefaultText}>{btn.label ?? id}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 20, fontWeight: '600', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  actionBar: { flexDirection: 'row', marginTop: 12, gap: 8 },
  fields: { padding: 16, paddingBottom: 24 },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 8,
    justifyContent: 'flex-end',
  },
  btnPrimary: { backgroundColor: '#0070f3', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
  btnPrimaryText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  btnDefault: { backgroundColor: '#f5f5f5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, borderWidth: 1, borderColor: '#ccc' },
  btnDefaultText: { color: '#333', fontSize: 14 },
});
