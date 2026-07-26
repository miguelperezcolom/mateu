/* Acción saliente (Fases 3–5). Manda el estado que ya tienes: si hay un drawer abierto, su
 * estado + su borrador (las acciones del drawer del crud van contra el HOST — el drawer no
 * lleva ServerSide propio); si no, el estado del host + el borrador del form. El increment
 * de vuelta se reduce y sus efectos se aplican: Add → proyectar el drawer; CloseModal →
 * cerrarlo y disparar los triggers OnCustomEvent suscritos al evento emitido (el refresco
 * del listing viaja EN el wire); toasts; NavigateTo → evento de aplicación mateuNavigate. */

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

  class runMateuAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId    id de la acción Mateu (del $current del botón)
     * @param {Object} params.parameters  parámetros extra (p.ej. la fila en el clic view)
     * @param {Object} params.event       evento ojAction (fallback: data-action-id)
     */
    async run(context, { actionId, parameters, event }) {
      const { $application, $page } = context;

      let id = actionId;
      if (!id && event && event.target && event.target.dataset) {
        id = event.target.dataset.actionId;
      }
      if (!id) {
        return;
      }

      const base = $application.constants.mateuBaseUrl;
      const before = $application.variables.mateuRegistry;
      const host = before.contexts[bridge.HOST_ID];
      const route = $application.variables.mateuSelectedRoute;
      const overlayBefore = bridge.overlayOf(before);
      const componentState = overlayBefore
        ? Object.assign({}, overlayBefore.state, $page.variables.mateuDrawerDraft)
        : Object.assign({}, host && host.state, $page.variables.mateuDraft);

      const appState = $application.variables.mateuAppState || {};
      const increment = await bridge.runMateuAction(
        base, host, route, id, componentState, { parameters: parameters || {}, appState });
      let reg = bridge.reduceContexts(before, increment);
      const effects = reg.effects;

      // eventos del bus (CloseModal/DispatchEvent) → triggers OnCustomEvent suscritos
      for (const busEvent of effects.events) {
        const hostNow = reg.contexts[bridge.HOST_ID];
        for (const triggerActionId of bridge.eventTriggersOf(hostNow, busEvent.name)) {
          const listing = bridge.listingOf(hostNow);
          const refresh = await bridge.runMateuAction(
            base, hostNow, route, triggerActionId,
            Object.assign({}, hostNow.state, { page: 0, size: (listing && listing.pageSize) || 20 }),
            { appState },
          );
          reg = bridge.reduceContexts(reg, refresh);
        }
      }

      $application.variables.mateuRegistry = reg;

      // proyecciones: drawer, listing, form
      const overlayNow = bridge.overlayOf(reg);
      $application.variables.mateuDrawer = overlayNow || { title: '', fields: [], actions: [], state: {} };
      $application.variables.mateuDrawerOpen = !!overlayNow;
      if (!overlayNow || !overlayBefore || overlayNow.id !== overlayBefore.id) {
        $page.variables.mateuDrawerDraft = {};
      }

      const hostAfter = reg.contexts[bridge.HOST_ID];
      const listingSummary = bridge.listingOf(hostAfter);
      $application.variables.mateuListing = listingSummary;
      $application.variables.mateuListingRows = listingSummary ? listingSummary.rows : [];

      $application.variables.mateuFoldout = bridge.foldoutOf(hostAfter);
      $application.variables.mateuWizard = bridge.wizardOf(hostAfter);

      // header de colección: toolbar del crud → primaryAction/secondaryActions
      const toolbar = listingSummary ? listingSummary.toolbar : [];
      const primaryToolbar = toolbar.length ? toolbar[0] : null;
      $application.variables.mateuListPrimary = primaryToolbar
        ? { label: primaryToolbar.label } : { label: '', display: 'off' };
      $application.variables.mateuListPrimaryId = primaryToolbar ? primaryToolbar.actionId : '';
      $application.variables.mateuListSecondary = toolbar.slice(1).map((b) => ({ label: b.label }));
      const summary = bridge.summarizeHost(reg, route);
      $application.variables.mateuHostTitle = summary.title;
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
        $application.variables.mateuWizardPrimary = forward
          ? { label: forward.label, disabled: false }
          : { label: 'Done', disabled: true };
        $application.variables.mateuWizardShownStep = wizardNow.currentStep || '';
      } else {
        $application.variables.mateuWizardForwardId = '';
        $application.variables.mateuWizardPrimary = { label: '', disabled: true };
        $application.variables.mateuWizardShownStep = '';
      }

      if (!overlayNow) {
        $page.variables.mateuDraft = {};
      }
      // isla aparecida con la acción (p.ej. el detalle del TaskQueue tras openGuest):
      // se carga su contenido si su contexto aún no existe y se (re)proyecta
      const islandsAfter = bridge.collectIslands(hostAfter.tree);
      const islandAfter = islandsAfter.length ? islandsAfter[0] : null;
      if (islandAfter && !reg.contexts[islandAfter.id]) {
        // SIN atajo: el baile de 2 pasos captura las ACTIONS del wrapper (flag sse)
        reg = await bridge.loadRouteInto(base, reg, islandAfter.route, islandAfter.id, {
          appState,
          componentState: islandAfter.initialData || {},
        });
        $application.variables.mateuRegistry = reg;
      }
      $application.variables.mateuIslandId = islandAfter ? islandAfter.id : '';
      const islandCtxAfter = islandAfter ? reg.contexts[islandAfter.id] : null;
      $application.variables.mateuIsland = islandCtxAfter
        ? { fields: bridge.fieldListOf(islandCtxAfter.tree, islandCtxAfter.state),
            actions: bridge.actionsOf(islandCtxAfter.tree),
            content: bridge.islandContentOf(islandCtxAfter) }
        : null;
      // isla ANIDADA dentro de la isla (App con initialData sembrado, p.ej. el documento):
      // cargar con el initialData como componentState; RECARGAR si el seed cambió (selectPax)
      const nestedList = islandCtxAfter ? bridge.collectIslands(islandCtxAfter.tree) : [];
      const nestedInfo = nestedList.length ? nestedList[0] : null;
      const nestedSeed = nestedInfo ? JSON.stringify(nestedInfo.initialData || {}) : '';
      if (nestedInfo && (!reg.contexts[nestedInfo.id]
          || $application.variables.mateuNestedSeed !== nestedSeed)) {
        // SIN atajo consumedRoute/serverSideType: el baile de 2 pasos del mediador
        // captura las ACTIONS del wrapper (el flag sse solo viaja ahí → sseActionIds)
        reg = await bridge.loadRouteInto(base, reg, nestedInfo.route, nestedInfo.id, {
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


      // cola de trabajo del front-office (TaskQueue) + placeholder del detalle
      $application.variables.mateuQueue = bridge.taskQueueOf(hostAfter.tree);
      $application.variables.mateuHostEmpty = bridge.emptyStateOf(hostAfter.tree);
      // arquetipos compuestos (welcome / general overview / item overview)
      const welcome = bridge.welcomeOf(hostAfter);
      const overviewProjection = bridge.generalOverviewOf(hostAfter);
      const itemProjection = bridge.itemOverviewOf(hostAfter);
      $application.variables.mateuWelcome = welcome;
      $application.variables.mateuOverview = overviewProjection;
      $application.variables.mateuOverviewOptions = overviewProjection ? overviewProjection.switcherOptions : [];
      $application.variables.mateuItemOv = itemProjection;
      $application.variables.mateuItemTabTexts = itemProjection && itemProjection.tabs.length
        ? itemProjection.tabs[0].texts : [];
      if (welcome || overviewProjection || itemProjection) {
        // sus campos/botones los pintan las ramas del arquetipo, no el form genérico
        $application.variables.mateuFormMetadata = null;
        $application.variables.mateuFormFieldsList = [];
        $application.variables.mateuFormActions = [];
      }
      // contenido display del HOST / de los pasos del wizard (detalle standalone)
      const islandRawBlocks2 = islandCtxAfter ? bridge.islandContentOf(islandCtxAfter) : null;
      const esWizard2 = !!$application.variables.mateuWizard;
      const sinOtrasRamas2 = !listingSummary && !welcome && !overviewProjection && !itemProjection
        && !$application.variables.mateuQueue && !$application.variables.mateuFoldout;
      const hostBlocks2 = (!esWizard2 && sinOtrasRamas2)
        ? bridge.hostContentOf(hostAfter, islandRawBlocks2) : null;
      // los bloques MANDAN cuando son ricos (EntityHeader/Meter/Ledger…): el form genérico
      // y el texto plano se suprimen — misma regla que los arquetipos
      const hostBlocksRicos2 = !!(hostBlocks2 && hostBlocks2.some((block) => (block.items || []).some((a) => a.isEntityHeader || a.isMeter
        || a.isStatusList || a.isLedger || a.isPayment || a.isResourceGrid || a.isAddOns
        || a.isStat || a.isNotice || a.isPropertyRow)));
      $application.variables.mateuHostContent = (hostBlocksRicos2 ? hostBlocks2 : null) || [];
      if (hostBlocksRicos2) {
        $application.variables.mateuFormMetadata = null;
        $application.variables.mateuFormFieldsList = [];
        $application.variables.mateuFormActions = [];
        $application.variables.mateuHostText = '';
      }
      $application.variables.mateuWizardContent = (esWizard2
        ? bridge.hostContentOf(hostAfter, islandRawBlocks2, { forWizard: true, title: summary.title }) : null) || [];

      // regla general: el header de página lo pinta SIEMPRE un header de vb; solo los
      // templates que ya integran el suyo (guided process / general overview / welcome /
      // smart-filter-search del listado) lo suprimen
      const integratedHeader = !!($application.variables.mateuWizard || welcome
        || overviewProjection || listingSummary || $application.variables.mateuFoldout);
      const showHeaderA = !integratedHeader;
      const pwAfter = $application.variables.mateuMenuDrawerMode
        ? 'edgeToEdge' : ((hostAfter && hostAfter.pageWidth) || 'fixed');
      const showBandA = showHeaderA && pwAfter !== 'edgeToEdge';
      $application.variables.mateuPageHeader = {
        title: summary.title || '',
        showBand: showBandA,
        showInline: showHeaderA && !showBandA,
      };
      $application.variables.mateuShellPageLayout = pwAfter === 'fixed' ? 'fixedWidth' : pwAfter;
      $application.variables.mateuDirty = false;

      // toast con el patrón del starter: variable + open() del oj-sp-messages-toast local
      for (const toast of effects.toasts) {
        $page.variables.mateuToastText = toast.text;
        await Actions.callComponentMethod(context, {
          selector: '#mateuToast',
          method: 'open',
        });
      }
      if (effects.docTitle) {
        document.title = effects.docTitle;
      }
      if (effects.navigate && effects.navigate.route) {
        await Actions.fireEvent(context, {
          name: 'application:mateuNavigate',
          payload: { route: effects.navigate.route },
        });
      }
    }
  }

  return runMateuAction;
});
