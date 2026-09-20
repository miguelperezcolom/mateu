/* Enter en el input del chat → enviar (Shift+Enter deja escribir salto de línea). */
define(['vb/action/actionChain', 'vb/action/actions'], (ActionChain, Actions) => {
  'use strict';
  class chatKeydown extends ActionChain {
    async run(context, { event }) {
      const key = event && (event.key || (event.detail && event.detail.key));
      if (key === 'Enter' && !(event && event.shiftKey)) {
        if (event.preventDefault) event.preventDefault();
        await Actions.callChain(context, { chain: 'chatSend' });
      }
    }
  }
  return chatKeydown;
});
