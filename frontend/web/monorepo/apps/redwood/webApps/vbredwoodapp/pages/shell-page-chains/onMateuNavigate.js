/* Navegación (Fases 2–6): un GRUPO del menú no toca el server (pinta su landing de submenú
 * en el contenido); una ruta normal carga en el host (mediador + triggers OnLoad incluidos)
 * y proyecta título/texto/form/listado. El @AppContext viaja como appState en cada request.
 * force=true (cambio de contexto) recarga aunque la ruta no cambie. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  Actions,
  bridge,
) => {
  'use strict';

  /**
   * La URL refleja la ruta — path (/ruta) servida por el backend Mateu, hash (#/ruta) en serving
   * estático (el modo lo fija loadMateuShell en el bootstrap). Sólo empuja si cambia.
   */
  function pushRouteToUrl($application, route) {
    // embedded in a host VB page (<mateu-ui>): the URL is the HOST's — never touched
    if (bridge.isEmbedded()) {
      return;
    }
    if (window.__mateuUrlPathMode) {
      // la home (incluido el sentinel _no_home_route del server) es '/', no un path
      const home = $application.variables.mateuHomeRoute || '';
      // la ruta puede traer ?query (la vista de un listado): la URL la conserva, para que
      // atrás/adelante vuelvan con sus filtros — o sin ninguno
      const target = bridge.urlOfRoute((!route || route === home) ? '' : route);
      if (window.location.pathname + (window.location.search || '') !== target) {
        window.history.pushState(null, '', target);
      }
    } else if (window.location.hash !== '#' + route) {
      window.history.pushState(null, '', '#' + route);
    }
  }

  // La navegación en curso: si arranca otra antes de que acabe ésta, es la última la que
  // apaga mateuNavigating, no la primera en terminar.
  let navigationSeq = 0;

  class onMateuNavigate extends ActionChain {

    /**
     * Envuelve la navegación para que mateuNavigating se apague siempre, también cuando la carga
     * falla o se corta a medias: una pantalla vieja oculta para siempre sería peor que el fallo.
     */
    async run(context, params) {
      const { $application } = context;
      const seq = ++navigationSeq;
      try {
        return await this.navigate(context, params || {}, () => {
          $application.variables.mateuNavigating = true;
        });
      } catch (e) {
        // una respuesta que llegó cuando ya se había navegado a otra pantalla: muere en silencio
        // (el transporte la descartó: ni se pinta ni pone banda de error)
        if (bridge.isStaleResponse(e)) return undefined;
        throw e;
      } finally {
        if (seq === navigationSeq) {
          $application.variables.mateuNavigating = false;
        }
      }
    }

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  spSelectionChanged ({currentId}) o mateuNavigate ({route})
     * @param {boolean} params.force recargar aunque sea la misma ruta (cambio de contexto)
     * @param {Function} startsLoading se llama cuando de verdad va a cargarse otra pantalla —
     *     pasados el eco del writeback y la confirmación de cambios sin guardar
     */
    async navigate(context, { event, force, fromUrl }, startsLoading) {
      const { $application, $page } = context;

      const detail = (event && (event.detail || event)) || {};
      let route = detail.currentId != null ? detail.currentId
        : detail.selectedValue != null ? detail.selectedValue
        : detail.value != null ? detail.value : detail.route;
      if (route == null || route === '') {
        return;
      }
      // A menu leaf that RUNS rules (RuleLink) instead of naming a route: every menu surface
      // (subheader, drawer, topbar, cards) lands here, so this is the one place it is handled.
      if (bridge.isMenuRuleId(route)) {
        await Actions.callChain(context, { chain: 'runMateuMenuRules', params: { ruleId: route } });
        return;
      }
      // Cualquier fallo de transporte durante esta navegación deja registrado un reintento
      // que la repite entera (la banda de error lo ofrece).
      const registerRetry = () => bridge.setLastRetry({ kind: 'navigate', route });
      // ?campo=valor en la ruta (p.ej. /reservas?vista=LLEGADAS_HOY, los KPIs de la
      // home): el filtro rápido viaja en la URL — se consume aquí como filtro
      // PENDIENTE (misma mecánica que el Ask Oracle) y la ruta queda limpia
      // Todos los parámetros, no sólo el primero; y también en un deep-link (la URL con que se
      // abre la consola: el aviso de la bandeja lleva a /mapping/dictionary?integration=MRU01).
      // La ruta COMPLETA (con su query) es la que identifica la navegación: la entrada del menú
      // «Llegadas» es /reservas?vista=LLEGADAS_HOY y «Reservas» es /reservas — la misma pantalla
      // con OTROS filtros. Comparando sólo el path, ir de una a otra parecía el eco del writeback
      // de la selección y no recargaba: el chip de la vista anterior se quedaba puesto.
      // ¿Es la pantalla que ya hay? Para el eco del writeback de la selección del menú se compara
      // con la entrada seleccionada; para una navegación PEDIDA (el chat, un enlace, un widget:
      // detail.route) con lo que de verdad está cargado — ruta y filtros que hay ahora, que el
      // usuario puede haber cambiado quitando chips. Si no, el agente que vuelve a pedir
      // «/booking/bookings?status=Cancelled» tras quitar el chip no conseguía nada.
      const requested = detail.currentId == null && detail.selectedValue == null && detail.value == null;
      const current = (requested && window.__mateuLoadedFull != null)
        ? window.__mateuLoadedFull
        : ($application.variables.mateuSelectedNavId || $application.variables.mateuSelectedRoute);
      const target = bridge.navTargetOf(route, current);
      route = target.route;
      // el texto libre (?searchText= o ?q=) va al buscador como chip keyword, no como filtro
      const fromQuery = bridge.splitListingQuery(target.filters);
      let pendingSearchText = null;
      if (Object.keys(fromQuery.values).length || fromQuery.searchText) {
        $application.variables.mateuFilterValues = fromQuery.values;
        $application.variables.mateuFiltersPending = true;
        pendingSearchText = fromQuery.searchText;
      }
      // el eco del writeback de selection tras cada navegación — no recargar
      if (!force && target.same) {
        return;
      }
      // dirtyGuard (1.5): edición local sin guardar → confirmar; al cancelar, restaurar la URL
      if (!force && $application.variables.mateuDirty) {
        if (!window.confirm(bridge.chromeText('unsavedLeave'))) {
          const previous = $application.variables.mateuSelectedRoute;
          if (previous) {
            window.history.replaceState(null, '', bridge.urlOfRoute(previous));
          }
          return;
        }
        $application.variables.mateuDirty = false;
      }

      // La URL cambia AL EMPEZAR la navegación, no al terminar de cargar: es lo que hace un
      // navegador con un enlace. Empujándola al final, un "atrás" pulsado mientras la pantalla
      // carga no encontraba la entrada del destino y se saltaba la de origen (del detalle de una
      // reserva volvía a la home, no al listado); y mientras cargaba, la dirección seguía siendo
      // la de la pantalla anterior. La de abajo, al final, compara antes de empujar: no duplica.
      if (!fromUrl) {
        pushRouteToUrl($application, target.full);
      }
      startsLoading();
      // Otra pantalla: lo que siga en vuelo de la anterior (su búsqueda, una acción, una
      // navegación más lenta que ésta) ya no se pinta cuando conteste (resilience.beginView).
      const view = bridge.beginView();

      const base = bridge.mateuBase($application.constants.mateuBaseUrl);
      const appState = $application.variables.mateuAppState || {};
      // Una entrada traída de otro pod SOLO se puede cargar llamando a ese pod. El bridge
      // registró a dónde va cada una al expandir el menú; sin esta consulta la petición saldría
      // al base de la shell, que no conoce esa ruta, y la pantalla quedaría vacía.
      const remote = bridge.remoteRouteOf(route);
      const callBase = (remote && remote.baseUrl) ? remote.baseUrl : base;
      const extra = remote
        ? { appState, consumedRoute: remote.consumedRoute, serverSideType: remote.serverSideType }
        // the state an embedding host seeds its first screen with (<mateu-ui initial-state>): {} otherwise
        : { appState, ...bridge.takeEmbeddedSeed() };
      let reg;
      try {
        // una ruta del MENÚ local es del app que lo declara: se carga con su serverSideType (sin
        // él el servidor contesta «Not found.»), y un RouteLink de grupo cae a su ruta terminal
        reg = remote
          ? await bridge.loadRouteInto(callBase, $application.variables.mateuRegistry, route, '', extra)
          : await bridge.loadMenuRouteInto(callBase, $application.variables.mateuRegistry, route, '', extra);
        // la carga reduce dentro del transporte: aquí se aplican sus efectos de DOM y se fija el
        // contexto de las reglas del cliente (sin esto, una pantalla recién abierta no las tenía)
        bridge.applyDomEffects(null, reg);
      } catch (e) {
        // superada por otra navegación mientras cargaba: nada que reintentar ni que pintar
        if (bridge.isStaleResponse(e)) return;
        // La banda de error ya la puso el transporte (onSettle); aquí sólo se deja el
        // reintento a mano, y se corta: sin registro no hay nada que proyectar.
        registerRetry();
        return;
      }

      // pantalla nueva: arma su refresco periódico (los OnLoad con espera) y olvida el anterior —
      // ANTES de sus OnLoad inmediatos: si no, el éxito del primer 'search' de un listado se
      // comparaba con la pantalla ANTERIOR y su OnSuccess (el bucle de refresco) nunca arrancaba
      bridge.startPolling(reg.contexts[bridge.HOST_ID]);

      // triggers OnLoad del host (p.ej. el listing pide 'search' al cargar → llegan las filas)
      const loaded = reg.contexts[bridge.HOST_ID];
      // una vista rápida del Ask Oracle deja el filtro PENDIENTE: la búsqueda OnLoad
      // aterriza ya filtrada (y el chip aparece aplicado)
      const quickNav = $application.variables.mateuFiltersPending
        ? ($application.variables.mateuFilterValues || {}) : {};
      for (const triggerActionId of bridge.onLoadTriggers(loaded)) {
        const listing = bridge.listingOf(loaded);
        const componentState = Object.assign(
          {}, loaded.state, { page: 0, size: (listing && listing.pageSize) || 20 });
        for (const key of Object.keys(quickNav)) {
          componentState[key] = quickNav[key];
        }
        if (pendingSearchText) componentState.searchText = pendingSearchText;
        const increment = await bridge.runMateuAction(
          callBase, loaded, route, triggerActionId, componentState, { appState });
        reg = bridge.reduceContexts(reg, increment);
        bridge.applyDomEffects(reg.effects, reg);
      }


      // El chat de IA autoró una pantalla: se corre renderScreen con el YAML sobre el host recién
      // cargado — igual que un trigger OnLoad — y la proyección de más abajo la pinta. Es lo que
      // permite que "abrir el chat → pedir la pantalla → aparece" funcione desde la shell.
      if (detail.renderYaml) {
        const rh = reg.contexts[bridge.HOST_ID];
        const inc = await bridge.runMateuAction(
          callBase, rh, route, 'renderScreen', (rh && rh.state) || {},
          { parameters: { yaml: detail.renderYaml }, appState });
        reg = bridge.reduceContexts(reg, inc);
        bridge.applyDomEffects(reg.effects, reg);
      }

      // islas embebidas: cada frontera ServerSide del host se carga como superficie
      // propia (initiator = id de la frontera → sus fragments van a SU contexto)
      let hostForIslands = reg.contexts[bridge.HOST_ID];
      const islands = hostForIslands ? bridge.collectIslands(hostForIslands.tree) : [];
      const firstIsland = islands.length ? islands[0] : null;
      if (firstIsland) {
        // SIN atajo: el baile de 2 pasos captura las ACTIONS del wrapper (flag sse)
        reg = await bridge.loadRouteInto(callBase, reg, firstIsland.route, firstIsland.id, {
          appState,
          componentState: firstIsland.initialData || {},
        });
      }
      $application.variables.mateuIslandId = firstIsland ? firstIsland.id : '';
      $application.variables.mateuIslandSeed = firstIsland
        ? JSON.stringify(firstIsland.initialData || {}) : '';

      // las opciones de los lookups remotos: los del formulario (un alta los traía vacíos,
      // como texto) y los filtros @Lookup del listado (su editor salía sin opciones)
      try {
        reg = await bridge.loadLookups(callBase, reg, bridge.HOST_ID, { appState, route });
      } catch (ignored) { /* sin opciones se quedan como estaban: el campo sigue editable */ }

      // Una navegación más nueva empezó mientras ésta cargaba: lo cargado aquí no se pinta.
      if (bridge.currentView() !== view) return;

      $application.variables.mateuRegistry = reg;
      // P1: los niveles de app (el maestro de un registro con pestañas que son páginas)
      $application.variables.mateuAppLevels = reg.appLevels || [];
      // un maestro pedido a secas (/customers/4) abrió su pestaña por defecto: la pantalla ES esa
      // pestaña (/customers/4/orders) — la URL la nombra y el resto de la proyección la usa
      if (reg.loadedRoute && reg.loadedRoute !== route && reg.loadedRoute.startsWith(route + '/')) {
        // la URL se queda en la del maestro (como en Vaadin): reescribirla con replaceState hacía
        // que el router de VB re-creara la página y los atrás/adelante siguientes no hicieran nada
        route = reg.loadedRoute;
      }
      $application.variables.mateuSelectedRoute = route;
      // la selección del menú lleva la ruta COMPLETA (las entradas con ?query son otras)
      $application.variables.mateuSelectedNavId = target.full;
      // lo que hay cargado AHORA (ruta + filtros): contra esto se compara la siguiente navegación
      // pedida, y es lo que la URL debe decir
      window.__mateuLoadedFull = target.full;
      // un deep-link con filtros (/booking/bookings?status=Cancelled): el router de VB quita la
      // query de la URL al arrancar; se repone, para que la dirección diga lo que se ve (y una
      // recarga o un enlace copiado lo conserven). Sólo la query: el path es el mismo.
      if (fromUrl && window.__mateuUrlPathMode && target.full.indexOf('?') >= 0
          && bridge.currentRoutePathOf(window.location) === target.route
          && bridge.currentRouteOf(window.location) !== target.full) {
        window.history.replaceState(window.history.state, '', bridge.urlOfRoute(target.full));
      }

      const host = reg.contexts[bridge.HOST_ID];
      const listingSummary = bridge.listingOf(host);
      $application.variables.mateuListing = listingSummary;
      $application.variables.mateuListingRows = listingSummary ? listingSummary.rows : [];
      // VISTA POR DEFECTO (★ en el menú de vistas): un listado que se abre sin filtros en la URL
      // se abre con ella — vía la misma ruta con su query, el camino de los filtros por URL
      if (listingSummary && String(route).indexOf('?') < 0) {
        const preferred = bridge.defaultView(bridge.listingScope());
        if (preferred) {
          await Actions.fireEvent(context, {
            name: 'application:mateuNavigate',
            payload: { route: bridge.viewRouteOf(bridge.listingScope(), preferred.values), force: true },
          });
          return;
        }
      }
      // otra pantalla, otra tabla: la selección de la anterior no se hereda
      $application.variables.mateuListingSelection = { all: false, keys: [], except: [] };
      // ni el orden que se pidió en su cabecera (la carga ya llegó sin él, en la primera página)
      $application.variables.mateuListingSort = [];

      // mismo remontaje que en runMateuAction: si venimos de OTRO foldout, recrear el
      // subárbol para que los bindings internos no se queden con los bloques viejos
      const foldoutProjection = bridge.foldoutOf(host);
      if ($application.variables.mateuFoldout && foldoutProjection) {
        $application.variables.mateuFoldout = null;
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      // el CONTENIDO se siembra ANTES de estampar la estructura: los paneles leen
      // mateuFoldoutContent.panels[i] al montarse
      $application.variables.mateuFoldoutContent = foldoutProjection
        ? { overview: foldoutProjection.overview, panels: foldoutProjection.panels }
        : { overview: { blocks: [] }, panels: [] };
      $application.variables.mateuFoldout = foldoutProjection;
      // Lo que ESTA chain acaba de asignar se lee de las constantes, no de vuelta de la variable:
      // una variable `any` de VB que tenía un objeto y se pone a null (o a cualquier falsy) se lee
      // DENTRO de la misma chain como un proxy truthy sobre el valor primitivo (los bindings sí ven
      // el null). Del detalle de una reserva (foldout) al recorrido, `!mateuFoldout` seguía false
      // y el contenido del host no se proyectaba: la pantalla quedaba con su cabecera y en blanco.
      const foldoutNow = foldoutProjection;
      // los Element de sus paneles (HTML del servidor, componentes web) se montan a mano
      // (mismo motivo que los del host: VB no sabe pintar una etiqueta arbitraria)
      bridge.mountElementsSoon(bridge.foldoutElementAtomsOf($application.variables.mateuFoldoutContent), 60);
      $application.variables.mateuSelectPlaceholder = bridge.selectPlaceholder(
        document.documentElement.lang || navigator.language);
      const wizardProjection = bridge.wizardOf(host);
      $application.variables.mateuWizard = wizardProjection;
      // el guided process no avanza por su cuenta: el paso lo decide Mateu (ver el bridge)
      if (wizardProjection) bridge.guardGuidedProcess();
      // the page projection (poc/pageProjection.mjs, tested): what to assign from the registry
      const vars = $application.variables;
      const assign = (values) => { for (const key of Object.keys(values)) vars[key] = values[key]; };
      const islandContext = firstIsland ? reg.contexts[firstIsland.id] : null;
      // isla ANIDADA dentro de la isla (App con initialData sembrado, p.ej. el documento):
      // cargar con el initialData como componentState; RECARGAR si el seed cambió (selectPax)
      const nestedList = islandContext ? bridge.collectIslands(islandContext.tree) : [];
      const nestedInfo = nestedList.length ? nestedList[0] : null;
      const nestedSeed = nestedInfo ? JSON.stringify(nestedInfo.initialData || {}) : '';
      if (nestedInfo && (!reg.contexts[nestedInfo.id]
          || $application.variables.mateuNestedSeed !== nestedSeed)) {
        // SIN atajo consumedRoute/serverSideType: el baile de 2 pasos del mediador
        // captura las ACTIONS del wrapper (el flag sse solo viaja ahí → sseActionIds)
        reg = await bridge.loadRouteInto(callBase, reg, nestedInfo.route, nestedInfo.id, {
          appState,
          componentState: nestedInfo.initialData || {},
        });
        $application.variables.mateuRegistry = reg;
      }
      $application.variables.mateuNestedId = nestedInfo ? nestedInfo.id : '';
      $application.variables.mateuNestedSeed = nestedSeed;
      const nestedCtx = nestedInfo ? reg.contexts[nestedInfo.id] : null;
      const nestedBlocks = nestedCtx ? bridge.islandContentOf(nestedCtx) : null;
      vars.mateuNested = bridge.nestedVarOf(nestedBlocks);
      // los átomos de la anidada se FUSIONAN en el contenido de la isla (fluyen por
      // $current — leer $application.variables en templates profundos no re-liga)
      vars.mateuIsland = bridge.islandVarsOf(islandContext, nestedBlocks);



      // header de colección: toolbar del crud → primaryAction/secondaryActions
      assign(bridge.listHeaderVarsOf(listingSummary));
      // the floating action buttons (@Fab) of the page and of the app
      vars.mateuFabs = bridge.fabsOf(reg.shell, host);
      // Si la carga falló, el reintento vuelve a entrar en ESTA chain con la misma ruta.
      bridge.setLastRetry(null);
      const summary = bridge.summarizeHost(reg, route);
      // dentro de un maestro (P1) la pestaña no repite su rótulo: la cabecera lleva el del
      // maestro, y la barra de pestañas va encima
      const levels = reg.appLevels || [];
      if (!summary.title && levels.length) {
        summary.title = levels[levels.length - 1].title;
      }
      $application.variables.mateuHostTitle = summary.title;
      // Navegar en una SPA no cambia la página, así que no hay nada que un lector de pantalla
      // anuncie solo, y el foco se queda en el enlace del menú recién pulsado. Sólo aquí, en
      // una navegación REAL: en un re-render arrancaría el foco del campo que se esté editando.
      const notFoundTitle = (bridge.notFoundOf(host.tree) || {}).title;
      bridge.announceNavigation(notFoundTitle || summary.title || route);
      $application.variables.mateuOverviewTranslations = { goToParent: summary.title };
      $application.variables.mateuHostText = summary.text;
      $application.variables.mateuFormMetadata = summary.formMetadata;
      $application.variables.mateuFormFieldsList = summary.fields;
      $application.variables.mateuFormSections = summary.sections;
      $application.variables.mateuFormValue = summary.formValue;
      $application.variables.mateuFormActions = summary.actions;
      // el wizard: botón adelante y su rótulo; entrada fresca → arranca por el OVERVIEW del
      // guided-process (el Start del componente pasa a paso 1 por writeback interno)
      assign(bridge.wizardVarsOf(host, wizardProjection, summary.actions, { keepStep: false }));


      // cola de trabajo del front-office (TaskQueue) + placeholder del detalle
      const queueNow = bridge.taskQueueOf(host.tree);
      $application.variables.mateuQueue = queueNow;
      $application.variables.mateuHostEmpty = bridge.emptyStateOf(host.tree);
      // la ruta nombra algo que no existe (un registro borrado, un enlace mal copiado): el server
      // contesta la página NOT FOUND en lugar del contenido, y se pinta ELLA sola, sin cabecera
      const notFoundNow = bridge.notFoundOf(host.tree, document.documentElement.lang || navigator.language);
      $application.variables.mateuNotFound = notFoundNow;
      // arquetipos compuestos (welcome / general overview / item overview)
      // el aspecto del hero rota al ENTRAR en una welcome y se conserva mientras se siga en ella
      // (una acción lanzada desde ella la reproyecta: un tono nuevo sería el hero cambiando de
      // color antes de irse — welcomeLookOf)
      const archetypes = bridge.archetypeVarsOf(host, vars.mateuWelcome ? {
        key: vars.mateuWelcomeKey,
        theme: vars.mateuWelcomeTheme,
        illuBg: vars.mateuWelcomeIlluBg,
        illu: vars.mateuWelcomeIllu,
      } : null);
      assign(archetypes.vars);
      const welcome = archetypes.welcome;
      const overviewProjection = archetypes.overview;
      const itemProjection = archetypes.item;
      if (itemProjection) {
        try {
          await Actions.callComponentMethod(context, { selector: '#mateuItemTabs', method: 'refresh' });
        } catch (ignored) { /* aún sin montar */ }
      }
      if (welcome || overviewProjection || itemProjection || foldoutNow) {
        // sus campos/botones los pintan las ramas del arquetipo (o los paneles del foldout:
        // la vista @FoldoutDetail de un crud), no el form genérico
        assign(bridge.noGenericFormVars());
      }
      // contenido display del HOST (detalle standalone) / de los pasos del wizard:
      // los bloques de islandContentOf con la isla del host (documento) fusionada
      const islandRawBlocks = islandContext ? bridge.islandContentOf(islandContext) : null;
      const esWizard = !!wizardProjection;
      // un foldout con EntityHeader (p.ej. la Reserva 360) CONSERVA el header de pantalla:
      // el huésped + el CTA van en la banda, el foldout es solo el cuerpo
      const contentPlan = bridge.hostContentPlanOf(host, {
        islandRawBlocks, title: summary.title, wizard: esWizard, listing: listingSummary,
        welcome, overview: overviewProjection, item: itemProjection, queue: queueNow, foldout: foldoutNow,
      });
      const hostEntity = contentPlan.hostEntity;
      // pantalla nueva, pestaña nueva: la activa es estado de CLIENTE y no sobrevive a una
      // navegación (la pestaña 3 de la pantalla anterior no significa nada en ésta)
      vars.mateuActiveTabs = {};
      let hostBlocks = contentPlan.hostBlocks;
      // los @Subresource a la vista (los de la pestaña activa) se cargan y pasan a ser su tabla
      if (hostBlocks) {
        reg = await bridge.loadSubresources(callBase, reg, hostBlocks, { appState });
        $application.variables.mateuRegistry = reg;
        hostBlocks = bridge.withSubresources(hostBlocks, reg.contexts);
      }
      // los bloques MANDAN cuando son ricos (EntityHeader/Meter/Ledger, pestañas, tablas…): el
      // form genérico y el texto plano se suprimen — misma regla que los arquetipos. También
      // cuando el form no tiene nada que pintar (una página de solo lectura son textos)
      const hostBlocksRicos = bridge.hostContentShown(hostBlocks, summary);
      // las acciones del toolbar de la Page (se calculan aquí porque los templates de
      // página de entidad las recolocan: iop → goToParent/secondaryActions del panel)
      const hostToolbar = bridge.pageToolbarOf(host);
      // ITEM OVERVIEW nativo: página de entidad con la zona ESTRECHA primero (panel de
      // datos clave + main ancho) → oj-sp-item-overview-page + oj-sp-item-overview
      const iop = bridge.itemOverviewPageOf(hostEntity, hostBlocks, hostToolbar);
      const iopOn = !!iop;
      $application.variables.mateuIop = iop || {
        on: false,
        overview: { title: '', subtitle: '', badge: null, facts: [], blocks: [] },
        main: { blocks: [] },
        back: { show: false, actionId: '' },
        secondary: [],
      };
      // GENERAL OVERVIEW nativo: página de entidad con DOS bloques-columna (la ancha
      // primero) → el template oj-sp-general-overview-page (slots main/info, header integrado)
      const gop = bridge.generalOverviewPageOf(hostEntity, hostBlocks, { itemOverviewOn: iopOn });
      vars.mateuGop = gop;
      const gopOn = gop.on;
      $application.variables.mateuHostContent = (!gopOn && !iopOn && hostBlocksRicos ? hostBlocks : null) || [];
      // los componentes web del contenido (el grafo de un proceso) los crea el bridge en su
      // hueco: VB no puede escribir una etiqueta cuyo nombre llega en los datos
      bridge.mountElementsSoon(bridge.elementAtomsOf($application.variables.mateuHostContent));
      // el oj-tab-bar parsea su <ul> al inicializarse y los <li> del for-each llegan
      // después: sin refresh se queda con la lista sin estilar (misma trampa que el
      // oj-navigation-list del navigator)
      for (const barId of bridge.tabBarIdsOf($application.variables.mateuHostContent)) {
        try {
          await Actions.callComponentMethod(context, { selector: '#' + barId, method: 'refresh' });
        } catch (ignored) { /* aún sin montar */ }
      }
      if (notFoundNow) {
        // la página not-found es TODO el contenido: ni texto suelto ni bloques del host
        $application.variables.mateuHostContent = [];
        $application.variables.mateuHostText = '';
      }
      if (hostBlocksRicos || notFoundNow) {
        assign(bridge.noGenericFormVars());
        vars.mateuHostText = '';
      }
      // el PASO del wizard: contenido display + campos (cada uno UNA vez: los que pinta el
      // form salen del contenido) + el pie Back/Next. Con el rail (@WizardProgress RAIL) va al
      // guided process; con el tren arriba (STEPS) a la rama del contenido del host + la barra
      // del pie. Contenido RICO → sin form genérico (misma regla que en el host)
      const wizardStep = esWizard ? bridge.wizardStepViewOf(host, islandRawBlocks,
        { title: summary.title, sections: $application.variables.mateuFormSections }) : null;
      const wizardH = !!(wizardStep && wizardStep.wizard.horizontal);
      $application.variables.mateuWizardContent = (wizardStep && !wizardH ? wizardStep.content : null) || [];
      $application.variables.mateuWizardStep = wizardH
        ? { on: true, title: wizardStep.title, stepLabel: wizardStep.wizard.currentLabel, nav: wizardStep.nav }
        : { on: false, title: '', stepLabel: '', nav: [] };
      if (wizardStep) {
        $application.variables.mateuFormSections = wizardStep.sections;
        if (!wizardStep.sections.length) $application.variables.mateuFormFieldsList = [];
      }
      if (wizardH) {
        $application.variables.mateuHostContent = wizardStep.content;
        bridge.mountElementsSoon(bridge.elementAtomsOf(wizardStep.content));
      }

      // regla general: el header de página lo pinta SIEMPRE un header de vb; solo los
      // templates que ya integran el suyo (guided process / general overview / welcome /
      // smart-filter-search del listado) lo suprimen
      // un foldout con acciones de página (la vista @FoldoutDetail de un crud: Edit, Cancel…)
      // conserva el header de vb, que es donde van esas acciones
      const integratedHeader = !!(wizardProjection || welcome
        || overviewProjection || listingSummary
        || (foldoutNow && !hostEntity && !hostToolbar.length));
      // la página not-found trae su propio titular (el oj-sp-empty-state): sin header de vb
      const showHeader = !integratedHeader && !notFoundNow;
      // 1.3: banners de página → el oj-sp-messages-banner del starter (shell).
      // El ADP se muta con fireDataProviderEvent (asignar .data no refresca)
      // el selector rápido del listado no sobrevive a la navegación — salvo que el
      // Ask Oracle lo haya dejado pendiente para ESTA carga
      if ($application.variables.mateuFiltersPending) {
        $application.variables.mateuFiltersPending = false;
        if (pendingSearchText != null) $application.variables.mateuLastSearchText = pendingSearchText;
      } else {
        $application.variables.mateuFilterValues = {};
        $application.variables.mateuLastSearchText = '';
      }
      // los filtros van DENTRO de la cabecera del buscador (smart-filters): la config es
      // proyección de (filtros declarados × valores aplicados × texto), y una navegación
      // cambia los tres. Sólo aquí: las búsquedas que lanza el propio componente no la
      // reasignan, que le cerraría el popup del filtro que se está editando
      $application.variables.mateuSmartFilters = await bridge.smartFiltersOf(
        (($application.variables.mateuListing || {}).filters) || [],
        $application.variables.mateuFilterValues || {},
        $application.variables.mateuLastSearchText || '');
      const banners = bridge.bannersOf(host);
      const staleKeys = $application.variables.mateuBannerKeys || [];
      if (staleKeys.length) {
        await Actions.fireDataProviderEvent(context, {
          target: $page.variables.messagesBannerADP,
          remove: { keys: staleKeys },
        });
      }
      for (const banner of banners) {
        await Actions.fireDataProviderEvent(context, {
          target: $page.variables.messagesBannerADP,
          add: { data: banner },
        });
      }
      $application.variables.mateuBannerKeys = banners.map((banner) => banner.id);
      // 1.6: anatomía pageWidth del contexto host
      // con navigator persistente a la izquierda, el formato pasa a edge-to-edge
      // automáticamente: centrar un fixed en el área restante queda raro (el drawer ya
      // consume el lateral); el gutter del contenido lo ponen las ramas (12x/6x)
      const drawerNav = vars.mateuMenuDrawerMode;
      // con el template iop activo el FORMATO lo pone el template (ni fixed ni fullWidth:
      // sus zonas van directamente sobre el fondo de página) → wrapper a sangre; el shell adapta
      // su chrome (p.ej. el chat FAB) al formato de página
      const pw = bridge.pageWidthOf({ host, drawerNav, iopOn });
      // header Redwood a sangre: el gutter lo recupera cada rama de contenido
      const bleedingHeader = !!(welcome || overviewProjection || wizardProjection || listingSummary
        || vars.mateuPageHeader);
      // anatomía RDS del header (feedback 2026-07-26): en fixed/fullWidth el header va
      // sobre una BANDA a sangre (fondo blanco de viewport a viewport) con su contenido
      // capado a la caja; la tarjeta de contenido SOLAPA la banda (margen -40px) para que
      // la banda asome por detrás de su arranque — como el fondo general del lienzo
      // las acciones del toolbar de la Page van al HEADER (primary/secondary de la banda); volver
      // NO es una acción más: es la afordancia goToParent de la cabecera RDS (Redwood no tiene
      // migas: sin botón de vuelta, el padre del rastro automático)
      const pageHeader = bridge.pageHeaderOf({
        host, hostEntity, summary, hostToolbar, showHeader, pageWidth: pw, gopOn, iopOn, listing: listingSummary,
      });
      vars.mateuPageHeader = pageHeader.header;
      vars.mateuPageHeaderTranslations = pageHeader.translations;
      // El toolbar de la Page se pinta UNA sola vez: manda la cabecera cuando se pinta
      vars.mateuFormActions = bridge.formActionsBesideHeader(vars.mateuFormActions, pageHeader.header, hostToolbar);
      // anatomía RDS (feedback 2026-07-26): en fixed/fullWidth el header va sobre una BANDA a
      // sangre y la tarjeta de contenido la SOLAPA (-40px); el solape no aplica con el template
      // iop (sus sticky internos calculan contra el flujo)
      assign(bridge.pageLayoutOf({
        host, drawerNav, iopOn, bleedingHeader,
        band: (pageHeader.showBand && !iopOn) || pageHeader.showListBand,
      }).vars);
      // 1.5: la URL refleja la ruta — path (/ruta) servida por el backend Mateu, hash
      // (#/ruta) en serving estático (el modo lo fija loadMateuShell en el bootstrap)
      if (!fromUrl) {
        pushRouteToUrl($application, target.full);
      }
      $application.variables.mateuDirty = false;

      if (reg.effects && reg.effects.docTitle) {
        bridge.setDocTitle(reg.effects.docTitle);
      }
    }
  }

  return onMateuNavigate;
});
