/* Copyright (c) 2026, Oracle and/or its affiliates */

define(['resources/js/mateu-bridge'], (bridge) => {
  'use strict';

  class PageModule {
    /**
     * La clase de una opción de primer nivel de la subcabecera (MENU_ON_TOP): marcada si su
     * sección es la que está en pantalla (bridge.activeSectionOf). Recibe la ruta seleccionada para
     * que el binding se reevalúe con cada navegación.
     */
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
