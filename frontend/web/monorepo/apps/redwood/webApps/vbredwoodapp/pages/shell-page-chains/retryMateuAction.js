/* "Reintentar" de la banda de error: vuelve a entrar en la CHAIN que falló, con sus mismos
 * parámetros — reenviar sólo la petición no valdría, porque una respuesta que nadie procesa
 * no cambia nada en pantalla. El cierre lo dejó registrado quien falló (bridge.setLastRetry). */

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

  class retryMateuAction extends ActionChain {

    async run(context) {
      const { $application } = context;
      $application.variables.mateuLastError = '';
      const retry = bridge.takeLastRetry();
      if (!retry) return;
      if (retry.kind === 'navigate') {
        // Misma página que esta chain: se la llama directamente, con ESTE contexto (vivo).
        await Actions.callChain(context, {
          chain: 'onMateuNavigate',
          params: { event: { route: retry.route }, force: true },
        });
        return;
      }
      // La acción vive en la página de CONTENIDO, que es otra: no se puede llamar su chain
      // desde aquí, así que viaja como evento de aplicación y allí se reencamina.
      await Actions.fireEvent(context, {
        name: 'application:mateuRetryAction',
        payload: { actionId: retry.actionId, parameters: retry.parameters },
      });
    }
  }

  return retryMateuAction;
});
