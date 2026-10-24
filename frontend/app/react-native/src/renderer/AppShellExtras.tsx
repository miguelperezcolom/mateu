import React from 'react';
import { AppState, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from '../ui/Text';
import { fetch as streamingFetch } from 'expo/fetch';
import { theme, themed } from '../theme';
import { announce, announceLive, buttonA11y, headingA11y, modalA11y } from '../a11y/a11y';
import { useAppContext } from '../context/AppContext';
import { openExternal } from './openExternal';
import { RENDERER_HEADER, rendererHeaderValue } from '../core/buildSkew';
import {
  headerChangesOf, idlePhase, launchableShortcuts, parseSseChunk, quickLaunchMatch, reconnectDelay,
  signOutTarget, type AppShortcut, type HeaderValue, type IdleSession,
} from '../core/appShellExtras';

/** What the E2 shell extras read off the app metadata. */
export interface ShellExtrasMeta {
  serverSideType?: string;
  rootRoute?: string;
  homeRoute?: string;
  shortcuts?: AppShortcut[];
  headerValues?: HeaderValue[];
  liveUpdates?: boolean;
  idleSession?: IdleSession | null;
}

// ---- live header values ------------------------------------------------------------------------

/** The header values at the top of the drawer ("Business date  12 Oct 2026"), repainted from the
 *  app-wide store whenever an `UpdateHeaderValue` command or the event stream changes one. */
export function HeaderValuesView() {
  const { session } = useAppContext();
  const [, setVersion] = React.useState(0);
  React.useEffect(() => session.headerValues.subscribe(() => setVersion((v) => v + 1)), [session]);
  const values = session.headerValues.list();
  if (values.length === 0) return null;
  return (
    <View style={styles.values}>
      {values.map((v) => (
        <View key={v.id} style={styles.valueRow} accessible accessibilityLabel={`${v.label ? v.label + ': ' : ''}${v.value ?? ''}`}>
          {!!v.label && <Text style={styles.valueLabel}>{v.label}</Text>}
          <Text style={styles.valueText}>{v.value}</Text>
        </View>
      ))}
    </View>
  );
}

/**
 * `@App(liveUpdates)`: keeps the app event stream open WHILE THE APP IS IN THE FOREGROUND — the
 * existing SSE endpoint running the app-level `_live-updates` action — and applies each
 * `UpdateHeaderValue` it carries. Streaming needs `expo/fetch` (React Native's own fetch buffers the
 * whole body). Closed in the background, reconnected (with a back-off on errors) when the app comes
 * back; the server ends the stream every few minutes on purpose and it is simply reopened. No
 * polling.
 */
export function useLiveUpdates(meta: ShellExtrasMeta) {
  const { session } = useAppContext();
  React.useEffect(() => {
    if (!meta.liveUpdates) return;
    let controller: AbortController | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let failures = 0;
    let stopped = false;

    const connect = async () => {
      if (stopped || controller) return;
      const own = new AbortController();
      controller = own;
      const route = (meta.rootRoute ?? '').replace(/^\/+/, '') || '_no_route';
      try {
        const response = await streamingFetch(`${session.api.baseUrl}/mateu/v3/sse/${route}`, {
          method: 'POST',
          signal: own.signal,
          headers: { ...(await session.api.headers({ Accept: 'text/event-stream' })), [RENDERER_HEADER]: rendererHeaderValue() },
          body: JSON.stringify({
            serverSideType: meta.serverSideType ?? null, appState: session.appState, componentState: {}, parameters: {},
            initiatorComponentId: 'mateu-live-updates', consumedRoute: '', route: '/' + route, actionId: '_live-updates',
          }),
        });
        if (!response.ok || !response.body) throw new Error(`live updates: HTTP ${response.status}`);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        failures = 0;
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const { increments, rest } = parseSseChunk(buffer);
          buffer = rest;
          for (const increment of increments) {
            for (const change of headerChangesOf(increment)) {
              const said = session.headerValues.update(change.id, change.value);
              if (said) announceLive(said, false);
            }
          }
        }
      } catch {
        if (own.signal.aborted) return;
        failures++;
      } finally {
        if (controller === own) {
          controller = null;
          if (!stopped) timer = setTimeout(() => void connect(), reconnectDelay(failures));
        }
      }
    };

    const stop = () => {
      clearTimeout(timer);
      timer = undefined;
      controller?.abort();
      controller = null;
    };

    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') void connect();
      else stop();
    });
    if (AppState.currentState === 'active' || AppState.currentState == null) void connect();
    return () => {
      stopped = true;
      sub.remove();
      stop();
    };
  }, [meta.liveUpdates, meta.serverSideType, meta.rootRoute, session]);
}

