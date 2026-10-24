/* "Retry" of the error band: re-enters the CHAIN that failed, with its same
 * parameters — resending just the request would not do, because a response nobody processes
 * changes nothing on screen. The closure was registered by whoever failed (bridge.setLastRetry). */

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
      // a version-skew notice (app updated / stale screen): the only fix is the new deployment
      if ($application.variables.mateuReloadOffered) {
        $application.variables.mateuReloadOffered = false;
        window.location.reload();
        return;
      }
      const retry = bridge.takeLastRetry();
      if (!retry) return;
      if (retry.kind === 'navigate') {
        // Same page as this chain: it is called directly, with THIS (live) context.
        await Actions.callChain(context, {
          chain: 'onMateuNavigate',
          params: { event: { route: retry.route }, force: true },
        });
        return;
      }
      // The action lives on the CONTENT page, which is a different one: its chain cannot be called
      // from here, so it travels as an application event and is rerouted there.
      await Actions.fireEvent(context, {
        name: 'application:mateuRetryAction',
        payload: { actionId: retry.actionId, parameters: retry.parameters },
      });
    }
  }

  return retryMateuAction;
});
