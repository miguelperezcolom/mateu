/* Envío del chat de IA. Lee el valor VIVO del input del DOM (oj-input-text commitea `value` al
 * change/blur, que va por detrás de un Enter), postea al sseUrl y va pintando la respuesta del agente
 * en el último mensaje según llega (agent-delta), sustituida al final por la respuesta entera y
 * limpia. Al terminar, limpia el input y devuelve el foco.
 *
 * Mientras tanto dice qué pasa en la fila de estado del panel (mateuChatStatus): lo que el agente
 * informa — «Conectando con 2 servidores MCP…», «Llamando a booking_findBookings… 3 s»,
 * «Respondiendo…» —, o, con un agente que no informa, «Pensando… N s» hasta el primer texto. Y deja
 * en mateuChatTokens el uso que manda el agente, que ya es el de toda la conversación (se sustituye,
 * no se suma). */
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
      // un mensaje con sólo adjuntos (sin texto) también se envía, como en el chat web
      if ((!text && !attachments.length) || vars.mateuChatBusy) return;

      if (!vars.mateuChatSessionId) {
        vars.mateuChatSessionId = 'chat-' + crypto.randomUUID();
      }
      const sessionId = vars.mateuChatSessionId;
      const registry = vars.mateuRegistry || {};
      // el menú sólo en el PRIMER mensaje de la sesión: el agente lo guarda por sesión
      const sendMenu = window.__mateuChatMenuSentFor !== sessionId;
      window.__mateuChatMenuSentFor = sessionId;
      // el turno con la forma del chat web (poc/chat.mjs chatTurnOf): texto, sesión, ruta, adjuntos,
      // el contexto de la pantalla (url, título, appState, estado del host), la pantalla proyectada
      // para el agente, el mcpUrl y el menú
      const turn = bridge.chatTurnOf({
        message: text,
        sessionId,
        attachments,
        registry,
        appState: vars.mateuAppState || {},
        url: window.location.pathname + window.location.search + window.location.hash,
        screenTitle: document.title,
        // currentRoute: la pantalla desde la que se pregunta — el plano de control elige el
        // agente por ella (en /mapping, el de mapeado)
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

      // El agente puede emitir un evento `render-screen` con la definición (YAML) que ha autorado.
      // Se CAPTURA durante el stream y se dispara DESPUÉS, desde el flujo principal de la chain (no
      // desde el callback async anidado, que no propaga el evento de aplicación de forma fiable).
      let renderYaml = null;
      // Y uno `navigation-requested` ([NAVIGATE:…] del agente): la ruta a abrir, también al final.
      let navigateTo = null;
      let failure = null;
      try {
        accumulated = await bridge.streamChat({
          url: vars.mateuChatSseUrl,
          // el agente actúa como quien pregunta: el token de la sesión (el stream no pasa por
          // fetchWithPolicy, que es quien lo pone en el resto del tráfico). Una función, leída en
          // cada envío: tras un 401 se pide reautenticar y el reenvío lleva el token nuevo
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
              // cualquier otro evento del agente sale al documento, como en el chat web (que lo
              // despacha burbujeando): lo oye quien lo escuche (un componente web de la página)
              document.dispatchEvent(new CustomEvent(ev.event, { detail: ev.detail, bubbles: true, composed: true }));
            }
          },
        }) || accumulated;
      } catch (e) {
        failure = e || new Error('Error');
      } finally {
        clearInterval(ticking);
        // la respuesta, o por qué no la hay: vacía, corte de red o error (mismos textos que el web)
        setAgent(bridge.chatTurnTextOf(accumulated, failure));
        vars.mateuChatStatus = '';
        vars.mateuChatSteps = [];
        vars.mateuChatTokens = bridge.latestUsage(vars.mateuChatTokens, turnUsage);
        vars.mateuChatBusy = false;
        focusInput();
      }

      // La pantalla generada la pinta onMateuNavigate (chain de la shell que conduce el contenido):
      // recarga la ruta actual y, con renderYaml presente, corre renderScreen con el YAML sobre el
      // host y proyecta el resultado. Es el mismo camino que la navegación del menú, que sí funciona
      // desde la shell (un evento de aplicación desde aquí NO alcanza los listeners del contenido).
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
