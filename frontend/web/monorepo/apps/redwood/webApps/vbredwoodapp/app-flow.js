/* Mateu — Apache License 2.0 (LICENSE.txt at the repository root) */

// The VB application module. Loads the Spectra shell (oj-sp) configuration before any page
// starts; it contributes no functions of its own, the logic lives in the bridge (poc/).
define(['oj-sp/spectra-shell/config/config'], () => {
  'use strict';
  return class MateuAppModule {};
});
