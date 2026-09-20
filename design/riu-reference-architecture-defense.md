# Mateu como arquitectura de referencia de frontales corporativos en Riu

> **Estado:** BORRADOR vivo — en construcción con el mantenedor.
> **Propósito:** documento de decisión (ADR/RFC) para defender la adopción de Mateu como
> arquitectura de referencia de las UIs corporativas de Riu.
> **Autor:** Miguel Pérez Colom · **Fecha:** 2026-09-19
> **Convención:** cada afirmación marcada con **[EVIDENCIA]** debe respaldarse con un test, una demo
> ejecutable o una referencia de código antes de la defensa. Nada prometido que no exista (misma
> honestidad que `ga-plan.md`).

---

## 0. Resumen ejecutivo (una página)

**La tesis.** El valor del trabajo de frontales corporativos no está en *construir* la UI, está en
**definirla**: qué menú, qué CRUDs, qué filtros, qué columnas, qué reglas, qué flujos. El resto —cómo
se pinta, valida, navega y se hace accesible— es trabajo mecánico que debe **generarse y funcionar
solo**. Nuestro trabajo no es crear UIs; es definirlas.

**Todo lo demás se deriva de una única propiedad:** la UI es una **definición declarativa (dato)**, no
código imperativo. De ahí salen los pilares de la propuesta (§2):

1. **Definir, no construir** — subimos el nivel de abstracción del frontal (§2.1).
2. **La UI es un adaptador del hexágono → no hay API que publicar** — ~90% de las APIs corporativas
   existen solo para la UI; desaparecen, y con ellas la coordinación entre equipos (§2.2).
3. **La definición es un activo duradero** — multidispositivo y multi-design-system: si cambia el
   dispositivo o el DS, **no se toca la definición**, solo el renderer (§2.3).
4. **IA-nativa** — como la UI es dato/UIDL, un LLM puede **influir en la UI** con instrucciones
   acotadas e incluso **crear interfaces al vuelo** emitiendo UIDL (§2.4).
5. **UIs distribuidas nativas** — cada dominio/equipo posee su UI sin monolito (§2.5).
6. **Open source** — la productividad del low-code sin su licencia ni su lock-in de runtime (§2.6).
7. **A11y + i18n de serie** — resueltas una vez en el generador; cumplimiento legal UE por defecto (§2.7).
8. **Multi-backend** — Java, .NET y Python; no fuerza un stack único, federa entre lenguajes (§2.8).
9. **Exportable a bundle estático** — la misma definición a un CDN sin backend (coste/escala/edge/
   seguridad); un modelo, backend-driven o estático (§2.9).
10. **Integra REST externo + catálogo de sources** — consume APIs existentes sin BFF y deriva el
    contrato de las que sí hay que publicar (§2.10).
11. **Visual builder** — autoría visual que emite la definición como dato; on-ramp low-code
    *(⚠️ preview, no GA)* (§2.11).
12. **Seguridad y permisos por rol integrados** — declarativos y **aplicados en servidor** (no solo
    ocultar en UI); RBAC sobre tu JWT/OAuth (§2.12).
13. **Multidispositivo real** — una definición → web + nativo móvil (React Native) + escritorio
    (IntelliJ) + estático, todos sobre el mismo wire (§2.13).
14. **IA en el desarrollo, acotada y bajo control** — la IA solo necesita el DSL de Mateu y produce una
    definición pequeña y validable (no código imperativo ingente): **el plano de control de la IA**, sin
    perder el control del proyecto. Y neutraliza el moat de "comunidad/soporte" (§2.14).

**La propuesta.** Adoptar estos principios como arquitectura de referencia de los frontales
corporativos de Riu, e implementarlos con **Mateu** — un sistema de UI dirigido por modelo que
renderiza una única definición declarativa en web y nativo, con o sin backend.

**Por qué ahora / por qué Mateu.**
1. **No es un experimento.** Lo que sale ahora es la **GA de la versión 3, no de la v1**. Las
   versiones anteriores ya se usaron **en producción** para construir **Quotravel** y después en
   **Wefox** (portal de brokers). Sistema *battle-tested* a lo largo de varias versiones mayores.
   **[EVIDENCIA: Quotravel + Wefox]**
2. Encaja con el stack de Riu (Java/Spring; también .NET y Python) — *[PENDIENTE: confirmar stack]*.
3. Encaja con el dominio: gran parte del sistema ya está probado sobre casos hoteleros reales
   (check-in, folios, cardex, huéspedes, front-office). **[EVIDENCIA: demos]**
4. La definición es **dato tuyo**, no código atado a un framework → mitiga lock-in y continuidad.

**Lo que pedimos decidir.** *[PENDIENTE: la decisión concreta — piloto, adopción por dominio,
estándar corporativo, etc.]*

---

## 1. El problema (por qué hace falta una arquitectura de referencia)

*[PENDIENTE — con tu input:]*
- ¿Cómo se construyen hoy las UIs corporativas en Riu? (tecnologías, equipos, tiempos, dolor)
- ¿Qué se rompe? (deriva de estilo, coste por pantalla, mantenimiento, dependencia de frontend devs,
  inconsistencia entre apps, a11y/i18n irregular…)
- **La factura oculta de las APIs-para-la-UI**: ¿cuántos endpoints/BFF existen hoy solo para pintar
  pantallas? ¿cuánto se invierte en acordarlos, versionarlos, mantenerlos entre back y front?
- **El coste de cada cambio de dispositivo o de design system**: ¿qué pasa hoy cuando cambia el
  branding, el DS o hay que dar soporte a un nuevo dispositivo? ¿reescritura?
- ¿Cuántas UIs / qué volumen? ¿back-office, front-office, ambos?
- ¿Existe ya una arquitectura de referencia (React/Angular/low-code)? ¿Se sustituye o se convive?

---

## 2. Los principios (los pilares de la propuesta)

Todos derivan de lo mismo: **la UI es una definición declarativa (dato), no código imperativo.**

### 2.1 Definir, no construir
La misma curva de madurez que ya ganó en otras capas de la ingeniería:

| Capa | Enfoque imperativo (viejo) | Enfoque declarativo (maduro) |
|---|---|---|
| Consultas de datos | recorrer registros a mano | **SQL** (declaras qué, no cómo) |
| Infraestructura | scripts de provisión | **Terraform / IaC** (estado deseado) |
| Orquestación | arrancar contenedores a mano | **Kubernetes** (YAML + reconciler) |
| **Frontales** | **componer UIs a mano (React/Angular)** | **definición declarativa + generador (Mateu)** |

Los frontales son la capa que **todavía no ha subido de abstracción**. Seguimos escribiendo el
"assembler" a mano. La propuesta es subirla.

**Corolario incómodo (a favor):** construir UIs a mano es el **anti-patrón caro**, no la opción segura.
Cada CRUD hecho a mano es deuda, deriva visual y un a11y/i18n/validación reimplementado (y normalmente
peor) pantalla a pantalla.

### 2.2 La UI es un adaptador, no una app aparte (y por eso no hay API que publicar)
Probablemente el pilar de mayor impacto económico/organizativo.

**La UI como adaptador del hexágono.** En arquitectura hexagonal, los *adaptadores* traducen el mundo
exterior hacia/desde el dominio. Una SPA tradicional NO es un adaptador del backend: es **otra
aplicación**, con su propio ciclo, su equipo y su contrato (la API) para hablar con el dominio. Con
Mateu, al **definir la UI desde el servidor**, la UI vuelve a ser lo que arquitectónicamente debería
ser: **un adaptador *driving* más**, servido por el mismo backend que ya tiene el dominio y los casos
de uso. El backend expone *casos de uso*, no *endpoints-para-pintar*.

**El ahorro: no publicar una API.** ~90% de las APIs corporativas existen solo para soportar la UI
(BFF, DTO de pantalla, endpoints "dame lo que necesita esta vista"). Si la UI se define desde el
servidor, **esa API no hace falta**. Y con ella desaparece su factura, sobre todo **organizativa**:
- No hay que **acordar** el contrato entre back y front.
- No hay que **diseñarlo** (shapes, paginación, filtros, errores).
- No hay que **versionarlo** ni **sincronizar su evolución** (UI y dominio viajan juntos).
- No hay **retrocompatibilidad**, deprecaciones ni "quién despliega primero".
- Menos superficie de **seguridad** que auditar.

Argumento **Conway's Law**: eliminas una frontera de coordinación entera entre equipos. El coste de un
frontal no es escribir React; es **el contrato y la coordinación** a ambos lados de la API.

*Honestidad:* aplica al ~90% "para la UI". Las APIs que son **producto** (B2B, terceros, móvil
no-Mateu) siguen existiendo — y Mateu incluso ayuda a derivarlas (`mateu-bundle:openapi`). Ver §6.

### 2.3 La definición es un activo duradero (multidispositivo · multi-design-system)
El argumento de **protección de la inversión**. Una UI hecha a mano ata tu inversión a un framework
(React/Angular), un design system (Material/Fluent/…) y unos dispositivos. Cuando cualquiera cambia
—y **cambian** cada pocos años— pagas una **reescritura**. Con Mateu la inversión está en la
**definición**, invariante a esos ejes:
- **Multidispositivo (protección):** un nuevo dispositivo/canal = un nuevo renderer, **no** una nueva
  definición (el detalle de canales soportados hoy, en §2.13).
