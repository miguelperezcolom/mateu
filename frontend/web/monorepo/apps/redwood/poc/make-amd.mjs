// Genera el módulo AMD del bridge para la app VB a partir de la FUENTE ÚNICA del core:
// reduceContexts.mjs + resilience.mjs + transport.mjs (los mismos ficheros que testea
// test.mjs/capture.mjs). El orden importa: transport.mjs usa lo de resilience.mjs, y al
// concatenar todo cae en un mismo scope sin imports.
// Uso: node make-amd.mjs   → escribe ../webApps/vbredwoodapp/resources/js/mateu-bridge.js

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '..', 'webApps', 'vbredwoodapp', 'resources', 'js', 'mateu-bridge.js')

const strip = (file) =>
  readFileSync(join(here, file), 'utf8')
    .split('\n')
    .filter((l) => !l.startsWith('import '))
    .map((l) => l.replace(/^export (async |const |function |class )/, '$1').replace(/^export /, ''))
    .join('\n')

// bundle.mjs antes de transport.mjs: transport.loadRoute consulta el manifest cargado.
// chat.mjs es autónomo (solo transporte SSE del chat de IA); va al final del scope compartido.
const body = `${strip('prefs.mjs')}\n\n${strip('navTree.mjs')}\n\n${strip('calendar.mjs')}\n\n${strip('richtext.mjs')}\n\n${strip('links.mjs')}\n\n${strip('reduceContexts.mjs')}\n\n${strip('breadcrumbs.mjs')}\n\n${strip('clientLog.mjs')}\n\n${strip('polling.mjs')}\n\n${strip('resilience.mjs')}\n\n${strip('a11y.mjs')}\n\n${strip('elements.mjs')}\n\n${strip('notify.mjs')}\n\n${strip('files.mjs')}\n\n${strip('inputs.mjs')}\n\n${strip('rules.mjs')}\n\n${strip('planning.mjs')}\n\n${strip('actionPanels.mjs')}\n\n${strip('keys.mjs')}\n\n${strip('hover.mjs')}\n\n${strip('dnd.mjs')}\n\n${strip('matrix.mjs')}\n\n${strip('map.mjs')}\n\n${strip('tables.mjs')}\n\n${strip('bundle.mjs')}\n\n${strip('transport.mjs')}\n\n${strip('widgets.mjs')}\n\n${strip('chat.mjs')}`

// Todos los módulos caen en UN scope: dos declaraciones de nivel superior con el mismo nombre no
// fallan, la ÚLTIMA gana en silencio — así el sanitizador de elements.mjs tapó al de richtext.mjs
// (el que comprobaban los tests) en todo el bridge. Cualquier nombre repetido rompe el build.
{
  const seen = new Map()
  const decl = /^(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)|^(?:const|let|var|class)\s+([A-Za-z_$][\w$]*)/
  const dups = []
  for (const line of body.split('\n')) {
    const m = decl.exec(line)
    if (!m) continue
    const name = m[1] || m[2]
    if (seen.has(name)) dups.push(name)
    seen.set(name, true)
  }
  if (dups.length) {
    console.error('make-amd: nombres repetidos en el scope compartido del bridge: ' + [...new Set(dups)].join(', '))
    process.exit(1)
  }
}

