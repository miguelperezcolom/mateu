import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Appbar, Button, Icon, Surface } from 'react-native-paper';
import { Text } from '../../ui/Text';
import { theme, themed } from '../../theme';

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
  const box = { width: size, height: size, borderRadius: size / 2 };
  if (icon && !failed) {
    return (
      // expo-image keeps it on disk: the list does not download every icon again on each launch
      <Image
        source={{ uri: icon }}
        style={[box, styles.iconImage]}
        cachePolicy="memory-disk"
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

/** Material 3 filled button: the one main action of a screen. */
export function PrimaryButton({ label, onPress, disabled, style, hint, icon }: { label: string; onPress: () => void; disabled?: boolean; style?: StyleProp<ViewStyle>; hint?: string; icon?: string }) {
  return (
    <Button
      mode="contained"
      icon={icon}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: !!disabled }}
      style={[styles.button, style]}
      contentStyle={styles.buttonContent}
      labelStyle={styles.buttonLabel}
    >
      {label}
    </Button>
  );
}

/** Material 3 text button: the alternatives next to the main action. */
export function SecondaryButton({ label, onPress, style, danger, a11yLabel, icon }: { label: string; onPress: () => void; style?: StyleProp<ViewStyle>; danger?: boolean; a11yLabel?: string; icon?: string }) {
  return (
    <Button
      mode="text"
      icon={icon}
      onPress={onPress}
      accessibilityLabel={a11yLabel ?? label}
      textColor={danger ? theme.danger : undefined}
      style={[styles.button, style]}
      contentStyle={styles.buttonContent}
      labelStyle={styles.buttonLabel}
    >
      {label}
    </Button>
  );
}

/**
 * The Material top app bar of every hub screen: a navigation icon (back arrow or close) on the
 * left, the title, and icon actions on the right. The safe area is already applied by App.tsx.
 */
export function HubBar({
  title,
  onNavigate,
  navigateLabel = 'Back',
  navigateIcon = 'arrow-left',
  children,
}: {
  title: string;
  onNavigate?: () => void;
  navigateLabel?: string;
  navigateIcon?: string;
  children?: React.ReactNode;
}) {
  return (
    <Appbar.Header statusBarHeight={0} elevated style={hubStyles.bar}>
      {onNavigate && <Appbar.Action icon={navigateIcon} onPress={onNavigate} accessibilityLabel={navigateLabel} />}
      <Appbar.Content title={title} titleStyle={hubStyles.barTitle} />
      {children}
    </Appbar.Header>
  );
}

/** A tonal notice (info or warning) with its icon, like a Material banner without actions. */
export function Notice({ text, tone = 'info', alert }: { text: string; tone?: 'info' | 'warning'; alert?: boolean }) {
  const warning = tone === 'warning';
  return (
    <View style={[styles.notice, { backgroundColor: warning ? theme.warningBg : theme.infoBg }]} accessibilityRole={alert ? 'alert' : undefined}>
      <Icon source={warning ? 'alert-outline' : 'information-outline'} size={20} color={warning ? theme.warning : theme.info} />
      <Text style={[styles.noticeText, { color: warning ? theme.warning : theme.info }]}>{text}</Text>
    </View>
  );
}

/** A Material card surface. */
export function HubCard({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Surface elevation={1} style={[hubStyles.card, style]}>
      {children}
    </Surface>
  );
}

export const hubStyles = themed(() => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.surface },
  bar: { backgroundColor: theme.surface },
  barTitle: { fontSize: 22, fontWeight: '400', color: theme.ink },
  body: { padding: theme.spacing.md, gap: theme.spacing.md },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg, gap: theme.spacing.sm },
  title: { fontSize: 18, fontWeight: '700', color: theme.ink, textAlign: 'center' },
  text: { fontSize: 15, color: theme.muted, textAlign: 'center', maxWidth: 340 },
  label: { fontSize: 14, fontWeight: '600', color: theme.ink },
  error: { color: theme.danger, fontSize: 14 },
  card: { backgroundColor: theme.surface, borderRadius: 12, padding: theme.spacing.md, gap: theme.spacing.sm },
}));

const styles = themed(() => StyleSheet.create({
  iconImage: { backgroundColor: theme.divider },
  initials: { alignItems: 'center', justifyContent: 'center' },
  initialsText: { color: theme.onFill, fontWeight: '700' },
  button: { borderRadius: 20 },
  buttonContent: { minHeight: theme.minTouch, paddingHorizontal: 8 },
  buttonLabel: { fontSize: 15, letterSpacing: 0.1 },
  notice: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderRadius: 12, padding: 12 },
  noticeText: { flex: 1, fontSize: 14 },
}));
