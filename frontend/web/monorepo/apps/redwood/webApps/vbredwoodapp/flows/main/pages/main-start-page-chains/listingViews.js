/* VISTAS GUARDADAS del listado (prefs.mjs): el menú (las de esta ruta, ★ la de por defecto,
 * «Save current view…»), aplicar una (se navega a la misma ruta con sus filtros en la query: el
 * camino de los filtros por URL, que pone los chips y relanza la búsqueda), guardar la actual. */

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

  class listingViews extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.op  menu | action | save | cancelSave
     */
    async run(context, { op, value }) {
      const { $application, $page } = context;
      const scope = bridge.listingScope();
      const dialog = () => document.getElementById('mateuSaveViewDialog');
      const go = (route) => Actions.fireEvent(context, { name: 'application:mateuNavigate', payload: { route, force: true } });
      if (op === 'menu') {
        $page.variables.mateuViewsMenu = bridge.viewsMenuOf(scope);
        // oj-menu lee sus opciones al inicializarse: las que estampa el for-each después no
        // despachan ojMenuAction hasta un refresh() (la misma trampa que el navigation-list)
        await new Promise((r) => requestAnimationFrame(() => r()));
        const menu = document.getElementById('mateuViewsMenu');
        if (menu && menu.refresh) menu.refresh();
        return;
      }
      if (op === 'action') {
        if (value === 'save') {
          $page.variables.mateuViewName = '';
          $page.variables.mateuViewDefault = false;
          dialog().open();
          return;
        }
        if (value === 'clear') {
          await go(scope);
          return;
        }
        const name = String(value || '').replace(/^view:/, '');
        const view = bridge.listSavedViews(scope).find((v) => v.name === name);
        if (view) await go(bridge.viewRouteOf(scope, view.values));
        return;
      }
      if (op === 'save') {
        const name = ($page.variables.mateuViewName || '').trim();
        if (!name) return;
        bridge.saveView(scope, {
          name,
          values: bridge.currentViewValues($application.variables.mateuFilterValues, $application.variables.mateuLastSearchText),
          isDefault: !!$page.variables.mateuViewDefault,
        });
        dialog().close();
        return;
      }
      if (op === 'cancelSave') dialog().close();
    }
  }

  return listingViews;
});
