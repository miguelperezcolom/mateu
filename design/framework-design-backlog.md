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

Y con el static bundle (sección 9) el diagrama se queda corto: **un CDN sirviendo un
`manifest.json` también es un productor de wire**. El servidor Java está todavía menos en el centro
de lo que sugiere el dibujo.

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
  superficie declarativa en lugar de aumentarla. (El criterio afinado, en la sección 6.)
- **"Dolor mínimo" es sostenido, no puntual.** Un LLM también da UI con esfuerzo mínimo *hoy*; lo
  que no da es que la UI siga siendo correcta dentro de dos años sin tocarla. Ver sección 8.

### 1.1 Las tres etapas del modelo de autoría

La historia importa porque cada etapa añadió una forma de autoría distinta, y solo la primera
tenía una regla escrita:

1. **Todo desde Java (origen).** La UI se resuelve entera desde el backend, con una regla de
   reparto muy limpia: **anotación** cuando es puramente declarativo (se conoce en compile time, no
   hay decisión que tomar) e **interfaz o clase abstracta** cuando es dinámico (la decisión se toma
   en runtime). Esta regla nunca se escribió como principio, pero es la que ha sostenido la
   superficie declarativa todos estos años.
2. **Páginas y templates.** Definición a más alto nivel: *todas las páginas son del tipo a, b o c*.
   Se toma **Redwood como modelo** en lugar de reinventar la rueda — y lo que se importa no son los
   píxeles de Oracle sino su modelo de decisión (`redwood-page-templates-plan.md`). Ver la sección
   6.2 para lo que ese préstamo trae consigo.
3. **Inferencia de página** (`page-level-inference-plan.md`). El framework deja de recibir la
   elección y empieza a deducirla. Es la etapa que **la regla de la etapa 1 no cubre** — y por eso
   hay que ampliarla (sección 6.1).

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
  qué eventos emitir, qué **plan de fetch** ejecutar (sección 10.3), qué es obligatorio y qué
  opcional;
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

**La tensión.** Inferencia y anotaciones crecen **a la vez** (`@Zones`, `@WizardProgress`,
`@RangeFilter`, `@AppContext`, `@Audience`, `editInDrawer()`, `@PageTemplate`, `@RestOptions`,
`@RestListing`...), y no hay regla escrita de a cuál va cada capacidad nueva. Sin ella, la
superficie crece por acumulación y el riesgo clásico se materializa: **el DSL de anotaciones acaba
costando más de aprender que escribir la UI a mano** — que es exactamente la derrota de la tesis de
la sección 1.

### 6.1 La regla de autoría: ampliarla, no inventarla

La regla de la etapa 1 (sección 1.1) reparte por **cuándo se conoce la respuesta**:

> anotación = declarativo puro, compile time, sin decisión.
> interfaz / clase abstracta = hay decisión, se toma en runtime.

La inferencia no rompe esa regla: abre un eje que la regla no contemplaba, el de **quién decide**.

|  | **decide el desarrollador** | **decide el framework** |
|---|---|---|
| **compile time** | anotación | inferencia estática desde la forma del modelo |
| **runtime** | interfaz / clase abstracta | inferencia + composición (`PageInference`) |

Esto explica por qué `@AutoPage` se siente distinta a las demás anotaciones: **su contenido no es
información, es permiso** — "decide tú por mí". No es una declaración más, es un cambio de columna.

De ahí sale el criterio que faltaba, y que es más útil que cualquier lista de casos:

> **Una anotación es legítima cuando transporta información que SOLO el desarrollador tiene.
> Es deuda cuando transporta una decisión que el framework podría tomar mirando el modelo.**

**Y la regla no es higiene de estilo: es load-bearing.** La sección 9 muestra que esta misma
partición decide **qué se puede servir desde un CDN y qué necesita servidor**. Escribirla no es
documentar una preferencia: es explicar el modelo de ejecución y de despliegue.

**Primer paso concreto.** Escribir esta regla (las dos preguntas + la tabla + el criterio) en la
doc pública, junto a `the-mateu-way.md`. Es media página y convierte una intuición de años en algo
que un contribuidor externo puede aplicar — que es justo lo que hace falta ahora que Mateu es
producto (sección 0.2).

### 6.2 El techo de la inferencia es de información, no de implementación

