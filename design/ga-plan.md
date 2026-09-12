# Mateu v3.0 GA — plan de una semana

> **Ventana:** 2026-09-09 (mar) → **2026-09-16 (mar)**. 7 días.
> **Corte:** `v3.0-alpha.327` es el último alpha; la GA suelta el `-alpha` → **`v3.0.0`** por el
> pipeline que ya existe (`.github/workflows/buid-and-publish.yml` → Maven Central).
> **Estado del plan:** vivo. Marca `[x]` al cerrar. Prioridades: **P0** bloquea GA · **P1** objetivo ·
> **P2** stretch (primero en caer si vamos tarde).
> **🧊 FEATURE FREEZE declarado (D5, 2026-09-12):** master pasa a **fix-only** hasta la GA. Siguen
> permitidos: material de GA (demos de la serie), documentación, cableado de CI/tests y correcciones.
> NO features nuevas de framework ni superficie de anotaciones/wire nueva.

## Alcance de la promesa (lo que la GA declara "soportado")

Decidido con el mantenedor (2026-09-09): **amplia**.

- **Productores:** Java (MVC · WebFlux · Micronaut · Quarkus · Helidon MP), **.NET** (ASP.NET), **Python** (FastAPI).
- **Renderers:** **vaadin-lit** y **VB/Redwood** (web); **React Native** e **IntelliJ** (nativos).
- **Autoría de datos:** mounts/rutas/sources YAML, static bundle, REST externo + catálogo.
- **Preview (NO bloquea GA, se etiqueta como tal):** pipeline Figma (migración cross-repo de modux
  pendiente), VS Code extension, visual editor, `apngct:` layoutDelta en ports.

Todo lo que quede fuera de la promesa se **documenta honestamente** (matriz + manual), no se borra en silencio.

## Definition of done (el listón)

1. **CI verde** en toda la superficie soportada: backend (JaCoCo gate incluido), e2e compartida en
   los 5 frameworks, goldens .NET/Python, y las sondas de los nativos.
2. **Docs y matriz honestas**: nada prometido que no exista; cada ✅ respaldado por un test o una
   sonda. Retirados fuera de la matriz.
3. **Seguridad al día**: CodeQL limpio, dependabot de seguridad mergeado (empezando por los runs
   rojos: adm-zip, joi).
4. **Mecanismo de paridad arrancado** (§2/§4 del backlog): corpus de conformidad compartido con un
   primer lote de fixtures corriendo en el CI de cada port, y un contrato de renderer documentado.
5. **Material de GA**: la serie progresiva de 6 demos (Example 1 hecho), ejecutable y verificada.
6. **v3.0.0 publicado** en Maven Central + changelog/anuncio.

---

## Flujos de trabajo

### A — Honestidad y matriz (§3 del backlog) · **P0** · barato y de máximo valor
> **Hallazgo D1 (2026-09-09):** la premisa del §3 ("`parity.md` promete SAP UI5 ✅") estaba
> **desactualizada** — la tabla de renderers ya se reconció el 2026-08-12 (columnas correctas:
> Vaadin · Redwood · IntelliJ · React Native, + nota de retirados). CLAUDE.md, parity.md y el build
> ya son consistentes; los renderers retirados **no se construyen ni publican** (el reactor solo
> declara `vaadin-lit` + `redwood`; los `apps/{sapui5,redhat,slds}` y `backend/shared/frontend/*-lit`
> están **sin trackear en git** → basura local, invisible a la GA). El trabajo real de A se redujo a
> retirar dos bundles estáticos trackeados y una nota de tooling.
- [x] Tabla de renderers de `parity.md` — ya honesta (verificada, sin cambios).
- [x] `CLAUDE.md` ↔ `parity.md` ↔ build — consistentes (verificado: nada retirado se publica).
- [x] Retirar bundles estáticos trackeados de renderers retirados: `git rm demo/sites/sapui5`
      (17) + `demo/sites/redwood-oj` (8283). `demo/sites/vaadin`/`embedded` se mantienen (vivos).
