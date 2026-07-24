/* Bridge de Mateu-sobre-VB como módulo AMD del app-flow.
 *
 * Mismo envoltorio que el ejemplo (.dev/vb/frontoffice/.../app-flow.js): depende de
 * `oj-sp/spectra-shell/config/config`, de modo que TODO el chrome (shell, header, navigator, footer)
 * lo pinta el pack Spectra — aquí no se dibuja nada. Este módulo solo añade la LÓGICA del bridge:
 * transporte (callMateu), reducción (reduceContexts) y aplicación de increments (applyIncrement).
 *
 * El reducer es EL MISMO core que src/core/reduceContexts.mjs (probado en Node); aquí se carga como
 * módulo AMD ('redwood-vb/reduceContexts'). Un solo fuente del core, dos envoltorios (ESM para tests,
 * AMD para VB) — sin bundler: el AMD se genera/mantiene en paridad con el .mjs.
 *
 * La PRESENTACIÓN vive en los fragmentos VB (vb/mateu-node.html) y en el shell Spectra; este fichero
 * no contiene HTML/CSS. Las variables que alimenta (mateuRegistry, mateuAppState) las bindean esos
 * fragmentos — ver la sección "State & aplicación de increments" de .dev/vb/DESIGN-NOTES.md.
 */

define(['oj-sp/spectra-shell/config/config', 'redwood-vb/reduceContexts'], function (config, bridge) {
  'use strict';

  const BASE_URL = ''; // Service Connection de Mateu (constante del kit).

  class AppModule {
    // Transporte: POST /{base}/mateu/v3/components/_/action → UIIncrementDto.
    // En prod es una Service Connection; el shape del body es el RunActionRqDto.
    async callMateu(route, actionId, componentState, appState) {
      const res = await fetch(BASE_URL + '/mateu/v3/components/_/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route: route || '',
          actionId: actionId || '__load__',
          componentState: componentState || {},
          appState: appState || {},
        }),
      });
      return res.json();
    }

    // reduce → asignar mateuRegistry/mateuAppState → pipeline de efectos.
    // (Aquí como método; en la app VB, la action chain `applyIncrement` reasigna las variables
    //  $application y VB repinta las superficies bindeadas por id — structural sharing.)
    applyIncrement(registry, increment) {
      return bridge.reduceContexts(registry, increment);
    }
  }

  return AppModule;
});
