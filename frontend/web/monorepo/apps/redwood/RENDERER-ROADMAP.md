# Mateu-sobre-VB — Roadmap por fases con validación VISUAL

> El problema histórico del renderer Redwood **nunca fue el mecanismo, fue la fidelidad visual**:
> funcionaba mejor o peor, pero **no se parecía a una app Redwood**. Este roadmap invierte el eje:
> se ordena por **entregable visible**, y **no se pasa de fase sin una validación visual que pase**.

## Principio rector (la causa raíz y su antídoto)

Los intentos anteriores fallaron porque **aproximaban** el chrome y los componentes en vez de usar los reales.

- **Construir DENTRO de una app VB real** (base: `.dev/vb/frontoffice`), montando desde la Fase 1 el
  `oj-sp-simple-ui-shell` auténtico + `oj-sp-global-header` + `oj-sp-navigator`, y usando los componentes
  reales `oj-dynamic`/`oj-sp`/`oj-c` para cada superficie.
- La fidelidad visual se **hereda** de esos componentes; el bridge (reducer + efectos) **solo alimenta datos**.
- Nunca dibujar a mano lo que un componente Oracle ya pinta. Si un componente no existe o no encaja, eso
  ES la señal de parar y resolver el aspecto **antes** de avanzar.
- Dos niveles de validación, ambos obligatorios: **lógica** (POC Node, `poc/test.mjs`) y **aspecto**
  (puerta visual de cada fase).

## Protocolo de la puerta visual (idéntico en cada fase)

1. **Referencia**: la MISMA superficie `oj-sp-*`/`oj-c-*` renderizada de forma nativa — una página VBCS
   autorada con datos hardcodeados, o la pantalla equivalente del `frontoffice` / una app Redwood real.
2. **Método**: captura de la superficie alimentada-por-Mateu y comparación lado a lado con la referencia,
   mismo viewport (p.ej. 1440×900) y mismo tema.
3. **Criterio = "indistinguible de una pantalla Redwood nativa"**, no "se parece bastante". Checklist:
   - global-header + tira de color RDS + texturas de fondo + footer
   - escala tipográfica y pesos
   - spacing / densidad (compact vs cómodo)
   - chrome de campos (label-aside, bordes, foco, estados hover/active)
   - densidad de tabla + smart-search bar + estados vacíos
   - `pageWidth` (fixed / fullWidth / edgeToEdge)
   - light/dark si aplica
4. **Salida**: guardar la captura en `frontend/web/monorepo/apps/redwood/poc/shots/faseN.png` como evidencia; si NO pasa,
   no se abre la fase siguiente.

## Fases

| # | Entregable visible | Qué se construye debajo (mínimo) | Puerta visual (pasa si…) |
|---|---|---|---|
| **1** | **Hola mundo** dentro de la shell real | shell `oj-sp-simple-ui-shell` + header; `vbEnter → callMateu(__load__)` devuelve una Page con un `Text`; render de 1 nodo | el **chrome** (header, tira RDS, fondos, footer) es indistinguible de una app Redwood; el texto sale en su sitio |
| **2** | **App con 2–3 opciones** de menú simples | `App` metadata → `shell` slice; `oj-sp-navigator` con 2–3 rutas; clic = `loadRoute` | el navigator (iconos, activo, hover) es idéntico al de Redwood; navegar cambia contenido sin recargar la shell |
| **3** | **Formulario básico** editable | dispatcher `FormLayout`/`FormField` (switch `widgetFor` o `oj-dyn-form`); `value` two-way; botón Save → `runActionChain` | los campos son `oj-c-*`/`oj-dyn-form` auténticos: label-aside, densidad, foco y validación como Redwood |
| **4** | **Listado** | `oj-dynamic-table` alimentada por un listing de Mateu; smart-search bar | densidad de filas, cabeceras, smart-search y estado vacío como una collection Redwood |
| **5** | **CRUD** completo | New/Edit/Delete; navegación a form o drawer (`editInDrawer`) | el flujo entero (lista ↔ form ↔ guardar ↔ refresco) se ve nativo; toasts/banners reales |
| **6** | **App con menú complejo** | menú profundo/grupos; `@AppContext` selectors; header actions | navigator con submenús + selectores de contexto + acciones de cabecera idénticos a Redwood |
| **7** | **Foldout** | `FoldoutLayout`/`FoldoutPanel` → `oj-sp-foldout-layout`/`-panel` (dispatcher recursivo) | los paneles se pliegan/despliegan y se ven como el foldout de Redwood |
| **8** | **Guided process** | Wizard → `oj-sp-guided-process`; rail/steps | el proceso guiado (rail, pasos, navegación) es el `oj-sp-guided-process` auténtico |
| **9** | **App anidada** | mediador embebido / isla vía registro `targetComponentId→contexto`; overlays apilados | la isla/app anidada se repinta sola sin romper el host; se ve como un componente embebido Redwood |
| … | (crece: dashboard, item/general overview, planning, calendar, command center) | reutiliza el mismo dispatcher + registro | cada superficie valida contra su `oj-sp-*` nativo |

