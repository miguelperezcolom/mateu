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

## Dev harness (probar la UI localmente)

`harness/` renderiza los increments de un backend Mateu vivo con chrome Redwood auténtico (tema Redwood de
OJET + OracleFont desde el CDN de Oracle, el MISMO origen que carga VB). No necesita build: es HTML + ESM.

```bash
# 1) Backend SUT en :9001
cd ../../../.. && (cd demo/demo-redwood-vb && mvn -o spring-boot:run)   # o: java -jar target/*.jar

# 2) Servir el harness (desde la raíz de la app, para que resuelvan /harness y /src)
cd frontend/web/monorepo/apps/redwood-vb && python3 -m http.server 9002 --bind 127.0.0.1

# 3) Abrir http://127.0.0.1:9002/harness/index.html  — o capturar:
node tools/shot.mjs --url http://127.0.0.1:9002/harness/index.html --out shots/fase1.png
```

## Estado

- **Fase 0 (hecha)**: captura de fixtures reales + contrato de wire fijado.
  - Hallazgo clave: el `component` de un fragment es un `ServerSideComponentDto` con campos al **nivel superior**
    (`type`, `serverSideType`, `route`, `children`, `pageType`, `pageWidth`, `initialData`, `actions`, …),
    **no** bajo `component.metadata`. El árbol de contenido va en `component.children`. Los ClientSide sí llevan
    el DTO en `.metadata`. 15 tests de contrato verdes.
- **Fase 1 (en curso)**: hola mundo dentro del shell. `harness/` + `demo-redwood-vb` (:9001) renderizan un
  nodo `Text` con chrome Redwood (tira RDS + tema/fuente OJET del CDN). Evidencia: `shots/fase1.png`.
  - **Honestidad sobre la puerta visual**: aprobada como **aproximación fiel local** (tema + OracleFont
    reales). La validación DEFINITIVA del chrome `oj-sp` (global-header/navigator del pack Spectra) queda
    para **dentro de una app VB real**, como exige el roadmap — el header del harness es `oj-web-applayout`
    hecho a mano y se sustituye por `oj-sp-global-header`/`oj-sp-navigator` al portar a VB.
