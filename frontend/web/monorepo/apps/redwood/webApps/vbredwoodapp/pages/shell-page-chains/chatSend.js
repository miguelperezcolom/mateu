/* Envío del chat de IA. Lee el valor VIVO del input del DOM (oj-input-text commitea `value` al
 * change/blur, que va por detrás de un Enter), postea al sseUrl y ACUMULA la respuesta del agente
 * en el último mensaje. Al terminar, limpia el input y devuelve el foco. */
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
        $application.variables.mateuChatSessionId = 'chat-' + Math.random().toString(36).slice(2, 10);
      }

      const msgs = ($application.variables.mateuChatMessages || []).slice();
      msgs.push({ role: 'user', text });
      const agentIdx = msgs.push({ role: 'agent', text: '' }) - 1;
      $application.variables.mateuChatMessages = msgs;
      clearInput($application);
      $application.variables.mateuChatBusy = true;

      const setAgent = (value) => {
        const next = ($application.variables.mateuChatMessages || []).slice();
        if (next[agentIdx]) next[agentIdx] = { role: 'agent', text: value };
        $application.variables.mateuChatMessages = next;
      };

      // El agente puede emitir un evento `render-screen` con la definición (YAML) que ha autorado.
      // Se CAPTURA durante el stream y se dispara DESPUÉS, desde el flujo principal de la chain (no
      // desde el callback async anidado, que no propaga el evento de aplicación de forma fiable).
      let renderYaml = null;
      try {
        await bridge.streamChat({
          url: $application.variables.mateuChatSseUrl,
          body: bridge.buildChatBody({
            message: text,
            sessionId: $application.variables.mateuChatSessionId,
          }),
          onText: (accumulated) => setAgent(accumulated),
          onEvent: (ev) => {
            if (ev && ev.event === 'render-screen' && ev.detail && ev.detail.yaml) {
              renderYaml = ev.detail.yaml;
            }
          },
        });
      } catch (e) {
        setAgent('⚠️ ' + (e && e.message ? e.message : 'Error'));
      } finally {
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
      }
    }
  }
  return chatSend;
});
