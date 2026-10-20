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

  // the task last dispatched as selected: a click and the gantt's own selectionChanged can both
  // report the same pick — it goes to the server once
  let lastSelect = { taskId: null, at: 0 };

  class planningGanttEvent extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.kind  move | resize | open | select | click
     * @param {Object} params.event
     * @param {Object} params.atom  the isPlanning atom
     */
    async run(context, { kind, event, atom }) {
      let detail = (event && event.detail) || {};
      if (kind === 'open' || kind === 'click') {
        // (double) click: the task under the pointer (getContextByNode → row and task index)
        const gantt = event && event.currentTarget;
        const ctx = gantt && gantt.getContextByNode ? gantt.getContextByNode(event.target) : null;
        const taskId = bridge.ganttTaskIdAt(atom, ctx);
        if (!taskId) return;
        detail = { taskId };
        // a single click on a bar SELECTS it (Gantt.onTaskSelectionActionId, the board's selectActionId)
        if (kind === 'click') kind = 'select';
      } else if (kind === 'select') {
        // the oj-gantt's selection: the USER's changes are the ones JET reports as 'internal' (an
        // 'external' one is the app setting it) — they were the ones dropped. With the tasks inline
        // in each row the key comes back null: then the click above has already resolved the task
        if (detail.updatedFrom && detail.updatedFrom !== 'internal') return;
        const selected = (Array.isArray(detail.value) ? detail.value : []).filter((k) => k != null);
        if (!selected.length) return;
        detail = { taskId: selected[0] };
      }
      if (kind === 'select') {
        const now = Date.now();
        if (lastSelect.taskId === detail.taskId && now - lastSelect.at < 1000) return;
        lastSelect = { taskId: detail.taskId, at: now };
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
