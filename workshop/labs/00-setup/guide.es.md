# Lab 00 · Comprobación del entorno (antes del día, 5′)

*[English](guide.md)*

Ejecuta cada línea; la columna de la derecha es lo que lo demuestra. Arregla lo que falle **antes**
de la sesión: no te fíes de la red de la sala.

## Todos

| Comprobación | Comando | Deberías ver |
|---|---|---|
| El repositorio | `git clone https://github.com/miguelperezcolom/mateu.git && cd mateu/workshop` | `README.md`, `labs/` |
| JDK 21+ | `java -version` | `21` o superior |
| Maven 3.9+ | `mvn -v` | `Apache Maven 3.9` o superior |
| Node 20+ | `node -v` | `v20` o superior |
| Docker | `docker compose -f labs/06-sign-in/keycloak/compose.yml pull` | se descarga la imagen de Keycloak |
| Plugin del IDE | IntelliJ: *Settings › Plugins* → **Mateu** instalado · VS Code: *Extensions* → **Mateu** instalado | *File › New › Project…* muestra **Mateu** (IntelliJ) · *Mateu: New Project…* en la paleta de comandos (VS Code) |
| La app Mateu en el móvil | Ábrela | la pantalla **My UIs** |
| La app de escritorio Mateu | Ábrela | la ventana **My UIs** |
| Un agente con MCP | p. ej. `claude --version` | un número de versión |
| Calentar Maven | `cd labs/01-first-app/java/start && mvn -q -DskipTests package` | `BUILD SUCCESS` (también en C# y Python: el lab 04 necesita la caché de Maven) |
| Calentar el plugin del bundle | `cd labs/04-ui-as-data/start && mvn -q package` | existe `target/mateu-bundle/index.html` |

## Itinerario Java

| Comprobación | Comando | Deberías ver |
|---|---|---|
| Los tests pasan | `cd labs/01-first-app/java/start && mvn -q test` | sin fallos |

## Itinerario C#

| Comprobación | Comando | Deberías ver |
|---|---|---|
| SDK de .NET 10 | `dotnet --list-sdks` | una línea `10.0.x` |
| Los renderers | `tools/fetch-renderers.sh` | `renderers/mateu-vaadin.jar` y `renderers/mateu-redwood.jar` |
| Calentar NuGet | `cd labs/03-test-like-a-user/dotnet/solution && dotnet test Workshop.Tests` | `Passed!` |

## Itinerario Python

| Comprobación | Comando | Deberías ver |
|---|---|---|
| Python 3.11+ | `python3 --version` | `3.11` o superior |
| Los renderers | `tools/fetch-renderers.sh` | `renderers/mateu-vaadin.jar` y `renderers/mateu-redwood.jar` |
| Un virtualenv + los paquetes | `cd labs/03-test-like-a-user/python/solution && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt && pytest -q` | `passed` |

Guarda ese `.venv`: lo reutilizas en todos los labs de Python (vuelve a hacer
`pip install -r requirements.txt` en el lab 06, que añade un paquete).

✅ **Checkpoint**: todas las filas en verde. Los tests de tu itinerario pasan en tu máquina.
