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
      const el = inputEl();
      const text = ((el && el.value) || $application.variables.mateuChatInput || '').trim();
      if (!text || $application.variables.mateuChatBusy) return;

      if (!$application.variables.mateuChatSessionId) {
        $application.variables.mateuChatSessionId = 'chat-' + crypto.randomUUID();
      }

      const msgs = ($application.variables.mateuChatMessages || []).slice();
      msgs.push({ role: 'user', text });
      const agentIdx = msgs.push({ role: 'agent', text: '' }) - 1;
      $application.variables.mateuChatMessages = msgs;
      clearInput($application);
      $application.variables.mateuChatBusy = true;

      const startedAt = Date.now();
      let hasText = false;
      let turnUsage = null;
      let progress = null;
      const showStatus = () => {
        $application.variables.mateuChatStatus = bridge.chatStatusText({
          busy: true, hasText, elapsedSeconds: (Date.now() - startedAt) / 1000, progress, now: Date.now(),
        });
      };
      showStatus();
      const ticking = setInterval(showStatus, 1000);

      const setAgent = (value) => {
        const next = ($application.variables.mateuChatMessages || []).slice();
        if (next[agentIdx]) next[agentIdx] = { role: 'agent', text: value };
        $application.variables.mateuChatMessages = next;
        if (!hasText && value) { hasText = true; showStatus(); }
      };

      // El agente puede emitir un evento `render-screen` con la definición (YAML) que ha autorado.
      // Se CAPTURA durante el stream y se dispara DESPUÉS, desde el flujo principal de la chain (no
      // desde el callback async anidado, que no propaga el evento de aplicación de forma fiable).
      let renderYaml = null;
      // Y uno `navigation-requested` ([NAVIGATE:…] del agente): la ruta a abrir, también al final.
      let navigateTo = null;
      try {
        await bridge.streamChat({
          url: $application.variables.mateuChatSseUrl,
          // el agente actúa como quien pregunta: el token de la sesión (el stream no pasa por
          // fetchWithPolicy, que es quien lo pone en el resto del tráfico). Una función, leída en
          // cada envío: tras un 401 se pide reautenticar y el reenvío lleva el token nuevo
          headers: () => bridge.authHeadersOf(),
          reauthenticate: bridge.askForReauthentication,
          // currentRoute: la pantalla desde la que se pregunta — el plano de control elige el
          // agente por ella (en /mapping, el de mapeado)
          body: bridge.buildChatBody({
            message: text,
            sessionId: $application.variables.mateuChatSessionId,
            currentRoute: $application.variables.mateuSelectedRoute || undefined,
          }),
          onText: (accumulated) => setAgent(accumulated),
          onProgress: (p) => { progress = p; showStatus(); },
          onUsage: (usage) => { turnUsage = bridge.mergeTurnUsage(turnUsage, usage); },
          onEvent: (ev) => {
            if (ev && ev.event === 'render-screen' && ev.detail && ev.detail.yaml) {
              renderYaml = ev.detail.yaml;
            }
            if (ev && ev.event === 'navigation-requested' && ev.detail && typeof ev.detail.route === 'string') {
              navigateTo = ev.detail.route;
            }
          },
        });
      } catch (e) {
        setAgent('⚠️ ' + (e && e.message ? e.message : 'Error'));
      } finally {
        clearInterval(ticking);
        $application.variables.mateuChatStatus = '';
        $application.variables.mateuChatTokens = bridge.latestUsage($application.variables.mateuChatTokens, turnUsage);
        $application.variables.mateuChatBusy = false;
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
            event: { route: $application.variables.mateuSelectedRoute || '/ai-screen', renderYaml },
            force: true,
          },
        });
      } else if (navigateTo) {
        await Actions.callChain(context, {
          chain: 'onMateuNavigate',
          params: { event: { route: navigateTo } },
        });
      }
    }
  }
  return chatSend;
});
