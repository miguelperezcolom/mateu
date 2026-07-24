# redwood-vb — Mateu renderer on Oracle Visual Builder

Convertir una app **Visual Builder** real (hosteada en Oracle) en un renderer de Mateu, mediante un **kit JS
portable** (bridge) que consume el `UIIncrementDto` estándar y lo pinta con componentes `oj-sp`/`oj-c`/
`oj-dynamic` auténticos. VB = "un renderer más"; el backend de Mateu **no se toca**.

> **El plan es la fuente de verdad**, y vive en el repo: `.dev/vb/DESIGN-NOTES.md` (diseño + handoff) y
> `.dev/vb/RENDERER-ROADMAP.md` (fases con puertas visuales/de mecanismo). Léelos antes de tocar esto.

## Por qué NO es un app Vite como los otros renderers

El entregable es un **kit AMD portable** para el runtime requirejs de VB, no un bundle Vite que copie assets al
backend. Este directorio es el **hogar de desarrollo** del core (JS puro, testeable en Node) + tooling de captura
+ fixtures + los artefactos VB que se irán añadiendo. Sin paso de build que VB no pueda reproducir.

## Estructura

```
src/core/reduceContexts.mjs   ← EL núcleo del bridge (reducer puro + helpers de render). Single source.
                                 En la app VB serán métodos de app-flow.js; aquí, funciones libres testeables.
tools/capture.mjs             ← Fase 0: POST loads/acciones contra un Mateu vivo → vuelca increments REALES.
fixtures/real/*.json          ← increments capturados (contrato de wire real, no sintético).
test/*.test.mjs               ← tests de contrato del reducer contra los fixtures reales (node:test).
```

## Uso

```bash
# Tests del core (node:test, sin VB)
npm test            # o: node --test test/

# Fase 0 — capturar increments reales contra un backend Mateu vivo
npm run capture -- --base http://localhost:8595
# vuelca fixtures/real/<name>.json para cada superficie del lote
```

## Estado

- **Fase 0 (en curso)**: captura de fixtures reales + fijar el contrato de wire.
  - Hallazgo clave: el `component` de un fragment es un `ServerSideComponentDto` con campos al **nivel superior**
    (`type`, `serverSideType`, `route`, `children`, `pageType`, `pageWidth`, `initialData`, `actions`, …),
    **no** bajo `component.metadata`. El árbol de contenido va en `component.children`.
