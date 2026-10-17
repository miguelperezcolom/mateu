/* Tab change in a screen's content (isTabs atom).
 *
 * It is a CLIENT change: nothing is asked of the server, the same context is projected again
 * with another tab active. The tab's content travels flattened behind the bar,
 * so re-projecting is all there is to do. */

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

  class contentTabSelected extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  selection-changed ({detail: {value, updatedFrom}})
     */
    async run(context, { event }) {
      const { $application } = context;

      const detail = (event && (event.detail || event)) || {};
      // the writeback echo after re-projecting is not a click
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return;
      }
      const tabId = detail.value;
      // the active tab is PER BAR (nested bars): each click only touches its own
      const activeTabs = $application.variables.mateuActiveTabs || {};
      if (!tabId || tabId === activeTabs[bridge.tabStripOf(tabId)]) {
        return;
      }
      $application.variables.mateuActiveTabs = bridge.withActiveTab(activeTabs, tabId);

      // @Tab(key): the tab is a URL — choosing it leaves a history entry, so
      // back/forward walk the tabs and reloading opens the same one (the server marks it active)
      const bar = ($application.variables.mateuHostContent || [])
        .reduce((out, block) => out.concat(block.items || []), [])
        .find((a) => a && a.isTabs && (a.tabs || []).some((t) => t.id === tabId));
      const picked = bar ? bar.tabs.find((t) => t.id === tabId) : null;
      if (picked && picked.routeKey && window.__mateuUrlPathMode) {
        const keys = bar.tabs.map((t) => t.routeKey).filter((k) => !!k);
        const current = bridge.currentRoutePathOf(window.location);
        const path = bridge.tabRoutePath(current, keys, picked.routeKey);
        if (path !== current) {
          window.history.pushState(null, '', bridge.urlOfRoute(path));
          $application.variables.mateuSelectedRoute = path;
          $application.variables.mateuSelectedNavId = path;
        }
      }

      let reg = $application.variables.mateuRegistry;
      const host = reg && reg.contexts ? reg.contexts[bridge.HOST_ID] : null;
      if (!host) {
        return;
      }
      const projected = bridge.hostContentOf(host, null, {
        title: $application.variables.mateuHostTitle || '',
        activeTabs: $application.variables.mateuActiveTabs,
        // the header band already paints the host's EntityHeader: without this it reappeared in the content
        dropEntityHeader: !!bridge.entityHeaderOf(host),
      }) || [];
      // the form's action row (withFormActions) does not depend on the tab: it stays
      const withRow = bridge.withFormActionsRowOf(projected, $application.variables.mateuHostContent);
      // the tab is already visible; its @Subresource (lazy: loaded when it opens) arrive later
      $application.variables.mateuHostContent = bridge.withSubresources(withRow, reg.contexts);
      reg = await bridge.loadSubresources(bridge.baseOf(reg) || bridge.mateuBase($application.constants.mateuBaseUrl),
        reg, projected, { appState: $application.variables.mateuAppState || {} });
      $application.variables.mateuRegistry = reg;
      const blocks = bridge.withSubresources(withRow, reg.contexts);
      $application.variables.mateuHostContent = blocks;
      bridge.mountElementsSoon(bridge.elementAtomsOf(blocks));
      // a nested bar appears/changes when the tab changes: all of them are refreshed
      for (const barId of bridge.tabBarIdsOf(blocks)) {
        try {
          await Actions.callComponentMethod(context, { selector: '#' + barId, method: 'refresh' });
        } catch (ignored) { /* not mounted yet */ }
      }
    }
  }

  return contentTabSelected;
});
