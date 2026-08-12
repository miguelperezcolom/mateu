# Backlog de diseño de alto nivel — Mateu

> **Estado:** notas de una sesión de revisión de la visión del framework (2026-08-12, revisado el
> mismo día). Nada de esto está implementado: es la lista de tensiones estructurales que merecen
> una decisión explícita, con un primer paso concreto por cada una para que se puedan atacar de
> una en una. Complementa los planes de ejecución (`page-level-inference-plan.md`,
> `redwood-page-templates-plan.md`, `vb-page-template-apis.md`), que resuelven *cómo*; esto
> intenta fijar *qué* y *por qué*.

---

## 0. Dos hechos que ordenan todo lo demás

### 0.1 El producto es la cintura, no el backend Java

Mateu es un **server-driven UI framework con una cintura estrecha**: el modelo de wire
(`UIIncrementDto`, `POST /{baseUrl}/mateu/v3/...`). Todo lo demás son adaptadores a un lado o al
otro:

```
          Java (MVC · WebFlux · Micronaut · Quarkus · Helidon MP)
          .NET (ASP.NET)            productores
          Python (FastAPI)
                      │
                      ▼
         ┌──────────────────────────────┐
         │  wire model  /mateu/v3/sync  │   ← la cintura: el producto real
         │  UIIncrementDto              │
         └──────────────────────────────┘
                      │
                      ▼
          vaadin-lit · Redwood/VB       consumidores
          React Native · IntelliJ · VSCode
```

`reference/parity.md` ya lo dice con todas las letras — *"Mateu's contract is the wire: any server
can serve any renderer"*. La consecuencia práctica: **el backend Java es el primer productor y el
más completo, pero conceptualmente es un cliente más de la spec**, no la spec. Cada vez que una
decisión se toma "en Java y luego se porta", se trata la cintura como un detalle de implementación
en lugar de como el activo.

### 0.2 Decisión tomada: Mateu es un producto, y la meta es alcance

Mateu nació como herramienta personal: *"me interesaba la lógica y el modelo de negocio, quería la
UI con el mínimo esfuerzo y dolor posible"*. Hoy **ya es un producto**, con una meta explícita:
cuanta más gente se pueda beneficiar, mejor — de ahí el soporte a varios design systems/fronts y a
varios lenguajes/frameworks de backend.

Esto no es un matiz: **decide el backlog entero**. Los ports y los renderers dejan de ser
demostraciones de que la cintura aguanta y pasan a ser **promesas hechas a terceros**. Una promesa
hecha a alguien que no eres tú necesita un *mecanismo*, no disciplina. Todo lo que sigue en las
secciones 2–4 es consecuencia de esta decisión.

---

## 1. La tesis fundacional: inferencia máxima, dolor mínimo sostenido

Vale la pena dejarla escrita porque es el criterio con el que juzgar todo lo demás:

> El desarrollador declara **información**; Mateu infiere la **UX**. El objetivo no es escribir
> menos código: es **no tener que ocuparse de la UI, ni ahora ni dentro de dos años**.

Dos corolarios que se usan más abajo:

- **Cada anotación nueva es deuda contra la tesis, no una feature.** Una anotación es la confesión
  de que la inferencia no llegó. Con esta lente, `page-level-inference-plan.md` no es una dirección
  nueva: es la idea original una altitud más arriba, y es el único trabajo en curso que *reduce* la
  superficie declarativa en lugar de aumentarla.
- **"Dolor mínimo" es sostenido, no puntual.** Un LLM también da UI con esfuerzo mínimo *hoy*; lo
  que no da es que la UI siga siendo correcta dentro de dos años sin tocarla. Ver sección 8.

---

## 2. Conformidad del wire: ya existe, pero apunta al revés

**Observación.** La infraestructura de paridad no falta — está construida a medias y orientada en
la dirección que no escala:

- `doc/src/content/docs/reference/parity.md` es una matriz honesta, publicada y muy detallada.
- `backend/dotnet/test` y `backend/python/tests` tienen **golden-JSON tests** que verifican que el
  port emite el mismo wire.
- El suite e2e compartido ya corre los mismos specs `**/shared/**` contra 5 apps de framework
  (Helidon a 252/252).
