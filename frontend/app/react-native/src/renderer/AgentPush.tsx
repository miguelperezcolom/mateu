import React from 'react';
import { ActivityIndicator, AppState, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme';
import { announceLive, buttonA11y, headingA11y, modalA11y } from '../a11y/a11y';
import { useAppContext } from '../context/AppContext';
import { AGENT_CHANNEL_ACTION, AGENT_RENDERER, AgentChannel, agentActionRequest, type AgentAppMeta } from '../core/agentPush';
import { AgentPairingModel, connectAiEntry, type PairingButton } from '../core/agentPairing';
import { applyUiEvent } from '../core/uiEvents';
import { isDev } from '../api/MateuApiClient';

/** What live UI push reads off the app metadata (`AppDto.agentPush`). */
export interface AgentPushMeta extends AgentAppMeta {
  agentPush?: boolean;
  /** Where the app opens: the route the session registers with before a screen is on show. */
  homeRoute?: string;
}

/**
 * The live-push channel (`_agent-channel` on the SSE endpoint), open WHILE THE APP IS IN THE
 * FOREGROUND and only when the app says push is on. Each pushed message goes through THE function
 * the assistant chat's events go through (core/uiEvents.ts); a status repaints "Connect AI" and a
 * change is announced. Streams through `expo/fetch` (registered in AppContext — React Native's own
 * fetch buffers the whole body); reopened at once when the server ends it, backed off on errors,
 * closed in the background (the server forgets a session 120 s after its stream ended, so a short
 * trip to another app keeps the pairing).
 */
export function useAgentChannel(meta: AgentPushMeta) {
  const { session } = useAppContext();
  React.useEffect(() => {
    if (!meta.agentPush) return;
    const channel = new AgentChannel({
      state: session.agent,
      request: () =>
        agentActionRequest(meta, AGENT_CHANNEL_ACTION, session.agent.session, session.appState, {
          route: session.currentScreen()?.route ?? meta.homeRoute ?? meta.rootRoute ?? '',
          renderer: AGENT_RENDERER,
        }),
      open: (request, onIncrement, signal) => session.api.runActionStream(request, onIncrement, signal),
      onEvent: (event) => {
        const outcome = applyUiEvent(session, event);
        // development builds say what each pushed message did (what rn-agent-push-probe.mjs reads)
        if (isDev()) console.log(`[Mateu] agent push: ${event.event} → ${outcome}`);
        if (event.event === 'render-screen') announceLive('Your AI agent sent a screen', false);
      },
      onAnnounce: (text) => announceLive(text, false),
      log: (m) => {
        if (isDev()) console.log('[Mateu]', m);
      },
    });
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') channel.start();
      else channel.stop();
    });
    if (AppState.currentState === 'active' || AppState.currentState == null) channel.start();
    return () => {
      sub.remove();
      channel.dispose();
    };
    // the request reads the meta at each connect; these are what make it another channel
  }, [meta.agentPush, meta.serverSideType, meta.rootRoute, session]);
}

/** The agent status, repainted on every change the channel reports. */
function useAgentStatus() {
  const { session } = useAppContext();
  const [, setVersion] = React.useState(0);
  React.useEffect(() => session.agent.subscribe(() => setVersion((v) => v + 1)), [session]);
  return session.agent.status;
}

/**
 * "Connect AI" in the drawer (where the app-level widgets live: notifications, search, context) —
 * or, for a shell with no drawer, as a floating button (`asFab`). Shown only when push is on.
 * Tapping it opens the pairing modal.
 */
export function ConnectAiEntry({ meta, asFab = false }: { meta: AgentPushMeta; asFab?: boolean }) {
  const status = useAgentStatus();
  const [open, setOpen] = React.useState(false);
  if (!meta.agentPush) return null;
  const entry = connectAiEntry(status);
  return (
    <>
      {asFab ? (
        <TouchableOpacity {...buttonA11y({ label: entry.label })} style={[styles.fab, entry.connected && styles.fabConnected]} onPress={() => setOpen(true)}>
          <Text style={styles.fabText}>{entry.connected ? '🔗' : 'AI'}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity {...buttonA11y({ label: entry.label })} style={styles.row} onPress={() => setOpen(true)}>
          <View style={[styles.dot, entry.connected && styles.dotConnected]} importantForAccessibility="no" />
          <Text style={[styles.rowText, entry.connected && styles.rowTextConnected]} numberOfLines={1}>{entry.text}</Text>
        </TouchableOpacity>
      )}
      {open && <ConnectAiModal meta={meta} onClose={() => setOpen(false)} />}
    </>
  );
}

/**
 * The pairing modal: "Get a pairing code" → `_agent-pair` → the one-time code, large, with its
 * countdown and "Ask your agent to pair with this code (mateu_pair_session)"; once the channel says
 * paired, the agents' labels and Disconnect (`_agent-unpair`). Everything it says changes is
 * announced; the code is read one character at a time.
 */
