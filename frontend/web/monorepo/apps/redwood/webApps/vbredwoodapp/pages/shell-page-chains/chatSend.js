/* AI chat send. Reads the LIVE value of the DOM input (oj-input-text commits `value` on
 * change/blur, which lags behind an Enter), posts to the sseUrl and paints the agent's answer
 * in the last message as it arrives (agent-delta), replaced at the end by the whole, clean
 * answer. When done, it clears the input and gives the focus back.
 *
 * Meanwhile it says what is going on in the panel's status row (mateuChatStatus): what the agent
 * reports — «Conectando con 2 servidores MCP…», «Llamando a booking_findBookings… 3 s»,
 * «Respondiendo…» —, or, with an agent that does not report, «Pensando… N s» until the first text. And
 * it leaves in mateuChatTokens the usage the agent sends, which is already the whole conversation's
 * (it is replaced, not added up). */
define([
  'vb/action/actionChain',
  'resources/js/mateu-bridge',
], (ActionChain, bridge) => {
  'use strict';

  const inputEl = () => document.querySelector('#mateuChatInput input');
  const clearInput = ($application) => {
    $application.variables.mateuChatInput = '';
    const oj = document.querySelector('#mateuChatInput');
    if (oj) oj.value = '';
    const el = inputEl();
    if (el) el.value = '';
  };
  const focusInput = () => setTimeout(() => { const el = inputEl(); if (el) el.focus(); }, 30);

  class chatSend extends ActionChain {
    async run(context) {
      const { $application } = context;
      const vars = $application.variables;
      const el = inputEl();
      const text = ((el && el.value) || vars.mateuChatInput || '').trim();
      const attachments = vars.mateuChatAttachments || [];
      // a message with only attachments (no text) is sent too, as in the web chat
      if ((!text && !attachments.length) || vars.mateuChatBusy) return;

      // the tab's UI session id (the one live UI push registers too — poc/agentPush.mjs): an
      // agent the user talks to can address THIS tab with the same id
      if (!vars.mateuChatSessionId) {
        vars.mateuChatSessionId = bridge.uiSessionId();
      }
      const sessionId = vars.mateuChatSessionId;
      const registry = vars.mateuRegistry || {};
      // the menu only on the session's FIRST message: the agent keeps it per session
      const sendMenu = window.__mateuChatMenuSentFor !== sessionId;
      window.__mateuChatMenuSentFor = sessionId;
      // the turn in the web chat's shape (poc/chat.mjs chatTurnOf): text, session, route, attachments,
      // the screen context (url, title, appState, host state), the screen projected
      // for the agent, the mcpUrl and the menu
      const turn = bridge.chatTurnOf({
        message: text,
        sessionId,
        attachments,
        registry,
        appState: vars.mateuAppState || {},
        url: window.location.pathname + window.location.search + window.location.hash,
        screenTitle: document.title,
        // currentRoute: the screen the question is asked from — the control plane picks the
        // agent by it (on /mapping, the mapping one)
        currentRoute: vars.mateuSelectedRoute || undefined,
        mcpUrl: vars.mateuChatMcpUrl || undefined,
        menu: window.__mateuShellMenu || (registry.shell && registry.shell.menu) || [],
        sendMenu,
      });

      const msgs = (vars.mateuChatMessages || []).slice();
      msgs.push({ role: 'user', text: turn.shown });
      const agentIdx = msgs.push({ role: 'agent', text: '' }) - 1;
      vars.mateuChatMessages = msgs;
      vars.mateuChatAttachments = [];
      vars.mateuChatSteps = [];
      clearInput($application);
      vars.mateuChatBusy = true;

      const startedAt = Date.now();
      let hasText = false;
      let turnUsage = null;
      let progress = null;
      let accumulated = '';
      const showStatus = () => {
        vars.mateuChatStatus = bridge.chatStatusText({
          busy: true, hasText, elapsedSeconds: (Date.now() - startedAt) / 1000, progress, now: Date.now(),
        });
      };
      showStatus();
      const ticking = setInterval(showStatus, 1000);

      const setAgent = (value) => {
        const next = (vars.mateuChatMessages || []).slice();
        if (next[agentIdx]) next[agentIdx] = { role: 'agent', text: value };
        vars.mateuChatMessages = next;
        if (!hasText && value) { hasText = true; showStatus(); }
      };

      // The agent's UI events (navigation-requested, close-requested, render-screen, any other) are
      // handled AS THEY ARRIVE, while the answer keeps streaming — one at a time, in order, through
      // the dispatcher the inline Chat component uses too (bridge.dispatchChatEvent; its host —
      // navigate, close the panel, run a subscriber, paint a generated screen — is set by
      // loadMateuShell). Not awaited by the stream: a slow screen does not hold the answer back.
      let events = Promise.resolve();
      let opened = false;
      const onAgentEvent = (ev) => {
        events = events.then(async () => {
          const plan = await bridge.dispatchChatEvent(ev);
          if (plan && (plan.kind === 'navigate' || plan.kind === 'preview')) opened = true;
        }).catch(() => undefined);
      };
      let failure = null;
      try {
        accumulated = await bridge.streamChat({
          url: vars.mateuChatSseUrl,
          // the agent acts as whoever asks: the session's token (the stream does not go through
          // fetchWithPolicy, which is what adds it to the rest of the traffic). A function, read on
          // every send: after a 401 re-authentication is requested and the resend carries the new token
          headers: () => bridge.authHeadersOf(),
          reauthenticate: bridge.askForReauthentication,
          body: turn.body,
          onText: (value) => { accumulated = value; setAgent(value); },
          onProgress: (p) => {
            progress = p;
            vars.mateuChatSteps = bridge.chatToolStepsOf(p);
            showStatus();
          },
          onUsage: (usage) => { turnUsage = bridge.mergeTurnUsage(turnUsage, usage); },
          onEvent: onAgentEvent,
        }) || accumulated;
      } catch (e) {
        failure = e || new Error('Error');
      } finally {
        clearInterval(ticking);
        // the answer, or why there is none: empty, network drop or error (same texts as the web)
        setAgent(bridge.chatTurnTextOf(accumulated, failure));
        vars.mateuChatStatus = '';
        vars.mateuChatSteps = [];
        vars.mateuChatTokens = bridge.latestUsage(vars.mateuChatTokens, turnUsage);
        vars.mateuChatBusy = false;
        focusInput();
      }

      // Back to the message box once what the answer opened (a screen, a navigation) is painted:
      // the conversation goes on.
      await events;
      if (opened && vars.mateuChatOpen) focusInput();
    }
  }
  return chatSend;
});