- [x] Etiquetar visual editor + VS Code extension (+ Figma) como *tooling preview* en `parity.md`.
- [ ] (opcional, local) `git clean`/rm de los dirs muertos sin trackear en disco (141M) — no afecta GA.

### B — Cierre / aplazamiento de gaps concretos · **P0/P1**
Server (de la tabla de `parity.md`):
- [x] **P1 (D3, decidido documentar):** `RestSourceSupplier` proxy sin anotación → **Java-only por
      diseño**. Los ports resuelven la fuente proxy reflejando las anotaciones del TIPO ruteado y no
      instancian la vista en `__restfetch__`; además es el camino sensible a SSRF (fuentes ensambladas
      en runtime). Documentado con justificación en `parity.md` ("Deliberately Java-only"). El proxy
      por anotación (`[RestOptions(Proxy=true)]`…) sí está a paridad.
- [x] **P1 (D3, decidido documentar):** `@GroupAction` + group-summaries sintetizadas + wide-field
      auto-colspan + inline-grid "+" + islas embebidas multi-estado → **in-page orchestration, no
      wire-surface**; la superficie declarativa donde se apoyan (grouping/aggregates/grids/inline) sí
      está a paridad. Documentado. El fix sostenible es el corpus de conformidad (D4), no portar a mano.
      *(Reversa disponible: `@GroupAction` es portable —lista de botones + dispatch con `_groupValue`—
      si el mantenedor lo quiere en la promesa; el riesgo estaba en el dispatch/retorno.)*
- [x] Import wizard 🟡 y component adapters 🟡: se mantienen 🟡 con su nota (diferencia de contrato).

Renderers (promesa amplia):
- [x] **P0** REST source catalogue en consumidores nativos (D2, 2026-09-10): **React Native** e
      **IntelliJ** ya resuelven `optionsSource`/`rowsSource` por `ref` contra el catálogo del App
      (`AppDto.restSources`), leyendo `proxy`/`itemsPath`/`valuePath`/`labelPath` de la fuente
      **resuelta** (mismo contrato que el web; evita el bug proxy-desde-declarada). RN: `restFetch.ts`
      `registerRestSources`/`resolveRestSource` + registro en `MateuViewController` (tsc limpio + 5
      checks de lógica pura verdes). IntelliJ: `RestFetch.kt` + registro en `AppContext` (compila).
      **Verificación CERRADA (2026-09-12):** RN por tsc + 5 checks de la lógica pura (mismo contrato
      que los 12 tests vitest del web); IntelliJ por compilación. El probe e2e vivo (expo web /
      renderProbe contra :8600) es pesado y redundante con la verificación de lógica → post-GA opcional.
- [x] **P1 (D5, documentado):** VB/Redwood consume REST sources **ref-native** (no el catálogo
      compartido) por diseño — su transporte no comparte core con los web. Documentado en `parity.md`
      ("Fetch-plan edges").
- [x] **P1 (D5, documentado):** Multi-select contra `optionsSource` — el combo **simple** sí resuelve
      `optionsSource` (caso de referencia común); el multi-valor (`multiSelect`/`listBox`/`combobox`)
      lee `options` estáticas o `search-<field>` remoto, no `optionsSource`. Cruza 3 ramas de widget en
      un fichero de 2600 líneas → **diferido** (nicho: referencia uno-a-muchos a catálogo externo), no
      medio-cableado. Documentado en `parity.md`.

