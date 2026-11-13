import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar } from 'react-native-paper';
import { Text } from '../../ui/Text';
import { headingA11y } from '../../a11y/a11y';
import { MateuAppProvider } from '../../context/AppContext';
import { OidcTokenProvider } from '../../core/oidc';
import type { OidcConfig } from '../../core/oidcConfig';
import { rememberProvider, signInPlanFrom, signInTexts, type SignInPlan } from '../../core/signInProviders';
import { SignInChooser } from '../../ui/SignInChooser';
import { BACK_HINT, type MateuSession, type ScreenBack } from '../../core/MateuSession';
import { SessionContent } from '../../shell/SessionContent';
import { type StaticBundle } from '../../core/staticBundle';
import { ScreenSnapshots } from '../../core/screenSnapshots';
import { timed } from '../../core/timing';
import { cachedStaticBundle } from '../bundleCache';
import { theme, themed } from '../../theme';
import { appSide } from '../appUpdate';
import { appCompatibility, compatMessage, HUB_TEXTS, hubLang } from '../compat';
import { fetchManifest, manifestProviders, type ManifestFetch, type UiManifest } from '../manifest';
import { allowInsecure, metaStore, secretStore, uiStore } from '../storage';
import { uiSecretKeys, type HubEntry } from '../uiStore';
import { hubBarSignsOut, uiSessionId, rotateUiSessionId } from '../uiSession';
import { Notice, PrimaryButton, SecondaryButton, UiIcon, hubStyles, inkOn } from './common';
import { UpdateAppButton } from './UpdateApp';
import { ANONYMOUS_OWNER, OfflineQueue } from '../../core/offlineQueue';
import { useQueueOwner } from '../../context/useQueueOwner';
import { serverActivity } from '../../core/serverActivity';
import { ServerActivityBar } from '../../shell/ServerActivityBar';

