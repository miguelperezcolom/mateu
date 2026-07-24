/* Clic en una fila del listing (ojRowAction de oj-table): resuelve la fila y dispara la
 * acción 'view' del crud con la fila como parameters — el server responde el drawer Edit.
 * Se usa ojRowAction y no la selección (la selección deja estado que la tabla re-emite al
 * refrescar tras guardar). DEDUPE por timeStamp: el runtime VB puede RE-INVOCAR el listener
 * con el mismo evento almacenado tras el refresco del listado (carrera observada: un 'view'
 * fantasma ~30ms después del save reabría el drawer; a nivel DOM solo hubo UN ojRowAction). */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  let lastHandledStamp = -1;

  class mateuRowClicked extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  ojRowAction ({detail: {context: {key, item…}}})
     */
    async run(context, { event }) {
      const { $application } = context;

      const detail = (event && event.detail) || {};
      const stamp = (detail.originalEvent && detail.originalEvent.timeStamp) || event.timeStamp || 0;
      if (stamp === lastHandledStamp) {
        return; // replay del mismo evento — no es un clic nuevo
      }
      lastHandledStamp = stamp;

      const rowContext = detail.context || {};
      let row = rowContext.item && rowContext.item.data;
      if (!row && rowContext.key != null) {
        const rows = $application.variables.mateuListingRows || [];
        row = rows.find((r) => r._rowNumber === rowContext.key);
      }
      if (!row) {
        return;
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: 'view', parameters: row },
      });
    }
  }

  return mateuRowClicked;
});
