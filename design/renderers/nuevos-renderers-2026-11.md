# Nuevos renderers: Primer, SAP (UI5 + Fiori), Salesforce (SLDS) y Apple

Estado: **borrador para revisión** (2026-11-22). No se escribe código de renderer hasta que se apruebe.

Decisiones ya tomadas por Miguel durante la redacción:

- **Primer será Primer auténtico**, no un tema de tokens sobre Vaadin. La opción "tema Primer para
  Vaadin a partir de Primer Primitives" queda descartada (ver §3.1, por qué se descarta).
- **Apple queda descartado por ahora** (ni tema web inspirado en las HIG, ni HIG en la app RN de
  iOS, ni renderer SwiftUI). En §6 queda el motivo y lo que lo reabriría.
- **Los renderers se construyen desde cero**: el código de los renderers retirados (sapui5, slds…)
  no se reutiliza. Sirve como lección (§2), no como punto de partida.
- **Reutilizar al máximo, siempre que valga la pena.** Concretado así: la capa de componentes de
  cada renderer es nueva, y el núcleo compartido se reutiliza. Para UI5 es `libs/mateu`, después de
  la Fase 0. Para Primer es el núcleo de React Native extraído (§3.2): cuesta poco extraerlo, ya
  pasa los corpus de conformidad, y escribir un núcleo React nuevo duplicaría aproximadamente el
  coste. Cada reutilización se comprueba en el spike, y si alguna no compensa (por ejemplo, un
  elemento Lit neutro que dentro de React dé más guerra que reescribirlo), se reescribe.

> Nota: el encargo llegó cortado a mitad del punto de Apple ("…o (b) un renderer S"). Si había más
> candidatos o instrucciones después de ese punto, faltan aquí.

---

## 1. Resumen y recomendación

| Candidato | Qué sería "auténtico" | Encaje con lo que hay | Coste | Recomendación |
|---|---|---|---|---|
| **SAP UI5 Web Components + Fiori** | `@ui5/webcomponents` + `-fiori` (ShellBar, DynamicPage, FlexibleColumnLayout, Wizard…) | **Alto**: son web components, como Lit; mismo patrón de adaptador que Vaadin | Medio | **Primero**, si se hace alguno |
| **GitHub Primer** | Primer React (`@primer/react`, MIT) — la única implementación con desarrollo activo | **Bajo** con los renderers Lit; **alto** con el núcleo de React Native (82 de 88 ficheros sin dependencias de plataforma) | Alto | **Segundo**, como renderer *React web* sobre el núcleo de RN; antes, un spike |
| **Salesforce SLDS** | Los *blueprints* CSS de SLDS 2 (BSD-3) — los componentes base de Lightning no son open source (a verificar) | Medio: markup + CSS dentro de Lit, pero toda la interacción la escribimos nosotros | Medio-alto, con riesgo de licencia (iconos, fuente) | **No ahora**. El renderer anterior se retiró a las 4 semanas |
| **Apple** | No hay un design system open source | — | — | **Descartado por ahora** (§6) |

Hay una condición previa para cualquier candidato, que lleva al punto 2: el historial dice que añadir
renderers de primera parte es justo lo que no ha funcionado. La recomendación de verdad es:

1. **Fase 0 (sirve elijamos lo que elijamos):** terminar de separar `libs/mateu` de Vaadin. Hoy
   todavía declara **49 dependencias `@vaadin/*`** y **28 ficheros** que no son tests las importan.
   Mientras sea así, un renderer Lit que no sea Vaadin arrastra código y aspecto de Vaadin, y cada
   *fallback* neutro se ve con Lumo.
2. **Un solo renderer nuevo cada vez**, con un **nivel de conformidad declarado** (Core o Standard,
   no "paridad"), y con una **regla de retirada fijada de antemano** (§2.3).
3. Por orden: UI5 → (spike) Primer → SLDS solo si aparece una demanda concreta.

---

## 2. Lo que enseñan los renderers retirados

### 2.1 Qué hubo y cuánto duró