// ---- quick launch ------------------------------------------------------------------------------

/**
 * QUICK LAUNCH in the drawer: a phone has no keyboard accelerators for the app shortcuts' keys, but
 * their codes work — type "MRG", submit, and it goes there (route) or runs it (app-level action).
 * The shortcuts with a code are listed underneath, each tappable.
 */
export function QuickLaunch({ meta, onLaunch }: { meta: ShellExtrasMeta; onLaunch: (shortcut: AppShortcut) => void }) {
  const [code, setCode] = React.useState('');
  const shortcuts = launchableShortcuts(meta.shortcuts);
  if (shortcuts.length === 0) return null;
  const submit = () => {
    const hit = quickLaunchMatch(meta.shortcuts, code);
    if (!hit) {
      announce(`No shortcut with code ${code.trim()}`);
      return;
    }
    setCode('');
    onLaunch(hit);
  };
  return (
    <View style={styles.quick}>
      <TextInput
        accessibilityLabel="Quick launch code"
        placeholder="Code"
        placeholderTextColor={theme.faint}
        autoCapitalize="characters"
        autoCorrect={false}
        returnKeyType="go"
        style={styles.quickInput}
        value={code}
        onChangeText={setCode}
        onSubmitEditing={submit}
      />
      {shortcuts.map((s, i) => (
        <TouchableOpacity key={i} {...buttonA11y({ label: `${s.label}, code ${s.code}` })} style={styles.quickRow} onPress={() => onLaunch(s)}>
          <Text style={styles.quickLabel}>{s.label}</Text>
          <Text style={styles.quickCode}>{s.code}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ---- idle session ------------------------------------------------------------------------------

/**
 * `@App(idleTimeoutMinutes)`: any touch on the app counts as activity (captured at the root, so no
 * control has to cooperate); time in the background counts as idle. Past `timeout - warning` a
 * modal counts down — "Stay signed in" runs the app-level keep-alive action, "Sign out" (or zero)
 * signs out: an absolute url opens outside the app, anything else resets the app to its root.
 * While the warning shows, only "Stay signed in" keeps the session (a stray touch does not).
 */
export function IdleSessionGuard({
  meta, runAppAction, onSignOut, children,
}: {
  meta: ShellExtrasMeta;
  runAppAction: (actionId: string) => void;
  onSignOut: () => void;
  children: React.ReactNode;
}) {
  const idle = meta.idleSession && meta.idleSession.timeoutSeconds > 0 ? meta.idleSession : null;
  const lastActivity = React.useRef(Date.now());
  const [phase, setPhase] = React.useState<'active' | 'warning'>('active');
  const [secondsLeft, setSecondsLeft] = React.useState(0);
  const phaseRef = React.useRef(phase);
  phaseRef.current = phase;

  const signOut = React.useCallback(() => {
    setPhase('active');
    lastActivity.current = Date.now();
    const target = signOutTarget(idle?.signOutUrl);
    if (target.kind === 'url') openExternal(target.url);
    else onSignOut();
  }, [idle?.signOutUrl, onSignOut]);

  React.useEffect(() => {
    if (!idle) return;
    lastActivity.current = Date.now();
    let warnedTen = false;
    const check = () => {
      const { phase: next, secondsLeft: left } = idlePhase(Date.now(), lastActivity.current, idle);
      if (next === 'expired') {
        signOut();
        return;
      }
      if (next === 'warning' && phaseRef.current !== 'warning') {
        warnedTen = false;
        announceLive(`Are you still there? You will be signed out in ${left} seconds.`, true);
      }
      if (next === 'warning' && left <= 10 && !warnedTen) {
        warnedTen = true;
        announceLive(`${left} seconds left`, true);
      }
      setPhase(next);
      setSecondsLeft(left);
    };
    const interval = setInterval(check, 1000);
    // back from the background: the time spent there was idle
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [idle, signOut]);

  const stay = () => {
    lastActivity.current = Date.now();
    setPhase('active');
    if (idle?.keepAliveActionId) runAppAction(idle.keepAliveActionId);
  };

  if (!idle) return <>{children}</>;
  return (
    <View
      style={styles.flex}
      // the responder system's CAPTURE phase sees every touch first; answering false never takes
      // the gesture away from the control underneath
      onStartShouldSetResponderCapture={() => {
        if (phaseRef.current === 'active') lastActivity.current = Date.now();
        return false;
      }}
    >
      {children}
      {phase === 'warning' && (
        <Modal {...modalA11y('Are you still there?')} accessibilityViewIsModal transparent animationType="fade" onRequestClose={stay}>
          <View style={styles.backdrop}>
            <View style={styles.dialog} accessibilityRole="alert">
              <Text {...headingA11y(2)} style={styles.dialogTitle}>Are you still there?</Text>
              <Text style={styles.dialogText}>For your security you will be signed out in {secondsLeft} seconds.</Text>
              <View style={styles.dialogButtons}>
                <TouchableOpacity {...buttonA11y({ label: 'Sign out' })} style={styles.secondary} onPress={signOut}>
                  <Text style={styles.secondaryText}>Sign out</Text>
                </TouchableOpacity>
                <TouchableOpacity {...buttonA11y({ label: 'Stay signed in' })} style={styles.primary} onPress={stay}>
                  <Text style={styles.primaryText}>Stay signed in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  flex: { flex: 1 },
  values: { paddingHorizontal: 20, paddingBottom: 8, gap: 2 },
  valueRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  valueLabel: { color: theme.muted, fontSize: 13 },
  valueText: { color: theme.ink, fontSize: 13, fontWeight: '700' },
  quick: { paddingBottom: 8 },
  quickInput: { marginHorizontal: 16, marginBottom: 4, backgroundColor: theme.scheme === 'dark' ? '#2A2C31' : '#ECEEF2', borderRadius: theme.radiusPill, paddingHorizontal: 18, minHeight: 44, color: theme.ink, fontSize: 15 },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, minHeight: theme.minTouch },
  quickLabel: { color: theme.ink, fontSize: 14 },
  quickCode: { color: theme.info, fontSize: 12, fontWeight: '700' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  dialog: { backgroundColor: theme.white, borderRadius: theme.radiusMd, padding: 20, gap: 12 },
  dialogTitle: { fontSize: 18, fontWeight: '700', color: theme.ink },
  dialogText: { fontSize: 15, color: theme.ink },
  dialogButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' },
  primary: { backgroundColor: theme.primary, borderRadius: theme.radiusSm, minHeight: theme.minTouch, paddingHorizontal: 16, justifyContent: 'center' },
  primaryText: { color: theme.onPrimary, fontWeight: '700' },
  secondary: { borderWidth: 1, borderColor: theme.border, borderRadius: theme.radiusSm, minHeight: theme.minTouch, paddingHorizontal: 16, justifyContent: 'center' },
  secondaryText: { color: theme.ink, fontWeight: '600' },
}));
