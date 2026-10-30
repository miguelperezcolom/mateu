import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../ui/Text';
import { interpolate } from '../core/expressions';
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

  // a YAML page's header texts are templates over its state (`title: ${state.name}`)
  const title = interpolate((metadata['title'] as string) ?? '', { state });
  const subtitle = interpolate((metadata['subtitle'] as string) ?? '', { state });
  const readOnly = Boolean(metadata['readOnly']);
  const buttons = (metadata['buttons'] as ButtonDto[]) ?? [];
  // Header buttons. A form expanded on the device (a static bundle's raw definition) also carries
  // its declared action DEFINITIONS here (`actions:` — id + restAction/steps, no label): those are
  // what its buttons run, not buttons of their own, so an entry with no label is not painted.
  const declared = ((metadata['actions'] as ButtonDto[]) ?? []).filter((a) => !!a?.label);
  // …and its page toolbar (a YAML Form's `toolbar:` — Edit, Delete…): navigation as much as action,
  // so shown on a read-only record too. The way back is the screen's own back arrow, not a button.
  const toolbar = ((metadata['toolbar'] as ButtonDto[]) ?? []).filter((b) => !!b?.label && !isBackButton(b));
  const actions = [...toolbar, ...declared];
  const children = (component['children'] as unknown[]) ?? [];

  const handleAction = (actionId: string) => void controller.runAction(actionId);
  const pressButton = useButtonPress();

  // Children render through the shared dispatcher: nested layouts, sections, grids and fields
  // all reach FormFieldRenderer wired to the controller's live state.
  const renderChild = (child: unknown) => <ComponentRenderer component={child} state={state} />;

  return (
    <View style={styles.root}>
      {(title || subtitle || toolbar.length > 0 || (declared.length > 0 && !readOnly)) && (
        <View style={styles.header}>
          {!!title && <PaperText variant="headlineSmall" style={styles.title} accessibilityRole="header">{title}</PaperText>}
          {!!subtitle && <PaperText variant="bodyMedium" style={styles.subtitle}>{subtitle}</PaperText>}
          {(toolbar.length > 0 || (!readOnly && declared.length > 0)) && (
            <View style={styles.actionBar}>
              {(readOnly ? toolbar : actions).map((a, i) => {
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

/** A toolbar button that is the way BACK (the web draws it as the header's chevron): a pushed
 *  screen has its own back arrow, so it is not painted as one more button. */
function isBackButton(b: ButtonDto): boolean {
  const id = String(b.actionId ?? b.id ?? '');
  return id === 'back' || id === 'backToList' || id === 'cancel-view';
}
