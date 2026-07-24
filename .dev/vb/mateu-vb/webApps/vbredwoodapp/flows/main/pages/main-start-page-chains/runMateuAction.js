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

      const summary = bridge.summarizeHost(reg, route);
      $application.variables.mateuHostTitle = summary.title;
      $application.variables.mateuHostText = summary.text;
      $application.variables.mateuFormMetadata = summary.formMetadata;
      $application.variables.mateuFormFieldsList = summary.fields;
      $application.variables.mateuFormValue = summary.formValue;
      $application.variables.mateuFormActions = summary.actions;
      if (!overlayNow) {
        $page.variables.mateuDraft = {};
      }

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