Redwood se tomó como modelo para no reinventar la rueda, y lo valioso que se importó es su modelo
de decisión, no sus píxeles:

```
objetivo de usuario ──▶ categoría ──▶ densidad de datos ──▶ plantilla ──▶ anatomía fija
```

Pero fíjate dónde **empieza** esa cadena: en el *objetivo de usuario*. Y Mateu empieza en el
**modelo de datos**. Son dos orígenes distintos, y esa distancia es el techo duro de la inferencia
de página:

- `MetricCard` → dashboard funciona porque la forma **correlaciona** casi perfectamente con la
  intención.
- Pero una lista de registros puede ser una tabla, un calendario, un kanban, un planning board o
  una cola de triaje. **Misma forma de datos, cinco objetivos de usuario distintos.** Ninguna
  cantidad de inferencia los distingue: la información no está en el modelo.

`page-level-inference-plan.md` ya respeta este límite en la práctica (solo compone arquetipos
*fully-derivable*; los que necesitan suppliers no declarados se quedan en advisory). **Falta
escribirlo como límite conocido**, para que nadie persiga una fase 3 que es imposible por
construcción, y para acotar de antemano hasta dónde llega la tesis de la sección 1.

### 6.3 Entonces: ¿por dónde entra la intención con menos dolor?

Si la intención no está en el modelo, tiene que entrar por algún canal. Hay tres, los tres ya
existen en el repo en distinto grado de madurez:

| Canal | Estado | Coste para el desarrollador |
|---|---|---|
| **Anotación** (`@PageTemplate`) | maduro | barato, pero mete una decisión de diseño en el código de negocio |
| **Canal separado** (`.form`, Figma, `apps/visual-editor`) | en construcción | la intención vive donde viven los diseñadores; el modelo Java se queda puro |
| **Scaffold conversacional** (`the-mateu-way.md` + skill `mateu-screen`) | embrión | se paga UNA vez, al crear la pantalla |

El tercero es el más prometedor en 2026 y es donde converge el resto del documento: un LLM hace las
tres preguntas de "The Mateu Way" una vez, y **su salida no es la UI — es la declaración mínima**.
Pequeña, revisable, duradera; Mateu deriva el resto. Ver sección 8.

> **Reformulado en 10.1.** Con el editor visual ya construido, estos tres canales se enuncian mejor
> por *quién autora y cómo* — código, conversación, manipulación directa — y lo relevante pasa a ser
> que **los tres producen la misma declaración**. Esa es la versión buena; ver sección 10.1.

**Primer paso concreto (métrica, no documento).** Publicar en cada release un número:

> **anotaciones por pantalla típica** — medido sobre el corpus de demos/e2e, y su tendencia.

Si sube, Mateu se aleja de por qué existe, aunque cada anotación individual esté justificada. Un
número publicado disciplina más que cualquier documento de principios, y el primitivo para
calcularlo es trivial sobre el corpus que ya existe.

**Preguntas abiertas.**
- Cuando la inferencia subsume una anotación, ¿se deprecia o se queda para siempre como escape?
- ¿La fase 1 (`@AutoPage`, opt-in) llega a ser el default alguna vez? **Si nunca lo es, la
  inferencia no reduce la superficie declarativa: la aumenta en uno.**
- Si el canal preferente acaba siendo el 3, ¿qué pasa con la pantalla que se edita dos años
  después? La declaración generada tiene que seguir siendo legible y editable **a mano**, o el
  scaffold conversacional se convierte en generación de código con otro nombre.

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

### 7.1 El escape es ahora un problema de DOS altitudes

`ComponentAdapter` resuelve la altitud de **campo/componente**. La etapa 2 (páginas y templates,
sección 1.1) introdujo una altitud nueva con su propia forma de quedarse fuera: *"todas las páginas
son del tipo a, b o c"* es una taxonomía excelente **hasta que llega la página que no es ninguna**.
Y la taxonomía importada es la visión del mundo de Oracle para apps de empresa: buena, pero es
*una* visión, no un universal.

Así que hace falta la contrapartida a nivel de página: **"esta pantalla no es de ningún tipo —
déjame componerla a mano y conserva shell, routing, estado, menús e i18n"**. Sin eso, cada
pantalla que no encaja en el catálogo empuja a un usuario entero fuera de Mateu, no solo a una
pantalla.

