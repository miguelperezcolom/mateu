/* Ask Oracle row: closes the palette and navigates; a "quick view" additionally leaves the
 * listing's filter PENDING — onMateuNavigate applies it in the OnLoad search instead
 * of resetting it (the chip appears applied on landing). */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class askOracleGo extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.item  destination ({route, quickField?, quickValue?})
     */
    async run(context, { item }) {
      const { $application } = context;
      if (item && !item.route && item.actionId) {
        // an app shortcut that runs an app-level action (@AppShortcut(actionId))
        await Actions.callComponentMethod(context, { selector: '#mateuAskOracle', method: 'close' });
        await Actions.callChain(context, { chain: 'runMateuHeaderAction', params: { actionId: item.actionId } });
        return;
      }
      if (!item || !item.route) {
        return;
      }
      await Actions.callComponentMethod(context, { selector: '#mateuAskOracle', method: 'close' });
      if (item.quickField && item.quickValue) {
        const seeded = {};
        seeded[item.quickField] = item.quickValue;
        $application.variables.mateuFilterValues = seeded;
        $application.variables.mateuFiltersPending = true;
      }
      await Actions.callChain(context, {
        chain: 'onMateuNavigate',
        params: { event: { detail: { route: item.route } }, force: true },
      });
    }
  }

  return askOracleGo;
});
