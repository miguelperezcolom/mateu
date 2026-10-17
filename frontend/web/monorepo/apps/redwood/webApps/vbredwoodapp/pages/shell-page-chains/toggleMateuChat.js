/* The agent CHAT (header button, distinct from the Ask Oracle FAB): opens/closes its left drawer.
 * On open, focus to the input and Enter→Send (imperative: VB's declarative on-keydown does not hook
 * oj-input-text's keydown); on close, the focus goes back to the button that opened it. */
define(['vb/action/actionChain', 'vb/action/actions', 'resources/js/mateu-bridge'], (ActionChain, Actions, bridge) => {
  'use strict';

  // when narrow the drawer is an OVERLAY and JET, once it finishes opening it (~0.5 s), moves the focus to the
  // panel's first tabbable (the ✕). It is put back in the typing field as long as the focus
  // is still elsewhere inside the panel — if the user has already gone somewhere else, it is not taken away.
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

  // the header button's state for assistive technologies: oj-button does not expose one of its own,
  // so its inner <button> is marked (the «open» veil is set by the mateu-chat-open class)
  const markToggle = (open) => {
    const toggle = document.querySelector('#mateuChatToggle button');
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  class toggleMateuChat extends ActionChain {
    /**
     * @param {Object} context
     * @param {Object} params
     * @param {boolean} params.open  no value = toggle (the button opens and closes)
     */
    async run(context, { open }) {
      const { $application } = context;
      const next = open == null ? !$application.variables.mateuChatOpen : !!open;
      if (next === $application.variables.mateuChatOpen) return;
      $application.variables.mateuChatOpen = next;
      // the microphone only where the browser recognizes speech (not in Firefox)
      if (next) $application.variables.mateuChatMicAvailable = !!bridge.speechRecognitionCtor(window);
      markToggle(next);
      if (next) focusAndWireEnter(); else focusToggle();
    }
  }
  toggleMateuChat.focusAndWireEnter = focusAndWireEnter;
  return toggleMateuChat;
});
