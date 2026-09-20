/* Envío del chat de IA: postea el mensaje al sseUrl y ACUMULA la respuesta del agente en el
 * último mensaje (reasigna el array en cada trozo → reactividad de VB). Usa el core probado del
 * bridge (buildChatBody + streamChat). menuContext queda pendiente (la forma del menú VB difiere
 * de la que espera buildChatMenuContext — se mapea en una iteración posterior). */
define([
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/mateu-bridge',
], (ActionChain, Actions, bridge) => {
  'use strict';

  class chatSend extends ActionChain {
    async run(context) {
      const { $application } = context;
      const text = ($application.variables.mateuChatInput || '').trim();
      if (!text || $application.variables.mateuChatBusy) return;

      if (!$application.variables.mateuChatSessionId) {
        $application.variables.mateuChatSessionId = 'chat-' + Math.random().toString(36).slice(2, 10);
      }

      const msgs = ($application.variables.mateuChatMessages || []).slice();
      msgs.push({ role: 'user', text });
      const agentIdx = msgs.push({ role: 'agent', text: '' }) - 1;
      $application.variables.mateuChatMessages = msgs;
      $application.variables.mateuChatInput = '';
      $application.variables.mateuChatBusy = true;

      const setAgent = (value) => {
        const next = ($application.variables.mateuChatMessages || []).slice();
        if (next[agentIdx]) next[agentIdx] = { role: 'agent', text: value };
        $application.variables.mateuChatMessages = next;
      };

      try {
        await bridge.streamChat({
          url: $application.variables.mateuChatSseUrl,
          body: bridge.buildChatBody({
            message: text,
            sessionId: $application.variables.mateuChatSessionId,
          }),
          onText: (accumulated) => setAgent(accumulated),
        });
      } catch (e) {
        setAgent('⚠️ ' + (e && e.message ? e.message : 'Error'));
      } finally {
        $application.variables.mateuChatBusy = false;
      }
    }
  }
  return chatSend;
});
