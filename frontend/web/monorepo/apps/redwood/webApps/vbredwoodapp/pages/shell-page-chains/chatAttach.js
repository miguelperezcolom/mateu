/* Adjuntos del chat (@AI(upload)) y el modo ancho del panel — paridad con el chat web.
 *
 *  - op 'pick': abre el selector de ficheros del navegador (un <input type=file> creado aquí: el
 *    binding declarativo de VB no es fiable sobre un input nativo oculto), sube lo elegido al
 *    uploadUrl (bridge.uploadChatFiles, con el token de la sesión) y deja los {name, path} como
 *    chips: viajan como `attachments` en el siguiente mensaje (chatSend los vacía al enviar).
 *  - op 'remove': quita un chip.
 *  - op 'expand': el modo ancho (~60% del viewport) del panel. */
define(['vb/action/actionChain', 'resources/js/mateu-bridge'], (ActionChain, bridge) => {
  'use strict';

  const pickFiles = () => new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.style.display = 'none';
    const done = () => {
      const files = Array.from(input.files || []);
      input.remove();
      resolve(files);
    };
    input.addEventListener('change', done, { once: true });
    input.addEventListener('cancel', done, { once: true });
    document.body.appendChild(input);
    input.click();
  });

  class chatAttach extends ActionChain {
    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.op    'pick' | 'remove' | 'expand'
     * @param {string} params.path  el adjunto a quitar (op 'remove')
     */
    async run(context, { op, path }) {
      const { $application } = context;
      const vars = $application.variables;
      if (op === 'expand') {
        vars.mateuChatExpanded = !vars.mateuChatExpanded;
        return;
      }
      if (op === 'remove') {
        vars.mateuChatAttachments = (vars.mateuChatAttachments || []).filter((a) => a.path !== path);
        return;
      }
      if (op !== 'pick' || !vars.mateuChatUploadUrl || vars.mateuChatUploading) return;
      const files = await pickFiles();
      if (!files.length) return;
      if (!vars.mateuChatSessionId) vars.mateuChatSessionId = 'chat-' + crypto.randomUUID();
      vars.mateuChatUploading = true;
      try {
        const saved = await bridge.uploadChatFiles({
          uploadUrl: vars.mateuChatUploadUrl,
          files,
          sessionId: vars.mateuChatSessionId,
          headers: bridge.authHeadersOf(),
        });
        vars.mateuChatAttachments = bridge.withAttachments(vars.mateuChatAttachments, saved);
      } catch (e) {
        const msgs = (vars.mateuChatMessages || []).slice();
        msgs.push({ role: 'agent', text: '⚠️ ' + bridge.chromeText('chatUploadError', { message: (e && e.message) || String(e) }) });
        vars.mateuChatMessages = msgs;
      } finally {
        vars.mateuChatUploading = false;
      }
    }
  }
  return chatAttach;
});