export function ConnectAiModal({ meta, onClose }: { meta: AgentPushMeta; onClose: () => void }) {
  const { session } = useAppContext();
  const model = React.useMemo(
    () =>
      new AgentPairingModel({
        state: session.agent,
        run: (actionId) => session.api.runAction(agentActionRequest(meta, actionId, session.agent.session, session.appState)),
      }),
    [session, meta.serverSideType, meta.rootRoute],
  );
  const [, setVersion] = React.useState(0);
  React.useEffect(() => {
    const detach = model.attach();
    const off = model.subscribe(() => setVersion((v) => v + 1));
    return () => {
      off();
      detach();
    };
  }, [model]);

  // the countdown: one tick a second while a code is shown
  const showingCode = model.phase.name === 'code';
  React.useEffect(() => {
    if (!showingCode) return;
    const timer = setInterval(() => {
      const said = model.tick();
      if (said) announceLive(said, false);
    }, 1000);
    return () => clearInterval(timer);
  }, [model, showingCode]);

  const close = () => {
    model.reset();
    onClose();
  };

  const press = (button: PairingButton) => {
    switch (button.id) {
      case 'pair':
      case 'newCode':
        void model.pair().then((said) => said && announceLive(said, false));
        break;
      case 'unpair':
        void model.unpair().then((said) => said && announceLive(said, false));
        break;
      case 'close':
        close();
        break;
    }
  };

  const view = model.view();
  return (
    <Modal {...modalA11y(view.title)} accessibilityViewIsModal visible transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <Text {...headingA11y(2)} style={styles.title}>{view.title}</Text>
          {!!view.intro && <Text style={styles.text}>{view.intro}</Text>}
          {view.connected && (
            <View style={styles.agents} accessible accessibilityLabel={`Connected to ${view.agentsText}`}>
              <Text style={styles.label}>Connected to</Text>
              {view.agents.map((a, i) => (
                <Text key={i} style={styles.agent}>• {a}</Text>
              ))}
            </View>
          )}
          {!!view.code && (
            <View style={styles.codeBox}>
              <Text style={styles.code} accessible accessibilityLabel={view.codeLabel} selectable>{view.code}</Text>
              <Text style={styles.countdown} accessible accessibilityLabel={view.countdownLabel}>Expires in {view.countdown}</Text>
              <Text style={styles.text}>{view.instruction}</Text>
            </View>
          )}
          {!!view.busy && (
            <View style={styles.busy} accessibilityLiveRegion="polite">
              <ActivityIndicator color={theme.primary} />
              <Text style={styles.muted}>{view.busy}</Text>
            </View>
          )}
          {!!view.message && (
            <Text style={styles.message} accessibilityRole="alert" accessibilityLiveRegion="polite">{view.message}</Text>
          )}
          <View style={styles.buttons}>
            {view.buttons.map((b) => (
              <TouchableOpacity
                key={b.id}
                {...buttonA11y({ label: b.label, disabled: b.disabled })}
                disabled={b.disabled}
                style={b.primary ? styles.primary : styles.secondary}
                onPress={() => press(b)}
              >
                <Text style={b.primary ? styles.primaryText : styles.secondaryText}>{b.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 10, minHeight: theme.minTouch },
  dot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: theme.muted },
  dotConnected: { backgroundColor: theme.success, borderColor: theme.success },
  rowText: { color: theme.ink, fontSize: 14, fontWeight: '600', flexShrink: 1 },
  rowTextConnected: { color: theme.success },
  fab: { minWidth: 52, height: 52, borderRadius: 26, backgroundColor: theme.ink, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, elevation: 6, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  fabConnected: { backgroundColor: theme.success },
  fabText: { color: theme.white, fontWeight: '700', fontSize: 15 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  dialog: { backgroundColor: theme.white, borderRadius: theme.radiusMd, padding: 20, gap: 12 },
  title: { fontSize: 18, fontWeight: '700', color: theme.ink },
  text: { fontSize: 15, color: theme.ink },
  muted: { fontSize: 14, color: theme.muted },
  label: { fontSize: 13, color: theme.muted, fontWeight: '600' },
  agents: { gap: 2 },
  agent: { fontSize: 15, color: theme.ink, fontWeight: '600' },
  codeBox: { alignItems: 'center', gap: 6, paddingVertical: 8 },
  code: { fontSize: 32, fontWeight: '800', letterSpacing: 4, color: theme.ink, fontFamily: theme.fontFamily },
  countdown: { fontSize: 14, color: theme.muted },
  busy: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  message: { fontSize: 14, color: theme.danger },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' },
  primary: { backgroundColor: theme.primary, borderRadius: theme.radiusSm, minHeight: theme.minTouch, paddingHorizontal: 16, justifyContent: 'center' },
  primaryText: { color: theme.onPrimary, fontWeight: '700' },
  secondary: { borderWidth: 1, borderColor: theme.border, borderRadius: theme.radiusSm, minHeight: theme.minTouch, paddingHorizontal: 16, justifyContent: 'center' },
  secondaryText: { color: theme.ink, fontWeight: '600' },
});
