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

  // Zone columns arrive with the backend's responsive wrap point in their style
  // (min-width: min(20rem, …)); honoring it makes zoned sections stack on phone widths
  // exactly like the web renderers.
  const itemStyle = (child: unknown) => {
    if (direction !== 'row') return undefined;
    const style = ((child as Record<string, unknown>)['style'] as string) ?? '';
    return style.includes('min-width: min(20rem') ? [styles.rowItem, styles.zoneColumn] : styles.rowItem;
  };

  return (
    <View style={direction === 'row' ? styles.row : styles.column}>
      {children.map((child, i) => (
        <View key={i} style={itemStyle(child)}>
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
  zoneColumn: { minWidth: 300 },
});
