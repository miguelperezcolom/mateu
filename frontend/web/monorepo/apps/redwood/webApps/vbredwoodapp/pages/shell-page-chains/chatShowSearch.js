/* Ask Oracle → modo Buscar (por defecto). */
define(['vb/action/actionChain', 'vb/action/actions'], (ActionChain, Actions) => {
  'use strict';
  class chatShowSearch extends ActionChain {
    async run(context) {
      context.$application.variables.mateuChatMode = false;
    }
  }
  return chatShowSearch;
});
