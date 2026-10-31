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

export const CHROME_TEXTS = {
  en: {
    // ── generic ──
    close: 'Close',
    retry: 'Retry',
    reload: 'Reload',
    loading: 'Loading',
    search: 'Search…',
    noData: 'No data',
    rangeTo: 'To',
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
    // the finished guided process's last screen, when the wire brings no result title
    wizardCompleted: 'Completed',
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
    // version skew (versionSkew.mjs): another deployment answered than the one this page started with
    appUpdated: 'This app has been updated. Reload to use the latest version.',
    screenChanged: 'This screen has changed since you opened it. Reload to continue.',
    errSecurityRefused: "The server's security layer refused this request before the app could handle it (for example its CSRF protection). If it keeps happening, tell your administrator.",
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
    // ── live UI push (agentPush.mjs) ──
    agentConnect: 'Connect AI',
    agentDialogTitle: 'Connect an AI agent',
    agentPairInstruction: 'Ask your agent to pair with this code (mateu_pair_session).',
    agentCodeLabel: 'Pairing code',
    agentExpiresIn: 'Expires in {time}',
    agentCodeExpired: 'The code expired. Get a new one to pair an agent.',
    agentNewCode: 'New code',
    agentGettingCode: 'Getting a code…',
    agentNoCode: 'the server sent no code',
    agentConnected: 'AI agent connected: {agents}',
    agentConnectedTo: 'Connected to:',
    agentAnAgent: 'an agent',
    agentDisconnect: 'Disconnect',
    agentDisconnected: 'AI agent disconnected',
    agentCodeAnnounce: 'Pairing code {code}. It expires in {minutes} minutes.',
    agentChannelDown: 'Connecting to the app server… the agent can reach this tab once the connection is up.',
    agentPushOff: 'Live UI push is not enabled on this server.',
    agentError: 'Could not reach the agent service: {message}',
    agentPushedScreen: 'An AI agent sent a screen',
    // ── open on mobile (@App(mobileQr), qr.mjs) ──
    mobileQrAction: 'Open on mobile',
    mobileQrTitle: 'Open on your phone',
    mobileQrHint: "Scan with your phone's camera or the Mateu app. The code only says where this app is: you sign in on the phone.",
    mobileQrPhoneHint: 'Opens this screen in the Mateu app — or the page to install it.',
    mobileQrAlt: 'QR code to open {app} in the Mateu app',
    mobileQrThisApp: 'this app',
    mobileQrOpenInApp: 'Open in the Mateu app',
    mobileQrLink: 'Link',
    mobileQrCopy: 'Copy link',
    mobileQrCopied: 'Link copied',
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
    // ── page header: peer navigation (the arrows' tooltips when the page names none) ──
    previousItem: 'Previous',
    nextItem: 'Next',
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
    foldoutUnfold: 'Show {title}',
    customFailed: 'Custom component failed: {message}',
    askSomething: 'Ask something…',
    assistantFailed: 'The assistant could not answer: {message}',
    formatting: 'Formatting',
    preview: 'Preview',
    rteBold: 'Bold', rteItalic: 'Italic', rteUnderline: 'Underline', rteBullets: 'Bulleted list', rteNumbers: 'Numbered list',
    rteLink: 'Link', rteClear: 'Clear formatting', rteLinkPrompt: 'Link URL',
    colourPicker: '{label} — picker',
    loadingContent: 'Loading',
    // ── E2 patterns: compare & merge, app shortcuts, live header values, idle session ──
    mergeShowDifferences: 'Show only differences',
    mergeField: 'Field',
    mergeCustom: 'Custom',
    mergeUseValue: 'Use value from {record} for {field}',
    mergeCustomValue: 'Custom value for {field}',
    mergeDiffers: 'differs',
    mergeEmpty: '(empty)',
    mergeResult: 'Result',
    mergeAction: 'Merge',
    mergeSummary: '{fields} fields: {differ} differ; {custom} typed by hand',
    mergeFrom: 'from {record}',
    keyboardShortcuts: 'Keyboard shortcuts',
    shortcutsApp: 'Everywhere in the app',
    shortcutsScreen: 'On this screen',
    shortcutsHelpKey: 'Show this list',
    shortcutsPalette: 'Search or go to',
    quickLaunchCode: 'Code',
    headerValueChanged: '{label} changed to {value}',
    idleTitle: 'Are you still there?',
    idleMessage: 'For your security you will be signed out in {seconds} seconds.',
    idleStay: 'Stay signed in',
    idleSignOut: 'Sign out',
    idleSigningOut: 'Signing out…',
  },
  es: {
    close: 'Cerrar',
    retry: 'Reintentar',
    reload: 'Recargar',
    loading: 'Cargando',
    search: 'Buscar…',
    noData: 'Sin datos',
    rangeTo: 'Hasta',
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
    wizardCompleted: 'Completado',
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
    appUpdated: 'Esta aplicación se ha actualizado. Recarga para usar la última versión.',
    screenChanged: 'Esta pantalla ha cambiado desde que la abriste. Recarga para continuar.',
    errSecurityRefused: 'La capa de seguridad del servidor rechazó la petición antes de que la aplicación pudiera atenderla (por ejemplo, su protección CSRF). Si se repite, avisa a tu administrador.',
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
    // ── live UI push (agentPush.mjs) ──
    agentConnect: 'Conectar IA',
    agentDialogTitle: 'Conectar un agente de IA',
    agentPairInstruction: 'Pide a tu agente que se empareje con este código (mateu_pair_session).',
    agentCodeLabel: 'Código de emparejamiento',
    agentExpiresIn: 'Caduca en {time}',
    agentCodeExpired: 'El código ha caducado. Pide otro para emparejar un agente.',
    agentNewCode: 'Nuevo código',
    agentGettingCode: 'Obteniendo un código…',
    agentNoCode: 'el servidor no envió ningún código',
    agentConnected: 'Agente de IA conectado: {agents}',
    agentConnectedTo: 'Conectado a:',
    agentAnAgent: 'un agente',
    agentDisconnect: 'Desconectar',
    agentDisconnected: 'Agente de IA desconectado',
    agentCodeAnnounce: 'Código de emparejamiento {code}. Caduca en {minutes} minutos.',
    agentChannelDown: 'Conectando con el servidor de la aplicación… el agente podrá llegar a esta pestaña cuando haya conexión.',
    agentPushOff: 'El envío de UI en vivo no está activado en este servidor.',
    agentError: 'No se pudo contactar con el servicio de agentes: {message}',
    agentPushedScreen: 'Un agente de IA ha enviado una pantalla',
    // ── open on mobile (@App(mobileQr), qr.mjs) ──
    mobileQrAction: 'Abrir en el móvil',
    mobileQrTitle: 'Ábrelo en tu móvil',
    mobileQrHint: 'Escanéalo con la cámara del móvil o con la app Mateu. El código solo dice dónde está esta aplicación: inicias sesión en el móvil.',
    mobileQrPhoneHint: 'Abre esta pantalla en la app Mateu, o la página para instalarla.',
    mobileQrAlt: 'Código QR para abrir {app} en la app Mateu',
    mobileQrThisApp: 'esta aplicación',
    mobileQrOpenInApp: 'Abrir en la app Mateu',
    mobileQrLink: 'Enlace',
    mobileQrCopy: 'Copiar enlace',
    mobileQrCopied: 'Enlace copiado',
    // ── display components (core/display.mjs) ──
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
    previousItem: 'Anterior',
    nextItem: 'Siguiente',
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
    foldoutUnfold: 'Mostrar {title}',
    customFailed: 'El componente propio ha fallado: {message}',
    askSomething: 'Pregunta lo que quieras…',
    assistantFailed: 'El asistente no ha podido responder: {message}',
    formatting: 'Formato',
    preview: 'Vista previa',
    rteBold: 'Negrita', rteItalic: 'Cursiva', rteUnderline: 'Subrayado', rteBullets: 'Lista con viñetas', rteNumbers: 'Lista numerada',
    rteLink: 'Enlace', rteClear: 'Quitar formato', rteLinkPrompt: 'URL del enlace',
    colourPicker: '{label} — selector',
    loadingContent: 'Cargando',
    mergeShowDifferences: 'Mostrar solo las diferencias',
    mergeField: 'Campo',
    mergeCustom: 'Otro valor',
    mergeUseValue: 'Usar el valor de {record} para {field}',
    mergeCustomValue: 'Otro valor para {field}',
    mergeDiffers: 'difiere',
    mergeEmpty: '(vacío)',
    mergeResult: 'Resultado',
    mergeAction: 'Fusionar',
    mergeSummary: '{fields} campos: {differ} difieren; {custom} escritos a mano',
    mergeFrom: 'de {record}',
    keyboardShortcuts: 'Atajos de teclado',
    shortcutsApp: 'En toda la aplicación',
    shortcutsScreen: 'En esta pantalla',
    shortcutsHelpKey: 'Mostrar esta lista',
    shortcutsPalette: 'Buscar o ir a',
    quickLaunchCode: 'Código',
    headerValueChanged: '{label} ha cambiado a {value}',
    idleTitle: '¿Sigues ahí?',
    idleMessage: 'Por seguridad, se cerrará tu sesión en {seconds} segundos.',
    idleStay: 'Seguir conectado',
    idleSignOut: 'Cerrar sesión',
    idleSigningOut: 'Cerrando sesión…',
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
export function setChromeLanguage(lang) { explicitLanguage = lang ? String(lang) : '' }

/** The base language code of the chrome ('en', 'es'…): explicit > <html lang> > browser > 'en'. */
export function chromeLanguage(lang) {
  const raw = lang || explicitLanguage
    || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang)
    || (typeof navigator !== 'undefined' && navigator.language) || 'en'
  return String(raw).toLowerCase().split(/[-_]/)[0] || 'en'
}

/** A chrome text in `lang` (or the interface's language), `{name}` placeholders filled from vars. */
export function chromeText(key, vars, lang) {
  const language = chromeLanguage(lang)
  const dict = CHROME_TEXTS[language] || {}
  let text = Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : CHROME_TEXTS.en[key]
  if (text == null) return key
  if (vars) text = text.replace(/\{(\w+)\}/g, (m, k) => (vars[k] == null ? m : String(vars[k])))
  return text
}

/** Every chrome text in `lang`, English filling the gaps (what the VB translation bundle carries). */
export function chromeTextsOf(lang) {
  return { ...CHROME_TEXTS.en, ...(CHROME_TEXTS[chromeLanguage(lang)] || {}) }
}

// ── money ─────────────────────────────────────────────────────────────────────────────────────
// The rule the web renderers follow (libs/mateu moneyFormat): an Amount ({value, currency, locale})
// is written in ITS locale and currency; a bare number declared money gets two decimals grouped the
// way the UI's locale groups them — the app's (<html lang> / explicit), else the browser's. It used to
// be hard-wired to de-DE, so an English app read "1.234,50".

/** The UI's full locale tag (explicit > <html lang> > browser > 'en'), for number formatting. */
export function uiLocale() {
  return explicitLanguage
    || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang)
    || (typeof navigator !== 'undefined' && navigator.language) || 'en'
}

