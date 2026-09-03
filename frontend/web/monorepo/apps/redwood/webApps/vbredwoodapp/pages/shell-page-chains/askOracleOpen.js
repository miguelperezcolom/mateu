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

  // catálogo de destinos: TODAS las pantallas del menú + las vistas rápidas del listado
  // que se esté viendo.
  //
  // El menú se recorre ENTERO, no solo el primer nivel: un grupo no es un destino (no
  // resuelve, y pulsarlo dejaría la paleta ofreciendo un sitio al que no se puede ir), y las
  // pantallas que cuelgan de él —incluidas las que sirve otro pod, que en una shell federada
  // son casi todas— es justo lo que uno viene a buscar aquí. El rastro del grupo va a la
  // derecha de la fila: dos pods pueden tener una pantalla que se llame igual.
  const collect = (nodes, trail, items) => {
    for (const node of nodes || []) {
      const deeper = trail ? trail + ' › ' + node.label : node.label;
      if (node.hasChildren) {
        collect(node.children, deeper, items);
      } else if (node.id) {
        items.push({ label: node.label, route: node.id, trail,
          icon: node.icon || 'oj-ux-ico-arrow-circle-right', kind: trail || 'Ir a' });
      }
    }
    return items;
  };

  const buildResults = ($application, text) => {
    const items = [];
    const home = $application.variables.mateuHomeRoute;
    if (home) {
      items.push({ label: 'Inicio', route: home, icon: 'oj-ux-ico-home', kind: 'Ir a' });
    }
    collect($application.variables.mateuMenuTree, '', items);
    // vistas rápidas: los filtros de opciones del listado ACTUAL (antes iban tres rutas del
    // front-office escritas a mano, que en cualquier otra app son tres destinos muertos)
    const listing = $application.variables.mateuListing || {};
    const route = $application.variables.mateuSelectedRoute;
    for (const quick of (listing.quickFilters || [])) {
      for (const option of (quick.options || [])) {
        items.push({ label: (listing.title || 'Listado') + ' — ' + option.label, route,
          quickField: quick.fieldId, quickValue: option.value,
          icon: 'oj-ux-ico-filter', kind: 'Vista rápida' });
      }
    }
    const busca = (text || '').trim().toLowerCase();
    // se busca también por el rastro: "workflow" encuentra sus pantallas
    return busca
      ? items.filter((item) => (item.label + ' ' + (item.trail || '')).toLowerCase().indexOf(busca) >= 0)
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
