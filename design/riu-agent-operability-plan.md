# Plan — Plano de operabilidad por agentes (MCP + IA in-app) para la AR de Riu

> **Origen:** conversación mantenedor 2026-09-20. Extiende `design/riu-reference-architecture-defense.md`
> (§2.14 IA-en-desarrollo, §2.4 IA-native runtime, GAP‑4/R4 MCP) y `design/riu-gap-closure-plan.md` (Tier C).
> **Propósito:** convertir GAP‑4 (hoy "investigar") en un **elemento propio de la arquitectura de
> referencia** — el *plano de operabilidad por agentes* — y ejecutarlo hasta el máximo alcance.
> **Decisión de alcance (mantenedor):** ir **directamente a por lo máximo** y **cubrir los dos casos
> de uso** (servidor MCP aparte + endpoint MCP nativo). No es fecha fija: "antes de GA" = antes de soltar
> el `-alpha` (la GA sigue pausada por coherence/ga-plan).
> **Regla de oro (heredada):** additive-first · tests/verificación por incremento · **honestidad** — nada
> prometido que no exista; no sobrevender IA (coherente con A6=🟡).
> **Este doc es RESUMIBLE:** el §1 (Estado) es la única fuente de verdad del progreso. Al parar/retomar,
> se lee §1, se continúa por la primera fase no ✅, y se actualiza §1 al cerrar cada entregable.

---

## 0. Tesis

El wire de Mateu (`UIIncrementDto`: árbol de componentes + campos con tipo/validación + acciones +
comandos `navigateTo`/`dispatchEvent`…) **ya es un protocolo autodescriptivo**. Por tanto no solo sirve
para *pintar* (renderers): sirve para *operar* (agentes). La AR de Riu se defiende como **dos planos
sobre un mismo contrato** (el wire, ya spec pública versionada por R2):

1. **Plano de definición/render** = Mateu (definir-no-construir, multi-DS, multidispositivo).
2. **Plano de operabilidad por agentes** = un **MCP** que expone cada app Mateu como herramientas
   autodescriptivas + el **chat in-app** que conduce la UI con los comandos que el frontend ya aplica.

Framing para el comité: **"un renderer de agente"** — misma salida autodescriptiva, *tools* en vez de
píxeles. Que sea "aparte de Mateu" es el argumento fuerte: no depende de que Mateu tenga IA embebida,
depende de que **el protocolo se autodescribe** — propiedad arquitectónica, no feature.

**Por qué cubrir los 2 casos NO es 2× trabajo:** lo valioso es **la proyección** (`UIIncrementDto` →
tool-schemas MCP + estado estructurado; y tool-call → petición sync). Es transformación pura sobre el
wire, **especificable una vez** (como la semántica de derivación de R2) e implementable por *host*.
Mismo patrón **core + adaptadores finos** que ya usan los 5 frameworks (mvc/webflux/micronaut/quarkus/
helidon envuelven el mismo core). Los dos hosts son adaptadores delgados: (a) cliente del wire, (b)
`MateuService` directo.

**Honestidad (no repetir el pecado de sobrevender IA):** son DOS cosas distintas y solo una es sólida.
- **MCP de runtime** (operar apps vivas): REAL, barato, **demostrable ya** → mueve el eje **A6** sobre
  terreno firme.
- **Prompt-to-app** (autoría al vuelo): sigue **🟡 / dirección de producto**. No mezclar en la defensa.

---

## 1. Estado (ÚNICA fuente de verdad del progreso — actualizar aquí)

