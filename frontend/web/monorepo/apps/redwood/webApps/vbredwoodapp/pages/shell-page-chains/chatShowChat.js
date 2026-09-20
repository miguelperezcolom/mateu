/* Ask Oracle → modo Chat de IA, y foco en el input al abrir. */
define(['vb/action/actionChain', 'vb/action/actions'], (ActionChain, Actions) => {
  'use strict';
  class chatShowChat extends ActionChain {
    async run(context) {
      context.$application.variables.mateuChatMode = true;
      setTimeout(() => {
        const el = document.querySelector('#mateuChatInput input')
          || document.querySelector('#mateuChatInput');
        if (el) el.focus();
      }, 200);
    }
  }
  return chatShowChat;
});
