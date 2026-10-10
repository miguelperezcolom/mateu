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

  return panelToggled;
});