| Fase | Entregable | Estado | Rama / rutas | Nota de retome |
|---|---|:--:|---|---|
| **P0** | Folding en ADR/deck (§2.15 pilar + GAP‑4/R4 + matriz A6) | ✅ HECHO | `design/riu-*.md` | ADR §2.15 + GAP‑4 + §7.2/§7.4 + nota A6; deck titular 4 + pilar 4 |
| **P1** | Proyección + **sidecar MCP** (Node, cero-dep) contra cualquier backend | ✅ HECHO | `frontend/mcp-server/` + `e2e/mcp-probe.mjs` | 14 unit (corpus real + protocolo) + e2e 7/7 vs mvc-app1 vivo |
| **P2** | Semántica de proyección como **spec versionada** | ✅ HECHO | `doc/.../reference/wire-specification.md` + `reference/agent-operability.md` | Sección normativa "Agent operability" + doc usuario + sidebar |
| **P3** | **Endpoint MCP nativo** en backend Java (+ RBAC nativo) | ✅ HECHO | `backend/shared/core/.../mcp` + `mvc-core/.../mcp` | 12 tests core + e2e vivo `/mateu/mcp` |
| **P4** | Paridad ports (.NET, Python) del endpoint nativo | ✅ HECHO | `backend/python` ✅ · `backend/dotnet` ✅ | Python 12 tests; .NET 11 tests (incl. RBAC) + suite completa 398/398 |
| **P5** | Mejora del **chat in-app** (IA conduce la UI) | ✅ HECHO | `libs/mateu/.../ui/screenContext.ts` + `mateu-chat.ts` | Contexto = MISMA proyección (campos+acciones); 10 vitest (pura + jsdom). El "conducir" ya existía (eventos) |
| **P6** | **Prompt-to-app** (emite UIDL validado por schema) — *dirección* | ⏳ DIRECCIÓN | (spike) | NO gate; 🟡 como en el ADR |

Leyenda: ⏳ TODO · 🔨 EN CURSO · ✅ HECHO · ⛔ BLOQUEADO. **Al cerrar un entregable:** marcar aquí +
apuntar rama/commit + verificación hecha.

**Bitácora (append-only, lo más reciente arriba):**
- 2026-09-20 — **P5 ✅** (la mitad verificable). El chat in-app ya mandaba `context` (estado crudo),
  `menuContext`, `mcpUrl` y aplicaba respuestas del LLM como eventos DOM (`{event,detail}` →
  `navigation-requested`…) — el "conducir la UI" YA existía. La mejora: `libs/mateu/.../ui/screenContext.ts`
  proyecta el componente en pantalla al MISMO esquema que el MCP (campos con tipo/label/valor + acciones)
  y `mateu-chat.send()` lo añade al body como `screen`, así el asistente sabe qué rellenar/ejecutar en vez
  de adivinar del estado. Tests: 10 vitest (`screenContext.test.ts` proyección pura 6 + `screenContext.dom.test.ts`
  jsdom, DOM-walk con shadow-piercing + elige la pantalla más rica, 4); suite libs/mateu 486/486; tsc 0
  errores. NO rebuild de assets (convención repo: se rebuild aparte). El e2e "LLM conduce la UI" necesita
  backend LLM (config de app, no del framework) → fuera de alcance verificable local.
- 2026-09-20 — **P4 .NET ✅** (VERIFICADO: sí había `dotnet` en `~/.dotnet/dotnet`, 9.0.100). Port C#:
  `src/Mateu.Core/Mcp/` (`McpProjection` sobre `System.Text.Json.Nodes` — ojo `JsonNode` tiene UN padre,
  `DeepClone()` al copiar; `McpService` reusa `SyncHandler`; `McpJsonRpc`) + endpoint `POST /mateu/mcp`
  en `MateuExtensions.MapMateu`. Tests `McpTests.cs`: 11 verdes (proyección inline + wire REAL .NET con
  **RBAC** — `[EyesOnly(Roles=["admin"])]` + sin identidad → oculto; ojo: `[EyesOnly]` SIN dimensiones =
  siempre visible) + **suite completa 398/398**. Los 3 backends nativos ahora en paridad.
