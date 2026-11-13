import Constants from 'expo-constants';
import * as ExpoCrypto from 'expo-crypto';
import * as Updates from 'expo-updates';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Platform, StyleSheet, View } from 'react-native';
import { TouchableOpacity } from './src/ui/Touchable';
import { Text } from './src/ui/Text';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MateuAppProvider } from './src/context/AppContext';
import {
  fetchRegistryEntry,
  installedRendererVersion,
  readRegistryConfig,
  RegistryEntry,
  updateRequired,
} from './src/core/AppRegistry';
import { onSignedOut, setTokenProvider, signOut } from './src/core/auth';
import { ANONYMOUS_OWNER, OfflineQueue, singleUiQueueId } from './src/core/offlineQueue';
import { useQueueOwner } from './src/context/useQueueOwner';
import type { MateuSession } from './src/core/MateuSession';
import { OIDC_TOKENS_KEY, OidcTokenProvider } from './src/core/oidc';
import { oidcConfigFromEnv, type OidcConfig } from './src/core/oidcConfig';
import { rememberProvider, signInPlanFrom, signInProvidersFrom, signInTexts, SIGN_IN_PROVIDER_KEY, type SignInPlan } from './src/core/signInProviders';
import { SignInChooser } from './src/ui/SignInChooser';
import { hubLang } from './src/hub/compat';
import { platformStore } from './src/core/secureStore';
import { installSessionId } from './src/core/sessionId';
import { installSecureRandom } from './src/core/secureRandom';
import { theme, themed } from './src/theme';
import { setRendererVersion } from './src/core/buildSkew';
import { SessionContent } from './src/shell/SessionContent';
import { fetchStaticBundle, type StaticBundle } from './src/core/staticBundle';
import { HubApp } from './src/hub/HubApp';
import { bootModeOf } from './src/core/buildVariant';
import { fetchManifest, manifestProviders } from './src/hub/manifest';
import { MateuThemeProvider } from './src/ui/MateuTheme';
import { StatusBar } from 'expo-status-bar';

// Hermes has no crypto.getRandomValues: expo-crypto's is the secure source (core/secureRandom.ts)
installSecureRandom(ExpoCrypto.getRandomValues);
// X-Mateu-Renderer: react-native/<app version> (core/buildSkew.ts)
setRendererVersion(Constants.expoConfig?.version);

// ─── Boot modes ──────────────────────────────────────────────────────────────
// HUB (default): the generic "Mateu" app — the user's own list of UIs, added by QR / address / deep
// link, each rendered in its own session (src/hub, design/mobile-app-hub.md).
// REGISTRY: a white-label installable whose app.json carries a registry URL + app id (below).
// DIRECT: a developer pointing the renderer at ONE backend — EXPO_PUBLIC_MATEU_BACKEND_PORT /
// EXPO_PUBLIC_MATEU_BACKEND_URL, or `?route=` on the web build (what the screenshot/a11y probes use).
const directMode = (): boolean =>
  !!process.env.EXPO_PUBLIC_MATEU_BACKEND_PORT ||
  !!process.env.EXPO_PUBLIC_MATEU_BACKEND_URL ||
  (Platform.OS === 'web' && typeof window !== 'undefined' && /[?&](route|direct)=/.test(window.location.search));

