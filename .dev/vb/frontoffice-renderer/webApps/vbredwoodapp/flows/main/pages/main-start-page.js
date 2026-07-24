/* La página de contenido no tiene lógica propia: todo el bridge vive en app-flow.js
 * ($application.functions). Esta página solo pinta el contenido bindeando $application. */
define([], function () {
  'use strict';
  class PageModule {}
  return PageModule;
});