- **Multi-design-system:** el aspecto lo aporta el renderer/tema. Cambiar de DS o de branding =
  cambiar el renderer o el tema, **sin tocar** menús, CRUDs, filtros ni flujos.

> **La frase para el comité:** "Si mañana Riu cambia de design system o de dispositivo, la definición
> sigue igual. Solo cambiamos el renderer o el generador. Vuestra inversión sobrevive a las modas de
> frontend."

Es también la respuesta profunda al **lock-in** (§6.4) y a la **continuidad** (§6.3).

**Probado en producción:** el *bring your own design system* no es teoría — es **exactamente lo que se
hizo en Wefox**, que corrió sobre Mateu con **su propio design system corporativo**. Es la evidencia
directa de que este pilar funciona en un entorno corporativo real. **[EVIDENCIA: Wefox broker portal
con DS propio].**

*Honestidad:* hoy a paridad de renderers están vaadin-lit y VB/Redwood (web) + React Native e IntelliJ
(nativo). El renderer contract / bring-your-own-design-system está probado (Wefox); lo que conviene
acotar es el *coste* de traer un DS nuevo (esfuerzo de un renderer/tema), no si es posible.

### 2.4 IA-nativa: el LLM influye en la UI y crea interfaces al vuelo
No es "tener un chatbot pegado a la app". Es que, **al ser la UI una definición declarativa (UIDL,
dato)**, el LLM opera sobre un sustrato que entiende y puede manipular con seguridad. Dos niveles:

1. **Instruir al LLM para que *influya* en la UI.** Se le da un conjunto **acotado de instrucciones**
   (navegar, rellenar, disparar acciones, mostrar/ocultar, abrir un flujo…) y el LLM conduce la UI a
   través del modelo declarativo — una superficie estructurada y segura, no un LLM "picando" en un DOM
   de React. La UI reacciona por su modelo, no por hacks.
2. **Darle el UIDL para que *cree* interfaces al vuelo.** Como la UI **es dato**, el LLM puede
   **generar la definición** (UIDL) de una pantalla completa en tiempo real. No escribe/compila/
   despliega código: emite datos que el renderer pinta al instante. Esto es **estructuralmente
   imposible** con frontales hechos a mano.

**Encaje estratégico:** la misma propiedad que hace la definición *duradera* (§2.3) la hace
*AI-native*. Mateu está preparado para la era de la IA **por construcción**, no por un añadido. Para un
comité que piensa en los próximos 5–10 años, esto es diferenciador de primer orden.

*[EVIDENCIA / PENDIENTE ACOTAR: hoy en el repo existe chat IA (via `sseUrl`) + command center con
"Ask AI". El "instruir al LLM con un set de instrucciones para conducir la UI" y "darle el UIDL para
generar pantallas al vuelo" — precisar qué está construido/demostrable vs. qué es la dirección de
producto, para no prometer de más. Es el pilar más potente y el que más rigor de honestidad exige.]*

### 2.5 UIs distribuidas, nativas
Mateu compone frontales distribuidos **de fábrica**, en dos modos:
- **Build-time (federación por Maven):** varios módulos `@UI` independientes agregados por un
  *shell app* en un solo despliegue. Cada dominio/equipo posee su módulo.
- **Runtime (RemoteMenu sobre HTTP):** servicios independientes que exponen su UI y se componen en un
  shell en caliente — microfrontends reales, cada uno con su ciclo de vida.

"Cada equipo/dominio posee su UI" sin app monolítica ni el circo de integrar microfrontends con build
compartido. **[EVIDENCIA: demo-starwars-5-federation, skill mateu-federation, RemoteMenu].**

### 2.6 Open source: sin lock-in de proveedor ni coste de licencia
Mateu es **open source** *[PENDIENTE: confirmar licencia — Apache 2.0 / MIT / …]*. Frente a las
plataformas de low-code / visual builder comerciales (OutSystems, Mendix, y similares), esto elimina
de golpe sus dos mayores costes:

- **Sin licencias.** Nada de pago por app, por usuario o por entorno. El coste de esas plataformas
  escala con el éxito (más apps/usuarios = más factura); aquí no.
- **Sin lock-in de proveedor.** No dependes de un runtime propietario, de su cloud, ni de su roadmap
  comercial. El código está, el modelo es tuyo (§2.3), y puedes forkear/mantener si hiciera falta.

**El argumento que gana a low-code:** Mateu da **el mismo on-ramp visual** (su propio visual builder,
que emite la definición como dato) **sin el peaje de licencia ni la jaula del runtime propietario**.
Productividad de low-code, libertad de open source.

*Honestidad:* "open source" no significa "gratis total" — el TCO real incluye mantenimiento/soporte,
que es la cara b del bus factor (§5.3). Lo que elimina es la **licencia** y el **lock-in de runtime**,
no la necesidad de una historia de gobernanza/soporte.

### 2.7 Accesibilidad e i18n de serie (resueltas una vez en el generador)
Consecuencia directa del modelo generativo: los *cross-cutting concerns* se resuelven **una vez en el
generador** y los heredan **todas** las pantallas — no cada equipo reimplementándolos pantalla a
pantalla (que es como se degradan en los frontales hechos a mano).

- **Accesibilidad de serie.** El renderer emite marcado accesible por defecto (roles, foco, live
  regions, navegación por teclado, skip links, landmarks) en **web y nativo**. No es opcional ni
  depende de que el desarrollador se acuerde. **[EVIDENCIA: trabajo de a11y web + nativos, verificado
  con axe-core y sondas RN/IntelliJ].**
- **i18n de serie.** Traducción vía `Translator`/`DefaultTranslator`; los textos de la UI pasan por un
  punto único de traducción. **[EVIDENCIA]**

**Ángulo de cumplimiento (clave para el comité):** la accesibilidad no es un "nice to have" — en la UE
es **requisito legal** (Directiva de Accesibilidad Web / EN 301 549, y la European Accessibility Act
para servicios). Un frontal generado que es **accesible por construcción** convierte el cumplimiento en
el estado por defecto en vez de una auditoría cara y recurrente sobre UIs hechas a mano. Para una
multinacional hotelera, esto es reducción directa de riesgo legal. *[PENDIENTE: confirmar nivel de
conformidad declarable — WCAG 2.1 AA, etc.]*

### 2.8 Multi-backend: Java, .NET y Python (no es una apuesta Java-only)
El modelo declarativo es **agnóstico al lenguaje del backend**. El mismo modelo, el mismo **wire** y
los mismos renderers funcionan sobre:
- **Java** — MVC · WebFlux · Micronaut · Quarkus · Helidon MP.
- **.NET** — ASP.NET (mapper reflexivo emitiendo el mismo `/mateu/v3/sync`).
- **Python** — FastAPI + Pydantic (íd.).

Implicaciones para Riu:
- **No fuerza un stack único.** Cada equipo/dominio adopta Mateu en el lenguaje que ya usa; no hay que
  reconvertir backends para tener UIs coherentes.
- **Federación entre lenguajes.** Un servicio .NET y uno Java pueden contribuir UI al **mismo shell**
  (mismo wire, §2.5) — microfrontends políglotas.
- **Menos riesgo de adopción.** No apuestas por un runtime; el principio (§2.1) está implementado tres
  veces, mantenido en lockstep por un **corpus de conformidad** que verifica que el wire es idéntico.

*Honestidad:* la superficie *core* (forms, cruds, listings, filtros, layout, navegación, wizards) está
a paridad y verificada por el corpus; algunas capacidades son **Java-first por diseño** y están
documentadas como tal en `parity.md` (p.ej. el proxy de REST source sin anotación —sensible a SSRF—, y
cierta orquestación in-page). La promesa que se lleva al comité debe ser la superficie a paridad, con
la matriz honesta al lado. **[EVIDENCIA: backend/dotnet, backend/python, conformance/ + parity.md].**

### 2.9 Exportable a bundle estático (sin backend)
La **misma** definición —sin reescribir nada— se exporta como **SPA estática** (`index.html` +
`manifest.json` + assets) que se sirve desde un **CDN sin ningún backend**. Los datos, cuando hacen
falta, vienen de REST externo resuelto **en el cliente** (catálogo de REST sources), o la pantalla es
puramente estática. Un mismo modelo → backend-driven **o** estático, según convenga a cada UI.

Ángulos para Riu (grupo hotelero global):
- **Coste y operación:** hosting estático es barato, sin servidores que arrancar, parchear o escalar.
- **Escala y edge:** un CDN sirve global por definición — relevante para presencia internacional.
- **Seguridad:** superficie de ataque de servidor **cero** para esas UIs (nada que explotar detrás).
- **Resiliencia:** no hay backend que se caiga; la UI sigue servida.
- **Re-apuntar entornos sin rebuild:** el catálogo de endpoints viaja en `manifest.json` y queda fuera
  del `structureHash`, así que se re-apunta un bundle a otro entorno **editando datos, no
  recompilando**.

Refuerza la tesis "una definición, muchos destinos": no es otra base de código, es el **mismo modelo**
exportado. **[EVIDENCIA: demo-starwars-6-static-bundle (Ex6), `mvn -Pbundle package`, verificado sin
backend.]**

*Honestidad:* el modo estático **no tiene** comportamiento de servidor — nada de secretos/proxy
server-side (una API key no puede esconderse en un bundle), y depende de que las APIs externas sean
consumibles desde el cliente (CORS / ref-native). Es ideal para UIs de lectura, catálogos, portales y
front sobre APIs públicas/externas; para lógica sensible en servidor, el modo backend-driven.