// ─── Backend resolution ──────────────────────────────────────────────────────
// PRODUCTION: the installable carries only a registry URL + app id (app.json `expo.extra`
// mateuRegistryUrl/mateuAppId, or EXPO_PUBLIC_MATEU_REGISTRY_URL/EXPO_PUBLIC_MATEU_APP_ID in
// dev) — the public registry maps the app id to the Mateu base URL, the launch parameters and
// the required renderer version (see src/core/AppRegistry.ts). No registry configured →
// DEV fallback: on a real device (Expo Go) "localhost" is the PHONE, so the backend host is
// derived from the Expo dev server the bundle was loaded from (hostUri).
// Overridable so a dev (or a probe) can point the app at a different backend without editing
// this file — e.g. EXPO_PUBLIC_MATEU_BACKEND_PORT=8080 for the e2e SUT.
const MATEU_BACKEND_PORT = Number(process.env.EXPO_PUBLIC_MATEU_BACKEND_PORT) || 8594;
// Boot directly at a specific route instead of the backend's home — a probe/test affordance
// (e.g. EXPO_PUBLIC_MATEU_ROUTE=/rest-data). Empty = the home route. On the web build a
// `?route=/rest-data` query parameter does the same without rebuilding the bundle, so one dev
// server can be pointed at any screen (deep link) — what the screenshot/a11y probes use.
const webRoute = (): string => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return '';
  try {
    return new URLSearchParams(window.location.search).get('route') ?? '';
  } catch {
    return '';
  }
};
const MATEU_ROUTE = webRoute() || process.env.EXPO_PUBLIC_MATEU_ROUTE || '';
const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
interface BootConfig {
  baseUrl: string;
  appState: Record<string, unknown>;
  /** Sign-in providers of a secured backend (registry `auth` block — `providers` or the single keys —,
   *  the UI manifest's for a fixed build, or EXPO_PUBLIC_MATEU_OIDC_* in dev). Empty = no sign-in. */
  providers: OidcConfig[];
}

const devProviders = (env: Record<string, string | undefined>): OidcConfig[] => {
  const c = oidcConfigFromEnv(env);
  return c ? [{ ...c, id: 'default' }] : [];
};

const DEV_CONFIG: BootConfig = {
  baseUrl:
    process.env.EXPO_PUBLIC_MATEU_BACKEND_URL?.replace(/\/+$/, '') ||
    `http://${Platform.OS === 'web' || !devHost ? 'localhost' : devHost}:${MATEU_BACKEND_PORT}`,
  appState: { tenantId: '1111', profile: 'dev' },
  providers: devProviders({
    EXPO_PUBLIC_MATEU_OIDC_ISSUER: process.env.EXPO_PUBLIC_MATEU_OIDC_ISSUER,
    EXPO_PUBLIC_MATEU_OIDC_CLIENT_ID: process.env.EXPO_PUBLIC_MATEU_OIDC_CLIENT_ID,
    EXPO_PUBLIC_MATEU_OIDC_SCOPES: process.env.EXPO_PUBLIC_MATEU_OIDC_SCOPES,
    EXPO_PUBLIC_MATEU_OIDC_AUDIENCE: process.env.EXPO_PUBLIC_MATEU_OIDC_AUDIENCE,
    EXPO_PUBLIC_MATEU_OIDC_LOGIN_ON_START: process.env.EXPO_PUBLIC_MATEU_OIDC_LOGIN_ON_START,
  }),
};

function configFromEntry(entry: RegistryEntry): BootConfig {
  return {
    baseUrl: entry.baseUrl.replace(/\/+$/, ''),
    appState: { ...(entry.parameters ?? {}) },
    providers: signInProvidersFrom(entry.auth, 'mobile'),
  };
}
// ─────────────────────────────────────────────────────────────────────────────

/** Blocking screen shown when the registry demands a newer renderer. "Update now" first tries
 *  an over-the-air update (expo-updates, real for EAS-built installables), then falls back to
 *  the platform store link from the registry entry. */