- `PageFingerprint` (fase 2 de page-level inference) convierte una decisión del framework en una
  línea estable que se pinea en un golden test: el cambio inesperado **falla en CI** en vez de
  sorprender.

**El problema.** Los goldens son **per-port, escritos junto al port**. Eso verifica "el port hace
lo que hace", no "el port cumple la spec". Consecuencia práctica: un feature nuevo requiere que
**tú** lo lleves a los tres sitios, y el `CLAUDE.md` lo documenta sin querer con su rosario de
notas "parity (2026-07-17)", "ports closed the archetype gap", ".NET/Python parity (2026-07-08)".
La paridad se sostiene por memoria del mantenedor, y eso escala con tu ancho de banda, no con el
número de ports. Descartar el port de Go (2026-07-11) fue la decisión correcta y por este motivo.

**El salto que falta** es exactamente el que ya diste en e2e: los specs `**/shared/**` no son "los
tests de Helidon", son **la spec que Helidon tuvo que pasar**. Hay que hacer lo mismo con el wire.

**Primer paso concreto.** Extraer los goldens per-port a un **corpus de conformidad compartido**:
N fixtures declarativos (clases `@UI` equivalentes en los 3 lenguajes) → payloads golden
versionados, en un artefacto propio que cada port ejecuta en su CI. El port deja de "seguir a Java"
y pasa a "cumplir la spec" — y puede fallar solo, con su dueño enterándose sin que tú intervengas.

**Preguntas abiertas.**
- ¿El corpus se genera desde Java (barato, perpetúa la jerarquía) o se escribe a mano (caro, la
  rompe)? Probablemente generado al principio y congelado como spec después.
- ¿Merece la pena un documento de spec del wire versionado aparte del código, o el corpus *es* la
  spec?

---

## 3. La verdad sobre qué está soportado se está desincronizando

**Observación.** Tres fuentes dicen cosas distintas hoy:

| Fuente | Dice |
|---|---|
| `reference/parity.md` | columna **SAP UI5** con ✅ en toda la matriz de renderers |
| `CLAUDE.md` | sapui5, redwood-oj, redhat/PatternFly y slds **RETIRADOS**; web soportados = vaadin + línea VB |
| El repo | `apps/sapui5`, `apps/redhat`, `apps/slds` siguen existiendo |

Y hay dos cosas que no aparecen en el layout del `CLAUDE.md`: `frontend/app/vscode-extension` y
`apps/visual-editor`.

**Por qué importa (y por qué cambió de peso con 0.2).** Para una herramienta personal esto es
inocuo. Para un producto, **la matriz de capacidades *es* la API**: alguien elige Mateu leyéndola.
Un ✅ donde ya no hay nada rompe la promesa antes de que el usuario escriba una línea. Y es la
corrección más barata y de mayor valor de todo este documento.

**Primer paso concreto.** Dos cosas, en este orden: (1) reconciliar hoy las tres fuentes a mano —
retirar del matrix lo retirado, añadir lo que existe y no está; (2) hacer que la matriz se
**genere o se verifique** desde la suite de conformidad (sección 2) en vez de mantenerse a mano.
Una fila con ✅ debería ser un test que pasa, no una afirmación.

---

## 4. El multiplicador de alcance no eres tú escribiendo más adaptadores

**La evidencia está en el propio repo.** Se construyeron **cuatro renderers web y se retiraron
cuatro**: sapui5, redwood-oj (OJET), redhat/PatternFly, slds. Eso no es un fracaso, es una
medición: *un renderer por design system, en primera persona, no sobrevive a un solo mantenedor*.
Y no va a sobrevivir por mucho que mejore la disciplina, porque el coste es proporcional al número
de design systems que hay en el mundo. Lo mismo aplica, más despacio, a los ports de lenguaje.

**La lectura que encaja con 0.2** ("cuanta más gente se beneficie, mejor") no es *más renderers
tuyos*, es **que una tienda PatternFly pueda escribir y mantener el suyo**. Es decir: convertir los
puntos de extensión en **superficie de contribución**.

Hacen falta dos piezas, y la segunda ya la tienes en embrión:

- un **contrato de renderer** documentado: qué DTOs hay que saber pintar, qué `commands` honrar,
  qué eventos emitir, qué es obligatorio y qué opcional;
