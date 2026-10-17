/* A tape chart event (PlanningBoard over oj-gantt): moving or resizing a stay, or
 * double-clicking it. bridge.planningActionOf translates it into the Mateu action (dates in days, inclusive
 * end) and it is dispatched like any action of a host block. No optimistic change: the
 * server answers with the board (or rejects with a message) and the gantt is repainted from it. */

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
     * @param {Object} params.atom  the isPlanning atom
     */
    async run(context, { kind, event, atom }) {
      let detail = (event && event.detail) || {};
      if (kind === 'open') {
        // double click: the task under the pointer (getContextByNode → row and task index)
        const gantt = event && event.currentTarget;
        const ctx = gantt && gantt.getContextByNode ? gantt.getContextByNode(event.target) : null;
        const row = ctx && atom.rows ? atom.rows[ctx.rowIndex] : null;
        const task = row && row.tasks ? row.tasks[ctx.index] : null;
        if (!task) return;
        detail = { taskId: task.id };
      }
      if (kind === 'select') {
        // the oj-gantt's selection (a click on a bar): only the user's, and the chosen task
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