- 2026-09-20 — **P4 Python ✅ / .NET follow-up**. `backend/python/mateu_core/mcp.py` (proyección pura
  dict→dict + JSON-RPC + 4 tools, gemelo de JS/Java) + endpoint `POST /mateu/mcp` en `mateu_fastapi`
  (reusa SyncHandler → RBAC). 12 tests con `python3 -m unittest tests.test_mcp` (sin pydantic). **.NET
  nativo deferido**: no hay dotnet local para verificar y shipear C# sin test rompería la regla de oro;
  **el sidecar ya opera un backend .NET hoy** (solo habla wire). P5/P6 → dirección (el MCP es la entrega
  verificada de "IA opera la UI"; prompt-to-app sigue 🟡 como en el ADR).
- 2026-09-20 — **P3 ✅**. Core (framework-neutral, sin deps nuevas, sin tocar bean graph):
  `McpProjection` (wire serializado→pantalla plana, gemelo Java de projection.mjs), `McpService`
  (tool-call→`MateuService`; RBAC heredado del JWT), `McpJsonRpc` (JSON-RPC 2.0, 4 tools). Adaptador
  mvc: `MateuMcpAutoConfiguration` → `POST /mateu/mcp` (RouterFunction aditivo, convive con
  `/mateu/v3/**`; body por el Jackson de Mateu, no el conversor de Spring que va en otro Jackson major).
  12 tests core (incl. RBAC ocultando `@EyesOnly`) + **e2e vivo contra mvc-app1** (initialize/tools-list/
  describe "Simple Form"+greet/run_action). GOTCHA: Spring 7/Boot 4 usa Jackson 3 (`tools.jackson`) en
  su conversor → no deserializa un `JsonNode` de Jackson 2; leer/escribir el body como String.
- 2026-09-20 — **P2 ✅**. Sección normativa "Agent operability — the MCP projection" en
  `wire-specification.md` (tabla de derivación wire→tools, mapeo tool-call→sync, los 2 gotchas del wire,
  dos-hosts-una-proyección) + doc de usuario `reference/agent-operability.md` + entrada en el sidebar.
- 2026-09-20 — **P1 ✅**. Sidecar `frontend/mcp-server/` (Node ESM, cero deps): `projection.mjs` (wire→
  vista plana, pura), `wire.mjs` (cliente sync), `index.mjs` (MCP JSON-RPC 2.0 stdio: initialize/
  tools/list/tools/call, 4 tools). Tests: 14 unit (`node --test`) — proyección contra el corpus REAL
  `conformance/cases/*` + capa de protocolo con wire falso — y sonda e2e `e2e/mcp-probe.mjs` **7/7 contra
  mvc-app1 vivo** (describe "Simple Form" → 1 campo + acción `greet`; run_action OK). **2 gotchas del wire
  reales, corregidos:** (a) `consumedRoute: ""` rompe la resolución de ruta → debe ser `null` en un load
  fresco; (b) el server codifica la raíz como `"_empty"` → normalizar a `""` (`normalizeRoute`).
- 2026-09-20 — **P0 ✅**. ADR: nuevo pilar §2.15 "Plano de operabilidad por agentes"; GAP‑4 elevado
  (row §6.5) a incorporar-runtime + dirección-autoría; R4 §7.2 reescrito; §7.4 cuadro actualizado; nota
  de matiz en el veredicto A6 (§6.3). Deck: titular 4 + slide "4 · IA bajo control" con MCP/operabilidad.
- 2026-09-20 — Plan creado. Contrato del wire confirmado en repo: `POST /mateu/v3/sync/{route}` (raíz
  `/_no_route`); body `{serverSideType, appState, componentState, parameters, consumedRoute, route,
  actionId}`; el *load* usa `actionId: ""` (NO `__load__`); respuesta `UIIncrementDto` con `wireVersion
  "3.0"`, `commands/messages/fragments/banners/appData/appState`.

---

## 2. Alcance máximo (qué SÍ y qué queda fuera)

