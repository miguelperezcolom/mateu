/* GENERADO por poc/make-amd.mjs — NO EDITAR A MANO.
 * Fuente única del core: poc/reduceContexts.mjs + transport.mjs
 * (tests de contrato: cd poc && node test.mjs). */
define(['require', 'ojs/ojarraydataprovider', 'ojs/ojconverter-number', 'ojs/ojarraytreedataprovider', 'ojs/ojflattenedtreedataproviderview', 'ojs/ojrowdatagridprovider', 'ojs/ojkeyset'], (require, ArrayDataProvider, NumberConverter, ArrayTreeDataProvider, FlattenedTreeDataProviderView, RowDataGridProvider, KeySet) => {
  'use strict';
  // The renderer's OWN words (its chrome: the shell, the chat panel, error bands, paging, empty
  // states…) in the interface's language. The app's texts come from the server; these are the few the
  // renderer draws by itself. Same source of truth as the web renderer (libs/mateu chromeTexts.ts):
  // the page's language (`<html lang>`, which copy.mjs sets from the browser and VB's
  // vbInitParams.locale reads), else the browser's, English by default.
  //
  // One catalogue for both halves of the app:
  //  - JS (the bridge, chains): chromeText(key, vars, lang).
  //  - VB page HTML: `[[ $application.translations.appBundle.<key> ]]` — make-nls.mjs writes the VB
  //    translation bundle (resources/strings/appBundle/nls/<lang>/appBundle-strings.json) from this
  //    catalogue, so VB's own locale resolution picks the language and there is nothing to rebind.
  //
  // A key missing in a language falls back to English, key by key — a partial language (fr, de…)
  // only needs the words it has.

  const CHROME_TEXTS = {
    en: {
      // ── generic ──
      close: 'Close',
      retry: 'Retry',
      loading: 'Loading',
      search: 'Search…',
      noData: 'No data',
      new: 'New',
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      apply: 'Apply',
      reset: 'Reset',
      view: 'View',
      edit: 'Edit',
      remove: 'Remove',
      name: 'Name',
      skipToContent: 'Skip to content',
      enterValue: 'Enter a value.',
      selectValue: 'Select a value',
      progressOf: '{done} of {total}',
      occupancy: 'Occupancy %',
      dropHere: 'Drop here',
      noEvents: 'No events',
      hideUnpopulated: 'Hide unpopulated',
      mapUnavailable: 'The map could not be loaded.',
      // ── shell ──
      menu: 'Menu',
      context: 'Context',
      workContext: 'Working context',
      sections: 'Sections',
      searchOrGo: 'Search or go to…',
      notifications: 'Notifications',
      markAllRead: 'Mark all read',
      allCaughtUp: "You're all caught up",
      notificationsUnread: 'Notifications, {n} unread',
      undo: 'Undo',
      askSearch: 'Search',
      goTo: 'Go to',
      home: 'Home',
      listing: 'Listing',
      quickView: 'Quick view',
      unsavedLeave: 'There are unsaved changes. Leave this screen?',
      unavailableMount: '{name} is not available right now. It will be retried.',
      // ── listing ──
      columns: 'Columns',
      views: 'Views',
      saveView: 'Save view',
      openWithView: 'Open with this view',
      saveCurrentView: 'Save current view…',
      clearFilters: 'Clear filters',
      pagingOf: 'of',
      pagingPage: 'Page',
      pagingFirst: 'First page',
      pagingPrev: 'Previous page',
      pagingNext: 'Next page',
      pagingLast: 'Last page',
      idsFew: 'Selection: ',
      idsMany: '{n} selected items',
      // ── confirmation dialog ──
      confirmTitle: 'One moment, please',
      confirmMessage: 'Are you sure?',
      confirmYes: 'Yes',
      confirmNo: 'No',
      // ── not found ──
      notFoundTitle: 'Not found',
      notFoundMessage: 'It may have been deleted, or the link is wrong.',
      goBack: 'Go back',
      // ── capture fields ──
      captureClear: 'Clear',
      captureAccept: 'Accept',
      captureSignAgain: 'Sign again',
      captureRemove: 'Remove',
      captureTake: 'Take photo',
      captureRetake: 'Retake',
      captureUpload: 'Upload',
      captureReplace: 'Replace',
      captureNoCamera: 'Camera unavailable — choose a file',
      captureEmpty: 'No file',
      captureStart: 'Open camera',
      captureSignHere: 'Sign here',
      // ── network / errors ──
      offlineBand: "Offline — changes you make now won't be saved.",
      errOffline: "You're offline. Your changes were not sent — check the network and try again.",
      errTimeout: 'The server is taking too long to answer. Your changes may not have been saved.',
      errServer: 'The server could not complete the request. Try again.',
      wireVersionMismatch: "This app's server speaks Mateu wire {server}; this renderer supports {supported}. Some screens may not display correctly — update the renderer or the server so they match.",
      errServerStatus: 'The server could not complete the request (error {status}). Try again.',
      errUnauthorized: 'Your session is no longer valid. Sign in again.',
      errForbidden: "You're not allowed to do this.",
      errNotFound: 'This is no longer available. It may have been moved or deleted.',
      errClient: 'The request was rejected.',
      errClientStatus: 'The request was rejected (error {status}).',
      errUnknown: 'Something went wrong. Try again.',
      // ── AI chat panel ──
      chatTitle: 'Assistant',
      chatOpen: 'Chat',
      chatPanel: 'Assistant chat',
      chatClose: 'Close the chat',
      chatEmpty: 'Ask whatever you need about this screen or the application.',
      chatPlaceholder: 'Write a message…',
      chatInputLabel: 'Message for the assistant',
      chatSend: 'Send',
      chatDictate: 'Dictate (Ctrl+Shift+M)',
      chatStopDictation: 'Stop dictation (Ctrl+Shift+M)',
      chatTokens: 'Tokens',
      chatTokensIn: 'input',
      chatTokensOut: 'output',
      chatTokensTotal: 'total',
      chatThinking: 'Thinking…',
      chatThinkingFor: 'Thinking… {s} s',
      chatAnswering: 'Answering…',
      chatCalling: 'Calling {name}…',
      chatAgentError: 'Unknown agent error',
      chatNoReader: 'Could not read the answer stream.',
      chatServerError: 'The server answered {status}: {text}',
      chatUploadFailed: 'Upload failed: {status}',
      chatAttach: 'Attach files',
      chatRemoveAttachment: 'Remove {name}',
      chatTool: 'tool',
      chatToolsUsed: 'Tools used',
      chatNoAnswer: 'No answer from the agent. The server closed the connection without sending anything — check that the LLM has its API key configured and is available.',
      chatEmptyAnswer: 'The agent returned no answer. Check that the LLM is configured correctly (API key).',
      chatError: 'Error: {message}',
      chatUploadError: 'Could not upload the files: {message}',
      chatExpand: 'Widen the assistant',
      chatRestore: 'Restore the width',
      selectRowsFirst: 'You first need to select some rows',
      searchResults: 'Search results',
      themeToggle: 'Switch light / dark theme',
      // ── display components (core/display.mjs) ──
      recommended: 'Recommended',
      choose: 'Choose',
      learnMore: 'Learn more',
      less: 'Less',
      more: 'More',
      open: 'Open',
      ok: 'OK',
      message: 'Message',
      messageSend: 'Send',
      moreActions: 'More actions',
      moreInformation: 'More information',
      previousSlide: 'Previous slide',
      nextSlide: 'Next slide',
      slideN: 'Slide {n}',
      slides: 'Slides',
      pages: 'Pages',
      breadcrumb: 'Breadcrumb',
      directory: 'Directory',
      heatmap: 'Heatmap',
      processDiagram: 'Process diagram: {names}',
      emptyProcess: 'Empty process',
      cookieConsent: 'Cookie consent',
      cookieMessage: 'This website uses cookies to ensure you get the best experience on our website.',
      cookieDismiss: 'Got it',
      afterStep: 'After {name}',
      whenCondition: ' when {condition}',
      parallel: 'parallel',
      stepAction: 'Action', stepJoin: 'Join', stepFork: 'Fork', stepEnd: 'End', stepUserTask: 'User task', stepProcess: 'Process',
      workflowInvalid: 'Workflow: the definition is not valid JSON',
      unsupportedComponent: 'Unsupported component "{type}"{id} — the Redwood renderer has no view for it',
      customFailed: 'Custom component failed: {message}',
      askSomething: 'Ask something…',
      assistantFailed: 'The assistant could not answer: {message}',
      formatting: 'Formatting',
      rteBold: 'Bold', rteItalic: 'Italic', rteUnderline: 'Underline', rteBullets: 'Bulleted list', rteNumbers: 'Numbered list',
      rteLink: 'Link', rteClear: 'Clear formatting', rteLinkPrompt: 'Link URL',
      colourPicker: '{label} — picker',
      loadingContent: 'Loading',
    },
    es: {
      close: 'Cerrar',
      retry: 'Reintentar',
      loading: 'Cargando',
      search: 'Buscar…',
      noData: 'Sin datos',
      new: 'Nuevo',
      confirm: 'Confirmar',
      cancel: 'Cancelar',
      save: 'Guardar',
      apply: 'Aplicar',
      reset: 'Restablecer',
      view: 'Ver',
      edit: 'Editar',
      remove: 'Quitar',
      name: 'Nombre',
      skipToContent: 'Saltar al contenido',
      enterValue: 'Introduce un valor.',
      selectValue: 'Seleccione un valor',
      progressOf: '{done} de {total}',
      occupancy: 'Ocupación %',
      dropHere: 'Suelta aquí',
      noEvents: 'Sin eventos',
      hideUnpopulated: 'Ocultar vacías',
      mapUnavailable: 'No se ha podido cargar el mapa.',
      menu: 'Menú',
      context: 'Contexto',
      workContext: 'Contexto de trabajo',
      sections: 'Secciones',
      searchOrGo: 'Buscar o ir a…',
      notifications: 'Notificaciones',
      markAllRead: 'Marcar todas como leídas',
      allCaughtUp: 'Estás al día',
      notificationsUnread: 'Notificaciones, {n} sin leer',
      undo: 'Deshacer',
      askSearch: 'Buscar',
      goTo: 'Ir a',
      home: 'Inicio',
      listing: 'Listado',
      quickView: 'Vista rápida',
      unsavedLeave: 'Hay cambios sin guardar. ¿Salir de esta pantalla?',
      unavailableMount: '{name} no está disponible ahora. Se volverá a intentar.',
      columns: 'Columnas',
      views: 'Vistas',
      saveView: 'Guardar vista',
      openWithView: 'Abrir con esta vista',
      saveCurrentView: 'Guardar la vista actual…',
      clearFilters: 'Quitar filtros',
      pagingOf: 'de',
      pagingPage: 'Página',
      pagingFirst: 'Primera página',
      pagingPrev: 'Página anterior',
      pagingNext: 'Página siguiente',
      pagingLast: 'Última página',
      idsFew: 'Selección: ',
      idsMany: '{n} elementos seleccionados',
      confirmTitle: 'Un momento, por favor',
      confirmMessage: '¿Estás seguro?',
      confirmYes: 'Sí',
      confirmNo: 'No',
      notFoundTitle: 'No encontrado',
      notFoundMessage: 'Puede que se haya borrado o que el enlace no sea correcto.',
      goBack: 'Volver',
      captureClear: 'Borrar',
      captureAccept: 'Aceptar',
      captureSignAgain: 'Volver a firmar',
      captureRemove: 'Quitar',
      captureTake: 'Hacer foto',
      captureRetake: 'Repetir',
      captureUpload: 'Subir',
      captureReplace: 'Sustituir',
      captureNoCamera: 'Cámara no disponible — elige un fichero',
      captureEmpty: 'Sin fichero',
      captureStart: 'Abrir cámara',
      captureSignHere: 'Firme aquí',
      offlineBand: 'Sin conexión — los cambios que hagas ahora no se guardarán.',
      errOffline: 'Sin conexión. Tus cambios no se han enviado — revisa la red e inténtalo de nuevo.',
      errTimeout: 'El servidor tarda demasiado en responder. Puede que tus cambios no se hayan guardado.',
      errServer: 'El servidor no ha podido completar la petición. Inténtalo de nuevo.',
      wireVersionMismatch: 'El servidor de esta aplicación habla el protocolo Mateu {server}; este renderizador admite {supported}. Puede que algunas pantallas no se vean bien: actualiza el renderizador o el servidor para que coincidan.',
      errServerStatus: 'El servidor no ha podido completar la petición (error {status}). Inténtalo de nuevo.',
      errUnauthorized: 'Tu sesión ya no es válida. Vuelve a iniciar sesión.',
      errForbidden: 'No tienes permiso para hacer esto.',
      errNotFound: 'Esto ya no está disponible. Puede que se haya movido o borrado.',
      errClient: 'La petición ha sido rechazada.',
      errClientStatus: 'La petición ha sido rechazada (error {status}).',
      errUnknown: 'Algo ha ido mal. Inténtalo de nuevo.',
      chatTitle: 'Asistente',
      chatOpen: 'Chat',
      chatPanel: 'Chat del asistente',
      chatClose: 'Cerrar el chat',
      chatEmpty: 'Pregunta lo que necesites sobre esta pantalla o la aplicación.',
      chatPlaceholder: 'Escribe un mensaje…',
      chatInputLabel: 'Mensaje para el asistente',
      chatSend: 'Enviar',
      chatDictate: 'Dictar (Ctrl+Shift+M)',
      chatStopDictation: 'Detener dictado (Ctrl+Shift+M)',
      chatTokens: 'Tokens',
      chatTokensIn: 'entrada',
      chatTokensOut: 'salida',
      chatTokensTotal: 'total',
      chatThinking: 'Pensando…',
      chatThinkingFor: 'Pensando… {s} s',
      chatAnswering: 'Respondiendo…',
      chatCalling: 'Llamando a {name}…',
      chatAgentError: 'Error desconocido del agente',
      chatNoReader: 'No se pudo leer la respuesta del agente.',
      chatServerError: 'El servidor respondió {status}: {text}',
      chatUploadFailed: 'Falló la subida: {status}',
      chatAttach: 'Adjuntar ficheros',
      chatRemoveAttachment: 'Quitar {name}',
      chatTool: 'herramienta',
      chatToolsUsed: 'Herramientas usadas',
      chatNoAnswer: 'No se recibió respuesta del agente. El servidor cerró la conexión sin enviar datos — comprueba que el LLM tiene la API key configurada y está disponible.',
      chatEmptyAnswer: 'El agente no devolvió ninguna respuesta. Comprueba que el LLM está configurado correctamente (API key).',
      chatError: 'Error: {message}',
      chatUploadError: 'No se pudieron subir los ficheros: {message}',
      chatExpand: 'Ampliar el asistente',
      chatRestore: 'Ancho normal',
      selectRowsFirst: 'Primero tienes que seleccionar alguna fila',
      searchResults: 'Resultados',
      themeToggle: 'Cambiar tema claro / oscuro',
      // ── componentes display (core/display.mjs) ──
      recommended: 'Recomendado',
      choose: 'Elegir',
      learnMore: 'Más información',
      less: 'Menos',
      more: 'Más',
      open: 'Abrir',
      ok: 'Aceptar',
      message: 'Mensaje',
      messageSend: 'Enviar',
      moreActions: 'Más acciones',
      moreInformation: 'Más información',
      previousSlide: 'Diapositiva anterior',
      nextSlide: 'Diapositiva siguiente',
      slideN: 'Diapositiva {n}',
      slides: 'Diapositivas',
      pages: 'Páginas',
      breadcrumb: 'Ruta de navegación',
      directory: 'Directorio',
      heatmap: 'Mapa de calor',
      processDiagram: 'Diagrama del proceso: {names}',
      emptyProcess: 'Proceso vacío',
      cookieConsent: 'Consentimiento de cookies',
      cookieMessage: 'Este sitio usa cookies para ofrecerte la mejor experiencia.',
      cookieDismiss: 'Entendido',
      afterStep: 'Después de {name}',
      whenCondition: ' cuando {condition}',
      parallel: 'en paralelo',
      stepAction: 'Acción', stepJoin: 'Unión', stepFork: 'Bifurcación', stepEnd: 'Fin', stepUserTask: 'Tarea de usuario', stepProcess: 'Proceso',
      workflowInvalid: 'Workflow: la definición no es un JSON válido',
      unsupportedComponent: 'Componente no soportado "{type}"{id} — el renderer Redwood no tiene vista para él',
      customFailed: 'El componente propio ha fallado: {message}',
      askSomething: 'Pregunta lo que quieras…',
      assistantFailed: 'El asistente no ha podido responder: {message}',
      formatting: 'Formato',
      rteBold: 'Negrita', rteItalic: 'Cursiva', rteUnderline: 'Subrayado', rteBullets: 'Lista con viñetas', rteNumbers: 'Lista numerada',
      rteLink: 'Enlace', rteClear: 'Quitar formato', rteLinkPrompt: 'URL del enlace',
      colourPicker: '{label} — selector',
      loadingContent: 'Cargando',
    },
    // partial languages: only the words they have (the rest falls back to English)
    ca: { selectValue: 'Seleccioneu un valor' },
    fr: { selectValue: 'Sélectionnez une valeur' },
    de: { selectValue: 'Wert auswählen' },
    it: { selectValue: 'Selezionare un valore' },
    pt: { selectValue: 'Selecione um valor' },
    nl: { selectValue: 'Selecteer een waarde' },
  }

  let explicitLanguage = ''

  /** Pin the chrome language (e.g. from the app); '' goes back to the page's/browser's. */
  function setChromeLanguage(lang) { explicitLanguage = lang ? String(lang) : '' }

  /** The base language code of the chrome ('en', 'es'…): explicit > <html lang> > browser > 'en'. */
  function chromeLanguage(lang) {
    const raw = lang || explicitLanguage
      || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang)
      || (typeof navigator !== 'undefined' && navigator.language) || 'en'
    return String(raw).toLowerCase().split(/[-_]/)[0] || 'en'
  }

  /** A chrome text in `lang` (or the interface's language), `{name}` placeholders filled from vars. */
  function chromeText(key, vars, lang) {
    const language = chromeLanguage(lang)
    const dict = CHROME_TEXTS[language] || {}
    let text = Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : CHROME_TEXTS.en[key]
    if (text == null) return key
    if (vars) text = text.replace(/\{(\w+)\}/g, (m, k) => (vars[k] == null ? m : String(vars[k])))
    return text
  }

  /** Every chrome text in `lang`, English filling the gaps (what the VB translation bundle carries). */
  function chromeTextsOf(lang) {
    return { ...CHROME_TEXTS.en, ...(CHROME_TEXTS[chromeLanguage(lang)] || {}) }
  }



  // PERSONALIZACIÓN DE LISTADOS en el navegador: el SELECTOR DE COLUMNAS (cuáles se ven y en qué
  // orden) y las VISTAS GUARDADAS (una combinación con nombre de búsqueda + filtros, con una por
  // defecto). Mismo formato y mismas claves de localStorage que el renderer web (libs/mateu
  // columnPrefsStore.ts / savedViewsStore.ts), así que un usuario que cambie de renderer conserva
  // lo suyo. El ámbito es la ruta del listado. Sin cambios de wire: el servidor sigue mandando todas
  // las columnas y aquí se filtran antes de pintar.

  const COLUMNS_KEY = 'mateu-column-prefs'
  const VIEWS_KEY = 'mateu-saved-views'
  const TILES_KEY = 'mateu-tile-order'

  const storageOf = (storage) => storage || (typeof localStorage !== 'undefined' ? localStorage : null)
  const readAll = (key, storage) => {
    try {
      const s = storageOf(storage)
      return s ? JSON.parse(s.getItem(key) || '{}') || {} : {}
    } catch (e) { return {} }
  }
  const writeAll = (key, value, storage) => {
    try { const s = storageOf(storage); if (s) s.setItem(key, JSON.stringify(value)) } catch (e) { /* lleno o bloqueado */ }
  }

  // columnas que no se ocultan ni se reordenan: las técnicas (selección, acciones, líneas)
  const PROTECTED = (c) => !c || !c.field || c.field === '_select' || c.template === 'cellRowActions'
    || c.field === '__rowLines' || c.id === '__rowLines'

  /** Las preferencias de columnas de un ámbito: { hidden: [], order: [] } o null. */
  function readColumnPrefs(scope, storage) {
    const p = readAll(COLUMNS_KEY, storage)[scope]
    if (!p || typeof p !== 'object') return null
    return { hidden: Array.isArray(p.hidden) ? p.hidden : [], order: Array.isArray(p.order) ? p.order : [] }
  }

  function writeColumnPrefs(scope, prefs, storage) {
    const all = readAll(COLUMNS_KEY, storage)
    if (!prefs || (!(prefs.hidden || []).length && !(prefs.order || []).length)) delete all[scope]
    else all[scope] = { hidden: prefs.hidden || [], order: prefs.order || [] }
    writeAll(COLUMNS_KEY, all, storage)
  }

  /** Las columnas del oj-table con las preferencias aplicadas: sin las ocultas, en el orden pedido
   *  (las no mencionadas, detrás, en su orden). Las técnicas no se tocan. */
  function applyColumnPrefs(columns, prefs) {
    if (!prefs) return columns
    const hidden = new Set(prefs.hidden || [])
    const order = prefs.order || []
    const rank = (c) => { const i = order.indexOf(c.field || c.id); return i < 0 ? order.length : i }
    const movable = columns.filter((c) => !PROTECTED(c) && !hidden.has(c.field || c.id))
    const sorted = movable.map((c, i) => ({ c, i })).sort((a, b) => (rank(a.c) - rank(b.c)) || (a.i - b.i)).map((x) => x.c)
    // las técnicas conservan su sitio relativo: delante las de selección, detrás acciones/líneas
    const lead = columns.filter((c) => PROTECTED(c) && c.field === '_select')
    const tail = columns.filter((c) => PROTECTED(c) && c.field !== '_select')
    return lead.concat(sorted, tail)
  }

  /** El modelo del diálogo de columnas: [{ id, label, visible }] en el orden actual. */
  function columnChooserOf(columns, prefs) {
    const hidden = new Set((prefs && prefs.hidden) || [])
    const order = (prefs && prefs.order) || []
    const items = columns.filter((c) => !PROTECTED(c)).map((c, i) => ({ id: c.field || c.id, label: c.headerText || c.field, visible: !hidden.has(c.field || c.id), i }))
    const rank = (x) => { const k = order.indexOf(x.id); return k < 0 ? order.length : k }
    return items.sort((a, b) => (rank(a) - rank(b)) || (a.i - b.i)).map(({ id, label, visible }) => ({ id, label, visible }))
  }

  /** Del modelo del diálogo a preferencias. */
  function prefsFromChooser(items) {
    return { hidden: items.filter((x) => !x.visible).map((x) => x.id), order: items.map((x) => x.id) }
  }

  /** Mover un elemento del diálogo arriba (-1) o abajo (+1). */
  function moveChooserItem(items, id, delta) {
    const i = items.findIndex((x) => x.id === id)
    const j = i + delta
    if (i < 0 || j < 0 || j >= items.length) return items
    const out = [...items]
    ;[out[i], out[j]] = [out[j], out[i]]
    return out
  }

  // ── vistas guardadas ──────────────────────────────────────────────────────────────────────────

  function listSavedViews(scope, storage) {
    const v = readAll(VIEWS_KEY, storage)[scope]
    return Array.isArray(v) ? v : []
  }

  function saveView(scope, view, storage) {
    const all = readAll(VIEWS_KEY, storage)
    const views = (all[scope] || []).filter((x) => x.name !== view.name)
      .map((x) => (view.isDefault ? { ...x, isDefault: false } : x))
    views.push({ name: view.name, values: view.values || {}, isDefault: !!view.isDefault })
    all[scope] = views
    writeAll(VIEWS_KEY, all, storage)
  }

  function deleteView(scope, name, storage) {
    const all = readAll(VIEWS_KEY, storage)
    const views = (all[scope] || []).filter((x) => x.name !== name)
    if (views.length) all[scope] = views
    else delete all[scope]
    writeAll(VIEWS_KEY, all, storage)
  }

  function defaultView(scope, storage) {
    return listSavedViews(scope, storage).find((v) => v.isDefault) || null
  }

  /** La ruta que aplica una vista: el listado con sus filtros en la query (el camino de los
   *  filtros por URL, que ya pone los chips y relanza la búsqueda). */
  function viewRouteOf(route, values) {
    const path = String(route || '').split('?')[0]
    const q = Object.keys(values || {})
      .filter((k) => values[k] != null && values[k] !== '' && !(Array.isArray(values[k]) && !values[k].length))
      .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(Array.isArray(values[k]) ? values[k].join(',') : String(values[k])))
    return q.length ? path + '?' + q.join('&') : path
  }

  /** Lo que se guarda de la búsqueda actual: el texto libre y los filtros aplicados. */
  function currentViewValues(filterValues, searchText) {
    const values = { ...(filterValues || {}) }
    if (searchText) values.searchText = searchText
    return values
  }

  /** Las opciones del menú de vistas (oj-menu): las guardadas (★ la de por defecto) + acciones. */
  function viewsMenuOf(scope, storage) {
    const views = listSavedViews(scope, storage).map((v) => ({ value: 'view:' + v.name, label: (v.isDefault ? '★ ' : '') + v.name }))
    return views.concat([{ value: 'save', label: chromeText('saveCurrentView') }])
      .concat(views.length ? [{ value: 'clear', label: chromeText('clearFilters') }] : [])
  }

  /** El ámbito de las preferencias: la ruta del listado en pantalla, sin query (en modo hash, lo
   *  que va detrás de #). */
  function listingScope(loc = typeof window !== 'undefined' ? window.location : null) {
    if (!loc) return ''
    const raw = loc.hash && loc.hash.startsWith('#/') ? loc.hash.slice(1) : loc.pathname
    return String(raw || '').split('?')[0]
  }

  // ── ORDEN DE LOS TILES de una rejilla reordenable (ResponsiveGrid.reorderable: el dashboard de
  // OPERA, cuyos tiles se arrastran). Misma clave y forma que el web (tileOrderStore.ts): {ámbito:
  // [claves]}, ámbito = ruta + '#' + id de la rejilla, clave = id del hijo (o '#índice').

  const tileKeyOf = (child, index) => (child && child.id ? String(child.id) : '#' + index)

  function readTileOrder(scope, storage) {
    const saved = readAll(TILES_KEY, storage)[scope]
    return Array.isArray(saved) ? saved.filter((k) => typeof k === 'string') : null
  }

  function writeTileOrder(scope, keys, storage) {
    const all = readAll(TILES_KEY, storage)
    all[scope] = keys
    writeAll(TILES_KEY, all, storage)
  }

  /** Las posiciones en las que pintar: primero las guardadas en su orden, luego las nunca colocadas. */
  function orderedTileIndices(keys, saved) {
    if (!saved || !saved.length) return keys.map((_, i) => i)
    const placed = saved.map((k) => keys.indexOf(k)).filter((i) => i >= 0)
    const seen = new Set(placed)
    return [...placed, ...keys.map((_, i) => i).filter((i) => !seen.has(i))]
  }

  /** El orden tras soltar `moved` donde está `target`. */
  function moveTile(order, moved, target) {
    const from = order.indexOf(moved)
    const to = order.indexOf(target)
    if (from < 0 || to < 0 || from === to) return order
    const next = order.filter((k) => k !== moved)
    next.splice(to, 0, moved)
    return next
  }

  /** El orden tras mover `moved` un puesto atrás (-1) o adelante (+1): arrastrar con el teclado. */
  function moveTileBy(order, moved, delta) {
    const from = order.indexOf(moved)
    const to = from + delta
    if (from < 0 || to < 0 || to >= order.length) return order
    return moveTile(order, moved, order[to])
  }

  const tileScopeOf = (gridId, loc = typeof window !== 'undefined' ? window.location : null) =>
    ((loc && loc.pathname) || '') + '#' + (gridId || 'grid')



  // El árbol de navegación: las reglas de libs/mateu/.../navTree.ts que necesita este renderer,
  // PORTADAS (no compartidas): el bridge se construye concatenando estos .mjs (make-amd.mjs) y no
  // puede importar TypeScript. Mismas reglas, mismos casos en test.mjs; si cambia una, cambian las dos.
  //
  // Una sección remota llega como marcador (`remote: true`, sin hijos) hasta que su pod contesta. Lo
  // que la shell sabe de ella antes —su rótulo y el prefijo bajo el que viven sus pantallas— basta
  // para la sección activa y la primera miga.

  const navRoute = (r) => {
    let s = String(r == null ? '' : r).trim()
    const q = s.search(/[?#]/)
    if (q >= 0) s = s.slice(0, q)
    if (s && s[0] !== '/') s = '/' + s
    while (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
    return s
  }

  /** `path` es `route` o cuelga de ella. La raíz no casa por prefijo. */
  function routeCovers(route, path) {
    return !!route && route !== '/' && (path === route || path.indexOf(route + '/') === 0)
  }

  /** Una sección remota que aún no ha contestado (o que no contestó). */
  function isMount(option) {
    return !!(option && option.remote)
  }

  /** El prefijo de una sección remota: el que manda el servidor (`routePrefix`) o, si no, su path (o su ruta). */
  function mountPrefix(option) {
    return isMount(option) ? navRoute(option.routePrefix || option.path || option.route) : ''
  }

  /** Por qué una sección está deshabilitada, en el idioma de la UI. */
  function unavailableHint(label, lang) {
    const language = lang || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang)
      || (typeof navigator !== 'undefined' && navigator.language) || ''
    // Strip markup until nothing is left, then any stray angle bracket (as navTree.ts does): one pass of
    // the tag pattern can leave a tag behind (CodeQL js/incomplete-multi-character-sanitization).
    let name = String(label == null ? '' : label)
    for (let before = ''; before !== name;) {
      before = name
      name = name.replace(/<[^<>]*>/g, '')
    }
    name = name.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim()
    return chromeText('unavailableMount', { name }, language || 'en')
  }

  /**
   * Lo que contestó el pod, con el rótulo de la shell si lo DECLARÓ (`shellLabel`) y el pod contesta
   * con UNA entrada —lo normal: un grupo con el nombre del servicio—: manda la palabra de la shell, y
   * la barra no cambia bajo el lector. Varias entradas se pegan tal cual: no hay un nodo que nombrar.
   */
  function labelledByShell(entries, option) {
    if (option.shellLabel && option.label && entries.length === 1) {
      return [Object.assign({}, entries[0], { label: option.label, icon: option.icon || entries[0].icon })]
    }
    return entries
  }

  /**
   * HAMBURGER_SECTIONS: lo que contesta un pod montado en el primer nivel es UNA sección. Un grupo
   * ya lo es; varias entradas, o una sola pantalla, pasan a ser las entradas de una sección con el
   * rótulo (y el path) que la shell dio al montaje —pegarlas haría de cada pantalla del pod una
   * sección, y la subcabecera no tendría nada que enseñar—. Port de mergeRemoteMenus de navTree.ts.
   */
  function asSection(entries, option) {
    const list = entries || []
    const oneGroup = list.length === 1 && ((list[0].submenus || list[0].submenu || []).length > 0)
    if (oneGroup || !list.length) return list
    return [{ label: option.label, icon: option.icon, path: option.path, route: '', visible: option.visible, submenus: list }]
  }

  /** Las entradas de una sección oculta: no se pintan a ninguna profundidad, pero siguen en el árbol. */
  function markHidden(entries) {
    return entries.map((option) => {
      const children = option.submenus || option.submenu || []
      return Object.assign({}, option, { visible: false }, children.length ? { submenus: markHidden(children) } : {})
    })
  }

  /** La sección de un pod que no contestó: sigue ahí, deshabilitada y diciendo por qué. */
  function unavailableMount(option, lang) {
    return Object.assign({}, option, { unavailable: true, disabled: true, description: unavailableHint(option.label, lang) })
  }

  /**
   * Las rutas de una sección de primer nivel: las de sus entradas a cualquier profundidad (ocultas
   * incluidas: una pantalla bajo una sigue siendo de esa sección), el prefijo de una sección remota
   * que aún no contestó y los ids con que navega el menú ya proyectado (`node`, de shellNavOf).
   */
  function sectionRoutes(option, node) {
    const out = new Set()
    const add = (r) => {
      const s = navRoute(r)
      if (s && s !== '/') out.add(s)
    }
    const walkOption = (o) => {
      if (!o || o.separator) return
      if (isMount(o)) add(mountPrefix(o))
      add(o.route || o.path)
      for (const child of o.submenus || o.submenu || []) walkOption(child)
    }
    const walkNode = (n) => {
      if (!n) return
      add(n.id)
      for (const child of n.children || []) walkNode(child)
    }
    walkOption(option)
    walkNode(node)
    return Array.from(out)
  }

  /**
   * La sección de primer nivel que está en pantalla (la misma regla que activeSection.ts del
   * renderer web: la entrada que es la ruta, o el grupo que la contiene a cualquier profundidad):
   * su id, o null si la ruta no cuelga de ninguna — la home, p. ej. Gana la ruta más larga: una
   * sección no se queda con las pantallas de otra porque su prefijo sea más corto.
   */
  function nodeRoutes(node, out = []) {
    if (!node) return out
    const route = navRoute(node.id)
    if (route && route !== '/') out.push(route)
    for (const child of node.children || []) nodeRoutes(child, out)
    return out
  }

  function activeSectionOf(sections, current) {
    const path = navRoute(current)
    if (!path || path === '/') return null
    let best = null
    let length = 0
    for (const section of sections || []) {
      // una sección de primer nivel trae sus rutas (sectionRoutes); un ítem del segundo nivel
      // (HAMBURGER_SECTIONS) no: valen los ids de lo que cuelga de él
      for (const route of section.routes || nodeRoutes(section)) {
        if (routeCovers(route, path) && route.length > length) {
          best = section.id
          length = route.length
        }
      }
    }
    return best
  }


  /*
   * HAMBURGER_SECTIONS (al estilo de Opera Cloud): el primer nivel del menú son las SECCIONES, en la
   * hamburguesa; la subcabecera lleva el segundo nivel de la sección en pantalla (un grupo, en
   * desplegable: el tercer nivel). Port de activeSection/sectionHome de navTree.ts, sobre los nodos ya
   * proyectados por shellNavOf (id, children, disabled; lo oculto ya no está).
   */

  /**
   * Adónde lleva elegir una sección: la propia sección si es una pantalla, si no su primera entrada
   * que se pueda abrir, en profundidad —la home de la sección, como en Opera—. null si no hay nada
   * que abrir (una sección remota que no contestó).
   */
  function sectionHomeOf(node) {
    if (!node || node.disabled) return null
    const children = node.children || []
    if (!children.length) return node.id || null
    for (const child of children) {
      const home = sectionHomeOf(child)
      if (home) return home
    }
    return null
  }

  /** El nodo de la sección en pantalla (activeSectionOf), o null —la home, p. ej.—. */
  function sectionOf(sections, current) {
    const id = activeSectionOf(sections, current)
    return id == null ? null : ((sections || []).find((section) => section.id === id) || null)
  }

  /** Las rutas centinela del servidor que significan «no hay home declarada»: la shell abre entonces
   *  la primera pantalla del menú (en profundidad), como la home de una sección. */
  function isSentinelHome(route) {
    const r = String(route || '')
    return !r || /(^|\/)_no_home_route$/.test(r) || /(^|\/)_page$/.test(r)
  }

  /**
   * La opción LOCAL del menú (no remota) que cubre una ruta —la de prefijo más largo, por tramos—,
   * o null. Una ruta de menú (`/inventory/floorPlan`) es del APP: el servidor sólo la resuelve si la
   * petición lleva el serverSideType del app que declara ese menú; sin él contesta «Not found.»
   * (en demo-vb no se notaba porque cada @Menu se llamaba como la ruta @UI de su clase).
   */
  function localMenuOptionOf(menu, route) {
    const path = String(route || '').split('?')[0]
    if (!path) return null
    let best = null
    const visit = (options) => {
      for (const o of options || []) {
        if (!o || o.remote || o.baseUrl) continue
        const r = o.route || o.path
        if (r && routeCovers(r, path) && (!best || r.length > (best.route || best.path).length)) best = o
        visit(o.submenus || o.submenu)
      }
    }
    visit(menu)
    return best
  }


  // CALENDARIO (Calendar → átomo isCalendar). JET no trae un calendario: la rejilla se dibuja con los
  // tokens de Redwood; el selector de vista es el oj-buttonset-one de JET y los eventos, enlaces.
  // TODAS las vistas (mes, semana, día, lista) van precomputadas en el átomo — el CSP de VB no
  // calcula fechas — y cambiar de vista es estado del DOM (installCalendars): sin re-proyectar ni
  // preguntar al servidor. Mismas reglas que libs/mateu calendarModel.ts (fechas ISO en UTC, para
  // que ningún huso mueva un día; el evento de varios días en todos sus días; por hora de inicio).

  const toUtc = (iso) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d) }
  const fromUtc = (ms) => new Date(ms).toISOString().slice(0, 10)
  const calAddDays = (iso, n) => fromUtc(toUtc(iso) + n * 86400000)
  /** 0 = lunes … 6 = domingo */
  const calWeekday = (iso) => (new Date(toUtc(iso)).getUTCDay() + 6) % 7
  const firstOfMonth = (iso) => iso.slice(0, 8) + '01'
  const lastOfMonth = (iso) => { const [y, m] = iso.split('-').map(Number); return fromUtc(Date.UTC(y, m, 0)) }
  const datesBetween = (from, to) => { const out = []; for (let d = from; d <= to; d = calAddDays(d, 1)) out.push(d); return out }

  function calPeriod(view, anchor) {
    if (view === 'day') return { from: anchor, to: anchor }
    if (view === 'week') { const monday = calAddDays(anchor, -calWeekday(anchor)); return { from: monday, to: calAddDays(monday, 6) } }
    return { from: firstOfMonth(anchor), to: lastOfMonth(anchor) }
  }

  const calEventsOn = (events, date) => (events || [])
    .filter((e) => e.date && e.date <= date && (e.endDate || e.date) >= date)
    .map((e, i) => ({ e, i }))
    .sort((a, b) => (a.e.startTime || '').localeCompare(b.e.startTime || '') || a.i - b.i)
    .map(({ e }) => e)

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const DOWS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const DOWS_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const TONES = { info: 1, success: 1, warning: 1, danger: 1, neutral: 1 }
  const dayNum = (iso) => Number(iso.slice(8))
  const monthName = (iso) => MONTHS[Number(iso.slice(5, 7)) - 1]
  const longDate = (iso) => DOWS_LONG[calWeekday(iso)] + ', ' + monthName(iso) + ' ' + dayNum(iso)

  /** El átomo del calendario, con las cuatro vistas precomputadas. */
  function calendarAtomOf(m, id, today = new Date().toISOString().slice(0, 10)) {
    const anchor = m.month || today
    const events = m.events || []
    const days = {}
    for (const d of m.days || []) if (d && d.date) days[d.date] = d
    const dayAction = m.dayActionId || ''
    const chipOf = (e, withTime) => {
      const time = withTime && e.startTime ? e.startTime + (e.endTime ? '–' + e.endTime : '') : ''
      return {
        id: e.id || '', title: e.title || '', date: e.date || '', time,
        text: (time ? time + ' ' : '') + (e.title || ''),
        actionId: e.actionId || '',
        clickable: e.actionId ? 'true' : 'false',
        // un OBJETO: el :style de JET no aplica una cadena CSS
        style: e.color ? { borderLeftColor: e.color } : {},
      }
    }
    const cellOf = (date, withTime) => {
      const info = days[date] || {}
      const evs = calEventsOn(events, date)
      return {
        date, num: String(dayNum(date)), blank: false,
        label: info.label || '',
        cls: 'mateu-cal-cell' + (info.tone && TONES[info.tone] ? ' mateu-cal-' + info.tone : '')
          + (date === today ? ' mateu-cal-today' : '') + (dayAction ? ' mateu-cal-clickable' : ''),
        ariaLabel: longDate(date) + (info.label ? ', ' + info.label : '') + (evs.length ? ', ' + evs.length + (evs.length > 1 ? ' events' : ' event') : ''),
        events: evs.map((e) => chipOf(e, withTime)),
      }
    }
    // mes: celdas de lunes a domingo, en blanco fuera del mes
    const month = calPeriod('month', anchor)
    const monthCells = Array.from({ length: calWeekday(month.from) }, () => ({ blank: true, cls: 'mateu-cal-cell mateu-cal-blank', events: [], label: '', num: '', date: '' }))
    monthCells.push(...datesBetween(month.from, month.to).map((d) => cellOf(d, false)))
    while (monthCells.length % 7) monthCells.push({ blank: true, cls: 'mateu-cal-cell mateu-cal-blank', events: [], label: '', num: '', date: '' })
    const week = calPeriod('week', anchor)
    const weekDates = datesBetween(week.from, week.to)
    const agenda = datesBetween(month.from, month.to)
      .map((date) => ({ date, cell: cellOf(date, true) }))
      .filter((x) => x.cell.events.length)
      .map(({ date, cell }) => ({ date, dateLabel: longDate(date), label: cell.label, cls: cell.cls.replace('mateu-cal-cell', 'mateu-cal-agenda-date'), events: cell.events }))
    const view = ['month', 'week', 'day', 'list'].includes(m.view) ? m.view : 'month'
    const views = (m.views || []).filter((v) => ['month', 'week', 'day', 'list'].includes(v))
    return {
      isCalendar: true,
      calId: 'mateuCal-' + String(id || 'calendar').replace(/[^A-Za-z0-9_-]/g, '_'),
      view,
      dayActionId: dayAction,
      hasSwitcher: views.length > 1,
      viewOptions: views.map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) })),
      titles: {
        month: monthName(anchor) + ' ' + anchor.slice(0, 4),
        week: monthName(week.from).slice(0, 3) + ' ' + dayNum(week.from) + ' – ' + monthName(week.to).slice(0, 3) + ' ' + dayNum(week.to) + ', ' + week.to.slice(0, 4),
        day: longDate(anchor) + ', ' + anchor.slice(0, 4),
        list: monthName(anchor) + ' ' + anchor.slice(0, 4),
      },
      dows: DOWS,
      monthCells,
      weekHeads: weekDates.map((d) => DOWS[calWeekday(d)] + ' ' + dayNum(d)),
      weekCells: weekDates.map((d) => cellOf(d, true)),
      dayHead: longDate(anchor),
      dayCells: [cellOf(anchor, true)],
      agenda,
      hasAgenda: agenda.length > 0,
    }
  }

  // ── comportamiento del DOM (una vez por documento) ────────────────────────────────────────────
  let calendarSink = null
  function setCalendarActionSink(fn) { calendarSink = typeof fn === 'function' ? fn : null }

  function installCalendars(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mateuCalendars) return
    doc.__mateuCalendars = true
    // cambiar de vista: el oj-buttonset-one NO burbujea valueChanged; la captura sí lo ve
    doc.addEventListener('valueChanged', (e) => {
      const set = e.target
      if (!set || !set.hasAttribute || !set.hasAttribute('data-cal-switch')) return
      const cal = set.closest('.mateu-cal')
      if (cal && e.detail && e.detail.value) cal.setAttribute('data-cal-shown', e.detail.value)
    }, true)
    const run = (target) => {
      const chip = target.closest('[data-cal-event]')
      const cal = target.closest('.mateu-cal')
      if (!cal || !calendarSink) return false
      if (chip) {
        if (chip.getAttribute('data-cal-clickable') !== 'true') return false
        calendarSink(chip.getAttribute('data-cal-action'), {
          _clickedEvent: { id: chip.getAttribute('data-cal-event'), title: chip.getAttribute('data-cal-title'), date: chip.getAttribute('data-cal-date') },
        }, {})
        return true
      }
      const cell = target.closest('[data-cal-date]')
      const action = cal.getAttribute('data-day-action')
      if (cell && action && cell.getAttribute('data-cal-date')) {
        calendarSink(action, { _date: cell.getAttribute('data-cal-date') }, {})
        return true
      }
      return false
    }
    doc.addEventListener('click', (e) => { if (e.target && e.target.closest && run(e.target)) e.stopPropagation() }, true)
    doc.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.closest && e.target.closest('.mateu-cal') && run(e.target)) e.preventDefault()
    }, true)
  }



  // TEXTO ENRIQUECIDO (P2 #23): un campo richText/html/markdown de sólo lectura y el componente
  // Markdown se pintan CON formato. VB no estampa HTML desde un binding, así que el átomo lleva el
  // HTML YA SANEADO en data-mateu-html y installRichText lo vuelca en su contenedor. El saneado es
  // por LISTA BLANCA (etiquetas de texto; de atributos sólo el href de un enlace con esquema
  // seguro): nada de scripts, estilos, manejadores ni iframes. JET no tiene editor de texto
  // enriquecido: editar un richText es un oj-text-area con su HTML (limitación declarada).

  const ALLOWED = new Set(['p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'code', 'pre', 'blockquote',
    'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span', 'div', 'hr', 'table', 'thead',
    'tbody', 'tr', 'th', 'td', 'sub', 'sup'])
  // su CONTENIDO también se descarta, no sólo la etiqueta
  const DROP_WITH_CONTENT = new Set(['script', 'style', 'iframe', 'object', 'embed', 'template', 'noscript', 'svg', 'math', 'textarea', 'select'])
  const VOID = new Set(['br', 'hr'])
  const SAFE_HREF = /^(https?:|mailto:|tel:|\/|#)/i

  const escapeText = (t) => String(t).replace(/&(?!(#\d+|#x[0-9a-f]+|[a-z]+);)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const escapeAttr = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  /** HTML → HTML saneado por lista blanca. */
  function sanitizeHtml(html) {
    const out = []
    let skipping = null
    let depth = 0
    const re = /<!--[\s\S]*?-->|<\/?([a-zA-Z][a-zA-Z0-9]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>|[^<]+|</g
    let m
    const src = String(html == null ? '' : html)
    while ((m = re.exec(src))) {
      const token = m[0]
      if (token.startsWith('<!--')) continue
      const tag = m[1] ? m[1].toLowerCase() : null
      const closing = token.startsWith('</')
      if (skipping) {
        if (tag === skipping) depth += closing ? -1 : 1
        if (depth === 0) skipping = null
        continue
      }
      if (!tag) { out.push(escapeText(token)); continue }
      if (DROP_WITH_CONTENT.has(tag)) {
        if (!closing && !/\/\s*$/.test(m[2] || '')) { skipping = tag; depth = 1 }
        continue
      }
      if (!ALLOWED.has(tag)) continue
      if (closing) { if (!VOID.has(tag)) out.push('</' + tag + '>'); continue }
      let attrs = ''
      if (tag === 'a') {
        const href = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(m[2] || '')
        const value = href ? (href[1] ?? href[2] ?? href[3] ?? '').trim().replace(/&amp;/g, '&') : ''
        if (value && SAFE_HREF.test(value)) {
          attrs = ' href="' + escapeAttr(value) + '"' + (/^https?:/i.test(value) ? ' target="_blank" rel="noopener noreferrer"' : '')
        }
      }
      if (tag === 'th' || tag === 'td') {
        const align = /\balign\s*=\s*["']?(left|right|center)\b/i.exec(m[2] || '')
        // emitted from constants only: nothing of the input reaches the attribute
        const ALIGNS = { left: ' align="left"', right: ' align="right"', center: ' align="center"' }
        if (align) attrs = ALIGNS[align[1].toLowerCase()] || ''
      }
      out.push('<' + tag + attrs + '>')
    }
    return out.join('')
  }

  const tableCells = (line) => {
    const t = line.trim().replace(/^\|/, '').replace(/\|$/, '')
    return t.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'))
  }
  const isTableSeparator = (line) => /\|/.test(line) && tableCells(line).every((c) => /^:?-{1,}:?$/.test(c))

  /** Markdown → HTML (saneado): encabezados, párrafos, listas, citas, código, y en línea negrita,
   *  cursiva, código y enlaces. Lo que no reconoce se queda como texto. */
  function markdownToHtml(md) {
    // HTML written inside the Markdown (an allowed tag: <b>, <br>, <span>…) is kept — the final
    // sanitizeHtml pass drops what is not on the list and every attribute but a safe href
    const escapeKeepingTags = (t) => String(t).split(/(<\/?[a-zA-Z][a-zA-Z0-9]*\b(?:[^>"']|"[^"]*"|'[^']*')*>)/)
      .map((part, i) => (i % 2 && ALLOWED.has(part.replace(/^<\/?([a-zA-Z0-9]+).*$/s, '$1').toLowerCase()) ? part : escapeText(part)))
      .join('')
    const inline = (t) => escapeKeepingTags(t)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
      .replace(/(\*\*|__)(.+?)\1/g, '<strong>$2</strong>')
      .replace(/(^|[^*\w])\*(?!\s)(.+?)\*(?!\w)/g, '$1<em>$2</em>')
      .replace(/(^|[^_\w])_(?!\s)(.+?)_(?!\w)/g, '$1<em>$2</em>')
    const lines = String(md == null ? '' : md).replace(/\r\n?/g, '\n').split('\n')
    const html = []
    let para = []
    let list = null // { tag, items }
    let quote = []
    const flushPara = () => { if (para.length) { html.push('<p>' + inline(para.join(' ')) + '</p>'); para = [] } }
    const flushList = () => { if (list) { html.push('<' + list.tag + '>' + list.items.map((i) => '<li>' + inline(i) + '</li>').join('') + '</' + list.tag + '>'); list = null } }
    const flushQuote = () => { if (quote.length) { html.push('<blockquote><p>' + inline(quote.join(' ')) + '</p></blockquote>'); quote = [] } }
    const flushAll = () => { flushPara(); flushList(); flushQuote() }
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (/^\s*```/.test(line)) {
        flushAll()
        const code = []
        while (++i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i])
        html.push('<pre><code>' + escapeText(code.join('\n')) + '</code></pre>')
        continue
      }
      if (!line.trim()) { flushAll(); continue }
      // GFM table: a header row, a |---|:--:| separator, then body rows
      if (/\|/.test(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
        flushAll()
        const aligns = tableCells(lines[i + 1]).map((c) => (/^:-+:$/.test(c) ? 'center' : /-+:$/.test(c) ? 'right' : ''))
        const head = tableCells(line)
        const body = []
        i += 2
        while (i < lines.length && /\|/.test(lines[i]) && lines[i].trim()) body.push(tableCells(lines[i++]))
        i--
        const cell = (tag, text, k) => '<' + tag + (aligns[k] ? ' align="' + aligns[k] + '"' : '') + '>' + inline(text) + '</' + tag + '>'
        html.push('<table><thead><tr>' + head.map((c, k) => cell('th', c, k)).join('') + '</tr></thead><tbody>'
          + body.map((r) => '<tr>' + head.map((_, k) => cell('td', r[k] || '', k)).join('') + '</tr>').join('') + '</tbody></table>')
        continue
      }
      const heading = /^\s*(#{1,6})\s+(.*)$/.exec(line)
      if (heading) { flushAll(); html.push('<h' + heading[1].length + '>' + inline(heading[2].trim()) + '</h' + heading[1].length + '>'); continue }
      if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { flushAll(); html.push('<hr>'); continue }
      const bullet = /^\s*[-*+]\s+(.*)$/.exec(line)
      const ordered = /^\s*\d+[.)]\s+(.*)$/.exec(line)
      if (bullet || ordered) {
        flushPara(); flushQuote()
        const tag = bullet ? 'ul' : 'ol'
        if (list && list.tag !== tag) flushList()
        if (!list) list = { tag, items: [] }
        list.items.push((bullet || ordered)[1])
        continue
      }
      const quoted = /^\s*>\s?(.*)$/.exec(line)
      if (quoted) { flushPara(); flushList(); quote.push(quoted[1]); continue }
      flushList(); flushQuote()
      para.push(line.trim())
    }
    flushAll()
    return sanitizeHtml(html.join(''))
  }

  // ── The stored value of a richText field ─────────────────────────────────────────────────────
  // (a port of libs/mateu richTextValue.ts — the bridge cannot import libs/mateu.) The value is HTML.
  // Values written by the old vaadin-rich-text-editor are Quill Delta JSON (`[{"insert":"…"}]` or
  // `{"ops":[…]}`): they are recognised and turned into the equivalent HTML, so existing data still
  // opens, and the editor writes HTML from the next edit on.

  const isDeltaOp = (op) => !!op && typeof op === 'object' && 'insert' in op

  /** The ops of a Delta value, or null when the value is not Delta JSON. */
  function deltaOps(value) {
    const raw = String(value == null ? '' : value).trim()
    if (!raw.startsWith('[') && !raw.startsWith('{')) return null
    try {
      const parsed = JSON.parse(raw)
      const ops = Array.isArray(parsed) ? parsed : parsed && Array.isArray(parsed.ops) ? parsed.ops : null
      return ops && ops.length > 0 && ops.every(isDeltaOp) ? ops : null
    } catch (e) {
      // not JSON: plain text or HTML that happens to start with a bracket
      return null
    }
  }

  const deltaEscape = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const deltaHref = (href) => {
    const h = String(href == null ? '' : href).trim()
    return /^(https?:|mailto:|tel:|\/|#)/i.test(h) || !/^[a-z][a-z0-9+.-]*:/i.test(h) ? h : ''
  }
  const deltaInline = (text, a = {}) => {
    let out = deltaEscape(text)
    if (a.code) out = '<code>' + out + '</code>'
    if (a.bold) out = '<strong>' + out + '</strong>'
    if (a.italic) out = '<em>' + out + '</em>'
    if (a.underline) out = '<u>' + out + '</u>'
    if (a.strike) out = '<s>' + out + '</s>'
    if (a.link && deltaHref(a.link)) out = '<a href="' + deltaEscape(deltaHref(a.link)) + '">' + out + '</a>'
    return out
  }

  /** Quill Delta → HTML, for the formats the old editor produced (inline marks, links, headings,
   *  lists, quotes, code blocks). Line formats live on the newline that ends the line. */
  function deltaToHtml(ops) {
    const lines = []
    let current = ''
    for (const op of ops) {
      if (typeof op.insert !== 'string') continue // embeds (images…) are not carried over
      const parts = op.insert.split('\n')
      parts.forEach((part, i) => {
        if (part) current += deltaInline(part, op.attributes)
        if (i < parts.length - 1) {
          lines.push({ html: current, attrs: op.attributes || {} })
          current = ''
        }
      })
    }
    if (current) lines.push({ html: current, attrs: {} })
    const out = []
    let list = null
    const flush = () => {
      if (list) out.push('<' + list.tag + '>' + list.items.map((i) => '<li>' + i + '</li>').join('') + '</' + list.tag + '>')
      list = null
    }
    for (const line of lines) {
      const a = line.attrs
      const listTag = a.list === 'ordered' ? 'ol' : a.list === 'bullet' ? 'ul' : null
      if (listTag) {
        if (!list || list.tag !== listTag) { flush(); list = { tag: listTag, items: [] } }
        list.items.push(line.html)
        continue
      }
      flush()
      const level = Number(a.header)
      if (level >= 1 && level <= 6) out.push('<h' + level + '>' + line.html + '</h' + level + '>')
      else if (a.blockquote) out.push('<blockquote>' + line.html + '</blockquote>')
      else if (a['code-block']) out.push('<pre><code>' + line.html + '</code></pre>')
      else out.push('<p>' + line.html + '</p>')
    }
    flush()
    return out.join('')
  }

  /** The HTML to open a stored value with: the value itself, or its Delta converted. */
  function richTextHtml(value) {
    const ops = deltaOps(value)
    return ops ? deltaToHtml(ops) : (value == null ? '' : String(value))
  }

  /** What the editor stores: '' for an editor left empty (only empty paragraphs/breaks), else the
   *  sanitised HTML. */
  function richTextValueOf(html) {
    const clean = sanitizeHtml(html)
    return clean.replace(/<(p|div)>(\s|&nbsp;|<br>)*<\/\1>/g, '').replace(/<br>/g, '').trim() ? clean : ''
  }

  /** The toolbar of the editor: each command and its accessible label. */
  const RICH_TEXT_COMMANDS = [
    { cmd: 'bold', icon: 'oj-ux-ico-bold', label: 'rteBold', key: 'b' },
    { cmd: 'italic', icon: 'oj-ux-ico-italics', label: 'rteItalic', key: 'i' },
    { cmd: 'underline', icon: 'oj-ux-ico-underline', label: 'rteUnderline', key: 'u' },
    { cmd: 'insertUnorderedList', icon: 'oj-ux-ico-list-bulleted', label: 'rteBullets' },
    { cmd: 'insertOrderedList', icon: 'oj-ux-ico-number-list', label: 'rteNumbers' },
    { cmd: 'createLink', icon: 'oj-ux-ico-link', label: 'rteLink' },
    { cmd: 'removeFormat', icon: 'oj-ux-ico-remove-formatting', label: 'rteClear' },
  ]

  /**
   * `<mateu-rich-text-field value="<p>…</p>" readonly>`: the editor of an editable richText field.
   * JET/Redwood has no rich text editor (oj-text-area is plain text), and the web renderer's editor
   * (Tiptap) cannot be imported by the bridge — so a small one: a toolbar of oj-buttons over a
   * contenteditable region. The value is HTML (a legacy Delta opens converted); it leaves as
   * `valueChanged` {value, updatedFrom:'internal'} — the event shape of a JET component, so the
   * field chains treat it like any other — on blur, sanitised by the same allowlist as the viewer.
   */
  function defineRichTextField(win = typeof window !== 'undefined' ? window : null) {
    if (!win || !win.customElements || win.customElements.get('mateu-rich-text-field')) return
    const doc = win.document
    class MateuRichTextField extends win.HTMLElement {
      static get observedAttributes() { return ['value', 'readonly', 'aria-label'] }
      connectedCallback() { this.render() }
      attributeChangedCallback() { if (this.isConnected && !this.editing) this.render() }
      get value() { return this.getAttribute('value') || '' }
      set value(v) { if (v == null || v === '') this.removeAttribute('value'); else this.setAttribute('value', String(v)) }
      get readonlyNow() { return this.hasAttribute('readonly') && this.getAttribute('readonly') !== 'false' }
      commit() {
        if (!this.area) return
        const value = richTextValueOf(this.area.innerHTML)
        if (value === richTextValueOf(richTextHtml(this.value))) return
        this.editing = true
        this.value = value
        this.editing = false
        this.dispatchEvent(new win.CustomEvent('valueChanged', {
          detail: { value: value || null, previousValue: null, updatedFrom: 'internal' }, bubbles: true }))
      }
      render() {
        this.textContent = ''
        this.classList.add('mateu-rich-text-field')
        const html = sanitizeHtml(richTextHtml(this.value))
        if (this.readonlyNow) {
          const view = doc.createElement('div')
          view.className = 'mateu-atom-richtext oj-typography-body-md'
          view.innerHTML = html
          this.appendChild(view)
          this.area = null
          return
        }
        const bar = doc.createElement('div')
        bar.className = 'mateu-rte-toolbar'
        bar.setAttribute('role', 'toolbar')
        bar.setAttribute('aria-label', chromeText('formatting'))
        const area = doc.createElement('div')
        area.className = 'mateu-rte-area oj-typography-body-md'
        area.setAttribute('contenteditable', 'true')
        area.setAttribute('role', 'textbox')
        area.setAttribute('aria-multiline', 'true')
        if (this.getAttribute('aria-label')) area.setAttribute('aria-label', this.getAttribute('aria-label'))
        area.innerHTML = html
        for (const c of RICH_TEXT_COMMANDS) {
          const b = doc.createElement('oj-button')
          b.setAttribute('data-oj-binding-provider', 'none')
          b.setAttribute('display', 'icons')
          b.setAttribute('chroming', 'borderless')
          b.className = 'oj-button-sm'
          const icon = doc.createElement('span')
          icon.setAttribute('slot', 'startIcon')
          icon.className = c.icon
          b.appendChild(icon)
          b.appendChild(doc.createTextNode(chromeText(c.label)))
          // keep the selection in the editor when the button takes the click
          b.addEventListener('mousedown', (e) => e.preventDefault())
          b.addEventListener('ojAction', (e) => {
            e.stopPropagation()
            area.focus()
            if (c.cmd === 'createLink') {
              const url = win.prompt(chromeText('rteLinkPrompt'), 'https://')
              if (url && deltaHref(url)) doc.execCommand('createLink', false, url)
            } else doc.execCommand(c.cmd, false, null)
            this.commit()
          })
          bar.appendChild(b)
        }
        area.addEventListener('blur', () => this.commit())
        area.addEventListener('keydown', (e) => {
          const mod = e.ctrlKey || e.metaKey
          const hit = mod && RICH_TEXT_COMMANDS.find((c) => c.key && c.key === String(e.key).toLowerCase())
          if (hit) { e.preventDefault(); doc.execCommand(hit.cmd, false, null) }
        })
        this.area = area
        this.appendChild(bar)
        this.appendChild(area)
      }
    }
    win.customElements.define('mateu-rich-text-field', MateuRichTextField)
  }

  /** Vuelca el HTML saneado de cada [data-mateu-html] en su contenedor (y cuando cambia). */
  function installRichText(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mateuRichText || typeof MutationObserver === 'undefined') return
    doc.__mateuRichText = true
    const fill = (el) => {
      const html = el.getAttribute('data-mateu-html') || ''
      if (el.__mateuHtml === html) return
      el.__mateuHtml = html
      // el valor ya viene saneado del bridge; se vuelve a sanear aquí por si alguien escribe el atributo
      el.innerHTML = sanitizeHtml(html)
    }
    const scan = (root) => {
      if (root.nodeType !== 1) return
      if (root.hasAttribute('data-mateu-html')) fill(root)
      for (const el of root.querySelectorAll('[data-mateu-html]')) fill(el)
    }
    scan(doc.body || doc.documentElement)
    new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === 'attributes') fill(r.target)
        else for (const n of r.addedNodes) scan(n)
      }
    }).observe(doc.body || doc.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-mateu-html'] })
  }


  // Los enlaces HTML corrientes dentro del contenido (`<a href="/journey/bookings/ZUAAKJ">Ver
  // recorrido</a>`, de un Text/Html de la app) navegan DENTRO de la shell, como en Vaadin: allí el
  // cliente de Flow (RouterLinkHandler) se queda con el clic en un enlace a una ruta de la app y
  // navega sin recargar. Aquí, sin esto, el navegador cargaba la página entera y la shell de Redwood
  // volvía a arrancar (20–40 s en blanco). Mismas reglas que Flow: sólo un clic normal (botón
  // principal, sin Ctrl/Cmd/Mayús/Alt) que nadie haya atendido ya, en un enlace del mismo origen,
  // sin target (o _self), sin download ni router-ignore; además, nada que no sea una pantalla: las
  // rutas internas (/_inbox, /_xxx), el API, el login/logout y los ficheros (algo.pdf) siguen
  // siendo del navegador, y un ancla a la misma página (#expand=…, el foldout) también.

  /** Prefijos de rutas que no son pantallas de la app: el navegador las carga como siempre. */
  const NOT_A_SCREEN = /^\/(_|api(\/|$)|oauth2(\/|$)|login(\/|$)|logout(\/|$)|sso(\/|$)|actuator(\/|$)|webjars(\/|$)|assets(\/|$)|static(\/|$)|resources(\/|$)|version_)/i

  /** El último tramo con extensión de fichero (`informe.pdf`, `bundle.js`): no es una pantalla (un id
   *  con punto, `/customers/ana.ruiz`, sí). */
  const LOOKS_LIKE_FILE = /\.(pdf|csv|tsv|xlsx?|docx?|pptx?|odt|ods|zip|gz|tar|json|xml|txt|md|png|jpe?g|gif|svg|ico|webp|avif|mp4|webm|mp3|wav|js|mjs|css|map|html?|woff2?|ttf|otf)$/i

  /**
   * La ruta de la app a la que navega un clic en un enlace (con su query), o null si el clic sigue
   * siendo del navegador. `location` es la de la página (window.location); `hashMode` es la shell
   * servida en estático, cuyas rutas viven en `#/ruta`.
   */
  function inAppRouteOfLink(anchor, event, location, hashMode = false, mount = '') {
    if (!anchor || !anchor.getAttribute || !location) return null
    if (event && (event.defaultPrevented || event.button > 0
      || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)) return null
    const href = anchor.getAttribute('href')
    if (href == null || href.trim() === '') return null
    const target = (anchor.getAttribute('target') || '').trim().toLowerCase()
    if (target && target !== '_self') return null
    if (anchor.getAttribute('download') != null || anchor.getAttribute('router-ignore') != null) return null
    // en estático (#/ruta) un `#/ruta` también es una pantalla
    if (hashMode && /^#\//.test(href.trim())) {
      return href.trim().slice(1)
    }
    // `#`, `#expand=…`: anclas de esta misma página (el foldout, los href="#" de JET), del navegador
    if (href.trim().charAt(0) === '#') return null
    let url
    try {
      url = new URL(href.trim(), location.href)
    } catch (e) {
      return null
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (url.origin !== location.origin) return null
    let path = url.pathname || '/'
    // un ancla a esta misma página (#expand=…): la hace el navegador
    if (url.hash && path === location.pathname && url.search === (location.search || '')) return null
    // the app mounted under a path (@UI("/console")): only links below it are screens of THIS app
    // (another path is another UI: the browser loads it), its route is the part after the mount and
    // the mount itself is the home
    const m = String(mount || '').replace(/\/+$/, '')
    if (m) {
      if (path === m || path === m + '/') path = '/'
      else if (path.startsWith(m + '/')) path = path.slice(m.length)
      else return null
    }
    if (NOT_A_SCREEN.test(path) || LOOKS_LIKE_FILE.test(path)) return null
    return path + url.search
  }




  // Part of the Redwood core (reduceContexts.mjs re-exports every piece): the component tree: walks, fields, actions, islands, overlays, texts.

  const HOST_ID = '__root__'

  /** Recorrido que NO cruza fronteras de isla: un ServerSide INTERIOR es otra superficie
   *  (sus campos/acciones pertenecen a su propio contexto, no al host). */
  function walkWithinSurface(node, visit) {
    const walk = (n, isRoot) => {
      if (!n || typeof n !== 'object') return
      if (!isRoot && n.type === 'ServerSide') return // frontera de isla: parar
      visit(n)
      for (const [k, v] of Object.entries(n)) {
        // the page header's record/context switcher (Page.metadata.switcher) is header chrome, not
        // content: its actionId + label made a stray «Customer» button in the form's action row
        if (k === 'switcher' && n.type === 'Page') continue
        if (Array.isArray(v)) v.forEach((x) => walk(x, false))
        else if (v && typeof v === 'object') walk(v, false)
      }
    }
    walk(node, true)
  }

  /** The node id of every metadata object of the tree (metadata → its node's id), for the visual
   *  editor's canvas: the fields and the buttons are collected as their METADATA, and what the
   *  editor selects is the node. Only asked for in editor mode (setEditorNodeIds). */
  function ownerIdsOf(tree) {
    const ids = new Map()
    walkWithinSurface(tree, (n) => { if (n.metadata && typeof n.metadata === 'object' && n.id) ids.set(n.metadata, String(n.id)) })
    return ids
  }

  /** Helper de RENDER: recolecta los FormFields de la superficie (sin cruzar islas). */
  function collectFields(node, out = []) {
    walkWithinSurface(node, (n) => { if (n.fieldId) out.push(n) })
    return out
  }

  /** Helper de RENDER: recolecta botones/acciones de la superficie (sin cruzar islas). */
  function collectActions(node, out = []) {
    walkWithinSurface(node, (n) => { if (n.actionId && n.label && !n.fieldId) out.push(n) })
    return out
  }

  /** Fronteras de isla embebida — DOS sabores confirmados en wire real:
   *  (a) nodos ServerSide INTERIORES (id propio, p.ej. '_guestNote');
   *  (b) nodos ClientSide App variant=MEDIATOR con id estable (p.ej.
   *      'island_checkin_st_maria') cuya PROPIA metadata trae homeRoute
   *      (?_embeddedMediator=1) + homeConsumedRoute + homeServerSideType —
   *      el detalle del TaskQueue del front-office llega así. */
  function collectIslands(tree, out = []) {
    const walk = (node, isRoot) => {
      if (!node || typeof node !== 'object') return
      if (!isRoot && node.type === 'ServerSide') {
        // un @Subresource no es la isla de la pantalla: lo carga loadSubresources cuando queda a
        // la vista (ver subresourceIslandOf)
        if (!subresourceIslandOf(node)) out.push(node)
        return // sus hijos pertenecen a la isla, no al host
      }
      if (!isRoot && node.type === 'ClientSide' && node.id && node.metadata
          && node.metadata.type === 'App' && node.metadata.variant === 'MEDIATOR') {
        out.push({
          id: node.id,
          route: node.metadata.homeRoute,
          consumedRoute: node.metadata.homeConsumedRoute || node.metadata.homeRoute,
          serverSideType: node.metadata.homeServerSideType,
          // el CONTEXTO sembrado por el host (stayId, paxIndex…): debe viajar como
          // componentState en la carga inicial de la isla (mateu-ux.initialState)
          initialData: node.initialData || null,
        })
        return
      }
      for (const v of Object.values(node)) {
        if (Array.isArray(v)) v.forEach((x) => walk(x, false))
        else if (v && typeof v === 'object') walk(v, false)
      }
    }
    walk(tree, true)
    return out
  }

  /** Helper de RENDER: FormField[] del árbol → metadata de oj-dyn-form (mapa campo → meta).
   *  null si el árbol no tiene campos (página sin formulario). */
  function dynFormMetadataOf(tree) {
    const NUMERIC = ['integer', 'int', 'long', 'number', 'double', 'float', 'money']
    const metadata = {}
    for (const f of collectFields(tree)) {
      if (!f.dataType || metadata[f.fieldId]) continue // duplicados = referencias de FormRow
      // una LISTA (grid de formulario) no es un campo de texto: la pinta el contenido como tabla
      // (un @Searchable de varios ids sí es un campo: sus chips)
      // una lista es una tabla (no un campo) salvo @Searchable y las de elección múltiple
      if ((f.dataType === 'array' && f.stereotype !== 'searchable' && !isExtraLayoutField(f)) || (f.columns || []).length) continue
      metadata[f.fieldId] = {
        type: NUMERIC.indexOf(f.dataType) >= 0 ? 'number'
          : f.dataType === 'bool' || f.dataType === 'boolean' ? 'boolean' : 'string',
        displayName: f.label || f.fieldId,
        required: !!f.required,
        readonly: !!f.readOnly,
        stereotype: f.stereotype || '',
      }
    }
    return Object.keys(metadata).length ? metadata : null
  }

  /** Helper de RENDER: botones únicos del árbol. chroming viene PRECOMPUTADO (los bindings
   *  VB deben quedar como paths simples: un ternario en un atributo rompe la evaluación CSP
   *  de TODAS las propiedades del elemento). */
  function actionsOf(tree) {
    const seen = {}
    const out = []
    const ids = editorNodeIds ? ownerIdsOf(tree) : null
    for (const a of collectActions(tree)) {
      if (seen[a.actionId]) continue
      seen[a.actionId] = true
      out.push({
        actionId: a.actionId,
        label: a.label,
        style: a.buttonStyle || 'outlined',
        chroming: a.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
        parameters: a.parameters || {},
        // shown but inert (a Toggle.disabled wizard/crud button): the oj-button's disabled
        disabled: !!a.disabled,
        ...(ids && ids.get(a) ? { nodeId: ids.get(a) } : {}),
      })
    }
    return out
  }

  /** Helper de RENDER: lista de campos para el switch widgetFor (isText/isNumber/isBoolean/
   *  isSelect/isDate/isDateTime PRECOMPUTADOS — los bindings VB deben ser paths simples), con el
   *  valor sacado del state. Es la MISMA resolución de widget que el editor de fila
   *  (fieldWidgetOf): un select con opciones (options/OptionsSupplier/enum) se pinta como
   *  oj-select-one y una fecha como oj-input-date también en el formulario de página, el drawer
   *  y la isla, no sólo en el diálogo de la fila. Un lookup REMOTO sin opciones todavía se queda
   *  en texto: aquí nadie lanza su búsqueda (sólo el editor de fila lo hace). */
  function fieldListOf(tree, state, data) {
    if (!dynFormMetadataOf(tree)) return []
    const s = state || {}
    const seen = {}
    const out = []
    const ids = editorNodeIds ? ownerIdsOf(tree) : null
    for (const f of collectFields(tree)) {
      if (!f.dataType || seen[f.fieldId]) continue
      seen[f.fieldId] = true
      // una lista es una tabla (no un campo) salvo @Searchable y las de elección múltiple
      if ((f.dataType === 'array' && f.stereotype !== 'searchable' && !isExtraLayoutField(f)) || (f.columns || []).length) continue
      // la vista de detalle de un @Searchable llega como `<campo>-label`: su texto viaja en data
      const raw = s[f.fieldId] == null && f.stereotype === 'searchable' && data ? data[f.fieldId] : s[f.fieldId]
      // un lookup REMOTO es un desplegable también aquí: sus opciones las carga la chain
      // (bridge.loadLookups) al abrir la pantalla, como las del editor de fila
      const widget = fieldWidgetOf(f, data, { lookups: true, value: raw, textWhenEmpty: true })
      let value = raw == null ? null : (widget.isSelect ? plainValueOf(raw) : raw)
      if (widget.isMultiSelect || widget.isCheckboxSet)
        value = Array.isArray(raw) ? raw.map((v) => plainValueOf(v)) : (raw == null || raw === '' ? [] : String(raw).split(','))
      else if (widget.isMoney) value = raw == null || raw === '' || Number.isNaN(Number(raw)) ? null : Number(raw)
      out.push({ ...widget, value, ...(ids && ids.get(f) ? { nodeId: ids.get(f) } : {}) })
    }
    return out
  }

  /** ¿Es este nodo una SECCIÓN del formulario (@Section)? El wire la manda como una Card con la
   *  clase mateu-section, su título en un Text de cabecera (h3) y sus campos en un FormLayout. */
  function isSectionNode(n) {
    return !!(n && n.metadata && n.metadata.type === 'Card' && /(^|\s)mateu-section(\s|$)/.test(n.cssClasses || ''))
  }

  /** El título y las columnas de una sección: el primer Text de cabecera y el primer FormLayout
   *  de SU contenido (sin bajar a una sección anidada ni a otra isla). */
  function sectionHeadOf(card) {
    let title = ''
    let columns = 0
    const walk = (n, isRoot) => {
      if (!n || typeof n !== 'object') return
      if (!isRoot && (n.type === 'ServerSide' || isSectionNode(n))) return
      const md = n.metadata
      if (md && md.type === 'Text' && !title && /^h[1-6]$/.test(md.container || '') && md.text) title = String(md.text)
      if (md && md.type === 'FormLayout' && !columns) columns = md.maxColumns || md.columns || 0
      for (const v of Object.values(n)) {
        if (Array.isArray(v)) v.forEach((x) => walk(x, false))
        else if (v && typeof v === 'object') walk(v, false)
      }
    }
    walk(card, true)
    return { title, columns: columns > 0 ? Math.min(columns, 4) : 1, declaredColumns: columns > 0 }
  }

  /**
   * The buttons a SECTION carries (@Section(editAction, addAction, viewMoreAction), an @Inline type's
   * @Toolbar/@Button): those in the title row (the HorizontalLayout holding the section's heading)
   * stay beside the title, the rest go under the section's content — they belong to the section,
   * not to the form's action row. Not crossing a nested section or an island.
   */
  function sectionButtonsOf(card) {
    const titleButtons = []
    const footerButtons = []
    const isHeading = (k) => !!(k && k.metadata && k.metadata.type === 'Text' && /^h[1-6]$/.test(k.metadata.container || ''))
    const buttonOf = (m) => ({
      actionId: m.actionId,
      label: m.label || m.actionId,
      // tertiary (the affordances) = JET borderless
      chroming: m.buttonStyle === 'primary' ? 'callToAction' : m.buttonStyle === 'tertiary' ? 'borderless' : 'outlined',
      disabled: !!m.disabled,
      parameters: m.parameters || {},
    })
    const walk = (n, isRoot, inTitleRow) => {
      if (!n || typeof n !== 'object') return
      if (Array.isArray(n)) { n.forEach((x) => walk(x, false, inTitleRow)); return }
      if (!isRoot && (n.type === 'ServerSide' || isSectionNode(n))) return
      const md = n.metadata
      if (md && md.type === 'Button' && md.actionId) {
        (inTitleRow ? titleButtons : footerButtons).push(buttonOf(md))
        return
      }
      const titleRow = !!(md && md.type === 'HorizontalLayout' && (n.children || []).some(isHeading))
      for (const [k, v] of Object.entries(n)) {
        if (k === 'metadata' && md) {
          for (const mv of Object.values(md)) if (mv && typeof mv === 'object') walk(mv, false, inTitleRow || titleRow)
          continue
        }
        if (v && typeof v === 'object') walk(v, false, inTitleRow || titleRow)
      }
    }
    walk(card, true, false)
    return { titleButtons, footerButtons }
  }

  /**
   * Las columnas de un grupo de campos en un formulario a TODO EL ANCHO (página, wizard): las
   * declaradas (FormLayout maxColumns, @Section(columns)) o, sin declarar, dos — el reparto por
   * defecto del FormLayout de Vaadin en escritorio. oj-form-layout las baja solo cuando no caben
   * (cada columna pide 18rem como mínimo), así que en un teléfono vuelve a ser una.
   */
  function wideColumnsOf(section) {
    return section.declaredColumns ? section.columns : 2
  }

  /**
   * Helper de RENDER: los campos del formulario AGRUPADOS por sus secciones (@Section), en el
   * orden del wire → [{ key, title, hasTitle, columns, fields }]. Los campos fuera de toda
   * sección van a un grupo sin título; un formulario sin secciones es UN grupo sin título, así
   * que el template pinta siempre secciones → campos. [] si el árbol no tiene formulario.
   */
  function formSectionsOf(tree, state, data) {
    const fields = fieldListOf(tree, state, data)
    if (!fields.length) return []
    const byId = {}
    for (const f of fields) byId[f.fieldId] = f
    const sections = []
    const placed = {}
    let loose = null
    const walk = (n, isRoot, section) => {
      if (!n || typeof n !== 'object') return
      if (!isRoot && n.type === 'ServerSide') return // frontera de isla: sus campos no son de aquí
      let here = section
      if (isSectionNode(n)) {
        here = { key: 's' + sections.length, ...sectionHeadOf(n), ...sectionButtonsOf(n), fields: [] }
        sections.push(here)
      }
      if (n.fieldId && byId[n.fieldId] && !placed[n.fieldId]) {
        placed[n.fieldId] = true
        if (here) {
          here.fields.push(byId[n.fieldId])
        } else {
          if (!loose || sections[sections.length - 1] !== loose) {
            loose = { key: 's' + sections.length, title: '', columns: 1, declaredColumns: false, titleButtons: [], footerButtons: [], fields: [] }
            sections.push(loose)
          }
          loose.fields.push(byId[n.fieldId])
        }
      }
      for (const v of Object.values(n)) {
        if (Array.isArray(v)) v.forEach((x) => walk(x, false, here))
        else if (v && typeof v === 'object') walk(v, false, here)
      }
    }
    walk(tree, true, null)
    // un formulario sin FormLayout propio (los campos sueltos de un ServerSide) toma sus columnas
    // del FormLayout raíz, si lo hay
    const rootColumns = sectionHeadOf(tree)
    return sections
      .filter((sec) => sec.fields.length)
      .map((sec) => {
        const head = !sec.declaredColumns && rootColumns.declaredColumns ? { ...sec, columns: rootColumns.columns, declaredColumns: true } : sec
        // (el @Colspan de un campo no se aplica: de los hijos del oj-form-layout clásico sólo
        // oj-label-value tiene colspan, y envolver el control en uno descuadra la rejilla)
        return { ...head, hasTitle: !!sec.title, wideColumns: wideColumnsOf(head),
          hasTitleButtons: !!(sec.titleButtons && sec.titleButtons.length),
          hasFooterButtons: !!(sec.footerButtons && sec.footerButtons.length) }
      })
  }

  /** Proyección del OVERLAY superior del stack (drawer del crud): título + campos + acciones.
   *  null si no hay overlays. Sus acciones se postean contra el HOST (el drawer no lleva
   *  ServerSide propio — confirmado en el wire). */
  function overlayOf(reg) {
    const id = reg.stack && reg.stack.length ? reg.stack[reg.stack.length - 1] : null
    if (!id || !reg.contexts[id]) return null
    const ctx = reg.contexts[id]
    // bloques display del contenido del drawer (ResourceGrid/OfferCard/StatusList…):
    // el panel VB los pinta con el MISMO template de átomos que el host — un drawer no
    // es solo campos y botones (p.ej. el picker de habitaciones)
    // los FormFields del drawer ya los pinta su gramática de CAMPOS (oj-form-layout):
    // fuera los átomos isInput de los bloques o saldrían DUPLICADOS (y el usuario
    // escribiría en el par equivocado)
    // pauta del drawer Redwood: las ACCIONES van en la barra del pie. Un Button del
    // contenido SIN parámetros se mueve al pie (p.ej. Enviar); los que llevan parameters
    // (listas de opciones: métodos de cobro, habitaciones…) se quedan en su sitio y NO se
    // repiten en el pie. En un DIALOG (modal de decisión puntual) TODOS los botones son
    // acciones del pie — el listener del modal despacha actionId + parameters, así que
    // "Check-in de <nombre>" (con su _item) viaja igual que "Volver al listado"
    const isDialog = !!(ctx.tree && ctx.tree.metadata && ctx.tree.metadata.type === 'Dialog')
    const conParams = (btn) => !!(btn.parameters && Object.keys(btn.parameters).length)
    const keepInContent = isDialog ? () => false : conParams
    // un formulario EMBEBIDO en el overlay (EmbeddedView: un ServerSide propio dentro del Dialog
    // o del Drawer) es la superficie: sus campos, sus botones y sus textos. Recorrer el árbol
    // del overlay no los encontraba — el recorrido no cruza a otro ServerSide — y el diálogo
    // salía vacío.
    const surface = ctx.surface || ctx.tree
    const surfaceCtx = surface === ctx.tree ? ctx : { ...ctx, tree: surface }
    const content = (islandContentOf(surfaceCtx) || [])
      .map((block) => ({
        ...block,
        items: block.items
          .filter((a) => !a.isInput && !a.isFormLayout)
          .map((a) => (a.isButtons ? { ...a, buttons: (a.buttons || []).filter(keepInContent) } : a))
          .filter((a) => !a.isButtons || a.buttons.length),
      }))
      .filter((block) => block.items.length)
    const contentActionIds = new Set()
    for (const block of content) {
      for (const a of block.items) {
        if (a.isButtons) for (const btn of a.buttons || []) contentActionIds.add(btn.actionId)
      }
    }
    return {
      id,
      title: ctx.title || '',
      // el subtítulo del Drawer (General Drawer: «Room 102 · 12 oct → 14 oct») bajo el título
      subtitle: ctx.subtitle || '',
      position: ctx.position || 'end',
      width: ctx.width,
      state: ctx.state || {},
      fields: fieldListOf(surface, ctx.state, ctx.data),
      sections: formSectionsOf(surface, ctx.state, ctx.data),
      actions: actionsOf(surface).filter((a) => !contentActionIds.has(a.actionId)),
      content: content,
      hasContent: !!content.length,
      // un overlay Dialog se pinta como MODAL (oj-dialog: decisión puntual), no como
      // drawer (tarea con formulario); texts = sus líneas de mensaje
      isDialog,
      texts: collectTexts(surface),
    }
  }

  /** Vigía del diálogo de progreso de un LongTask sobre el stream SSE: consume el Add del
   *  Dialog-con-ProgressBar y los state-only dirigidos a su id; devuelve eventos
   *  {kind: open|progress, title?, text?, value?, rest} para que el chain pinte el
   *  oj-dialog — `rest` lleva los commands/messages del increment (el último los trae:
   *  dispatchEvent del refresco) SIN el fragment del diálogo, listos para reducir. */
  function longTaskWatcher() {
    const hasProgressBar = (node) => {
      if (!node || typeof node !== 'object') return false
      if (node.metadata && node.metadata.type === 'ProgressBar') return true
      for (const v of Object.values(node)) {
        if (Array.isArray(v)) { if (v.some(hasProgressBar)) return true }
        else if (v && typeof v === 'object' && hasProgressBar(v)) return true
      }
      return false
    }
    const w = { dialogId: null, closeAfter: null }
    w.consume = (inc) => {
      for (const fragment of inc.fragments || []) {
        const md = fragment.component && fragment.component.metadata
        if (fragment.action === 'Add' && md && md.type === 'Dialog' && hasProgressBar(fragment.component)) {
          w.dialogId = md.id
          const seed = md.initialData || {}
          return {
            kind: 'open',
            title: seed.title,
            text: seed.progressText,
            value: seed.progressValue || 0,
            rest: { commands: inc.commands || [], messages: inc.messages || [], fragments: [] },
          }
        }
      }
      if (!w.dialogId) return null
      const frs = inc.fragments || []
      if (frs.length && frs.every((f) => !f.component && f.targetComponentId === w.dialogId)) {
        const st = frs[0].state || {}
        if (st._closeAfterMillis != null) w.closeAfter = st._closeAfterMillis
        return {
          kind: 'progress',
          title: st.title,
          text: st.progressText,
          value: st.progressValue,
          rest: { commands: inc.commands || [], messages: inc.messages || [], fragments: [] },
        }
      }
      return null
    }
    return w
  }

  /** Helper de RENDER: recolecta los textos (metadata.type Text) de un subárbol. */
  function collectTexts(node, out = []) {
    if (!node || typeof node !== 'object') return out
    if (node.metadata && node.metadata.type === 'Text' && node.metadata.text != null) {
      out.push(node.metadata.text)
    }
    for (const v of Object.values(node)) {
      if (Array.isArray(v)) v.forEach((x) => collectTexts(x, out))
      else if (v && typeof v === 'object') collectTexts(v, out)
    }
    return out
  }






  // Part of the Redwood core (reduceContexts.mjs re-exports every piece): page archetypes projected from the tree: foldout, wizard.

  /** Proyección del FOLDOUT (Fase 7): overview + paneles con sus cabeceras (metadata.panels)
   *  y su contenido slotted (overview / panel-N). null si el contexto no es un foldout.
   *  Cada slot proyecta además sus bloques RICOS (mismo pipeline que el host: tarjetas
   *  StatusList, botones, inputs, notices…) — el markup pinta blocks y deja texts solo
   *  como forma legada para tests/fixtures. */
  function foldoutOf(ctx) {
    // el foldout de PÁGINA: uno metido en una pestaña (o en un panel de consola) es contenido de esa
    // pestaña — visit() lo pinta allí, con sus paneles plegables — y no se adueña de la pantalla
    const node = ctx && ctx.tree ? findOutside(ctx.tree, 'FoldoutLayout', { ...PANE_TYPES, TabLayout: true }) : null
    if (!node) return null
    const md = node.metadata
    const children = node.children || []
    const bySlot = {}
    for (const child of children) bySlot[child.slot || ''] = child
    const blocksOf = (slotNode) => {
      const blocks = slotNode
        ? islandContentOf({ tree: slotNode, state: (ctx && ctx.state) || {}, data: (ctx && ctx.data) || {} })
        : null
      // mismo contrato visual que hostContentOf: bloques-columna con su colClass,
      // el resto a fila completa
      return (blocks || []).map((block) => ({
        ...block,
        blockClass: block.colClass || 'oj-flex-item oj-sm-12',
      }))
    }
    // Las insignias de la PÁGINA (el @Status de la cabecera: «Confirmed») encabezan el overview:
    // el web las pinta junto al título, y la cabecera de VB no tiene sitio para ellas. Mismas
    // clases badge de JET que las celdas @Status; una plantilla sin resolver no se pinta.
    const page = ctx && ctx.tree ? findByType(ctx.tree, 'Page') : null
    const state = (ctx && ctx.state) || {}
    const pageBadges = ((page && page.metadata && page.metadata.badges) || [])
      .map((b) => {
        const label = interpolate(b.text || '', state)
        const color = interpolate(b.color || '', state)
        return {
          isBadge: true,
          label,
          badgeClass: STATUS_BADGE[color] || BADGE_CLASSES[String(color).toLowerCase()] || STATUS_BADGE.NONE,
          blockClass: 'oj-flex-item oj-sm-12',
        }
      })
      .filter((b) => b.label && b.label.trim() && !b.label.includes('${'))
    return {
      headerTitle: md.headerTitle || '',
      badges: pageBadges,
      overview: {
        texts: collectTexts(bySlot['overview']),
        // un bloque PLANO que las lleva como átomos: el template del overview solo pinta bloques
        // isCard/isPlain e isBadge es un átomo de sus items — un bloque isBadge suelto no se veía
        blocks: (pageBadges.length
          ? [{ isPlain: true, isCard: false, blockClass: 'oj-flex-item oj-sm-12', items: pageBadges }]
          : []).concat(blocksOf(bySlot['overview'])),
      },
      panels: (md.panels || []).map((panel, i) => ({
        title: panel.title || '',
        subtitle: panel.subtitle || '',
        // título compuesto del panel: "Operaciones · 1 de 7" — el contador vive en la
        // CABECERA (leído del contenido vivo por índice, refresca sin re-stampar)
        headerLabel: (panel.title || '') + (panel.subtitle ? ' · ' + panel.subtitle : ''),
        open: panel.open !== false,
        // width EXPLÍCITO del wire (FoldoutPanel.width): el markup fija el panel a esa
        // medida — sin él, el motor responsive del foldout reparte a su aire y las
        // tarjetas del cockpit se solapan
        width: panel.width || '',
        texts: collectTexts(bySlot['panel-' + i]),
        blocks: blocksOf(bySlot['panel-' + i]),
        // FoldoutPanel.summary (child slotted summary-N): oj-sp-foldout-panel's own `summary` slot,
        // the compact line under the panel title
        ...foldoutSummaryOf(bySlot['summary-' + i]),
      })),
    }
  }

  /** A foldout panel's summary (the `summary-N` child): `hasSummary` + its texts as one line. */
  function foldoutSummaryOf(slotNode) {
    const parts = []
    const walk = (n) => {
      if (!n || typeof n !== 'object') return
      if (Array.isArray(n)) { n.forEach(walk); return }
      const m = n.metadata || {}
      // the short pieces a summary is made of: texts, and the label of a badge/chip
      if (m.type === 'Text' && m.text != null) parts.push(String(m.text))
      else if ((m.type === 'Badge' || m.type === 'Chip') && (m.label || m.text)) parts.push(String(m.label || m.text))
      else if (m.type === 'Notice' && m.text) parts.push(String(m.text))
      for (const c of n.children || []) walk(c)
      if (m.content) walk(m.content)
    }
    walk(slotNode)
    const text = parts.map((t) => t.trim()).filter(Boolean).join(' · ')
    return { hasSummary: !!text, summary: text }
  }

  /** Proyección del WIZARD (Fase 8): los ProgressSteps del wire → pasos ({id,label} + currentStep
   *  por id). null si la página no es un wizard. En la pantalla de resultado todos los pasos van
   *  'done' → currentStep = el último.
   *
   *  ORIENTACIÓN: la decide el propio wizard con @WizardProgress — RAIL manda un ProgressSteps
   *  VERTICAL (el rail lateral: el oj-sp-guided-process auténtico, con su columna de pasos a la
   *  derecha); STEPS manda uno HORIZONTAL, y eso es un tren de pasos ARRIBA (horizontal: true →
   *  oj-train sobre el contenido, y en pantallas estrechas la lista de pasos en vertical, que un
   *  tren de 4-5 rótulos no cabe en un móvil). */
  /** Id del paso virtual que el guided process enseña cuando el wizard ya terminó. */
  const WIZARD_DONE_STEP = '_completed'

  function wizardOf(ctx) {
    const node = ctx && ctx.tree ? findByType(ctx.tree, 'ProgressSteps') : null
    if (!node) return null
    const md = node.metadata
    const wire = md.steps || []
    const current = wire.find((s) => s.status === 'current')
    const currentId = current ? current.id : (wire.length ? wire[wire.length - 1].id : null)
    const currentIndex = Math.max(0, wire.findIndex((s) => s.id === currentId))
    const statusOf = (s, i) => s.status || (i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming')
    // display:'on' OBLIGATORIO: el rail marca oj-disabled todo paso sin display='on'. El
    // status es el del TEMPLATE (success | error | none), no el de Mateu: un paso hecho es
    // 'success' — el overview pinta «Completado» al pie de su columna y el rail su marca
    const steps = wire.map((s, i) => ({
      id: s.id,
      label: s.title || s.id,
      title: s.title || s.id,
      display: 'on',
      status: statusOf(s, i) === 'done' ? 'success' : 'none',
    }))
    // RESULTADO: con todos los pasos hechos (el wire no trae el paso de resultado, que no es un
    // paso del proceso) el guided process se quedaba en el último paso — su título y su pie
    // Cancel/Done. Se añade un paso final «Completed», hecho y actual: el título dice que terminó y
    // el pie se oculta (completed → clase mateu-wizard-completed en la página)
    const completed = wire.length > 0 && wire.every((s, i) => statusOf(s, i) === 'done')
    if (completed) {
      steps.push({ id: WIZARD_DONE_STEP, label: 'Completed', title: 'Completed', display: 'on', status: 'success' })
    }
    const currentStep = completed ? WIZARD_DONE_STEP : currentId
    // el título del proceso (el h2 del wizard) y su subtítulo (@Subtitle): el overview del
    // guided process los pinta arriba a la izquierda, sobre las columnas de los pasos
    const heading = ctx.tree ? findFirst(ctx.tree, (n) => n.metadata && n.metadata.type === 'Text'
      && n.metadata.container === 'h2' && !!n.metadata.text) : null
    const subtitleNode = ctx.tree ? findFirst(ctx.tree, (n) => n.metadata && n.metadata.type === 'Text'
      && /(^|\s)mateu-wizard-subtitle(\s|$)/.test(n.cssClasses || '')) : null
    return {
      title: heading ? String(heading.metadata.text) : '',
      subtitle: subtitleNode ? String(subtitleNode.metadata.text || '') : '',
      // Start del overview: el primer paso; con el wizard ya empezado, «Reanudar» en el suyo
      resumeStepId: !completed && currentIndex > 0 && currentId ? currentId : '',
      steps,
      currentStep,
      completed,
      horizontal: !md.vertical,
      currentIndex: completed ? steps.length - 1 : currentIndex,
      currentLabel: steps.length ? steps[completed ? steps.length - 1 : currentIndex].label : '',
      total: steps.length,
      // el tren (oj-train): los hechos se pueden VISITAR (volver atrás), los que faltan no —
      // se avanza con el botón del paso, que valida
      trainSteps: wire.map((s, i) => {
        const status = statusOf(s, i)
        return {
          id: s.id,
          label: s.title || s.id,
          visited: status === 'done',
          disabled: status === 'upcoming',
        }
      }),
      // la misma lista, para la variante vertical (pantallas estrechas): número o ✓ + rótulo
      listSteps: wire.map((s, i) => {
        const status = statusOf(s, i)
        return {
          id: s.id,
          label: s.title || s.id,
          marker: status === 'done' ? '✓' : String(i + 1),
          cls: 'mateu-wizard-step mateu-wizard-step-' + status,
        }
      }),
    }
  }







  // Part of the Redwood core (reduceContexts.mjs re-exports every piece): single-component atom projections: matrix, map, action panel, grid tracks, avatar, metric, chart; the wizard step view.

  // ── MatrixGrid → oj-data-grid ────────────────────────────────────────────────────────────────
  // La matriz (filas × fechas, secciones plegables, celdas que enlazan y filas editables) la pinta
  // el oj-data-grid de JET sobre un RowDataGridProvider de un FlattenedTreeDataProviderView: las
  // secciones son nodos del árbol (el disclosure lo pinta JET), las columnas c0..cN. Aquí se arma
  // la especificación PURA (probada en Node); el provider lo crea la fábrica del bridge.
  let matrixProviderFactory = null
  function setMatrixProviderFactory(factory) { matrixProviderFactory = factory }

  const MATRIX_TONES = { info: 1, success: 1, warning: 1, danger: 1, neutral: 1 }
  const toneClass = (tone) => (tone && MATRIX_TONES[tone] ? 'mateu-matrix-' + tone : '')

  /** Clave del estado plegado de una sección (el mismo almacén que los paneles plegables). */
  const matrixSectionKey = (gridId, sectionId) => 'matrix:' + gridId + ':' + sectionId

  function matrixSpecOf(m, id) {
    const gridId = String(id || 'matrix').replace(/[^A-Za-z0-9_-]/g, '_')
    const columns = m.columns || []
    const columnKeys = columns.map((c, i) => 'c' + i)
    const cellsOf = (row, sectionId) => {
      const out = { id: sectionId + '/' + row.id, label: row.label || '', _rowId: row.id, _editable: !!row.editable,
        _emphasis: !!row.emphasis }
      columns.forEach((col, i) => {
        const cell = (row.cells || [])[i] || { value: '' }
        const cls = ['mateu-matrix-cell', toneClass(cell.tone) || toneClass(col.tone),
          row.emphasis ? 'mateu-matrix-emphasis' : '', cell.link && m.cellActionId ? 'mateu-matrix-link' : '',
          row.editable && m.editActionId ? 'mateu-matrix-editable' : ''].filter(Boolean).join(' ')
        out['c' + i] = { v: cell.value == null ? '' : String(cell.value), cls, link: !!(cell.link && m.cellActionId),
          editable: !!(row.editable && m.editActionId), rowId: row.id, columnId: col.id }
      })
      return out
    }
    const data = []
    const expanded = []
    for (const section of m.sections || []) {
      const rows = (section.rows || []).map((r) => cellsOf(r, section.id))
      if (section.title) {
        const key = '§' + section.id
        const blank = {}
        columnKeys.forEach((k) => { blank[k] = { v: '', cls: 'mateu-matrix-cell mateu-matrix-section-cell', link: false } })
        data.push({ id: key, label: section.title, _section: section.id, ...blank, children: rows })
        if (panelExpanded(matrixSectionKey(gridId, section.id), !section.collapsed)) expanded.push(key)
      } else {
        data.push(...rows)
      }
    }
    // cabeceras: si hay grupos (el mes), dos niveles — el grupo abarca sus columnas consecutivas
    const hasGroups = columns.some((c) => c.group)
    const columnHeaders = []
    if (!hasGroups) columns.forEach((c) => columnHeaders.push(c.label || c.id))
    else {
      for (const c of columns) {
        const last = columnHeaders[columnHeaders.length - 1]
        if (c.group && last && last.group === c.group) last.children.push({ data: c.label || c.id })
        else if (c.group) columnHeaders.push({ data: c.group, group: c.group, children: [{ data: c.label || c.id }] })
        else columnHeaders.push({ data: c.label || c.id, depth: 2 })
      }
    }
    return { gridId, data, expanded, columnKeys, columnHeaders: hasGroups ? columnHeaders.map(({ group, ...h }) => h) : columnHeaders,
      rowHeaderLabel: m.rowHeaderLabel || '' }
  }

  /** La altura que el wire pide para el mapa (su `style`), o 25rem como el <mateu-map> del web. */
  function mapHeightOf(style) {
    const m = /(?:^|;)\s*height\s*:\s*([^;]+)/i.exec(style || '')
    return m ? m[1].trim() : '25rem'
  }

  /** Map: JET no tiene mapa de calles (oj-thematic-map pide geografía GeoJSON), así que el átomo
   *  es un contenedor que installMaps (poc/map.mjs) llena con Leaflet y teselas de OpenStreetMap.
   *  La especificación viaja serializada en un data-attribute, como el HTML del texto enriquecido. */
  function mapAtomOf(m, id, style) {
    const markers = (m.markers || []).map((k) => ({
      id: k.id, latitude: k.latitude, longitude: k.longitude,
      label: k.label || '', description: k.description || '', color: k.color || '',
    }))
    return {
      isMap: true,
      mapId: 'mateuMap-' + (id || 'map'),
      mapSpec: JSON.stringify({
        position: m.position || '', zoom: m.zoom || '', markers, markerActionId: m.markerActionId || '',
        // el proveedor de teselas del wire ('' = OSM, ver tileLayerOf en map.mjs)
        tileUrl: m.tileUrl || '', attribution: m.attribution || '',
      }),
      mapStyle: { width: '100%', height: mapHeightOf(style) },
    }
  }

  function matrixAtomOf(m, id, interp = (x) => x) {
    const spec = matrixSpecOf({ ...m, rowHeaderLabel: interp(m.rowHeaderLabel || '') }, id)
    const rows = spec.data.reduce((n, r) => n + 1 + (r.children && spec.expanded.includes(r.id) ? r.children.length : 0), 0)
    return {
      isMatrix: true,
      gridId: 'mateuMatrix-' + spec.gridId,
      matrixId: spec.gridId,
      cellActionId: m.cellActionId || '',
      editActionId: m.editActionId || '',
      // alto a la medida (cabecera(s) + filas visibles), con techo: el grid hace scroll dentro
      // (un OBJETO: el :style de JET no acepta la cadena CSS)
      gridStyle: { width: '100%', height: Math.min(36, 3 + (spec.columnHeaders.some((h) => h && h.children) ? 2.25 : 0) + rows * 2.375) + 'rem' },
      provider: matrixProviderFactory ? matrixProviderFactory(spec) : null,
      // el tono va en la CELDA del grid (no en el texto): JET pide la clase por contexto
      cellClassName: (ctx) => {
        // en el callback de clase el valor viene en ctx.data.data (en la plantilla, en cell.item)
        const d = (ctx && ctx.data && ctx.data.data) || (ctx && ctx.item && ctx.item.data && ctx.item.data.data)
        return 'oj-helper-justify-content-right ' + ((d && d.cls) || '')
      },
      // qué celdas se editan lo decide JET (cell.editable): las demás quedan read-only nativas
      cellEditable: (ctx) => {
        const d = (ctx && ctx.data && ctx.data.data) || (ctx && ctx.item && ctx.item.data && ctx.item.data.data)
        return d && d.editable ? 'enable' : 'disable'
      },
      columnHeaderClassName: (ctx) => {
        const col = (m.columns || [])[ctx && ctx.index]
        return (ctx && ctx.level === 0 && (m.columns || []).some((c) => c.group)) ? '' : toneClass(col && col.tone)
      },
      spec,
    }
  }

  /** «ctrl+i» → «Ctrl+I», para el rótulo del disparador. */
  function shortcutHintOf(shortcut) {
    if (!shortcut) return ''
    return String(shortcut).split('+').map((k) => k.trim()).filter(Boolean)
      .map((k) => (k.length === 1 ? k.toUpperCase() : k.charAt(0).toUpperCase() + k.slice(1))).join('+')
  }

  /** PANEL DE ACCIONES por categorías («I want to…»): columnas por categoría, las acciones CON
   *  datos primero (y en negrita), hasta maxPerCategory visibles y el resto tras «Show more».
   *  Mostrar más / ocultar las vacías / abrir y cerrar es estado del DOM (installActionPanels):
   *  sin ida y vuelta al servidor y sin re-proyectar. */
  function actionPanelAtomOf(m, id, interp = (x) => x) {
    const max = m.maxPerCategory > 0 ? m.maxPerCategory : 10
    const panelId = 'mateuActionPanel-' + String(id || m.label || 'actions').replace(/[^A-Za-z0-9_-]/g, '_')
    const categories = (m.categories || []).map((c, ci) => {
      const actions = (c.actions || [])
        .map((a, i) => ({ a, i }))
        .sort((x, y) => (Number(!!y.a.populated) - Number(!!x.a.populated)) || (x.i - y.i))
        .map(({ a }, i) => ({
          label: interp(a.label || '') + (a.count > 0 ? ' (' + (a.count > 25 ? '25+' : a.count) + ')' : ''),
          actionId: a.actionId || '',
          parameters: a.parameters || {},
          disabled: !!a.disabled,
          itemClass: 'mateu-ap-item' + (a.populated ? ' mateu-ap-populated' : ' mateu-ap-unpopulated') + (i >= max ? ' mateu-ap-extra' : ''),
        }))
      const extra = Math.max(0, actions.length - max)
      // con «ocultar vacías» una columna sin acciones con datos sobra entera, y el «mostrar más»
      // también cuando lo que esconde son sólo vacías (los poblados van primero: si alguno queda
      // fuera del corte, todo lo que hay antes también es poblado)
      const populated = (c.actions || []).filter((a) => a.populated).length
      return {
        key: panelId + ':' + ci, title: interp(c.title || ''), actions, hasMore: extra > 0,
        moreLabel: 'Show more (' + extra + ')',
        columnClass: 'mateu-ap-column' + (populated ? '' : ' mateu-ap-column-unpopulated'),
        moreClass: 'mateu-ap-more' + (populated > max ? '' : ' mateu-ap-unpopulated'),
      }
    }).filter((c) => c.actions.length)
    return {
      isActionPanel: true,
      panelId,
      label: interp(m.label || 'I want to…'),
      shortcut: String(m.shortcut || '').toLowerCase(),
      title: interp(m.label || 'I want to…') + (m.shortcut ? '  (' + shortcutHintOf(m.shortcut) + ')' : ''),
      hideToggle: !!m.hideUnpopulatedToggle,
      categories,
    }
  }

  /** Las pistas de un grid-template-columns como PESOS: repeat(N, x) se expande, «Nfr», «N%» y
   *  minmax(…, Nfr) pesan N, lo demás (px, rem, auto, min-content…) pesa 1 — una aproximación: el
   *  flex de JET reparte en doceavos, no en pistas. */
  function gridTrackWeights(template) {
    const src = String(template || '').trim()
    if (!src) return []
    // trocea por espacios de primer nivel (no dentro de paréntesis)
    const tokens = []
    let depth = 0, cur = ''
    for (const ch of src) {
      if (ch === '(') depth++
      if (ch === ')') depth--
      if (/\s/.test(ch) && depth === 0) { if (cur) tokens.push(cur); cur = '' } else cur += ch
    }
    if (cur) tokens.push(cur)
    const weightOf = (tok) => {
      const fr = /(\d*\.?\d+)(fr|%)\)?$/.exec(tok)
      return fr ? Number(fr[1]) : 1
    }
    const out = []
    for (const tok of tokens) {
      const rep = /^repeat\(\s*(\d+)\s*,\s*(.+)\)$/.exec(tok)
      if (rep) {
        const inner = gridTrackWeights(rep[2])
        for (let i = 0; i < Number(rep[1]); i++) out.push(...inner)
      } else if (/^repeat\(/.test(tok)) return [] // auto-fill/auto-fit: lo decide el ancho, no se sabe aquí
      else out.push(weightOf(tok))
    }
    return out
  }

  /** Clase oj-flex de cada hijo de una rejilla (auto-colocación CSS: en orden, saltando de fila
   *  cuando el span no cabe). null si la rejilla es de una pista (o no se sabe): se apila. */
  function gridColClasses(template, colSpans, count) {
    const weights = gridTrackWeights(template)
    if (weights.length < 2) return null
    const total = weights.reduce((a, b) => a + b, 0)
    const classes = []
    let cursor = 0
    for (let i = 0; i < count; i++) {
      const span = Math.max(1, Math.min(weights.length, (colSpans && colSpans[i]) || 1))
      if (cursor + span > weights.length) cursor = 0
      const share = weights.slice(cursor, cursor + span).reduce((a, b) => a + b, 0) / total
      const twelfths = Math.max(1, Math.min(12, Math.round(12 * share)))
      classes.push('oj-flex-item oj-sm-12 oj-md-' + twelfths + (twelfths < 12 ? ' oj-sm-padding-2x-end' : ''))
      cursor = (cursor + span) % weights.length
    }
    return classes
  }

  /** El tipo MIME de un tipo de arrastre: así el destino sabe, mientras se arrastra (cuando aún no
   *  puede leer los datos), si lo que viene es suyo. */
  const dragMimeOf = (type) => (type ? 'application/x-mateu-' + String(type).toLowerCase().replace(/[^a-z0-9.+-]/g, '-') : '')

  /** Un Avatar del wire → lo que pinta oj-avatar: iniciales (las dadas o las del nombre) e imagen. */
  function avatarOf(m) {
    const name = String((m && m.name) || '')
    const initials = (m && m.abbreviation) || name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
    return { name, initials, src: m && m.image ? elementModuleUrl(m.image) : '' }
  }

  /** Texto enriquecido (richText/html/markdown) de un campo o componente → su HTML saneado. */
  const RICH_TEXT_STEREOTYPES = { richText: true, html: true, markdown: true }
  function richHtmlOf(kind, value) {
    const text = value == null ? '' : String(value)
    return kind === 'markdown' ? markdownToHtml(text) : sanitizeHtml(text)
  }

  /** «colSpan de N columnas» → la clase oj-flex del bloque (doceavos, nunca más de 12). */
  function panelColClass(colSpan, columns) {
    const span = Math.max(1, Math.min(columns, colSpan > 0 ? colSpan : 1))
    const twelfths = Math.max(1, Math.min(12, Math.round((12 * span) / columns)))
    return 'oj-flex-item oj-sm-12 oj-md-' + twelfths + ' oj-sm-padding-2x-end'
  }

  const TREND_TEXT = { up: '▲', down: '▼', neutral: '■' }
  /** Un MetricCard (KPI) listo para la plantilla: valor grande, tendencia con color, y si lleva
   *  actionId, un botón que lanza la acción (p.ej. la búsqueda filtrada que lo explica). */
  function metricOf(m, interp = (x) => x) {
    const trend = m.trend || ''
    return {
      title: interp(m.title || ''),
      value: String(m.value == null ? '' : m.value),
      unit: m.unit || '',
      trendText: trend ? (TREND_TEXT[trend] || '') + (m.trendLabel ? ' ' + interp(m.trendLabel) : '') : (m.trendLabel ? interp(m.trendLabel) : ''),
      trendClass: 'oj-typography-body-sm ' + (trend === 'up' ? 'mateu-trend-up' : trend === 'down' ? 'mateu-trend-down' : 'oj-text-color-secondary'),
      description: interp(m.description || ''),
      actionId: m.actionId || '',
      parameters: {},
    }
  }

  // Chart.js (el vocabulario del wire) → oj-chart de JET
  const CHART_TYPES = {
    bar: { type: 'bar' }, line: { type: 'line' }, pie: { type: 'pie' }, doughnut: { type: 'pie', innerRadius: 0.55 },
    radar: { type: 'line', polar: true }, polarArea: { type: 'bar', polar: true },
    scatter: { type: 'line', markersOnly: true }, bubble: { type: 'line', markersOnly: true },
  }
  /** Un Chart (series × etiquetas) o un TrendChart (una serie) → átomo de oj-chart: los ITEMS
   *  precomputados ({series, group, value}); en una tarta cada etiqueta es una serie (una porción). */
  function chartAtomOf(m, t, interp = (x) => x) {
    const trend = t === 'TrendChart'
    const labels = (trend ? m.labels : m.chartData && m.chartData.labels) || []
    const datasets = trend
      ? [{ label: m.title || '', data: m.values || [] }]
      : ((m.chartData && m.chartData.datasets) || [])
    const spec = trend ? { type: m.area ? 'area' : 'line' } : (CHART_TYPES[m.chartType] || CHART_TYPES.bar)
    const pie = spec.type === 'pie'
    const items = []
    datasets.forEach((d, si) => (d.data || []).forEach((value, i) => {
      const label = labels[i] != null ? String(labels[i]) : String(i + 1)
      items.push({
        _rowNumber: items.length,
        id: si + ':' + i,
        value: value == null ? null : Number(value),
        series: pie ? label : (d.label || 'Series ' + (si + 1)),
        group: pie ? (d.label || 'Total') : label,
      })
    }))
    return {
      isChart: true,
      title: trend ? interp(m.title || '') : '',
      chartType: spec.type,
      coordinateSystem: spec.polar ? 'polar' : 'cartesian',
      innerRadius: spec.innerRadius || 0,
      lineType: spec.markersOnly ? 'none' : 'auto',
      markerDisplayed: spec.markersOnly ? 'on' : 'auto',
      legend: datasets.length > 1 || pie ? 'on' : 'off',
      chartStyle: { width: '100%', height: pie ? '18rem' : '16rem' },
      items,
      provider: dataProviderFactory ? dataProviderFactory(items) : null,
    }
  }

  /** ¿Es un átomo RICO (display de verdad, no un campo suelto)? Cuando el contenido de una pantalla
   *  los trae, el formulario genérico sobra: sus campos ya se ven en ellos. */
  const RICH_ATOM_FLAGS = [
    'isEntityHeader', 'isTaskProgress', 'isMeter', 'isStatusList', 'isLedger', 'isPayment',
    'isResourceGrid', 'isAddOns', 'isStat', 'isNotice', 'isPropertyRow',
    // reto PMS: cualquier átomo NUEVO tiene que estar aquí — si no, en una página que también
    // lleva campos gana el formulario genérico (que solo pinta campos) y el átomo desaparece
    'isAnchor', 'isQueue', 'isPlanning', 'isCollapsible', 'isActionPanel', 'isMatrix', 'isChart', 'isScoreboard', 'isCalendar', 'isPopover', 'isDropZone', 'isGantt', 'isImage', 'isAvatar', 'isGallery', 'isRichText', 'isMap',
    // the display components of core/display.mjs
    'isKanban', 'isTimeline', 'isPricing', 'isOrgChart', 'isHeatmap', 'isFunnel', 'isFeatureGrid', 'isTestimonials',
    'isCallout', 'isComments', 'isFileList', 'isChecklist', 'isComparison', 'isProcessMonitor', 'isSkeleton', 'isIcon',
    'isTooltip', 'isContextMenu', 'isMenuBar', 'isDirectory', 'isMessages', 'isMessageInput', 'isChatComponent', 'isBpmn',
    'isWorkflow', 'isResult', 'isCookieConsent', 'isConfirmDialog', 'isBreadcrumbs', 'isStepHeader', 'isCarouselPager',
    'isHero', 'isEmptyStateAtom', 'isProgressBar', 'isCustomSlot',
  ]
  function isRichAtom(a) {
    return !!a && RICH_ATOM_FLAGS.some((flag) => a[flag])
  }

  /** ¿Es este bloque de botones el PIE del wizard (Back / Next / la acción de completar)? */
  function isWizardNavAtom(a) {
    return !!(a && a.isButtons && (a.buttons || []).some((b) => b.actionId === 'back' || b.actionId === 'next'))
  }

  /**
   * El PASO actual de un wizard, listo para pintar: { title, content, sections, nav }.
   *
   * - content: los bloques display del paso (hostContentOf en modo wizard, con la isla fusionada).
   * - sections: los campos del paso agrupados por @Section (formSectionsOf), o [] si el contenido
   *   es RICO (la misma regla que el host: el header/las property rows ya muestran esos datos).
   * - Cada campo UNA vez: los FormFields que el formulario pinta (con su widget de verdad: select,
   *   fecha…) salen del contenido, donde sólo serían un oj-input-text de texto — antes salían dos
   *   veces, arriba como texto y abajo con su desplegable. Los de una isla fusionada (fromNested)
   *   son de otro contexto y se quedan.
   * - En HORIZONTAL (tren arriba) el pie Back/Next del wire sale del contenido a `nav` (la barra
   *   del pie), y el título del wizard (su h2) sale a `title` si la página no trae otro.
   */
  function wizardStepViewOf(ctx, islandBlocks, opts = {}) {
    const wizard = wizardOf(ctx)
    if (!wizard) return null
    let content = hostContentOf(ctx, islandBlocks,
      { forWizard: true, keepWizardNav: wizard.horizontal, title: opts.title || '' }) || []
    let sections = opts.sections || []
    if (content.some((block) => (block.items || []).some(isRichAtom))) sections = []
    const onForm = new Set()
    for (const section of sections) for (const f of section.fields || []) onForm.add(f.fieldId)
    let title = opts.title || ''
    let nav = []
    let subtitleDropped = false
    content = content.map((block) => {
      let movedToForm = 0
      const items = block.items.map((a) => {
        if (!a.isFormLayout || a.fromNested) return a
        const kept = a.fields.filter((f) => !onForm.has(f.fieldId))
        movedToForm += a.fields.length - kept.length
        return kept.length === a.fields.length ? a : { ...a, fields: kept }
      }).filter((a) => {
        if (a.isFormLayout && !a.fields.length) return false
        if (a.isInput && !a.fromNested && onForm.has(a.fieldId)) { movedToForm++; return false }
        // el título del wizard (su h2) va a la cabecera — el h1 sobre el tren, o el título del
        // proceso del guided process —, y su subtítulo con él: ninguno se repite en el paso
        if (a.isText && a.isH2 && (!title || a.text === title || a.text === wizard.title)) {
          if (!title) title = a.text
          return false
        }
        if (!subtitleDropped && wizard.subtitle && a.isText && !a.isHeading && a.text === wizard.subtitle) {
          subtitleDropped = true
          return false
        }
        if (wizard.horizontal && isWizardNavAtom(a)) { nav = a.buttons; return false }
        return true
      })
      // una tarjeta de @Section cuyos campos se fueron al form se queda en su título: el form
      // ya pinta esa sección con su encabezado — fuera la tarjeta vacía
      const onlyHeadings = items.every((a) => a.isText && a.isHeading)
      return { ...block, items: movedToForm && onlyHeadings ? [] : items }
    }).filter((block) => block.items.length)
    // el rótulo del paso ya lo pinta la cabecera del paso (el h2 bajo el tren, o el título del
    // paso del guided process): una @Section que se llama igual que su paso no lo repite
    const stepLabel = wizard.currentLabel
    sections = sections.map((section) => (
      stepLabel && section.title && section.title.trim() === stepLabel.trim()
        ? { ...section, title: '', hasTitle: false }
        : section))
    // la acción de AVANCE (Next, o la de completar) es la llamada a la acción del pie
    nav = nav.map((b) => ({
      ...b,
      chroming: b.actionId === 'back' ? 'outlined' : 'callToAction',
    }))
    return { wizard, title: title || wizard.title, subtitle: wizard.subtitle, content, sections, nav }
  }






  // Part of the Redwood core (reduceContexts.mjs re-exports every piece): welcome, general/item overview, content tab strips, banners, page style.

  /** Helper de RENDER: todos los nodos de un tipo (sin cruzar fronteras de isla). */
  function findAllByType(tree, type) {
    const out = []
    const walk = (n, isRoot) => {
      if (!n || typeof n !== 'object') return
      if (!isRoot && n.type === 'ServerSide') return
      if (n.metadata && n.metadata.type === type) out.push(n)
      for (const v of Object.values(n)) {
        if (Array.isArray(v)) v.forEach((x) => walk(x, false))
        else if (v && typeof v === 'object') walk(v, false)
      }
    }
    walk(tree, true)
    return out
  }

  /** The Text components under `node`, as {text, nodeId} — the node id only in editor mode. */
  function textNodesOf(node, out = []) {
    if (!node || typeof node !== 'object') return out
    if (node.metadata && node.metadata.type === 'Text' && node.metadata.text != null) {
      out.push(editorNodeIds && node.id ? { text: node.metadata.text, nodeId: String(node.id) } : { text: node.metadata.text })
    }
    for (const v of Object.values(node)) {
      if (Array.isArray(v)) v.forEach((x) => textNodesOf(x, out))
      else if (v && typeof v === 'object') textNodesOf(v, out)
    }
    return out
  }

  /** Card → {title, texts} (el título del Card es un componente Text anidado). */
  function cardOf(node) {
    const md = (node && node.metadata) || {}
    return { title: collectTexts(md.title)[0] || '', texts: collectTexts(md.content) }
  }

  /** Arquetipo WELCOME: hero (título/subtítulo + CTAs) + tiles del DashboardLayout. */
  /** Los pares color + ilustración del hero de la welcome: las 5 parejas bg+fg de la galería OFICIAL
   *  (fnd/gallery illust-welcome-banner-*-01..05), cada una con su tono de la paleta oscura RDS. */
  const WELCOME_LOOKS = [
    ['dark-ocean', '01'], ['dark-pine', '02'], ['dark-plum', '03'],
    ['dark-sienna', '04'], ['dark-teal', '05'],
  ]
  const WELCOME_GALLERY = 'https://static.oracle.com/cdn/fnd/gallery/2307.0.2/images/'

  /** Qué welcome es la que se pinta: su clase de servidor (o, sin ella, el id del árbol). */
  function welcomeKeyOf(ctx) {
    const tree = ctx && ctx.tree
    return tree ? (tree.serverSideType || tree.id || '') : ''
  }

  /**
   * El aspecto del hero: uno al azar al ENTRAR en una welcome, y el mismo mientras se siga en ella.
   *
   * Rotaba en cada proyección, y una welcome se reproyecta con la respuesta de cada acción que se
   * lanza desde ella — también la de un CTA que devuelve una ruta ("Ir a Reservas"): el hero cambiaba
   * de color justo antes de navegar, durante todo lo que tardara en llegar la página siguiente.
   * Ahora sólo rota en una visita nueva: no había welcome pintada (`previous` nulo) o era otra.
   *
   * @param key       welcomeKeyOf del contexto que se proyecta
   * @param previous  el aspecto pintado ({key, theme, illuBg, illu}) si ya había una welcome, o null
   */
  /** HeroSection.tone (the server's HeroTone) → the banner's background-color. oj-sp's welcome banner
   *  ships a dark-* tone for each of the nine (dark-ocean … dark-sienna); the five that have an
   *  illustration pair in the gallery keep it, the other four go without one. */
  const WELCOME_TONES = ['ocean', 'pine', 'lilac', 'teal', 'rose', 'pebble', 'slate', 'plum', 'sienna']
  function welcomeToneLookOf(key, tone) {
    const t = String(tone || '').toLowerCase()
    if (WELCOME_TONES.indexOf(t) < 0) return null
    const theme = 'dark-' + t
    const pair = WELCOME_LOOKS.find(([th]) => th === theme)
    return {
      key,
      tone: t,
      theme,
      illuBg: pair ? WELCOME_GALLERY + 'illust-welcome-banner-bg-' + pair[1] + '.png' : '',
      illu: pair ? WELCOME_GALLERY + 'illust-welcome-banner-fg-' + pair[1] + '.png' : '',
    }
  }

  function welcomeLookOf(key, previous, random = Math.random, tone = null) {
    // a DECLARED tone (Welcome.heroTone / @WelcomeBanner(tone)) wins over the rotation, every time
    const toned = welcomeToneLookOf(key, tone)
    if (toned) return toned
    if (previous && previous.theme && previous.key === key) return previous
    const [theme, n] = WELCOME_LOOKS[Math.floor(random() * WELCOME_LOOKS.length) % WELCOME_LOOKS.length]
    return {
      key,
      theme,
      illuBg: WELCOME_GALLERY + 'illust-welcome-banner-bg-' + n + '.png',
      illu: WELCOME_GALLERY + 'illust-welcome-banner-fg-' + n + '.png',
    }
  }

  function welcomeOf(ctx) {
    const hero = ctx && ctx.tree ? findByType(ctx.tree, 'HeroSection') : null
    if (!hero) return null
    const md = hero.metadata
    const ctas = actionsOf(hero)
    const panels = findAllByType(ctx.tree, 'DashboardPanel')
    // un TrendChart en un tile → CHART a todo el ancho bajo los KPIs (oj-chart en VB);
    // items PRECOMPUTADOS (id/value/group/series) — el CSP de VB no construye arrays
    const trendPanel = panels.find(
      (panel) => findByType(panel, 'TrendChart') || findByType(panel, 'Chart'))
    const chartNode = trendPanel
      ? findByType(trendPanel, 'TrendChart') || findByType(trendPanel, 'Chart') : null
    const tm = chartNode ? chartNode.metadata : null
    // valores/labels de las dos formas del wire: TrendChart (values/labels planos) o
    // Chart (chartData.labels + datasets[0].data — se toma la primera serie)
    const dataset = tm && tm.chartData && tm.chartData.datasets && tm.chartData.datasets.length
      ? tm.chartData.datasets[0] : null
    const values = tm ? (tm.values || (dataset ? dataset.data : []) || []) : []
    const labels = tm ? (tm.labels || (tm.chartData ? tm.chartData.labels : []) || []) : []
    const series = (dataset && dataset.label) || chromeText('occupancy')
    const trend = tm
      ? {
          title: trendPanel.metadata.title || tm.title || '',
          items: (values || []).map((value, i) => ({
            id: i,
            value,
            group: [labels[i] != null ? labels[i] : String(i + 1)],
            series,
          })),
        }
      : null
    const tiles = panels.filter((panel) => panel !== trendPanel).map((panel) => {
      // un MetricCard dentro del tile → KPI (valor grande + etiqueta + caption)
      const metric = findByType(panel, 'MetricCard') || findByType(panel, 'Stat')
      const mm = metric ? metric.metadata : null
      return {
        ...(editorNodeIds && panel.id ? { nodeId: String(panel.id) } : {}),
        title: panel.metadata.title || '',
        texts: collectTexts(panel),
        textNodes: textNodesOf(panel),
        isKpi: !!mm,
        kpiTitle: mm ? (mm.title || mm.label || '') : '',
        kpiValue: mm ? String(mm.value == null ? '' : mm.value) : '',
        kpiCaption: mm ? (mm.description || mm.caption || '') : '',
        kpiActionId: mm ? (mm.actionId || '') : '',
      }
    })
    return {
      // editor mode: the banner is the hero's node, its CTAs (painted inside the banner, in order)
      // their Buttons' — the page binds both onto the banner (data-node-id / data-node-buttons)
      nodeId: editorNodeIds && hero.id ? String(hero.id) : '',
      ctaNodeIds: editorNodeIds ? ctas.slice(0, 2).map((c) => c.nodeId || '').join(' ') : '',
      // …and the band of tiles is the DashboardLayout's
      tilesNodeId: editorNodeIds ? String((findByType(ctx.tree, 'DashboardLayout') || {}).id || '') : '',
      trend,
      // HeroSectionDto.tone: null = the rotating look (welcomeLookOf)
      tone: md.tone || null,
      title: md.title || '',
      subtitle: md.subtitle || '',
      ctas,
      primaryCta: ctas.length ? { label: ctas[0].label } : { label: '' },
      primaryCtaId: ctas.length ? ctas[0].actionId : '',
      secondaryCta: ctas.length > 1 ? { label: ctas[1].label } : null,
      secondaryCtaId: ctas.length > 1 ? ctas[1].actionId : '',
      tiles,
    }
  }

  /** The first child slotted `slot` of a ResponsiveGrid in the tree, and whether it leads its
   *  siblings: { node, first } or null. */
  function findFirstSlotted(tree, slot) {
    let found = null
    const walk = (n) => {
      if (found || !n || typeof n !== 'object') return
      if (Array.isArray(n)) { n.forEach(walk); return }
      if (n.metadata && n.metadata.type === 'ResponsiveGrid') {
        const kids = n.children || []
        const i = kids.findIndex((k) => k && k.slot === slot)
        if (i >= 0) { found = { node: kids[i], first: i === 0 }; return }
      }
      for (const v of Object.values(n)) if (v && typeof v === 'object') walk(v)
    }
    walk(tree)
    return found
  }

  /** The overview's `info` slot as a card: a Card brings its title and content, anything else is
   *  the content itself. */
  function overviewInfoCardOf(ctx, node) {
    const isCard = !!(node && node.metadata && node.metadata.type === 'Card')
    const content = isCard ? (node.metadata.content || []) : [node]
    const blocks = islandContentOf({ ...ctx, kind: 'island', tree: { type: 'ClientSide', id: '_overviewInfo', metadata: { type: 'VerticalLayout' },
      children: Array.isArray(content) ? content : [content] } }) || []
    return {
      title: isCard ? cardOf(node).title : '',
      texts: [],
      items: blocks.flatMap((b) => b.items || []),
      isInfo: true,
      colClass: 'oj-flex-item oj-sm-12 oj-md-4',
    }
  }

  /** Arquetipo GENERAL OVERVIEW: switcher de registro + EntityHeader + cards. */
  function generalOverviewOf(ctx) {
    const header = ctx && ctx.tree ? findByType(ctx.tree, 'EntityHeader') : null
    if (!header) return null
    const md = header.metadata
    const switcher = collectFields(ctx.tree).find((f) => f.options && f.options.length)
    // el arquetipo REQUIERE el switcher de registro: un EntityHeader suelto (p.ej. el 360
    // de en casa o el folio de check-out como página) NO es un General Overview
    if (!switcher) return null
    const state = ctx.state || {}
    const badgeText = (md.badges || []).map((b) => b.label).join(' · ')
    const facts = (md.facts || []).map((f) => ({ label: f.label, value: f.value }))
    if (md.metricLabel) facts.push({ label: md.metricLabel, value: md.metricValue })
    // the GeneralOverview `info` slot (GeneralOverview.info(): a child slotted `info` of the
    // ResponsiveGrid `general-overview`): drawn as its own, narrower card — untitled, it was taken for
    // a structural wrapper and dropped. First when it travels first (promoteInfoSlot).
    const infoNode = findFirstSlotted(ctx.tree, 'info')
    const infoCard = infoNode ? overviewInfoCardOf(ctx, infoNode.node) : null
    const cards = findAllByType(ctx.tree, 'Card')
      .filter((node) => !infoNode || node !== infoNode.node)
      .map((node) => {
        const card = cardOf(node)
        // el contenido de la tarjeta como ÁTOMOS (no sólo sus textos): una StatusList, una tabla…
        // se pintaban vacías porque sólo se recogía el texto
        const content = (node.metadata && node.metadata.content) || []
        const blocks = islandContentOf({ ...ctx, tree: { type: 'ClientSide', id: '_overviewCard', metadata: { type: 'VerticalLayout' },
          children: Array.isArray(content) ? content : [content] } }) || []
        return { ...card, items: blocks.flatMap((b) => b.items || []) }
      })
      .filter((card) => card.title) // los Card sin título son wrappers de sección/estructura
    if (infoCard) {
      // a side column next to other cards; alone, as wide as a card
      if (!cards.length) infoCard.colClass = 'oj-flex-item oj-sm-12 oj-md-6'
      if (infoNode.first) cards.unshift(infoCard)
      else cards.push(infoCard)
    }
    return {
      title: md.title || '',
      subtitle: (md.subtitle || '') + (badgeText ? ' · ' + badgeText : ''),
      facts,
      switcherField: switcher ? switcher.fieldId : '',
      switcherOptions: switcher
        ? switcher.options.map((o) => ({ value: o.value, label: o.label }))
        : [],
      switcherValue: switcher ? state[switcher.fieldId] : null,
      cards,
    }
  }

  /** Clave de una barra de pestañas del contenido: '' para la primera de primer nivel (la de
   *  siempre, así una página con una sola barra no cambia); dentro de una pestaña, el id de esa
   *  pestaña; las hermanas siguientes llevan '/tabs-N'. */
  function tabStripKeyOf(scope, ordinal) {
    return [scope || '', ordinal ? 'tabs-' + ordinal : ''].filter(Boolean).join('/')
  }

  /** Id de la pestaña i de una barra: 'tab-i' en la de primer nivel, '<clave>/tab-i' en el resto. */
  function tabIdOf(stripKey, index) {
    return (stripKey ? stripKey + '/' : '') + 'tab-' + index
  }

  /** La barra a la que pertenece una pestaña (inversa de tabIdOf). */
  function tabStripOf(tabId) {
    const s = String(tabId || '')
    const cut = s.lastIndexOf('/')
    return cut < 0 ? '' : s.slice(0, cut)
  }

  /** Anota la pestaña elegida en el mapa de activas (una por barra), sin tocar las demás barras. */
  function withActiveTab(activeTabs, tabId) {
    return { ...(activeTabs || {}), [tabStripOf(tabId)]: tabId }
  }

  /** Ids de las barras de pestañas (átomos isTabs) de unos bloques: las chains las refrescan. */
  function tabBarIdsOf(blocks) {
    const ids = []
    const walk = (items) => (items || []).forEach((a) => {
      if (a && a.isTabs && a.barId) ids.push(a.barId)
      if (a && a.items) walk(a.items)
    })
    ;(blocks || []).forEach((b) => walk(b.items))
    return ids
  }

  /** Arquetipo ITEM OVERVIEW: panel de datos clave + tabs. */
  function itemOverviewOf(ctx) {
    const tabLayout = ctx && ctx.tree ? findByType(ctx.tree, 'TabLayout') : null
    if (!tabLayout) return null
    const keyCard = findAllByType(ctx.tree, 'Card').find((card) => !findByType(card, 'TabLayout'))
    // El arquetipo es panel de datos clave + pestañas: sin panel esto no es un item overview,
    // es un FORMULARIO que resulta que lleva pestañas dentro. Reclamarlo igual dejaba la página
    // sin sus campos (no hay tarjeta clave que pintar) y las pestañas reducidas a sus rótulos
    // (de su contenido solo se sacan textos sueltos). Le pasaba al detalle de un proceso.
    if (!keyCard) return null
    // solo las pestañas de la barra EXTERIOR: las de una barra anidada son contenido de su
    // pestaña (sus textos van en los de ella), no hermanas de la lista
    // el contenido como ÁTOMOS (un Markdown, un Chart, una StatusList…): antes solo sus textos sueltos
    const atomsOfNodes = (nodes) => (islandContentOf({ ...ctx, tree: { type: 'ClientSide', id: '_itemOverview',
      metadata: { type: 'VerticalLayout' }, children: nodes } }) || []).flatMap((b) => b.items || [])
    const tabs = (tabLayout.children || []).filter((c) => c.metadata && c.metadata.type === 'Tab').map((tab, i) => ({
      id: 'itab-' + i,
      ...(editorNodeIds && tab.id ? { nodeId: String(tab.id) } : {}),
      label: tab.metadata.label || tab.metadata.caption || 'Tab ' + (i + 1),
      texts: collectTexts(tab),
      items: atomsOfNodes(tab.children || []),
    }))
    const keyContent = keyCard ? ((keyCard.metadata && keyCard.metadata.content) || []) : []
    return {
      key: keyCard ? { ...cardOf(keyCard), items: atomsOfNodes(Array.isArray(keyContent) ? keyContent : [keyContent]) } : { title: '', texts: [], items: [] },
      tabs,
      // editor mode: the key panel is its Card's node, the tab bar its TabLayout's (bound by the page)
      keyNodeId: editorNodeIds && keyCard && keyCard.id ? String(keyCard.id) : '',
      tabsNodeId: editorNodeIds && tabLayout.id ? String(tabLayout.id) : '',
    }
  }

  /** Puerta 1.3: banners de página (Page.metadata.banners) → items del
   *  oj-sp-messages-banner del starter (MessagesBannerType). */
  function bannersOf(ctx) {
    const page = ctx && ctx.tree ? findByType(ctx.tree, 'Page') : null
    // los messageType del oj-sp-messages-banner van con prefijo general-* (patrón del starter)
    const THEMES = { INFO: 'general-info', SUCCESS: 'general-success', WARNING: 'general-warning', DANGER: 'general-error' }
    return (((page || {}).metadata || {}).banners || []).map((banner, i) => ({
      id: 'mateu-banner-' + i,
      messageType: THEMES[banner.theme] || 'general-info',
      primaryText: banner.title || '',
      secondaryText: banner.description || '',
    }))
  }

  /** Puerta 1.6: anatomía RDS del ancho de página (medición Toolkit 24C) — el wrapper del
   *  contenido aplica contexts[host].pageWidth: fixed = tope 1408px con gutters 24px;
   *  fullWidth = fluido con gutters 24px; edgeToEdge = 0 márgenes. En FIXED el borde
   *  DERECHO se ancla a la MISMA fórmula con la que oj-sp-simple-ui-shell coloca su
   *  chrome flotante (chat FAB: right = (100vw - 1536px)/2, medido) — el shell calcula
   *  su caja sobre el viewport COMPLETO e ignora el navigator drawer, así que centrar
   *  el contenido en el área restante lo desalineaba del FAB en viewports anchos;
   *  izquierda auto (absorbe el drawer), tope 1408. */
  function pageStyleOf(ctx) {
    const width = (ctx && ctx.pageWidth) || 'fixed'
    if (width === 'edgeToEdge') return { maxWidth: 'none', margin: '0', padding: '0' }
    if (width === 'fullWidth') return { maxWidth: 'none', margin: '0', padding: '24px' }
    return {
      maxWidth: '1408px',
      margin: '0 max(24px, calc((100vw - 1536px) / 2 + 64px)) 0 auto',
      padding: '24px',
    }
  }



  // Part of the Redwood core (reduceContexts.mjs re-exports every piece): the shell: icons and the navigation menu.

  /** Proyección de NAVEGACIÓN de la shell: items de primer nivel + grupos con sus hijos.
   *  Los hijos de un grupo navegan por su ruta COMPUESTA (/gestion/person) con el serverSideType
   *  del app (como Vaadin); un RouteLink dentro de un grupo no resuelve así y se carga por su
   *  ruta TERMINAL (loadMenuRouteInto, en transport.mjs).
   *  Selectores de contexto y acciones de cabecera salen listos para bindings simples. */
  // Iconos de menú: el wire trae nombres NEUTRALES (convención Mateu: set de Vaadin,
  // p.ej. "vaadin:calendar-user") — cada renderer los traduce a su set; aquí, al icon
  // font Redwood (oj-ux-ico-*, clases del gallery bundle). Un valor que ya venga como
  // clase oj-ux pasa tal cual; sin traducción conocida → sin icono.
  const OJ_ICONS = {
    'vaadin:calendar-user': 'oj-ux-ico-calendar-contact',
    'vaadin:calendar': 'oj-ux-ico-calendar',
    'vaadin:tasks': 'oj-ux-ico-task',
    'vaadin:automation': 'oj-ux-ico-robot-action',
    'vaadin:cog': 'oj-ux-ico-settings',
    'vaadin:cogs': 'oj-ux-ico-settings',
    'vaadin:home': 'oj-ux-ico-home',
    'vaadin:user': 'oj-ux-ico-contact',
    'vaadin:users': 'oj-ux-ico-contact-group',
    'vaadin:bed': 'oj-ux-ico-bed',
    'vaadin:chart': 'oj-ux-ico-bar-chart',
    'vaadin:table': 'oj-ux-ico-table',
    'vaadin:money': 'oj-ux-ico-currency-money',
    'vaadin:barcode': 'oj-ux-ico-scan-barcode',
    'vaadin:pencil': 'oj-ux-ico-edit',
    'vaadin:ban': 'oj-ux-ico-do-not-enter',
    'vaadin:rotate-left': 'oj-ux-ico-undo',
    'vaadin:exchange': 'oj-ux-ico-exchange-h',
    'vaadin:wifi': 'oj-ux-ico-connection',
    'vaadin:key': 'oj-ux-ico-key',
    'vaadin:pen': 'oj-ux-ico-signature',
    'vaadin:credit-card': 'oj-ux-ico-bank-card',
    'vaadin:gift': 'oj-ux-ico-gift',
    'vaadin:cart': 'oj-ux-ico-cart',
    'vaadin:check': 'oj-ux-ico-check',
    'vaadin:clock': 'oj-ux-ico-clock',
    // la campana del badge de la bandeja (widget de cabecera)
    'vaadin:bell': 'oj-ux-ico-notification',
    'vaadin:bell-o': 'oj-ux-ico-notification',
    'vaadin:envelope': 'oj-ux-ico-email',
    'vaadin:sign-out': 'oj-ux-ico-logout',
    'vaadin:sign-in': 'oj-ux-ico-login',
    'vaadin:cloud': 'oj-ux-ico-cloud',
    'vaadin:trending-up': 'oj-ux-ico-trending-up',
    'vaadin:building': 'oj-ux-ico-building',
    'vaadin:refresh': 'oj-ux-ico-refresh',
    'vaadin:close-circle': 'oj-ux-ico-close-circle',
  }
  function ojIconOf(icon) {
    if (!icon) return undefined
    if (icon.indexOf('oj-ux-') === 0) return icon
    return OJ_ICONS[icon] || undefined
  }

  /** El icono genérico para un icono DECLARADO que no tiene traducción a Redwood. */
  const GENERIC_ICON = 'oj-ux-ico-arrow-circle-right'

  /**
   * Como ojIconOf, pero un icono declarado sin traducción cae en uno genérico: una entrada de menú
   * o un botón de sólo icono nunca se queda en blanco («Llegadas» con vaadin:sign-in salía sin
   * icono junto a sus hermanas). ojIconOf sigue estricto: el HTML de los widgets quita los que no
   * conoce y el FAB de Ask cae en su propio glifo.
   */
  function ojIconOrGenericOf(icon) {
    if (!icon) return undefined
    return ojIconOf(icon) || GENERIC_ICON
  }

  /**
   * Una opción de menú → nodo del árbol que pintan la barra y el navigator.
   *
   * RECURSIVO porque el menú lo es: una shell federada llega con tres niveles sin pedir permiso
   * (grupo de la shell → grupo del pod → sus pantallas), y aplanarlo no deja el tercer nivel feo,
   * lo deja INALCANZABLE — el grupo del pod se navega como si fuese pantalla y contesta vacío.
   *
   * `id` es la ruta con la que se navega: la TERMINAL para una hoja local (la compuesta,
   * /gestion/person, es un camino de menú y no una ruta que el backend resuelva) y la COMPUESTA
   * para una traída de otro pod (la marca es el baseUrl que le dejó expandRemoteMenus): allí es
   * justo al revés — es la que ese pod sirve, y recortarla la deja sin dueño.
   */
  /** The id prefix of a menu leaf that runs rules instead of navigating (RuleLink). */
  const MENU_RULE_PREFIX = '__menuRule:'

  /** A menu option's node id: its route, or — for a leaf carrying rules — a marked id. */
  function menuNodeIdOf(option, raw) {
    const r = raw != null ? raw : (option.route || option.path || '')
    return (option.rules || []).length ? MENU_RULE_PREFIX + (r || option.label || '') : r
  }

  function navNodeOf(option, parentRoute) {
    const raw = option.route || option.path || ''
    // la ruta COMPUESTA (/gestion/person), como en Vaadin: es un camino de menú que el backend
    // resuelve con el serverSideType del app (onMateuNavigate lo añade vía localMenuOptionOf).
    // Recortarla a la terminal (/person) sólo funcionaba si el campo @Menu se llamaba como la ruta
    // @UI de su clase; con `@Menu FloorPlan floorPlan` + @UI("/floor-plan") quedaba sin dueño.
    void parentRoute
    // a leaf that RUNS rules (RuleLink — e.g. a RunAction naming one of the shell's flows) does not
    // navigate: its id is marked so onMateuNavigate runs its rules instead (shellFlows.mjs)
    const id = menuNodeIdOf(option, raw)
    // una entrada OCULTA (@Menu @Hidden, visible:false) no se dibuja a ninguna profundidad: su ruta
    // sigue resolviendo (la registra el transporte), pero el menú no la enseña
    const children = (option.submenus || option.submenu || []).filter((child) => child.visible !== false)
    return {
      id,
      label: option.caption || option.label || id,
      icon: ojIconOrGenericOf(option.icon),
      // una sección remota cuyo pod no contestó: está, pero no se abre, y dice por qué
      disabled: !!option.unavailable,
      hint: option.unavailable ? (option.description || '') : '',
      hasChildren: children.length > 0,
      // el padre de un nieto es la ruta CRUDA del hijo, no su id ya recortado
      children: children.map((child) => navNodeOf(child, raw)),
      // MENÚ DE TARJETAS (@Menu(display = cards) en un grupo): en vez de un oj-menu, un oj-popup
      // con una rejilla de oj-action-card — título, descripción, icono/imagen y, si la entrada tiene
      // hijos, esos hijos como acciones de la tarjeta. Los ids del popup y de su lanzador van
      // precalculados (el CSP de VB no concatena en las plantillas).
      ...cardsOf(option, children, raw),
    }
  }

  function cardsOf(option, children, raw) {
    const isCards = option.display === 'cards' && children.length > 0
    if (!isCards) return { isCards: false, cards: [], popupId: '', anchorId: '' }
    const key = String(raw || option.label || 'cards').replace(/[^A-Za-z0-9_-]/g, '_')
    return {
      isCards: true,
      popupId: 'mateuCards_' + key,
      anchorId: 'mateuCardsBtn_' + key,
      cards: children.filter((c) => !c.separator).map((child) => {
        const node = navNodeOf(child, raw)
        return {
          id: node.id,
          label: node.label,
          description: child.description || '',
          // un icono declarado sin equivalente Redwood toma el genérico: las tarjetas quedan alineadas
          iconClass: child.icon ? ojIconOrGenericOf(child.icon) : '',
          image: child.image || '',
          hasImage: !!child.image,
          hasIcon: !child.image && !!child.icon,
          navigable: !node.hasChildren,
          actions: node.children.filter((a) => !a.hasChildren).map((a) => ({ id: a.id, label: a.label })),
        }
      }),
    }
  }

  function shellNavOf(reg) {
    const shell = reg.shell || {}
    const items = []
    const menuTree = []
    let hasGroups = false
    for (const option of shell.menu || []) {
      // una opción que viaja sin pintarse (remota oculta): expandRemoteMenus ya la quita, pero un
      // menú que no pase por ahí tampoco debe dibujarla
      if (option.visible === false) continue
      const node = navNodeOf(option, '')
      items.push(node.disabled
        ? { id: node.id, label: node.label, icon: node.icon, disabled: true }
        : { id: node.id, label: node.label, icon: node.icon })
      if (node.hasChildren) hasGroups = true
      // las rutas que cubre la sección: con ellas se marca la que está en pantalla (activeSectionOf)
      node.routes = sectionRoutes(option, node)
      // HAMBURGER_SECTIONS: adónde lleva elegir la sección en la hamburguesa (su primera pantalla)
      node.home = sectionHomeOf(node)
      menuTree.push(node)
    }
    // la VARIANTE del wire manda: TABS → in-app navigation; HAMBURGUER_MENU/TILES →
    // hamburguesa que abre un DRAWER izquierdo con oj-navigation-list (como el navigator
    // FA); MENU_ON_TOP → SUBCABECERA: una banda clara bajo la cabecera oscura con el título de la
    // consola y las opciones de primer nivel (dropdown oj-menu para los grupos), como la banda 2
    // del renderer web; TABS con grupos (no caben en la barra inferior) → esas mismas opciones
    // dentro de la cabecera oscura (topbar)
    // HAMBURGER_SECTIONS (Opera Cloud) → SECCIONES: la hamburguesa abre un drawer con el primer
    // nivel (sólo las secciones) y la subcabecera lleva el segundo nivel de la sección en pantalla.
    // HAMBURGER_MENU es la grafía correcta de HAMBURGUER_MENU (el servidor manda la vieja; una
    // definición que llegue sin pasar por él puede traer la nueva).
    let mode = 'tabs'
    if (shell.variant === 'HAMBURGUER_MENU' || shell.variant === 'HAMBURGER_MENU' || shell.variant === 'TILES') mode = 'drawer'
    else if (shell.variant === 'HAMBURGER_SECTIONS') mode = 'sections'
    else if (shell.variant === 'MENU_ON_TOP') mode = 'subheader'
    else if (hasGroups) mode = 'topbar'
    return {
      mode,
      title: shell.title || '',
      items,
      menuTree,
      // la lista de la hamburguesa en modo secciones: cada sección, sin lo que cuelga de ella; su id
      // es su home (lo que navega al elegirla) y `section` el de la sección (lo que se marca)
      sections: menuTree.map((node) => ({
        id: node.home || node.id,
        section: node.id,
        label: node.label,
        icon: node.icon,
        disabled: node.disabled || !node.home,
        hint: node.hint,
        hasChildren: false,
        children: [],
      })),
      selectors: (shell.appContext || []).map((selector) => ({
        fieldName: selector.fieldName,
        label: selector.label || selector.fieldName,
        options: (selector.options || []).map((o) => ({ value: o.value, label: o.label || String(o.value) })),
      })),
      headerActions: (shell.headerActions || []).map((a) => ({
        actionId: a.actionId,
        label: a.label,
        hasChildren: !!(a.children && a.children.length),
        children: (a.children || []).map((c) => ({ actionId: c.actionId, label: c.label })),
      })),
      serverSideType: shell.serverSideType,
      // sin home declarada (centinela del servidor) → la primera pantalla del menú EN PROFUNDIDAD:
      // con secciones (HAMBURGER_SECTIONS) el primer nivel son grupos y la home de la sección es su
      // primera entrada; el centinela se cargaba tal cual y la app arrancaba en «Not found.»
      homeRoute: isSentinelHome(shell.homeRoute)
        ? ((menuTree.find((node) => node.home) || {}).home || '')
        : shell.homeRoute,
    }
  }
















  // Part of the Redwood core (reduceContexts.mjs re-exports every piece): the content visitor (islandContentOf → blocks of atoms), host content, subresources.

  /** Colores de Chip del wire → clases badge de JET (sistema, Redwood). PRECOMPUTADO (CSP). */
  const BADGE_CLASSES = {
    error: 'oj-badge oj-badge-danger oj-badge-subtle',
    danger: 'oj-badge oj-badge-danger oj-badge-subtle',
    warning: 'oj-badge oj-badge-warning oj-badge-subtle',
    success: 'oj-badge oj-badge-success oj-badge-subtle',
    contrast: 'oj-badge oj-badge-neutral oj-badge-subtle',
    // the plain chip — Vaadin paints it in the primary tone; entityHeaderOf already reads it as info
    normal: 'oj-badge oj-badge-info oj-badge-subtle',
    info: 'oj-badge oj-badge-info oj-badge-subtle',
  }

  /** Proyección del TaskQueue (cola de trabajo del front-office): grupos de cards con
   *  badges; el clic despacha metadata.actionId con parameters._item = id del item
   *  (contrato del renderer web compartido: mateu-task-queue.ts). Los datos viajan
   *  INLINE en la metadata — no hay eje data ni triggers. */
  function taskQueueOf(tree) {
    // una cola DENTRO de un panel de consola es la lista de esa consola (átomo isQueue del
    // dispatcher), no el modo «cola de trabajo + isla» de página completa
    const node = findOutsidePanes(tree, 'TaskQueue')
    // …ni la lista de un template con huecos (CollectionDetail: TaskQueue@list junto a su @detail):
    // es contenido, y el detalle que llega al elegir se pinta a su lado
    if (!node || node.slot) return null
    return queueProjectionOf(node.metadata)
  }

  /** Los grupos de tarjetas de una TaskQueue, listos para pintar (modo página y átomo isQueue). */
  function queueProjectionOf(md) {
    return {
      actionId: md.actionId,
      groups: (md.groups || []).map((group) => ({
        label: group.label,
        items: (group.items || []).map((item) => ({
          id: item.id,
          title: item.title,
          caption: item.caption || '',
          selected: !!item.selected,
          cardClass: item.selected ? 'oj-sm-margin-2x-bottom oj-bg-neutral-20' : 'oj-sm-margin-2x-bottom',
          badges: (item.badges || []).map((badge) => ({
            label: badge.label,
            badgeClass: BADGE_CLASSES[badge.color] || 'oj-badge oj-badge-neutral oj-badge-subtle',
          })),
          // opción de LÍNEA (p.ej. "Check-out" solo en reservas in house): botón en la card
          // que despacha su propio actionId con {_item} — mismo contrato que el renderer web
          hasAction: !!(item.actionLabel && item.actionId),
          actionLabel: item.actionLabel || '',
          actionId: item.actionId || '',
          parameters: { _item: item.id },
        })),
      })),
    }
  }

  /** Proyección del EmptyState suelto (placeholder del panel de detalle, o página de
   *  bienvenida). Tras seleccionar un item el server lo sustituye por la isla → null. */
  /** The PAGE's empty state: the first EmptyState that is not in a slot of a template (a slotted
   *  one — the @detail placeholder of a CollectionDetail — is content). */
  const pageEmptyStateNode = (tree) => {
    // a listing's PRE-SEARCH content (Crud.metadata.preSearch) is not the page's empty state: it
    // stands in for the results until the first search (listingPreSearchBlocksOf) — taken for the
    // page's it was painted at the bottom, under the table's own «No data.»
    const pre = new Set()
    const mark = (n) => {
      if (!n || typeof n !== 'object') return
      if (Array.isArray(n)) { n.forEach(mark); return }
      pre.add(n)
      for (const v of Object.values(n)) if (v && typeof v === 'object') mark(v)
    }
    findFirst(tree, (n) => { if (n && n.metadata && n.metadata.type === 'Crud' && Array.isArray(n.metadata.preSearch)) mark(n.metadata.preSearch); return false })
    return findFirst(tree, (n) => !!(n && n.metadata && n.metadata.type === 'EmptyState' && !n.slot && !pre.has(n)))
  }
  function emptyStateOf(tree) {
    const node = pageEmptyStateNode(tree)
    if (!node) return null
    const md = node.metadata
    return {
      title: (md.icon ? md.icon + ' ' : '') + (md.title || ''),
      description: md.description || '',
    }
  }

  const NOT_FOUND_TEXTS = {
    es: { title: 'No encontrado', message: 'Puede que se haya borrado o que el enlace no sea correcto.', back: 'Volver' },
    en: { title: 'Not found', message: 'It may have been deleted, or the link is wrong.', back: 'Go back' },
  }

  /** Proyección de la página NOT FOUND: lo que contesta el server cuando la ruta nombra un registro
   *  o una pantalla que no existe (una reserva borrada, un enlace mal copiado) — en lugar de un
   *  toast de error sobre una página vacía. Se pinta con el idioma de Redwood para esto, el
   *  oj-sp-empty-state a página completa (su ilustración de fondo + texto primario/secundario + la
   *  navigationAction como vuelta atrás), dentro de la shell. Los textos los manda el server (el
   *  mensaje de la excepción como titular); si faltan, los genéricos en el idioma de la página.
   *  null si el host no es un not-found. */
  function notFoundOf(tree, lang) {
    const node = findByType(tree, 'NotFound')
    if (!node) return null
    const md = node.metadata || {}
    const texts = String(lang || '').toLowerCase().startsWith('es') ? NOT_FOUND_TEXTS.es : NOT_FOUND_TEXTS.en
    const backRoute = md.backRoute || ''
    return {
      title: md.title || texts.title,
      message: md.message || texts.message,
      backRoute,
      // la vuelta atrás es la navigationAction del empty-state (un enlace); sin ruta, ninguna
      navigationAction: backRoute ? { label: md.backLabel || texts.back, display: 'on' } : null,
    }
  }

  /** Interpolación del wire (labels con plantillas): ${state.clave} → valor del state. */
  /** La ruta que abre una fila (`/customers/${row.id}`), o '' si la plantilla no se resuelve entera. */
  function rowRouteOf(template, row) {
    if (!template) return ''
    let unresolved = false
    const route = String(template).replace(/\$\{\s*row\.([A-Za-z0-9_]+)\s*\}/g, (all, field) => {
      const value = row ? row[field] : undefined
      if (value == null || value === '') { unresolved = true; return '' }
      return encodeURIComponent(typeof value === 'object' ? (value.value ?? value.message ?? '') : String(value))
    })
    return unresolved || route.includes('${') ? '' : route
  }

  function interpolate(text, state) {
    // `${i18n.clave}` lo resuelve el servidor (o el bundle) antes de llegar aquí; si aún llega, no hay
    // catálogo detrás: se muestra la CLAVE, nunca la expresión cruda.
    if (text != null && String(text).includes('i18n.')) {
      text = String(text).replace(/\$\{\s*i18n\.([A-Za-z0-9_][A-Za-z0-9_.-]*)\s*\}/g, (all, key) => key)
    }
    // `${state.x}` y también `${state['x']}` / `${state["x"]}` (la posición del editor de filas
    // llega como ${state['_position']})
    // y rutas anidadas: `${state.status.message}` (la insignia de un @Status de la cabecera)
    return String(text == null ? '' : text).replace(
      /\$\{state(?:\.([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*)|\[\s*['"]([^'"\]]+)['"]\s*\])\}/g,
      (all, dotted, quoted) => {
        if (quoted) return state && state[quoted] != null ? String(state[quoted]) : ''
        let value = state
        for (const part of dotted.split('.')) {
          value = value != null && typeof value === 'object' ? value[part] : undefined
        }
        return value != null && typeof value !== 'object' ? String(value) : ''
      },
    )
  }

  const TEXT_CLASSES = {
    xl: 'oj-typography-heading-md',
    l: 'oj-typography-subheading-md',
    s: 'oj-typography-body-sm',
    xs: 'oj-typography-body-xs oj-text-color-secondary',
  }
  const NOTICE_CLASSES = {
    success: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-success-30',
    warning: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-warning-30',
    danger: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-danger-30',
    info: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-info-30',
  }

  /** Proyección GENÉRICA del contenido display de una isla (p.ej. el CheckInWizard
   *  embebido del front-office): BLOQUES (plain | card) de átomos precomputados para el
   *  CSP de VB (flags is*, clases, textos interpolados contra el state). Las islas
   *  ANIDADAS (App mediador dentro de la isla, p.ej. el documento) se saltan — fase
   *  posterior. null si el árbol no aporta nada display (isla de formulario puro). */
  /** Fábrica de data providers de JET, inyectada por la app (en Node no hay ninguna: el atom
   *  viaja con las filas y sin proveedor, que es lo que los tests comprueban). */
  let dataProviderFactory = null
  function setDataProviderFactory(factory) { dataProviderFactory = factory }

  /** Fábrica de conversores de JET (oj-input-number de un importe): JET 18 ya no acepta el
   *  conversor como JSON, quiere una instancia de IntlNumberConverter. En Node se queda la
   *  especificación, que es lo que los tests comprueban. */
  /** Quién lee las preferencias de columnas del listado en pantalla (la app: localStorage por
   *  ruta). En Node, nadie: las columnas salen tal cual. */
  let columnPrefsReader = null
  function setColumnPrefsReader(fn) { columnPrefsReader = typeof fn === 'function' ? fn : null }

  /** Paneles plegables abiertos/cerrados por el usuario (clave → bool); lo no tocado, como manda
   *  el wire (AccordionPanel.active, Details.opened). Estado de cliente, como la pestaña activa. */
  const panelState = {}
  function setPanelExpanded(key, expanded) { panelState[key] = !!expanded }
  function panelExpanded(key, fallback) { return key in panelState ? panelState[key] : !!fallback }
  // Other CLIENT-side view state of the content (the slide a carousel shows, the page a Grid shows,
  // the open rows of a tree Grid): a value per key; changing it re-projects (uiValueChanged chain).
  const uiState = {}
  function setUiValue(key, value) { uiState[key] = value }
  function uiValueOf(key, fallback) { return key in uiState ? uiState[key] : fallback }

  // ── node ids for the visual editor (editor / preview mode ONLY) ──
  // The IDE's visual editor paints a definition in this app (an iframe) and has to map a click back
  // to the node of the definition: its preview stamps a synthetic `ve-<path>` id on every node, and
  // with this flag on, every projected object (an atom, a card, a form field, a button) carries the
  // id of the wire node it came from as `nodeId` — poc/editorPreview.mjs copies it onto the painted
  // element as data-node-id. OFF by default: a production page never carries editor ids.
  let editorNodeIds = false
  function setEditorNodeIds(on) { editorNodeIds = !!on }
  /** Editor mode only: `o` tagged with the id of the wire node it was projected from. */
  function withNodeId(o, node) {
    if (editorNodeIds && o && typeof o === 'object' && node && node.id) o.nodeId = String(node.id)
    return o
  }

  let converterFactory = null
  function setConverterFactory(factory) { converterFactory = factory }
  function converterOf(spec) {
    return converterFactory ? converterFactory(spec) : spec
  }

  function islandContentOf(ctx, opts = {}) {
    if (!ctx || !ctx.tree) return null
    // La pestaña activa es POR BARRA: un mapa {clave de barra: id de pestaña} (opts.activeTabs).
    // opts.activeTab (un único id) sigue valiendo para la barra de primer nivel.
    const activeTabs = { ...(opts.activeTab ? { '': opts.activeTab } : {}), ...(opts.activeTabs || {}) }
    // Barras ANIDADAS (un TabLayout dentro de una pestaña): cada barra tiene su clave, derivada de
    // la pestaña que la contiene (tabScope) y de su ordinal entre hermanas — ver tabStripKeyOf.
    let tabScope = ''
    const stripsPerScope = {}
    let tabBars = 0
    const state = ctx.state || {}
    const interp = (t) => interpolate(t, state)
    const badgeOf = (b) => ({
      label: b.label,
      badgeClass: BADGE_CLASSES[b.color] || 'oj-badge oj-badge-neutral oj-badge-subtle',
    })
    const buttonOf = (m) => ({
      actionId: m.actionId,
      label: m.label || m.actionId,
      disabled: !!m.disabled,
      chroming: m.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
      parameters: m.parameters || {},
    })
    const money = (value, currency) => (currency || '€') + ' ' + Number(value || 0)
      .toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const STATUS_TEXT = {
      success: 'oj-text-color-success',
      warning: 'oj-text-color-warning',
      danger: 'oj-text-color-danger',
      error: 'oj-text-color-danger',
    }
    const blocks = []
    let plain = null
    let elementOrdinal = 0
    // the wire node being projected (editor mode only): what an atom or a block made now came from
    let editorNode = ''
    const stampNode = (o) => {
      if (editorNode && o && typeof o === 'object' && o.nodeId === undefined) o.nodeId = editorNode
    }
    if (editorNodeIds) {
      // a card, a column, a panel made while visiting a node is that node's — but not the implicit
      // run of loose atoms (isPlain), which belongs to nobody
      const push = blocks.push.bind(blocks)
      blocks.push = (...made) => {
        made.forEach((b) => { if (b && !b.isPlain) stampNode(b) })
        return push(...made)
      }
    }
    const atom = (a, container) => {
      stampNode(a)
      if (container) { container.items.push(a); return }
      if (!plain) { plain = { isPlain: true, items: [] }; blocks.push(plain) }
      plain.items.push(a)
    }
    // los hijos de un nodo viajan en children Y/O en metadata.content (CustomField, Notice…)
    const kidsOf = (node) => {
      const out = [...(node.children || [])]
      const inner = node.metadata && node.metadata.content
      if (Array.isArray(inner)) out.push(...inner)
      else if (inner && typeof inner === 'object') out.push(inner)
      return out
    }
    const collectButtons = (node, out) => {
      if (!node || typeof node !== 'object') return out
      if (node.metadata && node.metadata.type === 'Button') {
        const button = buttonOf(node.metadata)
        if (editorNodeIds && node.id) button.nodeId = String(node.id)
        out.push(button)
        return out
      }
      for (const child of kidsOf(node)) collectButtons(child, out)
      return out
    }
    // Proyecta hijos como BLOQUES-COLUMNA de la rejilla oj-flex (colClass oj-md-(NN→doceavos)): las
    // zonas de @Zones y los dos paneles de un maestro-detalle. Si una columna genera varios bloques
    // se FUSIONAN en uno (un flex no puede apilar dos items en la misma celda de fila).
    const projectColumns = (children, percents, extraClass) => {
      children.forEach((child, i) => {
        const col = Math.min(11, Math.max(1, Math.round(percents[i] * 12 / 100)))
        // las cssClasses del wire de la COLUMNA viajan al bloque (p.ej. la banda
        // neutra de la info secundaria del general overview: oj-panel + oj-bg-*)
        const colClass = 'oj-flex-item oj-sm-12 oj-md-' + col + ' oj-sm-padding-4x-end'
          + (extraClass ? ' ' + extraClass : '')
          + (child.cssClasses ? ' ' + child.cssClasses : '')
        const before = blocks.length
        plain = null
        visit(child, null)
        plain = null
        const created = blocks.splice(before)
        if (created.length === 1) {
          created[0].colClass = colClass
          blocks.push(created[0])
        } else if (created.length > 1) {
          blocks.push({ isPlain: true, colClass, items: created.flatMap((b) => b.items) })
        }
      })
    }
    // hijos con su clase de columna YA calculada (rejillas: ResponsiveGrid, DashboardLayout)
    // Devuelve false (y no deja nada) si alguna columna genera bloques que no se pueden fusionar en
    // una celda: una isla anidada (el hoisting convierte su bloque entero en la isla) o un bloque
    // especial sin átomos — entonces el llamante apila los hijos como antes.
    const projectSized = (children, colClasses, tags = null) => {
      const start = blocks.length
      const out = []
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        const before = blocks.length
        plain = null
        if (child && child.metadata && child.metadata.type === 'DashboardPanel') visitDashboardPanel(child, null)
        else visit(child, null)
        plain = null
        const created = blocks.splice(before)
        const tag = tags ? tags[i] : null
        if (created.length === 1) out.push({ ...created[0], colClass: colClasses[i], ...tag })
        else if (created.length > 1) {
          if (created.some((b) => !Array.isArray(b.items) || b.items.some((a) => a && a.isNested))) {
            blocks.splice(start)
            return false
          }
          out.push({ isPlain: true, colClass: colClasses[i], items: created.flatMap((b) => b.items), ...tag })
        }
      }
      blocks.push(...out)
      return true
    }
    // un DashboardPanel = una tarjeta-bloque (título + subtítulo + su contenido) con su ancho
    const visitDashboardPanel = (panel, colClass) => {
      // editor mode: the card (and its title atoms) is the PANEL's node, not the layout's
      if (editorNodeIds && panel && panel.id) {
        const outer = editorNode
        editorNode = String(panel.id)
        try { projectDashboardPanel(panel, colClass) } finally { editorNode = outer }
        return
      }
      projectDashboardPanel(panel, colClass)
    }
    const projectDashboardPanel = (panel, colClass) => {
      const pm = panel.metadata || {}
      const card = { isCard: true, items: [], ...(colClass ? { colClass } : {}) }
      blocks.push(card)
      plain = null
      if (pm.title) card.items.push({ isText: true, text: interp(pm.title), cls: 'oj-typography-subheading-xs' })
      if (pm.subtitle) card.items.push({ isText: true, text: interp(pm.subtitle), cls: 'oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-bottom' })
      for (const child of kidsOf(panel)) visit(child, card)
      plain = null
    }
    const visit = (node, container) => {
      if (!editorNodeIds || !node || typeof node !== 'object' || !node.id) { visitNode(node, container); return }
      const outer = editorNode
      editorNode = String(node.id)
      try { visitNode(node, container) } finally { editorNode = outer }
    }
    const visitNode = (node, container) => {
      if (!node || typeof node !== 'object') return
      // @Subresource: el listado embebido es OTRA superficie (su ServerSide). Deja un hueco que
      // withSubresources rellena con su tabla cuando está cargada — bajar a su App de mediador lo
      // tomaba por la isla anidada del check-in (isNested), y la fusión vaciaba el bloque entero:
      // con la pestaña Orders o Billing activa no quedaba ni la barra de pestañas
      if (node !== ctx.tree) {
        const sub = subresourceIslandOf(node)
        if (sub) { atom({ isSubresource: true, islandId: sub.id, subresource: sub }, container); return }
      }
      const m = node.metadata
      const t = m && m.type
      // FILA ZONADA (@Zones): HorizontalLayout cuyos hijos son columnas con
      // flex: 1 1 calc(NN% …) — cada zona se proyecta como bloque-columna (colClass
      // oj-md-(NN→doceavos)); si una zona genera varios bloques se FUSIONAN en uno
      // (un flex no puede apilar dos items en la misma celda de fila)
      if (t === 'HorizontalLayout' && !container) {
        const zoneMatches = (node.children || []).map(
          (ch) => String(ch.style || '').match(/flex:\s*1 1 calc\((\d+(?:\.\d+)?)%/))
        if (zoneMatches.length >= 2 && zoneMatches.every(Boolean)) {
          projectColumns(node.children, node.children.map((_, i) => parseFloat(zoneMatches[i][1])))
          return
        }
      }
      // CONSOLA / MAESTRO-DETALLE (MasterDetailLayout, SplitLayout): children = [maestro, detalle].
      // Misma proyección que las zonas: dos bloques-columna de la rejilla oj-flex (lista a la
      // izquierda, detalle a la derecha, 5/12 + 7/12), que bajo md se apilan — como la vista
      // Console de OPERA. Vertical (SplitLayout orientation vertical) → uno debajo del otro. Dentro
      // de otro bloque no hay columnas que repartir: se proyecta en su sitio, en orden.
      if ((t === 'MasterDetailLayout' || t === 'SplitLayout') && !container) {
        const kids = (node.children || []).filter(Boolean)
        if (kids.length >= 2 && String(m.orientation || '').toLowerCase() !== 'vertical') {
          projectColumns(kids.slice(0, 2), [41.7, 58.3], 'mateu-split-pane')
          return
        }
        for (const kid of kids) visit(kid, container)
        return
      }
      if (t === 'App') {
        // isla ANIDADA (p.ej. el documento del check-in): marcador de posición — el
        // contenido vive en su propio contexto y lo pinta mateuNested en ese hueco
        atom({ isNested: true, islandId: node.id }, container)
        return
      }
      // FORMULARIO (FormLayout: sus FormRow de FormFields, con maxColumns y el colspan de cada
      // campo) → UN atom isFormLayout que la plantilla pinta con el oj-form-layout de JET
      // (max-columns / direction=row / colspan en cada hijo): el reparto en columnas es el de
      // JET, no una rejilla propia. Cada campo lleva su widget de verdad (texto, número, fecha,
      // booleano, select) y su readonly — la vista de detalle de un crud manda todos sus campos
      // readOnly y se tienen que ver como tales, no como inputs editables. Lo que no es un
      // campo escalar (un grid, una property row, otro componente) corta el grupo y se proyecta
      // como siempre, en su sitio.
      if (t === 'FormLayout') {
        const columns = Math.min(4, Math.max(1, m.maxColumns || m.columns || 1))
        const layouts = []
        let layout = null
        const walkLayout = (n) => {
          if (!n || typeof n !== 'object') return
          const md = n.metadata
          if (md && md.type === 'FormRow') { kidsOf(n).forEach(walkLayout); return }
          const field = md && md.type === 'FormField' ? layoutFieldOf(md, state, ctx.data, columns) : null
          if (field) {
            if (editorNodeIds && n.id) field.nodeId = String(n.id)
            if (!layout) {
              layout = { isFormLayout: true, columns, fields: [] }
              layouts.push(layout)
              atom(layout, container)
            }
            layout.fields.push(field)
            return
          }
          layout = null
          visit(n, container)
        }
        kidsOf(node).forEach(walkLayout)
        // todo de sólo lectura (la vista de detalle): el propio form layout va readonly y JET
        // pinta cada campo como valor, sin caja de input
        for (const l of layouts) l.readonly = l.fields.every((f) => f.readonly)
        return
      }
      if (t === 'FormField') {
        const fieldId = m.fieldId || m.id
        // GRID embebido en un formulario (una lista con columnas: los Steps/Messages de un
        // proceso). No es el listado de un crud —ése tiene su propia rama y su cabecera de
        // búsqueda—, es una tabla más del contenido.
        if ((m.columns || []).length) {
          const rows = Array.isArray(state[fieldId]) ? state[fieldId] : []
          // lista EDITABLE con el editor de fila en un diálogo (@DetailFormCustomisation
          // position = modal): "+" debajo y, por fila, Editar / Quitar en su última columna
          const rowEditable = isModalRowEditor(m)
          const columns = m.columns
            .map((col) => col.metadata || col)
            // la columna-botón `_select` ("Edit") del wire la sustituye la de acciones de fila
            .filter((c) => !(c.id === '_select' && c.stereotype === 'button'))
            .map((c) => {
              const def = { headerText: c.label || c.id, field: c.id }
              if (c.dataType === 'status') def.template = 'cellStatusBadge'
              return def
            })
          if (rowEditable) {
            columns.push({ headerText: '', field: '__rowActions', template: 'cellListRowActions', sortable: 'disabled' })
          }
          // en una lista editable, una celda que aún no tiene valor (la línea y el total de una
          // habitación recién añadida: los pone el servidor al crear) dice «—», no un hueco
          const dashEmpty = (row) => {
            const out = { ...row }
            for (const col of columns) {
              if (col.field !== '__rowActions' && (out[col.field] == null || out[col.field] === '')) out[col.field] = EMPTY_VALUE
            }
            return out
          }
          const shown = statusBadgeRows(rows, m.columns).map((row, i) => (rowEditable
            ? {
              ...dashEmpty(row),
              _rowNumber: row._rowNumber == null ? i : row._rowNumber,
              __rowKey: String(row._rowNumber == null ? i : row._rowNumber),
              __editActionId: fieldId + '_select',
              __removeActionId: fieldId + '_remove',
            }
            : row))
          atom({
            isGrid: true,
            fieldId,
            label: m.label || '',
            columns,
            rows: shown,
            // el data provider lo construye la app (JET); en Node no hay, y el atom viaja igual
            adp: dataProviderFactory ? dataProviderFactory(shown) : null,
            isEmpty: rows.length === 0,
            rowEditable,
            addActionId: rowEditable ? fieldId + '_add' : '',
            addLabel: 'Add',
          }, container)
          return
        }
        if (RICH_TEXT_STEREOTYPES[m.stereotype] && m.readOnly) {
          // richText / html / markdown de SÓLO LECTURA: con su formato (editable: un oj-text-area
          // en el form layout — JET no trae editor de texto enriquecido)
          const raw = state[fieldId] != null ? state[fieldId] : (ctx.data || {})[fieldId]
          atom({ isRichText: true, label: interp(m.label || ''), html: richHtmlOf(m.stereotype, plainValueOf(raw)) }, container)
          return
        }
        if (m.stereotype === 'bulletedList') {
          // @BulletedList sobre una List<String>: su rótulo y sus valores como la lista de viñetas
          // de siempre (el componente BulletedList ya era un átomo; el campo caía al vacío)
          const raw = state[fieldId] != null ? state[fieldId] : (ctx.data || {})[fieldId]
          const items = (Array.isArray(raw) ? raw : raw == null || raw === '' ? [] : [raw]).map((v) => String(plainValueOf(v)))
          if (m.label) atom({ isText: true, text: interp(m.label), cls: 'oj-typography-body-sm oj-text-color-secondary oj-sm-margin-1x-bottom' }, container)
          atom({ isBullets: true, items }, container)
          return
        }
        if (m.propertyRow) {
          // un lookup de sólo lectura viaja como el campo '<campo>-label', con su ETIQUETA en
          // data['<campo>-label'] (no en el state); un campo normal puede traer su etiqueta igual
          const data = ctx.data || {}
          const fromData = (key) => (data[key] != null && typeof data[key] !== 'object' ? data[key] : null)
          const raw = state[fieldId] != null ? state[fieldId]
            : fromData(fieldId) != null ? fromData(fieldId) : (m.value != null ? m.value : '')
          const lookupLabel = fromData(fieldId + '-label')
          const shown = lookupLabel != null && lookupLabel !== '' ? lookupLabel : raw
          atom({ isPropertyRow: true, label: m.label || m.displayName || fieldId, value: interp(String(shown)) }, container)
          return
        }
        // FormField FLUIDO editable (p.ej. el buscador de cargos del modo check-out):
        // input ligado por fieldId al estado del contexto (draft + auto-save)
        if (m.dataType === 'string' || m.dataType === 'integer' || m.dataType === 'number') {
          atom({
            isInput: true,
            fieldId,
            label: m.label || '',
            value: state[fieldId] == null ? '' : String(state[fieldId]),
          }, container)
        }
        return
      }
      if (t === 'TabLayout') {
        // Las pestañas se APLANAN: el atom de la barra + el contenido de la pestaña activa
        // como átomos normales del mismo contenedor. Anidar átomos dentro de átomos obligaría a
        // duplicar toda la plantilla dentro de la pestaña y a pelearse con el $current anidado
        // de VB; así el vocabulario que ya existe pinta el contenido sin enterarse.
        const tabs = (node.children || []).filter((c) => c.metadata && c.metadata.type === 'Tab')
        if (!tabs.length) return
        // una sola pestaña visible no es una elección: su contenido sin barra (conserva su clave de
        // ruta, así nada se mueve cuando un flag vuelve a mostrar las otras)
        if (tabs.length === 1) {
          for (const child of tabs[0].children || []) visit(child, container)
          return
        }
        // cada barra con SU clave y SUS ids (la de primer nivel conserva 'tab-N'): con ids y
        // pestaña activa compartidos, pulsar la pestaña 2 de una barra interior cambiaba también
        // la exterior
        const ordinal = stripsPerScope[tabScope] || 0
        stripsPerScope[tabScope] = ordinal + 1
        const stripKey = tabStripKeyOf(tabScope, ordinal)
        const ids = tabs.map((tab, i) => tabIdOf(stripKey, i))
        const wanted = ids.indexOf(activeTabs[stripKey] || '')
        const selected = wanted >= 0 ? wanted : tabs.findIndex((tab) => tab.metadata.active)
        const current = selected >= 0 ? selected : 0
        atom({
          isTabs: true,
          // la primera barra conserva el id de siempre (las chains la refrescan por selector)
          barId: tabBars++ ? 'mateuContentTabs-' + (tabBars - 1) : 'mateuContentTabs',
          stripKey,
          selectedId: ids[current],
          tabs: tabs.map((tab, i) => ({
            id: ids[i],
            // el contador de sus @Subresource EAGER viaja con la pestaña («Subnets (12)»)
            label: interp(tab.metadata.label || tab.metadata.caption || 'Tab ' + (i + 1))
              + (tab.metadata.badge ? ' (' + tab.metadata.badge + ')' : ''),
            // @Tab(key): seleccionarla empuja su URL (ver contentTabSelected)
            routeKey: tab.metadata.routeKey || '',
            // @Tab(shortcut): la selecciona por teclado (keys.mjs)
            shortcut: String(tab.metadata.shortcut || '').toLowerCase(),
          })),
        }, container)
        const outerScope = tabScope
        tabScope = ids[current]
        try {
          for (const child of tabs[current].children || []) visit(child, container)
        } finally {
          tabScope = outerScope
        }
        return
      }
      if (t === 'CustomField') {
        // envoltorio: lo que importa es lo que lleva dentro — en metadata.content o, para un
        // campo que guarda un componente (un Anchor, un Chart… declarado como campo del form),
        // en children: mirando solo content esos campos desaparecían sin dejar rastro
        for (const child of kidsOf(node)) visit(child, container)
        return
      }
      if (t === 'Element') {
        // Componente WEB de terceros (el grafo de un proceso). Los atributos son su único canal
        // de datos y viajan en la METADATA, que un State no reenvía: escritos como `${state.x}`
        // son VALORES y se reevalúan en cada render — mismo idioma que cualquier rótulo. El
        // módulo del atributo `import` lo carga la app la primera vez que se usa la etiqueta.
        const attributes = {}
        for (const key of Object.keys(m.attributes || {})) attributes[key] = interp(m.attributes[key])
        atom({
          isElement: true,
          // el servidor manda un id de relleno ("fieldId") a TODOS los Element (un record sin id):
          // dos en la misma pantalla (un plano por planta, dos tablas en un foldout) compartían
          // hueco y se pisaban. Sin id propio, nombre + ordinal: estable mientras la estructura
          // de la pantalla no cambie
          elementId: node.id && node.id !== 'fieldId' ? node.id : m.name + '#' + (elementOrdinal++),
          name: m.name,
          importUrl: (m.attributes || {}).import || '',
          attributes,
          style: node.style || '',
          cssClasses: node.cssClasses || '',
          content: interp(m.content || ''),
          asHtml: !!m.html,
          // el contenido llevaba `${…}` → ha entrado DATO en el marcado: se sanea al montarlo
          dataInContent: String(m.content || '').indexOf('${') >= 0,
          on: m.on || null,
        }, container)
        return
      }
      // ── DASHBOARD en cualquier página: rejilla de paneles (cada DashboardPanel, una tarjeta con su
      // ancho en columnas), banda de KPIs (Scoreboard/MetricCard) y gráficos (oj-chart) ──
      // ResponsiveGrid (la rejilla general): sus pistas (grid-template-columns) y los colSpans de
      // cada hijo → bloques-columna oj-flex de su ancho. Dentro de una tarjeta, apilado.
      if (t === 'ResponsiveGrid' && !container) {
        // el span de cada hijo: el del wire (colSpans) o el que el hijo lleva consigo — un
        // DashboardPanel su colSpan, la banda de KPIs (Scoreboard) la fila entera
        // a slot TEMPLATE places its children by NAME (slot `main` → area `main`), not by list order:
        // the GeneralOverview's promoted info slot travels FIRST in the list (so a stacking web grid
        // puts it on top) and must still take the `info` column on a wide page
        const serverKids = (m.colSpans && m.colSpans.length) ? kidsOf(node) : kidsInAreaOrder(kidsOf(node), m.gridTemplateAreas)
        const serverSpans = serverKids.map((k, i) => (m.colSpans && m.colSpans[i])
          || (k && k.metadata && k.metadata.type === 'DashboardPanel' ? k.metadata.colSpan
            : k && k.metadata && k.metadata.type === 'Scoreboard' ? 999 : 1))
        // REORDENABLE (ResponsiveGrid.reorderable): los tiles en el orden guardado del usuario, cada
        // bloque marcado con su clave y su ámbito — installTileReorder los arrastra y re-proyecta
        let order = serverKids.map((_, i) => i)
        let tags = null
        if (m.reorderable) {
          const scope = tileScopeOf(node.id)
          const keys = serverKids.map((k, i) => tileKeyOf(k, i))
          order = orderedTileIndices(keys, readTileOrder(scope))
          tags = order.map((i) => ({ tileKey: keys[i], tileScope: scope }))
        }
        const kids = order.map((i) => serverKids[i])
        const spans = order.map((i) => serverSpans[i])
        // auto-fill / auto-fit tracks (repeat(auto-fit, minmax(16rem, 1fr))): as many tiles per row
        // as fit at each breakpoint — responsive oj-flex classes instead of stacking them
        // (no columns and no areas: the web's default, a responsive auto-fit of 16rem tiles)
        const autoFit = autoFitColClass(m.gridTemplateColumns
          || (m.gridTemplateAreas && String(m.gridTemplateAreas).trim() ? '' : AUTO_FIT_DEFAULT))
        const classes = gridColClasses(m.gridTemplateColumns, spans, kids.length)
          || (autoFit ? kids.map(() => autoFit) : null)
        // a slot TEMPLATE (gridTemplateAreas: @Aside, a CollectionDetail…) is the page's layout: its
        // blocks carry the mark, and the content wins over the generic form (hostContentShown)
        const templated = !!(m.gridTemplateAreas && String(m.gridTemplateAreas).trim())
        const allTags = templated ? kids.map((_, i) => ({ ...((tags && tags[i]) || {}), fromTemplate: true })) : tags
        if (classes && projectSized(kids, classes, allTags)) return
      }
      if (t === 'DashboardLayout') {
        const columns = m.columns > 0 ? m.columns : 3
        const kids = kidsOf(node)
        if (projectSized(kids, kids.map((k) => panelColClass(k && k.metadata && k.metadata.colSpan, columns)))) return
        for (const child of kids) visit(child, container)
        return
      }
      if (t === 'DashboardPanel') {
        visitDashboardPanel(node, null)
        return
      }
      if (t === 'Scoreboard') {
        const metrics = findAllByType(node, 'MetricCard').map((n) => withNodeId(metricOf(n.metadata, interp), n))
        if (metrics.length) atom({ isScoreboard: true, metrics }, container)
        return
      }
      if (t === 'MetricCard') {
        // consecutivos se juntan en la misma banda (como los botones)
        const target = container || plain
        const last = target && target.items.length ? target.items[target.items.length - 1] : null
        if (last && last.isScoreboard) last.metrics.push(withNodeId(metricOf(m, interp), node))
        else atom({ isScoreboard: true, metrics: [withNodeId(metricOf(m, interp), node)] }, container)
        return
      }
      if (t === 'Chart' || t === 'TrendChart') {
        atom(chartAtomOf(m, t, interp), container)
        return
      }
      if (t === 'Card') {
        const card = { isCard: true, items: [] }
        blocks.push(card)
        plain = null
        // el título de un Card fluido es un COMPONENTE (un Text): sus textos, como en cardOf
        const title = m.title && (typeof m.title === 'string' ? m.title : (m.title.text || collectTexts(m.title)[0] || ''))
        if (title) card.items.push({ isText: true, text: interp(title), cls: 'oj-typography-subheading-xs oj-sm-margin-2x-bottom' })
        for (const child of node.children || []) visit(child, card)
        const cardInner = m.content
        if (Array.isArray(cardInner)) cardInner.forEach((c) => visit(c, card))
        else if (cardInner && typeof cardInner === 'object' && cardInner.metadata) visit(cardInner, card)
        plain = null
        return
      }
      if (t === 'Page') {
        // título de la isla + su TOOLBAR (los @Toolbar del server viajan en metadata.toolbar)
        const pageTitle = interp(m.title || '')
        if (pageTitle) atom({ isText: true, text: pageTitle, cls: 'oj-typography-subheading-sm' }, container)
        const toolbar = (m.toolbar || []).filter((b) => b && b.actionId)
        if (toolbar.length) atom({ isButtons: true, fromPageToolbar: true, buttons: toolbar.map(buttonOf) }, container)
        for (const child of kidsOf(node)) visit(child, container)
        return
      }
      if (t === 'CustomComponent' && customComponentRegistered(m.name)) {
        // the app registered a view for it (registerCustomComponent): its slot, then its children
        atom(customComponentAtomOf(m, node.id), container)
        for (const child of kidsOf(node)) visit(child, container)
        return
      }
      if (t === 'CustomComponent') {
        // Escape hatch (#14): VB no trae un renderer para el tipo → placeholder visible + los hijos
        // slotted igualmente (paridad con el <mateu-unsupported> del web).
        atom({
          isNotice: true,
          text: 'Custom component "' + (m.name || '') + '" — no VB renderer',
          noticeClass: NOTICE_CLASSES.warning,
          buttons: [],
        }, container)
        for (const child of kidsOf(node)) visit(child, container)
        return
      }
      if (t === 'Text') {
        const text = interp(m.text)
        if (text) {
          // container h1..h6 → HEADING de contenido: h3 real (el escalón siguiente al h2
          // de la sección), con ritmo de grupo (margin-top) cuando no abre el bloque
          const heading = /^h[1-6]$/.test(m.container || '')
          if (heading) {
            const target = container || plain
            const notFirst = !!(target && target.items.length)
            atom({
              isText: true,
              isHeading: true,
              // un h2 al frente de una zona es el TITULO del fold (el gop lo asciende a
              // cabecera de slot con el subrayado del foldout)
              isH2: m.container === 'h2',
              text,
              cls: 'oj-typography-subheading-xs' + (notFirst ? ' oj-sm-margin-10x-top' : ''),
            }, container)
          } else {
            atom({ isText: true, text, cls: TEXT_CLASSES[m.size] || 'oj-typography-body-md' }, container)
          }
        }
        return
      }
      // ENLACE (Anchor): un <a> de verdad — el tema Redwood lo pinta como enlace, el manejador
      // global de links.mjs navega DENTRO de la shell si es una ruta de la app, y target=_blank
      // (una URL externa, un PDF) abre otra pestaña sin pasar por el servidor
      if (t === 'Anchor') {
        const href = interp(m.url)
        if (href) {
          const target = m.target ? String(m.target) : ''
          atom({
            isAnchor: true,
            text: interp(m.text) || href,
            href,
            target: target || '_self',
            rel: target === '_blank' ? 'noopener noreferrer' : '',
          }, container)
        }
        return
      }
      // FOLDOUT DENTRO DE UNA PESTAÑA (el de página lo pinta oj-sp-foldout-layout, foldoutOf): el
      // overview en su sitio y cada panel como un panel plegable — su título y, abierto, su
      // contenido; los paneles abiertos por defecto (open) se respetan
      if (t === 'FoldoutLayout' && tabScope) {
        const bySlot = {}
        for (const child of node.children || []) bySlot[child.slot || ''] = child
        if (bySlot.overview) visit(bySlot.overview, container)
        ;(m.panels || []).forEach((panel, i) => {
          const key = 'fold:' + (node.id || 'foldout') + ':' + i
          const expanded = panelExpanded(key, panel.open !== false)
          atom({ isCollapsible: true, collapsibleKey: key, title: interp(panel.title || ''), expanded, disabled: false }, container)
          const content = bySlot['panel-' + i]
          if (expanded && content) visit(content, container)
          // a FOLDED panel shows its summary (FoldoutPanel.summary, slotted summary-N) instead
          else if (!expanded && bySlot['summary-' + i]) visit(bySlot['summary-' + i], container)
        })
        return
      }
      // any other foldout drawn from the generic visit (inside an island): its panels' summaries are
      // the FOLDED view of content that is painted in full here — not content of their own
      if (t === 'FoldoutLayout') {
        for (const child of kidsOf(node)) if (!/^summary-/.test(child && child.slot ? child.slot : '')) visit(child, container)
        return
      }
      // PANELES PLEGABLES (AccordionLayout de AccordionPanel, Details): como las pestañas, se
      // APLANAN — la cabecera es un átomo isCollapsible (un oj-collapsible de JET) y el contenido
      // del panel va detrás, como átomos normales, sólo si está abierto. Abierto/cerrado es estado
      // del CLIENTE (panelExpanded, por clave): plegar re-proyecta sin preguntar al servidor.
      if (t === 'AccordionLayout') {
        kidsOf(node).forEach((panel, i) => {
          const pm = panel.metadata || {}
          const key = 'acc:' + (node.id || 'accordion') + ':' + i
          const expanded = panelExpanded(key, !!pm.active)
          atom({ isCollapsible: true, collapsibleKey: key, title: interp(pm.label || ''), expanded, disabled: !!pm.disabled }, container)
          if (expanded) for (const child of kidsOf(panel)) visit(child, container)
        })
        return
      }
      if (t === 'Details') {
        const summaryTexts = m.summary ? collectTexts(m.summary) : []
        const key = 'det:' + (node.id && node.id !== 'fieldId' ? node.id : (summaryTexts[0] || 'details'))
        const expanded = panelExpanded(key, !!m.opened)
        atom({ isCollapsible: true, collapsibleKey: key, title: interp(summaryTexts.join(' ')), expanded, disabled: false }, container)
        if (expanded && m.content) visit(m.content, container)
        return
      }
      // TAPE CHART (PlanningBoard → oj-gantt de JET): filas = recursos (con sus columnas de
      // atributos en la etiqueta), tareas = bloques. Proyección en planningAtomOf (pura, testeada);
      // los eventos de JET (ojMove, ojResize, doble clic, rango) los traduce planningActionOf.
      if (t === 'PlanningBoard') {
        atom(planningAtomOf(m, node.id), container)
        return
      }
      // COLA como pieza de contenido (la lista de una consola maestro-detalle): las mismas tarjetas
      // oj-action-card del modo cola; cada una lleva su acción (la de la cola, con {_item}) para
      // que el despachador genérico de bloques la ejecute, y la opción de línea va DEBAJO de la
      // tarjeta (dentro, su clic sería también el de la tarjeta)
      if (t === 'TaskQueue') {
        const q = queueProjectionOf(m)
        atom({
          isQueue: true,
          groups: q.groups.map((g) => ({
            label: g.label,
            items: g.items.map((it) => ({
              ...it,
              actionId: q.actionId,
              parameters: { _item: it.id },
              lineActions: it.hasAction ? [{ actionId: it.actionId, label: it.actionLabel, parameters: it.parameters }] : [],
            })),
          })),
        }, container)
        return
      }
      if (t === 'ProgressSteps') {
        const steps = (m.steps || []).map((step) => ({ id: step.id, label: step.title || step.label || step.id }))
        const current = (m.steps || []).find((step) => step.status === 'current')
        atom({ isProgress: true, steps, selectedId: current ? current.id : (steps[0] && steps[0].id) }, container)
        return
      }
      if (t === 'EntityHeader') {
        atom({
          isEntityHeader: true,
          title: interp(m.title),
          subtitle: interp(m.subtitle || ''),
          badges: (m.badges || []).map(badgeOf),
          facts: (m.facts || []).map((f) => ({ label: f.label, value: interp(f.value) })),
          metricLabel: m.metricLabel || '',
          metricValue: interp(m.metricValue || ''),
        }, container)
        return
      }
      if (t === 'Notice') {
        // Como en el web: un aviso sin texto (un @Notice cuyo campo vale null o blanco) y sin
        // contenido no se pinta — el valor del campo es su propio interruptor de visibilidad.
        const noticeText = interp(m.text)
        if (!noticeText.trim() && !kidsOf(node).length) return
        atom({
          isNotice: true,
          text: noticeText,
          noticeClass: NOTICE_CLASSES[m.theme] || NOTICE_CLASSES.info,
          buttons: collectButtons({ children: kidsOf(node) }, []),
        }, container)
        return
      }
      if (t === 'Markdown') {
        // Markdown CON formato (encabezados, listas, citas, código, negrita, enlaces…): HTML saneado
        // que installRichText vuelca en su contenedor (VB no estampa HTML desde un binding)
        const html = richHtmlOf('markdown', interp(m.markdown || m.text || ''))
        if (html) atom({ isRichText: true, label: '', html }, container)
        return
      }
      if (t === 'Grid') {
        // un Grid fluido (columnas en content, filas en page.content): la misma tabla embebida que
        // un campo de tipo lista — oj-table en modo lista; los grupos de columnas se aplanan
        const leafColumns = []
        const walkCols = (n) => {
          const cm = n && (n.metadata || n)
          if (!cm) return
          if (cm.type === 'GridGroupColumn') { kidsOf(n).forEach(walkCols); (cm.columns || []).forEach(walkCols); return }
          if (cm.type === 'GridColumn' || cm.id) leafColumns.push(cm)
        }
        ;(m.content || []).forEach(walkCols)
        const gridKey = 'grid:' + (node.id && node.id !== 'fieldId' ? node.id : 'grid')
        const raw = (m.page && m.page.content) || []
        // TREE (Grid.tree, rows with a `children` list): flattened with each row's depth; the first
        // column carries the disclosure (open rows are client state, like a collapsible)
        const tree = !!m.tree && raw.some((r) => Array.isArray(r && r.children) && r.children.length)
        const flat = tree
          ? flattenTreeRows(raw, (key) => !!uiValueOf(gridKey + ':open:' + key, false)).map((r) => ({
            ...r,
            __indentStyle: { paddingInlineStart: (r.__depth * 1.5) + 'rem' },
            __toggleIcon: r.__hasChildren ? (r.__expanded ? 'oj-ux-ico-chevron-down' : 'oj-ux-ico-chevron-right') : '',
            __toggleLabel: r.__expanded ? 'Collapse' : 'Expand',
            __uiKey: gridKey + ':open:' + r.__treeKey,
            __uiValue: !r.__expanded,
          }))
          : raw
        // PAGING: Grid.size rows per page (client side, the rows travel inline)
        const paging = gridPageOf(flat, tree ? 0 : (m.size || 0), uiValueOf(gridKey + ':page', 0))
        const rows = paging.rows.map((r, i) => ({ ...r, _rowNumber: r._rowNumber == null ? i : r._rowNumber }))
        const columns = leafColumns.map((c, i) => {
          const def = { headerText: interp(c.label || c.id), field: c.id }
          if (tree && i === 0) def.template = 'cellTreeToggle'
          return def
        })
        atom({
          isGrid: true,
          fieldId: node.id || 'grid',
          label: '',
          columns,
          rows,
          adp: dataProviderFactory ? dataProviderFactory(rows) : null,
          isEmpty: rows.length === 0,
          rowEditable: false,
          addActionId: '',
          addLabel: 'Add',
          paged: paging.paged,
          pageText: paging.rangeText,
          pager: pagerButtonsOf(gridKey + ':page', paging.page - 1, paging.page + 1, paging.prevDisabled, paging.nextDisabled),
        }, container)
        return
      }
      if (t === 'Gantt') {
        atom(ganttAtomOf(m, node.id), container)
        return
      }
      if (t === 'DropZone') {
        // un destino donde soltar filas arrastradas (@DragRows): título, subtítulo y su contenido como
        // líneas de texto; dnd.mjs lo resalta mientras se arrastra su tipo y lanza su acción al soltar
        const lines = kidsOf(node).flatMap((k) => collectTexts(k)).map(interp).filter(Boolean)
        atom({
          isDropZone: true,
          title: interp(m.title || ''),
          subtitle: interp(m.subtitle || ''),
          lines,
          accept: dragMimeOf(m.accept || ''),
          actionId: m.actionId || '',
          params: JSON.stringify(m.parameters || {}),
          ariaLabel: (m.title || '') + (m.subtitle ? ', ' + m.subtitle : '') + ' — drop target',
        }, container)
        return
      }
      if (t === 'Popover') {
        // lo envuelto se pinta como un disparador con su texto; el contenido, como líneas en la
        // ventana flotante compartida (hover.mjs) — al pasar/enfocar (hover) o al pulsar (click)
        const wrappedTexts = m.wrapped ? collectTexts(m.wrapped).map(interp).filter(Boolean) : []
        const label = wrappedTexts.join(' ') || (m.wrapped && m.wrapped.metadata && m.wrapped.metadata.label) || 'Details'
        const lines = m.content ? collectTexts(m.content).map(interp).filter(Boolean) : []
        // the content WITH its structure (headings, lists, links, badges…) as sanitised HTML: the
        // popup shows that, the text lines stay as its accessible fallback
        const html = m.content ? componentHtmlOf(m.content, interp) : ''
        const text = lines.join('\n') || (html ? ' ' : '')
        atom({
          isPopover: true,
          label: interp(label),
          hoverText: m.trigger === 'hover' ? text : '',
          clickText: m.trigger === 'hover' ? '' : text,
          html,
        }, container)
        return
      }
      if (t === 'Calendar') {
        atom(calendarAtomOf(m, node.id), container)
        return
      }
      if (t === 'MatrixGrid') {
        atom(matrixAtomOf(m, node.id, interp), container)
        return
      }
      if (t === 'Map') {
        atom(mapAtomOf(m, node.id, node.style), container)
        return
      }
      if (t === 'ActionPanel') {
        atom(actionPanelAtomOf(m, node.id, interp), container)
        return
      }
      if (t === 'BulletedList') {
        atom({ isBullets: true, items: (m.items || []).map(interp) }, container)
        return
      }
      if (t === 'Image') {
        // JET no tiene componente de imagen: un <img> con el ancho de su contenedor como tope
        // una ruta RELATIVA la sirve el backend (como el módulo de un Element), no la app VB
        if (m.src) atom({ isImage: true, src: elementModuleUrl(interp(m.src)), alt: interp(m.alt || '') }, container)
        return
      }
      if (t === 'Avatar') {
        atom({ isAvatar: true, avatars: [avatarOf(m)], overflow: '' }, container)
        return
      }
      if (t === 'AvatarGroup') {
        // oj-avatar por persona hasta maxItemsVisible, y «+N» con las que no caben
        const all = (m.avatars || []).map(avatarOf)
        const max = m.maxItemsVisible > 0 ? m.maxItemsVisible : all.length
        atom({ isAvatar: true, avatars: all.slice(0, max), overflow: all.length > max ? '+' + (all.length - max) : '' }, container)
        return
      }
      if (t === 'CarouselLayout') {
        // una GALERÍA (todas las diapositivas son imágenes) → oj-film-strip de JET, con sus flechas
        // y su paginación; un carrusel de contenido arbitrario sigue apilando sus diapositivas
        const slides = kidsOf(node)
        const images = slides.map((n) => (n && n.metadata && n.metadata.type === 'Image' && n.metadata.src ? n.metadata : null))
        if (slides.length && images.every(Boolean)) {
          atom({ isGallery: true, id: node.id || 'gallery',
            images: images.map((im, i) => ({ key: String(i), src: elementModuleUrl(interp(im.src)), alt: interp(im.alt || '') })),
            looping: m.loop ? 'page' : 'off' }, container)
          return
        }
      }

      if (t === 'Separator') {
        atom({ isSeparator: true }, container)
        return
      }
      if (t === 'Badge') {
        atom({ isBadge: true, label: interp(m.text), badgeClass: BADGE_CLASSES[m.color] || 'oj-badge oj-badge-neutral oj-badge-subtle' }, container)
        return
      }
      if (t === 'ResourceGrid') {
        const columns = m.columns && m.columns > 0 && m.columns <= 12 ? m.columns : 4
        const colClass = 'oj-flex-item oj-sm-' + Math.max(1, Math.floor(12 / columns))
        atom({
          isResourceGrid: true,
          items: (m.items || []).map((it) => ({
            id: it.id,
            title: it.title,
            subtitle: it.subtitle || '',
            statusLabel: it.statusLabel || '',
            statusBadgeClass: BADGE_CLASSES[it.statusColor] || 'oj-badge oj-badge-neutral oj-badge-subtle',
            note: it.note || '',
            recommendedLabel: it.recommended ? (m.recommendedLabel || '') : '',
            enabled: !it.disabled,
            disabled: !!it.disabled,
            actionId: m.actionId,
            parameters: { _item: it.id },
            colClass,
            cardClass: it.selected ? 'oj-bg-neutral-20' : '',
          })),
        }, container)
        return
      }
      if (t === 'OfferCard') {
        atom({
          isOffer: true,
          tag: interp(m.tag || ''),
          title: interp(m.title || ''),
          subtitle: interp(m.subtitle || ''),
          features: (m.features || []).map(interp).join(' · '),
          currentLabel: m.current ? (m.currentLabel || '') : '',
          addedLabel: m.added ? (m.addedLabel || '') : '',
          priceLabel: interp(m.priceLabel || ''),
          actionLabel: m.actionId ? (m.actionLabel || '') : '',
          actionId: m.actionId || '',
          parameters: {},
        }, container)
        return
      }
      if (t === 'AddOnPicker') {
        atom({
          isAddOns: true,
          actionId: m.actionId,
          currency: m.currency || '€',
          totalLabel: m.totalLabel || 'Total',
          items: (m.items || []).map((it) => ({
            id: it.id,
            icon: it.icon || '',
            title: interp(it.title),
            description: interp(it.description || ''),
            price: it.price || 0,
            priceText: money(it.price, m.currency) + (it.unit ? ' / ' + it.unit : ''),
            includedLabel: it.includedLabel || '',
            selectable: !it.includedLabel,
            added: !!it.added,
          })),
        }, container)
        return
      }
      if (t === 'StatusList') {
        // columns > 1 → grid responsive de N columnas: el wrapper pasa a oj-flex (wrap) y
        // cada ítem se pinta como TARJETA (oj-panel: borde propio, badge de estado dentro)
        // — celdas sin borde dejaban ambiguo a qué tarea pertenece cada chip y el conjunto
        // no se leía como listado de tareas. La celda exterior es a su vez oj-flex para que
        // el panel interior estire a la altura de la fila (align-items stretch).
        // Todo precomputado por ítem — el CSP de VB no divide ni compara.
        const cols = m.columns && m.columns > 1 && m.columns <= 12 ? m.columns : 0
        const rowClass = 'oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom'
        // SOLO columns>1 fuerza tarjetas: una lista de una columna con acciones (los
        // huéspedes) se pinta con la rama APILADA del markup — nombre como h3 (nivel
        // siguiente al h2 de la sección), sin avatar, ritmo .mateu-list-item
        const asCards = cols > 0
        // la rejilla del cockpit: celdas de MEDIDA FIJA (.mateu-grid-cell, 22rem) con el
        // aire entre tarjetas como gap de la rejilla (.mateu-grid) — ver app.css
        const cellClass = cols
          ? 'oj-flex-item mateu-grid-cell oj-flex oj-sm-margin-4x-bottom'
          : (asCards ? 'oj-flex-item oj-sm-12 oj-flex oj-sm-margin-4x-bottom' : '')
        atom({
          isStatusList: true,
          wrapClass: cols > 0 ? 'oj-flex mateu-grid' : (asCards ? 'oj-flex' : ''),
          items: (m.items || []).map((it) => {
            // hasta DOS acciones por fila (p.ej. Escanear / A mano por pax) — array
            // precomputado; una fila CON acciones se pinta APILADA (título+chip /
            // descripción / botones) para no descolocarse en carriles estrechos
            // hasta TRES acciones por fila; con actionIcon* el botón se pinta SOLO-ICONO
            // (label como tooltip/aria) — iconClass precomputado vía ojIconOf
            const rowActions = []
            if (it.actionLabel && it.actionId) {
              rowActions.push({ label: it.actionLabel, actionId: it.actionId, parameters: { _item: it.id },
                iconClass: ojIconOrGenericOf(it.actionIcon) || '' })
            }
            if (it.actionLabel2 && it.actionId2) {
              rowActions.push({ label: it.actionLabel2, actionId: it.actionId2, parameters: { _item: it.id },
                iconClass: ojIconOrGenericOf(it.actionIcon2) || '' })
            }
            if (it.actionLabel3 && it.actionId3) {
              rowActions.push({ label: it.actionLabel3, actionId: it.actionId3, parameters: { _item: it.id },
                iconClass: ojIconOrGenericOf(it.actionIcon3) || '' })
            }
            return {
              rowClass,
              gridCell: asCards,
              cellClass,
              statusBadgeClass: BADGE_CLASSES[it.statusColor] || 'oj-badge oj-badge-neutral oj-badge-subtle',
              avatar: it.avatar || '',
              icon: it.icon || '',
              title: interp(it.title),
              description: interp(it.description || ''),
              status: interp(it.status || ''),
              statusClass: STATUS_TEXT[it.statusColor] || 'oj-text-color-secondary',
              actions: rowActions,
              hasActions: rowActions.length > 0,
              // nivel del heading del titulo apilado: h4 bajo un grupo con h3 propio
              isH4: m.itemHeadingLevel === 4,
              // cronologia bajo el titulo (p.ej. las entradas de una incidencia)
              lines: (it.lines || []).map(interp),
              hasLines: !!(it.lines && it.lines.length),
              actionLabel: it.actionLabel || '',
              actionId: it.actionId || m.rowActionId || '',
              parameters: { _item: it.id },
              // rowActionId SIN botón propio = la FILA ENTERA es actuable (contrato del
              // renderer web: clic de fila → rowActionId con {_item})
              rowClickable: !!(m.rowActionId && !it.actionLabel),
            }
          }),
        }, container)
        return
      }
      if (t === 'Ledger') {
        atom({
          isLedger: true,
          lines: (m.lines || []).map((line) => ({
            concept: interp(line.concept),
            amountText: line.included ? (line.includedLabel || '') : money(line.amount, m.currency),
            amountClass: (line.amount || 0) < 0 ? 'oj-text-color-success' : '',
          })),
          totalLabel: m.totalLabel || 'Total',
          totalText: money(m.total, m.currency),
        }, container)
        return
      }
      if (t === 'PaymentPicker') {
        atom({
          isPayment: true,
          contextLabel: m.contextLabel || '',
          contextValue: interp(m.contextValue || ''),
          methods: (m.methods || []).map((method) => ({
            label: method.label,
            chroming: method.id === m.selected ? 'callToAction' : 'outlined',
            actionId: m.methodActionId,
            parameters: { _method: method.id },
          })),
          confirmLabel: m.confirmLabel || chromeText('confirm'),
          confirmActionId: m.actionId,
          confirmParameters: { _method: m.selected },
        }, container)
        return
      }
      if (t === 'Meter') {
        atom({
          isMeter: true,
          label: m.label || '',
          value: m.value || 0,
          max: m.max || 100,
          valueText: (m.unit === '€' ? money(m.value, '€') : String(m.value)) + ' / ' + (m.unit === '€' ? money(m.max, '€') : String(m.max)),
          caption: interp(m.caption || ''),
        }, container)
        return
      }
      if (t === 'TaskProgress') {
        // banner de subtareas N-de-M (checklist de operaciones): completo → panel success y
        // sin botón (contrato del componente); todo precomputado (el CSP de VB no compara)
        const total = m.total || 0
        const done = m.done || 0
        const complete = total > 0 && done >= total
        atom({
          isTaskProgress: true,
          label: interp(m.label || ''),
          value: done,
          max: total,
          valueText: chromeText('progressOf', { done, total }),
          panelClass: complete
            ? 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-success-30'
            : 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-neutral-20',
          actionLabel: !complete && m.actionId ? (m.actionLabel || '') : '',
          actionId: m.actionId || '',
          parameters: {},
        }, container)
        return
      }
      if (t === 'Stat') {
        atom({
          isStat: true,
          label: m.label || '',
          value: String(m.value == null ? '' : m.value) + (m.unit ? ' ' + m.unit : ''),
        }, container)
        return
      }
      if (t === 'Button') {
        const target = container || plain
        const last = target && target.items.length ? target.items[target.items.length - 1] : null
        const button = buttonOf(m)
        if (editorNodeIds && node.id) button.nodeId = String(node.id)
        if (last && last.isButtons) last.buttons.push(button)
        else atom({ isButtons: true, buttons: [button] }, container)
        return
      }
      // ── display components with their own projection (core/display.mjs) ──
      if (t === 'Kanban') { atom(kanbanAtomOf(m, interp), container); return }
      if (t === 'Timeline') { atom(timelineAtomOf(m, interp), container); return }
      if (t === 'PricingTable') { atom(pricingAtomOf(m, interp), container); return }
      if (t === 'OrgChart') { atom(orgChartAtomOf(m, interp), container); return }
      if (t === 'Heatmap') { atom(heatmapAtomOf(m), container); return }
      if (t === 'Funnel') { atom(funnelAtomOf(m, interp), container); return }
      if (t === 'FeatureGrid') { atom(featureGridAtomOf(m, interp), container); return }
      if (t === 'Testimonials') { atom(testimonialsAtomOf(m, interp), container); return }
      if (t === 'CalloutCard') { atom(calloutAtomOf(m, interp), container); return }
      if (t === 'CommentThread') { atom(commentsAtomOf(m, interp), container); return }
      if (t === 'FileList') { atom(fileListAtomOf(m, interp), container); return }
      if (t === 'Checklist') { atom(checklistAtomOf(m, interp), container); return }
      if (t === 'ComparisonCard') { atom(comparisonAtomOf(m, interp), container); return }
      if (t === 'ProcessMonitor') { atom(processMonitorAtomOf(m, interp), container); return }
      if (t === 'Skeleton') { atom(skeletonAtomOf(m), container); return }
      if (t === 'Icon') { atom(iconAtomOf(m), container); return }
      if (t === 'MenuBar') { atom(menuBarAtomOf(m, interp), container); return }
      if (t === 'Directory') { atom(directoryAtomOf(m, interp), container); return }
      if (t === 'MessageList') { atom(messageListAtomOf(m, interp), container); return }
      if (t === 'MessageInput') { atom(messageInputAtomOf(m, node.id), container); return }
      if (t === 'Chat') { atom(chatAtomOf(m, node.id), container); return }
      if (t === 'Bpmn') { atom(bpmnAtomOf(m, node.id), container); return }
      if (t === 'Workflow') { atom(workflowAtomOf(m), container); return }
      if (t === 'Result') { atom(resultAtomOf(m, interp), container); return }
      if (t === 'CookieConsent') { atom(cookieConsentAtomOf(m, interp), container); return }
      if (t === 'Breadcrumbs') { atom(breadcrumbsAtomOf(m, interp), container); return }
      if (t === 'Notification') { atom(notificationAtomOf(m, interp), container); return }
      if (t === 'MicroFrontend') {
        // a surface of its own, loaded from its baseUrl like a @Subresource (withSubresources paints it)
        const sub = microFrontendOf(m)
        atom({ isSubresource: true, islandId: sub.id, subresource: sub }, container)
        return
      }
      if (t === 'HeroSection') {
        // a hero in the content (the Welcome archetype paints its own with oj-sp-header-welcome-banner)
        atom(heroAtomOf(m, interp), container)
        for (const child of kidsOf(node)) visit(child, container)
        return
      }
      // an EmptyState inside the content (the host's FIRST one is the page-level oj-sp-empty-state
      // of emptyStateOf — painted there, not twice)
      if (t === 'EmptyState' && !(ctx.kind === 'host' && pageEmptyStateNode(ctx.tree) === node)) {
        atom(emptyStateAtomOf(m, interp), container)
        return
      }
      // a ProgressBar in the content (a wizard's own progress is its guided process, wizardOf)
      if (t === 'ProgressBar' && !wizardOf(ctx)) {
        atom(progressBarAtomOf(m, state, interp), container)
        return
      }
      if (t === 'ConfirmDialog') {
        // its message is its children; only open while openedCondition holds over the state
        const lines = kidsOf(node).flatMap((k) => collectTexts(k))
        atom(confirmDialogAtomOf(m, node.id, state, interp, lines), container)
        return
      }
      if (t === 'Faq') {
        // like an accordion: a collapsible header per question, the answer after it when open
        ;(m.items || []).forEach((item, i) => {
          const key = 'faq:' + (node.id && node.id !== 'fieldId' ? node.id : 'faq') + ':' + i
          const expanded = panelExpanded(key, !!item.open)
          atom({ isCollapsible: true, collapsibleKey: key, title: interp(item.question || ''), expanded, disabled: false }, container)
          if (expanded) atom({ isRichText: true, label: '', html: richHtmlOf('markdown', interp(item.answer || '')) }, container)
        })
        return
      }
      if (t === 'Tooltip') {
        // the wrapped component keeps its own view; the tooltip text opens in the shared popup
        // (hover.mjs) on hover/focus — on the button itself, or on an info marker next to it
        const text = interp(m.text || '')
        const wrapped = m.wrapped
        const wm = wrapped && wrapped.metadata
        if (wm && wm.type === 'Button') {
          atom({ isButtons: true, buttons: [{ ...buttonOf(wm), tooltip: text }] }, container)
          return
        }
        const inline = wm && (wm.type === 'Text' || wm.type === 'Badge' || wm.type === 'Icon' || wm.type === 'Anchor')
        if (inline) {
          const label = collectTexts(wrapped).map(interp).join(' ') || interp(wm.text || wm.icon || '')
          atom({ isTooltip: true, label, text }, container)
          return
        }
        if (wrapped) visit(wrapped, container)
        atom({ isTooltip: true, label: '', text, infoOnly: true }, container)
        return
      }
      if (t === 'ContextMenu') {
        if (m.wrapped) visit(m.wrapped, container)
        for (const child of kidsOf(node)) visit(child, container)
        atom(contextMenuAtomOf(m, interp), container)
        return
      }
      if (t === 'VirtualList') {
        // every item through the same visitor (a component), or as a line of text (plain data)
        const items = (m.page && m.page.content) || []
        for (const item of items) {
          if (item && typeof item === 'object' && (item.metadata || item.type)) visit(item.metadata ? item : { metadata: item }, container)
          else if (item && typeof item === 'object') {
            atom({ isPropertyRow: true, label: String(item.title || item.name || item.label || item.id || ''), value: Object.entries(item).filter(([k, v]) => v != null && typeof v !== 'object' && !/^(title|name|label|id)$/.test(k)).map(([k, v]) => k + ': ' + v).join(' · ') }, container)
          } else if (item != null) atom({ isText: true, text: String(item), cls: 'oj-typography-body-md' }, container)
        }
        return
      }
      if (t === 'Stepper') {
        // a numbered step per child (the wire record carries no fields of its own)
        kidsOf(node).forEach((child, i) => {
          const label = (child.metadata && (child.metadata.title || child.metadata.label)) || ''
          atom({ isStepHeader: true, number: String(i + 1), label: interp(label) }, container)
          visit(child, container)
        })
        return
      }
      if (t === 'FormEditor') {
        // the form the definition describes, painted with the form layout's real widgets (a preview)
        const def = formEditorFieldsOf(m)
        if (!def) { atom(unsupportedAtomOf('FormEditor', node.id), container); return }
        atom({ isText: true, isHeading: true, isH2: false, text: def.name, cls: 'oj-typography-subheading-xs' }, container)
        if (def.description) atom({ isText: true, text: def.description, cls: 'oj-typography-body-sm oj-text-color-secondary' }, container)
        const fields = def.fields.map((md) => layoutFieldOf(md, state, ctx.data, 2)).filter(Boolean)
        if (fields.length) atom({ isFormLayout: true, columns: 2, fields, readonly: false }, container)
        return
      }
      if (t === 'CarouselLayout') {
        // a carousel of arbitrary content (a gallery took the oj-film-strip branch above): one slide
        // at a time with its pager — the slide shown is client state (uiValueChanged)
        const slides = kidsOf(node)
        if (slides.length > 1) {
          const key = 'carousel:' + (node.id && node.id !== 'fieldId' ? node.id : 'carousel')
          const current = Math.max(0, Math.min(slides.length - 1, Number(uiValueOf(key, 0)) || 0))
          atom(carouselPagerAtomOf(key, current, slides.length, !!m.loop), container)
          visit(slides[current], container)
          return
        }
      }
      // a type nobody paints: a visible placeholder (like the web renderers), its children still render
      if (t && !VISITOR_PASS_THROUGH[t]) atom(unsupportedAtomOf(t, node.id), container)
      for (const child of kidsOf(node)) visit(child, container)
    }
    visit(ctx.tree, null)
    // HOISTING de la isla anidada: un bloque cuyo contenido es la isla (card "Documento")
    // se convierte en bloque isNestedBlock — el markup la pinta a nivel de BLOQUE porque
    // a más profundidad el evaluador CSP de VB deja de resolver los bindings del template
    const hoisted = blocks.map((block) => (
      block.items.some((a) => a.isNested)
        ? { ...block, isNestedBlock: true, items: block.items.filter((a) => !a.isNested) }
        : block
    ))
    const hasDisplay = hoisted.some((b) => b.items.some((a) => !a.isButtons) || b.isNestedBlock)
    // Only buttons: the generic form paints them under its fields — but a tree with NO field has no
    // generic form, and its buttons (a page that is a lone call to action, a tooltip on a button)
    // were painted by nobody. Then they are the content.
    const onlyButtons = !hasDisplay && hoisted.some((b) => b.items.some((a) => a.isButtons)) && !hasFormField(ctx.tree)
    return hasDisplay || onlyButtons ? hoisted : null
  }

  /** Does the surface hold any FormField (without crossing into an island)? */
  function hasFormField(node, isRoot = true) {
    if (!node || typeof node !== 'object') return false
    if (!isRoot && node.type === 'ServerSide') return false
    if (node.metadata && node.metadata.type === 'FormField') return true
    for (const v of Object.values(node)) {
      if (Array.isArray(v) ? v.some((x) => hasFormField(x, false)) : (v && typeof v === 'object' && hasFormField(v, false))) return true
    }
    return false
  }

  /** ¿Hace el contenido de la pantalla de cuerpo de la página? (si no, lo pinta el form genérico)
   *
   *  Sí cuando trae algo RICO (isRichAtom, una barra de pestañas, una tabla, un componente web, un
   *  listado @Subresource): sus campos ya se ven ahí. Y sí cuando el form genérico no tiene NADA
   *  que pintar: una página de solo lectura llega como textos sueltos — sus campos @ReadOnly son
   *  Text en el wire, no FormFields — y sin esta regla salía vacía (CustomerHistory). */
  function hostContentShown(blocks, summary) {
    if (!blocks || !blocks.length) return false
    const rich = (a) => isRichAtom(a) || !!(a && (a.isTabs || a.isGrid || a.isElement || a.isSubresource))
    if (blocks.some((block) => (block.items || []).some(rich))) return true
    // the page is laid out by a slot template (a form with its @Aside…): its fields are painted in it
    if (blocks.some((block) => block.fromTemplate)) return true
    const s = summary || {}
    return !s.formMetadata && !(s.fields || []).length && !(s.sections || []).length && !s.text
  }

  // ── @Subresource: listados embebidos en el contenido (P1) ─────────────────────────────────────
  //
  // Un campo @Subresource llega como un ServerSide INTERIOR (su isla) con un App de mediador cuya
  // homeRoute lleva `_hideTitle=1` (y `_scope`, y `_lazy` si es ON_OPEN): el servidor solo marca
  // así a los sub-recursos. Se carga al quedar a la vista — la pestaña activa —, con el estado que
  // el padre le siembra (initialData: el id del maestro) y su búsqueda OnLoad, y se pinta como una
  // tabla en su sitio del contenido.

  /** Si el nodo es la frontera de un @Subresource, cómo cargarlo; si no, null. */
  function subresourceIslandOf(node) {
    if (!node || typeof node !== 'object' || node.type !== 'ServerSide' || !node.id) return null
    const app = (node.children || [])[0]
    const md = app && app.metadata
    if (!md || md.type !== 'App' || md.variant !== 'MEDIATOR' || !md.homeRoute) return null
    const [path, query] = String(md.homeRoute).split('?')
    const params = {}
    for (const pair of String(query || '').split('&')) {
      if (!pair) continue
      const at = pair.indexOf('=')
      params[decodeURIComponent(at < 0 ? pair : pair.slice(0, at))] = at < 0 ? '' : decodeURIComponent(pair.slice(at + 1))
    }
    if (params._hideTitle !== '1') return null
    return {
      id: node.id,
      route: md.homeRoute,
      consumedRoute: md.homeConsumedRoute || path,
      serverSideType: md.homeServerSideType || node.serverSideType,
      // la marca de la ruta viaja también en el estado (_scope: lo que el padre fija), como en Vaadin
      componentState: { ...params, ...(node.initialData || {}) },
      lazy: params._lazy === '1',
    }
  }

  /** Los huecos @Subresource del contenido que aún no tienen su superficie cargada. */
  function pendingSubresourcesOf(blocks, contexts) {
    const out = []
    for (const block of blocks || []) {
      for (const a of block.items || []) {
        if (a && a.isSubresource && !(contexts && contexts[a.islandId] && contexts[a.islandId].tree)) out.push(a.subresource)
      }
    }
    return out
  }

  /** El contenido con cada hueco @Subresource cargado convertido en su tabla (o, si no es un
   *  listado, en su contenido). Los que aún no están cargados se quedan como hueco (no pintan). */
  function withSubresources(blocks, contexts) {
    if (!blocks) return blocks
    return blocks.map((block) => ({
      ...block,
      items: (block.items || []).flatMap((a) => {
        if (!a || !a.isSubresource) return [a]
        const ctx = contexts && contexts[a.islandId]
        if (!ctx || !ctx.tree) return [a]
        const crud = findByType(ctx.tree, 'Crud')
        if (!crud) {
          const inner = islandContentOf(ctx)
          const items = inner ? inner.flatMap((b) => b.items) : []
          // a MicroFrontend's surface: its actions go back to IT (dispatchHostBlockAction → surface)
          return a.subresource && a.subresource.surface ? tagSurfaceActions(items, a.islandId) : items
        }
        const md = crud.metadata || {}
        const wire = (md.columns || []).map((col) => col.metadata || col)
          // las acciones por fila no tienen sitio en la tabla de solo consulta
          .filter((c) => c.dataType !== 'actionGroup' && !(c.id === '_select' && c.stereotype === 'button'))
        const page = (((ctx.data || {}).crud || {}).page) || {}
        const rows = statusBadgeRows(page.content || [], wire)
        return [{
          isGrid: true,
          isSubresourceGrid: true,
          fieldId: a.islandId,
          label: md.title || '',
          columns: wire.map((c) => (c.dataType === 'status'
            ? { headerText: c.label || c.id, field: c.id, template: 'cellStatusBadge' }
            : { headerText: c.label || c.id, field: c.id })),
          rows,
          adp: dataProviderFactory ? dataProviderFactory(rows) : null,
          isEmpty: rows.length === 0,
          total: page.totalElements == null ? rows.length : page.totalElements,
          rowEditable: false,
          addActionId: '',
          addLabel: '',
        }]
      }),
    }))
  }

  /** Fusiona el contenido de la isla ANIDADA dentro de los bloques de la isla madre:
   *  el bloque isNestedBlock (la card que solo contenía la isla) pasa a ser una card
   *  normal cuyos items son los átomos de la anidada, MARCADOS fromNested (también sus
   *  botones) para que el dispatcher enrute sus acciones al contexto anidado. Motivo:
   *  leer $application.variables DENTRO de un template anidado no re-liga los contextos
   *  internos en el evaluador CSP de VB — los datos deben fluir por $current. */
  function mergeNestedContent(islandBlocks, nestedBlocks) {
    if (!islandBlocks) return islandBlocks
    const nestedAtoms = (nestedBlocks || []).reduce((out, block) => out.concat(block.items), [])
      .map((a) => {
        const marked = { ...a, fromNested: true }
        if (a.buttons) marked.buttons = a.buttons.map((btn) => ({ ...btn, fromNested: true }))
        if (a.fields) marked.fields = a.fields.map((f) => ({ ...f, fromNested: true }))
        return marked
      })
    return islandBlocks.map((block) => (
      block.isNestedBlock
        ? { ...block, isNestedBlock: false, isCard: true, isPlain: false, items: nestedAtoms }
        : block
    ))
  }

  /** Contenido display del HOST (páginas de detalle standalone: /encasa/:id, /checkout/:id,
   *  y los pasos del wizard /checkin/:id): los mismos bloques que una isla, con la PRIMERA
   *  isla del host (p.ej. el documento) fusionada en su hueco (atomos fromNested → despachan
   *  al contexto de la isla). En modo wizard se filtran el título de página, el ProgressSteps
   *  y los botones back/next: el guided process ya aporta rail, título y Continue. */
  /** ¿El card llevaba título? visit() lo mete como primer átomo de texto con la clase del
   *  subencabezado — que es justo lo que distingue una tarjeta de verdad del marco de la página. */
  function cardHasTitle(block) {
    const first = (block.items || [])[0]
    return !!(first && first.isText && String(first.cls || '').indexOf('oj-typography-subheading') >= 0)
  }

  /** The children of a slot-template grid ordered as the template's first row names their areas;
   *  the list as it came when any child carries no slot, or a slot the template does not name. */
  function kidsInAreaOrder(kids, areas) {
    const row = String(areas || '').split(/["'\n]/).map((r) => r.trim()).filter(Boolean)[0]
    if (!row) return kids
    const names = [...new Set(row.split(/\s+/))]
    const at = (k) => (k && k.slot ? names.indexOf(k.slot) : -1)
    if (!kids.length || kids.some((k) => at(k) < 0)) return kids
    return kids.map((k, i) => ({ k, i })).sort((a, b) => (at(a.k) - at(b.k)) || (a.i - b.i)).map((x) => x.k)
  }

  function hostContentOf(ctx, islandBlocks, opts = {}) {
    const blocks = islandContentOf(ctx, opts)
    if (!blocks) return null
    let merged = mergeNestedContent(blocks, islandBlocks || null)
    const title = opts.title || ''
    let titleDropped = false
    let entityDropped = false
    merged = merged
      .map((block) => ({
        ...block,
        items: block.items.filter((atom) => {
          // el título de Page sobra: la banda del header (o el guided process) ya lo pinta
          if (!titleDropped && atom.isText && title && atom.text === title) {
            titleDropped = true
            return false
          }
          // el TOOLBAR de Page tampoco va al contenido: se proyecta a las acciones del
          // header (pageToolbarOf → primary/secondary de la banda) — SALVO el de la ISLA
          // fusionada (fromNested, p.ej. Cancel/Save del editor del documento): ese
          // pertenece a la isla y se pinta en su bloque
          if (atom.fromPageToolbar && !atom.fromNested) return false
          // y el EntityHeader tampoco cuando el header de pantalla lo muestra (título/
          // subtítulo/facts del huésped en la banda, en vez del título genérico)
          if (opts.dropEntityHeader && atom.isEntityHeader && !entityDropped) {
            entityDropped = true
            return false
          }
          if (opts.forWizard) {
            if (atom.isProgress) return false
            // el contador «2 | 3» del RAIL (@WizardProgress(RAIL)): el oj-sp del proceso guiado
            // ya pinta el suyo en su raíl, uno más en el contenido es un duplicado
            if (atom.isText && /^\d+ \| \d+$/.test(String(atom.text || '').trim())) return false
            if (!opts.keepWizardNav && atom.isButtons && atom.buttons.length
                && atom.buttons.every((b) => b.actionId === 'next' || b.actionId === 'back')) return false
            // el pie del ÚLTIMO paso: Back + la acción de completar (@WizardCompletionAction) — el
            // pie del proceso guiado ya los pinta (wizardForwardOf), aquí salían duplicados
            if (!opts.keepWizardNav && atom.isButtons && atom.buttons.length === 2
                && atom.buttons.some((b) => b.actionId === 'back')
                && !atom.buttons.some((b) => b.actionId === 'next')) return false
          }
          return true
        }),
      }))
      .filter((block) => block.items.length)
      // el loop del host pinta los bloques dentro de un oj-flex: los bloques-columna de una
      // fila zonada llevan su colClass; el resto ocupa la fila entera (oj-sm-12)
      .map((block) => ({ ...block, blockClass: block.colClass || 'oj-flex-item oj-sm-12' }))
    // Un ÚNICO card SIN TÍTULO que envuelve todo el contenido no es una tarjeta: es el marco de
    // la página, y ése ya lo pinta el contenedor de contenido. Pintarlo además como oj-panel deja
    // una caja dentro de otra, que es como se veía cualquier pantalla con pestañas o con una
    // tabla dentro — mientras que una ficha normal (la rama de formulario) no la tiene. Con
    // título sí es una tarjeta de verdad y se respeta, igual que cuando hay varias.
    if (merged.length === 1 && merged[0].isCard && !cardHasTitle(merged[0])) {
      merged = [{ ...merged[0], isCard: false, isPlain: true }]
    }
    return merged.length ? merged : null
  }

  /** Acción FORWARD del wizard (Continue/Completar): se deriva del PIE real del árbol — el
   *  bloque de botones que acompaña a 'back' (los wizards ricos tienen además acciones de
   *  página como selectPax que NO son el forward; elegir "primera acción no-back" fallaba). */
  function wizardForwardOf(ctx) {
    const blocks = islandContentOf(ctx)
    if (!blocks) return null
    let forward = null
    for (const block of blocks) {
      for (const atomItem of block.items) {
        if (!atomItem.isButtons) continue
        const hasBack = atomItem.buttons.some((b) => b.actionId === 'back')
        const candidate = atomItem.buttons.find((b) => b.actionId !== 'back')
        if (candidate && (hasBack || candidate.actionId === 'next')) {
          forward = { actionId: candidate.actionId, label: candidate.label }
        }
      }
    }
    return forward
  }






  // Part of the Redwood core (reduceContexts.mjs re-exports every piece): the page header: entity header, KPIs, subtitle, toolbar, back/primary buttons, triggers.

  /** El EntityHeader del host (p.ej. el huésped de la Reserva 360) proyectado al HEADER de
   *  pantalla: título = el nombre, subtítulo = subtitle + badges, facts (+métrica) →
   *  contextualInfo del oj-sp-header-general-overview. */
  // Paneles cuyo contenido es de UN elemento de una colección (el detalle de una consola): un
  // EntityHeader ahí dentro es la ficha del elegido, no la entidad de la PÁGINA — subirlo a la
  // cabecera vaciaba el panel de detalle y ponía el nombre del huésped como título de la pantalla.
  const PANE_TYPES = { MasterDetailLayout: true, SplitLayout: true }
  function pageEntityHeaderNode(tree) {
    return findOutsidePanes(tree, 'EntityHeader')
  }
  /** findByType, pero sin entrar en los paneles de una consola (MasterDetailLayout/SplitLayout): lo
   *  que hay dentro es contenido de un panel, no una pieza de la PÁGINA (su cabecera, su cola). */
  function findOutsidePanes(tree, type) {
    return findOutside(tree, type, PANE_TYPES)
  }

  /** findByType sin bajar a los tipos de `stops`. */
  function findOutside(tree, type, stops) {
    let found = null
    const walk = (n) => {
      if (found || !n || typeof n !== 'object') return
      const t = n.metadata && n.metadata.type
      if (t === type) { found = n; return }
      if (t && stops[t]) return
      for (const c of n.children || []) walk(c)
      const inner = n.metadata && n.metadata.content
      if (Array.isArray(inner)) inner.forEach(walk)
      else if (inner && typeof inner === 'object') walk(inner)
    }
    walk(tree)
    return found
  }

  function entityHeaderOf(ctx) {
    const node = ctx && ctx.tree ? pageEntityHeaderNode(ctx.tree) : null
    if (!node) return null
    const m = node.metadata
    const state = ctx.state || {}
    const badgeText = (m.badges || []).map((b) => b.label).join(' · ')
    const facts = (m.facts || []).map((f) => ({ label: f.label, value: interpolate(f.value, state) }))
    if (m.metricLabel) facts.push({ label: m.metricLabel, value: interpolate(m.metricValue || '', state) })
    // los colores de Chip de Mateu → status del badge oj-sp
    const BADGE_STATUS = { success: 'success', error: 'danger', warning: 'warning', contrast: 'neutral', normal: 'info' }
    return {
      title: interpolate(m.title, state),
      subtitle: interpolate(m.subtitle || '', state) + (badgeText ? ' · ' + badgeText : ''),
      // el subtítulo SIN los badges concatenados (para templates que pintan el badge aparte)
      subtitlePlain: interpolate(m.subtitle || '', state),
      badges: (m.badges || []).map((b) => ({ label: b.label, status: BADGE_STATUS[b.color] || 'neutral' })),
      facts,
    }
  }

  /** Los KPIs de la Page (@KPI: Page.metadata.kpis = [{title, text}]) → facts del header de
   *  pantalla ({label, value}), como los del EntityHeader: los totales de una reserva arriba, junto
   *  al título, y no perdidos dentro de un panel. `text` puede llevar ${state.x}. */
  function pageKpisOf(ctx) {
    const page = ctx && ctx.tree ? findByType(ctx.tree, 'Page') : null
    if (!page) return []
    const state = ctx.state || {}
    return ((page.metadata || {}).kpis || [])
      .filter((k) => k && (k.title || k.text))
      .map((k) => ({ label: k.title || '', value: interpolate(k.text == null ? '' : String(k.text), state) }))
  }

  /** El subtítulo de la Page (SubtitleSupplier/@Subtitle: p.ej. los importes de una reserva) para
   *  el header de pantalla cuando no hay EntityHeader. Interpolado como el título. */
  function pageSubtitleOf(ctx) {
    const page = ctx && ctx.tree ? findByType(ctx.tree, 'Page') : null
    const subtitle = page && page.metadata ? page.metadata.subtitle : ''
    return subtitle ? interpolate(String(subtitle), ctx.state || {}) : ''
  }

  /** ITEM OVERVIEW nativo (oj-sp-item-overview-page): página de entidad con dos
   *  bloques-columna cuya PRIMERA zona es la ESTRECHA — la anatomía RDS del template
   *  (panel de datos clave a la izquierda + main ancho a la derecha), frente al general
   *  overview (main ancho primero + info estrecha después). El EntityHeader del host se
   *  convierte en el oj-sp-item-overview del slot overview (itemTitle/subtitle/badge +
   *  facts como filas clave en el body); un botón "Volver…" del toolbar pasa a la flecha
   *  goToParent del header de navegación del template y el resto a secondaryActions. */
  function itemOverviewPageOf(entity, blocks, toolbar) {
    if (!entity) return null
    const zoned = (blocks || []).filter((b) => /oj-md-/.test(b.blockClass || ''))
    if ((blocks || []).length !== 2 || zoned.length !== 2) return null
    const col = (b) => parseInt((b.blockClass.match(/oj-md-(\d+)/) || [])[1] || '0', 10)
    if (col(zoned[0]) >= col(zoned[1])) return null // la ancha primero → general overview
    const full = (b) => Object.assign({}, b, { blockClass: 'oj-flex-item oj-sm-12' })
    const back = (toolbar || []).find((b) => /^volver\b/i.test(b.label || ''))
    const badge = (entity.badges || [])[0] || null
    return {
      on: true,
      overview: {
        title: entity.title || '',
        subtitle: entity.subtitlePlain != null ? entity.subtitlePlain : (entity.subtitle || ''),
        badge: badge ? { text: badge.label, status: badge.status, style: 'subtle', position: 'trailing' } : null,
        facts: entity.facts || [],
        blocks: [full(zoned[0])],
      },
      main: { blocks: [full(zoned[1])] },
      back: { show: !!back, actionId: back ? back.actionId : '', label: back ? back.label : '' },
      secondary: (toolbar || []).filter((b) => b !== back)
        .map((b) => ({ id: b.actionId, value: b.actionId, label: b.label })),
    }
  }

  /**
   * The record/context SWITCHER of the page header (RecordSwitcherSupplier → Page.metadata.switcher;
   * the Redwood selectObject/selectContext element). oj-sp's header draws it natively: an
   * oj-sp-data-switcher (the title becomes the switcher for `object`; the context switcher sits beside
   * it for `context`), searchable through displayOptions.switcherSearch. Picking an entry dispatches
   * `actionId` with `{_record: value}`.
   *
   * Always an object (the VB bindings read its fields unconditionally): `on` false without one. The
   * options of the type that is NOT in use stay empty — an empty DataProvider is how oj-sp's header
   * knows not to draw that switcher. A DISABLED switcher draws no switcher at all (the data switcher
   * has no read-only mode): the current entry becomes a contextual fact, labelled with the hint.
   */
  const RECORD_SWITCHER_ACTION = '_switchRecord'
  const RECORD_SWITCHER_PARAMETER = '_record'
  function pageSwitcherOf(ctx) {
    const page = ctx && ctx.tree ? findByType(ctx.tree, 'Page') : null
    const sw = page && page.metadata ? page.metadata.switcher : null
    const none = { on: false, type: 'object', value: null, label: '', searchable: false, disabled: false,
      actionId: RECORD_SWITCHER_ACTION, objectOptions: [], contextOptions: [], fact: null }
    if (!sw || !Array.isArray(sw.options) || !sw.options.length) return none
    const options = sw.options
      .filter((o) => o && o.value != null)
      .map((o) => ({ value: String(o.value), label: o.label == null ? String(o.value) : String(o.label), description: o.description || '' }))
    const type = sw.type === 'context' ? 'context' : 'object'
    const value = sw.value == null ? null : String(sw.value)
    const current = options.find((o) => o.value === value)
    const disabled = !!sw.disabled
    return {
      on: true,
      type,
      value,
      label: sw.label || '',
      searchable: !!sw.searchable,
      disabled,
      actionId: sw.actionId || RECORD_SWITCHER_ACTION,
      objectOptions: !disabled && type === 'object' ? options : [],
      contextOptions: !disabled && type === 'context' ? options : [],
      fact: disabled && current ? { label: sw.label || '', value: current.label } : null,
    }
  }

  /** The action a pick of the header switcher runs, or null when nothing changed (the data switcher
   *  also writes back the value it was given, and an echo must not re-run the page). */
  function switcherPickOf(switcher, picked) {
    if (!switcher || !switcher.on || switcher.disabled || picked == null) return null
    const value = typeof picked === 'object' ? (picked.value != null ? picked.value : picked.key) : picked
    if (value == null || String(value) === String(switcher.value)) return null
    return { actionId: switcher.actionId || RECORD_SWITCHER_ACTION, parameters: { [RECORD_SWITCHER_PARAMETER]: String(value) } }
  }

  /** El TOOLBAR de la Page del host (para las acciones del header de banda):
   *  [{actionId, label, chroming}]. El de estilo primary va al primaryAction del header. */
  function pageToolbarOf(ctx) {
    if (!ctx || !ctx.tree) return []
    // a fluent/YAML `Form` carries its toolbar exactly like a reflected Page does
    const page = findByType(ctx.tree, 'Page') || findByType(ctx.tree, 'Form')
    if (!page) return []
    return (page.metadata.toolbar || [])
      // a ButtonGroup (a toolbar's dropdown: on the wire a Button with `children`, no action of its
      // own) brings its buttons — the header's actions list them
      .flatMap((b) => (b && !b.actionId && Array.isArray(b.children || b.buttons) ? (b.children || b.buttons) : [b]))
      .filter((b) => b && b.actionId)
      .map((b) => ({
        actionId: b.actionId,
        label: b.label || b.actionId,
        chroming: b.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
        disabled: !!b.disabled,
      }))
  }

  /**
   * Cuál de los botones del toolbar ocupa el hueco de acción PRIMARIA de la cabecera.
   *
   * `oj-sp-header-general-overview` da UN hueco visible para la primaria y pinta la primera
   * secundaria como botón; el resto va al desbordamiento `···`. Con lo que manda el wire hoy —
   * ningún botón marcado `primary` en la vista de un crud — todo caía en secundarias y la acción
   * de verdad (Edit) quedaba escondida detrás de los puntos suspensivos.
   *
   * Manda el wire cuando dice algo (`buttonStyle: primary`). Si no dice nada, se toma la ÚLTIMA
   * que no sea de vuelta: en los toolbars de Mateu el orden es "salir, …, avanzar" — Cancel→Save,
   * Back to list→Add another→Edit —, así que la última no-vuelta es la que uno vino a hacer.
   * Heurística explícita, a sustituir el día que el wire traiga el rol del botón.
   */
  const BACK_ACTIONS = { back: true, 'back-to-list': true, close: true, cancel: true }
  // `cancel` y los `cancel-<modo>` del crud (cancel-view, cancel-edit, cancel-new) son la vuelta;
  // una acción del dominio que EMPIEZA por cancel no lo es: el «Cancel booking» de una reserva
  // (`cancelBooking`) acababa convertido en el enlace de vuelta de la cabecera.
  const isBackButton = (button) => !!button && (
    BACK_ACTIONS[button.actionId] || /^cancel-/.test(String(button.actionId || '')))

  /** El botón de VOLVER del toolbar, si lo hay: en RDS eso no es una acción más, es la
   *  afordancia `goToParent` de la cabecera — meterlo entre las secundarias lo esconde en el
   *  desbordamiento justo cuando es lo que más se pulsa. */
  function backToolbarButton(toolbar) {
    return (toolbar || []).find(isBackButton) || null
  }

  function primaryToolbarButton(toolbar) {
    const buttons = toolbar || []
    const declared = buttons.find((b) => b.chroming === 'callToAction')
    if (declared) return declared
    for (let i = buttons.length - 1; i >= 0; i -= 1) {
      if (!isBackButton(buttons[i])) return buttons[i]
    }
    return null
  }

  /**
   * El botón del toolbar que eligió una ACCIÓN SECUNDARIA de un header oj-sp (spSecondaryAction),
   * o null. Los items que les pasamos son { id: actionId, value: actionId, label }, y el header
   * devuelve el item por su id (p.ej. 'walkIn') — o, según la variante, el objeto entero o su
   * label —, así que se resuelve PRIMERO por actionId y sólo después por el rótulo. Buscarlo
   * sólo por label dejaba muertas las secundarias de un listado: el id nunca es el rótulo.
   */
  function secondaryActionOf(detail, toolbar) {
    const d = detail || {}
    const item = d.secondaryItem != null ? d.secondaryItem : (d.item != null ? d.item : d.value)
    const keys = []
    const add = (k) => { if (k != null && k !== '' && typeof k !== 'object') keys.push(String(k)) }
    if (item && typeof item === 'object') {
      add(item.id); add(item.value); add(item.actionId); add(item.key); add(item.label)
    } else {
      add(item)
    }
    add(d.id)
    if (!keys.length) return null
    const buttons = (toolbar || []).filter((b) => b && b.actionId)
    for (const k of keys) {
      const byId = buttons.find((b) => String(b.actionId) === k)
      if (byId) return byId
    }
    for (const k of keys) {
      const byLabel = buttons.find((b) => b.label === k)
      if (byLabel) return byLabel
    }
    return null
  }

  /** Descartar el overlay superior SIN guardar (✕/Esc/backdrop — no emite evento alguno). */
  function dismissOverlay(reg) {
    if (!reg.stack || !reg.stack.length) return reg
    const id = reg.stack[reg.stack.length - 1]
    const contexts = { ...reg.contexts }
    delete contexts[id]
    return { ...reg, contexts, stack: reg.stack.slice(0, -1) }
  }

  /** Acciones suscritas a un evento del bus (@SubscribeTo): p.ej. el listing refresca con
   *  'search' cuando el CloseModal del drawer emite mateu-crud:saved-in-drawer. */
  function eventTriggersOf(ctx, eventName) {
    return ((ctx && ctx.tree && ctx.tree.triggers) || [])
      .filter((t) => t.type === 'OnCustomEvent' && t.eventName === eventName && t.actionId)
      .map((t) => t.actionId)
  }

  /** Trigger @AutoSave/AutoSaveTrigger del host (buscar-al-teclear, autoguardado):
   *  {actionId, debounceMillis} o null. El renderer lo honra re-lanzando la acción
   *  debounced en cada pulsación (raw-value de los inputs del host). */
  function autoSaveOf(ctx) {
    const trigger = ((ctx && ctx.tree && ctx.tree.triggers) || [])
      .find((t) => t.type === 'AutoSave' && t.actionId)
    return trigger
      ? { actionId: trigger.actionId, debounceMillis: trigger.debounceMillis || 400 }
      : null
  }

  /** Proyección del HOST para la superficie de contenido (título, texto, form, acciones). */
  /** La opción de menú de una ruta, a cualquier profundidad. */
  function menuOptionAt(options, route) {
    for (const option of options || []) {
      if ((option.route || option.path) === route) return option
      const found = menuOptionAt(option.submenus || option.submenu, route)
      if (found) return found
    }
    return null
  }

  /** El título que declara el Crud del host, si lo hay. */
  function crudTitleOf(host) {
    const crud = host && host.tree ? findByType(host.tree, 'Crud') : null
    return crud && crud.metadata ? crud.metadata.title : ''
  }

  /** The form's action row minus the buttons its sections already draw (sectionButtonsOf). */
  function withoutSectionButtons(actions, sections) {
    const drawn = {}
    for (const sec of sections || []) for (const b of (sec.titleButtons || []).concat(sec.footerButtons || [])) drawn[b.actionId] = true
    return (actions || []).filter((a) => !drawn[a.actionId])
  }

  function summarizeHost(reg, route) {
    const host = reg.contexts[HOST_ID] || {}
    const pageMetadata = (((host.tree || {}).children || [])[0] || {}).metadata || {}
    const menu = (reg.shell && reg.shell.menu) || []
    // a CUALQUIER profundidad: en una shell federada la pantalla que se está viendo cuelga del
    // grupo del pod, dos niveles por debajo, y buscar solo en el primero dejaba el título vacío
    const option = menuOptionAt(menu, route)
    // un listado (pageType collection) también lleva FormFields (columnas) — NO es un form
    const isFormPage = host.pageType !== 'collection' && host.pageType !== 'landing'
    const formMetadata = host.tree && isFormPage ? dynFormMetadataOf(host.tree) : null
    const state = host.state || {}
    const fields = formMetadata ? fieldListOf(host.tree, state, host.data) : []
    const sections = formMetadata ? formSectionsOf(host.tree, state, host.data) : []
    return {
      // la Page de un listado no lleva título: viaja en la metadata del Crud, y si tampoco
      // está, en el rótulo del menú
      title: pageMetadata.title || crudTitleOf(host) || (option && (option.caption || option.label)) || '',
      // el rastro automático (breadcrumbs.mjs): la cabecera saca de él su «ir al padre». Apagado con
      // @NoBreadcrumbs en la página o en la shell
      trail: pageMetadata.noBreadcrumbs || (reg.shell && reg.shell.noBreadcrumbs)
        ? []
        : autoTrail(menu, route, { title: pageMetadata.title || crudTitleOf(host) }),
      text: formMetadata ? '' : String(state.message == null ? '' : state.message),
      formMetadata,
      fields,
      sections,
      formValue: formMetadata ? { ...state } : null,
      // the buttons a section draws itself (title row / under its content) leave the form's row
      actions: host.tree ? withoutSectionButtons(actionsOf(host.tree), sections) : [],
    }
  }









  // Part of the Redwood core (reduceContexts.mjs re-exports every piece): listings: the table, paging, sort, selection, filters and the smart search bar.

  /** Helper de RENDER: primer nodo del árbol con metadata.type dado. */
  function findByType(tree, type) {
    let found = null
    const walk = (node) => {
      if (found || !node || typeof node !== 'object') return
      if (node.metadata && node.metadata.type === type) { found = node; return }
      for (const v of Object.values(node)) {
        if (Array.isArray(v)) v.forEach(walk)
        else if (v && typeof v === 'object') walk(v)
      }
    }
    walk(tree)
    return found
  }

  /** Primer nodo de la SUPERFICIE (sin cruzar islas) que cumple `test`; null si ninguno. */
  function findFirst(tree, test) {
    let found = null
    walkWithinSurface(tree, (n) => { if (!found && test(n)) found = n })
    return found
  }

  /** Proyección del LISTING (componente Crud): columnas + filas (del eje data) + búsqueda.
   *  null si el contexto no contiene un Crud. Las filas llegan por la acción 'search'
   *  (trigger OnLoad) como fragmento data-only: data.crud.page.content. */
  /**
   * El listado del host listo para pintar. `allColumns` son todas las del wire (de ahí parte el
   * diálogo de columnas) y `columns` las que se pintan, con las preferencias del usuario aplicadas
   * (prefs.mjs: ocultas fuera, en su orden) — leídas por columnPrefsReader (localStorage por ruta).
   */
  function listingOf(ctx, opts = {}) {
    const listing = listingBaseOf(ctx, opts)
    if (!listing) return listing
    const prefs = columnPrefsReader ? columnPrefsReader() : null
    // PRE-SEARCH content (Listing.preSearch / SmartSearchPage.preSearchContent → CrudlDto.preSearch,
    // the smart-filter-search `dashboard` slot): until the first search answers, those components
    // stand IN PLACE of the results — the table (and its empty state) is hidden and the blocks go
    // where the listing's header blocks go. oj-sp's own dashboard slot is a side column counted at
    // mount, not a stand-in that leaves, so the projection does it.
    const preSearch = listingPreSearchBlocksOf(ctx)
    const header = listingHeaderBlocksOf(ctx)
    return { ...listing, allColumns: listing.columns, columns: applyColumnPrefs(listing.columns, prefs),
      headerBlocks: preSearch ? header.concat(preSearch) : header,
      showPreSearch: !!preSearch,
      ...(preSearch ? {
        tableClass: listing.tableClass + ' oj-helper-hidden',
        paging: { ...listing.paging, visible: false },
      } : {}),
    }
  }

  /**
   * Whether a plain click on a row of this listing opens its record (the crud's `view` action). Only
   * when the listing says so: its first column carries the `view` action (`navigable`, which the
   * server leaves out for `@NotNavigable` and for listings without a way into a record). A listing
   * that does not — a status board you select rows on, a report — keeps the click for itself, like
   * the web renderer, instead of asking the server for a record page it did not offer.
   */
  function rowClickOpensRecord(listing) {
    return !listing || listing.navigable !== false
  }

  /** Whether the listing has had a search answered: the server's page arrives in ctx.data.crud. */
  function listingSearchedOf(ctx) {
    const crud = ctx && ctx.data ? ctx.data.crud : null
    return !!(crud && crud.page)
  }

  /** The pre-search blocks while no search has answered yet; null otherwise (or when none). */
  function listingPreSearchBlocksOf(ctx) {
    const crudNode = ctx && ctx.tree ? findByType(ctx.tree, 'Crud') : null
    const pre = crudNode && crudNode.metadata && Array.isArray(crudNode.metadata.preSearch) ? crudNode.metadata.preSearch : []
    if (!pre.length || listingSearchedOf(ctx)) return null
    // kind island: as host content the first EmptyState is the page's own one, and skipped
    const blocks = islandContentOf({ ...ctx, kind: 'island', tree: { type: 'ClientSide', id: '_listingPreSearch', metadata: { type: 'VerticalLayout' }, children: pre } }) || []
    const out = blocks.map((b) => ({ ...b, blockClass: b.colClass || 'oj-flex-item oj-sm-12', preSearch: true }))
    return out.length ? out : null
  }

  /** Los componentes de CABECERA de la página del listado (HeaderSupplier → Page.metadata.header)
   *  como bloques de átomos: el listado no tiene contenido propio donde ponerlos. */
  function listingHeaderBlocksOf(ctx) {
    const pageNode = ctx && ctx.tree ? findByType(ctx.tree, 'Page') : null
    const header = pageNode && pageNode.metadata && Array.isArray(pageNode.metadata.header) ? pageNode.metadata.header : []
    if (!header.length) return []
    const blocks = islandContentOf({ ...ctx, tree: { type: 'ClientSide', id: '_listingHeader', metadata: { type: 'VerticalLayout' }, children: header } }) || []
    return blocks.map((b) => ({ ...b, blockClass: b.colClass || 'oj-flex-item oj-sm-12' }))
  }

  function listingBaseOf(ctx, opts = {}) {
    const crudNode = ctx && ctx.tree ? findByType(ctx.tree, 'Crud') : null
    if (!crudNode) return null
    const md = crudNode.metadata
    const page = (((ctx.data || {}).crud || {}).page) || {}
    // FILAS DE VARIAS LÍNEAS (@Line → GridColumn.line): las columnas de la línea 1 son las de la
    // tabla (cabecera, orden, anchos); las demás se pintan DEBAJO de cada fila, a lo ancho, como
    // pares «Etiqueta: valor» secundarios — ver rowLinesOf / la plantilla cellLines
    const lines = rowLinesSplit(md.columns || [])
    const tableColumns = lines.extra.length ? lines.first : (md.columns || [])
    return {
      // PAGINACIÓN: la página que mandó el server (Page: pageNumber/pageSize/totalElements) →
      // pie de la tabla con el rango y los controles; precomputado (CSP de VB)
      paging: listingPagingOf(page, md.pageSize || 20, opts.lang),
      title: md.title || '',
      subtitle: md.subtitle || '',
      // @RowRoute / Listing.rowRoute: una fila ABRE una ruta (el maestro de un registro) — ver rowRouteOf
      rowRoute: md.rowRoute || '',
      searchable: !!md.searchable,
      pageSize: md.pageSize || 20,
      emptyStateMessage: md.emptyStateMessage || 'No data.',
      columns: tableColumns.map((col) => {
        const c = col.metadata || col
        const def = { headerText: c.label || c.id, field: c.id }
        // celda editable → plantilla de editor por tipo (siempre visible, commit por celda:
        // el contrato es update-row + parameters._editedRow; fixtures/real/update-row.json)
        if (c.editable && c.editorType) {
          def.template = c.editorType === 'boolean' ? 'cellEditBoolean'
            : (c.editorType === 'integer' || c.editorType === 'number') ? 'cellEditNumber'
              : 'cellEditText'
        }
        // ACCIONES por fila (ColumnActionGroup): botones que despachan
        // action-on-row-<método> con el id de la fila (Listing.handleActionOnRow)
        if (c.dataType === 'actionGroup') {
          def.template = 'cellRowActions'
          def.headerText = ''
          def.sortable = 'disabled'
        }
        // la clave de la columna = el id del wire: el ojSort la devuelve y es lo que el server
        // ordena (la celda puede leer otro campo, p.ej. el UUID abreviado)
        def.id = c.id
        // pie de totales (@Aggregate): la plantilla footerTotal lee totals[columnKey]
        if (aggregateFootersOf(md, (ctx.data || {}).crud)) def.footerTemplate = 'footerTotal'
        // ESTADO como badge (@Status): el valor de la celda es {type, message} — la clase
        // JET del badge se precomputa en las filas (statusBadgeRows, CSP sin ternarios)
        if (c.dataType === 'status') {
          def.template = 'cellStatusBadge'
        }
        // COLUMNA PRINCIPAL (@PrimaryColumn: stereotype 'primary'): imagen delante del título
        // (leadingPath, p.ej. la bandera del huésped) y línea de caption debajo (captionPath) —
        // campos de la fila que no son columnas. Precomputado por fila en primaryCellRows (CSP).
        if (!def.template && c.stereotype === 'primary') {
          def.field = c.id + PRIMARY_CELL_SUFFIX
          def.template = 'cellPrimary'
        }
        // UUID abreviado: una columna de texto cuyos valores son UUID se pinta "…-<último bloque>"
        // con el UUID entero en el tooltip. La fila NO cambia: la celda lee un campo aparte,
        // precomputado en uuidCellRows (CSP de VB: la plantilla no puede recortar el texto).
        if (!def.template && uuidColumnIds(page.content || [], md.columns || []).indexOf(c.id) >= 0) {
          def.field = c.id + UUID_CELL_SUFFIX
          def.template = 'cellUuid'
        }
        // ANCHO de la columna (@ColumnWidth: width + flexGrow "0" + tooltipPath en el wire, el
        // mismo contrato que aplica el gridRenderer de Vaadin): oj-table fija ese ancho; con
        // flexGrow 0 la columna no crece (min = max = width) y su texto se corta con elipsis,
        // entero en el tooltip (tooltipPath). Las demás columnas siguen a su contenido.
        Object.assign(def, columnWidthOf(c))
        if (!def.template && clipColumn(c)) {
          def.field = c.id + CLIP_CELL_SUFFIX
          def.template = 'cellClip'
        }
        return def
      }).concat(lines.extra.length ? [ROW_LINES_COLUMN] : []),
      // nº de líneas extra (0 = listado normal) y la clase de la tabla que les hace sitio
      // (PRECOMPUTADA: CSP de VB)
      extraLines: lines.extra.length,
      tableClass: lines.extra.length ? 'oj-sm-12 mateu-multiline-table mateu-lines-' + Math.min(lines.extra.length, 4) : 'oj-sm-12',
      // densidad Redwood de la tabla: el 'grid' compacto es para tablas de TRABAJO —
      // se activa cuando el crud es editable inline (@InlineEditing marca las columnas
      // como editable en el wire); un listado de consulta queda en 'list' (aireado).
      // PRECOMPUTADO (CSP de VB).
      display: (md.columns || []).some((col) => (col.metadata || col).editable) ? 'grid' : 'list',
      // tabla de TRABAJO: el clic de fila NO navega (las celdas se editan in situ)
      editable: (md.columns || []).some((col) => (col.metadata || col).editable),
      // DETALLE de fila (@Details en la fila): el campo que no es columna y se abre al pulsar la
      // fila. Una fila NAVEGABLE (primera columna con actionId 'view') sigue abriendo el registro:
      // el detalle es para los listados de consulta, donde el clic no tenía otro destino.
      detailPath: md.detailPath || null,
      navigable: (md.columns || []).some((col, i) => i === 0 && (col.metadata || col).actionId === 'view'),
      // SELECCIÓN de filas (Listing.rowsSelectionEnabled): casillas en la tabla, y las acciones de la
      // toolbar reciben las filas marcadas en crud_selected_items — el mismo contrato que Vaadin
      // (HttpRequest.getSelectedRows lo lee del componentState). El modo va PRECOMPUTADO (CSP de VB).
      rowsSelectionEnabled: !!md.rowsSelectionEnabled,
      selectionMode: { row: md.rowsSelectionEnabled ? 'multiple' : 'none' },
      // las acciones que no tienen sentido sin selección (Action.rowsSelectedRequired: Delete…)
      // (las acciones declaradas del ServerSide host, no los botones)
      selectionRequired: ((ctx.tree && ctx.tree.actions) || [])
        .filter((a) => a.rowsSelectedRequired).map((a) => a.id),
      // @RowStatus: cada fila lleva su tono (_tone) — lo pinta tables.mjs sobre los tr del oj-table;
      // @GroupBy: filas de grupo intercaladas (valor (n) + subtotales), sólo presentación
      rows: groupedRows(toneRows(rowLinesRows(clipCellRows(primaryCellRows(uuidCellRows(statusBadgeRows(page.content || [], md.columns || []), md.columns || []), md.columns || []), md.columns || []), lines.extra), md.rowStatusField), md, (ctx.data || {}).crud),
      // @Aggregate: los totales del conjunto filtrado, por columna (pie del oj-table)
      totals: aggregateFootersOf(md, (ctx.data || {}).crud),
      hasTotals: !!aggregateFootersOf(md, (ctx.data || {}).crud),
      rowStatusField: md.rowStatusField || '',
      // @DragRows: las filas se arrastran (JET oj-table dnd) con este tipo MIME — dnd.mjs
      dragType: md.dragType || '',
      dragTypes: md.dragType ? [dragMimeOf(md.dragType)] : [],
      // la propiedad por la que ordena el server cada columna (GridColumn.sortingProperty o su id)
      sortFields: Object.fromEntries((md.columns || []).map((col) => col.metadata || col)
        .map((c) => [c.id, c.sortingProperty || c.id])),
      total: page.totalElements == null ? null : page.totalElements,
      isEmpty: (page.content || []).length === 0,
      toolbar: (md.toolbar || []).map((b) => ({
        actionId: b.actionId,
        label: b.label,
        chroming: b.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
        disabled: !!b.disabled,
      })),
      // selector RÁPIDO del listado: filtros de opciones (p.ej. un enum en Filters, como
      // la Vista del listado de reservas) → chips oj-sp-filter-chip junto al smart search;
      // los filtros viajan como FormField select en la metadata (a veces en el mediator,
      // no en el nodo Crud — se busca en todo el árbol)
      filters: filtersOf(ctx),
    }
  }

  // los textos del pie, del catálogo de la interfaz (i18n.mjs)
  function pagingLangOf(lang) {
    const l = chromeLanguage(lang)
    const t = (key) => chromeText(key, null, l)
    return { of: t('pagingOf'), page: t('pagingPage'), first: t('pagingFirst'), prev: t('pagingPrev'), next: t('pagingNext'), last: t('pagingLast') }
  }

  /**
   * La PAGINACIÓN del listado, de la Page que manda el server (pageNumber/pageSize/totalElements) →
   * lo que pinta el pie de la tabla: "11–20 de 57", "Página 2 de 6" y qué botones están activos.
   * Sin total conocido (un Listing que no cuenta) hay "siguiente" mientras la página venga llena.
   * `visible` = hay más de una página (un listado corto no lleva pie).
   */
  function listingPagingOf(page, fallbackSize, lang) {
    const p = page || {}
    const t = pagingLangOf(lang)
    const size = p.pageSize > 0 ? p.pageSize : (fallbackSize > 0 ? fallbackSize : 20)
    const number = p.pageNumber > 0 ? p.pageNumber : 0
    const shown = (p.content || []).length
    const total = p.totalElements == null || p.totalElements < 0 ? null : p.totalElements
    const pageCount = total == null ? null : Math.max(1, Math.ceil(total / size))
    const from = shown === 0 ? 0 : number * size + 1
    const to = number * size + shown
    const hasPrev = number > 0
    const hasNext = total == null ? shown >= size : (number + 1) * size < total
    return {
      pageNumber: number,
      pageSize: size,
      total,
      pageCount,
      lastPage: pageCount == null ? null : pageCount - 1,
      hasPrev,
      hasNext,
      hasLast: hasNext && pageCount != null,
      // los disabled ya negados (CSP de VB: la plantilla no evalúa "!")
      prevDisabled: !hasPrev,
      nextDisabled: !hasNext,
      lastDisabled: !(hasNext && pageCount != null),
      visible: hasPrev || hasNext,
      rangeText: total == null ? `${from}–${to}` : `${from}–${to} ${t.of} ${total}`,
      pageText: pageCount == null ? `${t.page} ${number + 1}` : `${t.page} ${number + 1} ${t.of} ${pageCount}`,
      labels: { first: t.first, prev: t.prev, next: t.next, last: t.last },
    }
  }

  /**
   * La página a la que lleva un botón del pie: 'first' | 'prev' | 'next' | 'last' sobre el paging
   * actual → número de página, o null si el botón no lleva a ningún sitio.
   */
  function targetPageOf(paging, which) {
    if (!paging) return null
    if (which === 'first') return paging.hasPrev ? 0 : null
    if (which === 'prev') return paging.hasPrev ? paging.pageNumber - 1 : null
    if (which === 'next') return paging.hasNext ? paging.pageNumber + 1 : null
    if (which === 'last') return paging.hasLast ? paging.lastPage : null
    const n = Number(which)
    return Number.isInteger(n) && n >= 0 ? n : null
  }

  /**
   * El componentState de una búsqueda del listado: el estado del host + el texto, la página, el
   * tamaño, el orden y los filtros aplicados (los chips; un rango ocupa dos claves) — lo que
   * SearchActionHandler lee. Paginar o reordenar conserva texto y filtros; el orden viaja como
   * lista [{field, direction}] y sólo si lo hay.
   */
  function listingSearchStateOf(hostState, opts = {}) {
    const state = Object.assign({}, hostState || {}, {
      searchText: opts.searchText == null ? '' : opts.searchText,
      page: opts.page > 0 ? opts.page : 0,
      size: opts.size > 0 ? opts.size : 20,
    })
    const applied = opts.filters || {}
    for (const key of Object.keys(applied)) state[key] = applied[key]
    if (opts.sort && opts.sort.length) state.sort = opts.sort.map((s) => ({ field: s.field, direction: s.direction }))
    else delete state.sort
    return state
  }

  /**
   * El orden pedido por la cabecera de oj-table (ojSort: detail.header = clave de la columna,
   * detail.direction 'ascending'|'descending') → [{field, direction}] en el vocabulario del
   * server (io.mateu.uidl.data.Sort). La clave es el id del wire (listingOf la fija); si llega el
   * campo de la celda (p.ej. el UUID abreviado), se le quita el sufijo.
   */
  function listingSortOf(detail, sortFields) {
    if (!detail || !detail.header) return []
    const key = String(detail.header).replace(new RegExp('(' + UUID_CELL_SUFFIX + '|' + PRIMARY_CELL_SUFFIX + '|' + CLIP_CELL_SUFFIX + ')$'), '')
    const field = (sortFields && sortFields[key]) || key
    const direction = detail.direction === 'descending' ? 'descending' : 'ascending'
    return [{ field, direction }]
  }

  /**
   * La selección de la tabla, en una forma que sobrevive a un refresco: el KeySet de oj-table
   * (`detail.value.row` de ojSelectedChanged) → { all, keys, except }. Un "seleccionar todo" es
   * un KeySet de tipo addAll: todas menos las desmarcadas, no una lista de claves.
   */
  function selectionOfKeySet(keySet) {
    if (!keySet) return { all: false, keys: [], except: [] }
    if (typeof keySet.isAddAll === 'function' && keySet.isAddAll()) {
      const deleted = typeof keySet.deletedValues === 'function' ? Array.from(keySet.deletedValues()) : []
      return { all: true, keys: [], except: deleted }
    }
    const values = typeof keySet.values === 'function' ? Array.from(keySet.values()) : []
    return { all: false, keys: values, except: [] }
  }

  /** Las filas marcadas, resueltas contra las filas ACTUALES por su clave (_rowNumber). Lo que se
   *  manda es la fila tal como llegó: el badge precomputado de las columnas @Status no viaja. */
  function selectedRowsOf(rows, selection) {
    if (!selection) return []
    const picked = selection.all
      ? (rows || []).filter((r) => selection.except.indexOf(r._rowNumber) < 0)
      : (rows || []).filter((r) => selection.keys.indexOf(r._rowNumber) >= 0)
    return picked.map((row) => {
      const out = {}
      for (const key of Object.keys(row)) {
        const value = row[key]
        if (key.endsWith(UUID_CELL_SUFFIX) || key.endsWith(CLIP_CELL_SUFFIX)) {
          continue
        }
        if (value && typeof value === 'object' && !Array.isArray(value) && 'badgeClass' in value) {
          const { badgeClass, ...rest } = value
          out[key] = rest.plain ? rest.message : rest
        } else {
          out[key] = value
        }
      }
      return out
    })
  }

  /** El componentState de una acción del host de un listado con selección: lleva las filas
   *  marcadas en crud_selected_items, como Vaadin. Sin listado o sin selección, intacto. */
  function withListingSelection(componentState, listing, rows, selection) {
    if (!listing || !listing.rowsSelectionEnabled) return componentState
    return Object.assign({}, componentState, { crud_selected_items: selectedRowsOf(rows, selection) })
  }

  // filas con columnas @Status: al valor {type, message} se le estampa la clase badge de
  // JET (Redwood, sistema) — el template de celda no puede mapear (CSP sin ternarios)
  const STATUS_BADGE = {
    SUCCESS: 'oj-badge oj-badge-success oj-badge-subtle',
    WARNING: 'oj-badge oj-badge-warning oj-badge-subtle',
    DANGER: 'oj-badge oj-badge-danger oj-badge-subtle',
    INFO: 'oj-badge oj-badge-info oj-badge-subtle',
    NONE: 'oj-badge oj-badge-neutral oj-badge-subtle',
  }
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const UUID_CELL_SUFFIX = '__uuidCell'

  /** "…-<último bloque>" de un UUID canónico; cualquier otro valor, tal cual. */
  function abbreviateUuid(value) {
    return typeof value === 'string' && UUID.test(value)
      ? '…-' + value.substring(value.lastIndexOf('-') + 1)
      : value
  }

  // las columnas de TEXTO (sin plantilla propia, ni editables) con algún valor que es un UUID entero
  function uuidColumnIds(rows, columns) {
    return columns
      .map((col) => col.metadata || col)
      .filter((c) => !c.editable && (!c.dataType || c.dataType === 'string'))
      .filter((c) => rows.some((row) => typeof row[c.id] === 'string' && UUID.test(row[c.id])))
      .map((c) => c.id)
  }

  // filas con columnas de UUID: a cada una se le añade <id>__uuidCell = {text, full}, que es lo que
  // pinta la celda; el valor original de la fila queda intacto (navegación, acciones, selección)
  function uuidCellRows(rows, columns) {
    const ids = uuidColumnIds(rows, columns)
    if (!ids.length) return rows
    return rows.map((row) => {
      const out = { ...row }
      for (const id of ids) {
        const value = row[id] == null ? '' : String(row[id])
        out[id + UUID_CELL_SUFFIX] = { text: abbreviateUuid(value), full: value }
      }
      return out
    })
  }

  const PRIMARY_CELL_SUFFIX = '__primary'

  /** La celda (de la columna técnica ROW_LINES_COLUMN) que pinta las líneas extra de cada fila. */
  const ROW_LINES_FIELD = '__rowLines'

  const ROW_LINES_COLUMN = {
    id: ROW_LINES_FIELD,
    field: ROW_LINES_FIELD,
    headerText: '',
    template: 'cellLines',
    sortable: 'disabled',
    className: 'mateu-row-lines-cell',
    headerClassName: 'mateu-row-lines-cell',
    width: '1px',
    minWidth: '1px',
    maxWidth: '1px',
  }

  /** La línea (1-based) de una columna: su `line` si es > 1; si no, 1. */
  function lineOfColumn(c) {
    const line = c && typeof c.line === 'number' ? c.line : 0
    return line > 1 ? Math.floor(line) : 1
  }

  /** Reparte las columnas del wire por línea: {first: las de la línea 1, extra: [[línea 2], [línea 3]…]}
   *  en el orden del wire (las líneas vacías no cuentan). Sin @Line, extra = [] y nada cambia. */
  function rowLinesSplit(columns) {
    const first = []
    const byLine = new Map()
    for (const col of columns || []) {
      const c = col.metadata || col
      const line = c.type === 'GridGroupColumn' ? 1 : lineOfColumn(c)
      if (line === 1) first.push(col)
      else {
        if (!byLine.has(line)) byLine.set(line, [])
        byLine.get(line).push(col)
      }
    }
    return { first, extra: [...byLine.keys()].sort((a, b) => a - b).map((k) => byLine.get(k)) }
  }

  /** El texto de un valor en una línea extra: un estado por su mensaje, dinero «importe moneda». */
  function lineValueText(v) {
    if (v == null) return ''
    if (Array.isArray(v)) return v.map(lineValueText).filter(Boolean).join(', ')
    if (typeof v === 'object') {
      if (v.message !== undefined) return String(v.message == null ? '' : v.message)
      if (v.amount !== undefined) return [v.amount, v.currency].filter((x) => x != null).join(' ')
      return String(v.label || v.text || v.name || '')
    }
    if (typeof v === 'boolean') return v ? '✓' : '✗'
    return String(v)
  }

  /** A cada fila, <ROW_LINES_FIELD> = {lines: [{key, pairs: [{key, label, text, cls}]}]}: lo que pinta
   *  la plantilla cellLines (CSP de VB: precomputado). Un estado lleva su badge (cls). */
  function rowLinesRows(rows, extra) {
    if (!extra || !extra.length) return rows
    const lines = extra.map((line) => line.map((col) => col.metadata || col))
    return rows.map((row) => ({
      ...row,
      [ROW_LINES_FIELD]: {
        lines: lines.map((cols, i) => ({
          key: 'l' + (i + 2),
          pairs: cols.map((c) => {
            const v = row[c.id]
            return {
              key: c.id,
              label: c.label || c.id,
              text: lineValueText(v),
              cls: (v && typeof v === 'object' && v.badgeClass) || '',
            }
          }),
        })),
      },
    }))
  }

  const CLIP_CELL_SUFFIX = '__clipCell'

  /** El ancho que el wire pide para una columna (GridColumn.width / flexGrow), en las claves de
   *  oj-table: width (y, si no crece — flexGrow "0" —, minWidth = maxWidth = width). Sin width, {}. */
  function columnWidthOf(c) {
    const width = c && typeof c.width === 'string' ? c.width.trim() : (c && typeof c.width === 'number' ? c.width + 'px' : '')
    if (!width || width === 'auto') return {}
    return String(c.flexGrow) === '0'
      ? { width, minWidth: width, maxWidth: width }
      : { width, minWidth: width }
  }

  // una columna de TEXTO con ancho fijo (flexGrow 0) o con tooltip: su celda se corta con elipsis
  // y el texto entero (o el del campo tooltipPath) va al title
  function clipColumn(c) {
    return !c.editable && c.dataType !== 'actionGroup' && c.dataType !== 'status' && c.stereotype !== 'primary'
      && (!!c.tooltipPath || (!!columnWidthOf(c).maxWidth))
  }

  /** A cada columna recortable se le añade <id>__clipCell = {text, title, cls}: lo que pinta la celda
   *  (CSP de VB: la plantilla no puede leer un campo variable de la fila). La fila queda intacta. */
  function clipCellRows(rows, columns) {
    const cols = (columns || []).map((c) => c.metadata || c).filter(clipColumn)
    if (!cols.length) return rows
    const text = (v) => (v == null ? '' : (typeof v === 'object' ? (v.message || v.text || v.label || '') : String(v)))
    return rows.map((row) => {
      const out = { ...row }
      for (const c of cols) {
        const shown = text(row[c.id])
        // tooltipPath a OTRO campo (@Tooltip): un detalle → la ventana flotante; a sí mismo (un ancho
        // fijo que corta): el texto entero en el title de siempre
        const tip = c.tooltipPath && c.tooltipPath !== c.id ? text(row[c.tooltipPath]) : ''
        // solo la columna de ancho fijo se corta; con tooltipPath y sin ancho, el texto sigue entero
        // con @Tooltip(otro campo) el detalle sale en la ventana flotante (hover.mjs), no en el title
        // del navegador: varias líneas y estilo Redwood; sin él, el title enseña lo que se corta
        out[c.id + CLIP_CELL_SUFFIX] = { text: shown, title: tip ? '' : shown, hover: tip, cls: columnWidthOf(c).maxWidth ? 'mateu-cell-clip' : '' }
      }
      return out
    })
  }

  /** La celda de cada columna principal: {title, caption, leading} (vacíos si no hay). */
  function primaryCellRows(rows, columns) {
    const cols = (columns || []).map((c) => c.metadata || c).filter((c) => c.stereotype === 'primary')
    if (!cols.length) return rows
    const text = (v) => (v == null ? '' : String(v))
    return rows.map((row) => {
      const out = { ...row }
      for (const c of cols) {
        out[c.id + PRIMARY_CELL_SUFFIX] = {
          title: text(row[c.id]),
          caption: c.captionPath ? text(row[c.captionPath]) : '',
          leading: c.leadingPath ? text(row[c.leadingPath]) : '',
        }
      }
      return out
    })
  }

  // Lifecycle words a REST API commonly answers with, by the badge they read as (the web's
  // statusColumnRenderer): upper-cased, separators folded to `_`.
  const STATUS_SUCCESS_WORDS = ['AVAILABLE', 'ACTIVE', 'RUNNING', 'SUCCEEDED', 'SUCCESS', 'OK', 'ENABLED',
    'READY', 'HEALTHY', 'COMPLETED', 'DONE', 'ATTACHED', 'UP']
  const STATUS_WARNING_WORDS = ['PROVISIONING', 'UPDATING', 'PENDING', 'STARTING', 'STOPPING', 'IN_PROGRESS',
    'TERMINATING', 'DELETING', 'CREATING', 'MOVING', 'WAITING', 'ACCEPTED', 'WARNING', 'DEGRADED', 'RESTORING', 'SCALING']
  const STATUS_DANGER_WORDS = ['FAILED', 'TERMINATED', 'ERROR', 'DELETED', 'STOPPED', 'DISABLED', 'UNHEALTHY',
    'DOWN', 'CANCELED', 'CANCELLED', 'REJECTED', 'INACTIVE']

  /** A tone name (`success | warning | danger | error | info | neutral`) as a status type. */
  function statusTypeOfTone(tone) {
    switch (String(tone == null ? '' : tone).trim().toLowerCase()) {
      case 'success': return 'SUCCESS'
      case 'warning': return 'WARNING'
      case 'danger': case 'error': return 'DANGER'
      case 'info': return 'INFO'
      case 'neutral': case 'none': return 'NONE'
    }
    return undefined
  }

  /**
   * The status type of a PLAIN cell value (a REST API answers `"SHIPPED"`, not `{type, message}`):
   * the column's declared tone for the value (GridColumn.tones, from a field type) wins over the
   * lifecycle-word heuristics; anything else is neutral.
   */
  function statusTypeOfValue(value, tones) {
    const message = String(value)
    const declared = tones ? (tones[message] != null ? tones[message] : tones[message.trim().toUpperCase()]) : undefined
    const toned = declared ? statusTypeOfTone(declared) : undefined
    if (toned) return toned
    const word = message.trim().toUpperCase().replace(/[\s-]+/g, '_')
    if (STATUS_SUCCESS_WORDS.indexOf(word) >= 0) return 'SUCCESS'
    if (STATUS_WARNING_WORDS.indexOf(word) >= 0) return 'WARNING'
    if (STATUS_DANGER_WORDS.indexOf(word) >= 0) return 'DANGER'
    return 'NONE'
  }

  function statusBadgeRows(rows, columns) {
    const statusCols = columns
      .map((col) => col.metadata || col)
      .filter((c) => c.dataType === 'status')
    if (!statusCols.length) return rows
    return rows.map((row) => {
      const out = { ...row }
      for (const c of statusCols) {
        const id = c.id
        const value = out[id]
        if (value && typeof value === 'object') {
          out[id] = { ...value, badgeClass: STATUS_BADGE[value.type] || STATUS_BADGE.NONE }
        } else if (value != null && value !== '') {
          // a plain word (a REST row): its badge by the declared tone or the word; `plain` lets
          // selectedRowsOf hand the row back as it arrived
          const type = statusTypeOfValue(value, c.tones)
          out[id] = { type, message: String(value), badgeClass: STATUS_BADGE[type] || STATUS_BADGE.NONE, plain: true }
        }
      }
      return out
    })
  }

  /**
   * TODOS los filtros que declara el listado, cada uno ya resuelto al widget que le toca.
   *
   * Antes sólo salían los de opciones, y sólo el primero: un listado con un booleano, un
   * lookup, un enum y dos fechas mostraba una tira de chips sueltos con los valores del enum
   * —sin decir siquiera de qué campo eran— y los otros cuatro filtros no existían para el
   * usuario. En el renderer Vaadin salen los cinco.
   *
   * El `kind` se PRECOMPUTA aquí porque las plantillas de VB corren bajo CSP y no pueden
   * evaluar expresiones; el orden de resolución es el mismo que el de la barra compartida
   * (rango → multi → opciones → booleano → texto), para que un mismo listado ofrezca lo
   * mismo en los dos renderers.
   */
  function filtersOf(ctx) {
    const found = []
    const walk = (node) => {
      if (!node || typeof node !== 'object') return
      for (const f of ((node.metadata || {}).filters) || []) {
        // un filtro readOnly es el ÁMBITO del listado (el :id del maestro que lo contiene, el
        // contexto de un @Subresource): lo fija la ruta, no es una condición que el usuario quite
        if (f.readOnly) continue
        found.push(filterDescriptorOf(f, ctx && ctx.data))
      }
      ;(node.children || []).forEach(walk)
    }
    walk(ctx && ctx.tree)
    return found
  }

  function filterDescriptorOf(f, data) {
    // un filtro @Lookup trae sus opciones por su búsqueda (search-<campo>, bridge.loadLookups):
    // llegan a data[campo] como las de un campo del formulario
    const options = optionsOf(f, data).map((o) => ({ value: o.value, label: o.label || o.value }))
    // 'bool' lo emite el server Java y 'boolean' el .NET
    const isBool = f.dataType === 'bool' || f.dataType === 'boolean'
      || f.stereotype === 'checkbox' || f.stereotype === 'toggle'
    const isNumeric = ['integer', 'decimal', 'number', 'money'].indexOf(f.dataType) >= 0
    let kind
    if (f.stereotype === 'dateRange' || f.stereotype === 'numberRange') kind = 'range'
    else if (f.stereotype === 'multiSelect') kind = 'multi'
    else if (options.length) kind = 'options'
    else if (isBool) kind = 'bool'
    else kind = 'text'
    return {
      fieldId: f.fieldId,
      label: f.label || f.fieldId,
      kind,
      options,
      // el tipo del <input> de los kinds 'range' y 'text' (una fecha se teclea fatal como texto)
      inputType: f.stereotype === 'dateRange'
        ? (f.dataType === 'dateTime' ? 'datetime-local' : 'date')
        : (f.stereotype === 'numberRange' || isNumeric) ? 'number' : 'text',
      isRange: kind === 'range',
      isMulti: kind === 'multi',
      isOptions: kind === 'options',
      isBool: kind === 'bool',
      isText: kind === 'text',
      fromKey: f.fieldId + '_from',
      toKey: f.fieldId + '_to',
    }
  }

  /**
   * Los filtros como CHIPS: uno por filtro, aplicado o no.
   *
   * Uno por FILTRO y no uno por valor posible, que es lo que se pintaba antes: los ocho
   * estados de un enum salían como ocho chips sueltos, sin decir de qué campo eran, y ocupando
   * la fila entera que debían compartir los otros cuatro filtros. Un chip sin aplicar abre su
   * editor; uno aplicado enseña el valor y se quita por la ✕.
   *
   * `keys` son las claves de estado que hay que borrar para quitarlo — un rango ocupa dos, y
   * quitarlo a medias deja el listado filtrado por algo que ya no se ve.
   */
  function filterChipsOf(filters, values) {
    const v = values || {}
    const chips = (filters || []).map((f) => {
      if (f.isRange) {
        const from = v[f.fromKey]
        const to = v[f.toKey]
        const applied = !isBlank(from) || !isBlank(to)
        const text = !applied ? ''
          : isBlank(from) ? '≤ ' + to
          : isBlank(to) ? '≥ ' + from
          : from + ' → ' + to
        return { fieldId: f.fieldId, label: f.label, text, applied, keys: [f.fromKey, f.toKey] }
      }
      const value = v[f.fieldId]
      const applied = !isBlank(value)
      let text = ''
      if (applied) {
        if (f.isMulti) {
          const selected = Array.isArray(value) ? value : String(value).split(',')
          text = selected.map((s) => labelOfOption(f, s)).join(', ')
        } else if (f.isBool) {
          text = (value === true || value === 'true') ? 'Yes' : 'No'
        } else if (f.isOptions) {
          text = labelOfOption(f, value)
        } else {
          text = String(value)
        }
      }
      return { fieldId: f.fieldId, label: f.label, text, applied, keys: [f.fieldId] }
    })
    // la selección por ids (?ids=…): sólo cuando está aplicada — no es un filtro que se ofrezca
    if (!declaresIds(filters) && !isBlank(v[IDS_PARAM])) {
      chips.unshift({ fieldId: IDS_PARAM, label: 'Ids', text: idsChipLabelOf(v[IDS_PARAM]), applied: true, keys: [IDS_PARAM] })
    }
    return chips
  }

  /**
   * Los filtros que trae la query de una ruta (`integration=MRU01&status=PROPOSED,APPROVED`) →
   * { campo: valor }. Todos los parámetros, decodificados (`+` es un espacio, como en un
   * formulario); los vacíos no filtran, ni la página ni el orden. Un multi-select toma la lista separada por comas
   * (multiValuesOf), igual que la escribe Vaadin en la URL.
   */
  /**
   * Una navegación pedida (ruta con o sin ?query) frente a la que hay en pantalla. `full` (ruta +
   * query) es lo que la identifica — el id de la entrada del menú, la URL —; `filters` son
   * EXACTAMENTE los de su query: ninguno si no trae (ir a /reservas desde /reservas?vista=… quita el
   * filtro). `same` = es la que ya hay (el eco del writeback de la selección del menú): no recargar.
   */
  function navTargetOf(requested, currentFull) {
    const raw = String(requested || '')
    const q = raw.indexOf('?')
    const route = q >= 0 ? raw.slice(0, q) : raw
    const query = q >= 0 ? raw.slice(q + 1) : ''
    const full = query ? route + '?' + query : route
    return { route, full, filters: queryFiltersOf(query), same: full === (currentFull || '') }
  }

  function queryFiltersOf(query) {
    const out = {}
    const text = String(query || '').replace(/^\?/, '')
    if (!text) return out
    for (const part of text.split('&')) {
      const eq = part.indexOf('=')
      if (eq <= 0) continue
      const decode = (v) => {
        try { return decodeURIComponent(v.replace(/\+/g, ' ')) } catch (e) { return v }
      }
      const key = decode(part.slice(0, eq))
      const value = decode(part.slice(eq + 1))
      if (key && value !== '' && !PAGING_PARAMS[key]) out[key] = value
    }
    return out
  }

  // la página y el orden también viajan en la URL de un listado de Vaadin, pero no son filtros
  const PAGING_PARAMS = { page: true, size: true, sort: true }

  // ── Filtros por URL: los declarados, el texto libre y la selección por ids ─────────────────────
  // Cualquier filtro declarado de un listado se pone desde la URL con su nombre de campo (un rango,
  // con <campo>_from / <campo>_to; un multi-select, separado por comas). Además, dos que no declara
  // nadie: el texto libre (`searchText`, o `q` como alias al leer) y `ids`, la SELECCIÓN — un
  // conjunto concreto de filas por su id (`?ids=4MBZS7,JXD3G6`), que el framework aplica en el
  // server a cualquier listado. Todos salen como chips que se quitan, y la URL los refleja.

  /** El filtro reservado de la selección por ids (lo aplica el server, ningún listado lo declara). */
  const IDS_PARAM = 'ids'

  function idsTextsOf(lang) {
    const l = chromeLanguage(lang)
    return { few: chromeText('idsFew', null, l), many: (n) => chromeText('idsMany', { n }, l) }
  }

  /** El rótulo del chip de la selección: los ids si son pocos (≤3), si no cuántos son. */
  function idsChipLabelOf(ids, lang) {
    const list = multiValuesOf(ids)
    const texts = idsTextsOf(lang)
    return list.length <= 3 ? texts.few + list.join(', ') : texts.many(list.length)
  }

  /**
   * Los filtros de una query (queryFiltersOf) separados en el texto libre y el resto: `searchText`
   * (o su alias `q`, si no viene searchText) es lo que se busca, no un filtro — va al chip keyword.
   */
  function splitListingQuery(filters) {
    const values = Object.assign({}, filters || {})
    let searchText = ''
    if (!isBlank(values.searchText)) searchText = String(values.searchText)
    else if (!isBlank(values.q)) searchText = String(values.q)
    delete values.searchText
    delete values.q
    return { searchText, values }
  }

  /**
   * La query que refleja los filtros aplicados de un listado (sin '?'): cada valor con su clave, las
   * listas separadas por comas (como las escribe Vaadin), el texto libre como `searchText`. Las comas
   * se dejan legibles; el resto, codificado.
   */
  function listingQueryOf(values, searchText) {
    const enc = (s) => encodeURIComponent(String(s)).replace(/%2C/gi, ',')
    const parts = []
    const v = values || {}
    for (const key of Object.keys(v)) {
      const value = v[key]
      if (isBlank(value) || PAGING_PARAMS[key]) continue
      parts.push(enc(key) + '=' + enc(Array.isArray(value) ? value.join(',') : value))
    }
    const text = searchText == null ? '' : String(searchText).trim()
    if (text) parts.push('searchText=' + enc(text))
    return parts.join('&')
  }

  /** La ruta COMPLETA (con su query) de un listado con esos filtros: lo que va a la URL. */
  function listingUrlOf(route, values, searchText) {
    const bare = String(route || '').split('?')[0]
    const query = listingQueryOf(values, searchText)
    return query ? bare + '?' + query : bare
  }

  const declaresIds = (filters) => (filters || []).some((f) => f && f.fieldId === IDS_PARAM)

  /** Los valores de un multi-select, que llegan como lista o como cadena separada por comas. */
  function multiValuesOf(value) {
    if (value == null) return []
    if (Array.isArray(value)) return value.map(String)
    const text = String(value).trim()
    return text === '' ? [] : text.split(',').map((s) => s.trim()).filter((s) => s)
  }

  // ── Filtros DENTRO de la cabecera del buscador ────────────────────────────────────────────
  // Los filtros viajan por la API `smartFilters` de oj-sp-smart-filter-search, no en una fila
  // propia debajo: el componente pinta su cabecera (título + buscador + filtros) y, al pie, la
  // franja de color de Redwood. Una fila de filtros FUERA del componente quedaba al otro lado de
  // la franja, que así parecía una ilustración suelta en mitad de la página.
  //
  // La API cubre todos los kinds de Mateu, cada uno con el editor que el propio componente abre
  // en su popup (un oj-dynamic-form alimentado por `filtersMetadata`):
  //   - `suggestionFilters`: los filtros SIN aplicar — un chip por filtro declarado bajo el
  //     buscador; el componente quita de ahí los que ya están aplicados.
  //   - `value`: los aplicados — chips DENTRO del campo de búsqueda, con su ✕; el texto libre
  //     viaja ahí mismo como chips `keyword`.
  //   - `filtersMetadata`: un JsonMetadataProvider de oj-dynamic, polimórfico por `filter` (el
  //     fieldId): el editor del valor de cada filtro.

  const KEYWORD_FILTER = 'keyword'
  const BOOL_CHOICES = [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]

  /** El editor del valor de un filtro, en el vocabulario de oj-dynamic (lo que abre el popup). */
  function smartFilterValueMetadataOf(f) {
    const labelHint = f.label
    if (f.isRange) {
      // gte/lte oj-input-date (string) u oj-input-number (number): con esa forma exacta el
      // componente reconoce el rango y pinta el chip como "desde - hasta" formateado
      const numeric = f.inputType === 'number'
      const componentType = numeric ? 'oj-input-number'
        : f.inputType === 'datetime-local' ? 'oj-input-date-time' : 'oj-input-date'
      const type = numeric ? 'number' : 'string'
      return {
        type: 'object',
        labelHint,
        properties: {
          gte: { type, componentType, labelHint: 'Desde' },
          lte: { type, componentType, labelHint: 'Hasta' },
        },
      }
    }
    const options = (f.options || []).map((o) => ({ value: String(o.value), label: o.label }))
    if (f.isMulti) {
      return { type: 'array', items: { type: 'string' }, componentType: 'oj-checkboxset', labelHint, options }
    }
    if (f.isOptions) return { type: 'string', componentType: 'oj-select-single', labelHint, options }
    if (f.isBool) return { type: 'string', componentType: 'oj-select-single', labelHint, options: BOOL_CHOICES }
    if (f.inputType === 'number') return { type: 'number', componentType: 'oj-input-number', labelHint }
    return { type: 'string', componentType: 'oj-input-text', labelHint }
  }

  /**
   * `filtersMetadata` en crudo (JSON de oj-dynamic): polimórfico por `filter`, un tipo por filtro
   * declarado. El componente lo consulta con getMetadataByDiscriminator('filter', fieldId).
   */
  function smartFiltersMetadataOf(filters) {
    const polymorphicTypes = {}
    for (const f of filters || []) {
      polymorphicTypes[f.fieldId] = { type: 'object', properties: { value: smartFilterValueMetadataOf(f) } }
    }
    // el chip de la selección por ids también puede abrir su editor: un texto (ids separados por comas)
    if (!declaresIds(filters)) {
      polymorphicTypes[IDS_PARAM] = { type: 'object',
        properties: { value: { type: 'string', componentType: 'oj-input-text', labelHint: 'Ids' } } }
    }
    return {
      type: 'object',
      properties: { filter: { type: 'string' }, label: { type: 'string' } },
      discriminator: 'filter',
      polymorphicTypes,
    }
  }

  // Los de opciones llevan `filterLabel` (el nombre del campo): el componente pone en `label` la
  // etiqueta de la opción elegida y el chip se lee "Vista Llegadas hoy". Un texto o un rango NO:
  // con filterLabel el componente enseña la etiqueta en vez del valor tecleado.
  const usesFilterLabel = (f) => f.isOptions || f.isMulti || f.isBool

  /** Los chips de `suggestionFilters`: uno por filtro declarado, sin valor. */
  function smartFilterSuggestionsOf(filters) {
    return (filters || []).map((f) => {
      const chip = { filter: f.fieldId, label: f.label }
      if (usesFilterLabel(f)) chip.filterLabel = f.label
      // el formulario del popup saca sus campos de las claves del valor: sin ellas, un rango
      // abre un popup vacío
      if (f.isRange) chip.value = { gte: null, lte: null }
      return chip
    })
  }

  /** El `value` del componente (los chips aplicados) a partir del estado de Mateu. */
  function smartFilterValueOf(filters, values, searchText) {
    const v = values || {}
    const out = []
    const text = searchText == null ? '' : String(searchText).trim()
    if (text) out.push({ filter: KEYWORD_FILTER, label: text, value: text })
    // la selección por ids: un chip más, que se quita como cualquiera (sin filterLabel: el rótulo
    // ya dice qué es)
    if (!declaresIds(filters) && !isBlank(v[IDS_PARAM])) {
      const ids = multiValuesOf(v[IDS_PARAM])
      if (ids.length) out.push({ filter: IDS_PARAM, label: idsChipLabelOf(ids), value: ids.join(',') })
    }
    for (const f of filters || []) {
      if (f.isRange) {
        const from = v[f.fromKey]
        const to = v[f.toKey]
        if (isBlank(from) && isBlank(to)) continue
        out.push({ filter: f.fieldId, label: f.label,
          value: { gte: isBlank(from) ? null : from, lte: isBlank(to) ? null : to } })
        continue
      }
      const value = v[f.fieldId]
      if (isBlank(value)) continue
      if (f.isMulti) {
        const selected = multiValuesOf(value)
        if (!selected.length) continue
        out.push({ filter: f.fieldId, label: labelOfOption(f, selected[0]), filterLabel: f.label, value: selected })
      } else if (f.isBool) {
        const bool = value === true || value === 'true' ? 'true' : 'false'
        out.push({ filter: f.fieldId, label: bool === 'true' ? 'Yes' : 'No', filterLabel: f.label, value: bool })
      } else if (f.isOptions) {
        out.push({ filter: f.fieldId, label: labelOfOption(f, value), filterLabel: f.label, value: String(value) })
      } else {
        out.push({ filter: f.fieldId, label: f.label, value })
      }
    }
    return out
  }

  /**
   * Lo inverso: los chips aplicados del componente → el texto buscado (los keywords, en orden) y
   * los valores de filtro que viajan en el componentState. Un chip recién sacado de las
   * sugerencias todavía no tiene valor: no filtra hasta que se elige uno en su popup.
   */
  function filterStateOfSmartFilters(filters, chips) {
    const byId = {}
    for (const f of filters || []) byId[f.fieldId] = f
    const values = {}
    const keywords = []
    for (const chip of chips || []) {
      if (!chip) continue
      if (chip.filter === KEYWORD_FILTER) {
        if (!isBlank(chip.value)) keywords.push(String(chip.value))
        continue
      }
      if (chip.filter === IDS_PARAM && !byId[IDS_PARAM]) {
        const ids = multiValuesOf(chip.value)
        if (ids.length) values[IDS_PARAM] = ids.join(',')
        continue
      }
      const f = byId[chip.filter]
      if (!f) continue
      if (f.isRange) {
        const range = chip.value || {}
        if (!isBlank(range.gte)) values[f.fromKey] = range.gte
        if (!isBlank(range.lte)) values[f.toKey] = range.lte
      } else if (f.isMulti) {
        const selected = multiValuesOf(chip.value)
        if (selected.length) values[f.fieldId] = selected
      } else if (!isBlank(chip.value)) {
        values[f.fieldId] = chip.value
      }
    }
    return { searchText: keywords.join(' '), values }
  }

  /**
   * Las sugerencias que tocan para un fetch del componente: fuera las de los filtros ya
   * aplicados (el criterio trae `{op:'$ne', value:{filters}}`) y, si hay texto, las que no lo
   * contienen. Es el contrato del SuggestionFiltersDataProvider de oj-sp, que es REST; aquí las
   * sugerencias son locales.
   */
  function suggestionRowsFor(rows, criterion) {
    const parts = !criterion ? [] : criterion.criteria ? criterion.criteria : [criterion]
    let applied = []
    let text = ''
    for (const c of parts) {
      if (c && c.op === '$ne' && c.value && Array.isArray(c.value.filters)) applied = c.value.filters
      if (c && typeof c.text === 'string') text = c.text.trim().toLowerCase()
    }
    const taken = applied.map((a) => a && a.filter)
    return (rows || [])
      .filter((r) => taken.indexOf(r.filter) < 0)
      .filter((r) => !text || String(r.filterLabel || r.label).toLowerCase().indexOf(text) >= 0)
  }

  /** Un DataProvider (la parte que usa oj-sp-smart-filters) sobre las sugerencias locales. */
  function suggestionFiltersProviderOf(rows) {
    const all = rows || []
    const block = (data, params) => ({
      done: true,
      value: { data, metadata: data.map((r) => ({ key: r.filter })), fetchParameters: params },
    })
    return {
      fetchFirst(params) {
        const data = suggestionRowsFor(all, params && params.filterCriterion)
        return { [Symbol.asyncIterator]: () => ({ next: () => Promise.resolve(block(data, params)) }) }
      },
      fetchByKeys(params) {
        const results = new Map()
        for (const key of (params && params.keys) || []) {
          const row = all.filter((r) => r.filter === key)[0]
          if (row) results.set(key, { data: row, metadata: { key } })
        }
        return Promise.resolve({ fetchParameters: params, results })
      },
      containsKeys(params) {
        const results = new Set()
        for (const key of (params && params.keys) || []) {
          if (all.some((r) => r.filter === key)) results.add(key)
        }
        return Promise.resolve({ containsParameters: params, results })
      },
      getCapability() { return null },
      getTotalSize() { return Promise.resolve(all.length) },
      isEmpty() { return all.length ? 'no' : 'yes' },
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() { return true },
    }
  }

  /**
   * Las filas del DESPLEGABLE del buscador (la propiedad `suggestions` de oj-sp-smart-filters, un
   * SmartSuggestionChipsDataProvider): una por filtro declarado, cada una con su chip. Al entrar en
   * el campo el componente las abre en su popup bajo la caja; elegir una aplica ese filtro y, como
   * es un chip complejo, abre su editor (oj-dynamic, filtersMetadata) — el mismo editor que los chips.
   * `category: 'suggestion'` es el icono de caja del componente (los otros son historial y texto).
   */
  function smartFilterDropdownRowsOf(filters) {
    return smartFilterSuggestionsOf(filters).map((chip) => ({ id: chip.filter, category: 'suggestion', chips: [chip] }))
  }

  /** Las filas del desplegable que tocan: fuera los filtros ya aplicados y, si hay texto, las que no lo contienen. */
  function dropdownRowsFor(rows, criterion) {
    const parts = !criterion ? [] : criterion.criteria ? criterion.criteria : [criterion]
    let applied = []
    let text = ''
    for (const c of parts) {
      if (c && c.op === '$ne' && c.value && Array.isArray(c.value.filters)) applied = c.value.filters
      if (c && typeof c.text === 'string') text = c.text.trim().toLowerCase()
    }
    const taken = applied.map((a) => a && a.filter)
    return (rows || [])
      .filter((r) => taken.indexOf(r.id) < 0)
      .filter((r) => !text || r.chips.some((chip) => String(chip.filterLabel || chip.label).toLowerCase().indexOf(text) >= 0))
  }

  /** Un DataProvider (lo que usa el popup del buscador) sobre las filas locales del desplegable. */
  function suggestionsProviderOf(rows) {
    const all = rows || []
    return {
      // como un ArrayDataProvider de JET: un bloque con las filas (done: false) y después el final
      // vacío (done: true). Un único bloque ya «done» lo pinta bien el primer fetch, pero al
      // refiltrar el oj-list-view del popup conservaba las filas de antes con el dato nuevo
      fetchFirst(params) {
        const data = dropdownRowsFor(all, params && params.filterCriterion)
        return {
          [Symbol.asyncIterator]: () => {
            let sent = false
            return {
              next: () => {
                const rowsNow = sent ? [] : data
                const done = sent
                sent = true
                return Promise.resolve({ done, value: { data: rowsNow, metadata: rowsNow.map((r) => ({ key: r.id })), fetchParameters: params } })
              },
            }
          },
        }
      },
      fetchByKeys(params) {
        const results = new Map()
        for (const key of (params && params.keys) || []) {
          const row = all.filter((r) => r.id === key)[0]
          if (row) results.set(key, { data: row, metadata: { key } })
        }
        return Promise.resolve({ fetchParameters: params, results })
      },
      containsKeys(params) {
        const results = new Set()
        for (const key of (params && params.keys) || []) {
          if (all.some((r) => r.id === key)) results.add(key)
        }
        return Promise.resolve({ containsParameters: params, results })
      },
      fetchByOffset(params) {
        const data = dropdownRowsFor(all, params && params.filterCriterion)
        const offset = (params && params.offset) || 0
        const size = params && params.size > 0 ? params.size : data.length
        const slice = data.slice(offset, offset + size)
        return Promise.resolve({
          done: offset + size >= data.length,
          fetchParameters: params,
          results: slice.map((r) => ({ data: r, metadata: { key: r.id } })),
        })
      },
      // el filtrado lo hace el propio provider (texto + aplicados): el ListDataProviderView del
      // componente se lo pasa tal cual
      getCapability(name) { return name === 'filter' ? { operators: ['$and', '$ne'], textFilter: {} } : null },
      // el total depende del filtro: «desconocido» (-1). Con el de todas las filas, el oj-list-view
      // del popup pintaba seis veces «Business key» al teclear «busi»
      getTotalSize() { return Promise.resolve(-1) },
      isEmpty() { return all.length ? 'no' : 'yes' },
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() { return true },
    }
  }

  // el JsonMetadataProvider de oj-dynamic: lo pone el módulo AMD (el core no depende de JET)
  let metadataProviderFactory = null
  function setMetadataProviderFactory(factory) { metadataProviderFactory = factory }

  /**
   * La configuración ENTERA de `smart-filters` para un listado: el desplegable de filtros, los
   * aplicados y el editor de cada filtro. Sin filtros declarados, sólo el buscador de texto.
   *
   * Los filtros sin aplicar se ofrecen en el DESPLEGABLE que abre el buscador al entrar en él
   * (`suggestions`), no como una fila de botones bajo la caja (`suggestionFilters`, lo que hubo
   * desde 8af850e63): el buscador del listado vuelve a ser una caja con su menú de filtros.
   */
  async function smartFiltersOf(filters, values, searchText) {
    const config = { askHint: chromeText('search'), value: smartFilterValueOf(filters, values, searchText) }
    const hasIds = !isBlank((values || {})[IDS_PARAM])
    if ((!filters || !filters.length) && !hasIds) return config
    // sin filtros declarados pero con selección por ids: el chip necesita su metadata, no sugerencias
    if (filters && filters.length) {
      config.suggestions = suggestionsProviderOf(smartFilterDropdownRowsOf(filters))
    }
    if (metadataProviderFactory) {
      config.filtersMetadata = await metadataProviderFactory(smartFiltersMetadataOf(filters))
    }
    return config
  }

  function labelOfOption(filter, value) {
    const hit = (filter.options || []).filter((o) => String(o.value) === String(value))[0]
    return hit ? hit.label : String(value)
  }

  function isBlank(value) {
    if (value == null) return true
    if (Array.isArray(value)) return value.length === 0
    return String(value).trim() === ''
  }





  // Part of the Redwood core (reduceContexts.mjs re-exports every piece): the reducer: increments → contexts/stack/shell, mediators, overlays.

  /** Triggers OnLoad del contexto (p.ej. el listing dispara 'search' al cargar). */
  function onLoadTriggers(ctx) {
    const ids = ((ctx && ctx.tree && ctx.tree.triggers) || [])
      // los que llevan espera (refresco periódico) los programa polling.mjs, no se lanzan ya
      .filter((t) => t.type === 'OnLoad' && t.actionId && !(t.timeoutMillis > 0))
      .map((t) => t.actionId)
    // a listing reading its rows from a REST source (rowsSource) loads them on opening, as the web's
    // mateu-table-crud does — a YAML listing carries no OnLoad trigger of its own
    if (ids.indexOf('search') < 0 && ctx && ctx.tree
        && findFirst(ctx.tree, (n) => n && n.metadata && n.metadata.type === 'Crud' && !!n.metadata.rowsSource)) {
      ids.push('search')
    }
    return ids
  }

  /**
   * La URL de una pestaña con clave de ruta (@Tab(key)): la ruta de la página con la clave de la
   * pestaña de su barra que ya nombre (si la hay) sustituida — /vcns/7/subnets → /vcns/7/gateways.
   */
  function tabRoutePath(pathname, keys, key) {
    const trimmed = String(pathname || '').replace(/\/+$/, '')
    const segments = trimmed.split('/')
    const last = segments[segments.length - 1]
    const base = keys.includes(last) ? segments.slice(0, -1).join('/') : trimmed
    return base + '/' + key
  }

  // ── APPS ANIDADAS: el maestro de un registro con pestañas que son páginas (P1) ──────────────────
  //
  // Una ruta con HIJOS en routes.yaml (`customers/:customerId` → orders, addresses…) la pinta un
  // @App(TABS) cuyo contenido es la pestaña. En el wire llega como un ClientSide App de PRIMER nivel
  // — igual que el App del bootstrap —, y tratarlo como la shell la machacaba y dejaba el contenido
  // en blanco. Un App anidado es CONTENIDO: un NIVEL (título, pestañas, «← padre») sobre la
  // pantalla que ocupa su hueco. Hay una barra de pestañas por nivel.

  /** Si el fragmento es un App ANIDADO (no la shell, no un mediador), su nivel; si no, null. */
  function appLevelOf(fragment, shellServerSideType, requestedRoute = '') {
    const c = fragment && fragment.component
    const md = c && c.metadata
    if (!c || c.type !== 'ClientSide' || !md || md.type !== 'App') return null
    if (md.variant === 'MEDIATOR') return null
    if (shellServerSideType && md.serverSideType === shellServerSideType) return null
    // un App sin hueco que rellenar (su home es él mismo) es una shell, no un nivel
    if (!md.homeServerSideType || md.homeServerSideType === md.serverSideType) return null
    const path = (r) => String(r || '').split('?')[0].replace(/\/+$/, '')
    const requested = path(requestedRoute || md.homeRoute)
    const tabs = (md.menu || [])
      .filter((o) => o && !o.separator && (o.route || o.path))
      .map((o) => ({ id: o.route || o.path, label: o.label || '', route: o.route || o.path }))
    // la pestaña activa: la de ruta más larga que sea prefijo de lo que se pidió (un registro
    // dentro del crud de la pestaña sigue en esa pestaña)
    const pick = (target) => {
      let found = ''
      for (const tab of tabs) {
        const r = path(tab.route)
        if ((target === r || target.startsWith(r + '/')) && r.length > path(found).length) found = tab.route
      }
      return found
    }
    // …o, con el maestro pedido a secas (/customers/3), la de su home: la pestaña por defecto
    const selected = pick(requested) || pick(path(md.homeRoute))
    return {
      id: 'mateuAppTabs-' + path(md.route).replace(/[^a-zA-Z0-9]/g, '_'),
      title: md.title || '',
      route: md.route || '',
      serverSideType: md.serverSideType,
      tabs,
      // una sola pestaña visible no es una elección: sin barra (la ruta se conserva)
      showTabs: tabs.length > 1,
      selected,
      backRoute: md.backRoute || '',
      backLabel: md.backLabel || '',
      actions: (md.contextActions || []).map((a) => ({ id: a.actionId, label: a.label })),
      home: { route: md.homeRoute, consumedRoute: md.homeConsumedRoute, serverSideType: md.homeServerSideType },
    }
  }

  /**
   * Separa del incremento los Apps ANIDADOS: devuelve el incremento sin ellos (para que el reducer
   * no los tome por la shell) y sus niveles, en orden.
   */
  function splitNestedApps(increment, shellServerSideType, requestedRoute) {
    const levels = []
    const fragments = []
    for (const fr of (increment && increment.fragments) || []) {
      const level = appLevelOf(fr, shellServerSideType, requestedRoute)
      if (level) levels.push(level)
      else fragments.push(fr)
    }
    return { increment: { ...(increment || {}), fragments }, levels }
  }

  /** Si el contexto es un MEDIADOR (ServerSide → child App), la info para cargar su contenido. */
  function mediatorOf(ctx) {
    const tree = ctx?.tree
    if (tree?.type !== 'ServerSide') return null
    const child = (tree.children || [])[0]
    const md = child?.metadata
    if (md?.type !== 'App') return null
    return {
      // homeConsumedRoute ANTES que rootRoute: en un deep-link a una sub-ruta (el detalle de un
      // proceso) `rootRoute` es la ruta ENTERA que se pidió, mientras que lo consumido por el
      // mediador es su propia ruta (`/workflow/processes`). Mandar la entera como consumedRoute
      // hace que el servidor sirva la vista por defecto del crud: se entraba por el enlace de un
      // proceso y aparecía el listado. En una opción de menú (la raíz del crud) valen lo mismo.
      rootRoute: md.homeConsumedRoute || md.rootRoute || ctx.state?._route || '',
      homeRoute: md.homeRoute ?? '',
      serverSideType: md.homeServerSideType ?? md.serverSideType,
      variant: md.variant,
    }
  }

  const metaOf = (fr) => fr.component?.metadata || {}

  /** El estado de una superficie con los VALORES INICIALES de sus campos (FormField.initialValue) que
   *  aún no tienen valor: el renderer web cae a ese valor cuando el estado no trae la clave, y aquí
   *  se siembra en el estado para que se pinte Y viaje en la siguiente acción. */
  function withInitialValues(tree, state) {
    const out = { ...(state || {}) }
    if (!tree) return out
    for (const f of collectFields(tree)) {
      if (f.initialValue != null && !(f.fieldId in out)) out[f.fieldId] = f.initialValue
    }
    return out
  }

  let overlaySeq = 0
  /** Construye un contexto de overlay (drawer/dialog) a partir de un fragmento Add. */
  function buildOverlay(fr, opener) {
    const md = metaOf(fr)
    const id = 'overlay-' + ++overlaySeq
    // Un formulario EMBEBIDO (EmbeddedView: el «Cancel booking» de una reserva) llega como un
    // ServerSide propio en md.content, con SU estado (initialData), SU título (el de su Page) y
    // SUS acciones: es la superficie del overlay.
    const surface = md.content && md.content.type === 'ServerSide' ? md.content : null
    const filled = (o) => (o && typeof o === 'object' && Object.keys(o).length ? o : null)
    const surfacePage = surface ? findByType(surface, 'Page') : null
    return {
      id,
      kind: 'drawer',
      tree: fr.component, // el árbol completo — md.content lleva el contenido (patrón Card)
      surface,
      state: withInitialValues(surface || fr.component, filled(md.initialData) || filled(fr.state) || (surface && filled(surface.initialData)) || {}),
      title: md.headerTitle || md.title || (surfacePage && surfacePage.metadata.title) || '',
      subtitle: md.subtitle,
      position: md.position || 'end',
      width: md.width,
      size: md.size,
      dirty: false,
      // quien lo abrió: a él van los value-changed/data-changed del overlay (applyOverlayEvent)
      opener: opener || HOST_ID,
    }
  }

  /** Resuelve a qué clave del registro va un target: eco del initiator; ''/null → host. */
  const resolveTarget = (contexts, t) => {
    if (t == null || t === '') return HOST_ID
    if (contexts[t]) return t
    // eco de un id de componente ya registrado (p.ej. SSE que responde al uuid del árbol, o el
    // formulario embebido de un overlay, que contesta a SU id)
    const byTreeId = Object.keys(contexts).find((k) => contexts[k].tree?.id === t || contexts[k].surface?.id === t)
    return byTreeId || t
  }

  /**
   * EL REDUCER. reg = { contexts, stack, shell }; devuelve el NUEVO reg + los efectos que VB
   * aplica. Puro e inmutable con structural sharing: solo las entradas tocadas cambian de ref.
   * opts.initiator = contextId de la superficie que lanzó la request (para comandos sin target,
   * como el MarkAsClean del save-in-drawer).
   */
  function reduceContexts(reg, increment, opts = {}) {
    const contexts = { ...reg.contexts }
    const stack = [...reg.stack]
    let shell = reg.shell || null
    const effects = {
      toasts: [],
      banners: increment.banners || [],
      navigate: null,
      urlPush: null,
      download: null,
      downloads: [], // todos los DownloadFile del increment (download = el último, compat)
      runActions: [],
      docTitle: null,
      // UICommand.announce / announceAssertive: what assistive tech is told (a11y.mjs live regions);
      // nothing is drawn — [{ text, assertive }]
      announcements: [],
      events: [], // bus @SubscribeTo: [{ name, detail }]
    }

    for (const m of increment.messages || [])
      effects.toasts.push({
        text: m.text || m.title, variant: m.variant || 'info',
        // Message.undoable: el toast lleva su «Undo» (notify.mjs lo pinta con oj-message)
        ...(m.undoActionId ? { undoActionId: m.undoActionId, undoLabel: m.undoLabel || 'Undo', undoParameters: m.undoParameters || {} } : {}),
      })

    // ── fragmentos → shell | superficies ──────────────────────────────────────
    for (const fr of increment.fragments || []) {
      const md = metaOf(fr)

      // El App del BOOTSTRAP (root ClientSide type App) configura el chrome. Un App de
      // mediador NO pasa por aquí: llega envuelto en un ServerSide (child0) y es contenido.
      if (fr.component?.type === 'ClientSide' && md.type === 'App') {
        shell = {
          title: md.title,
          menu: md.menu || [],
          variant: md.variant,
          serverSideType: md.serverSideType, // para las acciones de cabecera (app-level)
          appContext: md.contextSelectors || [],
          headerActions: md.contextActions || [],
          // the shell's FLOWS (AppShell.actions): a menu RuleLink whose RunAction names one runs
          // its lowered commands client-side (shellFlows.mjs)
          actions: md.actions || [],
          // the app's ACTION catalogue (App.actionCatalogue): an id the shell or the page does not
          // declare runs the catalogue's lowered flow client-side, owner first (shellFlows.mjs)
          actionCatalogue: md.actionCatalogue || [],
          themeToggle: md.themeToggle,
          // @App(accessKeys): mantener Alt enseña las teclas de acceso (keys.mjs)
          accessKeys: !!md.accessKeys,
          // NotificationsSupplier del App → la campana de la cabecera (notify.mjs)
          notificationsEnabled: !!md.notificationsEnabled,
          // GlobalSearchSupplier del App → la paleta Ask busca también entidades (globalSearch.mjs)
          globalSearchEnabled: !!md.globalSearchEnabled,
          // @Fab del App: botones flotantes globales (fabs.mjs)
          fabs: md.fabs || [],
          // el logo del @App (@Logo, p.ej. /images/riu.svg — relativo al backend)
          logo: md.logo || '',
          // la HOME del app (@HomeRoute) — el boot de la shell la prefiere sobre la
          // primera opción del menú
          homeRoute: md.homeRoute || '',
          // chat de IA (@AI → App.sseUrl): si viene, la shell pinta el botón del chat del agente en la cabecera
          sseUrl: md.sseUrl || '',
          // @AI(upload) → el botón de adjuntar del chat; @AI(mcp) → el mcpUrl que el agente usa para operar la app
          uploadUrl: md.uploadUrl || '',
          mcpUrl: md.mcpUrl || '',
          // el FAB de "ask" del shell (@App(askLabel, askIcon)): vacíos = el FAB neutro (Search)
          askLabel: md.askLabel || '',
          askIcon: md.askIcon || '',
          // los widgets de CABECERA (WidgetSupplier / @Widget): viajan como hijos del App con
          // slot "widgets"; los proyecta headerWidgetsOf (widgets.mjs)
          widgets: (fr.component.children || []).filter((child) => child && child.slot === 'widgets'),
        }
        continue
      }

      if (fr.action === 'Add') {
        const ctx = buildOverlay(fr, opts.initiator)
        // the SAME overlay re-sent while it is open (a Drawer with the same id: the crud's edit
        // drawer after «Save and next», or with its error banner) REFRESHES IN PLACE — it takes the
        // open one's place in the stack instead of stacking a second drawer on top. It gets a new
        // context id on purpose: the chains reset the drawer's draft when the overlay id changes, and
        // the refreshed drawer carries new values (the next row, or what the server kept).
        const sameId = fr.component && fr.component.id
        const open = sameId ? stack.find((k) => contexts[k] && contexts[k].tree && contexts[k].tree.id === sameId) : null
        if (open) {
          contexts[ctx.id] = { ...ctx, opener: contexts[open].opener || ctx.opener }
          delete contexts[open]
          stack[stack.indexOf(open)] = ctx.id
          continue
        }
        contexts[ctx.id] = ctx
        stack.push(ctx.id)
        continue
      }

      // Replace / ReplaceKeepData / State-only: MISMO camino para form, mediador, isla…
      const id = resolveTarget(contexts, fr.targetComponentId)
      const prev = contexts[id] || { id, kind: id === HOST_ID ? 'host' : 'island', state: {}, data: {} }
      const ss = fr.component?.type === 'ServerSide' ? fr.component : null
      contexts[id] = {
        ...prev,
        kind: prev.kind,
        tree: fr.component || prev.tree, // sin component => State-only: conserva el árbol
        pageType: ss?.pageType ?? (fr.component ? undefined : prev.pageType),
        pageWidth: ss?.pageWidth ?? (fr.component ? undefined : prev.pageWidth),
        state: !fr.component
          ? { ...prev.state, ...(fr.state || {}) } // State-only: MERGE (no borrar la isla)
          : withInitialValues(fr.component, fr.action === 'ReplaceKeepData'
            ? { ...prev.state, ...(fr.state || md.initialData || {}) }
            : (fr.state ?? md.initialData ?? prev.state)),
        // data = eje de DATOS calculados por el server (p.ej. las filas del listing, keyed
        // por id de componente: {crud: {page: …}}); un fragmento data-only MERGEA
        data: !fr.component
          ? { ...prev.data, ...(fr.data || {}) }
          : (fr.data ?? {}),
        dirty: false,
      }
    }

    // ── comandos → efectos (algunos mutan el registro) ────────────────────────
    const emit = (data) => {
      if (!data) return
      if (typeof data === 'string') effects.events.push({ name: data, detail: null })
      else if (data.eventName) effects.events.push({ name: data.eventName, detail: data.detail ?? null })
    }
    for (const c of increment.commands || []) {
      const t = c.targetComponentId
      switch (c.type) {
        case 'SetWindowTitle':
          effects.docTitle = c.data
          break
        case 'NavigateTo': {
          const d = String(c.data || '')
          effects.navigate = /^https?:/.test(d) ? { url: d } : { route: d }
          break
        }
        case 'PushStateToHistory':
          effects.urlPush = c.data
          break
        case 'CloseModal': {
          const id = t && contexts[t] ? t : stack[stack.length - 1]
          if (id) {
            delete contexts[id]
            const i = stack.indexOf(id)
            if (i >= 0) stack.splice(i, 1)
          }
          emit(c.data) // eventName del cierre → bus (p.ej. refresco del listado del crud)
          break
        }
        case 'DispatchEvent':
          // lo que un componente del overlay devuelve a quien lo abrió (el selector de un
          // @Searchable: el valor elegido, su rótulo, y cerrarse)
          if (applyOverlayEvent(contexts, stack, c.data)) break
          emit(c.data)
          break
        case 'MarkAsClean': {
          const id = t && contexts[t] ? t : opts.initiator
          if (id && contexts[id]) contexts[id] = { ...contexts[id], dirty: false }
          break
        }
        case 'MarkAsDirty': {
          const id = t && contexts[t] ? t : opts.initiator
          if (id && contexts[id]) contexts[id] = { ...contexts[id], dirty: true }
          break
        }
        case 'DownloadFile':
          effects.download = c.data
          effects.downloads.push(c.data)
          break
        case 'RunAction':
          effects.runActions.push(c.data)
          break
        case 'Announce': {
          // the Redwood `announcement` slot: polite by default, assertive when the server says so
          const d = c.data && typeof c.data === 'object' ? c.data : { text: c.data }
          const text = d.text == null ? '' : String(d.text).trim()
          if (text) effects.announcements.push({ text, assertive: !!d.assertive })
          break
        }
      }
    }

    // los niveles de app (P1) son de la PANTALLA, no de un incremento: una acción sobre la pestaña
    // (la búsqueda OnLoad del listado) no los borra
    const kept = {}
    if (reg.appLevels) kept.appLevels = reg.appLevels
    if (reg.loadedRoute) kept.loadedRoute = reg.loadedRoute
    return { ...kept, contexts, stack, shell, effects }
  }







  // Part of the Redwood core (reduceContexts.mjs re-exports every piece): forms: list actions, the modal row editor, field widgets, validation, confirmation, lookups.

  // ── EDITOR DE FILAS de una lista del formulario (@DetailFormCustomisation position = modal) ──
  //
  // Contrato del wire (fixtures/real/rowedit-*.json, capturados contra el booking de ec-demo1):
  //  - `<campo>_add` / `<campo>_select` (con parameters._rowNumber) contestan DOS fragmentos: el
  //    State del contenedor (con `_show_detail[campo] = true`) y un ServerSide con el formulario
  //    de la fila dirigido a `<campo>-container` (title "New room"/"Edit room", `buttons` al pie:
  //    Save —primary—, "Save and add another" al crear, Cancel —tertiary—; Prev/Next en
  //    `toolbar` al editar, y la posición "1/3" como Text de `header`).
  //  - Save/Create/Cancel/Prev/Next viajan con el estado del CONTENEDOR (el formulario o el
  //    wizard) y la fila en parameters.initiatorState — como Vaadin desde 367
  //    (libs/mateu … common.ts resolveComponentState/isOwnListAction). Mandar la fila como
  //    componentState reconstruía el contenedor desde una habitación: el wizard volvía vacío a
  //    su primer paso.
  //  - El contenedor contesta un State con la lista nueva y `_show_detail[campo] = false`
  //    (cierra); `_create-and-stay` contesta además una fila nueva en `<campo>-container`.
  //  - Prev/Next contestan un State-only a `<campo>-container` (la fila vecina).
  //  - Los lookups de la fila (`search-<campo>`) los resuelve el ServerSide de la FILA con el
  //    estado de la fila: su respuesta es un fragmento data-only a su id.

  /** Las acciones que el editor de una fila manda al contenedor de la lista: `rooms_create`… */
  const LIST_ACTION = /^(.+)_(create-and-stay|create|save|cancel|remove|add|select|selected|prev|next|move-up|move-down)$/

  /** Verbos que llevan la fila del diálogo en parameters.initiatorState. */
  const ROW_EDITOR_VERBS = { create: true, 'create-and-stay': true, save: true, cancel: true, prev: true, next: true }

  /** Verbos que validan la fila antes de salir (los obligatorios vacíos). */
  const ROW_VALIDATING_VERBS = { create: true, 'create-and-stay': true, save: true }

  /** ¿El FormField es una lista cuyo editor de fila se abre en un diálogo? */
  function isModalRowEditor(field) {
    return !!(field && !field.readOnly && !field.inlineEditing
      && (field.columns || []).length && /^modal/.test(field.formPosition || ''))
  }

  /** Las listas con editor modal de un árbol (sin cruzar islas): fieldId → FormField. */
  function modalListsOf(tree) {
    const out = {}
    for (const f of collectFields(tree)) if (isModalRowEditor(f)) out[f.fieldId] = f
    return out
  }

  /**
   * ¿`actionId` es una acción de una lista del contenedor? → { fieldId, verb } o null. La lista
   * se reconoce como en Vaadin (el `<campo>_rowClass` que su estado lleva por cada lista) o, si
   * el estado no lo trae, por un FormField lista con ese id en el árbol del contenedor.
   */
  function listActionOf(state, actionId, tree) {
    const match = actionId ? LIST_ACTION.exec(actionId) : null
    if (!match) return null
    const fieldId = match[1]
    const known = (state && (fieldId + '_rowClass') in state)
      || collectFields(tree || {}).some((f) => f.fieldId === fieldId && (f.dataType === 'array' || (f.columns || []).length))
    return known ? { fieldId, verb: match[2] } : null
  }

  /** El contexto de transporte del contenedor: las acciones de sus listas van a SU ServerSide
   *  (el formulario, el wizard), no al mediador por el que se cargó la pantalla — el crud
   *  orquestador no sabe qué es `rooms_add` ("component() … DtoSupplier"). */
  function holderTransportOf(holder) {
    const outbound = holder.outbound || {}
    const tree = holder.tree || {}
    return {
      ...holder,
      outbound: {
        ...outbound,
        serverSideType: tree.type === 'ServerSide' && tree.serverSideType ? tree.serverSideType : outbound.serverSideType,
      },
    }
  }

  /** El _rowNumber REAL (número o uuid) de la fila cuyo texto es `key` — el DOM sólo da texto,
   *  y el servidor compara con equals: "0" no es 0. */
  function rowOf(rows, key) {
    return (rows || []).find((row) => row && String(row._rowNumber) === String(key)) || null
  }

  /**
   * La request de una acción de lista: componentState = el estado del CONTENEDOR (+ su borrador),
   * y la fila del diálogo (+ su borrador) en parameters.initiatorState para los verbos del
   * editor. `_select` lleva el _rowNumber real; `_remove` de una fila, la fila en
   * `<campo>_selected_items` (el servidor quita las filas iguales). null si no es de una lista.
   */
  function listActionRequestOf(reg, actionId, opts = {}) {
    const holderId = opts.holderId || HOST_ID
    const holder = reg && reg.contexts && reg.contexts[holderId]
    if (!holder) return null
    const componentState = { ...(holder.state || {}), ...(opts.hostDraft || {}) }
    const hit = listActionOf(componentState, actionId, holder.tree)
    if (!hit) return null
    const { fieldId, verb } = hit
    const parameters = { ...(opts.parameters || {}) }
    const rowCtx = reg.contexts[fieldId + '-container']
    if (ROW_EDITOR_VERBS[verb] && rowCtx) {
      parameters.initiatorState = { ...(rowCtx.state || {}), ...(opts.rowDraft || {}) }
    }
    if ((verb === 'select' || verb === 'remove') && parameters._rowNumber != null) {
      const row = rowOf(componentState[fieldId], parameters._rowNumber)
      if (verb === 'select') {
        if (row) parameters._rowNumber = row._rowNumber
      } else {
        delete parameters._rowNumber
        componentState[fieldId + '_selected_items'] = row ? [row] : []
      }
    }
    return { fieldId, verb, componentState, parameters, ctx: holderTransportOf(holder) }
  }

  const ROW_CHROMING = { primary: 'callToAction', tertiary: 'borderless' }

  function rowButtonOf(b) {
    return {
      actionId: b.actionId,
      label: b.label || b.actionId,
      chroming: ROW_CHROMING[b.buttonStyle] || 'outlined',
    }
  }

  /** Opciones de un select/lookup: las estáticas del campo o las que trajo su búsqueda. */
  function optionsOf(field, data) {
    const found = data && data[field.fieldId] && data[field.fieldId].content
    const raw = (field.options && field.options.length) ? field.options : (found || [])
    return raw.map((o) => ({ value: o.value, label: o.label == null ? String(o.value) : o.label }))
  }

  /** El valor de un campo tal como lo edita su widget: un lookup puede llegar como {value,label}. */
  function plainValueOf(value) {
    if (value && typeof value === 'object' && !Array.isArray(value) && 'value' in value) return value.value
    return value
  }

  const NUMERIC_TYPES = { integer: true, int: true, long: true, number: true, double: true, float: true, money: true }

  /**
   * Los campos del formulario de la fila, cada uno resuelto al widget que le toca (flags
   * PRECOMPUTADOS: el CSP de VB no evalúa expresiones) con su valor, sus opciones y sus
   * errores (messagesCustom de JET). Las listas anidadas (p.ej. las edades de los niños) no
   * se editan aquí.
   */
  function rowFieldsOf(ctx, values, errors) {
    if (!ctx || !ctx.tree) return []
    const state = { ...(ctx.state || {}), ...(values || {}) }
    const seen = {}
    const out = []
    for (const f of collectFields(ctx.tree)) {
      if (!f.dataType || seen[f.fieldId]) continue
      seen[f.fieldId] = true
      if (f.dataType === 'array' || (f.columns || []).length) continue
      const raw = plainValueOf(state[f.fieldId])
      const widget = fieldWidgetOf(f, ctx.data, { lookups: true, value: raw })
      const error = errors && errors[f.fieldId]
      // un campo de SÓLO LECTURA todavía vacío (la «Line» y el «Total» de una habitación nueva, que
      // pone el servidor) se pinta como su rótulo y «—», texto que no se enfoca: un oj-input-number
      // readonly sin valor es una cajita punteada de 20px que parece un control roto (y, el primero
      // del diálogo, se quedaba con el foco)
      if (widget.readonly && !widget.isBoolean && (raw == null || raw === '')) {
        out.push({
          ...widget, ...EMPTY_READONLY_WIDGET,
          value: EMPTY_VALUE,
          messagesCustom: [],
        })
        continue
      }
      out.push({
        ...widget,
        value: widget.isBoolean ? !!raw : (raw == null || raw === '' ? null : (widget.isNumber ? Number(raw) : raw)),
        messagesCustom: error ? [{ severity: 'error', summary: error, detail: '' }] : [],
      })
    }
    return out
  }

  /** Lo que se pinta en lugar de un valor que todavía no hay (sólo lectura). */
  const EMPTY_VALUE = '—'
  const EMPTY_READONLY_WIDGET = { isText: false, isEmptyReadonly: true, isTextArea: false, isNumber: false, isDate: false, isDateTime: false,
    isSelect: false, isLookup: false, lookupActionId: '', options: [] }

  /** Tipos de campo que el form layout sabe pintar con un widget de JET. */
  const LAYOUT_TYPES = { string: true, integer: true, int: true, long: true, number: true, double: true,
    float: true, date: true, dateTime: true, bool: true, boolean: true }

  /**
   * Un campo ESCALAR de un FormLayout, listo para el oj-form-layout: su widget (fieldWidgetOf),
   * su valor y su colspan. El valor sale del state o, si no está, de data — ahí manda el server
   * la etiqueta de un lookup de sólo lectura (hotelCode-label), que antes salía vacía. null si
   * no es un campo que el layout pinte (un grid, una property row, un tipo sin widget).
   */
  function layoutFieldOf(md, state, data, columns = 1) {
    const fieldId = md.fieldId || md.id
    if (!fieldId || (md.columns || []).length || md.propertyRow
      || (RICH_TEXT_STEREOTYPES[md.stereotype] && md.readOnly)
      || !(LAYOUT_TYPES[md.dataType] || md.stereotype === 'searchable' || isExtraLayoutField(md))) return null
    const s = state || {}
    const d = data || {}
    const raw = s[fieldId] != null ? s[fieldId] : d[fieldId]
    const widget = fieldWidgetOf(md, data, { lookups: !md.readOnly, value: raw, textWhenEmpty: true })
    let value = raw == null || raw === '' ? null : raw
    if (widget.isBoolean) value = !!raw
    else if (widget.isSelect) value = value == null ? null : plainValueOf(value)
    else if (widget.isNumber || widget.isMoney || widget.isSlider || widget.isStars) value = value == null || Number.isNaN(Number(value)) ? null : Number(value)
    else if (widget.isMultiSelect || widget.isCheckboxSet) value = Array.isArray(raw) ? raw.map(plainValueOf) : (raw == null || raw === '' ? [] : String(raw).split(','))
    else if (value != null && typeof value === 'object') value = plainValueOf(value)
    return {
      ...widget,
      value,
      // el del wire, acotado a las columnas del layout. La plantilla (oj-form-layout clásico, con
      // los labels dentro) aún no lo aplica: eso pide oj-c-form-layout y sus column-span
      colspan: Math.max(1, Math.min(Math.floor(Number(md.colspan) || 1), columns)),
      messagesCustom: [],
    }
  }

  // ── @Searchable: el selector en un diálogo ─────────────────────────────────────────────────
  //
  // Un @Searchable (un id, o una List/Set/array de ids) se pinta como chips — uno por id, con su
  // rótulo de data `<campo>-labels` ({id → rótulo}; en uno simple, `<campo>-label`) — y un botón
  // que abre su selector (`codesearch-<campo>`): un listado en un Dialog. Elegir una fila
  // (`action-on-row-select`) o «Add selected» (`action-on-row-select-selected`, con las filas
  // marcadas en crud_selected_items) contesta value-changed / data-changed / close-modal-requested,
  // que aquí se aplican al contexto que abrió el diálogo. El servidor fusiona: un campo de varios
  // valores AÑADE a los que tenía. Quitar un chip es sólo del cliente. Vaadin hace lo mismo
  // (libs/mateu searchableMulti.ts).

  /** ¿Es un @Searchable editable como tal? (la vista de detalle lo manda como `<campo>-label`:
   *  su texto, que se pinta como cualquier valor de sólo lectura) */
  function isSearchableField(f) {
    return !!f && f.stereotype === 'searchable' && !/-label$/.test(String(f.fieldId || ''))
  }

  /** Los ids de un campo, lleguen como lleguen (lista, un id suelto, nada). */
  function searchableIdsOf(value) {
    if (value == null || value === '') return []
    const list = Array.isArray(value) ? value : [value]
    return list.filter((id) => id != null && id !== '')
  }

  /**
   * Los chips de un @Searchable: uno por id, rotulado (o el propio id si no hay rótulo). Cada chip
   * lleva lo que queda al quitarlo (`remaining`: en uno simple, null) — precomputado (CSP de VB).
   */
  function searchableChipsOf(fieldId, ids, labels, opts = {}) {
    const map = labels && typeof labels === 'object' ? labels : {}
    return ids.map((id) => {
      const raw = opts.singleLabel != null && opts.singleLabel !== '' ? opts.singleLabel : map[String(id)]
      const label = raw != null && raw !== '' ? String(raw) : String(id)
      return {
        fieldId,
        id,
        label,
        removeLabel: 'Remove ' + label,
        removable: !opts.readonly,
        remaining: opts.multi ? ids.filter((other) => String(other) !== String(id)) : null,
      }
    })
  }

  /** El widget de un @Searchable: sus chips y el botón que abre el selector. */
  function searchableWidgetOf(f, data, value) {
    const fieldId = f.fieldId
    const multi = f.dataType === 'array'
    const ids = searchableIdsOf(plainValueOf(value))
    const d = data || {}
    const readonly = !!f.readOnly
    const chips = searchableChipsOf(fieldId, multi ? ids : ids.slice(0, 1),
      multi ? d[fieldId + '-labels'] : null,
      { multi, readonly, singleLabel: multi ? null : d[fieldId + '-label'] })
    return {
      fieldId,
      label: f.label || fieldId,
      required: !!f.required,
      readonly,
      editable: !readonly,
      isSearchable: true,
      isSearchableMulti: multi,
      chips,
      hasChips: chips.length > 0,
      // el botón despacha como cualquier bloque del host (hostBlockAction: actionId + parameters)
      actionId: 'codesearch-' + fieldId,
      parameters: {},
      addLabel: multi ? 'Add' : 'Search',
      isSelect: false,
      isLookup: false,
      lookupActionId: '',
      options: [],
      isBoolean: false,
      isDate: false,
      isDateTime: false,
      isNumber: false,
      isTextArea: false,
      isText: false,
    }
  }

  /** ¿Es el overlay el diálogo de un selector (un listado cuyo ServerSide atiende la elección)? */
  function isPickerOverlay(ctx) {
    const surface = ctx && ctx.surface
    if (!surface || !findByType(surface, 'Crud')) return false
    return ((surface.actions || []).some((a) => a && a.id === SEARCHABLE_PICK_ACTION))
  }

  const SEARCHABLE_PICK_ACTION = 'action-on-row-select'
  const SEARCHABLE_ADD_ACTION = 'action-on-row-select-selected'

  /**
   * El SELECTOR de un @Searchable abierto (el overlay superior, si lo es), listo para el oj-dialog
   * del selector: título, columnas (sin la columna-botón «Select»: elegir es pulsar la fila),
   * filas, búsqueda, paginación y — en un campo de varios valores — la selección múltiple y el
   * botón «Add selected». null si el overlay superior no es un selector.
   */
  function searchPickerOf(reg) {
    const id = reg && reg.stack && reg.stack.length ? reg.stack[reg.stack.length - 1] : null
    const ctx = id && reg.contexts ? reg.contexts[id] : null
    if (!isPickerOverlay(ctx)) return null
    const listing = listingOf({ tree: ctx.surface, data: ctx.data }) || {}
    const state = ctx.state || {}
    const multi = state._searchableMulti === true || state._searchableMulti === 'true'
      || !!listing.rowsSelectionEnabled
    const addButton = (listing.toolbar || []).find((b) => b.actionId === SEARCHABLE_ADD_ACTION)
    // sin título propio, el del campo que lo abrió (su rótulo)
    const opener = reg.contexts[ctx.opener || HOST_ID]
    const field = opener && opener.tree && state._searchableField
      ? collectFields(opener.tree).find((f) => f.fieldId === state._searchableField) : null
    return {
      id,
      title: ctx.title || (field && field.label) || 'Search',
      multi,
      searchable: !!listing.searchable,
      searchText: state.searchText || '',
      columns: (listing.columns || []).filter((c) => c.id !== 'select' && c.id !== ROW_LINES_FIELD),
      rows: listing.rows || [],
      isEmpty: !!listing.isEmpty,
      emptyText: listing.emptyStateMessage || 'No data.',
      selectionMode: { row: multi ? 'multiple' : 'none' },
      pageSize: listing.pageSize || 20,
      paging: listing.paging,
      pickActionId: SEARCHABLE_PICK_ACTION,
      addActionId: SEARCHABLE_ADD_ACTION,
      addLabel: (addButton && addButton.label) || 'Add selected',
    }
  }

  /** El estado de la búsqueda del selector: lo que su `search` lleva en componentState. */
  function pickerSearchStateOf(picker, opts = {}) {
    const size = (picker && picker.pageSize) || 20
    return {
      searchText: opts.searchText != null ? opts.searchText : ((picker && picker.searchText) || ''),
      page: opts.page != null ? opts.page : 0,
      size,
    }
  }

  /**
   * Aplica al contexto que abrió el overlay superior los eventos con los que un componente del
   * overlay le devuelve un valor — value-changed {fieldId, value}, data-changed {key, value} — y
   * close-modal-requested (cierra el overlay). Es lo que en Vaadin hace el mateu-event-interceptor
   * del diálogo al reenviarlos a su dueño. true si el evento se aplicó; sin overlay, false (el
   * evento sigue al bus, como siempre).
   */
  function applyOverlayEvent(contexts, stack, data) {
    const name = data && data.eventName
    if (name !== 'value-changed' && name !== 'data-changed' && name !== 'close-modal-requested') return false
    const topId = stack.length ? stack[stack.length - 1] : null
    const top = topId ? contexts[topId] : null
    if (!top) return false
    if (name === 'close-modal-requested') {
      delete contexts[topId]
      stack.pop()
      return true
    }
    const detail = data.detail || data.payload || {}
    const openerId = top.opener && contexts[top.opener] ? top.opener : HOST_ID
    const opener = contexts[openerId]
    if (!opener) return false
    if (name === 'value-changed' && detail.fieldId) {
      contexts[openerId] = { ...opener, state: { ...(opener.state || {}), [detail.fieldId]: detail.value } }
      return true
    }
    if (name === 'data-changed' && detail.key) {
      contexts[openerId] = { ...opener, data: { ...(opener.data || {}), [detail.key]: detail.value } }
      return true
    }
    return false
  }

  /** El registro con `values` fundidos en el estado del contexto `id` (p.ej. el borrador del
   *  formulario al abrir un selector: lo escrito no se pierde cuando el diálogo se cierra). */
  function withContextState(reg, id, values) {
    const ctx = reg && reg.contexts && reg.contexts[id]
    if (!ctx || !values || !Object.keys(values).length) return reg
    return { ...reg, contexts: { ...reg.contexts, [id]: { ...ctx, state: { ...(ctx.state || {}), ...values } } } }
  }

  /**
   * Una proyección (secciones del formulario, bloques del host…) con los chips del @Searchable
   * `fieldId` rehechos para `ids` — al quitar un chip, sin volver al servidor. Los rótulos salen
   * de los chips que ya había.
   */
  function withSearchableIds(projection, fieldId, ids) {
    const visit = (node) => {
      if (Array.isArray(node)) return node.map(visit)
      if (!node || typeof node !== 'object') return node
      if (node.isSearchable && node.fieldId === fieldId) {
        const labels = {}
        for (const chip of node.chips || []) labels[String(chip.id)] = chip.label
        const list = searchableIdsOf(ids)
        const chips = searchableChipsOf(fieldId, node.isSearchableMulti ? list : list.slice(0, 1), labels,
          { multi: node.isSearchableMulti, readonly: node.readonly })
        return { ...node, chips, hasChips: chips.length > 0 }
      }
      const out = {}
      for (const key of Object.keys(node)) out[key] = visit(node[key])
      return out
    }
    return visit(projection)
  }

  /**
   * El WIDGET que le toca a un FormField (flags PRECOMPUTADOS: el CSP de VB no evalúa
   * expresiones), compartido por el editor de fila y los formularios de página/drawer/isla:
   * select si trae opciones (estáticas, o las que trajo su búsqueda) — o, con lookups, si es un
   * lookup remoto —, fecha, fecha-hora, número, booleano, área de texto o texto.
   */
  // Estereotipos de campo con widget propio más allá del texto/número/fecha/booleano/select (reto
  // PMS): radio, selección múltiple, importe y los de captura. Cada familia es un flag is* de la
  // plantilla (ver poc/templates/fields-extra.html).
  const MULTI_SELECT_STEREOTYPES = { multiSelect: true, combobox: true, listBox: true }
  const CHECKBOX_SET_STEREOTYPES = { checkbox: true, choice: true }
  const CAPTURE_MODES = { fileUpload: 'file', uploadableImage: 'image', image: 'image', signature: 'signature', camera: 'camera' }

  /** El widget de un estereotipo «extra», o null si el campo es de los de siempre. */
  function extraWidgetOf(f, options) {
    const st = f.stereotype
    if (st === 'radio' && options.length) return { isRadio: true }
    if (f.dataType === 'array' && options.length && MULTI_SELECT_STEREOTYPES[st]) return { isMultiSelect: true }
    if (f.dataType === 'array' && options.length && (CHECKBOX_SET_STEREOTYPES[st] || !st || st === 'regular'))
      return { isCheckboxSet: true }
    if (st === 'money' || f.dataType === 'money') {
      const currency = (f.attributes || []).find && ((f.attributes || []).find((a) => a && a.key === 'currency') || {}).value
      return {
        isMoney: true,
        // conversor de JET (oj-input-number): número con 2 decimales y su símbolo de moneda
        converter: converterOf({ type: 'number', options: { style: 'currency', currency: currency || 'EUR', minimumFractionDigits: 2 } }),
      }
    }
    if (CAPTURE_MODES[st]) return { isCapture: true, captureMode: CAPTURE_MODES[st], accept: f.accept || '' }
    // slider → oj-slider; stars → oj-rating-gauge; color → mateu-color-field (a hex string: JET's
    // oj-color-spectrum works on oj.Color objects); richText → mateu-rich-text-field (HTML, Delta read)
    if (st === 'slider') {
      const min = Number(f.sliderMin) || 0
      const max = Number(f.sliderMax) > min ? Number(f.sliderMax) : 100
      return { isSlider: true, min, max, step: Number(f.step) > 0 ? Number(f.step) : 1 }
    }
    if (st === 'stars') return { isStars: true, max: Number(f.sliderMax) > 0 ? Number(f.sliderMax) : 5 }
    if (st === 'color') return { isColor: true }
    if (st === 'richText' && !f.readOnly) return { isRichEditor: true }
    return null
  }

  /** ¿Lo pinta el oj-form-layout? (además de los LAYOUT_TYPES de siempre) */
  function isExtraLayoutField(md) {
    return !!(md.stereotype === 'radio' || md.stereotype === 'money' || md.dataType === 'money'
      || md.stereotype === 'slider' || md.stereotype === 'stars' || md.stereotype === 'color'
      || (md.stereotype === 'richText' && !md.readOnly)
      || CAPTURE_MODES[md.stereotype]
      || (md.dataType === 'array' && (md.options || []).length
        && (MULTI_SELECT_STEREOTYPES[md.stereotype] || CHECKBOX_SET_STEREOTYPES[md.stereotype])))
  }

  function fieldWidgetOf(f, data, { lookups, value, textWhenEmpty }) {
    if (isSearchableField(f)) return searchableWidgetOf(f, data, value)
    const extra = extraWidgetOf(f, optionsOf(f, data))
    if (extra) {
      const flags = { isSelect: false, isBoolean: false, isDate: false, isDateTime: false, isNumber: false, isTextArea: false, isText: false }
      return {
        fieldId: f.fieldId,
        label: f.label || f.fieldId,
        required: !!f.required,
        readonly: !!f.readOnly,
        isLookup: false,
        lookupActionId: '',
        options: (extra.isRadio || extra.isMultiSelect || extra.isCheckboxSet) ? optionsOf(f, data) : [],
        ...flags,
        isRadio: false, isMultiSelect: false, isCheckboxSet: false, isMoney: false, isCapture: false,
        isSlider: false, isStars: false, isColor: false, isRichEditor: false, min: 0, max: 0, step: 1,
        converter: null, captureMode: '', accept: '',
        ...extra,
      }
    }
    const lookupActionId = (f.remoteCoordinates && f.remoteCoordinates.action) || ''
    let options = optionsOf(f, data)
    // Un lookup con valor que aún no está entre sus opciones (no han llegado, o sólo llegó la
    // del valor) lo lleva como opción propia, con su etiqueta si el server la mandó: un
    // oj-select-one con un valor que no está en sus opciones se pinta VACÍO.
    const current = plainValueOf(value)
    if (lookups && lookupActionId && current != null && current !== ''
        && !options.some((o) => String(o.value) === String(current))) {
      const label = (value && typeof value === 'object' && value.label) || (data && data[f.fieldId + '-label'])
      options = [{ value: current, label: label != null && label !== '' ? String(label) : String(current) }].concat(options)
    }
    // en una página, un lookup cuya búsqueda no trajo nada se queda en texto: un desplegable
    // vacío no deja ni escribir el código (el editor de fila sí lo pinta siempre como select)
    const isSelect = (lookups && !!lookupActionId && !(textWhenEmpty && !options.length)) || options.length > 0
    const isBoolean = !isSelect && (f.dataType === 'bool' || f.dataType === 'boolean')
    const isDate = !isSelect && f.dataType === 'date'
    const isDateTime = !isSelect && f.dataType === 'dateTime'
    const isNumber = !isSelect && !!NUMERIC_TYPES[f.dataType]
    const isTextArea = !isSelect && (f.stereotype === 'textarea' || !!RICH_TEXT_STEREOTYPES[f.stereotype])
    return {
      fieldId: f.fieldId,
      label: f.label || f.fieldId,
      required: !!f.required,
      readonly: !!f.readOnly,
      isSelect,
      isLookup: lookups && !!lookupActionId,
      lookupActionId: lookups ? lookupActionId : '',
      options: isSelect ? options : [],
      isBoolean,
      isDate,
      isDateTime,
      isNumber,
      isTextArea,
      isText: !isSelect && !isBoolean && !isDate && !isDateTime && !isNumber && !isTextArea,
      isRadio: false, isMultiSelect: false, isCheckboxSet: false, isMoney: false, isCapture: false,
      isSlider: false, isStars: false, isColor: false, isRichEditor: false, min: 0, max: 0, step: 1,
      converter: null, captureMode: '', accept: '',
    }
  }

  /** Los obligatorios vacíos de la fila → { fieldId: mensaje }; {} si está bien. */
  function validateRow(ctx, values) {
    const errors = {}
    for (const f of rowFieldsOf(ctx, values)) {
      if (f.required && !f.readonly && !f.isBoolean && isBlank(f.value)) errors[f.fieldId] = 'Required'
    }
    return errors
  }

  /**
   * La acción `actionId` tal como la DECLARA el ServerSide del contexto (`tree.actions`), o null.
   * La exacta gana a un comodín ('*', 'prefijo*'), como en Vaadin: un flag de la declarada
   * (confirmación, validación) no puede quedar tapado por un catch-all listado antes.
   */
  function declaredActionOf(ctx, actionId) {
    const actions = (ctx && ctx.tree && ctx.tree.actions) || []
    const id = String(actionId || '')
    return actions.find((a) => a && a.id === id)
      || actions.find((a) => a && typeof a.id === 'string' && a.id.endsWith('*')
        && id.startsWith(a.id.slice(0, -1)))
      || null
  }

  /**
   * El contexto de TRANSPORTE de una acción del host: a qué ServerSide va.
   *
   * Una pantalla cargada a través de un mediador (el crud orquestador, el home de un pod remoto)
   * guarda en `outbound.serverSideType` el del mediador, y el árbol del host es el componente que
   * pintó — la vista de la reserva, `BookingViewModel`. Las acciones que ese componente DECLARA
   * (sus `@Toolbar`: «Ver recorrido», «Cancel booking», «Activate») son suyas: el mediador no las
   * conoce y contestaba «verRecorrido not supported by BookingCrudOrchestrator». Las que no
   * declara (edit, new, cancel-view: las del crud) y las marcadas `bubble` siguen subiendo al
   * mediador. Es la regla de Vaadin (mateu-component: la acción la atiende el ServerSide que la
   * anuncia; si no, burbujea).
   */
  function actionTransportOf(ctx, actionId) {
    const tree = ctx && ctx.tree
    if (!tree || tree.type !== 'ServerSide' || !tree.serverSideType) return ctx
    const action = declaredActionOf(ctx, actionId)
    if (!action || action.bubble) return ctx
    const outbound = ctx.outbound || {}
    if (outbound.serverSideType === tree.serverSideType) return ctx
    return { ...ctx, outbound: { ...outbound, serverSideType: tree.serverSideType } }
  }

  /**
   * El transporte de una acción del OVERLAY superior cuando la declara su formulario embebido
   * (EmbeddedView: un ServerSide propio dentro del Dialog/Drawer): va a ESE componente — su
   * serverSideType, su id como initiator, su estado — sin ruta, como en Vaadin. null si no hay
   * overlay o su formulario no declara la acción (entonces va al host, como siempre: el drawer
   * del crud no lleva ServerSide propio).
   */
  function overlayTransportOf(reg, actionId) {
    const id = reg && reg.stack && reg.stack.length ? reg.stack[reg.stack.length - 1] : null
    const top = id && reg.contexts ? reg.contexts[id] : null
    const surface = top && top.surface
    if (!surface || !surface.serverSideType) return null
    const action = declaredActionOf({ tree: surface }, actionId)
    if (!action || action.bubble) return null
    const host = (reg.contexts && reg.contexts[HOST_ID]) || {}
    return {
      id: surface.id || top.id,
      tree: surface,
      state: top.state,
      outbound: { ...(host.outbound || {}), serverSideType: surface.serverSideType, route: '', consumedRoute: '' },
    }
  }

  // Los textos genéricos del diálogo de confirmación, en el idioma de la interfaz (el lang del
  // documento, que copy.mjs fija al del navegador — como pagingLangOf): una consola en español no
  // pregunta «Yes / No».
  function confirmationDefaultsOf(lang) {
    const l = chromeLanguage(lang)
    return { title: chromeText('confirmTitle', null, l), message: chromeText('confirmMessage', null, l),
      confirmText: chromeText('confirmYes', null, l), denyText: chromeText('confirmNo', null, l) }
  }

  /**
   * El diálogo de confirmación que pide la acción antes de salir (`confirmationRequired`), o null
   * si no pide ninguno. Cada texto cae por su cuenta al genérico — como en Vaadin
   * (confirmationTexts.ts): una acción que sólo declara el mensaje los trae vacíos al resto.
   */
  function confirmationOf(ctx, actionId, lang) {
    const action = declaredActionOf(ctx, actionId)
    if (!action || !action.confirmationRequired) return null
    const texts = action.confirmationTexts || {}
    const defaults = confirmationDefaultsOf(lang)
    const pick = (value, fallback) => (value != null && String(value).trim() ? String(value) : fallback)
    return {
      title: pick(texts.title, defaults.title),
      message: pick(texts.message, defaults.message),
      confirmText: pick(texts.confirmationText, defaults.confirmText),
      denyText: pick(texts.denialText, defaults.denyText),
    }
  }

  // La respuesta pendiente del diálogo de confirmación: la chain que lanza la acción espera la
  // promesa; los botones del diálogo (y su ✕ / Esc) la resuelven. Una sola a la vez: abrir otra
  // antes de contestar la primera la da por denegada.
  let pendingConfirmation = null

  /** Espera la respuesta del diálogo de confirmación (true = confirmar). */
  function awaitConfirmation() {
    if (pendingConfirmation) pendingConfirmation(false)
    return new Promise((resolve) => { pendingConfirmation = resolve })
  }

  /** Contesta el diálogo de confirmación abierto; sin ninguno esperando, no hace nada. */
  function answerConfirmation(confirmed) {
    const resolve = pendingConfirmation
    pendingConfirmation = null
    if (resolve) resolve(!!confirmed)
  }

  /**
   * ¿Pide la acción `actionId` del contexto validar el formulario antes de salir? Es el
   * validationRequired de las acciones del ServerSide (p.ej. el `next` de un wizard, el `save`
   * de un formulario): lo que Vaadin comprueba en el navegador antes de llamar al servidor.
   * → { fields } (los fieldsToValidate de la acción; [] = todos) o null si no pide validar.
   * La acción EXACTA gana a un comodín ('*', 'prefijo*'), como en Vaadin.
   */
  function validationOf(ctx, actionId) {
    const action = declaredActionOf(ctx, actionId)
    if (!action || !action.validationRequired) return null
    return { fields: Array.isArray(action.fieldsToValidate) ? action.fieldsToValidate : [] }
  }

  /**
   * Los obligatorios vacíos del formulario de la página (sus secciones, tal como se pintan) con
   * lo que el usuario ha escrito (el borrador gana al estado) → [fieldId] en el orden del
   * formulario: el primero es el que recibe el foco. `only` restringe a esos campos.
   */
  function formErrorsOf(sections, draft, only) {
    const restrict = Array.isArray(only) && only.length ? new Set(only) : null
    const d = draft || {}
    const out = []
    for (const section of sections || []) {
      for (const f of section.fields || []) {
        if (!f.required || f.readonly || f.isBoolean) continue
        if (restrict && !restrict.has(f.fieldId)) continue
        const value = Object.prototype.hasOwnProperty.call(d, f.fieldId) ? d[f.fieldId] : f.value
        if (isBlank(plainValueOf(value)) && out.indexOf(f.fieldId) < 0) out.push(f.fieldId)
      }
    }
    return out
  }

  /**
   * El placeholder de los desplegables en el idioma `lang` (el del navegador; inglés si no se
   * conoce). Hace falta uno: un oj-select-one SIN placeholder elige la primera opción por su
   * cuenta, y un obligatorio vacío pasaba la validación con un valor que nadie había elegido.
   */
  function selectPlaceholder(lang) {
    return chromeText('selectValue', null, String(lang || '').split(/[-_]/)[0] || 'en')
  }

  /**
   * Los lookups REMOTOS de un contexto cuyas opciones no se han cargado todavía → [{ fieldId,
   * actionId }]: los campos editables del formulario (una página, un paso de wizard, un
   * formulario nuevo) y los filtros del listado. Un lookup de una página se pintaba como texto
   * sin opciones — vacío en un alta — porque sólo el editor de fila lanzaba su búsqueda. La
   * opción suelta que el server manda con el valor (su etiqueta) no cuenta como cargadas: con
   * ella sola no se puede elegir otra. Los de sólo lectura no la necesitan.
   */
  function formLookupsOf(ctx) {
    if (!ctx || !ctx.tree) return []
    const data = ctx.data || {}
    const seen = {}
    const out = []
    for (const f of collectFields(ctx.tree)) {
      const actionId = f.type === 'FormField' && f.remoteCoordinates && f.remoteCoordinates.action
      if (!actionId || f.readOnly || f.dataType === 'array' || (f.columns || []).length) continue
      if (seen[f.fieldId] || (data[f.fieldId] && data[f.fieldId][LOOKUP_LOADED])) continue
      seen[f.fieldId] = true
      out.push({ fieldId: f.fieldId, actionId })
    }
    return out
  }

  /** Marca de las opciones de un lookup ya buscadas (en ctx.data[campo]): no se repite la búsqueda. */
  const LOOKUP_LOADED = '_mateuLoaded'

  /** El registro con las opciones de esos lookups del contexto marcadas como cargadas. */
  function markLookupsLoaded(reg, ctxId, fieldIds) {
    const ctx = reg && reg.contexts && reg.contexts[ctxId]
    if (!ctx) return reg
    const data = { ...(ctx.data || {}) }
    for (const fieldId of fieldIds || []) {
      const found = data[fieldId] && typeof data[fieldId] === 'object' ? data[fieldId] : { content: [] }
      data[fieldId] = { ...found, [LOOKUP_LOADED]: true }
    }
    return { ...reg, contexts: { ...reg.contexts, [ctxId]: { ...ctx, data } } }
  }

  /** Los lookups de la fila que aún no tienen opciones → [{ fieldId, actionId }]. */
  function pendingLookupsOf(ctx) {
    if (!ctx || !ctx.tree) return []
    return rowFieldsOf(ctx)
      .filter((f) => f.isLookup && !(ctx.data && ctx.data[f.fieldId]))
      .map((f) => ({ fieldId: f.fieldId, actionId: f.lookupActionId }))
  }

  /**
   * La request de la búsqueda de un lookup de la fila: la resuelve el ServerSide de la FILA
   * (su serverSideType, su id como initiator) con el estado de la fila; la ruta y el backend
   * son los del contenedor.
   */
  function lookupRequestOf(reg, rowCtxId, fieldId, opts = {}) {
    const row = reg && reg.contexts && reg.contexts[rowCtxId]
    if (!row || !row.tree) return null
    const field = collectFields(row.tree).find((f) => f.fieldId === fieldId)
    const actionId = field && field.remoteCoordinates && field.remoteCoordinates.action
    if (!actionId) return null
    const holder = reg.contexts[opts.holderId || HOST_ID] || {}
    return {
      actionId,
      componentState: { ...(row.state || {}), ...(opts.rowDraft || {}) },
      parameters: { searchText: opts.searchText || '', fieldId, size: 200, page: 0 },
      ctx: {
        id: row.id,
        tree: row.tree,
        state: row.state,
        outbound: { ...(holder.outbound || {}), serverSideType: row.tree.serverSideType },
      },
    }
  }

  /**
   * Proyección del EDITOR DE FILA abierto (el oj-dialog): null si ninguna lista modal del
   * contenedor tiene su detalle abierto (`_show_detail[campo]`) con el formulario ya recibido
   * en `<campo>-container`.
   */
  function rowEditorOf(reg, opts = {}) {
    const holder = reg && reg.contexts && reg.contexts[opts.holderId || HOST_ID]
    if (!holder || !holder.tree) return null
    const state = holder.state || {}
    const show = state._show_detail || {}
    const lists = modalListsOf(holder.tree)
    for (const fieldId of Object.keys(lists)) {
      if (!(show[fieldId] === true || state[fieldId + '_show_detail'] === true)) continue
      const id = fieldId + '-container'
      const ctx = reg.contexts[id]
      if (!ctx || !ctx.tree) continue
      const form = findByType(ctx.tree, 'Form')
      const md = (form && form.metadata) || {}
      const rowState = { ...(ctx.state || {}), ...(opts.rowDraft || {}) }
      const header = (md.header || [])
        .map((h) => (h && h.metadata && h.metadata.type === 'Text') ? interpolate(h.metadata.text, rowState) : '')
        .filter(Boolean)
      const buttons = (md.buttons || []).filter((b) => b && b.actionId).map(rowButtonOf)
      return {
        id,
        fieldId,
        formPosition: lists[fieldId].formPosition,
        title: interpolate(md.title || lists[fieldId].label || '', rowState),
        subtitle: header.join(' · '),
        toolbar: (md.toolbar || []).filter((b) => b && b.actionId).map(rowButtonOf),
        // pie Redwood: la primaria a la DERECHA del todo — el wire la manda primera
        buttons: buttons.slice().reverse(),
        fields: rowFieldsOf(ctx, opts.rowDraft, opts.errors),
      }
    }
    return null
  }




  // Part of the Redwood core (reduceContexts.mjs re-exports every piece): planning board, gantt, row tones and listing aggregates/groups.

  // ── PlanningBoard (Room Diary) sobre oj-gantt ─────────────────────────────────────────────────
  //
  // oj-gantt es el tape chart de JET: filas con tareas, arrastrar para mover (dnd.move) y bordes para
  // redimensionar (task-defaults.resizable), tooltip propio (shortDesc). Mateu manda los bloques con
  // el fin INCLUSIVO (la última noche); el gantt pinta [start, end) en tiempo, así que el fin se
  // pinta como el día siguiente y se devuelve restando uno.

  const DAY_MS = 86400000
  const isoDay = (d) => {
    const pad = (n) => String(n).padStart(2, '0')
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate())
  }
  const plusDays = (iso, n) => isoDay(new Date(Date.parse(iso + 'T00:00:00Z') + n * DAY_MS))

  function planningAtomOf(m, id) {
    const columns = m.attributeColumns || []
    const blocks = m.blocks || []
    const from = m.from || (blocks.length ? blocks.map((b) => b.start).sort()[0] : isoDay(new Date()))
    const to = m.to || (blocks.length ? blocks.map((b) => b.end).sort().slice(-1)[0] : from)
    const rows = (m.resources || []).map((r, i) => {
      const attrs = columns.map((c, k) => ({ label: c, value: (r.attributes || [])[k] || '' }))
      return {
        _rowNumber: i,
        id: r.id,
        // la etiqueta de la fila lleva los atributos: el eje de filas de oj-gantt sólo pinta texto
        label: [r.label].concat(attrs.map((a) => a.value).filter(Boolean)).join(' · '),
        group: r.group || '',
        iconClass: r.icon ? ojIconOrGenericOf(r.icon) : '',
        tasks: blocks.filter((b) => b.resourceId === r.id && b.start && b.end).map((b) => ({
          id: b.id,
          start: b.start + 'T00:00:00',
          end: plusDays(b.end, 1) + 'T00:00:00',
          label: (b.icon ? '★ ' : '') + (b.label || ''),
          shortDesc: b.summary || ((b.label || '') + ' · ' + b.start + ' → ' + b.end + (b.status ? ' · ' + b.status : '')),
          svgStyle: b.color ? { fill: b.color, stroke: b.color } : undefined,
          // dentro de la barra o nada: fuera, el texto blanco sobre el fondo no se lee (y el resumen
          // completo sigue en el tooltip)
          labelPosition: ['innerCenter', 'innerStart', 'none'],
          labelStyle: { fill: '#ffffff' },
        })),
      }
    })
    return {
      isPlanning: true,
      planningId: id || 'planning',
      attributeColumns: columns,
      start: from + 'T00:00:00',
      end: plusDays(to, 1) + 'T00:00:00',
      rows,
      rowsProvider: dataProviderFactory ? dataProviderFactory(rows) : null,
      movable: !!m.moveActionId,
      resizable: !!m.resizeActionId,
      moveActionId: m.moveActionId || '',
      resizeActionId: m.resizeActionId || '',
      openActionId: m.openActionId || '',
      selectActionId: m.selectActionId || '',
      rangeSelectActionId: m.rangeSelectActionId || '',
      // para la selección de rango (poc/planning.mjs lee estos data-* del oj-gantt)
      rangeAction: m.rangeSelectActionId || '',
      startDay: from,
      endDay: plusDays(to, 1),
      rowIds: rows.map((r) => r.id).join('\u001f'),
      rowLabels: rows.map((r) => r.label).join('\u001f'),
      dndMove: m.moveActionId ? 'enabled' : 'disabled',
      taskResizable: m.resizeActionId ? 'enabled' : 'disabled',
    }
  }

  /** Un GANTT de tareas (Gantt: título, inicio, fin, avance, color) sobre el mismo oj-gantt que el
   *  tape chart: una fila por tarea con su barra, el avance como el relleno de progreso de JET, y la
   *  tarea pulsada → onTaskSelectionActionId con _clickedTaskId (el contrato del renderer web). */
  function ganttAtomOf(m, id) {
    const tasks = (m.tasks || []).filter((t) => t && t.start && t.end)
    const atom = planningAtomOf({
      resources: tasks.map((t) => ({ id: t.id, label: t.title || t.id })),
      blocks: tasks.map((t) => ({
        id: t.id, resourceId: t.id, start: t.start, end: t.end, label: t.title || '', color: t.color,
        summary: (t.title || '') + ' · ' + t.start + ' → ' + t.end + ' · ' + Math.round(t.progress || 0) + '%',
      })),
      selectActionId: m.onTaskSelectionActionId || '',
    }, id || 'gantt')
    const progress = {}
    for (const t of tasks) progress[t.id] = Math.max(0, Math.min(100, Number(t.progress) || 0)) / 100
    for (const row of atom.rows) for (const task of row.tasks) task.progress = { value: progress[task.id] || 0 }
    const days = Math.round((Date.parse(atom.endDay) - Date.parse(atom.startDay)) / DAY_MS)
    return {
      ...atom,
      isGantt: true,
      selectParam: '_clickedTaskId',
      // escala a la medida del plan: un proyecto de meses se lee por meses/semanas
      majorScale: days > 60 ? 'months' : 'weeks',
      minorScale: days > 60 ? 'weeks' : 'days',
    }
  }

  /**
   * Un evento del oj-gantt → { actionId, parameters } de Mateu, o null si no hay acción. Fechas a
   * días (fin inclusivo). `kind`: 'move' | 'resize' | 'open' | 'select' | 'range'.
   */
  function planningActionOf(atom, kind, detail) {
    if (!atom) return null
    // el gantt devuelve instantes (el punto exacto donde se soltó, en UTC): se redondean al día
    // LOCAL más cercano — una estancia empieza y acaba en días, no a las 09:38
    const day = (v) => {
      if (!v) return null
      const text = String(v)
      if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text
      const d = new Date(text)
      return isoDay(new Date(Math.round((d.getTime() - d.getTimezoneOffset() * 60000) / DAY_MS) * DAY_MS))
    }
    const lastNight = (v) => (v ? plusDays(day(v), -1) : null)
    const task = detail && detail.taskContexts && detail.taskContexts[0]
    const taskId = (task && (task.data ? task.data.id : task.id)) || (detail && detail.taskId)
    if (kind === 'move' && atom.moveActionId && taskId) {
      const rowId = detail.rowContext && detail.rowContext.rowData ? detail.rowContext.rowData.id
        : (detail.rowContext && detail.rowContext.data && detail.rowContext.data.id) || detail.rowId
      return { actionId: atom.moveActionId, parameters: {
        // start/end: los nuevos límites de la barra (value es el instante bajo el puntero)
        _blockId: taskId, _resourceId: rowId, _start: day(detail.start || detail.value), _end: lastNight(detail.end) } }
    }
    if (kind === 'resize' && atom.resizeActionId && taskId) {
      const rowId = detail.rowId || (task && task.rowData && task.rowData.id)
        || (task && task.rowContext && task.rowContext.rowData && task.rowContext.rowData.id)
      return { actionId: atom.resizeActionId, parameters: {
        _blockId: taskId, _resourceId: rowId, _start: day(detail.start), _end: lastNight(detail.end) } }
    }
    if (kind === 'open' && atom.openActionId && taskId) return { actionId: atom.openActionId, parameters: { _blockId: taskId } }
    // el Gantt (Gantt.onTaskSelectionActionId) recibe la tarea como _clickedTaskId; el tape chart, _blockId
    if (kind === 'select' && atom.selectActionId && taskId) return { actionId: atom.selectActionId, parameters: { [atom.selectParam || '_blockId']: taskId } }
    if (kind === 'range' && atom.rangeSelectActionId && detail && detail.rowId && detail.start && detail.end) {
      const [a, b] = [day(detail.start), day(detail.end)].sort((x, y) => x.localeCompare(y))
      return { actionId: atom.rangeSelectActionId, parameters: { _resourceId: detail.rowId, _start: a, _end: b } }
    }
    return null
  }


  // ── listados: tonos de fila (@RowStatus) y grupos/totales (@GroupBy/@Aggregate) ───────────────
  // Mismo contrato que libs/mateu listingGroups.ts / rowTone.ts (el renderer web): el crud trae
  // groupBy y rowStatusField; las columnas, `aggregate`; la búsqueda (data.crud), `aggregates` (del
  // conjunto filtrado) y `groups` (por grupo, en orden).

  const ROW_TONES = { success: 'success', warning: 'warning', danger: 'danger', error: 'danger', info: 'info', neutral: 'neutral', none: 'neutral' }

  function rowToneOf(row, field) {
    if (!row || !field) return null
    let v = row[field]
    if (v && typeof v === 'object') v = v.type != null ? v.type : v.value
    return v == null ? null : (ROW_TONES[String(v).toLowerCase()] || null)
  }

  function toneRows(rows, field) {
    if (!field) return rows
    return rows.map((r) => {
      const tone = rowToneOf(r, field)
      return tone ? { ...r, _tone: tone } : r
    })
  }

  function formatAggregate(value, col) {
    if (value == null) return ''
    if (col.dataType === 'money' || col.stereotype === 'money')
      return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
    if (col.aggregate === 'count') return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Math.round(value))
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)
  }

  function aggregatableColumns(md) {
    return (md.columns || []).map((c) => c.metadata || c).filter((c) => c && c.id)
  }

  /** Los totales por columna (texto) o null si no hay nada que totalizar. */
  function aggregateFootersOf(md, listing) {
    const aggregates = listing && listing.aggregates
    const cols = aggregatableColumns(md)
    if (!aggregates || !cols.some((c) => c.aggregate)) return null
    const out = {}
    for (const c of cols) if (c.aggregate && aggregates[c.id] != null) out[c.id] = formatAggregate(aggregates[c.id], c)
    const first = cols[0]
    if (first && out[first.id] == null) {
      const total = listing.page && listing.page.totalElements
      out[first.id] = md.groupBy && first.id === md.groupBy && total != null ? 'Total (' + total + ')' : 'Total'
    }
    return out
  }

  /** Filas de GRUPO intercaladas donde cambia el valor de groupBy (las filas llegan ordenadas). */
  function groupedRows(rows, md, listing) {
    const groupBy = md.groupBy
    const groups = (listing && listing.groups) || []
    if (!groupBy || !groups.length) return rows
    const cols = aggregatableColumns(md)
    const labelCol = cols.some((c) => c.id === groupBy) ? groupBy : (cols[0] && cols[0].id)
    const out = []
    let last
    rows.forEach((row, i) => {
      const key = String(row[groupBy] == null ? '' : row[groupBy])
      if (i === 0 || key !== last) {
        const g = groups.find((x) => String(x.value) === key)
          || { value: key, count: rows.filter((r) => String(r[groupBy]) === key).length, aggregates: {} }
        const groupRow = { _rowNumber: '__mateuGroup:' + i + ':' + key, _group: true, _tone: 'group' }
        for (const c of cols) {
          groupRow[c.id] = c.id === labelCol ? g.value + ' (' + g.count + ')'
            : c.aggregate ? formatAggregate((g.aggregates || {})[c.id], c) : ''
        }
        out.push(groupRow)
        last = key
      }
      out.push(row)
    })
    return out
  }









  // Part of the Redwood core (reduceContexts.mjs re-exports every piece): the DISPLAY components that
  // were not rendered before (Kanban, Timeline, PricingTable, OrgChart, Heatmap, Funnel, FeatureGrid,
  // Testimonials, CalloutCard, CommentThread, FileList, Checklist, ComparisonCard, ProcessMonitor,
  // Skeleton, Icon, MenuBar/ContextMenu, MessageList/MessageInput, Chat, Bpmn, Workflow, Result,
  // Directory, CookieConsent, ConfirmDialog, Breadcrumbs, Notification…).
  //
  // Every function here is PURE: wire metadata → an ATOM (a flat object the atoms template paints).
  // The VB template evaluator cannot compare, branch or compute (CSP), so every class, text and flag
  // is precomputed. An atom whose element is clickable carries `actionId` + `parameters`, which the
  // shared block listener ({{blockAction}}) sends exactly like a button. Where Oracle has a component
  // the template uses it (oj-chart funnel, oj-avatar, oj-action-card, oj-rating-gauge, oj-checkboxset,
  // oj-menu-button, oj-collapsible, oj-dialog, oj-button…); where it has none the atom is drawn with
  // Redwood tokens and classes (app.css, .mateu-*) — each projection says which.

  const SAFE_URL = /^(https?:|mailto:|tel:|\/|#|\.{0,2}\/|[^:]*$)/i
  /** A link target that is safe to put in an href (no javascript:, data:…); '' otherwise. */
  function safeHref(url) {
    const u = String(url == null ? '' : url).trim()
    if (!u) return ''
    return SAFE_URL.test(u) && !/^\s*(javascript|data|vbscript):/i.test(u) ? u : ''
  }

  const keyed = (list) => (list || []).map((x, i) => ({ ...x, key: String(i) }))
  const str = (v) => (v == null ? '' : String(v))
  /** A clickable element: the action it sends (blockAction) and the flag pair the template needs. */
  const clickable = (actionId, parameters) => ({
    clickable: !!actionId,
    plain: !actionId,
    actionId: actionId || '',
    parameters: parameters || {},
  })
  /** A Mateu/Vaadin icon name → a Redwood icon class (the generic one when it has no translation). */
  function iconClassOf(icon) {
    if (!icon) return ''
    return ojIconOf(icon) || GENERIC_ICON
  }
  /** An emoji or a short text icon (not an icon NAME): shown as text. */
  const isGlyph = (icon) => !!icon && !/^[a-z0-9-]+:[a-z0-9-]+$/i.test(icon) && icon.indexOf('oj-ux-') !== 0
  const glyphOf = (icon) => (isGlyph(icon) ? icon : '')
  const iconOf = (icon) => (isGlyph(icon) ? '' : iconClassOf(icon))

  // A wire colour: one of the theme tones, or a CSS colour.
  const WIRE_TONES = { success: 1, warning: 1, danger: 1, error: 1, info: 1, neutral: 1, primary: 1, contrast: 1, normal: 1 }
  const CSS_COLOR = /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|var\(--[\w-]+\)|[a-z]+)$/i
  /** A colour from the wire → a tone class suffix ('success'…) or a CSS colour ('' when neither). */
  function toneOf(color) {
    const c = str(color).trim().toLowerCase()
    if (!c) return ''
    if (c === 'error') return 'danger'
    if (c === 'primary' || c === 'normal' || c === 'contrast') return 'info'
    return WIRE_TONES[c] ? c : ''
  }
  function cssColorOf(color) {
    const c = str(color).trim()
    return c && !toneOf(c) && CSS_COLOR.test(c) ? c : ''
  }
  const badgeClassOf = (color) => BADGE_CLASSES[toneOf(color) || 'contrast'] || BADGE_CLASSES.contrast

  // ── Kanban (JET has no board): columns of oj-panel, cards as oj-action-card when they act ───────
  function kanbanAtomOf(m, interp = (x) => x) {
    return {
      isKanban: true,
      columns: keyed((m.columns || []).map((col) => {
        const cards = col.cards || []
        const color = cssColorOf(col.color)
        const tone = toneOf(col.color)
        return {
          title: interp(str(col.title)),
          countText: String(cards.length),
          headerClass: 'mateu-kanban-head' + (tone ? ' mateu-tone-' + tone : ''),
          headerStyle: color ? { borderTopColor: color } : {},
          cards: keyed(cards.map((card) => ({
            title: interp(str(card.title)),
            description: interp(str(card.description)),
            badge: interp(str(card.badge)),
            hasBadge: !!card.badge,
            badgeClass: badgeClassOf(card.color),
            cardStyle: cssColorOf(card.color) ? { borderInlineStartColor: cssColorOf(card.color) } : {},
            cardClass: 'mateu-kanban-card' + (toneOf(card.color) ? ' mateu-tone-' + toneOf(card.color) : ''),
            ...clickable(card.actionId, { _clickedCard: card }),
          }))),
          isEmpty: !cards.length,
        }
      })),
    }
  }

  // ── Timeline (oj-timeline is deprecated in JET): a Redwood vertical list with markers ────────────
  function timelineAtomOf(m, interp = (x) => x) {
    return {
      isTimeline: true,
      items: keyed((m.items || []).map((it) => ({
        title: interp(str(it.title)),
        description: interp(str(it.description)),
        timestamp: interp(str(it.timestamp)),
        iconClass: iconOf(it.icon),
        glyph: glyphOf(it.icon),
        dotClass: 'mateu-timeline-dot' + (toneOf(it.color) ? ' mateu-tone-' + toneOf(it.color) : ''),
        dotStyle: cssColorOf(it.color) ? { backgroundColor: cssColorOf(it.color) } : {},
        ...clickable(it.actionId, { _clickedItem: it }),
      }))),
    }
  }

  // ── PricingTable: plans as oj-panel cards (featured = the highlighted one), CTA as oj-button ─────
  function pricingAtomOf(m, interp = (x) => x) {
    const plans = m.plans || []
    return {
      isPricing: true,
      plans: keyed(plans.map((p) => ({
        name: interp(str(p.name)),
        price: interp(str(p.price)),
        period: interp(str(p.period)),
        features: (p.features || []).map((f) => interp(str(f))),
        featured: !!p.featured,
        cardClass: 'oj-panel oj-sm-padding-6x mateu-pricing-plan' + (p.featured ? ' mateu-pricing-featured' : ''),
        hasCta: !!p.actionId,
        ctaLabel: interp(str(p.ctaLabel)) || chromeText('choose'),
        chroming: p.featured ? 'callToAction' : 'outlined',
        colClass: 'oj-flex-item oj-sm-12 oj-md-' + Math.max(3, Math.floor(12 / Math.max(1, Math.min(4, plans.length)))),
        actionId: p.actionId || '',
        parameters: {},
      }))),
    }
  }

  // ── OrgChart: the tree as an indented outline (VB templates cannot recurse), oj-avatar per node ──
  function orgChartAtomOf(m, interp = (x) => x) {
    const nodes = []
    const walk = (node, depth, last) => {
      if (!node) return
      const { children, ...self } = node
      const av = avatarOf({ name: node.title, image: node.avatar })
      nodes.push({
        depth,
        rowStyle: { paddingInlineStart: (depth * 2) + 'rem' },
        rowClass: 'mateu-org-node' + (depth ? ' mateu-org-child' : '') + (last ? ' mateu-org-last' : ''),
        title: interp(str(node.title)),
        subtitle: interp(str(node.subtitle)),
        initials: av.initials,
        src: av.src,
        ariaLabel: [node.title, node.subtitle].filter(Boolean).join(', '),
        ...clickable(node.actionId, { _clickedNode: self }),
      })
      const kids = children || []
      kids.forEach((k, i) => walk(k, depth + 1, i === kids.length - 1))
    }
    walk(m.root, 0, true)
    return { isOrgChart: true, nodes: keyed(nodes) }
  }

  // ── Heatmap (JET has none): a calendar heatmap — a column per week, a row per weekday ────────────
  const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})/
  function heatLevelOf(value, max) {
    if (!(value > 0) || !(max > 0)) return 0
    return Math.max(1, Math.min(4, Math.ceil((value / max) * 4)))
  }
  function heatmapAtomOf(m) {
    const cells = (m.cells || []).filter((c) => c && c.date != null)
    const max = cells.reduce((acc, c) => Math.max(acc, Number(c.value) || 0), 0)
    const cellOf = (c) => {
      const level = heatLevelOf(Number(c.value) || 0, max)
      const text = (c.label ? c.label : c.date + ': ' + (c.value == null ? 0 : c.value))
      return { cls: 'mateu-heat-cell mateu-heat-' + level, title: text, ariaLabel: text }
    }
    const legend = [0, 1, 2, 3, 4].map((l) => ({ key: String(l), cls: 'mateu-heat-cell mateu-heat-' + l }))
    const dated = cells.every((c) => ISO_DAY.test(String(c.date)))
    if (!cells.length || !dated) {
      return { isHeatmap: true, dated: false, weeks: [], flat: keyed(cells.map(cellOf)), legend }
    }
    const dayMs = 86400000
    const toTime = (s) => { const x = ISO_DAY.exec(String(s)); return Date.UTC(+x[1], +x[2] - 1, +x[3]) }
    const byDay = new Map(cells.map((c) => [toTime(c.date), c]))
    const times = [...byDay.keys()].sort((a, b) => a - b)
    // weeks start on Monday: back up to the Monday of the first date
    const dow = (t) => (new Date(t).getUTCDay() + 6) % 7
    let t = times[0] - dow(times[0]) * dayMs
    const end = times[times.length - 1]
    const weeks = []
    while (t <= end) {
      const days = []
      for (let d = 0; d < 7; d++, t += dayMs) {
        const c = byDay.get(t)
        days.push(c ? cellOf(c) : { cls: 'mateu-heat-cell mateu-heat-none', title: '', ariaLabel: '' })
      }
      weeks.push({ days: keyed(days) })
    }
    return { isHeatmap: true, dated: true, weeks: keyed(weeks), flat: [], legend }
  }

  // ── Funnel → oj-chart type="funnel" (each stage a series, one group) ─────────────────────────────
  function funnelAtomOf(m, interp = (x) => x) {
    const items = (m.stages || []).map((s, i) => {
      const item = { _rowNumber: i, id: String(i), value: Number(s.value) || 0, series: interp(str(s.label)) || 'Stage ' + (i + 1), group: 'Funnel' }
      const color = cssColorOf(s.color)
      if (color) item.color = color
      return item
    })
    return {
      isFunnel: true,
      items,
      provider: dataProviderFactory ? dataProviderFactory(items) : null,
      chartStyle: { width: '100%', height: Math.max(12, Math.min(28, items.length * 4)) + 'rem' },
    }
  }

  // ── FeatureGrid: oj-panel tiles (an oj-action-card when the feature acts) on an oj-flex grid ─────
  function featureGridAtomOf(m, interp = (x) => x) {
    const columns = m.columns > 0 && m.columns <= 6 ? m.columns : 3
    const colClass = 'oj-flex-item oj-sm-12 oj-md-' + Math.max(2, Math.floor(12 / columns))
    return {
      isFeatureGrid: true,
      features: keyed((m.features || []).map((f) => ({
        title: interp(str(f.title)),
        description: interp(str(f.description)),
        iconClass: iconOf(f.icon),
        glyph: glyphOf(f.icon),
        colClass,
        ...clickable(f.actionId, {}),
      }))),
    }
  }

  // ── Testimonials: oj-panel quotes, oj-avatar for the author, oj-rating-gauge (read only) ─────────
  function testimonialsAtomOf(m, interp = (x) => x) {
    const items = m.items || []
    return {
      isTestimonials: true,
      items: keyed(items.map((t) => {
        const av = avatarOf({ name: t.author, image: t.avatar })
        return {
          quote: interp(str(t.quote)),
          author: interp(str(t.author)),
          role: interp(str(t.role)),
          initials: av.initials,
          src: av.src,
          rating: Math.max(0, Math.min(5, Number(t.rating) || 0)),
          hasRating: Number(t.rating) > 0,
          ratingLabel: (Number(t.rating) || 0) + ' / 5',
          colClass: 'oj-flex-item oj-sm-12 oj-md-' + (items.length >= 3 ? 4 : items.length === 2 ? 6 : 12),
        }
      })),
    }
  }

  // ── CalloutCard: an oj-panel band with icon, text and an oj-button CTA ───────────────────────────
  const CALLOUT_CLASSES = {
    info: 'oj-panel oj-sm-padding-6x mateu-callout mateu-tone-info',
    success: 'oj-panel oj-sm-padding-6x mateu-callout mateu-tone-success',
    warning: 'oj-panel oj-sm-padding-6x mateu-callout mateu-tone-warning',
    danger: 'oj-panel oj-sm-padding-6x mateu-callout mateu-tone-danger',
    neutral: 'oj-panel oj-sm-padding-6x mateu-callout',
  }
  function calloutAtomOf(m, interp = (x) => x) {
    return {
      isCallout: true,
      title: interp(str(m.title)),
      description: interp(str(m.description)),
      iconClass: iconOf(m.icon),
      glyph: glyphOf(m.icon),
      panelClass: CALLOUT_CLASSES[toneOf(m.theme)] || CALLOUT_CLASSES.neutral,
      hasCta: !!m.actionId,
      ctaLabel: interp(str(m.ctaLabel)) || chromeText('learnMore'),
      actionId: m.actionId || '',
      parameters: {},
    }
  }

  // ── CommentThread: replies indented under their comment, oj-avatar per author ────────────────────
  function commentsAtomOf(m, interp = (x) => x) {
    const out = []
    const walk = (c, depth) => {
      const av = avatarOf({ name: c.author, image: c.avatar })
      out.push({
        depth,
        rowStyle: { marginInlineStart: (depth * 2.5) + 'rem' },
        rowClass: 'mateu-comment' + (depth ? ' mateu-comment-reply' : ''),
        author: interp(str(c.author)),
        text: interp(str(c.text)),
        timestamp: interp(str(c.timestamp)),
        initials: av.initials,
        src: av.src,
      })
      for (const r of c.replies || []) walk(r, depth + 1)
    }
    for (const c of m.comments || []) walk(c, 0)
    return { isComments: true, comments: keyed(out) }
  }

  // ── FileList: a row per file — icon by type, name as a download link, size · type ───────────────
  const FILE_ICONS = [
    [/pdf/i, 'oj-ux-ico-file-pdf'],
    [/(xls|sheet|csv)/i, 'oj-ux-ico-file-xls'],
    [/(doc|word)/i, 'oj-ux-ico-file-doc'],
    [/(png|jpe?g|gif|svg|image|webp)/i, 'oj-ux-ico-file-image'],
    [/(zip|tar|gz|rar|7z)/i, 'oj-ux-ico-file-zip'],
  ]
  function fileIconOf(type, name) {
    const probe = str(type) + ' ' + str(name).split('.').pop()
    for (const [re, cls] of FILE_ICONS) if (re.test(probe)) return cls
    return 'oj-ux-ico-file'
  }
  function fileListAtomOf(m, interp = (x) => x) {
    return {
      isFileList: true,
      files: keyed((m.files || []).map((f) => {
        const href = safeHref(f.url ? elementModuleUrl(f.url) : '')
        return {
          name: interp(str(f.name)),
          meta: [f.size, f.type].filter(Boolean).map(str).join(' · '),
          iconClass: fileIconOf(f.type, f.name),
          href,
          hasHref: !!href && !f.actionId,
          noHref: !href || !!f.actionId,
          ...clickable(f.actionId, { _file: f }),
        }
      })),
    }
  }

  // ── Checklist: oj-checkboxset per item; toggling sends actionId with {_item, _done} ─────────────
  function checklistAtomOf(m, interp = (x) => x) {
    const items = m.items || []
    const done = items.filter((i) => i.done).length
    return {
      isChecklist: true,
      title: interp(str(m.title)),
      hasTitle: !!m.title,
      progressText: done + ' / ' + items.length,
      progressValue: items.length ? Math.round((done / items.length) * 100) : 0,
      items: keyed(items.map((it) => ({
        label: interp(str(it.label)),
        value: it.done ? ['done'] : [],
        labelClass: it.done ? 'mateu-checklist-done' : '',
        readonly: !it.actionId,
        actionId: it.actionId || '',
        parameters: { _item: it, _done: !it.done },
      }))),
    }
  }

  // ── ComparisonCard: two values side by side and the delta with its trend ────────────────────────
  const TREND = { up: ['oj-ux-ico-arrow-up', 'oj-text-color-success'], down: ['oj-ux-ico-arrow-down', 'oj-text-color-danger'] }
  function comparisonAtomOf(m, interp = (x) => x) {
    const trend = TREND[str(m.trend).toLowerCase()] || ['', 'oj-text-color-secondary']
    return {
      isComparison: true,
      title: interp(str(m.title)),
      leftLabel: interp(str(m.leftLabel)),
      leftValue: interp(str(m.leftValue)),
      rightLabel: interp(str(m.rightLabel)),
      rightValue: interp(str(m.rightValue)),
      delta: interp(str(m.delta)),
      hasDelta: !!m.delta,
      trendIcon: trend[0],
      deltaClass: 'oj-typography-body-sm oj-typography-bold ' + trend[1],
    }
  }

  // ── ProcessMonitor: a row per process — systems, ok/warning/error counts, status, its action ────
  const PROCESS_STATUS = { ok: 'success', success: 'success', running: 'info', warning: 'warning', error: 'danger', failed: 'danger', stopped: 'neutral' }
  function processMonitorAtomOf(m, interp = (x) => x) {
    return {
      isProcessMonitor: true,
      items: keyed((m.items || []).map((p) => ({
        name: interp(str(p.name)),
        systems: (p.systems || []).map(str).join(' · '),
        okText: String(p.ok || 0),
        warningsText: String(p.warnings || 0),
        errorsText: String(p.errors || 0),
        statusLabel: str(p.status),
        hasStatus: !!p.status,
        statusClass: BADGE_CLASSES[PROCESS_STATUS[str(p.status).toLowerCase()] || 'contrast'] || BADGE_CLASSES.contrast,
        hasAction: !!(p.actionId && p.actionLabel),
        actionLabel: interp(str(p.actionLabel)),
        actionId: p.actionId || '',
        parameters: {},
      }))),
    }
  }

  // ── Skeleton: the shell's own shimmer placeholders (JET has no skeleton component) ───────────────
  const SKELETON_SHAPES = {
    text: ['mateu-skel-line', 'mateu-skel-line', 'mateu-skel-line mateu-skel-short'],
    card: ['mateu-skel-block'],
    grid: ['mateu-skel-row', 'mateu-skel-row', 'mateu-skel-row', 'mateu-skel-row'],
    form: ['mateu-skel-label', 'mateu-skel-input', 'mateu-skel-label', 'mateu-skel-input'],
  }
  function skeletonAtomOf(m) {
    const shape = SKELETON_SHAPES[str(m.variant)] || SKELETON_SHAPES.text
    const count = Math.max(1, Math.min(20, Number(m.count) || 1))
    const shapes = []
    for (let i = 0; i < count; i++) shapes.push(...shape)
    return { isSkeleton: true, shapes: keyed(shapes.map((cls) => ({ cls: 'mateu-skeleton-bone ' + cls }))) }
  }

  // ── Icon: the Redwood icon font (oj-ux-ico-*); an emoji travels as text ─────────────────────────
  function iconAtomOf(m) {
    return { isIcon: true, iconClass: iconOf(m.icon), glyph: glyphOf(m.icon), label: str(m.icon) }
  }

  // ── Menus (MenuBar, ContextMenu, Directory) ─────────────────────────────────────────────────────
  /** A MenuOption → what its click does: run an action, or navigate to a route/url. */
  function menuTargetOf(option) {
    if (!option) return null
    if (option.actionId) return { kind: 'action', actionId: option.actionId, parameters: option.params || {} }
    const route = option.route || option.path || ''
    if (route) {
      if (/^https?:/i.test(route)) return { kind: 'url', url: route }
      if (/^[a-z][a-z0-9+.-]*:/i.test(route)) return null // javascript:, data:… go nowhere
      return { kind: 'navigate', route: route.startsWith('/') ? route : '/' + route }
    }
    return null
  }
  /** The items of an oj-menu (flattening one submenu level into separators + items). */
  function menuItemsOf(options, interp = (x) => x) {
    const out = []
    const push = (o, prefix) => {
      if (!o || o.visible === false) return
      if (o.separator) { out.push({ value: 'sep' + out.length, label: '', isSeparator: true, isItem: false, disabled: true }); return }
      if ((o.submenus || []).length) {
        for (const s of o.submenus) push(s, (prefix ? prefix + ' › ' : '') + interp(str(o.label)))
        return
      }
      const target = menuTargetOf(o)
      out.push({
        value: String(out.length),
        label: (prefix ? prefix + ' › ' : '') + interp(str(o.label)),
        isSeparator: false,
        isItem: true,
        disabled: !!o.disabled || !target,
        iconClass: iconOf(o.icon),
        target,
      })
    }
    for (const o of options || []) push(o, '')
    return out
  }
  /** What choosing `value` in a menu atom does (null: nothing). */
  function menuChoiceOf(items, value) {
    const item = (items || []).find((i) => i.value === String(value))
    return item && !item.disabled ? item.target : null
  }
  /** How a page chain carries out a target: the action chain to call (the host's or the island's
   *  dispatcher), the route to navigate to, or the url to open. Pure — the chain only executes it. */
  function dispatchOf(target, variant) {
    if (!target) return null
    if (target.kind === 'action') {
      return { chain: variant === 'island' ? 'dispatchIslandAction' : 'dispatchHostBlockAction',
        params: { actionId: target.actionId, parameters: target.parameters || {} } }
    }
    if (target.kind === 'navigate') return { route: target.route }
    if (target.kind === 'url') return { url: target.url }
    return null
  }
  function menuBarAtomOf(m, interp = (x) => x) {
    return {
      isMenuBar: true,
      entries: keyed((m.options || []).filter((o) => o && o.visible !== false && !o.separator).map((o) => {
        const sub = (o.submenus || []).length
        const target = sub ? null : menuTargetOf(o)
        return {
          label: interp(str(o.label)),
          iconClass: iconOf(o.icon),
          isMenu: !!sub,
          isAction: !sub && !!target && target.kind === 'action',
          isLink: !sub && !!target && target.kind !== 'action',
          isInert: !sub && !target,
          href: target && target.kind === 'navigate' ? target.route : target && target.kind === 'url' ? target.url : '',
          disabled: !!o.disabled,
          chroming: o.selected ? 'callToAction' : 'borderless',
          menuItems: sub ? menuItemsOf(o.submenus, interp) : [],
          actionId: target && target.kind === 'action' ? target.actionId : '',
          parameters: target && target.kind === 'action' ? target.parameters : {},
        }
      })),
    }
  }
  function contextMenuAtomOf(m, interp = (x) => x) {
    return { isContextMenu: true, label: chromeText('moreActions'), menuItems: menuItemsOf(m.menu, interp), rightClick: !m.activateOnLeftClick }
  }
  /** Directory: each top-level entry a column with its title and its links (submenus flattened). */
  function directoryAtomOf(m, interp = (x) => x) {
    const linksOf = (o, prefix) => {
      if (!o || o.visible === false) return []
      if ((o.submenus || []).length) return o.submenus.flatMap((s) => linksOf(s, prefix))
      const t = menuTargetOf(o)
      const href = t ? (t.kind === 'navigate' ? t.route : t.kind === 'url' ? t.url : '') : ''
      return [{ label: interp(str(o.label)), href: safeHref(href), description: interp(str(o.description)) }]
    }
    const groups = (m.menu || []).filter((o) => o && o.visible !== false).map((o) => ({
      title: interp(str(o.label)),
      links: keyed(linksOf(o, '')),
    }))
    const cols = Math.max(1, Math.min(4, groups.length))
    return { isDirectory: true, groups: keyed(groups.map((g) => ({ ...g, colClass: 'oj-flex-item oj-sm-12 oj-md-' + Math.floor(12 / cols) }))) }
  }

  // ── MessageList / MessageInput ────────────────────────────────────────────────────────────────
  function messageListAtomOf(m, interp = (x) => x) {
    return {
      isMessages: true,
      items: keyed((m.items || []).map((it) => {
        const av = avatarOf({ name: it.userName, abbreviation: it.userAbbr, image: it.userImg })
        return {
          userName: interp(str(it.userName)),
          time: str(it.time),
          text: interp(str(it.text)),
          initials: av.initials,
          src: av.src,
          avatarClass: 'mateu-avatar-tone-' + ((Number(it.userColorIndex) || 0) % 6),
        }
      })),
    }
  }
  function messageInputAtomOf(m, id) {
    return {
      isMessageInput: true,
      inputId: 'mateuMsg-' + str(id || 'input').replace(/[^\w-]/g, '_'),
      actionId: m.actionId || '',
      placeholder: chromeText('message'),
      sendLabel: chromeText('messageSend'),
    }
  }
  /** What sending a message does (null when there is nothing to send or nowhere to send it). */
  function messageSendOf(value, actionId) {
    const text = str(value).trim()
    if (!text || !actionId) return null
    return { actionId, parameters: { message: text } }
  }

  // ── Chat (the component — the app's assistant panel is the shell's): installChatComponents mounts
  //    the conversation in its slot and streams the answers with poc/chat.mjs ────────────────────
  function chatAtomOf(m, id) {
    return {
      isChatComponent: true,
      chatId: 'mateuChat-' + str(id || 'chat').replace(/[^\w-]/g, '_'),
      sseUrl: elementModuleUrl(str(m.sseUrl)),
      uploadUrl: m.uploadUrl ? elementModuleUrl(str(m.uploadUrl)) : '',
    }
  }

  // ── Result: the outcome of an operation — icon by type, message, links ─────────────────────────
  const RESULT_LOOKS = {
    success: ['oj-ux-ico-check-circle-s', 'mateu-tone-success'],
    info: ['oj-ux-ico-information-s', 'mateu-tone-info'],
    warning: ['oj-ux-ico-warning-s', 'mateu-tone-warning'],
    error: ['oj-ux-ico-error-s', 'mateu-tone-danger'],
    ignored: ['oj-ux-ico-information', ''],
  }
  const destinationOf = (d, interp) => {
    if (!d) return null
    const type = str(d.type)
    const label = interp(str(d.description || d.value || d.id))
    if (type === 'Url') return { label, href: safeHref(d.value), isLink: !!safeHref(d.value), isAction: false, actionId: '', parameters: {} }
    if (type === 'ActionId') return { label, href: '', isLink: false, isAction: true, actionId: d.value || d.id || '', parameters: {} }
    // View / Component / CustomEvent: a route of the app when the value looks like one
    const route = str(d.value)
    if (route.startsWith('/')) return { label, href: route, isLink: true, isAction: false, actionId: '', parameters: {} }
    return { label, href: '', isLink: false, isAction: !!(d.id), actionId: d.id || '', parameters: {} }
  }
  function resultAtomOf(m, interp = (x) => x) {
    const look = RESULT_LOOKS[str(m.resultType).toLowerCase()] || RESULT_LOOKS.info
    const links = (m.interestingLinks || []).map((d) => destinationOf(d, interp)).filter(Boolean)
    const next = destinationOf(m.nowTo, interp)
    return {
      isResult: true,
      title: interp(str(m.title)),
      message: interp(str(m.message)),
      iconClass: look[0],
      panelClass: 'oj-panel oj-sm-padding-8x mateu-result ' + look[1],
      image: m.leftSideImageUrl ? elementModuleUrl(str(m.leftSideImageUrl)) : '',
      hasImage: !!m.leftSideImageUrl,
      links: keyed(links),
      hasNext: !!next,
      next: next || { label: '', href: '', isLink: false, isAction: false, actionId: '', parameters: {} },
      // the «what next» button sends the atom's own action (the block listener reads the atom)
      actionId: next && next.isAction ? next.actionId : '',
      parameters: {},
    }
  }

  // ── CookieConsent: a band fixed to the bottom; installCookieConsent hides it when the cookie
  //    exists and stores the cookie on «dismiss» ──────────────────────────────────────────────
  function cookieConsentAtomOf(m, interp = (x) => x) {
    const position = str(m.position).toLowerCase()
    return {
      isCookieConsent: true,
      cookieName: str(m.cookieName) || 'cookieconsent_status',
      message: interp(str(m.message)) || chromeText('cookieMessage'),
      dismiss: interp(str(m.dismiss)) || chromeText('cookieDismiss'),
      learnMore: interp(str(m.learnMore)) || chromeText('learnMore'),
      learnMoreLink: safeHref(m.learnMoreLink),
      hasLearnMore: !!safeHref(m.learnMoreLink),
      bandClass: 'mateu-cookie-consent oj-panel oj-sm-padding-4x' + (position.indexOf('top') >= 0 ? ' mateu-cookie-top' : ' mateu-cookie-bottom'),
    }
  }
  /** Whether the consent cookie is set in a cookie string (document.cookie). */
  function hasConsentCookie(cookieString, name) {
    return String(cookieString || '').split(';').some((c) => c.trim().split('=')[0] === name)
  }

  // ── ConfirmDialog: an oj-dialog opened while its condition holds; Confirm / Reject / Cancel ─────
  /** Evaluates a ConfirmDialog's openedCondition against the state: the same small vocabulary the
   *  client rules use — a `${state.x}` path, its negation, or a comparison with a literal. */
  function confirmOpenOf(condition, state) {
    const c = str(condition).trim()
    if (!c) return false
    if (c === 'true') return true
    if (c === 'false') return false
    const path = (p) => p.split('.').reduce((v, k) => (v != null && typeof v === 'object' ? v[k] : undefined), state || {})
    const unwrap = (s) => s.replace(/^\$\{\s*/, '').replace(/\s*\}$/, '').trim()
    const expr = unwrap(c)
    const lit = (s) => {
      const t = s.trim()
      if (/^(['"]).*\1$/.test(t)) return t.slice(1, -1)
      if (t === 'true') return true
      if (t === 'false') return false
      if (t === 'null' || t === 'undefined') return null
      if (!isNaN(Number(t)) && t !== '') return Number(t)
      return t.startsWith('state.') ? path(t.slice(6)) : undefined
    }
    const cmp = /^(.+?)\s*(===|!==|==|!=|>=|<=|>|<)\s*(.+)$/.exec(expr)
    if (cmp) {
      const a = lit(cmp[1]); const b = lit(cmp[3])
      switch (cmp[2]) {
        case '===': case '==': return a == b // eslint-disable-line eqeqeq
        case '!==': case '!=': return a != b // eslint-disable-line eqeqeq
        case '>': return a > b
        case '<': return a < b
        case '>=': return a >= b
        default: return a <= b
      }
    }
    if (expr.startsWith('!')) return !lit(expr.slice(1))
    return !!lit(expr)
  }
  function confirmDialogAtomOf(m, id, state, interp = (x) => x, lines = []) {
    const buttons = []
    if (m.canCancel) buttons.push({ key: 'cancel', label: m.rejectText && !m.canReject ? interp(m.rejectText) : chromeText('cancel'), chroming: 'outlined', actionId: m.cancelActionId || '', parameters: {} })
    if (m.canReject) buttons.push({ key: 'reject', label: interp(str(m.rejectText)) || chromeText('confirmNo'), chroming: 'outlined', actionId: m.rejectActionId || '', parameters: {} })
    buttons.push({ key: 'confirm', label: interp(str(m.confirmText)) || chromeText('ok'), chroming: 'callToAction', actionId: m.confirmActionId || '', parameters: {} })
    const opened = confirmOpenOf(m.openedCondition, state)
    return {
      // painted only while open: the oj-dialog opens itself (initial-visibility) when it appears
      isConfirmDialog: opened,
      dialogId: 'mateuConfirmDialog-' + str(id || 'confirm').replace(/[^\w-]/g, '_'),
      opened,
      header: interp(str(m.header)),
      lines: lines.map(interp).filter(Boolean),
      buttons,
    }
  }

  // ── Breadcrumbs (the component in content; the shell keeps its own trail) ───────────────────────
  function breadcrumbsAtomOf(m, interp = (x) => x) {
    const crumbs = (m.breadcrumbs || []).map((b) => ({ text: interp(str(b.text)), href: safeHref(b.link), hasHref: !!safeHref(b.link) }))
    return {
      isBreadcrumbs: true,
      crumbs: keyed(crumbs.map((c) => ({ ...c, noHref: !c.hasHref }))),
      current: interp(str(m.currentItemText)),
    }
  }

  // ── Notification (the component): an info band with its title and text ────────────────────────
  function notificationAtomOf(m, interp = (x) => x) {
    return {
      isNotice: true,
      text: [m.title, m.text].filter(Boolean).map((t) => interp(str(t))).join(' — '),
      noticeClass: NOTICE_CLASSES.info,
      buttons: [],
    }
  }

  // ── Workflow: the definition as a flow of steps (the web's designer is an editor; Redwood shows it) ─
  const STEP_LOOKS = {
    ACTION: ['oj-ux-ico-play', 'stepAction'], JOIN: ['oj-ux-ico-merge', 'stepJoin'], FORK: ['oj-ux-ico-split', 'stepFork'],
    END: ['oj-ux-ico-stop', 'stepEnd'], USER_TASK: ['oj-ux-ico-user-available', 'stepUserTask'], PROCESS: ['oj-ux-ico-settings', 'stepProcess'],
  }
  function workflowOrderOf(steps) {
    const byId = new Map(steps.map((s) => [s.id, s]))
    const out = []
    const seen = new Set()
    const visit = (s, guard = new Set()) => {
      if (!s || seen.has(s.id) || guard.has(s.id)) return
      guard.add(s.id)
      if (s.preconditionStepId && byId.has(s.preconditionStepId)) visit(byId.get(s.preconditionStepId), guard)
      seen.add(s.id)
      out.push(s)
    }
    steps.forEach((s) => visit(s))
    return out
  }
  function workflowAtomOf(m) {
    let wf
    try { wf = JSON.parse(str(m.value) || '{}') } catch (e) { wf = null }
    if (!wf || typeof wf !== 'object') return { isNotice: true, text: chromeText('workflowInvalid'), noticeClass: NOTICE_CLASSES.warning, buttons: [] }
    const steps = Array.isArray(wf.steps) ? wf.steps.filter((s) => s && s.id) : []
    const names = new Map(steps.map((s) => [s.id, s.name || s.id]))
    return {
      isWorkflow: true,
      name: str(wf.name) || 'Workflow',
      description: str(wf.description),
      status: str(wf.status),
      hasStatus: !!wf.status,
      statusClass: BADGE_CLASSES[{ ACTIVE: 'success', DRAFT: 'info', DISABLED: 'warning', ARCHIVED: 'contrast' }[wf.status] || 'contrast'],
      steps: keyed(workflowOrderOf(steps).map((s, i) => {
        const look = STEP_LOOKS[s.type] || STEP_LOOKS.ACTION
        return {
          number: String(i + 1),
          name: str(s.name) || s.id,
          typeLabel: chromeText(look[1]) + (s.parallel ? ' · ' + chromeText('parallel') : ''),
          iconClass: look[0],
          description: str(s.description),
          after: s.preconditionStepId ? chromeText('afterStep', { name: names.get(s.preconditionStepId) || s.preconditionStepId })
            + (s.preconditionExpression ? chromeText('whenCondition', { condition: s.preconditionExpression }) : '') : '',
        }
      })),
      isEmpty: !steps.length,
    }
  }

  /** FormEditor: the defined form → FormField metadata the form layout already knows how to paint. */
  function formEditorFieldsOf(m) {
    let def
    try { def = JSON.parse(str(m.value) || '{}') } catch (e) { def = null }
    if (!def || typeof def !== 'object') return null
    return {
      name: str(def.name) || 'Form',
      description: str(def.description),
      fields: (Array.isArray(def.fields) ? def.fields : []).filter((f) => f && f.id).map((f) => ({
        type: 'FormField', fieldId: f.id, label: f.label || f.id, dataType: f.dataType || 'string',
        stereotype: f.stereotype && f.stereotype !== 'regular' ? f.stereotype : undefined,
        required: !!f.required, description: f.description || '', readOnly: false,
      })),
    }
  }

  // ── BPMN (bpmn-js is not under a permissive licence): the diagram from its own BPMN-DI ──────────
  const BPMN_KINDS = {
    startEvent: 'event', endEvent: 'end', intermediateThrowEvent: 'event', intermediateCatchEvent: 'event', boundaryEvent: 'event',
    task: 'task', userTask: 'task', serviceTask: 'task', scriptTask: 'task', sendTask: 'task', receiveTask: 'task', manualTask: 'task', businessRuleTask: 'task', callActivity: 'task', subProcess: 'task',
    exclusiveGateway: 'gateway', parallelGateway: 'gateway', inclusiveGateway: 'gateway', eventBasedGateway: 'gateway', complexGateway: 'gateway',
    dataObjectReference: 'data', dataStoreReference: 'data', textAnnotation: 'note',
  }
  const xmlAttr = (attrs, name) => {
    const m = new RegExp('(?:^|\\s)' + name + '\\s*=\\s*"([^"]*)"').exec(attrs) || new RegExp('(?:^|\\s)' + name + "\\s*=\\s*'([^']*)'").exec(attrs)
    return m ? m[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#10;/g, ' ').replace(/&amp;/g, '&') : ''
  }
  /** BPMN 2.0 XML → { nodes, flows, width, height }: shapes placed by their BPMNDI bounds; without
   *  DI, a left-to-right layout by the sequence flows. Pure (no DOMParser: it runs in Node too). */
  function bpmnDiagramOf(xml) {
    const src = str(xml)
    const nodes = []
    const flows = []
    const byId = new Map()
    const tagRe = /<(?:[\w-]+:)?(\w+)\b([^>]*?)(\/?)>/g
    let t
    while ((t = tagRe.exec(src))) {
      const [, tag, attrs] = t
      if (BPMN_KINDS[tag]) {
        const n = { id: xmlAttr(attrs, 'id'), tag, kind: BPMN_KINDS[tag], label: xmlAttr(attrs, 'name') }
        if (n.id) { nodes.push(n); byId.set(n.id, n) }
      } else if (tag === 'sequenceFlow' || tag === 'messageFlow') {
        const f = { id: xmlAttr(attrs, 'id'), source: xmlAttr(attrs, 'sourceRef'), target: xmlAttr(attrs, 'targetRef'), label: xmlAttr(attrs, 'name'), points: [] }
        if (f.id) flows.push(f)
      }
    }
    // text annotations carry their text in a child <text>
    for (const n of nodes) {
      if (n.kind === 'note' && !n.label) {
        const m = new RegExp('<(?:[\\w-]+:)?textAnnotation\\b[^>]*id="' + n.id + '"[^>]*>[\\s\\S]*?<(?:[\\w-]+:)?text>([\\s\\S]*?)</').exec(src)
        if (m) n.label = m[1].trim()
      }
    }
    // BPMNDI: shapes with Bounds, edges with waypoints
    const shapeRe = /<(?:[\w-]+:)?BPMNShape\b([^>]*)>([\s\S]*?)<\/(?:[\w-]+:)?BPMNShape>/g
    let s
    let placed = 0
    while ((s = shapeRe.exec(src))) {
      const n = byId.get(xmlAttr(s[1], 'bpmnElement'))
      const b = /<(?:[\w-]+:)?Bounds\b([^>]*)\/?>/.exec(s[2])
      if (n && b) {
        n.x = +xmlAttr(b[1], 'x'); n.y = +xmlAttr(b[1], 'y'); n.w = +xmlAttr(b[1], 'width'); n.h = +xmlAttr(b[1], 'height')
        placed++
      }
    }
    const edgeRe = /<(?:[\w-]+:)?BPMNEdge\b([^>]*)>([\s\S]*?)<\/(?:[\w-]+:)?BPMNEdge>/g
    let e
    const flowById = new Map(flows.map((f) => [f.id, f]))
    while ((e = edgeRe.exec(src))) {
      const f = flowById.get(xmlAttr(e[1], 'bpmnElement'))
      if (!f) continue
      const wp = /<(?:[\w-]+:)?waypoint\b([^>]*)\/?>/g
      let w
      while ((w = wp.exec(e[2]))) f.points.push([+xmlAttr(w[1], 'x'), +xmlAttr(w[1], 'y')])
    }
    const SIZE = { task: [100, 80], gateway: [50, 50], event: [36, 36], end: [36, 36], data: [36, 50], note: [100, 40] }
    if (placed < nodes.length) {
      // no (or partial) DI: columns by distance from the start along the flows
      const rank = new Map()
      const outgoing = new Map()
      for (const f of flows) { if (!outgoing.has(f.source)) outgoing.set(f.source, []); outgoing.get(f.source).push(f.target) }
      const incoming = new Set(flows.map((f) => f.target))
      const roots = nodes.filter((n) => !incoming.has(n.id))
      const queue = (roots.length ? roots : nodes.slice(0, 1)).map((n) => [n.id, 0])
      while (queue.length) {
        const [id, r] = queue.shift()
        if (rank.has(id) && rank.get(id) >= r) continue
        if (r > nodes.length) continue
        rank.set(id, r)
        for (const next of outgoing.get(id) || []) queue.push([next, r + 1])
      }
      const perRank = new Map()
      for (const n of nodes) {
        if (n.x != null) continue
        const r = rank.has(n.id) ? rank.get(n.id) : 0
        const row = perRank.get(r) || 0
        perRank.set(r, row + 1)
        const [w, h] = SIZE[n.kind] || SIZE.task
        n.w = w; n.h = h
        n.x = 40 + r * 160 + (100 - w) / 2
        n.y = 40 + row * 120 + (80 - h) / 2
      }
      for (const f of flows) f.points = []
    }
    for (const f of flows) {
      if (f.points.length >= 2) continue
      const a = byId.get(f.source); const b = byId.get(f.target)
      if (a && b && a.x != null && b.x != null) f.points = [[a.x + a.w, a.y + a.h / 2], [b.x, b.y + b.h / 2]]
    }
    let maxX = 0; let maxY = 0; let minX = Infinity; let minY = Infinity
    for (const n of nodes) if (n.x != null) { maxX = Math.max(maxX, n.x + n.w); maxY = Math.max(maxY, n.y + n.h + 20); minX = Math.min(minX, n.x); minY = Math.min(minY, n.y) }
    for (const f of flows) for (const [x, y] of f.points) { maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); minX = Math.min(minX, x); minY = Math.min(minY, y) }
    if (!isFinite(minX)) { minX = 0; minY = 0 }
    return {
      nodes: nodes.filter((n) => n.x != null),
      flows: flows.filter((f) => f.points.length >= 2),
      minX: minX - 20, minY: minY - 20,
      width: Math.max(100, maxX - minX + 40), height: Math.max(80, maxY - minY + 40),
    }
  }
  function bpmnAtomOf(m, id) {
    const diagram = bpmnDiagramOf(m.xml)
    return {
      isBpmn: true,
      bpmnId: 'mateuBpmn-' + str(id || 'bpmn').replace(/[^\w-]/g, '_'),
      spec: JSON.stringify(diagram),
      isEmpty: !diagram.nodes.length,
      ariaLabel: chromeText('processDiagram', { names: diagram.nodes.filter((n) => n.label).map((n) => n.label).join(', ') }),
    }
  }

  // ── Rich content as HTML (Popover/Tooltip content): a small, SANITISED serialisation ───────────
  const escapeHtml = (t) => str(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  /** For a double-quoted attribute value: also the quotes, or a `"` in the value ends the attribute. */
  const escapeAttrValue = (t) => escapeHtml(t).replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  /** A component subtree → sanitised HTML (texts with their heading level, links, lists, badges,
   *  markdown, separators; containers as blocks). What it does not know shows as its texts. */
  function componentHtmlOf(node, interp = (x) => x) {
    if (!node || typeof node !== 'object') return ''
    const m = node.metadata || {}
    const kids = () => {
      const out = [...(node.children || [])]
      const inner = m.content
      if (Array.isArray(inner)) out.push(...inner)
      else if (inner && typeof inner === 'object') out.push(inner)
      return out.map((k) => componentHtmlOf(k, interp)).join('')
    }
    let html
    switch (m.type) {
      case 'Text': {
        const tag = /^h[1-6]$/.test(m.container || '') ? 'h4' : 'p'
        html = '<' + tag + '>' + escapeHtml(interp(m.text)) + '</' + tag + '>'
        break
      }
      case 'Anchor': html = '<p><a href="' + escapeAttrValue(safeHref(interp(m.url))) + '">' + escapeHtml(interp(m.text || m.url)) + '</a></p>'; break
      case 'BulletedList': html = '<ul>' + (m.items || []).map((i) => '<li>' + escapeHtml(interp(i)) + '</li>').join('') + '</ul>'; break
      case 'Badge': html = '<span>' + escapeHtml(interp(m.text)) + '</span> '; break
      case 'Markdown': html = markdownToHtml(interp(m.markdown || m.text || '')); break
      case 'Separator': html = '<hr>'; break
      case 'Button': html = ''; break
      default: {
        const inner = kids()
        html = inner || (m.type ? collectTexts(node).map((x) => '<p>' + escapeHtml(interp(x)) + '</p>').join('') : '')
        if (inner && /Layout|Card|Div|Container|Section/.test(m.type || '')) html = '<div>' + inner + '</div>'
      }
    }
    return sanitizeHtml(html)
  }

  // ── Grid paging & tree (the Grid component) ────────────────────────────────────────────────────
  /** A tree's rows flattened depth-first with their depth; collapsed nodes hide their children. */
  function flattenTreeRows(rows, isExpanded = () => true, childrenKey = 'children', depth = 0, path = '') {
    const out = []
    ;(rows || []).forEach((row, i) => {
      const key = path ? path + '.' + i : String(i)
      const kids = Array.isArray(row && row[childrenKey]) ? row[childrenKey] : []
      const expanded = kids.length ? isExpanded(key) : false
      const { [childrenKey]: _ignored, ...flat } = row || {}
      out.push({ ...flat, __depth: depth, __treeKey: key, __hasChildren: kids.length > 0, __expanded: expanded })
      if (expanded) out.push(...flattenTreeRows(kids, isExpanded, childrenKey, depth + 1, key))
    })
    return out
  }
  /** Client-side paging of a Grid: the slice shown and the pager texts. */
  function gridPageOf(rows, size, page) {
    const total = rows.length
    const pageSize = size > 0 ? size : total || 1
    const pages = Math.max(1, Math.ceil(total / pageSize))
    const current = Math.max(0, Math.min(pages - 1, Number(page) || 0))
    const from = current * pageSize
    const shown = rows.slice(from, from + pageSize)
    return {
      rows: shown,
      paged: total > pageSize,
      page: current,
      pages,
      rangeText: (total ? (from + 1) + '–' + (from + shown.length) : '0') + ' ' + chromeText('pagingOf') + ' ' + total,
      hasPrev: current > 0,
      hasNext: current < pages - 1,
      prevDisabled: current <= 0,
      nextDisabled: current >= pages - 1,
    }
  }

  // ── ResponsiveGrid auto-fill / auto-fit: the track minimum → oj-flex responsive column classes ──
  /** The web renderers' default for a ResponsiveGrid that declares no columns (nor areas). */
  const AUTO_FIT_DEFAULT = 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))'
  /** `repeat(auto-fit, minmax(16rem, 1fr))` → classes that put as many tiles per row as fit at each
   *  breakpoint (sm 0, md 768px, lg 1024px, xl 1280px). null when the template is not that shape. */
  function autoFitColClass(template) {
    const m = /repeat\(\s*auto-(?:fill|fit)\s*,\s*minmax\(\s*(?:min\(\s*100%\s*,\s*)?([\d.]+)(px|rem|em)/i.exec(str(template))
    if (!m) return null
    const px = parseFloat(m[1]) * (m[2] === 'px' ? 1 : 16)
    if (!(px > 0)) return null
    const per = (width) => Math.max(1, Math.min(12, Math.floor(width / px)))
    const span = (width) => {
      const n = per(width)
      // oj-flex columns are twelfths: the largest span that fits n per row
      return Math.max(1, Math.floor(12 / n))
    }
    return 'oj-flex-item oj-sm-' + span(480) + ' oj-md-' + span(768) + ' oj-lg-' + span(1024) + ' oj-xl-' + span(1280) + ' oj-sm-padding-2x-end oj-sm-padding-2x-bottom'
  }

  // ── HeroSection / EmptyState / ProgressBar in the content ───────────────────────────────────────
  function heroAtomOf(m, interp = (x) => x) {
    const image = m.image ? elementModuleUrl(str(m.image)) : ''
    return {
      isHero: true,
      title: interp(str(m.title)),
      subtitle: interp(str(m.subtitle)),
      heroClass: 'mateu-hero oj-sm-padding-10x' + (m.centered ? ' mateu-hero-centered' : '') + (image ? ' mateu-hero-image' : ''),
      heroStyle: image ? { backgroundImage: 'linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url("' + image.replace(/"/g, '%22') + '")', minHeight: str(m.height) || '' } : { minHeight: str(m.height) || '' },
    }
  }
  /** EmptyState → oj-sp-empty-state (its call to action as an oj-button below it). */
  function emptyStateAtomOf(m, interp = (x) => x) {
    return {
      isEmptyStateAtom: true,
      title: [m.icon, interp(str(m.title))].filter(Boolean).join(' '),
      description: interp(str(m.description)),
      hasAction: !!(m.actionId && m.actionLabel),
      actionLabel: interp(str(m.actionLabel)),
      actionId: m.actionId || '',
      parameters: {},
    }
  }
  /** ProgressBar → oj-progress-bar: its value (or the state at valueKey) over min…max, or indeterminate. */
  function progressBarAtomOf(m, state, interp = (x) => x) {
    const min = Number(m.min) || 0
    const max = Number(m.max) > min ? Number(m.max) : 1
    const raw = m.valueKey && state && state[m.valueKey] != null ? Number(state[m.valueKey]) : Number(m.value)
    const value = Number.isFinite(raw) ? Math.max(min, Math.min(max, raw)) : min
    return {
      isProgressBar: true,
      value: m.indeterminate ? -1 : Math.round(((value - min) / (max - min)) * 100),
      text: interp(str(m.text)),
      ariaLabel: interp(str(m.text)) || 'Progress',
      barClass: 'oj-sm-margin-1x-vertical' + (toneOf(m.theme) ? ' mateu-tone-' + toneOf(m.theme) : ''),
    }
  }

  // ── CustomComponent: a registry the app fills (the VB app has no build step of its own) ────────
  const customComponents = new Map()
  /** An app registers a view for a custom component type: mount(el, props) paints it into the slot
   *  (and may return a cleanup). Without one the visible placeholder stays, like the web. */
  function registerCustomComponent(name, mount) {
    if (name && typeof mount === 'function') customComponents.set(String(name), mount)
  }
  function customComponentRegistered(name) { return customComponents.has(str(name)) }
  function customComponentMountOf(name) { return customComponents.get(str(name)) || null }
  function customComponentAtomOf(m, id) {
    return {
      isCustomSlot: true,
      name: str(m.name),
      slotId: 'mateuCustom-' + str(id || m.name).replace(/[^\w-]/g, '_'),
      props: JSON.stringify(m.props || {}),
    }
  }

  // ── MicroFrontend: another Mateu UI (often another backend) loaded into its own surface ────────
  /** The surface of a MicroFrontend — loaded like a @Subresource (loadSubresources), but from ITS
   *  baseUrl, and its actions go back to it (runSurfaceAction). The id is derived from what it
   *  points at (like the web's microFrontendUxId), so re-projections reuse the loaded surface. */
  function microFrontendOf(m) {
    const id = 'mfe_' + [m.baseUrl, m.route, m.consumedRoute, m.serverSideType].map((p) => str(p)).join('|').replace(/[^a-zA-Z0-9]/g, '_')
    return {
      id,
      route: str(m.route),
      consumedRoute: str(m.consumedRoute),
      serverSideType: m.serverSideType || undefined,
      componentState: {},
      baseUrl: str(m.baseUrl).replace(/\/+$/, ''),
      appState: m.appState && typeof m.appState === 'object' ? m.appState : null,
      surface: true,
      lazy: false,
    }
  }
  /** Tags every object of a surface's atoms that sends an action with the surface it belongs to, so
   *  the block dispatcher sends it there (deep: the cards of a board, the buttons of a band…). */
  function tagSurfaceActions(value, surfaceId) {
    if (Array.isArray(value)) return value.map((v) => tagSurfaceActions(v, surfaceId))
    // only plain data: a JET data provider or converter is passed through as it is
    if (!value || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) return value
    const out = {}
    // (the parameters travel to the server as they are)
    for (const [k, v] of Object.entries(value)) out[k] = k === 'parameters' ? v : tagSurfaceActions(v, surfaceId)
    if ('actionId' in out) out.surfaceId = surfaceId
    return out
  }

  // ── Unknown / unsupported types: a visible placeholder, like the web renderers ───────────────────
  function unsupportedAtomOf(type, id) {
    return {
      isNotice: true,
      text: chromeText('unsupportedComponent', { type: str(type), id: id && id !== 'fieldId' ? ' (' + id + ')' : '' }),
      noticeClass: NOTICE_CLASSES.warning,
      buttons: [],
      isUnsupported: true,
    }
  }

  /** The ‹ › buttons of a client-side pager: each carries the key and the value it sets
   *  (the uiValueChanged listener reads them from the button's own $current). */
  function pagerButtonsOf(key, prevValue, nextValue, prevDisabled, nextDisabled, prevLabel = chromeText('pagingPrev'), nextLabel = chromeText('pagingNext')) {
    return [
      { key: 'prev', uiKey: key, uiValue: prevValue, label: prevLabel, icon: 'oj-ux-ico-chevron-left', disabled: !!prevDisabled },
      { key: 'next', uiKey: key, uiValue: nextValue, label: nextLabel, icon: 'oj-ux-ico-chevron-right', disabled: !!nextDisabled },
    ]
  }

  // ── CarouselLayout (content slides): the pager above the slide shown ────────────────────────────
  function carouselPagerAtomOf(key, current, count, loop) {
    const prev = current > 0 ? current - 1 : (loop ? count - 1 : 0)
    const next = current < count - 1 ? current + 1 : (loop ? 0 : count - 1)
    return {
      isCarouselPager: true,
      positionText: (current + 1) + ' / ' + count,
      nav: pagerButtonsOf(key, prev, next, !loop && current === 0, !loop && current === count - 1, chromeText('previousSlide'), chromeText('nextSlide')),
      dots: keyed(Array.from({ length: count }, (_, i) => ({
        uiKey: key,
        uiValue: i,
        label: chromeText('slideN', { n: i + 1 }),
        current: i === current,
        chroming: i === current ? 'callToAction' : 'borderless',
      }))),
    }
  }

  /** The types that legitimately reach the visitor's fall-through: containers whose children are
   *  painted in the page flow, parts painted by their owner, and roots projected elsewhere (the
   *  shell, the page header, the listing, the wizard, the overlays). Any OTHER type there has no
   *  view → a visible placeholder. Kept in sync with coverage.mjs by test-display.mjs. */
  const VISITOR_PASS_THROUGH = {
    VerticalLayout: 1, HorizontalLayout: 1, FormItem: 1, FormSection: 1, FormSubSection: 1, FormRow: 1,
    Scroller: 1, FullWidth: 1, Container: 1, Div: 1, ContentLayout: 1, ResponsiveGrid: 1,
    BoardLayout: 1, BoardLayoutRow: 1, BoardLayoutItem: 1, SplitLayout: 1, MasterDetailLayout: 1,
    FoldoutLayout: 1, AccordionPanel: 1, Tab: 1, GridColumn: 1, GridGroupColumn: 1, Breadcrumb: 1,
    CarouselLayout: 1, DashboardLayout: 1, CustomField: 1,
    App: 1, Page: 1, Form: 1, Crud: 1, HeroSection: 1, EmptyState: 1, NotFound: 1, ProgressBar: 1,
    Dialog: 1, Drawer: 1,
  }




  // El rastro automático de una pantalla — la MISMA regla que el renderer web
  // (libs/mateu/.../breadcrumbTrail.ts): el camino de menús hasta la ruta (grupos y la entrada que
  // la muestra, secciones de un pod incluidas) y, pasada la entrada, el nivel del CRUD — el registro
  // (con el título de su propia página) y «Editar» / «Nuevo».
  //
  // Redwood no tiene migas: Spectra no trae componente de breadcrumbs y su cabecera ofrece, en su
  // lugar, la afordancia «ir al padre» (displayOptions.goToParent). De este rastro sale ese padre:
  // la última miga con ruta antes de la actual.

  const crumbRoute = (r) => {
    let s = String(r == null ? '' : r).trim()
    const q = s.search(/[?#]/)
    if (q >= 0) s = s.slice(0, q)
    if (s && s[0] !== '/') s = '/' + s
    while (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
    return s
  }

  // el título como texto: fuera el marcado (repetidamente, para que nada se recomponga con los
  // trozos) y después cualquier corchete que quede
  const crumbText = (text) => {
    let s = String(text == null ? '' : text)
    let previous
    do {
      previous = s
      s = s.replace(/<[^<>]*>/g, '')
    } while (s !== previous)
    return s.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim()
  }

  // las rutas que abren las ENTRADAS del menú (no los grupos): a donde una miga puede llevar
  function crumbLeafRoutes(menu) {
    const out = new Set()
    const walk = (options) => {
      for (const option of options || []) {
        if (!option || option.separator || isMount(option)) continue
        const children = option.submenus || option.submenu || []
        if (children.length > 0) { walk(children); continue }
        const route = crumbRoute(option.route || option.path)
        if (route && route !== '/') out.add(route)
      }
    }
    walk(menu)
    return out
  }

  // Las entradas OCULTAS cuentan: no se pintan, pero una página bajo una sigue estando en algún sitio
  // (la bandeja a la que se llega desde un widget sigue siendo Bandeja › Tareas). Una sección remota
  // que no ha contestado cuenta por su prefijo (navTree.mjs), como la sección sola — `pending`, porque
  // lo que hay debajo aún no se sabe.
  function menuTrail(menu, path) {
    const current = crumbRoute(path)
    let best = null
    // un grupo es un encabezado, no una página: su ruta (el prefijo de una sección federada,
    // "/admin") no suele llevar a ningún sitio. Su miga sólo navega si una ENTRADA tiene esa ruta.
    const pages = crumbLeafRoutes(menu)
    const consider = (route, crumbs, pending) => {
      // una entrada de verdad gana a un prefijo de sección de la misma longitud: dice más
      if (!best || route.length > best.route.length || (route.length === best.route.length && best.pending && !pending)) {
        best = { crumbs, route, pending }
      }
    }
    const walk = (options, above) => {
      for (const option of options || []) {
        if (!option || option.separator) continue
        if (isMount(option)) {
          const prefix = mountPrefix(option)
          if (routeCovers(prefix, current)) consider(prefix, [...above, { text: crumbText(option.caption || option.label) }], true)
          continue
        }
        const route = crumbRoute(option.route || option.path)
        const label = crumbText(option.caption || option.label)
        const children = option.submenus || option.submenu || []
        if (children.length > 0) {
          walk(children, [...above, route && route !== '/' && pages.has(route) ? { text: label, route } : { text: label }])
          continue
        }
        if (routeCovers(route, current)) consider(route, [...above, { text: label, route }], false)
      }
    }
    walk(menu, [])
    if (!best) return { crumbs: [] }
    return best.pending ? { crumbs: best.crumbs, matched: best.route, pending: true } : { crumbs: best.crumbs, matched: best.route }
  }

  const recordTitles = new Map()

  function autoTrail(menu, path, page = {}) {
    const { crumbs, matched, pending } = menuTrail(menu, path)
    if (!matched) return []
    const trail = [...crumbs]
    if (pending) {
      // una sección remota que no ha contestado: la sección se sabe (la nombró la shell) y lo de
      // debajo no. La sección, y después el título de la propia página.
      const title = crumbText(page.title)
      if (title && title !== trail[trail.length - 1].text) trail.push({ text: title })
      return trail.length < 2 ? [] : trail
    }
    const rest = crumbRoute(path).slice(matched.length).split('/').filter(Boolean)
    const lang = page.lang || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang)
      || (typeof navigator !== 'undefined' && navigator.language) || ''
    if (rest.length > 0) {
      const id = decodeURIComponent(rest[0])
      if (id === 'new' || id === 'create') {
        trail.push({ text: chromeText('new', null, lang || 'en') })
      } else {
        const recordRoute = matched + '/' + rest[0]
        const title = crumbText(page.title)
        if (rest.length === 1 && title) recordTitles.set(recordRoute, title)
        trail.push({ text: recordTitles.get(recordRoute) || id, route: recordRoute })
        if (rest[1] === 'edit') trail.push({ text: chromeText('edit', null, lang || 'en') })
        else if (rest.length > 1) trail.push({ text: title || decodeURIComponent(rest[rest.length - 1]) })
      }
    }
    if (trail.length < 2) return []
    trail[trail.length - 1] = { text: trail[trail.length - 1].text }
    return trail
  }

  function parentCrumb(trail) {
    for (let i = (trail || []).length - 2; i >= 0; i--) {
      if (trail[i].route) return trail[i]
    }
    return undefined
  }


  // Errores del cliente → log del servidor: lo que este renderer enseña o sufre (un fallo de
  // transporte clasificado, un error de JS sin capturar, una promesa rechazada sin catch) viaja a
  // POST <base>/mateu/v3/client-log, que escribe UNA línea `client-error {...}` por informe en el
  // logger "mateu.client". Mismo contrato que el renderer de Vaadin (libs/mateu clientErrorReporter.ts).
  //
  // Por qué: un «Tu sesión ya no es válida» que vio el usuario no dejaba rastro en el servidor — el
  // ingress no mostraba ningún 401/403 para él. Ahora queda una línea que buscar en Loki.
  //
  // Reglas:
  //   - nunca informa de sus propios fallos (la llamada al endpoint no pasa por fetchWithPolicy, sus
  //     errores se tragan, y un error cuyo url es el endpoint se descarta): sin bucles;
  //   - 'cancelled' no es un error;
  //   - el mismo error repetido dentro de la ventana es UNA línea con `count` + firstAt/lastAt: la
  //     primera aparición sale enseguida y las repeticiones van en una línea resumen al cerrar la
  //     ventana (o al salir de la página);
  //   - como mucho `maxPerMinute` líneas por minuto y página; las que no caben se cuentan en `dropped`
  //     de la siguiente;
  //   - una respuesta que dice que no hay endpoint (404/405, o un backend sin él que se lo traga como
  //     acción) lo apaga para la página — ver endpointIsMissing.
  //
  // El envío principal es fetch keepalive CON el Authorization (el gateway exige el Bearer en
  // /mateu/v3); sendBeacon no puede llevar cabeceras, así que sólo se usa al ocultar la página y sin
  // token.
  //
  // Puro salvo installClientErrorReporting (que toca window): test.mjs lo ejercita con reloj,
  // temporizador y envío inyectados.

  const CLIENT_LOG_PATH = '/mateu/v3/client-log'

  const MAX = { message: 1000, detail: 1000, stack: 4000, url: 1000, pageUrl: 1000, source: 500, route: 500, actionId: 200, userAgent: 300 }
  const MAX_BATCH_CHARS = 14000
  // Valores de query que nunca deben acabar en un log: el código/estado del login de Keycloak, tokens.
  const SECRET_PARAMS = /^(code|state|session_state|token|access_token|id_token|refresh_token|auth|password)$/i

  const clipText = (s, max) => {
    if (s === undefined || s === null) return undefined
    const text = String(s)
    return text.length > max ? text.slice(0, max) + '…' : text
  }

  /** La URL sin fragmento y con los parámetros sensibles enmascarados. */
  function redactUrl(url) {
    if (!url) return url
    const text = String(url)
    const noHash = text.split('#')[0]
    const q = noHash.indexOf('?')
    if (q < 0) return noHash
    const params = noHash.slice(q + 1).split('&').map((pair) => {
      const eq = pair.indexOf('=')
      const key = eq < 0 ? pair : pair.slice(0, eq)
      return SECRET_PARAMS.test(decodeURIComponentSafe(key)) ? `${key}=***` : pair
    })
    return noHash.slice(0, q + 1) + params.join('&')
  }

  function decodeURIComponentSafe(s) {
    try { return decodeURIComponent(s) } catch (e) { return s }
  }

  /** La ruta Mateu de una URL de transporte (/mateu/v3/sync/<ruta>), o undefined. */
  function routeOfRequestUrl(url) {
    if (!url) return undefined
    const m = /\/mateu\/v3\/(?:sync|sse)\/([^?#]*)/.exec(String(url))
    if (!m) return undefined
    return m[1] === '_no_route' ? '' : '/' + m[1]
  }

  /**
   * Si la respuesta dice que aquí no hay endpoint: un 404/405 (backend antiguo o
   * mateu.client-log.enabled=false), o un backend cuyo controlador genérico /mateu/v3/** se tragó el
   * informe como si fuera una acción (un 2xx que no es 204, un 400, un 500). Lo pasajero — sin
   * respuesta, 401/403 de un token caducado, 413, 429, 502-504 del gateway — no lo apaga.
   */
  function endpointIsMissing(status) {
    if (status === undefined || status === null || status === 0 || status === 204) return false
    if (status === 401 || status === 403 || status === 413 || status === 429 || status >= 502) return false
    return true
  }

  /** Ruido conocido que no es un error de la aplicación. */
  function isNoise(entry) {
    const msg = entry.message || ''
    return /ResizeObserver loop/i.test(msg)
  }

  /**
   * Un informador. `deps`: { renderer, endpoint() → url o null, send(url, body, {final}) → Promise
   * de un status (o undefined), now() → ms, schedule(fn, ms) → handle, cancel(handle), userAgent,
   * pageUrl() }. Todo opcional salvo `send` para los tests.
   */
  function createClientErrorReporter(deps = {}) {
    const renderer = deps.renderer || 'redwood'
    const now = deps.now || (() => Date.now())
    const schedule = deps.schedule || ((fn, ms) => setTimeout(fn, ms))
    const cancel = deps.cancel || ((h) => clearTimeout(h))
    const windowMs = deps.dedupeWindowMs || 60000
    const batchDelayMs = deps.batchDelayMs !== undefined ? deps.batchDelayMs : 2000
    const maxPerMinute = deps.maxPerMinute || 20
    const endpoint = deps.endpoint || (() => CLIENT_LOG_PATH)

    const entries = new Map()   // clave → { report, windowStart, pending, pendingFirstAt, lastAt }
    let sentAt = []             // instantes de las líneas enviadas en el último minuto
    let dropped = 0
    let disabled = false
    let timer = null
    let dueAt = Infinity

    const keyOf = (r) => [r.kind, r.status, r.message, r.url, r.actionId, (r.stack || '').split('\n')[0]].join('|')

    function report(input) {
      try {
        if (disabled || !input) return
        if (input.kind === 'cancelled') return
        const url = input.url ? String(input.url) : undefined
        if (url && url.indexOf(CLIENT_LOG_PATH) >= 0) return   // nunca informar del propio informe
        if (isNoise(input)) return
        const t = now()
        const r = {
          level: 'error',
          kind: input.kind || 'unknown',
          message: clipText(input.message, MAX.message),
          detail: clipText(input.detail, MAX.detail),
          status: typeof input.status === 'number' ? input.status : undefined,
          url: clipText(redactUrl(url), MAX.url),
          route: clipText(input.route !== undefined ? input.route : routeOfRequestUrl(url), MAX.route),
          actionId: clipText(input.actionId, MAX.actionId),
          source: clipText(input.source, MAX.source),
          traceparent: input.traceparent,
          stack: clipText(input.stack, MAX.stack),
        }
        const key = keyOf(r)
        const existing = entries.get(key)
        if (existing && t - existing.windowStart < windowMs) {
          if (existing.pending === 0) existing.pendingFirstAt = t
          existing.pending++
          existing.lastAt = t
          // las repeticiones esperan al cierre de la ventana: una línea resumen, no una por vez
          plan(existing.windowStart + windowMs - t)
          return
        }
        entries.set(key, { report: r, windowStart: t, pending: 1, pendingFirstAt: t, lastAt: t, sent: false })
        plan(batchDelayMs)
      } catch (e) { /* informar nunca puede romper la página */ }
    }

    function plan(ms) {
      const at = now() + Math.max(0, ms)
      if (timer !== null && at >= dueAt) return
      if (timer !== null) cancel(timer)
      dueAt = at
      timer = schedule(() => { timer = null; dueAt = Infinity; flush(false) }, Math.max(0, ms))
    }

    /** Las líneas que tocan ya; `final` = la página se va, sale todo lo pendiente. */
    function takeDue(final) {
      const t = now()
      const lines = []
      for (const [key, e] of entries) {
        const expired = t - e.windowStart >= windowMs
        if (e.pending > 0 && (!e.sent || expired || final)) {
          lines.push({
            ...e.report,
            count: e.pending,
            firstAt: new Date(e.pendingFirstAt).toISOString(),
            lastAt: new Date(e.lastAt).toISOString(),
          })
          e.pending = 0
          e.sent = true
        }
        if (expired && e.pending === 0) entries.delete(key)
      }
      return lines
    }

    function admit(lines) {
      const t = now()
      sentAt = sentAt.filter((s) => t - s < 60000)
      // `dropped` en una línea = las que se perdieron ANTES de ella, en envíos anteriores
      const before = dropped
      const out = []
      for (const line of lines) {
        if (sentAt.length >= maxPerMinute) { dropped++; continue }
        sentAt.push(t)
        out.push(line)
      }
      if (out.length && before) { out[0].dropped = before; dropped -= before }
      return out
    }

    function batches(lines) {
      const out = []
      let current = []
      let size = 2
      for (const line of lines) {
        const json = JSON.stringify(line)
        if (current.length && size + json.length + 1 > MAX_BATCH_CHARS) {
          out.push(current); current = []; size = 2
        }
        current.push(line); size += json.length + 1
      }
      if (current.length) out.push(current)
      return out
    }

    function flush(final = false) {
      try {
        if (disabled) return
        const url = endpoint()
        if (!url) return
        const common = { renderer, userAgent: clipText(deps.userAgent, MAX.userAgent), pageUrl: clipText(redactUrl(deps.pageUrl ? deps.pageUrl() : undefined), MAX.pageUrl) }
        const lines = admit(takeDue(final)).map((l) => JSON.parse(JSON.stringify({ ...common, ...l })))
        for (const batch of batches(lines)) {
          let sent
          try { sent = deps.send(url, JSON.stringify(batch), { final }) } catch (e) { sent = null }
          Promise.resolve(sent).then((status) => {
            if (endpointIsMissing(status)) disabled = true
          }, () => { /* un informe perdido no se informa */ })
        }
        // quedan repeticiones esperando el cierre de su ventana
        let next = Infinity
        for (const e of entries.values()) {
          if (e.pending > 0) next = Math.min(next, e.windowStart + windowMs)
        }
        if (next !== Infinity && !final) plan(next - now())
      } catch (e) { /* idem */ }
    }

    return {
      report,
      flush,
      isDisabled: () => disabled,
      _pendingCount: () => entries.size,
    }
  }

  /**
   * El envío real: fetch keepalive con el token (el gateway lo exige); al ocultar la página y sin
   * token, sendBeacon como último recurso. Resuelve con el status, o undefined.
   */
  function clientLogSender(headers = () => ({})) {
    return (url, body, { final } = {}) => {
      const auth = headers() || {}
      const hasAuth = Object.keys(auth).length > 0
      if (final && !hasAuth && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        try {
          navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))
          return Promise.resolve(undefined)
        } catch (e) { /* sigue por fetch */ }
      }
      if (typeof fetch === 'undefined') return Promise.resolve(undefined)
      return fetch(url, {
        method: 'POST',
        keepalive: true,
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', ...auth },
        body,
      }).then((res) => res.status, () => undefined)
    }
  }

  /** El informador de la página (null hasta installClientErrorReporting). */
  const clientErrors = {
    _reporter: null,
    report(entry) { if (this._reporter) this._reporter.report(entry) },
  }

  /** El endpoint para una base: sólo mismo origen (otro origen no lleva nuestro token ni CORS). */
  function clientLogEndpointOf(base, origin) {
    const b = base || ''
    if (/^https?:\/\//i.test(b)) {
      if (!origin || b.indexOf(origin) !== 0) return null
    }
    return b.replace(/\/+$/, '') + CLIENT_LOG_PATH
  }

  /**
   * Lo engancha a la página: los errores sin capturar y las promesas rechazadas sin catch, y el
   * vaciado al ocultarla. Idempotente.
   */
  function installClientErrorReporting(base, options = {}) {
    if (clientErrors._reporter || typeof window === 'undefined') return clientErrors._reporter
    const origin = window.location && window.location.origin
    const reporter = createClientErrorReporter({
      renderer: options.renderer || 'redwood',
      endpoint: () => clientLogEndpointOf(base, origin),
      send: options.send || clientLogSender(options.headers || (() => ({}))),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      pageUrl: () => window.location && window.location.href,
    })
    clientErrors._reporter = reporter
    window.addEventListener('error', (event) => {
      // un recurso que no carga (img/script) llega aquí sin `error`; no es un error de JS
      if (!event || (!event.error && !event.message)) return
      const err = event.error
      reporter.report({
        kind: 'js-error',
        message: event.message || (err && err.message),
        stack: err && err.stack,
        source: event.filename ? `${event.filename}:${event.lineno || 0}:${event.colno || 0}` : undefined,
      })
    })
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event && event.reason
      // un fallo de transporte ya clasificado (y ya informado por fetchWithPolicy) no se duplica
      if (reason && reason.failure) return
      if (reason && (reason.name === 'AbortError')) return
      reporter.report({
        kind: 'unhandled-rejection',
        message: reason && reason.message ? reason.message : clipText(safeString(reason), MAX.message),
        stack: reason && reason.stack,
      })
    })
    window.addEventListener('pagehide', () => reporter.flush(true))
    return reporter
  }

  function safeString(v) {
    try { return typeof v === 'string' ? v : JSON.stringify(v) } catch (e) { return String(v) }
  }


  // REFRESCO PERIÓDICO (triggers con espera): el patrón del web — un OnLoad con timeoutMillis
  // arranca la primera vuelta y un OnSuccess(actionId = la misma, calledActionId = la misma,
  // timeoutMillis) cierra el bucle: cada refresco que termina bien programa el siguiente. Antes
  // la shell VB disparaba todos los OnLoad al momento, sin espera, y no conocía OnSuccess.
  //
  // Una GENERACIÓN por pantalla: navegar arranca una nueva y todo lo programado para la anterior
  // se descarta al vencer (como el callbackToken del web) — un panel de pisos que se deja de ver
  // deja de preguntar.

  let runner = null
  /** Quién ejecuta la acción programada (la shell: el mismo camino que los Element). */
  function setPollingRunner(fn) { runner = typeof fn === 'function' ? fn : null }

  let generation = 0
  let screenTree = null
  const timers = new Set()

  const triggersOf = (ctx) => (ctx && ctx.tree && ctx.tree.triggers) || []

  /** Los OnLoad CON espera (los inmediatos siguen el camino de siempre: onLoadTriggers). */
  function timedOnLoadTriggers(ctx) {
    return triggersOf(ctx).filter((t) => t.type === 'OnLoad' && t.actionId && t.timeoutMillis > 0)
  }

  /** Los OnSuccess que siguen a `actionId`. */
  function onSuccessTriggers(ctx, actionId) {
    return triggersOf(ctx).filter((t) => t.type === 'OnSuccess' && t.actionId && t.calledActionId === actionId)
  }

  // UNA vuelta pendiente por trigger: si el refresco repinta el host y eso relanza sus OnLoad (otro
  // 'search' que también termina bien), un segundo éxito no debe armar un segundo bucle en paralelo
  // — se reprograma el mismo (los bucles se multiplicaban: 14 búsquedas en 47 s con 15 s de espera)
  const pendingByTrigger = new Map()
  const triggerKey = (t) => t.type + ':' + t.actionId + ':' + (t.calledActionId || '')

  const schedule = (trigger, gen, timer = setTimeout, clear = clearTimeout) => {
    const fire = () => {
      if (gen !== generation || !runner) return
      runner(trigger.actionId, {}, { background: !!trigger.background, polling: true })
    }
    if (!(trigger.timeoutMillis > 0)) { fire(); return }
    const key = triggerKey(trigger)
    const previous = pendingByTrigger.get(key)
    if (previous !== undefined) { clear(previous); timers.delete(previous) }
    // la vuelta sólo corre si sigue siendo LA pendiente de su trigger (una reemplazada vence sin
    // efecto aunque su temporizador no se pudiera cancelar)
    const handle = timer(() => {
      timers.delete(handle)
      if (pendingByTrigger.get(key) !== handle) return
      pendingByTrigger.delete(key)
      fire()
    }, trigger.timeoutMillis)
    timers.add(handle)
    pendingByTrigger.set(key, handle)
  }

  /** Pantalla nueva: descarta lo programado y arma sus OnLoad con espera. */
  function startPolling(hostCtx, timer = setTimeout) {
    generation++
    for (const h of timers) clearTimeout(h)
    timers.clear()
    pendingByTrigger.clear()
    screenTree = hostCtx && hostCtx.tree
    for (const t of timedOnLoadTriggers(hostCtx)) schedule(t, generation, timer)
    return generation
  }

  /** Una acción terminó bien (hook del transporte): sus OnSuccess, si son de la pantalla en curso. */
  function actionSucceeded(ctx, actionId, timer = setTimeout) {
    if (!ctx || !ctx.tree) return 0
    // sólo la pantalla en curso (misma clase servidora que la que se armó al navegar): la isla de
    // otro ServerSide o una respuesta de la pantalla anterior no reprograman nada
    if (!screenTree || ctx.tree.serverSideType !== screenTree.serverSideType) return 0
    const next = onSuccessTriggers(ctx, actionId)
    for (const t of next) schedule(t, generation, timer)
    return next.length
  }

  const pollingGeneration = () => generation


  // The HOST's identity on every Mateu request — for the embedded mode (poc/embedded.mjs), where the
  // renderer runs as a <mateu-ui> component inside somebody else's Visual Builder app and the
  // identity belongs to THAT app, not to a bootstrap page of ours.
  //
  // The standalone app reads its token from localStorage (resilience.storedToken: the bootstrap page
  // keeps it there). A host app has no such page: it hands its identity to the component as a
  // static token, a static header object or a PROVIDER — a function (sync or async) called on every
  // send, so a host whose token rotates (the VB security provider, an OAuth refresh) is asked again
  // each time, and the retry after a 401 carries the new one.
  //
  // What the host supplies WINS over the stored token: the component speaks for the host page.
  // Nothing here is set in the standalone app, so its behaviour is unchanged (resilience falls back to
  // the stored token exactly as before).

  let hostProvider = null
  let hostCredentialsMode
  // the last headers a provider answered: what the sync callers get (the chat stream and the client
  // log build their own fetch and cannot await a provider on every keystroke)
  let lastHostHeaders = {}

  /**
   * The host's headers: an object ({Authorization: 'Bearer …', 'X-Tenant': …}), a function returning
   * one (or a Promise of one), or null to stop sending them.
   */
  function setHostHeaderProvider(provider) {
    hostProvider = provider == null ? null : provider
    lastHostHeaders = typeof provider === 'object' && provider ? cleanHeaders(provider) : {}
  }

  function hasHostHeaderProvider() { return hostProvider != null }

  /** fetch's `credentials` for the Mateu calls ('include' sends the host's cookies cross-origin). */
  function setHostCredentials(mode) {
    hostCredentialsMode = mode === 'include' || mode === 'same-origin' || mode === 'omit' ? mode : undefined
  }

  function hostCredentials() { return hostCredentialsMode }

  /** Only string-valued, non-empty headers: a provider answering {Authorization: undefined} (no
   *  token YET) must not send the literal "undefined". */
  function cleanHeaders(headers) {
    const out = {}
    if (!headers || typeof headers !== 'object') return out
    for (const name of Object.keys(headers)) {
      const value = headers[name]
      if (value == null || value === '') continue
      out[name] = String(value)
    }
    return out
  }

  /** The host's headers for a request to `url` ({} without a provider, or when it fails: a provider
   *  that throws must not take the request down with it — the backend will say 401, which is the
   *  honest answer). */
  async function hostHeadersFor(url) {
    if (hostProvider == null) return {}
    try {
      const value = typeof hostProvider === 'function' ? await hostProvider(url) : hostProvider
      lastHostHeaders = cleanHeaders(value)
    } catch (e) {
      if (typeof console !== 'undefined' && console.warn) console.warn('mateu: the host header provider failed', e)
      lastHostHeaders = {}
    }
    return lastHostHeaders
  }

  /** The headers the provider answered last: for the callers that cannot await. */
  function lastHostHeadersOf() { return { ...lastHostHeaders } }

  /** The host defines Authorization itself (case-insensitive): the stored token must not override it. */
  function hostAuthorizes(headers) {
    return !!headers && Object.keys(headers).some((h) => h.toLowerCase() === 'authorization')
  }


  // Resiliencia del transporte — el mismo contrato que los renderers web (libs/mateu:
  // requestPolicy + retryPolicy + connectivity + pendingActions), reescrito para ESTE core,
  // que no comparte nada con aquéllos: aquí el transporte es `fetch` pelado, no axios.
  //
  // Las diferencias que obliga fetch, y que son la razón de que esto no sea un copy-paste:
  //   - fetch NO tiene timeout. Sin AbortController una petición puede quedarse colgada para
  //     siempre; el usuario ve la pantalla congelada sin error ni fin.
  //   - fetch NO rechaza ante un 4xx/5xx: resuelve con `res.ok === false`. El estado hay que
  //     leerlo y adjuntarlo al error a mano, o abajo no hay forma de distinguir un 500 de un
  //     cable desenchufado.
  //   - un fallo de red es un `TypeError` genérico ("Failed to fetch"), y un abort es un
  //     `DOMException` con `name === 'AbortError'`. Ninguno trae código propio.
  //
  // Todo lo de aquí es puro salvo `fetchWithPolicy`, para que test.mjs lo pueda ejercitar en
  // Node sin navegador ni backend.




  // ── clasificación ────────────────────────────────────────────────────────────────────────

  /** Ceiling por defecto de una petición, en ms. Lo pisa `@Action(timeoutMillis = …)`. */
  const DEFAULT_TIMEOUT_MS = 60000

  // los textos, en el idioma de la interfaz (i18n.mjs)
  const MESSAGES = {
    offline: () => chromeText('errOffline'),
    timeout: () => chromeText('errTimeout'),
    server: (s) => (s ? chromeText('errServerStatus', { status: s }) : chromeText('errServer')),
    unauthorized: () => chromeText('errUnauthorized'),
    // Un 403 NO es la sesión: el servidor sabe quién eres y dice que no a ESTO (una acción que la
    // vista no declara, un rol que falta). Decir "vuelve a iniciar sesión" mandaba a un login que
    // no arregla nada.
    forbidden: () => chromeText('errForbidden'),
    notFound: () => chromeText('errNotFound'),
    client: (s) => (s ? chromeText('errClientStatus', { status: s }) : chromeText('errClient')),
    cancelled: () => '',
    unknown: () => chromeText('errUnknown'),
  }

  /** Tipos que merece la pena reintentar: o no llegó, o el servidor tuvo un mal momento. */
  const RETRYABLE = new Set(['offline', 'timeout', 'server'])

  /**
   * Traduce un fallo de transporte a `{ kind, message, retryable, status }`.
   *
   * `online` se inyecta para poder testearlo y porque el llamante tiene una señal mejor que
   * `navigator.onLine` (que miente en portales cautivos).
   */
  function classifyRequestFailure(error, options = {}) {
    const err = error || {}
    const status = err.status != null ? err.status : (err.response && err.response.status)
    const name = err.name || ''
    const message = err.message || ''
    const online = options.online !== undefined
      ? options.online
      : (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true)

    const failure = (kind) => ({
      kind,
      message: MESSAGES[kind](status),
      retryable: RETRYABLE.has(kind),
      status,
    })

    // Un abort es una decisión NUESTRA (navegación, timeout propio): nunca es noticia para el
    // usuario… salvo cuando lo disparó el timeout, que sí lo es. Los distingue la marca.
    if (name === 'AbortError' || err.code === 'ERR_CANCELED') {
      return failure(err.__mateuTimedOut ? 'timeout' : 'cancelled')
    }
    if (err.__mateuTimedOut || /timeout/i.test(message)) return failure('timeout')

    if (status == null) {
      // Sin respuesta: o sabemos que no hay red, o la petición murió antes de llegar.
      if (!online) return failure('offline')
      // fetch resuelve un fallo de red como un TypeError sin más señas.
      if (name === 'TypeError' || /failed to fetch|networkerror|load failed/i.test(message)) {
        return failure('offline')
      }
      return failure('unknown')
    }
    if (status === 401) return failure('unauthorized')
    if (status === 403) return failure('forbidden')
    if (status === 404 || status === 410) return failure('notFound')
    if (status === 408 || status === 429) return failure('timeout')
    if (status >= 500) return failure('server')
    if (status >= 400) return failure('client')
    return failure('unknown')
  }

  // ── política de reintento ────────────────────────────────────────────────────────────────

  /** Ids de acción del framework que sólo LEEN. '' es la carga de ruta. */
  const ALWAYS_SAFE = new Set(['', '__load__', 'search', '_globalsearch', '_notifications-list'])
  const SAFE_PREFIXES = ['_appcontext-search-', 'search-']

  /**
   * Si repetir `actionId` no puede aplicar el mismo cambio dos veces.
   *
   * Por defecto NO: cuando una petición expira no sabemos si el servidor la procesó, así que
   * repetir un `create` arriesga un duplicado silencioso. `declared` es el opt-in del wire
   * (`@Action(idempotent = true)`), que nunca saca a una lectura conocida de la lista.
   */
  function isIdempotentAction(actionId, declared) {
    if (declared === true) return true
    // Un id AUSENTE es trabajo desconocido; uno VACÍO es la carga de ruta. No son lo mismo.
    if (actionId === undefined || actionId === null) return false
    if (ALWAYS_SAFE.has(actionId)) return true
    return SAFE_PREFIXES.some((p) => actionId.startsWith(p))
  }

  /** Intentos ADEMÁS del primero. */
  const MAX_RETRIES = 2

  /** Espera antes del reintento `attempt` (1-based): exponencial con ±25% de jitter. */
  function retryDelayMs(attempt, random = Math.random) {
    const base = 300 * Math.pow(3, Math.max(0, attempt - 1))
    return Math.round(base * (0.75 + random() * 0.5))
  }

  /**
   * La decisión. `offline` queda deliberadamente fuera: reenviar a los 300 ms con la red caída
   * sólo quema el presupuesto de intentos — de la reconexión se encarga `connectivity`.
   */
  function shouldRetry(failure, attempt, options = {}) {
    if (!options.idempotent) return false
    if (attempt > MAX_RETRIES) return false
    if (!failure.retryable) return false
    return failure.kind === 'timeout' || failure.kind === 'server'
  }

  // ── conectividad ─────────────────────────────────────────────────────────────────────────

  /**
   * Una respuesta honesta a "¿llegamos?".
   *
   * `navigator.onLine` informa del enlace, no del camino: dice true en un portal cautivo y con
   * una VPN que perdió la ruta. Sirve como negativo duro; el positivo lo da nuestro propio
   * tráfico volviendo.
   */
  const connectivity = {
    _linkUp: true,
    _reachable: undefined,
    _listeners: new Set(),
    _started: false,

    start() {
      if (this._started || typeof window === 'undefined') return
      this._started = true
      this._linkUp = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
        ? navigator.onLine : true
      window.addEventListener('online', () => {
        this._linkUp = true
        this._reachable = undefined   // el enlace vuelve, el camino está por demostrar
        this._emit()
      })
      window.addEventListener('offline', () => { this._linkUp = false; this._emit() })
    },

    isOnline() {
      if (!this._linkUp) return false
      return this._reachable !== false
    },

    noteReachable() {
      const was = this.isOnline()
      this._reachable = true
      if (!was) this._emit()
    },

    noteUnreachable() {
      const was = this.isOnline()
      this._reachable = false
      if (was) this._emit()
    },

    subscribe(listener) {
      this._listeners.add(listener)
      return () => this._listeners.delete(listener)
    },

    reset() { this._linkUp = true; this._reachable = undefined },

    _emit() {
      const online = this.isOnline()
      this._listeners.forEach((l) => l(online))
    },
  }

  // ── guard de doble envío ─────────────────────────────────────────────────────────────────

  /** Válvula de seguridad: pasado este tiempo una entrada se da por muerta y se libera. */
  const STALE_MS = 120000

  const pendingActions = {
    _started: new Map(),

    key(componentId, actionId) { return `${componentId || '_'}::${actionId}` },

    /** Reclama el hueco. false = ya hay una idéntica en vuelo y ésta es un duplicado. */
    begin(key, now = Date.now()) {
      const startedAt = this._started.get(key)
      if (startedAt !== undefined && now - startedAt < STALE_MS) return false
      this._started.set(key, now)
      return true
    },

    end(key) { this._started.delete(key) },

    isPending(key, now = Date.now()) {
      const startedAt = this._started.get(key)
      return startedAt !== undefined && now - startedAt < STALE_MS
    },

    reset() { this._started.clear() },
  }

  // ── ganchos de ciclo de vida ─────────────────────────────────────────────────────────────

  /**
   * Cómo la app (VB) se entera de que hay trabajo en vuelo, sin que el core sepa nada de VB.
   * `onStart` recibe {actionId}; `onSettle` recibe {actionId, failure} (failure null si fue bien).
   */
  /**
   * Peticiones que un componente hace PARA SÍ y que ya enseñan su propia carga: nunca encienden la
   * barra de ocupado de la página (la misma regla que el renderer web, localRequests.ts).
   * `search-<campo>`: la búsqueda de opciones de un lookup (y la vacía que llena un select);
   * `code-<campo>`: el rótulo de un código tecleado; `__restfetch__`: un @RestOptions por el servidor.
   */
  function isLocalRequest(actionId) {
    return !!actionId && (actionId.indexOf('search-') === 0 || actionId.indexOf('code-') === 0 || actionId === '__restfetch__')
  }

  const transportHooks = { onStart: null, onSettle: null }

  function setTransportHooks(hooks) {
    transportHooks.onStart = (hooks && hooks.onStart) || null
    transportHooks.onSettle = (hooks && hooks.onSettle) || null
  }

  const notify = (which, payload) => {
    const fn = transportHooks[which]
    if (!fn) return
    try { fn(payload) } catch (e) { /* la UI no puede tumbar el transporte */ }
  }

  // ── la pantalla en curso ─────────────────────────────────────────────────────────────────

  /**
   * Qué pantalla hay: un contador que la navegación sube al empezar a cargar otra (beginView). Una
   * petición de la pantalla (callMateu la estampa sola; no las de fondo: widgets de cabecera, menús
   * remotos, el chat) recuerda la pantalla para la que salió, y su respuesta — buena o mala — que
   * llega cuando ya hay otra muere en silencio: no se pinta, no pone banda de error ni pide
   * reautenticar; sólo libera el ocupado (onSettle sin fallo). Es la misma regla que el renderer web
   * (staleViewGuard.ts): una petición que salió con la pantalla A y vuelve con la B no es de nadie.
   */
  const viewGuard = { generation: 0 }

  /** Empieza otra pantalla: lo que siga en vuelo de la anterior ya no se aplicará. */
  function beginView() { return ++viewGuard.generation }

  /** La pantalla en curso (para estampar una petición al salir). */
  function currentView() { return viewGuard.generation }

  /** ¿Ya no está en pantalla la vista para la que salió una petición? (undefined: no atada a ninguna) */
  function isViewStale(view) { return view != null && view !== viewGuard.generation }

  /** El rechazo de una respuesta que llegó para una pantalla que ya no está. */
  function staleResponseError(actionId) {
    const error = new Error(`respuesta a '${actionId || ''}' para una pantalla que ya no está`)
    error.stale = true
    error.code = 'ERR_CANCELED'
    error.failure = { kind: 'cancelled', message: '', retryable: false, status: undefined }
    return error
  }

  function isStaleResponse(error) { return !!(error && error.stale === true) }

  // ── fetch con política ───────────────────────────────────────────────────────────────────

  const delay = (ms) => new Promise((r) => setTimeout(r, ms))

  /** La cabecera traceparent de una petición, si la llevaba. */
  function traceparentOf(init) {
    const h = init && init.headers
    if (!h) return undefined
    if (typeof h.get === 'function') return h.get('traceparent') || undefined
    return h.traceparent || h.Traceparent || undefined
  }

  /**
   * Un envío: aplica el timeout (fetch no trae ninguno) y convierte un 4xx/5xx en un error que
   * LLEVA el status, porque fetch resuelve esos como éxito y abajo no habría forma de saberlo.
   */
  async function sendOnce(url, init, timeoutMillis) {
    // Negativo = SIN ceiling, para un stream que dura lo que dure (LongTask). Distinto de 0 /
    // ausente, que significa "usa el de por defecto".
    const noCeiling = timeoutMillis != null && timeoutMillis < 0
    const ms = timeoutMillis && timeoutMillis > 0 ? timeoutMillis : DEFAULT_TIMEOUT_MS
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    let timedOut = false
    const timer = noCeiling ? null : setTimeout(() => {
      timedOut = true
      if (controller) controller.abort()
    }, ms)
    try {
      const res = await fetch(url, controller ? { ...init, signal: controller.signal } : init)
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        const error = new Error(`Mateu → HTTP ${res.status}${text ? `: ${text}` : ''}`)
        error.status = res.status
        throw error
      }
      return res
    } catch (e) {
      // Un abort disparado por NUESTRO timeout debe leerse como timeout, no como cancelación:
      // el usuario sí tiene que enterarse.
      if (timedOut && e) e.__mateuTimedOut = true
      throw e
    } finally {
      if (timer) clearTimeout(timer)
    }
  }

  /**
   * La cabecera con el token, si el bootstrap dejó uno.
   *
   * La página de bootstrap autentica contra Keycloak y guarda el token en
   * `localStorage.__mateu_auth_token`, refrescándolo al caducar. Hasta que esto existió, NADA lo
   * leía: el bridge hacía cada llamada sin cabecera, el gateway respondía 401 y el clasificador de
   * abajo lo traducía a "Tu sesión ya no es válida" — un mensaje cierto sobre el 401 y engañoso
   * sobre la causa, porque la sesión estaba perfectamente viva y la petición sencillamente no la
   * presentaba. La consola cargaba, se quedaba sin un solo menú, y el panel de chat tampoco
   * respondía.
   *
   * Va aquí y no en los tres sitios que construyen cabeceras en transport.mjs, por lo mismo que en
   * el otro renderer es un interceptor de axios y no un parámetro de cada llamada: un punto único
   * que un cuarto sitio no puede olvidar.
   *
   * `localStorage` no existe en Node, donde corre test.mjs, así que se consulta con guarda; y un
   * `Authorization` que el llamante ya haya puesto manda sobre este, que es lo que permite probar
   * el camino sin tocar el almacenamiento.
   */
  function authHeaders(init) {
    const already = init && init.headers &&
      (init.headers.Authorization || init.headers.authorization)
    if (already) return null
    const token = storedToken()
    return token ? { Authorization: 'Bearer ' + token } : null
  }

  /** El token que dejó el bootstrap, o null (sin localStorage, bloqueado o vacío). */
  function storedToken() {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem('__mateu_auth_token') : null
    } catch (e) {
      // Un navegador con el almacenamiento bloqueado. Sin token se sigue: el backend dirá que no,
      // que es mejor que no llamar.
      return null
    }
  }

  /**
   * La cabecera con el token para una llamada que NO pasa por fetchWithPolicy: el stream del chat
   * del agente (SSE, un fetch propio que lee el cuerpo por trozos). Sin ella el agente contesta
   * 401 y el panel enseña "Servidor respondió 401". {} si no hay token.
   */
  function authHeadersOf() {
    // embedded mode (hostHeaders.mjs): the host's headers, as last answered by its provider, win
    const host = lastHostHeadersOf()
    return { ...((hostAuthorizes(host) ? null : authHeaders(null)) || {}), ...host }
  }

  /** El refresco en marcha, si lo hay: los 401 que llegan mientras tanto esperan a éste. */
  let reauthInFlight = null

  /**
   * Pide a la página que reautentique tras un 401, con el mismo contrato que el renderer de Vaadin
   * (sessionGuard.ts): el evento cancelable 'mateu-session-expired' en document, con
   * {retry, giveUp} en el detail. El bootstrap de Mateu lo atiende — fuerza el refresco del token
   * de Keycloak y llama a retry, o manda al login si la sesión ya no existe. Resuelve true si hay
   * que reenviar la petición; false si nadie lo reclamó o la página desistió.
   *
   * UN refresco para todos: la pestaña vuelve del fondo con el token caducado y el badge del inbox,
   * la sincronización del banner y la acción del usuario vuelven 401 a la vez. Cada una lanzando su
   * evento eran N refrescos forzados en paralelo (y N keycloak.login() si fallaba); ahora los 401
   * que llegan mientras hay uno en marcha esperan a ése y comparten su respuesta.
   *
   * `sentToken` (opcional): el token con el que salió la petición rechazada. Si el que hay ahora es
   * otro, el refresco ya ocurrió mientras la petición volaba — el del visibilitychange, típicamente
   * — y basta con reenviar: forzar otro sería tirar uno recién emitido.
   */
  function askForReauthentication(sentToken) {
    if (sentToken !== undefined) {
      const current = storedToken()
      if (current && current !== sentToken) return Promise.resolve(true)
    }
    if (!reauthInFlight) {
      reauthInFlight = raiseSessionExpired().finally(() => { reauthInFlight = null })
    }
    return reauthInFlight
  }

  function raiseSessionExpired() {
    return new Promise((resolve) => {
      if (typeof document === 'undefined' || typeof CustomEvent === 'undefined') {
        resolve(false)
        return
      }
      let settled = false
      const settle = (value) => {
        if (settled) return
        settled = true
        resolve(value)
      }
      const detail = { retry: () => settle(true), giveUp: () => settle(false) }
      const claimed = !document.dispatchEvent(
        new CustomEvent('mateu-session-expired', { detail, cancelable: true, bubbles: false }))
      if (!claimed) settle(false)
    })
  }

  /**
   * El punto único por el que pasa TODO el tráfico de este renderer.
   *
   * Y por eso es donde se adjunta el token: es el cliente de Mateu de este renderer, igual que
   * AxiosMateuApiClient lo es del otro.
   *
   * Reenvía mientras el fallo sea transitorio Y la acción sea segura de repetir; cada intento
   * resuelto enseña al rastreador de conectividad si el backend responde — una respuesta
   * demuestra el camino mejor que cualquier bandera del navegador. Los N intentos son UN solo
   * resultado de cara a la UI: un estado de carga, un mensaje.
   */
  async function fetchWithPolicy(url, init, options = {}) {
    // El token se lee en CADA envío, no una vez: tras un 401 el bootstrap deja uno nuevo en
    // localStorage y el reintento tiene que llevar ese, no el caducado.
    // El token con el que salió el ÚLTIMO envío (undefined si no llevaba el nuestro): ante un 401
    // dice si el refresco ya llegó mientras la petición volaba.
    let sentToken
    const withAuth = async () => {
      // embedded mode: the HOST app's identity (hostHeaders.mjs) — asked on every send, so a retry
      // after a 401 carries whatever the host has now; it wins over the stored token
      const host = await hostHeadersFor(url)
      const credentials = hostCredentials()
      const auth = hostAuthorizes(host) ? null : authHeaders(init)
      sentToken = auth ? auth.Authorization.slice('Bearer '.length) : undefined
      if (!auth && !Object.keys(host).length && !credentials) return init
      return {
        ...(init || {}),
        ...(credentials ? { credentials } : {}),
        headers: { ...((init && init.headers) || {}), ...(auth || {}), ...host },
      }
    }
    const actionId = options.actionId
    const idempotent = isIdempotentAction(actionId, options.idempotent)
    // `quiet`: una petición de FONDO (el refresco de un widget de cabecera cada pocos segundos) no
    // avisa a los ganchos — la barra de ocupado y la banda de error hablan de lo que hace el usuario.
    // Tampoco la de un componente que ya enseña su propia carga (isLocalRequest): el combo que busca
    // sus opciones gira su propio indicador, y la barra encima eran dos esperas para una tecla
    const quiet = options.quiet || isLocalRequest(actionId)
    const notifyUnlessQuiet = (hook, payload) => { if (!quiet) notify(hook, payload) }
    // `isolated`: lo que pase con esta petición no dice nada de la conexión — el menú de un pod
    // federado, a menudo de otro origen: un pod caído es SU sección no disponible, no "sin conexión"
    const isolated = !!options.isolated
    notifyUnlessQuiet('onStart', { actionId })
    // `view`: la pantalla para la que sale (currentView); su respuesta muere si ya hay otra
    const view = options.view
    const dropStale = () => {
      // el ocupado se apaga (lo encendió esta petición), sin fallo que enseñar
      notifyUnlessQuiet('onSettle', { actionId, failure: null })
      if (typeof console !== 'undefined' && console.debug) {
        console.debug('mateu: respuesta descartada — su pantalla ya no está', actionId, url)
      }
      throw staleResponseError(actionId)
    }
    let attempt = 0
    let reauthenticated = false
    for (;;) {
      try {
        const res = await sendOnce(url, await withAuth(), options.timeoutMillis)
        if (!isolated) connectivity.noteReachable()
        if (isViewStale(view)) dropStale()
        notifyUnlessQuiet('onSettle', { actionId, failure: null })
        return res
      } catch (error) {
        if (isStaleResponse(error)) throw error
        // su pantalla ya no está: ni reautenticar, ni reintentar, ni banda
        if (isViewStale(view)) dropStale()
        // Un 401 es, casi siempre, el token caducado entre dos refrescos. Se pide a la página que
        // reautentique y se reenvía UNA vez: el servidor rechazó la petición sin ejecutarla, así
        // que repetirla es seguro también para una escritura. Sin nadie que reautentique, o si el
        // reintento vuelve a dar 401, falla como siempre.
        if (error && error.status === 401 && !reauthenticated) {
          reauthenticated = true
          if (await askForReauthentication(sentToken)) continue
        }
        const failure = classifyRequestFailure(error, { online: connectivity.isOnline() })
        if (failure.kind === 'offline' && !isolated) connectivity.noteUnreachable()
        attempt++
        if (!shouldRetry(failure, attempt, { idempotent })) {
          // El error viaja CLASIFICADO: la UI enseña `failure.message` en vez de "Failed to
          // fetch", y decide si ofrecer reintentar.
          error.failure = failure
          notifyUnlessQuiet('onSettle', { actionId, failure })
          // al log del servidor (clientLog.mjs): lo que el usuario vio y lo que hubo debajo. Un
          // 'cancelled' no se informa, y la llamada al propio endpoint no pasa por aquí.
          clientErrors.report({
            kind: failure.kind,
            message: failure.message,
            status: failure.status,
            detail: error && error.message,
            url,
            actionId,
            traceparent: traceparentOf(init),
          })
          throw error
        }
        await delay(retryDelayMs(attempt))
      }
    }
  }


  // Wire-version check — the same rule as the web renderer (libs/mateu infra/http/wireVersion.ts).
  //
  // Every response of a Mateu backend carries `wireVersion` ("3.0" today). The wire is additive within
  // a MAJOR: a newer minor only adds optional fields, component types and commands, which this renderer
  // ignores (unknown fields) or draws as the "Unsupported component" placeholder (unknown types). A
  // different MAJOR may have removed or changed what this renderer relies on, so instead of a
  // half-broken screen the user is told, once, in plain words, that server and renderer do not match.
  // A response without the field (a backend older than the field) is accepted silently.
  //
  // The transport calls observeWireVersion on every response; the shell (loadMateuShell.js) registers
  // the listener that shows the message in the error band.


  /** The wire major this renderer was built for. */
  const SUPPORTED_WIRE_MAJOR = 3

  /** Same major → ok; another major → not ok. Unparseable or absent → ok (nothing to judge). */
  function checkWireVersion(received, supportedMajor = SUPPORTED_WIRE_MAJOR) {
    if (typeof received !== 'string' || received.trim() === '') return { ok: true }
    const major = parseInt(received.trim().split('.')[0], 10)
    if (!Number.isFinite(major)) return { ok: true }
    return major === supportedMajor ? { ok: true } : { ok: false, serverMajor: major, received: received.trim() }
  }

  /** The user-facing text for a mismatch, in the interface's language. */
  function wireMismatchMessage(serverMajor, supportedMajor = SUPPORTED_WIRE_MAJOR, lang) {
    return chromeText('wireVersionMismatch', { server: `${serverMajor}.x`, supported: `${supportedMajor}.x` }, lang)
  }

  const wireVersionState = { reported: false, listener: null }

  /** The shell's hook: called ONCE per page with the message of the first mismatch. */
  function setWireMismatchListener(fn) {
    wireVersionState.listener = typeof fn === 'function' ? fn : null
  }

  /** Inspect a response body; report the first mismatch of the page. Rendering goes on regardless. */
  function observeWireVersion(body) {
    if (!body || typeof body !== 'object') return { ok: true }
    const check = checkWireVersion(body.wireVersion)
    if (!check.ok && !wireVersionState.reported) {
      wireVersionState.reported = true
      const message = wireMismatchMessage(check.serverMajor)
      if (typeof console !== 'undefined') console.error('[mateu] ' + message)
      if (wireVersionState.listener) {
        try { wireVersionState.listener(message) } catch (e) { /* the UI must not break the transport */ }
      }
    }
    return check
  }

  /** Test hook: forget that a mismatch was already reported. */
  function resetWireVersionCheck() {
    wireVersionState.reported = false
  }



  // Accesibilidad del renderer VB — la parte que NO traen los componentes oj-*.
  //
  // Medido antes de escribir nada (axe-core sobre la app servida): la composición de oj-sp-*
  // sale prácticamente limpia, igual que pasaba con Vaadin, porque esos componentes traen su
  // propia accesibilidad. Los huecos reales son los de una SPA, que axe no puede evaluar:
  // al cambiar de ruta no cambia la página, así que un lector de pantalla no tiene NADA que
  // anunciar y el foco se queda donde estaba — normalmente en el enlace del menú que se acaba
  // de pulsar, obligando a tabular por toda la shell para llegar al contenido pedido.
  //
  // Vive en poc/ (fuente única) para que make-amd.mjs lo empaquete en el bridge y la app lo
  // use desde las chains, igual que el resto del core.

  // ── región viva ──────────────────────────────────────────────────────────────────────────

  const REGION_STYLE = [
    'position:absolute', 'width:1px', 'height:1px', 'margin:-1px', 'padding:0',
    'overflow:hidden',
    // clip, NO display:none ni visibility:hidden: esas dos sacan el nodo del árbol de
    // accesibilidad, que es justo lo contrario de lo que hace falta aquí.
    'clip:rect(0 0 0 0)', 'clip-path:inset(50%)', 'white-space:nowrap', 'border:0',
  ].join(';')

  const regions = {}

  function regionFor(politeness) {
    if (typeof document === 'undefined' || !document.body) return null
    const existing = regions[politeness]
    if (existing && existing.isConnected) return existing
    const region = document.createElement('div')
    region.setAttribute('aria-live', politeness)
    region.setAttribute('aria-atomic', 'true')
    region.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status')
    region.setAttribute('data-mateu-live-region', politeness)
    region.style.cssText = REGION_STYLE
    document.body.appendChild(region)
    regions[politeness] = region
    return region
  }

  /**
   * Crea las regiones por adelantado.
   *
   * No es opcional: una región creada y rellenada en el mismo tick a menudo NO se anuncia,
   * porque la tecnología asistiva vigila mutaciones de regiones que ya conocía.
   */
  function installAnnouncer() {
    if (typeof document === 'undefined') return
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', installAnnouncer, { once: true })
      return
    }
    regionFor('polite')
    regionFor('assertive')
  }

  /**
   * Dice `message` a la tecnología asistiva. No pinta nada.
   *
   * `assertive` interrumpe y es para lo que el usuario no puede perderse (un guardado que
   * falló); `polite` espera una pausa y es para lo rutinario (dónde acaba de aterrizar). Usar
   * assertive para todo hace la app inusable, así que es opt-in.
   */
  function announce(message, options = {}) {
    const text = (message == null ? '' : String(message)).trim()
    if (!text) return
    const region = regionFor(options.politeness || 'polite')
    if (!region) return
    if (region.textContent === text) {
      // Repetir el mismo mensaje es un caso real (dos guardados fallidos seguidos) y una
      // región cuyo texto no cambia no anuncia nada: se limpia y se repone.
      region.textContent = ''
      setTimeout(() => { region.textContent = text }, 60)
      return
    }
    region.textContent = text
  }

  // ── foco tras navegar ────────────────────────────────────────────────────────────────────

  /**
   * Lleva el foco al contenido recién cargado.
   *
   * Se busca el primer encabezado del área de contenido; si no hay, el propio contenedor, al
   * que se le da `tabindex="-1"` para que pueda recibir foco por programa sin añadir una
   * parada de tabulación propia.
   */
  function focusContent() {
    if (typeof document === 'undefined') return false
    const root = document.querySelector('#vbRouterContent') || document.querySelector('.oj-web-applayout-content-nopad')
    if (!root) return false

    // Candidatos en orden de preferencia. El encabezado tiene que llevar TEXTO: la shell pinta
    // un <h1> vacío hasta que llega el título, y un encabezado vacío no es focusable (ni sería
    // útil anunciarlo) — el intento fallaba en silencio y el foco se quedaba donde estaba.
    const headings = [...root.querySelectorAll('h1, h2, [role="heading"]')]
      .filter((h) => (h.textContent || '').trim().length > 0)
    const candidates = [...headings, root]

    for (const target of candidates) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      try { target.focus({ preventScroll: true }) } catch (e) { target.focus() }
      // Comprobar que PRENDIÓ: focus() sobre un elemento sin caja no hace nada y no avisa.
      if (document.activeElement === target || (document.activeElement && target.contains(document.activeElement))) {
        return true
      }
    }
    return false
  }

  let hasNavigated = false

  /**
   * Anuncia la llegada a una pantalla y deja el foco en ella.
   *
   * Dos límites deliberados, y los dos importan:
   *
   *  - Sólo en navegaciones REALES. Un re-render no debe tocar el foco: se lo arrancaría al
   *    usuario del campo que está editando.
   *  - NUNCA en la primera carga. Ahí el documento ya empieza arriba, y llevar el foco al
   *    contenido deja el enlace de salto por DETRÁS del punto de partida: el primer tabulador
   *    del usuario ya no lo alcanza y el menú queda sólo a base de Shift+Tab. Se anuncia el
   *    título igualmente, que es lo que aporta valor en esa primera pantalla.
   */
  function announceNavigation(title) {
    announce(title)
    if (hasNavigated && !focusIsInChat(typeof document === 'undefined' ? null : document.activeElement)) focusContentSoon()
    hasNavigated = true
  }

  /**
   * Whether the focus is in the AI chat panel. A screen the assistant opened (its answer navigates)
   * must not take the focus from the chat: the person is still talking to it, and moving the focus to
   * the new screen's heading left them clicking back into the message box after every answer. The
   * title is still announced.
   */
  function focusIsInChat(activeElement) {
    return !!(activeElement && typeof activeElement.closest === 'function' && activeElement.closest('#mateuChatPanel'))
  }

  /**
   * Intenta llevar el foco al contenido durante unos cuantos frames.
   *
   * VB actualiza los bindings de forma asíncrona: en el momento en que la chain de navegación
   * termina, el contenido nuevo AÚN NO está en el DOM. Enfocar ahí prende sobre el contenido
   * viejo y se pierde en cuanto se reemplaza — que es exactamente lo que pasaba. Se reintenta
   * hasta que prenda, o se abandona: mejor no mover el foco que dejarlo en un sitio raro.
   */
  function focusContentSoon(framesLeft = 12) {
    if (typeof requestAnimationFrame === 'undefined') { focusContent(); return }
    requestAnimationFrame(() => {
      if (focusContent()) return
      if (framesLeft > 0) focusContentSoon(framesLeft - 1)
    })
  }

  /** Test seam: olvida que ya se navegó. */
  function resetNavigationState() { hasNavigated = false }

  // ── salto al contenido ───────────────────────────────────────────────────────────────────

  /**
   * Monta el enlace "saltar al contenido" como PRIMER elemento del body (WCAG 2.4.1).
   *
   * Cada pantalla empieza por el mismo menú. Sin una vía para saltarlo, quien navega con
   * teclado paga ese menú entero en cada pantalla antes de llegar a lo que venía a hacer.
   *
   * Oculto por transform y no por display:none, porque un elemento con display:none no puede
   * recibir foco — y entonces el enlace sería inalcanzable, que es justo lo contrario.
   */
  function mountSkipLink(label = chromeText('skipToContent')) {
    if (typeof document === 'undefined') return
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', () => mountSkipLink(label), { once: true })
      return
    }
    if (document.querySelector('.mateu-skip-link')) return
    const link = document.createElement('button')
    link.className = 'mateu-skip-link'
    link.textContent = label
    link.addEventListener('click', focusContent)
    document.body.insertBefore(link, document.body.firstChild)
  }

  // ── estado de ocupado en el control pulsado ──────────────────────────────────────────────

  /**
   * Marca ocupado el control que el usuario pulsó, mientras su acción está en vuelo.
   *
   * La barra global responde a "¿está ocupada la app?", pero la pregunta que se hace quien está
   * en una conexión lenta es "¿se ha enterado de mi clic?". Sin esto pulsa Guardar, no cambia
   * nada, y vuelve a pulsar.
   *
   * Anima la OPACIDAD del propio elemento y no dibuja un spinner en ::after: sobre un shadow
   * host el pseudo-elemento no se pinta (comprobado en los renderers web con un
   * `inset:0;background:red` sobre un vaadin-button vivo), y no hay garantía de que los
   * componentes de JET no lo sean.
   */
  function markPending(element) {
    if (!element || !element.setAttribute) return
    if (element.hasAttribute('data-mateu-pending')) return
    element.setAttribute('data-mateu-pending', '')
    element.setAttribute('aria-busy', 'true')
  }

  function clearPending(element) {
    if (!element || !element.removeAttribute) return
    element.removeAttribute('data-mateu-pending')
    element.removeAttribute('aria-busy')
  }

  /**
   * El control realmente pulsado a partir del evento, o null si no lo hay.
   *
   * Sólo se decora una lista CERRADA de cosas con pinta de botón: atenuar un contenedor (una
   * tabla, un formulario entero) sería peor que no mostrar nada, y una acción puede dispararse
   * desde cualquier sitio — un trigger, un atajo, el clic de una fila.
   */
  const INTERACTIVE = 'oj-button, oj-menu-button, oj-c-button, button, [role="button"], a[href]'

  function pressedControl(event) {
    const target = event && (event.target || event.currentTarget)
    if (!target || !target.closest) return null
    return target.closest(INTERACTIVE)
  }

  /**
   * Sigue el control pulsado a nivel de DOCUMENTO y lo marca mientras haya trabajo en vuelo.
   *
   * Enhebrar el evento por cada chain no vale: los botones de la app pasan por chains
   * distintas (toolbar, listado, wizard, isla…) y cualquiera nueva se olvidaría de hacerlo. En
   * cambio el clic siempre pasa por el documento, y el transporte siempre avisa de cuándo
   * empieza y acaba — así que emparejar las dos señales cubre todos los caminos, incluidos los
   * que aún no existen.
   *
   * La ventana de gracia evita marcar un control por trabajo que no desencadenó él (un trigger
   * OnLoad, un autosave): sólo cuenta si la petición sale justo detrás del clic.
   */
  const PRESS_GRACE_MS = 400
  let lastPress = { control: null, at: 0 }
  let markedControl = null

  function trackPressedControls() {
    if (typeof document === 'undefined') return
    document.addEventListener('click', (e) => {
      const path = typeof e.composedPath === 'function' ? e.composedPath() : []
      const origin = path[0] || e.target
      const control = origin && origin.closest ? origin.closest(INTERACTIVE) : null
      lastPress = { control, at: Date.now() }
    }, true)
  }

  /** Llamar desde el hook onStart del transporte. */
  function markPressedControlBusy() {
    if (!lastPress.control) return
    if (Date.now() - lastPress.at > PRESS_GRACE_MS) return
    markedControl = lastPress.control
    markPending(markedControl)
  }

  /** Llamar desde el hook onSettle. */
  function clearPressedControlBusy() {
    clearPending(markedControl)
    markedControl = null
  }

  // ── reintento a nivel de chain ───────────────────────────────────────────────────────────

  /**
   * Qué hay que rehacer tras un fallo.
   *
   * Se guarda un DESCRIPTOR, no un cierre. Un cierre atrapa el `context` de VB de la ejecución
   * que falló, y ese contexto ya no sirve cuando el usuario pulsa Reintentar un segundo después:
   * la llamada no hace nada y falla en silencio (me pasó). Con un descriptor, quien reintenta
   * usa SU contexto, que está vivo.
   *
   * Reenviar sólo la petición tampoco valdría: una respuesta que nadie procesa no cambia nada en
   * pantalla — la misma lección que en los renderers web. Por eso lo que se rehace es la acción
   * o la navegación ENTERA.
   */
  let lastRetry = null

  /** `{ kind: 'navigate', route }` o `{ kind: 'action', actionId, parameters }`. */
  function setLastRetry(descriptor) {
    lastRetry = descriptor && descriptor.kind ? descriptor : null
  }

  function hasLastRetry() { return !!lastRetry }

  /** Devuelve el descriptor y lo olvida: un reintento se ofrece una vez. */
  function takeLastRetry() {
    const descriptor = lastRetry
    lastRetry = null
    return descriptor
  }

  // ── campos obligatorios ───────────────────────────────────────────────────────────────────

  /** Los widgets de un campo del formulario de la página (no los de un diálogo o un drawer). */
  function fieldElementsOf(fieldId) {
    if (typeof document === 'undefined') return []
    // comparando el atributo, sin montar un selector con el id: nada que escapar
    return [...document.querySelectorAll('[data-field-id]')]
      .filter((el) => el.getAttribute('data-field-id') === String(fieldId))
      .filter((el) => !el.closest('oj-dialog, oj-drawer-popup, oj-sp-general-drawer-template, oj-sp-create-edit-drawer-template'))
  }

  /**
   * Marca los obligatorios vacíos como lo hace un formulario Redwood y lleva el foco al primero.
   *
   * El mensaje es el del propio componente: `validate()` corre su validador de obligatorio (el
   * `required` que ya pinta «Obligatorio» bajo el campo) y enseña su texto — «Introduzca un
   * valor.», en el idioma de JET —, igual que al salir de un campo vacío. Si un componente no se
   * da por inválido (su valor no ha llegado aún al widget), el mensaje va por `messagesCustom`.
   * Devuelve cuántos campos marcó.
   */
  async function showFieldErrors(fieldIds, fallbackMessage) {
    let first = null
    let marked = 0
    for (const fieldId of fieldIds || []) {
      for (const el of fieldElementsOf(fieldId)) {
        let invalid = false
        if (typeof el.validate === 'function') {
          try { invalid = (await el.validate()) === 'invalid' } catch (ignored) { invalid = false }
        }
        if (!invalid) {
          if ('messagesCustom' in el || typeof el.validate === 'function') {
            try {
              el.messagesCustom = [{ severity: 'error', summary: fallbackMessage || 'Enter a value.', detail: '' }]
            } catch (ignored) { /* no es un componente JET */ }
          } else {
            // un campo que no es un componente JET (los chips de un @Searchable): el mensaje lo
            // pinta su CSS (.mateu-field-error + data-error) hasta que se vuelva a tocar
            el.setAttribute('data-error', fallbackMessage || 'Enter a value.')
            el.classList.add('mateu-field-error')
          }
        }
        marked++
        if (!first) first = el
      }
    }
    if (first) {
      try { first.scrollIntoView({ block: 'center' }) } catch (ignored) { /* jsdom */ }
      const input = first.querySelector && first.querySelector('input, textarea, [tabindex="0"]')
      try { (input || first).focus() } catch (ignored) { /* sin caja */ }
    }
    return marked
  }

  /** Quita las marcas de error de los campos que no son componentes JET (ver showFieldErrors). */
  function clearFieldErrorMarks(fieldId) {
    if (typeof document === 'undefined') return
    for (const el of document.querySelectorAll('.mateu-field-error')) {
      if (fieldId == null || el.getAttribute('data-field-id') === String(fieldId)) {
        el.classList.remove('mateu-field-error')
        el.removeAttribute('data-error')
      }
    }
  }

  /** Al editar un campo marcado, su mensaje propio se va (el del validador lo gestiona JET). */
  function clearFieldError(element) {
    if (element && Array.isArray(element.messagesCustom) && element.messagesCustom.length) {
      element.messagesCustom = []
    }
  }

  let guidedProcessGuarded = false

  /**
   * El guided process (oj-sp-guided-process) avanza SOLO al pulsar Continue o un paso del rail,
   * antes de saber si Mateu deja salir del paso: sus eventos spBeforeNext/spBeforeStepNavigate se
   * pueden cancelar, pero sólo en el momento, y las chains de VB corren después. Aquí se cancelan
   * siempre, en captura (no burbujean: la captura los ve igual), y el paso que se enseña lo manda
   * el servidor (current-step ← el paso del wire tras cada acción): si el paso no valida, el
   * proceso no se mueve. Las chains siguen recibiendo el evento y lanzan la acción.
   */
  function guardGuidedProcess() {
    if (guidedProcessGuarded || typeof document === 'undefined') return
    guidedProcessGuarded = true
    const cancel = (event) => {
      const target = event.target
      if (target && target.id === 'mateuWizardEl') event.preventDefault()
    }
    document.addEventListener('spBeforeNext', cancel, true)
    document.addEventListener('spBeforeStepNavigate', cancel, true)
    relaxGuidedProcessOverview()
  }

  /**
   * La consulta con la que oj-sp-guided-process decide si su OVERVIEW (la portada con un panel por
   * paso) va en columna: «(max-width: 767px), (max-height: 767px)». Pensada para un guided process a
   * pantalla completa, apila los paneles en cuanto la ventana es estrecha O baja — un portátil con la
   * ventana a menos de 768px de alto ya ve los pasos uno debajo de otro. Con app.css los paneles se
   * reparten el ancho del contenido (una fila; otra sólo si de verdad no caben), así que la columna
   * se reserva al teléfono (RDS: < 600px). Cualquier otra consulta pasa intacta.
   */
  const GUIDED_PROCESS_VERTICAL_QUERY = '(max-width: 767px), (max-height: 767px)'
  const GUIDED_PROCESS_PHONE_QUERY = '(max-width: 599px)'

  function guidedProcessMediaQuery(query) {
    const normalized = String(query == null ? '' : query).replace(/\s+/g, ' ').trim()
    return normalized === GUIDED_PROCESS_VERTICAL_QUERY ? GUIDED_PROCESS_PHONE_QUERY : query
  }

  /**
   * La rueda del ratón sobre el overview: el componente la convierte SIEMPRE en scroll horizontal
   * (preventDefault), porque en su diseño los paneles desbordan a lo ancho. Repartidos a lo ancho ya
   * no desbordan, y robarle la rueda a la página sólo impediría bajar (p.ej. a la 2ª fila). Se le
   * deja el gesto al componente sólo si su contenedor de pasos aún desborda a lo ancho.
   */
  function guidedProcessWheelIsNative(stepContainer) {
    if (!stepContainer) return false
    return stepContainer.scrollWidth <= stepContainer.clientWidth + 1
  }

  let guidedProcessOverviewRelaxed = false

  function relaxGuidedProcessOverview() {
    if (guidedProcessOverviewRelaxed || typeof window === 'undefined' || typeof document === 'undefined') return
    guidedProcessOverviewRelaxed = true
    if (typeof window.matchMedia === 'function') {
      const original = window.matchMedia.bind(window)
      window.matchMedia = (query) => original(guidedProcessMediaQuery(query))
    }
    document.addEventListener('wheel', (event) => {
      const target = event.target
      const wizard = target && target.closest ? target.closest('#mateuWizardEl') : null
      if (!wizard) return
      const steps = wizard.querySelector('.oj-sp-guided-process-step-container')
      if (steps && steps.contains(target) && guidedProcessWheelIsNative(steps)) event.stopPropagation()
    }, { capture: true, passive: true })
  }


  // Montaje de COMPONENTES WEB de terceros (átomo isElement): el wire trae la etiqueta, sus
  // atributos y la URL del módulo que la define. Vive fuera del reducer porque toca el DOM.
  //
  // Por qué no se puede pintar en la plantilla: VB no sabe escribir `<{name}>`. Y por qué no se
  // recrea en cada render: un componente web guarda estado que el servidor no conoce —el zoom y la
  // selección de un grafo, un layout ya calculado—, así que se crea UNA vez por hueco y en los
  // renders siguientes solo se le reescriben los atributos. Mismo criterio que el renderer web
  // compartido (libs/mateu elementRenderer).

  const loaded = {}

  // ── eventos del componente → acción en el servidor ─────────────────────────────────────────────
  // `Element.on` = { nombreDeEvento: actionId }. Es la vía de escape oficial (un grafo, un editor,
  // un plano de planta de terceros), así que su ida y vuelta tiene que funcionar entera: el evento
  // viaja como parámetro `event` de la acción, igual que en el renderer web compartido —el
  // `detail` de un CustomEvent, o las propiedades primitivas de cualquier otro evento—. La app
  // registra un sumidero (setElementEventSink) que sabe en qué superficie se ejecuta la acción;
  // sin sumidero (Node, tests) los eventos se ignoran.

  let sink = null
  let moduleBase = ''

  /** Base del backend Mateu (la constante mateuBaseUrl): un `import` RELATIVO lo sirve el backend,
   *  no la app VB — en VB alojado en Oracle o en vb-serve son orígenes distintos. '' = mismo origen. */
  function setElementModuleBase(base) {
    moduleBase = String(base || '').replace(/\/$/, '')
  }

  /** La URL de la que se carga el módulo de un Element. */
  function elementModuleUrl(importUrl, base = moduleBase) {
    if (!importUrl) return ''
    if (/^[a-z][a-z0-9+.-]*:/i.test(importUrl) || importUrl.startsWith('//')) return importUrl
    const root = String(base || '').replace(/\/+$/, '')
    return root ? root + (importUrl.startsWith('/') ? '' : '/') + importUrl : importUrl
  }

  /** La app VB registra aquí quién ejecuta la acción de un evento: (actionId, parameters, atom). */
  function setElementEventSink(fn) {
    sink = typeof fn === 'function' ? fn : null
  }

  /** El evento tal como viaja al servidor (mismo criterio que libs/mateu elementRenderer). */
  function serializeElementEvent(e) {
    if (e == null) return null
    if (typeof CustomEvent !== 'undefined' && e instanceof CustomEvent) return e.detail
    if (e.detail !== undefined && e.constructor && e.constructor.name === 'CustomEvent') return e.detail
    const out = {}
    for (const k in e) {
      const v = e[k]
      if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') out[k] = v
    }
    return out
  }

  /** Engancha UNA vez cada evento declarado; la acción se lee al dispararse (la del último render),
   *  así un re-render que cambia `on` no duplica listeners ni deja el actionId viejo. */
  function wireElementEvents(element, atom) {
    element.__mateuAtom = atom
    const wired = element.__mateuWired || (element.__mateuWired = {})
    for (const eventName of Object.keys(atom.on || {})) {
      if (wired[eventName]) continue
      wired[eventName] = true
      element.addEventListener(eventName, (e) => {
        const current = element.__mateuAtom || {}
        const actionId = (current.on || {})[eventName]
        if (!actionId || !sink) return
        sink(actionId, { event: serializeElementEvent(e) }, current)
      })
    }
  }

  // ── HTML con DATOS: saneado ────────────────────────────────────────────────────────────────────
  // El contenido escrito en la definición se confía tal cual; en cuanto `${…}` ha metido datos en
  // él se sanea (sin scripts, sin manejadores on…, sin URLs javascript:) — XSS almacenado. El
  // renderer web lo hace con DOMPurify; aquí no hay dependencias, así que un saneado por DOM con
  // las mismas reglas.
  const DROP_TAGS = /^(script|iframe|object|embed|link|meta|base|frame|frameset|noscript)$/i
  const URL_ATTRS = /^(href|src|xlink:href|action|formaction|background|poster)$/i

  function sanitizeElementHtml(html, doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || html == null) return html == null ? '' : String(html)
    const tpl = doc.createElement('template')
    tpl.innerHTML = String(html)
    const walk = (root) => {
      for (const el of [...root.querySelectorAll('*')]) {
        if (DROP_TAGS.test(el.tagName)) { el.remove(); continue }
        for (const attr of [...el.attributes]) {
          const name = attr.name
          const value = String(attr.value || '').replace(/[\s\u0000-\u001f]/g, '').toLowerCase()
          if (/^on/i.test(name)
            || (URL_ATTRS.test(name) && (value.startsWith('javascript:') || value.startsWith('vbscript:')
              || (value.startsWith('data:') && !value.startsWith('data:image/'))))
            || (name === 'srcdoc')) el.removeAttribute(name)
        }
      }
    }
    walk(tpl.content)
    return tpl.innerHTML
  }

  /**
   * Carga el módulo que define la etiqueta, una sola vez. El elemento se puede crear antes: los
   * componentes web se "actualizan" solos en cuanto su definición llega.
   *
   * Se inyecta un `<script type="module">` en vez de usar `import(url)` porque el build de VB
   * transpila el import dinámico a un `require()` de AMD, y requirejs se pone a resolver la URL
   * como si fuera un id de módulo suyo: la petición no llega a salir y el hueco se queda vacío
   * sin un solo error. Un script de módulo no lo puede reescribir nadie.
   */
  function ensureDefined(name, importUrl) {
    if (!importUrl || !name || name.indexOf('-') < 0) return
    if (loaded[importUrl]) return
    if (typeof customElements !== 'undefined' && customElements.get(name)) return
    if (typeof document === 'undefined') return
    loaded[importUrl] = true
    const script = document.createElement('script')
    script.type = 'module'
    script.src = importUrl
    // que un componente de terceros no cargue no puede tumbar la pantalla: el hueco se queda
    // vacío y el resto del contenido sigue ahí
    script.addEventListener('error', () => { loaded[importUrl] = false })
    document.head.appendChild(script)
  }

  function hydrate(element, atom) {
    for (const key of Object.keys(atom.attributes || {})) {
      // setAttribute sobre el que YA está, nunca sobre uno nuevo: el componente lo convierte en
      // cambio de propiedad y se repinta conservando lo suyo
      element.setAttribute(key, atom.attributes[key])
    }
    if (atom.style) element.setAttribute('style', atom.style)
    if (atom.cssClasses) element.setAttribute('class', atom.cssClasses)
    if (atom.content) {
      if (atom.asHtml) element.innerHTML = atom.dataInContent ? sanitizeElementHtml(atom.content) : atom.content
      else element.textContent = atom.content
    }
    wireElementEvents(element, atom)
  }

  /** Hidrata los huecos `.mateu-element` que haya en el documento. Devuelve cuántos quedaron
   *  montados, para que quien reintenta sepa si ya está. */
  function mountElements(atoms) {
    const byId = {}
    for (const atom of atoms || []) byId[atom.elementId] = atom
    let mounted = 0
    const holes = typeof document === 'undefined'
      ? [] : document.querySelectorAll('.mateu-element[data-element-id]')
    for (const hole of holes) {
      const atom = byId[hole.getAttribute('data-element-id')]
      if (!atom) continue
      ensureDefined(atom.name, elementModuleUrl(atom.importUrl))
      let element = hole.firstElementChild
      if (!element || element.tagName.toLowerCase() !== atom.name.toLowerCase()) {
        hole.textContent = ''
        element = document.createElement(atom.name)
        hole.appendChild(element)
      }
      hydrate(element, atom)
      mounted += 1
    }
    return mounted
  }

  /** Igual, pero esperando a que VB pinte: sus bindings se actualizan de forma ASÍNCRONA, así que
   *  al terminar la chain el hueco todavía no está en el DOM (la misma trampa que costó el foco
   *  del contenido en la accesibilidad). */
  function mountElementsSoon(atoms, frames = 12) {
    const pending = (atoms || []).filter((a) => a && a.isElement)
    if (!pending.length || typeof requestAnimationFrame === 'undefined') return
    let left = frames
    const tick = () => {
      if (mountElements(pending) >= pending.length) return
      left -= 1
      if (left > 0) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  /** Los átomos isElement de una proyección de bloques (los que hay que montar). */
  function elementAtomsOf(blocks) {
    const out = []
    for (const block of blocks || []) {
      for (const atom of block.items || []) if (atom && atom.isElement) out.push(atom)
    }
    return out
  }

  /** Los átomos isElement del CONTENIDO de un foldout (overview + cada panel): un Element en un
   *  panel (p.ej. la tabla «In other systems» de una reserva, HTML del servidor) se quedaba sin
   *  montar — el panel salía en blanco — porque sólo se montaban los del contenido del host. */
  function foldoutElementAtomsOf(content) {
    if (!content) return []
    const out = elementAtomsOf((content.overview || {}).blocks)
    for (const panel of content.panels || []) out.push(...elementAtomsOf(panel && panel.blocks))
    return out
  }




  // BANDEJA DE NOTIFICACIONES y TOASTS CON DESHACER en la shell VB.
  //
  // Bandeja (NotificationsSupplier del App): la campana de la cabecera con el número de no leídas
  // abre un oj-popup con un oj-list-view; activar una entrada la marca leída y navega a su ruta, y
  // «Mark all read» las marca todas. Habla con las acciones app-level de siempre
  // (_notifications-list / _notifications-read, route '' + serverSideType del App).
  //
  // Deshacer (Message.undoable → MessageDto.undo*): oj-sp-messages-toast no admite acciones, así que
  // esos mensajes salen por el oj-messages de JET (display="notification") con un oj-message cuyo
  // slot «detail» — el que JET reserva para enlaces y botones — lleva el oj-button «Undo». Se monta
  // desde applyDomEffects (fuera de Knockout: data-oj-binding-provider="none") y se quita de la
  // lista de toasts normales, así que ninguna chain lo pinta dos veces.

  /** La lista _notifications de la respuesta (Data del servidor), o null. */
  function notificationListOf(increment) {
    for (const fr of (increment && increment.fragments) || []) {
      if (fr && fr.data && Array.isArray(fr.data._notifications)) return fr.data._notifications
    }
    return null
  }

  let notificationsProviderFactory = null
  function setNotificationsProviderFactory(f) { notificationsProviderFactory = f }

  /** El modelo de la campana: no leídas (y su insignia), y las entradas listas para la lista. */
  function notificationsOf(list) {
    const items = (list || []).map((n, i) => ({
      _rowNumber: i,
      id: String(n.id),
      title: n.title || '',
      text: n.text || '',
      when: n.when || '',
      route: n.route || '',
      unread: n.unread !== false,
      titleClass: 'oj-typography-body-md' + (n.unread !== false ? ' oj-typography-bold' : ''),
    }))
    const unread = items.filter((n) => n.unread).length
    return {
      enabled: true,
      unread,
      badge: unread > 9 ? '9+' : String(unread),
      hasUnread: unread > 0,
      label: unread ? chromeText('notificationsUnread', { n: unread }) : chromeText('notifications'),
      empty: items.length === 0,
      items,
      provider: notificationsProviderFactory ? notificationsProviderFactory(items) : null,
    }
  }

  /** Pide la lista (o marca leídas `ids` — una lista, o 'all' — y pide la lista). */
  async function fetchNotifications(base, serverSideType, appState, ids) {
    const increment = await callMateu(base, {
      route: '',
      actionId: ids ? '_notifications-read' : '_notifications-list',
      componentState: {},
      parameters: ids ? { ids } : {},
      serverSideType: serverSideType || undefined,
      appState: appState || {},
    })
    return notificationsOf(notificationListOf(increment) || [])
  }

  // ── toasts con «Undo» ─────────────────────────────────────────────────────────────────────────
  let undoSink = null
  function setUndoSink(fn) { undoSink = typeof fn === 'function' ? fn : null }

  /** Separa de los toasts los que se pueden deshacer (in situ: las chains leen la misma lista). */
  function takeUndoToasts(effects) {
    if (!effects || !Array.isArray(effects.toasts)) return []
    const undo = effects.toasts.filter((t) => t && t.undoActionId)
    if (undo.length) {
      const rest = effects.toasts.filter((t) => !(t && t.undoActionId))
      effects.toasts.splice(0, effects.toasts.length, ...rest)
    }
    return undo
  }

  /** Un Message de error o aviso NO es un toast en Redwood: oj-sp-messages-toast sólo admite
   *  type="acknowledgement" (confirmaciones). Va al oj-sp-messages-banner de la shell como
   *  notificación de VB (Actions.fireNotificationEvent → vbNotification → showNotificationMessage),
   *  persistente hasta que se cierra. null para el resto, que siguen siendo toasts. */
  function bannerNotificationOf(toast) {
    if (!toast || (toast.variant !== 'error' && toast.variant !== 'warning')) return null
    return { summary: toast.text || '', type: toast.variant, displayMode: 'persist' }
  }

  /** El objeto message de oj-message para un toast con deshacer. */
  function undoMessageOf(toast) {
    return {
      severity: toast.variant === 'error' ? 'error' : toast.variant === 'warning' ? 'warning' : 'confirmation',
      summary: toast.text || '',
      autoTimeout: 10000,
      closeAffordance: 'defaults',
    }
  }

  function showUndoToasts(toasts, doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || !toasts || !toasts.length) return
    let host = doc.getElementById('mateuUndoMessages')
    if (!host) {
      const wrap = doc.createElement('div')
      wrap.setAttribute('data-oj-binding-provider', 'none')
      host = doc.createElement('oj-messages')
      host.id = 'mateuUndoMessages'
      host.setAttribute('display', 'notification')
      host.setAttribute('position', '{"my": {"vertical": "bottom", "horizontal": "center"}, "at": {"vertical": "bottom", "horizontal": "center"}, "of": "window"}')
      wrap.appendChild(host)
      doc.body.appendChild(wrap)
    }
    for (const toast of toasts) {
      const msg = doc.createElement('oj-message')
      msg.message = undoMessageOf(toast)
      const detail = doc.createElement('div')
      detail.setAttribute('slot', 'detail')
      const button = doc.createElement('oj-button')
      button.setAttribute('chroming', 'borderless')
      button.className = 'mateu-undo-button'
      button.textContent = toast.undoLabel || chromeText('undo')
      button.addEventListener('ojAction', () => {
        if (undoSink) undoSink(toast.undoActionId, toast.undoParameters || {}, {})
        if (typeof msg.close === 'function') msg.close()
      })
      detail.appendChild(button)
      msg.appendChild(detail)
      // cerrado (por el usuario o por tiempo), fuera del DOM
      msg.addEventListener('ojClose', () => { if (msg.parentNode) msg.parentNode.removeChild(msg) })
      host.appendChild(msg)
    }
  }




  // Efectos de DOM que el reducer (puro) solo DESCRIBE: descargar un fichero y abrir una URL en
  // otra pestaña. Antes `effects.download` se calculaba y nadie lo leía — el CSV de un listado o
  // el PDF de un folio llegaban al navegador y se perdían. Cada chain que reduce un increment
  // llama a applyDomEffects(reg.effects) justo después: es el ÚNICO sitio donde estos efectos
  // tocan el documento.
  //
  // `env` (window por defecto) se inyecta para poder probarlo en Node sin DOM.

  /** DownloadFile del wire → { filename, mimeType, base64Content } o null si no hay contenido. */
  function fileDownloadOf(data) {
    if (!data || typeof data !== 'object' || !data.base64Content) return null
    return {
      filename: data.filename || 'export',
      mimeType: data.mimeType || 'application/octet-stream',
      base64Content: String(data.base64Content),
    }
  }

  function base64ToBytes(b64, atobFn = globalThis.atob) {
    const bin = atobFn(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return bytes
  }

  /** Descarga un DownloadFile: Blob + <a download> anclado al body (Safari/Firefox ignoran el
   *  click de un enlace suelto) y el object URL se libera DESPUÉS (revocarlo en el mismo tick
   *  cancela la descarga en Firefox). */
  function triggerDownload(data, env = globalThis) {
    const file = fileDownloadOf(data)
    if (!file || !env.document) return false
    const blob = new env.Blob([base64ToBytes(file.base64Content, env.atob)], { type: file.mimeType })
    const url = env.URL.createObjectURL(blob)
    const a = env.document.createElement('a')
    a.href = url
    a.download = file.filename
    a.rel = 'noopener'
    a.style.display = 'none'
    env.document.body.appendChild(a)
    a.click()
    a.remove()
    env.setTimeout(() => env.URL.revokeObjectURL(url), 1000)
    return true
  }

  // lo que la app quiere hacer con el registro recién reducido (las reglas del cliente toman de ahí
  // su contexto: reglas + estado del host)
  let afterReduce = null
  function setAfterReduceHook(fn) { afterReduce = typeof fn === 'function' ? fn : null }

  /** Aplica los efectos de DOM de una reducción. Devuelve cuántas descargas ha lanzado. */
  function applyDomEffects(effects, reg, env = globalThis) {
    if (reg && reg.contexts && afterReduce) afterReduce(reg)
    if (!effects) return 0
    let n = 0
    for (const d of effects.downloads || (effects.download ? [effects.download] : []))
      if (triggerDownload(d, env)) n++
    // los toasts con «Undo» salen por el oj-message de JET (notify.mjs), no por el toast normal
    const undo = takeUndoToasts(effects)
    if (undo.length && env && env.document) showUndoToasts(undo, env.document)
    // the Announce command: through the live regions installAnnouncer created at boot (polite, or
    // assertive for what must not be missed). `env.mateuAnnounce` is the test seam.
    const say = (env && env.mateuAnnounce) || announce
    for (const a of effects.announcements || []) say(a.text, { politeness: a.assertive ? 'assertive' : 'polite' })
    return n
  }



  // Campos de CAPTURA de un formulario (fichero, imagen, firma, cámara) para los que JET/Redwood no
  // trae componente: no hay pad de firma ni cámara en oj-*/oj-sp-*, y oj-file-picker sólo entrega
  // File (el valor de Mateu es un data URI que viaja en el estado, sin endpoint de subida — el mismo
  // contrato que el renderer web). Así que un elemento PROPIO y mínimo, `<mateu-capture-field>`:
  // los botones son oj-button de verdad, el lienzo/vídeo/imagen van con los tokens de Redwood, y el
  // valor sale como `valueChanged` con { value, updatedFrom: 'internal' } — la forma del evento de
  // un componente JET, así que las chains de cambio de campo (hostInputChanged, mateuFieldEdited…)
  // lo tratan como uno más.
  //
  //   <mateu-capture-field mode="signature|camera|file|image" accept="…" readonly value="data:…">
  //
  // Lo puro (cómo se lee un fichero, qué texto enseña) está exportado y probado en Node; lo de DOM
  // se define una vez por documento (defineCaptureField).

  /** Only what an <img> may load: a data:image URI (what capture fields store), http(s) or a relative
   *  path. Anything else (javascript:, other data: types…) shows nothing. */
  function safeImageSrc(value) {
    const v = String(value || '').trim()
    if (/^data:image\/[a-z0-9.+-]+[;,]/i.test(v)) return v
    if (/^https?:\/\//i.test(v)) return v
    if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return ''
    return v
  }

  const CAPTURE_KEYS = ['clear', 'accept', 'signAgain', 'remove', 'take', 'retake', 'upload', 'replace', 'noCamera', 'empty', 'start', 'signHere']

  /** Los textos de los campos de captura en `lang` (catálogo de la interfaz, i18n.mjs). */
  function captureTexts(lang) {
    const l = chromeLanguage(lang)
    return Object.fromEntries(CAPTURE_KEYS.map((k) => [k, chromeText('capture' + k[0].toUpperCase() + k.slice(1), null, l)]))
  }

  /** ¿El valor es una imagen que se puede enseñar? (data URI de imagen o URL corriente) */
  function isImageValue(value) {
    const v = String(value || '')
    return /^data:image\//i.test(v) || /^(https?:)?\/\/|^\//.test(v)
  }

  /** Un nombre legible para un data URI de fichero (no lo lleva: se enseña el tipo y el tamaño). */
  function describeFileValue(value) {
    const v = String(value || '')
    const m = v.match(/^data:([^;,]+)?(;base64)?,(.*)$/i)
    if (!m) return v ? v.split('/').pop() : ''
    const bytes = m[2] ? Math.floor((m[3].length * 3) / 4) : decodeURIComponent(m[3]).length
    const kb = bytes < 1024 ? bytes + ' B' : (bytes / 1024).toFixed(bytes < 10240 ? 1 : 0) + ' KB'
    return (m[1] || 'file') + ' · ' + kb
  }

  /** Define `<mateu-capture-field>` en `win` (una vez). */
  function defineCaptureField(win = typeof window !== 'undefined' ? window : null) {
    if (!win || !win.customElements || win.customElements.get('mateu-capture-field')) return
    const doc = win.document
    const lang = (doc.documentElement.getAttribute('lang') || win.navigator.language || 'en')
    const t = captureTexts(lang)

    const button = (label, chroming, onAction) => {
      const b = doc.createElement('oj-button')
      // un componente JET creado fuera de Knockout espera un «binding provider» que nunca llega y
      // se queda oculto (visibility:hidden hasta oj-complete): `none` le dice que no lo hay
      b.setAttribute('data-oj-binding-provider', 'none')
      b.setAttribute('chroming', chroming || 'outlined')
      b.className = 'oj-button-sm oj-sm-margin-2x-end'
      b.textContent = label
      b.addEventListener('ojAction', (e) => { e.stopPropagation(); onAction() })
      return b
    }
    const readFile = (file) => new Promise((resolve, reject) => {
      const reader = new win.FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })

    class MateuCaptureField extends win.HTMLElement {
      static get observedAttributes() { return ['value', 'readonly', 'mode', 'accept'] }
      connectedCallback() { this.render() }
      disconnectedCallback() { this.stopCamera() }
      attributeChangedCallback() { if (this.isConnected && !this.busy) this.render() }
      get value() { return this.getAttribute('value') || '' }
      set value(v) { if (v == null || v === '') this.removeAttribute('value'); else this.setAttribute('value', String(v)) }

      emit(value) {
        this.busy = true
        this.value = value
        this.busy = false
        this.dispatchEvent(new win.CustomEvent('valueChanged', {
          detail: { value: value || null, previousValue: null, updatedFrom: 'internal' }, bubbles: true }))
        this.render()
      }

      stopCamera() {
        if (this.stream) { this.stream.getTracks().forEach((track) => track.stop()); this.stream = null }
      }

      pickFile(capture) {
        const input = doc.createElement('input')
        input.type = 'file'
        const mode = this.getAttribute('mode')
        input.accept = this.getAttribute('accept') || (mode === 'file' ? '' : 'image/*')
        if (capture) input.setAttribute('capture', 'environment')
        input.addEventListener('change', async () => {
          const file = input.files && input.files[0]
          if (file) this.emit(await readFile(file))
        })
        input.click()
      }

      render() {
        const mode = this.getAttribute('mode') || 'file'
        const readonly = this.hasAttribute('readonly') && this.getAttribute('readonly') !== 'false'
        const value = this.value
        this.stopCamera()
        this.textContent = ''
        this.classList.add('mateu-capture-field')
        const box = doc.createElement('div')
        box.className = 'mateu-capture-box'
        const actions = doc.createElement('div')
        actions.className = 'oj-sm-margin-2x-top'

        if (value && (mode !== 'file' || isImageValue(value))) {
          const img = doc.createElement('img')
          // the guard inline, where the value is assigned: only data:image, http(s) or a path with no
          // scheme reach the src (javascript:, other data: types show nothing) — see safeImageSrc
          const src = String(value).trim()
          if (/^data:image\/[a-z0-9.+-]+[;,]/i.test(src) || /^https?:\/\//i.test(src) || !/^[a-z][a-z0-9+.-]*:/i.test(src)) {
            img.src = src
          }
          img.alt = ''
          img.className = 'mateu-capture-preview' + (mode === 'signature' ? ' mateu-capture-signature' : '')
          box.appendChild(img)
        } else if (value) {
          const span = doc.createElement('span')
          span.className = 'oj-typography-body-md'
          span.textContent = describeFileValue(value)
          box.appendChild(span)
        }

        if (!readonly) {
          if (mode === 'signature' && !value) {
            this.renderPad(box, actions)
          } else if (mode === 'camera' && !value) {
            actions.appendChild(button(t.start, 'callToAction', () => this.openCamera(box, actions)))
            actions.appendChild(button(t.upload, 'outlined', () => this.pickFile(true)))
          } else if (!value) {
            const empty = doc.createElement('span')
            empty.className = 'oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-end'
            empty.textContent = t.empty
            box.appendChild(empty)
            actions.appendChild(button(t.upload, 'outlined', () => this.pickFile(false)))
          } else {
            const again = mode === 'signature' ? t.signAgain : mode === 'camera' ? t.retake : t.replace
            actions.appendChild(button(again, 'outlined', () => {
              if (mode === 'signature' || mode === 'camera') this.emit(null)
              else this.pickFile(false)
            }))
            actions.appendChild(button(t.remove, 'borderless', () => this.emit(null)))
          }
        } else if (!value) {
          const dash = doc.createElement('span')
          dash.textContent = '—'
          box.appendChild(dash)
        }
        this.appendChild(box)
        if (actions.childNodes.length) this.appendChild(actions)
      }

      renderPad(box, actions) {
        const canvas = doc.createElement('canvas')
        canvas.className = 'mateu-capture-pad'
        canvas.width = 560
        canvas.height = 180
        canvas.setAttribute('aria-label', t.signHere)
        canvas.setAttribute('role', 'img')
        const ctx = canvas.getContext('2d')
        ctx.lineWidth = 2.2
        ctx.lineCap = 'round'
        ctx.strokeStyle = '#161513'
        let drawing = false
        let inked = false
        const at = (e) => {
          const r = canvas.getBoundingClientRect()
          return [(e.clientX - r.left) * (canvas.width / r.width), (e.clientY - r.top) * (canvas.height / r.height)]
        }
        canvas.addEventListener('pointerdown', (e) => {
          drawing = true; inked = true
          canvas.setPointerCapture(e.pointerId)
          const [x, y] = at(e); ctx.beginPath(); ctx.moveTo(x, y)
        })
        canvas.addEventListener('pointermove', (e) => {
          if (!drawing) return
          const [x, y] = at(e); ctx.lineTo(x, y); ctx.stroke()
        })
        const stop = () => { drawing = false }
        canvas.addEventListener('pointerup', stop)
        canvas.addEventListener('pointercancel', stop)
        box.appendChild(canvas)
        actions.appendChild(button(t.accept, 'callToAction', () => { if (inked) this.emit(canvas.toDataURL('image/png')) }))
        actions.appendChild(button(t.clear, 'outlined', () => { ctx.clearRect(0, 0, canvas.width, canvas.height); inked = false }))
      }

      async openCamera(box, actions) {
        const media = win.navigator.mediaDevices
        if (!media || !media.getUserMedia) { this.pickFile(true); return }
        try {
          this.stream = await media.getUserMedia({ video: { facingMode: 'environment' } })
        } catch (e) {
          box.textContent = t.noCamera
          return
        }
        const video = doc.createElement('video')
        video.className = 'mateu-capture-preview'
        video.autoplay = true
        video.playsInline = true
        video.muted = true
        video.srcObject = this.stream
        box.textContent = ''
        box.appendChild(video)
        actions.textContent = ''
        actions.appendChild(button(t.take, 'callToAction', () => {
          const canvas = doc.createElement('canvas')
          canvas.width = video.videoWidth || 640
          canvas.height = video.videoHeight || 480
          canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
          this.stopCamera()
          this.emit(canvas.toDataURL('image/jpeg', 0.85))
        }))
      }
    }
    win.customElements.define('mateu-capture-field', MateuCaptureField)
  }

  /** A colour value as a #rrggbb string (what a native colour input takes), '' when it is not one. */
  function hexColorOf(value) {
    const v = String(value == null ? '' : value).trim()
    if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase()
    const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(v)
    if (short) return ('#' + short[1] + short[1] + short[2] + short[2] + short[3] + short[3]).toLowerCase()
    const rgb = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i.exec(v)
    if (rgb) return '#' + [rgb[1], rgb[2], rgb[3]].map((n) => Math.min(255, +n).toString(16).padStart(2, '0')).join('')
    return ''
  }

  /**
   * `<mateu-color-field value="#3a7bd5" readonly>`: a colour FIELD. JET's oj-color-spectrum is an
   * inline palette over oj.Color objects, not a form field with a string value — the wire carries a
   * string — so: a swatch (the platform colour picker) beside an oj-input-text with the hex code,
   * and the same `valueChanged` contract as mateu-capture-field.
   */
  function defineColorField(win = typeof window !== 'undefined' ? window : null) {
    if (!win || !win.customElements || win.customElements.get('mateu-color-field')) return
    const doc = win.document
    class MateuColorField extends win.HTMLElement {
      static get observedAttributes() { return ['value', 'readonly'] }
      connectedCallback() { this.render() }
      attributeChangedCallback() { if (this.isConnected && !this.busy) this.render() }
      get value() { return this.getAttribute('value') || '' }
      set value(v) { if (v == null || v === '') this.removeAttribute('value'); else this.setAttribute('value', String(v)) }
      emit(value) {
        this.busy = true
        this.value = value
        this.busy = false
        this.dispatchEvent(new win.CustomEvent('valueChanged', {
          detail: { value: value || null, previousValue: null, updatedFrom: 'internal' }, bubbles: true }))
        this.render()
      }
      render() {
        const readonly = this.hasAttribute('readonly') && this.getAttribute('readonly') !== 'false'
        const hex = hexColorOf(this.value)
        this.textContent = ''
        this.classList.add('mateu-color-field')
        const swatch = doc.createElement('input')
        swatch.type = 'color'
        swatch.className = 'mateu-color-swatch'
        swatch.value = hex || '#000000'
        swatch.disabled = readonly
        swatch.setAttribute('aria-label', chromeText('colourPicker', { label: this.getAttribute('aria-label') || '' }))
        swatch.addEventListener('change', () => this.emit(swatch.value))
        const code = doc.createElement('span')
        code.className = 'oj-typography-body-md mateu-color-code'
        code.textContent = this.value || '—'
        this.appendChild(swatch)
        this.appendChild(code)
      }
    }
    win.customElements.define('mateu-color-field', MateuColorField)
  }


  // REGLAS DEL CLIENTE (@Hidden(expr), @Disabled(expr), RuleSupplier, @Rule) y campos dependientes
  // en el navegador: sin ida y vuelta al servidor, un campo se oculta, se deshabilita o cambia de
  // valor según otro. Mismo contrato que el renderer web (libs/mateu mateu-component.applyRules):
  // cada regla tiene un `filter` (expresión); si se cumple, su acción escribe en el estado
  // (SetStateValue) o en data (SetDataValue: `campo.hidden`, `campo.disabled`, `campo.required`…),
  // lanza una acción (RunAction) o para (result Stop).
  //
  // Por qué un evaluador propio: el web usa `new Function`, y VB alojado en Oracle corre con una CSP
  // sin 'unsafe-eval' (es la razón de que todo el bridge precalcule flags). Así que un parser de
  // expresiones de JS pequeño y SIN eval: literales, state/data/appState/appData, acceso a
  // propiedad, ! - + * / % < <= > >= == != === !== && || ?: y unos pocos métodos de string/array.
  // Lo que no entiende devuelve undefined (la regla no se cumple) en vez de romper la pantalla.

  const METHODS = {
    includes: (t, a) => (t != null && t.includes ? t.includes(a[0]) : false),
    startsWith: (t, a) => String(t == null ? '' : t).startsWith(a[0]),
    endsWith: (t, a) => String(t == null ? '' : t).endsWith(a[0]),
    indexOf: (t, a) => (t != null && t.indexOf ? t.indexOf(a[0]) : -1),
    toLowerCase: (t) => String(t == null ? '' : t).toLowerCase(),
    toUpperCase: (t) => String(t == null ? '' : t).toUpperCase(),
    trim: (t) => String(t == null ? '' : t).trim(),
    toString: (t) => String(t),
  }

  function tokenize(src) {
    const tokens = []
    let i = 0
    while (i < src.length) {
      const c = src[i]
      if (/\s/.test(c)) { i++; continue }
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1]))) {
        let j = i
        while (j < src.length && /[0-9.]/.test(src[j])) j++
        tokens.push({ t: 'num', v: Number(src.slice(i, j)) }); i = j; continue
      }
      if (c === '"' || c === "'") {
        let j = i + 1; let s = ''
        while (j < src.length && src[j] !== c) { if (src[j] === '\\') { s += src[j + 1]; j += 2 } else s += src[j++] }
        tokens.push({ t: 'str', v: s }); i = j + 1; continue
      }
      if (/[A-Za-z_$]/.test(c)) {
        let j = i
        while (j < src.length && /[A-Za-z0-9_$]/.test(src[j])) j++
        tokens.push({ t: 'id', v: src.slice(i, j) }); i = j; continue
      }
      const three = src.slice(i, i + 3); const two = src.slice(i, i + 2)
      if (three === '===' || three === '!==') { tokens.push({ t: 'op', v: three }); i += 3; continue }
      if (['==', '!=', '<=', '>=', '&&', '||'].includes(two)) { tokens.push({ t: 'op', v: two }); i += 2; continue }
      if ('+-*/%<>!?:.,()[]'.includes(c)) { tokens.push({ t: 'op', v: c }); i++; continue }
      throw new Error('carácter inesperado ' + c)
    }
    return tokens
  }

  /** Evalúa una expresión de regla contra `scope` ({ state, data, appState, appData, component }). */
  function evaluateExpression(expr, scope = {}) {
    if (expr == null) return undefined
    const src = String(expr).trim()
    if (src === '') return undefined
    let tokens
    try { tokens = tokenize(src) } catch (e) { return undefined }
    let p = 0
    const peek = (v) => tokens[p] && tokens[p].v === v && tokens[p].t === 'op'
    const take = (v) => { if (peek(v)) { p++; return true } return false }
    const ternary = () => {
      const c = or()
      if (take('?')) { const a = ternary(); take(':'); const b = ternary(); return c ? a : b }
      return c
    }
    const or = () => { let l = and(); while (take('||')) { const r = and(); l = l || r } return l }
    const and = () => { let l = eq(); while (take('&&')) { const r = eq(); l = l && r } return l }
    const eq = () => {
      let l = rel()
      for (;;) {
        // eslint-disable-next-line eqeqeq
        if (take('===')) l = l === rel(); else if (take('!==')) l = l !== rel()
        // eslint-disable-next-line eqeqeq
        else if (take('==')) l = l == rel(); else if (take('!=')) l = l != rel()
        else return l
      }
    }
    const rel = () => {
      let l = add()
      for (;;) {
        if (take('<=')) l = l <= add(); else if (take('>=')) l = l >= add()
        else if (take('<')) l = l < add(); else if (take('>')) l = l > add()
        else return l
      }
    }
    const add = () => {
      let l = mul()
      for (;;) { if (take('+')) l = l + mul(); else if (take('-')) l = l - mul(); else return l }
    }
    const mul = () => {
      let l = unary()
      for (;;) {
        if (take('*')) l = l * unary(); else if (take('/')) l = l / unary(); else if (take('%')) l = l % unary()
        else return l
      }
    }
    const unary = () => {
      if (take('!')) return !unary()
      if (take('-')) return -unary()
      if (take('+')) return +unary()
      return postfix()
    }
    const postfix = () => {
      let v = primary()
      for (;;) {
        if (take('.')) {
          const tok = tokens[p++]
          const name = tok && tok.v
          if (peek('(')) {
            take('(')
            const args = []
            while (!peek(')') && p < tokens.length) { args.push(ternary()); take(',') }
            take(')')
            // sólo métodos conocidos de string/array: nada de llamar a lo que traiga el estado
            v = Object.prototype.hasOwnProperty.call(METHODS, name) ? METHODS[name](v, args) : undefined
          } else {
            v = v == null ? undefined : v[name]
          }
        } else if (take('[')) {
          const k = ternary(); take(']'); v = v == null ? undefined : v[k]
        } else return v
      }
    }
    const primary = () => {
      const tok = tokens[p++]
      if (!tok) return undefined
      if (tok.t === 'num' || tok.t === 'str') return tok.v
      if (tok.t === 'op' && tok.v === '(') { const v = ternary(); take(')'); return v }
      if (tok.t === 'op' && tok.v === '[') {
        const arr = []
        while (!peek(']') && p < tokens.length) { arr.push(ternary()); take(',') }
        take(']'); return arr
      }
      if (tok.t === 'id') {
        if (tok.v === 'true') return true
        if (tok.v === 'false') return false
        if (tok.v === 'null') return null
        if (tok.v === 'undefined') return undefined
        return scope[tok.v]
      }
      return undefined
    }
    try {
      const v = ternary()
      return p === tokens.length ? v : undefined
    } catch (e) {
      return undefined
    }
  }

  /** Una plantilla `${…}`: si es UNA expresión entera devuelve su valor con tipo; si mezcla texto,
   *  el texto con cada `${…}` sustituido; sin `${` es una expresión. */
  function evaluateTemplate(tmpl, scope = {}) {
    const s = String(tmpl == null ? '' : tmpl)
    if (s.indexOf('${') < 0) return evaluateExpression(s, scope)
    const whole = s.match(/^\$\{([^}]*)\}$/)
    if (whole) return evaluateExpression(whole[1], scope)
    return s.replace(/\$\{([^}]*)\}/g, (_, e) => { const v = evaluateExpression(e, scope); return v == null ? '' : String(v) })
  }

  /**
   * Ejecuta las reglas sobre `scope` → { state, data, actions }: los VALORES que cada regla deja en
   * el estado / en data (`campo` o `campo.atributo`) y las acciones a lanzar. Puro: no toca nada.
   */
  function computeRules(rules, scope = {}) {
    const state = {}
    const data = {}
    const actions = []
    const view = () => ({ ...scope, state: { ...(scope.state || {}), ...state }, data: { ...(scope.data || {}), ...data } })
    for (const rule of rules || []) {
      if (!rule) continue
      const filter = rule.filter == null || rule.filter === '' ? true : evaluateExpression(rule.filter, view())
      if (!filter) continue
      const action = rule.action
      if (action === 'SetStateValue' || action === 'SetDataValue') {
        const target = action === 'SetStateValue' ? state : data
        const value = rule.expression ? evaluateTemplate(rule.expression, view()) : rule.value
        for (const name of String(rule.fieldName || '').split(',').map((x) => x.trim()).filter(Boolean)) {
          const attr = rule.fieldAttribute && rule.fieldAttribute !== 'none' ? rule.fieldAttribute : null
          target[attr ? name + '.' + attr : name] = value
        }
      } else if (action === 'RunAction' && rule.actionId) {
        actions.push(rule.actionId)
      }
      if (rule.result === 'Stop') break
    }
    return { state, data, actions }
  }

  /** Los atributos de campo que la plantilla tiene que reflejar: { fieldId: { hidden, disabled… } }. */
  function fieldFlagsOf(data) {
    const out = {}
    for (const key of Object.keys(data || {})) {
      const m = key.match(/^(.+)\.(hidden|disabled|required|readonly|readOnly)$/)
      if (!m) continue
      const attr = m[2] === 'readOnly' ? 'readonly' : m[2]
      out[m[1]] = { ...(out[m[1]] || {}), [attr]: !!data[key] }
    }
    return out
  }

  /** La acción que dispara cambiar `fieldId` (@Trigger OnValueChange con su condición), o null. */
  function valueChangeActionOf(ctx, fieldId, state) {
    const triggers = (ctx && ctx.tree && ctx.tree.triggers) || []
    const t = triggers.find((x) => x && x.type === 'OnValueChange' && x.actionId
      && (!x.propertyName || x.propertyName === fieldId))
    if (!t) return null
    if (t.condition && !evaluateExpression(t.condition, { state: state || {}, data: (ctx && ctx.data) || {} })) return null
    return t.actionId
  }

  // ── en el navegador: aplicar las reglas a los campos pintados ────────────────────────────────
  //
  // Los campos se pintan desde 22 copias de plantilla (átomos, formulario genérico, drawer, isla…):
  // en vez de un flag más en cada una, las reglas actúan sobre el DOM por `data-field-id`, que
  // todas llevan. El contexto (reglas + estado) lo fija cada reducción (setRulesContext); los
  // cambios de campo (`valueChanged` de JET, interno) actualizan el estado vivo y re-evalúan; y,
  // como VB re-pinta de forma asíncrona, se re-aplica unos frames después de cada render.

  // Rules live on every SURFACE, not only the host: an island (an embedded mediator), the open
  // drawer or dialog. Each surface's rules act on the fields painted in that surface — the DOM
  // tells them apart (surfaceOfElement): the overlay panels by their ids, the island by its
  // data-mateu-surface wrapper, the rest is the host. A field of the same name in the drawer is not
  // hidden by the host's rule.
  let surfaces = [] // [{ surface: 'host'|'island'|'overlay', ctx, appState, liveState }]
  let runActionSink = null

  /** Quién ejecuta una RunAction de regla (la shell reusa el sumidero de los Element). */
  function setRuleActionSink(fn) { runActionSink = typeof fn === 'function' ? fn : null }

  const hasRules = (ctx) => !!(ctx && ctx.tree && (ctx.tree.rules || []).length)

  /** The surfaces whose rules apply, from a reduced registry: the host, its islands and the
   *  overlay on top. Pure. */
  function ruleSurfacesOf(reg, hostId = '__root__') {
    const out = []
    const contexts = (reg && reg.contexts) || {}
    if (hasRules(contexts[hostId])) out.push({ surface: 'host', ctx: contexts[hostId] })
    for (const [id, ctx] of Object.entries(contexts)) {
      if (id !== hostId && ctx && ctx.kind === 'island' && hasRules(ctx)) out.push({ surface: 'island', ctx })
    }
    const stack = (reg && reg.stack) || []
    const top = stack.length ? contexts[stack[stack.length - 1]] : null
    if (hasRules(top)) out.push({ surface: 'overlay', ctx: top })
    return out
  }

  /** Which surface an element is painted in. */
  function surfaceOfElement(el) {
    if (!el || !el.closest) return 'host'
    if (el.closest('#mateuDrawerPanel, #mateuModal, #mateuRowDetailPanel')) return 'overlay'
    if (el.closest('[data-mateu-surface="island"]')) return 'island'
    return 'host'
  }

  /** The host only (kept for callers that set one context). */
  function setRulesContext(ctx, appState) {
    setRuleSurfaces(hasRules(ctx) ? [{ surface: 'host', ctx }] : [], appState)
  }
  /** Every surface of a reduced registry (the reduce hook calls this). */
  function setRulesContexts(reg, appState) {
    setRuleSurfaces(ruleSurfacesOf(reg), appState)
  }
  function setRuleSurfaces(list, appState) {
    const before = new Map(surfaces.map((x) => [x.surface + ':' + (x.ctx.id || ''), x]))
    surfaces = list.map((x) => {
      // a re-reduction that left the SAME state keeps what the user typed since; a new answer
      // (another state object) starts from it
      const kept = before.get(x.surface + ':' + (x.ctx.id || ''))
      const liveState = kept && kept.ctx.state === x.ctx.state ? kept.liveState : { ...((x.ctx && x.ctx.state) || {}) }
      return { ...x, appState: appState || {}, liveState }
    })
    applyRulesSoon()
  }

  // Lo que se oculta de un campo: el control mismo — en Redwood su etiqueta va DENTRO (label-edge
  // inside) — o, para los que la llevan fuera (captura, @Searchable), su oj-label-value. Subir hasta
  // el hijo del oj-form-layout no vale: JET envuelve los campos en sus propios contenedores y se
  // ocultaba la sección entera.
  function formItemOf(el) {
    return (el.closest && el.closest('oj-label-value')) || el
  }

  /** A value safe inside a quoted attribute selector: CSS.escape when the browser has it, else the
   *  backslash and the quote escaped (the backslash FIRST, or the quote's escape gets doubled). */
  function attrSelectorValue(value) {
    const s = String(value)
    if (typeof CSS !== 'undefined' && CSS && typeof CSS.escape === 'function') return CSS.escape(s)
    return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  }

  function applySurface(doc, entry) {
    const { ctx, appState, liveState, surface } = entry
    const result = computeRules(ctx.tree.rules, { state: liveState, data: ctx.data || {}, appState, appData: {}, component: ctx.tree })
    const inSurface = (el) => surfaceOfElement(el) === surface
    let touched = 0
    const flags = fieldFlagsOf(result.data)
    for (const fieldId of Object.keys(flags)) {
      for (const el of doc.querySelectorAll('[data-field-id="' + attrSelectorValue(fieldId) + '"]')) {
        if (!inSurface(el)) continue
        const f = flags[fieldId]
        if ('hidden' in f) {
          const item = formItemOf(el)
          item.style.display = f.hidden ? 'none' : ''
        }
        if ('disabled' in f && el.disabled !== f.disabled) el.disabled = f.disabled
        if ('required' in f && el.required !== f.required) el.required = f.required
        if ('readonly' in f && el.readonly !== f.readonly) el.readonly = f.readonly
        touched++
      }
    }
    // un SetStateValue cambia el valor de otro campo: se le pone al control y se emite el mismo
    // valueChanged INTERNO que si lo hubiese tecleado el usuario (así entra en el borrador que
    // viaja con la siguiente acción)
    for (const fieldId of Object.keys(result.state)) {
      if (fieldId.indexOf('.') >= 0) continue
      const value = result.state[fieldId]
      if (liveState[fieldId] === value) continue
      liveState[fieldId] = value
      for (const el of doc.querySelectorAll('[data-field-id="' + attrSelectorValue(fieldId) + '"]')) {
        if (!inSurface(el)) continue
        el.value = value
        el.dispatchEvent(new CustomEvent('valueChanged', { detail: { value, updatedFrom: 'internal' }, bubbles: true }))
      }
    }
    for (const actionId of result.actions) if (runActionSink) runActionSink(actionId, {}, { surface })
    return touched
  }

  function applyRulesNow(doc = typeof document !== 'undefined' ? document : null) {
    if (!surfaces.length || !doc) return 0
    let touched = 0
    for (const entry of surfaces) touched += applySurface(doc, entry)
    return touched
  }

  function applyRulesSoon(frames = 12) {
    if (typeof requestAnimationFrame === 'undefined') return
    let left = frames
    const tick = () => { applyRulesNow(); left -= 1; if (left > 0) requestAnimationFrame(tick) }
    requestAnimationFrame(tick)
  }

  /** Escucha los cambios de campo del documento (una vez): actualiza el estado vivo DE SU SUPERFICIE
   *  y re-evalúa. */
  function installRules(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mateuRulesInstalled) return
    doc.__mateuRulesInstalled = true
    doc.addEventListener('valueChanged', (e) => {
      const el = e.target
      const fieldId = el && el.getAttribute && el.getAttribute('data-field-id')
      const detail = e.detail || {}
      if (!fieldId || (detail.updatedFrom && detail.updatedFrom !== 'internal')) return
      const surface = surfaceOfElement(el)
      for (const entry of surfaces) if (entry.surface === surface) entry.liveState[fieldId] = detail.value
      applyRulesNow(doc)
    }, true)
  }

  /** Para diagnosticar desde la consola: las reglas en vigor y el estado vivo. */
  function rulesDebug() {
    return surfaces.map((x) => ({ surface: x.surface, rules: (x.ctx.tree.rules || []).length, state: { ...x.liveState } }))
  }



  // The FLOWS of an app shell (`actions:` with `steps:` on a `type: AppShell`, AppShell.actions in
  // code) travel on the wire App as `actions`, each with its steps LOWERED to `commands`. A menu leaf
  // (RuleLink) whose RunAction rule names one runs those commands in the browser — no server
  // round-trip, so the menu also works on a static bundle. The commands go through the SAME reducer a
  // server increment goes through (reduceContexts), so a flow's NavigateTo/DispatchEvent/CloseModal/
  // MarkAsClean mean here exactly what they mean coming from the server. An id the shell does not
  // declare (or declares without steps) keeps the app-level dispatch (runMateuHeaderAction).

  /** Is this menu node id a leaf that runs rules (not a route)? */
  function isMenuRuleId(id) {
    return typeof id === 'string' && id.indexOf(MENU_RULE_PREFIX) === 0
  }

  /** The rules of the menu leaf with node id `id`, at any depth of the wire menu; null if none. */
  function menuRulesOf(menu, id) {
    for (const option of menu || []) {
      const raw = option.route || option.path || ''
      if ((option.rules || []).length && menuNodeIdOf(option, raw) === id) return option.rules
      const found = menuRulesOf(option.submenus || option.submenu || [], id)
      if (found) return found
    }
    return null
  }

  /** The lowered commands of an action, or null when it carries no flow. */
  function flowCommandsOf(action) {
    return action && Array.isArray(action.commands) && action.commands.length ? action.commands : null
  }

  /** The app's ACTION catalogue entry `actionId` (App.actionCatalogue, kept on reg.shell), or null. */
  function catalogueActionOf(shell, actionId) {
    return ((shell && shell.actionCatalogue) || []).find((a) => a && a.id === actionId) || null
  }

  /**
   * The lowered commands of the shell action `actionId`, OWNER FIRST: a flow the shell declares — a
   * shell action WITHOUT steps is the shell's own server action, so it answers null — and only when
   * the shell does not declare the id, the app's action catalogue. Null: dispatch it app-level.
   */
  function shellFlowOf(shell, actionId) {
    const own = ((shell && shell.actions) || []).find((a) => a && a.id === actionId)
    if (own) return flowCommandsOf(own)
    return flowCommandsOf(catalogueActionOf(shell, actionId))
  }

  /**
   * The flow a PAGE button runs client-side, OWNER FIRST: the host page's own action of that id (its
   * declared flow, or null — its server action), else the app's action catalogue entry. Null: the
   * action goes to the server as before.
   */
  function pageFlowOf(reg, actionId) {
    const host = reg && reg.contexts ? reg.contexts[HOST_ID] : null
    const own = [...((host && host.declaredActions) || []), ...((host && host.tree && host.tree.actions) || [])]
      .find((a) => a && a.id === actionId)
    if (own) return flowCommandsOf(own)
    return flowCommandsOf(catalogueActionOf(reg && reg.shell, actionId))
  }

  /**
   * What clicking a rule leaf does, as data the shell chain applies: `reg` (the registry after the
   * flows' commands — a CloseOverlay closes the top overlay), `navigate` ({route} in-app, or {url}),
   * the bus `events` ({name, detail}), the `serverActions` to dispatch app-level (a RunAction rule
   * with no declared flow, or a flow's RunAction step) and `dirty` (true/false when a flow marked the
   * screen, null otherwise). RunJS rules are not run (the VB CSP forbids eval) — they are reported
   * in `skipped`.
   */
  function runShellAction(plan, actionId, depth) {
    const commands = depth < 8 ? shellFlowOf(plan.reg && plan.reg.shell, actionId) : null
    if (!commands) {
      plan.serverActions.push(actionId)
      return
    }
    const next = reduceContexts(plan.reg, { commands, fragments: [], messages: [] }, { initiator: HOST_ID })
    const effects = next.effects || {}
    plan.reg = next
    if (effects.navigate) {
      plan.navigate = effects.navigate.url
        ? { url: effects.navigate.url }
        : { route: '/' + String(effects.navigate.route || '').replace(/^\/+/, '') }
    }
    plan.events.push(...(effects.events || []))
    for (const c of commands) {
      if (c.type === 'MarkAsClean') plan.dirty = false
      if (c.type === 'MarkAsDirty') plan.dirty = true
    }
    // a flow's RunAction step resolves the same way: the shell's flow, then the catalogue's (capped,
    // so a flow that runs itself cannot loop), else an app-level server action
    for (const run of effects.runActions || []) {
      if (run && run.actionId) runShellAction(plan, run.actionId, depth + 1)
    }
  }

  function menuRulePlanOf(reg, rules) {
    const plan = { reg, navigate: null, events: [], serverActions: [], dirty: null, skipped: [] }
    for (const rule of rules || []) {
      if (!rule) continue
      if (rule.action !== 'RunAction' || !rule.actionId) {
        plan.skipped.push(rule)
        continue
      }
      runShellAction(plan, rule.actionId, 0)
    }
    return plan
  }


  // Selección de RANGO en el tape chart (PlanningBoard → oj-gantt): arrastrar por celdas VACÍAS de
  // una fila lanza rangeSelectActionId con { _resourceId, _start, _end } (el «clic en la celda de
  // inicio y en la de fin» del Room Diary de OPERA → I Want To: reserva, walk-in, fuera de servicio).
  // oj-gantt no lo trae: mueve y redimensiona tareas, pero no selecciona tiempo vacío. Así que una
  // capa fina por encima, sin sustituir al componente:
  //   - la fila, del propio gantt (getContextByNode → rowIndex);
  //   - el día, de las posiciones REALES de las etiquetas del eje de días (respeta zoom y scroll);
  //   - mientras se arrastra, una banda translúcida; al soltar, la acción por el canal de la página.
  // Lo puro (x → día) está exportado y probado en Node.

  /** Día (índice) bajo `x` a partir de los centros de las etiquetas del eje de días. */
  function dayIndexAtX(x, centers) {
    if (!centers || !centers.length) return null
    if (centers.length === 1) return centers[0].index
    const sorted = [...centers].sort((a, b) => a.x - b.x)
    const width = (sorted[sorted.length - 1].x - sorted[0].x) / (sorted[sorted.length - 1].index - sorted[0].index)
    if (!(width > 0)) return sorted[0].index
    // el día i ocupa [centro_i - w/2, centro_i + w/2)
    return Math.round((x - sorted[0].x) / width) + sorted[0].index
  }

  const DAY = 86400000
  const isoUtc = (ms) => new Date(ms).toISOString().slice(0, 10)

  let rangeSink = null
  /** Quién ejecuta la acción (la shell reutiliza el sumidero de los Element). */
  function setPlanningRangeSink(fn) { rangeSink = typeof fn === "function" ? fn : null }

  /** Los centros (x en pantalla) de las etiquetas de días del eje menor de un gantt. */
  function dayCenters(gantt, startIso, days) {
    const labels = [...gantt.querySelectorAll('text')]
    const out = []
    // las etiquetas del eje menor tienen el formato del locale ("10/14", "14/10"…): se casan por
    // orden con los días de la ventana, quedándose con la fila de etiquetas más baja del eje
    const rows = {}
    for (const t of labels) {
      const r = t.getBoundingClientRect()
      if (!/\d/.test(t.textContent || '')) continue
      const key = Math.round(r.top)
      ;(rows[key] = rows[key] || []).push({ t, r })
    }
    const axisRows = Object.keys(rows).map(Number).sort((a, b) => a - b)
    // el eje menor: la fila con más etiquetas entre las primeras (la cabecera), no las barras
    const minor = axisRows.slice(0, 3).map((k) => rows[k]).sort((a, b) => b.length - a.length)[0] || []
    minor.sort((a, b) => a.r.left - b.r.left).forEach((e, i) => {
      if (i < days) out.push({ x: e.r.left + e.r.width / 2, index: i })
    })
    return out
  }

  /** Instala (una vez) el arrastre de rango sobre cualquier oj-gantt.mateu-planning del documento. */
  function installPlanningRange(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mateuPlanningRange) return
    doc.__mateuPlanningRange = true
    let drag = null
    const band = () => {
      let el = doc.getElementById('mateuPlanningRangeBand')
      if (!el) {
        el = doc.createElement('div')
        el.id = 'mateuPlanningRangeBand'
        el.className = 'mateu-planning-range'
        doc.body.appendChild(el)
      }
      return el
    }
    doc.addEventListener('pointerdown', (e) => {
      const gantt = e.target && e.target.closest && e.target.closest('oj-gantt.mateu-planning')
      if (!gantt || !gantt.dataset.rangeAction || e.button > 0) return
      // sólo tiempo VACÍO de una fila (el fondo de la fila, rect.oj-gantt-row): una tarea se mueve y
      // redimensiona como siempre. getContextByNode no da contexto para ese fondo, así que la fila
      // sale de la etiqueta del eje de filas más cercana en vertical (vale también con scroll)
      const cls = (e.target.getAttribute && e.target.getAttribute('class')) || ''
      if (!/(^|\s)oj-gantt-row(\s|$)/.test(cls)) return
      const labels = (gantt.dataset.rowLabels || '').split('\u001f')
      let best = null
      for (const t of gantt.querySelectorAll('text')) {
        const i = labels.indexOf(t.textContent)
        if (i < 0) continue
        const r = t.getBoundingClientRect()
        const dist = Math.abs(r.top + r.height / 2 - e.clientY)
        if (!best || dist < best.dist) best = { i, dist }
      }
      if (!best) return
      const ctx = { rowIndex: best.i }
      const start = gantt.dataset.start
      const days = Math.round((Date.parse(gantt.dataset.end + 'Z') - Date.parse(start + 'Z')) / DAY)
      const centers = dayCenters(gantt, start, days)
      const anchor = dayIndexAtX(e.clientX, centers)
      if (anchor == null) return
      const rowRect = e.target.getBoundingClientRect()
      drag = { gantt, ctx, centers, anchor, current: anchor, start, top: rowRect.top, height: rowRect.height }
    }, true)
    doc.addEventListener('pointermove', (e) => {
      if (!drag) return
      const i = dayIndexAtX(e.clientX, drag.centers)
      if (i == null) return
      drag.current = i
      const [a, b] = [Math.min(drag.anchor, i), Math.max(drag.anchor, i)]
      const w = drag.centers.length > 1 ? Math.abs(drag.centers[1].x - drag.centers[0].x) : 40
      const el = band()
      const left = drag.centers[0].x + (a - drag.centers[0].index) * w - w / 2
      Object.assign(el.style, { display: 'block', left: left + window.scrollX + 'px', width: (b - a + 1) * w + 'px',
        top: drag.top + window.scrollY + 'px', height: drag.height + 'px' })
    }, true)
    doc.addEventListener('pointerup', () => {
      const d = drag
      drag = null
      const el = doc.getElementById('mateuPlanningRangeBand')
      if (el) el.style.display = 'none'
      if (!d || !rangeSink) return
      const ids = (d.gantt.dataset.rowIds || '').split('\u001f')
      const rowId = ids[d.ctx.rowIndex]
      if (!rowId) return
      const [a, b] = [Math.min(d.anchor, d.current), Math.max(d.anchor, d.current)]
      const base = Date.parse(d.start + 'Z')
      rangeSink(d.gantt.dataset.rangeAction, { _resourceId: rowId, _start: isoUtc(base + a * DAY), _end: isoUtc(base + b * DAY) }, {})
    }, true)
  }


  // PANEL DE ACCIONES por categorías («I want to…», ActionPanel): el disparador es un oj-button y la
  // capa un oj-dialog de JET; el estado de la capa (abierta, «mostrar más» de una columna, ocultar
  // las acciones sin datos) vive en el DOM — clases sobre el diálogo y sus columnas —, así que nada
  // pregunta al servidor ni re-proyecta. Elegir una acción cierra el diálogo y la acción sale por el
  // canal normal de los botones (blockAction). Un listener por documento, instalado una vez.

  /** «ctrl+shift+i» → { ctrl, alt, shift, meta, key } */
  function parseShortcut(shortcut) {
    const parts = String(shortcut || '').toLowerCase().split('+').map((p) => p.trim()).filter(Boolean)
    if (!parts.length) return null
    const mods = { ctrl: false, alt: false, shift: false, meta: false }
    let key = ''
    for (const p of parts) {
      if (p === 'ctrl' || p === 'control') mods.ctrl = true
      else if (p === 'alt' || p === 'option') mods.alt = true
      else if (p === 'shift') mods.shift = true
      else if (p === 'meta' || p === 'cmd') mods.meta = true
      else key = p
    }
    return key ? { ...mods, key } : null
  }

  /** ¿La tecla pulsada es el atajo? Por e.key o por e.code (KeyI / Digit1 / Numpad1), como los
   *  atajos del renderer web: independiente de la distribución del teclado. */
  function shortcutMatches(shortcut, e) {
    const s = typeof shortcut === 'string' ? parseShortcut(shortcut) : shortcut
    if (!s || !e) return false
    if (!!e.ctrlKey !== s.ctrl || !!e.altKey !== s.alt || !!e.shiftKey !== s.shift || !!e.metaKey !== s.meta) return false
    const k = s.key
    const key = String(e.key || '').toLowerCase()
    const code = String(e.code || '')
    return key === k || code === 'Key' + k.toUpperCase() || code === 'Digit' + k || code === 'Numpad' + k
  }

  const visible = (el) => !!(el && (el.offsetParent || (el.getClientRects && el.getClientRects().length)))

  /** Instala (una vez) el comportamiento de los paneles de acciones del documento. */
  function installActionPanels(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mateuActionPanels) return
    doc.__mateuActionPanels = true
    const dialogOf = (id) => (id ? doc.getElementById(id) : null)
    const open = (id) => {
      const d = dialogOf(id)
      if (d && typeof d.open === 'function' && !(d.isOpen && d.isOpen())) d.open()
    }
    doc.addEventListener('click', (e) => {
      const t = e.target && e.target.closest ? e.target : null
      if (!t) return
      const trigger = t.closest('[data-ap-open]')
      if (trigger) { open(trigger.getAttribute('data-ap-open')); return }
      const more = t.closest('[data-ap-more]')
      if (more) {
        const col = more.closest('.mateu-ap-column')
        if (col) col.classList.add('mateu-ap-showall')
        return
      }
    }, true)
    // elegir una acción cierra la capa; el oj-button sigue y su blockAction lanza la acción
    doc.addEventListener('ojAction', (e) => {
      const item = e.target && e.target.closest && e.target.closest('.mateu-ap-item')
      const dialog = item && item.closest('oj-dialog')
      if (dialog && typeof dialog.close === 'function') dialog.close()
    }, true)
    // ocultar las vacías: el oj-switch NO burbujea valueChanged, pero la fase de captura sí lo ve
    doc.addEventListener('valueChanged', (e) => {
      const sw = e.target
      if (!sw || !sw.hasAttribute || !sw.hasAttribute('data-ap-hide')) return
      const dialog = sw.closest('oj-dialog')
      if (dialog) dialog.classList.toggle('mateu-ap-hide-unpopulated', !!(e.detail && e.detail.value))
    }, true)
    doc.addEventListener('keydown', (e) => {
      if (!e.ctrlKey && !e.altKey && !e.metaKey) return
      for (const trigger of doc.querySelectorAll('[data-ap-shortcut]')) {
        const sc = trigger.getAttribute('data-ap-shortcut')
        if (sc && visible(trigger) && shortcutMatches(sc, e)) {
          e.preventDefault()
          e.stopPropagation()
          open(trigger.getAttribute('data-ap-open'))
          return
        }
      }
    }, true)
  }


  // TECLADO de la shell VB: los atajos declarados y las TECLAS DE ACCESO.
  //  - @Action(shortcut) de la pantalla en curso: el atajo lanza la acción (por el canal de los
  //    Element), como en el renderer web; sólo combinaciones con Ctrl/Alt/Meta — una tecla suelta
  //    es del campo donde se escribe — o una TECLA DE FUNCIÓN (F1–F12, sola o combinada): no
  //    escribe nada en un campo, y las aplicaciones de back-office las usan (F2, F9…).
  //  - @Tab(shortcut): selecciona la pestaña (el li del oj-tab-bar lleva data-shortcut).
  //  - @App(accessKeys): mantener Alt enseña una tecla junto a cada botón y pestaña visibles — su
  //    atajo si lo declara, si no una letra de su etiqueta asignada sin repetir — y Alt+letra lo
  //    pulsa. Lo de OPERA con su tecla de acceso. Lo puro (qué letra toca a quién) se prueba en Node.

  /** Las letras de acceso para unas etiquetas: primero las iniciales de sus palabras, luego cualquier
   *  letra de la etiqueta, luego cifras; sin repetir y saltando las reservadas. '' si no queda. */
  function assignAccessKeys(labels, reserved = []) {
    const used = new Set(reserved.map((k) => String(k).toLowerCase()))
    return labels.map((label) => {
      const text = String(label || '').toLowerCase()
      const initials = text.split(/[^a-z0-9áéíóúñ]+/i).map((w) => w.charAt(0))
      const letters = [...text]
      for (const c of [...initials, ...letters, ...'1234567890']) {
        if (/^[a-z0-9]$/.test(c) && !used.has(c)) { used.add(c); return c }
      }
      return ''
    })
  }

  /** Etiqueta legible de un atajo: «ctrl+shift+s» → «Ctrl+Shift+S». */
  const keyHint = (shortcut) => String(shortcut || '').split('+').filter(Boolean)
    .map((k) => (k.length === 1 ? k.toUpperCase() : k.charAt(0).toUpperCase() + k.slice(1))).join('+')

  // ── atajos de acción de la pantalla en curso ──────────────────────────────────────────────────
  let shortcutActions = []
  /** Una tecla de función (F1–F12): la de un atajo («f2», «shift+f9») o la de un evento (e.key). */
  const FUNCTION_KEY = /^f([1-9]|1[0-2])$/i
  const isFunctionKeyShortcut = (shortcut) =>
    FUNCTION_KEY.test(String(shortcut || '').split('+').pop().trim())
  /** La pantalla en curso (afterReduce): sus acciones con atajo con modificador o tecla de función. */
  function setShortcutContext(hostCtx) {
    const actions = (hostCtx && hostCtx.tree && hostCtx.tree.actions) || []
    shortcutActions = actions
      .filter((a) => a && a.id && a.shortcut
        && (/(^|\+)(ctrl|control|alt|meta|cmd)(\+|$)/i.test(a.shortcut) || isFunctionKeyShortcut(a.shortcut)))
      .map((a) => ({ id: a.id, shortcut: String(a.shortcut).toLowerCase() }))
  }
  const currentShortcutActions = () => shortcutActions

  let keysSink = null
  function setKeysActionSink(fn) { keysSink = typeof fn === 'function' ? fn : null }

  let accessKeysOn = false
  function setAccessKeysEnabled(on) { accessKeysOn = !!on }

  // ── DOM ────────────────────────────────────────────────────────────────────────────────────────
  const keyTargetVisible = (el) => {
    if (!el || !el.getClientRects || !el.getClientRects().length) return false
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < (el.ownerDocument.defaultView.innerHeight || 1e6)
  }
  const labelOf = (el) => (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim()

  /** Lo que se puede pulsar con una tecla de acceso: botones (no deshabilitados) y pestañas. */
  function accessCandidates(doc) {
    const out = []
    for (const el of doc.querySelectorAll('oj-button, oj-menu-button, oj-tab-bar li')) {
      if (!keyTargetVisible(el) || el.hasAttribute('disabled') || el.closest('[aria-hidden="true"], .mateu-access-keys')) continue
      const label = labelOf(el)
      if (!label) continue
      const actionId = el.getAttribute('data-action-id')
      const declared = el.getAttribute('data-shortcut')
        || (actionId && (shortcutActions.find((a) => a.id === actionId) || {}).shortcut) || ''
      out.push({ el, label, declared })
    }
    return out
  }

  const activate = (el) => {
    const inner = el.querySelector && el.querySelector('button')
    if (inner) inner.click()
    else el.click()
  }

  const reservedAltLetters = () => shortcutActions
    .map((a) => /^alt\+([a-z0-9])$/.exec(a.shortcut)).filter(Boolean).map((m) => m[1])

  function showAccessKeys(doc) {
    hideAccessKeys(doc)
    const candidates = accessCandidates(doc)
    const free = candidates.filter((c) => !c.declared)
    const letters = assignAccessKeys(free.map((c) => c.label), reservedAltLetters())
    free.forEach((c, i) => { c.letter = letters[i] })
    const layer = doc.createElement('div')
    layer.className = 'mateu-access-keys'
    layer.setAttribute('aria-hidden', 'true')
    for (const c of candidates) {
      const text = c.declared ? keyHint(c.declared) : (c.letter ? c.letter.toUpperCase() : '')
      if (!text) continue
      const r = c.el.getBoundingClientRect()
      const badge = doc.createElement('span')
      badge.className = 'mateu-access-key'
      badge.textContent = text
      badge.style.left = Math.max(0, r.left - 4) + 'px'
      badge.style.top = Math.max(0, r.top - 8) + 'px'
      layer.appendChild(badge)
    }
    doc.body.appendChild(layer)
    doc.__mateuAccessMap = candidates.filter((c) => c.letter).map((c) => ({ letter: c.letter, el: c.el }))
  }

  function hideAccessKeys(doc) {
    for (const l of doc.querySelectorAll('.mateu-access-keys')) l.remove()
  }

  const matches = (shortcut, e) => (typeof shortcutMatches === 'function' ? shortcutMatches(shortcut, e) : false)

  function installKeys(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mateuKeys) return
    doc.__mateuKeys = true
    let holdTimer = null
    doc.addEventListener('keydown', (e) => {
      // mantener Alt (sola): aparecen las teclas
      if (e.key === 'Alt' && accessKeysOn && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        if (!holdTimer) holdTimer = setTimeout(() => showAccessKeys(doc), 250)
        return
      }
      if (holdTimer) { clearTimeout(holdTimer); holdTimer = null }
      if (!e.ctrlKey && !e.altKey && !e.metaKey && !FUNCTION_KEY.test(String(e.key || ''))) return
      // 1. una acción de la pantalla
      const action = shortcutActions.find((a) => matches(a.shortcut, e))
      if (action && keysSink) {
        e.preventDefault(); e.stopPropagation()
        keysSink(action.id, {}, {})
        return
      }
      // 2. una pestaña
      for (const li of doc.querySelectorAll('oj-tab-bar li[data-shortcut]')) {
        const sc = li.getAttribute('data-shortcut')
        if (sc && keyTargetVisible(li) && matches(sc, e)) { e.preventDefault(); e.stopPropagation(); activate(li); return }
      }
      // 3. una tecla de acceso (Alt+letra, por el código físico: en Mac Alt cambia e.key)
      if (accessKeysOn && e.altKey && !e.ctrlKey && !e.metaKey) {
        const m = /^(Key([A-Z])|Digit([0-9]))$/.exec(e.code || '')
        const letter = m ? (m[2] || m[3]).toLowerCase() : ''
        if (!letter) return
        if (!doc.querySelector('.mateu-access-keys')) showAccessKeys(doc)
        const hit = (doc.__mateuAccessMap || []).find((x) => x.letter === letter)
        if (hit) { e.preventDefault(); e.stopPropagation(); hideAccessKeys(doc); activate(hit.el) }
      }
    }, true)
    doc.addEventListener('keyup', (e) => {
      if (e.key === 'Alt') {
        if (holdTimer) { clearTimeout(holdTimer); holdTimer = null }
        hideAccessKeys(doc)
      }
    }, true)
    const view = doc.defaultView
    if (view) view.addEventListener('blur', () => hideAccessKeys(doc))
  }



  // VENTANAS FLOTANTES al pasar el ratón (y al enfocar con el teclado): el resumen de una tarifa, el
  // detalle de una celda. UNA oj-popup de JET compartida, creada fuera de Knockout, a la que se
  // le cambia el contenido: cualquier elemento con data-mateu-hover (texto, líneas con \n) la abre
  // al pasar o enfocar y la cierra al salir; uno con data-mateu-pop-click, al pulsar. Las celdas
  // de un listado con @Tooltip(otro campo) y los Popover (trigger hover/click) pasan por aquí.

  /** Las líneas del contenido (puro). */
  const hoverLinesOf = (text) => String(text || '').split('\n').map((l) => l.trim()).filter(Boolean)

  function installHover(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mateuHover) return
    doc.__mateuHover = true
    let popup = null
    let body = null
    let anchor = null
    let openTimer = null
    let closeTimer = null
    const ensure = () => {
      if (popup) return popup
      const wrap = doc.createElement('div')
      wrap.setAttribute('data-oj-binding-provider', 'none')
      popup = doc.createElement('oj-popup')
      popup.id = 'mateuHoverPopup'
      popup.className = 'mateu-hover-popup'
      popup.setAttribute('modality', 'modeless')
      popup.setAttribute('auto-dismiss', 'none')
      popup.setAttribute('tail', 'simple')
      popup.setAttribute('initial-focus', 'none')
      popup.setAttribute('position', '{"my":{"horizontal":"start","vertical":"top"},"at":{"horizontal":"start","vertical":"bottom"},"collision":"flipfit"}')
      body = doc.createElement('div')
      body.className = 'mateu-hover-content'
      body.setAttribute('role', 'tooltip')
      popup.appendChild(body)
      popup.addEventListener('mouseenter', () => { if (closeTimer) { clearTimeout(closeTimer); closeTimer = null } })
      popup.addEventListener('mouseleave', () => scheduleClose())
      wrap.appendChild(popup)
      doc.body.appendChild(wrap)
      return popup
    }
    let hoverAnchorSeq = 0
    const open = (el, text) => {
      const p = ensure()
      body.textContent = ''
      // rich content (a Popover's components): the sanitised HTML; else the text lines
      const html = el.getAttribute('data-mateu-pop-html') || ''
      if (html) body.innerHTML = sanitizeHtml(html)
      else for (const line of hoverLinesOf(text)) {
        const div = doc.createElement('div')
        div.textContent = line
        body.appendChild(div)
      }
      if (!el.id) el.id = 'mateuHover-' + (++hoverAnchorSeq)
      anchor = el
      el.setAttribute('aria-describedby', 'mateuHoverPopup')
      // un oj-popup recién creado tarda en «actualizarse» (JET lo hace de forma asíncrona): hasta
      // entonces sus métodos lanzan — se reintenta unos frames
      const tryOpen = (left) => {
        if (anchor !== el) return
        try {
          if (p.isOpen()) p.close()
          p.open('#' + el.id)
        } catch (err) {
          if (left > 0) requestAnimationFrame(() => tryOpen(left - 1))
        }
      }
      tryOpen(30)
    }
    const close = () => {
      if (openTimer) { clearTimeout(openTimer); openTimer = null }
      if (anchor) anchor.removeAttribute('aria-describedby')
      anchor = null
      try { if (popup && popup.isOpen()) popup.close() } catch (err) { /* aún sin actualizar */ }
    }
    const scheduleClose = () => {
      if (closeTimer) clearTimeout(closeTimer)
      closeTimer = setTimeout(() => { closeTimer = null; close() }, 200)
    }
    const hoverTarget = (node) => {
      const el = node && node.closest ? node.closest('[data-mateu-hover]') : null
      return el && el.getAttribute('data-mateu-hover') ? el : null
    }
    const show = (el) => {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
      if (anchor === el) return
      if (openTimer) clearTimeout(openTimer)
      openTimer = setTimeout(() => { openTimer = null; open(el, el.getAttribute('data-mateu-hover')) }, 300)
    }
    // se crea ya: cuando llegue el primer hover JET habrá tenido tiempo de actualizarlo
    if (doc.body) ensure()
    doc.addEventListener('mouseover', (e) => { const el = hoverTarget(e.target); if (el) show(el) }, true)
    doc.addEventListener('mouseout', (e) => {
      const el = hoverTarget(e.target)
      if (el && !(e.relatedTarget && el.contains(e.relatedTarget))) {
        if (openTimer && anchor !== el) { clearTimeout(openTimer); openTimer = null }
        scheduleClose()
      }
    }, true)
    doc.addEventListener('focusin', (e) => { const el = hoverTarget(e.target); if (el) show(el) }, true)
    doc.addEventListener('focusout', (e) => { if (hoverTarget(e.target)) scheduleClose() }, true)
    doc.addEventListener('click', (e) => {
      const el = e.target && e.target.closest ? e.target.closest('[data-mateu-pop-click]') : null
      if (!el || !el.getAttribute('data-mateu-pop-click')) return
      if (anchor === el) close()
      else open(el, el.getAttribute('data-mateu-pop-click'))
    }, true)
    doc.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && anchor) { close(); return }
      if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.getAttribute && e.target.getAttribute('data-mateu-pop-click')) {
        e.preventDefault()
        e.target.click()
      }
    }, true)
  }



  // ARRASTRAR FILAS A UN DESTINO: las filas de un listado @DragRows(tipo) se arrastran con el dnd
  // del propio oj-table de JET (dnd.drag.rows.data-types = el tipo MIME del tipo); un DropZone
  // (atom isDropZone) acepta ese tipo MIME — se resalta mientras pasa por encima algo suyo — y al
  // soltar lanza su acción con sus parámetros más _draggedIds y _dragType: origen y destino.

  /** Los ids de lo que trae el arrastre: el JSON que JET pone por tipo (filas, o {data,key}). */
  function draggedIdsOf(json) {
    let rows
    try { rows = JSON.parse(json) } catch (e) { return [] }
    if (!Array.isArray(rows)) rows = [rows]
    return rows.map((r) => {
      if (r == null) return null
      if (typeof r !== 'object') return String(r)
      const d = r.data && typeof r.data === 'object' ? r.data : r
      const id = d.id != null ? d.id : (r.key != null ? r.key : null)
      return id == null ? null : String(id)
    }).filter((id) => id != null)
  }

  /** El tipo «charge» de un MIME «application/x-mateu-charge». */
  const dragTypeOfMime = (mime) => String(mime || '').replace(/^application\/x-mateu-/, '')

  let dropSink = null
  function setDropSink(fn) { dropSink = typeof fn === 'function' ? fn : null }

  // ── TILES REORDENABLES (ResponsiveGrid.reorderable): el bloque de cada tile lleva data-mateu-tile
  // (su clave) y data-mateu-tile-scope; arrastrar uno sobre otro lo coloca ahí, y Alt+←/→ con el
  // tile enfocado lo mueve un puesto. El orden se guarda (prefs: el mismo almacén que el web) y la
  // página re-proyecta el host sin ir al servidor (tileSink).
  const TILE_MIME = 'application/x-mateu-tile'
  let tileSink = null
  function setTileReorderSink(fn) { tileSink = typeof fn === 'function' ? fn : null }

  /** Las claves de los tiles de un ámbito, en el orden en que están pintados. */
  function paintedTileOrder(doc, scope) {
    return Array.from(doc.querySelectorAll('[data-mateu-tile]'))
      .filter((el) => el.getAttribute('data-mateu-tile-scope') === scope)
      .map((el) => el.getAttribute('data-mateu-tile'))
  }

  function installTileReorder(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mateuTiles) return
    doc.__mateuTiles = true
    const tileOf = (t) => (t && t.closest ? t.closest('[data-mateu-tile]') : null)
    const commit = (scope, next, focusKey) => {
      writeTileOrder(scope, next)
      if (tileSink) tileSink(scope)
      if (focusKey) {
        // tras re-proyectar, el foco vuelve al tile movido (VB repinta de forma asíncrona)
        let tries = 0
        const refocus = () => {
          const el = Array.from(doc.querySelectorAll('[data-mateu-tile]'))
            .find((n) => n.getAttribute('data-mateu-tile') === focusKey && n.getAttribute('data-mateu-tile-scope') === scope)
          const painted = paintedTileOrder(doc, scope)
          if (el && painted.join('|') === next.join('|')) { el.focus(); return }
          if (++tries < 20) setTimeout(refocus, 50)
        }
        setTimeout(refocus, 0)
      }
    }
    // el atributo draggable se pone al empezar el gesto (el bloque lo pinta la plantilla sin él)
    doc.addEventListener('mousedown', (e) => { const tile = tileOf(e.target); if (tile) tile.draggable = true }, true)
    doc.addEventListener('dragstart', (e) => {
      const tile = tileOf(e.target)
      if (!tile || !e.dataTransfer) return
      e.dataTransfer.setData(TILE_MIME, tile.getAttribute('data-mateu-tile-scope') + '\n' + tile.getAttribute('data-mateu-tile'))
      e.dataTransfer.effectAllowed = 'move'
      tile.classList.add('mateu-tile-dragging')
    }, true)
    doc.addEventListener('dragend', () => {
      for (const t of doc.querySelectorAll('.mateu-tile-dragging, .mateu-tile-over')) t.classList.remove('mateu-tile-dragging', 'mateu-tile-over')
    }, true)
    doc.addEventListener('dragover', (e) => {
      const tile = tileOf(e.target)
      const types = (e.dataTransfer && e.dataTransfer.types) ? Array.from(e.dataTransfer.types) : []
      if (!tile || !types.includes(TILE_MIME)) return
      e.preventDefault()
      tile.classList.add('mateu-tile-over')
    }, true)
    doc.addEventListener('dragleave', (e) => {
      const tile = tileOf(e.target)
      if (tile && !(e.relatedTarget && tile.contains(e.relatedTarget))) tile.classList.remove('mateu-tile-over')
    }, true)
    doc.addEventListener('drop', (e) => {
      const tile = tileOf(e.target)
      const raw = tile && e.dataTransfer ? e.dataTransfer.getData(TILE_MIME) : ''
      if (!raw) return
      const [scope, moved] = raw.split('\n')
      if (scope !== tile.getAttribute('data-mateu-tile-scope')) return
      e.preventDefault()
      const order = paintedTileOrder(doc, scope)
      const next = moveTile(order, moved, tile.getAttribute('data-mateu-tile'))
      if (next !== order) commit(scope, next, null)
    }, true)
    doc.addEventListener('keydown', (e) => {
      if (!e.altKey || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return
      const tile = e.target && e.target.hasAttribute && e.target.hasAttribute('data-mateu-tile') ? e.target : null
      if (!tile) return
      e.preventDefault()
      const scope = tile.getAttribute('data-mateu-tile-scope')
      const key = tile.getAttribute('data-mateu-tile')
      const order = paintedTileOrder(doc, scope)
      const next = moveTileBy(order, key, e.key === 'ArrowLeft' ? -1 : 1)
      if (next !== order) commit(scope, next, key)
    }, true)
  }

  function installDragAndDrop(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mateuDnd) return
    doc.__mateuDnd = true
    const zoneOf = (target, e) => {
      const zone = target && target.closest ? target.closest('.mateu-drop-zone[data-drop-accept]') : null
      if (!zone) return null
      const accept = zone.getAttribute('data-drop-accept')
      const types = (e.dataTransfer && e.dataTransfer.types) ? Array.from(e.dataTransfer.types) : []
      return accept && types.includes(accept) ? zone : null
    }
    doc.addEventListener('dragover', (e) => {
      const zone = zoneOf(e.target, e)
      if (!zone) return
      e.preventDefault()
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
      zone.classList.add('mateu-drop-over')
    }, true)
    doc.addEventListener('dragleave', (e) => {
      const zone = e.target && e.target.closest ? e.target.closest('.mateu-drop-zone') : null
      if (zone && !(e.relatedTarget && zone.contains(e.relatedTarget))) zone.classList.remove('mateu-drop-over')
    }, true)
    // mientras se arrastra algo con tipo, los destinos que lo aceptan se ofrecen (borde punteado)
    doc.addEventListener('dragstart', (e) => {
      const types = (e.dataTransfer && e.dataTransfer.types) ? Array.from(e.dataTransfer.types) : []
      setTimeout(() => {
        const live = (e.dataTransfer && e.dataTransfer.types) ? Array.from(e.dataTransfer.types) : types
        for (const z of doc.querySelectorAll('.mateu-drop-zone[data-drop-accept]')) {
          if (live.includes(z.getAttribute('data-drop-accept'))) z.classList.add('mateu-drop-ready')
        }
      })
    }, true)
    const clear = () => {
      for (const z of doc.querySelectorAll('.mateu-drop-zone')) z.classList.remove('mateu-drop-ready', 'mateu-drop-over')
    }
    doc.addEventListener('dragend', clear, true)
    doc.addEventListener('drop', (e) => {
      const zone = zoneOf(e.target, e)
      if (!zone) return
      e.preventDefault()
      clear()
      const mime = zone.getAttribute('data-drop-accept')
      const ids = draggedIdsOf(e.dataTransfer.getData(mime))
      if (!ids.length || !dropSink) return
      let params = {}
      try { params = JSON.parse(zone.getAttribute('data-drop-params') || '{}') } catch (err) { params = {} }
      dropSink(zone.getAttribute('data-drop-action'), { ...params, _draggedIds: ids, _dragType: dragTypeOfMime(mime) }, {})
    }, true)
  }


  // MatrixGrid sobre oj-data-grid: el comportamiento que JET deja a la aplicación, instalado una
  // vez por documento (como el rango del tape chart o los paneles de acciones):
  //   - plegar/desplegar una sección: el grid pide (ojExpandRequest/ojCollapseRequest) y aquí se
  //     cambia el KeySet del FlattenedTreeDataProviderView; el estado se guarda en el almacén de
  //     paneles para que sobreviva a una re-proyección;
  //   - editar: qué celdas se editan lo dice cell.editable (matrixAtomOf); al terminar
  //     (ojBeforeEditEnd) el valor nuevo, si cambió, sale por editActionId;
  //   - una celda que enlaza: clic → cellActionId. Ambas con { _rowId, _columnId, _value }.

  let matrixSink = null
  /** Quién ejecuta la acción (la shell reutiliza el sumidero de los Element). */
  function setMatrixActionSink(fn) { matrixSink = typeof fn === 'function' ? fn : null }

  /** Los parámetros de la acción de una celda. */
  const matrixCellParams = (rowId, columnId, value) => ({ _rowId: rowId, _columnId: columnId, _value: value })

  /** ¿Hay que lanzar la edición? Sólo si cambió (un Enter sin tocar nada no es una edición). */
  const matrixEditChanged = (before, after) => String(before ?? '') !== String(after ?? '')

  const gridOf = (el) => (el && el.closest ? el.closest('oj-data-grid.mateu-matrix') : null)
  const rowKeyOf = (detail) => detail && detail.item && detail.item.metadata && detail.item.metadata.rowItem
    && detail.item.metadata.rowItem.metadata && detail.item.metadata.rowItem.metadata.key

  function installMatrixGrids(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mateuMatrixGrids) return
    doc.__mateuMatrixGrids = true
    const toggle = (expand) => (e) => {
      const grid = gridOf(e.target)
      const state = grid && grid.data && grid.data.__mateu
      const key = rowKeyOf(e.detail)
      if (!state || key == null) return
      state.expanded = expand ? state.expanded.add([key]) : state.expanded.delete([key])
      state.flat.setExpanded(state.expanded)
      if (String(key).startsWith('§')) setPanelExpanded(matrixSectionKey(grid.dataset.matrixId, String(key).slice(1)), expand)
    }
    doc.addEventListener('ojExpandRequest', toggle(true), true)
    doc.addEventListener('ojCollapseRequest', toggle(false), true)
    doc.addEventListener('ojBeforeEditEnd', (e) => {
      const grid = gridOf(e.target)
      if (!grid || (e.detail && e.detail.cancelEdit)) return
      const input = grid.querySelector('oj-input-text[data-mx-row]')
      if (!input || !matrixSink || !grid.dataset.editAction) return
      const before = input.getAttribute('data-mx-value')
      const after = input.value
      if (!matrixEditChanged(before, after)) return
      matrixSink(grid.dataset.editAction, matrixCellParams(input.getAttribute('data-mx-row'), input.getAttribute('data-mx-col'), after), {})
    }, true)
    doc.addEventListener('click', (e) => {
      const link = e.target && e.target.closest ? e.target.closest('[data-mx-link="true"]') : null
      const grid = gridOf(link)
      if (!link || !grid || !matrixSink || !grid.dataset.cellAction) return
      matrixSink(grid.dataset.cellAction, matrixCellParams(link.getAttribute('data-mx-row'), link.getAttribute('data-mx-col'), link.textContent), {})
    }, true)
  }

  void panelExpanded



  // Map sobre Leaflet: JET no tiene mapa de calles (oj-thematic-map pinta geografía GeoJSON, no
  // teselas), así que el átomo `isMap` es un contenedor que esto llena, una vez por documento como el
  // texto enriquecido o el MatrixGrid:
  //   - Leaflet (1.9.4) y su CSS se cargan del CDN de cdnjs al pintarse el primer mapa — nada se
  //     vendoriza; con requirejs presente (VB) se pide por require, porque un <script> UMD con
  //     requirejs cargado choca con su define anónimo;
  //   - teselas de OpenStreetMap, como el <mateu-map> del web — o las del proveedor que el Map
  //     declara en el wire (tileUrl, plantilla de Leaflet, + attribution): tileLayerOf;
  //   - un marcador = un círculo de su color con la etiqueta al lado (y la descripción al pasar);
  //     pulsarlo lanza markerActionId con { _markerId };
  //   - con marcadores y sin posición, la vista los encuadra (mapViewPlanOf, la misma regla que
  //     planMapView en libs/mateu).

  const LEAFLET_JS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js'
  const LEAFLET_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css'
  const OSM_TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
  const DEFAULT_PIN = '#c74634'
  const DEFAULT_ZOOM = 3
  const SINGLE_MARKER_ZOOM = 15

  const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

  /** La capa de teselas de un mapa: la del wire (tileUrl + attribution) o, sin tileUrl, OSM. La
   *  plantilla del wire ya es la de Leaflet ({s}, {z}, {x}, {y}), así que pasa tal cual. */
  function tileLayerOf(spec) {
    const url = spec && typeof spec.tileUrl === 'string' ? spec.tileUrl.trim() : ''
    if (!url) return { url: OSM_TILES, options: { maxZoom: 19, attribution: OSM_ATTRIBUTION } }
    const attribution = spec.attribution ? String(spec.attribution).trim() : ''
    return { url, options: { maxZoom: 19, ...(attribution ? { attribution } : {}) } }
  }

  let mapSink = null
  /** Quién ejecuta la acción de un marcador (la shell reutiliza el sumidero de los Element). */
  function setMapActionSink(fn) { mapSink = typeof fn === 'function' ? fn : null }

  /** "lat, lon" → { lat, lon }, o null si no son dos números. */
  function parseMapPosition(position) {
    if (!position) return null
    const parts = String(position).split(',').map((p) => p.trim())
    if (parts.length !== 2 || parts[0] === '' || parts[1] === '') return null
    const lat = Number(parts[0])
    const lon = Number(parts[1])
    return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null
  }

  function parseMapZoom(zoom) {
    if (zoom == null || String(zoom).trim() === '') return DEFAULT_ZOOM
    const z = Number(zoom)
    return Number.isFinite(z) ? z : DEFAULT_ZOOM
  }

  /** Qué enseña el mapa al abrirse: la posición explícita manda; si no, los marcadores (uno se
   *  centra, varios se encuadran); si no, el mundo. Misma regla que planMapView (libs/mateu). */
  function mapViewPlanOf(spec) {
    const center = parseMapPosition(spec.position)
    if (center) return { kind: 'center', center, zoom: parseMapZoom(spec.zoom) }
    const points = (spec.markers || []).filter((m) => Number.isFinite(m.latitude) && Number.isFinite(m.longitude))
    if (points.length === 1) {
      const hasZoom = spec.zoom != null && String(spec.zoom).trim() !== ''
      return { kind: 'center', center: { lat: points[0].latitude, lon: points[0].longitude },
        zoom: hasZoom ? parseMapZoom(spec.zoom) : SINGLE_MARKER_ZOOM }
    }
    if (points.length > 1) {
      return {
        kind: 'fit',
        min: { lat: Math.min(...points.map((p) => p.latitude)), lon: Math.min(...points.map((p) => p.longitude)) },
        max: { lat: Math.max(...points.map((p) => p.latitude)), lon: Math.max(...points.map((p) => p.longitude)) },
      }
    }
    return { kind: 'center', center: { lat: 0, lon: 0 }, zoom: parseMapZoom(spec.zoom) }
  }

  /** Los parámetros de la acción de un marcador. */
  const mapMarkerParams = (markerId) => ({ _markerId: markerId })

  let leafletPromise = null
  function loadLeaflet(doc) {
    if (typeof window !== 'undefined' && window.L && window.L.map) return Promise.resolve(window.L)
    if (leafletPromise) return leafletPromise
    if (!doc.querySelector('link[data-mateu-leaflet]')) {
      const link = doc.createElement('link')
      link.rel = 'stylesheet'
      link.href = LEAFLET_CSS
      link.setAttribute('data-mateu-leaflet', '')
      doc.head.appendChild(link)
    }
    leafletPromise = new Promise((resolve, reject) => {
      const amd = typeof window !== 'undefined' && typeof window.require === 'function'
        && typeof window.define === 'function' && window.define.amd
      if (amd) {
        window.require([LEAFLET_JS], (L) => resolve(L || window.L), reject)
        return
      }
      const script = doc.createElement('script')
      script.src = LEAFLET_JS
      script.onload = () => resolve(window.L)
      script.onerror = reject
      doc.head.appendChild(script)
    }).catch((e) => { leafletPromise = null; throw e })
    return leafletPromise
  }

  function drawMap(L, el, spec) {
    if (el.__mateuMap) { el.__mateuMap.remove(); el.__mateuMap = null }
    const map = L.map(el, { scrollWheelZoom: true })
    const tiles = tileLayerOf(spec)
    L.tileLayer(tiles.url, tiles.options).addTo(map)
    for (const m of spec.markers || []) {
      const pin = L.circleMarker([m.latitude, m.longitude], {
        radius: 8, color: '#ffffff', weight: 2, fillColor: m.color || DEFAULT_PIN, fillOpacity: 1,
        bubblingMouseEvents: false,
      }).addTo(map)
      if (m.label) pin.bindTooltip(m.label, { permanent: true, direction: 'right', offset: [8, 0], className: 'mateu-map-label' })
      const hover = [m.label, m.description].filter(Boolean).join(' · ')
      if (hover && pin.getElement && pin.getElement()) pin.getElement().setAttribute('aria-label', hover)
      if (spec.markerActionId) {
        pin.on('click', () => { if (mapSink) mapSink(spec.markerActionId, mapMarkerParams(m.id), {}) })
        if (pin.getElement && pin.getElement()) pin.getElement().style.cursor = 'pointer'
      }
      if (m.description) pin.on('mouseover', () => { el.title = hover }).on('mouseout', () => { el.title = '' })
    }
    const plan = mapViewPlanOf(spec)
    if (plan.kind === 'fit') {
      map.fitBounds([[plan.min.lat, plan.min.lon], [plan.max.lat, plan.max.lon]],
        { paddingTopLeft: [48, 48], paddingBottomRight: [160, 48], maxZoom: 16 })
    } else {
      map.setView([plan.center.lat, plan.center.lon], plan.zoom)
    }
    el.__mateuMap = map
    // el contenedor puede haber cambiado de tamaño al asentarse la página (VB pinta por pasos)
    setTimeout(() => map.invalidateSize(), 300)
  }

  function installMaps(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mateuMaps || typeof MutationObserver === 'undefined') return
    doc.__mateuMaps = true
    const fill = (el) => {
      const raw = el.getAttribute('data-map-spec') || ''
      if (!raw || el.__mateuMapSpec === raw) return
      el.__mateuMapSpec = raw
      let spec
      try { spec = JSON.parse(raw) } catch (e) { return }
      loadLeaflet(doc).then((L) => {
        // la especificación pudo cambiar (o el contenedor desaparecer) mientras cargaba
        if (el.__mateuMapSpec === raw && el.isConnected) drawMap(L, el, spec)
      }).catch(() => {
        el.textContent = chromeText('mapUnavailable')
      })
    }
    const scan = (root) => {
      if (root.nodeType !== 1) return
      if (root.hasAttribute('data-map-spec')) fill(root)
      for (const el of root.querySelectorAll('[data-map-spec]')) fill(el)
    }
    scan(doc.body || doc.documentElement)
    new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === 'attributes') fill(r.target)
        else for (const n of r.addedNodes) scan(n)
      }
    }).observe(doc.body || doc.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-map-spec'] })
  }


  // TONOS DE FILA del listado (@RowStatus) y filas de GRUPO (@GroupBy) sobre el oj-table de JET.
  // oj-table no tiene clase por fila (sólo plantillas de celda o una plantilla de fila entera que
  // obligaría a repintar todas las columnas a mano), así que una pasada mínima por el DOM: cada `tr`
  // del cuerpo de #mateuTable recibe la clase de su fila (misma posición: la página se pinta entera,
  // sin virtualizar). Un MutationObserver la repite cuando JET repinta (orden, página, refresco).

  let tones = []

  /** Los tonos de las filas en pantalla, en orden (de listingOf(...).rows: _tone de cada una). */
  function setListingTones(rows) {
    tones = (rows || []).map((r) => (r && r._tone) || '')
    applyRowTonesSoon()
  }

  const toneClassOf = (tone) => (tone ? 'mateu-row-tone-' + tone : '')

  function applyRowTones(doc) {
    const table = doc.getElementById('mateuTable')
    if (!table) return 0
    const trs = table.querySelectorAll('tbody tr')
    let n = 0
    trs.forEach((tr, i) => {
      const want = toneClassOf(tones[i])
      for (const c of [...tr.classList]) if (c.startsWith('mateu-row-tone-') && c !== want) tr.classList.remove(c)
      if (want && !tr.classList.contains(want)) { tr.classList.add(want); n++ }
    })
    return n
  }

  function applyRowTonesSoon(frames = 10) {
    if (typeof requestAnimationFrame === 'undefined' || typeof document === 'undefined') return
    let left = frames
    const tick = () => { applyRowTones(document); if (--left > 0) requestAnimationFrame(tick) }
    requestAnimationFrame(tick)
  }

  /** Vigila (una vez) los repintados del oj-table para volver a poner los tonos. */
  function installRowTones(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mateuRowTones || typeof MutationObserver === 'undefined') return
    doc.__mateuRowTones = true
    let pending = false
    new MutationObserver(() => {
      if (pending || !tones.some(Boolean)) return
      pending = true
      requestAnimationFrame(() => { pending = false; applyRowTones(doc) })
    }).observe(doc.body, { childList: true, subtree: true })
  }

  // ── cabecera de ficha FIJA y compacta al hacer scroll (la «business card» de OPERA) ─────────────
  /** Marca el body con mateu-scrolled en cuanto la página deja la cabecera atrás: app.css pinta la
   *  banda .mateu-sticky-header compacta (menos aire, sin tira, con sombra). */
  function installStickyHeader(win = typeof window !== 'undefined' ? window : null) {
    if (!win || win.__mateuStickyHeader) return
    win.__mateuStickyHeader = true
    let on = false
    win.addEventListener('scroll', () => {
      const now = win.scrollY > 48
      if (now !== on) { on = now; win.document.body.classList.toggle('mateu-scrolled', now) }
    }, { passive: true })
  }


  // The FIELD TYPE catalogue on the Redwood side — the twin of libs/mateu expander/fieldTypes.ts and
  // of the server's FieldTypeResolver. A field type (`specs/ui/types.yaml`) names a domain concept
  // (OrderStatus, Money, Email) and the attributes it has as a field or a column; a FormField /
  // GridColumn references one with `fieldType: <id>`.
  //
  // The Redwood renderer normally receives a wire that is already resolved (the server's YAML loader,
  // or the browser expander of libs/mateu, applies the types before anything becomes a component).
  // It resolves them itself only where it can be handed an unresolved tree: the visual editor's canvas,
  // whose increment may come from a backend that does not know the project's types.yaml. The rule is
  // the same on every side:
  //   1. any OBJECT carrying a string `fieldType` is a reference;
  //   2. every attribute the type declares is copied onto it UNLESS the object already declares that
  //      attribute with a non-null value — the type supplies defaults, the field's own win;
  //   3. the `fieldType` key is removed (the wire never carries it);
  //   4. an unknown type is warned about once and the object rendered as declared.

  let fieldTypes = []

  /** Replaces the catalogue (the editor's render message, a manifest). */
  function setFieldTypeCatalogue(incoming) {
    fieldTypes = Array.isArray(incoming)
      ? incoming.filter((t) => t && typeof t.id === 'string' && t.id.trim() !== '')
      : []
  }

  /** The current catalogue — for tests and diagnostics. */
  const fieldTypeCatalogue = () => fieldTypes

  /** The attributes a type may supply — FieldTypeEntry's components, exactly. */
  const FIELD_TYPE_ATTRIBUTES = [
    'label', 'dataType', 'stereotype', 'placeholder', 'description', 'required', 'readOnly',
    'options', 'optionsSource', 'min', 'max', 'step', 'colspan', 'style', 'cssClasses',
    'align', 'width', 'autoWidth', 'tones',
  ]

  /** What each target can carry: a GridColumn has no `options`, a FormField no `tones`. */
  const FIELD_TYPE_TARGETS = {
    GridColumn: ['label', 'dataType', 'stereotype', 'style', 'cssClasses', 'align', 'width', 'autoWidth', 'tones'],
    FormField: ['label', 'dataType', 'stereotype', 'placeholder', 'description', 'required', 'readOnly',
      'options', 'optionsSource', 'min', 'max', 'step', 'colspan', 'style', 'cssClasses'],
  }

  /** Empty values supply nothing (the server serialises a type NON_EMPTY). */
  const fieldTypeValueIsEmpty = (v) => v === undefined || v === null || v === ''
    || (Array.isArray(v) && v.length === 0)
    || (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)

  const mentionsFieldType = (node) => {
    if (Array.isArray(node)) return node.some(mentionsFieldType)
    if (!node || typeof node !== 'object') return false
    if (typeof node.fieldType === 'string') return true
    return Object.keys(node).some((k) => mentionsFieldType(node[k]))
  }

  const warnedFieldTypes = new Set()

  /**
   * A copy of `tree` with every `fieldType` reference resolved against `catalogue` (the module's
   * table when omitted). Returned AS IS when it references no type.
   */
  function resolveFieldTypes(tree, catalogue = fieldTypes) {
    if (!mentionsFieldType(tree)) return tree
    const byId = new Map((catalogue || []).map((t) => [String(t.id).trim(), t]))
    const walk = (node) => {
      if (Array.isArray(node)) return node.map(walk)
      if (!node || typeof node !== 'object') return node
      const out = {}
      for (const k of Object.keys(node)) {
        if (k !== 'fieldType') out[k] = walk(node[k])
      }
      const ref = node.fieldType
      if (typeof ref === 'string') {
        const type = byId.get(ref.trim())
        if (!type) {
          if (!warnedFieldTypes.has(ref)) {
            warnedFieldTypes.add(ref)
            try { console.warn("mateu: unknown field type '" + ref + "' (on '" + String(out.id == null ? '' : out.id) + "') — rendered as declared") } catch (e) { /* no console */ }
          }
        } else {
          const allowed = FIELD_TYPE_TARGETS[String(out.type == null ? '' : out.type)] || FIELD_TYPE_ATTRIBUTES
          for (const attr of allowed) {
            const value = type[attr]
            if (fieldTypeValueIsEmpty(value)) continue
            if (out[attr] === undefined || out[attr] === null) out[attr] = JSON.parse(JSON.stringify(value))
          }
        }
      }
      return out
    }
    return walk(tree)
  }

  /** The types of a types.yaml document (already parsed): a `types:` envelope or a bare list. */
  function fieldTypesOf(doc) {
    const list = Array.isArray(doc) ? doc : (doc && Array.isArray(doc.types) ? doc.types : [])
    return list.filter((t) => t && typeof t === 'object' && typeof t.id === 'string' && t.id.trim() !== '')
  }


  // REST SOURCES on the Redwood renderer — the twin of libs/mateu's restSourceCatalogue.ts +
  // externalOptions.ts + restRowFilters.ts, and of the surfaces that consume them there
  // (mateu-table-crud `_fetchRowsFromRest`, mateu-field's options, mateu-component `handleRestAction`).
  // Nothing of that core is shared with this renderer, so every guarantee is restated here.
  //
  // A surface may read or write somebody else's endpoint instead of a Mateu action:
  //   - a listing's `rowsSource` (its rows),
  //   - a field's `optionsSource` (its options),
  //   - an action's `restAction` (a write, or the route's `data:` load: the synthetic `__restdata__`).
  // Each names its endpoint INLINE or BY REF to the app's catalogue (`sources.yaml`, travelling as
  // AppDto.restSources or the bundle manifest's `sources`), and the surface's own declared values win
  // over the entry's. The call goes either DIRECT (fetch in the browser) or PROXIED (the reserved
  // `__restfetch__` server action, so no CORS and the server injects `${secret.X}`), and the choice
  // is read off the RESOLVED source — a by-ref surface carries nothing but the name.
  //
  // SAMPLE MODE (the opt-in rule is the same everywhere): a source carrying `sample:` answers with it
  // INSTEAD of calling the endpoint — only when the app metadata or a manifest says `mockSources: true`,
  // or in the visual editor's canvas (editorPreview.mjs). Then a read gets a copy of the sample, a write
  // succeeds with nothing persisted (null), nothing is proxied, and a listing searches, filters, sorts
  // and pages the sample in memory whatever totalPath it declares.
  //
  // The hook into the transport is `restAnswerOf` (called by runMateuAction before anything goes to
  // the server): it answers `search` on a listing with a rowsSource and any action declaring a
  // restAction with an increment built here, shaped like the server's — so the reducer and the chains
  // do not know the rows came from elsewhere. Field options load in `loadRestOptions` (from
  // loadLookups). Pure except the default fetch, which every function takes as an argument.




  // ── the catalogue ─────────────────────────────────────────────────────────────────────────────

  let restCatalogue = []
  let restSampleMode = false

  /** Replaces the catalogue (app metadata, a bundle manifest, the editor's render message). A replace,
   *  not a merge: a stale entry surviving a deployment change is the failure the indirection removes. */
  function setRestSourceCatalogue(incoming) {
    restCatalogue = Array.isArray(incoming) ? incoming.filter((e) => e && typeof e.name === 'string') : []
  }

  /** The entry with this name, or undefined. */
  const getRestSource = (name) => (name ? restCatalogue.find((e) => e.name === name) : undefined)

  /** Everything in the catalogue — diagnostics and tests. */
  const restSourceCatalogue = () => restCatalogue

  const restBlank = (v) => v === undefined || v === null || v === ''

  /** A descriptor with its reference filled in from the catalogue; what the surface declares wins.
   *  An inline descriptor (or an unknown ref, warned about) comes back as declared. */
  function resolveRestSource(source) {
    if (!source || !source.ref) return source
    const entry = getRestSource(source.ref)
    if (!entry || !entry.source) {
      try { console.warn('mateu: no REST source named "' + source.ref + '" in the app\'s catalogue') } catch (e) { /* no console */ }
      return source
    }
    const from = entry.source
    return {
      ...source,
      url: restBlank(source.url) ? from.url : source.url,
      method: restBlank(source.method) ? from.method : source.method,
      headers: source.headers && Object.keys(source.headers).length > 0 ? source.headers : from.headers,
      body: restBlank(source.body) ? from.body : source.body,
      itemsPath: restBlank(source.itemsPath) ? from.itemsPath : source.itemsPath,
      valuePath: restBlank(source.valuePath) ? from.valuePath : source.valuePath,
      labelPath: restBlank(source.labelPath) ? from.labelPath : source.labelPath,
      proxy: !!(source.proxy || from.proxy),
      sample: source.sample !== undefined && source.sample !== null
        ? source.sample
        : (entry.sample !== undefined && entry.sample !== null ? entry.sample : from.sample),
    }
  }

  /** Turns sample mode on (or off: only the tests do). The app and a manifest only ever switch it ON. */
  function setSampleMode(on) { restSampleMode = !!on }

  /** Whether sources carrying sample data answer with it. */
  const isSampleMode = () => restSampleMode

  /** The sample a source answers with in sample mode; undefined when it is not answered from one. */
  function sampleOf(source) {
    if (!restSampleMode || !source) return undefined
    const resolved = resolveRestSource(source)
    return resolved && resolved.sample !== null ? resolved.sample : undefined
  }

  /** True when this source is answered from its sample (neither fetched nor proxied). */
  const isSampled = (source) => sampleOf(source) !== undefined

  /** Whether the call goes through the Mateu server: the RESOLVED `proxy`, unless sampled. */
  const viaProxy = (source) => !!source && !!(resolveRestSource(source) || {}).proxy && !isSampled(source)

  /** The dot path a column/field is read by, honouring the referenced entry's field map. */
  function pathOfField(source, fieldName) {
    const entry = getRestSource(source && source.ref)
    const mapped = entry && entry.fields ? entry.fields[fieldName] : undefined
    return mapped ? mapped : fieldName
  }

  /** The referenced entry's total path (the source pages server-side), or undefined. */
  const totalPathOf = (source) => {
    const entry = getRestSource(source && source.ref)
    return (entry && entry.totalPath) || undefined
  }

  /** The App metadata of an increment (bootstrap: a root App, or the App child of a ServerSide). */
  function appMetadataOf(increment) {
    for (const f of (increment && increment.fragments) || []) {
      const c = f && f.component
      if (!c) continue
      if (c.metadata && c.metadata.type === 'App') return c.metadata
      for (const child of c.children || []) {
        if (child && child.metadata && child.metadata.type === 'App') return child.metadata
      }
    }
    return null
  }

  /** Adopts the catalogue an App carries (AppDto.restSources) and its sample-mode opt-in
   *  (AppDto.mockSources — only ever switches sample mode ON). Returns the increment. */
  function adoptAppSources(increment) {
    const app = appMetadataOf(increment)
    if (!app) return increment
    if (Array.isArray(app.restSources)) setRestSourceCatalogue(app.restSources)
    if (app.mockSources) setSampleMode(true)
    return increment
  }

  /** Adopts a static bundle's manifest: its `sources` table and its `mockSources` flag. */
  function adoptManifestSources(manifest) {
    if (!manifest) return
    const sources = manifest.sources && Array.isArray(manifest.sources.sources) ? manifest.sources.sources
      : (Array.isArray(manifest.sources) ? manifest.sources : null)
    if (sources) setRestSourceCatalogue(sources)
    if (manifest.mockSources) setSampleMode(true)
  }

  // ── shaping a response ────────────────────────────────────────────────────────────────────────

  /** Navigates a dot path (`data.items`) into a JSON value; an empty path is identity. */
  function getByPath(obj, path) {
    if (!path) return obj
    return String(path).split('.').reduce((acc, key) => (acc != null && typeof acc === 'object' ? acc[key] : undefined), obj)
  }

  /** A response as options: `itemsPath` to the array, `valuePath`/`labelPath` of each item; a primitive
   *  element is its own value and label, a half-specified mapping falls back to the other half. */
  function mapItemsToOptions(json, itemsPath, valuePath, labelPath) {
    const arr = getByPath(json, itemsPath)
    if (!Array.isArray(arr)) return []
    const vp = valuePath || 'value'
    const lp = labelPath || 'label'
    return arr.map((item) => {
      if (item != null && typeof item === 'object') {
        const value = getByPath(item, vp)
        const label = getByPath(item, lp)
        return { value: value != null ? value : label, label: String(label != null ? label : (value != null ? value : '')) }
      }
      return { value: item, label: String(item) }
    })
  }

  /** A response as listing rows keyed by column id; `pathOf` maps a column to the path it reads. */
  function mapItemsToRows(json, itemsPath, columnIds, pathOf = (id) => id) {
    const arr = getByPath(json, itemsPath)
    if (!Array.isArray(arr)) return []
    return arr.map((item) => {
      const row = {}
      for (const id of columnIds) row[id] = getByPath(item, pathOf(id))
      return row
    })
  }

  /** Rows + total of an already fetched response (shared by the direct and the proxied legs). */
  function restPageOf(json, source, columnIds) {
    const resolved = resolveRestSource(source) || {}
    const rows = mapItemsToRows(json, resolved.itemsPath, columnIds, (id) => pathOfField(source, id))
    const raw = getByPath(json, totalPathOf(source))
    const total = typeof raw === 'number' ? raw : Number(raw)
    return { rows, total: raw != null && Number.isFinite(total) ? total : null }
  }

  // ── interpolation: `${state.x}`, `${data.x}`, `${row.x}`, `${appState.x}` ──────────────────────

  const REST_EXPRESSION = /\$\{([^}]*)\}/g

  /** The value an expression names in the scope ({state, data, row, appState, appData}). */
  function restScopeValue(expr, scope) {
    const path = String(expr).trim().replace(/\[\s*['"]([^'"\]]+)['"]\s*\]/g, '.$1')
    const parts = path.split('.').filter((p) => p !== '')
    if (!parts.length) return undefined
    let value = scope && Object.prototype.hasOwnProperty.call(scope, parts[0]) ? scope[parts[0]] : undefined
    for (const part of parts.slice(1)) value = value != null && typeof value === 'object' ? value[part] : undefined
    return value
  }

  const restText = (v) => (v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v))

  /** Interpolates a header or a body; `escape` maps each value (the JSON escaping of a JSON body). */
  function interpolateRest(text, scope, escape = (s) => s) {
    if (text == null || String(text).indexOf('${') < 0) return text
    return String(text).replace(REST_EXPRESSION, (all, expr) => escape(restText(restScopeValue(expr, scope))))
  }

  /**
   * Interpolates a url with each value encoded BY POSITION — the server's TemplateInterpolator
   * .interpolateUrl, so the direct and the proxied legs reach the same url: raw in the origin (and a
   * `${state…}` there is refused: the client state must not choose the host), a path segment in the
   * path (a dot segment refused), a query component after a literal `?`/`#`. Throws when refused.
   */
  function interpolateRestUrl(text, scope) {
    if (text == null || String(text).indexOf('${') < 0) return text
    const src = String(text)
    let out = ''
    let literal = ''
    let last = 0
    let originOpen = false
    let first = true
    REST_EXPRESSION.lastIndex = 0
    let m
    while ((m = REST_EXPRESSION.exec(src)) !== null) {
      const lit = src.slice(last, m.index)
      if (first && lit.indexOf('://') >= 0) originOpen = true
      if (originOpen) {
        const from = literal === '' ? lit.indexOf('://') + 3 : 0
        if (/[/?#]/.test(lit.substring(from))) originOpen = false
      }
      literal += lit
      out += lit
      const value = restText(restScopeValue(m[1], scope))
      if (originOpen || (first && lit === '')) {
        if (/^\s*state\b/.test(m[1])) throw new Error('A client state value cannot choose the origin of a URL: ' + src)
        out += value
      } else if (/[?#]/.test(literal)) {
        out += encodeURIComponent(value)
      } else {
        if (value === '.' || value === '..') throw new Error('A dot segment is not a valid path value: ' + value)
        out += encodeURIComponent(value)
      }
      first = false
      last = REST_EXPRESSION.lastIndex
    }
    return out + src.slice(last)
  }

  /** Escapes a value for the inside of a JSON string (no surrounding quotes: the template wrote them). */
  function jsonEscape(value) {
    let out = ''
    for (const ch of String(value)) {
      switch (ch) {
        case '"': out += '\\"'; break
        case '\\': out += '\\\\'; break
        case '\n': out += '\\n'; break
        case '\r': out += '\\r'; break
        case '\t': out += '\\t'; break
        case '\b': out += '\\b'; break
        case '\f': out += '\\f'; break
        default: out += ch < ' ' ? '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0') : ch
      }
    }
    return out
  }

  /** Whether a request declares a JSON body (its values then need escaping). */
  function declaresJson(headers) {
    return !!headers && Object.keys(headers).some((name) => name.toLowerCase() === 'content-type'
      && String(headers[name] || '').toLowerCase().indexOf('json') >= 0)
  }

  // ── the direct leg ────────────────────────────────────────────────────────────────────────────

  const restClone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)))

  const defaultRestFetch = (url, init) => fetch(url, init)

  /**
   * Fetches a source in the browser — the single choke point of every surface (= fetchExternalJson).
   * In sample mode a sampled read answers a copy of its sample and a write null, with no network.
   * Throws on a non-2xx (the error carries `status`); a 204/205 or an empty body is null.
   */
  async function fetchRestJson(declared, scope = {}, fetchImpl = defaultRestFetch) {
    const source = resolveRestSource(declared) || {}
    const method = String(source.method || 'GET').toUpperCase()
    if (isSampled(declared)) {
      if (method !== 'GET' && method !== 'HEAD') return null
      return restClone(sampleOf(declared))
    }
    if (!source.url) throw new Error('External REST fetch has no url' + (declared && declared.ref ? ' (unknown source "' + declared.ref + '")' : ''))
    const url = interpolateRestUrl(source.url, scope)
    const headers = {}
    for (const k of Object.keys(source.headers || {})) headers[k] = interpolateRest(source.headers[k], scope)
    const init = { method, headers }
    if (method !== 'GET' && method !== 'HEAD' && source.body) {
      init.body = interpolateRest(source.body, scope, declaresJson(headers) ? jsonEscape : undefined)
    }
    const res = await fetchImpl(url, init)
    if (!res.ok) {
      const err = new Error('External REST fetch failed: ' + res.status)
      err.status = res.status
      throw err
    }
    if (res.status === 204 || res.status === 205) return null
    if (typeof res.text !== 'function') return res.json()
    const text = await res.text()
    return text.trim() === '' ? null : JSON.parse(text)
  }

  // ── in-memory search, filters and sort (an unpaged endpoint, or a sample) ─────────────────────

  const restFilterBlank = (v) => v === undefined || v === null || v === '' || (typeof v === 'number' && Number.isNaN(v))

  const restMultiValues = (raw) => {
    if (Array.isArray(raw)) return raw.map(String)
    if (typeof raw === 'string' && raw !== '') return raw.split(',').map((v) => v.trim()).filter((v) => v)
    return []
  }

  const restWithinRange = (cell, from, to, numeric) => {
    if (numeric) {
      const value = Number(cell)
      if (cell === '' || cell == null || Number.isNaN(value)) return false
      if (!restFilterBlank(from) && value < Number(from)) return false
      if (!restFilterBlank(to) && value > Number(to)) return false
      return true
    }
    const text = cell == null ? '' : String(cell)
    if (text === '') return false
    if (!restFilterBlank(from) && text < String(from)) return false
    if (!restFilterBlank(to) && text > String(to)) return false
    return true
  }

  function restMatchesFilter(row, field, state) {
    const id = field.fieldId
    if (!id) return true
    const cell = row[id]
    if (field.stereotype === 'dateRange' || field.stereotype === 'numberRange') {
      const from = state[id + '_from']
      const to = state[id + '_to']
      if (restFilterBlank(from) && restFilterBlank(to)) return true
      return restWithinRange(cell, from, to, field.stereotype === 'numberRange')
    }
    if (field.stereotype === 'multiSelect') {
      const wanted = restMultiValues(state[id])
      if (!wanted.length) return true
      return wanted.indexOf(String(cell == null ? '' : cell)) >= 0
    }
    const value = state[id]
    if (restFilterBlank(value)) return true
    if (field.dataType === 'boolean' || field.dataType === 'bool' || field.stereotype === 'checkbox' || field.stereotype === 'toggle') {
      const wanted = typeof value === 'boolean' ? value : String(value).toLowerCase() === 'true'
      const actual = typeof cell === 'boolean' ? cell : String(cell == null ? '' : cell).toLowerCase() === 'true'
      return wanted === actual
    }
    // an option list is a pick, not a prefix: "male" must not also match "female"
    if (((field.options || []).length) > 0) return String(cell == null ? '' : cell) === String(value)
    return String(cell == null ? '' : cell).toLowerCase().indexOf(String(value).toLowerCase()) >= 0
  }

  /** Rows reduced by the free-text search (over `columnIds`) and every declared filter (= filterExternalRows). */
  function filterRestRows(rows, columnIds, filters, state) {
    const st = state || {}
    const searchText = String(st.searchText == null ? '' : st.searchText).trim().toLowerCase()
    const declared = (filters || []).map((f) => (f && f.metadata) || f).filter((f) => f && f.fieldId)
    if (searchText === '' && !declared.length) return rows
    return rows.filter((row) => {
      if (searchText !== '' && !columnIds.some((id) => String(row[id] == null ? '' : row[id]).toLowerCase().indexOf(searchText) >= 0)) return false
      return declared.every((field) => restMatchesFilter(row, field, st))
    })
  }

  /** Rows sorted by `[{field|fieldId, direction}]` in order (= sortExternalRows); blanks last. */
  function sortRestRows(rows, sort) {
    const keys = (Array.isArray(sort) ? sort : [])
      .map((s) => ({ id: (s && (s.fieldId || s.field)) || '', desc: !!s && (s.direction === 'descending' || s.direction === 'desc') }))
      .filter((k) => k.id !== '')
    if (!keys.length) return rows
    const compare = (a, b) => {
      const ab = restFilterBlank(a)
      const bb = restFilterBlank(b)
      if (ab || bb) return ab === bb ? 0 : ab ? 1 : -1
      if (typeof a === 'number' && typeof b === 'number') return a - b
      return String(a).localeCompare(String(b), undefined, { sensitivity: 'base', numeric: true })
    }
    return rows.slice().sort((x, y) => {
      for (const k of keys) {
        const c = compare(x[k.id], y[k.id])
        if (c !== 0) return k.desc ? -c : c
      }
      return 0
    })
  }

  // ── the listing ───────────────────────────────────────────────────────────────────────────────

  /** The listing (Crud metadata) of a context's surface that reads its rows from a REST source. */
  function restListingOf(ctx) {
    const node = ctx && ctx.tree ? findFirst(ctx.tree, (n) => n && n.metadata && n.metadata.type === 'Crud') : null
    return node && node.metadata && node.metadata.rowsSource ? node : null
  }

  /** The fields a `rowRoute` template reads off the row (`people/${row.id}` → ['id']). */
  function rowRouteFieldsOf(template) {
    const out = []
    String(template || '').replace(/\$\{\s*row\.([A-Za-z0-9_$.]+)\s*\}/g, (all, path) => { out.push(path.split('.')[0]); return all })
    return out
  }

  /** What a REST row carries: the columns, plus what the rowRoute needs to address the record. */
  function restColumnIdsOf(md) {
    const ids = (md.columns || []).map((c) => (c && c.metadata ? c.metadata.id || c.id : c && c.id)).filter(Boolean)
    for (const id of rowRouteFieldsOf(md.rowRoute)) if (ids.indexOf(id) < 0) ids.push(id)
    return ids
  }

  /** The identifier column (stable `_rowNumber` across pages), if the listing declares one. */
  const restIdentifierOf = (md) => {
    const col = (md.columns || []).map((c) => (c && c.metadata) || c).find((c) => c && c.identifier)
    return col ? col.id : undefined
  }

  const restIncrement = (fragments, messages = [], commands = []) => ({ commands, messages, fragments })

  /** The page of a listing, as the server's `search` answers it (a data-only fragment, data.crud.page). */
  function restListingPage(md, fetched, total, state, serverPaged) {
    const columnIds = restColumnIdsOf(md)
    const identifier = restIdentifierOf(md)
    const rows = fetched.map((row, index) => ({
      ...row,
      _rowNumber: identifier != null && row[identifier] != null ? String(row[identifier]) : '_row:' + index,
    }))
    const st = state || {}
    const page = Number(st.page || 0)
    const serverAnswered = serverPaged && total != null
    const filtered = serverAnswered ? rows : sortRestRows(filterRestRows(rows, columnIds, md.filters, st), st.sort)
    const declaredSize = Number(md.pageSize) > 0 ? Number(md.pageSize) : Number(st.size) > 0 ? Number(st.size) : 0
    const size = declaredSize > 0 ? declaredSize : (filtered.length || 1)
    const content = serverAnswered ? filtered : filtered.slice(page * size, page * size + size)
    return { totalElements: serverAnswered ? total : filtered.length, pageSize: size, pageNumber: page, content }
  }

  /**
   * Answers the listing's `search`: the rows of its rowsSource — proxied through `__restfetch__`
   * (`_sourceKind: rows`) when the resolved source says so, direct otherwise; searched, filtered,
   * sorted and paged in memory unless the source pages server-side (declares a totalPath and is not
   * sampled). Resolves to the increment the reducer merges.
   */
  async function restRowsIncrement(ctx, node, componentState, opts = {}) {
    const md = node.metadata || node
    const src = md.rowsSource
    const columnIds = restColumnIdsOf(md)
    const sampled = isSampled(src)
    const serverPaged = totalPathOf(src) != null && !sampled
    let fetched = []
    let total = null
    try {
      if (viaProxy(src) && opts.server) {
        const inc = await opts.server({ _sourceKind: 'rows', _sourceId: node.id || 'crud' }, true)
        const appData = (inc && inc.appData) || {}
        if (appData._restfetchError) throw new Error('proxied rows failed')
        ;({ rows: fetched, total } = restPageOf(appData._restfetch, src, columnIds))
      } else {
        const json = await fetchRestJson(src, { state: componentState || {}, data: (ctx && ctx.data) || {}, appState: opts.appState || {} }, opts.fetchImpl)
        ;({ rows: fetched, total } = restPageOf(json, src, columnIds))
      }
    } catch (e) {
      try { console.warn('mateu: external rows fetch failed', e) } catch (ignored) { /* no console */ }
      fetched = []
      total = null
    }
    const page = restListingPage(md, fetched, total, componentState, serverPaged)
    return restIncrement([{ targetComponentId: (ctx && ((ctx.tree && ctx.tree.id) || ctx.id)) || '', data: { crud: { page } } }])
  }

  // ── field options ─────────────────────────────────────────────────────────────────────────────

  /** The fields of a context with an optionsSource whose options are not loaded for the current url. */
  function restOptionFieldsOf(ctx, scope) {
    if (!ctx || !ctx.tree) return []
    const data = ctx.data || {}
    const out = []
    const seen = {}
    for (const f of collectFields(ctx.tree)) {
      if (!f.optionsSource || seen[f.fieldId]) continue
      seen[f.fieldId] = true
      const resolved = resolveRestSource(f.optionsSource) || {}
      let signature
      try { signature = (isSampled(f.optionsSource) ? 'sample:' : '') + String(interpolateRestUrl(resolved.url || resolved.ref || f.optionsSource.ref || '', scope)) } catch (e) { signature = 'refused' }
      const held = data[f.fieldId]
      if (held && held[LOOKUP_LOADED] && held.sourceSignature === signature) continue
      out.push({ field: f, signature })
    }
    return out
  }

  /**
   * Loads the options of every field of the context backed by an optionsSource (direct, or proxied
   * through `__restfetch__` with `_sourceKind: options`) into ctx.data[fieldId].content — where
   * optionsOf reads a select's options. Refetched only when the interpolated url changes. A source
   * that fails leaves the field with no options (and is not retried until its url changes).
   */
  async function loadRestOptions(reg, ctxId, opts = {}) {
    const ctx = reg && reg.contexts && reg.contexts[ctxId]
    if (!ctx) return reg
    const state = { ...(ctx.state || {}), ...(opts.draft || {}) }
    const scope = { state, data: ctx.data || {}, appState: opts.appState || {} }
    const pending = restOptionFieldsOf(ctx, scope)
    if (!pending.length) return reg
    const loaded = await Promise.all(pending.map(async ({ field, signature }) => {
      const src = field.optionsSource
      const resolved = resolveRestSource(src) || {}
      let content = []
      try {
        let json
        if (viaProxy(src) && opts.server) {
          const inc = await opts.server({ _sourceKind: 'options', _sourceId: field.fieldId }, true)
          const appData = (inc && inc.appData) || {}
          if (appData._restfetchError) throw new Error('proxied options failed')
          json = appData._restfetch
        } else {
          json = await fetchRestJson(src, scope, opts.fetchImpl)
        }
        content = mapItemsToOptions(json, resolved.itemsPath, resolved.valuePath, resolved.labelPath)
      } catch (e) {
        try { console.warn('mateu: external options fetch failed', e) } catch (ignored) { /* no console */ }
      }
      return { fieldId: field.fieldId, value: { content, totalElements: content.length, sourceSignature: signature, [LOOKUP_LOADED]: true } }
    }))
    const now = reg.contexts[ctxId]
    const data = { ...(now.data || {}) }
    for (const { fieldId, value } of loaded) data[fieldId] = value
    return { ...reg, contexts: { ...reg.contexts, [ctxId]: { ...now, data } } }
  }

  // ── REST actions (and the route's `data:` load, `__restdata__`) ──────────────────────────────

  /** The restAction a context declares for this action id, or null. */
  function restActionOf(ctx, actionId) {
    const action = declaredActionOf(ctx, actionId)
    return action && action.restAction && action.restAction.source ? action.restAction : null
  }

  const restRouteOf = (r) => String(r || '').replace(/^\/+/, '').replace(/\/+$/, '').split('?')[0]

  /**
   * Runs a restAction (= mateu-component handleRestAction) and answers with the increment the
   * reducer applies: on success the object at `resultPath` merged into the surface's state, the
   * interpolated `successMessage` as a toast and `successRoute` as a navigation (back to the route
   * already on screen: a re-run of the listing's search instead, or nothing would refresh); on
   * failure an error toast and nothing else. `forEachSelectedRow` runs once per checked row
   * (crud_selected_items) — in the browser for a direct source, as ONE proxied call otherwise.
   */
  async function runRestAction(ctx, actionId, rest, componentState, opts = {}) {
    const state = componentState || (ctx && ctx.state) || {}
    const data = (ctx && ctx.data) || {}
    const target = (ctx && ((ctx.tree && ctx.tree.id) || ctx.id)) || ''
    const kind = actionId === '__restdata__' ? 'data' : 'action'
    const isProxy = viaProxy(rest.source) && !!opts.server
    const failure = (status) => restIncrement([], [{ variant: 'error', text: 'Request failed' + (status > 0 ? ' (HTTP ' + status + ')' : '') }])
    const success = (json, mergeResult) => {
      const fragments = []
      let merged = state
      if (mergeResult && rest.resultPath != null) {
        const value = getByPath(json, rest.resultPath)
        if (value && typeof value === 'object') {
          merged = { ...state, ...value }
          fragments.push({ targetComponentId: target, state: value })
        }
      }
      const scope = { state: merged, data, appState: opts.appState || {} }
      const messages = []
      const commands = []
      const msg = interpolateRest(rest.successMessage, scope)
      if (msg) messages.push({ variant: 'success', text: msg })
      const route = interpolateRest(rest.successRoute, scope)
      if (route && route.indexOf('${') < 0) {
        if (opts.route != null && restRouteOf(route) === restRouteOf(opts.route)) {
          commands.push({ targetComponentId: target, type: 'RunAction', data: { actionId: 'search' } })
        } else {
          commands.push({ targetComponentId: target, type: 'NavigateTo', data: route })
        }
      }
      return restIncrement(fragments, messages, commands)
    }
    const fromProxy = (inc, mergeResult) => {
      const appData = (inc && inc.appData) || {}
      const err = appData._restfetchError
      if (err) return failure(typeof err.status === 'number' ? err.status : 0)
      return success(appData._restfetch, mergeResult)
    }

    if (rest.forEachSelectedRow) {
      const rows = state.crud_selected_items || []
      if (!rows.length) return restIncrement([], [{ variant: 'warning', text: 'Select rows first' }])
      try {
        if (isProxy) return fromProxy(await opts.server({ _sourceKind: kind, _sourceId: actionId, _forEachSelectedRow: true }, false), false)
        await Promise.all(rows.map((row) => fetchRestJson(rest.source, { state: { ...state, ...row }, row, data, appState: opts.appState || {} }, opts.fetchImpl)))
        return success(null, false)
      } catch (e) {
        return failure(e && e.status)
      }
    }
    try {
      if (isProxy) return fromProxy(await opts.server({ _sourceKind: kind, _sourceId: actionId }, kind === 'data'), true)
      const json = await fetchRestJson(rest.source, { state, data, appState: opts.appState || {} }, opts.fetchImpl)
      return success(json, true)
    } catch (e) {
      try { console.warn('mateu: rest action failed', e) } catch (ignored) { /* no console */ }
      return failure(e && e.status)
    }
  }

  // ── the transport hook ────────────────────────────────────────────────────────────────────────

  /**
   * Whether an action of this context is answered from a REST source — and then the promise of its
   * increment; null when it is an ordinary Mateu action (it goes to the server as always).
   *
   * @param opts.server (parameters, idempotent) → Promise<increment>: the `__restfetch__` round trip
   * @param opts.route the route on screen (a successRoute back to it refreshes instead of navigating)
   */
  function restAnswerOf(ctx, actionId, componentState, opts = {}) {
    if (!ctx || !actionId) return null
    const rest = restActionOf(ctx, actionId)
    if (rest) return runRestAction(ctx, actionId, rest, componentState, opts)
    if (actionId === 'search') {
      const node = restListingOf(ctx)
      if (node) return restRowsIncrement(ctx, node, componentState || ctx.state || {}, opts)
    }
    return null
  }


  // Static-bundle "no backend" mode for the VB/Redwood renderer — the same contract as the web
  // renderers' libs/mateu (bundleStore.ts), rewritten for THIS core (which shares nothing with them:
  // here the transport is `fetch` in transport.mjs, not axios). A build-time exporter (Mateu's
  // `mateu:bundle` goal) OR the runtime endpoint (GET /mateu/v3/bundle) renders each declared route's
  // initial load (actionId '') to wire JSON and writes a manifest.json; when a bundle is present we
  // answer route LOADS from it instead of POSTing to the server, so the VB app runs from static
  // assets with no backend. Live data still comes from external endpoints; ACTIONS still need a
  // backend (they fall through to the normal transport).
  //
  // Pure except loadBundleManifest, so test.mjs can exercise it in Node with a fetch double.

  // syncPath → parsed increment, for the routes that exported OK. undefined = no bundle loaded.
  let increments
  // syncPath → the route's CONTENT load, for the routes under an app shell: under a mount whose root
  // is an app shell the exporter's `json` is the SHELL aimed at the route (the fresh load of a deep
  // link) and `contentJson` the route's own screen. This core always loads a route INTO the shell it
  // already booted, so answering that with `json` would paint a shell inside the shell (#557).
  let contents = new Map()
  // :param route TEMPLATES: a compiled matcher + param names + the pre-rendered structure.
  let templates = []
  // The in-flight manifest load (if any), so a route load can await it before hitting the backend.
  let pending
  // The mount's authored route registry, as shipped in the manifest: a statically deployed mount has
  // no server left to ask what a URL means, so the parameters a route pins or seeds travel as data.
  let routeEntries = []

  /** The `:name` segments of a route pattern, in order. */
  const paramNamesOf = (route) =>
    route.split('/').filter((s) => s.startsWith(':') && s.length > 1).map((s) => s.substring(1))

  const normRoute = (s) => (s || '').replace(/^\/+/, '').replace(/\/+$/, '')

  /** The registry entry answering a concrete path, plus the path params read off it. Static routes
   *  before parameterised ones (so `orders/new` is never swallowed by `orders/:id`) and, among
   *  parameterised matches, the most specific — matching must not depend on declaration order.
   *  Mirrors the server's RouteTable.match and the web's bundleStore. */
  function matchRouteEntry(path) {
    const target = normRoute(path === '_no_route' ? '' : path)
    const targetSegments = target === '' ? [] : target.split('/')
    let best
    for (const entry of routeEntries) {
      const pattern = normRoute(entry.route)
      const patternSegments = pattern === '' ? [] : pattern.split('/')
      if (patternSegments.length !== targetSegments.length) continue
      const pathParams = {}
      let matches = true
      for (let i = 0; i < patternSegments.length; i++) {
        const seg = patternSegments[i]
        if (seg.startsWith(':') && seg.length > 1) pathParams[seg.substring(1)] = targetSegments[i]
        else if (seg !== targetSegments[i]) { matches = false; break }
      }
      if (!matches) continue
      if (!best || paramNamesOf(pattern).length < paramNamesOf(normRoute(best.entry.route)).length) {
        best = { entry, pathParams }
      }
    }
    return best
  }

  /** Applies the registry's parameters to a pre-rendered increment, in the SAME order the server and
   *  the web renderers use — otherwise one route would behave differently depending on which renderer
   *  and whether a backend happens to be present:
   *
   *    fixed  >  path  >  what the increment already carries  >  defaults
   *
   *  Untouched (same reference) when no entry answers the path. */
  function applyRouteParams(syncPath, increment) {
    const match = matchRouteEntry(syncPath)
    if (!match) return increment
    const defaults = match.entry.defaultParams || {}
    const fixed = match.entry.fixedParams || {}
    const pathParams = match.pathParams
    if (!Object.keys(defaults).length && !Object.keys(fixed).length && !Object.keys(pathParams).length) {
      return increment
    }
    return {
      ...increment,
      fragments: (increment.fragments || []).map((f) => ({
        ...f,
        state: { ...defaults, ...(f.state || {}), ...pathParams, ...fixed },
        data: { ...defaults, ...(f.data || {}), ...pathParams, ...fixed },
      })),
    }
  }

  /** The registry entry answering a path, for callers that need its definition or view model. */
  const getRouteEntry = (syncPath) => {
    const m = matchRouteEntry(syncPath)
    return m ? m.entry : undefined
  }

  /** The `/mateu/v3/sync/<seg>` path segment for a route — mirrors transport.callMateu and the web:
   *  leading slash stripped, blank/root → `_no_route`. */
  function toSyncPath(route) {
    const r = route && route.startsWith('/') ? route.substring(1) : (route || '')
    return r === '' ? '_no_route' : r
  }

  /** Load the bundle manifest once. A miss/malformed manifest silently leaves bundle mode OFF (the
   *  app falls back to the backend at baseUrl). */
  function loadBundleManifest(url, fetchImpl) {
    const f = fetchImpl || (typeof fetch !== 'undefined' ? fetch : null)
    pending = (async () => {
      try {
        if (!f) return
        const res = await f(url)
        if (!res || !res.ok) return
        const manifest = await res.json()
        const map = new Map()
        const contentMap = new Map()
        const tpls = []
        for (const e of (manifest.entries || [])) {
          if (!e.ok || !e.json) continue
          try {
            const inc = JSON.parse(e.json)
            const content = e.contentJson ? JSON.parse(e.contentJson) : undefined
            if (e.routePattern) {
              tpls.push({ regex: new RegExp(e.routePattern), paramNames: e.paramNames || [], increment: content || inc })
            } else {
              map.set(e.syncPath, inc)
              if (content) contentMap.set(e.syncPath, content)
            }
          } catch (err) {
            // skip a malformed entry, keep the rest
          }
        }
        increments = map
        contents = contentMap
        templates = tpls
        routeEntries = (manifest.routes && manifest.routes.routes) || []
        bundleTranslations = manifest.translations || {}
        // the REST source catalogue the bundle ships, and its sample-mode flag (mockSources)
        adoptManifestSources(manifest)
      } catch (e) {
        // leave bundle mode off
      }
    })()
    return pending
  }

  /** Await the in-flight manifest load (if any) — so a route load doesn't race the fetch and hit the
   *  backend before the bundle is ready. Resolves immediately when nothing is loading. */
  const awaitBundle = () => pending || Promise.resolve()

  /** True once a non-empty bundle has been loaded (exact routes or :param templates). */
  const hasBundle = () =>
    (increments !== undefined && increments.size > 0) || templates.length > 0

  /** The pre-rendered increment for a route's sync path, or undefined (→ fall back to the backend).
   *  The registry's parameters are applied on the way out, so a statically served route behaves like
   *  the same route served by the backend. */
  const getBundledIncrement = (syncPath, content = false) => {
    const own = content ? contents.get(syncPath) : undefined
    const inc = own !== undefined ? own : (increments ? increments.get(syncPath) : undefined)
    return inc === undefined ? undefined : applyRouteParams(syncPath, inc)
  }

  /** Match a concrete sync path (e.g. `orders/42`) against the :param TEMPLATES; on a hit, return the
   *  pre-rendered structure with the extracted params INJECTED into every fragment's state and data —
   *  so a `${state.<param>}` in a client-side data URL resolves to the real value. undefined = no hit. */
  function matchBundledTemplate(syncPath) {
    for (const t of templates) {
      const m = t.regex.exec(syncPath)
      if (!m) continue
      const params = {}
      t.paramNames.forEach((name, i) => { params[name] = m[i + 1] })
      const withPathParams = {
        ...t.increment,
        // params LAST so the real value wins over the render-time placeholder
        fragments: (t.increment.fragments || []).map((f) => ({
          ...f,
          state: { ...(f.state || {}), ...params },
          data: { ...(f.data || {}), ...params },
        })),
      }
      // …and then the registry's own, so a pinned parameter still outranks the path.
      return applyRouteParams(syncPath, withPathParams)
    }
    return undefined
  }

  /** The bundled increment for a route (exact match then :param template), re-targeted so its
   *  fragments land on the loading surface: the exporter had no initiator, so a fragment's
   *  targetComponentId is null — reduceContexts routes null → HOST, but a load INTO an island must
   *  target that island, so stamp the initiator (matches the web intercept). undefined = not bundled. */
  function bundledIncrementFor(route, initiator, options = {}) {
    const syncPath = toSyncPath(route)
    // a route load INTO the booted shell takes the route's content (see `contents`); the shell's own
    // bootstrap (and a fresh load of a mount without an App) keeps the exported `json`
    const inc = localizeBundled(getBundledIncrement(syncPath, !!options.content) || matchBundledTemplate(syncPath))
    if (!inc) return undefined
    return {
      ...inc,
      fragments: (inc.fragments || []).map((f) =>
        f.targetComponentId ? f : { ...f, targetComponentId: initiator || '' }),
    }
  }

  // ── translations (the manifest's `translations`, locale → key → text) ─────────────────────────
  // Pre-rendered entries keep their `${i18n.key}` (the exporter renders RAW): with no server, the
  // browser resolves them for the visitor's locale — exact → language → 'en' → first; a missing key
  // shows as the key. Same rules as the server's TranslationRegistry and libs/mateu's bundleStore.
  let bundleTranslations = {}
  let bundleLocaleOverride

  /** Chooses the bundle locale over the app's (AppDto.locale) and the browser's; undefined = those. */
  function setBundleLocale(locale) { bundleLocaleOverride = locale || undefined }

  const bundleNormLocale = (l) => String(l || '').trim().replace(/_/g, '-').toLowerCase()

  /** The catalogue locale for the preferred ones (most preferred first), or undefined when empty. */
  function pickBundleLocale(catalogue, preferred) {
    const keys = Object.keys(catalogue || {})
    if (!keys.length) return undefined
    const find = (l) => keys.find((k) => bundleNormLocale(k) === l)
    for (const p of preferred || []) {
      const n = bundleNormLocale(p)
      if (!n) continue
      const hit = find(n) || find(n.split('-')[0])
      if (hit) return hit
    }
    return find('en') || keys[0]
  }

  const BUNDLE_I18N = /\$\{\s*i18n\.([A-Za-z0-9_][A-Za-z0-9_.-]*)\s*\}/g

  function bundleAppLocale() {
    const inc = increments ? increments.get('_no_route') : undefined
    const md = inc && inc.fragments && inc.fragments[0] && inc.fragments[0].component
      && inc.fragments[0].component.metadata
    return md && md.type === 'App' && md.locale ? md.locale : undefined
  }

  function bundleBrowserLocales() {
    const nav = typeof navigator !== 'undefined' ? navigator : undefined
    return nav ? [...(nav.languages || []), nav.language].filter(Boolean) : []
  }

  /** `inc` with every `${i18n.…}` resolved (a copy), or `inc` itself when there is nothing to do. */
  function localizeBundled(inc) {
    if (!inc || !Object.keys(bundleTranslations).length) return inc
    const json = JSON.stringify(inc)
    if (!json.includes('i18n.')) return inc
    const locale = pickBundleLocale(bundleTranslations,
      [bundleLocaleOverride, bundleAppLocale(), ...bundleBrowserLocales()])
    const fallback = pickBundleLocale(bundleTranslations, [])
    const messages = (locale && bundleTranslations[locale]) || {}
    const fallbackMessages = (fallback && bundleTranslations[fallback]) || {}
    const walk = (v) => {
      if (typeof v === 'string') {
        return v.replace(BUNDLE_I18N, (all, key) => messages[key] ?? fallbackMessages[key] ?? key)
      }
      if (Array.isArray(v)) return v.map(walk)
      if (v && typeof v === 'object') {
        const out = {}
        for (const k of Object.keys(v)) out[k] = walk(v[k])
        return out
      }
      return v
    }
    return walk(inc)
  }

  /** Test hook: seed/clear the in-memory bundle directly. */
  function __setBundleForTests(m, t, r, tr, c) {
    bundleTranslations = tr || {}
    bundleLocaleOverride = undefined
    increments = m
    contents = c || new Map()
    templates = t || []
    routeEntries = r || []
    pending = undefined
  }


  // The mount path of the packaged app (the jar io.mateu:mateu-redwood served by a Mateu backend).
  //
  // The controller the annotation processor generates for an @UI serves _index.html at the UI's
  // path and injects a hidden <mateu-ui baseUrl="/console" pathPrefix="/console">. That element is
  // two things at once:
  //   - the SIGNAL that the app is served by a Mateu backend → URLs are PATHS (/console/orders),
  //     not hashes (#/orders, the static serving of vb-serve / VB hosted at Oracle, where the
  //     server cannot rewrite arbitrary paths to the index);
  //   - the MOUNT: the API of that UI lives at <mount>/mateu/v3/... (the root /mateu/v3 is ANOTHER
  //     UI's, or nothing at all when no @UI sits at "").
  // Routes are RELATIVE to the mount, as on the web renderer (mateu-ui strips its pathPrefix): an
  // App @UI("/app") lists its menu as '/section1', and the browser shows /app/section1. The mount
  // itself is the HOME of the UI (the menu's home for an App; the page or crud itself otherwise).
  // One wrinkle: a crud's inner routes come back from the server already carrying the crud's own
  // path ('/products/new' for @UI("/products")), so a route that already starts with the mount is
  // not prefixed twice.
  // Before this module the packaged app called /mateu/v3 on the ROOT whatever the mount: it booted
  // the root app's shell at /products, and with no @UI at "" it did not boot at all.
  //
  // The pure functions are what the tests pin; initMount/mateuBase/urlOfRoute/currentRouteOf keep
  // the mount read once at boot (loadMateuShell) for the chains.

  /** '' (root) or '/segment(s)' without a trailing slash. */
  function normalizeMount(value) {
    let v = String(value == null ? '' : value).trim()
    if (!v || v === '/') return ''
    if (v.charAt(0) !== '/') v = '/' + v
    return v.replace(/\/+$/, '')
  }

  /**
   * The base for /mateu/v3/... calls: the mount the <mateu-ui> carries when there is one (its
   * attributes as a plain object, or null when the page has no such element), else the development
   * default (the app-flow constant mateuBaseUrl — an absolute backend URL under vb-serve).
   */
  function baseUrlOf(attrs, devDefault) {
    if (!attrs) return devDefault
    return normalizeMount(attrs.baseUrl != null ? attrs.baseUrl : attrs.baseurl)
  }

  /** The Mateu route of a browser path under the mount: '/console/orders' → '/orders', the mount
   *  itself ('/console', '/console/', '/' at the root) → '' (the home). A path outside the mount is
   *  returned as is. */
  function routeOfPath(pathname, mount) {
    const m = normalizeMount(mount)
    let p = pathname || '/'
    if (m) {
      if (p === m || p === m + '/') return ''
      if (p.startsWith(m + '/')) p = p.slice(m.length)
    }
    return p === '/' ? '' : p
  }

  /** The browser path of a Mateu route under the mount: '/orders' → '/console/orders', the home
   *  ('' or '/') → '/console' ('/' at the root). A route may carry its ?query; one that already
   *  starts with the mount (a crud's inner route) is not prefixed again. */
  function pathOfRoute(route, mount) {
    const m = normalizeMount(mount)
    let r = route == null ? '' : String(route)
    if (r.charAt(0) === '?') r = '/' + r
    if (r === '' || r === '/') return m || '/'
    if (r.startsWith('/?')) return (m || '') + r.slice(m ? 1 : 0)
    if (r.charAt(0) !== '/') r = '/' + r
    const path = r.split('?')[0]
    if (m && (path === m || path.startsWith(m + '/'))) return r
    return m + r
  }

  // ── the mount read at boot ─────────────────────────────────────────────────────────────────────
  let mountPath = null

  /** Reads the <mateu-ui> of the page once: the mount ('' at the root) or null (hash mode). */
  function initMount(doc) {
    const el = doc && typeof doc.querySelector === 'function' ? doc.querySelector('mateu-ui') : null
    mountPath = el ? baseUrlOf({ baseUrl: el.getAttribute('baseUrl') }, '') : null
    return mountPath
  }

  /** The static bundle's manifest URL, when the page's <mateu-ui> names one (`bundleUrl`, stamped
   *  by the mateu-bundle goal's index.html — the same attribute the web renderers read). '' = none. */
  function bundleUrlOf(doc) {
    const el = doc && typeof doc.querySelector === 'function' ? doc.querySelector('mateu-ui') : null
    const url = el ? el.getAttribute('bundleUrl') || el.getAttribute('bundleurl') : null
    return url || ''
  }

  /** Test hook / explicit setting: null = hash mode. */
  function setMount(value) { mountPath = value == null ? null : normalizeMount(value) }

  /** Path mode (served by a Mateu backend) vs hash mode (static serving). */
  function isPathMode() { return mountPath != null }

  function currentMount() { return mountPath || '' }

  /** The base for API calls: the mount in path mode, the development constant otherwise. */
  function mateuBase(devDefault) { return mountPath != null ? mountPath : devDefault }

  /** The base for STATIC things the backend serves at its root (images, logos, web-component
   *  modules, the agent's sseUrl): the origin root in path mode — they are not under the mount, just
   *  as on the Vaadin renderer —, the development constant (the backend origin) otherwise. */
  function mateuAssetBase(devDefault) { return mountPath != null ? '' : devDefault }

  /** What goes in history.pushState for a route: its path under the mount, or '#route'. */
  function urlOfRoute(route) {
    return mountPath != null ? pathOfRoute(route, mountPath) : '#' + (route || '')
  }

  /** The route (with its ?query) the browser URL names. */
  function currentRouteOf(location) {
    if (!location) return ''
    if (mountPath == null) return (location.hash || '').replace(/^#/, '')
    return routeOfPath(location.pathname, mountPath) + (location.search || '')
  }

  /** A route the server names in full (an App's homeRoute '/console/home') as a route under the mount
   *  ('/home'); unchanged in hash mode or when it is not under the mount. */
  function routeUnderMount(route) {
    if (mountPath == null || !route) return route || ''
    const [path, query] = String(route).split(/(?=\?)/)
    const r = routeOfPath(path, mountPath)
    return (r || (query ? '/' : '')) + (query || '')
  }

  /** The route part (no query) of the browser path — what to compare a route against. */
  function currentRoutePathOf(location) {
    if (!location) return ''
    return mountPath != null ? routeOfPath(location.pathname, mountPath) : (location.hash || '').replace(/^#/, '').split('?')[0]
  }


  // Transporte del bridge — contrato CONFIRMADO contra demo/demo-vb (ver DESIGN-NOTES
  // "Transporte"): bootstrap de la shell por components/_/action; todo lo demás por
  // sync/{route|_no_route} con actionId '' en las cargas. Fuente ÚNICA: este fichero se
  // testea en Node (capture.mjs) y se empaqueta en AMD para VB (make-amd.mjs).









  /** POST {base}/mateu/v3/sync/{route} — la request estándar (= AxiosMateuApiClient.runAction).
   *  Sale ATADA a la pantalla en curso (resilience.currentView): si cuando contesta ya hay otra, la
   *  respuesta se descarta en silencio. Las de fondo (quiet/isolated: widgets, menús remotos) no
   *  son de ninguna pantalla; `options.view` la fija a mano (null: de ninguna). */
  async function callMateu(base, body, options = {}) {
    const view = options.view !== undefined ? options.view
      : (options.quiet || options.isolated) ? null : currentView()
    const bare = (body.route || '').replace(/^\//, '')
    const res = await fetchWithPolicy(`${base}/mateu/v3/sync/${bare || '_no_route'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appState: {},
        componentState: {},
        parameters: {},
        initiatorComponentId: '',
        consumedRoute: '',
        serverSideType: undefined,
        ...body,
        route: bare ? `/${bare}` : '',
      }),
    }, { actionId: body.actionId, timeoutMillis: options.timeoutMillis, idempotent: options.idempotent, quiet: options.quiet, isolated: options.isolated, view })
    const increment = await res.json()
    observeWireVersion(increment)
    // el cuerpo también tarda: lo que llegue después de cambiar de pantalla tampoco se aplica
    if (isViewStale(view)) throw staleResponseError(body.actionId)
    return increment
  }

  /** Bootstrap de la shell: el App raíz solo resuelve por el endpoint genérico.
   *  Static-bundle: la shell NO se exporta (el bundle guarda cargas de ruta, no el __load__ del App),
   *  así que en modo híbrido (bundle + backend) el menú sale del backend como siempre; pero si el
   *  backend NO está (despliegue estático puro) y el bundle trae la ruta raíz, se cae a ella para que
   *  la app arranque igual. Sólo en el fallo — el camino feliz no cambia. */
  async function bootstrapShell(base, initiator = 'shell') {
    await awaitBundle()
    // with a bundle that can boot the shell by itself, the backend is only PROBED: on a static host
    // its absence is the normal case, not an error band nor a sign of being offline
    const fallback = hasBundle() ? bundledIncrementFor('', initiator) : undefined
    try {
      const res = await fetchWithPolicy(`${base}/mateu/v3/components/_/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route: '', actionId: '__load__', componentState: {}, initiatorComponentId: initiator }),
      }, fallback ? { actionId: '__load__', quiet: true, isolated: true } : { actionId: '__load__' })
      const increment = await res.json()
      observeWireVersion(increment)
      // the App carries the REST source catalogue (restSources) and the sample-mode opt-in
      return adoptAppSources(increment)
    } catch (e) {
      if (fallback) return fallback
      throw e
    }
  }

  /** Ruta INTERNA de un mediador/isla tras un flip de state._route: base del outbound +
   *  flip + marcadores query (los ?_embeddedMediator=1&_inline=1 deben seguir viajando). */
  function composeInnerRoute(outboundRoute, flip) {
    if (!flip || flip === '/' ) return outboundRoute
    const queryIndex = outboundRoute.indexOf('?')
    const base = queryIndex >= 0 ? outboundRoute.slice(0, queryIndex) : outboundRoute
    const query = queryIndex >= 0 ? outboundRoute.slice(queryIndex) : ''
    return base + flip + query
  }

  /**
   * La base de un crud de PÁGINA a la que se pegan sus rutas internas (`/QN29HB`, `/QN29HB/edit`,
   * `/new`): su `consumedRoute`, no la ruta con la que se cargó. Entrando desde el listado las dos
   * coinciden (`/booking/bookings`), pero un detalle abierto por enlace directo se carga con
   * `/booking/bookings/QN29HB` y lo consumido es `/booking/bookings`: pegar ahí el `/QN29HB/edit`
   * del Edit daba `/booking/bookings/QN29HB/QN29HB/edit`. Solo cuando lo consumido es un prefijo de
   * la ruta; un mediador embebido (sin consumedRoute) conserva su ruta y sus marcadores de query.
   */
  function mediatorBaseOf(outbound, fallbackRoute = '') {
    const o = outbound || {}
    const own = o.route && o.route !== 'null' && o.route !== 'undefined' ? o.route : ''
    const route = own || (fallbackRoute && fallbackRoute !== 'null' ? fallbackRoute : '')
    const consumed = o.consumedRoute
    if (!consumed || consumed === '_empty' || !consumed.startsWith('/')) return route
    const queryIndex = route.indexOf('?')
    const path = queryIndex >= 0 ? route.slice(0, queryIndex) : route
    const query = queryIndex >= 0 ? route.slice(queryIndex) : ''
    if (path !== consumed && path.startsWith(consumed + '/')) return consumed + query
    return route
  }

  /**
   * ¿La respuesta a una acción pide recargar la ruta interna del mediador? Devuelve esa ruta, o
   * null si no hay flip.
   *
   * Un crud de PÁGINA no contesta el detalle: contesta un fragmento SOLO-ESTADO cuyo `_route`
   * apunta a él (clic de fila → `/2CSXZN`, New → `/new`), que significa "recarga mi ruta interna
   * con este estado". Quien no sigue el flip se queda mirando el listado: la petición sale, el
   * servidor contesta 200, y no pasa nada — el fallo más difícil de ver de todos.
   *
   * El criterio es SEMÁNTICO (comparar el valor de `_route` antes y después), no por identidad:
   * los objetos de VB son proxies y las referencias no dicen nada.
   */
  function routeFlipOf(previousState, nextCtx, increment, fallbackRoute = '') {
    const stateOnly = increment && (increment.fragments || []).length > 0
      && (increment.fragments || []).every((f) => !f.component)
    if (!stateOnly || !nextCtx || !nextCtx.state) return null
    const flip = nextCtx.state._route
    const previous = previousState ? previousState._route : undefined
    if (flip == null || flip === previous) return null
    const outbound = nextCtx.outbound || {}
    return composeInnerRoute(mediatorBaseOf(outbound, fallbackRoute), flip)
  }

  // ── a mount whose @UI is not an App ───────────────────────────────────────────────────────────
  // @UI("/hello") on a plain page, @UI("/products") on a crud: the bootstrap (components/_/action)
  // answers the page itself or nothing at all ("__load__ not supported by ProductsCrud") — never an
  // App with a menu —, so there is no shell and no home route. Its home is the mount's own UI, which
  // the sync endpoint resolves for a FRESH load: route '' with consumedRoute '_empty', exactly what
  // the web renderer sends on a deep link or a reload. The shell remembers that the mount has no App
  // and the home load ('' or '/') goes out that way.
  let mountWithoutApp = false

  /** Did the bootstrap answer an App (the root of a console with its menu)? */
  function bootstrapHasApp(increment) {
    const fragments = (increment && increment.fragments) || []
    return fragments.some((f) => {
      const c = f && f.component
      if (!c) return false
      if (c.metadata && c.metadata.type === 'App') return true
      return (c.children || []).some((child) => child && child.metadata && child.metadata.type === 'App')
    })
  }

  function setMountWithoutApp(value) { mountWithoutApp = !!value }

  /** Carga de una ruta (actionId '': el __load__ real; extra = consumedRoute/serverSideType…).
   *  Static-bundle: si hay manifest cargado, la carga se responde DESDE el bundle (sin backend);
   *  se espera al fetch del manifest en vuelo (la primera carga puede adelantarlo) y, si la ruta no
   *  está en el bundle, se cae al backend — así un despliegue híbrido (bundle + backend) sigue yendo. */
  const loadRoute = async (base, route, initiator = '', extra = {}) => {
    // the home of a mount whose @UI is not an App: a fresh load of the mount — see bootstrapHasApp
    if ((!route || route === '/') && mountWithoutApp && !extra.consumedRoute && extra.serverSideType == null) {
      extra = { ...extra, consumedRoute: '_empty' }
    } else if (mountWithoutApp && route && route !== '/') {
      // …and below the mount (a deep link to /products/new): with no App to resolve it relative to,
      // the server knows the crud's inner routes by their full path, mount included
      route = pathOfRoute(route, currentMount())
    }
    await awaitBundle()
    if (hasBundle()) {
      // a load INTO the shell (any but the fresh '_empty' one) gets the route's content, never the
      // shell aimed at it
      const bundled = bundledIncrementFor(route, initiator, { content: extra.consumedRoute !== '_empty' })
      if (bundled) return bundled
    }
    return callMateu(base, { route, actionId: '', initiatorComponentId: initiator, ...extra })
  }

  /** Acción saliente: arma la request desde el CONTEXTO — "manda el estado que ya tienes".
   *  Los 4 campos de ruta salen del `outbound` que loadRouteInto estampó al cargar el
   *  contexto (un mediador necesita consumedRoute + serverSideType también en las acciones). */
  function runMateuAction(base, ctx, route, actionId, componentState, extra = {}) {
    // A REST-backed action never reaches the Mateu server as itself: the `search` of a listing with a
    // rowsSource, and any action declaring a restAction (the route's `__restdata__` load included),
    // are answered here — direct with fetch, or proxied through the reserved `__restfetch__` action
    // (restSources.mjs). The increment is shaped like the server's, so the chains do not know.
    const restAnswer = restAnswerOf(ctx, actionId, componentState, {
      route,
      appState: (extra && extra.appState) || {},
      server: (parameters, idempotent) => runMateuAction(base, ctx, route, '__restfetch__', componentState,
        { ...extra, parameters, idempotent: !!idempotent }),
    })
    if (restAnswer) return restAnswer
    // los OnSuccess (refresco periódico) se leen del contexto que LANZA la acción
    const source = ctx
    // la acción va al ServerSide que la DECLARA (la vista, no el mediador que la cargó): también
    // los triggers — el OnLoad «actualizar» de una vista cargada por un crud —, no sólo los botones
    ctx = actionTransportOf(ctx, actionId)
    const outbound = (ctx && ctx.outbound) || {}
    // Una superficie cargada de otro pod sigue hablando con ESE pod. La base viaja en el
    // outbound por la misma razón que los 4 campos de ruta: quien dispara una acción (el
    // trigger `search` de un listado, un botón del toolbar) sabe de qué contexto sale, pero
    // no de qué backend vino — y mandarla a la shell la contesta vacía, sin error.
    base = outbound.baseUrl != null ? outbound.baseUrl : base
    const initiator = (ctx && ctx.tree && ctx.tree.id) || (ctx && ctx.id) || ''
    // Guard de doble envío. Una lectura queda EXENTA de la exclusividad: el guard existe porque
    // un segundo POST de una escritura significa una segunda fila, mientras que una segunda
    // lectura sólo significa datos más frescos — y bloquearlas rompería el type-ahead, donde la
    // búsqueda de "mad" se descartaría por estar en vuelo la de "ma".
    const exclusive = !isIdempotentAction(actionId, extra && extra.idempotent)
    const key = pendingActions.key(initiator, actionId)
    if (exclusive && !pendingActions.begin(key)) {
      // Duplicado: se descarta ANTES de construir la petición.
      return Promise.resolve(null)
    }
    const release = () => { if (exclusive) pendingActions.end(key) }
    return callMateu(base, {
      route: outbound.route || route,
      consumedRoute: outbound.consumedRoute || '',
      actionId,
      componentState: componentState || (ctx && ctx.state) || {},
      serverSideType: outbound.serverSideType || (ctx && ctx.tree && ctx.tree.serverSideType),
      initiatorComponentId: initiator,
      ...extra,
    }, { timeoutMillis: extra && extra.timeoutMillis, idempotent: extra && extra.idempotent })
      .then((inc) => {
        release()
        if (inc) actionSucceeded(source, actionId)
        return inc
      }, (e) => { release(); throw e })
  }

  /**
   * Carga las opciones de los lookups REMOTOS de un contexto que aún no las tienen (los campos
   * editables de su formulario y los filtros de su listado; formLookupsOf): una búsqueda vacía
   * por lookup (`search-<campo>`, hasta 200), en paralelo, contra el ServerSide que la declara
   * — o el mediador, que la resuelve con la clase de sus filtros —, con el estado del contexto.
   * Cada respuesta deja sus opciones en ctx.data[campo]; se marcan como cargadas también las que
   * fallan, para no repetirlas en cada acción. Devuelve el registro nuevo.
   */
  async function loadLookups(base, reg, ctxId = HOST_ID, opts = {}) {
    // the options of the fields backed by a REST source (optionsSource) — direct, or proxied
    reg = await loadRestOptions(reg, ctxId, {
      draft: opts.draft,
      appState: opts.appState || {},
      server: (parameters, idempotent) => {
        const owner = reg.contexts[ctxId]
        return runMateuAction(base, owner, opts.route || '', '__restfetch__', { ...(owner.state || {}), ...(opts.draft || {}) },
          { parameters, appState: opts.appState || {}, idempotent: !!idempotent })
      },
    })
    const ctx = reg && reg.contexts && reg.contexts[ctxId]
    const pending = formLookupsOf(ctx)
    if (!pending.length) return reg
    const state = { ...(ctx.state || {}), ...(opts.draft || {}) }
    const found = await Promise.all(pending.map((lookup) =>
      runMateuAction(base, actionTransportOf(ctx, lookup.actionId), opts.route || '', lookup.actionId, state, {
        parameters: { searchText: '', fieldId: lookup.fieldId, size: 200, page: 0 },
        appState: opts.appState || {},
        idempotent: true,
      }).catch(() => null)))
    let out = reg
    for (const inc of found) {
      // sólo los DATOS: un lookup que falla no debe pintar su error encima de la pantalla
      if (inc) out = reduceContexts(out, { fragments: (inc.fragments || []).filter((f) => !f.component) })
    }
    return markLookupsLoaded(out, ctxId, pending.map((lookup) => lookup.fieldId))
  }

  /** Acción SSE (Action.sse(true), p.ej. LongTask): POST {base}/mateu/v3/sse/{route} con
   *  Accept text/event-stream — la respuesta es un STREAM de UIIncrements (data: …\n\n).
   *  Los increments se ENTREGAN EN VIVO vía `extra.onIncrement(inc)` (async; el diálogo de
   *  progreso del LongTask se pinta mientras el stream avanza); si el callback devuelve
   *  true, el increment se considera CONSUMIDO y se excluye de la lista devuelta. Sin
   *  callback, comportamiento clásico: lista completa al acabar. */
  async function runMateuActionSse(base, ctx, route, actionId, componentState, extra = {}) {
    const { onIncrement, ...bodyExtra } = extra || {}
    // atada a la pantalla en curso, como callMateu: cada increment se comprueba al llegar
    const view = currentView()
    ctx = actionTransportOf(ctx, actionId)
    const outbound = (ctx && ctx.outbound) || {}
    base = outbound.baseUrl != null ? outbound.baseUrl : base
    const effectiveRoute = outbound.route || route || ''
    const bare = effectiveRoute.replace(/^\//, '')
    // Sin timeout: un LongTask mantiene el stream abierto por diseño, así que un ceiling lo
    // mataría a mitad. Pasa igualmente por la política para que el fallo llegue clasificado.
    const res = await fetchWithPolicy(`${base}/mateu/v3/sse/${bare || '_no_route'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({
        appState: {},
        componentState: componentState || (ctx && ctx.state) || {},
        parameters: {},
        initiatorComponentId: (ctx && ctx.tree && ctx.tree.id) || (ctx && ctx.id) || '',
        consumedRoute: outbound.consumedRoute || '',
        serverSideType: outbound.serverSideType || (ctx && ctx.tree && ctx.tree.serverSideType),
        ...bodyExtra,
        route: bare ? `/${bare}` : '',
        actionId,
      }),
    }, { actionId, timeoutMillis: -1, view })
    const increments = []
    let reader
    const handle = async (raw) => {
      const line = raw.trim()
      if (!line.startsWith('data:')) return
      if (isViewStale(view)) {
        if (reader && reader.cancel) reader.cancel().catch(() => undefined)
        throw staleResponseError(actionId)
      }
      const inc = JSON.parse(line.slice(5).trim())
      observeWireVersion(inc)
      const consumed = onIncrement ? await onIncrement(inc) : false
      if (!consumed) increments.push(inc)
    }
    if (res.body && res.body.getReader) {
      reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let cut
        while ((cut = buffer.indexOf('\n\n')) >= 0) {
          await handle(buffer.slice(0, cut))
          buffer = buffer.slice(cut + 2)
        }
      }
      if (buffer.trim()) await handle(buffer)
    } else {
      for (const chunk of (await res.text()).split('\n\n')) await handle(chunk)
    }
    return increments
  }

  /**
   * Un mediador cuyo WRAPPER llega como App de chrome (ClientSide type App) en vez de envuelto en un
   * ServerSide. Es la forma que hoy manda el backend al abrir una opción de menú: el mismo App que en
   * el bootstrap, pero pedido para una SUB-ruta (route por debajo de rootRoute). reduceContexts lo
   * absorbe como shell y el contexto queda vacío, así que mediatorOf(host) no lo detecta y la 2ª carga
   * —la del contenido real: search form + listado del crud— nunca se dispara. Se lee entonces del
   * incremento: si trae un App cuyo rootRoute es prefijo de la ruta pedida, hay contenido que buscar.
   *
   * La raíz del app (route === rootRoute) es la shell/home y NO pasa por aquí: la resuelve el
   * bootstrap. Sólo una navegación por debajo de la raíz necesita el segundo salto.
   */
  function mediatorFromShellApp(increment, route) {
    for (const fr of increment?.fragments || []) {
      const c = fr.component
      const md = c?.metadata
      if (c?.type !== 'ClientSide' || md?.type !== 'App') continue
      const rootRoute = md.rootRoute || ''
      if (rootRoute && route && route.startsWith(`${rootRoute}/`)) {
        return {
          rootRoute: md.homeConsumedRoute || rootRoute,
          serverSideType: md.homeServerSideType ?? md.serverSideType,
        }
      }
    }
    return null
  }

  /** ¿La carga contestó el «Not found.» del servidor (un Text suelto, sin ServerSide)? */
  function isServerNotFound(ctx) {
    const t = ctx && ctx.tree
    return !!(t && t.type === 'ClientSide' && t.metadata && t.metadata.type === 'Text'
      && /^not found\.?$/i.test(String(t.metadata.text || '').trim()))
  }

  /** La ruta TERMINAL de una entrada de menú dentro de un grupo (/gestion/island-host → /island-host),
   *  o null si no cuelga de ningún grupo. */
  function terminalMenuRouteOf(menu, route) {
    const path = String(route || '').split('?')[0]
    const query = String(route || '').slice(path.length)
    let found = null
    const visit = (options, parent) => {
      for (const o of options || []) {
        const r = o && (o.route || o.path)
        if (!r) continue
        if (parent && r === path && r.indexOf(parent + '/') === 0) found = r.slice(parent.length) + query
        visit(o.submenus || o.submenu, r)
      }
    }
    visit(menu, '')
    return found
  }

  /**
   * Carga una ruta del MENÚ LOCAL: la compuesta con el serverSideType del app que la declara (lo
   * que hace Vaadin al elegir la opción); si el servidor no la reconoce —un RouteLink metido en un
   * grupo apunta a una ruta absoluta que no es camino de menú— se reintenta por la terminal.
   * Una ruta que no es del menú se carga tal cual.
   */
  async function loadMenuRouteInto(base, reg, route, targetId = '', extra = {}) {
    const shell = (reg && reg.shell) || {}
    const option = localMenuOptionOf(shell.menu, route)
    if (!option) return loadRouteInto(base, reg, route, targetId, extra)
    const next = await loadRouteInto(base, reg, route, targetId,
      { ...extra, serverSideType: option.serverSideType || shell.serverSideType })
    const terminal = terminalMenuRouteOf(shell.menu, route)
    if (terminal && isServerNotFound(next.contexts[targetId === '' ? HOST_ID : targetId]))
      return loadRouteInto(base, reg, terminal, targetId, extra)
    return next
  }

  /**
   * Carga una ruta EN el registro y sigue el mediador si lo hay (crud/isla: la 1ª carga
   * devuelve el App chromeless; el contenido llega con consumedRoute + serverSideType).
   * Devuelve el registro nuevo. targetId = clave del contexto destino (initiator).
   */
  async function loadRouteInto(base, reg, route, targetId = '', extra = {}) {
    // live reload (liveReload.mjs): lo tecleado viaja con la carga — un view model se hidrata con
    // ello — y se vuelve a poner sobre la respuesta, para que una página sólo-definición lo conserve
    const liveState = extra && extra.liveState
    if (extra && 'liveState' in extra) {
      const { liveState: _omit, ...rest } = extra
      extra = liveState ? { ...rest, componentState: liveState } : rest
    }
    // el INCREMENTO crudo se conserva: la 1ª carga de una opción de menú llega como App de mediador
    // (ClientSide type App), que reduceContexts encamina al CHROME (shell) y no al contexto —
    // mediatorOf(host) no lo ve, así que hay que sacar el mediador del incremento mismo.
    let firstIncrement = await loadRoute(base, route, targetId, extra)
    const ctxId = targetId === '' ? HOST_ID : targetId
    let outbound = { route, consumedRoute: '', serverSideType: undefined, baseUrl: base }
    // La CADENA de rutas (P1): un registro con pestañas que son páginas llega como uno o varios Apps
    // ANIDADOS (el maestro) antes de la pantalla de su hueco. Cada uno es un NIVEL (título +
    // pestañas), no la shell; se sigue su home hasta llegar al contenido.
    const shellType = reg && reg.shell ? reg.shell.serverSideType : undefined
    const appLevels = []
    // la ruta que de verdad se carga: un maestro alcanzado solo (/customers/7) abre su pestaña
    // por defecto (/customers/7/orders)
    let effectiveRoute = route
    for (let hop = 0; hop < 4; hop++) {
      const split = splitNestedApps(firstIncrement, shellType, route)
      if (!split.levels.length) break
      appLevels.push(...split.levels)
      const home = split.levels[split.levels.length - 1].home
      effectiveRoute = home.route || effectiveRoute
      outbound = { route: effectiveRoute, consumedRoute: home.consumedRoute || '', serverSideType: home.serverSideType, baseUrl: base }
      firstIncrement = await loadRoute(base, effectiveRoute, targetId, {
        ...extra,
        consumedRoute: outbound.consumedRoute,
        serverSideType: outbound.serverSideType,
      })
    }
    let next = reduceContexts(reg, firstIncrement)
    // las ACTIONS del componente (con su flag sse) viajan en el WRAPPER del mediador —
    // la carga de contenido las pierde, así que se conservan aquí
    const wrapperTree = next.contexts[ctxId] && next.contexts[ctxId].tree
    const wrapperActions = (wrapperTree && wrapperTree.actions) || []
    const info = mediatorOf(next.contexts[ctxId]) || mediatorFromShellApp(firstIncrement, effectiveRoute)
    if (info) {
      // the home of a mount whose @UI is a crud (route '' or '/', a fresh load): the mediator names
      // the route of its content — the crud's own path
      if ((!effectiveRoute || effectiveRoute === '/') && info.homeRoute) effectiveRoute = info.homeRoute
      outbound = {
        route: effectiveRoute,
        consumedRoute: info.rootRoute || effectiveRoute,
        serverSideType: info.serverSideType,
        baseUrl: base,
      }
      next = reduceContexts(
        next,
        await loadRoute(base, effectiveRoute, targetId, {
          ...extra,
          consumedRoute: outbound.consumedRoute,
          serverSideType: outbound.serverSideType,
        }),
      )
    }
    // el contexto RECUERDA cómo se cargó: las acciones salientes reconstruyen los campos
    // de ruta desde aquí (structural sharing: solo cambia la ref de esta entrada).
    // sseActionIds: acciones anunciadas Action.sse(true) — van por el endpoint /sse
    next = {
      ...next,
      contexts: {
        ...next.contexts,
        [ctxId]: {
          ...next.contexts[ctxId],
          outbound,
          sseActionIds: wrapperActions.filter((a) => a && a.sse).map((a) => a.id),
          // the page's OWN actions (id + lowered flow): owner first over the action catalogue
          declaredActions: wrapperActions.filter((a) => a && a.id)
            .map((a) => ({ id: a.id, commands: a.commands || null })),
        },
      },
    }
    if (liveState && next.contexts[ctxId]) {
      next = {
        ...next,
        contexts: {
          ...next.contexts,
          [ctxId]: { ...next.contexts[ctxId], state: { ...(next.contexts[ctxId].state || {}), ...liveState } },
        },
      }
    }
    // los niveles de app (maestros) de la pantalla del HOST: una barra de pestañas por nivel
    if (targetId === '') next = { ...next, appLevels, loadedRoute: effectiveRoute }
    return next
  }

  /**
   * Carga un @Subresource (subresourceIslandOf) en SU contexto: la carga por su tipo — sin el baile
   * del mediador: el App que lo envuelve ya dice qué clase es — con el estado que le siembra el padre,
   * y su búsqueda OnLoad (las filas). Devuelve el registro nuevo.
   */
  async function loadSubresource(base, reg, sub, extra = {}) {
    // a MicroFrontend lives in ITS backend (its baseUrl), with the app state it was given
    if (sub.baseUrl) base = sub.baseUrl
    if (sub.appState) extra = { ...extra, appState: { ...(extra.appState || {}), ...sub.appState } }
    const outbound = { route: sub.route, consumedRoute: sub.consumedRoute, serverSideType: sub.serverSideType, baseUrl: base }
    let next = reduceContexts(reg, await loadRoute(base, sub.route, sub.id, {
      ...extra,
      consumedRoute: sub.consumedRoute,
      serverSideType: sub.serverSideType,
      componentState: sub.componentState || {},
    }))
    next = { ...next, contexts: { ...next.contexts, [sub.id]: { ...next.contexts[sub.id], outbound } } }
    for (const triggerActionId of onLoadTriggers(next.contexts[sub.id])) {
      const ctx = next.contexts[sub.id]
      const listing = listingOf(ctx)
      const componentState = { ...(sub.componentState || {}), ...(ctx.state || {}), page: 0, size: (listing && listing.pageSize) || 10 }
      const increment = await runMateuAction(base, ctx, sub.route, triggerActionId, componentState, extra)
      if (increment) next = reduceContexts(next, increment)
    }
    return next
  }

  /**
   * Carga los @Subresource que el contenido deja a la vista y aún no están cargados (los de la
   * pestaña activa: lo que está en otra pestaña espera a que se abra). Uno que falla se queda como
   * hueco: no tumba la pantalla.
   */
  /**
   * An action of a surface that is neither the host nor the island (a MicroFrontend): posted to that
   * surface with its own state and outbound (route, consumed route, server-side type, base), and the
   * increment reduced into the registry. Returns the new registry (the chain re-projects the content).
   */
  async function runSurfaceAction(reg, surfaceId, actionId, parameters, extra = {}) {
    const ctx = reg && reg.contexts && reg.contexts[surfaceId]
    if (!ctx || !actionId) return reg
    const outbound = ctx.outbound || {}
    const increment = await runMateuAction(outbound.baseUrl, ctx, outbound.route || '', actionId, ctx.state || {},
      { ...extra, parameters: parameters || {} })
    return increment ? reduceContexts(reg, increment) : reg
  }

  async function loadSubresources(base, reg, blocks, extra = {}) {
    let next = reg
    for (const sub of pendingSubresourcesOf(blocks, next.contexts)) {
      try {
        next = await loadSubresource(base, next, sub, extra)
      } catch (ignored) { /* la banda de error ya lo cuenta (onSettle) */ }
    }
    return next
  }

  /**
   * De qué backend se cargó una superficie, o undefined si aún no se sabe.
   *
   * Una isla se carga con `loadRouteInto`, que recibe la base como argumento: la cadena que la
   * dispara conoce el id del contexto, no el pod. Preguntándoselo al HOST (el valor por defecto)
   * la isla se carga de donde vino la pantalla que la contiene, que es lo que siempre quiere.
   */
  function baseOf(reg, ctxId = HOST_ID) {
    const ctx = reg && reg.contexts && reg.contexts[ctxId]
    return ctx && ctx.outbound ? ctx.outbound.baseUrl : undefined
  }

  // ── menús federados ────────────────────────────────────────────────────────────────────────
  //
  // Una shell declara secciones que sirve OTRO pod: `RemoteMenu("/_workflow")`. El árbol que llega
  // en el bootstrap trae esas opciones marcadas `remote` y SIN hijos — los hijos son del pod, y hay
  // que ir a buscarlos. Hasta ahora este renderer no lo hacía: pintaba el rótulo que la shell había
  // escrito y nada debajo, que se lee como "ese servicio no tiene pantallas" en vez de como "nadie
  // se lo ha preguntado".
  //
  // Lo que sigue es la mitad fácil. La otra está en la navegación: una entrada traída de otro pod
  // solo se puede cargar llamando a ESE pod, y este bridge llamaba siempre al base de la shell. Por
  // eso cada opción adoptada queda registrada en `remoteRoutes`, y la cadena de navegación consulta
  // ahí a dónde tiene que ir. Sin esa segunda mitad, expandir el menú es peor que no expandirlo:
  // aparecen entradas que al pulsarlas no llevan a ninguna parte.

  /** Ruta de menú → dónde vive de verdad. La llena expandRemoteMenus; la lee la navegación. */
  const remoteRoutes = new Map()

  /**
   * Dónde vive una ruta, o undefined si la sirve la propia shell.
   *
   * Casa también por PREFIJO, con el registro más largo que encaje: al registro solo llegan las
   * rutas del MENÚ (`/workflow/processes`), y todo lo que cuelga de ellas —el detalle de un
   * proceso, `/new`, `/{id}/edit`— vive en el mismo pod. Sin esto, un deep-link a
   * `/workflow/processes/<id>` salía al backend de la shell, que contesta "Not found.".
   */
  function remoteRouteOf(route) {
    if (route == null) return undefined
    const bare = String(route).replace(/^\//, '')
    const exact = remoteRoutes.get(route) || remoteRoutes.get(bare)
    if (exact) return exact
    let best = null
    let bestLength = -1
    for (const [registered, descriptor] of remoteRoutes) {
      const prefix = String(registered).replace(/^\//, '')
      if (!prefix || prefix.length <= bestLength) continue
      if (bare === prefix || bare.indexOf(prefix + '/') === 0) {
        best = descriptor
        bestLength = prefix.length
      }
    }
    return best || undefined
  }

  /**
   * Registra a qué pod va una ruta que NO vino del menú: la navegación que pide un widget remoto
   * (el enlace del badge de la bandeja emite navigation-requested con su baseUrl y su
   * serverSideType). Una ruta que el menú ya registró se queda como está — el menú manda.
   */
  function registerRemoteRoute(route, descriptor) {
    if (!route || !descriptor || !descriptor.baseUrl || remoteRouteOf(route)) return false
    const entry = {
      baseUrl: descriptor.baseUrl,
      consumedRoute: descriptor.consumedRoute || '',
      serverSideType: descriptor.serverSideType,
      uriPrefix: descriptor.uriPrefix || '',
    }
    remoteRoutes.set(route, entry)
    remoteRoutes.set(String(route).replace(/^\//, ''), entry)
    return true
  }

  const childrenOf = (option) => option.submenus || option.submenu || []

  /** Las opciones remotas del árbol, a cualquier profundidad.
   *  No se baja DENTRO de una remota: lo que cuelgue de ella es del pod, y aún no ha contestado. */
  function collectRemoteMenus(menu, found = []) {
    for (const option of menu || []) {
      if (option.remote) found.push(option)
      else if (childrenOf(option).length) collectRemoteMenus(childrenOf(option), found)
    }
    return found
  }

  /** El menú del App que contesta un pod, o null si no contestó con uno. */
  function appMenuOf(increment) {
    for (const fragment of (increment && increment.fragments) || []) {
      const md = (fragment.component && fragment.component.metadata) || {}
      if (fragment.component && fragment.component.type === 'ClientSide' && md.type === 'App') {
        return { menu: md.menu || [], route: md.route || '', serverSideType: md.serverSideType }
      }
    }
    return null
  }

  /**
   * Marca las hojas traídas de un pod con dónde vive ese pod.
   *
   * Solo las que no traen `baseUrl` propio: un pod puede a su vez federar, y su respuesta ya viene
   * resuelta. Un grupo no se marca, se recorre — lo que navega es la hoja.
   */
  function adoptRemote(menu, option, app) {
    const serverSideType = option.serverSideType ? option.serverSideType : app.serverSideType
    for (const child of menu || []) {
      if (child.baseUrl) continue
      if (childrenOf(child).length) {
        adoptRemote(childrenOf(child), option, app)
        // El grupo también es del pod: lo que cuelga de su ruta y no es ninguna de sus hojas —la
        // página de UNA tarea, /forms/task/<id>, bajo el grupo /forms cuyas hojas son /forms/tasks
        // y /forms/executions— vive en el mismo pod. Es lo que reclama el servidor de la shell
        // (RemoteMenuHandler.claimLength cuenta todas las rutas del menú, grupos incluidos); sin
        // esto ese deep-link salía al backend de la shell, que contesta "Not found.". Solo como
        // prefijo de respaldo: remoteRouteOf se queda con el registro más largo, así que una hoja
        // sigue ganándole al grupo que la contiene. El grupo no se marca: lo que navega es la hoja.
        registerGroupRoute(child.route || child.path || '', option, app, serverSideType)
        continue
      }
      child.baseUrl = option.baseUrl
      child.consumedRoute = app.route || ''
      child.serverSideType = serverSideType
      child.uriPrefix = option.route
      const descriptor = {
        baseUrl: option.baseUrl,
        consumedRoute: app.route || '',
        serverSideType,
        uriPrefix: option.route,
      }
      // Por la ruta tal cual, y por la que verá la navegación cuando shellNavOf le quite el
      // prefijo del padre. Dos claves para la misma entrada es más barato que reconstruir
      // aquí el cálculo que hace el nav, y que se desincronicen luego.
      const route = child.route || child.path || ''
      remoteRoutes.set(route, descriptor)
      remoteRoutes.set(String(route).replace(/^\//, ''), descriptor)
    }
  }

  /** La ruta de un grupo de un pod, registrada como prefijo; la de una hoja ya registrada no se pisa. */
  function registerGroupRoute(route, option, app, serverSideType) {
    const bare = String(route || '').replace(/^\//, '')
    if (!bare || remoteRoutes.has(bare)) return
    const descriptor = {
      baseUrl: option.baseUrl,
      consumedRoute: app.route || '',
      serverSideType,
      uriPrefix: option.route,
    }
    remoteRoutes.set('/' + bare, descriptor)
    remoteRoutes.set(bare, descriptor)
  }

  function spliceRemote(menu, answers, sections = false, depth = 0) {
    const out = []
    for (const option of menu || []) {
      if (option.remote) {
        const app = answers.get(option)
        // Remota OCULTA (`@Menu @Hidden RemoteMenu`, visible:false en el wire): sus rutas se
        // registran igual —un deep-link o una recarga bajo ellas tiene que ir a su pod— pero no
        // aporta nada al menú, ni siquiera el rótulo si el pod no contestó.
        // Remota OCULTA (`@Menu @Hidden RemoteMenu`, visible:false en el wire): sus rutas se
        // registran igual —un deep-link o una recarga bajo ellas tiene que ir a su pod— y sus
        // entradas se quedan en el árbol, ocultas: no se pintan (shellNavOf), pero una página bajo
        // ellas tiene sus migas. Si el pod no contestó, se queda el marcador, también oculto.
        if (option.visible === false) {
          if (app) {
            adoptRemote(app.menu, option, app)
            out.push(...markHidden(app.menu))
          } else {
            out.push(option)
          }
          continue
        }
        if (app) {
          adoptRemote(app.menu, option, app)
          // HAMBURGER_SECTIONS: un pod montado en el primer nivel es UNA sección conteste lo que
          // conteste (asSection, navTree.mjs); si no, el rótulo que la shell declaró manda sobre el
          // del pod
          const entries = sections && depth === 0 ? asSection(app.menu, option) : app.menu
          out.push(...labelledByShell(entries, option))
        } else {
          // El pod no contestó. Se queda la sección, deshabilitada y diciendo por qué: una sección
          // vacía se entiende, una que desaparece parece que nunca existió.
          out.push(unavailableMount(option))
        }
      } else if (childrenOf(option).length) {
        out.push({ ...option, submenus: spliceRemote(childrenOf(option), answers, sections, depth + 1) })
      } else {
        out.push(option)
      }
    }
    return out
  }

  /**
   * Pide a cada pod su menú y lo pone donde estaba su opción.
   *
   * En paralelo, y un pod que falle no tumba al resto: su sección se queda como estaba en vez de
   * llevarse por delante las que sí contestaron. Con `sections` (HAMBURGER_SECTIONS) cada pod
   * montado en el primer nivel queda como una sola sección (asSection).
   */
  async function expandRemoteMenus(menu, { sections = false } = {}) {
    const remotes = collectRemoteMenus(menu)
    if (!remotes.length) return menu
    const answers = new Map()
    await Promise.all(remotes.map(async (option) => {
      try {
        const increment = await callMateu(option.baseUrl || '', {
          route: option.route || '',
          actionId: '',
          consumedRoute: '_empty',
          initiatorComponentId: (option.baseUrl || '') + '#' + (option.route || ''),
          parameters: option.params || {},
          // su fallo es el de SU sección: sin banda de error ni "sin conexión" para toda la app
        }, { quiet: true, isolated: true, timeoutMillis: 20000 })
        const app = appMenuOf(increment)
        if (app) answers.set(option, app)
      } catch (e) {
        // Silencioso a propósito (quiet/isolated): la sección se queda no disponible (spliceRemote).
      }
    }))
    return spliceRemote(menu, answers, sections)
  }


  // Widgets de CABECERA del App (WidgetSupplier.widgets / @Widget): llegan como hijos del App con
  // slot "widgets" — un layout con, típicamente, un MicroFrontend (el badge de la bandeja, otro pod
  // que se refresca solo) y un Popover sobre un Text (el saludo al usuario, que abre su email y el
  // Logout). El renderer Vaadin los pinta tal cual en su barra; aquí se reparten entre las DOS zonas
  // que declara oj-sp-global-header:
  //
  //  - slot `usermenu`: el área de perfil de la cabecera global de Redwood (FA pone ahí el avatar del
  //    usuario, y al pulsarlo su menú). Un Popover cuyo disparador es un TEXT es el idioma Mateu de
  //    "quién soy + un menú": un texto no es un control, así que lo único que puede estar diciendo es
  //    un rótulo — y en la cabecera, el del usuario. El PRIMERO de esos va al área de perfil como
  //    avatar con iniciales + nombre, y su contenido a un oj-popup anclado. Es un reconocimiento de
  //    FORMA, no de valores: no se mira qué dice el texto.
  //  - slot `end` (zona de acciones): todo lo demás, en orden — HTML de un Text, el HTML vivo de un
  //    MicroFrontend, y cualquier otro Popover como botón + oj-popup.
  //
  // El HTML se pinta como HTML (lo es en el wire: un <a> con su onclick que emite
  // navigation-requested), con una sola traducción: <vaadin-icon> no existe en Redwood y se cambia
  // por el icono de fuente oj-ux-ico equivalente. La navegación que emite la escucha la shell.




  const CONTAINERS = new Set([
    'HorizontalLayout', 'VerticalLayout', 'FormLayout', 'Container', 'Div', 'Scroller',
    'SplitLayout', 'FlexLayout',
  ])

  const ENTITIES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" }

  /** El texto visible de un fragmento HTML: sin etiquetas, entidades resueltas, blancos plegados. */
  function plainTextOf(html) {
    return String(html == null ? '' : html)
      .replace(/<[^>]*>/g, ' ')
      .replace(/&(nbsp|amp|lt|gt|quot|apos|#39);/g, (all, name) => ENTITIES[name])
      .replace(/\s+/g, ' ')
      .trim()
  }

  /** Iniciales para el avatar: del nombre que sigue al saludo ("Hola, Demo User" → "DU"). */
  function initialsOf(label) {
    const text = plainTextOf(label)
    const who = text.indexOf(',') >= 0 ? text.slice(text.lastIndexOf(',') + 1) : text
    const words = who.trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w))
    if (!words.length) return ''
    const first = words[0][0]
    const last = words.length > 1 ? words[words.length - 1][0] : (words[0][1] || '')
    return (first + last).toUpperCase()
  }

  const attrOf = (attrs, name) => {
    const m = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i').exec(attrs || '')
    return m ? (m[2] != null ? m[2] : m[3]) : null
  }

  /**
   * El HTML de un widget, apto para Redwood: cada <vaadin-icon icon="vaadin:x"> pasa a un
   * <span class="oj-ux-ico-…"> (fuente de iconos de Redwood) conservando su style — su tamaño, su
   * alineación y su color (p.ej. el rojo del badge cuando hay algo urgente). Un icono sin
   * equivalente se quita: un elemento desconocido no pinta nada y ocupa su sitio igual.
   */
  function redwoodHtmlOf(html) {
    const swap = (all, attrs) => {
      const cls = ojIconOf(attrOf(attrs, 'icon'))
      if (!cls) return ''
      const style = attrOf(attrs, 'style')
      return `<span class="${cls} mateu-widget-icon" aria-hidden="true"${style ? ` style="${style}"` : ''}></span>`
    }
    return String(html == null ? '' : html)
      .replace(/<vaadin-icon\b([^>]*?)\/>/gi, swap)
      .replace(/<vaadin-icon\b([^>]*)>\s*<\/vaadin-icon>/gi, swap)
  }

  /** El contenido de un Popover → filas del popup (texto, enlace), en orden. */
  function popoverContentOf(node) {
    const out = []
    const visit = (n) => {
      if (!n) return
      if (Array.isArray(n)) { n.forEach(visit); return }
      const md = n.metadata || {}
      if (md.type === 'Text') {
        const text = plainTextOf(md.text)
        if (text) out.push({ id: 'r' + out.length, isText: true, text })
        return
      }
      if (md.type === 'Anchor') {
        out.push({ id: 'r' + out.length, isLink: true, label: md.text || md.url || '', href: md.url || '#', target: md.target || '' })
        return
      }
      if (md.type === 'Button') {
        // un botón en el popup de un widget solo puede navegar o ejecutar JS del cliente: sin
        // contexto propio no tiene a quién mandar una acción de servidor
        const label = md.label || md.text || ''
        if (label) out.push({ id: 'r' + out.length, isText: true, text: label })
        return
      }
      for (const child of n.children || []) visit(child)
      if (md.content) visit(md.content)
    }
    visit(node)
    return out
  }

  /**
   * La proyección de los widgets de cabecera del registro: `user` (el área de perfil) o null, e
   * `items` (la zona de acciones), cada uno con un id estable por POSICIÓN — el mismo en cada
   * bootstrap, que es lo que deja al DOM y al refresco reencontrar su hueco.
   */
  function headerWidgetsOf(reg) {
    const nodes = (reg && reg.shell && reg.shell.widgets) || []
    let user = null
    const items = []
    const visit = (node, path) => {
      if (!node) return
      const md = node.metadata || {}
      const id = 'mateu-widget-' + path
      if (CONTAINERS.has(md.type)) {
        (node.children || []).forEach((child, i) => visit(child, path + '-' + i))
        if (md.content) (Array.isArray(md.content) ? md.content : [md.content]).forEach((c, i) => visit(c, path + '-c' + i))
        return
      }
      if (md.type === 'Popover') {
        const wrapped = md.wrapped || {}
        const wmd = wrapped.metadata || {}
        const label = wmd.type === 'Text' ? plainTextOf(wmd.text) : plainTextOf(wmd.label || wmd.text || '')
        const rows = popoverContentOf(md.content)
        if (!user && wmd.type === 'Text' && label) {
          user = { id, label, initials: initialsOf(label), rows }
        } else {
          items.push({ id, isPopover: true, label: label || '…', rows, buttonId: id + '-button', popupId: id + '-popup' })
        }
        return
      }
      if (md.type === 'MicroFrontend') {
        items.push({
          id,
          isRemote: true,
          baseUrl: md.baseUrl || '',
          route: md.route || '',
          consumedRoute: md.consumedRoute || '',
          serverSideType: md.serverSideType || undefined,
          appState: md.appState || null,
        })
        return
      }
      if (md.type === 'Text') {
        const html = redwoodHtmlOf(md.text)
        if (plainTextOf(html) || /<span class="oj-ux-ico-/.test(html)) items.push({ id, isHtml: true, html })
        return
      }
      if (md.type === 'Anchor') {
        items.push({ id, isHtml: true, html: `<a href="${String(md.url || '#').replace(/"/g, '&quot;')}"${md.target ? ` target="${md.target}"` : ''}>${md.text || ''}</a>` })
      }
    }
    nodes.forEach((node, i) => visit(node, String(i)))
    return { user, items }
  }

  /** El HTML de un widget remoto ya cargado: sus Text, interpolados contra su state. */
  function remoteWidgetHtmlOf(tree, state) {
    const parts = []
    const visit = (n) => {
      if (!n) return
      const md = n.metadata || {}
      if (md.type === 'Text') parts.push(redwoodHtmlOf(interpolate(md.text, state)))
      for (const child of n.children || []) visit(child)
    }
    visit(tree)
    return parts.join('')
  }

  const widgetRuntimes = new Map()

  /**
   * Carga un MicroFrontend de cabecera y lo mantiene vivo con SUS triggers: OnLoad al cargar y
   * OnSuccess tras cada acción que los nombre (el badge: `refresh` cada 10 s, encadenado). Es el
   * mismo contrato que el renderer web — si un refresco falla, no se reprograma (OnSuccess).
   *
   * Las peticiones van en modo `quiet`: un refresco de fondo cada pocos segundos no debe encender la
   * barra de ocupado ni la banda de error de la pantalla, que hablan de lo que el usuario hace.
   *
   * `deps` existe para los tests (call/schedule/cancel); `onHtml(html)` recibe cada repintado.
   * Arrancar de nuevo el mismo id para el anterior: un rebootstrap no deja dos bucles.
   */
  function startRemoteWidget(item, onHtml, deps = {}) {
    const call = deps.call || callMateu
    const schedule = deps.schedule || ((fn, ms) => setTimeout(fn, ms))
    const cancel = deps.cancel || ((h) => clearTimeout(h))
    const appState = deps.appState || (() => ({}))
    stopRemoteWidget(item.id, cancel)
    const rt = { stopped: false, timers: new Set(), ctx: null, outbound: {} }
    widgetRuntimes.set(item.id, rt)

    const request = (actionId, extra = {}) => call(item.baseUrl || '', {
      route: item.route || '',
      consumedRoute: rt.outbound.consumedRoute != null ? rt.outbound.consumedRoute : (item.consumedRoute || ''),
      serverSideType: rt.outbound.serverSideType || (rt.ctx && rt.ctx.tree && rt.ctx.tree.serverSideType) || item.serverSideType,
      actionId,
      initiatorComponentId: item.id,
      componentState: (rt.ctx && rt.ctx.state) || {},
      appState: Object.assign({}, appState(), item.appState || {}),
      ...extra,
    }, { quiet: true, idempotent: true })

    const apply = (increment) => {
      for (const fr of (increment && increment.fragments) || []) {
        if (fr.component) {
          rt.ctx = { tree: fr.component, state: fr.state || fr.component.initialData || {} }
        } else if (fr.state && rt.ctx) {
          rt.ctx = { tree: rt.ctx.tree, state: Object.assign({}, rt.ctx.state, fr.state) }
        }
      }
      if (!rt.stopped && rt.ctx) onHtml(remoteWidgetHtmlOf(rt.ctx.tree, rt.ctx.state))
    }

    const plan = (trigger) => {
      if (rt.stopped) return
      const handle = schedule(() => { rt.timers.delete(handle); run(trigger.actionId) }, trigger.timeoutMillis || 0)
      rt.timers.add(handle)
    }
    const triggers = () => (rt.ctx && rt.ctx.tree && rt.ctx.tree.triggers) || []

    const run = async (actionId) => {
      if (rt.stopped) return
      try {
        apply(await request(actionId))
      } catch (e) {
        return
      }
      for (const t of triggers()) if (t.type === 'OnSuccess' && t.calledActionId === actionId) plan(t)
    }

    const load = (async () => {
      try {
        apply(await request(''))
        // un remoto que conteste con un mediador (App chromeless) trae el contenido en un 2º salto
        const info = rt.ctx && mediatorOf(rt.ctx)
        if (info) {
          rt.outbound = { consumedRoute: info.rootRoute || item.route || '', serverSideType: info.serverSideType }
          apply(await request('', { consumedRoute: rt.outbound.consumedRoute, serverSideType: info.serverSideType }))
        }
      } catch (e) {
        return
      }
      for (const t of triggers()) if (t.type === 'OnLoad' && t.actionId) plan(t)
    })()

    return {
      loaded: load,
      stop: () => stopRemoteWidget(item.id, cancel),
      // para los tests: cuántos refrescos hay programados
      pending: () => rt.timers.size,
    }
  }

  function stopRemoteWidget(id, cancel = (h) => clearTimeout(h)) {
    const previous = widgetRuntimes.get(id)
    if (!previous) return
    previous.stopped = true
    for (const h of previous.timers) cancel(h)
    previous.timers.clear()
    widgetRuntimes.delete(id)
  }

  function stopRemoteWidgets() {
    for (const [id, rt] of widgetRuntimes) {
      rt.stopped = true
      for (const h of rt.timers) clearTimeout(h)
      widgetRuntimes.delete(id)
    }
  }

  // ── DOM ─────────────────────────────────────────────────────────────────────────────────────
  // VB no sabe estampar HTML crudo desde un binding: el hueco (<span class="mateu-header-widget"
  // data-widget-id>) lo pinta la plantilla y el HTML lo pone el bridge, como con los componentes web
  // de terceros (elements.mjs). Se recuerda el último HTML de cada hueco: si VB lo re-estampa, el
  // siguiente montaje lo rellena otra vez; si no cambió, no se toca (un clic en curso sobre el
  // enlace no pierde su elemento cada 10 s).

  const lastHtml = {}

  function mountHeaderHtml(id, html) {
    if (html != null) lastHtml[id] = html
    if (typeof document === 'undefined') return false
    const hole = document.querySelector(`.mateu-header-widget[data-widget-id="${id}"]`)
    if (!hole) return false
    const next = lastHtml[id] || ''
    if (hole.__mateuHtml !== next) {
      hole.innerHTML = next
      hole.__mateuHtml = next
    }
    return true
  }

  /** Igual, esperando a que VB pinte el hueco (sus bindings son asíncronos). */
  function mountHeaderHtmlSoon(id, html, frames = 30) {
    if (html != null) lastHtml[id] = html
    if (typeof requestAnimationFrame === 'undefined') return
    let left = frames
    const tick = () => {
      if (mountHeaderHtml(id)) return
      left -= 1
      if (left > 0) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  // ── FAB de "ask" del shell ──────────────────────────────────────────────────────────────────
  // oj-sp-simple-ui-shell estampa su propio FAB (evento ojSpChatAction) con `oj-ux-ico-oracle-chat`:
  // el bocadillo de conversación del asistente DIGITAL de Oracle. Aquí ese FAB abre el buscador de
  // destinos, y el chat del agente tiene su propio FAB con `oj-ux-ico-chat`: dos bocadillos para dos
  // cosas distintas. Por defecto es NEUTRO — «Search» con la lupa —: una app Mateu no es un producto
  // de Oracle y no debe parecerlo (riesgo de marca). Quien quiera el aspecto de Ask Oracle, o su
  // propia marca, lo pone con @App(askLabel, askIcon): una inicial, una imagen (su logo) o un icono
  // (`oj-ux-ico-oracle-o` es la "O" de Ask Oracle).

  const ASK_FAB_LABEL = 'Search'
  const ASK_FAB_GLYPH = 'oj-ux-ico-search'
  /** El glifo con el que lo estampa el shell (el que se quita). */
  const SHELL_CHAT_GLYPH = 'oj-ux-ico-oracle-chat'

  const isImageRef = (value) => /^(data:|https?:|\/\/)/i.test(value) || /[/.]/.test(value)

  /**
   * Qué lleva el FAB de "ask" del shell: `{ label, kind, glyph?, text?, src? }`.
   *  - sin @App(askIcon): la lupa (kind 'glyph'), neutra;
   *  - una o dos letras ("R"): la inicial (kind 'initial');
   *  - una ruta o url ("/images/riu.svg"): la imagen (kind 'image'), relativa al backend como el logo;
   *  - `oj-ux-ico-…` o un nombre Mateu (`vaadin:…`) con equivalente: ese icono (kind 'glyph').
   * Un askIcon que no es nada de eso (un icono sin equivalente, una palabra) no deja el FAB vacío:
   * vuelve a la lupa.
   */
  function askFabOf(shell, base = '') {
    const label = String((shell && shell.askLabel) || '').trim() || chromeText('askSearch')
    const raw = String((shell && shell.askIcon) || '').trim()
    const glyph = (cls) => ({ label, kind: 'glyph', glyph: cls })
    if (!raw) return glyph(ASK_FAB_GLYPH)
    if (isImageRef(raw)) {
      const absolute = /^(data:|https?:|\/\/)/i.test(raw)
      return { label, kind: 'image', src: absolute ? raw : base + raw }
    }
    if (raw.startsWith('oj-ux-') || raw.includes(':')) return glyph(ojIconOf(raw) || ASK_FAB_GLYPH)
    const letters = Array.from(raw)
    if (letters.length <= 2) return { label, kind: 'initial', text: raw.toUpperCase() }
    return glyph(ASK_FAB_GLYPH)
  }

  const MARK_CLASS = 'mateu-ask-fab-mark'
  const BRANDED_CLASS = 'mateu-ask-fab-branded'

  /**
   * Pone la marca y el nombre al FAB del shell (`fab`, el `<a>`; dentro, el `div role=img` del
   * glifo). Idempotente: se puede volver a aplicar con otra marca. Además le da lo que el shell no le
   * da: sin href ni rol, no se alcanzaba con el tabulador y sólo decía "Ask".
   */
  function brandAskFab(fab, spec) {
    if (!fab || !spec) return false
    const icon = fab.querySelector('.oj-sp-rw-chat-icon-image')
    if (!icon) return false
    fab.setAttribute('role', 'button')
    fab.setAttribute('tabindex', '0')
    fab.setAttribute('aria-label', spec.label)
    fab.setAttribute('title', spec.label)
    if (!fab.__mateuKeys) {
      fab.__mateuKeys = true
      fab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          fab.click()
        }
      })
    }
    icon.setAttribute('aria-label', spec.label)
    icon.classList.remove(SHELL_CHAT_GLYPH, BRANDED_CLASS)
    if (icon.__mateuGlyph) icon.classList.remove(icon.__mateuGlyph)
    icon.__mateuGlyph = null
    const old = icon.querySelector(`.${MARK_CLASS}`)
    if (old) old.remove()
    if (spec.kind === 'glyph') {
      icon.classList.add(spec.glyph)
      icon.__mateuGlyph = spec.glyph
      return true
    }
    const mark = icon.ownerDocument.createElement(spec.kind === 'image' ? 'img' : 'span')
    mark.className = `${MARK_CLASS} ${MARK_CLASS}-${spec.kind}`
    mark.setAttribute('aria-hidden', 'true')
    if (spec.kind === 'image') {
      mark.setAttribute('alt', '')
      mark.setAttribute('src', spec.src)
    } else {
      mark.textContent = spec.text
    }
    icon.classList.add(BRANDED_CLASS)
    icon.appendChild(mark)
    return true
  }


  // poc/chat.mjs — núcleo de transporte del CHAT de IA, renderer-neutral (paridad Redwood/VB).
  //
  // El chat compartido (libs/mateu/.../mateu-chat.ts, ~939 líneas) mezcla transporte y UI de Lit. Para
  // llevarlo a VB "apoyándonos en VB al máximo" (la UI la pone un componente de conversación de JET, no
  // dibujada a mano), lo que se comparte es SOLO la lógica de transporte: construir el body, elegir la
  // URL (agente local vs sseUrl), aplanar el menú como contexto, discriminar cada payload `data:` y
  // acumular el texto del asistente. Ese núcleo va aquí — probado en Node (poc/test.mjs) — y el bucle
  // de streaming acepta un `fetchImpl` inyectable para no tocar globals. Es la capa "lógica" del
  // roadmap; el panel VB (gate visual) la consume. Se concatena en el bundle AMD (make-amd quita el import).


  /** Discrimina un payload `data:` que es un objeto de uso de tokens ({inputTokens|outputTokens|totalTokens}). */
  function tryParseTokenUsage(payload) {
    const trimmed = (payload || '').trim()
    if (!trimmed.startsWith('{')) return null
    try {
      const obj = JSON.parse(trimmed)
      if ('inputTokens' in obj || 'outputTokens' in obj || 'totalTokens' in obj) return obj
    } catch {
      // no es JSON válido
    }
    return null
  }

  /** Discrimina un payload `data:` que es un evento personalizado del agente ({event, detail}). */
  function tryParseCustomEvent(payload) {
    const trimmed = (payload || '').trim()
    if (!trimmed.startsWith('{')) return null
    try {
      const obj = JSON.parse(trimmed)
      if (typeof obj.event === 'string') return { event: obj.event, detail: obj.detail ?? {} }
    } catch {
      // no es JSON válido
    }
    return null
  }

  /** Aplana el menú al contexto que recibe el LLM (solo en el primer mensaje). Misma forma que
   *  `MenuContextEntry` del chat compartido: breadcrumb `path` + objeto `navigation`. Salta
   *  separadores y entradas remotas aún sin resolver (su ruta apunta al loader, no a una pantalla). */
  function buildChatMenuContext(options, parentPath = []) {
    const result = []
    for (const opt of options || []) {
      if (opt.separator) continue
      if (opt.remote) continue
      const path = [...parentPath, opt.label]
      if (opt.submenus && opt.submenus.length > 0) {
        result.push(...buildChatMenuContext(opt.submenus, path))
      } else {
        const entry = {
          path,
          navigation: {
            route: opt.route,
            consumedRoute: opt.consumedRoute,
            actionId: opt.actionId ?? '',
            baseUrl: opt.baseUrl,
            serverSideType: opt.serverSideType,
            uriPrefix: opt.uriPrefix,
          },
        }
        if (opt.description) entry.description = opt.description
        // lo que el agente necesita para ENSEÑAR filas en este listado: sus filtros por URL, el campo
        // id de la fila y el parámetro de la selección (?ids=…). Lo publica el server en el menú.
        if (opt.listing) entry.listing = opt.listing
        result.push(entry)
      }
    }
    return result
  }

  /** El body del POST del chat. `menuContext` solo viaja en el primer mensaje (lo decide el llamante). */
  function buildChatBody({ message, sessionId, attachments, context, mcpUrl, menuContext, currentRoute }) {
    return {
      message: message ?? '',
      sessionId,
      // la ruta de la pantalla desde la que se pregunta: las reglas de enrutado del plano de control
      // eligen el agente por ella
      ...(currentRoute ? { currentRoute } : {}),
      ...(attachments && attachments.length ? { attachments } : {}),
      ...(context !== undefined && context !== null ? { context } : {}),
      ...(mcpUrl ? { mcpUrl } : {}),
      ...(menuContext && menuContext.length ? { menuContext } : {}),
    }
  }

  /** Sube ficheros al endpoint de `@AI(upload=…)` como multipart; devuelve los `{name, path}` guardados. */
  async function uploadChatFiles({ uploadUrl, files, sessionId, headers = {}, fetchImpl = globalThis.fetch, FormDataImpl = globalThis.FormData }) {
    const form = new FormDataImpl()
    for (const f of files || []) form.append('files', f)
    if (sessionId) form.append('sessionId', sessionId)
    const response = await fetchImpl(uploadUrl, { method: 'POST', headers, body: form })
    if (!response.ok) throw new Error(chromeText('chatUploadFailed', { status: response.status }))
    const result = await response.json()
    return ((result && result.files) || []).filter((f) => f && f.path)
  }

  // ── El stream SSE, leído como SSE ──────────────────────────────────────────────────────────────
  // Por EVENTO, no por línea: las líneas `data:` de un evento se unen con '\n' y una línea en blanco lo
  // cierra; de `data:` sólo se quita el espacio opcional (la sangría del markdown sobrevive); los
  // comentarios (`:keep-alive`) y los demás campos se ignoran. Misma lógica que el chat compartido
  // (libs/mateu/.../chatStream.ts) — mantener las dos a la par.

  /** Un lector SSE incremental: `push(texto)` devuelve los `data` de los eventos que se han cerrado;
   *  `end()` el que el stream dejó sin línea en blanco detrás. */
  function createSseParser() {
    let buffer = ''
    let data = []
    let hasData = false
    const dispatch = (out) => {
      if (hasData) out.push(data.join('\n'))
      data = []
      hasData = false
    }
    const line = (l, out) => {
      if (l === '') { dispatch(out); return }
      if (l.startsWith(':')) return
      const colon = l.indexOf(':')
      const field = colon < 0 ? l : l.slice(0, colon)
      if (field !== 'data') return
      let value = colon < 0 ? '' : l.slice(colon + 1)
      if (value.startsWith(' ')) value = value.slice(1)
      data.push(value)
      hasData = true
    }
    return {
      push(text) {
        buffer += text
        const out = []
        for (;;) {
          const m = /\r\n|\r|\n/.exec(buffer)
          if (!m) break
          // un '\r' al final puede ser la primera mitad de un '\r\n' partido entre trozos
          if (m[0] === '\r' && m.index === buffer.length - 1) break
          const l = buffer.slice(0, m.index)
          buffer = buffer.slice(m.index + m[0].length)
          line(l, out)
        }
        return out
      },
      end() {
        const out = []
        if (buffer) { line(buffer.replace(/\r$/, ''), out); buffer = '' }
        dispatch(out)
        return out
      },
    }
  }

  /**
   * Qué es el `data` de un evento: uso de tokens, un trozo de la respuesta (agent-delta), una fase
   * (agent-status), una herramienta (agent-tool), un error (agent-error), otro evento de UI, o texto.
   */
  function classifyChatPayload(payload) {
    const usage = tryParseTokenUsage(payload)
    if (usage) return { kind: 'usage', usage }
    const ev = tryParseCustomEvent(payload)
    if (ev) {
      const detail = ev.detail || {}
      if (ev.event === 'agent-delta') return { kind: 'delta', text: typeof detail.text === 'string' ? detail.text : '' }
      if (ev.event === 'agent-status') return { kind: 'status', detail }
      if (ev.event === 'agent-tool') return { kind: 'tool', detail }
      if (ev.event === 'agent-error') return { kind: 'error', message: String(detail.message || chromeText('chatAgentError')) }
      return { kind: 'event', event: ev.event, detail: ev.detail }
    }
    return { kind: 'text', text: payload ?? '' }
  }

  /** Un uso que no dice nada: todos sus contadores a cero (los marcadores de agentes anteriores). */
  function isEmptyUsage(usage) {
    if (!usage) return true
    const values = ['inputTokens', 'outputTokens', 'totalTokens'].map((k) => usage[k]).filter((v) => typeof v === 'number' && Number.isFinite(v))
    return values.length === 0 || values.every((v) => v === 0)
  }

  /**
   * Lo que el agente dice que está haciendo en esta respuesta: la fase, las herramientas (la que corre
   * y las ya hechas, con su duración o su error) y si ya está escribiendo. `line(now)` es la fila de
   * estado: «Llamando a booking_findBookings… 3 s», «Respondiendo…», «Conectando con 2 servidores MCP…»;
   * null si el agente no ha informado de nada (agentes anteriores: el panel sigue con «Pensando… N s»).
   */
  function createChatProgress(now = Date.now()) {
    const p = {
      phase: undefined, statusText: undefined, since: now, steps: [], answering: false, reported: false,
      status(detail, at) {
        p.reported = true
        const text = typeof (detail && detail.text) === 'string' ? detail.text : undefined
        if ((detail && detail.phase) !== p.phase || text !== p.statusText || p.answering) p.since = at
        p.phase = detail && detail.phase
        p.statusText = text
        p.answering = false
      },
      tool(detail, at) {
        p.reported = true
        const d = detail || {}
        const name = d.name || chromeText('chatTool')
        if (d.phase === 'start') {
          p.steps = [...p.steps, { name, server: d.server, kind: d.kind, running: true }]
          p.since = at
          p.answering = false
          return
        }
        const steps = p.steps.slice()
        let i = steps.length - 1
        while (i >= 0 && !(steps[i].running && steps[i].name === name)) i--
        const done = { name, server: d.server, kind: d.kind, ms: d.ms, error: d.error, running: false }
        if (i >= 0) steps[i] = done; else steps.push(done)
        p.steps = steps
        p.since = at
      },
      text(at) {
        if (!p.answering) p.since = at
        p.answering = true
      },
      runningTool() {
        for (let i = p.steps.length - 1; i >= 0; i--) if (p.steps[i].running) return p.steps[i]
        return undefined
      },
      line(at) {
        const secs = Math.max(0, Math.floor((at - p.since) / 1000))
        const withSecs = (s) => (secs > 0 ? `${s} ${secs} s` : s)
        const running = p.runningTool()
        if (running) return withSecs(chromeText('chatCalling', { name: running.name }))
        if (p.answering) return chromeText('chatAnswering')
        if (!p.reported) return null
        return withSecs(p.statusText || chromeText('chatThinking'))
      },
    }
    return p
  }

  /**
   * Postea un mensaje al stream del chat y consume la respuesta SSE, por eventos (ver
   * createSseParser). Cada `data` es uso de tokens, un evento personalizado, progreso del agente, un
   * trozo de la respuesta (agent-delta: se AÑADE), o texto: tras trozos, el primero es la respuesta
   * entera y LOS SUSTITUYE (el agente la manda limpia al final); sin trozos, cada texto es una línea
   * — el contrato de siempre de los agentes que mandan la respuesta línea a línea. `agent-error` se
   * muestra como el texto del asistente. Devuelve el texto final. `fetchImpl` es inyectable para tests.
   *
   * Un 401 se recupera como en el resto del tráfico (fetchWithPolicy): `reauthenticate` pide a la
   * página que reautentique y, si lo hace, el mensaje se reenvía UNA vez. Por eso `headers` puede ser
   * una función: se evalúa en cada envío, y el reenvío lleva el token NUEVO, no el que acaba de ser
   * rechazado — o el que faltaba: en ec1 el chat llegó a salir sin token porque en ese instante no
   * había ninguno en localStorage, y enseñaba "Servidor respondió 401" mientras las pantallas, que sí
   * reautentican, seguían funcionando. Sin nadie que reautentique, o si el reenvío vuelve a dar 401,
   * falla como siempre.
   *
   * @param headers         objeto de cabeceras, o () => objeto (leído en cada envío)
   * @param reauthenticate  async () => boolean — true si hay que reenviar (askForReauthentication)
   *
   * @param onText     (accumulatedText) => void   — en cada cambio del texto (para repintar el mensaje)
   * @param onDelta    (piece, accumulatedText) => void — en cada trozo que llega en streaming
   * @param onProgress (progress) => void          — en cada fase/herramienta (createChatProgress)
   * @param onEvent    ({event, detail}) => void   — evento personalizado del agente (≠ agent-*)
   * @param onUsage    (usage) => void             — objeto de uso de tokens (los todo-cero no llegan)
   */
  async function streamChat({ url, body, headers = {}, reauthenticate, fetchImpl = globalThis.fetch, onText, onDelta, onProgress, onEvent, onUsage, now = () => Date.now() }) {
    const payload = typeof body === 'string' ? body : JSON.stringify(body)
    const send = () => fetchImpl(url, {
      method: 'POST',
      headers: {
        Accept: 'text/event-stream', 'Content-Type': 'application/json',
        ...((typeof headers === 'function' ? headers() : headers) || {}),
      },
      body: payload,
    })
    let response = await send()
    if (response.status === 401 && reauthenticate && await reauthenticate()) {
      response = await send()
    }
    if (!response.ok) {
      const errorText = response.text ? await response.text() : ''
      throw new Error(chromeText('chatServerError', { status: response.status, text: errorText }))
    }
    const reader = response.body && response.body.getReader ? response.body.getReader() : null
    if (!reader) throw new Error(chromeText('chatNoReader'))

    const decoder = new TextDecoder()
    const parser = createSseParser()
    const progress = createChatProgress(now())
    let accumulated = ''
    // hubo trozos desde el último texto entero: el siguiente texto los sustituye
    let streamed = false

    const handlePayload = (data) => {
      const msg = classifyChatPayload(data)
      switch (msg.kind) {
        case 'usage':
          if (!isEmptyUsage(msg.usage) && onUsage) onUsage(msg.usage)
          return
        case 'delta':
          accumulated += msg.text
          streamed = true
          progress.text(now())
          if (onDelta) onDelta(msg.text, accumulated)
          if (onText) onText(accumulated)
          if (onProgress) onProgress(progress)
          return
        case 'text':
          if (streamed) { accumulated = msg.text; streamed = false } else accumulated = accumulated ? accumulated + '\n' + msg.text : msg.text
          progress.text(now())
          if (onText) onText(accumulated)
          if (onProgress) onProgress(progress)
          return
        case 'error':
          accumulated = '⚠️ ' + msg.message
          streamed = false
          if (onText) onText(accumulated)
          return
        case 'status':
          progress.status(msg.detail, now())
          if (onProgress) onProgress(progress)
          return
        case 'tool':
          progress.tool(msg.detail, now())
          if (onProgress) onProgress(progress)
          return
        default:
          if (onEvent) onEvent({ event: msg.event, detail: msg.detail })
      }
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        parser.push(decoder.decode())
        parser.end().forEach(handlePayload)
        break
      }
      parser.push(decoder.decode(value, { stream: true })).forEach(handlePayload)
    }
    return accumulated
  }

  // ---- El estado del panel mientras el asistente trabaja, los tokens y el dictado ------------------

  /**
   * El uso de UNA respuesta: el stream puede mandar más de un objeto de uso; dentro de una respuesta
   * manda el último valor de cada contador, como en el chat compartido (merge, no suma).
   */
  function mergeTurnUsage(turn, usage) {
    return { ...(turn || {}), ...(usage || {}) }
  }

  /**
   * El uso que enseña el panel tras una respuesta: el de ESA respuesta, que es lo que el agente manda
   * como total de la conversación (el ia-agent de ec-demo1 manda el acumulado de la sesión; sumarlo
   * contaba cada respuesta otra vez en cada respuesta siguiente). Una respuesta sin uso deja el que
   * había. Mismo criterio que el chat compartido: se sustituye, no se suma.
   */
  function latestUsage(previous, turn) {
    const keys = ['inputTokens', 'outputTokens', 'totalTokens']
    const has = turn && keys.some((k) => typeof turn[k] === 'number' && Number.isFinite(turn[k]))
    if (!has) return previous || null
    const out = {}
    for (const k of keys) if (typeof turn[k] === 'number' && Number.isFinite(turn[k])) out[k] = turn[k]
    return out
  }

  /**
   * Los totales de la conversación: se suma el uso de cada respuesta ya terminada — para un agente que
   * manda el uso de cada respuesta suelta. El panel ya no la usa (ver latestUsage). Solo los
   * contadores numéricos; null si todavía no hay ninguno (el panel no enseña una fila vacía).
   */
  function addUsage(total, turn) {
    const keys = ['inputTokens', 'outputTokens', 'totalTokens']
    const out = { ...(total || {}) }
    let any = total ? keys.some((k) => typeof total[k] === 'number') : false
    for (const k of keys) {
      const v = turn && turn[k]
      if (typeof v === 'number' && Number.isFinite(v)) {
        out[k] = (typeof out[k] === 'number' ? out[k] : 0) + v
        any = true
      }
    }
    return any ? out : null
  }

  /**
   * Qué dice la fila de estado bajo la conversación: nada si el asistente no trabaja; lo que el agente
   * dice que hace, si lo dice (`progress`, de createChatProgress: la herramienta que llama con sus
   * segundos, la fase, «Respondiendo…»); si no — agentes que no informan —, «Pensando…» con los
   * segundos mientras no ha llegado nada (la espera larga es la que inquieta) y «Respondiendo…» en
   * cuanto llega el primer texto.
   */
  function chatStatusText({ busy, hasText, elapsedSeconds, progress, now }) {
    if (!busy) return ''
    const line = progress && progress.line ? progress.line(typeof now === 'number' ? now : Date.now()) : null
    if (line) return line
    if (hasText) return chromeText('chatAnswering')
    const s = Math.max(0, Math.floor(elapsedSeconds || 0))
    return s > 0 ? chromeText('chatThinkingFor', { s }) : chromeText('chatThinking')
  }

  /** El constructor del reconocimiento de voz del navegador, o null donde no existe (Firefox). */
  function speechRecognitionCtor(win = globalThis) {
    return (win && (win.SpeechRecognition || win.webkitSpeechRecognition)) || null
  }

  /** El texto dictado: el último resultado reconocido (mismo criterio que el chat compartido). */
  function transcriptOf(event) {
    const results = event && event.results
    if (!results || !results.length) return ''
    const last = results[results.length - 1]
    return (last && last[0] && last[0].transcript ? String(last[0].transcript) : '').trim()
  }

  /**
   * El atajo del micrófono del chat: Ctrl+Shift+M en todas las plataformas (en macOS también Ctrl, no
   * Cmd — Cmd+Shift+M cambia de perfil en Chrome y Opción+M escribe «µ»). Exactamente Ctrl y Shift,
   * sin Alt ni Cmd, y no la autorrepetición de la tecla mantenida. La tecla se reconoce por su carácter
   * (AZERTY incluido) o, en un teclado cuya M no escribe una letra latina, por su posición (KeyM).
   */
  const CHAT_MIC_SHORTCUT = 'Ctrl+Shift+M'
  const CHAT_MIC_ARIA_KEYSHORTCUTS = 'Control+Shift+M'

  function isChatMicShortcut(event) {
    if (!event || !event.ctrlKey || !event.shiftKey || event.altKey || event.metaKey || event.repeat) return false
    const key = typeof event.key === 'string' ? event.key : ''
    if (/^[a-z]$/i.test(key)) return key.toLowerCase() === 'm'
    return event.code === 'KeyM'
  }

  // ── Markdown de las respuestas ──────────────────────────────────────────────────────────────────
  // El agente contesta en markdown (negritas, listas, tablas, código). El chat compartido lo pinta con
  // marked + DOMPurify; aquí no hay npm en el bundle AMD, así que el subconjunto que usan los agentes se
  // convierte a mano, ESCAPANDO PRIMERO: todo el HTML del texto sale como texto, y las únicas etiquetas
  // del resultado son las que pone esta función (sin atributos salvo href/target/rel de los enlaces
  // http(s)). Seguro por construcción, sin sanitizador. Tolera el markdown a medias del streaming: un
  // bloque de código sin cerrar es código hasta el final, y un ** sin pareja se queda como texto.

  const MD_ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  const mdEscape = (s) => String(s).replace(/[&<>"']/g, (c) => MD_ESC[c])

  /** El markdown en línea de un texto YA escapado: código, enlaces, negrita, cursiva. */
  function mdInline(escaped) {
    const codes = []
    // la etiqueta de apertura de cada enlace se aparta hasta el final: su href puede llevar `_` o `*`
    // (ids=A_B) y la negrita/cursiva de abajo lo romperían
    const opens = []
    const open = (tag) => { opens.push(tag); return `\u0001${opens.length - 1}\u0001` }
    let s = escaped.replace(/`([^`\n]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000` })
    // enlaces: solo http(s); la URL ya viene escapada (las comillas no pueden cerrar el atributo)
    s = s.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,
      (_, text, url) => `${open(`<a href="${url}" target="_blank" rel="noopener noreferrer">`)}${text}</a>`)
    // y las rutas de la propia app (`[4MBZS7](/booking/bookings/4MBZS7)`): un enlace que navega DENTRO
    // de la consola (la burbuja lo engancha, chatRouteOfLink) — sin recargar ni abrir pestaña. Solo
    // una ruta que empieza por UNA barra: `//host` sería otro sitio.
    s = s.replace(/\[([^\]\n]+)\]\((\/(?!\/)[^\s)]*)\)/g,
      (_, text, route) => `${open(`<a href="${route}" class="mateu-chat-route" data-mateu-route="${route}">`)}${text}</a>`)
    s = s.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>').replace(/__([^_\n]+?)__/g, '<strong>$1</strong>')
    s = s.replace(/(^|[^*\w])\*([^*\s][^*\n]*?)\*(?!\w)/g, '$1<em>$2</em>')
      .replace(/(^|[^_\w])_([^_\s][^_\n]*?)_(?!\w)/g, '$1<em>$2</em>')
    return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[+i]}</code>`)
      .replace(/\u0001(\d+)\u0001/g, (_, i) => opens[+i])
  }

  /**
   * La ruta a la que navega un clic en un enlace del chat, o null si el clic no es nuestro: sólo los
   * enlaces a rutas de la app (mateu-chat-route) y un clic normal — con Ctrl/Cmd/Mayús o el botón del
   * medio el navegador hace lo suyo (abrirlo en otra pestaña sigue funcionando: el href es la URL).
   */
  function chatRouteOfLink(anchor, event) {
    if (!anchor || !anchor.getAttribute) return null
    const route = anchor.getAttribute('data-mateu-route')
    if (!route || route.charAt(0) !== '/' || route.charAt(1) === '/') return null
    if (event && (event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)) return null
    return route
  }

  const MD_TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/
  const mdCells = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => mdInline(mdEscape(c.trim())))

  /**
   * El markdown de una respuesta del asistente como HTML seguro para su burbuja: párrafos con saltos
   * de línea, títulos, listas (con y sin número), citas, reglas, bloques y trozos de código, tablas,
   * enlaces http(s) (en otra pestaña), negrita y cursiva.
   */
  function chatMarkdownToHtml(text) {
    const lines = String(text ?? '').replace(/\r\n?/g, '\n').split('\n')
    const out = []
    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      // bloque de código (``` … ```); sin cerrar —el stream a medias— llega hasta el final
      const fence = line.match(/^\s*```/)
      if (fence) {
        const body = []
        i++
        while (i < lines.length && !/^\s*```/.test(lines[i])) body.push(lines[i++])
        i++
        out.push(`<pre><code>${mdEscape(body.join('\n'))}</code></pre>`)
        continue
      }
      if (/^\s*$/.test(line)) { i++; continue }
      const heading = line.match(/^\s*(#{1,6})\s+(.*)$/)
      if (heading) {
        const level = Math.min(6, heading[1].length + 2)   // h3…h6: dentro de una burbuja, no de una página
        out.push(`<h${level}>${mdInline(mdEscape(heading[2].replace(/\s*#+\s*$/, '')))}</h${level}>`)
        i++
        continue
      }
      if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { out.push('<hr>'); i++; continue }
      // tabla: cabecera | a | b | seguida de |---|---|
      if (line.includes('|') && i + 1 < lines.length && MD_TABLE_SEP.test(lines[i + 1])) {
        const head = mdCells(line)
        i += 2
        const rows = []
        while (i < lines.length && lines[i].includes('|') && !/^\s*$/.test(lines[i])) rows.push(mdCells(lines[i++]))
        out.push('<table><thead><tr>' + head.map((c) => `<th>${c}</th>`).join('') + '</tr></thead><tbody>'
          + rows.map((r) => '<tr>' + r.map((c) => `<td>${c}</td>`).join('') + '</tr>').join('') + '</tbody></table>')
        continue
      }
      if (/^\s*>/.test(line)) {
        const quote = []
        while (i < lines.length && /^\s*>/.test(lines[i])) quote.push(lines[i++].replace(/^\s*>\s?/, ''))
        out.push(`<blockquote>${chatMarkdownToHtml(quote.join('\n'))}</blockquote>`)
        continue
      }
      const item = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/)
      if (item) {
        out.push(mdList(lines, i, (next) => { i = next }))
        continue
      }
      // párrafo: líneas seguidas hasta una en blanco o un bloque; cada salto, un <br>
      const para = []
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^\s*(```|#{1,6}\s|>|([-*+]|\d+[.)])\s)/.test(lines[i])
        && !(lines[i].includes('|') && i + 1 < lines.length && MD_TABLE_SEP.test(lines[i + 1]))) {
        para.push(mdInline(mdEscape(lines[i++].trim())))
      }
      if (para.length) out.push(`<p>${para.join('<br>')}</p>`)
      else i++
    }
    return out.join('')
  }

  /** Una lista (y sus sublistas, por sangría) desde la línea `start`; devuelve su HTML y avanza. */
  function mdList(lines, start, advance) {
    const first = lines[start].match(/^(\s*)([-*+]|\d+[.)])\s+/)
    const indent = first[1].length
    const ordered = /\d/.test(first[2])
    const items = []
    let i = start
    while (i < lines.length) {
      const m = lines[i].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/)
      if (m && m[1].length === indent && /\d/.test(m[2]) === ordered) {
        items.push({ text: mdInline(mdEscape(m[3])), sub: '' })
        i++
        continue
      }
      if (m && m[1].length > indent && items.length) {
        items[items.length - 1].sub += mdList(lines, i, (next) => { i = next })
        continue
      }
      // continuación de un elemento: una línea sangrada que no es otro elemento
      if (!m && items.length && /^\s{2,}\S/.test(lines[i])) {
        items[items.length - 1].text += '<br>' + mdInline(mdEscape(lines[i].trim()))
        i++
        continue
      }
      break
    }
    advance(i)
    const tag = ordered ? 'ol' : 'ul'
    return `<${tag}>` + items.map((it) => `<li>${it.text}${it.sub}</li>`).join('') + `</${tag}>`
  }

  /**
   * Keeps a chat's message list scrolled to its last message while it grows: a new message, or an
   * answer streaming in chunk by chunk. Nothing scrolled it, so the answer kept arriving below the
   * fold. It follows the end only while the reader is at it (within `slack` px): someone who scrolled
   * up to reread is left there, and is followed again once back at the end or after sending. Returns
   * a function that stops it. `el` is the scrolling element (overflow-y: auto).
   */
  function stickChatToBottom(el, { slack = 48, isUserMessage = (node) => !!(node && node.querySelector && node.querySelector('.mateu-chat-user-text')) } = {}) {
    if (!el || typeof MutationObserver === 'undefined') return () => {}
    let stick = true
    const atEnd = () => el.scrollHeight - el.scrollTop - el.clientHeight <= slack
    const toEnd = () => { el.scrollTop = el.scrollHeight }
    const onScroll = () => { stick = atEnd() }
    el.addEventListener('scroll', onScroll, { passive: true })
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes || []) {
          if (node.nodeType === 1 && (isUserMessage(node) || (node.classList && node.classList.contains('mateu-chat-user-text')))) stick = true
        }
      }
      if (stick) toEnd()
    })
    observer.observe(el, { childList: true, subtree: true, characterData: true })
    toEnd()
    return () => { observer.disconnect(); el.removeEventListener('scroll', onScroll) }
  }

  // ---- Paridad con el chat web (libs/mateu mateu-chat.ts): lo que el panel VB necesitaba ----------
  //
  // El chat compartido manda en cada mensaje, además del texto: el CONTEXTO de la pantalla (url,
  // título, appState/appData, el estado del componente — su contextProvider), una PROYECCIÓN
  // autodescriptiva de la pantalla (screenContext.ts: campos con tipo/rótulo/valor + acciones, la
  // misma que recibe un agente MCP), el `mcpUrl` del @AI y los adjuntos; titula el panel con el @App(askLabel); enseña las herramientas que usa el
  // agente en el turno en curso; y explica una respuesta vacía o un corte de red. Todo puro aquí.

  /** La configuración del panel desde la shell (el App del bootstrap) y la base del backend. */
  function chatConfigOf(shell, base = '') {
    const s = shell || {}
    const abs = (u) => (u ? (/^[a-z][a-z0-9+.-]*:/i.test(u) ? u : base + u) : '')
    return {
      sseUrl: abs(s.sseUrl),
      uploadUrl: abs(s.uploadUrl),
      mcpUrl: abs(s.mcpUrl),
      // el título del panel: la marca del App (@App(askLabel)), si no «Assistant»
      title: String(s.askLabel || '').trim() || chromeText('chatTitle'),
    }
  }

  const mdTypeOf = (node) => (node && node.metadata && typeof node.metadata.type === 'string' ? node.metadata.type : undefined)

  /**
   * La pantalla proyectada para el agente — port de screenContext.ts `projectScreen`: los FormField
   * (id, rótulo, tipo, estereotipo, obligatorio, solo lectura, valor del estado, opciones) y las
   * acciones (las declaradas por el componente, con el rótulo de su botón; y los botones sueltos).
   */
  function projectChatScreen(component, state) {
    if (!component || typeof component !== 'object') return { fields: [], actions: [] }
    const fieldMds = []
    const buttons = new Map()
    let page
    const seen = new Set()
    const visit = (node) => {
      if (!node || typeof node !== 'object' || seen.has(node)) return
      seen.add(node)
      if (!Array.isArray(node)) {
        const t = mdTypeOf(node)
        if (t === 'FormField' && node.metadata.fieldId) fieldMds.push(node.metadata)
        else if (t === 'Page' && !page) page = node.metadata
        else if (t === 'Button' && node.metadata.actionId && !buttons.has(node.metadata.actionId)) buttons.set(node.metadata.actionId, node.metadata.label)
      }
      for (const v of Array.isArray(node) ? node : Object.values(node)) if (v && typeof v === 'object') visit(v)
    }
    visit(component)
    const values = state && typeof state === 'object' ? state
      : (component.initialData && typeof component.initialData === 'object' ? component.initialData : {})
    const fields = []
    const seenField = new Set()
    for (const md of fieldMds) {
      if (seenField.has(md.fieldId)) continue
      seenField.add(md.fieldId)
      const field = {
        id: md.fieldId,
        label: md.label != null ? md.label : md.fieldId,
        dataType: md.dataType || 'string',
        stereotype: md.stereotype || 'regular',
        required: !!md.required,
        readOnly: !!md.readOnly,
      }
      if (Object.prototype.hasOwnProperty.call(values, md.fieldId)) field.value = values[md.fieldId]
      if (Array.isArray(md.options) && md.options.length) {
        field.options = md.options.map((o) => (o && typeof o === 'object'
          ? { value: o.value, label: o.label != null ? o.label : String(o.value != null ? o.value : '') }
          : { value: o, label: String(o) }))
      }
      fields.push(field)
    }
    const actions = []
    const seenAction = new Set()
    for (const a of Array.isArray(component.actions) ? component.actions : []) {
      if (!a || !a.id || seenAction.has(a.id)) continue
      seenAction.add(a.id)
      const action = { id: a.id, label: buttons.get(a.id) != null ? buttons.get(a.id) : a.id }
      if (a.shortcut) action.shortcut = a.shortcut
      actions.push(action)
    }
    for (const [id, label] of buttons) {
      if (!seenAction.has(id)) { seenAction.add(id); actions.push({ id, label: label != null ? label : id }) }
    }
    const screen = { fields, actions }
    const title = (page && (page.pageTitle || page.title)) || undefined
    if (title) screen.title = title
    if (component.route) screen.route = component.route
    if (component.serverSideType) screen.serverSideType = component.serverSideType
    if (component.pageType || (page && page.pageType)) screen.pageType = component.pageType || page.pageType
    return screen
  }

  /**
   * El POST de un turno, con la misma forma que el del chat web: el texto, la sesión, la ruta, los
   * adjuntos, el contexto (url, título, appState/appData y el estado/datos del contexto HOST del
   * registro), la pantalla proyectada (si tiene algo), el mcpUrl y, sólo en el primer mensaje de la
   * sesión (`sendMenu`), el menú. Devuelve `{ body, shown }`: `shown` es lo que se pinta como mensaje
   * del usuario (el texto + 📎 los adjuntos).
   */
  function chatTurnOf({ message, sessionId, attachments = [], registry, appState, appData, url, screenTitle, currentRoute, mcpUrl, menu, sendMenu, origin }) {
    const text = String(message || '').trim()
    const host = registry && registry.contexts ? registry.contexts.__root__ : null
    const context = {
      url: url || '',
      screenTitle: screenTitle || '',
      appState: appState || {},
      appData: appData || (registry && registry.appData) || {},
      componentState: (host && host.state) || {},
      componentData: (host && host.data) || {},
    }
    const screen = host && host.tree ? projectChatScreen(host.tree, host.state) : null
    const hasScreen = !!screen && (screen.fields.length > 0 || screen.actions.length > 0 || !!screen.title)
    const pageOrigin = origin || (typeof location !== 'undefined' && location.origin) || 'http://localhost'
    const body = {
      ...buildChatBody({
        message: text,
        sessionId,
        attachments,
        context,
        mcpUrl: mcpUrl ? new URL(mcpUrl, pageOrigin).href : undefined,
        menuContext: sendMenu ? buildChatMenuContext(menu || []) : undefined,
        currentRoute,
      }),
      ...(hasScreen ? { screen } : {}),
    }
    const names = (attachments || []).map((a) => a.name).join(', ')
    const shown = names ? `${text}${text ? '\n\n' : ''}📎 ${names}` : text
    return { body, shown }
  }

  /** El texto final del turno: la respuesta, o por qué no la hay (respuesta vacía, corte de red, error). */
  function chatTurnTextOf(accumulated, error) {
    if (error) {
      const message = (error && error.message) || String(error)
      const network = message === 'Failed to fetch' || message === 'network error' || message === 'Load failed'
      if (network && !accumulated) return '⚠️ ' + chromeText('chatNoAnswer')
      return '⚠️ ' + chromeText('chatError', { message })
    }
    if (!accumulated) return '⚠️ ' + chromeText('chatEmptyAnswer')
    return accumulated
  }

  /** La duración de una herramienta como el chat web: «850 ms», «1,2 s». */
  function formatToolDuration(ms) {
    if (typeof ms !== 'number' || !Number.isFinite(ms)) return ''
    return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1).replace('.', ',')} s`
  }

  /** Las herramientas del turno en curso, listas para pintar bajo la respuesta (CSP: todo precomputado). */
  function chatToolStepsOf(progress) {
    return ((progress && progress.steps) || []).map((step, i) => ({
      key: i + ':' + step.name,
      name: step.name,
      title: step.server ? `${step.name} (${step.server})` : step.name,
      icon: step.running ? '…' : step.error ? '✕' : '✓',
      cls: 'mateu-chat-step ' + (step.running ? 'running' : step.error ? 'failed' : 'done'),
      time: step.running ? '' : formatToolDuration(step.ms),
      error: step.error ? String(step.error) : '',
    }))
  }

  /** Adjuntos tras una subida: los que había + los nuevos, sin repetir ruta. */
  function withAttachments(current, added) {
    const out = (current || []).slice()
    for (const a of added || []) if (a && a.path && !out.some((b) => b.path === a.path)) out.push({ name: a.name || a.path, path: a.path, removeLabel: chromeText('chatRemoveAttachment', { name: a.name || a.path }) })
    return out
  }



  // RE-PROJECTION after a change of CLIENT state (a panel folded, a tab, a carousel slide, a Grid
  // page, tiles reordered): the content is projected again from the registry already in memory —
  // no round trip to the server. The page chains (panelToggled, tilesReordered, uiValueChanged)
  // used to repeat this inline, each a slightly different copy; they call this now.

  /**
   * The content variables to assign after a client-side change: `hostContent` (null when the host
   * content is not the surface on screen — a wizard step, an empty host — so the chain leaves it
   * alone) and `island` (the island projection with its content refreshed, or null).
   *
   * @param {object} vars  the application variables the chains read (mateuRegistry, mateuHostTitle,
   *                       mateuActiveTabs, mateuHostContent, mateuIsland, mateuIslandId, mateuNestedId)
   */
  function reprojectedContentOf(vars) {
    const reg = vars && vars.mateuRegistry
    const contexts = (reg && reg.contexts) || {}
    const host = contexts[HOST_ID]
    let hostContent = null
    const shown = Array.isArray(vars.mateuHostContent) ? vars.mateuHostContent : []
    if (host && shown.length && !wizardOf(host)) {
      const projected = hostContentOf(host, null, {
        title: vars.mateuHostTitle || '',
        activeTabs: vars.mateuActiveTabs,
        // the header band already paints the host's EntityHeader: without this it came back in the content
        dropEntityHeader: !!entityHeaderOf(host),
      }) || []
      hostContent = withSubresources(projected, contexts)
    }
    let island = null
    const islandCtx = vars.mateuIslandId ? contexts[vars.mateuIslandId] : null
    if (islandCtx && vars.mateuIsland) {
      let content = islandContentOf(islandCtx)
      const nestedCtx = vars.mateuNestedId ? contexts[vars.mateuNestedId] : null
      const nested = nestedCtx ? islandContentOf(nestedCtx) : null
      if (content && nested) content = mergeNestedContent(content, nested)
      island = { ...vars.mateuIsland, content }
    }
    return { hostContent, island }
  }







  // The DOM side of the display atoms that VB bindings cannot paint by themselves: the BPMN diagram
  // (an SVG drawn from its BPMN-DI), the cookie consent band (a cookie decides whether it shows),
  // the right click of a ContextMenu, and the Chat component (a streamed conversation). Same idiom as
  // installRichText/installMaps: the atom leaves a slot with data-* attributes, a MutationObserver
  // fills each slot when it appears. The pure parts (bpmnDiagramOf, hasConsentCookie,
  // chatTurnsOf…) are tested in Node; this file only touches the DOM.

  const SVG_NS = 'http://www.w3.org/2000/svg'

  /** Observes the document and calls fill(el) for every element matching `selector` that appears
   *  (and when one of `attributes` changes on it). */
  function observeSlots(doc, flag, selector, attributes, fill) {
    if (!doc || doc[flag] || typeof MutationObserver === 'undefined') return
    doc[flag] = true
    const scan = (root) => {
      if (!root || root.nodeType !== 1) return
      if (root.matches && root.matches(selector)) fill(root)
      for (const el of root.querySelectorAll(selector)) fill(el)
    }
    scan(doc.body || doc.documentElement)
    new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === 'attributes') { if (r.target.matches && r.target.matches(selector)) fill(r.target) } else for (const n of r.addedNodes) scan(n)
      }
    }).observe(doc.body || doc.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: attributes })
  }

  // ── BPMN ────────────────────────────────────────────────────────────────────────────────────
  /** Draws the diagram spec (bpmnDiagramOf) as SVG: tasks as rounded boxes, events as circles (the
   *  end one thicker), gateways as diamonds, flows as arrowed polylines, names as text. */
  function drawBpmn(el, spec, doc = el.ownerDocument) {
    const svg = doc.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('viewBox', [spec.minX, spec.minY, spec.width, spec.height].join(' '))
    svg.setAttribute('width', '100%')
    svg.setAttribute('class', 'mateu-bpmn-svg')
    svg.setAttribute('aria-hidden', 'true')
    const el2 = (tag, attrs, parent = svg) => {
      const n = doc.createElementNS(SVG_NS, tag)
      for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v))
      parent.appendChild(n)
      return n
    }
    const defs = el2('defs', {})
    const marker = el2('marker', { id: el.id + '-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 8, markerHeight: 8, orient: 'auto-start-reverse' }, defs)
    el2('path', { d: 'M 0 0 L 10 5 L 0 10 z', class: 'mateu-bpmn-arrow' }, marker)
    for (const f of spec.flows || []) {
      el2('polyline', { points: f.points.map((p) => p.join(',')).join(' '), class: 'mateu-bpmn-flow', 'marker-end': 'url(#' + el.id + '-arrow)' })
      if (f.label) {
        const mid = f.points[Math.floor(f.points.length / 2)]
        const t = el2('text', { x: mid[0] + 4, y: mid[1] - 4, class: 'mateu-bpmn-flow-label' })
        t.textContent = f.label
      }
    }
    for (const n of spec.nodes || []) {
      const cx = n.x + n.w / 2
      const cy = n.y + n.h / 2
      if (n.kind === 'event' || n.kind === 'end') {
        el2('circle', { cx, cy, r: Math.min(n.w, n.h) / 2, class: 'mateu-bpmn-event' + (n.kind === 'end' ? ' mateu-bpmn-end' : '') })
      } else if (n.kind === 'gateway') {
        el2('polygon', { points: [[cx, n.y], [n.x + n.w, cy], [cx, n.y + n.h], [n.x, cy]].map((p) => p.join(',')).join(' '), class: 'mateu-bpmn-gateway' })
      } else if (n.kind === 'note') {
        el2('path', { d: 'M ' + (n.x + 12) + ' ' + n.y + ' L ' + n.x + ' ' + n.y + ' L ' + n.x + ' ' + (n.y + n.h) + ' L ' + (n.x + 12) + ' ' + (n.y + n.h), class: 'mateu-bpmn-note' })
      } else {
        el2('rect', { x: n.x, y: n.y, width: n.w, height: n.h, rx: n.kind === 'data' ? 2 : 10, class: 'mateu-bpmn-task' })
      }
      if (n.label) {
        const inside = n.kind === 'task' || n.kind === 'note'
        const t = el2('text', {
          x: cx, y: inside ? cy : n.y + n.h + 14,
          'text-anchor': 'middle', 'dominant-baseline': inside ? 'middle' : 'hanging', class: 'mateu-bpmn-label',
        })
        // a long name wraps on words over up to three lines inside its box
        const words = String(n.label).split(/\s+/)
        const lines = []
        let line = ''
        const max = inside ? Math.max(8, Math.floor(n.w / 7)) : 18
        for (const w of words) {
          if ((line + ' ' + w).trim().length > max && line) { lines.push(line); line = w } else line = (line + ' ' + w).trim()
        }
        if (line) lines.push(line)
        lines.slice(0, 3).forEach((l, i) => {
          const span = el2('tspan', { x: cx, dy: i === 0 ? (inside ? -(Math.min(lines.length, 3) - 1) * 7 : 0) : 14 }, t)
          span.textContent = l
        })
      }
    }
    el.textContent = ''
    el.appendChild(svg)
  }

  function installBpmn(doc = typeof document !== 'undefined' ? document : null) {
    observeSlots(doc, '__mateuBpmn', '[data-mateu-bpmn]', ['data-mateu-bpmn'], (el) => {
      const raw = el.getAttribute('data-mateu-bpmn') || ''
      if (el.__mateuBpmn === raw) return
      el.__mateuBpmn = raw
      let spec
      try { spec = JSON.parse(raw) } catch (e) { return }
      if (!spec || !(spec.nodes || []).length) { el.textContent = chromeText('emptyProcess'); return }
      drawBpmn(el, spec, doc)
    })
  }

  // ── Cookie consent ─────────────────────────────────────────────────────────────────────────
  function installCookieConsent(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc) return
    observeSlots(doc, '__mateuCookie', '[data-mateu-cookie]', ['data-mateu-cookie'], (el) => {
      const name = el.getAttribute('data-mateu-cookie')
      el.hidden = !!name && hasConsentCookie(doc.cookie, name)
    })
    if (doc.__mateuCookieClicks) return
    doc.__mateuCookieClicks = true
    doc.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest ? e.target.closest('[data-mateu-cookie-dismiss]') : null
      const band = btn && btn.closest('[data-mateu-cookie]')
      if (!band) return
      const name = band.getAttribute('data-mateu-cookie')
      if (name) doc.cookie = encodeURIComponent(name) + '=dismiss; max-age=' + (365 * 24 * 3600) + '; path=/; SameSite=Lax'
      band.hidden = true
    }, true)
  }

  // ── ContextMenu: right click on the content before the menu opens that menu ───────────────────
  function installContextMenus(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mateuContextMenus) return
    doc.__mateuContextMenus = true
    doc.addEventListener('contextmenu', (e) => {
      // the menu atom follows its content in the same block: look up a few levels for one
      let node = e.target
      for (let depth = 0; node && depth < 5; depth++, node = node.parentElement) {
        const holder = node.querySelector && node.querySelector('.mateu-context-menu[data-mateu-context-menu="true"]')
        if (!holder) continue
        const menu = holder.querySelector('oj-menu')
        if (!menu || typeof menu.open !== 'function') return
        e.preventDefault()
        try { menu.open(e) } catch (err) { /* not upgraded yet */ }
        return
      }
    })
  }

  // ── CustomComponent slots: the view the app registered paints itself into its slot ──────────────
  function installCustomComponents(doc = typeof document !== 'undefined' ? document : null) {
    observeSlots(doc, '__mateuCustomSlots', '[data-mateu-custom]', ['data-mateu-custom-props'], (el) => {
      const props = el.getAttribute('data-mateu-custom-props') || '{}'
      if (el.__mateuCustomProps === props) return
      el.__mateuCustomProps = props
      const mount = customComponentMountOf(el.getAttribute('data-mateu-custom'))
      if (!mount) return
      if (typeof el.__mateuCustomCleanup === 'function') { try { el.__mateuCustomCleanup() } catch (e) { /* its own */ } }
      el.textContent = ''
      let parsed = {}
      try { parsed = JSON.parse(props) } catch (e) { parsed = {} }
      try { el.__mateuCustomCleanup = mount(el, parsed) } catch (e) { el.textContent = chromeText('customFailed', { message: e && e.message }) }
    })
  }

  // ── The Chat component ─────────────────────────────────────────────────────────────────────
  /** A conversation's turns → what the panel shows: each with its role class and its HTML (the
   *  assistant's answer as sanitised Markdown, the user's text escaped). Pure. */
  function chatTurnsOf(turns) {
    const escape = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return (turns || []).map((t) => ({
      role: t.role,
      cls: 'mateu-chat-turn mateu-chat-' + (t.role === 'user' ? 'user' : 'assistant'),
      html: t.role === 'user' ? '<p>' + escape(t.text) + '</p>' : sanitizeHtml(chatMarkdownToHtml(t.text || (t.error ? '' : '…'))),
    }))
  }

  const conversations = new Map()
  // a chat session id names the conversation on the agent's side: unguessable, from the platform CSPRNG
  const newSessionId = () => 'mateu-' + (globalThis.crypto && globalThis.crypto.randomUUID
    ? globalThis.crypto.randomUUID()
    : Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join(''))

  function installChatComponents(doc = typeof document !== 'undefined' ? document : null) {
    observeSlots(doc, '__mateuChatComponents', '[data-mateu-chat-url]', ['data-mateu-chat-url'], (el) => {
      if (el.__mateuChat) return
      el.__mateuChat = true
      const key = el.id || el.getAttribute('data-mateu-chat-url')
      if (!conversations.has(key)) conversations.set(key, { sessionId: newSessionId(), turns: [], busy: false })
      const conv = conversations.get(key)
      el.textContent = ''
      const log = doc.createElement('div')
      log.className = 'mateu-chat-log'
      log.setAttribute('role', 'log')
      log.setAttribute('aria-live', 'polite')
      const form = doc.createElement('form')
      form.className = 'mateu-chat-form'
      const input = doc.createElement('textarea')
      input.className = 'mateu-chat-input oj-typography-body-md'
      input.rows = 2
      input.setAttribute('aria-label', chromeText('chatInputLabel'))
      input.placeholder = chromeText('askSomething')
      const send = doc.createElement('oj-button')
      send.setAttribute('data-oj-binding-provider', 'none')
      send.setAttribute('chroming', 'callToAction')
      send.textContent = chromeText('chatSend')
      form.appendChild(input)
      form.appendChild(send)
      el.appendChild(log)
      el.appendChild(form)
      const paint = () => {
        log.textContent = ''
        for (const turn of chatTurnsOf(conv.turns)) {
          const div = doc.createElement('div')
          div.className = turn.cls
          div.innerHTML = turn.html
          log.appendChild(div)
        }
        log.scrollTop = log.scrollHeight
      }
      const submit = async () => {
        const text = input.value.trim()
        if (!text || conv.busy) return
        input.value = ''
        conv.busy = true
        conv.turns.push({ role: 'user', text })
        const answer = { role: 'assistant', text: '' }
        conv.turns.push(answer)
        paint()
        try {
          await streamChat({
            url: el.getAttribute('data-mateu-chat-url'),
            body: buildChatBody({ message: text, sessionId: conv.sessionId, currentRoute: location.pathname }),
            headers: () => authHeadersOf(),
            onText: (all) => { answer.text = all; paint() },
          })
        } catch (err) {
          answer.error = true
          answer.text = chromeText('assistantFailed', { message: err && err.message ? err.message : String(err) })
        } finally {
          conv.busy = false
          paint()
        }
      }
      send.addEventListener('ojAction', (e) => { e.stopPropagation(); void submit() })
      form.addEventListener('submit', (e) => { e.preventDefault(); void submit() })
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void submit() } })
      paint()
    })
  }




  // THE PAGE PROJECTION — what the two big page chains (shell onMateuNavigate: a navigation;
  // content runMateuAction: an action's answer) assign to the VB variables once the registry is
  // reduced. Both chains used to carry their own inline copy of it (~300 lines each, already
  // drifting apart); the pure parts live here now, tested in Node, and the chains are thin adapters
  // that do the I/O (loads, component refreshes, toasts) and assign what these return. Every function
  // takes plain values and returns the values to assign — no VB, no DOM.

  /** The generic form steps aside (an archetype, rich content or the not-found page paints the body). */
  const noGenericFormVars = () => ({ mateuFormMetadata: null, mateuFormFieldsList: [], mateuFormSections: [], mateuFormActions: [] })

  /** The collection header of a listing: its toolbar's first button is the primary action, the
   *  rest its secondary actions. */
  function listHeaderVarsOf(listingSummary) {
    const toolbar = listingSummary ? listingSummary.toolbar : []
    const primaryToolbar = toolbar.length ? toolbar[0] : null
    // a DISABLED button (CrudDisplay New/Delete: Toggle.disabled) is shown but inert: oj-sp's
    // display 'disabled'
    return {
      mateuListPrimary: primaryToolbar ? { label: primaryToolbar.label, ...(primaryToolbar.disabled ? { display: 'disabled' } : {}) } : { label: '', display: 'off' },
      mateuListPrimaryId: primaryToolbar ? primaryToolbar.actionId : '',
      mateuListSecondary: toolbar.slice(1).map((b) => ({ id: b.actionId, value: b.actionId, label: b.label, ...(b.disabled ? { display: 'disabled' } : {}) })),
    }
  }

  /**
   * The guided process' footer: the forward button (the wizard's own, else the first action that is
   * not "back"), its primary label, and the step shown. A wizard's form actions are none (back = a
   * click on the rail, forward = Continue). `shownStep`: the navigation enters through the overview
   * (''), an action answer keeps the wizard's current step.
   */
  function wizardVarsOf(host, wizardProjection, summaryActions, { keepStep = false } = {}) {
    if (!wizardProjection) {
      return { mateuWizardForwardId: '', mateuWizardPrimary: { label: '', disabled: true }, mateuWizardShownStep: '' }
    }
    const forward = wizardForwardOf(host) || (summaryActions || []).find((a) => a.actionId !== 'back')
    return {
      mateuWizardForwardId: forward ? forward.actionId : '',
      mateuFormActions: [],
      // never null: the component reads primaryAction.label unconditionally
      mateuWizardPrimary: forward ? { label: forward.label, disabled: false } : { label: 'Done', disabled: true },
      mateuWizardShownStep: keepStep ? (wizardProjection.currentStep || '') : '',
    }
  }

  /**
   * The composed archetypes (welcome / general overview / item overview). The welcome hero's look
   * rotates when the welcome is ENTERED and is kept while one stays on it (`previousLook`: the look
   * on screen, or null when no welcome was shown).
   */
  function archetypeVarsOf(host, previousLook) {
    const welcome = welcomeOf(host)
    const overview = generalOverviewOf(host)
    const item = itemOverviewOf(host)
    const vars = {
      mateuWelcomeTrendItems: welcome && welcome.trend ? welcome.trend.items : [],
      mateuWelcome: welcome,
      mateuOverview: overview,
      mateuOverviewOptions: overview ? overview.switcherOptions : [],
      mateuItemOv: item,
      // the ATOMS of the first tab (not only its texts)
      mateuItemTabTexts: item && item.tabs.length ? item.tabs[0].items : [],
    }
    if (welcome) {
      const look = welcomeLookOf(welcomeKeyOf(host), previousLook, Math.random, welcome.tone)
      vars.mateuWelcomeKey = look.key
      vars.mateuWelcomeTheme = look.theme
      vars.mateuWelcomeIlluBg = look.illuBg
      vars.mateuWelcomeIllu = look.illu
    }
    return { vars, welcome, overview, item }
  }

  /** The island (an embedded mediator) projected: its fields, sections, actions and content; null
   *  without one. The nested island's atoms are MERGED into its content (they flow through
   *  $current — reading application variables in deep templates does not re-bind). */
  function islandVarsOf(islandCtx, nestedBlocks) {
    if (!islandCtx) return null
    const island = {
      fields: fieldListOf(islandCtx.tree, islandCtx.state, islandCtx.data),
      sections: formSectionsOf(islandCtx.tree, islandCtx.state, islandCtx.data),
      actions: actionsOf(islandCtx.tree),
      content: islandContentOf(islandCtx),
    }
    return nestedBlocks ? { ...island, content: mergeNestedContent(island.content, nestedBlocks) } : island
  }
  /** The nested island's own variable: its atoms flattened, or null. */
  function nestedVarOf(nestedBlocks) {
    return nestedBlocks ? { atoms: nestedBlocks.reduce((out, b) => out.concat(b.items), []) } : null
  }

  /**
   * Which branch paints the host's body: `hostBlocks` (the generic content, null when another
   * branch — a listing, an archetype, the queue, a foldout, a wizard — owns the page) and the
   * EntityHeader the screen header takes (kept on a foldout: the 360 keeps its guest in the band).
   */
  function hostContentPlanOf(host, { islandRawBlocks, title, activeTabs, wizard, listing, welcome, overview, item, queue, foldout }) {
    const noOtherBranch = !listing && !welcome && !overview && !item && !queue && !foldout
    const hostEntity = (!wizard && (noOtherBranch || foldout)) ? entityHeaderOf(host) : null
    const opts = { title, dropEntityHeader: !!hostEntity }
    if (activeTabs !== undefined) opts.activeTabs = activeTabs
    const hostBlocks = (!wizard && noOtherBranch) ? hostContentOf(host, islandRawBlocks, opts) : null
    return { hostBlocks, hostEntity, noOtherBranch }
  }

  /** The native GENERAL OVERVIEW page: an entity page with TWO column blocks (the wide one first)
   *  → oj-sp-general-overview-page (main/info slots, integrated header). */
  function generalOverviewPageOf(hostEntity, hostBlocks, { itemOverviewOn = false } = {}) {
    const zoned = (hostBlocks || []).filter((b) => /oj-md-/.test(b.blockClass || ''))
    const on = !itemOverviewOn && !!(hostEntity && (hostBlocks || []).length === 2 && zoned.length === 2)
    const fold = (block) => {
      const items = block.items || []
      const titled = items.length && items[0].isHeading && items[0].isH2
      return {
        title: titled ? items[0].text : '',
        blocks: [{ ...block, blockClass: 'oj-flex-item oj-sm-12', items: titled ? items.slice(1) : items }],
      }
    }
    return on
      ? { on: true, main: fold(zoned[0]), info: fold(zoned[1]) }
      : { on: false, main: { title: '', blocks: [] }, info: { title: '', blocks: [] } }
  }

  /**
   * The page HEADER (Redwood rule: a VB header always paints it, except the templates that bring
   * their own) and its toolbar: the primary action, the back affordance (goToParent — Redwood has no
   * breadcrumbs: a back button, else the automatic trail's parent), the secondary actions.
   */
  function pageHeaderOf({ host, hostEntity, summary, hostToolbar, showHeader, pageWidth, gopOn, iopOn = false, listing }) {
    const showBand = showHeader && pageWidth !== 'edgeToEdge'
    const showListBand = !!listing && pageWidth !== 'edgeToEdge'
    const primaryBtn = primaryToolbarButton(hostToolbar)
    const backBtn = backToolbarButton(hostToolbar)
    const parentCrumbNav = backBtn ? undefined : parentCrumb(summary.trail)
    const switcher = pageSwitcherOf(host)
    const baseFacts = hostEntity ? hostEntity.facts : pageKpisOf(host)
    const header = {
      // with an EntityHeader (a record's card) the band stays FIXED on scroll and compacts
      bandClass: hostEntity ? 'oj-bg-neutral-30 oj-sm-padding-10x-bottom mateu-sticky-header' : 'oj-bg-neutral-30 oj-sm-padding-10x-bottom',
      title: hostEntity ? hostEntity.title : (summary.title || ''),
      subtitle: hostEntity ? hostEntity.subtitle : pageSubtitleOf(host),
      // without an EntityHeader, the Page's @KPIs are its facts
      facts: switcher.fact ? [switcher.fact].concat(baseFacts || []) : baseFacts,
      // the record/context switcher (pageSwitcherOf): select-object / select-context of the header
      switcher,
      showBand: showBand && !gopOn && !iopOn,
      showInline: showHeader && !showBand && !gopOn && !iopOn,
      showListBand,
      showListInline: !!listing && !showListBand,
      primary: primaryBtn ? { label: primaryBtn.label, display: primaryBtn.disabled ? 'disabled' : 'on' } : { label: '', display: 'off' },
      primaryId: primaryBtn ? primaryBtn.actionId : '',
      secondary: hostToolbar.filter((b) => b !== primaryBtn && b !== backBtn)
        .map((b) => ({ id: b.actionId, value: b.actionId, label: b.label, ...(b.disabled ? { display: 'disabled' } : {}) })),
      goToParent: !!backBtn || !!parentCrumbNav,
      backId: backBtn ? backBtn.actionId : (parentCrumbNav ? '__goToParent' : ''),
      parentRoute: !backBtn && parentCrumbNav ? parentCrumbNav.route : '',
      backLabel: backBtn ? backBtn.label : (parentCrumbNav ? parentCrumbNav.text : ''),
      toolbar: hostToolbar,
    }
    // the goToParent's label is "Parent page" by default; the back button names it
    const translations = backBtn ? { goToParent: backBtn.label } : (parentCrumbNav ? { goToParent: parentCrumbNav.text } : {})
    return { header, translations, showBand, showListBand }
  }

  /** The page toolbar is painted ONCE: when the header paints it, the form's button row drops the
   *  same actions (both projections come from the same metadata.toolbar). */
  function formActionsBesideHeader(formActions, header, hostToolbar) {
    if (!((header.showBand || header.showInline) && hostToolbar.length)) return formActions
    const inHeader = {}
    for (const b of hostToolbar) inHeader[b.actionId] = true
    return (formActions || []).filter((a) => !inHeader[a.actionId])
  }

  /**
   * The page's width anatomy (RDS 1.6): the shell layout, the content box (max width, margins,
   * padding) and the header band's box. With the persistent navigator drawer (or the item overview
   * template) the page goes edge to edge. Pages whose header bleeds (welcome, overview, wizard,
   * listing, any VB header) have no padding: each branch brings its gutter. With a header BAND the
   * content overlaps it by 40px (the band peeks out from behind its start).
   */
  function pageWidthOf({ host, drawerNav, iopOn = false }) {
    return (drawerNav || iopOn) ? 'edgeToEdge' : ((host && host.pageWidth) || 'fixed')
  }
  function pageLayoutOf({ host, drawerNav, iopOn = false, bleedingHeader, band }) {
    const edge = drawerNav || iopOn
    const pageStyle = edge ? pageStyleOf({ pageWidth: 'edgeToEdge' }) : pageStyleOf(host)
    const pw = pageWidthOf({ host, drawerNav, iopOn })
    const out = {
      mateuShellPageLayout: pw === 'fixed' ? 'fixedWidth' : pw,
      mateuPageMaxWidth: pageStyle.maxWidth,
      mateuPageMargin: pageStyle.margin,
      mateuPagePadding: bleedingHeader ? '0' : pageStyle.padding,
      mateuBandBoxMargin: '0 auto',
    }
    if (band) {
      out.mateuBandBoxMargin = pageStyle.margin
      const parts = (pageStyle.margin || '0').split(' ')
      parts[0] = '-40px'
      if (parts.length === 1) parts.push('auto')
      out.mateuPageMargin = parts.join(' ')
    }
    return { vars: out, pageWidth: pw }
  }

  /**
   * The floating action buttons on screen (@Fab): the page's (a method of the page class — its action
   * goes to the host) and the app's (a method of the @UI app — an app-level action), stacked above
   * the shell's own FAB. Primary-styled ones are the call to action.
   */
  function fabsOf(shell, host) {
    const page = host && host.tree ? findByType(host.tree, 'Page') : null
    const row = (f, appLevel) => ({
      key: (appLevel ? 'app:' : 'page:') + (f.id || f.actionId),
      label: f.label || f.actionId || '',
      iconClass: ojIconOrGenericOf(f.icon) || 'oj-ux-ico-plus',
      actionId: f.actionId || '',
      parameters: {},
      appLevel,
      chroming: f.buttonStyle === 'primary' || !f.buttonStyle ? 'callToAction' : 'outlined',
    })
    return [
      ...((page && page.metadata && page.metadata.fabs) || []).filter((f) => f && f.actionId).map((f) => row(f, false)),
      ...((shell && shell.fabs) || []).filter((f) => f && f.actionId).map((f) => row(f, true)),
    ]
  }



  // WHAT AN ACTION SENDS, decided before anything leaves (runMateuAction used to decide it inline):
  // the state it carries (the drawer's with its draft, or the host's with the form draft and the
  // listing's selection), whether it may leave at all (rows required, required fields empty, a row
  // editor with empty required fields), and to which ServerSide it goes (the list container, a form
  // embedded in the overlay, the component that declares it, or the mediator). Pure — tested in Node.

  /**
   * @param {object} reg     the registry before the action
   * @param {string} id      the action id
   * @param {object} inputs  { draft, drawerDraft, rowDraft, parameters, listing, listingRows,
   *                           listingSelection, formSections }
   * @returns {object} either a stop — { stop: 'selectionRequired' } | { stop: 'fieldErrors', missing }
   *   | { stop: 'rowErrors', rowErrors, rowEditor } — or what to send: { componentState, parameters,
   *   transportCtx, transportExtra, listReq, overlay, host }
   */
  function outboundActionOf(reg, id, inputs = {}) {
    const { draft = {}, drawerDraft = {}, rowDraft = {}, listing, listingRows, listingSelection, formSections } = inputs
    let parameters = inputs.parameters
    const host = reg.contexts[HOST_ID]
    const overlay = overlayOf(reg)
    let componentState = overlay
      ? Object.assign({}, overlay.state, drawerDraft)
      : Object.assign({}, host && host.state, draft)

    // a host action on a listing with selection carries the marked rows (crud_selected_items), as
    // in Vaadin; the drawer's do not (they act on ITS record)
    if (!overlay && listing && listing.rowsSelectionEnabled) {
      componentState = withListingSelection(componentState, listing, listingRows, listingSelection)
      if ((listing.selectionRequired || []).indexOf(id) >= 0 && !componentState.crud_selected_items.length) {
        return { stop: 'selectionRequired' }
      }
    }
    // validationRequired (a wizard's next, a form's save): empty required fields are marked on their
    // field and the action does not leave — what Vaadin does in the browser; the server checks again
    const validation = !overlay && validationOf(host, id)
    if (validation) {
      const missing = formErrorsOf(formSections, draft, validation.fields)
      if (missing.length) return { stop: 'fieldErrors', missing }
    }
    // LIST ACTIONS (the "+" / Edit / Remove of a form's list and its modal editor's buttons) go to
    // the CONTAINER's ServerSide with ITS state, the dialog's row in parameters.initiatorState
    const listReq = !overlay && listActionRequestOf(reg, id, { hostDraft: draft, rowDraft, parameters: parameters || {} })
    let transportCtx = host
    if (listReq) {
      // Save / Create validate the row IN the dialog
      if (ROW_VALIDATING_VERBS[listReq.verb]) {
        const rowCtx = reg.contexts[listReq.fieldId + '-container']
        const rowErrors = validateRow(rowCtx, rowDraft)
        if (Object.keys(rowErrors).length) {
          return { stop: 'rowErrors', rowErrors, rowEditor: rowEditorOf(reg, { rowDraft, errors: rowErrors }) }
        }
      }
      componentState = listReq.componentState
      parameters = listReq.parameters
      transportCtx = listReq.ctx
    }
    // TO WHICH ServerSide: a form embedded in the overlay (an EmbeddedView) gets it with its state
    // and no route; the component of the host that declares it gets it; the rest go to the mediator
    let transportExtra = {}
    const overlayTransport = overlay && !listReq ? overlayTransportOf(reg, id) : null
    if (overlayTransport) {
      transportCtx = overlayTransport
      transportExtra = { route: '', consumedRoute: '' }
    } else if (!listReq && !overlay) {
      transportCtx = actionTransportOf(host, id)
    }
    return { componentState, parameters, transportCtx, transportExtra, listReq, overlay, host }
  }

  /**
   * Did the action's answer RE-RENDER the host (a new component with another id)? Then, as the web
   * does (applyFragment → triggerOnLoad), what just arrived asks for its OnLoad load — without it a
   * listing repainted by an action came back empty.
   */
  function hostReRendered(lastIncrement, hostBefore, hostNow) {
    return !!(lastIncrement && (lastIncrement.fragments || []).some((f) => f.component && f.action !== 'Add'))
      && !!(hostNow && hostNow.tree && hostBefore && hostBefore.tree && hostNow.tree.id !== hostBefore.tree.id)
  }

  /** Did an increment touch the host (any fragment that is not an overlay Add)? */
  const touchesHost = (inc) => ((inc && inc.fragments) || []).some((f) => f.action !== 'Add')

  /** An answer that ONLY brings messages (a wizard refusing to leave its step) does not change the
   *  screen: re-projecting it would repaint the form with the server's state and lose what was typed. */
  function onlyMessagesAnswer({ hostRepainted, flipRoute, events, overlayBefore, overlayNow, lastIncrement }) {
    return !hostRepainted && !flipRoute && !(events || []).length && !overlayBefore && !overlayNow
      && !!lastIncrement && !(lastIncrement.fragments || []).length && !(lastIncrement.commands || []).length
  }




  // GLOBAL SEARCH (the app's GlobalSearchSupplier): typing in the Ask palette also searches the
  // app's entities through the app-level `_globalsearch` action ({searchText}) — the same contract
  // as the web ⌘K palette (mateu-app fetchGlobalSearch). The hits ({label, description, route,
  // category}) go under the destinations, grouped by their category, and choosing one navigates.

  /** The hits of a `_globalsearch` answer: data._globalsearch of the first fragment that has it. */
  function globalSearchHitsOf(increment) {
    for (const f of (increment && increment.fragments) || []) {
      const hits = f && f.data && f.data._globalsearch
      if (Array.isArray(hits)) return hits.filter((h) => h && h.route)
    }
    return []
  }

  /** The palette rows of the hits, after the destinations; grouped (stable) by category. */
  function paletteRowsOfHits(hits) {
    const order = []
    const byCategory = new Map()
    for (const h of hits || []) {
      const category = h.category || chromeText('searchResults')
      if (!byCategory.has(category)) { byCategory.set(category, []); order.push(category) }
      byCategory.get(category).push(h)
    }
    return order.flatMap((category) => byCategory.get(category).map((h) => ({
      label: h.label + (h.description ? ' — ' + h.description : ''),
      route: h.route.startsWith('/') ? h.route : '/' + h.route,
      icon: 'oj-ux-ico-search',
      kind: category,
      isHit: true,
    })))
  }

  /** An APP-LEVEL action (an app @Fab, a header action): posted to the app with its serverSideType
   *  and route '' — the server dispatches app-level actions without menu resolution. */
  function runAppLevelAction(base, serverSideType, appState, actionId, parameters = {}) {
    return callMateu(base, {
      route: '',
      actionId,
      componentState: {},
      parameters,
      serverSideType: serverSideType || undefined,
      appState: appState || {},
    })
  }

  /** Asks the app for the entities matching `text` ([] when there is nothing to ask). */
  async function fetchGlobalSearch(base, serverSideType, appState, text) {
    const searchText = String(text || '').trim()
    if (!searchText) return []
    const increment = await callMateu(base, {
      route: '',
      actionId: '_globalsearch',
      componentState: {},
      parameters: { searchText },
      serverSideType: serverSideType || undefined,
      appState: appState || {},
    })
    return globalSearchHitsOf(increment)
  }


  // LIGHT / DARK (@App(themeToggle)): the same contract as the web renderers — the user's choice is
  // kept in localStorage['mateu-theme'] and wins; without one the OS preference (prefers-color-scheme)
  // decides. Redwood's dark is JET's own inverted colour scheme: `oj-color-invert` on the page (the
  // classic components' palette) plus `oj-c-colorscheme-dark` (the Core Pack / preact theme) — no
  // palette is redrawn here.

  const THEME_KEY = 'mateu-theme'
  const DARK_CLASSES = ['oj-color-invert', 'oj-c-colorscheme-dark', 'mateu-theme-dark']

  /** The theme to start with: the stored choice, else the OS preference, else light. Pure. */
  function initialThemeOf(stored, prefersDark) {
    if (stored === 'dark' || stored === 'light') return stored
    return prefersDark ? 'dark' : 'light'
  }

  /** The other theme. */
  const nextThemeOf = (theme) => (theme === 'dark' ? 'light' : 'dark')

  /** Paints a theme on the page (the root element's classes and its `theme` attribute). */
  function applyTheme(theme, doc = typeof document !== 'undefined' ? document : null) {
    if (!doc) return theme
    const root = doc.documentElement
    for (const cls of DARK_CLASSES) root.classList.toggle(cls, theme === 'dark')
    root.setAttribute('theme', theme === 'dark' ? 'dark' : 'light')
    return theme
  }

  const storage = () => { try { return typeof localStorage !== 'undefined' ? localStorage : null } catch (e) { return null } }

  /** At boot: the stored choice or the OS preference, painted. */
  function applyInitialTheme(doc = typeof document !== 'undefined' ? document : null, win = typeof window !== 'undefined' ? window : null) {
    const s = storage()
    let stored = null
    try { stored = s ? s.getItem(THEME_KEY) : null } catch (e) { stored = null }
    const prefersDark = !!(win && win.matchMedia && win.matchMedia('(prefers-color-scheme: dark)').matches)
    return applyTheme(initialThemeOf(stored, prefersDark), doc)
  }

  /** The header switch: flips, paints and remembers. Returns the new theme. */
  function toggleTheme(doc = typeof document !== 'undefined' ? document : null) {
    const current = doc && doc.documentElement.getAttribute('theme') === 'dark' ? 'dark' : 'light'
    const next = applyTheme(nextThemeOf(current), doc)
    const s = storage()
    try { if (s) s.setItem(THEME_KEY, next) } catch (e) { /* private mode: not remembered */ }
    return next
  }


  // Editor-preview mode: the IDE's visual editor paints the definition being edited with THIS app,
  // inside an iframe (apps/visual-editor, canvas/redwood-frame.ts). The editor already knows how to
  // turn the edited YAML into a wire increment — the reserved `__preview__` sync action of any Mateu
  // backend, or the client-side expander with no backend at all — so the app does not ask a server
  // for anything: it is HANDED the increment through postMessage and answers its own /mateu calls
  // with it, exactly as the palette-thumbnail harness does from Playwright:
  //
  //   - the shell's bootstrap gets a one-route App (no menu worth showing: the chrome is hidden),
  //   - the route's load gets the edited tree, wrapped as a server-side component, the way a real
  //     route's content arrives,
  //   - any other call (an OnLoad search, a button) gets an empty answer: the canvas is inert, a
  //     click SELECTS the component under it instead of running it.
  //
  // It is the visual editor's canvas, so it is also EDITABLE: with the projection's node ids on
  // (core/content.mjs setEditorNodeIds), every painted atom carries the id of the definition node it
  // came from as data-node-id — the editor's synthetic `ve-<path>` — and a click posts that id back.
  // Production pages never enter this mode: only a page that sets window.__mateuEditorPreview (the
  // editor's preview page) does, so no production element ever carries an editor id.
  //
  // Pure except installEditorPreview (DOM + window), so test.mjs exercises the protocol, the answers
  // and the stamping with plain objects.
  //
  // The canvas designs with SAMPLE data: installing the preview switches sample mode on (the same
  // opt-in rule as everywhere — the visual editor always previews with samples), and each render
  // message may carry the project's REST source catalogue (`sources`, sources.yaml with its `sample:`
  // data) and its field types (`types`, types.yaml): a listing reading `rowsSource: {ref}` paints the
  // sample rows, a select with `optionsSource: {ref}` the sample options, and a `fieldType:` reference
  // the handed increment still carries is resolved here (restSources.mjs, fieldTypes.mjs).



  /** The single route of the preview app. */
  const PREVIEW_ROUTE = '/preview'
  const PREVIEW_SST = 'mateu.editor.preview'

  /** The tag every message of the protocol carries: `{ mateuPreview: <kind>, … }`. */
  const PREVIEW_MESSAGE_KEY = 'mateuPreview'

  /** True on the editor's preview page (it sets the flag before the app boots). */
  const isEditorPreview = (win) => !!(win && win.__mateuEditorPreview)

  const EMPTY_INCREMENT = () => ({ commands: [], messages: [], fragments: [] })

  /** What the shell's bootstrap gets: a one-route App whose home is the preview route. */
  function previewAppIncrement(initiator = 'shell') {
    return {
      commands: [], messages: [],
      fragments: [{
        targetComponentId: initiator, action: 'Replace',
        component: {
          type: 'ClientSide', id: 'mateu-editor-app', children: [],
          metadata: {
            type: 'App', route: '', variant: 'MENU_ON_TOP', layout: 'SINGLE_SLOT', title: '',
            homeRoute: PREVIEW_ROUTE,
            menu: [{ label: ' ', path: PREVIEW_ROUTE, route: PREVIEW_ROUTE, consumedRoute: '', serverSideType: PREVIEW_SST,
              submenus: [], visible: true }],
            apps: [], fabs: [], contextSelectors: [], contextActions: [],
          },
        },
      }],
    }
  }

  /** What the route's load gets: the edited tree (the first fragment of the editor's increment),
   *  wrapped as a server-side component — the way a real route's content arrives — and aimed at the
   *  surface that loads it. */
  function previewLoadIncrement(fragment, request = {}) {
    if (!fragment || !fragment.component) return EMPTY_INCREMENT()
    const state = fragment.state || {}
    const own = fragment.component
    // A page with BEHAVIOUR already arrives as a ServerSide component carrying its actions and
    // triggers (the route's `data:` → `__restdata__` + its OnLoad, a restAction button): it IS the
    // page, so it is used as such — wrapped, its triggers would never fire (they are read off the
    // page's own tree) and its restActions would never be found.
    const page = own.type === 'ServerSide'
      ? {
        ...own, id: 'mateu-editor-page', serverSideType: own.serverSideType || PREVIEW_SST,
        route: request.route || PREVIEW_ROUTE, actions: own.actions || [], triggers: own.triggers || [],
        rules: own.rules || [], initialData: { ...(own.initialData || {}), ...state },
      }
      : {
        type: 'ServerSide', id: 'mateu-editor-page', serverSideType: PREVIEW_SST,
        route: request.route || PREVIEW_ROUTE, actions: [], triggers: [], rules: [],
        children: [own], initialData: state,
      }
    return {
      commands: [], messages: [],
      fragments: [{
        targetComponentId: request.initiatorComponentId || '',
        action: 'Replace',
        state: own.type === 'ServerSide' ? page.initialData : state,
        data: fragment.data || {},
        component: page,
      }],
    }
  }

  /**
   * What a render message brings besides the fragment: the project's source catalogue and field
   * types are adopted (a message without them leaves the previous ones), and the fragment comes back
   * with any `fieldType:` reference resolved.
   */
  function adoptRenderMessage(msg) {
    if (!msg || !msg.fragment) return null
    if (Array.isArray(msg.sources)) setRestSourceCatalogue(msg.sources)
    if (Array.isArray(msg.types)) setFieldTypeCatalogue(msg.types)
    return resolveFieldTypes(msg.fragment)
  }

  /** The answer to a request the app sends to its backend, or null when it is not a Mateu call
   *  (a REST source, a CDN module: those go out for real). */
  function previewAnswerOf(url, body, fragment) {
    const u = String(url || '')
    if (u.indexOf('/mateu/v3/') < 0) return null
    if (u.indexOf('/mateu/v3/components/') >= 0) return previewAppIncrement((body && body.initiatorComponentId) || 'shell')
    if (u.indexOf('/mateu/v3/sync/') >= 0) {
      // a load is actionId '' — anything else (a search, a button) does nothing on a canvas
      if (body && (body.actionId === '' || body.actionId == null)) return previewLoadIncrement(fragment, body)
      return EMPTY_INCREMENT()
    }
    // client-log, notifications, chat…: nobody is listening
    return EMPTY_INCREMENT()
  }

  const parseBody = (init) => {
    try { return init && typeof init.body === 'string' ? JSON.parse(init.body) : {} } catch (e) { return {} }
  }

  /** A fetch that answers the Mateu calls locally (awaiting the first fragment the editor hands
   *  over: the route's load may go out before it arrives) and lets everything else through. */
  function previewFetch(realFetch, fragmentNow) {
    return async (input, init) => {
      const url = typeof input === 'string' ? input : (input && input.url) || ''
      if (url.indexOf('/mateu/v3/') < 0) return realFetch(input, init)
      const body = parseBody(init)
      const isLoad = url.indexOf('/mateu/v3/sync/') >= 0 && (body.actionId === '' || body.actionId == null)
      const json = previewAnswerOf(url, body, isLoad ? await fragmentNow() : null)
      return new Response(JSON.stringify(json), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
  }

  /** The editor id under a click: the nearest element of the event path that carries one. */
  function nodeIdOfPath(path) {
    for (const el of path || []) {
      const id = el && typeof el.getAttribute === 'function' ? el.getAttribute('data-node-id') : null
      if (id) return id
    }
    return null
  }

  /**
   * Copies the projection's node ids onto the painted DOM: every element whose bound data (its
   * template's $current.data, read by `dataOf`) carries a `nodeId` different from its parent's gets
   * data-node-id — so the OUTERMOST element of an atom is the one tagged, and a nested object of the
   * same atom (a group of a queue) inherits. An element whose data has none and that still carries
   * a stale id (re-used by the template) loses it. Returns how many elements carry an id.
   */
  function stampNodeIds(root, dataOf) {
    let count = 0
    const walk = (el, inherited) => {
      // an id the PAGE binds itself (data-node-bound: an element outside any for-each, such as the
      // welcome banner) is the element's own; its descendants inherit it like any other
      if (el.hasAttribute && el.hasAttribute('data-node-bound')) {
        const bound = el.getAttribute('data-node-id') || ''
        if (bound) count++
        stampButtonsOf(el)
        for (const child of Array.from(el.children || [])) walk(child, bound || inherited)
        return
      }
      let data
      try { data = dataOf(el) } catch (e) { data = undefined }
      const own = data && typeof data === 'object' && data.nodeId ? String(data.nodeId) : ''
      if (own && own !== inherited) {
        if (el.getAttribute('data-node-id') !== own) el.setAttribute('data-node-id', own)
        count++
      } else if (el.hasAttribute && el.hasAttribute('data-node-id')) {
        el.removeAttribute('data-node-id')
      }
      const next = own || inherited
      for (const child of Array.from(el.children || [])) walk(child, next)
    }
    for (const child of Array.from((root && root.children) || [])) walk(child, '')
    return count
  }

  /**
   * A component that paints buttons of its own from props (the welcome banner's CTAs) cannot bind an
   * id on each: it names them in order in `data-node-buttons` ("ve-0-0 ve-0-1"), and its n-th button
   * gets the n-th id.
   */
  function stampButtonsOf(el) {
    const ids = (el.getAttribute('data-node-buttons') || '').split(' ').filter(Boolean)
    if (!ids.length || typeof el.querySelectorAll !== 'function') return
    const buttons = Array.from(el.querySelectorAll('oj-button, oj-c-button'))
    ids.forEach((id, i) => {
      const button = buttons[i]
      if (button && button.getAttribute('data-node-id') !== id) {
        button.setAttribute('data-node-id', id)
        button.setAttribute('data-node-bound', '')
      }
    })
  }

  /** The element painted for an editor id (the first: an atom projected twice is selected once). */
  const elementOfNodeId = (doc, id) =>
    (id && doc ? doc.querySelector('[data-node-id="' + String(id).replace(/["\\]/g, '\\$&') + '"]') : null)

  // The canvas does not run the app: these never reach it (capture phase, stopped before JET).
  const INERT_EVENTS = ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'dblclick', 'contextmenu',
    'touchstart', 'touchend', 'submit', 'dragstart', 'auxclick']
  // Keys the editor handles (undo/redo, delete, move): forwarded to it, never typed into a field.
  const FORWARDED_KEYS = { Delete: 1, Backspace: 1, ArrowUp: 1, ArrowDown: 1, Escape: 1 }

  /** What the shell chrome looks like on a canvas: nothing. The page is what is being designed. */
  const EDITOR_PREVIEW_CSS = `
  html.mateu-editor-preview oj-sp-global-header, html.mateu-editor-preview .mateu-subheader,
  html.mateu-editor-preview oj-sp-simple-ui-shell .oj-sp-rw-chat-icon-cont,
  html.mateu-editor-preview .mateu-skip-link { display: none !important; }
  html.mateu-editor-preview [data-node-id] { cursor: default; }
  .mateu-editor-outline { position: fixed; pointer-events: none; z-index: 2147483000; box-sizing: border-box;
    border: 2px solid #4f8cff; border-radius: 2px; display: none; }
  .mateu-editor-outline.hover { border: 1px dashed #4f8cff; }
  .mateu-editor-outline .tag { position: absolute; top: -18px; left: -2px; font: 600 10px/1.4 system-ui, sans-serif;
    padding: 1px 5px; color: #fff; background: #4f8cff; border-radius: 3px 3px 0 0; white-space: nowrap; }
  .mateu-editor-outline.below .tag { top: auto; bottom: -18px; border-radius: 0 0 3px 3px; }
  `

  /**
   * Wires the page as the editor's canvas: the fetch that answers from the handed increment, the
   * message protocol, the inert interactions, the id stamping and the selection outline.
   *
   * @param win the window (the iframe's)
   * @param opts.rerender re-runs the preview route (the shell chain: onMateuNavigate with force)
   * @param opts.dataOf element → its bound data (knockout's contextFor(el).$current.data)
   * @returns { booted() } — the shell calls it once its first navigation is done
   */
  function installEditorPreview(win, opts = {}) {
    const doc = win.document
    const post = (msg) => { try { win.parent.postMessage({ [PREVIEW_MESSAGE_KEY]: msg.kind, ...msg }, '*') } catch (e) { /* no parent */ } }
    doc.documentElement.classList.add('mateu-editor-preview')
    // the editor always previews REST sources with their sample data (never the live endpoint)
    setSampleMode(true)
    const style = doc.createElement('style')
    style.textContent = EDITOR_PREVIEW_CSS
    doc.head.appendChild(style)

    let fragment = null
    let waiters = []
    const fragmentNow = () => (fragment ? Promise.resolve(fragment) : new Promise((resolve) => waiters.push(resolve)))
    const realFetch = win.fetch.bind(win)
    win.fetch = previewFetch(realFetch, fragmentNow)

    let booted = false
    let rendering = false
    let again = false
    const rerender = async () => {
      if (!booted || !opts.rerender) return
      if (rendering) { again = true; return }
      rendering = true
      try { await opts.rerender() } catch (e) { /* the next edit retries */ } finally {
        rendering = false
        if (again) { again = false; rerender() }
      }
    }

    // ── selection & hover outlines (inside the frame: the editor cannot see this DOM) ──
    const outline = (cls) => {
      const el = doc.createElement('div')
      el.className = 'mateu-editor-outline ' + cls
      el.appendChild(doc.createElement('span')).className = 'tag'
      doc.body.appendChild(el)
      return el
    }
    let selOutline = null
    let hoverOutline = null
    let selected = { id: null, label: '' }
    let hovered = { id: null, label: '' }
    const place = (box, target) => {
      const el = target.id ? elementOfNodeId(doc, target.id) : null
      if (!el) { box.style.display = 'none'; return }
      const r = el.getBoundingClientRect()
      box.style.display = 'block'
      box.style.left = r.left + 'px'
      box.style.top = r.top + 'px'
      box.style.width = r.width + 'px'
      box.style.height = r.height + 'px'
      box.classList.toggle('below', r.top < 20)
      box.firstChild.textContent = target.label || ''
      box.firstChild.style.display = target.label ? '' : 'none'
    }
    const reposition = () => {
      if (!selOutline) { selOutline = outline('sel'); hoverOutline = outline('hover') }
      place(selOutline, selected)
      place(hoverOutline, hovered.id && hovered.id !== selected.id ? hovered : { id: null })
    }

    // ── stamping, after every render ──
    let stampQueued = false
    let renderedTimer = 0
    const stampSoon = () => {
      if (stampQueued) return
      stampQueued = true
      win.requestAnimationFrame(() => {
        stampQueued = false
        const root = doc.getElementById('pageContent') || doc.body
        const count = opts.dataOf ? stampNodeIds(root, opts.dataOf) : 0
        reposition()
        win.clearTimeout(renderedTimer)
        renderedTimer = win.setTimeout(() => post({ kind: 'rendered', count }), 120)
      })
    }
    new win.MutationObserver(stampSoon).observe(doc.body, { childList: true, subtree: true })
    win.addEventListener('scroll', reposition, true)
    win.addEventListener('resize', reposition)

    // ── inert canvas: a click selects ──
    const stop = (e) => { e.preventDefault(); e.stopImmediatePropagation() }
    for (const name of INERT_EVENTS) win.addEventListener(name, stop, true)
    win.addEventListener('click', (e) => {
      stop(e)
      const path = typeof e.composedPath === 'function' ? e.composedPath() : [e.target]
      post({ kind: 'click', id: nodeIdOfPath(path) })
    }, true)
    win.addEventListener('mousemove', (e) => {
      const path = typeof e.composedPath === 'function' ? e.composedPath() : [e.target]
      const id = nodeIdOfPath(path)
      if (id === hovered.id) return
      hovered = { id, label: '' }
      reposition()
    }, true)
    doc.documentElement.addEventListener('mouseleave', () => { hovered = { id: null, label: '' }; reposition() })
    win.addEventListener('keydown', (e) => {
      const mod = e.metaKey || e.ctrlKey
      if (FORWARDED_KEYS[e.key] || (mod && /^[zZyY]$/.test(e.key))) {
        stop(e)
        post({ kind: 'key', key: e.key, code: e.code, metaKey: e.metaKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey })
      }
    }, true)

    // ── the protocol ──
    win.addEventListener('message', (e) => {
      if (e.source !== win.parent) return
      const msg = e.data
      if (!msg || typeof msg !== 'object') return
      const kind = msg[PREVIEW_MESSAGE_KEY]
      if (kind === 'render' && msg.fragment) {
        fragment = adoptRenderMessage(msg)
        const pending = waiters
        waiters = []
        pending.forEach((resolve) => resolve(fragment))
        rerender()
      } else if (kind === 'select') {
        selected = { id: msg.id || null, label: msg.label || '' }
        reposition()
        const el = selected.id ? elementOfNodeId(doc, selected.id) : null
        if (el && msg.reveal && typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'nearest' })
      }
    })
    post({ kind: 'hello' })

    return {
      booted() {
        booted = true
        stampSoon()
      },
    }
  }


  // EMBEDDED MODE — the renderer as a JET Custom Component (<mateu-ui>) dropped on a page of
  // somebody else's Visual Builder app, next to the standalone app (the full VB app in the jar).
  //
  // ONE core, two modes. Standalone renders the content page of OUR VB app (main-start-page) through
  // VB's runtime: page module + action chains + variables. Embedded renders the SAME page markup and
  // runs the SAME chains, with the HOST's JET runtime and theme and without VB's: the markup is plain
  // JET templating (oj-bind-*, Knockout) — the only VB in it is the names of the binding context
  // ($application, $page, $variables, $listeners, $current) and the chains only use five Actions of
  // VB's API. So this module brings the minimal runtime that gives those names their meaning — the
  // descriptors (app-flow.json, the page JSONs) say what variables and listeners exist, exactly as
  // they say it to VB — and the component (embedded/mateu-ui-viewModel.js) binds the page to it. No
  // projection, chain or template is written twice: a fix to the content page is a fix to both.
  //
  // What the host sees is the component API (component.json): properties (baseUrl, route, params,
  // initialState, appContext, token / headers / headersProvider, navigation) and DOM events
  // (on-mateu-navigate, on-mateu-action, on-mateu-title, on-mateu-message, on-mateu-ready, on-mateu-error).
  //
  // The bridge is a module with module-level state (the registry hooks, the view in flight, the
  // mount): ONE <mateu-ui> per page. A second instance would share it — documented as a limitation.




  // ── the component's properties ───────────────────────────────────────────────────────────────

  /** The DOM events the component fires on its own element (bubbling). JET's convention: the event
   *  TYPE is camelCase (mateuNavigate) and a page listens with the kebab attribute on-mateu-navigate. */
  const EMBEDDED_EVENTS = Object.freeze({
    navigate: 'mateuNavigate',
    action: 'mateuAction',
    title: 'mateuTitle',
    message: 'mateuMessage',
    ready: 'mateuReady',
    error: 'mateuError',
  })

  /** How a navigation the SCREEN asks for (a row click, a NavigateTo, a link) is handled:
   *  - 'internal' (default): it happens inside the component; `mateuNavigate` is fired first and
   *    is CANCELABLE — a host listener calling preventDefault() takes it over;
   *  - 'host': it never happens inside; `mateuNavigate` is fired and the host decides (typically it
   *    navigates its own flow, or sets the component's `route`). */
  const NAVIGATION_POLICIES = Object.freeze(['internal', 'host'])

  /** A property that may arrive as an object or as its JSON (an HTML attribute is a string). */
  function parseJsonProp(value, fallback = null) {
    if (value == null || value === '') return fallback
    if (typeof value === 'object') return value
    try {
      const parsed = JSON.parse(String(value))
      return parsed == null ? fallback : parsed
    } catch (e) {
      return fallback
    }
  }

  /** The backend base: the URL of the Mateu mount (its API is <base>/mateu/v3/...), no trailing
   *  slash. '' = same origin as the host page. */
  function normalizeBaseUrl(value) {
    const v = String(value == null ? '' : value).trim()
    return v.replace(/\/+$/, '')
  }

  /** Images, logos and web-component modules are served from the backend ROOT, not from the mount
   *  (as on the Vaadin renderer): the ORIGIN of an absolute base, '' for a relative one. */
  function assetBaseOf(baseUrl) {
    const m = /^(https?:\/\/[^/]+)/i.exec(String(baseUrl || ''))
    return m ? m[1] : ''
  }

  /** The component's properties, normalised (the component and the tests share this reading). */
  function embeddedConfigOf(props = {}) {
    const navigation = NAVIGATION_POLICIES.includes(props.navigation) ? props.navigation : 'internal'
    const headers = parseJsonProp(props.headers, null)
    return {
      baseUrl: normalizeBaseUrl(props.baseUrl),
      route: String(props.route == null ? '' : props.route).trim(),
      params: parseJsonProp(props.params, {}) || {},
      initialState: parseJsonProp(props.initialState, null),
      appContext: parseJsonProp(props.appContext, {}) || {},
      navigation,
      token: props.token ? String(props.token) : '',
      headers: headers && typeof headers === 'object' ? headers : null,
      headersProvider: typeof props.headersProvider === 'function' ? props.headersProvider : null,
      withCredentials: props.withCredentials === true || props.withCredentials === 'true',
    }
  }

  /** The header provider the transport asks on every send (hostHeaders.mjs): the host's provider
   *  (called each time — a token that rotates is read fresh), else the static headers + token. */
  function headerProviderOf(config) {
    const fixed = { ...(config.headers || {}) }
    if (config.token) fixed.Authorization = /^\w+\s/.test(config.token) ? config.token : 'Bearer ' + config.token
    if (config.headersProvider) {
      const provider = config.headersProvider
      return async (url) => ({ ...fixed, ...((await provider(url)) || {}) })
    }
    return Object.keys(fixed).length ? fixed : null
  }

  /**
   * The Mateu route the component opens: `route` with its `:placeholders` filled from `params`, the
   * rest of `params` as the query (`orders` + {status: 'OPEN'} → /orders?status=OPEN — a listing
   * opens filtered, the same as a deep link with filters). '' → the home of the app.
   */
  function composeEmbeddedRoute(route, params = {}) {
    let r = String(route == null ? '' : route).trim()
    const rest = {}
    for (const key of Object.keys(params || {})) {
      const value = params[key]
      const placeholder = new RegExp('(^|/):' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=/|$|\\?)')
      if (placeholder.test(r)) r = r.replace(placeholder, '$1' + encodeURIComponent(value == null ? '' : String(value)))
      else if (value != null && value !== '') rest[key] = value
    }
    if (r && r.charAt(0) !== '/' && r.charAt(0) !== '?') r = '/' + r
    const query = Object.keys(rest)
      .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(typeof rest[k] === 'object' ? JSON.stringify(rest[k]) : String(rest[k])))
      .join('&')
    if (!query) return r
    return r + (r.indexOf('?') >= 0 ? '&' : '?') + query
  }

  /** What changed between two readings of the properties, and what the component must do about it:
   *  'boot' (the backend or the identity changed: start over), 'navigate' (another screen),
   *  'context' (the app context: reload the screen with it), or nothing. */
  function propertyChangeOf(previous, next) {
    if (!previous) return 'boot'
    if (previous.baseUrl !== next.baseUrl || previous.withCredentials !== next.withCredentials) return 'boot'
    if (JSON.stringify(previous.appContext) !== JSON.stringify(next.appContext)) return 'context'
    if (previous.route !== next.route || JSON.stringify(previous.params) !== JSON.stringify(next.params)
        || JSON.stringify(previous.initialState) !== JSON.stringify(next.initialState)) return 'navigate'
    return null
  }

  // ── the mode switch the chains consult ───────────────────────────────────────────────────────

  let embeddedHost = null

  /** The component registers itself here (null when it is gone): the chains ask isEmbedded() before
   *  touching what belongs to the host page — its URL, its title. */
  function setEmbeddedHost(host) { embeddedHost = host || null }

  function isEmbedded() { return embeddedHost != null }

  /** Fires one of EMBEDDED_EVENTS on the component; true unless a listener cancelled it (and true
   *  when there is no component: standalone has nobody to ask). */
  function emitEmbedded(name, detail) {
    if (!embeddedHost || typeof embeddedHost.emit !== 'function') return true
    return embeddedHost.emit(name, detail) !== false
  }

  /** The page title: the document's in standalone; in a host page the title is the HOST's, so the
   *  component reports it (mateuTitle) and lets the host decide. */
  // the last title reported: the screen's title arrives twice (its SetWindowTitle and its header)
  let lastTitle = null
  function isNewTitle(title) {
    if (title == null || title === '' || String(title) === lastTitle) return false
    lastTitle = String(title)
    return true
  }

  function setDocTitle(title) {
    if (title == null || title === '') return
    if (isEmbedded()) {
      if (isNewTitle(title)) emitEmbedded(EMBEDDED_EVENTS.title, { title: String(title) })
      return
    }
    if (typeof document !== 'undefined') document.title = title
  }

  // the initial state the host seeds the FIRST load of a screen with (initialState): consumed once
  let embeddedSeed = null

  function setEmbeddedSeed(state) {
    embeddedSeed = state && typeof state === 'object' && Object.keys(state).length ? state : null
  }

  /** The extra of a route load: {componentState} once after setEmbeddedSeed, {} otherwise. */
  function takeEmbeddedSeed() {
    const seed = embeddedSeed
    embeddedSeed = null
    return seed ? { componentState: seed } : {}
  }

  /** The route a navigation request names (onMateuNavigate's event: a menu selection, a NavigateTo,
   *  a link), or null. */
  function navigationRouteOf(params) {
    const event = params && params.event
    const detail = (event && (event.detail || event)) || {}
    for (const key of ['route', 'currentId', 'selectedValue', 'value']) {
      if (detail[key] != null && detail[key] !== '') return String(detail[key])
    }
    return null
  }

  /**
   * The Mateu route an ordinary link of the content names (`<a href="/journey/bookings/7">` in a
   * Text/Html of the app), or null (the browser follows it). Standalone resolves it against the
   * page's own URL (links.inAppRouteOfLink); embedded, the page is the HOST's, so it is resolved
   * against the BACKEND (base-url): the app's links are written for the app, not for its host.
   * `hostLocation` is used when the base is relative ('' = same origin as the host page).
   */
  function embeddedRouteOfLink(anchor, event, baseUrl, hostLocation) {
    let base
    try {
      base = new URL((normalizeBaseUrl(baseUrl) || '') + '/', hostLocation ? hostLocation.href : undefined)
    } catch (e) {
      return null
    }
    const mount = base.pathname.replace(/\/+$/, '')
    const location = { href: base.href, origin: base.origin, pathname: base.pathname, search: '' }
    return inAppRouteOfLink(anchor, event, location, false, mount)
  }

  /** Whether a navigation the SCREEN asked for happens inside the component. */
  function navigatesInside(policy, notCancelled) {
    return policy !== 'host' && notCancelled
  }

  // ── the minimal runtime for VB's descriptors ─────────────────────────────────────────────────

  /** VB's ActionChain: the chains only extend it (their logic is in run()). */
  class EmbeddedActionChain {}

  const PATH = /^(!!|!)?\s*(\$[A-Za-z]\w*(?:\.[A-Za-z_$][\w$]*)*)$/

  /**
   * Evaluates one listener-parameter expression of the descriptors: '{{ $event.detail.value }}',
   * '{{ !!$event.force }}', '{{ true }}' — dotted paths from the scope roots, optionally negated,
   * and literals. That is the whole grammar the descriptors use (a test pins it), so no eval and
   * nothing a CSP forbids. Objects and arrays are evaluated member by member; anything else is
   * returned as is.
   */
  function evalDescriptorValue(value, scope) {
    if (Array.isArray(value)) return value.map((v) => evalDescriptorValue(v, scope))
    if (value && typeof value === 'object') {
      const out = {}
      for (const k of Object.keys(value)) out[k] = evalDescriptorValue(value[k], scope)
      return out
    }
    if (typeof value !== 'string') return value
    const m = /^\{\{\s*([\s\S]*?)\s*\}\}$/.exec(value)
    if (!m) return value
    return evalDescriptorExpression(m[1], scope)
  }

  function evalDescriptorExpression(expr, scope) {
    const e = String(expr).trim()
    if (e === 'true') return true
    if (e === 'false') return false
    if (e === 'null') return null
    if (/^-?\d+(\.\d+)?$/.test(e)) return Number(e)
    if (/^'[^']*'$/.test(e)) return e.slice(1, -1)
    const m = PATH.exec(e)
    if (!m) throw new Error('mateu-ui: unsupported descriptor expression: ' + e)
    const parts = m[2].split('.')
    let v = scope ? scope[parts[0]] : undefined
    for (let i = 1; i < parts.length && v != null; i++) v = v[parts[i]]
    if (m[1] === '!!') return !!v
    if (m[1] === '!') return !v
    return v
  }

  /** The value a variable starts with: its defaultValue, else the empty value of its type. */
  function defaultOfVariable(def) {
    if (def && Object.prototype.hasOwnProperty.call(def, 'defaultValue')) {
      const d = def.defaultValue
      return d && typeof d === 'object' ? JSON.parse(JSON.stringify(d)) : d
    }
    const type = def && def.type
    if (type === 'string') return ''
    if (type === 'boolean') return false
    if (type === 'number') return 0
    if (typeof type === 'string' && type.endsWith('[]')) return []
    return undefined
  }

  const ADP_TYPE = /ArrayDataProvider/

  /**
   * Builds the runtime over the descriptors.
   *
   * @param opts.app        app-flow.json (variables, constants)
   * @param opts.pages      the page descriptors, merged into ONE page scope (the content page and
   *                        the parts of the shell page the embedded frame keeps: banner, toast)
   * @param opts.chains     { name: ChainClass } (the generated bundle of our chain modules)
   * @param opts.constants  overrides of app constants (mateuBaseUrl ← the base-url property)
   * @param opts.translations { appBundle: { key: text } }
   * @param opts.observable (initial) => ko-like observable (fn(), fn(v)) — the binding sees changes
   * @param opts.adpFactory (rows, keyAttributes) => { provider, setData(rows), add(items), remove(keys), refresh() }
   * @param opts.root       the component element: component methods are looked up inside it first
   * @param opts.policy     () => the navigation policy (read at each navigation: it is a property)
   * @param opts.emit       (name, detail) => notCancelled — fires the component's DOM events
   */
  function createVbRuntime(opts) {
    const observable = opts.observable
    const pages = opts.pages || []
    const appDefs = (opts.app && opts.app.variables) || {}
    const appConstants = {}
    for (const [k, def] of Object.entries((opts.app && opts.app.constants) || {})) {
      appConstants[k] = def && Object.prototype.hasOwnProperty.call(def, 'defaultValue') ? def.defaultValue : def
    }
    Object.assign(appConstants, opts.constants || {})

    const watchers = new Map() // 'app.x' | 'page.x' → [fn]
    const watch = (key, fn) => { if (!watchers.has(key)) watchers.set(key, []); watchers.get(key).push(fn) }
    const adps = []

    const makeVariables = (defs, scopeKey) => {
      const vars = {}
      for (const [name, def] of Object.entries(defs)) {
        if (def && typeof def.type === 'string' && ADP_TYPE.test(def.type)) {
          const dv = (def.defaultValue || {})
          const keyAttributes = dv.keyAttributes || 'id'
          const source = typeof dv.data === 'string' ? /^\{\{\s*\$(application\.variables|variables|page\.variables)\.(\w+)\s*\}\}$/.exec(dv.data) : null
          const adp = opts.adpFactory([], keyAttributes)
          adps.push(adp)
          if (source) watch((source[1] === 'application.variables' ? 'app.' : 'page.') + source[2], (rows) => adp.setData(rows || []))
          const box = observable(adp.provider)
          Object.defineProperty(vars, name, { enumerable: true, get: () => box(), set: (v) => box(v) })
          continue
        }
        const box = observable(defaultOfVariable(def))
        const key = scopeKey + '.' + name
        Object.defineProperty(vars, name, {
          enumerable: true,
          get: () => box(),
          set: (v) => {
            box(v)
            for (const fn of watchers.get(key) || []) fn(v)
          },
        })
      }
      return vars
    }

    const pageDefs = {}
    const listenerDefs = {}
    for (const page of pages) {
      Object.assign(pageDefs, page.variables || {})
      Object.assign(listenerDefs, page.eventListeners || {})
    }
    const $application = {
      variables: makeVariables(appDefs, 'app'),
      constants: appConstants,
      translations: opts.translations || { appBundle: {} },
      user: { isAuthenticated: false, roles: [], permissions: [] },
    }
    const $page = { variables: makeVariables(pageDefs, 'page'), constants: {} }
    // the ADPs bound to a variable start with its value (a later assignment re-feeds them)
    for (const page of pages) {
      for (const [name, def] of Object.entries(page.variables || {})) {
        const dv = def && def.defaultValue
        if (!(def && ADP_TYPE.test(String(def.type)) && dv && typeof dv.data === 'string')) continue
        const m = /^\{\{\s*\$(application\.variables|variables|page\.variables)\.(\w+)\s*\}\}$/.exec(dv.data)
        if (m) {
          const scope = m[1] === 'application.variables' ? $application.variables : $page.variables
          const rows = scope[m[2]]
          const adp = $page.variables[name] && adps.find((a) => a.provider === $page.variables[name])
          if (adp && Array.isArray(rows) && rows.length) adp.setData(rows)
        }
      }
    }

    // the screen's title is the host's to show (its header, its breadcrumbs, document.title): every
    // new one is reported (mateuTitle)
    watch('app.mateuHostTitle', (title) => {
      if (opts.emit && isNewTitle(title)) opts.emit(EMBEDDED_EVENTS.title, { title: String(title) })
    })

    const runtime = {}
    const context = () => ({
      $application,
      $page,
      $variables: $page.variables,
      $flow: { variables: {}, constants: {} },
      $constants: $page.constants,
      __mateuRuntime: runtime,
    })

    const chainError = (name, e) => {
      if (e && e.stale === true) return
      if (typeof console !== 'undefined' && console.error) console.error('mateu-ui: chain ' + name + ' failed', e)
      if (opts.emit) opts.emit(EMBEDDED_EVENTS.error, { chain: name, message: (e && e.message) || String(e) })
    }

    /** Runs one chain by name (the VB chain id), as VB does: a new instance, run(context, params). */
    runtime.callChain = async (name, params = {}, ctx = context()) => {
      const Chain = (opts.chains || {})[name]
      if (!Chain) {
        if (typeof console !== 'undefined' && console.warn) console.warn('mateu-ui: no chain ' + name + ' in the embedded runtime')
        return undefined
      }
      if (name === 'onMateuNavigate' && !(params && params.__fromHost)) {
        // a navigation the SCREEN asked for: the host hears it first, and the policy decides
        const route = navigationRouteOf(params)
        if (route != null) {
          const notCancelled = opts.emit ? opts.emit(EMBEDDED_EVENTS.navigate, { route, force: !!(params && params.force) }) : true
          const policy = typeof opts.policy === 'function' ? opts.policy() : 'internal'
          if (!navigatesInside(policy, notCancelled)) return undefined
        }
      }
      if (name === 'runMateuAction' && opts.emit && params && params.actionId) {
        opts.emit(EMBEDDED_EVENTS.action, { actionId: params.actionId, parameters: params.parameters || {} })
      }
      const clean = params && params.__fromHost ? Object.assign({}, params, { __fromHost: undefined }) : params
      return new Chain().run(ctx, clean || {})
    }

    /** The listeners of the descriptors, as the page binds them: on-x="[[ $listeners.name ]]".
     *  JET calls a listener with (event, data, bindingContext); $current is the binding context's. */
    const $listeners = {}
    const runListener = async (name, $event, $current) => {
      const def = listenerDefs[name]
      if (!def) return
      const ctx = context()
      const scope = { ...ctx, $event, $current }
      for (const step of def.chains || []) {
        try {
          const params = evalDescriptorValue(step.parameters || {}, scope)
          await runtime.callChain(step.chain, params, ctx)
        } catch (e) {
          chainError(step.chain, e)
        }
      }
    }
    for (const name of Object.keys(listenerDefs)) {
      $listeners[name] = (event, data, bindingContext) => {
        const current = bindingContext && bindingContext.$current !== undefined ? bindingContext.$current
          : (data && data.$current !== undefined ? data.$current : undefined)
        runListener(name, event, current)
      }
    }
    runtime.runListener = runListener

    /** VB's application events (Actions.fireEvent 'application:x'): the listeners of that name. */
    runtime.fireEvent = (name, payload) => runListener(name, payload, undefined)

    runtime.findElement = (selector) => {
      const root = opts.root
      const inRoot = root && typeof root.querySelector === 'function' ? root.querySelector(selector) : null
      if (inRoot) return inRoot
      // an open oj-dialog / drawer lives in JET's popup layer (body), not under the component
      return typeof document !== 'undefined' ? document.querySelector(selector) : null
    }

    runtime.context = context
    /** Calls fn with every new value of a variable ('app.x' or 'page.x'). */
    runtime.watch = watch
    runtime.$application = $application
    runtime.$page = $page
    runtime.$listeners = $listeners
    runtime.adps = adps
    /** What the component's view binds against: the same names a VB page sees. */
    runtime.bindingContext = { $application, $page, $variables: $page.variables, $listeners, $flow: { variables: {} } }
    return runtime
  }

  /** VB's Actions, the five the chains use (a test pins that no chain uses another). Each finds the
   *  runtime in the context it is given — the one the runtime built for that chain. */
  const runtimeOf = (context) => {
    const rt = context && context.__mateuRuntime
    if (!rt) throw new Error('mateu-ui: an action outside the embedded runtime')
    return rt
  }

  const embeddedActions = Object.freeze({
    callChain(context, { chain, params } = {}) {
      return runtimeOf(context).callChain(chain, params || {}, context)
    },
    async callComponentMethod(context, { selector, method, params } = {}) {
      const el = runtimeOf(context).findElement(selector)
      if (!el || typeof el[method] !== 'function') throw new Error('mateu-ui: no ' + selector + '.' + method + '()')
      return el[method](...(params || []))
    },
    fireEvent(context, { name, payload } = {}) {
      return runtimeOf(context).fireEvent(name, payload)
    },
    fireNotificationEvent(context, notification = {}) {
      const rt = runtimeOf(context)
      if (rt.emitMessage) rt.emitMessage(notification)
      return rt.fireEvent('vbNotification', notification)
    },
    async fireDataProviderEvent(context, { target, add, remove, refresh } = {}) {
      const rt = runtimeOf(context)
      const adp = rt.adps.find((a) => a.provider === target)
      if (!adp) return
      if (remove && remove.keys) adp.remove(remove.keys)
      if (add && add.data) adp.add(Array.isArray(add.data) ? add.data : [add.data])
      if (refresh !== undefined) adp.refresh()
    },
  })

  // ── booting the content runtime inside a host page ───────────────────────────────────────────

  /**
   * The document-level pieces of the content runtime: what loadMateuShell installs before its first
   * navigation (rules, calendars, maps, keys, drag and drop…) — the page markup relies on them. The
   * standalone shell keeps its own list in its chain; test-embedded.mjs reads that chain and fails if
   * it installs something this list does not (or does not explicitly leave out, NOT_IN_EMBEDDED), so
   * the two cannot drift apart silently.
   */
  const CONTENT_INSTALLERS = Object.freeze([
    'installRules', 'installPlanningRange', 'installActionPanels', 'installTileReorder', 'installRichText',
    'installMatrixGrids', 'installCalendars', 'installMaps', 'installRowTones', 'installStickyHeader',
    'installKeys', 'installHover', 'installBpmn', 'installCookieConsent', 'installContextMenus',
    'installChatComponents', 'installCustomComponents', 'installDragAndDrop', 'installAnnouncer',
    'trackPressedControls',
  ])

  /** The sinks that run a page action (an Element event, a rule, a calendar day, a drop…). */
  const CONTENT_ACTION_SINKS = Object.freeze([
    'setElementEventSink', 'setRuleActionSink', 'setCalendarActionSink', 'setMatrixActionSink',
    'setMapActionSink', 'setPlanningRangeSink', 'setUndoSink', 'setPollingRunner', 'setDropSink',
    'setKeysActionSink',
  ])

  /** What the standalone shell installs and the component deliberately does NOT, and why. */
  const NOT_IN_EMBEDDED = Object.freeze({
    // a skip link is the first child of the BODY: the host page owns its own landmarks
    mountSkipLink: 'the host page owns the document landmarks',
    // it reports EVERY uncaught error of the page to the Mateu backend: in a host page most of them
    // are the host's own, and they are not ours to ship to another server
    installClientErrorReporting: 'would ship the host page errors to the Mateu backend',
    // the IDE visual editor's canvas frames the STANDALONE app (its preview page), never a host app
    installEditorPreview: 'the visual editor previews the standalone app only',
    // the tile-reorder sink is wired, with its own payload, by installEmbeddedContentRuntime
    setTileReorderSink: 'wired separately (its payload is a scope, not an action)',
    // live reload (dev mode) answers an app-level change by reloading the WINDOW: in a host page that
    // is the host's app, not ours — the embedded component is not live-reloaded (yet)
    installDevLiveReload: 'an app-level reload would reload the host page',
  })

  /**
   * Installs the content runtime for an embedded component: the same pieces loadMateuShell installs
   * (CONTENT_INSTALLERS), with every action sink running the page action through the runtime, plus
   * the transport hooks that feed the busy bar, the error band and the offline band of the frame.
   */
  let contentInstalled = false
  let currentVars = null

  function installEmbeddedContentRuntime(b, runtime) {
    const runPageAction = (actionId, parameters, atom) => runtime.fireEvent('application:mateuElementEvent', {
      actionId, parameters, fromNested: !!(atom && atom.fromNested),
    })
    for (const sink of CONTENT_ACTION_SINKS) if (typeof b[sink] === 'function') b[sink](runPageAction)
    if (typeof b.setTileReorderSink === 'function') {
      b.setTileReorderSink((scope) => runtime.fireEvent('application:mateuTilesReordered', { scope: scope || '' }))
    }
    // the document-level listeners once per page; the sinks and hooks above/below follow the
    // CURRENT component (a new <mateu-ui> takes them over)
    const vars = runtime.$application.variables
    if (!contentInstalled) {
      contentInstalled = true
      for (const name of CONTENT_INSTALLERS) if (typeof b[name] === 'function') b[name]()
      if (b.connectivity) {
        b.connectivity.start()
        b.connectivity.subscribe((online) => { if (currentVars) currentVars.mateuOffline = !online })
      }
    }
    currentVars = vars
    if (typeof b.setTransportHooks === 'function') {
      b.setTransportHooks({
        onStart: () => { vars.mateuBusy = true; if (b.markPressedControlBusy) b.markPressedControlBusy() },
        onSettle: ({ failure }) => {
          vars.mateuBusy = false
          if (b.clearPressedControlBusy) b.clearPressedControlBusy()
          if (failure && failure.kind !== 'cancelled') {
            vars.mateuLastError = failure.message
            if (b.announce) b.announce(failure.message, { politeness: 'assertive' })
            emitEmbedded(EMBEDDED_EVENTS.error, { kind: failure.kind, message: failure.message, status: failure.status })
          }
        },
      })
    }
  }

  /**
   * Boots (or re-boots, when the backend or the identity change) the component: the host's identity
   * and app context, the App of the mount (its REST sources, its home, its menu routes — never
   * painted: the host owns the chrome), then the route the properties name. Mirrors loadMateuShell
   * minus the shell chrome; the navigation itself is the shell's own chain (onMateuNavigate).
   */
  async function bootEmbedded(b, runtime, config) {
    const vars = runtime.$application.variables
    setHostHeaderProvider(headerProviderOf(config))
    setHostCredentials(config.withCredentials ? 'include' : undefined)
    // no mount: a host page's URL is the host's — routes never reach it (hash mode, pushes skipped)
    setMount(null)
    runtime.$application.constants.mateuBaseUrl = config.baseUrl
    if (b.setElementModuleBase) b.setElementModuleBase(assetBaseOf(config.baseUrl))
    vars.mateuAppState = { ...(config.appContext || {}) }
    const boot = await b.bootstrapShell(config.baseUrl, 'shell')
    const withoutApp = !b.bootstrapHasApp(boot)
    b.setMountWithoutApp(withoutApp)
    const reg = b.reduceContexts({ contexts: {}, stack: [], shell: null }, boot)
    if (reg.shell && reg.shell.menu && b.expandRemoteMenus) {
      reg.shell.menu = await b.expandRemoteMenus(reg.shell.menu, { sections: reg.shell.variant === 'HAMBURGER_SECTIONS' })
    }
    vars.mateuRegistry = reg
    const nav = b.shellNavOf(reg)
    vars.mateuShellSST = nav.serverSideType || ''
    const firstLeaf = (nav.menuTree || []).find((entry) => !entry.hasChildren)
    const homeRoute = b.routeUnderMount(nav.homeRoute) || (firstLeaf ? firstLeaf.id : '') || (withoutApp ? '/' : '')
    vars.mateuHomeRoute = homeRoute
    await navigateEmbedded(runtime, config, homeRoute)
    emitEmbedded(EMBEDDED_EVENTS.ready, { route: vars.mateuSelectedNavId || vars.mateuSelectedRoute || '' })
  }

  /** The host asked for a screen (the route/params/initialState properties): it always happens —
   *  the policy is for what the SCREEN asks for. */
  function navigateEmbedded(runtime, config, homeRoute) {
    const route = composeEmbeddedRoute(config.route, config.params) || homeRoute || runtime.$application.variables.mateuHomeRoute || ''
    if (!route) return Promise.resolve()
    setEmbeddedSeed(config.initialState)
    return runtime.callChain('onMateuNavigate', { event: { detail: { route } }, force: true, __fromHost: true })
  }

  /** The routines the bridge exports for the component (make-amd adds them to its return). */
  const EMBEDDED_API = {
    EMBEDDED_EVENTS,
    embeddedConfigOf,
    headerProviderOf,
    composeEmbeddedRoute,
    propertyChangeOf,
    navigationRouteOf,
    embeddedRouteOfLink,
    assetBaseOf,
    setEmbeddedHost,
    isEmbedded,
    emitEmbedded,
    setDocTitle,
    setEmbeddedSeed,
    takeEmbeddedSeed,
    createVbRuntime,
    embeddedActions,
    EmbeddedActionChain,
    CONTENT_INSTALLERS,
    CONTENT_ACTION_SINKS,
    installEmbeddedContentRuntime,
    bootEmbedded,
    navigateEmbedded,
    setHostHeaderProvider,
    setHostCredentials,
  }


  // LIVE RELOAD (modo desarrollo del backend, mateu.dev=true): el mismo contrato que
  // libs/mateu/src/mateu/ui/infra/dev/liveReloadPolicy.ts — aquí no se hereda nada del core web.
  //
  // El backend en modo dev estampa <meta name="mateu-dev" content="/mateu/dev/events"> en el índice
  // y sirve ese stream SSE: `hello` (con bootId: si cambia, el servidor se reinició → repintar),
  // `specs-changed` (scope page|app), `reload` (el IDE tras un HotSwap) y `ping`. Una ráfaga de
  // eventos se colapsa en UNA recarga. `page` repinta la ruta en pantalla CONSERVANDO lo tecleado
  // (la shell lo pasa a onMateuNavigate como liveState); `app` vuelve a montar la app en la misma URL.

  /** Qué significa un mensaje del stream: { action: 'none'|'page'|'app', bootId, reason }. */
  function liveReloadDecision(message, knownBootId) {
    if (!message || typeof message !== 'object') return { action: 'none', bootId: knownBootId }
    if (message.type === 'hello') {
      const restarted = !!knownBootId && !!message.bootId && message.bootId !== knownBootId
      return {
        action: restarted ? 'page' : 'none',
        bootId: message.bootId || knownBootId,
        reason: restarted ? 'server restarted' : undefined,
      }
    }
    if (message.type === 'specs-changed' || message.type === 'reload') {
      const files = message.files || []
      const names = files.map((f) => f.substring(f.lastIndexOf('/') + 1))
      const reason = message.type === 'reload'
        ? 'reload requested'
        : names.length === 0 ? 'specs changed'
          : names.length <= 2 ? names.join(', ') : `${names[0]} and ${names.length - 1} more`
      return { action: message.scope === 'app' ? 'app' : 'page', bootId: knownBootId, reason }
    }
    return { action: 'none', bootId: knownBootId }
  }

  /** La más fuerte de dos recargas pendientes (app absorbe page). */
  function strongerReload(a, b) {
    const rank = { none: 0, page: 1, app: 2 }
    return (rank[a] || 0) >= (rank[b] || 0) ? a : b
  }

  /** Dónde está el stream, si el índice lo anuncia (o la app lo fija en window.__MATEU_DEV_EVENTS__). */
  function devEventsUrlOf(doc, win) {
    if (win && win.__MATEU_DEV_EVENTS__) return win.__MATEU_DEV_EVENTS__
    const meta = doc && doc.querySelector ? doc.querySelector('meta[name="mateu-dev"]') : null
    return (meta && meta.content) || undefined
  }

  let liveReloadSource = null

  // Lo tecleado en el form del host vive en el borrador de la página de contenido ($page.mateuDraft),
  // que la shell no ve: la chain que lo acumula lo apunta aquí, con la ruta en que se tecleó.
  let liveDraft = { route: null, draft: null }
  function noteLiveDraft(route, draft) { liveDraft = { route: route == null ? null : route, draft } }
  /** El borrador tecleado en `route` (nada si era de otra pantalla). */
  function liveDraftFor(route) {
    return liveDraft.draft && liveDraft.route === (route == null ? null : route) ? liveDraft.draft : null
  }

  /**
   * Se suscribe al stream (una vez) y llama a onReload(action, reason) tras cada ráfaga. Sin
   * <meta name="mateu-dev"> no hace nada. `EventSourceImpl` y `timer` se inyectan en los tests.
   */
  function installDevLiveReload(doc, win, onReload, EventSourceImpl, timer = setTimeout) {
    const ES = EventSourceImpl || (win && win.EventSource)
    if (liveReloadSource || !ES) return null
    const url = devEventsUrlOf(doc, win)
    if (!url) return null
    const source = new ES(url)
    liveReloadSource = source
    let bootId
    let pending = 'none'
    let reason
    let handle
    source.onmessage = (event) => {
      let message
      try { message = JSON.parse(event.data) } catch (e) { return }
      const decision = liveReloadDecision(message, bootId)
      bootId = decision.bootId
      if (decision.action === 'none') return
      pending = strongerReload(pending, decision.action)
      reason = decision.reason
      if (handle !== undefined) clearTimeout(handle)
      handle = timer(() => {
        const action = pending
        pending = 'none'
        handle = undefined
        onReload(action, reason)
        showReloadedPill(doc, reason)
      }, 60)
    }
    return source
  }

  /** Tests. */
  function resetDevLiveReload() {
    if (liveReloadSource && liveReloadSource.close) liveReloadSource.close()
    liveReloadSource = null
  }

  /** Una píldora discreta abajo a la izquierda que se desvanece sola. */
  function showReloadedPill(doc, reason) {
    if (!doc || !doc.body || !doc.createElement) return
    let pill = doc.getElementById('mateu-live-reload-indicator')
    if (!pill) {
      pill = doc.createElement('div')
      pill.id = 'mateu-live-reload-indicator'
      pill.setAttribute('role', 'status')
      pill.setAttribute('aria-live', 'polite')
      pill.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483000;padding:4px 10px;'
        + 'border-radius:999px;font:12px/1.4 system-ui,sans-serif;background:rgba(30,30,30,.82);'
        + 'color:#fff;pointer-events:none;transition:opacity .4s ease;opacity:0'
      doc.body.appendChild(pill)
    }
    pill.textContent = '↻ Reloaded' + (reason ? ' · ' + reason : '')
    pill.style.opacity = '1'
    clearTimeout(pill.__mateuFade)
    pill.__mateuFade = setTimeout(() => { pill.style.opacity = '0' }, 1800)
  }

  // el importe de un campo money: IntlNumberConverter con estilo moneda (un objeto JSON ya no vale)
  setConverterFactory((spec) => new NumberConverter.IntlNumberConverter(spec.options));
  // reglas del cliente: cada reducción fija su contexto (las del host, con su estado)
  // el selector de columnas: listingOf aplica las preferencias de la ruta en pantalla
  setColumnPrefsReader(() => readColumnPrefs(listingScope()));
  setAfterReduceHook((reg) => {
    setRulesContexts(reg);
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
  // an editable richText (HTML; a legacy Delta opens converted) and a colour field: JET has neither
  defineRichTextField();
  defineColorField();
  // los grids embebidos necesitan un data provider de JET; el core es agnóstico y lo recibe
  setDataProviderFactory((rows) => new ArrayDataProvider(rows || [], { keyAttributes: '_rowNumber' }));
  // el editor de cada filtro del buscador (smartFilters.filtersMetadata): oj-dynamic se carga
  // sólo cuando un listado declara filtros
  setMetadataProviderFactory((data) => new Promise((resolve, reject) => {
    require(['oj-dynamic/providers/JsonMetadataProvider'], (JsonMetadataProvider) => {
      resolve(new JsonMetadataProvider({ data }));
    }, reject);
  }));
  // the visual editor's canvas (editorPreview.mjs): the data a template bound to an element is
  // its knockout binding context's $current.data — the atom, the card, the field. Loaded only on
  // the editor's preview page; null when knockout is not there (no ids, the canvas still paints)
  const editorDataResolver = () => new Promise((resolve) => {
    require(['knockout'], (ko) => resolve((el) => {
      const c = ko.contextFor(el);
      return c && c.$current ? c.$current.data : undefined;
    }), () => resolve(null));
  });

  return {
    HOST_ID,
    // live reload contra un backend en modo dev (poc/liveReload.mjs)
    installDevLiveReload,
    devEventsUrlOf,
    noteLiveDraft,
    liveDraftFor,
    // embedded mode (embedded.mjs): the <mateu-ui> component's runtime and boot
    ...EMBEDDED_API,
    // the renderer's own words (i18n.mjs): chains say them in the interface's language
    chromeText,
    chromeLanguage,
    setChromeLanguage,
    chromeTextsOf,
    // wire-version check (wireVersion.mjs): the shell shows a mismatch in the error band
    setWireMismatchListener,
    checkWireVersion,
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
    rowClickOpensRecord,
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
    // the shell's FLOWS: a menu RuleLink running a declared flow client-side (shellFlows.mjs)
    isMenuRuleId,
    menuRulesOf,
    menuRulePlanOf,
    // the ACTION catalogue: a page button / menu leaf runs the owner's flow, then the catalogue's
    pageFlowOf,
    catalogueActionOf,
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
    // the mount of the packaged app (<mateu-ui baseUrl>): API base and route ↔ browser path
    initMount,
    isPathMode,
    currentMount,
    mateuBase,
    mateuAssetBase,
    urlOfRoute,
    currentRouteOf,
    currentRoutePathOf,
    routeOfPath,
    pathOfRoute,
    routeUnderMount,
    bootstrapShell,
    bootstrapHasApp,
    setMountWithoutApp,
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
    // el FAB de "ask" del shell: su marca (neutra por defecto, o la del @App) y su nombre
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
    bundleUrlOf,
    hasBundle,
    awaitBundle,
    // the IDE's visual editor paints with this app in an iframe (editorPreview.mjs): it hands the
    // increment over, the app answers its own /mateu calls, a click selects instead of acting
    isEditorPreview,
    installEditorPreview,
    setEditorNodeIds,
    editorDataResolver,
    PREVIEW_ROUTE,
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
    buildChatBody,
    buildChatMenuContext,
    streamChat,
    stickChatToBottom,
    uploadChatFiles,
    // paridad con el chat web: config del panel, el turno completo (contexto + pantalla + mcp +
    // adjuntos), herramientas en curso y los textos de una respuesta vacía o fallida
    chatConfigOf,
    chatTurnOf,
    chatTurnTextOf,
    chatToolStepsOf,
    withAttachments,
    projectChatScreen,
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
    // the display components of core/display.mjs: client view state (carousel slide, Grid page,
    // tree rows) and its re-projection, content menus, MessageInput, and their DOM installers
    setUiValue,
    uiValueOf,
    reprojectedContentOf,
    menuChoiceOf,
    dispatchOf,
    messageSendOf,
    installBpmn,
    installCookieConsent,
    installContextMenus,
    installChatComponents,
    installCustomComponents,
    // an app registers the view of its own custom components (CustomComponent) here
    registerCustomComponent,
    runSurfaceAction,
    // the page projection and the outbound action plan the two big page chains share
    // (poc/pageProjection.mjs, poc/actionPlan.mjs)
    listHeaderVarsOf,
    wizardVarsOf,
    archetypeVarsOf,
    islandVarsOf,
    nestedVarOf,
    noGenericFormVars,
    hostContentPlanOf,
    generalOverviewPageOf,
    pageHeaderOf,
    // the page header's record/context switcher (RecordSwitcherSupplier): a pick → its action
    switcherPickOf,
    formActionsBesideHeader,
    pageWidthOf,
    pageLayoutOf,
    outboundActionOf,
    hostReRendered,
    touchesHost,
    onlyMessagesAnswer,
    fabsOf,
    // GlobalSearchSupplier in the Ask palette, app-level actions (app @Fab), light/dark
    fetchGlobalSearch,
    paletteRowsOfHits,
    runAppLevelAction,
    applyInitialTheme,
    toggleTheme,
  };
});
