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

      // @Tab(key): la pestaña es una URL — elegirla deja una entrada en el historial, así
      // atrás/adelante recorren las pestañas y recargar abre la misma (el server la marca activa)
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
        // la banda del header ya pinta el EntityHeader del host: sin esto reaparecía en el contenido
        dropEntityHeader: !!bridge.entityHeaderOf(host),
      }) || [];
      // la pestaña ya se ve; sus @Subresource (lazy: se cargan al abrirla) llegan después
      $application.variables.mateuHostContent = bridge.withSubresources(projected, reg.contexts);
      reg = await bridge.loadSubresources(bridge.baseOf(reg) || bridge.mateuBase($application.constants.mateuBaseUrl),
        reg, projected, { appState: $application.variables.mateuAppState || {} });
      $application.variables.mateuRegistry = reg;
      const blocks = bridge.withSubresources(projected, reg.contexts);
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
