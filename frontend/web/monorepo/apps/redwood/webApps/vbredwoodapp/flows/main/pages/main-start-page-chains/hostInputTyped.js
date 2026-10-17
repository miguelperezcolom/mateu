/* LIVE typing in a host input (raw-value): if the host declares an AutoSave
 * trigger (e.g. the search-as-you-type of the charge posting), each keystroke updates the
 * draft and relaunches the action debounced — without waiting for Enter/blur. The repaint
 * recreates the input, so at the end the focus is given back with the caret at the end. */

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

  // module-level debounce token: the last keystroke wins
  let debounceToken = 0;

  class hostInputTyped extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.fieldId  id of the Mateu field
     * @param {Object} params.event    oj-input-text's rawValueChanged ({detail: {value}})
     */
    async run(context, { fieldId, event }) {
      const { $application, $page } = context;

      const value = event && event.detail ? event.detail.value : undefined;
      if (value === undefined || !fieldId) {
        return;
      }
      const host = ($application.variables.mateuRegistry.contexts || {})[bridge.HOST_ID];
      const auto = bridge.autoSaveOf(host);
      if (!auto) {
        return;
      }
      const draft = Object.assign({}, $page.variables.mateuDraft);
      const previous = draft[fieldId] !== undefined
        ? draft[fieldId]
        : ((host && host.state && host.state[fieldId]) || '');
      if ((previous || '') === (value || '')) {
        return; // echo of the re-render / no real change
      }
      draft[fieldId] = value;
      $page.variables.mateuDraft = draft;

      const token = ++debounceToken;
      await new Promise((resolve) => setTimeout(resolve, auto.debounceMillis));
      if (token !== debounceToken) {
        return; // another keystroke arrived afterwards
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: auto.actionId },
      });
      // give the focus back to the recreated input (a tick so knockout re-binds the subtree)
      setTimeout(() => {
        const el = document.querySelector('[data-field-id="' + fieldId + '"]');
        if (!el) return;
        const inner = el.querySelector('input, textarea');
        if (inner) {
          inner.focus();
          const end = (inner.value || '').length;
          try { inner.setSelectionRange(end, end); } catch (ignored) { /* does not apply */ }
        } else if (el.focus) {
          el.focus();
        }
      }, 250);
    }
  }

  return hostInputTyped;
});
