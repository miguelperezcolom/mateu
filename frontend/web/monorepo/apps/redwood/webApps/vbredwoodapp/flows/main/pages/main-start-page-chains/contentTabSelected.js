/* Cambio de pestaña en el contenido de una pantalla (átomo isTabs).
 *
 * Es un cambio de CLIENTE: no se le pregunta nada al servidor, se vuelve a proyectar el mismo
 * contexto con otra pestaña activa. El contenido de la pestaña viaja aplanado detrás de la barra,
 * así que reproyectar es todo lo que hay que hacer. */

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
      // el eco del writeback tras reproyectar no es un clic
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return;
      }
      const tabId = detail.value;
      // la activa es POR BARRA (barras anidadas): cada clic solo toca la suya
      const activeTabs = $application.variables.mateuActiveTabs || {};
      if (!tabId || tabId === activeTabs[bridge.tabStripOf(tabId)]) {
        return;
      }
      $application.variables.mateuActiveTabs = bridge.withActiveTab(activeTabs, tabId);

      const reg = $application.variables.mateuRegistry;
      const host = reg && reg.contexts ? reg.contexts[bridge.HOST_ID] : null;
      if (!host) {
        return;
      }
      const blocks = bridge.hostContentOf(host, null, {
        title: $application.variables.mateuHostTitle || '',
        activeTabs: $application.variables.mateuActiveTabs,
      }) || [];
      $application.variables.mateuHostContent = blocks;
      bridge.mountElementsSoon(bridge.elementAtomsOf(blocks));
      // una barra anidada aparece/cambia al cambiar de pestaña: se refrescan todas
      for (const barId of bridge.tabBarIdsOf(blocks)) {
        try {
          await Actions.callComponentMethod(context, { selector: '#' + barId, method: 'refresh' });
        } catch (ignored) { /* aún sin montar */ }
      }
    }
  }

  return contentTabSelected;
});