function intl(locale, options) {
  try { return new Intl.NumberFormat(locale, options) } catch (e) {
    try { return new Intl.NumberFormat(String(locale || '').replace(/_/g, '-'), options) } catch (e2) {
      return new Intl.NumberFormat('en', options)
    }
  }
}

const TWO_DECIMALS = { minimumFractionDigits: 2, maximumFractionDigits: 2 }

/** A money number with two decimals in `locale` (default: the UI's); not a finite number → ''. */
export function moneyNumberText(value, locale) {
  const n = typeof value === 'number' ? value : parseFloat(String(value))
  if (!Number.isFinite(n)) return ''
  return intl(locale || uiLocale(), TWO_DECIMALS).format(n)
}

/** Any money value as text: an Amount in its own locale/currency, a number in the UI's locale. */
export function moneyText(raw, locale) {
  const amount = raw && typeof raw === 'object' && 'value' in raw ? raw : null
  const value = amount ? amount.value : raw
  if (value === null || value === undefined || value === '') return ''
  const n = typeof value === 'number' ? value : parseFloat(String(value))
  if (Number.isNaN(n)) return String(value)
  const own = (amount && amount.locale) || locale || uiLocale()
  if (amount && amount.currency) {
    try { return new Intl.NumberFormat(own, { style: 'currency', currency: amount.currency }).format(n) } catch (e) {
      return moneyNumberText(n, own) + ' ' + amount.currency
    }
  }
  return moneyNumberText(n, own)
}
