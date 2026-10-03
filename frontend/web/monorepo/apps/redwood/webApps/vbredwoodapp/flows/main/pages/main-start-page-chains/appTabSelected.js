/* P1 · Maestro con pestañas que son páginas: elegir una pestaña de un NIVEL de app (el maestro de
 * un registro, @App(TABS) con hijos en routes.yaml) es NAVEGAR a su ruta — cada pestaña es una
 * página con URL propia —, y el «← Padre» (@App(backLink = PARENT)) también. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class appTabSelected extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  selection-changed de la barra ({detail: {value: ruta, updatedFrom}})
     *     o el ojAction del «← Padre» (el botón lleva la ruta en data-route)
     * @param {boolean} params.back  el clic viene del «← Padre»
     */
    async run(context, { event, back }) {
      let route;
      if (back) {
        const target = event && (event.currentTarget || event.target);
        const holder = target && target.closest ? target.closest('[data-route]') : target;
        route = holder && holder.getAttribute ? holder.getAttribute('data-route') : null;
      } else {
        const detail = (event && (event.detail || event)) || {};
        // el eco del writeback tras pintar la barra no es un clic
        if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
          return;
        }
        route = detail.value;
      }
      if (!route) {
        return;
      }
      await Actions.fireEvent(context, {
        name: 'application:mateuNavigate',
        payload: { route },
      });
    }
  }

  return appTabSelected;
});