function UpdateRequiredScreen({ entry, onRecheck }: { entry: RegistryEntry; onRecheck: () => void }) {
  const [updating, setUpdating] = useState(false);
  const [otaUnavailable, setOtaUnavailable] = useState(false);
  const storeUrl = Platform.OS === 'ios' ? entry.storeUrl?.ios : entry.storeUrl?.android;

  const update = async () => {
    setUpdating(true);
    try {
      if (Updates.isEnabled) {
        const check = await Updates.checkForUpdateAsync();
        if (check.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync(); // relaunches on the new bundle — never returns
          return;
        }
      }
      setOtaUnavailable(true);
    } catch {
      setOtaUnavailable(true);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View style={styles.centered}>
      <Text style={styles.updateTitle}>Update required</Text>
      <Text style={styles.updateDetail}>
        This app needs renderer version {entry.requiredRendererVersion} — you have {installedRendererVersion()}.
      </Text>
      {updating ? (
        <ActivityIndicator size="large" color={theme.primary} style={styles.updateSpinner} />
      ) : (
        <TouchableOpacity style={styles.updateButton} onPress={update}>
          <Text style={styles.updateButtonText}>Update now</Text>
        </TouchableOpacity>
      )}
      {otaUnavailable && (
        <View style={styles.updateFallback}>
          <Text style={styles.updateDetail}>No over-the-air update is available.</Text>
          {storeUrl ? (
            <TouchableOpacity style={styles.updateButton} onPress={() => Linking.openURL(storeUrl)}>
              <Text style={styles.updateButtonText}>Open the store</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.updateDetail}>Please install the latest version from your app store.</Text>
          )}
        </View>
      )}
      <TouchableOpacity onPress={onRecheck} style={styles.updateRecheck}>
        <Text style={styles.updateRecheckText}>Check again</Text>
      </TouchableOpacity>
    </View>
  );
}

/** Boot gate: no registry configured → dev config straight away; otherwise resolve the registry
 *  entry (baseUrl + parameters), enforce the required renderer version, then boot as usual. */
function RegistryBoot() {
  const [regConfig] = useState(readRegistryConfig);
  const [phase, setPhase] = useState<'loading' | 'error' | 'update' | 'ready'>(regConfig ? 'loading' : 'ready');
  const [entry, setEntry] = useState<RegistryEntry | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!regConfig) return;
    setPhase('loading');
    try {
      const e = await fetchRegistryEntry(regConfig);
      setEntry(e);
      setPhase(updateRequired(e) ? 'update' : 'ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase('error');
    }
  }, [regConfig]);

  useEffect(() => {
    void load();
  }, [load]);

  if (phase === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Contacting app registry…</Text>
      </View>
    );
  }
  if (phase === 'error') {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Could not reach the app registry</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <TouchableOpacity style={styles.updateButton} onPress={() => void load()}>
          <Text style={styles.updateButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (phase === 'update' && entry) {
    return <UpdateRequiredScreen entry={entry} onRecheck={() => void load()} />;
  }

  return <AuthGate config={entry ? configFromEntry(entry) : DEV_CONFIG} />;
}

/** A FIXED build (src/core/buildVariant.ts): the UI baked in at build time. Its sign-in comes from
 *  the UI's own manifest, like a hub entry's; an unreachable manifest boots without one. */
function FixedBoot({ baseUrl, route }: { baseUrl: string; route: string }) {
  const [config, setConfig] = useState<BootConfig | null>(null);
  useEffect(() => {
    let alive = true;
    void fetchManifest(baseUrl).then((found) => {
      if (alive) setConfig({ baseUrl, appState: {}, providers: found.ok ? manifestProviders(found.manifest) : [] });
    });
    return () => {
      alive = false;
    };
  }, [baseUrl]);
  if (!config) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }
  return <AuthGate config={config} route={MATEU_ROUTE || route} />;
}

function Boot() {
  const mode = bootModeOf((Constants.expoConfig?.extra ?? {}) as Record<string, unknown>, directMode(), {
    registryUrl: process.env.EXPO_PUBLIC_MATEU_REGISTRY_URL,
    appId: process.env.EXPO_PUBLIC_MATEU_APP_ID,
  });
  switch (mode.kind) {
    case 'hub':
      return <HubApp />;
    case 'fixed':
      return <FixedBoot baseUrl={mode.baseUrl} route={mode.route} />;
    default:
      return <RegistryBoot />;
  }
}

/**
 * Identity gate: resolves the install's session id (random, persisted — never shared between
 * installs), registers the OIDC token provider when the backend is secured, and — unless the
 * config says to sign in lazily — asks the user to sign in before the first screen. After that
 * every Mateu request carries `Authorization: Bearer`; a 401 refreshes or re-prompts and retries.
 */
