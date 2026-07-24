/* Fase 1 del renderer Mateu-sobre-VB: hola mundo — carga /hello del backend Mateu
 * (constante mateuBaseUrl) con el bridge y expone título + texto como variables de página.
 * El registro completo en $application y el dispatcher recursivo llegan en las fases 1.x/3. */

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

  class loadMateuHello extends ActionChain {

    async run(context) {
      const { $page, $application } = context;

      const base = $application.constants.mateuBaseUrl;
      const increment = await bridge.loadRoute(base, '/hello');
      const reg = bridge.reduceContexts({ contexts: {}, stack: [], shell: null }, increment);
      const host = reg.contexts[bridge.HOST_ID];

      const pageMetadata = ((host.tree.children || [])[0] || {}).metadata || {};
      $page.variables.mateuTitle = pageMetadata.title || '';
      $page.variables.mateuMessage = String(host.state.message == null ? '' : host.state.message);
    }
  }

  return loadMateuHello;
});
