# vb/ — artefactos de PRESENTACIÓN (VB puro)

Todo lo visual del kit vive aquí, y **solo usa lo que proveen los ejemplos de VB** (pack `oj-sp`/Spectra,
componentes y clases `oj-*`, bindings `oj-bind-*`). **Cero HTML/CSS propio.** No hay preview local: estos
artefactos se ejecutan y se validan **dentro de una app VB real** (base: `.dev/vb/frontoffice`).

- `app-flow.js` — el módulo AMD del app-flow. Igual que el ejemplo, depende de
  `oj-sp/spectra-shell/config/config` (⇒ el chrome entero lo pinta Spectra). Añade solo la LÓGICA del bridge
  (`callMateu`, `applyIncrement` → `reduceContexts`). Sin markup.
- `mateu-node.html` — el fragmento VB recursivo que pinta un nodo Mateu por tipo, con markup tomado de los
  ejemplos (`oj-bind-if`/`oj-bind-for-each`/`oj-bind-text`, `oj-vb-fragment` auto-referente, clases `oj-*`).
  Fase 1 = rama `Text`; cada fase añade una rama.

## Cómo se monta en una app VB

1. Copiar `app-flow.js` sobre el del webApp (o fusionar sus métodos) — conserva el `define([... spectra-shell
   ...])` del ejemplo.
2. Importar `mateu-node` como fragmento del webApp; el host page (el del shell Spectra del ejemplo) pinta el
   contexto `__root__` con `<oj-vb-fragment name="mateu-node" params='{{ {"node": ...} }}'>`.
3. Declarar las variables `$application.variables.mateuRegistry` y `mateuAppState` (ver "State & aplicación de
   increments" en `.dev/vb/DESIGN-NOTES.md`) y la action chain `applyIncrement`.
4. Apuntar la Service Connection a la `baseUrl` de Mateu (p.ej. el SUT `demo-redwood-vb` en :9001).

El reducer (`../src/core/reduceContexts.mjs`) se carga como módulo AMD `redwood-vb/reduceContexts`: mismo core
que testea Node, empaquetado para requirejs (paridad manual hasta que haya un paso de generación).