**Dentro (el "máximo"):**
- Los **dos hosts** MCP: sidecar Node/TS (UC1) **y** endpoint nativo (UC2).
- **RBAC de verdad**: el MCP nunca expone una acción/campo que el token no pueda usar. La autorización
  la aplica **el backend** (`@EyesOnly`/`@ReadOnlyUnless`/`@DisabledUnless` sobre el JWT) — el MCP la
  **hereda**, no crea un camino más débil. Requisito de comité, no opcional.
- **Multi-backend**: el sidecar sirve contra Java/.NET/Python gratis (solo habla wire); el endpoint
  nativo se hace Java-first y los ports siguen el playbook de paridad.
- **Proyección especificada** (no copiada) como consumidor documentado del wire.
- Mejora del chat in-app (plano runtime).

**Fuera / dirección (no gate, honesto):**
- **Prompt-to-app** productizado (P6) — se explora como spike y se presenta como beta/dirección.
- Escritura masiva/transaccional multi-paso "autónoma" sin humano — el MCP expone acciones; la política
  de qué puede hacer un agente sin sign-off es **gobernanza** (§R3), no este plan.
- Offline/PWA para agentes — fuera.

---

## 3. Arquitectura

### 3.1 La proyección (el core compartido)
Entrada: una respuesta `UIIncrementDto` de una ruta. Salida: una vista **plana, agent-friendly**:
- `title`, `route`, `wireVersion`.
- `fields[]`: `{ id, label, dataType, stereotype, required, readOnly, options?, value? }` — extraídos de
  los `FormFieldDto` que anidan dentro de los `fragments`→árbol de componentes (los walkers deben
  descender reflejo por METADATA, como documenta el harness de core).
- `actions[]`: `{ id, label, kind (toolbar/button/…), shortcut?, confirmationRequired? }` — solo las que
  el backend expone para este token (RBAC ya filtrado en servidor).
- `listing?`: `{ columns[], rows[], totalElements, searchable, filters[] }` si la pantalla es un listado.
- `commands[]`: navegación/efectos que el agente debe conocer (`navigateTo`, `dispatchEvent`…).

Inversa (tool-call → sync): `run_action(route, actionId, componentState)` construye el body sync y postea.

**Regla:** la proyección es **especificable una vez** (P2) e implementable por host. Es "otro renderer
del wire" cuya salida es JSON de tools.

### 3.2 Superficie de tools MCP (idéntica en ambos hosts)
- `mateu_list_routes()` — deriva del menú de la App en la respuesta raíz (`/_no_route`) y/o
  `manifest.json` de un bundle. *Honesto:* no hay endpoint de "registro de rutas" público; se enumera lo
  navegable desde el menú (que el propio wire ya trae).
- `mateu_describe_screen(route)` — postea el *load* (`actionId: ""`) y devuelve la proyección §3.1.
- `mateu_run_action(route, actionId, state?)` — ejecuta una acción; devuelve la proyección resultante
  (mensajes, comandos, nueva pantalla).
- `mateu_search(route, searchText?, filters?)` — atajo de la acción `search` de un listado.
- `mateu_navigate(route)` — alias de `describe_screen` del destino (deja explícita la intención).

### 3.3 Los dos hosts
- **Sidecar (UC1, `frontend/mcp-server/`)**: Node/TS, deps mínimas (`@modelcontextprotocol/sdk`),
  transporte **stdio** (lo que consumen Claude Code / desktop / Antigravity) + config `MATEU_BASE_URL` y
  `MATEU_TOKEN` (bearer passthrough). Cliente del wire → **cero cambios de backend**, sirve contra
  Java/.NET/Python. Es el que da la **demo rápida** para el comité y valida la proyección.
- **Endpoint nativo (UC2, backend)**: MCP sobre **Streamable HTTP** (SDK MCP para Java / Spring AI MCP
  server). Reusa `MateuService` **sin salto HTTP** contra sí mismo. Aplica **auth/permisos nativos**
  (JWT + `@EyesOnly`…). Titular: *"cada app corporativa es operable por agentes sin nada extra"*.

