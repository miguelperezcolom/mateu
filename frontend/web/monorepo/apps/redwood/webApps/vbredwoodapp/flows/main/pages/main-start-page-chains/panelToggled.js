/* Plegar/desplegar un panel (AccordionPanel / Details): estado de CLIENTE (bridge.setPanelExpanded)
 * y re-proyección del contenido del host — sin ida y vuelta al servidor, como cambiar de pestaña. */

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

  class panelToggled extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.key
     * @param {boolean} params.expanded
     */
    async run(context, { key, expanded, updatedFrom }) {
      const { $application } = context;
      // el eco del writeback tras re-proyectar no es un clic
      if (!key || (updatedFrom && updatedFrom !== 'internal')) return;
      if (bridge.panelExpanded(key, !expanded) === !!expanded) return;
      bridge.setPanelExpanded(key, !!expanded);
      // the re-projection is poc/reproject.mjs (tested): the host content and the island
      const next = bridge.reprojectedContentOf($application.variables);
      if (next.hostContent) {
        $application.variables.mateuHostContent = next.hostContent;
        bridge.mountElementsSoon(bridge.elementAtomsOf(next.hostContent));
      }
      if (next.island) $application.variables.mateuIsland = next.island;
    }
  }

  return panelToggled;
});
