/* Bridge de Mateu-sobre-VB — MODULO DE APLICACION (app-flow).
 * Todo el bridge vive aqui para que el shell (navigator+cabecera) y la pagina de contenido
 * usen los mismos $application.functions / $application.variables. Depende de spectra-shell
 * (chrome Redwood). La navegacion (shell) actualiza app-variables → el contenido re-renderiza.
 */
define([
  'oj-sp/spectra-shell/config/config',
  'ojs/ojdrawerlayout',
  'ojs/ojnavigationlist',
  'ojs/ojtable',
  'oj-c/input-text',
  'oj-c/input-number',
  'oj-c/button',
  'oj-c/select-single',
  'oj-sp/foldout-layout/loader',
  'oj-sp/foldout-panel/loader',
  'oj-sp/guided-process/loader',
  'ojs/ojprogress-bar',
  'ojs/ojarraydataprovider',
  'ojs/ojarraytreedataprovider',
  'ojs/ojhtmlutils',
  'knockout',
], function (_shell, _drawer, _nav, _table, _it, _in, _btn, _sel, _fl, _fp, _gp, _pb, ArrayDataProvider, ArrayTreeDataProvider, HtmlUtils, ko) {
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

  // Acciones-botón (actionId + label, sin fieldId) deduplicadas — para los botones del wizard.
  function collectActions(node, out, seen) {
    out = out || [];
    seen = seen || {};
    if (node && typeof node === 'object') {
      const m = metaOf(node);
      if (node.actionId && (node.label || node.caption) && !node.fieldId && !seen[node.actionId]) {
        seen[node.actionId] = true;
        out.push({ actionId: node.actionId, label: node.label || node.caption });
      }
      Object.keys(node).forEach((k) => {
        const v = node[k];
        if (Array.isArray(v)) v.forEach((x) => collectActions(x, out, seen));
        else if (v && typeof v === 'object') collectActions(v, out, seen);
      });
    }
    return out;
  }

  // Busca el nodo ProgressSteps (Fase 8, wizard); devuelve su metadata o null.
  function findSteps(node) {
    if (!node || typeof node !== 'object') return null;
    const m = metaOf(node);
    if (m.type === 'ProgressSteps') return m;
    const keys = Object.keys(node);
    for (let i = 0; i < keys.length; i++) {
      const v = node[keys[i]];
      if (Array.isArray(v)) {
        for (let j = 0; j < v.length; j++) {
          const r = findSteps(v[j]);
          if (r) return r;
        }
      } else if (v && typeof v === 'object') {
        const r = findSteps(v);
        if (r) return r;
      }
    }
    return null;
  }

  // ── Fase 9: archetypes de página (Welcome / GeneralOverview / ItemOverview) ──────────
  // Cada nodo wire = { type:'ClientSide', metadata:{type,…campos}, children:[…] }. metaOf() da la
  // metadata; los hijos viven en node.children (layouts top-level) o en metadata.content (records
  // anidados como Card.content / VerticalLayout.content). Estos helpers normalizan ambos.

  // Primer descendiente (incl. él mismo) cuyo metadata.type === type.
  function findFirst(node, type) {
    if (!node || typeof node !== 'object') return null;
    if (metaOf(node).type === type) return node;
    const keys = Object.keys(node);
    for (let i = 0; i < keys.length; i++) {
      const v = node[keys[i]];
      if (Array.isArray(v)) {
        for (let j = 0; j < v.length; j++) {
          const r = findFirst(v[j], type);
          if (r) return r;
        }
      } else if (v && typeof v === 'object') {
        const r = findFirst(v, type);
        if (r) return r;
      }
    }
    return null;
  }

  // Hijos directos de un nodo: node.children, o metadata.content si es lista.
  function kidsOf(node) {
    const md = metaOf(node);
    if (node && Array.isArray(node.children) && node.children.length) return node.children;
    if (Array.isArray(md.content)) return md.content;
    return [];
  }

  // Descriptor de contenido para el template (bounded): text / markdown / statusList / stack.
  function contentDescriptor(x) {
    if (!x) return { kind: 'text', text: '' };
    const md = metaOf(x);
    switch (md.type) {
      case 'Text':
        return { kind: 'text', text: md.text || '' };
      case 'Markdown':
        return { kind: 'markdown', dom: htmlDom(mdToHtml(md.markdown || md.text || '')) };
      case 'StatusList':
        return {
          kind: 'statusList',
          items: (md.items || []).map((i) => ({ title: i.title, status: i.status, color: i.statusColor })),
        };
      case 'VerticalLayout':
      case 'HorizontalLayout':
        return { kind: 'stack', items: kidsOf(x).map(contentDescriptor) };
      default:
        return { kind: 'text', text: md.text || '' };
    }
  }

  // Markdown → HTML mínimo (headings, bold/italic, listas, tablas, párrafos). Se inyecta con
  // oj-bind-dom (HtmlUtils.stringToNodeArray) — el modo OJET nativo para HTML dinámico.
  function mdToHtml(md) {
    if (!md) return '';
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const inline = (s) =>
      esc(s)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');
    const lines = String(md).split('\n');
    const H = ['', 'lg', 'md', 'sm', 'xs'];
    let html = '';
    let i = 0;
    while (i < lines.length) {
      const l = lines[i];
      if (/^\s*\|.*\|\s*$/.test(l) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
        const cells = (x) => x.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        const head = cells(l);
        i += 2;
        let body = '';
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
          body += '<tr>' + cells(lines[i]).map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>';
          i++;
        }
        html +=
          '<table class="oj-table oj-table-data-cell-no-padding" style="width:auto"><thead><tr>' +
          head.map((c) => '<th style="text-align:left;padding-right:1.5rem">' + inline(c) + '</th>').join('') +
          '</tr></thead><tbody>' +
          body +
          '</tbody></table>';
        continue;
      }
      const hm = l.match(/^(#{1,4})\s+(.*)/);
      if (hm) {
        const lv = hm[1].length;
        html += '<h' + lv + ' class="oj-typography-heading-' + H[lv] + '">' + inline(hm[2]) + '</h' + lv + '>';
        i++;
        continue;
      }
      if (/^\s*[-*]\s+/.test(l)) {
        let items = '';
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
          items += '<li>' + inline(lines[i].replace(/^\s*[-*]\s+/, '')) + '</li>';
          i++;
        }
        html += '<ul>' + items + '</ul>';
        continue;
      }
      if (!l.trim()) {
        i++;
        continue;
      }
      html += '<p style="margin:0.25rem 0">' + inline(l) + '</p>';
      i++;
    }
    return html;
  }

  // Config para <oj-bind-dom> a partir de un string HTML.
  function htmlDom(html) {
    return { view: HtmlUtils.stringToNodeArray('<div>' + (html || '') + '</div>'), data: {} };
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

  class AppModule {
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
      // Wizard (Fase 8): estado del proceso guiado (oj-sp-guided-process).
      this.wizardPosition = ko.observable(0);
      this.wizardTotal = ko.observable(0);
      this.wizardSteps = ko.observableArray([]); // [{id,title,status}] para el rail del guided-process
      this.wizardAdvanceId = 'next'; // acción del botón primario (next/completar)
      this.wizardAdvanceLabel = ko.observable('Siguiente');
      // El guided-process tiene una pantalla de OVERVIEW inicial (currentStep="" → botón Start +
      // resumen de pasos). Se muestra al entrar y al cancelar; empezar/cancelar es CLIENTE (no Mateu).
      this.wizardOverview = ko.observable(true);
      // El paso RESULTADO de Mateu (recap read-only) NO viene en el rail y no trae botones de
      // navegación; al detectarlo activamos completion-status='on' → panel de completación NATIVO
      // del oj-sp-guided-process (slot completionStep con el recap).
      this.wizardResult = ko.observable(false);
      this.wizardMenuRoute = '';
      // Fase 9: modelos de los archetypes de página (null = no activo → su rama no se pinta).
      this.welcomeModel = ko.observable(null);
      this.generalOverviewModel = ko.observable(null);
      this.itemOverviewModel = ko.observable(null);
      this.itemTab = ko.observable(0); // pestaña seleccionada del ItemOverview (cliente)
    }

    getNavData() {
      return this.navDP;
    }
    // ── oj-sp-guided-process (Fase 8) ──────────────────────────────────────────────
    getGuidedSteps() {
      return this.wizardSteps();
    }
    getGuidedCurrent() {
      // "" → pantalla de overview inicial; si no, el paso actual.
      return this.wizardOverview() ? '' : String(this.wizardPosition());
    }
    getGuidedPrimary() {
      // Debe ser SIEMPRE un objeto válido: el oj-sp-guided-process lee primary-action.progressState
      // y un null lo hace petar.
      return { label: this.wizardAdvanceLabel(), progressState: 'off' };
    }
    // completion-status del oj-sp-guided-process: 'on' en el paso RESULTADO de Mateu → el componente
    // pinta su PANEL DE COMPLETACIÓN nativo (slot completionStep con el recap). 'off' el resto.
    getGuidedCompletion() {
      return this.wizardResult() ? 'on' : 'off';
    }
    // ── Fase 9: archetypes de página ───────────────────────────────────────────────
    isWelcome() {
      return !!this.welcomeModel();
    }
    getWelcome() {
      return this.welcomeModel() || {};
    }
    isGeneralOverview() {
      return !!this.generalOverviewModel();
    }
    getGeneralOverview() {
      return this.generalOverviewModel() || {};
    }
    isItemOverview() {
      return !!this.itemOverviewModel();
    }
    getItemOverview() {
      return this.itemOverviewModel() || { tabs: [] };
    }
    getItemTab() {
      return this.itemTab();
    }
    // Welcome: un CTA → dispatch de su actionId; su Message se muestra como toast (messageToast).
    async welcomeAction(event) {
      const el = event && event.currentTarget;
      const actionId = el && el.getAttribute('data-action-id');
      if (!actionId) return { message: '' };
      const inc = await callMateu(
        this.current.route,
        actionId,
        this.current.serverSideType,
        this.current.consumedRoute,
        {},
      );
      const msg = (inc.messages || [])[0];
      return { message: msg ? msg.text || msg.title : '' };
    }
    // GeneralOverview: cambiar el registro del switcher → acción switchRecord con el nuevo record;
    // se reconstruye el overview en sitio (mismo patrón que _wizardStep).
    async switchRecord(event) {
      const value = event && event.detail && event.detail.value;
      if (value == null || value === this.goValue) return;
      const inc = await callMateu(
        this.current.route,
        'switchRecord',
        this.current.serverSideType,
        this.current.consumedRoute,
        { record: value, _overview: {} },
      );
      const host = reduceContexts({ contexts: {}, stack: [], shell: null }, inc).contexts[HOST_ID] || {};
      this._buildGeneralOverview(host);
    }
    // ItemOverview: seleccionar pestaña (cliente, sin ida al server — todo el contenido ya está).
    selectItemTab(event) {
      const el = event && event.currentTarget;
      const idx = el && el.getAttribute('data-tab-index');
      if (idx != null) this.itemTab(Number(idx));
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
      this.firstRoute = firstLeaf(tree);
      return { firstRoute: this.firstRoute };
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
      // Fase 9: limpiar los modelos de archetype (una nueva navegación redefine el que aplique).
      this.welcomeModel(null);
      this.generalOverviewModel(null);
      this.itemOverviewModel(null);

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
        return { isWizard: false, isFoldout: true, isTable: false, isForm: false, isCrud: false, greeting: '' };
      }

      // A) ¿Listado CRUD? (expone la acción 'search') → columnas GridColumn + search para las filas.
      if (hasActionId(inc, 'search')) {
        this.isCrud = true;
        this.selectedRowIndex = -1;
        this.tableColumns(collectColumns(host.tree).map((c) => ({ headerText: c.label, field: c.id })));
        this.tableRows(await this._search());
        this.formFields([]);
        return { isWizard: false, isFoldout: false, isTable: true, isForm: false, isCrud: true, greeting: '' };
      }
      // B) ¿Listado simple? (un FormField-grid) → tabla oj-table.
      const gridNode = findGridField(host.tree);
      if (gridNode) {
        this.isCrud = false;
        const gmeta = metaOf(gridNode);
        this.tableColumns(collectColumns(gridNode).map((c) => ({ headerText: c.label, field: c.id })));
        this.tableRows((state[gmeta.fieldId] || []).slice());
        this.formFields([]);
        return { isWizard: false, isFoldout: false, isTable: true, isForm: false, isCrud: false, greeting: '' };
      }
      this.isCrud = false;
      // W) ¿Wizard? (proceso guiado: hay ProgressSteps) → overview inicial + pasos.
      if (findSteps(host.tree)) {
        this.wizardMenuRoute = route;
        this.wizardOverview(true); // entrar al wizard = mostrar la pantalla de overview (Start)
        this._applyWizard(host);
        this.crudSaveActionId = null;
        return { isWizard: true, isFoldout: false, isTable: false, isForm: false, isCrud: false, greeting: '' };
      }
      const ARCH = { isWizard: false, isFoldout: false, isTable: false, isForm: false, isCrud: false, greeting: '' };
      // W2) Welcome archetype (HeroSection + DashboardLayout) → hero con CTAs + tiles.
      if (findFirst(host.tree, 'HeroSection') && findFirst(host.tree, 'DashboardLayout')) {
        this._buildWelcome(host);
        return ARCH;
      }
      // W3) ItemOverview archetype (TabLayout) → key-info + pestañas.
      if (findFirst(host.tree, 'TabLayout')) {
        this._buildItemOverview(host);
        return ARCH;
      }
      // W4) GeneralOverview archetype (EntityHeader) → switcher + cabecera + cards.
      if (findFirst(host.tree, 'EntityHeader')) {
        this._buildGeneralOverview(host);
        return ARCH;
      }
      // C) ¿Formulario? (FormFields) → inputs oj-c-*.
      const fields = this._buildFormFields(host, state);
      this.crudSaveActionId = null; // un form normal (Profile) NO es create/edit de crud
      return {
        isWizard: false,
        isFoldout: false,
        isTable: false,
        isForm: fields.length > 0,
        isCrud: false,
        greeting: firstText(host.tree) || '(sin contenido)',
      };
    }

    // Construye formFields (+ formData) desde el árbol; devuelve la lista de campos.
    _buildFormFields(host, state) {
      state = state || host.state || {};
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
      return fields;
    }

    // ── Fase 9: builders de los archetypes de página ───────────────────────────────
    // Welcome: HeroSection (title/subtitle + Buttons) + DashboardLayout (DashboardPanel → Text).
    _buildWelcome(host) {
      const hero = findFirst(host.tree, 'HeroSection');
      const dash = findFirst(host.tree, 'DashboardLayout');
      const hm = metaOf(hero || {});
      const buttons = (hero ? kidsOf(hero) : [])
        .filter((c) => metaOf(c).type === 'Button')
        .map((c) => {
          const b = metaOf(c);
          return { label: b.label, actionId: b.actionId, primary: b.buttonStyle === 'primary' };
        });
      const tiles = (dash ? kidsOf(dash) : [])
        .filter((c) => metaOf(c).type === 'DashboardPanel')
        .map((c) => {
          const t = findFirst(c, 'Text');
          return { title: metaOf(c).title || '', text: t ? metaOf(t).text : '' };
        });
      this.welcomeModel({ heroTitle: hm.title || '', heroSubtitle: hm.subtitle || '', buttons: buttons, tiles: tiles });
    }

    // GeneralOverview: switcher (FormField select 'record') + EntityHeader + Cards (StatusList /
    // VerticalLayout de Text). Card.title/content anidan en metadata (no en children).
    _buildGeneralOverview(host) {
      const sw = collectFields(host.tree).filter((f) => f.fieldId === 'record')[0];
      const swField = findFirst(host.tree, 'FormField');
      const options = (metaOf(swField || {}).options || []).map((o) => ({ value: o.value, label: o.label }));
      this.goValue = (host.state || {}).record || (options[0] && options[0].value) || '';
      // oj-badge sólo entiende success/warning/danger/info/neutral → mapeamos los colores de Chip.
      const badgeColor = (c) =>
        c === 'success' || c === 'warning' || c === 'danger' || c === 'info' ? c : 'neutral';
      const eh = findFirst(host.tree, 'EntityHeader');
      const h = metaOf(eh || {});
      const header = {
        title: h.title || '',
        subtitle: h.subtitle || '',
        badges: (h.badges || []).map((b) => ({ label: b.label, color: badgeColor(b.color) })),
        facts: (h.facts || []).map((f) => ({ label: f.label, value: f.value })),
        metricLabel: h.metricLabel || '',
        metricValue: h.metricValue || '',
      };
      // Cards de propiedades: la Card RAÍZ del overview es un wrapper (title=null, content=Div); las
      // cards reales (Líneas/Datos) van ANIDADAS en metadata.content. Descendemos por children Y por
      // content (record único o lista) y coleccionamos sólo las Card CON título.
      const cards = [];
      const descend = (x, fn) => {
        if (!x || typeof x !== 'object') return;
        const md = metaOf(x);
        if (Array.isArray(x.children)) x.children.forEach(fn);
        if (Array.isArray(md.content)) md.content.forEach(fn);
        else if (md.content && typeof md.content === 'object') fn(md.content);
      };
      (function collect(node) {
        if (!node || typeof node !== 'object') return;
        const c = metaOf(node);
        if (c.type === 'Card' && c.title) {
          cards.push({
            title: metaOf(c.title).text || '',
            content: c.content ? contentDescriptor(c.content) : null,
          });
          return; // card real → no descendemos más
        }
        descend(node, collect);
      })(host.tree);
      const dp = new ArrayDataProvider(options, { keyAttributes: 'value' });
      this.generalOverviewModel({ switcher: { options: options, value: this.goValue, dp: dp }, header: header, cards: cards });
    }

    // ItemOverview: Card key-info (metadata.content = Markdown) + TabLayout (Tab → Markdown).
    _buildItemOverview(host) {
      const keyCard = findFirst(host.tree, 'Card');
      const keyContent = keyCard ? metaOf(keyCard).content : null;
      const keyDom = keyContent ? contentDescriptor(keyContent) : { kind: 'text', text: '' };
      const tl = findFirst(host.tree, 'TabLayout');
      const tabs = (tl ? kidsOf(tl) : [])
        .filter((c) => metaOf(c).type === 'Tab')
        .map((c) => {
          const inner = kidsOf(c)[0] || (metaOf(c).content ? { metadata: metaOf(c).content } : null);
          return { label: metaOf(c).label || metaOf(c).caption || '', content: contentDescriptor(inner) };
        });
      this.itemTab(0);
      this.itemOverviewModel({ keyContent: keyDom, tabs: tabs });
    }

    // Prepara la vista de un paso del wizard: campos + progreso + los botones reales del wire.
    // Guarda el ESTADO ACUMULADO (el wizard acumula los datos de todos los pasos en initialData);
    // cada next/back/completar debe reenviar ese estado + las ediciones del paso actual.
    _applyWizard(host) {
      this.wizardState = host.state || {};
      this._buildFormFields(host, this.wizardState);
      const ps = findSteps(host.tree);
      const steps = (ps && ps.steps) || [];
      const pos = steps.filter((s) => s.status === 'done' || s.done).length;
      // Botón primario = la acción que NO es 'back' (next/completar…).
      const actions = collectActions(host.tree);
      const advance = actions.filter((a) => a.actionId !== 'back')[0];
      // RESULTADO: todos los pasos del rail hechos Y sin acción de avance → recap read-only de Mateu.
      // (El paso resultado NO está en el rail; _wizardStep sale del guided-process y lo muestra aparte.)
      const isResult = steps.length > 0 && pos >= steps.length && !advance;
      this.wizardResult(isResult);
      // Rail del oj-sp-guided-process: id/title/status ('success' hecho / 'none'). El paso ACTUAL lo
      // marca la propiedad current-step, no el status.
      this.wizardTotal(steps.length);
      this.wizardPosition(pos);
      this.wizardSteps(
        steps.map((s, i) => ({
          id: String(i),
          title: s.label || s.title || 'Paso ' + (i + 1),
          status: i < pos ? 'success' : 'none',
        })),
      );
      this.wizardAdvanceId = advance ? advance.actionId : 'next';
      this.wizardAdvanceLabel(advance ? advance.label : 'Siguiente');
    }

    // Botón primario del guided-process → avanza (next/completar).
    async guidedPrimary() {
      return this._wizardStep(this.wizardAdvanceId);
    }
    // spBeforeStepNavigate: el guided-process pide ir a otro paso. Dirección por currentStep/nextStep:
    // adelante → la acción de avance del wire (next/completar); atrás → 'back'.
    async guidedStepChange(event) {
      // En el resultado (panel de completación) no hay navegación de pasos: ignorar clics del rail.
      if (this.wizardResult()) return { isWizard: true, isForm: false, isFoldout: false, isTable: false, greeting: '' };
      const d = (event && event.detail) || {};
      const cur = parseInt(d.currentStep, 10); // NaN si venimos del overview ("")
      const nxt = parseInt(d.nextStep, 10);
      // Desde el OVERVIEW → Start: mostrar el paso actual, SIN llamar a Mateu (ya estamos en él).
      if (isNaN(cur)) {
        this.wizardOverview(false);
        return { isWizard: true, isForm: false, isFoldout: false, isTable: false, greeting: '' };
      }
      if (!isNaN(nxt) && nxt < cur) return this._wizardStep('back');
      return this._wizardStep(this.wizardAdvanceId);
    }
    // Cancelar → recrear el guided-process en su OVERVIEW. El componente, una vez iniciado, no vuelve
    // al overview con current-step="" solo; la chain lo DESMONTA (isWizard=false) antes de esta llamada
    // async (el await deja al DOM quitarlo) y aquí recargamos el wizard desde el paso 1 con overview=true;
    // al re-mostrarlo (isWizard=true) el componente se crea de cero → overview.
    async guidedCancel() {
      const r = await this.loadRoute(this.wizardMenuRoute || this.firstRoute || '');
      this.wizardOverview(true);
      return r;
    }

    // Fase 8: navega el wizard con un actionId (next/back/completar…). Reenvía estado + ediciones.
    async _wizardStep(actionId) {
      if (!actionId) return { isWizard: true };
      // Estado acumulado (todos los pasos) + ediciones del paso actual leídas del DOM.
      const state = Object.assign({}, this.wizardState || {});
      const els = document.querySelectorAll('[data-field]');
      for (let i = 0; i < els.length; i++) state[els[i].getAttribute('data-field')] = els[i].value;
      const inc = await callMateu(
        this.current.route,
        actionId,
        this.current.serverSideType,
        this.current.consumedRoute,
        state,
      );
      const host = reduceContexts({ contexts: {}, stack: [], shell: null }, inc).contexts[HOST_ID] || {};
      // ¿Sigue siendo wizard (hay ProgressSteps)? → paso siguiente/resultado; si no, texto/form.
      if (findSteps(host.tree)) {
        this._applyWizard(host);
        // Paso siguiente O paso RESULTADO: en ambos seguimos en el guided-process. El resultado
        // (wizardResult) lo pinta el PANEL DE COMPLETACIÓN nativo (completion-status='on' + slot
        // completionStep), reactivo vía getGuidedCompletion(); no salimos del componente.
        return { isWizard: true, isForm: false, isFoldout: false, isTable: false, greeting: '' };
      }
      const nfields = this._buildFormFields(host, host.state || {});
      return {
        isWizard: false,
        isForm: nfields.length > 0,
        isFoldout: false,
        isTable: false,
        greeting: firstText(host.tree) || '',
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

  return AppModule;
});