**Primer paso concreto.** Convertir el escape en feature de primera clase **en las dos altitudes**:
página de doc propia con el caso "una pantalla de las 40 es especial", demo en `demo/`, y decidir
qué garantías se dan — qué sobrevive al bajar a custom y si se puede volver a subir.

**Preguntas abiertas.**
- ¿Cuál es el grano mínimo de escape soportado — campo, sección, página, app? Cuanto más fino, más
  fuerte el argumento y más caro el contrato.
- ¿La paridad del escape en los ports (🟡 hoy) es aceptable, o es justo el sitio donde el 🟡 más
  duele?
- ¿Qué pasa cuando la taxonomía se queda corta de forma repetida? ¿Se amplía el catálogo (y se
  aleja de Redwood) o se asume que el escape es la respuesta permanente?

---

## 8. Posicionamiento: derivación vs generación, en la era del LLM

**La pregunta de 2026.** Cuando un LLM escribe un panel de admin en React en un minuto, ¿por qué
model-driven? El argumento histórico ("escribes menos código") lo ha ganado la IA.

**La respuesta que sí se sostiene** — y que no es una postura de marketing, sino la motivación
fundacional (sección 1) sobrevivida:

> El código generado **deriva** del modelo y luego **diverge**. En Mateu la UI no se genera: se
> deriva en runtime, así que no puede divergir. Cambias el modelo y la UI ya es correcta.

**La versión no defensiva (mejor).** El argumento de arriba se defiende *de* la IA. Hay uno que la
usa, y sale de la sección 6.3: si la intención tiene que entrar por algún canal y el mejor canal es
el scaffold conversacional, entonces

> **la IA escribe la declaración; Mateu deriva la UI.**

La salida del LLM deja de ser una pantalla de React de 800 líneas que pasa a ser tuya y empieza a
divergir el día 2, y pasa a ser una declaración de diez líneas: pequeña, revisable, duradera, y de
la que Mateu deriva UI correcta para siempre — en web, móvil e IDE a la vez. La IA hace lo que hace
bien (capturar la intención una vez) y el framework hace lo que hace bien (no divergir nunca).

Esto encaja además con las piezas que ya existen: `the-mateu-way.md` enseña las tres preguntas y la
skill `mateu-screen` ya las automatiza conversacionalmente. Es la dirección más diferenciadora del
documento y hoy es la menos desarrollada.

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

## 9. El espectro de resolución: build · boot · request

**Estado: en gran parte YA CONSTRUIDO.** El static bundle está implementado y documentado
(`java-user-manual/build/static-bundle.md`): el goal `mateu:bundle` pre-renderiza el load inicial de
cada ruta estática a un `manifest.json`, el endpoint `GET /mateu/v3/bundle` lo sirve en vivo desde
los cinco adaptadores, el cliente arranca con `<mateu-ui bundleUrl>` (y `mateuBundleUrl` en
Redwood/VB), hay plantillas para rutas `:param` y un modo híbrido. Esta sección no propone
construirlo: propone **entenderlo bien y cerrar tres huecos**.

### 9.1 La partición de entrega es la MISMA que la regla de autoría

| Autoría (sección 6.1) | Entrega |
|---|---|
| **anotación** — declarativo puro, compile time, sin decisión | **bundle / CDN** |
| **interfaz / clase abstracta** — hay decisión, se toma en runtime | **servidor** |

No es coincidencia: las dos preguntan lo mismo — *¿se puede saber esto sin la petición?* Los tres
niveles (renderer · bundle · servidor) no son tres cajas sino un **espectro de cuándo se resuelve
la UI**: build time, boot time, request time.

**Consecuencia práctica: la frontera debería ser derivable de cómo escribiste la pantalla, no una
lista de excepciones.** Hoy `static-bundle.md` la enuncia por features — actions no, rutas `:param`
no, service-backed loads no — que es una lista que hay que consultar. La misma frontera enunciada
como *"si lo declaraste con anotaciones, sale del CDN; si usaste una interfaz, necesita servidor"*
es **predecible por construcción**: el desarrollador la razona de cabeza mientras escribe, sin
abrir la doc. Es el mismo hecho, expresado desde la regla en vez de desde sus síntomas.

### 9.2 El tercer eje: ¿depende de quién pregunta?

