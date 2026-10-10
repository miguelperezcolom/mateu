import React from 'react';
import { View, StyleSheet } from 'react-native';
import { rowJustification } from '../core/uxRules';

interface Props {
  component: Record<string, unknown>;
  state: Record<string, unknown>;
  onStateChange: (fieldId: string, value: unknown) => void;
  renderComponent: (comp: unknown, state: Record<string, unknown>, onStateChange: (id: string, v: unknown) => void) => React.ReactNode;
  direction: 'row' | 'column';
}

export function LayoutRenderer({ component, state, onStateChange, renderComponent, direction }: Props) {
  const children = (component['children'] as unknown[]) ?? [];
  const metadata = (component['metadata'] as Record<string, unknown>) ?? {};

  // A row that DECLARES its justification (e.g. a wizard's Back/Next bar, justification END) keeps
  // its items at their natural size and places them as declared. Stretching every item to an equal
  // share (the default for undeclared rows) put the wizard's primary "Next" in the middle of the
  // screen (RN-16).
  const justify = direction === 'row' ? rowJustification(metadata['justification'] as string | null | undefined) : null;

  // Zone columns arrive with the backend's responsive wrap point in their style
  // (min-width: min(20rem, …)); honoring it makes zoned sections stack on phone widths
  // exactly like the web renderers.
  const itemStyle = (child: unknown) => {
    if (direction !== 'row') return undefined;
    if (justify) return undefined;
    const style = ((child as Record<string, unknown>)['style'] as string) ?? '';
    return style.includes('min-width: min(20rem') ? [styles.rowItem, styles.zoneColumn] : styles.rowItem;
  };

  return (
    <View style={direction === 'row' ? [styles.row, justify ? { justifyContent: justify } : null] : styles.column}>
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