- una **suite de conformidad de renderer** = tu suite e2e compartida apuntando a renderers, no
  solo a backends.

Con eso el producto deja de ser "Mateu soporta N design systems" (una promesa que pagas tú para
siempre) y pasa a ser "Mateu soporta el tuyo" (una promesa que se paga sola).

**Preguntas abiertas.**
- ¿Cuál es el **subconjunto mínimo conforme**? Un renderer que pinta formularios y CRUD pero no
  Gantt ni planning board, ¿es un renderer Mateu válido? Sin niveles de conformidad declarados, un
  tercero no sabe cuándo ha terminado.
- ¿Hay renderers/ports de primera parte (los que tú mantienes) y de tercera, con promesas
  distintas? Decirlo explícitamente es más honesto que una matriz plana.
- ¿Los 3 directorios retirados (`sapui5`, `redhat`, `slds`) se borran, o se reetiquetan como
  **ejemplos de referencia** para quien escriba el suyo? Lo segundo los convierte de deuda en
  activo.

---

## 5. Artefactos duplicados por disciplina: `contract.json`

**Observación.** El contrato Figma ⇄ Mateu vive en `design/figma/contract.json` y se **replica a
mano** en al menos dos sitios más (modux `src/main/resources/figma/mateu-contract.json` y los
recursos del `figma-maven-plugin`, que además embebe su propio lector). El `CLAUDE.md` avisa "SYNC
IT when contract.json changes" — un aviso escrito es la señal de que el mecanismo falta.

Mismo patrón que las secciones 2 y 3, en pequeño y más fácil de arreglar: es un artefacto de datos,
no código, y ya está en formato publicable.

**Primer paso concreto.** Publicar `contract.json` como dependencia versionada (jar/paquete de
recursos) y que modux y el plugin Maven lo consuman en vez de copiarlo.

---

## 6. Gobierno de la superficie declarativa al subir de altitud

**Observación.** El Mateu original hace **inferencia mecánica** (un `LocalDate` → date picker):
determinista, deriva del modelo, sin ambigüedad. Los page templates y archetypes hacen **selección
de patrón**, que requiere una *intención* que el modelo de datos no contiene: un `record Booking`
no dice si quiere ser tabla, calendario o dashboard.

**Esto ya se está atacando bien.** La reacción por defecto sería meter la intención en anotaciones,
y la superficie ya crece rápido (`@Zones`, `@WizardProgress`, `@RangeFilter`, `@AppContext`,
`@Audience`, `editInDrawer()`, `@PageTemplate`, `@RestOptions`, `@RestListing`...). Pero
`page-level-inference-plan.md` va por el camino contrario y mejor — inferir el arquetipo de la
información declarada — con las tres salvaguardas correctas: reglas deterministas, *explicit always
wins*, y estabilidad visible (avisos de proximidad + fingerprint en CI).

**La tensión que queda.** Inferencia y anotaciones crecen **a la vez**, y no hay regla escrita de a
cuál va cada capacidad nueva. Sin ella, la superficie declarativa crece por acumulación y el riesgo
clásico se materializa: **el DSL de anotaciones acaba costando más de aprender que escribir la UI a
mano** — que es exactamente la derrota de la tesis de la sección 1.

**Primer paso concreto (métrica, no documento).** Publicar en cada release un número:

> **anotaciones por pantalla típica** — medido sobre el corpus de demos/e2e, y su tendencia.

Si sube, Mateu se aleja de por qué existe, aunque cada anotación individual esté justificada. Un
número que se publica disciplina más que cualquier documento de principios, y el primitivo para
calcularlo es trivial sobre el corpus que ya existe.

**Preguntas abiertas.**
- Cuando la inferencia subsume una anotación, ¿se deprecia o se queda para siempre como escape?
- ¿La fase 1 (`@AutoPage`, opt-in) llega a ser el default alguna vez? **Si nunca lo es, la
  inferencia no reduce la superficie declarativa: la aumenta en uno.**
- ¿Cuándo una capacidad nueva es inferida, anotación, método overridable, código imperativo, u otro
  canal (`.form` / Figma)?

---

## 7. La rampa de escape decide si el cliente se queda pasado el 80%

**Observación.** El README dice honestamente que Mateu no es para "highly custom visual
experiences". Todos los frameworks model-driven mueren en el último 20%: el usuario quiere **una**
pantalla especial, y la respuesta no puede ser "entonces Mateu no es para ti".

