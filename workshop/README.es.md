# Taller de Mateu — práctico, media jornada

*[Read in English](README.md)*

Declaras una UI una vez — en **Java, C# o Python**, o como **YAML** — y Mateu la dibuja: en la web con
dos sistemas de diseño distintos, en un móvil, en una app de escritorio, para un agente de IA. En este
taller **tecleas**, no miras: cada lab termina con algo funcionando en tu máquina.

**Para quién**: desarrolladores que construyen aplicaciones de negocio. Elige **un itinerario**: Java,
C# (.NET) o Python. Los labs que no dependen del lenguaje (renderers en el móvil y el escritorio,
YAML, IA) son los mismos para los tres; solo cambian los labs de código.

**Versión de Mateu**: todos los labs fijan **3.0-beta.64**, la versión que usan los
[starters](../starters). Ningún lab compila Mateu desde el código fuente.

## Agenda

| Hora | | Lab | Con qué te vas |
|---|---|---|---|
| 0:00 | 10′ | Bienvenida — [diapositivas](slides.es.html) | Qué es Mateu y cómo va la tarde |
| 0:10 | 35′ | [01 · Tu primera app](labs/01-first-app/guide.es.md) | Una app generada en marcha; un campo y una pantalla tuyos |
| 0:45 | 30′ | [02 · Una UI, todos los renderers](labs/02-renderers/guide.es.md) | La misma app en Vaadin y en Oracle Redwood; una UI en tu móvil y en la app de escritorio |
| 1:15 | 25′ | [03 · Pruébala como un usuario](labs/03-test-like-a-user/guide.es.md) | Tests de UI que abren pantallas, escriben y pulsan, sin navegador |
| 1:40 | 15′ | *Descanso* | |
| 1:55 | 35′ | [04 · La UI como datos](labs/04-ui-as-data/guide.es.md) | Una UI YAML editada en el editor visual y publicada como bundle estático, sin backend |
| 2:30 | 30′ | [05 · Agentes de IA por MCP](labs/05-ai-agents/guide.es.md) | Un agente que lee y maneja tus pantallas, y te pone delante una pantalla que ha escrito |
| 3:00 | 30′ | [06 · Inicio de sesión](labs/06-sign-in/guide.es.md) | Login con Keycloak; un campo que solo ve un responsable |
| 3:30 | 15′ | Cierre + [07 · Labs extra](labs/07-stretch/guide.es.md) | Por dónde seguir |

Unas **3 h 45 min** con el descanso. Cada lab tiene **pasos extra opcionales** al final para quien
acabe antes; saltárselos nunca bloquea el lab siguiente.

## Antes del día (hazlo en casa — 20 minutos)

No te fíes de la red de la sala: descárgalo todo antes.

**Todos**

- Un IDE con el plugin de Mateu: **IntelliJ IDEA** (Settings › Plugins › Marketplace › "Mateu") o
  **VS Code** (Extensions › "Mateu"). El plugin trae el asistente New Project y el editor visual.
- **JDK 21+ y Maven 3.9+**, también en los itinerarios C# y Python: el lab 04 construye un bundle
  estático con un plugin de Maven.
- **Node.js 20+** (el lab 04 previsualiza el bundle con `npx serve`).
- **Docker** (el lab 06 arranca Keycloak). Descarga la imagen antes:
  `docker compose -f workshop/labs/06-sign-in/keycloak/compose.yml pull`.
