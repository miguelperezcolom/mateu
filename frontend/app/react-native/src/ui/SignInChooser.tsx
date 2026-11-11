import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Icon } from 'react-native-paper';
import { Text } from './Text';
import { announce, buttonA11y, headingA11y } from '../a11y/a11y';
import { theme, themed } from '../theme';
import type { OidcConfig } from '../core/oidcConfig';
import { providerGlyph, providerName, signInTexts, type SignInTexts } from '../core/signInProviders';

/** The neutral mark of a provider button: its initial in a circle, or a key — never brand artwork. */
function ProviderMark({ provider, color }: { provider: OidcConfig; color: string }) {
  const glyph = providerGlyph(provider);
  if (glyph.kind === 'key') return <Icon source="key-variant" size={20} color={color} />;
  return (
    <View style={[styles.mark, { borderColor: color }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Text style={[styles.markText, { color }]}>{glyph.text}</Text>
    </View>
  );
}

/**
 * The sign-in screen's actions, Material 3: one provider → a single "Sign in" button (the text above
 * says where); several → one "Continue with …" button each, the one used last first and marked so.
 * The texts follow the device language (en/es). `busy` disables them while a browser is open: a second
 * tap must not open a second one.
 */
export function SignInChooser({
  uiName,
  providers,
  lastUsed,
  onChoose,
  busy,
  error,
  lang,
}: {
  uiName: string;
  providers: OidcConfig[];
  lastUsed?: string;
  onChoose: (provider: OidcConfig) => void;
  busy?: boolean;
  error?: string;
  lang: 'en' | 'es';
}) {
  const t: SignInTexts = signInTexts(lang);
  const several = providers.length > 1;
  useEffect(() => {
    announce(signInTexts(lang).title(uiName));
  }, [lang, uiName]);
  return (
    <View style={styles.box}>
      <Text style={styles.title} {...headingA11y(2)}>{t.title(uiName)}</Text>
      <Text style={styles.text}>
        {several ? t.intro : t.single(providers[0] ? providerName(providers[0]) : uiName)} {t.noPassword}
      </Text>
      {providers.map((p, i) => {
        const label = several ? t.continueWith(providerName(p)) : t.signIn;
        const primary = i === 0;
        const ink = primary ? theme.onPrimary : theme.primary;
        const last = several && p.id === lastUsed;
        return (
          <View key={p.id ?? i} style={styles.row}>
            <Button
              mode={primary ? 'contained' : 'outlined'}
              icon={({ color }) => <ProviderMark provider={p} color={color ?? ink} />}
              onPress={() => onChoose(p)}
              disabled={busy}
              {...buttonA11y({ label: last ? `${label}, ${t.lastUsed}` : label, disabled: !!busy })}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              testID={`sign-in-${p.id ?? i}`}
            >
              {label}
            </Button>
            {last && <Text style={styles.lastUsed}>{t.lastUsed}</Text>}
          </View>
        );
      })}
      {!!error && (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  box: { alignSelf: 'stretch', alignItems: 'center', gap: theme.spacing.sm },
  title: { fontSize: 16, fontWeight: '700', color: theme.ink, textAlign: 'center' },
  text: { fontSize: 16, color: theme.muted, textAlign: 'center', maxWidth: 340, marginBottom: theme.spacing.xs },
  row: { alignSelf: 'stretch', alignItems: 'center' },
  button: { borderRadius: 20, alignSelf: 'stretch', maxWidth: 340, width: '100%' },
  buttonContent: { minHeight: theme.minTouch, paddingHorizontal: 8 },
  buttonLabel: { fontSize: 16, letterSpacing: 0.1 },
  lastUsed: { fontSize: 12, color: theme.muted, marginTop: 2 },
  error: { color: theme.danger, fontSize: 14, textAlign: 'center' },
  mark: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  markText: { fontSize: 11, fontWeight: '700' },
}));
