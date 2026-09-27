/* El CHAT del agente (FAB propio, distinto del de Ask Oracle): abre/cierra su drawer izquierdo.
 * Al abrir, foco al input y Enter→Enviar (imperativo: el on-keydown declarativo de VB no engancha
 * el keydown del oj-input-text); al cerrar, el foco vuelve al FAB que lo abrió. */
define(['vb/action/actionChain', 'vb/action/actions'], (ActionChain, Actions) => {
  'use strict';

  // en estrecho el drawer es OVERLAY y JET, al acabar de abrirlo (~0,5 s), lleva el foco al
  // primer tabulable del panel (la ✕). Se vuelve a poner en el campo de escribir mientras el foco
  // siga dentro del panel en otro sitio — si el usuario ya se ha ido a otra parte, no se le quita.
  const focusInput = () => {
    const el = document.querySelector('#mateuChatInput input');
    if (el) el.focus();
    return el;
  };
  const wireEnter = (el) => {
    if (!el || el.__mateuEnterWired) return;
    el.__mateuEnterWired = true;
    el.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.keyCode === 13) && !e.shiftKey) {
        e.preventDefault();
        const btn = document.querySelector('#mateuChatSend');
        if (btn) btn.click();
      }
    });
  };
  const focusAndWireEnter = () => {
    setTimeout(() => wireEnter(focusInput()), 150);
    for (const delay of [500, 800, 1200]) {
      setTimeout(() => {
        const panel = document.querySelector('#mateuChatPanel');
        const input = document.querySelector('#mateuChatInput input');
        const active = document.activeElement;
        const strayInPanel = panel && active && active !== input
          && (panel.contains(active) || (panel.parentElement && active === panel.parentElement));
        if (strayInPanel) wireEnter(focusInput());
      }, delay);
    }
  };

  const focusFab = () => setTimeout(() => {
    const fab = document.querySelector('#mateuChatFab button');
    if (fab) fab.focus();
  }, 50);

  class toggleMateuChat extends ActionChain {
    /**
     * @param {Object} context
     * @param {Object} params
     * @param {boolean} params.open  sin valor = alternar (el FAB abre y cierra)
     */
    async run(context, { open }) {
      const { $application } = context;
      const next = open == null ? !$application.variables.mateuChatOpen : !!open;
      if (next === $application.variables.mateuChatOpen) return;
      $application.variables.mateuChatOpen = next;
      if (next) focusAndWireEnter(); else focusFab();
    }
  }
  toggleMateuChat.focusAndWireEnter = focusAndWireEnter;
  return toggleMateuChat;
});