- **Un móvil con la app Mateu**: [App Store](https://apps.apple.com/app/mateu/id6829227403) ·
  Android: [hazte tester](https://mateu.io/native/android-testers/) o instala el `-android.apk` de la
  [última versión](https://github.com/miguelperezcolom/mateu/releases/latest).
- **La app de escritorio Mateu** (macOS, Windows, Linux): el instalador `mateu-desktop-…` de la
  [última versión](https://github.com/miguelperezcolom/mateu/releases/latest). En macOS, el primer
  arranque de una build sin firmar necesita clic derecho › Abrir.
- **Un agente de IA con MCP** para el lab 05: Claude Code, Codex, Cursor, el modo agente de Copilot en
  VS Code… Cualquiera vale; la guía muestra los comandos de Claude Code.
- Este repositorio: `git clone https://github.com/miguelperezcolom/mateu.git` (los labs están en
  `workshop/labs`).

**Itinerario Java**: nada más (JDK 21 + Maven, arriba).

**Itinerario C#**: el **SDK de .NET 10** (`dotnet --list-sdks` muestra `10.0.x`). Después descarga
una vez los dos renderers web; tu app sirve aquel al que apunte `MATEU_UI`:
`workshop/tools/fetch-renderers.sh` (escribe `workshop/renderers/mateu-vaadin.jar` y
`mateu-redwood.jar`).

**Itinerario Python**: **Python 3.11+** y `pip`. Descarga también los renderers
(`workshop/tools/fetch-renderers.sh`) y calienta la caché de paquetes:
`pip download -d /tmp/wheels mateu-ui==3.0.0b64 fastapi uvicorn pytest httpx "pyjwt[crypto]"`.

**Compruébalo todo**: [lab 00 · Comprobación del entorno](labs/00-setup/guide.es.md), cinco
minutos, la misma lista con el comando que demuestra cada punto.

## Cómo están organizados los labs

```
workshop/
  README.md, README.es.md     esta página
  slides.html, slides.es.html las diapositivas (ábrelas en un navegador; ← → para moverte)
  labs/
    00-setup/                 guide.md + guide.es.md — la lista de comprobación
    01-first-app/             guide.md + guide.es.md
      java/   start/ solution/   ← un proyecto completo cada uno, generado desde starters/spring-mvc
      dotnet/ start/ solution/   ← desde starters/dotnet
      python/ start/ solution/   ← desde starters/python
    02-renderers/             java/ start/ solution/ (C# y Python no cambian código: el renderer es un fichero)
    03-test-like-a-user/      java/ dotnet/ python/
    04-ui-as-data/            start/ solution/  — común a los tres itinerarios (YAML, sin lenguaje)
    05-ai-agents/             java/ dotnet/ python/
    06-sign-in/               java/ dotnet/ python/ + keycloak/ (fichero compose y realm)
    07-stretch/               solo guía
  tools/
    build-labs.mjs            regenera cada start/ y solution/ desde los starters
    steps/                    lo que añade cada lab (el único código de lab escrito a mano)
    fetch-renderers.sh        descarga mateu-vaadin.jar y mateu-redwood.jar para C# y Python
  verify.sh                   compila y prueba cada lab, inicio y solución, en los tres lenguajes
```

- **Cada lab empieza en la solución del anterior.** ¿Te has quedado atrás? Abre el `start/` del lab y
  sigue: está exactamente donde deberías estar.
- **`start/` y `solution/` se generan**, nunca se mantienen a mano: `tools/build-labs.mjs` ejecuta el
  generador de New Project (el mismo motor que los asistentes de IntelliJ y VS Code y el arquetipo
  Maven) sobre `starters/`, y copia encima los pasos de `tools/steps/<lenguaje>/<lab>/`. Cambia un
  starter y los labs le siguen.
- Cada guía dice **qué teclear**, **qué deberías ver**, y termina con un **✅ checkpoint**: si lo ves,
  sigue; si no, compara con `solution/`.

## Para quien imparte

- `workshop/verify.sh` compila y prueba el inicio y la solución de cada lab contra la versión
  publicada (Maven Central, NuGet, PyPI): ejecútalo antes de la sesión y en CI. Un itinerario sin su
  toolchain sale como SKIPPED, nunca como aprobado.
- Tras una versión, `scripts/bump-example-version.sh <versión>` mueve los starters **y** los labs;
  `node workshop/tools/build-labs.mjs --check` (lo ejecuta `verify.sh`) falla si se han separado.
- Móviles y escritorio: el lab 02 usa las **UIs públicas de demo** (`museums.ec1.mateu.io`,
  `space.ec1.mateu.io`, `frontoffice.ec1.mateu.io`, CORS abierto), así nunca dependen de que la red de
  la sala alcance un portátil. Abrir en el móvil la app del propio portátil es un paso opcional.
- Imprime o proyecta los códigos QR de las UIs públicas de `labs/02-renderers/guide.es.md`.
- **Huecos conocidos en esta versión** (también en las guías): en C# y Python el renderer Redwood
  dibuja el shell pero no las pantallas (Java va bien); el servidor MCP propio de la app de
  escritorio, manejar una sesión en vivo desde el servidor y el menú de usuario de la cabecera están
  en `master` o en una rama, no en la versión publicada.
- **Qué comprobó una máquina y qué no**: el inicio y la solución de cada lab compilan y pasan sus
  tests (`verify.sh`); las pantallas, el cambio a Redwood, el bundle estático, el endpoint MCP y el
  envío a una UI abierta, y el login con Keycloak se ejecutaron de punta a punta en un navegador. Los
  pasos de móvil y escritorio necesitan una persona con el dispositivo: se comprobaron las
  direcciones de las UIs públicas, sus manifiestos y los QR (decodificados de vuelta), no se manejaron
  las apps.
