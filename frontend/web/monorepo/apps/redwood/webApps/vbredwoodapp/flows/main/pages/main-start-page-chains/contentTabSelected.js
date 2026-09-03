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
      if (!tabId || tabId === $application.variables.mateuActiveTab) {
        return;
      }
      $application.variables.mateuActiveTab = tabId;

      const reg = $application.variables.mateuRegistry;
      const host = reg && reg.contexts ? reg.contexts[bridge.HOST_ID] : null;
      if (!host) {
        return;
      }
      const blocks = bridge.hostContentOf(host, null, {
        title: $application.variables.mateuHostTitle || '',
        activeTab: tabId,
      }) || [];
      $application.variables.mateuHostContent = blocks;
      bridge.mountElementsSoon(bridge.elementAtomsOf(blocks));
      try {
        await Actions.callComponentMethod(context, { selector: '#mateuContentTabs', method: 'refresh' });
      } catch (ignored) { /* aún sin montar */ }
    }
  }

  return contentTabSelected;
});
