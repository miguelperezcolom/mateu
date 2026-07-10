import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useViewController } from './MateuViewHost';
import { ComponentRenderer } from './ComponentRenderer';

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
  data: unknown;
}

export function PageRenderer({ component, metadata, state, data }: Props) {
  const controller = useViewController();
  const runAction = (actionId: string) => void controller.runAction(actionId);

  const title = (metadata['title'] as string) ?? (metadata['pageTitle'] as string) ?? '';
  const subtitle = (metadata['subtitle'] as string) ?? '';
  const toolbar = (metadata['toolbar'] as ButtonDto[]) ?? [];
  const buttons = (metadata['buttons'] as ButtonDto[]) ?? [];
  const children = (component['children'] as unknown[]) ?? [];

  const handleAction = (actionId: string) => runAction(actionId);

  return (
    <View style={styles.root}>
      {(!!title || !!subtitle || toolbar.length > 0) && (
        <View style={styles.header}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {toolbar.length > 0 && (
            <View style={styles.toolbar}>
              {toolbar.map((btn, i) => {
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
      )}

      <ScrollView contentContainerStyle={styles.body}>
        {children.map((child, i) => (
          <ComponentRenderer key={i} component={child} state={state} data={data} />
        ))}
      </ScrollView>

      {buttons.length > 0 && (
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
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 },
  body: { padding: 16, paddingBottom: 24 },
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
