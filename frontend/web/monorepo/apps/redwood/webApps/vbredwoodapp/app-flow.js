/* Mateu — Apache License 2.0 (LICENSE.txt en la raíz del repositorio) */

// Módulo de la aplicación VB. Carga la configuración del shell de Spectra (oj-sp) antes de que
// arranque cualquier página; no aporta funciones propias, la lógica vive en el bridge (poc/).
define(['oj-sp/spectra-shell/config/config'], () => {
  'use strict';
  return class MateuAppModule {};
});
