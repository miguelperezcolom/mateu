/* Selection in the navigator-drawer's oj-navigation-list: a GROUP only expands
 * (collapsible — it does not navigate: its composed route does not resolve); a leaf navigates and closes
 * the drawer. Guards updatedFrom internal against the echo of the initial set. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class onMateuNavDrawerSelect extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  selection-changed ({detail: {value}})
     */
    async run(context, { event }) {
      const { $application } = context;

      const detail = (event && (event.detail || event)) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return;
      }
      const route = detail.value;
      if (!route) {
        return;
      }
      // the group may be at ANY depth: a federated shell brings three levels
      // (shell group → pod group → its screens)
      const isGroup = (nodes) => (nodes || []).some((entry) => (
        (entry.id === route && entry.hasChildren) || isGroup(entry.children)));
      if (isGroup($application.variables.mateuMenuTree || [])) {
        return; // the click on the group only expands/collapses
      }
      // the navigator is PERSISTENT: navigating does not close it
      await Actions.callChain(context, {
        chain: 'onMateuNavigate',
        params: { event: { detail: { currentId: route } } },
      });
      // …except with HAMBURGER_SECTIONS: the hamburger is for jumping between sections, and once one is chosen
      // it closes (as in Opera); inside the section you navigate through the subheader
      if ($application.variables.mateuMenuSections) {
        await Actions.callChain(context, { chain: 'toggleMateuNavDrawer', params: { open: false } });
      }
    }
  }

  return onMateuNavDrawerSelect;
});