### 2.10 Integración con REST externo + catálogo de sources
El complemento natural de §2.2: **la API que Riu ya publicó no se pierde — se consume.** Mateu se
integra con endpoints REST externos de forma **declarativa** — las opciones de un campo, las filas de
un listado o el destino de una acción pueden venir de una API existente (PMS, motor de reservas,
servicios de terceros, sistemas legacy) sin construir un BFF que haga de intermediario.

El **catálogo de REST sources** (`sources.yaml` / `@RestSource`) declara un endpoint **una vez** y
cualquier pantalla lo referencia por nombre (`source: "reservas"`) en vez de repetir la URL:
- **Un solo sitio** para base url, auth, mapeo de campos, paginación y proxy/secretos del endpoint.
- **Re-apuntar entornos** (dev/stage/prod) editando el catálogo, no las pantallas ni recompilando —
  el catálogo queda fuera del `structureHash`, así que re-apuntar no cambia la "identidad" del build.
- **Proxy server-side para secretos:** una API key vive en el servidor (`${secret.KEY}`), nunca viaja
  al navegador.
- Funciona también en **bundle estático** (resolución en cliente por `ref`).

Y el bucle se cierra al revés: cuando Riu **debe** publicar una API (producto B2B, terceros), Mateu la
**deriva del modelo** (`mateu-bundle:openapi` → contrato; `mateu-bundle:server` → esqueleto). Es decir,
Mateu tanto **consume** APIs existentes como **genera** el contrato de las que sí hacen falta.
**[EVIDENCIA: sources.yaml/RestSourceRegistry, demo-starwars contra swapi externo,
rest-source-catalogue.md, mateu-bundle:openapi].**

*Honestidad:* el source hace **selección, no transformación** — dice *dónde* está cada valor
(`itemsPath`, `valuePath`, `fields` name→path…), no cómo transformarlo. No cubre respuestas no-JSON,
formateo/unidades, ni aritmética de paginación por offset. Cuando la API es tuya, lo barato es que el
endpoint sirva la forma que la pantalla necesita; para APIs ajenas complejas, puede hacer falta una
capa fina de adaptación. Documentado en `rest-source-catalogue.md` ("Why it stops there").

### 2.11 Visual builder: definir la UI visualmente (on-ramp low-code)
Como definir la UI es *declarar datos* (§2.1), se puede hacer **visualmente**. El visual builder es el
on-ramp de bajo código: se compone la UI arrastrando y configurando componentes, y el builder **emite
la definición como dato** (App/Routes/Screens/Templates/grid/triggers→actions) — **nadie escribe el
formato a mano**. Es multi-IDE: navegador, IntelliJ (JCEF) y VS Code.

Por qué importa para Riu:
- **Baja la barrera de entrada** — perfiles no-frontend (analistas, product) pueden *definir* pantallas
  sin aprender un framework de UI. Es la respuesta directa al "nuestros devs saben React" (§5.6).
- **La salida es el mismo activo portable** — el builder produce la definición declarativa (§2.3), no
  un artefacto atrapado en una herramienta. Contraste con low-code propietario, donde lo que dibujas
  queda preso de su plataforma. Aquí puedes empezar visual y seguir en código, o al revés.

**⚠️ Honestidad — estado PREVIEW (no GA):** el visual builder está etiquetado como *tooling preview* en
`ga-plan.md`/`parity.md` y **no forma parte de la promesa GA v3**. Se rediseñó recientemente (barra pro
+ reference pickers project-aware) y es la dirección de producto (Idea #12: convertirlo en el on-ramp
primario), pero **no** hay que presentarlo al comité como maduro. Framing correcto: "el modelo
declarativo *habilita* autoría visual; el builder existe y avanza, pero la promesa GA es la autoría en
código + datos (YAML)". Prometerlo como GA sería el tipo de exageración que hunde una defensa.
**[EVIDENCIA: apps/visual-editor, intellij-plugin visualeditor, Idea #12 en coherence-plan.md —
marcado preview].**

### 2.12 Seguridad y permisos por rol, integrados (y aplicados en servidor)
La autorización es **declarativa y parte del modelo**, no un añadido por pantalla. Sobre la identidad
del usuario (roles / grupos / scopes / permisos, resueltos del **token JWT Bearer**) se controla, por
declaración, la visibilidad y el estado de cada elemento:
- **Ocultar** — `@EyesOnly` en un campo, columna o **opción de menú** (no se ve si no autorizado).
- **Solo lectura** — `@ReadOnlyUnless(...)` en campo o vista.
- **Deshabilitar** — `@DisabledUnless(...)` en campo o botón/acción.
- **Componen** — p.ej. oculto a no-staff, solo-lectura a staff, editable a managers.

**El punto que lo hace serio (no security theater):** el permiso se aplica **también en el servidor**,
no solo ocultando en el cliente. Una UI hecha a mano suele esconder el botón en el front y dejar el
endpoint abierto; aquí, al ser la UI un adaptador del mismo backend (§2.2), la comprobación vive donde
tiene que vivir y los parámetros "fijados" se **re-aplican en servidor**, no se confían del cliente.
Least-privilege por declaración, coherente en todas las pantallas por venir del generador (§2.7).

Encaje corporativo: RBAC integrado con vuestro **IdP/OAuth/JWT** existente; menos superficie que
auditar porque no hay una API-para-la-UI aparte que asegurar por separado (§2.2).
**[EVIDENCIA: Authorizer + @EyesOnly/@ReadOnlyUnless/@DisabledUnless, demo security/FieldAccessDemo].**

*Honestidad:* Mateu **consume** identidad, no es un IdP — traes tu proveedor de identidad
(OAuth/OIDC/JWT). Cubre autorización a nivel de UI/campo/acción y el enforcement server-side del camino
Mateu; la política de seguridad del resto del dominio sigue siendo del backend. *[PENDIENTE: encaje con
el IdP/SSO concreto de Riu.]*

### 2.13 Multidispositivo real: web y nativo (una definición, todos los canales)
El complemento de alcance de §2.3: la **misma** definición se renderiza hoy en, a la vez:
- **Web** — **vaadin-lit** y **VB/Redwood**.
- **Nativo móvil** — **React Native** (iOS y Android), no una webview envuelta: app nativa real.
- **Nativo escritorio** — **IntelliJ** (tool windows / editor tabs / docking).
- **Estático** — bundle a CDN sin backend (§2.9).

Todos hablan el **mismo `/mateu/v3/sync`**, así que back-office web, app móvil de personal y herramienta
de escritorio se sirven de **una sola definición** — sin cuatro equipos, cuatro bases de código y
cuatro derivas. Para Riu (personal de hotel en móvil, back-office en web, herramientas internas) esto
es cobertura multicanal sin multiplicar el coste. **[EVIDENCIA: frontend/app/react-native,
frontend/app/intellij-plugin; los cuatro en la promesa GA de `ga-plan.md`].**

*Honestidad:* web (Vaadin) va cubierto por la e2e compartida; los nativos (RN, IntelliJ) están en la
promesa GA y **verificados por compilación + lógica pura + sondas**, con el probe e2e vivo declarado
post-GA (más pesado/dependiente de entorno). Es una verificación algo más ligera que la de web, y así
está documentado — no lo presentes como idéntico nivel de test que Vaadin.

### 2.14 IA en el desarrollo: acotada y bajo control (no perder el control del proyecto)
Distinto de §2.4 (IA-native en *runtime*): este pilar es sobre la IA en el **proceso de desarrollo** —
y es un argumento de **gobernanza**, no de productividad.

**La premisa que el comité ya sabe:** la IA escribiendo código es una realidad ineludible. La pregunta
para Riu no es *si* la IA escribe código, sino **cómo no perder el control** cuando lo hace. Dos modelos
opuestos:

- **IA + React/Angular a mano:** la IA genera **volúmenes ingentes de código imperativo**. Cuanto más
  genera, menos entiende/revisa/controla el equipo → superficie ilimitada, deriva de estilo, deuda de
  seguridad y mantenimiento. **El volumen mismo es el pasivo.**
- **IA + Mateu:** la IA solo necesita conocer el **DSL de Mateu** (superficie finita y documentada) y
  produce una **definición declarativa pequeña**, no miles de líneas. Ese artefacto es:
  - **Revisable** — un humano lee una definición de 30 líneas, no 3.000 de componentes generados.
  - **Validable contra schema** — Mateu publica JSON Schemas (`uidl`/`routes`/`sources`/`specs`), así que
    la salida de la IA se puede **verificar mecánicamente** contra un contrato. Un `AI-genera-React` no
    tiene ese contrato. **[EVIDENCIA: uidl-schema.json, routes-schema.json, sources-schema.json,
    specs-schema.json — generados de los records y pinneados por test].**
  - **Consistente y seguro por construcción** — la complejidad vive UNA vez en el framework (probado,
    controlado); la IA no la reintroduce mal por pantalla; a11y/i18n/RBAC vienen del generador (§2.7/
    §2.12), no de código que la IA adivina.
  - **Superficie de alucinación acotada** — un DSL finito, en vez del ecosistema React infinito y en
    constante cambio → menos alucinación, más fácil de restringir y validar.

**El encuadre:** **Mateu es el plano de control de la IA en el desarrollo.** No prohíbes la IA (imposible)
ni la dejas suelta (peligroso): la **acotas al DSL**. Riu adopta la IA **sin perder el control del
proyecto**.

