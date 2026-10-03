# Plan de paridad con MAUI y modo estático

> **Origen (2026-10-03):** la observación de la consola de OCI (MAUI) y del JSON de configuración de sus
> páginas; una prueba en Mateu del maestro con pestañas que son páginas, en los dos renderers; la
> auditoría de cohesión visual del renderer Vaadin. Los documentos de trabajo, con el detalle y las
> referencias de fichero y línea, están fuera del repo, en `~/IdeaProjects/ec-demo1-ux/`:
> `mateu-vs-maui-gaps.md` (la matriz completa), `oci-maui-observations.md`,
> `oci-maui-config-analysis.md` y `vaadin-cohesion-audit.md`.
>
> **Objetivos:**
> 1. Mateu hace todo lo que hace MAUI.
> 2. Mateu permite interfaces 100 % estáticas: definiciones que lee el navegador, sin backend propio,
>    con los datos sacados directamente de APIs REST.
>
> **Estado:** plan vivo. Es la referencia para retomar el trabajo tras una interrupción: cada fase tiene
> casillas, rama y PR. Se actualiza en cada avance; abajo hay un registro.
>
> **Reglas:** additive-first; tests por incremento, incluidos los e2e en los dos renderers cuando hay
> UI; Redwood acompaña a cada funcionalidad, sin bloquearla; nada de recursos de Oracle en el repo, solo
> patrones.

---

## 0. Decisiones tomadas

| # | Decisión | Por qué |
|---|---|---|
| D1 | **Orden:** primero P0 (release 385). Después, P1 y la demo estática S0 en paralelo. P2 y P3 detrás, en paralelo. | P1 es el núcleo del patrón de OCI y sus fallos también bloquean el enlace directo en modo estático. S0 solo usa lo que ya existe y dice pronto qué falta de verdad. |
| D2 | **Carga de pestañas:** perezosa por defecto, con `load = EAGER` como opción. | OCI carga todo de golpe: unas 14 llamadas al abrir un recurso. EAGER permite contadores en las pestañas. |
| D3 | **Migas o «← padre»:** se elige por app. Por defecto, migas; `backLink = PARENT` (estilo OCI) en el detalle. | Las dos cosas son válidas, y las consolas de ec-demo1 ya usan migas. |
| D4 | **Expresiones:** un subconjunto seguro, con la misma gramática en TS y en Java. `js:` y `RunJS` se mantienen como vía de escape explícita. Durante una versión, el JS libre en `${…}` sigue funcionando con un aviso (modo compatible). | Quita la dependencia de `unsafe-eval` en la CSP y la ejecución de código venido de las definiciones, sin romper las apps de golpe. |
| D5 | **Tree-select con entidad propia:** paridad en Redwood del campo `@TreeSelect`, usarlo como widget de ámbito lateral (`@AppContext(position = SIDE, tree = true)`) y como filtro de listado. | Es el selector de compartimento de OCI, y el usuario lo ha pedido expresamente. |
| D6 | **Modo estático:** sin formato nuevo. El formato estático son el wire y las definiciones YAML/JSON. El exportador falla si una ruta marcada como estática necesita servidor. | Las piezas ya existen (`mateu:bundle`, el expansor del cliente, las fuentes REST); falta la capa de comportamiento del navegador. |

---

## P0 · Terminar lo abierto → release 3.0-alpha.385

- [ ] #663 tabs anidados (ids por tira, pestaña activa por tira en Redwood)
- [ ] #664 chat en streaming con progreso del agente (va con ec-demo1#198 en `ia-agent`)
- [ ] #665 `@Searchable` para campos de varios valores (y `@Searchable` en Redwood)
- [ ] #666 parámetros de ruta de `routes.yaml` leídos del segmento correcto
- [ ] Auditoría de Vaadin, prioridades 1, 2, 3 y 10:
  - widget de la bandeja (lo que toca a Mateu: la regla de color de enlaces de la cabecera);
  - botones del chat y del tema como `vaadin-button`;
  - barra de menú en `tertiary contrast` con la sección activa marcada;
  - badges en píldora, cabecera y textos del chat.
