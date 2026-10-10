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
        // su pantalla ya no está (se navegó mientras volaba): muere en silencio
        if (bridge.isStaleResponse(e)) return undefined;
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
      // «ir al padre» sin botón de vuelta: lo puso el rastro automático, y es una navegación —
      // la misma que el menú (navigation-requested, que escucha la shell)
      // la vuelta atrás de la página NOT FOUND (navigationAction del oj-sp-empty-state): navegar a
      // la ruta que manda el server (el padre del registro que no existe, o la home)
      if (id === '__notFoundBack') {
        const backRoute = ($application.variables.mateuNotFound || {}).backRoute;
        if (backRoute) {
          document.dispatchEvent(new CustomEvent('navigation-requested', {
            detail: { route: backRoute }, bubbles: true, composed: true,
          }));
        }
        return;
      }
      if (id === '__goToParent') {
        const parentRoute = ($application.variables.mateuPageHeader || {}).parentRoute;
        if (parentRoute) {
          document.dispatchEvent(new CustomEvent('navigation-requested', {
            detail: { route: parentRoute }, bubbles: true, composed: true,
          }));
        }
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
      let componentState = overlayBefore
        ? Object.assign({}, overlayBefore.state, $page.variables.mateuDrawerDraft)
        : Object.assign({}, host && host.state, $page.variables.mateuDraft);

      // Una acción del host de un listado con selección lleva las filas marcadas
      // (crud_selected_items), como en Vaadin. Las del drawer no: van sobre SU registro.
      const listing = $application.variables.mateuListing;
      if (!overlayBefore && listing && listing.rowsSelectionEnabled) {
        componentState = bridge.withListingSelection(componentState, listing,
          $application.variables.mateuListingRows, $application.variables.mateuListingSelection);
        if ((listing.selectionRequired || []).indexOf(id) >= 0
            && !componentState.crud_selected_items.length) {
          $page.variables.mateuToastText = 'You first need to select some rows';
          await Actions.callComponentMethod(context, { selector: '#mateuToast', method: 'open' });
          return;
        }
      }

      // validationRequired (el next de un wizard, el save de un formulario): los obligatorios
      // vacíos del formulario se marcan en su campo — el mensaje del propio componente, como en
      // cualquier formulario Redwood —, el foco va al primero y la acción no sale. Es lo que
      // Vaadin hace en el navegador; el servidor lo vuelve a comprobar.
      const validation = !overlayBefore && bridge.validationOf(host, id);
      if (validation) {
        const missing = bridge.formErrorsOf($application.variables.mateuFormSections,
          $page.variables.mateuDraft, validation.fields);
        if (missing.length) {
          await bridge.showFieldErrors(missing);
          return;
        }
      }

      // ACCIONES DE LISTA: el "+" / Editar / Quitar de una lista del formulario y los botones
      // de su editor modal (Save, Save and add another, Cancel, Prev/Next). Van al ServerSide
      // del CONTENEDOR (el formulario o el wizard) con SU estado, y la fila del diálogo en
      // parameters.initiatorState — como Vaadin desde 367. Con la fila como componentState el
      // wizard volvía vacío a su primer paso.
      const listReq = !overlayBefore && bridge.listActionRequestOf(before, id, {
        hostDraft: $page.variables.mateuDraft,
        rowDraft: $page.variables.mateuRowDraft,
        parameters: parameters || {},
      });
      let transportCtx = host;
      if (listReq) {
        // Save / Create validan la fila EN el diálogo: los obligatorios vacíos marcan su
        // campo y la acción no sale (lo que en Vaadin hace validationRequired)
        if (bridge.ROW_VALIDATING_VERBS[listReq.verb]) {
          const rowCtx = before.contexts[listReq.fieldId + '-container'];
          const rowErrors = bridge.validateRow(rowCtx, $page.variables.mateuRowDraft);
          if (Object.keys(rowErrors).length) {
            $page.variables.mateuRowErrors = rowErrors;
            const withErrors = bridge.rowEditorOf(before, {
              rowDraft: $page.variables.mateuRowDraft, errors: rowErrors,
            });
            if (withErrors) {
              $page.variables.mateuRowEditor = withErrors;
            }
            return;
          }
        }
        componentState = listReq.componentState;
        parameters = listReq.parameters;
        transportCtx = listReq.ctx;
      }

      // A QUÉ ServerSide va la acción. La de un formulario embebido en el overlay (el «Cancel
      // booking» de una reserva, un EmbeddedView) va a ESE formulario, con su estado y sin
      // ruta; la que declara el componente del host (la vista de la reserva, no el crud por el
      // que se cargó: «Ver recorrido», «Activate») va a él; el resto sube al mediador.
      let transportExtra = {};
      const overlayTransport = overlayBefore && !listReq ? bridge.overlayTransportOf(before, id) : null;
      if (overlayTransport) {
        transportCtx = overlayTransport;
        transportExtra = { route: '', consumedRoute: '' };
      } else if (!listReq && !overlayBefore) {
        transportCtx = bridge.actionTransportOf(host, id);
      }

      // confirmationRequired: el diálogo de confirmación ANTES de salir (con los textos de la
      // acción); «No», ✕ o Esc la dejan sin enviar. Vaadin lo hace en el navegador; aquí se
      // saltaba y la acción salía sin preguntar.
      const confirmation = bridge.confirmationOf(transportCtx, id);
      if (confirmation) {
        $page.variables.mateuConfirm = confirmation;
        const answer = bridge.awaitConfirmation();
        await Actions.callComponentMethod(context, { selector: '#mateuConfirm', method: 'open' });
        if (!(await answer)) {
          return;
        }
      }

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
        bridge.applyDomEffects(reg.effects);
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
          base, transportCtx, route, id, componentState, {
            ...transportExtra,
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
          base, transportCtx, route, id, componentState,
          { ...transportExtra, parameters: parameters || {}, appState }));
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
        const mediatorRoute = bridge.mediatorBaseOf(flipOutbound, route);
        // la URL acompaña al contenido: el detalle es direccionable y el botón atrás devuelve al
        // listado (el popstate de la shell recarga la ruta anterior). Se empuja ANTES de cargar
        // el detalle, como un enlace: empujada al final, un "atrás" pulsado durante la carga no
        // encontraba esta entrada y se saltaba la del listado.
        if (urlPush != null) {
          const urlRoute = bridge.composeInnerRoute(mediatorRoute, urlPush);
          $application.variables.mateuSelectedRoute = urlRoute;
          $application.variables.mateuSelectedNavId = urlRoute;
          try {
            window.history.pushState(
              null, '', window.__mateuUrlPathMode ? (urlRoute || '/') : '#' + urlRoute);
          } catch (ignored) { /* sin history en algunos contextos */ }
        }
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
          bridge.applyDomEffects(reg.effects);
          if (touchesHost(refresh)) hostRepainted = true;
          allToasts.push.apply(allToasts, reg.effects.toasts || []);
        }
      }

      // lookups remotos de lo que acaba de llegar (el formulario de un paso nuevo, un alta)
      try {
        reg = await bridge.loadLookups(base, reg, bridge.HOST_ID, { appState, route, draft: $page.variables.mateuDraft });
      } catch (ignored) { /* sin opciones se quedan como estaban */ }

      // El SELECTOR de un @Searchable que se acaba de abrir: lo escrito en el formulario se funde
      // en su estado — el borrador se vacía al cerrarse el diálogo, y lo elegido vuelve al estado
      const pickerOpened = !!bridge.searchPickerOf(reg) && !bridge.searchPickerOf(before);
      if (pickerOpened) {
        reg = bridge.withContextState(reg, bridge.HOST_ID, $page.variables.mateuDraft);
        bridge.clearFieldErrorMarks(id.indexOf('codesearch-') === 0 ? id.substring('codesearch-'.length) : null);
      }

      $application.variables.mateuRegistry = reg;

      // Una respuesta que SÓLO trae mensajes (p.ej. el «falta la tarifa» con el que un wizard
      // no deja salir del paso) no cambia la pantalla: re-proyectarla volvía a pintar el
      // formulario con el estado del servidor y se llevaba lo que el usuario había escrito.
      const onlyMessages = !hostRepainted && !flipRoute && !allEvents.length && !overlayBefore
        && !bridge.overlayOf(reg) && lastIncrement && !(lastIncrement.fragments || []).length
        && !(lastIncrement.commands || []).length;
      if (onlyMessages) {
        for (const toast of allToasts) {
          $page.variables.mateuToastText = toast.text;
          await Actions.callComponentMethod(context, { selector: '#mateuToast', method: 'open' });
        }
        return;
      }

      // proyecciones: drawer, listing, form
      const overlayNow = bridge.overlayOf(reg);
      $application.variables.mateuDrawer = overlayNow || { title: '', fields: [], sections: [], actions: [], blocks: [], texts: [], state: {} };
      // un overlay Dialog va al MODAL (oj-dialog, decisión puntual); el resto al drawer — salvo
      // el selector de un @Searchable, que tiene su propio diálogo (#mateuPicker)
      const pickerNow = bridge.searchPickerOf(reg);
      const esModal = !!(overlayNow && overlayNow.isDialog) && !pickerNow;
      $application.variables.mateuDrawerOpen = !!overlayNow && !esModal && !pickerNow;
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
      if (pickerNow) {
        $page.variables.mateuPicker = pickerNow;
        $page.variables.mateuPickerRows = pickerNow.rows;
      } else if ($page.variables.mateuPickerOpen) {
        // elegido (o cerrado por el servidor): la marca baja ANTES del close — su ojBeforeClose
        // no es un descarte del usuario
        $page.variables.mateuPickerOpen = false;
        await Actions.callComponentMethod(context, { selector: '#mateuPicker', method: 'close' });
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
      // Lo que esta chain asigna se lee de las constantes, no de vuelta de la variable: una
      // variable `any` de VB que tenía un objeto y se pone a null se lee DENTRO de la misma chain
      // como un proxy truthy (los bindings sí ven el null) — ver onMateuNavigate.
      let foldoutNow = $application.variables.mateuFoldout;
      if (hostRepainted) {
        const foldoutProjection = bridge.foldoutOf(hostAfter);
        foldoutNow = foldoutProjection;
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
        bridge.mountElementsSoon(bridge.foldoutElementAtomsOf($application.variables.mateuFoldoutContent), 60);
      }
      const wizardProjection = bridge.wizardOf(hostAfter);
      $application.variables.mateuWizard = wizardProjection;
      if (wizardProjection) bridge.guardGuidedProcess();

      // header de colección: toolbar del crud → primaryAction/secondaryActions
      const toolbar = listingSummary ? listingSummary.toolbar : [];
      const primaryToolbar = toolbar.length ? toolbar[0] : null;
      $application.variables.mateuListPrimary = primaryToolbar
        ? { label: primaryToolbar.label } : { label: '', display: 'off' };
      $application.variables.mateuListPrimaryId = primaryToolbar ? primaryToolbar.actionId : '';
      $application.variables.mateuListSecondary = toolbar.slice(1).map((b) => ({ id: b.actionId, value: b.actionId, label: b.label }));
      const summary = bridge.summarizeHost(reg, route);
      // dentro de un maestro (P1): la cabecera lleva su título cuando la pestaña no trae uno
      const levels = reg.appLevels || [];
      if (!summary.title && levels.length) {
        summary.title = levels[levels.length - 1].title;
      }
      $application.variables.mateuHostTitle = summary.title;
      $application.variables.mateuHostText = summary.text;
      $application.variables.mateuFormMetadata = summary.formMetadata;
      $application.variables.mateuFormFieldsList = summary.fields;
      $application.variables.mateuFormSections = summary.sections;
      $application.variables.mateuFormValue = summary.formValue;
      $application.variables.mateuFormActions = summary.actions;
      const wizardNow = wizardProjection;
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
        ? { fields: bridge.fieldListOf(islandCtxAfter.tree, islandCtxAfter.state, islandCtxAfter.data),
            sections: bridge.formSectionsOf(islandCtxAfter.tree, islandCtxAfter.state, islandCtxAfter.data),
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
      const queueNow = bridge.taskQueueOf(hostAfter.tree);
      $application.variables.mateuQueue = queueNow;
      $application.variables.mateuHostEmpty = bridge.emptyStateOf(hostAfter.tree);
      // la constante, no la variable: un `any` puesto a null se lee como proxy truthy en la chain
      const notFoundAfter = bridge.notFoundOf(hostAfter.tree, document.documentElement.lang || navigator.language);
      $application.variables.mateuNotFound = notFoundAfter;
      // arquetipos compuestos (welcome / general overview / item overview)
      const welcome = bridge.welcomeOf(hostAfter);
      $application.variables.mateuWelcomeTrendItems =
        welcome && welcome.trend ? welcome.trend.items : [];
      const overviewProjection = bridge.generalOverviewOf(hostAfter);
      const itemProjection = bridge.itemOverviewOf(hostAfter);
      // el aspecto del hero rota al ENTRAR en una welcome y se conserva mientras se siga en ella:
      // la respuesta de una acción lanzada desde ella (un CTA que navega) la reproyecta, y un
      // tono nuevo en ese instante era el hero cambiando de color antes de irse (welcomeLookOf)
      const previousLook = $application.variables.mateuWelcome ? {
        key: $application.variables.mateuWelcomeKey,
        theme: $application.variables.mateuWelcomeTheme,
        illuBg: $application.variables.mateuWelcomeIlluBg,
        illu: $application.variables.mateuWelcomeIllu,
      } : null;
      $application.variables.mateuWelcome = welcome;
      if (welcome) {
        const look = bridge.welcomeLookOf(bridge.welcomeKeyOf(hostAfter), previousLook);
        $application.variables.mateuWelcomeKey = look.key;
        $application.variables.mateuWelcomeTheme = look.theme;
        $application.variables.mateuWelcomeIlluBg = look.illuBg;
        $application.variables.mateuWelcomeIllu = look.illu;
      }
      $application.variables.mateuOverview = overviewProjection;
      $application.variables.mateuOverviewOptions = overviewProjection ? overviewProjection.switcherOptions : [];
      $application.variables.mateuItemOv = itemProjection;
      $application.variables.mateuItemTabTexts = itemProjection && itemProjection.tabs.length
        ? itemProjection.tabs[0].texts : [];
      if (welcome || overviewProjection || itemProjection) {
        // sus campos/botones los pintan las ramas del arquetipo (o los paneles del foldout:
        // la vista @FoldoutDetail de un crud), no el form genérico
        $application.variables.mateuFormMetadata = null;
        $application.variables.mateuFormFieldsList = [];
        $application.variables.mateuFormSections = [];
        $application.variables.mateuFormActions = [];
      }
      // contenido display del HOST / de los pasos del wizard (detalle standalone)
      const islandRawBlocks2 = islandCtxAfter ? bridge.islandContentOf(islandCtxAfter) : null;
      const esWizard2 = !!wizardProjection;
      const sinOtrasRamas2 = !listingSummary && !welcome && !overviewProjection && !itemProjection
        && !queueNow && !foldoutNow;
      // foldout con EntityHeader (la 360): el header de pantalla se conserva
      const hostEntity2 = (!esWizard2 && (sinOtrasRamas2 || foldoutNow))
        ? bridge.entityHeaderOf(hostAfter) : null;
      let hostBlocks2 = (!esWizard2 && sinOtrasRamas2)
        ? bridge.hostContentOf(hostAfter, islandRawBlocks2,
            { title: summary.title, activeTabs: $application.variables.mateuActiveTabs, dropEntityHeader: !!hostEntity2 }) : null;
      // los @Subresource a la vista: los ya cargados conservan su tabla, los nuevos se cargan
      if (hostBlocks2) {
        reg = await bridge.loadSubresources(base, reg, hostBlocks2, { appState });
        $application.variables.mateuRegistry = reg;
        hostBlocks2 = bridge.withSubresources(hostBlocks2, reg.contexts);
      }
      // los bloques MANDAN cuando son ricos (EntityHeader/Meter/Ledger, pestañas, tablas…): el
      // form genérico y el texto plano se suprimen — misma regla que los arquetipos. También
      // cuando el form no tiene nada que pintar (una página de solo lectura son textos)
      const hostBlocksRicos2 = bridge.hostContentShown(hostBlocks2, summary);
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
      for (const barId of bridge.tabBarIdsOf($application.variables.mateuHostContent)) {
        try {
          await Actions.callComponentMethod(context, { selector: '#' + barId, method: 'refresh' });
        } catch (ignored) { /* aún sin montar */ }
      }
      if (hostBlocksRicos2) {
        $application.variables.mateuFormMetadata = null;
        $application.variables.mateuFormFieldsList = [];
        $application.variables.mateuFormSections = [];
        $application.variables.mateuFormActions = [];
        $application.variables.mateuHostText = '';
      }
      // el PASO del wizard (mismo reparto que onMateuNavigate): cada campo UNA vez, el pie
      // Back/Next a la barra del pie con el tren arriba, contenido RICO → sin form genérico
      const wizardStep2 = esWizard2 ? bridge.wizardStepViewOf(hostAfter, islandRawBlocks2,
        { title: summary.title, sections: $application.variables.mateuFormSections }) : null;
      const wizardH2 = !!(wizardStep2 && wizardStep2.wizard.horizontal);
      $application.variables.mateuWizardContent = (wizardStep2 && !wizardH2 ? wizardStep2.content : null) || [];
      $application.variables.mateuWizardStep = wizardH2
        ? { on: true, title: wizardStep2.title, stepLabel: wizardStep2.wizard.currentLabel, nav: wizardStep2.nav }
        : { on: false, title: '', stepLabel: '', nav: [] };
      if (wizardStep2) {
        $application.variables.mateuFormSections = wizardStep2.sections;
        if (!wizardStep2.sections.length) $application.variables.mateuFormFieldsList = [];
      }
      if (wizardH2) {
        $application.variables.mateuHostContent = wizardStep2.content;
        bridge.mountElementsSoon(bridge.elementAtomsOf(wizardStep2.content));
      }

      // regla general: el header de página lo pinta SIEMPRE un header de vb; solo los
      // templates que ya integran el suyo (guided process / general overview / welcome /
      // smart-filter-search del listado) lo suprimen
      const integratedHeader = !!(wizardProjection || welcome
        || overviewProjection || listingSummary
        || (foldoutNow && !hostEntity2 && !hostToolbarA.length));
      const showHeaderA = !integratedHeader && !notFoundAfter;
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
      const parentCrumbA = backBtnA ? undefined : bridge.parentCrumb(summary.trail);
      $application.variables.mateuPageHeader = {
        // con EntityHeader en el host (la 360), el header de PANTALLA muestra al huésped
        title: hostEntity2 ? hostEntity2.title : (summary.title || ''),
        subtitle: hostEntity2 ? hostEntity2.subtitle : bridge.pageSubtitleOf(hostAfter),
        // sin EntityHeader, los @KPI de la Page (los totales de la reserva) son sus facts
        facts: hostEntity2 ? hostEntity2.facts : bridge.pageKpisOf(hostAfter),
        showBand: showBandA && !gopOn2,
        showInline: showHeaderA && !showBandA && !gopOn2,
        showListBand: showListBandA,
        showListInline: !!listingSummary && !showListBandA,
        primary: primaryBtnA ? { label: primaryBtnA.label, display: primaryBtnA.disabled ? 'disabled' : 'on' } : { label: '', display: 'off' },
        primaryId: primaryBtnA ? primaryBtnA.actionId : '',
        secondary: hostToolbarA.filter((b) => b !== primaryBtnA && b !== backBtnA)
          .map((b) => ({ id: b.actionId, value: b.actionId, label: b.label })),
        // sin botón de vuelta, el «ir al padre» sale del rastro automático (breadcrumbs.mjs):
        // Redwood no tiene migas, y ésta es la afordancia que su cabecera ofrece en su lugar
        goToParent: !!backBtnA || !!parentCrumbA,
        backId: backBtnA ? backBtnA.actionId : (parentCrumbA ? '__goToParent' : ''),
        parentRoute: !backBtnA && parentCrumbA ? parentCrumbA.route : '',
        backLabel: backBtnA ? backBtnA.label : (parentCrumbA ? parentCrumbA.text : ''),
        toolbar: hostToolbarA,
      };
      // el rótulo del goToParent es "Parent page" por defecto; lo pone el botón de vuelta
      $application.variables.mateuPageHeaderTranslations = backBtnA
        ? { goToParent: backBtnA.label } : (parentCrumbA ? { goToParent: parentCrumbA.text } : {});

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
      if (welcome || overviewProjection
          || wizardProjection || listingSummary
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

      // EDITOR DE FILA (oj-dialog): abierto mientras el contenedor tenga `_show_detail[campo]`
      // y el formulario de la fila haya llegado a `<campo>-container`. Sus lookups se cargan al
      // abrirse (y con cada fila nueva: "Save and add another" trae otro ServerSide) contra el
      // ServerSide de la FILA, con el estado de la fila.
      reg = $application.variables.mateuRegistry;
      if (listReq) {
        $page.variables.mateuRowDraft = {};
        $page.variables.mateuRowErrors = {};
      }
      let rowEditorNow = bridge.rowEditorOf(reg);
      if (rowEditorNow) {
        const pendingLookups = bridge.pendingLookupsOf(reg.contexts[rowEditorNow.id]);
        if (pendingLookups.length) {
          const editorId = rowEditorNow.id;
          const found = await Promise.all(pendingLookups.map((lookup) => {
            const rq = bridge.lookupRequestOf(reg, editorId, lookup.fieldId);
            return rq
              ? bridge.runMateuAction(base, rq.ctx, route, rq.actionId, rq.componentState,
                { parameters: rq.parameters, appState, idempotent: true }).catch(() => null)
              : null;
          }));
          for (const inc of found) {
            if (inc) { reg = bridge.reduceContexts(reg, inc); bridge.applyDomEffects(reg.effects); }
          }
          $application.variables.mateuRegistry = reg;
          rowEditorNow = bridge.rowEditorOf(reg);
        }
      }
      $page.variables.mateuRowEditor = rowEditorNow
        || { id: '', fieldId: '', title: '', subtitle: '', toolbar: [], buttons: [], fields: [] };
      if (rowEditorNow && !$page.variables.mateuRowEditorOpen) {
        $page.variables.mateuRowEditorOpen = true;
        // el foco, al primer campo EDITABLE: oj-dialog lo deja, al terminar de abrirse
        // (ojOpen), en el primero que se pueda enfocar, y uno de sólo lectura («Line», que pone
        // el servidor) se quedaba con el anillo de foco alrededor de un valor vacío
        const dialog = document.getElementById('mateuRowEditor');
        const focusFirstEditable = () => {
          const form = document.getElementById('mateuRowEditorForm');
          const editable = form && Array.from(form.querySelectorAll('[data-field-id]'))
            .find((el) => el.tagName.indexOf('OJ-') === 0 && el.readonly !== true && !el.disabled);
          const target = editable && (editable.querySelector('input, textarea') || editable);
          if (target && typeof target.focus === 'function') target.focus();
        };
        if (dialog) dialog.addEventListener('ojOpen', () => setTimeout(focusFirstEditable, 0), { once: true });
        await Actions.callComponentMethod(context, { selector: '#mateuRowEditor', method: 'open' });
        setTimeout(focusFirstEditable, 600);
      } else if (!rowEditorNow && $page.variables.mateuRowEditorOpen) {
        // la marca baja ANTES del close: el ojBeforeClose que dispara no es un descarte del usuario
        $page.variables.mateuRowEditorOpen = false;
        await Actions.callComponentMethod(context, { selector: '#mateuRowEditor', method: 'close' });
      }

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
      // el selector recién abierto: el diálogo y la primera página de su listado (su `search`,
      // contra SU ServerSide — lo que en Vaadin hace el listado al montarse)
      if (pickerNow && !$page.variables.mateuPickerOpen) {
        $page.variables.mateuPickerOpen = true;
        $page.variables.mateuPickerSelection = { all: false, keys: [], except: [] };
        await Actions.callComponentMethod(context, { selector: '#mateuPicker', method: 'open' });
        $page.variables.mateuDrawerDraft = bridge.pickerSearchStateOf(pickerNow);
        await Actions.callChain(context, { chain: 'runMateuAction', params: { actionId: 'search' } });
      }
      if (effects.navigate && (effects.navigate.route || effects.navigate.url)) {
        if ($page.variables.mateuModalOpen) {
          $page.variables.mateuModalOpen = false;
          await Actions.callComponentMethod(context, { selector: '#mateuModal', method: 'close' });
        }
        if (effects.navigate.url) {
          // una URL absoluta (la de otra consola) se abre en su propia pestaña, como en Vaadin
          window.open(effects.navigate.url, '_blank', 'noopener');
        } else {
          // `force`: la acción manda ir a una ruta, aunque sea la que ya se ve — «+ 10 reservas
          // demo» vuelve al listado para enseñar las nuevas, «Cancel booking» a la reserva
          // para enseñarla cancelada. Sin forzar, la shell tomaba la ruta por el eco de su
          // propia URL y no recargaba nada.
          await Actions.fireEvent(context, {
            name: 'application:mateuNavigate',
            payload: { route: effects.navigate.route, force: true },
          });
        }
      }
    }
  }

  return runMateuAction;
});