**Prueba viviente (dogfooding):** el propio Mateu lleva tiempo desarrollándose **sin una sola línea
escrita a mano por el mantenedor** — la escribe la IA bajo su dirección arquitectónica. Es evidencia de
que el desarrollo asistido por IA a escala es real *y* de que el autor de Mateu conoce de primera mano
sus modos de fallo. *Honestidad:* el framework de Mateu es código convencional (no DSL); el dogfooding
prueba que la IA-dev funciona bajo dirección, y el **acotamiento por DSL** es el valor en la capa de
**aplicación** de Riu (donde se escriben definiciones, no frontend a mano).

**Reframe del eje A6 de la matriz (§6.3):** "AI-native" mezcla dos cosas — (a) madurez de autoría
*prompt-to-app* (donde Mateu es 🟡 hoy, honestamente) y (b) **IA-en-desarrollo controlable** (donde Mateu
lidera y el modelo `React+codegen` es el anti-patrón). Para Riu, (b) pesa más: es una decisión de
gobernanza. El argumento afilado contra "¿y por qué no dejamos que la IA escriba React directamente?" es
exactamente este: porque eso es **perder el control**; Mateu lo conserva.

**Consecuencia sobre "no tiene comunidad" (§5.3 / GAP‑3):** la misma propiedad —framework acotado,
open-source y AI-legible— hace que **la IA sustituya el moat de una comunidad**: construye lo que falte
sobre el DSL, se autosoporta, y puede mantener/evolucionar el propio Mateu. La objeción de bus factor
deja de ser un bloqueante: **con IA se lleva donde se quiera, sin necesidad de comunidad detrás** (queda
solo un residuo organizativo, cubierto por escrow + ≥2 personas).

### 2.15 Plano de operabilidad por agentes (el wire también se opera, no solo se pinta)
Corolario arquitectónico de que la UI es dato autodescriptivo. El mismo `UIIncrementDto` que un renderer
convierte en píxeles —árbol de componentes, campos con tipo/validación, acciones disponibles, comandos
(`navigateTo`/`dispatchEvent`)— es **todo lo que un agente necesita para *operar* la aplicación**. La AR
de Riu se defiende entonces como **dos planos sobre un mismo contrato** (el wire, ya spec pública
versionada, §4/R2):

1. **Plano de definición/render** — Mateu: define y pinta (multi-DS, multidispositivo).
2. **Plano de operabilidad por agentes** — un **MCP** (Model Context Protocol) expone cada app Mateu como
   *herramientas autodescriptivas* que cualquier agente (Claude, Antigravity, un copiloto interno)
   descubre y ejecuta; y el **chat in-app**, que ya conducía la UI devolviendo los comandos que el
   frontend aplica, ahora manda con cada mensaje **la MISMA proyección** (campos con tipo/valor + acciones
   de la pantalla) — *una proyección, dos consumidores*: el agente externo por MCP y el asistente embebido.

**El encuadre:** un MCP es **"un renderer de agente"** — mismo modelo autodescriptivo, *tools* en vez de
píxeles. Que este plano sea "aparte de Mateu" es el argumento fuerte: no depende de que Mateu embeba IA,
depende de que **el protocolo se autodescribe**. Es propiedad arquitectónica, no feature — y por eso no
caduca.

**Dos hosts, un solo núcleo (no cuesta el doble):** lo valioso es la *proyección* (`UIIncrementDto` →
tool-schemas + estado; tool-call → sync), **especificable una vez** e implementable por host — el mismo
patrón *core + adaptadores* de los 5 frameworks. (a) Un **sidecar** (dependency-light) apunta a cualquier
backend Mateu por el wire → sirve Java/.NET/Python sin tocar backend; es la demo rápida. (b) Un **endpoint
MCP nativo** hace que *cada app corporativa sea operable por agentes sin nada extra*, reutilizando
`MateuService` y aplicando **RBAC nativo** (JWT + `@EyesOnly`/`@ReadOnlyUnless`), no un camino más débil
que "ocultar en UI".

**Honestidad (no sobrevender — coherente con A6=🟡):** son dos cosas distintas y solo una es sólida hoy.
La **operabilidad en runtime** (un agente describe y ejecuta una app viva, con RBAC aplicado en servidor)
es **real y demostrable** → es la mitad de A6 que sube sobre terreno firme. El **prompt-to-app** (autoría
al vuelo emitiendo UIDL) sigue **🟡 / dirección de producto**, pero ya **no es solo una promesa**: hay un
**spike ejecutable** que prueba el mecanismo diferencial —la salida del LLM se **valida mecánicamente
contra el schema publicado** con bucle de reparación (justo lo de §2.14: la IA emite *dato pequeño y
verificable contra contrato*, no React ilegible)—. La defensa las presenta separadas: runtime como hecho,
prompt-to-app como dirección con prueba de concepto.

**Por qué le importa a Riu:** convierte todo el catálogo de UIs corporativas en superficie operable por
los agentes que Riu ya va a adoptar (§2.14), con **permisos aplicados en servidor** — automatización de
procesos internos sin construir una API-para-agentes por cada app. Plan de ejecución:
`design/riu-agent-operability-plan.md`.

**[EVIDENCIA — IMPLEMENTADO Y VERIFICADO (2026-09-20, v3.0-alpha.350–354):**
- **Sidecar** `frontend/mcp-server/` (Node, cero-dep): 14 tests unit + sonda e2e `e2e/mcp-probe.mjs`
  **7/7 contra un backend vivo** (describe/run reales).
- **Endpoint MCP nativo** en los **tres** backends — Java (`mvc` `POST /mateu/mcp`, 12 tests + e2e vivo),
  Python (FastAPI, 12 tests) y .NET (ASP.NET, 11 tests + **suite 398/398**) — con **RBAC probado** (un
  campo `@EyesOnly` no llega al agente no autorizado). Una sola proyección; spec normativa en
  `reference/wire-specification.md` (§ Agent operability).
- **Chat in-app** (P5): la misma proyección de pantalla como contexto — 10 tests (proyección + DOM/shadow),
  suite `libs/mateu` **486/486**.
- **Prompt-to-app** (P6, spike/beta): prompt→validar-contra-schema-publicado→reparar — 8 tests (los **5
  schemas publicados compilan**, la reparación recupera). `frontend/prompt-to-app/`. **Verificado también
  EN VIVO con un LLM real** (el agente de `ec-demo1` como backend, `live-ecdemo-probe.mjs`): "crea un
  routes con dos pantallas" → el LLM **escribió** `{type:Routes, routes:[bookings, customers]}` **válido
  contra el schema publicado al primer intento** (autoría de UIDL, no operación). Sigue 🟡/beta.
- **E2E EN VIVO CON LLM REAL — las DOS mitades de A6:** contra el entorno desplegado `ec-demo1`
  (`ec1.mateu.io`, agente Spring AI + Anthropic que consume MCP), con el usuario demo:
  - **Operabilidad (runtime):** prompt de lectura → **uso real de tokens** (8007/130) + comando
    `navigation-requested → /booking/bookings` (**el LLM condujo la UI**) + **47 reservas reales leídas por
    MCP**; y un e2e de ESCRITURA autorizado → creó la reserva `6R343R` y la canceló (`changeBookingStatus`;
    el dominio hace soft-delete, sin borrado físico). Cierra el residuo "IA conduce/opera la UI".
  - **Autoría (prompt-to-app):** el mismo LLM **escribió un UIDL válido** contra el schema (arriba).
  El mismo mecanismo que este plano hace NATIVO a cualquier app Mateu (`ec-demo1` lo cableaba a mano con un
  módulo `api-mcp`; aquí es `/mateu/mcp` de serie + la proyección de pantalla en el chat).**]**

---

## 3. Mateu como implementación de los principios

Distinción estratégica: **Riu adopta los principios; Mateu es su mejor implementación hoy.** Esto
desacopla la decisión de la herramienta y hace la defensa más robusta.