- [ ] Documentación: quitar `@Route(parentRoute)`, que ya no existe (`annotations/route.md`, `concepts/ui-vs-route.md` y el comentario de `RouteEntry.java:43-44`).
- [ ] Fusionar de uno en uno y regenerar los bundles al final. Release 385, subir ec-demo1 y redesplegar.

## P1 · Maestro con pestañas que son páginas (L)

Patrón: `/customers/:id` (maestro) con pestañas `/customers/:id/orders`… Cada pestaña es una página
con URL propia, recibe el id del maestro, se carga al abrirla, tiene sus acciones y su paginación, y
funcionan la recarga, el enlace directo y atrás/adelante. La prueba está en el worktree `mateu-mdtabs`,
rama `probe/master-detail-tabs`.

- [ ] Resolver la **cadena de rutas** padre → hijo con `RouteEntry.parent`: el padre consume su prefijo y pinta al hijo en su hueco. Afecta a `RouteInstanceCreator`, `AbsoluteRouteDispatcher`, `AppMenuResolver` y `DirectClassResolver`.
- [ ] **Pestaña por defecto:** la primera hija, o `defaultChild:` en la entrada. Quitar el fallo de `HomeRouteResolver` y `ViewRouteResolver`.
- [ ] **Parámetros** aplicados en cada petición, también cuando el cliente ya conoce la clase (`ActionInstanceCreator.instantiateWithKnownType`).
- [ ] Los **parámetros del padre** llegan como contexto, no como filtros que se pueden quitar. En el listado se ven como una etiqueta de ámbito fija.
- [ ] **CRUD dentro de una pestaña:** `/new` e `/{id}` relativos a su hueco, sin URL duplicada (`MultiView.pathForHistory`, `NavigateToViewActionHandler`).
- [ ] `@Tab(key)` → `TabDto.routeKey`: cambiar de pestaña añade una entrada al historial también en las pestañas de la página.
- [ ] `@Subresource(tab, order, help, load = EAGER | ON_OPEN)`: varios listados apilados en una pestaña, con el contexto del padre y un contador en la pestaña cuando son EAGER.
- [ ] `@App/@Page(backLink = PARENT)`, con el título del padre como texto (D3).
- [ ] **Redwood:** una app anidada es contenido, no la shell (`reduceContexts.mjs` ~2722), con una barra de pestañas por nivel de app.
- [ ] Desactivar las trampas de `@Inline` (recarga infinita): fallar si el tipo embebido no tiene ruta y no caer al camino `DtoSupplier` dentro de un `@Tab`.
- [ ] e2e con los escenarios de la prueba en los dos renderers. Demo «Record master with page tabs» y receta en `route-registry.md`.

## P2 · Retoques de listados (S cada uno)

- [ ] `@Column(visible = false)` → columna oculta por defecto, más «Restaurar» en el selector de columnas (y selector en Redwood).
- [ ] `@Sortable` y `@DefaultSort(field, DESC)`; orden en el cliente para las filas ya cargadas.
- [ ] Selector de tamaño de página (`CrudlDto.pageSizes`).
- [ ] Acciones masivas desactivadas hasta que haya selección, agrupadas en «Actions ▾».
- [ ] `@RowAction(label, icon, disabledWhen, hiddenWhen, preset)`, evaluado por fila.
- [ ] `@Action(preset = DELETE | CREATE | …)`: icono, estilo, posición, confirmación y toast.
- [ ] `@EmptyState(title, hint, actionId)`.
- [ ] `@Copyable` y una acción automática «Copiar ID».
- [ ] `@MainFilter`: conectarlo o quitarlo. Tipos de filtro de dominio (CIDR, IP).
- [ ] Filtro de listado con árbol, usando `@TreeSelect` (D5).

## P3 · Cabecera de detalle y formularios (M)

