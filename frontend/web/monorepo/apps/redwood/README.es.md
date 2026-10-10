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

## El lienzo Redwood del editor visual (modo editor-preview)

El editor visual del IDE (`apps/visual-editor`) puede pintar su lienzo con esta app. Su página
`redwood-preview.html` enmarca la app empaquetada y pone `window.__mateuEditorPreview`, y entonces
`loadMateuShell` instala `poc/editorPreview.mjs` antes del bootstrap. El editor le pasa el
incremento por `postMessage` y la app contesta con él sus propias llamadas a `/mateu`. Un clic
selecciona en vez de actuar, y `setEditorNodeIds(true)` hace que cada átomo pintado lleve el id del
nodo de la definición (`data-node-id`). Una página de producción nunca entra en este modo
(`test-editor.mjs`). Tras tocarlo, `npm run build && npm run copy`: el editor sirve la app desde los
recursos del jar.

## Probar el renderer local contra una UI YA DESPLEGADA

Para no pasar por release → despliegue por cada cambio, `e2e/vb-live-dev.mjs` abre un navegador
sobre la app desplegada e **intercepta el bundle** de la app VB para servir el que acabas de
construir aquí:

```bash
cd frontend/web/monorepo/apps/redwood && npm run build   # deja build/optimized
cd ../../../../e2e && node vb-live-dev.mjs               # rw.ec1.mateu.io, login demo/demo
node vb-live-dev.mjs --url https://rw-console.ec1.mateu.io --user … --pass …
node vb-live-dev.mjs --watch                             # reconstruye al guardar y recarga
```

El navegador sigue estando en el origen desplegado, así que **Keycloak, el token, el gateway y
las rutas `/_pod` de los menús federados funcionan tal cual**: no hay que abrir CORS, ni dar de
alta un `redirect_uri` de localhost, ni replicar el arranque de Keycloak que inyecta el
controller de Mateu. Lo único que cambia es de dónde sale el JS del renderer.

El bundle se lee en CADA petición: reconstruir y recargar la página basta.

## Empaquetado como dependencia Java (jar de renderer)

Igual que el renderer Vaadin (`apps/vaadin` → `backend/shared/frontend/vaadin-lit`):

```bash
npm run build          # si hay cambios en la app VB / bridge
npm run copy           # → backend/shared/frontend/redwood/src/main/resources/static
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

El controller generado por el AP sirve `_index.html` en la ruta del `@UI` e inyecta un
`<mateu-ui baseUrl="/ruta">` oculto. El bridge lo lee al arrancar (`poc/mount.mjs`): la API es la
de ESE montaje (`/ruta/mateu/v3/...`) y la ruta del propio montaje es la home de la UI — el home
del menú si el `@UI` es un App; la propia página o crud si no lo es. Así que **un `@UI` en
cualquier ruta funciona** (`@UI("")`, `@UI("/console")`, `@UI("/products")` sobre un crud…), sin
necesitar un `@UI` en la raíz. Las rutas de Mateu van **por path, sin hash** y son RELATIVAS al
montaje, como en el renderer web (el menú de un App en `/app` dice `/section1` y la URL es
`/app/section1`; deep-links y back/forward incluidos): el `SpaRedirectFilter` reenvía cualquier path al index del montaje y los chains
detectan el modo por ese mismo `<mateu-ui>`; en serving estático (`vb-serve`, VB hosteado) siguen
usando hash (`#/ruta`). Imágenes, logo, módulos de componentes web y el `sseUrl` se piden a la
RAÍZ del backend, como en el renderer Vaadin. App de referencia: `demo/demo-vb` (:9005), que
monta además páginas sueltas (`/hello`, `/welcome`) y un crud (`/products`).

### Qué lleva el jar (y por qué no cambia en cada build)

- `static/_index.html` — la página que sirve el controller (`indexHtmlPath` por defecto).
- `static/_redwood/` — la app VB, en UN sitio y con nombre ESTABLE. Spring Boot, Micronaut
  (`classpath:static`) y Helidon (`/static`) la sirven de ahí; el pom del módulo la copia además a
  `META-INF/resources/_redwood` al empaquetar, para Quarkus (git guarda una copia, el jar dos).
  Sin `bundles/plain` (el bundle sin minificar, sólo alcanzable con `?vb.bundles=plain`) ni
  source maps.
