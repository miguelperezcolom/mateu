# NOTICE — Renderer de Mateu sobre Oracle Visual Builder / Redwood

Este directorio (`frontend/web/monorepo/apps/redwood/`) contiene el renderer de Mateu construido sobre Oracle
Visual Builder y el Redwood Design System. Este NOTICE aclara qué se publica bajo la
licencia de Mateu, qué pertenece a Oracle, y qué necesita un usuario para ejecutarlo.

## Qué se publica aquí (licencia de Mateu)

Todo el código de autoría propia de este directorio se publica bajo la licencia de
Mateu (ver `LICENSE.txt` en la raíz del repositorio):

- `poc/` — el bridge (`reduceContexts.mjs`, `transport.mjs`, `make-amd.mjs`)
  y sus tests de contrato sobre wire real (`test.mjs`, `fixtures/`).
- En `webApps/vbredwoodapp/` — las action chains de Mateu
  (`*-chains/*.js` salvo las señaladas abajo), el markup declarativo de las páginas
  (`main-start-page.html`, `shell-page.html` en su composición), los descriptores
  JSON de la aplicación y `resources/css/app.css` (punto de estilos propio,
  mínimo y documentado) y `resources/js/mateu-bridge.js` (generado desde
  `poc/` por `make-amd.mjs`).

### El jar de renderer (`io.mateu:mateu-redwood`)

El módulo Maven `backend/shared/frontend/redwood` empaqueta como recursos estáticos el
**build optimizado de la propia app VB** (`build/optimized/webApps/vbredwoodapp`, copiado por
`scripts/copy.mjs`): el código de autoría propia listado arriba más los pocos ficheros del
scaffolding del starter (sección 4, que conservan sus cabeceras de copyright de Oracle). El jar
**no vendoriza ningún artefacto de `static.oracle.com`**: JET, los componentes Spectra
(`oj-sp-*`) y el visual-runtime se referencian por URL y se cargan del CDN de Oracle en tiempo
de ejecución, exactamente igual que en una app VB alojada en Oracle.

## Qué pertenece a Oracle

### 1. Oracle JET y el tema Redwood — UPL 1.0 (open source)

Oracle JavaScript Extension Toolkit (JET), incluido el tema Redwood (CSS, fuentes e
imágenes que su tooling distribuye), se licencia bajo la
[Universal Permissive License v1.0](https://www.oracle.com/downloads/licenses/upl-license1.html),
compatible con la licencia de Mateu. Este repositorio no vendoriza JET en este
directorio (se resuelve por npm/CDN); si en el futuro se empaquetara (p. ej. en un
jar de renderer), deben incluirse su `LICENSE.txt` y `THIRDPARTYLICENSE.txt` tal como
exige la UPL.

Copyright (c) Oracle and/or its affiliates.

### 2. Spectra UI (`oj-sp-*`), Visual Builder runtime y galería de ilustraciones — NO open source

Los componentes Spectra (`oj-sp-*`, servidos desde
`https://static.oracle.com/cdn/spectra-ui/...`), el runtime de Visual Builder
(`visual-runtime.js`) y los assets de la galería (`https://static.oracle.com/cdn/fnd/gallery/...`,
p. ej. las ilustraciones del welcome banner) son propiedad de Oracle y **no** tienen
licencia pública de redistribución. Este repositorio **no los redistribuye**: la
aplicación los referencia en tiempo de ejecución desde el CDN de Oracle, y tanto
`node_modules/` como el resultado de build (`build/`) están excluidos del control de
versiones.

**Regla del proyecto: no vendorizar ningún artefacto de `static.oracle.com`.**
Todo lo de Oracle que no sea UPL se referencia por URL, nunca se copia al repositorio
ni a artefactos publicados.

### 3. Tooling de build de Visual Builder

`@oracle/grunt-vb-build` y `@oracle/grunt-vb-audit` se descargan del CDN de Oracle
durante `npm install` (ver `package.json`) bajo los términos de Oracle. No se
redistribuyen con este repositorio.

### 4. Scaffolding del starter de Visual Builder

Solo `webApps/vbredwoodapp/index.html` procede de la plantilla starter que genera la tooling de
Visual Builder (el marcado que arranca el runtime de VB). Conserva su cabecera de copyright de
Oracle. El resto de ficheros que la plantilla aportaba —los módulos vacíos de app, flujo y página,
las chains de toast y banda de mensajes, el `Gruntfile.js`— se han reescrito desde cero como código
de Mateu, y `pages/shell-page.js`, que es código de Mateu y llevaba la cabecera de Oracle que VB
estampa al crear un fichero, lleva ahora la de Mateu.

La marca: por defecto el FAB del shell es neutro («Search» con la lupa). El aspecto de «Ask Oracle»
solo aparece si la app lo pide con `@App(askLabel, askIcon)`.

## Terceros que no son de Oracle

- **Leaflet 1.9.4** (BSD-2-Clause, © Volodymyr Agafonkin y colaboradores): pinta el componente
  `Map`, porque JET no tiene mapa de calles (`oj-thematic-map` pinta geografía GeoJSON, no
  teselas). Igual que JET, **no se vendoriza**: `poc/map.mjs` lo carga de cdnjs
  (`cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/`) la primera vez que una pantalla pinta un mapa.
- **Teselas de OpenStreetMap** (`tile.openstreetmap.org`, datos © colaboradores de OpenStreetMap,
  ODbL): las mismas que usa el `<mateu-map>` del renderer web, y solo el VALOR POR DEFECTO. Su
  política de uso no admite tráfico intensivo de producción; un despliegue con carga real debe
  apuntar a un proveedor de teselas propio o contratado, y eso se configura por mapa en el wire:
  `Map.tileUrl` (plantilla de Leaflet) + `Map.attribution` (`tileLayerOf` en `poc/map.mjs`).

## Qué necesita quien lo ejecute

Este renderer está diseñado para aplicaciones de Oracle Visual Builder **alojadas en
Oracle** (VB Studio / Visual Builder / Oracle Integration / extensiones de Fusion
Apps). En desarrollo local, los componentes y el runtime se cargan del CDN de Oracle;
en producción, el uso de Visual Builder y de los componentes Spectra está sujeto a
los términos del servicio de Oracle correspondiente (la entitlement de Visual
Builder que el usuario ya tiene por su suscripción). Piénsese en este renderer como
en un conector: el código es libre; el servicio al que se conecta, no.

## Marcas

Oracle, Oracle JET, Redwood y Visual Builder son marcas de Oracle y/o sus filiales.
Este proyecto no está afiliado a Oracle ni respaldado por Oracle.