### 3.4 Coste real y su mitigación
La proyección acaba **implementada dos veces cross-lenguaje** (TS en el sidecar, Java en el endpoint;
luego .NET/Python por paridad). Se mitiga **especificándola** (P2) en vez de copiándola — y refuerza el
relato R2: la operabilidad por agentes **deriva del wire**, igual que los renderers.

---

## 4. Fases (con criterios de aceptación + verificación + nota de retome)

### P0 · Folding en ADR/deck — *escribir ANTES de código*
Poner la posición por escrito primero, porque la ejecución se va a parar/retomar.
- **§2.15 (nuevo pilar)** "Plano de operabilidad por agentes" en el ADR: dos planos sobre el wire;
  renderer-de-agente; los dos hosts; RBAC heredado; honestidad runtime-vs-prompt-to-app. Numerar 2.15
  para no renumerar (el ADR usa 2.x justo para esto).
- **GAP‑4 / R4**: de "investigar" a **"incorporar (runtime) + dirección (prompt-to-app)"**; anotar que
  cubre los 2 hosts. Actualizar §6.5, §7.2 y el cuadro §7.4.
- **Matriz A6**: mantener el reframe (a)/(b) de §2.14 pero anotar que el **runtime operability** sube (a)
  sobre terreno demostrable. No poner ✅ hasta tener la demo (P1).
- **Deck** `riu-presentation.md`: encaje en el titular 4 "IA bajo control" (añadir "…y operable").
- **Aceptación:** las 3 referencias cruzadas (§2.15 ↔ GAP‑4 ↔ A6) coherentes; deck actualizado.
- **Retome:** si P0 ✅ pero P1 no, el relato ya se puede defender aunque el código no exista.

### P1 · Proyección + sidecar MCP (el core de valor)
- `frontend/mcp-server/`: server MCP stdio con las 5 tools §3.2 y la proyección §3.1.
- **Aceptación:** contra un demo vivo (p.ej. `demo-admin-panel`), `describe_screen` devuelve campos +
  acciones reales de una pantalla CRUD, y `run_action`/`search` ejecutan y devuelven el resultado
  proyectado. RBAC: con un token sin permiso, la acción restringida **no aparece** en `actions[]`.
- **Verificación:** sonda real tipo `e2e/*-probe.mjs` (patrón ya usado: slow-network/a11y probes) que
  arranca el server, lista rutas, describe una pantalla y ejecuta una acción; sale non-zero si falla.
- **Retome:** la proyección vive aquí primero; P2 la extrae a spec; P3 la reimplementa en Java.

### P2 · Semántica de proyección como spec versionada
- Sección **"Proyección MCP"** en `doc/.../reference/wire-specification.md`: reglas de derivación
  wire→tools (qué campo del `UIIncrementDto` mapea a qué parte de la proyección, cómo se enumeran rutas,
  cómo se construye el body de `run_action`, cómo se hereda RBAC). Enlazar a fuentes normativas, no
  duplicar.
- **Aceptación:** un tercero podría reimplementar el MCP desde la spec sin leer el código del sidecar.
- **Retome:** es el contrato que P3/P4 deben respetar; los tres hosts deben coincidir aquí.

### P3 · Endpoint MCP nativo (Java) + RBAC nativo
- Endpoint MCP (Streamable HTTP) servido por la app; reusa `MateuService` y la proyección (Java) de P2.
- Auth nativa: el token del request MCP alimenta el mismo `Authorizer`/JWT; acciones/campos filtrados
  server-side. **Nunca** exponer lo que el token no puede.
- **Aceptación:** un agente se conecta al endpoint de un demo; RBAC demostrado (acción `@EyesOnly`
  ausente del tool-list para token no autorizado, presente para el autorizado).
