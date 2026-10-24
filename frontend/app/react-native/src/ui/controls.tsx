/**
 * The small set of themed Material primitives the renderers share, so every screen gets the same
 * buttons, chips and checkboxes instead of ad-hoc styles. They wrap React Native Paper and keep the
 * renderer's accessibility contract (role, name, state — src/a11y).
 */
import React, { useState } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Button, Checkbox, HelperText, Icon, Text, TextInput } from 'react-native-paper';
import { decimalDraft } from '../core/uxRules';
import { theme, themed } from '../theme';
import { buttonLook, toneColors, toneOf } from './looks';

export interface MateuButtonProps {
  label: string;
  onPress?: () => void;
  /** The wire's `buttonStyle` (primary | secondary | tertiary | …). */
  buttonStyle?: string | null;
  /** The wire's `color` (`error` marks a destructive action). */
  color?: string | null;
  disabled?: boolean;
  /** Accessible name when the label alone is not enough (icon glyphs, "‹ Prev"). */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  icon?: string;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
}

/** A wire button as a Material button: primary → filled, secondary → tonal, tertiary → text,
 *  anything else → outlined; destructive ones in the theme's error colour. */
export function MateuButton({ label, onPress, buttonStyle, color, disabled, accessibilityLabel, accessibilityHint, icon, compact, style, loading }: MateuButtonProps) {
  const { mode, danger } = buttonLook(buttonStyle, color);
  const dangerColors = danger
    ? mode === 'contained'
      ? { buttonColor: theme.danger, textColor: theme.onFill }
      : { textColor: theme.danger }
    : {};
  return (
    <Button
      mode={mode}
      onPress={onPress}
      disabled={disabled}
      icon={icon}
      compact={compact}
      loading={loading}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      style={[mode === 'outlined' && danger ? { borderColor: theme.danger } : null, styles.button, style]}
      contentStyle={styles.buttonContent}
      labelStyle={styles.buttonLabel}
      {...dangerColors}
    >
      {label}
    </Button>
  );
}

/** A status value as a tonal chip (success / warning / danger / info / neutral). Not a control —
 *  it reads as its text, so screen readers hear the value, not "button". */
