/* Tiles reordenados (ResponsiveGrid.reorderable): el orden ya está guardado (installTileReorder);
 * se re-proyecta el contenido del host para pintarlo — sin ida y vuelta al servidor, como plegar
 * un panel o cambiar de pestaña. */

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
