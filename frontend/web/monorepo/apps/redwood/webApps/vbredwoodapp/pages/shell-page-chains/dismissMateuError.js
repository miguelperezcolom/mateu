/* Cierra la banda de error del transporte. El mensaje ya viene TRADUCIDO desde
 * poc/resilience.mjs (classifyRequestFailure): aquí sólo se descarta. */

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
    }
  }

  return dismissMateuError;
});
