import Constants from 'expo-constants';
import * as ExpoCrypto from 'expo-crypto';
import * as Updates from 'expo-updates';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
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
import { onSignedOut, setTokenProvider } from './src/core/auth';
import { OidcTokenProvider } from './src/core/oidc';
import { oidcConfigFrom, oidcConfigFromEnv, type OidcConfig } from './src/core/oidcConfig';
import { platformStore } from './src/core/secureStore';
import { installSessionId } from './src/core/sessionId';
import { installSecureRandom } from './src/core/secureRandom';
import { theme, themed } from './src/theme';
import { setRendererVersion } from './src/core/buildSkew';
import { SessionContent } from './src/shell/SessionContent';
import { fetchStaticBundle, type StaticBundle } from './src/core/staticBundle';
import { HubApp } from './src/hub/HubApp';
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
  /** Sign-in for a secured backend (registry `auth` block, or EXPO_PUBLIC_MATEU_OIDC_* in dev). */
  oidc: OidcConfig | null;
}

const DEV_CONFIG: BootConfig = {
  baseUrl:
    process.env.EXPO_PUBLIC_MATEU_BACKEND_URL?.replace(/\/+$/, '') ||
    `http://${Platform.OS === 'web' || !devHost ? 'localhost' : devHost}:${MATEU_BACKEND_PORT}`,
  appState: { tenantId: '1111', profile: 'dev' },
  oidc: oidcConfigFromEnv({
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
    oidc: oidcConfigFrom(entry.auth),
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

/**
 * Identity gate: resolves the install's session id (random, persisted — never shared between
 * installs), registers the OIDC token provider when the backend is secured, and — unless the
 * config says to sign in lazily — asks the user to sign in before the first screen. After that
 * every Mateu request carries `Authorization: Bearer`; a 401 refreshes or re-prompts and retries.
 */
function AuthGate({ config }: { config: BootConfig }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [phase, setPhase] = useState<'checking' | 'signin' | 'ready'>('checking');
  const [signInError, setSignInError] = useState('');
  // The base URL may serve a STATIC BUNDLE (mateu-bundle:bundle / mateu-bundle:dev) rather than a
  // Mateu server: then the app runs from its manifest.json, with no /mateu/v3 calls at all.
  const [bundle, setBundle] = useState<StaticBundle | null>(null);
  const provider = React.useMemo(() => (config.oidc ? new OidcTokenProvider(config.oidc, platformStore) : null), [config.oidc]);

  useEffect(() => {
    let alive = true;
    setTokenProvider(provider ?? undefined);
    void (async () => {
      const found = await fetchStaticBundle(config.baseUrl);
      if (alive) setBundle(found.ok ? found.bundle : null);
      const id = await installSessionId(platformStore);
      const needsSignIn = !!provider && config.oidc?.loginOnStart !== false && !(await provider.isSignedIn());
      if (!alive) return;
      setSessionId(id);
      setPhase(needsSignIn ? 'signin' : 'ready');
    })();
    const off = onSignedOut(() => setPhase(provider ? 'signin' : 'ready'));
    return () => {
      alive = false;
      off();
      setTokenProvider(undefined);
    };
  }, [provider, config.oidc, config.baseUrl]);

  const signIn = async () => {
    setSignInError('');
    try {
      if (await provider!.login()) setPhase('ready');
      else setSignInError('Sign-in was cancelled.');
    } catch (e) {
      setSignInError(e instanceof Error ? e.message : String(e));
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
        <Text style={styles.updateTitle} accessibilityRole="header">Sign in</Text>
        <Text style={styles.updateDetail}>This app needs you to sign in with your organisation account.</Text>
        <TouchableOpacity accessibilityRole="button" style={styles.updateButton} onPress={() => void signIn()}>
          <Text style={styles.updateButtonText}>Sign in</Text>
        </TouchableOpacity>
        {!!signInError && <Text style={[styles.errorDetail, styles.signInError]}>{signInError}</Text>}
      </View>
    );
  }
  return (
    <MateuAppProvider config={{ baseUrl: config.baseUrl, sessionId, appState: config.appState, bundle }}>
      <SessionContent initialRoute={MATEU_ROUTE} />
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
            {readRegistryConfig() || directMode() ? <RegistryBoot /> : <HubApp />}
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