const amd = `/* GENERADO por poc/make-amd.mjs — NO EDITAR A MANO.
 * Fuente única del core: poc/reduceContexts.mjs + transport.mjs
 * (tests de contrato: cd poc && node test.mjs). */
define(['require', 'ojs/ojarraydataprovider', 'ojs/ojconverter-number', 'ojs/ojarraytreedataprovider', 'ojs/ojflattenedtreedataproviderview', 'ojs/ojrowdatagridprovider', 'ojs/ojkeyset'], (require, ArrayDataProvider, NumberConverter, ArrayTreeDataProvider, FlattenedTreeDataProviderView, RowDataGridProvider, KeySet) => {
  'use strict';
${body.replace(/^/gm, '  ').replace(/^ {2}$/gm, '')}
  // el importe de un campo money: IntlNumberConverter con estilo moneda (un objeto JSON ya no vale)
  setConverterFactory((spec) => new NumberConverter.IntlNumberConverter(spec.options));
  // reglas del cliente: cada reducción fija su contexto (las del host, con su estado)
  // el selector de columnas: listingOf aplica las preferencias de la ruta en pantalla
  setColumnPrefsReader(() => readColumnPrefs(listingScope()));
  setAfterReduceHook((reg) => {
    setRulesContext(reg.contexts[HOST_ID]);
    // los @Action(shortcut) de la pantalla en curso (keys.mjs)
    setShortcutContext(reg.contexts[HOST_ID]);
    // los tonos de fila (@RowStatus) y las filas de grupo del listado del host
    const listing = listingOf(reg.contexts[HOST_ID]);
    setListingTones(listing ? listing.rows : []);
  });
  // MatrixGrid: oj-data-grid sobre un RowDataGridProvider de una vista aplanada del árbol (las
  // secciones plegables las pinta JET); __mateu guarda lo que installMatrixGrids necesita
  setMatrixProviderFactory((spec) => {
    const tree = new ArrayTreeDataProvider(spec.data, { keyAttributes: 'id', childrenAttribute: 'children' });
    const expanded = new KeySet.KeySetImpl(spec.expanded);
    const flat = new FlattenedTreeDataProviderView(tree, { expanded });
    const provider = new RowDataGridProvider.RowDataGridProvider(flat, {
      columns: { rowHeader: ['label'], databody: spec.columnKeys },
      columnHeaders: { column: spec.columnHeaders },
      headerLabels: spec.rowHeaderLabel ? { row: [spec.rowHeaderLabel] } : undefined,
      expandedObservable: flat.getExpandedObservable(),
    });
    provider.__mateu = { flat, expanded };
    return provider;
  });
  // la lista de la campana: un ArrayDataProvider para el oj-list-view del popup
  setNotificationsProviderFactory((items) => new ArrayDataProvider(items || [], { keyAttributes: 'id' }));
  // campos de captura (fichero, imagen, firma, cámara): JET no los trae
  defineCaptureField();
  // los grids embebidos necesitan un data provider de JET; el core es agnóstico y lo recibe
  setDataProviderFactory((rows) => new ArrayDataProvider(rows || [], { keyAttributes: '_rowNumber' }));
  // el editor de cada filtro del buscador (smartFilters.filtersMetadata): oj-dynamic se carga
  // sólo cuando un listado declara filtros
  setMetadataProviderFactory((data) => new Promise((resolve, reject) => {
    require(['oj-dynamic/providers/JsonMetadataProvider'], (JsonMetadataProvider) => {
      resolve(new JsonMetadataProvider({ data }));
    }, reject);
  }));

  return {
    HOST_ID,
    mountElements,
    setElementEventSink,
    setElementModuleBase,
    mountElementsSoon,
    elementAtomsOf,
    foldoutElementAtomsOf,
    reduceContexts,
    planningActionOf,
    applyDomEffects,
    installRules,
    setPanelExpanded,
    panelExpanded,
    setColumnPrefsReader,
    readColumnPrefs,
    writeColumnPrefs,
    columnChooserOf,
    prefsFromChooser,
    moveChooserItem,
    listSavedViews,
    saveView,
    deleteView,
    defaultView,
    viewRouteOf,
    currentViewValues,
    viewsMenuOf,
    listingScope,
    installRowTones,
    installStickyHeader,
    installPlanningRange,
    installActionPanels,
    installMatrixGrids,
    installMaps,
    mapViewPlanOf,
    installCalendars,
    installKeys,
    installHover,
    installDragAndDrop,
    setDropSink,
    setKeysActionSink,
    setAccessKeysEnabled,
    startPolling,
    setPollingRunner,
    fetchNotifications,
    installTileReorder,
    installRichText,
    setTileReorderSink,
    bannerNotificationOf,
    notificationsOf,
    setUndoSink,
    setCalendarActionSink,
    setMatrixActionSink,
    setMapActionSink,
    actionPanelAtomOf,
    shortcutMatches,
    setPlanningRangeSink,
    rulesDebug,
    setRulesContext,
    setRuleActionSink,
    valueChangeActionOf,
    triggerDownload,
    autoTrail,
    parentCrumb,
    collectFields,
    collectActions,
    collectIslands,
    mediatorOf,
    buildOverlay,
    dynFormMetadataOf,
    actionsOf,
    summarizeHost,
    findByType,
    // pestañas del contenido: activa POR BARRA (barras anidadas) y refresco de cada oj-tab-bar
    tabStripOf,
    withActiveTab,
    tabBarIdsOf,
    // P1: la URL de una pestaña con clave (@Tab(key)) y los niveles de app (maestros)
    tabRoutePath,
    hostContentShown,
    withSubresources,
    loadSubresources,
    appLevelOf,
    rowRouteOf,
    listingOf,
    // paginación y orden del listing (pie de la tabla, cabecera → server)
    listingPagingOf,
    targetPageOf,
    listingSearchStateOf,
    listingSortOf,
    // selección de filas del listing → crud_selected_items de las acciones del host
    selectionOfKeySet,
    selectedRowsOf,
    withListingSelection,
    onLoadTriggers,
    // filtros del listado: descriptores ya resueltos a widget, y la config smartFilters de la
    // cabecera del buscador (sugerencias, aplicados y editores) con su vuelta a estado Mateu
    filterChipsOf,
    multiValuesOf,
    queryFiltersOf,
    navTargetOf,
    IDS_PARAM,
    idsChipLabelOf,
    splitListingQuery,
    listingQueryOf,
    listingUrlOf,
    smartFiltersOf,
    filterStateOfSmartFilters,
    fieldListOf,
    secondaryActionOf,
    formSectionsOf,
    // el paso de un wizard: contenido + campos (cada uno una vez) + el pie Back/Next
    wizardStepViewOf,
    isRichAtom,
    // editor de filas modal de una lista del formulario (@DetailFormCustomisation modal)
    listActionOf,
    listActionRequestOf,
    rowEditorOf,
    rowFieldsOf,
    validateRow,
    // validationRequired de las acciones del host (el next de un wizard): obligatorios vacíos
    validationOf,
    formErrorsOf,
    // a qué ServerSide va una acción del host (el que la declara) y su confirmación previa
    declaredActionOf,
    actionTransportOf,
    overlayTransportOf,
    confirmationOf,
    awaitConfirmation,
    answerConfirmation,
    selectPlaceholder,
    pendingLookupsOf,
    lookupRequestOf,
    // las opciones de los lookups de un formulario de página y de los filtros de un listado
    formLookupsOf,
    loadLookups,
    ROW_VALIDATING_VERBS,
    overlayOf,
    eventTriggersOf,
    dismissOverlay,
    // @Searchable: el selector en su diálogo, y los chips del campo
    searchPickerOf,
    pickerSearchStateOf,
    withContextState,
    withSearchableIds,
    shellNavOf,
    // la subcabecera MENU_ON_TOP: la sección en pantalla y el acento de marca del App
    activeSectionOf,
    localMenuOptionOf,
    isSentinelHome,
    sectionOf,
    sectionHomeOf,
    ojIconOf,
    ojIconOrGenericOf,
    longTaskWatcher,
    findAllByType,
    cardOf,
    welcomeOf,
    welcomeKeyOf,
    welcomeLookOf,
    generalOverviewOf,
    itemOverviewOf,
    itemOverviewPageOf,
    autoSaveOf,
    taskQueueOf,
    emptyStateOf,
    notFoundOf,
    interpolate,
    islandContentOf,
    mergeNestedContent,
    hostContentOf,
    wizardForwardOf,
    bannersOf,
    pageStyleOf,
    pageToolbarOf,
    primaryToolbarButton,
    backToolbarButton,
    entityHeaderOf,
    pageKpisOf,
    pageSubtitleOf,
    collectTexts,
    foldoutOf,
    wizardOf,
    callMateu,
    bootstrapShell,
    loadRoute,
    loadRouteInto,
    loadMenuRouteInto,
    composeInnerRoute,
    mediatorBaseOf,
    routeFlipOf,
    // menús federados: la shell los expande al arrancar, la navegación consulta a qué pod ir
    expandRemoteMenus,
    remoteRouteOf,
    registerRemoteRoute,
    baseOf,
    // widgets de cabecera del App: área de perfil (usermenu) + zona de acciones, remotos vivos
    headerWidgetsOf,
    // el FAB de "ask" del shell: su marca (Ask Oracle por defecto, o la del @App) y su nombre
    askFabOf,
    brandAskFab,
    startRemoteWidget,
    stopRemoteWidgets,
    mountHeaderHtml,
    mountHeaderHtmlSoon,
    redwoodHtmlOf,
    runMateuAction,
    runMateuActionSse,
    // resiliencia: la app las usa para pintar el estado de carga, la banda de sin-conexión
    // y el mensaje de error ya traducido
    classifyRequestFailure,
    isIdempotentAction,
    connectivity,
    pendingActions,
    setTransportHooks,
    authHeadersOf,
    // errores del cliente → log del servidor (POST <base>/mateu/v3/client-log)
    installClientErrorReporting,
    clientErrors,
    askForReauthentication,
    // la pantalla en curso: la navegación la empieza; lo que conteste para otra muere en silencio
    beginView,
    currentView,
    isViewStale,
    isStaleResponse,
    DEFAULT_TIMEOUT_MS,
    // static bundle: la shell carga el manifest al arrancar; loadRoute responde desde él sin backend
    loadBundleManifest,
    hasBundle,
    awaitBundle,
    // accesibilidad: lo que los componentes oj-* no traen (una SPA no cambia de página, así
    // que no hay nada que un lector de pantalla anuncie por su cuenta)
    installAnnouncer,
    announce,
    announceNavigation,
    focusIsInChat,
    focusContent,
    focusContentSoon,
    mountSkipLink,
    resetNavigationState,
    markPending,
    clearPending,
    pressedControl,
    trackPressedControls,
    markPressedControlBusy,
    clearPressedControlBusy,
    setLastRetry,
    hasLastRetry,
    takeLastRetry,
    // obligatorios marcados como un formulario Redwood + el guided process que manda el servidor
    showFieldErrors,
    clearFieldError,
    clearFieldErrorMarks,
    guardGuidedProcess,
    // chat de IA: el panel de conversación (sseUrl) usa estas para POSTear y consumir el stream
    effectiveChatUrl,
    buildChatBody,
    buildChatMenuContext,
    streamChat,
    stickChatToBottom,
    uploadChatFiles,
    // el panel mientras el asistente trabaja, los contadores de tokens y el dictado
    mergeTurnUsage,
    addUsage,
    latestUsage,
    chatStatusText,
    createChatProgress,
    speechRecognitionCtor,
    chatMarkdownToHtml,
    chatRouteOfLink,
    // un <a href="/ruta"> del contenido navega dentro de la shell (links.mjs)
    inAppRouteOfLink,
    transcriptOf,
    isChatMicShortcut,
    CHAT_MIC_ARIA_KEYSHORTCUTS,
  };
});
`

mkdirSync(dirname(out), { recursive: true })
// El cuerpo concatenado comparte UN scope: dos módulos que declaren el mismo nombre de nivel
// superior lo rompen en el navegador («Identifier … has already been declared») y la app entera no
// carga, aunque cada módulo por separado pase sus tests. Se comprueba aquí, antes de escribirlo.
try {
  new Function(body)
} catch (e) {
  console.error('mateu-bridge.js no compila: ' + e.message)
  process.exit(1)
}
writeFileSync(out, amd)
console.log(`Escrito ${out} (${amd.length} bytes)`)
