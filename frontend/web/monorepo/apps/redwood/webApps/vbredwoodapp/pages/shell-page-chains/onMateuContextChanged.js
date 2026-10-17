/* The header's @AppContext selector (Phase 6): sets the value in the application appState
 * (it travels in EVERY request) and reloads the current route against the new context — Mateu's
 * uniform reactivity (the screen is rebuilt with the new context). */

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
        return; // echo of the binding's initial set
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
