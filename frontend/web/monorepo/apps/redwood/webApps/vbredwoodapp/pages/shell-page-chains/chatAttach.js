/* Chat attachments (@AI(upload)) and the panel's wide mode — parity with the web chat.
 *
 *  - op 'pick': opens the browser's file picker (an <input type=file> created here: VB's
 *    declarative binding is not reliable on a hidden native input), uploads what was chosen to the
 *    uploadUrl (bridge.uploadChatFiles, with the session token) and leaves the {name, path} as
 *    chips: they travel as `attachments` in the next message (chatSend empties them on send).
 *  - op 'remove': removes a chip.
 *  - op 'expand': the panel's wide mode (~60% of the viewport). */
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
     * @param {string} params.path  the attachment to remove (op 'remove')
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
