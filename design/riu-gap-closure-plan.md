# Plan de cierre de gaps — Mateu para la arquitectura de referencia de Riu

> **Origen:** los gaps GAP‑1…GAP‑11 de `design/riu-reference-architecture-defense.md` §6.5, destapados
> por el barrido competitivo multi-agente + verificación en repo (2026-09-19).
> **Propósito:** decidir, para cada gap, **qué se cierra antes de la defensa/GA, qué se investiga y qué
> se documenta como límite** — y con qué trabajo concreto.
> **Estado:** BORRADOR vivo. La GA sigue **pausada** (los planes de coherencia/GA lo dicen), así que
> "antes de GA" = antes de soltar el `-alpha`, no una fecha fija.
> **Regla de oro (heredada de ga-plan/coherence):** additive-first, tests por incremento, honestidad —
> nada prometido que no exista.

---

## 0. Tesis del plan (ACTUALIZADA tras verificación adversaria 2026-09-19)

Los 5 refutadores adversarios reordenaron esto. **Solo 3 cosas bloquean la GA/defensa**, y ninguna es
"construir una feature que falta":
- **R1 · GAP‑1 diseño/marca de Riu** — retirar riesgo (renderer con tokens de Riu + demo contra la
  marca real + playbook de escape hatches + guardrail de alcance). Severidad **por superficie**: baja en
  operacional (el grueso de Riu), alta solo en guest-facing brand-led.
  **✅ HECHO (2026-09-19):** capa de tokens Riu `frontend/reference-renderer/riu-theme.css` (Amaranto
  #D2232A + Oro #CA9C4E, mapeada a variables Lumo → tematiza el renderer Vaadin de producción) + demo
  **default⇄Riu** en el renderer de referencia; guía `doc/.../design-systems/branding-and-design-tokens.md`
  con playbook de escape hatches (coste por hatch) + guardrail de alcance + método "pruébalo contra tu
  marca". ⏳ **Necesita Riu:** demo medida sobre 2-3 pantallas reales en vaadin-lit, webfont licenciada,
  logo (trademark → slot, no vendorizar).
- **R2 · Portabilidad verificable (A3)** — hacer real la exit-strategy: **versionar el wire**, publicar
  spec + semántica de derivación, **renderer de referencia mínimo (Core)**, guía de salida, y
  **garantizar licencia OSS + runbook self-host** (el backstop real del bus factor). Verificado: se
  sostiene fuerte vs low-code, pero vs React es un lock-in *distinto* (runtime/skills single-vendor).
- **R3 · Gobernanza (GAP‑3)** — no es código: ≥2 personas que sepan *juzgar* el core, fork interno+CI,
  charter de soporte, auditoría de seguridad externa. La IA baja la mitad "adopción" a BAJA, pero la
  mitad "stewardship" queda MEDIA (accountability/liability/seguridad no se transfieren a la IA).

**Degradados por la verificación (ya NO bloquean):**
- **GAP‑2 visual builder → Media, beta declarada** (V2): el mercado va de drag-drop a IA/NL; Mateu
  compite con código+YAML+DSL-por-IA. Condiciones: cerrar handoff Figma + carril citizen-dev gobernado.
- **GAP‑5 data-grid → document-as-limit + trigger** (V3): pivoting/xlsx estilado es capa BI, no
  back-office; embed AG-Grid vía ComponentAdapter viable pero solo si una pantalla lo pide. No licenciar
  preventivamente.
- **GAP‑4 MCP/UIDL** → investigar (ventaja rival sobrevendida). Resto → documentar. GAP‑9 → descartar.

**Foco de ingeniería:** R1 (renderer marca Riu) + R2 (portabilidad verificable) + el argumentario/gobernanza
de R3. Todo lo demás se investiga con spikes acotados o se documenta.

---

## 1. Tier A — Cerrar antes de la defensa/GA (bloquean la percepción)

### GAP‑1 · Fidelidad de diseño / marca corporativa de Riu
**Objetivo:** que nadie pueda decir "todo se ve como Vaadin". Demostrar que Mateu **rinde la marca de
Riu**, no un tema genérico.
**Enfoque (additive, sin tocar el wire):**
1. **Design tokens de Riu** aplicados como tema sobre un renderer existente (vaadin-lit o VB/Redwood):
   color, tipografía, radios, densidad, logotipo, iconografía. Reusar el mecanismo BYODS ya probado en
   Wefox.
2. **Endurecer + documentar el "bring your own design system"**: guía paso a paso (renderer contract →
   tema → tokens → componentes de marca), con el *coste* real dimensionado (aprendido de Wefox).
3. **Escape hatches demostradas**: un ejemplo real de pantalla bespoke vía `ComponentAdapter` /
   custom-field / `ComponentTreeSupplier`, para acotar dónde está el techo y cómo se supera.
4. **Demo de marca Riu**: 2-3 pantallas hoteleras (check-in / dashboard / listado) con la piel de Riu,
   lado a lado con el tema por defecto.
**Verificación:** screenshots de las mismas pantallas con tema default vs tema Riu; e2e que el tema no
rompe a11y; la guía reproducible por un tercero.
**Gate GA:** sí (es la crítica más creíble del comité). **Esfuerzo:** medio (días, no semanas, si se
reusa Wefox). **Decisión abierta:** ¿tema sobre vaadin-lit o construir el DS de Riu como renderer?

### R2 · Portabilidad verificable — hacer real la exit-strategy (A3) · **NUEVO (V4)**
**Objetivo:** que "la definición es portable / no hay lock-in" deje de ser retórico y sea demostrable —
es a la vez el argumento anti-lock-in Y el backstop del bus factor (GAP‑3).
**Enfoque (5 items, del refutador V4):**
1. **Versionar el wire**: `wireVersion`/`schemaVersion` en `UIIncrementDto` + `$id` del schema, con
   política de compatibilidad (aditivo dentro de un major). Hoy "v3" es un path, no una versión, y los
   DTOs cambian semanalmente.
2. **Publicar el wire como spec versionada standalone** + la **semántica de derivación** (inferencia de
   layout, capability listings, filtros, coerción de estado) — o un re-implementador copia la forma pero
   no el comportamiento.
3. **Renderer de referencia mínimo (Core)**, dependency-light, público — prueba concreta de
   portabilidad + esqueleto de "renderer en 1 día".
4. **Guía de salida/migración** con las 3 rutas (self-host runtime OSS · bundle estático · renderer Core
   propio) y sus límites honestos.
5. **Garantizar licencia OSS + runbook de self-host del runtime** — el backstop legal real; nombrarlo en
   el ADR.
**Verificación:** el renderer de referencia pasa el harness de conformidad a nivel Core; el schema lleva
versión; la guía de salida existe. **Gate GA:** sí (vuelve verificable la promesa central). **Esfuerzo:**
medio (items 1/4/5 baratos; 2/3 medios).

**Progreso (2026-09-19):**
- ✅ **Licencia decidida y garantizada: Apache 2.0** (permisiva + patentes; óptima corporativa, se mantiene).
- ✅ **R2‑4 + backstop R2‑5 (docs):** guía publicada `doc/.../mateu-about/portability-and-exit.md` — 3 rutas
  de salida (self-host OSS · bundle estático · renderer Core), backstop de licencia, límites honestos,
  y roadmap R2‑1/2/3 declarado. Higiene: NOTICE top-level + `license` en package.json de doc/e2e.
- ✅ **R2‑1 versionar el wire (envelope) — HECHO (rama `feat/r2-wire-versioning`).** Campo `wireVersion`
  ("3.0") en `UIIncrementDto` en los 3 backends (Java record + default en compact ctor; .NET record con
  param trailing-opcional + const `CurrentWireVersion`; Python pydantic `wire_version` + `WIRE_VERSION`,
  serializa camelCase). Política de compat documentada (aditivo dentro de un major). **Verificado:** Java
  conformance 3/3; corpus regenerado (`-Dconformance.write=true`) con diff EXACTAMENTE `wireVersion:"3.0"`
  en los 25 casos; Python conformance + sync verdes; .NET aditivo por construcción + goldens por substring
  (`Assert.Contains`) → difiere a CI (no hay `dotnet` local).
- ✅ **R2‑2 spec pública + semántica de derivación — HECHO.** Doc de referencia consolidado
  `doc/.../reference/wire-specification.md` (+ entrada en el sidebar): contrato del envelope versionado
  (`wireVersion` 3.0 + política aditivo-dentro-de-major), modelo de componentes (schemas publicados),
  normalización del corpus, y las reglas de derivación (inferencia de layout con umbrales, sizing,
  page-type/width, capability listings + filtros/criteria, coerción de estado, resolución de rutas +
  precedencia de params, REST sources, bus de comportamiento), enlazando a las fuentes normativas para
  no duplicar. Cierra el hallazgo de V4 ("spec dispersa → reproduces la forma, no el comportamiento").
- ✅ **R2‑3 renderer de referencia Core — HECHO.** `frontend/reference-renderer/` (renderer.mjs +
  index.html + README): renderer **standalone cero-dependencias** que pinta el wire con nada más que el
  wire (sin `libs/mateu`, sin framework, sin build) — la prueba de portabilidad más contundente y el
  esqueleto "renderer en 1 día". Cubre Core (Page/Card/Div/layouts/FormLayout/FormRow/FormField por
  dataType+stereotype/Button/Crudl/Text), placeholder `<mateu-unsupported>`, `SUPPORTED_TYPES` +
  `__mateuRendererInfo`. Tutorial en `doc/.../design-systems/reference-renderer.md` (+ sidebar). Sintaxis
  verificada (`node --check`). Honesto: artefacto teaching/proof, no producto; no cubre overlays/fetch-plan/
  catálogo rico; integrarlo en `e2e/conformance.sh` (que asume plumbing `libs/mateu`) es follow-up.
- ✅ **R2‑1b versionar los schemas — HECHO (no rompedor).** Campo top-level `"version": "3.0"` en los 5
  schemas uidl (via `SCHEMA_VERSION` en `UidlSchemaGenerator`), **manteniendo los `$id`/URLs** para no
  romper el IntelliSense de los editores. Regenerado + `UidlSchemaTest` 12/12 verde; diff = solo `version`.
- ✅ **Metadata de licencia .NET — HECHO.** `backend/dotnet/Directory.Build.props`: `PackageLicenseExpression
  = Apache-2.0` + Authors/Copyright/ProjectUrl para los 4 proyectos + tests de una vez (DRY). (Verificación
  de build .NET difiere a CI — no hay dotnet local; props MSBuild estándar, aditivas.)
- ✅ **R2 COMPLETO** (R2‑1, R2‑1b, R2‑2, R2‑3, R2‑4, R2‑5).
- **Decisión abierta:** ¿el renderer de referencia (R2‑3) es un producto mantenido o solo prueba de portabilidad?

### GAP‑2 · Visual builder — **DEGRADADO a Tier C (Media, no gate) tras V2**
> Ya **no** es "incorporar antes de GA". El mercado se aleja del drag-drop hacia autoría IA/NL, donde
> Mateu compite (código+YAML+DSL-por-IA). Se presenta como **beta declarada** con 2 condiciones (cerrar
> handoff Figma + carril citizen-dev gobernado). Detalle abajo, pero no bloquea GA.
**Objetivo:** pasar el visual builder de "PREVIEW" a algo **demostrable con confianza** ante el comité,
sin sobrevender.
**Enfoque:**
1. **Acotar el alcance demostrable**: definir el subconjunto que funciona sólido (componer una pantalla,
   editar routes.yaml, pickers project-aware ya rediseñados) y marcar el resto como roadmap.
2. **Un flujo end-to-end grabable**: abrir builder → componer una pantalla hotelera → emite la
   definición como dato → se sirve. Sin baches.
3. **Encuadre honesto en el ADR/demo**: "el modelo declarativo habilita autoría visual; esto es beta,
   la promesa GA es código+YAML". (Ya está en §2.11.)
**Verificación:** el flujo grabado reproducible; tests de la generación de la definición (ya hay tests
del page model).
**Gate GA:** parcial — no bloquea la GA del *runtime*, pero sí la credibilidad del pilar low-code.
**Esfuerzo:** medio-alto. **Decisión abierta:** ¿cuánto invertir antes de la defensa vs. presentarlo
explícitamente como "beta en camino"?

---

## 2. Tier B — Preparar argumentario (no es código)

### GAP‑3 · Comunidad / bus factor / continuidad — **REENCUADRADO por la IA (severidad Alta→Media)**
La IA cambia la naturaleza de esta objeción (§2.14). El valor de una comunidad era *librería-para-todo,
soporte, hiring, continuidad* — y **la IA colapsa ese moat**. La respuesta ya **no** es "aceptamos el
riesgo" sino **"con IA lo llevamos donde queramos, como queramos, sin necesidad de comunidad detrás"**.
El argumentario (no es código):
1. **La IA sustituye el moat de comunidad**: construye lo que falte sobre el DSL bajo demanda, es el
   soporte (lee/entiende el código), y no exige "gente que sepa Mateu" (basta dirigir a la IA sobre un
   DSL pequeño). El framework open-source y **AI-legible** lo puede mantener/evolucionar un equipo+IA —
   el propio Mateu se desarrolla así (dogfooding, §2.14).
2. **Portabilidad como seguro de vida**: la definición es dato estándar (JSON/YAML) que Riu posee; sin
   lock-in; renderizable por otro motor (§2.3/§4).
3. **Residuo organizativo (lo único que queda)**: un comité de compras querrá responsable/accountability
   → **escrow del código + ≥2 personas que dirijan la IA + modelo de soporte**.
**Entregable:** sección "Gobernanza y continuidad" en el ADR (§5.3, ya reencuadrada) + propuesta de
modelo de soporte + demo del dogfooding (Mateu evolucionado por IA en vivo). **Gate GA:** sí para la
defensa. **Esfuerzo:** bajo (redacción + decisión de modelo de soporte, del mantenedor/Riu).

**✅ HECHO (R3, 2026-09-19):** documento de gobernanza publicado
`doc/.../mateu-about/governance-and-continuity.md` (+ sidebar): riesgo honesto, qué cambia la IA (split
adopción=baja / stewardship=media) con la frase committee-proof, y el **paquete de mitigación de 6
items** (open-source+fork-readiness, definición portable, **≥2 personas que JUZGUEN el core** + sign-off,
guía de arquitectura/invariantes, **charter de soporte/propiedad** SLA-o-interno, auditoría de seguridad
externa) + "lo que esto le pide a Riu" (gobernanza financiada) + decisiones abiertas. ADR §5.3 enlaza.
⏳ **Decisiones de Riu/mantenedor (no las decido yo):** quiénes son los ≥2 stewards, modelo de soporte
(SLA comercial vs carta interna), quién paga la auditoría, dónde vive la guía de invariantes.

**Corolario (§2.14) que reordena TODO el plan:** los gaps de tipo "pieza que falta" (GAP‑5 data-grid,
GAP‑7 conectores, extensiones de GAP‑1) se degradan — **la IA los construye sobre el DSL bajo demanda**,
sin depender de una comunidad. Dejan de ser "dependemos de que exista X" y pasan a "lo generamos cuando
haga falta". Esto libera esfuerzo para concentrarlo en GAP‑1 y GAP‑2, que la IA **no** resuelve sola.

---

## 3. Tier C — Investigar (decidir tras spike corto)

### GAP‑4 · Autoría IA productizada (MCP + prompt-to-app)
**Spike:** ¿cuánto cuesta un **servidor MCP que respeta RBAC** sobre el modelo Mateu, y un **harness que
emite UIDL** desde un prompt? Alto apalancamiento porque la UI ya es dato. La ventaja rival es estrecha
(la "IA agéntica GA" de la categoría D es early-access — §6.3.1). **Salida:** decidir incorporar un MVP
o dejarlo como dirección. **Esfuerzo:** spike bajo; implementación media.

### GAP‑5 · Data-grid enterprise (pivoting / range-selection / export a escala)
**Spike:** ¿el `ComponentAdapter` puede **embeber AG-Grid** donde el listado nativo no llega (pivot,
range-selection, export masivo)? Los hoteleros esperan tablas operativas potentes. **Salida:** o se
cubre el gap concreto vía adapter, o se documenta el techo. **Esfuerzo:** spike bajo.

---

## 4. Tier D — Documentar como límite (barato, honesto)

| Gap | Qué documentar | Extra opcional |
|---|---|---|
| GAP‑6 Offline-first móvil | "Excelentes en red lenta + offline de lectura; offline-first de escritura fuera de alcance." Acotar apps de campo a mitigación (shell nativo / modo offline). | Roadmap si Riu tiene workforce móvil offline. |
| GAP‑7 Conectores legacy | Modelo de integración (catálogo de sources §2.10, RestDataSource, derivar OpenAPI) + **recetas de adaptador** para sistemas hoteleros legacy. | Librería de adapters comunes. |
| GAP‑8 Analítica de uso | "No de serie; se integra en el backend." | **Hook de instrumentación** (barato, diferenciador — resuelto una vez en el generador). Candidato post-GA de buen ROI. |
| GAP‑10 Scaffolding full-stack | "Mateu es sistema de UI, no generador de apps; deriva OpenAPI+servidor pero no la topología." | — |
| GAP‑11 Plumbing enterprise | Responsabilidades de la app host (SSO/IdP/audit) + **cableado de referencia** con Spring Security. | — |

### GAP‑9 · Animación framework-native → **DESCARTADO** como factor de decisión (UIs operativas no lo necesitan; consistencia/a11y lo prefieren).

---

## 5. Secuencia recomendada

1. **Ya:** GAP‑3 (redacción gobernanza) + GAP‑8 doc + Tier D docs — barato, desbloquea la honestidad del ADR.
2. **Antes de la defensa:** GAP‑1 (demo de marca Riu) — es lo que más convence en vivo.
3. **Antes de la defensa (o encuadrar como beta):** GAP‑2 (flujo builder grabable).
4. **Spikes en paralelo:** GAP‑4 (MCP/UIDL) y GAP‑5 (AG-Grid vía adapter) — 1-2 días cada uno, deciden alcance.
5. **Post-GA:** hook de analítica (GAP‑8), offline móvil si Riu lo pide (GAP‑6).

## 6. Decisiones abiertas para el mantenedor
- GAP‑1: ¿tema-sobre-vaadin o DS de Riu como renderer propio? ¿hay design tokens/marca de Riu ya disponibles?
- GAP‑2: ¿cuánto se invierte en el builder antes de la defensa vs. presentarlo como beta declarada?
- GAP‑3: ¿qué modelo de soporte/continuidad se le puede ofrecer a Riu (escrow, contrato, equipo interno)?
- GAP‑4: ¿el MCP/UIDL-gen entra en el alcance GA v3 o es v3.x?
- Tensión con el **feature freeze**: GAP‑1/2 son material de GA/demo (permitido bajo freeze); GAP‑4/5 son
  features nuevas → si se incorporan, ¿levantan freeze o van a v3.x?
