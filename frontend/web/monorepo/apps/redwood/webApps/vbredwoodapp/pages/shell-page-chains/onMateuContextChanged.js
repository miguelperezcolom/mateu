/* Selector @AppContext del header (Fase 6): fija el valor en el appState de aplicación
 * (viaja en CADA request) y recarga la ruta actual contra el nuevo contexto — la
 * reactividad uniforme de Mateu (la pantalla se reconstruye con el contexto nuevo). */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class onMateuContextChanged extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.fieldName
     * @param {Object} params.event  value-changed ({detail: {value, updatedFrom}})
     */
    async run(context, { fieldName, event }) {
      const { $application } = context;

      const detail = (event && (event.detail || event)) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return; // eco del set inicial del binding
      }
      if (!fieldName) {
        return;
      }

      const appState = Object.assign({}, $application.variables.mateuAppState);
      appState[fieldName] = detail.value == null ? null : detail.value;
      $application.variables.mateuAppState = appState;
      $application.variables.mateuContextSelectors =
        ($application.variables.mateuContextSelectors || []).map((selector) =>
          selector.fieldName === fieldName
            ? Object.assign({}, selector, { value: appState[fieldName] })
            : selector);

      // the selectors array was just replaced: the drawer re-renders its pickers and the focus
      // fell to <body> — Escape no longer closed the drawer and a keyboard user was lost behind its
      // scrim. Give it back to the picker just changed.
      const refocus = () => {
        const picker = document.querySelector(`oj-select-one[data-field="${fieldName}"]`);
        if (picker && typeof picker.focus === 'function') picker.focus();
      };
      setTimeout(refocus, 0);

      const route = $application.variables.mateuSelectedRoute;
      if (route) {
        await Actions.callChain(context, {
          chain: 'onMateuNavigate',
          params: { event: { detail: { currentId: route } }, force: true },
        });
        // the reload may have redrawn the drawer again
        refocus();
      }
    }
  }

  return onMateuContextChanged;
});