- [ ] `@HeaderStatus` → el estado como píldora en la línea del título; `@Page(typeLabel)`; menú «Actions ▾» en la cabecera.
- [ ] `@Section(help, helpLink, collapsible, collapsed)`. Arreglar o quitar `@Accordion`, que no tiene `@Retention`.
- [ ] `@Chips(pattern, example, max)` para `List<String>`.
- [ ] `@Repeatable(min, max, addLabel, layout = CARDS | ROWS, summary)`.
- [ ] `@SelectFrom(source, multi)`: una tabla seleccionable dentro del formulario, cuya selección es el valor del campo.
- [ ] `@Creatable` en los selects.
- [ ] Pie fijo con roles de botón; «Required» como texto (`@App(requiredStyle)`).
- [ ] Validación: `@NotBlank`, `@Email` y `@Digits` en el cliente; Bean Validation en el servidor; `ValidationException` → errores por campo.
- [ ] `@TreeSelect` en Redwood (D5).

## P4 · Comportamiento y expresiones (M–L)

- [ ] **Expresiones seguras** (D4): una sola gramática en TS y Java con tests golden. Ámbitos `route`, `app` (context, flags, user), `state`, `data`, `row`, `parent` y `args`, y helpers `t()`, `len()` y `fmt()`.
- [ ] **Datos con nombre:** el resultado de una fuente va a `data.<dest>` con `loading` y `error`, y `bind: [...]` / `@RestData(refreshOn)` para volver a consultar cuando cambia una dependencia.
- [ ] **Cadenas de pasos:** `onSuccess` y `onError` con `If`, `Set` y `Refresh(target)`; abrir una ruta como panel con argumentos (panel de creación genérico).
- [ ] `OnTimer(intervalMillis, while = "…")` y respetar `times`. Navegación SPA en `NavigateTo`.
- [ ] SPI `FeatureFlags`, `@EnabledIf` y flags en el manifest. `RouteEntry.aliases` y `redirectTo`.

## P5 · Modo estático (L)

