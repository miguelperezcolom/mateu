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
      const route = detail.currentId != null ? detail.currentId
        : detail.selectedValue != null ? detail.selectedValue
        : detail.value != null ? detail.value : detail.route;
      if (route == null || route === '') {
        return;
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
      let reg = await bridge.loadRouteInto(
        base, $application.variables.mateuRegistry, route, '', { appState });

      // triggers OnLoad del host (p.ej. el listing pide 'search' al cargar → llegan las filas)
      const loaded = reg.contexts[bridge.HOST_ID];
      for (const triggerActionId of bridge.onLoadTriggers(loaded)) {
        const listing = bridge.listingOf(loaded);
        const increment = await bridge.runMateuAction(
          base, loaded, route, triggerActionId,
          Object.assign({}, loaded.state, { page: 0, size: (listing && listing.pageSize) || 20 }),
          { appState },
        );
        reg = bridge.reduceContexts(reg, increment);
      }

      // islas embebidas: cada frontera ServerSide del host se carga como superficie
      // propia (initiator = id de la frontera → sus fragments van a SU contexto)
      let hostForIslands = reg.contexts[bridge.HOST_ID];
      const islands = hostForIslands ? bridge.collectIslands(hostForIslands.tree) : [];
      const firstIsland = islands.length ? islands[0] : null;
      if (firstIsland) {
        reg = await bridge.loadRouteInto(base, reg, firstIsland.route, firstIsland.id, { appState });
      }
      $application.variables.mateuIslandId = firstIsland ? firstIsland.id : '';

      $application.variables.mateuRegistry = reg;
      $application.variables.mateuSelectedRoute = route;

      const host = reg.contexts[bridge.HOST_ID];
      const listingSummary = bridge.listingOf(host);
      $application.variables.mateuListing = listingSummary;
      $application.variables.mateuListingRows = listingSummary ? listingSummary.rows : [];

      $application.variables.mateuFoldout = bridge.foldoutOf(host);
      $application.variables.mateuWizard = bridge.wizardOf(host);
      const islandContext = firstIsland ? reg.contexts[firstIsland.id] : null;
      $application.variables.mateuIsland = islandContext
        ? { fields: bridge.fieldListOf(islandContext.tree, islandContext.state),
            actions: bridge.actionsOf(islandContext.tree) }
        : null;

      // header de colección: toolbar del crud → primaryAction/secondaryActions
      const toolbar = listingSummary ? listingSummary.toolbar : [];
      const primaryToolbar = toolbar.length ? toolbar[0] : null;
      $application.variables.mateuListPrimary = primaryToolbar
        ? { label: primaryToolbar.label } : { label: '', display: 'off' };
      $application.variables.mateuListPrimaryId = primaryToolbar ? primaryToolbar.actionId : '';
      $application.variables.mateuListSecondary = toolbar.slice(1).map((b) => ({ label: b.label }));
      const summary = bridge.summarizeHost(reg, route);
      $application.variables.mateuHostTitle = summary.title;
      $application.variables.mateuOverviewTranslations = { goToParent: summary.title };
      $application.variables.mateuHostText = summary.text;
      $application.variables.mateuFormMetadata = summary.formMetadata;
      $application.variables.mateuFormFieldsList = summary.fields;
      $application.variables.mateuFormValue = summary.formValue;
      $application.variables.mateuFormActions = summary.actions;
      const wizardNow = $application.variables.mateuWizard;
      if (wizardNow) {
        const forward = summary.actions.find((a) => a.actionId !== 'back');
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


      // arquetipos compuestos (welcome / general overview / item overview)
      const welcome = bridge.welcomeOf(host);
      const overviewProjection = bridge.generalOverviewOf(host);
      const itemProjection = bridge.itemOverviewOf(host);
      $application.variables.mateuWelcome = welcome;
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
      // regla general: el header de página lo pinta SIEMPRE un header de vb; solo los
      // templates que ya integran el suyo (guided process / general overview / welcome /
      // smart-filter-search del listado) lo suprimen
      const integratedHeader = !!($application.variables.mateuWizard || welcome
        || overviewProjection || listingSummary || $application.variables.mateuFoldout);
      $application.variables.mateuPageHeader = integratedHeader ? null : { title: summary.title };
      // 1.3: banners de página → el oj-sp-messages-banner del starter (shell).
      // El ADP se muta con fireDataProviderEvent (asignar .data no refresca)
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
      const pageStyle = drawerNav
        ? bridge.pageStyleOf({ pageWidth: 'edgeToEdge' })
        : bridge.pageStyleOf(host);
      // el shell adapta su chrome (p.ej. el chat FAB) al formato de página
      const pw = drawerNav ? 'edgeToEdge' : ((host && host.pageWidth) || 'fixed');
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
      // 1.5: la URL refleja la ruta (hash — deep-linkable y con back/forward)
      if (!fromUrl && window.location.hash !== '#' + route) {
        window.history.pushState(null, '', '#' + route);
      }
      $application.variables.mateuDirty = false;

      if (reg.effects && reg.effects.docTitle) {
        document.title = reg.effects.docTitle;
      }
    }
  }

  return onMateuNavigate;
});
