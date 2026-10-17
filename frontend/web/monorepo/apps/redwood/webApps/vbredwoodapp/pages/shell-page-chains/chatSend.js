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
  'vb/action/actions',
  'resources/js/mateu-bridge',
], (ActionChain, Actions, bridge) => {
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

      if (!vars.mateuChatSessionId) {
        vars.mateuChatSessionId = 'chat-' + crypto.randomUUID();
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

      // The agent may emit a `render-screen` event with the definition (YAML) it has authored.
      // It is CAPTURED during the stream and fired AFTERWARDS, from the chain's main flow (not
      // from the nested async callback, which does not propagate the application event reliably).
      let renderYaml = null;
      // And a `navigation-requested` one (the agent's [NAVIGATE:…]): the route to open, also at the end.
      let navigateTo = null;
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
          onEvent: (ev) => {
            if (ev && ev.event === 'render-screen' && ev.detail && ev.detail.yaml) {
              renderYaml = ev.detail.yaml;
            } else if (ev && ev.event === 'navigation-requested' && ev.detail && typeof ev.detail.route === 'string') {
              navigateTo = ev.detail.route;
            } else if (ev && ev.event) {
              // any other agent event goes out to the document, as in the web chat (which
              // dispatches it bubbling): whoever listens hears it (a web component of the page)
              document.dispatchEvent(new CustomEvent(ev.event, { detail: ev.detail, bubbles: true, composed: true }));
            }
          },
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

      // The generated screen is painted by onMateuNavigate (the shell chain that drives the content):
      // it reloads the current route and, with renderYaml present, runs renderScreen with the YAML on the
      // host and projects the result. It is the same path as menu navigation, which does work
      // from the shell (an application event from here does NOT reach the content's listeners).
      if (renderYaml) {
        await Actions.callChain(context, {
          chain: 'onMateuNavigate',
          params: {
            event: { route: vars.mateuSelectedRoute || '/ai-screen', renderYaml },
            force: true,
          },
        });
      } else if (navigateTo) {
        await Actions.callChain(context, {
          chain: 'onMateuNavigate',
          params: { event: { route: navigateTo } },
        });
      }
      // Back to the message box once the screen the answer opened is painted: the conversation goes on.
      if (renderYaml || navigateTo) focusInput();
    }
  }
  return chatSend;
});
