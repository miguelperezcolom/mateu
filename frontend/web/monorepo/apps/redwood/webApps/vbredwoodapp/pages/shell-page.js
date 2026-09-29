/* Copyright (c) 2026, Oracle and/or its affiliates */

define(['resources/js/mateu-bridge'], (bridge) => {
  'use strict';

  class PageModule {
    /**
     * La respuesta del asistente como nodos para su burbuja (oj-bind-dom): su markdown en HTML seguro
     * —escapado primero, ver chatMarkdownToHtml en poc/chat.mjs—. Se reevalúa con cada trozo del
     * stream, así que el markdown se ve formado mientras llega.
     */
    chatMessageDom(text) {
      const template = document.createElement('template');
      template.innerHTML = bridge.chatMarkdownToHtml(text);
      return { view: Array.from(template.content.childNodes), data: {} };
    }
  }

  return PageModule;
});
