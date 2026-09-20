---
marp: true
title: Mateu como arquitectura de referencia de frontales corporativos — Riu
paginate: true
---

<!--
DECK DE DEFENSA — Mateu como arquitectura de referencia de frontales corporativos de Riu.
Fuente: design/riu-reference-architecture-defense.md (ADR completo) + riu-gap-closure-plan.md.
Los 14 pilares del ADR condensados en 5 TITULARES. Cada slide lleva "Guion:" (lo que se dice).
[PENDIENTE] = dato que Miguel debe rellenar antes de presentar.
Convención de honestidad: nada afirmado que no exista; los gaps se enseñan, no se esconden.
-->

# Mateu
## La UI corporativa se **define**, no se construye

Arquitectura de referencia de frontales para Riu

Miguel Pérez Colom · 2026 · *[PENDIENTE: fecha de la defensa]*

Guion: "No vengo a proponer un framework. Vengo a proponer un **principio** —definir en vez de construir— y su mejor implementación hoy: Mateu."

---

## Por qué esta decisión, ahora

- Las UIs corporativas son 80% CRUD, formularios, listados, wizards sobre modelos de negocio.
- Hoy las **construimos a mano** (React/Angular): caras, inconsistentes, y cada una arrastra una **API-para-la-UI** que hay que diseñar, versionar y coordinar entre equipos.
- La IA ya escribe código. La pregunta no es *si*, sino **cómo no perder el control**.
- *[PENDIENTE: cómo se hacen hoy las UIs en Riu + dolor concreto + volumen de apps]*

Guion: "El coste de un frontal no es escribir React. Es el contrato, la coordinación y el mantenimiento a ambos lados. Eso es lo que atacamos."

---

## Los 5 titulares

1. **Definir, no construir** — subimos el nivel de abstracción del frontal.
2. **Sin API que publicar** — la UI es un adaptador del hexágono, no una app aparte.
3. **Una definición → todos los canales, para siempre** — activo portable y duradero.
4. **IA bajo control** — la IA solo necesita un DSL pequeño; no pierdes el proyecto. Y **opera** las apps por MCP.
5. **Probado y honesto** — GA de la v3 (no la v1), y sabemos qué cerrar antes de GA.

Guion: "Todo sale de una única propiedad: **la UI es una definición declarativa (dato), no código imperativo.**"

---

# 1 · Definir, no construir

La capa de frontales es la única que **no ha subido de abstracción**.

| Capa | Imperativo (viejo) | Declarativo (maduro) |
|---|---|---|
| Datos | recorrer registros | **SQL** |
| Infra | scripts de provisión | **Terraform** |
| Orquestación | arrancar contenedores | **Kubernetes** |
| **Frontales** | **React/Angular a mano** | **Mateu** |

**Construir UIs a mano es el anti-patrón caro, no la opción segura.**

Guion: "Declaras qué UI quieres —menú, cruds, filtros, columnas, reglas, flujos—; el cómo (pintar, validar, navegar, accesibilidad) se genera y funciona solo."

---

# 2 · Sin API que publicar

**La UI vuelve a ser un adaptador del hexágono**, servido por el mismo backend.

- ~90% de las APIs corporativas existen **solo para alimentar la UI** (los BFF). Con Mateu **desaparecen**.
- Y con ellas su factura, que es **organizativa**: acordar el contrato, diseñarlo, versionarlo, sincronizar releases, retrocompatibilidad, superficie de seguridad.
- **Argumento Conway's Law:** eliminas una frontera de coordinación entera entre equipos.
- Las APIs que **sí** son producto (B2B, terceros) no se pierden: Mateu **deriva su OpenAPI** del modelo.

Guion: "No es que escribamos menos React. Es que **borramos una capa entera** —y la reunión de sincronización que viene con ella."

---

# 3 · Una definición → todos los canales, para siempre

La definición es un **activo portable que Riu posee**. El *cómo se ve* y el *dónde corre* son intercambiables.

- **Multidispositivo:** web (Vaadin/Redwood) + móvil nativo (React Native) + escritorio (IntelliJ) + **bundle estático a CDN sin backend** — mismo `/mateu/v3/sync`.
- **Multi-backend:** Java · .NET · Python. No fuerza un stack único; federa entre lenguajes.
- **Multi-design-system:** el aspecto vive en el renderer. **Cambias de DS o dispositivo → no tocas la definición.** (Wefox corrió con su DS propio.)
- **Corporate de serie:** accesibilidad + i18n (cumplimiento legal UE) + RBAC en servidor — resueltos **una vez en el generador**.

Guion: "Si mañana Riu cambia de design system o de dispositivo, la definición sigue igual. Vuestra inversión sobrevive a las modas de frontend."

---

# 4 · IA bajo control

