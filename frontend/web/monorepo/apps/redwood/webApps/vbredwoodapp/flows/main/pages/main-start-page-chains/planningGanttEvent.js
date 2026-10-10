/* Un evento del tape chart (PlanningBoard sobre oj-gantt): mover o redimensionar una estancia, o
 * doble clic en ella. bridge.planningActionOf lo traduce a la acción de Mateu (fechas en días, fin
 * inclusivo) y se despacha como cualquier acción de un bloque del host. Sin cambio optimista: el
 * servidor contesta con el tablero (o rechaza con un mensaje) y el gantt se repinta desde él. */

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

  class planningGanttEvent extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.kind  move | resize | open
     * @param {Object} params.event
     * @param {Object} params.atom  el átomo isPlanning
     */
    async run(context, { kind, event, atom }) {
      let detail = (event && event.detail) || {};
      if (kind === 'open') {
        // doble clic: la tarea bajo el puntero (getContextByNode → fila e índice de tarea)
        const gantt = event && event.currentTarget;
        const ctx = gantt && gantt.getContextByNode ? gantt.getContextByNode(event.target) : null;
        const row = ctx && atom.rows ? atom.rows[ctx.rowIndex] : null;
        const task = row && row.tasks ? row.tasks[ctx.index] : null;
        if (!task) return;
        detail = { taskId: task.id };
      }
      if (kind === 'select') {
        // la selección del oj-gantt (un clic en una barra): sólo la del usuario, y la tarea elegida
        if (detail.updatedFrom === 'internal') return;
        const selected = Array.isArray(detail.value) ? detail.value : [];
        if (!selected.length) return;
        detail = { taskId: selected[0] };
      }
      const call = bridge.planningActionOf(atom, kind, detail);
      if (!call) return;
      await Actions.callChain(context, {
        chain: 'dispatchHostBlockAction',
        params: { actionId: call.actionId, parameters: call.parameters, fromNested: !!atom.fromNested },
      });
    }
  }

  return planningGanttEvent;
});