**El criterio correcto sale de la tesis fundacional**, y no es el que yo había escrito antes ("¿se
puede?"):

> El dolor del último 20% no puede superar al dolor ahorrado en el primer 80%.

Si una sola pantalla especial obliga a pelearse con el framework, la ecuación se invierte y el
ahorro se evapora — y no para "un cliente", sino para el usuario original de la sección 1.

**Estado actual.** El SPI `ComponentAdapter` existe y funciona (los ports lo replican; en la matriz
figura como 🟡 *wrapper idiom* en .NET/Python), pero está documentado como rincón técnico, no como
promesa de producto.

**Primer paso concreto.** Convertirlo en feature de primera clase: página de doc propia con el caso
"una pantalla de las 40 es especial", demo en `demo/`, y decidir qué garantías se dan — qué
sobrevive al bajar a custom (routing, estado, validación, i18n, menús) y si se puede volver a
subir.

**Preguntas abiertas.**
- ¿Cuál es el grano mínimo de escape soportado — campo, sección, página, app? Cuanto más fino, más
  fuerte el argumento y más caro el contrato.
- ¿La paridad del escape en los ports (🟡 hoy) es aceptable, o es justo el sitio donde el 🟡 más
  duele?

---

## 8. Posicionamiento: derivación vs generación, en la era del LLM

**La pregunta de 2026.** Cuando un LLM escribe un panel de admin en React en un minuto, ¿por qué
model-driven? El argumento histórico ("escribes menos código") lo ha ganado la IA.

**La respuesta que sí se sostiene** — y que no es una postura de marketing, sino la motivación
fundacional (sección 1) sobrevivida:

> El código generado **deriva** del modelo y luego **diverge**. En Mateu la UI no se genera: se
> deriva en runtime, así que no puede divergir. Cambias el modelo y la UI ya es correcta.

**El foso menos explotado.** El mismo modelo renderiza en navegador, en React Native y **dentro de
un IDE** (plugin de IntelliJ, extensión de VSCode). Ya es real y ya se usa en producto propio:
EventConductor embebe UI de Mateu en webviews de IDE (editor visual de `.ecform`, PRs #214/#216/#218).
Un LLM te escribe un React; no te da un modelo único que rinda en web, móvil e IDE a la vez.

**Precondición (importante).** No se puede liderar el README con "multi-stack" hasta que el
multi-stack sea **verificable** (secciones 2 y 3). Anunciar amplitud que no se puede respaldar es
peor que no anunciarla. Orden correcto: paridad mecánica y honesta → *después* venderla como pilar.

**Primer paso concreto.** Reescribir el "Why Mateu" del README alrededor de *derivación vs
generación* (que no depende de la precondición) y dejar *un modelo, muchos renderers* para cuando
las secciones 2–3 estén hechas.

**Pregunta abierta.** ¿Hay una historia de "Mateu como runtime de UI embebible" (el caso
EventConductor) que merezca ser producto/doc propio, en vez de un uso interno?

---

## Orden sugerido de ataque

| # | Tema | Coste | Impacto | Notas |
|---|---|---|---|---|
| 3 | Reconciliar la matriz de capacidades | muy bajo | **alto** | la matriz *es* la API; hoy promete un renderer retirado |
| 8 | README: derivación vs generación | muy bajo | alto | la mitad no depende de nada; ordena el discurso |
| 5 | `contract.json` único | bajo | medio | elimina una clase de bug silencioso |
| 6 | Métrica de anotaciones por pantalla | bajo | alto | disciplina la tesis con un número, no con un documento |
| 2 | Corpus de conformidad del wire | alto | **alto** | habilita 3 y 4; sin esto la paridad escala con tu memoria |
| 4 | Contrato + conformidad de renderer | alto | **alto** | el multiplicador real de alcance; 4 renderers retirados lo justifican |
| 7 | Rampa de escape como feature | medio | alto | criterio: que duela menos que haberla escrito a mano |

Las dos grandes (2 y 4) son la misma idea aplicada a los dos lados de la cintura: **convertir
"seguir a Java" en "cumplir la spec"**, para que la extensión la pueda hacer alguien que no seas tú.