`grep -i "audience|locale|permission|persona"` sobre `MateuBundleExporter` y
`mateu-bundle-maven-plugin`: **cero resultados**.

Pero la estructura **sí** depende del usuario en features que la matriz de paridad marca ✅:
`@Audience` (proyección por persona), menús y acciones filtrados por permisos, i18n. Un bundle
pre-renderizado en build capturó *una* persona y *un* locale implícitos, y se sirve a todo el mundo.
En el mejor caso es un render incorrecto; en el peor, un botón o una entrada de menú que esa persona
no debería ver que existe — eso ya no es rendimiento, es **divulgación de capacidades**.

La doc acota bien el eje de los datos ("el manifest lleva solo estructura, nunca datos de negocio")
pero no acota el eje de la identidad. Así que la partición real tiene **tres** preguntas, no dos:

1. ¿Se conoce en compile time? → decide anotación vs interfaz (6.1)
2. ¿Quién decide, el desarrollador o el framework? → decide anotación vs inferencia (6.1)
3. **¿Depende de quién pregunta?** → decide bundleable vs servidor, y es una **frontera de
   seguridad**, no de rendimiento

**Primer paso concreto.** Decidir y declarar la política: o esas vistas son incompatibles con
bundle (y el exporter las salta explícitamente, no por accidente), o se bundlean por variante
`(audience, locale)`. Hoy no está decidido ni dicho, y el exporter no distingue.

### 9.3 Dos huecos verificados

**a) El conjunto bundleable se descubre empíricamente y se pierde en silencio.** El exporter
intenta renderizar cada ruta y, si falla, la salta y la loguea (`rendered/total`). Alguien inyecta
un repositorio en un ViewModel, la ruta se cae del bundle, y el único aviso es **una línea en el log
de build**: el rendimiento se degrada sin que nadie se entere. Es exactamente el problema que ya
resolviste para la inferencia con `PageFingerprint`.

*Primer paso:* pinear el conjunto bundleable en un golden y hacer que **salir del bundle falle en
CI** hasta que alguien lo acepte como decisión revisada.

**b) El manifest no lleva versión.** Es `BundleManifest(baseUrl, generatedAt, staticOnly, entries)`:
hay timestamp, pero ningún hash del modelo ni del build. En modo híbrido eso permite que el cliente
mezcle **estructura del build N con un backend en N+1** sin que nada lo detecte.

Y hay una tensión de fondo con la sección 8 que conviene nombrar: la doc dice, con razón, que el
manifest lleva solo estructura y nunca datos — eso mata la caducidad de datos. Pero la *estructura*
también se deriva del modelo, así que **un bundle en un CDN es derivación congelada**: exactamente
la divergencia que le criticamos al código generado, solo que automatizada.

*Primer paso:* sellar un hash de estructura en el manifest y compararlo en el primer contacto con el
backend (mismatch → refetch o aviso). Con eso el bundle es una **caché**, no un fork — y la tesis de
la sección 8 se sostiene también aquí.

---

## 10. Los tres canales de intención y el modo sin servidor

**Estado: construido.** Dos conceptos asimilados de Oracle Visual Builder:

- **Editor visual WYSIWYG** (`frontend/web/monorepo/apps/visual-editor`): paleta + canvas +
  propiedades en una vista, host-agnóstico (standalone, IntelliJ vía JCEF, VSCode vía Webview),
  sustituyendo al antiguo visual builder Swing que solo corría en IntelliJ.
- **Fuentes de datos que no pasan por Mateu**: `@RestOptions` / `@RestListing` / `@RestData` /
  `@RestAction`, con `proxy = true` como modo servidor. Combinado con el static bundle (sección 9),
  permite UIs **sin servidor Mateu**.

**La decisión de arquitectura clave ya está tomada, y está bien tomada.** Del README del editor:

> *Model of truth: the YAML page file (`modelView` + `layout`). Behaviour/data stay in the Java
> ModelView. This editor edits layout only.*

Eso evita las dos formas en que muere históricamente todo WYSIWYG: que el editor pase a ser la
fuente de verdad y el código quede degradado a generado (los GUI designers de Swing/WinForms), o
que el editor mantenga **su propio motor de render** y este derive del de producción (Dreamweaver).
Aquí la verdad es una declaración, y el canvas es el renderer real vía la acción `__preview__`.

