/* Fase 2: navegación — la selección del in-app navigation carga esa ruta de Mateu en el
 * host (siguiendo el mediador si lo hay) y el contenido se re-renderiza SIN recargar la
 * shell. De momento el contenido muestra título + primer texto; el dispatcher recursivo
 * (mateu-node) llega en la Fase 3. */

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
     * @param {Object} params.event  evento spSelectionChanged (detail.value = route)
     */
    async run(context, { event }) {
      const { $application } = context;

      // spSelectionChanged: detail = { currentId, previousId }
      const detail = (event && (event.detail || event)) || {};
      const route = detail.currentId != null ? detail.currentId : detail.value;
      if (route == null || route === '') {
        return;
      }
      // el writeback de selection re-emite spSelectionChanged tras cada navegación — no recargar
      if (route === $application.variables.mateuSelectedRoute) {
        return;
      }

      const base = $application.constants.mateuBaseUrl;
      const reg = await bridge.loadRouteInto(base, $application.variables.mateuRegistry, route);
      $application.variables.mateuRegistry = reg;
      $application.variables.mateuSelectedRoute = route;

      const host = reg.contexts[bridge.HOST_ID] || {};
      const pageMetadata = (((host.tree || {}).children || [])[0] || {}).metadata || {};
      // la Page de un listado no lleva título (viaja en la metadata del Crudl) → caption del menú
      const menu = (reg.shell && reg.shell.menu) || [];
      const option = menu.find((entry) => entry.route === route);
      $application.variables.mateuHostTitle =
        pageMetadata.title || (option && (option.caption || option.label)) || '';
      const state = host.state || {};
      $application.variables.mateuHostText = String(state.message == null ? '' : state.message);
      if (reg.effects && reg.effects.docTitle) {
        document.title = reg.effects.docTitle;
      }
    }
  }

  return onMateuNavigate;
});
