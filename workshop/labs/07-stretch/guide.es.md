# Lab 07 · Labs extra (cuando tengas tiempo)

*[English](guide.md)* · Elige cualquiera; ninguno depende de otro.

## A. Empieza desde otra plantilla (Java)

*New Project › Mateu* tiene una galería de plantillas. Genera una junto a tu proyecto del taller y
lee lo que declara:

- **Dashboard + listings**: KPIs y gráficos calculados a partir de los datos, un listado de Orders de solo lectura con búsqueda.
- **Wizard-driven intake**: un asistente de varios pasos con una rama y una revisión final.
- **Operations: board + calendar**: un tablero kanban cuyas tarjetas se mueven en el servidor, y las mismas tareas en un calendario.

Cada una son unas pocas clases; arráncala y cuenta el código de frontend (cero).

## B. La misma app en otro runtime Java

Genera el CRUD de productos en **Quarkus**, **Micronaut**, **Helidon MP** o **Spring WebFlux** y copia
tu `Quote`. Las clases no cambian; solo el runtime y su procesador de anotaciones.

## C. Que tu asistente de IA construya una pantalla

El plugin de Mateu para Claude Code conoce la API (el proyecto generado ya lo activa en
`.claude/settings.json`; confía en la carpeta y luego `/plugin install mateu@mateu`). Pide:
*"Añade un CRUD de Customers con nombre, e-mail y un indicador VIP, una entrada de menú y un test de
UI."* Después ejecuta `mvn test` / `dotnet test` / `pytest`: el arnés del lab 03 comprueba lo que
escribió.

## D. Manejar la sesión en vivo de un usuario desde el servidor — *llega en la próxima versión*

> **No está en 3.0-beta.64.** Al escribir esto se está construyendo en una rama y no ha llegado a
> `master` ni a una versión publicada. No lo intentes con la versión del taller.

El plan: un agente emparejado con la UI abierta de un usuario (como en el lab 05) lee la pantalla que
está viendo (`mateu_get_session_screen`), rellena campos (`set_session_fields`) y ejecuta una acción
(`run_session_action`); el usuario lo ve pasar y tiene la última palabra. Cuando salga, este lab lo
recorrerá sobre la pantalla Quote.

## E. La app de escritorio como servidor MCP — *llega en la próxima versión*

> **No está en 3.0-beta.64.** Existe en una rama, no en una versión publicada.

Una opción en *Settings › Mateu › AI agents (MCP)* de la app de escritorio la convertirá en servidor
MCP, para que un agente maneje las UIs que tienes abiertas en ella.

## F. Lleva tu UI YAML al móvil

Despliega el `target/mateu-bundle` del lab 04 en cualquier hosting estático con https (Netlify drop,
GitHub Pages con fallback de SPA, S3…) y añade su dirección en la app Mateu: el móvil dibuja la misma
UI estática de forma nativa. (La app de escritorio no abre bundles estáticos.)
