/* A docked panel of the data management page (oj-sp-data-management-page) was closed by its Spectra
 * template: the end panel's oj-sp-general-drawer-template ✕ (spClose) or the bottom panel's
 * oj-sp-bottom-drawer-template ✕ (drawerState written back as 'closed'). The panel's own toggle
 * action (DataManagement toggleEndPanel / toggleBottomPanel) runs on the server, which answers the
 * page without it; the bottom state goes back to 'auto' for the next time it opens.
 */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class dmPanelClosed extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.state     the template's new drawerState ('closed' = its ✕)
     * @param {string} params.actionId  the panel's toggle action ('' = a persistent panel, nothing to run)
     */
    async run(context, { state, actionId }) {
      const { $page } = context;
      if (state !== 'closed') return;
      $page.variables.mateuDmBottomState = 'auto';
      if (!actionId) return;
      await Actions.callChain(context, { chain: 'runMateuAction', params: { actionId, parameters: {} } });
    }
  }

  return dmPanelClosed;
});
