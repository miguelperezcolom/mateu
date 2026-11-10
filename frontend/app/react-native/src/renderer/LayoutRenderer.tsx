import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { ProgressBar, Text as PaperText } from 'react-native-paper';
import { collectionDetailPane, compactRail, formRowColumns, isPhoneWidth, wizardRailIndex } from '../core/phoneLayout';
import { stackLayout } from '../core/stackLayout';
import { BOX_LOOKS, BOX_SIZES, cssToRn } from '../core/cssStyle';
import { theme, themed } from '../theme';

interface Props {
  component: Record<string, unknown>;
  state: Record<string, unknown>;
  onStateChange: (fieldId: string, value: unknown) => void;
  renderComponent: (comp: unknown, state: Record<string, unknown>, onStateChange: (id: string, v: unknown) => void) => React.ReactNode;
  direction: 'row' | 'column';
  /** a FormRow: its fields are the section's columns (one per field) */
  formRow?: boolean;
}

export function LayoutRenderer({ component, state, onStateChange, renderComponent, direction, formRow = false }: Props) {
  const children = (component['children'] as unknown[]) ?? [];
  const metadata = (component['metadata'] as Record<string, unknown>) ?? {};
  const { width } = useWindowDimensions();

  // On a phone a form row is ONE column whatever the section declares: two fields side by side
  // are each too narrow for their value (an e-mail wrapped inside its outlined field on iOS).
  if (formRow && formRowColumns(children.length, width) === 1) {
    return (
      <View style={styles.column}>
        {children.map((child, i) => (
          <View key={i}>{renderComponent(child, state, onStateChange)}</View>
        ))}
      </View>
    );
  }

  // A Collection Detail page shows ONE pane on a phone: the list, or the selected record's detail.
  const pane = direction === 'row' ? collectionDetailPane(component, width) : null;
  if (pane !== null) {
    return <View style={styles.column}>{renderComponent(children[pane], state, onStateChange)}</View>;
  }

  // A @WizardProgress(RAIL) wizard composes [form, rail]: on a phone the rail stacks ABOVE the form,
  // collapsed to "Step 2 of 4 · Account type" + a linear progress — beside the form it took a third
  // of the width and clipped the field labels.
  const railIndex = direction === 'row' && isPhoneWidth(width) ? wizardRailIndex(children) : -1;
  const rail = railIndex >= 0 ? compactRail(children[railIndex]) : null;
  if (rail) {
    return (
      <View style={styles.column}>
        <View style={styles.compactRail} accessibilityRole="progressbar" accessibilityLabel={`${rail.counter}, ${rail.text}`} accessibilityValue={{ min: 0, max: 100, now: Math.round(rail.progress * 100) }}>
          <View style={styles.compactRailHead}>
            <PaperText variant="headlineSmall" style={styles.compactRailCounter}>{rail.counter}</PaperText>
            <PaperText variant="titleSmall" style={styles.compactRailText} numberOfLines={2}>{rail.text}</PaperText>
          </View>
          <ProgressBar progress={rail.progress} color={theme.primary} style={styles.compactRailBar} />
        </View>
        {children.map((child, i) => (i === railIndex ? null : (
          <View key={i}>{renderComponent(child, state, onStateChange)}</View>
        )))}
      </View>
    );
  }

  // A form row on a tablet: its fields share the row equally (they are the section's columns).
  if (formRow) {
    return (
      <View style={styles.row}>
        {children.map((child, i) => (
          <View key={i} style={styles.rowItem}>{renderComponent(child, state, onStateChange)}</View>
        ))}
      </View>
    );
  }

  // Any other row/column: its own attributes (spacing, padding, alignment, justification, wrap,
  // flexGrows — stackLayout) and its own box looks/sizes from its style.
  const layout = stackLayout(direction, metadata, children);
  const own = cssToRn((component['style'] as string) ?? '', OWN_BOX);
  return (
    <View style={[layout.container, own]}>
      {children.map((child, i) => (
        <View key={i} style={layout.items[i]}>
          {renderComponent(child, state, onStateChange)}
        </View>
      ))}
    </View>
  );
}

/** What a layout takes from its own style: its looks and sizes (its flex-grow is its parent's). */
const OWN_BOX = new Set([...BOX_LOOKS, ...BOX_SIZES, 'gap', 'row-gap', 'column-gap']);

const styles = themed(() => StyleSheet.create({
  column: { flexDirection: 'column' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rowItem: { flex: 1, minWidth: 120 },
  compactRail: { marginBottom: 12 },
  compactRailHead: { flexDirection: 'row', alignItems: 'baseline', gap: 12, marginBottom: 6 },
  compactRailCounter: { color: theme.ink, fontWeight: '300', letterSpacing: 1 },
  compactRailText: { color: theme.ink, flexShrink: 1 },
  compactRailBar: { height: 4, borderRadius: 2, backgroundColor: theme.divider },
}));
