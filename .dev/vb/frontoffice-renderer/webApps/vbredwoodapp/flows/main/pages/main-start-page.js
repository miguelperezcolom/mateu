/* Bridge de Mateu-sobre-VB (Fase 1) — módulo de la página de contenido.
 * loadRoot(): callMateu(:9001) → reduceContexts → devuelve { registry, greeting }.
 * reduceContexts/metaOf/firstText son el MISMO core que src/core/reduceContexts.mjs (subset Fase 1),
 * portado a este módulo AMD. Sin HTML/CSS: la presentación la pinta la página/fragmento con oj-*.
 */
define([], function () {
  'use strict';

  const BASE = 'http://localhost:9001';
  const HOST_ID = '__root__';

  // Contrato real: ClientSide lleva el DTO en .metadata; ServerSide, al nivel superior.
  const metaOf = (n) => (n && (n.metadata || n)) || {};

  function reduceContexts(reg, increment) {
    const contexts = Object.assign({}, reg.contexts);
    (increment.fragments || []).forEach((fr) => {
      const md = metaOf(fr.component);
      if (md.type === 'App') return; // una App configura la shell, no es contenido
      const id = fr.targetComponentId || HOST_ID;
      const prev = contexts[id] || { id, kind: id === HOST_ID ? 'host' : 'island', state: {} };
      contexts[id] = Object.assign({}, prev, {
        tree: fr.component || prev.tree,
        route: md.route != null ? md.route : prev.route,
        serverSideType: md.serverSideType != null ? md.serverSideType : prev.serverSideType,
        pageType: md.pageType != null ? md.pageType : prev.pageType,
        state: md.initialData || fr.data || prev.state,
      });
    });
    return { contexts: contexts, stack: reg.stack || [], shell: reg.shell || null };
  }

  // Fase 1: encuentra el primer nodo Text del árbol.
  function firstText(node) {
    if (!node || typeof node !== 'object') return null;
    const md = metaOf(node);
    if (md.type === 'Text') return md.text;
    const kids = [].concat(node.children || [], md.children || []);
    for (let i = 0; i < kids.length; i++) {
      const t = firstText(kids[i]);
      if (t) return t;
    }
    return null;
  }

  class PageModule {
    async loadRoot() {
      const res = await fetch(BASE + '/mateu/v3/components/_/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route: '', actionId: '__load__', componentState: {}, appState: {} }),
      });
      const increment = await res.json();
      const registry = reduceContexts({ contexts: {}, stack: [], shell: null }, increment);
      const host = registry.contexts[HOST_ID];
      return { registry: registry, greeting: firstText(host && host.tree) || '(sin contenido)' };
    }
  }

  return PageModule;
});
