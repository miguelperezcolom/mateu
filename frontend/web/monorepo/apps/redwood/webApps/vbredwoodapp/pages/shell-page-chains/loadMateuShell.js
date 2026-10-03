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

  /**
   * Marca y nombre del FAB de "ask" del shell (Ask Oracle, o la marca del @App).
   *
   * Lo estampa oj-sp-simple-ui-shell con el bocadillo de su asistente digital
   * (oj-ux-ico-oracle-chat), sin href ni rol: no se alcanza con el tabulador y sólo dice "Ask".
   * Aquí abre el buscador de Ask Oracle y el chat del agente tiene su propio FAB con otro
   * bocadillo, así que cada uno tiene que decir cuál es. No es marcado nuestro: se marca después,
   * cuando el shell lo ha pintado (bridge.brandAskFab).
   */
  const brandAskFabSoon = (spec, attempt = 0) => {
    const fab = document.querySelector('oj-sp-simple-ui-shell .oj-sp-rw-chat-icon-cont');
    if (bridge.brandAskFab(fab, spec)) return;
    if (attempt < 20) setTimeout(() => brandAskFabSoon(spec, attempt + 1), 500);
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

      // Las secciones que sirve otro pod llegan marcadas y sin hijos: hay que ir a
      // buscarlos antes de construir el nav, o la barra sale con rótulos y nada debajo.
      // Un pod que no conteste deja su rótulo y no impide arrancar.
      if (reg.shell && reg.shell.menu) {
        reg.shell.menu = await bridge.expandRemoteMenus(reg.shell.menu);
        // El chat necesita el menú YA expandido (las pantallas de cada pod, con su descriptor de
        // listado) para el menuContext del agente. mateuRegistry se asignó antes de expandir y VB
        // guarda una copia, así que el menú expandido no llega a la variable: se deja aquí.
        window.__mateuShellMenu = reg.shell.menu;
      }

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

      // Widgets de cabecera del App (WidgetSupplier): el de usuario al área de perfil, el resto a
      // la zona de acciones. El HTML lo pone el bridge en el hueco que estampa la plantilla; un
      // MicroFrontend se carga de SU pod y sigue vivo con sus triggers (el badge: cada 10 s).
      const widgets = bridge.headerWidgetsOf(reg);
      $application.variables.mateuUserWidget = widgets.user;
      $application.variables.mateuHeaderWidgets = widgets.items;
      bridge.stopRemoteWidgets();
      for (const item of widgets.items) {
        if (item.isHtml) {
          bridge.mountHeaderHtmlSoon(item.id, item.html);
        } else if (item.isRemote) {
          bridge.startRemoteWidget(item, (html) => bridge.mountHeaderHtmlSoon(item.id, html), {
            appState: () => $application.variables.mateuAppState || {},
          });
        }
      }
      $application.variables.mateuShellSST = nav.serverSideType || '';
      // logo del @App (URL relativa al backend Mateu) → imagen de marca en el header
      $application.variables.mateuShellLogo = reg.shell && reg.shell.logo
        ? base + reg.shell.logo : '';
      // chat de IA (@AI → App.sseUrl): endpoint del agente, same-origin del backend Mateu.
      // Con esto puesto sale el botón del chat en la cabecera (su drawer a la izquierda).
      $application.variables.mateuChatSseUrl = reg.shell && reg.shell.sseUrl
        ? base + reg.shell.sseUrl : '';
      // el FAB de "ask": Ask Oracle con su glifo, o el rótulo/icono del @App(askLabel, askIcon)
      const askFab = bridge.askFabOf(reg.shell, base);
      $application.variables.mateuAskLabel = askFab.label;
      brandAskFabSoon(askFab);
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
      // con su query: `?integration=MRU01` son los filtros con que se abre un listado (Vaadin
      // los aplica; aquí se perdían al arrancar y el listado salía sin filtrar)
      const urlRoute = () => (pathMode
        ? (window.location.pathname === '/' ? '' : window.location.pathname + (window.location.search || ''))
        : (window.location.hash || '').replace(/^#/, ''));

      // deep-link — si la URL trae ruta, bootear ESA ruta. Con la query con que se abrió la
      // página (index.html la guarda al cargar: el router de VB la quita de la URL al arrancar)
      const initialSearch = window.__mateuInitialSearch || '';
      window.__mateuInitialSearch = '';
      let deepLink = urlRoute();
      if (pathMode && deepLink && deepLink.indexOf('?') < 0 && initialSearch) {
        deepLink += initialSearch;
      }
      const startRoute = deepLink || homeRoute;
      if (startRoute) {
        await Actions.callChain(context, {
          chain: 'onMateuNavigate',
          params: { event: { detail: { currentId: startRoute } }, fromUrl: !!deepLink },
        });
      }

      // navigation-requested: lo emite el HTML de un widget (el enlace del badge de la bandeja) y
      // burbujea hasta el documento — el mismo evento que escucha el renderer web. Trae su pod
      // (baseUrl + serverSideType): si el menú no conoce la ruta, se registra antes de navegar.
      // Los listeners de abajo se cablean UNA vez, pero el context de la chain caduca: si VB
      // vuelve a entrar en la página (su router reacciona a ciertos cambios de URL), el context
      // capturado queda «disposed» y un atrás/adelante posterior no hacía nada (VB lo descarta con
      // un WARN): la pantalla se quedaba en blanco con la pestaña anterior marcada. Siempre el último.
      window.__mateuShellContext = context;
      const liveContext = () => window.__mateuShellContext || context;
      if (!window.__mateuNavRequestWired) {
        window.__mateuNavRequestWired = true;
        document.addEventListener('navigation-requested', (event) => {
          const detail = (event && event.detail) || {};
          if (detail.route == null) return;
          event.stopPropagation();
          bridge.registerRemoteRoute(detail.route, detail);
          Actions.callChain(liveContext(), {
            chain: 'onMateuNavigate',
            params: { event: { detail: { route: detail.route } } },
          });
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
            Actions.callChain(liveContext(), {
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
