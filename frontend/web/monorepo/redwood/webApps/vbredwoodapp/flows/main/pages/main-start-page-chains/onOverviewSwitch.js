/* General Overview: cambio de registro en el switcher del header → la acción switchRecord
 * del arquetipo con el nuevo valor (viaja en componentState vía el borrador). */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class onOverviewSwitch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  select-object-value-changed ({detail: {value, updatedFrom}})
     */
    async run(context, { event }) {
      const { $application, $page } = context;

      const detail = (event && (event.detail || event)) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return;
      }
      const overview = $application.variables.mateuOverview;
      if (!overview || detail.value == null || detail.value === overview.switcherValue) {
        return;
      }
      const draft = Object.assign({}, $page.variables.mateuDraft);
      draft[overview.switcherField || 'record'] = detail.value;
      $page.variables.mateuDraft = draft;
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: 'switchRecord' },
      });
    }
  }

  return onOverviewSwitch;
});
