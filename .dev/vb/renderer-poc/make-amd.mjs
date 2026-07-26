// Genera el módulo AMD del bridge para la app VB a partir de la FUENTE ÚNICA del core:
// reduceContexts.mjs + transport.mjs (los mismos ficheros que testea test.mjs/capture.mjs).
// Uso: node make-amd.mjs   → escribe ../mateu-vb/webApps/vbredwoodapp/resources/js/mateu-bridge.js

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '..', 'mateu-vb', 'webApps', 'vbredwoodapp', 'resources', 'js', 'mateu-bridge.js')

const strip = (file) =>
  readFileSync(join(here, file), 'utf8')
    .split('\n')
    .filter((l) => !l.startsWith('import '))
    .map((l) => l.replace(/^export (async |const |function |class )/, '$1').replace(/^export /, ''))
    .join('\n')

const body = `${strip('reduceContexts.mjs')}\n\n${strip('transport.mjs')}`

const amd = `/* GENERADO por renderer-poc/make-amd.mjs — NO EDITAR A MANO.
 * Fuente única del core: renderer-poc/reduceContexts.mjs + transport.mjs
 * (tests de contrato: cd renderer-poc && node test.mjs). */
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
    findAllByType,
    cardOf,
    welcomeOf,
    generalOverviewOf,
    itemOverviewOf,
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
  };
});
`

mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, amd)
console.log(`Escrito ${out} (${amd.length} bytes)`)
