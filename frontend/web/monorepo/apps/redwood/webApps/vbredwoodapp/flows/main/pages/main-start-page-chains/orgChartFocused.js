/* The hierarchy viewer moved the focus (a manager or a report was picked; Spectra has animated it):
 * it is handed that person's data — them, their manager, the chain above, their reports — computed
 * from the tree the OrgChart atom carries (bridge.orgFocusOf). Nothing goes to the server. */

define([
  'vb/action/actionChain',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  bridge,
) => {
  'use strict';

  class orgChartFocused extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  the viewer's spChangeFocusAction ({ template, context: the card's row })
     * @param {Object} params.atom   the isOrgHierarchy atom
     */
    async run(context, { event, atom }) {
      const row = event && event.detail ? event.detail.context : null;
      const viewer = event && (event.currentTarget || event.target);
      const focus = row && row.id ? bridge.orgFocusOf(atom, row.id) : null;
      if (!focus || !viewer) return;
      viewer.currentItemData = focus.current;
      viewer.parentItemData = focus.parent;
      viewer.parentHierarchyItemData = focus.hierarchy;
      viewer.currentChildViews = focus.childViews;
      if (focus.selectedChildView) viewer.selectedChildView = focus.selectedChildView;
    }
  }

  return orgChartFocused;
});
