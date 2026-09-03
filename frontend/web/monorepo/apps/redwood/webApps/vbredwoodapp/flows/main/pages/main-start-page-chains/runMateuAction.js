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

      // El marcado del control pulsado lo hacen los hooks del transporte a nivel de documento
      // (bridge.trackPressedControls): así cubre TODAS las chains, no sólo ésta.
      try {
        return await this.dispatch(context, { actionId, parameters, event });
      } catch (e) {
        // "Reintentar" tiene que re-ejecutar la ACCIÓN entera, no sólo la petición: una
        // respuesta que nadie procesa no cambia nada en pantalla.
        bridge.setLastRetry({ kind: 'action', actionId: actionId || (event && event.target && event.target.dataset && event.target.dataset.actionId), parameters });
        throw e;
      }
    }

    async dispatch(context, { actionId, parameters, event }) {
      const { $application, $page } = context;

      let id = actionId;
      if (!id && event && event.target && event.target.dataset) {
        id = event.target.dataset.actionId;
      }
      if (!id) {
        return;
      }

      // La pantalla puede venir de otro pod (menú federado): sus cargas y acciones siguen
      // hablando con ESE backend, no con el de la shell.
      const base = bridge.baseOf($application.variables.mateuRegistry)
        || $application.constants.mateuBaseUrl;
      const before = $application.variables.mateuRegistry;
      const host = before.contexts[bridge.HOST_ID];
      const route = $application.variables.mateuSelectedRoute;
      const overlayBefore = bridge.overlayOf(before);
      const componentState = overlayBefore
        ? Object.assign({}, overlayBefore.state, $page.variables.mateuDrawerDraft)
        : Object.assign({}, host && host.state, $page.variables.mateuDraft);

      const appState = $application.variables.mateuAppState || {};
      // acciones anunciadas Action.sse(true) del HOST (p.ej. opFirma → tablet) van por el
      // endpoint /sse: se aplican TODOS los increments del stream y se ACUMULAN los
      // eventos/toasts de cada uno (cada reduce reemplaza effects)
      const isSse = ((host && host.sseActionIds) || []).indexOf(id) >= 0;
      let reg = before;
      const allEvents = [];
      const allToasts = [];
      // ¿algún incremento REPINTÓ el host? (cualquier fragmento no-Add: Replace/State/data;
      // los Add son overlays — abrir un drawer no toca el host). Señal para el remontaje
      // del foldout: comparar referencias/uuids no vale (proxies de VB, uuids estables).
      let hostRepainted = false;
      const touchesHost = (inc) =>
        ((inc && inc.fragments) || []).some((f) => f.action !== 'Add');
      let lastIncrement = null;
      const applyInc = (inc) => {
        lastIncrement = inc;
        reg = bridge.reduceContexts(reg, inc);
        if (touchesHost(inc)) hostRepainted = true;
        allEvents.push.apply(allEvents, reg.effects.events || []);
        allToasts.push.apply(allToasts, reg.effects.toasts || []);
      };
      if (isSse) {
        // LongTask: el diálogo de progreso se pinta EN VIVO según llega el stream; sus
        // increments (Add del Dialog + state-only del progreso) se CONSUMEN aquí y no se
        // reducen — los commands/messages del último (p.ej. el dispatchEvent del
        // refresco) sí, vía rest
        const progressWatcher = bridge.longTaskWatcher();
        let progressOpen = false;
        const increments = await bridge.runMateuActionSse(
          base, host, route, id, componentState, {
            parameters: parameters || {}, appState,
            onIncrement: async (inc) => {
              const ev = progressWatcher.consume(inc);
              if (!ev) return false;
              if (ev.title != null) $page.variables.mateuProgressTitle = ev.title;
              if (ev.text != null) $page.variables.mateuProgressText = ev.text;
              if (ev.value != null) $page.variables.mateuProgressValue = Math.round(ev.value * 100);
              if (ev.kind === 'open' && !progressOpen) {
                progressOpen = true;
                await Actions.callComponentMethod(context, {
                  selector: '#mateuProgressDialog', method: 'open',
                });
              }
              if (ev.rest.commands.length || ev.rest.messages.length) {
                applyInc(ev.rest);
              }
              return true;
            },
          });
        increments.forEach(applyInc);
        if (progressOpen) {
          await new Promise((resolve) => setTimeout(
            resolve, progressWatcher.closeAfter != null ? progressWatcher.closeAfter : 600));
          await Actions.callComponentMethod(context, {
            selector: '#mateuProgressDialog', method: 'close',
          });
        }
      } else {
        applyInc(await bridge.runMateuAction(
          base, host, route, id, componentState, { parameters: parameters || {}, appState }));
      }
      // ROUTE-FLIP del mediador del HOST: un crud de PÁGINA no contesta el detalle, contesta
      // un fragmento solo-estado cuyo `_route` apunta a él (clic de fila → /2CSXZN, New →
      // /new, volver → /list). Sin seguirlo no pasa NADA al pulsar: la petición sale, el
      // servidor contesta 200 y el listado se queda igual. La isla ya lo seguía; el host no.
      //
      // El wire separa DOS cosas que se parecen y no son la misma: `_route` es la ruta
      // INTERNA que hay que recargar (`/list`) y el `PushStateToHistory` es la URL, relativa
      // al mediador (`''` para el listado). Usar la primera como URL deja direcciones que no
      // existen — /booking/bookings/list en vez de /booking/bookings.
      const urlPush = reg.effects ? reg.effects.urlPush : undefined;
      const flipRoute = bridge.routeFlipOf(
        host && host.state, reg.contexts[bridge.HOST_ID], lastIncrement, route);
      if (flipRoute) {
        const flipOutbound = (reg.contexts[bridge.HOST_ID] || {}).outbound || {};
        const mediatorRoute = flipOutbound.route || route || '';
        applyInc(await bridge.loadRoute(base, flipRoute, '', {
          consumedRoute: flipOutbound.consumedRoute || mediatorRoute,
          serverSideType: flipOutbound.serverSideType,
          appState,
          componentState: reg.contexts[bridge.HOST_ID].state,
        }));
        // lo que acaba de llegar puede pedir su carga OnLoad (el listado pide `search`; sin
        // esto se vuelve del detalle a una tabla vacía, con sus columnas y sin una fila)
        const reloaded = reg.contexts[bridge.HOST_ID];
        for (const triggerActionId of bridge.onLoadTriggers(reloaded)) {
          const reloadedListing = bridge.listingOf(reloaded);
          applyInc(await bridge.runMateuAction(
            base, reloaded, flipRoute, triggerActionId,
            Object.assign({}, reloaded.state,
              { page: 0, size: (reloadedListing && reloadedListing.pageSize) || 20 }),
            { appState }));
        }
        // la URL acompaña al contenido: el detalle es direccionable y el botón atrás
        // devuelve al listado (el popstate de la shell recarga la ruta anterior)
        if (urlPush != null) {
          const urlRoute = bridge.composeInnerRoute(mediatorRoute, urlPush);
          $application.variables.mateuSelectedRoute = urlRoute;
          try {
            window.history.pushState(
              null, '', window.__mateuUrlPathMode ? (urlRoute || '/') : '#' + urlRoute);
          } catch (ignored) { /* sin history en algunos contextos */ }
        }
      }

      const effects = reg.effects;

      // eventos del bus (CloseModal/DispatchEvent) → triggers OnCustomEvent suscritos
      for (const busEvent of allEvents) {
        const hostNow = reg.contexts[bridge.HOST_ID];
        for (const triggerActionId of bridge.eventTriggersOf(hostNow, busEvent.name)) {
          const listing = bridge.listingOf(hostNow);
          const refresh = await bridge.runMateuAction(
            base, hostNow, route, triggerActionId,
            Object.assign({}, hostNow.state, busEvent.detail || {},
              { page: 0, size: (listing && listing.pageSize) || 20 }),
            { appState, parameters: busEvent.detail || {} },
          );
          reg = bridge.reduceContexts(reg, refresh);
          if (touchesHost(refresh)) hostRepainted = true;
          allToasts.push.apply(allToasts, reg.effects.toasts || []);
        }
      }

      $application.variables.mateuRegistry = reg;

      // proyecciones: drawer, listing, form
      const overlayNow = bridge.overlayOf(reg);
      $application.variables.mateuDrawer = overlayNow || { title: '', fields: [], actions: [], blocks: [], texts: [], state: {} };
      // un overlay Dialog va al MODAL (oj-dialog, decisión puntual); el resto al drawer
      const esModal = !!(overlayNow && overlayNow.isDialog);
      $application.variables.mateuDrawerOpen = !!overlayNow && !esModal;
      if (esModal && !$page.variables.mateuModalOpen) {
        $page.variables.mateuModalOpen = true;
        await Actions.callComponentMethod(context, { selector: '#mateuModal', method: 'open' });
      } else if (!esModal && $page.variables.mateuModalOpen) {
        $page.variables.mateuModalOpen = false;
        await Actions.callComponentMethod(context, { selector: '#mateuModal', method: 'close' });
      }
      if (!overlayNow || !overlayBefore || overlayNow.id !== overlayBefore.id) {
        $page.variables.mateuDrawerDraft = {};
      }

      const hostAfter = reg.contexts[bridge.HOST_ID];
      const listingSummary = bridge.listingOf(hostAfter);
      $application.variables.mateuListing = listingSummary;
      $application.variables.mateuListingRows = listingSummary ? listingSummary.rows : [];

      // REMONTAJE del foldout: los bindings dentro de oj-sp-foldout-panel no re-ligan
      // las application variables (gotcha del evaluador CSP) — null → tick → proyección
      // nueva hace que el oj-bind-if recree el subárbol con los bloques frescos.
      // SOLO si algún incremento REPINTÓ el host (hostRepainted) — abrir un drawer (Add)
      // no lo toca, y remontar aquí reseteaba el plegado/animación del foldout.
      if (hostRepainted) {
        const foldoutProjection = bridge.foldoutOf(hostAfter);
        const foldoutBefore = $application.variables.mateuFoldout;
        const contentOf = (proj) => proj
          ? { overview: proj.overview, panels: proj.panels }
          : { overview: { blocks: [] }, panels: [] };
        const mismaEstructura = foldoutBefore && foldoutProjection
          && (foldoutBefore.panels || []).length === (foldoutProjection.panels || []).length;
        if (mismaEstructura) {
          // actualización IN SITU: los paneles están estampados UNA vez (su for-each
          // pierde los anclajes si se re-stampa — cirugía DOM del foldout); el contenido
          // vive en mateuFoldoutContent, cuyos bindings SÍ re-evalúan dentro del panel
          $application.variables.mateuFoldoutContent = contentOf(foldoutProjection);
        } else {
          // estructura distinta (nº de paneles) o entra/sale del modo foldout:
          // remontaje completo null→tick
          if (foldoutBefore && foldoutProjection) {
            $application.variables.mateuFoldout = null;
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
          // contenido ANTES que estructura (los paneles lo leen al estamparse)
          $application.variables.mateuFoldoutContent = contentOf(foldoutProjection);
          $application.variables.mateuFoldout = foldoutProjection;
        }
      }
      $application.variables.mateuWizard = bridge.wizardOf(hostAfter);

      // header de colección: toolbar del crud → primaryAction/secondaryActions
      const toolbar = listingSummary ? listingSummary.toolbar : [];
      const primaryToolbar = toolbar.length ? toolbar[0] : null;
      $application.variables.mateuListPrimary = primaryToolbar
        ? { label: primaryToolbar.label } : { label: '', display: 'off' };
      $application.variables.mateuListPrimaryId = primaryToolbar ? primaryToolbar.actionId : '';
      $application.variables.mateuListSecondary = toolbar.slice(1).map((b) => ({ id: b.actionId, value: b.actionId, label: b.label }));
      const summary = bridge.summarizeHost(reg, route);
      $application.variables.mateuHostTitle = summary.title;
      $application.variables.mateuHostText = summary.text;
      $application.variables.mateuFormMetadata = summary.formMetadata;
      $application.variables.mateuFormFieldsList = summary.fields;
      $application.variables.mateuFormValue = summary.formValue;
      $application.variables.mateuFormActions = summary.actions;
      const wizardNow = $application.variables.mateuWizard;
      if (wizardNow) {
        const forwardBtn = bridge.wizardForwardOf(hostAfter);
        const forward = forwardBtn
          || summary.actions.find((a) => a.actionId !== 'back');
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
      const islandSeed = islandAfter ? JSON.stringify(islandAfter.initialData || {}) : '';
      if (islandAfter && (!reg.contexts[islandAfter.id]
          || $application.variables.mateuIslandSeed !== islandSeed)) {
        // SIN atajo: el baile de 2 pasos captura las ACTIONS del wrapper (flag sse).
        // RECARGA también si el SEED cambió (p.ej. seleccionarPax re-siembra paxIndex)
        reg = await bridge.loadRouteInto(base, reg, islandAfter.route, islandAfter.id, {
          appState,
          componentState: islandAfter.initialData || {},
        });
        $application.variables.mateuRegistry = reg;
      }
      $application.variables.mateuIslandId = islandAfter ? islandAfter.id : '';
      $application.variables.mateuIslandSeed = islandSeed;
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
      $application.variables.mateuWelcomeTrendItems =
        welcome && welcome.trend ? welcome.trend.items : [];
      const overviewProjection = bridge.generalOverviewOf(hostAfter);
      const itemProjection = bridge.itemOverviewOf(hostAfter);
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
      // foldout con EntityHeader (la 360): el header de pantalla se conserva
      const hostEntity2 = (!esWizard2 && (sinOtrasRamas2 || $application.variables.mateuFoldout))
        ? bridge.entityHeaderOf(hostAfter) : null;
      const hostBlocks2 = (!esWizard2 && sinOtrasRamas2)
        ? bridge.hostContentOf(hostAfter, islandRawBlocks2,
            { title: summary.title, activeTab: $application.variables.mateuActiveTab, dropEntityHeader: !!hostEntity2 }) : null;
      // los bloques MANDAN cuando son ricos (EntityHeader/Meter/Ledger…): el form genérico
      // y el texto plano se suprimen — misma regla que los arquetipos
      const hostBlocksRicos2 = !!(hostBlocks2 && hostBlocks2.some((block) => (block.items || []).some((a) => a.isEntityHeader || a.isTaskProgress || a.isMeter
        || a.isStatusList || a.isLedger || a.isPayment || a.isResourceGrid || a.isAddOns
        || a.isStat || a.isNotice || a.isPropertyRow || a.isTabs || a.isGrid || a.isElement)));
      // las acciones del toolbar de la Page (se calculan antes del header por si algún
      // template de página de entidad las recoloca)
      const hostToolbarA = bridge.pageToolbarOf(hostAfter);
      // GENERAL OVERVIEW nativo: página de entidad con DOS bloques-columna → el
      // template oj-sp-general-overview-page (slots main/info, header integrado)
      const zonedGop2 = (hostBlocks2 || []).filter((b) => /oj-md-/.test(b.blockClass || ''));
      const gopOn2 = !!(hostEntity2 && (hostBlocks2 || []).length === 2 && zonedGop2.length === 2);
      const gopFold2 = (block) => {
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
      $application.variables.mateuGop = gopOn2
        ? { on: true, main: gopFold2(zonedGop2[0]), info: gopFold2(zonedGop2[1]) }
        : { on: false, main: { title: '', blocks: [] }, info: { title: '', blocks: [] } };
      $application.variables.mateuHostContent = (!gopOn2 && hostBlocksRicos2 ? hostBlocks2 : null) || [];
      bridge.mountElementsSoon(bridge.elementAtomsOf($application.variables.mateuHostContent));
      // el oj-tab-bar parsea su <ul> al inicializarse y los <li> del for-each llegan
      // después: sin refresh se queda con la lista sin estilar (misma trampa que el
      // oj-navigation-list del navigator)
      if (($application.variables.mateuHostContent || []).some((b) => (b.items || []).some((a) => a.isTabs))) {
        try {
          await Actions.callComponentMethod(context, { selector: '#mateuContentTabs', method: 'refresh' });
        } catch (ignored) { /* aún sin montar */ }
      }
      if (hostBlocksRicos2) {
        $application.variables.mateuFormMetadata = null;
        $application.variables.mateuFormFieldsList = [];
        $application.variables.mateuFormActions = [];
        $application.variables.mateuHostText = '';
      }
      $application.variables.mateuWizardContent = (esWizard2
        ? bridge.hostContentOf(hostAfter, islandRawBlocks2, { forWizard: true, title: summary.title }) : null) || [];
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
        || ($application.variables.mateuFoldout && !hostEntity2));
      const showHeaderA = !integratedHeader;
      const pwAfter = $application.variables.mateuMenuDrawerMode
        ? 'edgeToEdge' : ((hostAfter && hostAfter.pageWidth) || 'fixed');
      const showBandA = showHeaderA && pwAfter !== 'edgeToEdge';
      const showListBandA = !!listingSummary && pwAfter !== 'edgeToEdge';
      // las acciones del toolbar de la Page van al HEADER (primary/secondary de la banda)
      // la cabecera Spectra solo enseña la primaria y la PRIMERA secundaria; el resto va al
      // desbordamiento, así que quién es la primaria decide qué se ve
      const primaryBtnA = bridge.primaryToolbarButton(hostToolbarA);
      // volver NO es una acción más: es la afordancia goToParent de la cabecera RDS
      const backBtnA = bridge.backToolbarButton(hostToolbarA);
      $application.variables.mateuPageHeader = {
        // con EntityHeader en el host (la 360), el header de PANTALLA muestra al huésped
        title: hostEntity2 ? hostEntity2.title : (summary.title || ''),
        subtitle: hostEntity2 ? hostEntity2.subtitle : '',
        facts: hostEntity2 ? hostEntity2.facts : [],
        showBand: showBandA && !gopOn2,
        showInline: showHeaderA && !showBandA && !gopOn2,
        showListBand: showListBandA,
        showListInline: !!listingSummary && !showListBandA,
        primary: primaryBtnA ? { label: primaryBtnA.label, display: primaryBtnA.disabled ? 'disabled' : 'on' } : { label: '', display: 'off' },
        primaryId: primaryBtnA ? primaryBtnA.actionId : '',
        secondary: hostToolbarA.filter((b) => b !== primaryBtnA && b !== backBtnA)
          .map((b) => ({ id: b.actionId, value: b.actionId, label: b.label })),
        goToParent: !!backBtnA,
        backId: backBtnA ? backBtnA.actionId : '',
        backLabel: backBtnA ? backBtnA.label : '',
        toolbar: hostToolbarA,
      };
      // el rótulo del goToParent es "Parent page" por defecto; lo pone el botón de vuelta
      $application.variables.mateuPageHeaderTranslations = backBtnA
        ? { goToParent: backBtnA.label } : {};

      // El toolbar de la Page se pinta UNA sola vez. Las dos proyecciones —la cabecera
      // (pageToolbarOf) y la fila de botones bajo el formulario (actionsOf)— salen del MISMO
      // `metadata.toolbar`, así que al entrar en un detalle salían Back to list / Add another /
      // Edit arriba y otra vez abajo. Manda la cabecera cuando se pinta; si no hay cabecera, la
      // fila de abajo es la única y se queda entera.
      if (($application.variables.mateuPageHeader.showBand || $application.variables.mateuPageHeader.showInline) && hostToolbarA.length) {
        const enCabecera = {};
        for (const boton of hostToolbarA) enCabecera[boton.actionId] = true;
        $application.variables.mateuFormActions =
          ($application.variables.mateuFormActions || []).filter((a) => !enCabecera[a.actionId]);
      }
      $application.variables.mateuShellPageLayout = pwAfter === 'fixed' ? 'fixedWidth' : pwAfter;
      // los márgenes del contenido se RECALCULAN también tras una acción (una acción
      // puede cambiar la rama/el formato de página: p.ej. en-casa → check-out) — misma
      // lógica que onMateuNavigate (sin recalcular, el -40px de solape de banda del
      // estado anterior se arrastraba a la pantalla siguiente)
      const pageStyleA = $application.variables.mateuMenuDrawerMode
        ? bridge.pageStyleOf({ pageWidth: 'edgeToEdge' })
        : bridge.pageStyleOf(hostAfter);
      $application.variables.mateuPageMaxWidth = pageStyleA.maxWidth;
      $application.variables.mateuPageMargin = pageStyleA.margin;
      $application.variables.mateuPagePadding = pageStyleA.padding;
      if ($application.variables.mateuWelcome || $application.variables.mateuOverview
          || $application.variables.mateuWizard || listingSummary
          || $application.variables.mateuPageHeader) {
        $application.variables.mateuPagePadding = '0';
      }
      if (showBandA || showListBandA) {
        $application.variables.mateuBandBoxMargin = $application.variables.mateuPageMargin;
        const marginPartsA = ($application.variables.mateuPageMargin || '0').split(' ');
        marginPartsA[0] = '-40px';
        if (marginPartsA.length === 1) marginPartsA.push('auto');
        $application.variables.mateuPageMargin = marginPartsA.join(' ');
      } else {
        $application.variables.mateuBandBoxMargin = '0 auto';
      }
      $application.variables.mateuDirty = false;

      // toast con el patrón del starter: variable + open() del oj-sp-messages-toast local
      for (const toast of allToasts) {
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
        if ($page.variables.mateuModalOpen) {
          $page.variables.mateuModalOpen = false;
          await Actions.callComponentMethod(context, { selector: '#mateuModal', method: 'close' });
        }
        await Actions.fireEvent(context, {
          name: 'application:mateuNavigate',
          payload: { route: effects.navigate.route },
        });
      }
    }
  }

  return runMateuAction;
});
