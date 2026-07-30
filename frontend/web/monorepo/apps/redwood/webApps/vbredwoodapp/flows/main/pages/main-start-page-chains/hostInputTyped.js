/* Tecleo EN VIVO en un input del host (raw-value): si el host declara un trigger
 * AutoSave (p.ej. buscar-al-teclear del posteo de cargos), cada pulsación actualiza el
 * borrador y re-lanza la acción debounced — sin esperar a Enter/blur. El repintado
 * recrea el input, así que al terminar se devuelve el foco con el cursor al final. */

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

  // token de debounce a nivel de módulo: la última pulsación gana
  let debounceToken = 0;

  class hostInputTyped extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.fieldId  id del campo Mateu
     * @param {Object} params.event    rawValueChanged de oj-input-text ({detail: {value}})
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
        return; // eco del re-render / sin cambio real
      }
      draft[fieldId] = value;
      $page.variables.mateuDraft = draft;

      const token = ++debounceToken;
      await new Promise((resolve) => setTimeout(resolve, auto.debounceMillis));
      if (token !== debounceToken) {
        return; // llegó otra pulsación después
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: auto.actionId },
      });
      // devolver el foco al input recreado (tick para que knockout re-ligue el subárbol)
      setTimeout(() => {
        const el = document.querySelector('[data-field-id="' + fieldId + '"]');
        if (!el) return;
        const inner = el.querySelector('input, textarea');
        if (inner) {
          inner.focus();
          const end = (inner.value || '').length;
          try { inner.setSelectionRange(end, end); } catch (ignored) { /* no aplica */ }
        } else if (el.focus) {
          el.focus();
        }
      }, 250);
    }
  }

  return hostInputTyped;
});