- `static/mateu-build-info.json` — `{ sourceHash }`, el hash de las fuentes de las que se
  construyó (`scripts/source-hash.mjs`: `webApps/` + `poc/` sin tests, fixtures, capturas ni
  generadores). `scripts/check-bundle-freshness.sh` lo recalcula en CI y falla si no coincide.
- La caché no depende ya del nombre del directorio: todo módulo que carga require.js desde la app
  (y `app.css`) lleva `?v=<sourceHash>`, y los handlers de Mateu sirven `/_redwood/**` con
  `no-cache` + ETag. Mismas fuentes → salida idéntica byte a byte (la marca de tiempo del build se
  quita), así que regenerar sin cambios no ensucia el diff.

Comprobaciones: `node poc/make-amd.mjs --check` (el bridge commiteado es el que genera `poc/`) y
`node poc/make-html.mjs --check` (la plantilla de átomos está expandida); ambas en CI.

Los componentes JET/oj-sp y el visual-runtime se cargan del CDN de Oracle en runtime: el jar no
vendoriza nada de `static.oracle.com` (ver `NOTICE.md`) y el navegador necesita acceso al CDN.

## Dos modos: standalone y embebido

- **Standalone** — esta app VB empaquetada en el jar: la shell, el menú y las rutas de Mateu.
- **Embebido** — `<mateu-ui>`, un JET Custom Component que un desarrollador de Visual Builder importa
  en SU app y suelta en una página (`<mateu-ui base-url="https://erp.acme.com/mateu" route="orders">`).
  Pinta con el runtime JET y el tema Redwood del anfitrión (sin segundo runtime, sin iframe).

UN core: la vista del componente es la página de contenido de esta app (dentro del marco de
contenido de `shell-page.html`, entre los marcadores `@embedded-frame`) y su viewModel ejecuta las
mismas chains sobre un runtime mínimo (`poc/embedded.mjs`). `npm run build` deja además
`build/embedded/mateu-ui-<versión>.zip` (se adjunta a la release); `npm run serve:embedded` sirve un
anfitrión JET de prueba en :9131 y `e2e/vb-embedded-probe.mjs` lo comprueba. Detalle completo (en
inglés): README.md, sección "Two modes", y `doc/.../design-systems/oracle-redwood.md`.

## El FAB de "Ask Oracle" y la marca del App

La shell tiene dos FABs en la esquina: el de **Ask Oracle** (el propio de `oj-sp-simple-ui-shell`;
abre el buscador de destinos: navegación + vistas rápidas) y, si el App declara `@AI`, encima, el
del **chat del agente** (bocadillo `oj-ux-ico-chat`). Por defecto el de Ask Oracle lleva la marca
de Oracle: el glifo de Ask Oracle de Redwood (`oj-ux-ico-oracle-o`, la "O" que lleva el botón de
`oj-sp-ask-oracle` en la cabecera de Fusion) y el rótulo "Ask Oracle" (nombre accesible, tooltip y
título de la paleta).

Una app que no quiera la marca Oracle pone la suya en su `@App`:

```java
@App(askLabel = "Ask RIU", askIcon = "R")            // la inicial, en blanco sobre el FAB
@App(askLabel = "Ask RIU", askIcon = "/images/riu.svg") // su logo (ruta del backend, como @Logo), en un círculo blanco
```

`askIcon` admite una o dos letras (la inicial), una imagen (ruta relativa al backend o url
absoluta/`data:`) o un icono (`oj-ux-ico-…` o un nombre Mateu `vaadin:…` con equivalente);
cualquier otra cosa, o vacío, deja el glifo de Ask Oracle. `askLabel` vacío deja "Ask Oracle".
Viajan en el `AppDto` (`askLabel`/`askIcon`); la proyección es `askFabOf` y el marcado del FAB
del shell `brandAskFab` (`poc/widgets.mjs`).

## Entregable VB hosteado (kit)

El mismo `webApps/vbredwoodapp` es importable en una app VB alojada en Oracle (VB Studio):
copiar el kit, poner la `mateuBaseUrl` → pinta Mateu con aspecto Redwood nativo (con CORS abierto
en el backend). Ver "Entregable final" en `RENDERER-ROADMAP.md`.
