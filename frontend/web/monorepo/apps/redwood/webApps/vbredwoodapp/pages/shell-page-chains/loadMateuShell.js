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

      // el montaje del @UI (<mateu-ui baseUrl>) antes de nada: de él cuelga la API
      bridge.initMount(document);
      const base = bridge.mateuBase($application.constants.mateuBaseUrl);
      // Element (componentes web): su módulo `import` relativo lo sirve el BACKEND (otro origen en
      // vb-serve / VB alojado), y sus eventos (Element.on) ejecutan acciones de la página de
      // contenido, así que viajan como evento de aplicación (el camino del Reintentar). Antes de
      // la primera navegación: el contenido inicial ya puede traer Elements.
      // imágenes, logo, módulos de componentes web y el sseUrl: de la RAÍZ del backend (no del
      // montaje del @UI), como en el renderer Vaadin
      const assetBase = bridge.mateuAssetBase($application.constants.mateuBaseUrl);
      bridge.setElementModuleBase(assetBase);
      const runPageAction = (actionId, parameters, atom) => {
        Actions.fireEvent(window.__mateuShellContext || context, {
          name: 'application:mateuElementEvent',
          payload: { actionId, parameters, fromNested: !!(atom && atom.fromNested) },
        });
      };
      bridge.setElementEventSink(runPageAction);
      // reglas del cliente (@Hidden/@Disabled con expresión, RuleSupplier): escuchan los cambios de
      // campo de todo el documento; una RunAction de regla sale por el mismo camino
      bridge.installRules();
      bridge.setRuleActionSink(runPageAction);
      // tape chart: arrastrar por celdas vacías → rangeSelectActionId (oj-gantt no lo trae)
      bridge.installPlanningRange();
      // «I want to…» (ActionPanel): abrir con su atajo, mostrar más, ocultar vacías, cerrar al elegir
      bridge.installActionPanels();
      // dashboard con tiles reordenables (ResponsiveGrid.reorderable): arrastrar o Alt+←/→; el
      // orden se guarda y la página de contenido re-proyecta el host
      bridge.setTileReorderSink((scope) => Actions.fireEvent(window.__mateuShellContext || context, {
        name: 'application:mateuTilesReordered', payload: { scope: scope || '' },
      }));
      bridge.installTileReorder();
      // texto enriquecido (Markdown, campos richText/html/markdown de sólo lectura): el HTML ya
      // saneado de cada [data-mateu-html] se vuelca en su contenedor
      bridge.installRichText();
      // MatrixGrid (oj-data-grid): plegar secciones, editar filas editables, celdas que enlazan
      bridge.installMatrixGrids();
      // Calendar: cambiar de vista en el DOM, eventos y fechas que lanzan su acción
      bridge.installCalendars();
      bridge.setCalendarActionSink(runPageAction);
      bridge.setMatrixActionSink(runPageAction);
      // Map: JET no trae mapa de calles → Leaflet (cdnjs) + teselas OSM; un marcador lanza su acción
      bridge.installMaps();
      bridge.setMapActionSink(runPageAction);
      // tonos de fila (@RowStatus) y filas de grupo (@GroupBy) del oj-table del listado
      bridge.installRowTones();
      // la ficha de un registro: su cabecera queda fija y se compacta al hacer scroll
      bridge.installStickyHeader();
      bridge.setPlanningRangeSink(runPageAction);
      // toasts con «Undo» (Message.undoable): la acción vuelve a la página de contenido
      bridge.setUndoSink(runPageAction);
      // refresco periódico (OnLoad con espera + OnSuccess): las vueltas salen por el mismo camino
      bridge.setPollingRunner(runPageAction);
      // atajos de teclado (@Action/@Tab shortcut) y teclas de acceso (@App(accessKeys))
      bridge.installKeys();
      // ventanas flotantes al pasar el ratón (celdas con @Tooltip, Popover)
      bridge.installHover();
      // display components whose view needs the DOM: the BPMN diagram (SVG from its BPMN-DI), the
      // cookie consent band, a ContextMenu's right click, and the Chat component's conversation
      bridge.installBpmn();
      bridge.installCookieConsent();
      bridge.installContextMenus();
      bridge.installChatComponents();
      bridge.installCustomComponents();
      // arrastrar filas (@DragRows) a un DropZone: su acción con origen y destino
      bridge.installDragAndDrop();
      bridge.setDropSink(runPageAction);
      bridge.setKeysActionSink(runPageAction);

      // The IDE's visual editor paints with this app (its preview page sets the flag): the
      // increment comes from the editor through postMessage, the app answers its own /mateu calls
      // with it, and the painted atoms carry the definition's node ids (bridge editorPreview.mjs).
      // Before the bootstrap: it must already be answered locally.
      let editorPreview = null;
      if (bridge.isEditorPreview(window)) {
        bridge.setEditorNodeIds(true);
        editorPreview = bridge.installEditorPreview(window, {
          rerender: () => Actions.callChain(window.__mateuShellContext || context, {
            chain: 'onMateuNavigate',
            params: { event: { detail: { route: bridge.PREVIEW_ROUTE } }, force: true },
          }),
          dataOf: await bridge.editorDataResolver(),
        });
      }

      // Static-bundle (modo sin backend): si hay un mateuBundleUrl configurado, se arranca la carga
      // del manifest AQUÍ, antes del bootstrap. bootstrapShell/loadRoute esperan al fetch en vuelo
      // (awaitBundle) y responden desde el bundle cuando la ruta está — así las cargas van sin
      // backend y, si el backend no está, hasta la shell cae a la ruta raíz bundleada.
      // the bundle's index.html names it on <mateu-ui bundleUrl> (a static Redwood bundle); the
      // app constant stays for a hand-configured VB deployment
      const bundleUrl = bridge.bundleUrlOf(document) || $application.constants.mateuBundleUrl;
      if (bundleUrl) bridge.loadBundleManifest(bundleUrl);

      // Resiliencia del transporte (mismo contrato que los renderers web, ver poc/resilience.mjs).
      // Se cablea ANTES del primer bootstrapShell para que hasta la carga inicial cuente: si el
      // backend está caído al arrancar, el usuario ve un mensaje en vez de una pantalla muerta.
      bridge.connectivity.start();
      // Los errores que el usuario ve (y los de JS sin capturar) quedan en el log del servidor:
      // POST <base>/mateu/v3/client-log con el mismo token que el resto (ver poc/clientLog.mjs).
      bridge.installClientErrorReporting(base, { headers: bridge.authHeadersOf });
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
      const boot = await bridge.bootstrapShell(base);
      // un @UI que NO es un App (una página, un crud): sin menú ni ruta propia — su home es la
      // carga «fresca» del montaje (bridge.bootstrapHasApp / setMountWithoutApp)
      const withoutApp = !bridge.bootstrapHasApp(boot);
      bridge.setMountWithoutApp(withoutApp);
      const reg = bridge.reduceContexts({ contexts: {}, stack: [], shell: null }, boot);
      $application.variables.mateuRegistry = reg;

      // Las secciones que sirve otro pod llegan marcadas y sin hijos: hay que ir a
      // buscarlos antes de construir el nav, o la barra sale con rótulos y nada debajo.
      // Un pod que no conteste deja su rótulo y no impide arrancar.
      if (reg.shell && reg.shell.menu) {
        // HAMBURGER_SECTIONS: cada pod montado en el primer nivel es una sección (asSection)
        reg.shell.menu = await bridge.expandRemoteMenus(reg.shell.menu, { sections: reg.shell.variant === 'HAMBURGER_SECTIONS' });
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
      // MENU_ON_TOP: la banda 2 bajo la cabecera — el título de la consola y su menú
      // HAMBURGER_SECTIONS: la misma banda, con el segundo nivel de la sección en pantalla
      $application.variables.mateuMenuSubheader = nav.mode === 'subheader' || nav.mode === 'sections';
      $application.variables.mateuMenuSections = nav.mode === 'sections';
      $application.variables.mateuSectionList = nav.sections;
      $application.variables.mateuShellTitle = nav.title;
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
      bridge.setAccessKeysEnabled(!!(reg.shell && reg.shell.accessKeys));
      // la campana (NotificationsSupplier del App): la lista se pide al arrancar y al abrirla
      // GlobalSearchSupplier: the Ask palette also searches the app's entities (askOracleTyped)
      $application.variables.mateuGlobalSearch = !!(reg.shell && reg.shell.globalSearchEnabled);
      // @App(themeToggle): the header switch; the stored choice (or the OS preference) applies anyway
      $application.variables.mateuThemeToggle = !!(reg.shell && reg.shell.themeToggle);
      bridge.applyInitialTheme();
      if (reg.shell && reg.shell.notificationsEnabled) {
        bridge.fetchNotifications(base, $application.variables.mateuShellSST, $application.variables.mateuAppState || {})
          .then((model) => { $application.variables.mateuNotifications = model; })
          .catch(() => { /* sin bandeja: la cabecera sigue sin campana */ });
      }
      // logo del @App (URL relativa al backend Mateu) → imagen de marca en el header
      $application.variables.mateuShellLogo = reg.shell && reg.shell.logo
        ? assetBase + reg.shell.logo : '';
      // chat de IA (@AI → App.sseUrl): endpoint del agente, same-origin del backend Mateu.
      // Con esto puesto sale el botón del chat en la cabecera (su drawer a la izquierda).
      // Y, como el chat web: el título del panel (la marca del @App(askLabel)), los adjuntos
      // (@AI(upload)) y el mcpUrl (@AI(mcp)) — bridge.chatConfigOf
      const chat = bridge.chatConfigOf(reg.shell, assetBase);
      $application.variables.mateuChatSseUrl = chat.sseUrl;
      $application.variables.mateuChatTitle = chat.title;
      $application.variables.mateuChatUploadUrl = chat.uploadUrl;
      $application.variables.mateuChatMcpUrl = chat.mcpUrl;
      // el FAB de "ask": Ask Oracle con su glifo, o el rótulo/icono del @App(askLabel, askIcon)
      const askFab = bridge.askFabOf(reg.shell, assetBase);
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
      // (el homeRoute de un App montado llega entero, '/appdemo/screen': la ruta es relativa al montaje)
      const homeRoute = bridge.routeUnderMount(nav.homeRoute) || (first ? first.id : '') || (withoutApp ? '/' : '');
      $application.variables.mateuHomeRoute = homeRoute;

      // 1.5: URL de la shell — modo PATH (/ruta) cuando la app la sirve el backend Mateu
      // (jar de renderer: el controller generado inyecta un <mateu-ui> oculto, la señal),
      // modo HASH (#/ruta) en serving estático (vb-serve local / VB hosteado en Oracle,
      // donde el server no puede reescribir paths arbitrarios al index)
      // El <mateu-ui> lleva además el MONTAJE del @UI (baseUrl="/console"): la API cuelga de él
      // y las rutas son relativas a él (bridge.initMount; '' en la raíz).
      const pathMode = bridge.initMount(document) != null;
      window.__mateuUrlPathMode = pathMode;
      // con su query: `?integration=MRU01` son los filtros con que se abre un listado (Vaadin
      // los aplica; aquí se perdían al arrancar y el listado salía sin filtrar)
      const urlRoute = () => bridge.currentRouteOf(window.location);

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
      if (editorPreview) {
        window.__mateuShellContext = context;
        editorPreview.booted();
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

      // Un enlace HTML corriente del contenido (`<a href="/journey/bookings/ZUAAKJ">`, el de un
      // Text/Html de la app) navega DENTRO de la shell, como en Vaadin (el RouterLinkHandler de
      // Flow): sin esto el navegador cargaba la página entera y la shell volvía a arrancar, 20–40 s
      // en blanco. Las reglas (clic normal, mismo origen, sin target/download, nada de /_xxx, API
      // ni ficheros) están en bridge.inAppRouteOfLink. Sólo el contenido de la página (#pageContent):
      // la cabecera (menú de usuario, enlaces a otras consolas) sigue como siempre. Se escucha en
      // burbuja: quien ya atendió el clic (el chat, el badge de un widget) lo marcó con
      // preventDefault y no se toca. Enter sobre un enlace también llega como click. La URL se
      // empuja al historial en onMateuNavigate (atrás vuelve a la pantalla del enlace).
      if (!window.__mateuInAppLinksWired) {
        window.__mateuInAppLinksWired = true;
        document.addEventListener('click', (event) => {
          const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
          const content = document.getElementById('pageContent');
          if (!content || !path.includes(content)) return;
          const anchor = path.find((node) => node && node.tagName === 'A');
          if (!anchor) return;
          let route = bridge.inAppRouteOfLink(anchor, event, window.location, !window.__mateuUrlPathMode,
            bridge.currentMount());
          if (route === '/') route = liveContext().$application.variables.mateuHomeRoute || '';
          if (!route) return;
          event.preventDefault();
          Actions.callChain(liveContext(), {
            chain: 'onMateuNavigate',
            params: { event: { detail: { route } } },
          });
        });
      }

      // En modo path el historial es SOLO de Mateu, y el router de VB no puede verlo. Toma por
      // «application URL» la ruta con que arrancó la página (/customers → /customers/) y lee
      // cualquier URL por debajo de ella como una página suya (/customers/5 → la página «5»): en
      // un atrás sale de la shell (vbExit), deja «disposed» el context de las chains y no vuelve a
      // entrar, así que la pantalla no se repintaba. Pasaba al entrar al maestro desde una fila
      // del listado; con un enlace directo no, porque las pestañas no quedan POR DEBAJO de la ruta
      // de arranque (/customers/3/orders → /customers/3/addresses). VB escucha con
      // window.onpopstate, que corre antes que cualquier listener añadido después (también en
      // captura), así que se le quita: es una sola página de VB, no tiene navegación propia.
      if (pathMode) {
        window.onpopstate = null;
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
