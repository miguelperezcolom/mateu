# Mateu v3.0 GA — plan de una semana

> **Ventana:** 2026-09-09 (mar) → **2026-09-16 (mar)**. 7 días.
> **Corte:** `v3.0-alpha.327` es el último alpha; la GA suelta el `-alpha` → **`v3.0.0`** por el
> pipeline que ya existe (`.github/workflows/buid-and-publish.yml` → Maven Central).
> **Estado del plan:** vivo. Marca `[x]` al cerrar. Prioridades: **P0** bloquea GA · **P1** objetivo ·
> **P2** stretch (primero en caer si vamos tarde).

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
- [ ] **P1** `RestSourceSupplier` proxy sin anotación: .NET ❌ / Python ❌ → portar, o documentar como
      Java-only-preview (REST/proxy es feature de cabecera → preferimos portar).
- [ ] **P1** `@GroupAction` y group-summaries sintetizadas para `Listing`s: — en ports → portar o documentar.
- [ ] **P2** layoutDelta en ports (visual builder) → queda preview.
- [ ] **Documentar como Java-only** (el backlog los llama "in-page orchestration, not wire surface"):
      wide-field auto-colspan, inline-grid "+", islas embebidas multi-estado.
- [ ] Import wizard 🟡 y component adapters 🟡: mantener 🟡 con su nota (diferencia de contrato, no gap).

Renderers (promesa amplia):
- [x] **P0** REST source catalogue en consumidores nativos (D2, 2026-09-10): **React Native** e
      **IntelliJ** ya resuelven `optionsSource`/`rowsSource` por `ref` contra el catálogo del App
      (`AppDto.restSources`), leyendo `proxy`/`itemsPath`/`valuePath`/`labelPath` de la fuente
      **resuelta** (mismo contrato que el web; evita el bug proxy-desde-declarada). RN: `restFetch.ts`
      `registerRestSources`/`resolveRestSource` + registro en `MateuViewController` (tsc limpio + 5
      checks de lógica pura verdes). IntelliJ: `RestFetch.kt` + registro en `AppContext` (compila).
      Pendiente probe e2e contra starwars :8600 (expo web / renderProbe) → verificación D5.
- [ ] **P1** VB/Redwood: consumir REST sources (hoy ref-native) → cerrar o documentar como ref-native.
- [ ] **P1** Multi-select contra `optionsSource`: las ramas `multiSelect`/`combobox` de `mateu-field`
      no leen `optionsSource` (encontrado hoy en swapi) → soportarlo, o documentar el límite.

### C — Mecanismo de paridad (§2 + §4) · **P1** (seed, no exhaustivo)
- [ ] **Corpus de conformidad compartido**: extraer los goldens per-port a N fixtures declarativos
      equivalentes en los 3 lenguajes → payloads golden versionados en un artefacto propio que
      **cada port ejecuta en su CI**. Objetivo semana: montar el corpus + primer lote + cablearlo.
- [ ] **Contrato de renderer** documentado: qué DTOs pintar, qué `commands` honrar, qué eventos
      emitir, qué plan de fetch ejecutar, obligatorio vs opcional + **niveles de conformidad**.
- [ ] Apuntar la suite e2e compartida a **renderers** (al menos vaadin + un segundo), no solo backends.
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
- [ ] **P0 critical restante:** `form-data` (2×) bajo el paquete **deprecado `request`** en una workspace
      de apps/*. Fix limpio no-rompedor = override acotado en el `package.json` raíz:
      `"overrides": { "request": { "form-data": "^2.5.6" } }`. Requiere `npm install` COMPLETO del
      monorepo (baja el tooling Oracle de redwood) + rebuild para verificar → **hacerlo en D5**.
- [ ] **Higiene:** el monorepo tiene DOS lockfiles (`package-lock.json` + `yarn.lock`); CI solo usa el
      primero. `yarn.lock` es cruft y es la causa de los duplicados "monorepo, monorepo" en las alertas
      → **borrarlo** (decisión del mantenedor; elimina ~la mitad del ruido de alertas).

### E — Pasada de documentación · **P0**
- [ ] Getting-started ejecutable por productor (Java/.NET/Python) y por renderer (vaadin/VB/RN/IntelliJ).
- [ ] Auditar que las 332 páginas no contradigan la matriz honesta (grep de renderers retirados).
- [ ] Nota de versión / migración alpha→GA + política de estabilidad del wire.
- [ ] README de cada demo de la serie (auto-documentación, como Example 1).

### F — Serie progresiva de demos (material de GA) · **P1**
Escalera de autoría, dominio Star Wars. Puertos 8600–8605. Cada uno: módulo Maven ejecutable +
README + verificado en navegador; registrar en `demo/pom.xml`.
- [x] **Example 1** — `demo-starwars` (8600): 100% YAML sobre API externa, read+write, combos de
      referencia (homeworld→planeta). **Hecho y verificado.**
- [ ] **Example 2** — code-first: primer `@UI` + `AutoCrud` en memoria (8601). *pom ya creado.*
- [ ] **Example 3** — formularios ricos: wizard + zones/tabs/secciones + tipos de campo (8602).
- [ ] **Example 4** — arquetipos + app shell: dashboard, listados, command center, navegación (8603).
- [ ] **Example 5** — federación: shell + módulos (8604).
- [ ] **Example 6** — static bundle a CDN, sin backend (8605), sobre el patrón de `demo-static-bundle`.

### G — Release engineering · **P0**
- [ ] Congelar `master` para features (solo fixes) a partir de D5.
- [ ] Ensayo: cortar **`v3.0.0-RC1`** por el pipeline real, verificar artefactos en Central y que un
      proyecto nuevo (mateu-scaffold) resuelve `0.0.1-MATEU`→`3.0.0-RC1` y arranca.
- [ ] Changelog de GA (resumen de la línea alpha) + notas de release.
- [ ] Cortar **`v3.0.0`** (`gh release create v3.0.0 …`), verificar publicación y anuncio.

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
