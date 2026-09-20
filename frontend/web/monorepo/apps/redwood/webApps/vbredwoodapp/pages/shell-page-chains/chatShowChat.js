/* Ask Oracle → modo Chat de IA. */
define(['vb/action/actionChain', 'vb/action/actions'], (ActionChain, Actions) => {
  'use strict';
  class chatShowChat extends ActionChain {
    async run(context) {
      context.$application.variables.mateuChatMode = true;
    }
  }
  return chatShowChat;
});
