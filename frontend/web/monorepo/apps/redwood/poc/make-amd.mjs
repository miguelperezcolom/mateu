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
const body = `${strip('reduceContexts.mjs')}\n\n${strip('resilience.mjs')}\n\n${strip('a11y.mjs')}\n\n${strip('bundle.mjs')}\n\n${strip('transport.mjs')}`

const amd = `/* GENERADO por poc/make-amd.mjs — NO EDITAR A MANO.
 * Fuente única del core: poc/reduceContexts.mjs + transport.mjs
 * (tests de contrato: cd poc && node test.mjs). */
define([], () => {
  'use strict';
${body.replace(/^/gm, '  ').replace(/^ {2}$/gm, '')}
  return {
    HOST_ID,
    reduceContexts,
    collectFields,
    collectActions,
    collectIslands,
    mediatorOf,
    buildOverlay,
    dynFormMetadataOf,
    actionsOf,
    summarizeHost,
    findByType,
    listingOf,
    onLoadTriggers,
    fieldListOf,
    overlayOf,
    eventTriggersOf,
    dismissOverlay,
    shellNavOf,
    ojIconOf,
    longTaskWatcher,
    findAllByType,
    cardOf,
    welcomeOf,
    generalOverviewOf,
    itemOverviewOf,
    itemOverviewPageOf,
    autoSaveOf,
    taskQueueOf,
    emptyStateOf,
    interpolate,
    islandContentOf,
    mergeNestedContent,
    hostContentOf,
    wizardForwardOf,
    bannersOf,
    pageStyleOf,
    pageToolbarOf,
    entityHeaderOf,
    collectTexts,
    foldoutOf,
    wizardOf,
    callMateu,
    bootstrapShell,
    loadRoute,
    loadRouteInto,
    composeInnerRoute,
    runMateuAction,
    runMateuActionSse,
    // resiliencia: la app las usa para pintar el estado de carga, la banda de sin-conexión
    // y el mensaje de error ya traducido
    classifyRequestFailure,
    isIdempotentAction,
    connectivity,
    pendingActions,
    setTransportHooks,
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
  };
});
`

mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, amd)
console.log(`Escrito ${out} (${amd.length} bytes)`)
