/* A change of CLIENT view state that is not a panel fold: the slide a carousel shows, the page a
 * Grid shows, a tree Grid row opened or closed. The value is stored in the bridge (setUiValue) and
 * the content is re-projected from the registry in memory — no round trip to the server. The
 * re-projection itself lives in poc/reproject.mjs (tested); this chain only assigns it. */

define([
  'vb/action/actionChain',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  bridge,
) => {
  'use strict';

  class uiValueChanged extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.key    the client-state key (carousel:…, grid:…:page, grid:…:open:…)
     * @param {*}      params.value  its new value
     */
    async run(context, { key, value }) {
      const { $application } = context;
      if (!key) return;
      bridge.setUiValue(key, value);
      const next = bridge.reprojectedContentOf($application.variables);
      if (next.hostContent) {
        $application.variables.mateuHostContent = next.hostContent;
        bridge.mountElementsSoon(bridge.elementAtomsOf(next.hostContent));
      }
      if (next.island) $application.variables.mateuIsland = next.island;
    }
  }

  return uiValueChanged;
});
