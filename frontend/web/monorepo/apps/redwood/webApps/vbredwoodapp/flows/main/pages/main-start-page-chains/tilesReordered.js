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
      const reg = $application.variables.mateuRegistry;
      const host = reg && reg.contexts ? reg.contexts[bridge.HOST_ID] : null;
      if (!host) return;
      const projected = bridge.hostContentOf(host, null, {
        title: $application.variables.mateuHostTitle || '',
        activeTabs: $application.variables.mateuActiveTabs,
        // la banda del header ya pinta el EntityHeader del host: sin esto reaparecía en el contenido
        dropEntityHeader: !!bridge.entityHeaderOf(host),
      }) || [];
      const blocks = bridge.withSubresources(projected, reg.contexts);
      $application.variables.mateuHostContent = blocks;
      bridge.mountElementsSoon(bridge.elementAtomsOf(blocks));
    }
  }

  return tilesReordered;
});
