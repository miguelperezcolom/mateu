/* Copyright (c) 2026, Oracle and/or its affiliates */

define(['resources/js/mateu-bridge'], (bridge) => {
  'use strict';

  /* Ctrl+Shift+M activa/desactiva el micrófono del chat (bridge.isChatMicShortcut), con el foco en
   * cualquier sitio — el campo del mensaje incluido —: pulsa el botón del micrófono, así que hace lo
   * mismo que el clic (chatMic) con el mismo estado e indicador. El botón solo existe con el panel
   * abierto y donde el navegador reconoce la voz; sin él, o deshabilitado (el asistente trabaja), el
   * atajo no hace nada. Se engancha una vez al documento, en captura: oj-input-text no deja subir
   * todas sus teclas. */
  const onMicShortcut = (event) => {
    if (!bridge.isChatMicShortcut(event)) return;
    const mic = document.querySelector('#mateuChatMic');
    if (!mic || mic.disabled) return;
    event.preventDefault();
    const button = mic.querySelector('button') || mic;
    button.click();
  };
  // oj-button no pasa aria-keyshortcuts a su <button>: se le pone a cada botón del micrófono que
  // aparece (uno por estado, se reemplazan al empezar y al acabar de escuchar)
  const markMicShortcut = () => {
    const button = document.querySelector('#mateuChatMic button:not([aria-keyshortcuts])');
    if (button) button.setAttribute('aria-keyshortcuts', bridge.CHAT_MIC_ARIA_KEYSHORTCUTS);
  };
  if (!document.__mateuChatMicShortcut) {
    document.__mateuChatMicShortcut = true;
    document.addEventListener('keydown', onMicShortcut, true);
    new MutationObserver(markMicShortcut).observe(document.body, { childList: true, subtree: true });
  }

  class PageModule {
    /**
     * La clase de una opción de primer nivel de la subcabecera (MENU_ON_TOP): marcada si su
     * sección es la que está en pantalla (bridge.activeSectionOf). Recibe la ruta seleccionada para
     * que el binding se reevalúe con cada navegación.
     */
    /**
     * Las opciones de la subcabecera: el primer nivel (MENU_ON_TOP) o, con HAMBURGER_SECTIONS, el
     * segundo nivel de la sección en pantalla —la hamburguesa lleva las secciones—. Sin sección en
     * pantalla (la home) la banda se queda vacía.
     */
    subheaderItemsOf(tree, selectedRoute, sectionsMode) {
      if (!sectionsMode) return tree || [];
      const section = bridge.sectionOf(tree, selectedRoute);
      return section ? (section.children || []) : [];
    }

    /** El título de la subcabecera: el de la consola, o con HAMBURGER_SECTIONS el de la sección. */
    subheaderTitleOf(title, tree, selectedRoute, sectionsMode) {
      if (!sectionsMode) return title || '';
      const section = bridge.sectionOf(tree, selectedRoute);
      return section ? section.label : '';
    }

    /**
     * La clase de la subcabecera: plegada (mateu-subheader-empty) cuando no tiene nada que enseñar
     * —HAMBURGER_SECTIONS en la home, sin sección en pantalla—, para que no quede una franja vacía.
     */
    subheaderClassOf(title, tree, selectedRoute, sectionsMode) {
      // sin `this`: VB puede llamar a las funciones de la página sueltas
      const section = sectionsMode ? bridge.sectionOf(tree, selectedRoute) : null;
      const empty = sectionsMode
        ? !section || (!section.label && !(section.children || []).length)
        : !title && !(tree || []).length;
      return empty ? 'mateu-subheader mateu-subheader-empty' : 'mateu-subheader';
    }

    /** HAMBURGER_SECTIONS: la entrada marcada en la lista de secciones (su id es la home). */
    sectionListSelection(tree, selectedRoute) {
      const section = bridge.sectionOf(tree, selectedRoute);
      return section ? (section.home || section.id) : '';
    }

    subheaderItemClass(node, tree, selectedRoute) {
      const active = bridge.activeSectionOf(tree, selectedRoute) === node.id;
      return active ? 'mateu-subheader-item mateu-nav-active' : 'mateu-subheader-item';
    }

    /**
     * La respuesta del asistente como nodos para su burbuja (oj-bind-dom): su markdown en HTML seguro
     * —escapado primero, ver chatMarkdownToHtml en poc/chat.mjs—. Se reevalúa con cada trozo del
     * stream, así que el markdown se ve formado mientras llega.
     */
    chatMessageDom(text) {
      const template = document.createElement('template');
      template.innerHTML = bridge.chatMarkdownToHtml(text);
      // un enlace a una ruta de la app ([4MBZS7](/booking/bookings/4MBZS7)) navega DENTRO de la
      // consola: el mismo navigation-requested que escucha la shell (loadMateuShell), que resuelve
      // a qué pod va la ruta por su prefijo. Ctrl/Cmd-clic sigue abriéndolo en otra pestaña.
      template.content.querySelectorAll('a.mateu-chat-route').forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
          const route = bridge.chatRouteOfLink(anchor, event);
          if (!route) return;
          event.preventDefault();
          anchor.dispatchEvent(new CustomEvent('navigation-requested', {
            detail: { route }, bubbles: true, composed: true,
          }));
        });
      });
      return { view: Array.from(template.content.childNodes), data: {} };
    }
  }

  return PageModule;
});