### 10.1 Los tres canales producen la misma declaración

Esto colapsa las secciones 6.3 y 8 en una sola idea, y es probablemente la formulación más útil de
todo el documento:

| Canal | Autor | Salida |
|---|---|---|
| **Código** (anotaciones / interfaces) | desarrollador escribiendo | declaración |
| **Conversación** (`the-mateu-way` + skill `mateu-screen` + LLM) | desarrollador hablando | declaración |
| **Manipulación directa** (visual editor) | desarrollador/diseñador arrastrando | declaración |

> **La declaración es el producto. La UI nunca es autoría.**

Los tres capturan intención de forma distinta y alimentan **el mismo motor de derivación**. Así
desaparece la tensión aparente entre tener un WYSIWYG y sostener que "el código generado diverge"
(sección 8): el editor no autora UI, autora declaración — exactamente igual que el LLM.

**Invariante que conviene escribir antes de que alguien lo rompa:**

> El editor visual no debe poder expresar nada que la declaración no pueda expresar. El día que
> pueda, se ha bifurcado.

### 10.2 El editor es hoy una puerta de un solo sentido fuera de la inferencia

Si el YAML lleva un `layout` explícito, esa página **sale del régimen de inferencia para siempre**
— *explicit always wins*, por diseño (sección 6.1). Consecuencia:

> En cuanto alguien arrastra un campo, esa pantalla deja de re-derivarse cuando cambia el modelo.

Y **esta es la divergencia que de verdad importa ahora**: no la de datos (resuelta — el manifest no
lleva datos de negocio), sino **layout que dejó de seguir al modelo**. Añades un campo al record y
la pantalla no lo muestra; renombras uno y el layout apunta a un fantasma.

**Dirección a explorar:** que el YAML guarde el **delta sobre el layout inferido, no una foto del
layout completo**. Un parche en vez de un snapshot. Un cambio de modelo sigue re-derivando y el
delta se reaplica encima — o falla ruidosamente, que también sirve. Es más caro de implementar,
pero es la diferencia entre *"el editor te saca del framework"* y *"el editor te deja quedarte
dentro"*.

**Pregunta abierta.** La verdad de una pantalla vive ahora en **dos ficheros** (YAML de layout +
Java ModelView). ¿Hay validación cruzada de que el layout referencia campos que existen? Precedente
en casa: EventConductor ya valida `.ecform` contra esquema.

### 10.3 Las fuentes REST cambian la naturaleza del wire

Antes el wire llevaba *la UI*. Ahora lleva además **un plan de fetch** (`optionsSource`,
`rowsSource`, `restAction`, `restData`). Es una ampliación real del contrato, y una que **todo
renderer debe implementar** — así que entra de lleno en el contrato de renderer de la sección 4 y
en el corpus de conformidad de la sección 2.

**El trato del modo sin servidor**, que debería estar escrito y no descubrirse:

> Sin servidor Mateu, tus endpoints quedan **expuestos directamente al navegador**: CORS abierto, y
> la única autenticación posible es la que el navegador puede sostener.

Lo notable es que la mitigación ya existe — `proxy = true` con inyección de `${secret.X}` en
servidor — pero es justamente lo que **no está disponible** en el modo donde más falta haría. No es
un fallo, es el trato; pero un cuadro de "esto es lo que estás firmando" en la doc evita que alguien
publique sus claves.

### 10.4 La pregunta estratégica: ¿puerta principal o puerta lateral?

Sumando editor visual + fuentes REST + static bundle, alguien puede construir y desplegar una UI
**sin escribir jamás una clase `@UI`**: sin modelo, sin inferencia y sin derivación. Es decir, sin
nada de la tesis fundacional (sección 1).

Eso es un **tercer producto**, con otro mercado y otros competidores (Retool, Appsmith, Budibase,
el propio Visual Builder de Oracle). Es probablemente el mayor desbloqueo de alcance de todo el
documento (sección 0.2) — y también el que más puede diluir lo distintivo, porque en ese modo la UI
**sí** se autora y por tanto **sí** puede divergir.

Las dos respuestas son legítimas y llevan a productos distintos:

