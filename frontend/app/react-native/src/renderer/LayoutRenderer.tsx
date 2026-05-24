import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  component: Record<string, unknown>;
  state: Record<string, unknown>;
  onStateChange: (fieldId: string, value: unknown) => void;
  renderComponent: (comp: unknown, state: Record<string, unknown>, onStateChange: (id: string, v: unknown) => void) => React.ReactNode;
  direction: 'row' | 'column';
}

export function LayoutRenderer({ component, state, onStateChange, renderComponent, direction }: Props) {
  const children = (component['children'] as unknown[]) ?? [];

  return (
    <View style={direction === 'row' ? styles.row : styles.column}>
      {children.map((child, i) => (
        <View key={i} style={direction === 'row' ? styles.rowItem : undefined}>
          {renderComponent(child, state, onStateChange)}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  column: { flexDirection: 'column' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rowItem: { flex: 1, minWidth: 120 },
});
