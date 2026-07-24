/* Navegación (Fase 2/3): carga una ruta de Mateu en el host (siguiendo el mediador si lo
 * hay) y proyecta el host a las variables de contenido — título, texto, y desde la Fase 3
 * el form (metadata de oj-dyn-form + acciones). Se dispara desde el in-app navigation, el
 * bootstrap, o el evento de aplicación mateuNavigate (efecto NavigateTo del bridge). */

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
     */
    async run(context, { event }) {
      const { $application } = context;

      const detail = (event && (event.detail || event)) || {};
      const route = detail.currentId != null ? detail.currentId
        : detail.value != null ? detail.value : detail.route;
      if (route == null || route === '') {
        return;
      }
      // el eco del writeback de selection tras cada navegación — no recargar
      if (route === $application.variables.mateuSelectedRoute) {
        return;
      }

      const base = $application.constants.mateuBaseUrl;
      const reg = await bridge.loadRouteInto(base, $application.variables.mateuRegistry, route);
      $application.variables.mateuRegistry = reg;
      $application.variables.mateuSelectedRoute = route;

      const summary = bridge.summarizeHost(reg, route);
      $application.variables.mateuHostTitle = summary.title;
      $application.variables.mateuHostText = summary.text;
      $application.variables.mateuFormMetadata = summary.formMetadata;
      $application.variables.mateuFormFieldsList = summary.fields;
      $application.variables.mateuFormValue = summary.formValue;
      $application.variables.mateuFormActions = summary.actions;

      if (reg.effects && reg.effects.docTitle) {
        document.title = reg.effects.docTitle;
      }
    }
  }

  return onMateuNavigate;
});
