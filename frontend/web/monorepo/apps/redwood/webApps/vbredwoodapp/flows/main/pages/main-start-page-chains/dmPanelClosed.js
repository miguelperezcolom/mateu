/* A docked panel of the data management page (oj-sp-data-management-page) was closed by its Spectra
 * template: the end panel's oj-sp-general-drawer-template ✕ (spClose) or the bottom panel's
 * oj-sp-bottom-drawer-template ✕ (drawerState written back as 'closed'). The panel's own toggle
 * action (DataManagement toggleEndPanel / toggleBottomPanel) runs on the server, which answers the
 * page without it; the bottom state goes back to 'auto' for the next time it opens.
 */

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

  class dmPanelClosed extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.state     the template's new drawerState ('closed' = its ✕)
     * @param {string} params.actionId  the panel's toggle action ('' = none: the panel closes here, for good on this route)
     * @param {string} params.panel     'end' | 'bottom'
     */
    async run(context, { state, actionId, panel }) {
      const { $page, $application } = context;
      if (state !== 'closed') return;
      if (!actionId) {
        // no toggle to run (a YAML DockedPanel): it closes here and stays closed on this route —
        // putting the state back to 'auto' with the panel still projected reopened it at once
        const host = $application.variables.mateuRegistry.contexts[bridge.HOST_ID];
        bridge.closeDockedPanel(host && host.outbound && host.outbound.route, panel || 'bottom');
        $application.variables.mateuDm = bridge.dataManagementWithoutPanel($application.variables.mateuDm, panel || 'bottom');
        $page.variables.mateuDmBottomState = 'auto';
        return;
      }
      $page.variables.mateuDmBottomState = 'auto';
      await Actions.callChain(context, { chain: 'runMateuAction', params: { actionId, parameters: {} } });
    }
  }

  return dmPanelClosed;
});
