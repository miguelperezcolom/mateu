/* Enter in the chat input → send (Shift+Enter = line break). Reads the LIVE value from the DOM:
 * oj-input-text commits `value` on change/blur, which may lag behind the keydown. */
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
