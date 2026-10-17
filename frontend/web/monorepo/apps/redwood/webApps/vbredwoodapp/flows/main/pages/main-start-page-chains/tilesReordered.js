/* Reordered tiles (ResponsiveGrid.reorderable): the order is already saved (installTileReorder);
 * the host content is re-projected to paint it — no round trip to the server, like folding
 * a panel or switching tabs. */

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

  class tilesReordered extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $application } = context;
      // the re-projection is poc/reproject.mjs (tested): the host content and the island
      const next = bridge.reprojectedContentOf($application.variables);
      if (next.hostContent) {
        $application.variables.mateuHostContent = next.hostContent;
        bridge.mountElementsSoon(bridge.elementAtomsOf(next.hostContent));
      }
      if (next.island) $application.variables.mateuIsland = next.island;
    }
  }

  return tilesReordered;
});
