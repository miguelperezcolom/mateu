# Backlog de diseño de alto nivel — Mateu

> **Estado:** notas de una sesión de revisión de la visión del framework (2026-08-12). Nada de
> esto está decidido ni implementado: es la lista de tensiones estructurales que merecen una
> decisión explícita, con un primer paso concreto por cada una para que se puedan atacar de una
> en una. Complementa los planes de ejecución (`page-level-inference-plan.md`,
> `redwood-page-templates-plan.md`, `vb-page-template-apis.md`), que resuelven *cómo*; esto
> intenta fijar *qué* y *por qué*.

---

## 0. Punto de partida: el producto es la cintura, no el framework Java

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
          React Native · plugin IntelliJ
```

Consecuencia que ordena casi todo lo que sigue: **el backend Java es el primer productor y el más
completo, pero conceptualmente es un cliente más de la spec**, no la spec. Cada vez que una
decisión se toma "en Java y luego se porta", se está tratando la cintura como un detalle de
implementación en lugar de como el activo.

---

## 1. El impuesto de paridad domina el coste marginal de cada feature

**Observación.** Cada feature aterriza hasta 3 veces en backend (Java/.NET/Python) y hasta 4 en
renderer. El `CLAUDE.md` lo documenta sin querer: "parity (2026-07-17)", "ports closed the
archetype gap", ".NET/Python parity (2026-07-08)" — filtros tipados, drawer CRUD, zones,
archetypes, page inference. Descartar el port de Go (2026-07-11) fue la decisión correcta y por
este motivo exacto.

**Por qué importa.** Hoy la paridad se mantiene **por disciplina y por notas en un CLAUDE.md**, no
por un mecanismo. Eso escala con la memoria de quien lo mantiene, no con el número de ports. Es el
techo real de crecimiento del catálogo de features.

**Precedente que ya existe en el repo.** `PageFingerprint` (fase 2 de page-level inference) hace
exactamente lo correcto en pequeño: convierte una decisión del framework en una línea estable que
se pinea en un golden test, de modo que un cambio inesperado **falla en CI en vez de sorprender**.
Y el suite e2e compartido ya corre los mismos specs `**/shared/**` contra 5 apps de framework
distintas (Helidon a 252/252).

**Primer paso concreto.** Extender ese patrón de "golden" del *fingerprint de página* al **payload
de wire completo**: un corpus de conformidad — N fixtures declarativos (clases `@UI` equivalentes
en los 3 lenguajes) → payloads golden versionados, en un artefacto propio. Cada port ejecuta el
corpus en su propio CI. El port deja de "seguir a Java" y pasa a "cumplir la spec".

**Preguntas abiertas.**
- ¿Es el multi-lenguaje un mercado real o una demostración de que la cintura es sólida? La
  respuesta cambia la inversión: si es mercado, el corpus es obligatorio; si es demostración,
  quizá lo correcto es **congelar los ports en un subconjunto declarado** y decirlo en la doc.
- ¿El corpus se genera desde Java (Java como referencia) o se escribe a mano (spec como
  referencia)? Lo primero es barato y perpetúa la jerarquía; lo segundo es caro y la rompe.
- ¿Merece la pena un documento de spec del wire, versionado aparte del código?

---

## 2. Artefactos duplicados por disciplina: `contract.json`

**Observación.** El contrato Figma ⇄ Mateu vive en `design/figma/contract.json` y se **replica a
mano** en al menos dos sitios más (modux `src/main/resources/figma/mateu-contract.json` y los
recursos del `figma-maven-plugin`, que además embebe su propio lector). El propio `CLAUDE.md` dice
"SYNC IT when contract.json changes" — un aviso escrito es la señal de que el mecanismo falta.

**Por qué importa.** Mismo patrón que el punto 1, en pequeño y más fácil de arreglar: es un
artefacto de datos, no código, y ya está en formato publicable.

**Primer paso concreto.** Publicar `contract.json` como dependencia versionada (un jar/paquete de
recursos) y que modux y el plugin Maven lo consuman en vez de copiarlo. Coste bajo, elimina una
clase entera de bug silencioso.

---

## 3. Gobierno de la superficie declarativa al subir de altitud

**Observación.** El Mateu original hace **inferencia mecánica** (un `LocalDate` → date picker):
determinista, deriva del modelo, sin ambigüedad. Los page templates y archetypes hacen **selección
de patrón**, que requiere una *intención* que el modelo de datos no contiene: un `record Booking`
no dice si quiere ser tabla, calendario o dashboard.

**Matiz importante (esto lo estás atacando bien).** La reacción por defecto sería meter la
intención en anotaciones, y la superficie ya crece rápido (`@Zones`, `@WizardProgress`,
`@RangeFilter`, `@AppContext`, `@Audience`, `editInDrawer()`, `@PageTemplate`...). Pero
`page-level-inference-plan.md` va por el camino contrario y mejor: **inferir el arquetipo de la
información declarada**, con las tres salvaguardas correctas — reglas deterministas, *explicit
always wins*, y estabilidad visible (avisos de proximidad + fingerprint en CI). Es la elección
acertada.

**La tensión que queda.** Inferencia y anotación son dos presupuestos que crecen a la vez, y no
hay un principio escrito que diga a cuál va cada cosa nueva. Sin ese principio, la superficie
declarativa crece por acumulación y el riesgo clásico se materializa: **el DSL de anotaciones
acaba costando más de aprender que escribir la UI a mano**.

**Primer paso concreto.** Escribir la regla de decisión (media página) que responda: ¿cuándo una
capacidad nueva es (a) inferida, (b) una anotación, (c) un método overridable, (d) código
imperativo, (e) otro canal — `.form` / Figma? Y con qué criterio se retira una anotación cuando la
inferencia la subsume.

**Preguntas abiertas.**
- ¿Hay un presupuesto máximo declarado de anotaciones públicas? ¿Se mide?
- Cuando la inferencia compone bien, ¿la anotación equivalente se deprecia o se queda para
  siempre como escape?
- ¿La fase 1 (`@AutoPage`, opt-in) llega a ser alguna vez el default? Si nunca lo es, la
  inferencia no reduce la superficie declarativa: la aumenta en uno.

---

## 4. La rampa de escape decide si el cliente se queda pasado el 80%

**Observación.** El README dice honestamente que Mateu no es para "highly custom visual
experiences". Todos los frameworks model-driven mueren en el último 20%: el cliente quiere **una**
pantalla especial, y la respuesta no puede ser "entonces Mateu no es para ti".

**Estado actual.** El SPI `ComponentAdapter` existe y funciona (los ports incluso replican su
resolución CDI), pero está documentado como un rincón técnico, no como una promesa de producto.

**Por qué importa.** Es la diferencia entre un "no" y un "sí, y". Una degradación gradual bien
contada — *baja a un web component custom para este campo o esta página y conserva routing,
estado, validación, i18n, menús y el resto de la app* — es un argumento de venta, no una nota al
pie.

**Primer paso concreto.** Convertirlo en feature de primera clase: página de doc propia con el
caso "una pantalla de las 40 es especial", demo en `demo/`, y decidir qué garantías se dan (¿qué
sobrevive al bajar a custom? ¿se puede volver a subir?).

**Pregunta abierta.** ¿Cuál es el grano mínimo de escape soportado — campo, sección, página, app?
Cuanto más fino, más fuerte el argumento y más caro el contrato.

---

## 5. Posicionamiento: derivación vs generación, en la era del LLM

**La pregunta de 2026.** Cuando un LLM escribe un panel de admin en React en un minuto, ¿por qué
model-driven? El argumento histórico ("escribes menos código") lo ha ganado la IA.

**La respuesta que sí se sostiene:**

> El código generado **deriva** del modelo y luego **diverge**. En Mateu la UI no se genera: se
> deriva en runtime, así que no puede divergir. Cambias el modelo y la UI ya es correcta.

**El foso menos explotado.** El mismo modelo renderiza en navegador, en React Native y **dentro de
un plugin de IntelliJ**. Eso ya es real y ya se usa en producto propio: EventConductor embebe UI de
Mateu en webviews de IDE (cf. el editor visual de `.ecform`, PRs #214/#216/#218). Un LLM te escribe
un React; no te da un modelo único que rinda en web, móvil e IDE a la vez.

**Primer paso concreto.** Reescribir el "Why Mateu" del README alrededor de *derivación vs
generación* + *un modelo, muchos renderers*, en lugar de *menos código*. Es gratis y cambia la
conversación con quien llega.

**Preguntas abiertas.**
- ¿El multi-renderer nativo (RN, IntelliJ) es un pilar del pitch o un experimento? Ahora mismo
  está en el layout del repo pero no en el README.
- ¿Hay una historia de "Mateu como runtime de UI embebible" (el caso EventConductor) que merezca
  ser un producto/doc propio, en vez de un uso interno?

---

## Orden sugerido de ataque

| # | Tema | Coste | Impacto | Notas |
|---|---|---|---|---|
| 5 | Posicionamiento (README) | muy bajo | alto | gratis, y ordena el resto del discurso |
| 2 | `contract.json` único | bajo | medio | elimina una clase de bug silencioso |
| 3 | Regla de decisión declarativa | bajo | alto | media página, evita deuda futura |
| 1 | Corpus de conformidad del wire | alto | alto | primero decidir si multi-lenguaje es mercado |
| 4 | Rampa de escape como feature | medio | alto | desbloquea clientes que hoy se caen |