export function StatusChip({ label, tone, style }: { label: string; tone?: string | null; style?: StyleProp<ViewStyle> }) {
  const { background, ink } = toneColors(toneOf(tone));
  return (
    <View style={[styles.chip, { backgroundColor: background }, style]}>
      <Text variant="labelMedium" style={[styles.chipText, { color: ink }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** A Material (Android-style box) checkbox on both platforms — the iOS variant draws no box when
 *  unchecked, which reads as "nothing here" in a list. Announced as a checkbox with its state. */
export function SelectBox({ checked, label, onToggle, style, disabled }: { checked: boolean; label: string; onToggle: () => void; style?: StyleProp<ViewStyle>; disabled?: boolean }) {
  return (
    <View
      style={style}
      accessible
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled: !!disabled }}
      // the ARIA alias too: react-native-web only emits aria-checked from it
      aria-checked={checked}
      onAccessibilityTap={onToggle}
    >
      <Checkbox.Android status={checked ? 'checked' : 'unchecked'} onPress={onToggle} disabled={disabled} color={theme.primary} uncheckedColor={theme.muted} />
    </View>
  );
}

type PaperInputProps = React.ComponentProps<typeof TextInput>;

/**
 * A Material outlined text field: the label floats inside the outline, the error turns it red and
 * is spelled out underneath (HelperText). `a11y` is the field's composed accessible name/hint
 * (src/a11y fieldA11y — name, "required", "invalid: …"), handed to the native input.
 */
export function OutlinedInput({ label, required, error, a11y, style, ...rest }: Omit<PaperInputProps, 'label' | 'error'> & {
  label?: string;
  required?: boolean;
  error?: string;
  a11y?: Record<string, unknown>;
}) {
  return (
    <View>
      <TextInput
        mode="outlined"
        label={label ? `${label}${required ? ' *' : ''}` : undefined}
        error={!!error}
        outlineColor={theme.border}
        activeOutlineColor={theme.primary}
        outlineStyle={styles.outline}
        style={[styles.input, style]}
        {...rest}
        {...(a11y as object)}
      />
      {!!error && (
        <HelperText type="error" visible style={styles.helper} importantForAccessibility="no">
          {error}
        </HelperText>
      )}
    </View>
  );
}

/** The decimal variant: keeps the text being typed ("1." stays "1." — see decimalDraft). */
export function OutlinedDecimalInput({ text, onChangeText, ...rest }: Omit<React.ComponentProps<typeof OutlinedInput>, 'value' | 'onChangeText'> & { text: string; onChangeText: (t: string) => void }) {
  const [draft, setDraft] = useState(text);
  return (
    <OutlinedInput
      {...rest}
      value={decimalDraft(draft, text)}
      onChangeText={(t) => {
        setDraft(t);
        onChangeText(t);
      }}
    />
  );
}

/**
 * The trigger of a picker (select, date, lookup) drawn as an outlined field with its label inside
 * and a trailing icon, so a form's selects and dates line up with its text fields. Pressing it
 * opens the picker; it is announced as a button named "<field>: <value>".
 */
export function OutlinedTrigger({ label, required, value, placeholder, icon = 'menu-down', onPress, disabled, error, accessibilityLabel, expanded }: {
  label?: string;
  required?: boolean;
  value: string;
  placeholder?: string;
  icon?: string;
  onPress: () => void;
  disabled?: boolean;
  error?: string;
  accessibilityLabel?: string;
  expanded?: boolean;
}) {
  return (
    <View>
      <Pressable
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? `${label ?? ''}: ${value || 'not selected'}`}
        accessibilityState={{ disabled: !!disabled, ...(expanded !== undefined ? { expanded } : {}) }}
        disabled={disabled}
        onPress={onPress}
      >
        {/* drawn like Paper's outlined field (label in the notch), but as plain views: a read-only
            native input wraps a long value onto a second line inside a narrow column */}
        <View style={[styles.trigger, !!error && { borderColor: theme.danger }, disabled && styles.triggerDisabled]}>
          <Text variant="bodyLarge" numberOfLines={1} style={[styles.triggerValue, !value && { color: theme.faint }]}>
            {value || placeholder || ''}
          </Text>
          <Icon source={icon} size={24} color={disabled ? theme.disabled : theme.muted} />
          {!!label && (
            <Text variant="bodySmall" numberOfLines={1} style={[styles.triggerLabel, !!error && { color: theme.danger }]}>
              {`${label}${required ? ' *' : ''}`}
            </Text>
          )}
        </View>
      </Pressable>
      {!!error && (
        <HelperText type="error" visible style={styles.helper} importantForAccessibility="no">
          {error}
        </HelperText>
      )}
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    button: { borderRadius: theme.radiusPill },
    buttonContent: { minHeight: 40 },
    buttonLabel: { marginHorizontal: 18, letterSpacing: 0.1 },
    chip: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
    chipText: { fontWeight: '600' },
    input: { backgroundColor: theme.surface, fontSize: 16 },
    outline: { borderRadius: 8 },
    helper: { paddingHorizontal: 4 },
    trigger: { flexDirection: 'row', alignItems: 'center', minHeight: 50, marginTop: 6, paddingLeft: 16, paddingRight: 12, borderWidth: 1, borderColor: theme.border, borderRadius: 8, backgroundColor: theme.surface, gap: 8 },
    triggerDisabled: { opacity: 0.6 },
    triggerValue: { flex: 1, color: theme.ink },
    triggerLabel: { position: 'absolute', top: -9, left: 10, paddingHorizontal: 4, backgroundColor: theme.surface, color: theme.muted, maxWidth: '85%' },
  }),
);