- [ ] **S0 · demo estática de una porción de VCN** con e2e en Vaadin, desde bundle y desde YAML:
  - listado sobre un API REST pública con filtros, paginación en el cliente y columna de estado;
  - detalle por `:id`;
  - pestaña hija con su listado;
  - borrar con confirmación, toast y refresco del listado.

  Incluye arreglar el enlace directo en modo bundle (#557), el flag de exportación `--static` y el informe de seguridad estática (una ruta estática con métodos Java, `CrudStore`, fuentes proxy o `@EyesOnly` falla al construir). Puede empezar ya.
- [ ] S1: expresiones seguras y datos con nombre en el cliente, orden de filas REST y paginación prefetch-all u offset (con P4).
- [ ] S2: cadenas de pasos, `OnTimer` y progreso por elemento en el cliente.
- [ ] S3: el expansor con formularios editables, validadores, detalle y pestañas; traducciones en el cliente; flags; alias.
- [ ] S4: el bridge de Redwood con fuentes, definiciones, `restAction`, reglas y validaciones; cliente OIDC con PKCE; manifests por área.
- Seguridad: sin secretos en el navegador (el exportador falla si una fuente directa usa `${secret.`); la autorización, siempre en las APIs; guía de CORS o de proxy del mismo origen.

## P6 · Traducciones (M)

- [ ] Claves y argumentos en el wire; `t()` en el cliente; catálogo común `mateu.common.*` en todos los idiomas; traducir los textos escritos a fuego del servidor y del cliente.

## P7 · Paridad de Redwood (L, transversal)

- [ ] Tipos de campo, reglas, validaciones, barra de filtros, selector de columnas, fuentes REST, definiciones y `restAction` en el bridge. Modo oscuro.
- [ ] **Inventario del RDS Toolkit de Figma**, el sistema de diseño Redwood oficial de Oracle en la Figma Community: [RDS Toolkit – 24C](https://www.figma.com/community/file/1425260295705487251/rds-toolkit-24c) y [RDS – Icon Library](https://www.figma.com/community/file/1425259404348358543/rds-icon-library). Se trata de listar las plantillas de página, los componentes y sus variantes, y los tokens, y mapear cada uno a su equivalente en Mateu (existe, parcial o falta). Ese mapa es la lista de paridad del renderer Redwood. Antes de usar cualquier recurso hay que revisar la licencia del fichero; por defecto se toma solo como referencia de diseño.
- [ ] **Importar diseños RDS a Mateu:** ampliar el pipeline `design/figma/` (contract.json, el plugin y el importador de modux) para que reconozca instancias de componentes del RDS Toolkit y las convierta a componentes de Mateu. Así, un diseño hecho con el kit oficial de Redwood se importa directamente.

## P8 · Operaciones, resúmenes y apariencia (M–L)

- [ ] `@WorkRequests(source)`: una pestaña estándar con el registro de operaciones asíncronas y `BulkResult` con progreso por elemento.
- [ ] `@TimeRange(quickSelects)` como valor de ámbito de página, y gráficos con `refreshOn`.
- [ ] **Columna lateral de ámbito (D5):** varios widgets de contexto apilados bajo el menú, ampliando `@AppContext` con `position = SIDE`, `tree`, `title`, acciones de cabecera («añadir | limpiar»), texto vacío, resumen de lo aplicado, diálogo de edición y valor global o por sub-app. Ejemplos de OCI: «List scope» (compartimento en árbol) y «Tag filters».
- [ ] **Tema decorativo configurable**, un solo `theme.yaml` o `@Theme`: franja con textura en la cabecera de página, ilustración del formulario, capas del hero y franja superior de las tarjetas. Las imágenes las pone la app; nunca recursos de Oracle.
- [ ] Más adelante: home personalizable, mega menú con favoritos, «guardar como stack» (`@ExportRequest`) y subformularios compartidos (etiquetas, mover recurso).

## P9 · Navegación: un árbol de menú de dos niveles y montajes remotos (M–L)

Idea del usuario (2026-10-03): desde la misma app se definen los dos niveles de navegación, y el menú
de un servicio remoto se puede montar en cualquier punto del árbol. La variante de la app decide solo
cómo se pinta. El estudio previo, con la situación actual con referencias de fichero y línea, está en
`~/IdeaProjects/ec-demo1-ux/menus-and-subapps-proposal.md`.

- [x] Estudio y propuesta: `~/IdeaProjects/ec-demo1-ux/menus-and-subapps-proposal.md`.

Decisiones (2026-10-03, aprobadas por el usuario):

| # | Decisión |
|---|---|
| M1 | Los menús se combinan en el **navegador**. Cada montaje declara su **prefijo de ruta** en la shell, así que la sección activa y las migas se conocen en frío sin añadir latencia al primer pintado. El servidor solo resuelve los enlaces directos, con la caché que ya existe y eligiendo el remoto por el prefijo más largo. |
| M2 | La **etiqueta de la shell manda** si está declarada; si no, la del remoto (así se puede traducir). |
| M3 | Un tercer nivel en `HAMBURGER_SECTIONS` es un **desplegable en la franja 2**. |
| M4 | Elegir una sección en la hamburguesa **navega a la home de la sección**, como Opera. |
| M5 | Los widgets de ámbito son **por sección**, con la opción de compartir el valor, y van en la **columna lateral**. |
| M6 | `AUTO` **no** elige `HAMBURGER_SECTIONS`: es siempre opcional. |
| M7 | Nombre: `HAMBURGER_SECTIONS`, más el alias `HAMBURGER_MENU` (bien escrito) para el `HAMBURGUER_MENU` actual. |
| M8 | Registro de remotos con **anotación** (por defecto) y **`application.yaml`** (por entorno). |
| M9 | Los favoritos quedan **fuera** (P8). |
| M10 | El front office **no** es una sección del plano de datos: es otra app. |

Entregas:
1. **Sin API nueva:** que un remoto que falla no tumbe a los demás (`allSettled`, también en Vaadin), que la etiqueta de la shell mande, que las migas se conozcan en frío (prefijos) también para las entradas ocultas, y quitar el `MENU_ON_TOP` forzado.
2. **El API de montajes y secciones,** con `HAMBURGER_SECTIONS` en Vaadin y el control plane de ec-demo1 migrado.
3. **Redwood,** los widgets laterales (T11), IntelliJ y React Native.
- [ ] Un árbol de menú de dos niveles en la definición de la app. Cualquier nodo puede montar un menú remoto, entero o una parte, como sección o como opciones dentro de otra sección. Hay que resolver el orden, los permisos, la caché, la carga en frío (la sección activa y las migas se conocen antes de que responda el remoto) y un remoto caído (la sección se desactiva con un aviso; la shell no se rompe).
- [ ] `AppVariant.HAMBURGER_SECTIONS`, estilo Opera Cloud: la hamburguesa lleva el primer nivel y el subheader (la franja 2) el segundo nivel de la sección activa. Las variantes actuales siguen funcionando igual.
- [ ] Las sub-apps pasan a ser secciones del mismo árbol, cada una con su menú de segundo nivel y, opcionalmente, widgets de ámbito lateral (P8). Se mantienen las apps anidadas que de verdad lo sean.
- [ ] La sección y la opción activas, y las migas, salen de la ruta y del mismo árbol.
- [ ] Los dos renderers, más IntelliJ y React Native si pintan menús. Un camino de migración para las apps actuales.
- [ ] **Entregable en ec-demo1:** aplicarlo al menos al control plane. Las secciones son los servicios (IA, Usuarios, Workflow, Forms, Integrations, Mapping, Customers, Registro de huéspedes, Notifications y Audit), cada una montada desde el menú remoto de su servicio, con su segundo nivel en el subheader. Después, al plano de datos.
- Va después de los arreglos de cabecera de la auditoría (P0), porque toca el mismo código: `appRenderer.ts`, `mateu-app.ts` y `renderMenu.ts`.

## P10 · Que un modelo que no conoce Mateu lo use bien (M)

Un LLM no conoce Mateu por su entrenamiento: todo lo que sabe lo saca en cada sesión del repo, de los
skills, de la documentación y de lo que prueba. El objetivo es que Mateu se explique solo a quien no lo
conoce. Hoy hay 5 skills en `.claude/skills` (`mateu`, `mateu-screen`, `mateu-scaffold`, `mateu-run` y
`mateu-federation`), `doc/public/llms.txt`, `mateu-ai-full.md`, `mateu-ai-compact.md`, el `CLAUDE.md`,
los casos de conformidad y las demos. Pero no sabemos cuánto ayudan ni si están al día.

- [ ] **Medir primero.** Una batería de 10 a 15 tareas reales, ejecutadas por un agente que solo tiene el repo, como por ejemplo:
  - un CRUD con filtros y una acción masiva;
  - un maestro con pestañas-página;
  - un asistente con validación;
  - una pantalla estática sobre un API REST;
  - montar un menú remoto.

  De cada una se mira si compila, si se ve bien en los dos renderers, los errores típicos y cuánto cuesta corregirla. El resultado es la línea base.
- [ ] **Recetario de ejemplos ejecutables:** un patrón por pantalla, cada uno con su demo y su test e2e, como referencia canónica. La guía para IA y los skills enlazan a él en lugar de a código suelto.
- [ ] **Skills como guía de decisión:** qué patrón usar, qué anotación usar y cuál evitar, las trampas conocidas (`@Inline`, parámetros que se filtran como filtros…) y un ciclo de verificación (arrancar la demo, capturar y comparar en los dos renderers).
- [ ] **Errores que enseñan:** validaciones de arranque y de exportación con mensajes que dicen qué falla y cómo arreglarlo, como el informe de seguridad estática (P5) o «este `@Inline` no tiene ruta» (P1).
- [ ] **Mantenerlo al día con un control automático:** cada PR que añade una anotación o un patrón actualiza la guía, los skills y el recetario. Se repite la batería del primer punto para ver si mejora.

---

## Registro

| Fecha | Qué |
|---|---|
| 2026-10-03 | Plan escrito; después se añaden P9 (navegación de dos niveles y montajes remotos) y P10 (Mateu entendible por un modelo que no lo conoce). Mateu 384 publicado y desplegado en ec1 (paginado de Vaadin). PRs abiertos: #663, #664, #665 y #666. |
