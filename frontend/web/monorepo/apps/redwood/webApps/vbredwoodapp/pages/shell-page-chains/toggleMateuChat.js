/* El CHAT del agente (botón de la cabecera, distinto del FAB de Ask Oracle): abre/cierra su drawer izquierdo.
 * Al abrir, foco al input y Enter→Enviar (imperativo: el on-keydown declarativo de VB no engancha
 * el keydown del oj-input-text); al cerrar, el foco vuelve al botón que lo abrió. */
define(['vb/action/actionChain', 'vb/action/actions', 'resources/js/mateu-bridge'], (ActionChain, Actions, bridge) => {
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

  const focusToggle = () => setTimeout(() => {
    const toggle = document.querySelector('#mateuChatToggle button');
    if (toggle) toggle.focus();
  }, 50);

  // el estado del botón de la cabecera para tecnologías de apoyo: oj-button no expone uno propio,
  // así que se marca su <button> interno (el velo de «abierto» lo pone la clase mateu-chat-open)
  const markToggle = (open) => {
    const toggle = document.querySelector('#mateuChatToggle button');
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  class toggleMateuChat extends ActionChain {
    /**
     * @param {Object} context
     * @param {Object} params
     * @param {boolean} params.open  sin valor = alternar (el botón abre y cierra)
     */
    async run(context, { open }) {
      const { $application } = context;
      const next = open == null ? !$application.variables.mateuChatOpen : !!open;
      if (next === $application.variables.mateuChatOpen) return;
      $application.variables.mateuChatOpen = next;
      // el micrófono solo donde el navegador reconoce la voz (no en Firefox)
      if (next) $application.variables.mateuChatMicAvailable = !!bridge.speechRecognitionCtor(window);
      // el agente LOCAL (companion del usuario, sin api key) gana al del servidor si contesta, como
      // en el chat web: se pregunta al abrir el panel
      if (next) {
        bridge.probeLocalAgent().then((alive) => { $application.variables.mateuChatLocalAgent = alive; });
      }
      markToggle(next);
      if (next) focusAndWireEnter(); else focusToggle();
    }
  }
  toggleMateuChat.focusAndWireEnter = focusAndWireEnter;
  return toggleMateuChat;
});
