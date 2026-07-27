/* Bootstrap de la shell (Fases 2/6): el App de Mateu configura menú (con grupos),
 * selectores @AppContext y acciones de cabecera; se navega a la primera opción no-grupo. */

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

  class loadMateuShell extends ActionChain {

    async run(context) {
      const { $application } = context;

      const base = $application.constants.mateuBaseUrl;
      const reg = bridge.reduceContexts(
        { contexts: {}, stack: [], shell: null },
        await bridge.bootstrapShell(base),
      );
      $application.variables.mateuRegistry = reg;

      const nav = bridge.shellNavOf(reg);
      const appState = $application.variables.mateuAppState || {};
      $application.variables.mateuNavItems = nav.items;
      $application.variables.mateuMenuTabs = nav.mode === 'tabs';
      $application.variables.mateuMenuTopbar = nav.mode === 'topbar';
      $application.variables.mateuMenuDrawerMode = nav.mode === 'drawer';
      $application.variables.mateuNavDrawerOpen = nav.mode === 'drawer'; // abierto de inicio
      $application.variables.mateuMenuTree = nav.menuTree;
      $application.variables.mateuContextSelectors = nav.selectors.map((selector) => Object.assign({}, selector, {
        value: appState[selector.fieldName] != null ? appState[selector.fieldName] : null,
      }));
      $application.variables.mateuHeaderActions = nav.headerActions;
      $application.variables.mateuShellSST = nav.serverSideType || '';
      if (reg.shell && reg.shell.title) {
        document.title = reg.shell.title;
      }

      if (nav.mode === 'drawer') {
        // el navigation-list parsea su <ul> en el init; los li estampados llegan después
        try {
          await Actions.callComponentMethod(context, { selector: '#mateuNavList', method: 'refresh' });
        } catch (ignored) { /* aún no montado: el refresh del toggle lo cubrirá */ }
      }

      const firstLeaf = nav.menuTree.find((entry) => !entry.hasChildren);
      const firstGroup = nav.menuTree.find((entry) => entry.hasChildren);
      const first = firstLeaf || (firstGroup && firstGroup.children[0]);
      // la HOME del app (@HomeRoute, p.ej. la welcome page) manda sobre la primera
      // opción del menú
      const homeRoute = nav.homeRoute || (first ? first.id : '');
      $application.variables.mateuHomeRoute = homeRoute;

      // 1.5: deep-link — si la URL trae un hash (#/ruta), bootear ESA ruta
      const deepLink = (window.location.hash || '').replace(/^#/, '');
      const startRoute = deepLink || homeRoute;
      if (startRoute) {
        await Actions.callChain(context, {
          chain: 'onMateuNavigate',
          params: { event: { detail: { currentId: startRoute } }, fromUrl: !!deepLink },
        });
      }

      // 1.5: back/forward — el hash es la URL de la shell; el listener reutiliza el
      // context del chain (los scopes de VB siguen vivos tras el vbEnter)
      if (!window.__mateuHashWired) {
        window.__mateuHashWired = true;
        window.addEventListener('hashchange', () => {
          const route = (window.location.hash || '').replace(/^#/, '');
          if (route) {
            Actions.callChain(context, {
              chain: 'onMateuNavigate',
              params: { event: { detail: { currentId: route } }, fromUrl: true },
            });
          }
        });
      }
    }
  }

  return loadMateuShell;
});
