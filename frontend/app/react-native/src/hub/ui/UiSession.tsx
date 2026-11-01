import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar } from 'react-native-paper';
import { Text } from '../../ui/Text';
import { headingA11y } from '../../a11y/a11y';
import { MateuAppProvider } from '../../context/AppContext';
import { OidcTokenProvider } from '../../core/oidc';
import type { MateuSession } from '../../core/MateuSession';
import { SessionContent } from '../../shell/SessionContent';
import { type StaticBundle } from '../../core/staticBundle';
import { ScreenSnapshots } from '../../core/screenSnapshots';
import { timed } from '../../core/timing';
import { cachedStaticBundle } from '../bundleCache';
import { theme, themed } from '../../theme';
import { domainOf } from '../links';
import { fetchManifest, versionGate, type ManifestFetch, type UiManifest } from '../manifest';
import { allowInsecure, appVersion, metaStore, secretStore, uiStore } from '../storage';
import { uiSecretKeys, type HubEntry } from '../uiStore';
import { hubBarSignsOut, uiSessionId } from '../uiSession';
import { PrimaryButton, SecondaryButton, UiIcon, hubStyles, inkOn } from './common';

// TODO(owner): the store listings, once they exist (App Store id is assigned by App Store Connect).
const STORE_URL = Platform.select({
  ios: 'https://apps.apple.com/app/id6829227403',
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
type Found<T> = { ok: true } & T | { ok: false; reason: string };

/** The UI's manifest: the one just fetched (stored for the list), or offline the cached copy. */
async function manifestOf(fetched: ManifestFetch, entry: HubEntry): Promise<Found<{ manifest: UiManifest }>> {
  if (fetched.ok) {
    if (!('missing' in fetched) || !entry.manifest) await uiStore.applyManifest(entry.id, fetched.manifest);
    return { ok: true, manifest: fetched.manifest };
  }
  // offline: the cached copy keeps the list and the gate working
  return entry.manifest ? { ok: true, manifest: entry.manifest } : { ok: false, reason: fetched.reason };
}

/** A static UI runs from its bundle: fetched now (or already, while it was recognised); null for a served UI. */
async function staticBundleOf(
  fetched: ManifestFetch,
  manifest: UiManifest,
  baseUrl: string,
): Promise<Found<{ bundle: StaticBundle | null }>> {
  if (!manifest.bundle) return { ok: true, bundle: null };
  if (fetched.ok && 'bundle' in fetched && fetched.bundle) return { ok: true, bundle: fetched.bundle };
  // the device's copy at once (revalidated in the background), else downloaded and kept
  const found = await cachedStaticBundle(baseUrl, manifest.bundle);
  return found.ok ? { ok: true, bundle: found.bundle } : { ok: false, reason: found.reason };
}

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
  // the UI's own top bar hosts the hub's actions (session.hub.claimBar): then the hub shows no bar of its own
  const [barClaimed, setBarClaimed] = useState(false);
  const [manifest, setManifest] = useState<UiManifest | undefined>(entry.manifest);
  const [sessionId, setSessionId] = useState<string | null>(null);
  /** A static UI (no server): the bundle it runs from. */
  const [bundle, setBundle] = useState<StaticBundle | null>(null);
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
      const fetchFresh = () => timed('manifest', () => fetchManifest(entry.baseUrl, undefined, { allowInsecure }), () => 'network');
      // A UI opened before opens with the manifest it was left with, AT ONCE, and refreshes it in the
      // background (the list's name/icon, and the gate and sign-in settings for the next open): the
      // round trip — up to its 10 s timeout on a bad network — no longer stands before the screen.
      let fetched: ManifestFetch;
      if (entry.manifest) {
        fetched = { ok: false, reason: 'cached' };
        void fetchFresh().then((fresh) => (fresh.ok ? manifestOf(fresh, entry) : undefined)).catch(() => undefined);
      } else {
        fetched = await fetchFresh();
      }
      const m = await manifestOf(fetched, entry);
      if (!m.ok) {
        if (alive) setPhase({ name: 'error', reason: m.reason });
        return;
      }
      const found = await staticBundleOf(fetched, m.manifest, entry.baseUrl);
      if (!found.ok) {
        if (alive) setPhase({ name: 'error', reason: found.reason });
        return;
      }
      const id = await uiSessionId(secretStore, entry.id);
      if (!alive) return;
      setManifest(m.manifest);
      setBundle(found.bundle);
      setSessionId(id);
      const gate = versionGate(m.manifest, appVersion());
      if (!gate.ok) return setPhase({ name: 'update', reason: gate.reason });
      setPhase(m.manifest.auth ? { name: 'signin' } : { name: 'ready' });
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

  const signOutHere = async () => {
    await provider?.logout();
    setPhase({ name: 'signin' });
  };

  const onSession = useCallback(
    (session: MateuSession) => {
      session.hub = { goHome: onHome, openSwitcher: onSwitch, uiName: entry.name, claimBar: setBarClaimed };
      if (provider) {
        session.signOut = async () => {
          await provider.logout();
          setPhase({ name: 'signin' });
        };
      }
    },
    [onHome, onSwitch, entry.name, provider],
  );

  // the last screens, shown at once on the next open — never for a UI that signs in: what a
  // signed-in screen shows is not left on the device
  const snapshots = useMemo(
    () => (manifest?.auth ? null : new ScreenSnapshots(metaStore, entry.id)),
    [entry.id, manifest?.auth],
  );

  const name = manifest?.name ?? entry.name;
  const color = manifest?.themeColor ?? entry.themeColor;
  const ink = color ? inkOn(color) : theme.ink;

  let body: React.ReactNode;
  if (phase.name === 'manifest' || (phase.name === 'ready' && !sessionId)) {
    body = (
      <View style={hubStyles.centered}>
        <ActivityIndicator size="large" />
        <Text style={hubStyles.text}>Opening {name}…</Text>
      </View>
    );
  } else if (phase.name === 'error') {
    body = (
      <View style={hubStyles.centered} accessibilityRole="alert">
        <Text style={hubStyles.title} {...headingA11y(2)}>Can't open {name}</Text>
        <Text style={hubStyles.text}>{phase.reason}</Text>
        <PrimaryButton label="Try again" icon="refresh" onPress={() => setAttempt((a) => a + 1)} style={styles.wide} />
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
        <PrimaryButton label="Sign in" icon="login" onPress={() => void signIn()} style={styles.wide} />
        {!!phase.error && (
          <Text style={hubStyles.error} accessibilityLiveRegion="polite">
            {phase.error}
          </Text>
        )}
      </View>
    );
  } else {
    body = (
      <MateuAppProvider config={{ baseUrl: entry.baseUrl, sessionId: sessionId!, appState: {}, auth: provider, onSession, bundle, snapshots }}>
        <SessionContent initialRoute={route} visible={visible} />
      </MateuAppProvider>
    );
  }

  return (
    <View style={[styles.session, !visible && styles.hidden]} accessibilityElementsHidden={!visible} importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}>
      {/* the hub's bar — unless the UI's own top bar hosts its actions (an app shell with a menu) */}
      {!(barClaimed && phase.name === 'ready' && !!sessionId) && (
      <Appbar.Header statusBarHeight={0} style={{ backgroundColor: color ?? theme.surface }}>
        <Appbar.BackAction onPress={onHome} accessibilityLabel="My UIs" color={ink} testID="hub-home" />
        <Appbar.Content
          title={name}
          titleStyle={[styles.barName, { color: ink }]}
          onPress={onSwitch}
          accessibilityRole="button"
          accessibilityLabel={`${name}. Switch UI`}
          accessibilityHint="Shows your other UIs"
          testID="hub-switch"
        />
        <Appbar.Action icon="swap-horizontal" onPress={onSwitch} color={ink} accessibilityLabel="Switch UI" />
        {/* a UI whose shell has no drawer (bottom tabs, no menu) had no "Sign out" anywhere: the hub's
            bar offers it while signed in (a drawer shell claims the bar and has its own entry) */}
        {hubBarSignsOut(!!provider, phase.name) && (
          <Appbar.Action icon="logout" onPress={() => void signOutHere()} color={ink} accessibilityLabel="Sign out" testID="hub-sign-out" />
        )}
      </Appbar.Header>
      )}
      {body}
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  session: { ...StyleSheet.absoluteFill, backgroundColor: theme.background },
  hidden: { display: 'none' },
  barName: { fontSize: 22, fontWeight: '400' },
  wide: { alignSelf: 'stretch', maxWidth: 340, marginTop: theme.spacing.sm },
}));
