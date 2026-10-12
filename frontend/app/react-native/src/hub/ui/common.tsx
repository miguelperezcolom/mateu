import React, { useState } from 'react';
import { Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import { buttonA11y } from '../../a11y/a11y';
import { theme } from '../../theme';

/** A yes/no question: native Alert on iOS/Android, window.confirm on web (same as the dirty guard). */
export function confirmDialog(title: string, message: string, okLabel: string, destructive = false): Promise<boolean> {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      resolve(typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`));
      return;
    }
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: okLabel, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
    ]);
  });
}

const initials = (name: string): string => {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, ' ').split(/\s+/).filter(Boolean);
  const s = words.length >= 2 ? words[0][0] + words[1][0] : (words[0] ?? '?').slice(0, 2);
  return s.toUpperCase();
};

/** Black or white, whichever reads better on a manifest's theme colour (it can be anything). */
export function inkOn(hex: string | undefined): string {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex ?? '');
  if (!m) return theme.onPrimary;
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  const lin = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const l = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  // contrast vs white = 1.05/(l+.05); vs black = (l+.05)/.05 — pick the larger
  return 1.05 / (l + 0.05) >= (l + 0.05) / 0.05 ? '#FFFFFF' : '#111111';
}

/** The UI's icon from its manifest, or its initials on its theme colour. Decorative: the row's
 *  label already names the UI, so the image is hidden from screen readers. */
export function UiIcon({ name, icon, color, size = 44 }: { name: string; icon?: string; color?: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const box = { width: size, height: size, borderRadius: size * 0.22 };
  if (icon && !failed) {
    return (
      <Image
        source={{ uri: icon }}
        style={[box, styles.iconImage]}
        onError={() => setFailed(true)}
        accessibilityElementsHidden
        importantForAccessibility="no"
        accessibilityIgnoresInvertColors
      />
    );
  }
  return (
    <View style={[box, styles.initials, { backgroundColor: color ?? theme.primary }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Text style={[styles.initialsText, { fontSize: size * 0.38, color: inkOn(color ?? theme.primary) }]}>{initials(name)}</Text>
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled, style, hint }: { label: string; onPress: () => void; disabled?: boolean; style?: StyleProp<ViewStyle>; hint?: string }) {
  return (
    <TouchableOpacity
      {...buttonA11y({ label, disabled, hint })}
      disabled={disabled}
      onPress={onPress}
      style={[styles.primary, disabled && styles.primaryDisabled, style]}
    >
      <Text style={styles.primaryText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function SecondaryButton({ label, onPress, style, danger, a11yLabel }: { label: string; onPress: () => void; style?: StyleProp<ViewStyle>; danger?: boolean; a11yLabel?: string }) {
  return (
    <TouchableOpacity {...buttonA11y({ label: a11yLabel ?? label })} onPress={onPress} style={[styles.secondary, style]} hitSlop={theme.hitSlop}>
      <Text style={[styles.secondaryText, danger && { color: theme.danger }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export const hubStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    minHeight: 56,
    backgroundColor: theme.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: theme.ink },
  headerActions: { flexDirection: 'row', gap: 4 },
  body: { padding: theme.spacing.md, gap: theme.spacing.md },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg, gap: theme.spacing.sm },
  title: { fontSize: 18, fontWeight: '700', color: theme.ink, textAlign: 'center' },
  text: { fontSize: 15, color: theme.muted, textAlign: 'center', maxWidth: 340 },
  label: { fontSize: 14, fontWeight: '600', color: theme.ink },
  input: {
    minHeight: theme.minTouch,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radiusSm,
    paddingHorizontal: 12,
    fontSize: 16,
    color: theme.ink,
    backgroundColor: theme.white,
  },
  error: { color: theme.danger, fontSize: 14 },
  card: { backgroundColor: theme.white, borderRadius: theme.radiusMd, padding: theme.spacing.md, gap: theme.spacing.sm },
  warning: { backgroundColor: theme.warningBg, borderRadius: theme.radiusSm, padding: 12 },
  warningText: { color: theme.warning, fontSize: 14 },
  note: { backgroundColor: theme.infoBg, borderRadius: theme.radiusSm, padding: 12 },
  noteText: { color: theme.info, fontSize: 14 },
});

const styles = StyleSheet.create({
  iconImage: { backgroundColor: theme.divider },
  initials: { alignItems: 'center', justifyContent: 'center' },
  initialsText: { color: theme.white, fontWeight: '700' },
  primary: {
    backgroundColor: theme.primary,
    minHeight: theme.minTouch,
    paddingHorizontal: 20,
    borderRadius: theme.radiusSm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryDisabled: { backgroundColor: theme.disabled },
  primaryText: { color: theme.onPrimary, fontWeight: '600', fontSize: 16 },
  secondary: { minHeight: theme.minTouch, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: theme.primary, fontWeight: '600', fontSize: 15 },
});
