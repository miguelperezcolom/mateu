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

  class onMateuNavigate extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  spSelectionChanged ({currentId}) o mateuNavigate ({route})
     * @param {boolean} params.force recargar aunque sea la misma ruta (cambio de contexto)
     */
    async run(context, { event, force, fromUrl }) {
      const { $application, $page } = context;

      const detail = (event && (event.detail || event)) || {};
      let route = detail.currentId != null ? detail.currentId
        : detail.selectedValue != null ? detail.selectedValue
        : detail.value != null ? detail.value : detail.route;
      if (route == null || route === '') {
        return;
      }
      // Cualquier fallo de transporte durante esta navegación deja registrado un reintento
      // que la repite entera (la banda de error lo ofrece).
      const registerRetry = () => bridge.setLastRetry({ kind: 'navigate', route });
      // ?campo=valor en la ruta (p.ej. /reservas?vista=LLEGADAS_HOY, los KPIs de la
      // home): el filtro rápido viaja en la URL — se consume aquí como filtro
      // PENDIENTE (misma mecánica que el Ask Oracle) y la ruta queda limpia
      const queryIdx = route.indexOf('?');
      if (queryIdx >= 0) {
        const par = route.slice(queryIdx + 1).split('&')[0].split('=');
        route = route.slice(0, queryIdx);
        if (par.length === 2 && par[0] && par[1]) {
          $application.variables.mateuQuickFilter = {
            fieldId: par[0], value: decodeURIComponent(par[1]) };
          $application.variables.mateuQuickFilterPending = true;
          force = true; // aunque ya estemos en la ruta, hay que re-buscar filtrado
        }
      }
      // el eco del writeback de selection tras cada navegación — no recargar
      if (!force && route === $application.variables.mateuSelectedRoute) {
        return;
      }
      // dirtyGuard (1.5): edición local sin guardar → confirmar; al cancelar, restaurar la URL
      if (!force && $application.variables.mateuDirty) {
        if (!window.confirm('Hay cambios sin guardar. ¿Salir de esta pantalla?')) {
          const previous = $application.variables.mateuSelectedRoute;
          if (previous) {
            window.history.replaceState(null, '', '#' + previous);
          }
          return;
        }
        $application.variables.mateuDirty = false;
      }

      const base = $application.constants.mateuBaseUrl;
      const appState = $application.variables.mateuAppState || {};
      // Una entrada traída de otro pod SOLO se puede cargar llamando a ese pod. El bridge
      // registró a dónde va cada una al expandir el menú; sin esta consulta la petición saldría
      // al base de la shell, que no conoce esa ruta, y la pantalla quedaría vacía.
      const remote = bridge.remoteRouteOf(route);
      const callBase = (remote && remote.baseUrl) ? remote.baseUrl : base;
      const extra = remote
        ? { appState, consumedRoute: remote.consumedRoute, serverSideType: remote.serverSideType }
        : { appState };
      let reg;
      try {
        reg = await bridge.loadRouteInto(
          callBase, $application.variables.mateuRegistry, route, '', extra);
      } catch (e) {
        // La banda de error ya la puso el transporte (onSettle); aquí sólo se deja el
        // reintento a mano, y se corta: sin registro no hay nada que proyectar.
        registerRetry();
        return;
      }

      // triggers OnLoad del host (p.ej. el listing pide 'search' al cargar → llegan las filas)
      const loaded = reg.contexts[bridge.HOST_ID];
      // una vista rápida del Ask Oracle deja el filtro PENDIENTE: la búsqueda OnLoad
      // aterriza ya filtrada (y el chip aparece aplicado)
      const quickNav = $application.variables.mateuQuickFilterPending
        ? ($application.variables.mateuQuickFilter || {}) : {};
      for (const triggerActionId of bridge.onLoadTriggers(loaded)) {
        const listing = bridge.listingOf(loaded);
        const componentState = Object.assign(
          {}, loaded.state, { page: 0, size: (listing && listing.pageSize) || 20 });
        if (quickNav.fieldId && quickNav.value) {
          componentState[quickNav.fieldId] = quickNav.value;
        }
        const increment = await bridge.runMateuAction(
          callBase, loaded, route, triggerActionId, componentState, { appState });
        reg = bridge.reduceContexts(reg, increment);
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

      $application.variables.mateuRegistry = reg;
      $application.variables.mateuSelectedRoute = route;

      const host = reg.contexts[bridge.HOST_ID];
      const listingSummary = bridge.listingOf(host);
      $application.variables.mateuListing = listingSummary;
      $application.variables.mateuListingRows = listingSummary ? listingSummary.rows : [];

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
      $application.variables.mateuWizard = bridge.wizardOf(host);
      const islandContext = firstIsland ? reg.contexts[firstIsland.id] : null;
      $application.variables.mateuIsland = islandContext
        ? { fields: bridge.fieldListOf(islandContext.tree, islandContext.state),
            actions: bridge.actionsOf(islandContext.tree),
            content: bridge.islandContentOf(islandContext) }
        : null;
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
      $application.variables.mateuNested = nestedBlocks
        ? { atoms: nestedBlocks.reduce((out, b) => out.concat(b.items), []) }
        : null;
      // los átomos de la anidada se FUSIONAN en el contenido de la isla (fluyen por
      // $current — leer $application.variables en templates profundos no re-liga)
      if ($application.variables.mateuIsland && nestedBlocks) {
        $application.variables.mateuIsland = Object.assign({}, $application.variables.mateuIsland, {
          content: bridge.mergeNestedContent($application.variables.mateuIsland.content, nestedBlocks),
        });
      }



      // header de colección: toolbar del crud → primaryAction/secondaryActions
      const toolbar = listingSummary ? listingSummary.toolbar : [];
      const primaryToolbar = toolbar.length ? toolbar[0] : null;
      $application.variables.mateuListPrimary = primaryToolbar
        ? { label: primaryToolbar.label } : { label: '', display: 'off' };
      $application.variables.mateuListPrimaryId = primaryToolbar ? primaryToolbar.actionId : '';
      $application.variables.mateuListSecondary = toolbar.slice(1).map((b) => ({ id: b.actionId, value: b.actionId, label: b.label }));
      // Si la carga falló, el reintento vuelve a entrar en ESTA chain con la misma ruta.
      bridge.setLastRetry(null);
      const summary = bridge.summarizeHost(reg, route);
      $application.variables.mateuHostTitle = summary.title;
      // Navegar en una SPA no cambia la página, así que no hay nada que un lector de pantalla
      // anuncie solo, y el foco se queda en el enlace del menú recién pulsado. Sólo aquí, en
      // una navegación REAL: en un re-render arrancaría el foco del campo que se esté editando.
      bridge.announceNavigation(summary.title || route);
      $application.variables.mateuOverviewTranslations = { goToParent: summary.title };
      $application.variables.mateuHostText = summary.text;
      $application.variables.mateuFormMetadata = summary.formMetadata;
      $application.variables.mateuFormFieldsList = summary.fields;
      $application.variables.mateuFormValue = summary.formValue;
      $application.variables.mateuFormActions = summary.actions;
      const wizardNow = $application.variables.mateuWizard;
      if (wizardNow) {
        const forwardBtn = bridge.wizardForwardOf(host);
        const forward = forwardBtn
          || summary.actions.find((a) => a.actionId !== 'back');
        $application.variables.mateuWizardForwardId = forward ? forward.actionId : '';
        $application.variables.mateuFormActions = []; // atrás = clic en el rail; adelante = Continue
        // sin availableFromStep: el primary solo aparece en el ÚLTIMO paso del tren
        // (y nunca null: el componente lee primaryAction.label incondicionalmente)
        $application.variables.mateuWizardPrimary = forward
          ? { label: forward.label, disabled: false }
          : { label: 'Done', disabled: true };
        // entrada fresca al wizard: arrancar por el OVERVIEW del guided-process
        // (el Start del componente pasa a paso 1 por writeback interno, sin evento)
        $application.variables.mateuWizardShownStep = '';
      } else {
        $application.variables.mateuWizardForwardId = '';
        $application.variables.mateuWizardPrimary = { label: '', disabled: true };
        $application.variables.mateuWizardShownStep = '';
      }


      // cola de trabajo del front-office (TaskQueue) + placeholder del detalle
      $application.variables.mateuQueue = bridge.taskQueueOf(host.tree);
      $application.variables.mateuHostEmpty = bridge.emptyStateOf(host.tree);
      // arquetipos compuestos (welcome / general overview / item overview)
      const welcome = bridge.welcomeOf(host);
      $application.variables.mateuWelcomeTrendItems =
        welcome && welcome.trend ? welcome.trend.items : [];
      const overviewProjection = bridge.generalOverviewOf(host);
      const itemProjection = bridge.itemOverviewOf(host);
      $application.variables.mateuWelcome = welcome;
      if (welcome) {
// los PARES color+ilustración del hero: las 5 parejas bg+fg de la galería
        // OFICIAL (fnd/gallery illust-welcome-banner-*-01..05) rotando con su tono
        const GALERIA = 'https://static.oracle.com/cdn/fnd/gallery/2307.0.2/images/';
        const LOOKS = [
          ['dark-ocean', '01'], ['dark-pine', '02'], ['dark-plum', '03'],
          ['dark-sienna', '04'], ['dark-teal', '05'],
        ];
        const look = LOOKS[Math.floor(Math.random() * LOOKS.length)];
        $application.variables.mateuWelcomeTheme = look[0];
        $application.variables.mateuWelcomeIlluBg = GALERIA + 'illust-welcome-banner-bg-' + look[1] + '.png';
        $application.variables.mateuWelcomeIllu = GALERIA + 'illust-welcome-banner-fg-' + look[1] + '.png';
      }
      $application.variables.mateuOverview = overviewProjection;
      $application.variables.mateuOverviewOptions = overviewProjection ? overviewProjection.switcherOptions : [];
      $application.variables.mateuItemOv = itemProjection;
      $application.variables.mateuItemTabTexts = itemProjection && itemProjection.tabs.length
        ? itemProjection.tabs[0].texts : [];
      if (itemProjection) {
        try {
          await Actions.callComponentMethod(context, { selector: '#mateuItemTabs', method: 'refresh' });
        } catch (ignored) { /* aún sin montar */ }
      }
      if (welcome || overviewProjection || itemProjection) {
        // sus campos/botones los pintan las ramas del arquetipo, no el form genérico
        $application.variables.mateuFormMetadata = null;
        $application.variables.mateuFormFieldsList = [];
        $application.variables.mateuFormActions = [];
      }
      // contenido display del HOST (detalle standalone) / de los pasos del wizard:
      // los bloques de islandContentOf con la isla del host (documento) fusionada
      const islandRawBlocks = islandContext ? bridge.islandContentOf(islandContext) : null;
      const esWizard = !!$application.variables.mateuWizard;
      const sinOtrasRamas = !listingSummary && !welcome && !overviewProjection && !itemProjection
        && !$application.variables.mateuQueue && !$application.variables.mateuFoldout;
      // un foldout con EntityHeader (p.ej. la Reserva 360) CONSERVA el header de pantalla:
      // el huésped + el CTA van en la banda, el foldout es solo el cuerpo
      const hostEntity = (!esWizard && (sinOtrasRamas || $application.variables.mateuFoldout))
        ? bridge.entityHeaderOf(host) : null;
      const hostBlocks = (!esWizard && sinOtrasRamas)
        ? bridge.hostContentOf(host, islandRawBlocks,
            { title: summary.title, dropEntityHeader: !!hostEntity }) : null;
      // los bloques MANDAN cuando son ricos (EntityHeader/Meter/Ledger…): el form genérico
      // y el texto plano se suprimen — misma regla que los arquetipos
      const hostBlocksRicos = !!(hostBlocks && hostBlocks.some((block) => (block.items || []).some((a) => a.isEntityHeader || a.isTaskProgress || a.isMeter
        || a.isStatusList || a.isLedger || a.isPayment || a.isResourceGrid || a.isAddOns
        || a.isStat || a.isNotice || a.isPropertyRow)));
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
      const zonedGop = (hostBlocks || []).filter((b) => /oj-md-/.test(b.blockClass || ''));
      const gopOn = !iopOn && !!(hostEntity && (hostBlocks || []).length === 2 && zonedGop.length === 2);
      const gopFold = (block) => {
        const items = (block.items || []);
        const conTitulo = items.length && items[0].isHeading && items[0].isH2;
        return {
          title: conTitulo ? items[0].text : '',
          blocks: [Object.assign({}, block, {
            blockClass: 'oj-flex-item oj-sm-12',
            items: conTitulo ? items.slice(1) : items,
          })],
        };
      };
      $application.variables.mateuGop = gopOn
        ? { on: true, main: gopFold(zonedGop[0]), info: gopFold(zonedGop[1]) }
        : { on: false, main: { title: '', blocks: [] }, info: { title: '', blocks: [] } };
      $application.variables.mateuHostContent = (!gopOn && !iopOn && hostBlocksRicos ? hostBlocks : null) || [];
      if (hostBlocksRicos) {
        $application.variables.mateuFormMetadata = null;
        $application.variables.mateuFormFieldsList = [];
        $application.variables.mateuFormActions = [];
        $application.variables.mateuHostText = '';
      }
      $application.variables.mateuWizardContent = (esWizard
        ? bridge.hostContentOf(host, islandRawBlocks, { forWizard: true, title: summary.title }) : null) || [];
      // si los bloques del paso son RICOS, el form genérico del paso sobra (duplica lo
      // que ya muestran el header/las property rows) — misma regla que en el host
      if (($application.variables.mateuWizardContent || []).some((block) => (block.items || []).some((a) => a.isEntityHeader || a.isTaskProgress || a.isMeter
        || a.isStatusList || a.isLedger || a.isPayment || a.isResourceGrid || a.isAddOns
        || a.isStat || a.isNotice || a.isPropertyRow))) {
        $application.variables.mateuFormFieldsList = [];
      }

      // regla general: el header de página lo pinta SIEMPRE un header de vb; solo los
      // templates que ya integran el suyo (guided process / general overview / welcome /
      // smart-filter-search del listado) lo suprimen
      const integratedHeader = !!($application.variables.mateuWizard || welcome
        || overviewProjection || listingSummary
        || ($application.variables.mateuFoldout && !hostEntity));
      const showHeader = !integratedHeader;
      // 1.3: banners de página → el oj-sp-messages-banner del starter (shell).
      // El ADP se muta con fireDataProviderEvent (asignar .data no refresca)
      // el selector rápido del listado no sobrevive a la navegación — salvo que el
      // Ask Oracle lo haya dejado pendiente para ESTA carga
      if ($application.variables.mateuQuickFilterPending) {
        $application.variables.mateuQuickFilterPending = false;
      } else {
        $application.variables.mateuQuickFilter = {};
        $application.variables.mateuLastSearchText = '';
      }
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
      const drawerNav = $application.variables.mateuMenuDrawerMode;
      // con el template iop activo el FORMATO lo pone el template (ni fixed ni fullWidth:
      // sus zonas van directamente sobre el fondo de página) → wrapper a sangre
      const pageStyle = (drawerNav || iopOn)
        ? bridge.pageStyleOf({ pageWidth: 'edgeToEdge' })
        : bridge.pageStyleOf(host);
      // el shell adapta su chrome (p.ej. el chat FAB) al formato de página
      const pw = (drawerNav || iopOn) ? 'edgeToEdge' : ((host && host.pageWidth) || 'fixed');
      $application.variables.mateuShellPageLayout = pw === 'fixed' ? 'fixedWidth' : pw;
      $application.variables.mateuPageMaxWidth = pageStyle.maxWidth;
      $application.variables.mateuPageMargin = pageStyle.margin;
      $application.variables.mateuPagePadding = pageStyle.padding;
      if ($application.variables.mateuWelcome || $application.variables.mateuOverview
          || $application.variables.mateuWizard || listingSummary
          || $application.variables.mateuPageHeader) {
        // header Redwood a sangre: el gutter lo recupera cada rama de contenido
        $application.variables.mateuPagePadding = '0';
      }
      // anatomía RDS del header (feedback 2026-07-26): en fixed/fullWidth el header va
      // sobre una BANDA a sangre (fondo blanco de viewport a viewport) con su contenido
      // capado a la caja; la tarjeta de contenido SOLAPA la banda (margen -40px) para que
      // la banda asome por detrás de su arranque — como el fondo general del lienzo
      const showBand = showHeader && pw !== 'edgeToEdge';
      const showListBand = !!listingSummary && pw !== 'edgeToEdge';
      // las acciones del toolbar de la Page van al HEADER (primary/secondary de la banda)
      const primaryBtn = hostToolbar.find((b) => b.chroming === 'callToAction') || null;
      $application.variables.mateuPageHeader = {
        // con EntityHeader en el host (la 360), el header de PANTALLA muestra al huésped
        title: hostEntity ? hostEntity.title : (summary.title || ''),
        subtitle: hostEntity ? hostEntity.subtitle : '',
        facts: hostEntity ? hostEntity.facts : [],
        showBand: showBand && !gopOn && !iopOn,
        showInline: showHeader && !showBand && !gopOn && !iopOn,
        showListBand: showListBand,
        showListInline: !!listingSummary && !showListBand,
        primary: primaryBtn ? { label: primaryBtn.label, display: primaryBtn.disabled ? 'disabled' : 'on' } : { label: '', display: 'off' },
        primaryId: primaryBtn ? primaryBtn.actionId : '',
        secondary: hostToolbar.filter((b) => b !== primaryBtn).map((b) => ({ id: b.actionId, value: b.actionId, label: b.label })),
        toolbar: hostToolbar,
      };
      // el solape -40px de la banda NO aplica con el template iop (sus sticky internos
      // calculan contra el flujo y el solape los descuadra)
      if ((showBand && !iopOn) || showListBand) {
        // la caja de la banda usa la MISMA fórmula horizontal que el contenido…
        $application.variables.mateuBandBoxMargin = $application.variables.mateuPageMargin;
        // …y el contenido gana el solape vertical (-40px) sobre la banda
        const marginParts = ($application.variables.mateuPageMargin || '0').split(' ');
        marginParts[0] = '-40px';
        if (marginParts.length === 1) marginParts.push('auto');
        $application.variables.mateuPageMargin = marginParts.join(' ');
      } else {
        $application.variables.mateuBandBoxMargin = '0 auto';
      }
      // 1.5: la URL refleja la ruta — path (/ruta) servida por el backend Mateu, hash
      // (#/ruta) en serving estático (el modo lo fija loadMateuShell en el bootstrap)
      if (!fromUrl) {
        if (window.__mateuUrlPathMode) {
          // la home (incluido el sentinel _no_home_route del server) es '/', no un path
          const home = $application.variables.mateuHomeRoute || '';
          const target = (!route || route === home) ? '/' : route;
          if (window.location.pathname !== target) {
            window.history.pushState(null, '', target);
          }
        } else if (window.location.hash !== '#' + route) {
          window.history.pushState(null, '', '#' + route);
        }
      }
      $application.variables.mateuDirty = false;

      if (reg.effects && reg.effects.docTitle) {
        document.title = reg.effects.docTitle;
      }
    }
  }

  return onMateuNavigate;
});