| | Puerta principal | Puerta lateral |
|---|---|---|
| **README lidera con** | "construye tu UI sobre cualquier API REST, con o sin backend" | la tesis derivada; el modo sin servidor es rampa de entrada |
| **El modo Java pasa a ser** | "y además tiene un modo code-first muy potente" | el destino natural al que se llega |
| **Alcance** | máximo | alto, pero por conversión |
| **Riesgo** | competir con Retool/Appsmith/VB, bien financiados | dejar alcance sobre la mesa |
| **El foso de la sección 8** | desaparece (en ese modo la UI se autora) | intacto |

**Recomendación (pero es decisión de producto, no técnica): puerta lateral.** El foso identificado
en la sección 8 — *un modelo, muchos renderers, sin divergencia* — es lo único que ningún
competidor de esa lista tiene, y en el modo puerta-principal se renuncia a él justo en el escaparate.
El modo sin servidor rinde más como **on-ramp** ("pruébalo en 5 minutos sin instalar nada") que como
propuesta principal.

---

## Orden sugerido de ataque

| # | Tema | Coste | Impacto | Notas |
|---|---|---|---|---|
| 9.2 | Política de bundle vs identidad (audience/permisos/i18n) | bajo | **alto** | es una frontera de **seguridad**; hoy el exporter no distingue |
| 10.3 | Documentar "el trato" del modo sin servidor | muy bajo | **alto** | evita que alguien publique sus claves; `proxy` no existe justo ahí |
| 10.4 | Decidir: puerta principal o lateral | — | **alto** | decisión de producto que ordena README, doc y onboarding |
| 6.1 | Escribir la regla de autoría (tres ejes + criterio) | muy bajo | **alto** | media página; explica autoría **y** despliegue (9.1) |
| 6.2 | Declarar el techo de la inferencia | muy bajo | alto | evita perseguir una fase 3 imposible por construcción |
| 3 | Reconciliar la matriz de capacidades | muy bajo | **alto** | la matriz *es* la API; hoy promete un renderer retirado |
| 8 | README: derivación vs generación | muy bajo | alto | la mitad no depende de nada; ordena el discurso |
| 5 | `contract.json` único | bajo | medio | elimina una clase de bug silencioso |
| 9.3b | Sellar un hash de estructura en el manifest | bajo | alto | convierte el bundle en caché en vez de fork; sostiene la tesis de 8 |
| 6.3 | Métrica de anotaciones por pantalla | bajo | alto | disciplina la tesis con un número, no con un documento |
| 9.3a | Pinear el conjunto bundleable en CI | bajo | medio | hoy una ruta se cae del bundle y solo lo dice el log |
| 2 | Corpus de conformidad del wire | alto | **alto** | habilita 3 y 4; sin esto la paridad escala con tu memoria |
| 4 | Contrato + conformidad de renderer | alto | **alto** | el multiplicador real de alcance; 4 renderers retirados lo justifican |
| 7 | Rampa de escape en dos altitudes | medio | alto | criterio: que duela menos que haberla escrito a mano |
| 10.2 | YAML del editor como delta, no como snapshot | alto | **alto** | hoy tocar una pantalla en el editor la saca de la inferencia para siempre |
| 8b | "La IA escribe la declaración" como dirección | medio | **alto** | lo más diferenciador y lo menos desarrollado; depende de 6.1–6.3 y 10.1 |

Tres observaciones sobre el orden:

- **9.2 y 10.3 encabezan aunque no sean lo más barato**: son las dos únicas filas del documento que
  tocan una frontera de **seguridad** — estructura personalizada servida a quien no le corresponde,
  y credenciales expuestas al navegador — y no calidad o velocidad. El resto puede esperar; estas
  dos se pagan con un incidente.
- Las filas 6.1, 6.2, 3 y 8 son **texto, no código**, y suman probablemente un día de trabajo entre
  todas. Buena parte de lo que este documento identifica como riesgo se mitiga escribiendo cosas
  que ya sabes pero que solo están en tu cabeza — que es precisamente el problema cuando el
  proyecto pasa de herramienta propia a producto (sección 0.2).
- Las dos grandes (2 y 4) son la misma idea aplicada a los dos lados de la cintura: **convertir
  "seguir a Java" en "cumplir la spec"**, para que la extensión la pueda hacer alguien que no seas
  tú. Son la condición para que "cuanta más gente se beneficie, mejor" (sección 0.2) no dependa de
  tu ancho de banda.
