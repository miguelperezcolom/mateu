/* The page header's record/context switcher (RecordSwitcherSupplier → PageDto.switcher, drawn by
 * oj-sp-header-general-overview as its selectObject/selectContext data switcher): a pick runs the
 * page's switcher action (`_switchRecord`) with the picked value in `_record`. An echo of the value
 * the header was given (or a value written back from outside) runs nothing — bridge.switcherPickOf. */

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

  class onPageSwitch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  select-object/context-value-changed ({detail: {value, updatedFrom}})
     */
    async run(context, { event }) {
      const { $application } = context;

      const detail = (event && (event.detail || event)) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return;
      }
      const header = $application.variables.mateuPageHeader || {};
      const pick = bridge.switcherPickOf(header.switcher, detail.value);
      if (!pick) {
        return;
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: pick.actionId, parameters: pick.parameters },
      });
    }
  }

  return onPageSwitch;
});