| Renderer | Vivió | Tamaño del adaptador al retirarse | Base técnica | Retirado en |
|---|---|---|---|---|
| sapui5 | 2025-08 → 2026-07-30 (88 commits) | ~4.000 líneas | `@ui5/webcomponents` + `-fiori` + `-ai` 2.24, Lit | `fe07fe4c55` "Remove deprecated renderers." |
| redwood-oj | 2025-09 → 2026-07-22 | ~4.800 líneas | OJET dibujado a mano con tokens RDS | `a2a0ea5641` "Clean up renderers." |
| redhat / PatternFly | 2025-09 → 2026-07-22 | ~1.400 líneas | CSS de PatternFly 6 + fuentes Red Hat | `a2a0ea5641` (y `a23f17d08e`, los jars) |
| slds | **2026-06-26 → 2026-07-22** | ~1.650 líneas | `@salesforce-ux/design-system-2` (CSS) | `a2a0ea5641` |

Como referencia, hoy el adaptador de Vaadin son ~8.200 líneas sobre ~64.000 de `libs/mateu`. Los
retirados nunca llegaron a la mitad de eso. No se retiraron por estar terminados y salir caros de
mantener: se retiraron **sin haber llegado a estar completos**.

### 2.2 Por qué (lo que dice el repo)

Los commits que los borran no dicen por qué. La razón se escribió después, en `7ef3885315` (backlog,
§4) y `d37f81254e` (contrato de renderer):

> *Un renderer por design system, mantenido en primera persona, no sobrevive a un solo mantenedor*,
> porque el coste es proporcional al número de design systems que hay en el mundo.

La prueba está en el historial de julio de 2026, justo antes de retirarlos. Cada funcionalidad nueva
se pagaba cinco veces:

- `4e5d6fd222` "every design system renders crud layouts, toolbar buttons and grid fields with its OWN components"
- `5cda9a0578` "every shell renders app header actions with its own design system"
- `d8836dee95` "DS-native row selection + aggregates/grouping rendering in the five web renderers"
- `507217112e` "notification bell in the five shells + user column chooser on every listing"