## Fases 1.x — puertas de MECANISMO (en runtime VB real)

> Después del "hola mundo" de la Fase 1 (ya hay shell + `callMateu` + render de 1 nodo) y **antes** del menú de
> la Fase 2, se verifica el motor transversal (state / increments / comandos) **dentro de una app VB real**, no
> solo en el POC Node. Son las tres cosas que rompieron a los renderers Redwood anteriores → puerta propia.
> Contrato de diseño: la sección "State & aplicación de increments" de `DESIGN-NOTES.md`. La puerta aquí NO es
> visual sino **de comportamiento observable**; evidencia = una nota/GIF/log en `poc/shots/fase1x-*`.

| # | Qué se verifica | Montaje mínimo | Pasa si… |
|---|---|---|---|
| **1.1** | **Estado**: variables cableadas + two-way round-trip | `$application.variables.mateuRegistry` (object, keyed by id) + `mateuAppState`; un `mateu-node` con un campo cuyo `value="{{ $variables.state.<fieldId> }}"` con writeback al contexto | teclear en el campo actualiza `mateuRegistry.contexts[id].state.<fieldId>` (inspeccionable), y `runActionChain` postea ese `state` + `appState` en los campos correctos del `RunActionRqDto` |
| **1.2** | **Aplicación de increments** al target | `applyIncrement` = `reduceContexts` + reasignar `mateuRegistry`; superficies **keyed by id** (`oj-bind-if`/`oj-bind-for-each`) | un `Replace/State` sobre `__root__` repinta el host; un fragment con OTRO `targetComponentId` (isla) repinta **solo** esa isla sin tocar el host (structural sharing → re-render quirúrgico, cero `getElementById`); un `_route`-flip en `state` repinta solo la isla; un State-only **mergea** sin borrar el `tree` |
| **1.3** | **Comandos UI** → efectos | pipeline de efectos de `reduceContexts` mapeado a builtins VB | cada comando dispara su efecto observable: `SetWindowTitle`→título; `NavigateTo`→`navigateAction`/URL; `CloseModal`→pop de `stack` (overlay desaparece por estado); `MarkAsClean/Dirty`→flag del contexto; `RunAction`→`callChainAction`; `DownloadFile`→descarga; `messages`→toast `oj-sp`; `banners`→banda |
| **1.4** | **Resolución de ruta** | `loadRoute(route)` → `callMateu(route, __load__)` → increment al host; el contexto guarda `route`/`consumedRoute`/`serverSideType`/`serverSideComponentRoute` | cargar una ruta pinta su Page en el host; `runActionChain` **reconstruye** los 4 campos de ruta desde el contexto en el `RunActionRqDto`; una ruta compuesta (prefijo `consumedRoute`) no pierde el prefijo. (La composición de ruta de ISLA/mediador — `state._route` precedence, limpiar antes de repintar — se cierra en Fase 9) |
| **1.5** | **Sync con la URL** del navegador | `PushStateToHistory`→`history`/router VB; deep-link en el bootstrap; `popstate` back/forward; `dirtyGuard`/`confirmLeave` | `PushStateToHistory` cambia la URL sin recargar; entrar por URL directa (deep-link) bootea esa ruta; back/forward recarga la ruta previa; si el contexto está `dirty`, back/forward pide confirmación y restaura la URL al cancelar. **Nota**: el reducer aún NO mapea `PushStateToHistory` (hoy solo `NavigateTo`) — esta puerta lo añade |
| **1.6** *(VISUAL)* | **Estilos alrededor del contenido**: `pageWidth` | el wrapper del host aplica `contexts[id].pageWidth` (ya en el wire) sobre la anatomía RDS común (header + tira RDS + canvas `#F1EFED` + contenido `#FBF9F8`) | los **tres** modos son fieles a la medición RDS Toolkit 24C: **fixed** = tope 1408px centrado, márgenes 24px <1536 / auto ≥1536; **fullWidth** = fluido con gutters 24px siempre; **edgeToEdge** = 0 márgenes. Cambiar `pageWidth` en el wire re-maqueta la banda de contenido; la tira RDS/canvas/contenido quedan indistinguibles de una página Redwood nativa en los tres |

