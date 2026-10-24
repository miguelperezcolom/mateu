/* Mateu — Apache License 2.0 (LICENSE.txt at the repository root) */

define(['resources/js/mateu-bridge'], (bridge) => {
  'use strict';

  /* Ctrl+Shift+M toggles the chat microphone (bridge.isChatMicShortcut), with the focus
   * anywhere — the message field included —: it presses the microphone button, so it does the
   * same as the click (chatMic) with the same state and indicator. The button only exists with the
   * panel open and where the browser recognises speech; without it, or disabled (the assistant is
   * working), the shortcut does nothing. Hooked once on the document, in capture: oj-input-text
   * does not let all its keys bubble up. */
  const onMicShortcut = (event) => {
    if (!bridge.isChatMicShortcut(event)) return;
    const mic = document.querySelector('#mateuChatMic');
    if (!mic || mic.disabled) return;
    event.preventDefault();
    const button = mic.querySelector('button') || mic;
    button.click();
  };
  // oj-button does not pass aria-keyshortcuts on to its <button>: it is set on every microphone
  // button that appears (one per state, they are replaced when listening starts and ends)
  const markMicShortcut = () => {
    const button = document.querySelector('#mateuChatMic button:not([aria-keyshortcuts])');
    if (button) button.setAttribute('aria-keyshortcuts', bridge.CHAT_MIC_ARIA_KEYSHORTCUTS);
  };
  /* A link to an app route in the assistant's answer ([4MBZS7](/booking/bookings/4MBZS7)) navigates
   * INSIDE the console: the same navigation-requested the shell listens to (loadMateuShell), which
   * resolves which pod the route goes to by its prefix. Ctrl/Cmd-click still opens it in another tab.
   * Delegated: Spectra's message block paints the answer from an HTML string, nothing to hook per link. */
  const onChatRouteLink = (event) => {
    const anchor = event.target && event.target.closest && event.target.closest('#mateuChatPanel a.mateu-chat-route');
    if (!anchor) return;
    const route = bridge.chatRouteOfLink(anchor, event);
    if (!route) return;
    event.preventDefault();
    anchor.dispatchEvent(new CustomEvent('navigation-requested', {
      detail: { route }, bubbles: true, composed: true,
    }));
  };
  /* The composer is Spectra's oj-sp-chat-input; its attach and microphone buttons run OUR flows:
   * Spectra's own picker only takes images and PDFs (@AI(upload) takes any file) and its voice
   * button enters a listen mode that expects the host's visualizer, while ours dictates one sentence
   * and sends it. So a press on either is taken in capture, before Spectra's handler, and handed to
   * the panel's (hidden) trigger of that flow — the same chains as before. */
  const CHAT_INPUT_TRIGGERS = [
    ['.oj-sp-chat-input-attach-btn', '#mateuChatAttach'],
    ['.oj-sp-chat-input-voice-btn', '#mateuChatMic'],
  ];
  const onChatInputButton = (event) => {
    const t = event.target;
    if (!t || !t.closest || !t.closest('#mateuChatInput')) return;
    for (const [from, to] of CHAT_INPUT_TRIGGERS) {
      if (!t.closest(from)) continue;
      event.preventDefault();
      event.stopImmediatePropagation();
      const trigger = document.querySelector(to);
      const button = trigger && (trigger.querySelector('button') || trigger);
      if (button && !trigger.disabled) button.click();
      return;
    }
  };
  if (!document.__mateuChatSpectra) {
    document.__mateuChatSpectra = true;
    document.addEventListener('click', onChatRouteLink);
    document.addEventListener('click', onChatInputButton, true);
  }
  if (!document.__mateuChatMicShortcut) {
    document.__mateuChatMicShortcut = true;
    document.addEventListener('keydown', onMicShortcut, true);
    new MutationObserver(markMicShortcut).observe(document.body, { childList: true, subtree: true });
  }

  class PageModule {
    constructor() {
      this.watchChatScroll();
    }

    /**
     * Keeps the chat's message list on its last message (bridge.stickChatToBottom). The list lives
     * in the chat drawer and can be created or re-created later, so the page looks for it whenever
     * the DOM changes — once per frame — and moves the behaviour to the new element.
     */
    watchChatScroll() {
      if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
      let current = null;
      let stop = () => {};
      let queued = false;
      const attach = () => {
        queued = false;
        const el = document.querySelector('.mateu-chat-messages');
        if (el && el !== current) {
          stop();
          current = el;
          stop = bridge.stickChatToBottom(el);
        }
      };
      const schedule = () => {
        if (queued) return;
        queued = true;
        (window.requestAnimationFrame || setTimeout)(attach);
      };
      new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
      schedule();
    }

    /**
     * The class of a top-level subheader option (MENU_ON_TOP): marked if its section is the one
     * on screen (bridge.activeSectionOf). It receives the selected route so the binding is
     * re-evaluated on every navigation.
     */
    /**
     * The subheader options: the top level (MENU_ON_TOP) or, with HAMBURGER_SECTIONS, the second
     * level of the section on screen —the hamburger carries the sections—. With no section on
     * screen (the home) the band stays empty.
     */
    subheaderItemsOf(tree, selectedRoute, sectionsMode) {
      if (!sectionsMode) return tree || [];
      const section = bridge.sectionOf(tree, selectedRoute);
      return section ? (section.children || []) : [];
    }

    /** The subheader title: the console's, or with HAMBURGER_SECTIONS the section's. */
    subheaderTitleOf(title, tree, selectedRoute, sectionsMode) {
      if (!sectionsMode) return title || '';
      const section = bridge.sectionOf(tree, selectedRoute);
      return section ? section.label : '';
    }

    /**
     * The subheader class: collapsed (mateu-subheader-empty) when it has nothing to show
     * —HAMBURGER_SECTIONS on the home, no section on screen—, so no empty strip is left.
     */
    subheaderClassOf(title, tree, selectedRoute, sectionsMode) {
      // no `this`: VB may call the page functions unbound
      const section = sectionsMode ? bridge.sectionOf(tree, selectedRoute) : null;
      const empty = sectionsMode
        ? !section || (!section.label && !(section.children || []).length)
        : !title && !(tree || []).length;
      return empty ? 'mateu-subheader mateu-subheader-empty' : 'mateu-subheader';
    }

    /** HAMBURGER_SECTIONS: the selected entry in the section list (its id is the home). */
    sectionListSelection(tree, selectedRoute) {
      const section = bridge.sectionOf(tree, selectedRoute);
      return section ? (section.home || section.id) : '';
    }

    subheaderItemClass(node, tree, selectedRoute) {
      const active = bridge.activeSectionOf(tree, selectedRoute) === node.id;
      return active ? 'mateu-subheader-item mateu-nav-active' : 'mateu-subheader-item';
    }

    /**
     * The `messages` of a conversation entry's Spectra block (oj-sp-chat-message-block): the
     * person's text as is (Spectra paints a user's message as text), the assistant's markdown as
     * safe HTML — escaped first, see chatBlockMessagesOf / chatMarkdownToHtml in poc/chat.mjs —.
     * Re-evaluated with every chunk of the stream, so the markdown shows formatted while it arrives.
     */
    chatBlockMessages(role, text) {
      return bridge.chatBlockMessagesOf(role, text);
    }
  }

  return PageModule;
});
