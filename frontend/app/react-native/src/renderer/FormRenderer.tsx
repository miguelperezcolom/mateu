import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../ui/Text';
import { ComponentRenderer } from './ComponentRenderer';
import { useViewController } from './MateuViewHost';
import { theme, themed } from '../theme';
import { Text as PaperText } from 'react-native-paper';
import { MateuButton } from '../ui/controls';
import { buttonA11y } from '../a11y/a11y';
import { useButtonPress } from './useButtonPress';

interface ButtonDto {
  actionId?: string;
  id?: string;
  label?: string;
  buttonStyle?: string;
  route?: string;
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
  // Header buttons. A form expanded on the device (a static bundle's raw definition) also carries
  // its declared action DEFINITIONS here (`actions:` — id + restAction/steps, no label): those are
  // what its buttons run, not buttons of their own, so an entry with no label is not painted.
  const actions = ((metadata['actions'] as ButtonDto[]) ?? []).filter((a) => !!a?.label);
  const children = (component['children'] as unknown[]) ?? [];

  const handleAction = (actionId: string) => void controller.runAction(actionId);
  const pressButton = useButtonPress();

  // Children render through the shared dispatcher: nested layouts, sections, grids and fields
  // all reach FormFieldRenderer wired to the controller's live state.
  const renderChild = (child: unknown) => <ComponentRenderer component={child} state={state} />;

  return (
    <View style={styles.root}>
      {(title || subtitle || (actions.length > 0 && !readOnly)) && (
        <View style={styles.header}>
          {!!title && <PaperText variant="headlineSmall" style={styles.title} accessibilityRole="header">{title}</PaperText>}
          {!!subtitle && <PaperText variant="bodyMedium" style={styles.subtitle}>{subtitle}</PaperText>}
          {!readOnly && actions.length > 0 && (
            <View style={styles.actionBar}>
              {actions.map((a, i) => {
                const id = a.actionId ?? a.id ?? '';
                // Only a button the server marks primary looks primary: a row of equally loud
                // buttons has no hierarchy (Refactoring UI, "not every button is primary").
                const press = pressButton(a as Record<string, unknown>, { state }, () => handleAction(id), a.label ?? id);
                return (
                  <MateuButton key={i} label={a.label ?? id} buttonStyle={a.buttonStyle} color={(a as { color?: string }).color} disabled={press.disabled} onPress={press.onPress} />
                );
              })}
            </View>
          )}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.fields} keyboardShouldPersistTaps="handled">
        {children.map((child, i) => (
          <View key={i}>{renderChild(child)}</View>
        ))}
      </ScrollView>

      {!readOnly && buttons.length > 0 && (
        <View style={styles.bottomBar}>
          {buttons.map((btn, i) => {
            const id = btn.actionId ?? btn.id ?? '';
            const press = pressButton(btn as Record<string, unknown>, { state }, () => handleAction(id), btn.label ?? id);
            return (
              <MateuButton key={i} label={btn.label ?? id} buttonStyle={btn.buttonStyle} color={(btn as { color?: string }).color} disabled={press.disabled} onPress={press.onPress} />
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.surface },
  header: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16, backgroundColor: theme.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider },
  title: { color: theme.ink, fontWeight: '600' },
  subtitle: { color: theme.muted, marginTop: 4 },
  actionBar: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, gap: 8 },
  fields: { padding: 16, paddingBottom: 24 },
  bottomBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    backgroundColor: theme.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.divider,
    gap: 8,
    justifyContent: 'flex-end',
  },
  btnDisabled: { opacity: 0.45 },
  btnPrimary: { backgroundColor: theme.primary, paddingHorizontal: 20, paddingVertical: 10, minHeight: theme.minTouch, justifyContent: 'center', borderRadius: theme.radiusSm },
  btnPrimaryText: { color: theme.onFill, fontWeight: '600', fontSize: 14 },
  btnDefault: { backgroundColor: theme.background, paddingHorizontal: 20, paddingVertical: 10, minHeight: theme.minTouch, justifyContent: 'center', borderRadius: theme.radiusSm, borderWidth: 1, borderColor: theme.border },
  btnDefaultText: { color: theme.ink, fontSize: 14 },
}));