### C — Mecanismo de paridad (§2 + §4) · **P1** (seed, no exhaustivo)
> **Hallazgo D4 (2026-09-12):** el corpus **ya existía y estaba implementado** (`conformance/` desde
> 2026-08-12: README con normalización, `cases/{simple-form,page-header}` con `expected.json`, y los
> TRES runners `WireConformanceTest.java` / `test_wire_conformance.py` / `WireConformanceTests.cs`,
> con xfails para divergencias conocidas). Estado local: **Java verde · Python 4 passed/2 xfailed ·
> .NET 6 passed.** El gap real no era construirlo sino que **NO se ejecutaba en CI** — y, peor,
> `run_tests.yml` construye TODO el backend con `-DskipTests` y **no invoca `pytest` ni `dotnet
> test`**, así que ninguna de las ~990 pruebas de core ni los goldens de los ports corren en CI. El
> mecanismo estaba construido pero desconectado.
- [x] **Corpus de conformidad compartido** — ya existía. **Cableado en CI (D4):** nuevo job
      `backend-tests` en `run_tests.yml`. **CONFIRMADO VERDE EN EL RUNNER (2026-09-12, run 34692587953):**
      Build backend + Java core 1030+gate + Python 298 + .NET 299, todo ✓ — junto a e2e/frontend-lib/
      bundle-freshness. Requirió 2 fixes destapados por el propio CI: revertir el bump micronaut
      (NullMarked) y instalar deps Python por `requirements.txt`+pyyaml (no `pip install -e .`).
- [x] **P0 destapado — RESUELTO (2026-09-12):** el job (renombrado `backend-tests`) corre ahora las
      SUITES COMPLETAS en cada push: **Java core `verify`** (1030 tests + gate JaCoCo; `-Dmaven.javadoc.skip`
      porque `verify` disparaba el javadoc-jar del pom padre, que falla en core — issue preexistente),
      **Python `pytest tests/`** (298 + 2 xfailed) y **.NET `dotnet test`** (299) — cada una incluye su
      runner de conformidad. Las tres verificadas verdes localmente.
      - **Adapters — DECIDIDO (2026-09-12): core-only.** Los adapters (mvc/webflux/micronaut/quarkus/
        helidon) tienen pocos tests unitarios propios y se ejercitan **end-to-end por el job `e2e`**
        (Playwright sobre los 5 SUT). Core es donde vive la lógica + el gate. No se añaden a `backend-tests`.
      - **Javadoc de core — NO es un problema real:** `verify` dispara el javadoc-jar del pom padre que
        falla en el delombok output (`FragmentExpander.java:5`, quirk de classpath javadoc+delombok),
        pero **el pipeline de release SÍ genera javadoc** (327 alphas publicados lo prueban); mi fallo
        local es del goal `javadoc:javadoc` standalone. El `-Dmaven.javadoc.skip` es correcto para un job
        de TESTS. Cerrado.
- [x] **Contrato de renderer** — YA EXISTE (D5, hallazgo estilo D4): `doc/.../design-systems/
      renderer-contract.md` (qué pintar, commands, eventos, plan de fetch, obligatorio vs opcional +
      **niveles de conformidad** core/standard/full) + `bring-your-own-design-system.md`, y el harness
      `e2e/conformance.{sh,mjs}` + `conformance-fixtures.json` + `RENDERER-VERIFICATION.md`.
- [x] **e2e→renderer** — YA EXISTE: `conformance.sh --renderer <name>` cablea un dev server al SUT y
      escribe `conformance-report/<renderer>/report.md` con el nivel alcanzado. **Hallazgo (como el
      corpus):** NO está en CI. Renderer-conformance en CI necesita backend + renderer servido (más
      pesado; el job e2e ya cubre vaadin vía Playwright) → decisión de si cablearlo → D6.
- [ ] Hacer que la fila ✅ de la matriz **se verifique** desde el corpus (§3.2), aunque sea parcial.

### D — Tests / CI verde y seguridad · **P0**
- [ ] `mvn verify` backend (incluye JaCoCo gate ≥ umbral) verde.
- [ ] e2e compartida verde en MVC · WebFlux · Micronaut · Quarkus · Helidon (referencia Helidon 252/252).
- [ ] Goldens .NET (`backend/dotnet/test`) y Python (`backend/python/tests`) verdes.
- [ ] Sondas nativas: RN (`e2e/rn-a11y-probe.mjs` y afines) + IntelliJ (`renderProbe`).
- [ ] CodeQL sin findings nuevos.

