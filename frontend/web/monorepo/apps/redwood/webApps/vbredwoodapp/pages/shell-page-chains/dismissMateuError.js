/* Closes the transport's error band. The message already comes TRANSLATED from
 * poc/resilience.mjs (classifyRequestFailure): here it is only discarded. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
) => {
  'use strict';

  class dismissMateuError extends ActionChain {

    async run(context) {
      const { $application } = context;
      $application.variables.mateuLastError = '';
      $application.variables.mateuReloadOffered = false;
    }
  }

  return dismissMateuError;
});
