/* SAVED VIEWS of the listing (prefs.mjs): the menu (this route's views, ★ the default one,
 * «Save current view…»), applying one (navigates to the same route with its filters in the query: the
 * filters-by-URL path, which sets the chips and relaunches the search), saving the current one. */

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
     * @param {string} params.op  menu | action (a view, save, default, delete, clear) | save | cancelSave
     */
    async run(context, { op, value }) {
      if (op === 'menu') return this.menu(context);
      if (op === 'action') return this.action(context, value);
      if (op === 'save') return this.save(context);
      if (op === 'cancelSave') saveDialog().close();
      return undefined;
    }

    /** The menu's options, read when it opens (✓ the view on, ★ the default one). */
    async menu(context) {
      context.$page.variables.mateuViewsMenu = bridge.viewsMenuOf(bridge.listingScope(), undefined, currentValues(context));
      // oj-menu reads its options when it initializes: the ones the for-each stamps later do not
      // dispatch ojMenuAction until a refresh() (the same trap as the navigation-list)
      await new Promise((r) => requestAnimationFrame(() => r()));
      const menu = document.getElementById('mateuViewsMenu');
      if (menu && menu.refresh) menu.refresh();
    }

    /** A menu option: a saved view (applied), save (the dialog), default / delete (the view on), clear. */
    async action(context, value) {
      const { $page } = context;
      const scope = bridge.listingScope();
      if (value === 'save') {
        $page.variables.mateuViewName = '';
        $page.variables.mateuViewDefault = false;
        saveDialog().open();
        return;
      }
      if (value === 'default' || value === 'delete') {
        const active = bridge.activeViewOf(bridge.listSavedViews(scope), currentValues(context));
        if (!active) return;
        if (value === 'default') bridge.toggleDefaultView(scope, active.name);
        else bridge.deleteView(scope, active.name);
        viewsChanged(context);
        return;
      }
      if (value === 'clear') {
        await navigateTo(context, scope);
        return;
      }
      const name = String(value || '').replace(/^view:/, '');
      const view = bridge.listSavedViews(scope).find((v) => v.name === name);
      if (view) await navigateTo(context, bridge.viewRouteOf(scope, view.values));
    }

    /** The dialog's Save: the current conditions under that name, then a toast saying so. */
    async save(context) {
      const { $page } = context;
      const name = ($page.variables.mateuViewName || '').trim();
      if (!name) return;
      bridge.saveView(bridge.listingScope(), { name, values: currentValues(context), isDefault: !!$page.variables.mateuViewDefault });
      saveDialog().close();
      viewsChanged(context);
      $page.variables.mateuToastText = bridge.chromeText('viewSaved', { name });
      await Actions.callComponentMethod(context, { selector: '#mateuToast', method: 'open' });
    }
  }

  const saveDialog = () => document.getElementById('mateuSaveViewDialog');
  const currentValues = ({ $application }) =>
    bridge.currentViewValues($application.variables.mateuFilterValues, $application.variables.mateuLastSearchText);
  // the views button's label is re-evaluated (it names the view on)
  const viewsChanged = ({ $page }) => { $page.variables.mateuViewsVersion = ($page.variables.mateuViewsVersion || 0) + 1; };
  const navigateTo = (context, route) =>
    Actions.fireEvent(context, { name: 'application:mateuNavigate', payload: { route, force: true } });

  return listingViews;
});
