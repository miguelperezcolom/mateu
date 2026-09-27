/* Acción de una LISTA del formulario con editor modal: el "+" bajo la tabla, Editar / Quitar
 * de cada fila y los botones del diálogo (Save, Save and add another, Cancel, Prev/Next). El
 * botón lleva su acción en data-action-id y, en la tabla, la fila en data-row-key (el texto de
 * su _rowNumber: el bridge lo devuelve a su tipo real). La request —estado del contenedor, la
 * fila en initiatorState— la arma runMateuAction con bridge.listActionRequestOf. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class mateuListAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  ojAction del oj-button
     */
    async run(context, { event }) {
      const target = event && (event.currentTarget || event.target);
      const dataset = (target && target.dataset) || {};
      const actionId = dataset.actionId;
      if (!actionId) {
        return;
      }
      const parameters = dataset.rowKey != null && dataset.rowKey !== ''
        ? { _rowNumber: dataset.rowKey } : {};
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId, parameters },
      });
    }
  }

  return mateuListAction;
});