type Phase =
  | { name: 'manifest' }
  | { name: 'error'; reason: string }
  | { name: 'update'; reason: string; canUpdate: boolean }
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
  onLive,
}: {
  entry: HubEntry;
  route: string;
  visible: boolean;
  onHome: () => void;
  onSwitch: () => void;
  /** Tells the hub this UI's session, for what a link has to ask it. */
  onLive?: (id: string, session: MateuSession) => void;
}) {
  const [phase, setPhase] = useState<Phase>({ name: 'manifest' });
  // the UI's own top bar hosts the hub's actions (session.hub.claimBar): then the hub shows no bar of its own
  const [barClaimed, setBarClaimed] = useState(false);
  const [manifest, setManifest] = useState<UiManifest | undefined>(entry.manifest);
  const [sessionId, setSessionId] = useState<string | null>(null);
  /** A static UI (no server): the bundle it runs from. */
  const [bundle, setBundle] = useState<StaticBundle | null>(null);
  const [attempt, setAttempt] = useState(0);
  const gainedSignIn = useRef(false);
  // the way back of the screen on view, when the UI's shell keeps this bar (tabs, no menu)
  const [screenBack, setScreenBack] = useState<ScreenBack | null>(null);
  /** A UI ahead of this app (compat.ts `recommended`): it opens, with this note above it. */
  const [compatNotice, setCompatNotice] = useState<string | null>(null);

  /**
   * Can THIS app render that manifest's UI? Stops at the update screen when it cannot (true). From
   * the BACKGROUND refresh of a UI already on screen it never stops it: the user may be half-way
   * through a form — the screen stays, with the message above it, and the next open asks for the
   * update (the fresh manifest is the one kept).
   */
  const applyCompat = (m: UiManifest, background = false): boolean => {
    const app = appSide();
    const compat = appCompatibility(m, app);
    const message = compat.reason ? compatMessage(compat.reason, { ...m, name: m.name ?? entry.name }, app, hubLang()) : null;
    if (compat.status === 'required' && background) {
      setCompatNotice(message);
      return false;
    }
    if (compat.status === 'required') {
      setPhase({ name: 'update', reason: message!, canUpdate: compat.reason !== 'olderWire' });
      return true;
    }
    setCompatNotice(compat.status === 'recommended' ? message : null);
    return false;
  };

  // The UI's sign-in providers (manifest `auth.providers`): which one this session uses — the one
  // whose tokens are stored, the only one, or the user's pick in the chooser. One signed-in provider
  // per UI at a time; its tokens live under THIS UI's key, stamped with the provider's issuer and
  // client, so another provider never reads them (oidcConfig.ts tokensBelongTo).
  const keys = uiSecretKeys(entry.id);
  const [plan, setPlan] = useState<SignInPlan | null>(null);
  const [provider, setProvider] = useState<OidcTokenProvider | null>(null);
  const providerFor = (config: OidcConfig) => new OidcTokenProvider(config, secretStore, keys.tokens);
  const planSignIn = async (m: UiManifest): Promise<SignInPlan> => signInPlanFrom(manifestProviders(m), secretStore, keys.tokens, keys.signInProvider);

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
        // …and the fresh copy is checked too: a UI that moved to a Mateu this app cannot render
        // stops here, one that moved ahead of it gets the notice (compat.ts)
        void fetchFresh()
          .then(async (fresh) => {
            if (!fresh.ok) return;
            await manifestOf(fresh, entry);
            if (alive) applyCompat(fresh.manifest, true);
            // the UI started asking for a sign-in since it was added: the cached manifest did not say
            // so, and every request of this session would answer 401 until it was reopened
            if (alive && fresh.manifest.auth && !entry.manifest?.auth && !gainedSignIn.current) {
              gainedSignIn.current = true; // once: what is stored is what the next attempt reads
              setAttempt((a) => a + 1);
            }
          })
          .catch(() => undefined);
      } else {
        // the UI cannot open without it: the "waiting for the server" bar shows (core/serverActivity.ts);
        // the background refresh above does not count
        fetched = await serverActivity.track(fetchFresh);
      }
      const m = await manifestOf(fetched, entry);
      if (!m.ok) {
        if (alive) setPhase({ name: 'error', reason: m.reason });
        return;
      }
      const found = await serverActivity.track(() => staticBundleOf(fetched, m.manifest, entry.baseUrl));
      if (!found.ok) {
        if (alive) setPhase({ name: 'error', reason: found.reason });
        return;
      }
      const id = await uiSessionId(secretStore, entry.id);
      const signInPlan = await planSignIn(m.manifest);
      if (!alive) return;
      setPlan(signInPlan);
      setProvider(signInPlan.provider ? providerFor(signInPlan.provider) : null);
      setManifest(m.manifest);
      setBundle(found.bundle);
      setSessionId(id);
      if (applyCompat(m.manifest)) return;
      setPhase(signInPlan.mode !== 'none' ? { name: 'signin' } : { name: 'ready' });
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

  const signingIn = useRef(false);
  const [busy, setBusy] = useState(false);
  const signIn = async (config: OidcConfig) => {
    if (signingIn.current) return; // a second tap must not open a second browser
    signingIn.current = true;
    setBusy(true);
    const target = provider && provider.config === config ? provider : providerFor(config);
    try {
      if (await target.login()) {
        await rememberProvider(secretStore, keys.signInProvider, config);
        setProvider(target);
        setPhase({ name: 'ready' });
      } else setPhase({ name: 'signin', error: signInTexts(hubLang()).cancelled });
    } catch (e) {
      setPhase({ name: 'signin', error: e instanceof Error ? e.message : String(e) });
    } finally {
      signingIn.current = false;
      setBusy(false);
    }
  };

  const liveSession = useRef<MateuSession | null>(null);

  // Who owns the offline send queue of this session (outboxOwner.ts): the signed-in identity
  // (issuer + subject + tenant), the anonymous owner on a UI that does not sign in; null = a
  // sign-in whose tokens do not say who it is → nothing is queued. undefined while it is read.
  // Read again after every sign-in a 401 opens mid-session: somebody ELSE may sign in on a shared
  // phone, and then gets a new session with their own queue (GA-5.4, context/useQueueOwner.ts).
  const ownerNow = useCallback(
    async (): Promise<string | null> => (provider ? ((await provider.owner?.().catch(() => null)) ?? null) : ANONYMOUS_OWNER),
    [provider],
  );
  const { owner, generation, forget: forgetOwner } = useQueueOwner(phase.name === 'ready', provider, ownerNow, () =>
    OfflineQueue.changed(entry.id), // the hub's badge now counts this owner's queue
  );

  /** Signs out of the provider that signed in (its own end-session), then asks again. */
  const signOutHere = async () => {
    // the phone stops receiving this UI's pushes first (core/remotePush.ts)
    await liveSession.current?.pushUnregister?.().catch(() => undefined);
    // the queue of who signed out is SUSPENDED, not deleted: kept on the device, not sent, shown or
    // counted until the same person signs in again (offlineQueue.ts)
    forgetOwner();
    await provider?.logout();
    OfflineQueue.changed(entry.id);
    setSessionId(await rotateUiSessionId(secretStore, entry.id));
    if (manifest) setPlan(await planSignIn(manifest));
    setPhase({ name: 'signin' });
  };

  const onSession = useCallback(
    (session: MateuSession) => {
      session.hub = { goHome: onHome, openSwitcher: onSwitch, uiName: entry.name, claimBar: setBarClaimed, hostBack: (back) => setScreenBack(back) };
      liveSession.current = session;
      onLive?.(entry.id, session);
      if (provider) session.signOut = signOutHere;
      session.outboxOwner = ownerNow;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onHome, onSwitch, entry.name, provider, entry.id, onLive, manifest, ownerNow],
  );

  // the last screens, shown at once on the next open — never for a UI that signs in: what a
  // signed-in screen shows is not left on the device
  const snapshots = useMemo(
    () => (manifest?.auth ? null : new ScreenSnapshots(metaStore, entry.id)),
    [entry.id, manifest?.auth],
  );

  // the offline send queue (@Action(offline = QUEUE)): kept in the keychain / keystore — a queued
  // form may hold what a signed-in screen showed — and sent when the connection is back. ONE PER
  // OWNER: another person signing in to this UI gets their own (empty) queue and never sees, counts
  // or sends this one
  const outbox = useMemo(() => (owner ? new OfflineQueue(secretStore, entry.id, owner) : null), [entry.id, owner]);

  const name = manifest?.name ?? entry.name;
  const color = manifest?.themeColor ?? entry.themeColor;
  const ink = color ? inkOn(color) : theme.ink;

  let body: React.ReactNode;
  if (phase.name === 'manifest' || (phase.name === 'ready' && (!sessionId || owner === undefined))) {
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
        <Text style={hubStyles.title} {...headingA11y(2)}>{HUB_TEXTS[hubLang()].updateTheApp}</Text>
        <Text style={hubStyles.text} accessibilityRole="alert">{phase.reason}</Text>
        {phase.canUpdate && <UpdateAppButton style={styles.wide} />}
        <SecondaryButton label={HUB_TEXTS[hubLang()].checkAgain} onPress={() => setAttempt((a) => a + 1)} />
      </View>
    );
  } else if (phase.name === 'signin') {
    body = (
      <View style={hubStyles.centered}>
        <UiIcon name={name} icon={manifest?.icon} color={color} size={64} />
        <SignInChooser
          uiName={name}
          providers={plan?.ordered ?? []}
          lastUsed={plan?.lastUsed}
          onChoose={(p) => void signIn(p)}
          busy={busy}
          error={phase.error}
          lang={hubLang()}
        />
      </View>
    );
  } else {
    body = (
      <>
        {compatNotice && (
          <View style={styles.compat}>
            <Notice tone="info" text={compatNotice} />
            <View style={styles.compatActions}>
              <UpdateAppButton />
              <SecondaryButton label={HUB_TEXTS[hubLang()].notNow} onPress={() => setCompatNotice(null)} />
            </View>
          </View>
        )}
        <MateuAppProvider key={`${sessionId}#${generation}`} config={{ baseUrl: entry.baseUrl, sessionId: sessionId!, appState: {}, auth: provider, onSession, bundle, snapshots, outbox }}>
          <SessionContent initialRoute={route} visible={visible} />
        </MateuAppProvider>
      </>
    );
  }

  return (
    <View style={[styles.session, !visible && styles.hidden]} accessibilityElementsHidden={!visible} importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}>
      {/* the hub's bar — unless the UI's own top bar hosts its actions (an app shell with a menu) */}
      {!(barClaimed && phase.name === 'ready' && !!sessionId) && (
      <Appbar.Header statusBarHeight={0} style={{ backgroundColor: color ?? theme.surface }}>
        {/* with a record open, the bar's arrow goes back to the list it came from; else to My UIs */}
        {screenBack ? (
          <Appbar.BackAction onPress={screenBack.back} onLongPress={screenBack.toStart} accessibilityLabel="Back" accessibilityHint={BACK_HINT} color={ink} />
        ) : (
          <Appbar.BackAction onPress={onHome} accessibilityLabel="My UIs" color={ink} testID="hub-home" />
        )}
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
      {/* "waiting for the server", right under the hub's bar (a UI that claims the bar draws its own) */}
      {!(barClaimed && phase.name === 'ready' && !!sessionId) && <ServerActivityBar />}
      {body}
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  session: { ...StyleSheet.absoluteFill, backgroundColor: theme.background },
  hidden: { display: 'none' },
  barName: { fontSize: 22, fontWeight: '400' },
  wide: { alignSelf: 'stretch', maxWidth: 340, marginTop: theme.spacing.sm },
  compat: { padding: theme.spacing.sm, gap: theme.spacing.xs, backgroundColor: theme.surface },
  compatActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: theme.spacing.sm },
}));
