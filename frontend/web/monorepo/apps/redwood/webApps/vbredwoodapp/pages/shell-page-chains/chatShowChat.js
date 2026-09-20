/* Ask Oracle → modo Chat de IA: foco en el input y cablea Enter→Enviar (imperativo, porque el
 * on-keydown declarativo de VB no engancha el keydown del oj-input-text). */
define(['vb/action/actionChain', 'vb/action/actions'], (ActionChain, Actions) => {
  'use strict';

  const focusAndWireEnter = () => setTimeout(() => {
    const el = document.querySelector('#mateuChatInput input');
    if (!el) return;
    el.focus();
    if (!el.__mateuEnterWired) {
      el.__mateuEnterWired = true;
      el.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.keyCode === 13) && !e.shiftKey) {
          e.preventDefault();
          const btn = document.querySelector('#mateuChatSend');
          if (btn) btn.click();
        }
      });
    }
  }, 120);

  class chatShowChat extends ActionChain {
    async run(context) {
      context.$application.variables.mateuChatMode = true;
      focusAndWireEnter();
    }
  }
  chatShowChat.focusAndWireEnter = focusAndWireEnter;
  return chatShowChat;
});