## Cómo encaja el trabajo ya hecho

- El **reducer + registro por id + efectos** (`poc/reduceContexts.mjs`, 10 tests verdes) es el motor
  transversal que crece por debajo de las fases; **nunca es el hito** — el hito es siempre la captura.
- El **dispatcher recursivo** (`mateu-node`) se estrena en Fase 3 (rama FormLayout) y se amplía una rama por
  fase (tabla, foldout, guided-process…). Como la mayoría de arquetipos son composición de un núcleo de ~20
  tipos, cada fase añade pocas ramas.
- Antes de Fase 1, un paso previo recomendado: **`capture.mjs`** contra un backend Mateu vivo para fijar el
  contrato de wire real (paths `component.id`, `initialData`, metadata de `Drawer`) — así los fixtures del POC
  dejan de ser sintéticos.

## La regla, en una línea

**Cada fase = una pantalla que un usuario Redwood no distinguiría de la nativa.** Si la captura no lo logra,
se arregla el aspecto antes de tocar la fase siguiente.

## Entregable final (NO negociable): un JS portable para VB hosteado en Oracle

El resultado del proyecto **debe funcionar en una aplicación VB real alojada en Oracle** (VB Studio / VB
hosteado), no en un runtime propio ni en un fork. El entregable es un **kit** que se copia en cualquier app VB
y, apuntando a una `baseUrl` de Mateu, hace que esa app pinte UIs de Mateu con aspecto Redwood nativo — **sin
código específico de esa app y sin tocar el backend de Mateu**.

**El kit se compone de:**
1. **Módulo JS del bridge** — reducer (`reduceContexts`) + `planIncrement` + `callMateu` + helpers del
   dispatcher, empaquetado como **módulo AMD** (`define([...], () => …)`) cargable por el requirejs de VB, o
   expuesto como métodos de `app-flow.js` (que ya es un módulo AMD).
2. **Artefactos VB declarativos** — las action chains (`applyIncrement`, `loadRoute`, `runActionChain`) en
   JSON, el fragment recursivo `mateu-node`, la host-page, y las entradas de `app-flow.json`
   (variables/constantes/eventListeners).
3. **Config** — la `baseUrl` de Mateu (una constante).

**Restricciones que esto impone al diseño (deben respetarse desde la Fase 1):**
- **Sin paso de build propio que VB no pueda reproducir.** Nada de bundlers ni imports que el runtime de VB
  no resuelva. El módulo se escribe para el entorno **AMD/requirejs** de VB y usa solo APIs que VB expone +
  los componentes `oj-*` ya presentes en la app.
- **El `.mjs` del POC es SOLO para test en Node.** El artefacto que se envía es la versión AMD/cargable-por-VB
  del **mismo** código (reducer idéntico). Mantener paridad: un solo fuente del core, dos envoltorios
  (ESM para tests, AMD/UMD para VB) — o generar el AMD desde el core.
- **Autocontenido y agnóstico de la app.** No depende de Business Objects, Service Connections concretas ni
  páginas autoradas; se alimenta solo de la API de Mateu.
- **Portátil.** Copiar el kit + poner la `baseUrl` → pinta. Punto.

**Criterio de "proyecto hecho":** tomar una app VB **vacía alojada en Oracle**, importar el kit, apuntar a un
Mateu, y ver una pantalla de Mateu renderizada con aspecto Redwood nativo — sin escribir código propio de esa
app. Cada fase de arriba se valida, además de con su puerta visual, **corriendo dentro de una app VB real**
(no solo en local/dev), para no descubrir al final una incompatibilidad del runtime hosteado.