La IA escribiendo código es ineludible. **Mateu es el plano de control.**

| | IA + React a mano | IA + Mateu |
|---|---|---|
| Salida | miles de líneas imperativas | **definición pequeña (DSL)** |
| Revisable | ❌ nadie revisa 3.000 líneas | ✅ 30 líneas |
| Validable | ❌ | ✅ **contra JSON Schema** |
| Control | se pierde con el volumen | **se conserva** |

- La IA solo necesita conocer el **DSL de Mateu** — superficie finita, no el ecosistema React infinito.
- **Prueba viviente:** Mateu se desarrolla hace tiempo **sin una línea escrita a mano** — la escribe la IA bajo dirección arquitectónica.
- **Y al revés — la IA *opera* las apps:** el wire se autodescribe, así que un **MCP** convierte cada app en herramientas que cualquier agente (Claude, Antigravity, un copiloto interno) descubre y ejecuta, **con permisos aplicados en servidor**. Un "renderer de agente": tools en vez de píxeles.

Guion: "¿Por qué no dejar que la IA escriba React directamente? Porque eso es **perder el control**. Con Mateu la IA construye dentro de un contrato acotado y validable — y además **opera** las apps ya hechas por MCP, sin construir una API-para-agentes por cada una."

---

# 5 · Probado y honesto

**No es un experimento: es la GA de la v3, no de la v1.**

- Años en producción a lo largo de varias versiones mayores: **Quotravel** (íntegro sobre Mateu) y **Wefox** (portal de brokers, con DS propio).
- *[PENDIENTE: métricas — nº pantallas / usuarios / tiempo en prod / tamaño de equipo]*
- **Open source:** productividad de low-code **sin licencia ni lock-in de runtime** (mata a OutSystems/Mendix).
- **Comparado con 6 categorías, nadie cubre la combinación** (siguiente slide).

Guion: "El número de versión no es inmadurez: es iteración acumulada en producción. Y no escondo dónde somos más débiles —lo enseño."

---

## La comparativa (verificada con búsqueda web + refutación adversaria)

**Ningún contendiente cruza toda la fila.** Mateu es el único ✅ en "una UI sobre Java+.NET+Python arbitrario".

| Eje decisivo | React+BFF | Low-code interno | Low-code empresa | Vaadin/Hilla | **Mateu** |
|---|:-:|:-:|:-:|:-:|:-:|
| Sin API-para-la-UI | ❌ | ✅ | ✅ | ✅ | ✅ |
| Definición portable (dato del cliente) | 🟡 | 🟡 | ❌ | ❌ | ✅ |
| Multi-backend Java/.NET/Python | 🟡 | 🟡 | ❌ | ❌ | ✅ |
| Web+nativo+estático de una def | 🟡 | 🟡 | 🟡 | ❌ | ✅ |
| Open source / sin lock-in runtime | ✅ | 🟡 | ❌ | 🟡 | ✅ |
| A11y+i18n+RBAC de serie | 🟡 | 🟡 | ✅ | ✅ | ✅ |
| Ecosistema / hiring | ✅ | ✅ | ✅ | ✅ | **❌** |

Guion: "Los que ganan en un eje —madurez de React, RBAC de OutSystems— renuncian a los que Riu necesita a 10 años. Matriz completa de 15 ejes en el anexo."

---

## Dónde somos más débiles (y qué hacemos)

Honestidad = credibilidad. **3 gaps reales; solo estos bloquean la GA:**

- **Diseño / marca pixel-perfect** — real en pantallas *guest-facing*; **bajo en operacional**. → Renderer con tokens de Riu + **demo contra la marca real** + escape hatches documentadas.
- **Portabilidad "en teoría"** — fuerte vs low-code, pero hay que hacerla **verificable**. → Versionar el wire + spec publicada + **renderer de referencia** + licencia OSS & self-host (el backstop del bus factor).
- **Comunidad / bus factor** — la IA **neutraliza** el "no hay comunidad" (construye lo que falte, se autosoporta); queda un residuo **organizativo**. → ≥2 personas que juzguen el core + fork interno + charter de soporte + auditoría de seguridad.

Guion: "La IA reordenó el mapa: los gaps de 'pieza que falta' dejaron de pesar. Lo que queda es diseño-de-marca, portabilidad-verificable y gobernanza —las tres cosas que ni la IA ni una comunidad te regalan."

---

## Lo que pedimos decidir

- **Adoptar el principio** *definir-no-construir* como arquitectura de referencia de frontales de Riu, implementado con **Mateu**.
- **Alcance de arranque:** *[PENDIENTE: piloto acotado — ¿qué dominio? p.ej. front-office / back-office hotelero]*.
- **Compromisos pre-GA de Mateu:** renderer de marca Riu + portabilidad verificable + gobernanza (R1/R2/R3).
- **Criterios de éxito y plazos:** *[PENDIENTE contigo]*.

