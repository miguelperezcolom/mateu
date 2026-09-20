/* Enter en el input del chat → enviar (Shift+Enter = salto de línea). Lee el valor VIVO del DOM:
 * oj-input-text commitea `value` al change/blur, que puede ir por detrás del keydown. */
define(['vb/action/actionChain', 'vb/action/actions'], (ActionChain, Actions) => {
  'use strict';
  class chatKeydown extends ActionChain {
    async run(context, { event }) {
      const isEnter = event && (event.key === 'Enter' || event.keyCode === 13 || event.code === 'Enter');
      if (!isEnter || (event && event.shiftKey)) return;
      if (event.preventDefault) event.preventDefault();
      const el = document.querySelector('#mateuChatInput input');
      if (el) context.$application.variables.mateuChatInput = el.value;
      await Actions.callChain(context, { chain: 'chatSend' });
    }
  }
  return chatKeydown;
});
