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
  'oj-c/select-single',
  'oj-sp/foldout-layout/loader',
  'oj-sp/foldout-panel/loader',
  'ojs/ojarraydataprovider',
  'ojs/ojarraytreedataprovider',
  'knockout',
], function (_nav, _table, _it, _in, _btn, _sel, _fl, _fp, ArrayDataProvider, ArrayTreeDataProvider, ko) {
  'use strict';

  const BASE = 'http://localhost:9001';
  const HOST_ID = '__root__';
  const APP_SST = 'io.mateu.redwoodvb.ui.RedwoodVbApp';

  // @AppContext elegido en la cabecera → viaja en el appState de CADA request (Fase 6).
  const appContext = {};

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

  // Busca el nodo FoldoutLayout (Fase 7); devuelve su metadata o null.
  function findFoldout(node) {
    if (!node || typeof node !== 'object') return null;
    const m = metaOf(node);
    if (m.type === 'FoldoutLayout') return m;
    const keys = Object.keys(node);
    for (let i = 0; i < keys.length; i++) {
      const v = node[keys[i]];
      if (Array.isArray(v)) {
        for (let j = 0; j < v.length; j++) {
          const r = findFoldout(v[j]);
          if (r) return r;
        }
      } else if (v && typeof v === 'object') {
        const r = findFoldout(v);
        if (r) return r;
      }
    }
    return null;
  }

  // Mapa slot→texto de los hijos slotted (overview, panel-0, …). Fase 7 = contenido Text.
  function slotTexts(node, out) {
    out = out || {};
    if (node && typeof node === 'object') {
      const m = metaOf(node);
      if (node.slot && m.type === 'Text') out[node.slot] = m.text;
      Object.keys(node).forEach((k) => {
        const v = node[k];
        if (Array.isArray(v)) v.forEach((x) => slotTexts(x, out));
        else if (v && typeof v === 'object') slotTexts(v, out);
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
      appState: Object.assign({}, appContext),
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
      // Menú: árbol observable para el navigator (submenús) + lookup plano por ruta (con el
      // serverSideType/consumedRoute de cada item, incl. anidados) para el contexto de loadRoute.
      this.menuByRoute = {};
      this.groupRoutes = {};
      this.groupChildFirst = {};
      this.navItems = ko.observableArray([]);
      this.navDP = new ArrayTreeDataProvider(this.navItems, { keyAttributes: 'route' });
      // Estado del formulario actual. formData (plano, por fieldId) es la fuente de verdad para el
      // save: cada input hace value one-way + on-value-changed → escribe aquí (el two-way de
      // oj-bind-for-each a un observable anidado NO escribe de vuelta —clona el item—, por eso el
      // closure de onChange captura el fieldId y actualiza formData directamente).
      this.formFields = ko.observableArray([]);
      this.formData = {};
      this.current = { route: '', serverSideType: null, consumedRoute: null };
      // Estado de la tabla (Fase 4): filas Y columnas observables (si las columnas fueran un array
      // plano, oj-table las leería una sola vez y al cambiar de listado mantendría las viejas —las
      // filas nuevas solo casarían en las columnas comunes—).
      this.tableRows = ko.observableArray([]);
      this.tableDP = new ArrayDataProvider(this.tableRows, { keyAttributes: '@index' });
      this.tableColumns = ko.observableArray([]);
      // Estado CRUD (Fase 5). isCrud → la listing es un AutoCrud (toolbar Nuevo/Editar/Borrar).
      // crudSaveActionId = 'create'|'save' según estemos creando o editando; formRoute = la ruta
      // del form (/new o /{id}/edit); selectedRowIndex = fila seleccionada en la tabla.
      this.isCrud = false;
      this.crudSaveActionId = null;
      this.crudFormRoute = null;
      this.selectedRowIndex = -1;
      // Cabecera (Fase 6): selectores de @AppContext + acciones (observables: loadApp es async y
      // el for-each de la cabecera debe re-renderizar cuando lleguen).
      this.contextSelectors = ko.observableArray([]);
      this.contextActions = ko.observableArray([]);
      // Foldout (Fase 7): overview + paneles plegables.
      this.foldoutOverview = ko.observable('');
      this.foldoutPanels = ko.observableArray([]);
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
      // Lee el observable DENTRO del binding → oj-table se re-renderiza al cambiar de listado.
      return this.tableColumns();
    }
    getFoldoutOverview() {
      return this.foldoutOverview();
    }
    getFoldoutPanels() {
      return this.foldoutPanels();
    }

    // Fase 6: selectores de @AppContext de la cabecera (oj-c-select-single por campo).
    getContextSelectors() {
      return this.contextSelectors().map((s) => {
        const fieldName = s.fieldName;
        return {
          fieldName: fieldName,
          label: s.label,
          value: appContext[fieldName] != null ? appContext[fieldName] : null,
          dp: new ArrayDataProvider(
            (s.options || []).map((o) => ({ value: o.value != null ? o.value : o.label, label: o.label || o.value })),
            { keyAttributes: 'value' },
          ),
          onChange: function (e) {
            if (e && e.detail) appContext[fieldName] = e.detail.value;
          },
        };
      });
    }

    // Fase 6: acciones de cabecera aplanadas a hojas clicables (Sync, PDF, Excel).
    getHeaderActions() {
      const out = [];
      this.contextActions().forEach((a) => {
        const kids = a.children || [];
        if (kids.length) kids.forEach((c) => out.push({ actionId: c.actionId, label: a.label + ': ' + c.label }));
        else out.push({ actionId: a.actionId, label: a.label });
      });
      return out;
    }

    // Dispara una acción de cabecera (app-level) y devuelve su mensaje.
    async headerAction(event) {
      const actionId = event && event.currentTarget ? event.currentTarget.getAttribute('data-action-id') : null;
      if (!actionId) return { message: '' };
      const inc = await callMateu('', actionId, APP_SST);
      const msg = (inc.messages || [])[0];
      return { message: msg ? msg.text || msg.title : '' };
    }

    async loadApp() {
      const inc = await callMateu('');
      const appFrag = (inc.fragments || []).find((f) => metaOf(f.component).type === 'App');
      const md = appFrag ? metaOf(appFrag.component) : {};
      // Árbol para el navigator (grupos = tienen children) + lookup plano por ruta.
      this.menuByRoute = {};
      this.groupRoutes = {};
      const self = this;
      const mapItem = (m) => {
        self.menuByRoute[m.route] = {
          route: m.route,
          serverSideType: m.serverSideType,
          consumedRoute: m.consumedRoute,
        };
        const kids = (m.submenus || []).map(mapItem);
        const node = { route: m.route, label: m.caption || m.label, isGroup: kids.length > 0 };
        if (kids.length) {
          node.children = kids;
          self.groupRoutes[m.route] = true; // un grupo expande + navega a su primer hijo
          self.groupChildFirst[m.route] = kids[0].route;
        }
        return node;
      };
      const tree = (md.menu || []).map(mapItem);
      this.navItems(tree);
      // primera ruta navegable = primera hoja (no grupo)
      const firstLeaf = (nodes) => {
        for (let i = 0; i < nodes.length; i++) {
          if (!nodes[i].isGroup) return nodes[i].route;
          const r = firstLeaf(nodes[i].children || []);
          if (r) return r;
        }
        return '';
      };
      // App metadata para la cabecera (Fase 6): selectores de contexto + acciones.
      this.contextSelectors(md.contextSelectors || []);
      this.contextActions(md.contextActions || []);
      return { firstRoute: firstLeaf(tree) };
    }

    async loadRoute(route) {
      // Clic en un GRUPO (submenú): se expande y además navega a su primer hijo (mejor UX que
      // cargar la ruta del grupo, que no tiene contenido).
      if (this.groupRoutes[route]) {
        const first = (this.groupChildFirst || {})[route];
        if (first) route = first;
      }
      const item = this.menuByRoute[route] || {};
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

      // 0) ¿Foldout? (un FoldoutLayout) → overview + paneles oj-sp-foldout.
      const fl = findFoldout(host.tree);
      if (fl) {
        const slots = slotTexts(host.tree);
        this.foldoutOverview(slots.overview || '');
        this.foldoutPanels(
          (fl.panels || []).map((p, i) => ({
            title: p.title,
            subtitle: p.subtitle,
            text: slots['panel-' + i] || '',
          })),
        );
        this.formFields([]);
        return { isFoldout: true, isTable: false, isForm: false, isCrud: false, greeting: '' };
      }

      // A) ¿Listado CRUD? (expone la acción 'search') → columnas GridColumn + search para las filas.
      if (hasActionId(inc, 'search')) {
        this.isCrud = true;
        this.selectedRowIndex = -1;
        this.tableColumns(collectColumns(host.tree).map((c) => ({ headerText: c.label, field: c.id })));
        this.tableRows(await this._search());
        this.formFields([]);
        return { isFoldout: false, isTable: true, isForm: false, isCrud: true, greeting: '' };
      }
      // B) ¿Listado simple? (un FormField-grid) → tabla oj-table.
      const gridNode = findGridField(host.tree);
      if (gridNode) {
        this.isCrud = false;
        const gmeta = metaOf(gridNode);
        this.tableColumns(collectColumns(gridNode).map((c) => ({ headerText: c.label, field: c.id })));
        this.tableRows((state[gmeta.fieldId] || []).slice());
        this.formFields([]);
        return { isFoldout: false, isTable: true, isForm: false, isCrud: false, greeting: '' };
      }
      this.isCrud = false;
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
      this.crudSaveActionId = null; // un form normal (Profile) NO es create/edit de crud
      return {
        isFoldout: false,
        isTable: false,
        isForm: fields.length > 0,
        isCrud: false,
        greeting: firstText(host.tree) || '(sin contenido)',
      };
    }

    // ── Fase 5: New / Edit / Delete ────────────────────────────────────────────────
    onTableSelect(e) {
      const row = e && e.detail && e.detail.value && e.detail.value.row;
      const vals = row && row.values ? Array.from(row.values()) : [];
      this.selectedRowIndex = vals.length ? vals[0] : -1;
    }

    // Carga el form de creación/edición de un crud y prepara formFields (como Fase 3).
    async _loadCrudForm(route, saveActionId) {
      const inc = await callMateu(route, '', this.current.serverSideType, this.current.consumedRoute);
      const host = reduceContexts({ contexts: {}, stack: [], shell: null }, inc).contexts[HOST_ID] || {};
      const fields = collectFields(host.tree);
      const state = host.state || {};
      const self = this;
      this.formData = {};
      fields.forEach((f) => {
        this.formData[f.fieldId] = state[f.fieldId] != null ? state[f.fieldId] : '';
      });
      this.formFields(
        fields.map((f) => ({
          fieldId: f.fieldId,
          label: f.label,
          dataType: f.dataType,
          isNumber: f.dataType === 'integer' || f.dataType === 'number' || f.dataType === 'decimal',
          value: this.formData[f.fieldId],
          onChange: function (e) {
            self.formData[f.fieldId] = e.detail.value;
          },
        })),
      );
      this.crudSaveActionId = saveActionId;
      this.crudFormRoute = route;
    }

    async newForm() {
      await this._loadCrudForm(this.current.route + '/new', 'create');
      return { isForm: true, isTable: false };
    }

    async editSelected() {
      if (this.selectedRowIndex < 0) return { ok: false };
      const row = this.tableRows()[this.selectedRowIndex] || {};
      await this._loadCrudForm(this.current.route + '/' + row.id + '/edit', 'save');
      return { ok: true, isForm: true, isTable: false };
    }

    async deleteSelected() {
      if (this.selectedRowIndex < 0) return { ok: false };
      const row = this.tableRows()[this.selectedRowIndex] || {};
      await callMateu(this.current.route, 'delete', this.current.serverSideType, this.current.consumedRoute, {
        crud_selected_items: [row],
      });
      this.selectedRowIndex = -1;
      this.tableRows(await this._search());
      return { ok: true };
    }

    // Vuelve al listado del crud (refresca las filas).
    async backToList() {
      this.crudSaveActionId = null;
      this.selectedRowIndex = -1;
      this.tableRows(await this._search());
      return { isForm: false, isTable: true };
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
      // Modo CRUD (Fase 5): create/edit → persistir con 'create'|'save' en la ruta del form y
      // VOLVER al listado refrescado. Modo normal (Profile, Fase 3): actionId 'save' y mostrar msg.
      if (this.crudSaveActionId) {
        const inc = await callMateu(
          this.crudFormRoute,
          this.crudSaveActionId,
          this.current.serverSideType,
          this.current.consumedRoute,
          state,
        );
        const msg = (inc.messages || [])[0];
        this.crudSaveActionId = null;
        this.selectedRowIndex = -1;
        this.tableRows(await this._search());
        return { message: msg ? msg.text || msg.title : '', isForm: false, isTable: true };
      }
      const inc = await callMateu(
        this.current.route,
        'save',
        this.current.serverSideType,
        this.current.consumedRoute,
        state,
      );
      const msg = (inc.messages || [])[0];
      return { message: msg ? msg.text || msg.title : 'Guardado', isForm: true, isTable: false };
    }
  }

  return PageModule;
});
