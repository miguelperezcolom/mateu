# Mateu renderer Redwood (Oracle Visual Builder)

Renderer de Mateu construido **dentro de una app Oracle Visual Builder real** (componentes
`oj-sp`/`oj-dynamic`/`oj-c` auténticos + shell Spectra), de modo que la fidelidad visual Redwood se
hereda de los componentes de Oracle y el bridge solo alimenta datos. Diseño y decisiones:
`DESIGN-NOTES.md`; fases y puertas visuales: `RENDERER-ROADMAP.md`; licencias y qué pertenece a
Oracle: `NOTICE.md`.

## Estructura

```
webApps/vbredwoodapp/   ← la app VB (páginas, action chains, resources/js/mateu-bridge.js)
poc/                    ← fuente única del core (reduceContexts.mjs + transport.mjs) + tests de
                          contrato sobre wire real (node test.mjs) + capture.mjs + make-amd.mjs
scripts/copy.mjs        ← empaqueta build/optimized en backend/shared/frontend/redwood
```

`resources/js/mateu-bridge.js` es GENERADO (`npm run bridge`) desde `poc/reduceContexts.mjs` +
`poc/transport.mjs` — tras tocar el core, regenerar y reconstruir.

## Desarrollo local

```bash
npm install            # una vez; descarga el tooling grunt de Oracle (CDN de Oracle)
npm run bridge         # regenera webApps/.../resources/js/mateu-bridge.js desde poc/
npm test               # tests de contrato del reducer (poc/test.mjs, fixtures de wire real)
npm run build          # grunt vb-build --no-optimize=true --force → build/optimized
npm run serve          # grunt vb-serve --port=9006 (sirve build/optimized)
```

Con `demo/demo-vb` corriendo en :9005 como backend. GOTCHA: `vb-build` puede abortar al final en
una subtarea de red — `build/optimized` queda bien generado; no fiarse del exit code. Y `vb-serve`
sirve SIEMPRE desde `build/optimized`: los cambios no llegan hasta re-ejecutar `npm run build`.

En desarrollo el bridge apunta al backend con la constante `mateuBaseUrl` de
`webApps/vbredwoodapp/app-flow.json` (punto único de cambio).

## Empaquetado como dependencia Java (jar de renderer)

Igual que el renderer Vaadin (`apps/vaadin` → `backend/shared/frontend/vaadin-lit`):

```bash
npm run build          # si hay cambios en la app VB / bridge
npm run copy           # → backend/shared/frontend/redwood/src/main/resources/{static,META-INF/resources}
# commit de los recursos + mvn install en backend/shared/frontend/redwood
```

Cualquier app Java lo consume añadiendo la dependencia (en lugar de `vaadin-lit`):

```xml
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>redwood</artifactId>
    <version>0.0.1-MATEU</version>
</dependency>
```

El controller generado por el AP sirve `_index.html` en la ruta del `@UI` y la app VB llama a
`/mateu/v3/...` del MISMO origen (el copy sustituye `mateuBaseUrl` por `''`). Las rutas de Mateu
viajan como hash (`/#/products`), así que no hace falta soporte del servidor para deep-links.
App de referencia: `demo/demo-vb` (:9005). Limitación v1: la app VB empaquetada asume el `@UI`
en la ruta raíz `""` (el `<mateu-ui>` oculto que inyecta el controller transporta el baseUrl para
cuando el bridge quiera soportar UIs anidadas en otra ruta).

Los componentes JET/oj-sp y el visual-runtime se cargan del CDN de Oracle en runtime: el jar no
vendoriza nada de `static.oracle.com` (ver `NOTICE.md`) y el navegador necesita acceso al CDN.

## Entregable VB hosteado (kit)

El mismo `webApps/vbredwoodapp` es importable en una app VB alojada en Oracle (VB Studio):
copiar el kit, poner la `mateuBaseUrl` → pinta Mateu con aspecto Redwood nativo (con CORS abierto
en el backend). Ver "Entregable final" en `RENDERER-ROADMAP.md`.