Hay una segunda lección, menos obvia, en redwood-oj: **perdió frente a la línea VB porque era una
imitación**. Era Redwood dibujado con tokens, y la regla que salió de ahí ("en Redwood decide la
guía de Redwood; Spectra no se sobrescribe") es la misma que Miguel aplica ahora a Primer. Un renderer
merece la pena cuando es el design system **de verdad**. Un aspecto parecido no basta. Por eso
descarto el tema de tokens.

Tercera lección, del lado del negocio: después de retirarlos, el producto apostó por el **contrato
de renderer + niveles de conformidad** (core 7 / standard 12 / full 4 fixtures,
`e2e/conformance.mjs`) y por el **renderer de referencia** (`frontend/reference-renderer/`). La idea
era que fuera *otro* quien mantuviera su design system. Un renderer de primera parte nuevo va contra
esa decisión, salvo que traiga algo más: público, una demostración o un núcleo reutilizable.

### 2.3 Reglas propuestas para no repetirlo

1. **Nivel declarado y publicado.** Cada renderer nuevo declara un nivel (Core o Standard) en su
   README y en `parity.md`, y CI lo comprueba con la suite de conformidad. Lo que no esté en su
   nivel se pinta con el placeholder `<mateu-unsupported>` (honesto y medible), nunca con un
   sucedáneo a medias.
2. **Las funcionalidades nuevas no se pagan por N.** Una PR de funcionalidad dice qué renderers la
   pintan. Un renderer nuevo **no bloquea** la PR: si el tipo nuevo queda fuera de su nivel,
   aparece el placeholder.
3. **Regla de retirada fijada antes de empezar.** Si un renderer pierde su nivel declarado durante
   dos releases seguidas, pasa a *preview* y sale del BOM. Se decide hoy, no cuando ya duele.
4. **Etiqueta de soporte.** "Supported" (vaadin, redwood, RN, IntelliJ) frente a "preview" para
   los nuevos hasta que lleven seis meses en su nivel.
5. **Un renderer nuevo cada vez.** El segundo no empieza hasta que el primero lleva dos releases
   estable en su nivel.

---

## 3. GitHub Primer

### 3.1 Opciones y por qué solo queda una

Primer tiene hoy cuatro implementaciones, con estados muy distintos:

| Pieza | Licencia | Estado | Sirve para un renderer "auténtico" |
|---|---|---|---|
| **Primer React** (`@primer/react`) | MIT | Activa; la v38 pasó de styled-components a **CSS Modules** y quitó `sx` | **Sí.** Es *el* Primer de producto |
| Primer CSS (`@primer/css`) | MIT | **KTLO**: no aceptan funcionalidades nuevas; recomiendan React o ViewComponents | Solo el aspecto. La interacción (ActionMenu, Autocomplete, Overlay, foco) habría que reescribirla, y además está congelado |
| Primer ViewComponents (Rails) | MIT | En mantenimiento (según la búsqueda, desde febrero de 2026; a verificar) | No: es render en servidor con Ruby |
| Primer Primitives (tokens) | MIT | Activa | Solo para la opción de tema, ya descartada |
| Octicons (`@primer/octicons`) | MIT | Activa | Sí: iconos SVG, se pueden redistribuir |

Así que, en la práctica, **Primer auténtico significa Primer React**, y eso abre tres caminos
técnicos:

**(A) Islas de React dentro de los renderers Lit.** `libs/mateu` sigue siendo el anfitrión y cada
widget Primer se monta con `createRoot` dentro de una plantilla Lit. Lo **descarto**:
- los CSS Modules de Primer se inyectan en `document` y no atraviesan los shadow roots en los que
  viven `mateu-component`, `mateu-field`, etc. Habría que adoptar la hoja en cada shadow root o
  sacar todo al light DOM;
- los overlays de Primer (`Overlay`, `ActionMenu`, `Dialog`) se portalean a `body` y su manejo de
  foco no conoce nuestro `focusTrap` ni nuestros scopes de `dirtyGuard`;
- serían dos modelos de componentes y dos ciclos de render por cada campo. La parte más frágil
  (estado, foco, recreación de editores en el grid: el bug del beta.68) se duplica.

**(B) Primer CSS dentro de Lit.** Es lo más barato que todavía es "Primer", pero la librería está
congelada y la interacción sería nuestra: una imitación con el CSS de verdad. Es lo que le pasó a
redwood-oj. **Descartado** por la misma regla.

**(C) Un renderer React web sobre el núcleo de React Native.** ← **recomendado**

### 3.2 La opción C en detalle

El dato que la hace viable: `frontend/app/react-native/src/core` son **88 ficheros (~14.500
líneas)**, y solo **6** importan `react-native` o `expo` (`AppRegistry`, `appScheme`,
`documentEffects`, `oidc`, `pushConfig`, `secureStore`). El resto es TypeScript puro, y ya pasa los
corpus de conformidad de cliente: expresiones, route-params, source-templates, kanban, foldout,
agent-events… `MateuViewController`, `MateuSession`, la cola offline, las reglas cliente, las
expresiones y el `restFetch` ya están ahí. La app RN ya usa `react-dom` 19 para expo web.

Propuesta:

```
frontend/web/monorepo/apps/primer/          ← Vite + React 19 + @primer/react
  src/platform/                             ← implementaciones web de las 6 piezas de plataforma
  src/renderer/                             ← un renderer por tipo de wire (TSX con Primer)
frontend/app/react-native/src/core          ← se queda donde está o se extrae a libs/mateu-react-core
backend/shared/frontend/primer              ← jar io.mateu:mateu-primer (static/, como los otros)
```

- **Primero se extrae el núcleo** a un paquete de workspace (`libs/mateu-react-core`), con las 6
  piezas de plataforma detrás de interfaces que RN y web implementan cada uno. Esto **no es un
  tercer núcleo**: es el de RN, compartido.
- **Lo que Primer no tiene se pinta con los elementos neutros de `libs/mateu`.** React 19 soporta
  custom elements de verdad (propiedades y eventos), así que `mateu-gantt`, `mateu-calendar`,
  `mateu-planning-board`, `mateu-matrix-grid`, `mateu-rich-text-editor`, `mateu-map` y compañía se
  pueden incrustar tal cual. Esto solo funciona después de la Fase 0: esos elementos no pueden
  arrastrar Vaadin.
- **Huecos de Primer React a cubrir en el spike** (a verificar contra la versión actual): no tiene
  un date picker estable, su `DataTable` está en *experimental*, y no hay tree select ni
  inline-editing en tabla. El grid de listados es lo más caro y lo que más se usa. Hay que decidir
  pronto si usamos `DataTable`, una tabla propia con las clases de Primer o un grid neutro.
- **Plantillas de página:** Primer tiene `PageLayout`, `PageHeader`, `SplitPageLayout`,
  `UnderlineNav`, `NavList`, `Breadcrumbs` y `Blankslate`. Con eso salen el shell (NavList lateral o
  UnderlineNav arriba), la cabecera canónica de Mateu (PageHeader: título, descripción, acciones,
  navegación anterior/siguiente) y el estado vacío (Blankslate). Igual que en Redwood, aplica la
  regla de *usar el patrón del design system antes que dibujar uno propio*.

**Qué se gana además de Primer:** el primer renderer **React web**. Con el núcleo ya extraído, otro
design system React (Fluent UI React v9, Carbon React, MUI, Mantine) cuesta solo su capa de
componentes, y además encaja con la tesis del contrato ("que una tienda X pueda mantener el suyo"):
la mayoría de las tiendas que tienen su propio design system lo tienen en React.

**Qué se pierde frente a un renderer Lit:**
- todo lo que vive en `libs/mateu` como LitElement de *chrome*: `mateu-ux`, `mateu-app`, la paleta
  ⌘K, el command center, la campana, el chat, el agente MCP, presence, el skip link, el banner de
  conectividad, los toasts con pausa… En RN ya existen versiones React Native de casi todo, pero
  **no son DOM**. Por cada pieza hay que elegir: reescribirla con Primer o incrustar el elemento Lit
  (vale para las que se montan solas, como los singletons de documento);
- la paridad de a11y web (los tests axe y de foco) habría que rehacerla sobre este renderer;
- el editor visual y el plugin de IntelliJ (JCEF) usan el bundle de Vaadin. Primer no entraría ahí
  en la primera fase.

### 3.3 Licencias y marca

- Primer React, Primitives y Octicons: MIT. Encajan en el bundle Apache-2.0 (el allowlist SPDX de
  `check-frontend-licenses.mjs` ya admite MIT).
- Tipografía: Primer usa la pila de fuentes del sistema. Mona Sans/Hubot Sans (SIL OFL) son de marca
  y no hacen falta.
- **Marca:** no usar el logo de GitHub (Invertocat) ni presentarlo como un producto de GitHub. El
  nombre "Primer" describe el design system, como "Redwood", y es lo correcto ("Mateu renderer for
  Primer").

### 3.4 Coste orientativo

Es una referencia de orden de magnitud, no un compromiso: el renderer RN tiene unas 16.000 líneas
de TSX para la capa de UI. Un renderer Primer en nivel **Standard** debería quedarse en la mitad o en
dos tercios de eso, más la extracción del núcleo. Es el candidato más caro de los cuatro.

**Spike propuesto (antes de aprobarlo del todo):** núcleo extraído y compilando en web, shell con
NavList, un formulario con 8 tipos de campo y un listado CRUD, sobre el SUT de e2e. Medir: bundle
gzip frente al de Vaadin (`check-bundle-budget.mjs`), nivel Core de conformidad y qué partes de
Primer React faltan.

---

## 4. SAP: UI5 Web Components y Fiori

### 4.1 Por qué es el más barato de los auténticos

- `@ui5/webcomponents`, `-fiori` e `-icons`: **Apache-2.0**. El icon font de SAP también es
  Apache-2.0, y según la página de descargas de Fiori la fuente **72** se distribuye bajo
  Apache-2.0. **Hay que confirmarlo en el LICENSE de `@sap-theming/theming-base-content`** antes de
  empaquetarla. *72 Brand* es otra cosa (solo marketing) y no se usa.
- Son **web components con shadow DOM**: encajan con Lit exactamente igual que los `vaadin-*`. Es el
  mismo patrón de adaptador (`VAADIN_WIDGETS` → `UI5_WIDGETS`, que redefine `FormField`, `Grid`,
  `Button`, layouts, menús y overlays).
- **Se escribe desde cero** (decisión de Miguel). El retirado (`fe07fe4c55^`, ~4.000 líneas, UI5
  2.24) es anterior a la Fase 4 del refactor, al reparto de `mateu-field` en `fields/<kind>.ts` y a
  los cambios de seguridad de la GA, así que como mucho sirve para consultar cómo se comportaba
  algún componente de UI5.

### 4.2 Fiori: qué se puede usar y qué no

**Fiori elements** (List Report, Object Page… generados) depende de SAPUI5 + OData + anotaciones
CDS. **No sirve**: es otro sistema dirigido por modelo, que compite con el nuestro. Lo que sí sirve
son las **guías de floorplans** y los componentes de layout de `@ui5/webcomponents-fiori`. El mapa
saldría casi solo, porque Mateu ya tiene los arquetipos:

| Floorplan Fiori | Pieza UI5 | En Mateu |
|---|---|---|
| Shell / launchpad | `ui5-shellbar` + `ui5-side-navigation` | App shell (variantes de menú, cabecera, acciones, `@AppContext`) |
| List Report / Worklist | `ui5-dynamic-page` + filter bar + `ui5-table` | `AutoCrud` / `Listing` (smart search, filtros, export) |
| Object Page | `ui5-dynamic-page` con cabecera colapsable + secciones (anchor bar) | Página de registro, `ItemOverview`, `@Toc` + secciones |
| Flexible Column Layout | `ui5-flexible-column-layout` | `CollectionDetail`, master-detail, `editInDrawer` |
| Overview Page | cards | `Dashboard` |
| Wizard | `ui5-wizard` | `Wizard` (incluidas ramas y RAIL) |
| Initial page / Message page | `ui5-illustrated-message` | `EmptyState`, `MessagePage` |
| Upload collection | `ui5-upload-collection` | `FileList` / subidas |

La regla de Redwood se traslada tal cual: **en el renderer SAP decide la guía de Fiori**. Si existe
el componente o el floorplan, se usa antes de dibujar nada propio, y su aspecto (tema Horizon) no se
sobrescribe.

### 4.3 Riesgos

- **Tamaño del bundle:** UI5 es grande. Habría que importar componente a componente y cargar en
  diferido (`lazyElements.ts`), como ya se hace con chat o gantt.
- **Tema:** Horizon (claro/oscuro/HCB/HCW) viene con UI5. El modo oscuro y alto contraste nos salen
  gratis, y el `themeToggle` mapea directamente.
- **Conflictos de custom elements** si alguien carga Vaadin y UI5 en la misma página: no pasa con un
  jar por app, pero sí en el editor visual. Hay que comprobarlo.
- **Público:** tiendas SAP (BTP, extensiones de S/4). Es el mismo argumento que Redwood para Oracle.
  Habría que preguntarse si hay un primer usuario concreto, porque sin él vuelve a ser un renderer
  "por si acaso".

### 4.4 Coste orientativo

Es el menor de los auténticos: un adaptador Lit nuevo al estilo de `apps/vaadin` (~8.000 líneas en
Vaadin para el nivel completo). **Standard** es alcanzable sin tocar el
núcleo… una vez terminada la Fase 0.

---

## 5. Salesforce: SLDS

### 5.1 Qué es "auténtico" aquí

SLDS se publica como **blueprints**: markup + CSS (`@salesforce-ux/design-system-2`, código BSD-3).
Los **Lightning Base Components** (`lightning-input`, `lightning-datatable`…) son la implementación
de Salesforce, y **no son open source** fuera de la plataforma (a verificar: hubo distribuciones npm
con licencia restringida). **LWC** (el motor, MIT) es solo el framework, sin componentes.

Así que un renderer SLDS auténtico serían **plantillas Lit que escriben el markup de los
blueprints**, con toda la interacción (combobox, datepicker, datatable, modales, foco) escrita por
nosotros. Es exactamente lo que fue el renderer retirado, y por eso se quedó en 1.650 líneas.

### 5.2 Condiciones de fuentes e iconos

- **Iconos e imágenes: CC BY-ND 4.0.** Se pueden redistribuir sin modificar y con atribución, pero no
  se pueden recolorear ni recortar como obra derivada. Habría que meterlos como `REVIEWED` en
  `check-frontend-licenses.mjs` (CC BY-ND no es una licencia de software del allowlist SPDX) y
  aclarar en el NOTICE que no son Apache-2.0.
- **Salesforce Sans:** licencia revocable, intransferible, **solo para aplicaciones construidas con
  SLDS**, con aviso de copyright obligatorio en cada aplicación. **No se empaqueta.** Se usaría la
  pila del sistema (lo que SLDS 2 permite) y, como mucho, se documenta cómo puede añadirla quien
  tenga derecho.
- **Transición SLDS 1 → 2 (Cosmos):** los *styling hooks* de componente (`--slds-c-*`) no funcionan en
  SLDS 2, solo los globales. Es un objetivo que todavía se mueve.

### 5.3 Recomendación

**No ahora.** Es lo más caro en interacción por unidad de "autenticidad", tiene dos piezas de
licencia que exigen revisión y su público vive *dentro* de Salesforce, donde los Lightning Base
Components ya existen y nadie elegiría nuestro renderer. Se reabre si aparece un caso concreto (por
ejemplo, una app Mateu que tenga que verse "como Salesforce" fuera de la plataforma).

---

## 6. Apple — descartado por ahora

Decisión de Miguel (2026-11-22). Para el registro:

- **Web:** no hay design system open source. SF Pro y SF Symbols solo se pueden usar en el
  desarrollo para plataformas Apple (las fuentes, solo para maquetas) y no se pueden redistribuir.
  Como mucho cabría un tema "inspirado en las HIG", que es justo la imitación que la regla de §2.2
  descarta.
- **iOS con la app RN siguiendo las HIG** en lugar de Material 3: el coste es una segunda capa de
  primitivas (`src/ui/controls.tsx`, el tema, los patrones de teléfono) que se ramifica por
  `Platform.OS`. Duplica la superficie visual de RN justo cuando está estabilizándose para las
  tiendas.
- **Renderer SwiftUI nativo:** sería un quinto renderer con su propio núcleo en Swift, fuera de todos
  los corpus de conformidad actuales. Es el caso extremo de "un renderer por design system".

**Qué lo reabriría:** demanda real de usuarios iOS que rechacen Material en la app hub o en una
build `fixed`. En ese caso, empezar por la opción "RN con HIG en iOS" y limitarla a las primitivas
de `src/ui/`, sin tocar los renderers por tipo.

---

## 7. Fase 0: terminar de desacoplar `libs/mateu` de Vaadin

Hace falta para UI5 (un renderer Lit limpio) y para Primer (los elementos neutros dentro de React),
y beneficia también a Vaadin:

- mover a `apps/vaadin` los 28 ficheros que todavía importan `@vaadin/*` (entre ellos `mateu-dialog`,
  `breadcrumbsRenderer`, `confirmDialogRenderer`, `notificationrenderer`, `tooltipRenderer`,
  `menuRenderer`, `detailsRenderer`, `neutralTableRenderer`, `gridColumnTypes`, `badgeStyles`),
  dejando en el núcleo un *fallback* neutro, como ya se hizo con Button, EmptyState o
  `mateu-table-crud` ("core is now 0 @vaadin" en `a93386f453`, que con el tiempo volvió a crecer);
- reducir las 49 dependencias `@vaadin/*` de `libs/mateu/package.json` a cero;
- **guardarraíl en CI:** un test que falle si `libs/mateu/src` (sin contar tests) importa `@vaadin`,
  o si `package.json` lo declara. Es lo que faltó la primera vez.

---

## 8. Integración: lo que cualquier renderer nuevo tiene que cumplir

Lista sacada de CLAUDE.md para que no aparezca a mitad de camino:

- Jar `io.mateu:mateu-<x>` con los assets **una sola vez** bajo `static/`, incluido en `mateu-bom` y
  `MateuBomCompletenessTest`; `check-bundle-freshness.sh`; `THIRD-PARTY-LICENSES.txt` y
  `check-frontend-licenses.mjs` (nuevo target).
- `X-Mateu-Renderer: <name>/<version> wire/<M.m>` + `buildWatch` (desfase de versiones),
  compresión gzip de assets, base pública (`publicBase`, `renderBuiltUrl` relativo en Vite).
- Gate de wire-types frente a `wire-schema.json` y placeholder `Unsupported`; corpus de
  `conformance/client/*` (gratis en Primer si reutiliza el núcleo RN; en UI5 lo cubre `libs/mateu`).
- Textos de chrome en los seis idiomas; a11y (axe + comportamiento: skip link, foco en overlays,
  anuncios, `autocomplete`, vida de los toasts); sonda de red lenta.
- `project.yaml` `renderer:` (nuevo valor), `-Dmateu.bundle.renderer`, el aviso de arranque cuando
  el classpath sirve otro renderer, el generador de proyectos (`new-project.json` `renderers`) y,
  más adelante, el editor visual.
- Despliegue en cualquier host estático con la URL del backend fuera del bundle (requisito vigente
  para los dos renderers web actuales).
- Un job de CI que construya el renderer desde fuente y pase la conformidad de su nivel declarado
  contra el SUT, como `renderer-vb`.

---

## 9. Preguntas para Miguel

1. **¿Hay un primer usuario o una audiencia concreta** para UI5 o para Primer? La regla de §2.2 dice
   que sin uno se repite la historia.
2. **Regla de retirada (§2.3, punto 3):** ¿de acuerdo con fijarla antes de empezar?
3. **Primer:** ¿te convence la ruta "renderer React web sobre el núcleo de RN" (§3.2), con un spike
   primero? ¿O prefieres que el spike compare también la opción B (Primer CSS dentro de Lit) para
   tener los números?
4. **Orden:** ¿Fase 0 → UI5 → spike de Primer, o Primer va primero porque es el que más te interesa?
5. **Nivel objetivo** para el primero: ¿Core, o directamente Standard?
6. El encargo llegó cortado tras el punto de Apple: ¿había más candidatos (Fluent, Carbon, Material
   web…) o más instrucciones?

---

## Fuentes

- Primer React v38 (CSS Modules, sin `sx`): https://github.com/primer/react/discussions/7086 ·
  https://github.blog/engineering/architecture-optimization/improving-site-performance-by-shipping-more-css/
- Primer CSS en KTLO: https://github.com/primer/css · https://npmjs.com/package/@primer/css
- Primer ViewComponents: https://www.rubydoc.info/gems/primer_view_components/0.51.2
- UI5 icons (Apache-2.0): https://www.npmjs.com/package/@ui5/webcomponents-icons
- Fuente 72 (Apache-2.0 según SAP): https://www.sap.com/design-system/fiori-design-web/v1-148/resources/downloads ·
  https://github.com/SAP/fundamental-styles/wiki/Fonts-and-Icons:-FAQs
- UI5 DynamicPage: https://sap.github.io/ui5-webcomponents/components/fiori/DynamicPage ·
  FCL: https://www.sap.com/design-system/fiori-design-web/v1-142/page-types/page-layouts/flexible-column-layout/usage
- SLDS iconos CC BY-ND: https://www.github.com/salesforce-ux/design-system/blob/main/LICENSE-icons-images.txt ·
  Salesforce Sans: https://scancode-licensedb.aboutcode.org/salesforcesans-font.html
- SLDS 2 styling hooks: https://developer.salesforce.com/docs/platform/lwc/guide/create-components-css-custom-properties ·
  LWC OSS: https://developer.salesforce.com/docs/platform/lwc/guide/get-started-oss
- Apple: https://developer.apple.com/fonts/ ·
  https://developer.apple.com/support/downloads/terms/apple-design-resources/Apple-Design-Resources-License-20230621-English.pdf
- Historial del repo: `fe07fe4c55`, `a2a0ea5641`, `a23f17d08e`, `7ef3885315` (backlog §4),
  `d37f81254e` (contrato de renderer), `4e5d6fd222`, `5cda9a0578`, `d8836dee95`, `507217112e`.