function AuthGate({ config, route = MATEU_ROUTE }: { config: BootConfig; route?: string }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [phase, setPhase] = useState<'checking' | 'signin' | 'ready'>('checking');
  const [signInError, setSignInError] = useState('');
  // The base URL may serve a STATIC BUNDLE (mateu-bundle:bundle / mateu-bundle:dev) rather than a
  // Mateu server: then the app runs from its manifest.json, with no /mateu/v3 calls at all.
  const [bundle, setBundle] = useState<StaticBundle | null>(null);
  // Which of the providers this install uses: the one its stored tokens name, the only one, or the
  // user's pick in the chooser (signInProviders.ts). Tokens live under ONE key, stamped with the
  // provider's issuer and client: a provider never reads what another minted.
  const [plan, setPlan] = useState<SignInPlan | null>(null);
  const [provider, setProvider] = useState<OidcTokenProvider | null>(null);
  const [busy, setBusy] = useState(false);
  const tokensKey = OIDC_TOKENS_KEY;
  const lazy = config.providers[0]?.loginOnStart === false;
  // the registry boot rebuilds its config on every render: what matters is the providers' content
  const providersKey = JSON.stringify(config.providers);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const found = await fetchStaticBundle(config.baseUrl);
      if (alive) setBundle(found.ok ? found.bundle : null);
      const id = await installSessionId(platformStore);
      const p = await signInPlanFrom(config.providers, platformStore, tokensKey, SIGN_IN_PROVIDER_KEY);
      // a lazy UI (loginOnStart false) with several providers and none chosen: the first one answers a 401
      const chosen = p.provider ?? (lazy ? config.providers[0] : undefined);
      const current = chosen ? new OidcTokenProvider(chosen, platformStore, tokensKey) : null;
      setTokenProvider(current ?? undefined);
      const needsSignIn = p.mode !== 'none' && !lazy && !(current && (await current.isSignedIn()));
      if (!alive) return;
      setPlan(p);
      setProvider(current);
      setSessionId(id);
      setPhase(needsSignIn ? 'signin' : 'ready');
    })();
    return () => {
      alive = false;
      setTokenProvider(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providersKey, config.baseUrl, tokensKey, lazy]);

  useEffect(
    () =>
      onSignedOut(() => {
        void signInPlanFrom(config.providers, platformStore, tokensKey, SIGN_IN_PROVIDER_KEY).then(setPlan);
        setPhase(config.providers.length ? 'signin' : 'ready');
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [providersKey, tokensKey],
  );

  const signIn = async (chosen: OidcConfig) => {
    if (busy) return;
    setSignInError('');
    setBusy(true);
    const target = provider && provider.config === chosen ? provider : new OidcTokenProvider(chosen, platformStore, tokensKey);
    try {
      if (await target.login()) {
        await rememberProvider(platformStore, SIGN_IN_PROVIDER_KEY, chosen);
        setProvider(target);
        setTokenProvider(target);
        setPhase('ready');
      } else setSignInError(signInTexts(hubLang()).cancelled);
    } catch (e) {
      setSignInError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (phase === 'checking' || !sessionId) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }
  if (phase === 'signin') {
    return (
      <View style={styles.centered}>
        <SignInChooser
          uiName={Constants.expoConfig?.name ?? 'Mateu'}
          providers={plan?.ordered ?? []}
          lastUsed={plan?.lastUsed}
          onChoose={(p) => void signIn(p)}
          busy={busy}
          error={signInError}
          lang={hubLang()}
        />
      </View>
    );
  }
  return <SignedInSession config={config} route={route} sessionId={sessionId} bundle={bundle} provider={provider} />;
}

/**
 * The UI of a fixed / registry / direct build once the gate let it through. Its session carries the
 * gate's provider EXPLICITLY (as a hub UI does), so it can own an offline send queue
 * (`@Action(offline = QUEUE)`): one per person who signs in, sent only as them, and a silent re-auth
 * of the queue never opens the browser (GA-5.5). The process-wide provider stays registered for the
 * rest of the app (sign-out, the idle warning).
 */
function SignedInSession({ config, route, sessionId, bundle, provider }: {
  config: BootConfig;
  route: string;
  sessionId: string;
  bundle: StaticBundle | null;
  provider: OidcTokenProvider | null;
}) {
  const ownerNow = useCallback(
    async (): Promise<string | null> => (provider ? ((await provider.owner().catch(() => null)) ?? null) : ANONYMOUS_OWNER),
    [provider],
  );
  // somebody else may sign in through a 401 (a shared phone): their own session and queue
  const { owner, generation } = useQueueOwner(true, provider, ownerNow);
  const outbox = useMemo(
    () => (owner ? new OfflineQueue(platformStore, singleUiQueueId(config.baseUrl), owner) : null),
    [config.baseUrl, owner],
  );
  const onSession = useCallback(
    (session: MateuSession) => {
      session.outboxOwner = ownerNow;
      // the shell's "Sign out" entry: the gate's provider is the process-wide one
      if (provider) session.signOut = signOut;
    },
    [ownerNow, provider],
  );
  if (owner === undefined) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }
  return (
    <MateuAppProvider
      key={generation}
      config={{ baseUrl: config.baseUrl, sessionId, appState: config.appState, bundle, auth: provider, outbox, onSession }}
    >
      <SessionContent initialRoute={route} />
    </MateuAppProvider>
  );
}

export default function App() {
  // Material Design 3 (React Native Paper), light/dark from the device or the app's toggle, the
  // accent from the app (src/ui/MateuTheme.tsx). A render FUNCTION, so a theme change re-renders
  // the whole tree against the new tokens.
  return (
    <SafeAreaProvider>
      <MateuThemeProvider>
        {() => (
          <SafeAreaView style={styles.safeArea}>
            <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
            <Boot />
          </SafeAreaView>
        )}
      </MateuThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = themed(() => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.surface },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: theme.muted },
  errorTitle: { fontSize: 18, fontWeight: '700', color: theme.ink, textAlign: 'center', marginBottom: 8 },
  errorDetail: { fontSize: 14, color: theme.muted, textAlign: 'center', marginBottom: 20, maxWidth: 320 },
  errorTechnical: { fontSize: 12, color: theme.faint, textAlign: 'center', marginTop: 16 },
  retryButton: { backgroundColor: theme.primary, paddingHorizontal: 24, minHeight: theme.minTouch, justifyContent: 'center', borderRadius: theme.radiusSm },
  retryText: { color: theme.onPrimary, fontWeight: '600', fontSize: 15 },
  toastHost: { position: 'absolute', top: 40, left: 16, right: 16, gap: 8 },
  toast: { borderRadius: 8, padding: 12, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  toast_info: { backgroundColor: theme.infoBg },
  toast_warning: { backgroundColor: theme.warningBg },
  toast_error: { backgroundColor: theme.dangerBg },
  toastTitle: { fontWeight: '700', fontSize: 13, color: theme.ink, marginBottom: 2 },
  toastText: { fontSize: 13, color: theme.ink },
  toastBody: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toastTextGrow: { flex: 1 },
  toastUndo: { borderWidth: 1, borderColor: theme.ink, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 3 },
  toastUndoText: { fontSize: 13, fontWeight: '600', color: theme.ink },
  overlayBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  overlaySheet: { backgroundColor: theme.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '85%', minHeight: '50%' },
  overlayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.divider },
  overlayTitle: { fontSize: 16, fontWeight: '600', color: theme.ink },
  overlayClose: { fontSize: 18, color: theme.muted, paddingHorizontal: 8 },
  updateTitle: { fontSize: 18, fontWeight: '700', color: theme.ink, marginBottom: 8 },
  updateDetail: { fontSize: 14, color: theme.muted, textAlign: 'center', marginBottom: 12 },
  updateSpinner: { marginVertical: 8 },
  updateButton: { backgroundColor: theme.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, marginTop: 4 },
  updateButtonText: { color: theme.onPrimary, fontWeight: '600', fontSize: 14 },
  updateFallback: { marginTop: 16, alignItems: 'center' },
  updateRecheck: { marginTop: 20, padding: 8 },
  signInError: { marginTop: 12 },
  updateRecheckText: { color: theme.primary, fontSize: 13, fontWeight: '600' },
}));
