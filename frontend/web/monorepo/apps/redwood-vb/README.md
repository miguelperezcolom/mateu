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

## Regla dura de presentación: VB PURO, sin añadidos

**No puede haber NADA de HTML ni CSS que no venga de los ejemplos de VB.** La capa de presentación es 100%
VB: el chrome lo pinta el pack **`oj-sp` (Spectra)** (el `app-flow.js` del ejemplo solo hace
`define(['oj-sp/spectra-shell/config/config'], …)` — todo el shell/header/navigator viene de ahí), y los nodos
se pintan con **fragmentos VB** cuyo template usa solo componentes/clases `oj-*`/`oj-sp-*` tal cual aparecen en
los ejemplos (`.dev/vb/frontoffice`). **Cero CSS propio, cero markup inventado, cero "dibujar a mano".** Si algo
no lo pinta un componente Oracle, esa es la señal de PARAR y resolverlo con el componente correcto, no aproximarlo.

> Por esto **no hay harness local de UI**: cualquier HTML/CSS que escribiéramos para "previsualizar" fuera de VB
> sería un añadido no-VB. La validación visual se hace **dentro de una app VB real** (como exige el roadmap).
> En local solo se prueban la **lógica** (reducer, en Node) y el **contrato de wire** (fixtures) — nada visual.

## Estructura

```
src/core/reduceContexts.mjs   ← EL núcleo del bridge (reducer puro + helpers). LÓGICA, sin HTML/CSS. Single source.
                                 En la app VB es el módulo AMD del app-flow; aquí, funciones libres testeables.
tools/capture.mjs             ← Fase 0: POST loads/acciones contra un Mateu vivo → vuelca increments REALES.
fixtures/real/*.json          ← increments capturados (contrato de wire real, no sintético).
test/*.test.mjs               ← tests de contrato del reducer contra los fixtures reales (node:test).
vb/                           ← artefactos de PRESENTACIÓN VB (fragmentos `mateu-node`, app-flow), autorados
                                 SOLO con markup de los ejemplos. Se ejecutan/validan dentro de VB.
```

## Uso

```bash
# Tests del core (node:test, sin VB) — LÓGICA
npm test            # o: node --test test/

# Fase 0 — capturar increments reales contra un backend Mateu vivo
npm run capture -- --base http://localhost:9001   # SUT de este proyecto (demo-redwood-vb)

# Backend SUT en :9001 (sirve solo la API /mateu/v3; sin renderer)
#   cd ../../../.. && (cd demo/demo-redwood-vb && mvn -o spring-boot:run)
```

## Estado

- **Fase 0 (hecha)**: captura de fixtures reales + contrato de wire fijado.
  - Hallazgo clave: el `component` de un fragment es un `ServerSideComponentDto` con campos al **nivel superior**
    (`type`, `serverSideType`, `route`, `children`, `pageType`, `pageWidth`, `initialData`, `actions`, …),
    **no** bajo `component.metadata`. El árbol de contenido va en `component.children`. Los ClientSide sí llevan
    el DTO en `.metadata`. 15 tests de contrato verdes.
- **Fase 1 (en curso)**: hola mundo. Backend `demo-redwood-vb` (:9001) sirve una Page con un `Text`; la
  presentación es el fragmento VB `vb/mateu-node` (rama `Text`) sobre el shell `oj-sp` — validación visual
  DENTRO de VB. El harness local hecho a mano (HTML/CSS propios) fue **eliminado** por violar la regla pura-VB.
