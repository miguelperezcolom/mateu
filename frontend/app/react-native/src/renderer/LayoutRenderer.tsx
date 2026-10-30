import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { ProgressBar, Text as PaperText } from 'react-native-paper';
import { rowJustification } from '../core/uxRules';
import { compactRail, declaresWrapPoint, formRowColumns, isPhoneWidth, wizardRailIndex } from '../core/phoneLayout';
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

  // A @WizardProgress(RAIL) wizard composes [form, rail]: on a phone the rail stacks ABOVE the form,
  // collapsed to "Step 2 of 4 · Account type" + a linear progress — beside the form it took a third
  // of the width and clipped the field labels.
  const railIndex = direction === 'row' && isPhoneWidth(width) ? wizardRailIndex(children) : -1;
  const rail = railIndex >= 0 ? compactRail(children[railIndex]) : null;
  if (rail) {
    return (
      <View style={styles.column}>
        <View style={styles.compactRail} accessibilityRole="progressbar" accessibilityLabel={rail.text} accessibilityValue={{ min: 0, max: 100, now: Math.round(rail.progress * 100) }}>
          <PaperText variant="titleSmall" style={styles.compactRailText} numberOfLines={1}>{rail.text}</PaperText>
          <ProgressBar progress={rail.progress} color={theme.primary} style={styles.compactRailBar} />
        </View>
        {children.map((child, i) => (i === railIndex ? null : (
          <View key={i}>{renderComponent(child, state, onStateChange)}</View>
        )))}
      </View>
    );
  }

  // A row that DECLARES its justification (e.g. a wizard's Back/Next bar, justification END) keeps
  // its items at their natural size and places them as declared. Stretching every item to an equal
  // share (the default for undeclared rows) put the wizard's primary "Next" in the middle of the
  // screen (RN-16).
  const justify = direction === 'row' ? rowJustification(metadata['justification'] as string | null | undefined) : null;

  // Zone columns arrive with the backend's responsive wrap point in their style
  // (min-width: min(20rem, …)); honoring it makes zoned sections stack on phone widths
  // exactly like the web renderers. Same for any column that declares a wrap point or a fixed
  // width (`flex: 0 0 22rem`) — the item overview template's panel beside its main area: on a phone
  // the panel stacks above, on a tablet they stay side by side.
  const itemStyle = (child: unknown) => {
    if (direction !== 'row') return undefined;
    if (justify) return undefined;
    const style = ((child as Record<string, unknown>)['style'] as string) ?? '';
    return declaresWrapPoint(style) ? [styles.rowItem, styles.zoneColumn] : styles.rowItem;
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

const styles = themed(() => StyleSheet.create({
  column: { flexDirection: 'column' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rowItem: { flex: 1, minWidth: 120 },
  zoneColumn: { minWidth: 300 },
  compactRail: { marginBottom: 12 },
  compactRailText: { color: theme.ink, marginBottom: 6 },
  compactRailBar: { height: 4, borderRadius: 2, backgroundColor: theme.divider },
}));
