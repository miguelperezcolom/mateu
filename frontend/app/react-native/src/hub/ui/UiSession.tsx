import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { buttonA11y, headingA11y } from '../../a11y/a11y';
import { MateuAppProvider } from '../../context/AppContext';
import { OidcTokenProvider } from '../../core/oidc';
import type { MateuSession } from '../../core/MateuSession';
import { SessionContent } from '../../shell/SessionContent';
import { theme } from '../../theme';
import { domainOf } from '../links';
import { fetchManifest, versionGate, type UiManifest } from '../manifest';
import { allowInsecure, appVersion, secretStore, uiStore } from '../storage';
import { uiSecretKeys, type HubEntry } from '../uiStore';
import { uiSessionId } from '../uiSession';
import { PrimaryButton, SecondaryButton, UiIcon, hubStyles, inkOn } from './common';

// TODO(owner): the store listings, once they exist (App Store id is assigned by App Store Connect).
const STORE_URL = Platform.select({
  ios: 'https://apps.apple.com/app/idTODO_APP_STORE_ID',
  android: 'https://play.google.com/store/apps/details?id=io.mateu.app',
  default: 'https://mateu.io',
});

type Phase =
  | { name: 'manifest' }
  | { name: 'error'; reason: string }
  | { name: 'update'; reason: string }
  | { name: 'signin'; error?: string }
  | { name: 'ready' };

/**
 * One UI, running: refreshes its manifest (cached copy when offline), enforces the version gate,
 * signs in when the manifest asks for OIDC — with tokens under THIS UI's secure-store keys — and then
 * renders it with the ordinary renderer against its base URL. Each session is its own
 * MateuAppProvider (own MateuSession, API client, token provider, app state, navigation container),
 * and stays mounted while the user is elsewhere, so coming back finds it where it was left.
 */