Qué es Mateu (una línea): declaras el modelo una vez —como código (Java/C#/Python: `@UI`) o como dato
(YAML)— y Mateu genera formularios, CRUDs, navegación, wizards y shells de app para web y nativo, sin
escribir frontend.

**El mapeo 1:1 con lo que a ti te importa** *(la distancia tesis→producto es casi cero)*:

| Lo que quieres definir | Cómo lo declara Mateu | Evidencia |
|---|---|---|
| Menú con estas opciones | `@Menu`, `routes.yaml`, `@App` | **[EVIDENCIA]** |
| CRUD sobre un modelo | `AutoCrud<T>` / capability listings | **[EVIDENCIA]** |
| Estos filtros | filtros tipados (dateRange, multiSelect…) | **[EVIDENCIA]** |
| Estas columnas | inferidas + `@ColumnWidth`, agregados, grouping | **[EVIDENCIA]** |
| Reglas / validación | Bean Validation, `@ReadOnlyUnless`… | **[EVIDENCIA]** |
| Flujos / wizards | `Wizard`, flow language (Step) | **[EVIDENCIA]** |

---

## 4. Por qué encaja en Riu (fit específico)

- **Stack.** Sea cual sea el de Riu (Java/Spring, .NET, Python), Mateu lo cubre — no fuerza migración
  de backend (§2.8). *[PENDIENTE: confirmar el mix real de Riu para afinar el mensaje.]*
- **Arquitectura.** Si Riu ya piensa en hexagonal/casos de uso, la UI-como-adaptador encaja sin
  fricción conceptual (§2.2).
- **Dominio hotelero.** Media base de demos ya es hotelera. **[EVIDENCIA: demo-front-office,
  demo-admin-panel check-in/folios/cardex, serie Star Wars].**
- **Multi-canal / futuro.** Una definición → web + nativo + estático; nuevos dispositivos/DS sin
  reescritura (§2.3); IA-native (§2.4).
- **Organización multi-equipo.** UIs distribuidas nativas (§2.5).
- **Corporativo de serie.** A11y + i18n de serie con cumplimiento legal UE (§2.7); además
  seguridad/permisos (`@EyesOnly`, `@ReadOnlyUnless`, `@DisabledUnless`) y resiliencia de red de
  fábrica. **[EVIDENCIA]**

---

## 5. Objeciones y respuestas honestas (la sección que gana o pierde la defensa)

### 5.1 "¿Y el 20% que no es CRUD estándar? ¿caemos por un precipicio?"
- **Respuesta:** escape hatches explícitos y *relegados* — componentes custom, `ComponentAdapter`,
  custom por renderer, `run-js`. Inferido por defecto, explícito como override; la escape hatch nunca
  es el coste de entrada. **[EVIDENCIA + estado real: el coherence plan pule esto].**
- *Honestidad:* dónde está el límite real hoy. *[PENDIENTE: acotar]*

### 5.2 "Es alpha / inmaduro / no probado en producción"
- **Respuesta:** es la **GA de la v3, no de la v1**. Años en producción a lo largo de varias versiones
  mayores: **Quotravel** (íntegramente sobre Mateu) y luego **Wefox** (portal de brokers). El número
  de versión es iteración acumulada, no inmadurez. *Honestidad:* la GA v3 formaliza wire + semver +
  multi-backend/renderer; las apps previas usaban el motor anterior. **[EVIDENCIA + PENDIENTE:
  métricas — nº pantallas, usuarios, tiempo en prod].**

### 5.3 "Es un proyecto de una persona / sin comunidad — riesgo de continuidad / bus factor"
- **Respuesta estructural:** la definición es **dato tuyo**, no código atado a un framework; si Mateu
  no estuviera, sobrevive y puede renderizarse por otro motor (§2.3). Open source, paridad
  multi-backend, docs, tests, corpus de conformidad.
- **Respuesta por la IA (§2.14) — el moat de la comunidad se colapsa:** el valor de una gran comunidad
  era *librería-para-todo*, *soporte*, *hiring* y *continuidad*. Con la IA acotada al DSL: la IA
  **construye lo que falte** bajo demanda, **es el soporte** (lee/entiende el código), no necesitas
  gente que "sepa Mateu" (basta dirigir a la IA sobre un DSL pequeño), y el framework —open-source y
  **AI-legible**— lo puede **mantener/evolucionar un equipo+IA** (el propio Mateu se desarrolla así,
  §2.14). La respuesta deja de ser "aceptamos el riesgo" y pasa a **"con IA lo llevamos donde queramos,
  como queramos, sin necesidad de comunidad detrás"**.
- *Residuo honesto:* queda un riesgo **organizativo/accountability** (no técnico) — un comité de
  compras querrá una persona/entidad responsable. Se cubre con el **paquete de gobernanza** documentado
  en `doc/.../mateu-about/governance-and-continuity.md` (R3): open-source + fork-readiness, definición
  portable, **≥2 personas que sepan *juzgar* el core** + sign-off humano, guía de arquitectura/
  invariantes, **charter de soporte/propiedad** (SLA comercial o carta interna), y auditoría de
  seguridad externa periódica. *[PENDIENTE de decisión Riu/mantenedor: quiénes son los ≥2 stewards, el
  modelo de soporte, y quién financia la auditoría.]*

### 5.4 "Lock-in / no es estándar de mercado (React/Angular)"
- **Respuesta:** el lock-in real está en el **código imperativo**; una definición declarativa es
  portable por construcción (§2.3). Salida = exportar el modelo / otro motor. Con React/Angular el
  lock-in incluye **la API-para-la-UI** que aquí ni existe. Y a diferencia de low-code
  (OutSystems/Mendix), Mateu es **open source**: sin runtime propietario ni licencia (§2.6).

### 5.5 "Control de diseño / branding corporativo — ¿todo se ve como Vaadin?"
- **Respuesta:** el aspecto vive en el renderer/tema, no en la definición (§2.3). No es teoría: **Wefox
  corrió sobre Mateu con su propio design system corporativo** — *bring your own design system* probado
  en producción. Riu puede tener el suyo igual. **[EVIDENCIA: Wefox broker portal con DS propio].**
- *Honestidad:* lo que se acota es el **coste** de traer un DS nuevo (construir/mantener un renderer o
  tema), no la posibilidad. *[PENDIENTE: dimensionar ese esfuerzo con la experiencia Wefox].*

### 5.6 "Productividad / encaje del equipo — nuestros devs saben React"
- **Respuesta:** el on-ramp es *definir*, no aprender un framework de UI; el visual builder baja aún
  más la barrera. El front deja de mantener la API-para-la-UI. *[PENDIENTE: datos de curva/velocidad —
  p.ej. Quotravel/Wefox].*

### 5.7 "La IA generando UI al vuelo suena a riesgo / descontrol"
- **Respuesta:** precisamente por ser declarativa, la UI que el LLM produce o manipula está **acotada
  al modelo** (componentes válidos, acciones permitidas, permisos del hexágono) — no ejecuta código
  arbitrario. El sustrato declarativo es lo que hace la IA *gobernable*. *[PENDIENTE: acotar controles
  reales hoy].*

*[PENDIENTE: otras objeciones — proveedor, seguridad, compliance, rendimiento a escala…]*

---

## 6. Alternativas consideradas (la comparativa del ADR)

> Elegir Mateu **es** una decisión de arquitectura (ADR). Como tal, exige evaluar alternativas contra
> criterios explícitos, con honestidad. Esta sección hace doble trabajo: **justifica la elección** y
> **caza gaps** — si un competidor cubre algo que Mateu no, estamos a tiempo de incorporarlo o de
> descartarlo conscientemente (§6.5).
>
> **[VERIFICAR]** — los *features concretos* de cada producto evolucionan rápido; hay que confirmar los
> datos marcados con búsqueda actualizada antes de la defensa. El posicionamiento *arquitectónico*
> (paradigma, dónde vive el lock-in) es estable.

### 6.1 Método y ejes de comparación
Ejes derivados de los pilares (§2) + criterios ADR estándar:
paradigma · ¿hay que publicar API-para-la-UI? · definición portable como dato · multi-backend ·
multidispositivo (web + nativo + estático) · IA-native · open source / licencia / lock-in · a11y+i18n
de serie · seguridad/RBAC integrada · on-ramp visual · federación · **madurez/ecosistema/comunidad
/hiring** · control de diseño (pixel-perfect) · TCO.

### 6.2 Los contendientes (por categoría — no todos compiten en lo mismo)
- **A. SPA a mano + design system + BFF** — React/Angular/Vue con MUI/Ant/propio. El estándar de
  mercado.
- **B. Generadores CRUD/admin open source** — React-Admin, Refine, Directus, Django Admin,
  ActiveAdmin. Cercanos en "genera CRUD", lejos en alcance.
- **C. Low-code de herramientas internas** — Retool, Appsmith, ToolJet, Budibase. Visual, orientado a
  internal tools sobre BBDD/APIs.
- **D. Low-code empresarial** — OutSystems, Mendix, Power Apps. La comparación "plataforma" clásica.
- **E. Server-Driven UI (origen móvil)** — Airbnb GP, DivKit, patrones SDUI caseros. Comparten la idea
  "UI como dato desde servidor".
- **F. UI Java backend-driven** — Vaadin Flow, Hilla, JHipster (generador), Backstage (portal). El
  vecindario técnico más cercano.

### 6.3 Matriz comparativa (VERIFICADA con búsqueda web — barrido multi-agente 2026-09-19)
Leyenda: ✅ sí/de serie · 🟡 parcial/con esfuerzo · ❌ no. Categorías: **A** SPA+DS+BFF · **B** admin OSS ·
**C** low-code interno · **D** low-code empresa · **E** SDUI · **F** Vaadin/Hilla/JHipster.
Ratings por categoría = qué tan bien lo hace *esa* categoría (independiente de Mateu). **Mateu se puntúa
honestamente — NO es ✅ en todo.**

| Criterio | A | B | C | D | E | F | **Mateu** |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| A1 Definir-el-modelo-una-vez (no picar UI) | ❌ | 🟡 | 🟡 | ✅ | 🟡 | 🟡 | ✅ |
| A2 Sin BFF / API-para-la-UI | ❌ | 🟡 | ✅ | ✅ | 🟡 | ✅ | ✅ |
| A3 Definición portable como dato, propiedad del cliente | 🟡 | 🟡 | 🟡 | ❌ | ✅ | ❌ | ✅ |
| A4 Una UI sobre Java **y** .NET **y** Python | 🟡 | 🟡 | 🟡 | ❌ | 🟡 | ❌ | ✅ |
| A5 Web + nativo + bundle estático desde una def | 🟡 | ❌ | 🟡 | 🟡 | 🟡 | ❌ | ✅ |
| A6 IA-native (un LLM emite/conduce la UI) | ✅ | 🟡 | ✅ | ✅ | 🟡 | 🟡 | 🟡 |
| A7 Open source / sin licencia | ✅ | 🟡 | 🟡 | ❌ | 🟡 | 🟡 | ✅ |
| A8 Sin lock-in de runtime propietario | ✅ | 🟡 | 🟡 | ❌ | 🟡 | 🟡 | ✅ |
| A9 A11y + i18n de serie | 🟡 | 🟡 | 🟡 | ✅ | ❌ | ✅ | ✅ |
| A10 RBAC aplicado en servidor | 🟡 | 🟡 | ✅ | ✅ | ❌ | ✅ | ✅ |
| A11 Visual builder GA | 🟡 | 🟡 | ✅ | ✅ | 🟡 | 🟡 | 🟡 |
| A12 Federación de UI (build + runtime) | ✅ | 🟡 | ❌ | 🟡 | 🟡 | 🟡 | ✅ |
| A13 Ecosistema / comunidad / hiring | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | ❌ |
| A14 Control de diseño / pixel-perfect | ✅ | 🟡 | 🟡 | 🟡 | ✅ | 🟡 | 🟡 |
| A15 TCO bajo (labor + licencia + mantenimiento) | ❌ | 🟡 | 🟡 | ❌ | ❌ | 🟡 | ✅ |

**Veredicto (verificado):** ningún contendiente cruza *toda* la fila. Mateu es el más fuerte en los ejes
por los que una empresa políglota **paga durante una década** (A1–A5, A7–A10, A12, A15) y es **el único
✅ en A4** (una UI sobre backend políglota arbitrario — confirmado adversarialmente: ninguna plataforma
low-code puede). Sus **tres puntos débiles honestos**, que el comité sondeará, están rebajados a
propósito: **A13 ecosistema/hiring (su peor eje, ❌)**, **A11 visual builder (preview, 🟡)** y **A14
pixel-perfect (🟡)**. En **A6 (IA) Mateu es 🟡, no ✅**: es AI-native *arquitectónicamente* (la UI es dato
que un LLM emite/conduce), pero **no** tiene aún una superficie de autoría prompt-to-app productizada
como v0/Copilot/Mentor — no hay que sobrevenderlo. **Matiz (§2.15):** A6 mezcla dos mitades — la de
**operabilidad en runtime** (un agente describe/ejecuta la app viva vía MCP, con RBAC en servidor) ya no
es solo demostrable: está **implementada y enviada** (sidecar + endpoint nativo en Java/Python/.NET +
chat in-app, v3.0-alpha.350–354) — es el "plano de operabilidad por agentes", elemento de la AR; la de
**autoría prompt-to-app** sigue 🟡 pero con **spike ejecutable** (valida contra el schema publicado +
repara). Por eso A6 se mantiene 🟡 de conjunto: una mitad enviada, la otra con prueba de concepto, no las
dos productizadas.

**Nota de método/honestidad:** matriz de la fase de *research* (6 agentes con búsqueda web + fuentes).
La fase de *verificación adversaria* cayó parcialmente por rate-limiting; los 2 verificadores que sí
corrieron confirmaron A4 (diferenciador real) y corrigieron a la baja la "madurez de IA GA" de la
categoría D (mayormente early-access). Antes de la defensa conviene re-correr la verificación completa.

### 6.3.1 Correcciones que la verificación hizo a la primera pasada (honestidad)
- **A6 IA de Mateu: bajado de ✅ a 🟡** — AI-native arquitectónico, pero sin autoría prompt-to-app
  productizada. No sobrevender.
- **A2 sin-BFF NO es posesión exclusiva** — el low-code (C) también conecta directo a BBDD/APIs para
  CRUD simple; el filo de Mateu es más fino: *sin-BFF **Y** la UI es adaptador del MISMO backend* (§2.2).
- **A4 matizado** — un SPA (A) "habla con cualquier backend", pero cubrir Java+.NET+Python de verdad
  significa N BFFs escritos a mano y sincronizados → la ventaja de Mateu (A2+A4) es real; A-A4 es 🟡 en
  sustancia pese al ✅ de superficie. OutSystems **genera** .NET/Java, pero ata la UI a SU runtime.
- **A10 RBAC** — React-Admin/Refine (B) y SPAs (A) *ocultan en la UI* pero la API se asegura aparte
  (🟡); Django/ActiveAdmin, low-code, Vaadin/Hilla y Mateu aplican en servidor.
- **Directus (B) NO es "gratis/open" a escala Riu** — licencia source-available (BSL/MSCL), gratis solo
  bajo ~5M$ ingresos y ~50 empleados → baja en TCO y sube en lock-in.
- **IA de la categoría D sobrevendida** — OutSystems Agentic Systems Engineering = early-access (Q2
  2026), builder NL de Power Apps = preview; solo los asistentes base (Mentor/Maia/Copilot) son GA.

### 6.4 Dónde gana cada categoría (y por qué no basta)
- **A (React/Angular):** máxima libertad y control de diseño, ecosistema enorme, gente hireable. Pero
  es el **anti-patrón caro** (§2.1): construyes todo a mano, mantienes la API-para-la-UI, y el lock-in
  vive en el código imperativo. Gana en madurez de mercado; pierde en coste y en la tesis.
- **B (admin OSS):** buenos en CRUD sobre un backend, open source. Pero atados a su stack (JS/Python),
  sin nativo real, sin la abstracción "definición portable" ni multi-backend.
- **C (Retool/Appsmith):** visual builder maduro y rápido para internal tools. Pero **lock-in de
  plataforma**, la app vive en su runtime/cloud, definición no portable, y el modelo no es tuyo.
- **D (OutSystems/Mendix):** potentes, gobernanza empresarial, RBAC. Pero **licencia cara que escala
  con el éxito** + **jaula de runtime propietario** — justo lo que §2.6 ataca.
- **E (SDUI):** comparten "UI como dato desde servidor", pero son patrones/librerías puntuales
  (sobre todo móvil), no un sistema completo con CRUD/forms/wizards/inferencia/federación de serie.
- **F (Vaadin/Hilla):** el vecino más cercano (backend-driven, sin BFF en Flow). Pero **Java-only**,
  UI como **código** (no dato portable), sin nativo móvil ni exportación estática, y Mateu de hecho
  **renderiza sobre Vaadin** — Mateu es una capa de abstracción *por encima*, no un competidor frontal.

### 6.5 Gaps de Mateu (VERIFICADO — barrido multi-agente + repo, 2026-09-19)
Lo más valioso del ejercicio: dónde Mateu podría estar por detrás, con decisión para cada uno
(**incorporar-antes-de-GA / documentar-como-límite / investigar / descartar**). El **plan de cierre**
vive en `design/riu-gap-closure-plan.md`.

| # | Gap | Quién lo hace mejor | Sev. | Decisión |
|---|---|---|:-:|---|
| GAP‑1 | **Fidelidad de diseño pixel-perfect / micro-interacción a medida** más allá del vocabulario del renderer | React+CSS (A), React-Admin/Refine headless (B), SDUI (E) | **Alta** | **Incorporar antes de GA**: endurecer y **documentar** el camino design-tokens + custom-DS + escape hatches, y **demostrarlo contra la marca real de Riu**. Hay base (ComponentAdapter, BYODS de Wefox) pero el wire acota lo expresable. Es la crítica más creíble de un comité *design-led*. |
| GAP‑2 | **Visual builder GA** (autoría first-class para citizen devs + handoff diseñador) | Retool/Appsmith (C), Directus (B), OutSystems/Mendix/Power Apps (D), Vaadin Copilot (F) | ~~Alta~~ **Media** (verificado V2) | **NO bloquear GA — beta declarada** (§7.3): la madurez del gap se sostiene, pero el mercado se aleja del drag-drop hacia autoría IA/NL (donde Mateu compite: código+YAML+DSL-por-IA). Condiciones: cerrar handoff Figma + carril citizen-dev gobernado. |
| GAP‑3 | **Ecosistema / comunidad / hiring / continuidad de mantenedor** | todos (A,B,C,D,F) | ~~Alta~~ **Media** (rebajada por la IA) | **Reencuadrar, no solo documentar.** El eje sigue siendo ❌ como *hecho* (pool minúsculo, ~1 mantenedor), pero **la IA colapsa por qué importa una comunidad**: (a) *librería-para-todo* → la IA construye lo que falte sobre el DSL, bajo demanda, sin esperar a un tercero; (b) *soporte/foros* → la IA es el soporte (lee/entiende el código); (c) *hiring* → no necesitas gente que "sepa Mateu", basta un dev que dirija a la IA sobre un DSL pequeño; (d) *continuidad* → el framework es open-source, acotado y **AI-legible**, así que un equipo+IA puede mantenerlo/evolucionarlo (el dogfooding §2.14 lo prueba). La respuesta deja de ser "es un riesgo que aceptamos" y pasa a "**con IA lo llevamos donde queramos sin necesidad de comunidad detrás**". *Residuo honesto:* queda un riesgo **organizativo/accountability** (no técnico) → se cubre con gobernanza + escrow + ≥2 personas que dirijan la IA (§5.3). |
| GAP‑4 | **Autoría IA productizada** (prompt-to-app en IDE + superficie MCP/agente que respeta RBAC) | v0/Copilot (A), Retool/ToolJet AI (C), Mentor/Maia/Copilot (D), Directus MCP (B) | Media | **HECHO la mitad runtime (§2.15) + spike la mitad autoría.** Elevado a *elemento de la AR*: la **operabilidad en runtime** está **implementada y enviada** — sidecar + endpoint MCP nativo en Java/Python/.NET + chat in-app, con **RBAC heredado del servidor** (v3.0-alpha.350–354, tests + e2e vivo) → sube la mitad (a) de A6 sobre terreno firme; el **prompt-to-app** sigue dirección/beta pero con **spike ejecutable** (valida contra el schema publicado + repara). La ventaja rival es más estrecha de lo que parece (§6.3.1). Plan: `riu-agent-operability-plan.md`. |
| GAP‑5 | **Data-grid enterprise best-in-class** (pivoting, server-side row model, range selection, export Excel a gran escala) | AG-Grid Enterprise (A), Vaadin premium Grid (F) | Media | **Investigar**: los hoteleros esperan tablas operativas maduras. Mateu tiene capability listings, filtros tipados, inline edit, agregados/grouping, tree grids, server-paging — pero pivoting/range-selection no está claramente a la par. Ver si ComponentAdapter puede embeber AG-Grid donde haga falta. |
| GAP‑6 | **Offline-first nativo móvil + hardware** (cámara/GPS/NFC/barcode/sync offline/push/OTA) para workforce móvil | Retool Mobile (C), OutSystems/Mendix offline-native (D) | Media | **Documentar como límite** (VERIFICADO en repo): Mateu brilla en red lenta + offline de solo-lectura, RN captura firma/foto y va online por el sync API, pero **no** es offline-first ni OTA (`whenBack` sin usar). Para el grueso corporativo (back-office/recepción) online es aceptable; apps de campo offline-heavy → mitigación acotada (shell nativo / modo offline), no bloquea GA. |
| GAP‑7 | **Conectores/data-providers prefabricados** a backends heterogéneos existentes (no-Mateu) | Refine/React-Admin data providers (B), marketplaces de conectores (C) | Media | **Documentar como límite**: Mateu espera que el backend sea/exponga un adaptador Mateu; para sistemas hoteleros legacy puede ser más integración. Mitigado por el catálogo de sources (§2.10), rowRoute/RestDataSource y derivación de OpenAPI. Dar **recetas de adaptador**; no bloquea GA. |
| GAP‑8 | **Analítica de uso de UI integrada** | Retool, OutSystems | Baja-media | **Documentar como límite** (VERIFICADO en repo: no existe). Valorar un **hook de instrumentación post-GA** (barato, diferenciador — se resuelve una vez en el generador). `@Emits` es comunicación interna, NO observabilidad. |
| GAP‑9 | **Animación/gesto framework-native** (nivel Framer Motion) | React (A) | Baja | **Descartar** como factor de decisión: las UIs operativas corporativas (CRUD, wizards, dashboards, check-in) no necesitan motion de marketing; un set de transiciones fijo es preferible por consistencia/a11y. |
| GAP‑10 | **Scaffolding full-stack** (topología microservicios, CI, Docker/K8s desde un fichero de dominio) | JHipster JDL (F) | Baja | **Documentar como límite / fuera de alcance**: Mateu genera UI y deriva OpenAPI + esqueleto de servidor, pero no la topología de despliegue — es un sistema de UI, no un generador de apps. Riu ya tiene sus estándares de plataforma/CI. |
| GAP‑11 | **Plumbing enterprise batteries-included** (SSO/SCIM/audit-log/user-management en el runtime) | low-code (C), low-code empresa (D) | Baja | **Documentar como límite**: Mateu delega auth/SSO/deploy en la app host — para Riu es más bien *feature* (enchufa a su IdP + Spring Security), pero menos out-of-the-box. Dar **cableado de referencia**. |

**El lente-IA reordena las prioridades (§2.14):** varios gaps eran graves *bajo el supuesto de que
construir/mantener/soportar lo hace un humano o una comunidad*. Con la IA acotada al DSL, los gaps de
tipo "**pieza que falta**" — GAP‑5 (data-grid), GAP‑7 (conectores), y buena parte de GAP‑3 — se
degradan: **la IA construye lo que falta sobre el DSL, bajo demanda**, sin esperar a una comunidad. No
desaparecen (hay que construirlo), pero dejan de ser "dependemos de que exista X" y pasan a "lo
generamos cuando haga falta". Lo que la IA **no** resuelve y sí sigue siendo trabajo real:
**GAP‑1** (fidelidad de diseño/marca — hay que demostrarla) y **GAP‑2** (visual builder para
citizen-devs/diseñadores que no quieren ni promptear).

**Los que mueven la aguja tras el reencuadre:** GAP‑1 y GAP‑2 (Alta, **incorporar antes de GA**).
GAP‑3 baja a Media (la IA neutraliza el moat de comunidad; queda solo el residuo organizativo).

### 6.6 Conclusión del ADR
**Veredicto verificado:** ningún contendiente **supera a Mateu manteniendo su alcance**. Los que ganan
en un eje —madurez de React (A13), visual builder de Retool (A11), pixel-perfect de SPA (A14), RBAC de
OutSystems— lo hacen renunciando a ejes que Riu necesita a 10 años vista (A2 sin-API, A3 portabilidad,
A4 multi-backend, A5 nativo+estático, A7/A8 sin-lock-in, A15 TCO).

**El lente-IA (§2.14) reordena qué gaps pesan.** El eje A13 (ecosistema/comunidad/hiring) era
históricamente decisivo porque un humano/comunidad tenía que construir, soportar y mantener todo. Con la
IA **acotada al DSL de Mateu**, ese moat se colapsa: la IA construye lo que falte, se autosoporta y puede
mantener un framework open-source AI-legible. La objeción "no tiene comunidad detrás" deja de ser un
bloqueante y pasa a "**con IA lo llevamos donde queramos, como queramos, sin necesidad de comunidad**".

Por tanto la elección de Mateu **se sostiene si** (1) se **cierran antes de GA** GAP‑1 (pixel-perfect,
demostrado contra la marca de Riu) y GAP‑2 (visual builder a beta gobernada), y (2) se **encuadra**
GAP‑3 con el argumento IA + portabilidad + gobernanza (ya no es "riesgo aceptado" sino "moat
neutralizado", con un residuo organizativo cubierto por escrow y ≥2 personas). En todo lo demás Mateu
gana por combinación.

**API que SÍ hacen falta.** Cuando una API es producto (B2B, terceros, móvil no-Mateu), Mateu la
deriva del modelo: `mateu-bundle:openapi` (contrato) + `mateu-bundle:server` (esqueleto). No se pierde
la capacidad de tener APIs — se **deja de pagar** las que solo existían para la UI.

---

## 7. Recomendación: qué traer a Mateu antes de GA (verificada adversarialmente)

> Salida del barrido competitivo + **5 refutadores adversarios** (2026-09-19) sobre las afirmaciones
> que deciden la recomendación. Cada acción lleva su veredicto verificado. Plan de ejecución en
> `design/riu-gap-closure-plan.md`.

### 7.1 Tier 1 — INCORPORAR antes de GA (lo que la IA no resuelve y el comité sí exige)

**R1 · Fidelidad de diseño / marca de Riu (GAP‑1)** — *veredicto: el gap es REAL pero su severidad
depende de la superficie; el techo es estructural/interacción, no "píxeles".* Alta para guest-facing
brand-led, **baja para operacional/back-office (el grueso de Riu)**. Acción como **retirada de riesgo,
no rebuild**:
1. **Renderer con los design tokens de Riu** (extender vaadin-lit) — pone toda pantalla generada
   on-brand de golpe. Reusar el BYODS ya probado en Wefox.
2. **Demo contra la marca REAL de Riu** (2-3 pantallas: una operacional + una deliberadamente brand-led)
   → convierte la severidad de opinión a hecho medido para Riu.
3. **Playbook de escape hatches** (custom field / web-component / ComponentAdapter / renderer) con el
   *coste* explícito de cada una.
4. **Guardrail de alcance en el ADR**: operacional → declarativo+tema; marketing/booking con motion →
   escape hatch o hand-coded. Convierte un gap Alto en riesgo acotado y aceptado.

**Estado (2026-09-19):** **HECHO** — capa de design tokens de **Riu** (`frontend/reference-renderer/
riu-theme.css`: Amaranto #D2232A + Oro #CA9C4E, mapeada a variables **Lumo** → sirve al renderer Vaadin
de producción) + **demo default⇄Riu** en el renderer de referencia (misma pantalla, con/sin marca),
**verificada en navegador** (Playwright headless: endpoint correcto `/mateu/v3/sync/_no_route`, 0
`<mateu-unsupported>`, botón `#D2232A` + borde de card `#CA9C4E`; capturas before/after en
`doc/public/images/docs/branding/`); guía
de branding `doc/.../design-systems/branding-and-design-tokens.md` con el **playbook de escape hatches**
(coste por hatch) y el **guardrail de alcance**. **PENDIENTE (necesita Riu):** la **demo contra 2-3
pantallas reales** medidas (operacional + brand-led) sobre vaadin-lit, la **webfont licenciada** y el
**logo** (trademark — slot, no vendorizar). **[EVIDENCIA: riu-theme.css, branding-and-design-tokens.md,
reference-renderer, Wefox BYODS en prod].**

**R2 · Portabilidad real = exit strategy verificable (A3 / respalda GAP‑3)** — *veredicto: se sostiene
FUERTE frente a low-code, pero frente a React es un lock-in DISTINTO (runtime/skills single-vendor), no
estrictamente menor; hoy "portable en teoría" hace parte del trabajo.* Para que sea real, no retórico:
1. **Versionar el wire** — `wireVersion`/`schemaVersion` en `UIIncrementDto` + `$id`, con política de
   compatibilidad (aditivo dentro de un major). Hoy "v3" es un path, no una versión, y los DTOs cambian
   semanalmente → sin esto, "spec documentada" es un snapshot, no un contrato.
2. **Publicar el wire como spec versionada standalone** incluyendo la **semántica de derivación**
   (inferencia de layout, capability listings, filtros, coerción de estado) — o un re-implementador
   reproduce la forma pero no el comportamiento.
3. **Renderer de referencia mínimo (Core)**, dependency-light, público — la prueba concreta de
   portabilidad y el esqueleto de "renderer en 1 día" que hoy no existe como tal.
4. **Guía de salida/migración** con las 3 rutas (self-host del runtime OSS · bundle estático ·
   renderer Core propio) y sus límites.
5. **Garantizar licencia OSS + runbook de self-host del runtime** — *el backstop REAL*: la portabilidad
   de la definición es inútil si el runtime no se puede alojar legalmente tras un abandono. **Nombrarlo
   en el ADR.**

**Estado (2026-09-19, rama `feat/r2-wire-versioning`):** licencia = **Apache 2.0** (permisiva +
concesión de patentes — óptima corporativa; se mantiene). **HECHO:** (R2‑5) guía de portabilidad y
salida (`doc/.../mateu-about/portability-and-exit.md`) + higiene de licencia (NOTICE top-level +
`license` en package.json de doc/e2e); (R2‑1) **versionado del wire** — `wireVersion` "3.0" en el
envelope de los 3 backends, aditivo, verificado (Java conformance 3/3, corpus regenerado con diff exacto,
Python verde, .NET a CI); (R2‑2) **spec pública + semántica de derivación** consolidada en
`doc/.../reference/wire-specification.md`; (R2‑3) **renderer de referencia Core** cero-dependencias en
`frontend/reference-renderer/` (prueba de portabilidad + esqueleto "renderer en 1 día") + tutorial.
(R2‑1b) **versión en los 5 schemas** (`"version":"3.0"`, sin tocar `$id`/URLs — `UidlSchemaTest` 12/12);
(licencia .NET) `Directory.Build.props` con `Apache-2.0`. **R2 COMPLETO.** **[EVIDENCIA: LICENSE.txt, NOTICE, portability-and-exit.md, wire-specification.md,
UIIncrementDto.wireVersion, conformance/cases/*, renderer-contract.md, e2e/conformance.*].**

**R3 · Gobernanza y continuidad (GAP‑3 — no es código, pero es pre-defensa)** — *veredicto (V5): la IA
neutraliza la mitad "adopción/uso" del bus factor (BAJA), pero NO la mitad "stewardship del core"
(MEDIA); la IA quita mano de obra, no accountability/liability/seguridad, e incluso puede enmascarar el
bus factor de intención de diseño.* Mitigación **obligatoria** para que el residuo sea aceptable:
1. **≥2 personas que sepan *juzgar* (no solo promptear) cambios del core.**
2. **Fork interno buildable + CI** (continuidad independiente del upstream; es OSS).
3. **Charter de soporte/propiedad** — o acuerdo comercial con SLA, o carta interna nombrando al
   responsable.
4. **Auditoría de seguridad externa periódica** (IA + 1 autor no pueden autocertificar seguridad).
- Frase committee-proof: *"la IA convierte «necesitamos comunidad para usarlo» en un no-problema; y
  «necesitamos alguien responsable que lo custodie» en un requisito de gobernanza, no de mano de obra —
  y Riu debe financiar esa gobernanza, no asumir que la IA la borra."*

### 7.2 Tier 2 — INVESTIGAR (spike time-boxed; NO bloquea GA)
- **R4 · Plano de operabilidad por agentes: MCP que respeta RBAC (GAP‑4, §2.15)** — **ELEVADO a elemento
  de la AR y HECHO (v3.0-alpha.350–354):** dos hosts (sidecar Node dependency-light contra cualquier
  backend + endpoint MCP nativo en **Java/Python/.NET** que reutiliza el handler de sync), proyección
  wire→tools especificada una vez, **RBAC heredado del servidor** (probado: un `@EyesOnly` no llega al
  agente no autorizado). Verificado con tests en los 3 backends (.NET suite 398/398) + **e2e vivo**; el
  chat in-app usa la misma proyección (P5). El **prompt-to-app** (P6) queda como dirección **con spike
  ejecutable** (valida contra el schema publicado + repara). Alto apalancamiento porque la UI es dato; la
  ventaja rival de "IA agéntica GA" está sobrevendida (verificado). Plan:
  `design/riu-agent-operability-plan.md`.
- **R5 · Data-grid analítico vía ComponentAdapter (GAP‑5)** — *veredicto (V3): document-as-limit; el
  embed AG-Grid es técnicamente viable (`Element`+`ComponentAdapter`), pero pivoting/range/xlsx estilado
  es trabajo de capa BI, no de back-office.* **No licenciar preventivamente**; spike solo si una pantalla
  concreta lo pide (p.ej. export xlsx multi-hoja de night-audit).

### 7.3 Tier 3 — NO bloquear GA / presentar con honestidad
- **Visual builder (GAP‑2) → severidad MEDIA, NO gate** — *veredicto (V2): la madurez del gap se
  sostiene, pero el mercado se aleja del drag-drop hacia autoría IA/NL, justo donde Mateu compite
  (código+YAML+DSL emitido por IA).* Presentar como **beta declarada**, con 2 condiciones: (a) cerrar el
  **handoff de diseñador** (pipeline Figma a estado soportado — donde Vaadin Copilot sí gana hoy), (b)
  **carril citizen-dev gobernado** (YAML+IA tras revisión PR), no drag-drop libre.
- **Documentar como límite (barato):** offline móvil (GAP‑6), conectores legacy + recetas de adaptador
  (GAP‑7), analítica de uso (GAP‑8 — valorar **hook de instrumentación post-GA**, buen ROI),
  scaffolding full-stack (GAP‑10), plumbing enterprise + cableado de referencia (GAP‑11).
- **Descartar:** animación framework-native (GAP‑9).

### 7.4 Cuadro de decisión (verificado)

| Acción | Gap | Veredicto adversario | ¿Bloquea GA? |
|---|---|---|:-:|
| R1 Renderer marca Riu + demo + playbook + guardrail | GAP‑1 | Real, severidad por superficie (baja en operacional) | **Sí** |
| R2 Portabilidad verificable (wire versionado, spec, renderer ref, guía, OSS+self-host) | A3/GAP‑3 | Se sostiene vs low-code; distinto vs React → hacerlo real | **Sí** |
| R3 Gobernanza (≥2 jueces, fork+CI, charter, auditoría) | GAP‑3 | IA baja adopción a BAJA, stewardship queda MEDIA | **Sí** (pre-defensa) |
| R4 Plano operabilidad por agentes (MCP, §2.15) | GAP‑4 | Runtime **HECHO y enviado** (sidecar+nativo Java/Python/.NET+chat, v3.0-alpha.350–354); prompt-to-app spike | Runtime **sí** (elemento AR, implementado+verificado); prompt-to-app dirección con PoC |
| R5 AG-Grid vía adapter | GAP‑5 | Document-as-limit; BI ≠ back-office | No (trigger) |
| Visual builder beta declarada + Figma + carril gobernado | GAP‑2 | Madurez sí, severidad MEDIA; mercado va a IA/NL | No |
| Documentar límites (offline/conectores/analítica/scaffolding/plumbing) | GAP‑6/7/8/10/11 | — | No |
| Descartar animación | GAP‑9 | — | No |

**Titular de la recomendación:** de 11 gaps, **solo 3 bloquean** y son de naturaleza distinta —
**R1** (demostrar la marca), **R2** (volver real la portabilidad) y **R3** (financiar la gobernanza).
Ninguno es "construir una feature que nos falta": son **retirar riesgo, hacer verificable una promesa y
poner gobernanza**. El resto se investiga o se documenta. La IA reordenó el mapa: los gaps de "pieza que
falta" dejaron de pesar; lo que queda es diseño-de-marca, portabilidad-verificable y gobernanza — las
tres cosas que ni la IA ni una comunidad grande te regalan.

## 8. Estado de madurez y plan

- **GA v3.0.0** — casi cerrada (CI verde, freeze, 6 demos). Corte RC1→GA pendiente. Ver `ga-plan.md`.
- **Coherencia** — consolidación en fases; refuerza la historia del 80%/20%. Ver `coherence-plan.md`.
- **Plugin / visual builder** — on-ramp visual que emite la definición como dato. Ver Idea #12.

*[PENDIENTE: qué es prerrequisito de la defensa y qué es post-decisión.]*

---

## 9. Propuesta de adopción

*[PENDIENTE — con tu input: piloto acotado (¿qué dominio?), criterios de éxito, plazos, quién,
convivencia con lo existente.]*

---

## Apéndice A — Inventario de evidencia (para respaldar cada [EVIDENCIA])
*[Se irá rellenando: por cada afirmación, el test / demo / ruta de código que la prueba.]*
