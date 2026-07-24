/* Bridge de Mateu-sobre-VB (Fase 2) — módulo de la página de contenido.
 * loadApp(): callMateu('') → fragmento App → construye el menú del navigator (oj-navigation-list).
 * loadRoute(route): callMateu(route) → reduceContexts → devuelve el contenido (Fase 2: el Text).
 * reduceContexts/metaOf/firstText son el MISMO core que src/core/reduceContexts.mjs (subset), en AMD.
 * Sin HTML/CSS: la presentación la pinta la página con componentes oj-* de los ejemplos.
 */
// 'ojs/ojnavigationlist' se requiere para REGISTRAR el custom element oj-navigation-list
// (el paso de resolución de dependencias del build no lo incluye en standalone, así que lo
// cargamos explícitamente — es un componente core de OJET desde el CDN de jet).
define(['ojs/ojnavigationlist', 'ojs/ojarraydataprovider', 'knockout'], function (
  _ojNavigationList,
  ArrayDataProvider,
  ko,
) {
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

  // Contrato mediador: para cargar el contenido de una ruta de MENÚ hay que enviar el
  // serverSideType + consumedRoute del item (si no, la App se devuelve a sí misma).
  async function callMateu(route, serverSideType, consumedRoute) {
    const body = { route: route || '', actionId: '__load__', componentState: {}, appState: {} };
    if (serverSideType) body.serverSideType = serverSideType;
    if (consumedRoute != null) body.consumedRoute = consumedRoute;
    const res = await fetch(BASE + '/mateu/v3/components/_/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  class PageModule {
    constructor() {
      // El navigator (oj-navigation-list) se alimenta de este DataProvider observable;
      // loadApp() rellena navItems y la lista se repinta sola. `menu` guarda los items
      // completos (con serverSideType/consumedRoute) para el contrato mediador de loadRoute.
      this.menu = [];
      this.navItems = ko.observableArray([]);
      this.navDP = new ArrayDataProvider(this.navItems, { keyAttributes: 'route' });
    }

    getNavData() {
      return this.navDP;
    }

    // Carga la App (menú) desde Mateu. Devuelve la primera ruta para el contenido inicial.
    async loadApp() {
      const inc = await callMateu('');
      const appFrag = (inc.fragments || []).find((f) => metaOf(f.component).type === 'App');
      const md = appFrag ? metaOf(appFrag.component) : {};
      this.menu = (md.menu || []).map((m) => ({
        route: m.route,
        label: m.caption || m.label,
        serverSideType: m.serverSideType,
        consumedRoute: m.consumedRoute,
      }));
      this.navItems(this.menu.map((m) => ({ route: m.route, label: m.label })));
      return { firstRoute: (this.menu[0] || {}).route || '', title: md.title };
    }

    // Carga el contenido de una ruta (Fase 2: extrae el Text) vía el contrato mediador.
    async loadRoute(route) {
      const item = this.menu.filter((m) => m.route === route)[0] || {};
      const inc = await callMateu(route, item.serverSideType, item.consumedRoute);
      const reg = reduceContexts({ contexts: {}, stack: [], shell: null }, inc);
      const host = reg.contexts[HOST_ID];
      return { greeting: firstText(host && host.tree) || '(sin contenido)' };
    }
  }

  return PageModule;
});
