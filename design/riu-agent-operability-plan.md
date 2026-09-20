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
| **P1** | Proyección + **sidecar MCP** (Node/TS) contra cualquier backend | ⏳ TODO | `frontend/mcp-server/` | El core de valor + demo A6 |
| **P2** | Semántica de proyección como **spec versionada** | ⏳ TODO | `doc/.../reference/wire-specification.md` | Sección "Proyección MCP" |
| **P3** | **Endpoint MCP nativo** en backend Java (+ RBAC nativo) | ⏳ TODO | `backend/shared/core` + adaptadores | Reusa `MateuService`, no HTTP self-hop |
| **P4** | Paridad ports (.NET, Python) del endpoint nativo | ⏳ TODO | `backend/dotnet`, `backend/python` | Playbook corpus/paridad habitual |
| **P5** | Mejora del **chat in-app** (IA conduce la UI) | ⏳ TODO | `frontend/web/monorepo/libs/mateu` | §2.4 runtime; reusa `mateu-chat`/`sseUrl` |
| **P6** | **Prompt-to-app** (emite UIDL validado por schema) — *dirección* | ⏳ TODO | (spike) | NO gate; encuadrar como beta |

Leyenda: ⏳ TODO · 🔨 EN CURSO · ✅ HECHO · ⛔ BLOQUEADO. **Al cerrar un entregable:** marcar aquí +
apuntar rama/commit + verificación hecha.

**Bitácora (append-only, lo más reciente arriba):**
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
