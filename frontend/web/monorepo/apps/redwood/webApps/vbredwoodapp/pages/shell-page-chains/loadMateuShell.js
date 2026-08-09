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

  /**
   * Pone nombre a los iconos de expandir/colapsar de los grupos del menú.
   *
   * Los genera oj-navigation-list por dentro como `<a role="button">` VACÍOS: un lector de
   * pantalla los anuncia como "botón", sin decir de qué. No es marcado nuestro y no podemos
   * cambiar cómo los emite JET, pero sí nombrarlos después, tomando el texto del grupo al
   * que pertenecen — que es lo que el usuario necesita oír.
   */
  const nameCollapseIcons = () => {
    const list = document.querySelector('#mateuNavList');
    if (!list) return;
    list.querySelectorAll('.oj-navigationlist-collapse-icon').forEach((icon) => {
      const item = icon.closest('li');
      const label = item ? (item.textContent || '').trim().split('\n')[0].trim() : '';
      icon.setAttribute('aria-label', label ? `Desplegar ${label}` : 'Desplegar grupo');
    });
  };

  class loadMateuShell extends ActionChain {

    async run(context) {
      const { $application } = context;

      const base = $application.constants.mateuBaseUrl;

      // Static-bundle (modo sin backend): si hay un mateuBundleUrl configurado, se arranca la carga
      // del manifest AQUÍ, antes del bootstrap. bootstrapShell/loadRoute esperan al fetch en vuelo
      // (awaitBundle) y responden desde el bundle cuando la ruta está — así las cargas van sin
      // backend y, si el backend no está, hasta la shell cae a la ruta raíz bundleada.
      const bundleUrl = $application.constants.mateuBundleUrl;
      if (bundleUrl) bridge.loadBundleManifest(bundleUrl);

      // Resiliencia del transporte (mismo contrato que los renderers web, ver poc/resilience.mjs).
      // Se cablea ANTES del primer bootstrapShell para que hasta la carga inicial cuente: si el
      // backend está caído al arrancar, el usuario ve un mensaje en vez de una pantalla muerta.
      bridge.connectivity.start();
      // Las regiones vivas tienen que EXISTIR antes de que nada escriba en ellas: una creada
      // y rellenada en el mismo tick a menudo no se anuncia.
      bridge.installAnnouncer();
      bridge.mountSkipLink();
      // El control pulsado se sigue a nivel de documento: los botones de la app pasan por
      // chains distintas y enhebrar el evento por todas ellas se olvidaría en la siguiente.
      bridge.trackPressedControls();
      bridge.setTransportHooks({
        onStart: () => { $application.variables.mateuBusy = true; bridge.markPressedControlBusy(); },
        onSettle: ({ failure }) => {
          $application.variables.mateuBusy = false;
          bridge.clearPressedControlBusy();
          // 'cancelled' es una decisión nuestra (navegación, abort): nunca es noticia.
          if (failure && failure.kind !== 'cancelled') {
            $application.variables.mateuLastError = failure.message;
            // La banda es una señal visual; quien usa lector de pantalla no se enteraría.
            bridge.announce(failure.message, { politeness: 'assertive' });
          }
        },
      });
      // Perder la conexión es un ESTADO, no un evento: mientras dura se sostiene una banda,
      // en vez de un aviso por clic que el usuario ve pasar cinco segundos cada vez.
      bridge.connectivity.subscribe((online) => {
        $application.variables.mateuOffline = !online;
      });
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
      // logo del @App (URL relativa al backend Mateu) → imagen de marca en el header
      $application.variables.mateuShellLogo = reg.shell && reg.shell.logo
        ? base + reg.shell.logo : '';
      if (reg.shell && reg.shell.title) {
        document.title = reg.shell.title;
      }

      if (nav.mode === 'drawer') {
        // el navigation-list parsea su <ul> en el init; los li estampados llegan después
        try {
          await Actions.callComponentMethod(context, { selector: '#mateuNavList', method: 'refresh' });
          nameCollapseIcons();
        } catch (ignored) { /* aún no montado: el refresh del toggle lo cubrirá */ }
      }

      const firstLeaf = nav.menuTree.find((entry) => !entry.hasChildren);
      const firstGroup = nav.menuTree.find((entry) => entry.hasChildren);
      const first = firstLeaf || (firstGroup && firstGroup.children[0]);
      // la HOME del app (@HomeRoute, p.ej. la welcome page) manda sobre la primera
      // opción del menú
      const homeRoute = nav.homeRoute || (first ? first.id : '');
      $application.variables.mateuHomeRoute = homeRoute;

      // 1.5: URL de la shell — modo PATH (/ruta) cuando la app la sirve el backend Mateu
      // (jar de renderer: el controller generado inyecta un <mateu-ui> oculto, la señal),
      // modo HASH (#/ruta) en serving estático (vb-serve local / VB hosteado en Oracle,
      // donde el server no puede reescribir paths arbitrarios al index)
      const pathMode = !!document.querySelector('mateu-ui');
      window.__mateuUrlPathMode = pathMode;
      const urlRoute = () => (pathMode
        ? (window.location.pathname === '/' ? '' : window.location.pathname)
        : (window.location.hash || '').replace(/^#/, ''));

      // deep-link — si la URL trae ruta, bootear ESA ruta
      const deepLink = urlRoute();
      const startRoute = deepLink || homeRoute;
      if (startRoute) {
        await Actions.callChain(context, {
          chain: 'onMateuNavigate',
          params: { event: { detail: { currentId: startRoute } }, fromUrl: !!deepLink },
        });
      }

      // 1.5: back/forward — el listener reutiliza el context del chain (los scopes de VB
      // siguen vivos tras el vbEnter); popstate en modo path, hashchange en modo hash
      if (!window.__mateuHashWired) {
        window.__mateuHashWired = true;
        window.addEventListener(pathMode ? 'popstate' : 'hashchange', () => {
          // en modo path, volver a '/' es volver a la home
          const route = urlRoute() || (pathMode ? ($application.variables.mateuHomeRoute || '') : '');
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