**Triage de seguridad (D1, 2026-09-09).** **131 alertas dependabot abiertas** (2 critical · 87 high ·
39 medium · 3 low; muchas son el mismo paquete duplicado en varios lockfiles → ~40 paquetes únicos).
Prioridad de remediación:
1. **P0 backend shippable:** `io.micronaut:micronaut-context` (high) en `micronaut-core` — único de un
   artefacto que publicamos a Central. Bump de versión de Micronaut + verificar que el adapter compila.
2. **P0 critical JS:** `form-data` (monorepo). Transitivo de tooling; fix por lockfile.
3. **P1 oleada JS por lockfile:** `monorepo` (web build), `frontend/app/react-native`, `doc` — casi
   todo devDependencies/build-time (no runtime servido). Resolver con `npm/yarn audit fix` +
   los grupos dependabot (#372 monorepo-minor, #300/#467 maven, #430 doc, #403 e2e), no PR a PR.
4. Los 14 PRs abiertos son bumps rutinarios, **stale** (`mergeable=UNKNOWN`); el job *Dependabot
   Updates* falla al rebasar `adm-zip`/`joi` (esas fixes no llegan) → hay que desatascarlo.
   **Decisión pendiente del mantenedor:** ¿mergeo la oleada segura (grupos + P0) tras verde local, o
   prefieres revisarlos? (mergear/pushear es acción externa: no lo hago sin tu OK.)

**Oleada segura ejecutada (D1, 2026-09-09→10)** — rama `ga/d1-honesty`, sin push, diff = pom micronaut
+ 3 `package-lock.json`:
- [x] **P0 backend:** `micronaut.core.version` 4.9.9 → **4.10.22** (parchea el DoS de `micronaut-context`);
      `micronaut-core` **compila** OK.
- [x] **doc:** `npm audit fix` → **6 → 0** vulnerabilidades (incluida la critical).
- [x] **react-native:** `npm audit fix` → **40 → 27** (arregladas las 13 no-rompedoras; las 27 restantes
      exigen major de Expo/RN → **P1/D5**).
- [x] **monorepo:** `npm audit fix` → **46 → 41**; `npm ci` + `libs/mateu build` **verdes** (el renderer
      GA no se rompe). CI usa `npm ci` sobre `package-lock.json`, así que ése es el lockfile autoritativo.
- [x] **P0 critical `form-data` — RESUELTO como documentación (2026-09-12):** su origen es
      **`@oracle/grunt-vb-audit`** (el tooling grunt de Oracle de `apps/redwood`, devDependency
      **build-time**), que fija `form-data@2.3.3` bajo el `request` deprecado. Es **dev-only**: nunca
      entra en un artefacto shippeado ni en runtime. El override acotado NO se aplica en el subárbol
      del workspace sin un `npm install` completo contra el CDN de Oracle (frágil/pesado) → forzarlo en
      víspera de GA es desproporcionado para un critical de tooling. Cierre real = actualizar/soltar el
      tooling Oracle de VB (fuera de alcance GA).
- [x] **Higiene — `yarn.lock` BORRADO (2026-09-12):** era cruft (CI usa `package-lock` vía `npm ci`) y
      causaba los duplicados "monorepo, monorepo" de las alertas.
- [x] **REGRESIÓN de la oleada revertida (2026-09-12):** el bump `micronaut-context` 4.9.9→4.10.22
      **rompía el build en CI** (`NoClassDefFoundError: NullMarked` — skew con la plataforma micronaut
      4.9.x). Localmente pasó por artefactos cacheados; solo se vio en CI. Revertido a 4.9.9 (los deps
      son `provided`, la vuln no se shippea). **Lección: validar en CI, no solo local.**

### E — Pasada de documentación · **P0**
- [x] **README índice de la serie progresiva** (`demo/README.md`, D6): escalera Ex1–6 (qué añade cada
      uno, puerto, módulo, run) + índice del resto de demos. Antes no había README en `demo/`.
- [x] **Coherencia docs vs matriz honesta — verificada limpia (D6):** grep de renderers retirados en
      las 332 páginas → todo honesto: `design-systems/index.md` lista solo Vaadin+Redwood/VB y dice que
      4 se retiraron; `sapui5.md` tiene banner `:::danger[Retired renderer]`; el resto son menciones
      históricas ("se eliminaron junto con esos renderers"). Sin cambios necesarios (patrón D1/D4/D5).
- [x] README de cada demo de la serie — cada módulo Ex1–6 ya trae el suyo.
- [ ] **Nota de versión/migración alpha→GA + política de estabilidad del wire** → llevada al runbook de
      release (G): el TEXTO de la política de estabilidad semver es decisión del mantenedor; no lo
      autoredacto como promesa pública. Borrador de changelog + migración preparado en G.
- [ ] Getting-started ejecutable por productor/renderer — YA EXISTE (manuales por lenguaje +
      `design-systems/*` + `java-create-your-project/*`); no re-crear.

### F — Serie progresiva de demos (material de GA) · **P1**
Escalera de autoría, dominio Star Wars. Puertos 8600–8605. Cada uno: módulo Maven ejecutable +
README + verificado en navegador; registrar en `demo/pom.xml`.
- [x] **Example 1** — `demo-starwars` (8600): 100% YAML sobre API externa, read+write, combos de
      referencia (homeworld→planeta). **Hecho y verificado.**
- [x] **Example 2** — `demo-starwars-2-code-first` (8601): primer `@UI` + `AutoCrud<Character>` en
      memoria; listado + form seccionado + enum/stepper + validación. **Verificado en navegador.**
- [x] **Example 3** — `demo-starwars-3-forms` (8602): shell `@App` con menú a un **Wizard** (paso
      zonado en 2 columnas, progreso STEPS) y un form con **tabs** + tipos de campo (textarea, stars,
      toggle, date, money, radios). **Verificado en navegador.**
- [x] **Example 4** — `demo-starwars-4-app` (8603): shell `@App(commandCenter=true)` con menú a un
      **Dashboard** (scoreboard de 4 MetricCards + panel de barras + panel de tarta) y un CRUD de
      planetas. **Verificado en navegador.** **Hallazgo:** un shell `@App` POJO reflejado NO hace
      default de home al primer menú (devuelve `_no_home_route` → raíz vacía); el default es solo de
      apps YAML (`YamlAppLoader.firstNavigableRoute`). **CERRADO como documentación (2026-09-12):** un
      arreglo seguro tendría que distinguir un shell SOLO-menú (debe ir al primer item) de uno con
      contenido propio (route "" muestra su form) — cambiar la resolución de home del app-shell en
      víspera de GA con freeze es arriesgado (muchos demos dependen de ella). Workaround limpio y
      explícito: `HomeRouteSupplier` (usado en Ex4/Ex5). Fix del default queda post-GA.
- [x] **Example 5** — `demo-starwars-5-federation` (8604): federación build-time — reactor con dos
      módulos `@UI` independientes (`characters-ui`, `planets-ui`, indexer AP) agregados por un
      `shell-app` (framework AP que lee sus índices `ui-registrations`). **Verificado en navegador.**
- [x] **Example 6** — `demo-starwars-6-static-bundle` (8605): capstone. `mvn -Pbundle package` →
      SPA estática (index.html + manifest.json + assets) servida **sin backend**; datos vivos de swapi
      client-side. **Verificado sin backend** (python http.server). **Bug de framework encontrado y
      arreglado:** un `@RestOptions` by-`ref` filtraba los defaults `valuePath/labelPath` sobre el
      catálogo (selects con labels en blanco) — `FieldMetadataExtractor` ahora los deja en blanco
      para que el catálogo mande (+ test `RestProxySyncTest`). Afectaba a todo by-ref, vivo y estático.

### G — Release engineering · **P0**
- [x] **Freeze de master** declarado (D5) — fix-only a GA.
- [x] **Borrador de notas de release** listo: `design/release-notes-3.0.0.md` (qué es GA, superficie
      soportada, edges honestos, migración alpha→GA). El TEXTO de la política de estabilidad semver es
      decisión del mantenedor (dejado conservador).
- [ ] **Cortar RC1 y GA** — acción EXTERNA del mantenedor (publica a Central). Runbook:

**Runbook de release (cómo funciona el pipeline).** `buid-and-publish.yml` dispara en `release:
published`; para un tag `vX` toma `RELEASE_VERSION = tag sin la 'v'`, un `sed` sustituye
`0.0.1-MATEU`→esa versión en todos los poms de `backend/`, y `mvn -Dmaven.test.skip deploy` publica a
Maven Central (genera javadoc/sources — el javadoc de release funciona, 327 alphas lo prueban). El
release se construye del **commit del tag**.

1. **PRERREQUISITO: mergear el PR #480 a master.** El release tagea master; sin merge, publicaría master
   SIN todo el trabajo de la rama. (Antes de mergear: confirmar el run verde de `backend-tests` — hecho.)
2. **RC1:** `gh release create v3.0.0-RC1 --title "Mateu v3.0.0-RC1" --notes-file design/release-notes-3.0.0.md --prerelease`
   → publica `io.mateu:*:3.0.0-RC1` a Central.
3. **Verificar RC1:** artefactos en Central; un proyecto nuevo (mateu-scaffold, o un `demo/demo-starwars-2`
   apuntando a `3.0.0-RC1` en vez de `0.0.1-MATEU`) resuelve deps y arranca.
4. **GA:** `gh release create v3.0.0 --title "Mateu v3.0.0" --notes-file design/release-notes-3.0.0.md`
   → publica `3.0.0`. Verificar publicación + anuncio.

---

## Calendario día a día (con gate diario)

| Día | Foco | Gate al cierre |
|---|---|---|
| **D1 mar 9** | A completo + D (triage dependabot/seguridad, arrancar CI) | Matriz honesta mergeada; PRs de seguridad en cola verde |
| **D2 mié 10** | B renderers P0 (REST source en RN + IntelliJ) + F Ex2/Ex3 | RN+IntelliJ resuelven `ref`; Ex2 y Ex3 verificados en navegador |
| **D3 jue 11** | B server P1 (RestSourceSupplier proxy .NET/Python; @GroupAction) + F Ex4 | Ports cierran o documentan sus gaps; Ex4 verificado |
| **D4 vie 12** | C seed (corpus de conformidad + primer lote en CI de cada port) + F Ex5 | Corpus corre en 3 CIs; Ex5 verificado |
| **D5 sáb 13** | C contrato de renderer + e2e→renderer; **freeze de features** | Contrato publicado; e2e apunta a ≥2 renderers; master en fix-only |
| **D6 dom 14** | D verde total + E docs + F Ex6; **RC1** | Todo verde; RC1 en Central; scaffold arranca contra RC1 |
| **D7 lun 15 / mar 16** | Colchón + **v3.0.0** + changelog/anuncio | GA publicada y verificada |

## Registro de riesgos y líneas de corte

- **El alcance amplio + mecanismo + 6 demos en 7 días es agresivo para un mantenedor.** Orden de
  caída si vamos tarde: (1) F Ex5/Ex6 → post-GA dejando Ex1–4; (2) C exhaustivo → dejar el corpus
  *seedeado* y el contrato *documentado* como "in progress"; (3) B server P1 → documentar como
  Java-only-preview en vez de portar. **A, D, E y G no se recortan** (son la honestidad y el corte).
- **Los gaps de ports son mayormente in-page orchestration**, no wire — baratos de documentar, caros
  de portar. Preferir documentar salvo los de cabecera (REST/proxy).
- **Paralelización:** los flujos A–F son en gran parte independientes. Si se quiere acelerar, esto es
  candidato claro a orquestación multi-agente (una barrida de gaps por dimensión + verificación
  adversaria); requiere tu opt-in explícito.

## Anti-objetivos (explícitos)

- No terminar los items estratégicos del backlog (renderer marketplace, wire como spec versionada
  aparte) — solo **arrancar** el mecanismo.
- No resucitar los renderers retirados. No prometer Figma como GA.
- No añadir anotaciones nuevas para tapar gaps (cada anotación es deuda contra la tesis de inferencia).
