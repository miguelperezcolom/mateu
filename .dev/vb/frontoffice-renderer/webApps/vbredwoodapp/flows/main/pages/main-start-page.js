/* Bridge de Mateu-sobre-VB (Fases 1–3) — módulo de la página de contenido.
 * loadApp():   callMateu('') → fragmento App → menú del navigator (oj-navigation-list).
 * loadRoute(): callMateu(route, sst, consumedRoute) → contenido. Si el árbol tiene FormFields,
 *              expone el formulario (campos oj-c-* two-way); si no, extrae el Text.
 * save():      reenvía el estado del formulario (actionId 'save') y devuelve el mensaje resultante.
 * El core (metaOf/reduceContexts/firstText) es paridad de src/core/reduceContexts.mjs, en AMD.
 * Sin HTML/CSS: la presentación la pinta la página con componentes oj-* de los ejemplos.
 *
 * Se requieren los custom elements usados en la página (el build en standalone no los resuelve):
 * oj-navigation-list + los oj-c-* del formulario.
 */
define([
  'ojs/ojnavigationlist',
  'ojs/ojtable',
  'oj-c/input-text',
  'oj-c/input-number',
  'oj-c/button',
  'ojs/ojarraydataprovider',
  'knockout',
], function (_nav, _table, _it, _in, _btn, ArrayDataProvider, ko) {
  'use strict';

  const BASE = 'http://localhost:9001';
  const HOST_ID = '__root__';

  const metaOf = (n) => (n && (n.metadata || n)) || {};

  function reduceContexts(reg, increment) {
    const contexts = Object.assign({}, reg.contexts);
    (increment.fragments || []).forEach((fr) => {
      const md = metaOf(fr.component);
      if (md.type === 'App') return;
      const id = fr.targetComponentId || HOST_ID;
      const prev = contexts[id] || { id, kind: id === HOST_ID ? 'host' : 'island', state: {} };
      contexts[id] = Object.assign({}, prev, {
        tree: fr.component || prev.tree,
        route: md.route != null ? md.route : prev.route,
        serverSideType: md.serverSideType != null ? md.serverSideType : prev.serverSideType,
        consumedRoute: md.consumedRoute != null ? md.consumedRoute : prev.consumedRoute,
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

  // Busca el FormField-grid (un listado: stereotype 'grid'); devuelve su nodo o null.
  function findGridField(node) {
    if (!node || typeof node !== 'object') return null;
    const m = metaOf(node);
    if (m.type === 'FormField' && m.stereotype === 'grid') return node;
    const keys = Object.keys(node);
    for (let i = 0; i < keys.length; i++) {
      const v = node[keys[i]];
      if (Array.isArray(v)) {
        for (let j = 0; j < v.length; j++) {
          const r = findGridField(v[j]);
          if (r) return r;
        }
      } else if (v && typeof v === 'object') {
        const r = findGridField(v);
        if (r) return r;
      }
    }
    return null;
  }

  // Columnas del grid (GridColumn) deduplicadas por id, excluyendo la de selección.
  function collectColumns(node, out, seen) {
    out = out || [];
    seen = seen || {};
    if (node && typeof node === 'object') {
      const m = metaOf(node);
      if (m.type === 'GridColumn' && m.id && m.id !== '_select' && !seen[m.id]) {
        seen[m.id] = true;
        out.push({ id: m.id, label: m.label || m.caption || m.id });
      }
      Object.keys(node).forEach((k) => {
        const v = node[k];
        if (Array.isArray(v)) v.forEach((x) => collectColumns(x, out, seen));
        else if (v && typeof v === 'object') collectColumns(v, out, seen);
      });
    }
    return out;
  }

  // ¿Hay un App con variant MEDIATOR en el árbol? (un crud/mediador que pide recarga con su sst).
  function hasMediator(node) {
    if (!node || typeof node !== 'object') return false;
    const m = metaOf(node);
    if (m.type === 'App' && m.variant === 'MEDIATOR') return true;
    const keys = Object.keys(node);
    for (let i = 0; i < keys.length; i++) {
      const v = node[keys[i]];
      if (Array.isArray(v)) {
        for (let j = 0; j < v.length; j++) if (hasMediator(v[j])) return true;
      } else if (v && typeof v === 'object' && hasMediator(v)) return true;
    }
    return false;
  }

  // ¿El árbol/increment expone una acción con este id? (p.ej. 'search' → es un listado CRUD).
  function hasActionId(node, actionId) {
    if (!node || typeof node !== 'object') return false;
    if (node.actionId === actionId) return true;
    const keys = Object.keys(node);
    for (let i = 0; i < keys.length; i++) {
      const v = node[keys[i]];
      if (Array.isArray(v)) {
        for (let j = 0; j < v.length; j++) if (hasActionId(v[j], actionId)) return true;
      } else if (v && typeof v === 'object' && hasActionId(v, actionId)) return true;
    }
    return false;
  }

  // Deep-search: los FormField anidan en metadata, no solo en children. Se deduplica por fieldId
  // (el árbol referencia los nodos en children Y en metadata, así que aparecen 2 veces).
  function collectFields(node, out, seen) {
    out = out || [];
    seen = seen || {};
    if (node && typeof node === 'object') {
      const m = metaOf(node);
      if (m.type === 'FormField' && m.fieldId && !seen[m.fieldId]) {
        seen[m.fieldId] = true;
        out.push({ fieldId: m.fieldId, label: m.label, dataType: m.dataType, required: !!m.required });
      }
      Object.keys(node).forEach((k) => {
        const v = node[k];
        if (Array.isArray(v)) v.forEach((x) => collectFields(x, out, seen));
        else if (v && typeof v === 'object') collectFields(v, out, seen);
      });
    }
    return out;
  }

  async function callMateu(route, actionId, serverSideType, consumedRoute, componentState) {
    const body = {
      route: route || '',
      // OJO: actionId="" (vacío) NO es __load__ — el mediador del crud carga con actionId vacío;
      // solo se usa __load__ cuando no se pasa actionId (null/undefined).
      actionId: actionId == null ? '__load__' : actionId,
      componentState: componentState || {},
      appState: {},
    };
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
      this.menu = [];
      this.navItems = ko.observableArray([]);
      this.navDP = new ArrayDataProvider(this.navItems, { keyAttributes: 'route' });
      // Estado del formulario actual. formData (plano, por fieldId) es la fuente de verdad para el
      // save: cada input hace value one-way + on-value-changed → escribe aquí (el two-way de
      // oj-bind-for-each a un observable anidado NO escribe de vuelta —clona el item—, por eso el
      // closure de onChange captura el fieldId y actualiza formData directamente).
      this.formFields = ko.observableArray([]);
      this.formData = {};
      this.current = { route: '', serverSideType: null, consumedRoute: null };
      // Estado de la tabla (Fase 4): filas observables + columnas.
      this.tableRows = ko.observableArray([]);
      this.tableDP = new ArrayDataProvider(this.tableRows, { keyAttributes: '@index' });
      this.tableColumns = [];
    }

    getNavData() {
      return this.navDP;
    }
    getFormFields() {
      return this.formFields;
    }
    getTableData() {
      return this.tableDP;
    }
    getTableColumns() {
      return this.tableColumns;
    }

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
      return { firstRoute: (this.menu[0] || {}).route || '' };
    }

    async loadRoute(route) {
      const item = this.menu.filter((m) => m.route === route)[0] || {};
      const EMPTY = { contexts: {}, stack: [], shell: null };
      // Carga con actionId="" (unificado: vale para pantallas normales y para el handleRoute del
      // mediador — __load__ va a handleAction y el crud no lo soporta).
      let inc = await callMateu(route, '', item.serverSideType, item.consumedRoute);
      let host = reduceContexts(EMPTY, inc).contexts[HOST_ID] || {};
      // ¿Mediador (crud)? Un App MEDIATOR pide recargar con el serverSideType del propio mediador.
      // El consumedRoute del crud = su propia ruta (si no, ListRouteResolver no resuelve la listing).
      let crudConsumed = null;
      if (hasMediator(host.tree)) {
        const medRoute = host.route || route;
        crudConsumed = medRoute;
        inc = await callMateu(medRoute, '', host.serverSideType, medRoute);
        host = reduceContexts(EMPTY, inc).contexts[HOST_ID] || {};
      }
      // Contexto para acciones posteriores (search/new/save/delete) = el componente cargado.
      this.current = {
        route: host.route != null ? host.route : route,
        serverSideType: host.serverSideType || item.serverSideType,
        consumedRoute:
          crudConsumed != null
            ? crudConsumed
            : host.consumedRoute != null
              ? host.consumedRoute
              : item.consumedRoute || '',
      };
      const state = host.state || {};

      // A) ¿Listado CRUD? (expone la acción 'search') → columnas GridColumn + search para las filas.
      if (hasActionId(inc, 'search')) {
        this.tableColumns = collectColumns(host.tree).map((c) => ({ headerText: c.label, field: c.id }));
        this.tableRows(await this._search());
        this.formFields([]);
        return { isTable: true, isForm: false, greeting: '' };
      }
      // B) ¿Listado simple? (un FormField-grid) → tabla oj-table.
      const gridNode = findGridField(host.tree);
      if (gridNode) {
        const gmeta = metaOf(gridNode);
        this.tableColumns = collectColumns(gridNode).map((c) => ({ headerText: c.label, field: c.id }));
        this.tableRows((state[gmeta.fieldId] || []).slice());
        this.formFields([]);
        return { isTable: true, isForm: false, greeting: '' };
      }
      // C) ¿Formulario? (FormFields) → inputs oj-c-*.
      const fields = collectFields(host.tree);
      const self = this;
      this.formData = {};
      fields.forEach((f) => {
        this.formData[f.fieldId] = state[f.fieldId] != null ? state[f.fieldId] : '';
      });
      this.formFields(
        fields.map((f) => {
          const fieldId = f.fieldId;
          return {
            fieldId: fieldId,
            label: f.label,
            dataType: f.dataType,
            isNumber: f.dataType === 'integer' || f.dataType === 'number' || f.dataType === 'decimal',
            value: this.formData[fieldId],
            onChange: function (e) {
              self.formData[fieldId] = e.detail.value;
            },
          };
        }),
      );
      return {
        isTable: false,
        isForm: fields.length > 0,
        greeting: firstText(host.tree) || '(sin contenido)',
      };
    }

    // Fase 5: las filas de un listado CRUD llegan por la acción 'search' (data.crud.page.content).
    async _search() {
      const inc = await callMateu(
        this.current.route,
        'search',
        this.current.serverSideType,
        this.current.consumedRoute,
        {},
      );
      const fr = (inc.fragments || [])[0] || {};
      const page = ((fr.data || {}).crud || {}).page || {};
      return (page.content || []).slice();
    }

    // Fase 3: reenvía el estado editado con actionId 'save' y devuelve el mensaje.
    async save() {
      // Fuente de verdad al guardar: el VALOR de cada componente oj-c en el DOM (el two-way /
      // on-value-changed a través de oj-bind-for-each no propaga de forma fiable; el .value del
      // componente sí es correcto). Cada input lleva data-field=<fieldId>.
      const state = {};
      const els = document.querySelectorAll('[data-field]');
      for (let i = 0; i < els.length; i++) {
        state[els[i].getAttribute('data-field')] = els[i].value;
      }
      const inc = await callMateu(
        this.current.route,
        'save',
        this.current.serverSideType,
        this.current.consumedRoute,
        state,
      );
      const msg = (inc.messages || [])[0];
      return { message: msg ? msg.text || msg.title : 'Guardado' };
    }
  }

  return PageModule;
});