export function UiSession({
  entry,
  route,
  visible,
  onHome,
  onSwitch,
}: {
  entry: HubEntry;
  route: string;
  visible: boolean;
  onHome: () => void;
  onSwitch: () => void;
}) {
  const [phase, setPhase] = useState<Phase>({ name: 'manifest' });
  const [manifest, setManifest] = useState<UiManifest | undefined>(entry.manifest);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const provider = useMemo(
    () => (manifest?.auth ? new OidcTokenProvider(manifest.auth, secretStore, uiSecretKeys(entry.id).tokens) : null),
    // the provider is per UI and per identity provider; a manifest change of issuer/client re-creates it
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entry.id, manifest?.auth?.issuer, manifest?.auth?.clientId],
  );

  useEffect(() => {
    let alive = true;
    void (async () => {
      setPhase({ name: 'manifest' });
      void uiStore.touch(entry.id);
      const fetched = await fetchManifest(entry.baseUrl, undefined, { allowInsecure });
      let m: UiManifest | undefined;
      if (fetched.ok) {
        m = fetched.manifest;
        if (!('missing' in fetched) || !entry.manifest) await uiStore.applyManifest(entry.id, m);
      } else if (entry.manifest) {
        m = entry.manifest; // offline: the cached copy keeps the list and the gate working
      } else {
        if (alive) setPhase({ name: 'error', reason: fetched.reason });
        return;
      }
      const id = await uiSessionId(secretStore, entry.id);
      if (!alive) return;
      setManifest(m);
      setSessionId(id);
      const gate = versionGate(m, appVersion());
      if (!gate.ok) return setPhase({ name: 'update', reason: gate.reason });
      setPhase(m.auth ? { name: 'signin' } : { name: 'ready' });
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id, entry.baseUrl, attempt]);

  // already signed in (or refreshable) → skip the sign-in screen
  useEffect(() => {
    if (phase.name !== 'signin' || phase.error || !provider) return;
    let alive = true;
    void provider.isSignedIn().then((yes) => {
      if (alive && yes) setPhase({ name: 'ready' });
    });
    return () => {
      alive = false;
    };
  }, [phase, provider]);

  const signIn = async () => {
    try {
      if (await provider!.login()) setPhase({ name: 'ready' });
      else setPhase({ name: 'signin', error: 'Sign-in was cancelled.' });
    } catch (e) {
      setPhase({ name: 'signin', error: e instanceof Error ? e.message : String(e) });
    }
  };

  const onSession = useCallback(
    (session: MateuSession) => {
      session.hub = { goHome: onHome, openSwitcher: onSwitch, uiName: entry.name };
      if (provider) {
        session.signOut = async () => {
          await provider.logout();
          setPhase({ name: 'signin' });
        };
      }
    },
    [onHome, onSwitch, entry.name, provider],
  );

  const name = manifest?.name ?? entry.name;
  const color = manifest?.themeColor ?? entry.themeColor;

  let body: React.ReactNode;
  if (phase.name === 'manifest' || (phase.name === 'ready' && !sessionId)) {
    body = (
      <View style={hubStyles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={hubStyles.text}>Opening {name}…</Text>
      </View>
    );
  } else if (phase.name === 'error') {
    body = (
      <View style={hubStyles.centered} accessibilityRole="alert">
        <Text style={hubStyles.title} {...headingA11y(2)}>Can't open {name}</Text>
        <Text style={hubStyles.text}>{phase.reason}</Text>
        <PrimaryButton label="Try again" onPress={() => setAttempt((a) => a + 1)} style={styles.wide} />
      </View>
    );
  } else if (phase.name === 'update') {
    body = (
      <View style={hubStyles.centered}>
        <Text style={hubStyles.title} {...headingA11y(2)}>Update the app</Text>
        <Text style={hubStyles.text}>{phase.reason}</Text>
        <PrimaryButton label="Update Mateu" onPress={() => void Linking.openURL(STORE_URL!)} style={styles.wide} />
        <SecondaryButton label="Check again" onPress={() => setAttempt((a) => a + 1)} />
      </View>
    );
  } else if (phase.name === 'signin') {
    body = (
      <View style={hubStyles.centered}>
        <UiIcon name={name} icon={manifest?.icon} color={color} size={64} />
        <Text style={hubStyles.title} {...headingA11y(2)}>Sign in to {name}</Text>
        <Text style={hubStyles.text}>
          You sign in with {manifest?.auth ? domainOf(manifest.auth.issuer) : 'your organisation'}. Mateu never sees your password.
        </Text>
        <PrimaryButton label="Sign in" onPress={() => void signIn()} style={styles.wide} />
        {!!phase.error && (
          <Text style={hubStyles.error} accessibilityLiveRegion="polite">
            {phase.error}
          </Text>
        )}
      </View>
    );
  } else {
    body = (
      <MateuAppProvider config={{ baseUrl: entry.baseUrl, sessionId: sessionId!, appState: {}, auth: provider, onSession }}>
        <SessionContent initialRoute={route} visible={visible} />
      </MateuAppProvider>
    );
  }

  return (
    <View style={[styles.session, !visible && styles.hidden]} accessibilityElementsHidden={!visible} importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}>
      <View style={[styles.bar, { backgroundColor: color ?? theme.ink }]}>
        <TouchableOpacity {...buttonA11y({ label: 'My UIs' })} onPress={onHome} style={styles.barButton} testID="hub-home">
          <Text style={[styles.barText, { color: inkOn(color ?? theme.ink) }]}>‹ My UIs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          {...buttonA11y({ label: `${name}. Switch UI`, hint: 'Shows your other UIs' })}
          onPress={onSwitch}
          onLongPress={onSwitch}
          style={styles.barTitle}
          testID="hub-switch"
        >
          <Text style={[styles.barName, { color: inkOn(color ?? theme.ink) }]} numberOfLines={1}>
            {name} ⇅
          </Text>
        </TouchableOpacity>
        <View style={styles.barButton} />
      </View>
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  session: { ...StyleSheet.absoluteFill, backgroundColor: '#FFFFFF' },
  hidden: { display: 'none' },
  bar: { flexDirection: 'row', alignItems: 'center', minHeight: theme.minTouch, paddingHorizontal: 4 },
  barButton: { minWidth: 88, minHeight: theme.minTouch, justifyContent: 'center', paddingHorizontal: 8 },
  barText: { fontSize: 15, fontWeight: '600' },
  barTitle: { flex: 1, minHeight: theme.minTouch, alignItems: 'center', justifyContent: 'center' },
  barName: { fontSize: 15, fontWeight: '700' },
  wide: { alignSelf: 'stretch', maxWidth: 340, marginTop: theme.spacing.sm },
});