- **Verificación:** test de core (harness `TestMateu`) de la proyección + sonda de conexión MCP viva.
- **Retome:** Java-first; los ports (P4) siguen.

### P4 · Paridad ports (.NET, Python)
- Endpoint MCP nativo en .NET y Python, misma proyección (P2), verificado por el playbook de paridad
  (corpus/goldens) habitual. *Honesto:* Java-first por diseño; los ports siguen.
- **Aceptación:** paridad de la proyección verificada por corpus; RBAC equivalente.

### P5 · Mejora del chat in-app (IA conduce la UI)
Plano runtime (§2.4), distinto del MCP externo. Reusa `mateu-chat` + `sseUrl`.
- **Contexto = modelo en pantalla**: inyectar el `UIIncrementDto` vigente (rutas/campos/acciones) como
  contexto del chat.
- **Respuestas accionables = comandos que ya existen**: la IA devuelve `navigateTo`/`dispatchEvent`/abrir
  `Drawer`/sembrar `componentState`; el frontend ya sabe aplicarlos (`ConnectedElement.applyCommand`).
- **Aceptación:** el chat rellena un formulario y dispara una acción sobre una pantalla real.
- **Retome:** independiente de P1–P4; puede ir en paralelo.

### P6 · Prompt-to-app (dirección, NO gate)
- Spike: harness que emite **UIDL validado contra los schemas publicados** (`uidl`/`routes`/`sources`/
  `specs`-schema.json) desde un prompt. Alto apalancamiento (la UI es dato).
- **Encuadre:** beta/dirección de producto; **no** se presenta como maduro (A6 (a) = 🟡).
- **Salida:** decidir MVP vs dejarlo como dirección; documentar el techo honesto.

---

## 5. Guardarraíles de honestidad (para la defensa)
- **Runtime operability = demostrable** → mueve A6 sobre terreno firme. **Prompt-to-app = 🟡/dirección**
  → no mezclar.
- **RBAC heredado del servidor, jamás un camino MCP más débil.** Es la diferencia con "ocultar en UI".
- **Multi-backend:** el sidecar es gratis en los 3; el nativo es Java-first (ports siguen) — decirlo.
- **No prometer autonomía sin sign-off:** el MCP expone capacidades; la política de uso autónomo es
  gobernanza (§R3).

## 6. Tensión con el feature-freeze
- **P0** (relato) y **P5** (mejora runtime) son material de defensa/GA → permitidos bajo freeze.
- **P1** (sidecar) es spike/investigación de bajo riesgo (aparte, cero cambios de backend).
- **P3/P4** (endpoint nativo, toca adaptadores) son **feature nueva** → candidatos a **v3.x**, salvo que
  el mantenedor levante el freeze para incorporarlo a la defensa.

## 7. Decisiones abiertas para el mantenedor
- **DECIDIDO:** cubrir los 2 hosts; ir a por el máximo; sidecar primero, nativo después.
- ¿El **endpoint nativo (P3)** entra en la GA v3 o en v3.x? (afecta al freeze).
- ¿Transporte del sidecar solo **stdio**, o también **HTTP remoto** (para agentes cloud tipo Antigravity)?
- ¿El **prompt-to-app (P6)** se presenta como beta en la defensa o se omite?
- Auth del sidecar: ¿bearer passthrough por env, o flujo de login delegado?

## 8. Relación con otros planes
- `riu-reference-architecture-defense.md` — §2.14/§2.4, GAP‑4/R4, matriz A6 (destino del folding P0).
- `riu-gap-closure-plan.md` — Tier C GAP‑4 (este plan lo desarrolla).
- `ga-plan.md` / `coherence-plan.md` — freeze/estado GA (gobiernan §6).
- `doc/.../reference/wire-specification.md` — spec del wire (destino de P2).
- `doc/.../mateu-about/governance-and-continuity.md` — R3 (política de uso autónomo).
