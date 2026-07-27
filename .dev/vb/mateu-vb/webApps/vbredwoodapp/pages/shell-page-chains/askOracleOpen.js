/* Ask Oracle (FAB del shell): abre la paleta con TODOS los destinos (navegación + las
 * vistas rápidas del listado) y el foco en el buscador. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  // catálogo de destinos: navegación del app + vistas rápidas del listado de reservas
  const buildResults = ($application, text) => {
    const items = [];
    const home = $application.variables.mateuHomeRoute;
    if (home) {
      items.push({ label: 'Inicio', route: home, icon: 'oj-ux-ico-home', kind: 'Ir a' });
    }
    for (const nav of $application.variables.mateuNavItems || []) {
      items.push({ label: nav.label, route: nav.id,
        icon: nav.icon || 'oj-ux-ico-arrow-circle-right', kind: 'Ir a' });
    }
    for (const vista of [
      ['Llegadas hoy', 'LLEGADAS_HOY'],
      ['Salidas hoy', 'SALIDAS_HOY'],
      ['In house', 'IN_HOUSE'],
    ]) {
      items.push({ label: 'Reservas — ' + vista[0], route: '/reservas',
        quickField: 'vista', quickValue: vista[1],
        icon: 'oj-ux-ico-filter', kind: 'Vista rápida' });
    }
    const busca = (text || '').trim().toLowerCase();
    return busca
      ? items.filter((item) => item.label.toLowerCase().indexOf(busca) >= 0)
      : items;
  };

  class askOracleOpen extends ActionChain {

    async run(context) {
      const { $application, $page } = context;
      $page.variables.mateuAskResults = buildResults($application, '');
      await Actions.callComponentMethod(context, { selector: '#mateuAskOracle', method: 'open' });
      setTimeout(() => {
        const input = document.querySelector('#mateuAskInput input');
        if (input) input.focus();
      }, 300);
    }
  }

  askOracleOpen.buildResults = buildResults;
  return askOracleOpen;
});