Guion: "No pido fe. Pido un piloto acotado con criterios de éxito medibles, y me comprometo a cerrar los 3 gaps que bloquean antes de la GA."

---

## Anexo A — Matriz completa (15 ejes, verificada 2026-09-19)

Leyenda: ✅ sí/de serie · 🟡 parcial/con esfuerzo · ❌ no. **A** SPA+DS+BFF · **B** admin OSS · **C** low-code interno · **D** low-code empresa · **E** SDUI · **F** Vaadin/Hilla/JHipster. *Rating por categoría = cómo lo hace esa categoría, no vs Mateu. Mateu puntuado honestamente — NO es ✅ en todo.*

| Criterio | A | B | C | D | E | F | **Mateu** |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| A1 Definir-el-modelo-una-vez (no picar UI) | ❌ | 🟡 | 🟡 | ✅ | 🟡 | 🟡 | ✅ |
| A2 Sin BFF / API-para-la-UI | ❌ | 🟡 | ✅ | ✅ | 🟡 | ✅ | ✅ |
| A3 Definición portable como dato, del cliente | 🟡 | 🟡 | 🟡 | ❌ | ✅ | ❌ | ✅ |
| A4 Una UI sobre Java **y** .NET **y** Python | 🟡 | 🟡 | 🟡 | ❌ | 🟡 | ❌ | ✅ |
| A5 Web + nativo + bundle estático de una def | 🟡 | ❌ | 🟡 | 🟡 | 🟡 | ❌ | ✅ |
| A6 IA-native (LLM emite/conduce la UI) | ✅ | 🟡 | ✅ | ✅ | 🟡 | 🟡 | 🟡 |
| A7 Open source / sin licencia | ✅ | 🟡 | 🟡 | ❌ | 🟡 | 🟡 | ✅ |
| A8 Sin lock-in de runtime propietario | ✅ | 🟡 | 🟡 | ❌ | 🟡 | 🟡 | ✅ |
| A9 A11y + i18n de serie | 🟡 | 🟡 | 🟡 | ✅ | ❌ | ✅ | ✅ |
| A10 RBAC aplicado en servidor | 🟡 | 🟡 | ✅ | ✅ | ❌ | ✅ | ✅ |
| A11 Visual builder GA | 🟡 | 🟡 | ✅ | ✅ | 🟡 | 🟡 | 🟡 |
| A12 Federación de UI (build + runtime) | ✅ | 🟡 | ❌ | 🟡 | 🟡 | 🟡 | ✅ |
| A13 Ecosistema / comunidad / hiring | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | ❌ |
| A14 Control de diseño / pixel-perfect | ✅ | 🟡 | 🟡 | 🟡 | ✅ | 🟡 | 🟡 |
| A15 TCO bajo (labor + licencia + mantenimiento) | ❌ | 🟡 | 🟡 | ❌ | ❌ | 🟡 | ✅ |

**Mateu: 10 ✅ · 3 🟡 · 1 ❌.** Ningún contendiente cruza toda la fila. Único ✅ absoluto en **A4**. Débiles honestos: **A13** (ecosistema, ❌ — reencuadrado por la IA), **A11** (builder, 🟡 preview), **A14** (pixel-perfect, 🟡). **A6 = 🟡 a propósito** (AI-native arquitectónico, sin autoría prompt-to-app productizada).

Correcciones de la verificación (§6.3.1 del ADR): A6 de Mateu bajado ✅→🟡; el "sin-BFF" también lo tiene el low-code para CRUD simple (el filo real de Mateu es *sin-BFF Y adaptador del mismo backend*); A4 confirmado como diferenciador real (ninguna low-code lo iguala); Directus no es "gratis/open" a escala Riu (BSL); la "IA agéntica GA" de OutSystems/Mendix/Power Apps está sobrevendida (early-access).

*Nota: esta matriz mide "AI-native runtime" (A6). El eje de gobernanza "IA-en-desarrollo controlable" (Titular 4) es distinto y NO está en esta tabla — ahí Mateu lidera.*

## Anexo B — Evidencia
- Producción: Quotravel, Wefox (DS propio). Demos: serie Star Wars Ex1–6, demo-front-office.
- Verificación: corpus de conformidad (Java/.NET/Python), a11y (axe-core + sondas nativas), matriz verificada con búsqueda web + 5 refutadores adversarios (2026-09-19).
- *[PENDIENTE: licencia OSS concreta · métricas de producción · stack real de Riu · design tokens de Riu]*

## Anexo C — Fuentes
- ADR completo: `design/riu-reference-architecture-defense.md`
- Plan de cierre de gaps: `design/riu-gap-closure-plan.md`
