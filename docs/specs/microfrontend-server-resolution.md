# Spec Mateu: microfrontend resuelto en servidor y @ContentSlot

## Contexto y objetivo

Mateu gana un modo de resolución en servidor para el componente microfrontend y una anotación `@ContentSlot` construida sobre él. El primer consumidor es el servicio de contenido de RIU (intranet de comunicación interna y contenido editorial dentro de cualquier UI).

Hoy el microfrontend se resuelve en el cliente: el renderer recibe una referencia, pide al remoto un JSON de UI independiente del renderer y lo pinta con sus componentes nativos. Eso es correcto para fragmentos grandes o con vida propia, pero penaliza el caso de varios fragmentos pequeños por pantalla: una petición extra por fragmento, salto de layout, token del usuario viajando desde el cliente y fallback gestionado por cada renderer.

Objetivos:

- Poder resolver un microfrontend en el servidor del host al construir la vista, incrustando su JSON en la respuesta.
- Que el modo servidor nunca empeore el actual: si el remoto no responde a tiempo, se degrada a resolución en cliente.
- Ofrecer `@ContentSlot` como especialización del microfrontend para huecos de contenido gestionado, con clave estable, fallback y registro generado en compilación.

## Alcance y no-objetivos

Entra en esta spec:

- Atributo de modo de resolución en el microfrontend: `CLIENT` (por defecto, comportamiento actual) y `SERVER`.
- Resolución en servidor con peticiones en paralelo, presupuesto de tiempo y degradación a cliente.
- Propagación de identidad y de ID de correlación del host al remoto.
- Lista de remotos permitidos y caché declarada por el remoto.
- Anotación `@ContentSlot` y generación del registro de slots en compilación.

Fuera de esta spec:

- El servicio de contenido, su modelo de audiencias y la intranet (spec aparte).
- Cambios en el comportamiento por defecto de los microfrontends existentes.
- Un modo `AUTO` que elija el modo por heurística. Se valorará cuando haya datos de uso.
- Proxy de la interacción del fragmento a través del host.

## Diseño

El modo `SERVER` solo cambia dónde se obtiene el JSON para el primer pintado; el fragmento sigue perteneciendo al remoto.

```java
@MicroFrontend(url = "...", resolve = Resolve.CLIENT)   // por defecto, como hoy
@MicroFrontend(url = "...", resolve = Resolve.SERVER, timeoutMs = 150)
```

### Flujo de resolución en servidor

1. Al construir la vista, el host recoge todos los microfrontends con `resolve = SERVER`.
2. Comprueba que cada URL pertenece a un remoto registrado. Si no, error de configuración (no se degrada).
3. Lanza las peticiones en paralelo, con identidad del usuario e ID de correlación.
4. Espera hasta el presupuesto de tiempo de la vista (el máximo de los `timeoutMs`, con un tope global configurable).
5. Cada fragmento que llega a tiempo se incrusta en la respuesta; cada uno que no llega, falla o devuelve error se envía como referencia `CLIENT`, igual que hoy.
6. Las peticiones que vencen se cancelan; no siguen consumiendo en el servidor.

### Origen del fragmento

Resolver no es absorber. El JSON incrustado conserva su origen (URL base del remoto), y toda acción disparada dentro del fragmento va al remoto, exactamente igual que si se hubiera resuelto en cliente. El host nunca hace de proxy de la interacción.

### Identidad

El host llama al remoto en nombre del usuario. Preferencia: token exchange con audiencia del remoto. Alternativa mínima: reenviar el token del usuario solo a remotos registrados. El mecanismo debe ser un punto de extensión (interfaz), no algo cableado.

### Remotos permitidos

Registro explícito de remotos (id, URL base, timeout por defecto, estrategia de identidad). El modo `SERVER` solo hace peticiones a URLs bajo un remoto registrado, para evitar SSRF a partir de la definición de la UI.

### Caché

La decide el remoto, no el host. El remoto declara en la respuesta si el fragmento es cacheable, durante cuánto, y por qué varía: `none`, `user` o una clave opaca (por ejemplo el hash de atributos del usuario). El host cachea por URL + esa clave. Implementación de caché detrás de una interfaz.

### Trazabilidad

Propagar el ID de correlación al remoto y registrar por fragmento: remoto, duración, resultado (incrustado, degradado por timeout, degradado por error, desde caché). Un equipo de operación que no lo ha desarrollado tiene que poder diagnosticar un fragmento lento.

## @ContentSlot

`@ContentSlot` es un microfrontend con `resolve = SERVER` apuntando al servicio de contenido, más tres garantías: clave estable, fallback declarado y registro en compilación.

```java
@ContentSlot(
    key = "frontoffice.checkin.ayuda-documentacion",
    fallback = "",          // vacío = el slot no se pinta
    timeoutMs = 100
)
```

- **Clave estable.** Formato `aplicacion.pantalla.nombre`, validado en compilación (caracteres, unicidad dentro de la aplicación). Cambiar una clave es un cambio de contrato.
- **Remoto.** El servicio de contenido es un remoto registrado con id fijo (configurable). La URL se construye a partir de la clave; el desarrollador no la escribe.
- **Nunca bloquea.** Si el slot está vacío, el servicio no responde o devuelve error, se pinta el fallback (o nada). A diferencia del microfrontend genérico, un slot no se degrada a `CLIENT` por defecto: el contenido es accesorio y no merece una petición extra desde el cliente. Configurable.
- **Registro.** El procesador de anotaciones genera un descriptor por aplicación con, por slot: clave, clase/vista donde se declara, fallback y descripción opcional para el editor. El servicio de contenido lo consumirá para listar slots en el backoffice. Formato del descriptor: JSON en `META-INF`, a confirmar.

## Puntos a descubrir en el código antes de implementar

La sesión de implementación debe responder esto leyendo el código de Mateu, y proponer el encaje antes de escribir nada:

- [ ] Dónde se define hoy el microfrontend (anotación, componente, DTO) y cómo se serializa en el JSON de UI.
- [ ] Cómo lo resuelve cada renderer (web, escritorio, móvil): qué campos lee y cómo pide el JSON remoto.
- [ ] Cómo representar en el JSON un fragmento ya resuelto conservando su origen, de forma que los renderers enruten las acciones al remoto. Idealmente sin cambiar renderers, o con el cambio mínimo.
- [ ] Dónde se construye la vista en servidor y si ese punto permite resolución asíncrona/paralela (bloqueante, reactivo, virtual threads).
- [ ] Cómo se propaga hoy la identidad del usuario en el servidor y qué cliente HTTP se usa.
- [ ] Cómo está montado el procesador de anotaciones y dónde encaja la generación del registro de slots.
- [ ] Convenciones de configuración de Mateu (propiedades, beans) para el registro de remotos.

## Plan de trabajo por fases

Cada fase termina con un checkpoint: la sesión se detiene, resume lo hecho y espera revisión antes de seguir.

1. **Exploración.** Responder los puntos a descubrir y proponer el encaje (clases a tocar, cambio en el JSON, impacto en renderers). Checkpoint: propuesta aprobada. Sin código.
2. **Modelo.** Atributo `resolve` en el microfrontend, representación del fragmento resuelto con origen, registro de remotos. Valor por defecto `CLIENT`; los tests existentes siguen en verde sin cambios. Checkpoint.
3. **Resolución en servidor.** Peticiones en paralelo, presupuesto de tiempo, cancelación, degradación a cliente, identidad e ID de correlación, trazas. Checkpoint.
4. **Renderers.** Cambio mínimo para pintar un fragmento ya resuelto y enrutar sus acciones al remoto. Empezar por web; escritorio y móvil después. Checkpoint por renderer.
5. **Caché.** Interfaz, implementación en memoria y respeto de lo que declara el remoto. Checkpoint.
6. **@ContentSlot.** Anotación, validación de clave, fallback, generación del registro. Checkpoint.
7. **Ejemplo y documentación.** Una app de demo con un remoto rápido, uno lento y uno caído, y un slot. Documentación de uso.

## Criterios de aceptación y tests

| Caso | Resultado esperado |
| --- | --- |
| Microfrontend sin `resolve` | Comportamiento idéntico al actual; JSON sin cambios |
| `SERVER`, remoto responde a tiempo | Fragmento incrustado; ninguna petición desde el cliente |
| `SERVER`, remoto lento | Se degrada a `CLIENT` al vencer el presupuesto; la petición en servidor se cancela |
| `SERVER`, remoto devuelve error | Se degrada a `CLIENT`; queda traza con el error |
| `SERVER`, URL fuera de remotos registrados | Error de configuración; no se hace la petición |
| Varios fragmentos `SERVER` en una vista | Peticiones en paralelo; tiempo total ≈ el del más lento dentro del presupuesto |
| Acción dentro de un fragmento incrustado | Llega al remoto, no al host |
| Remoto declara caché por clave | Segunda petición con la misma clave sale de caché; con otra clave, no |
| Remoto declara `none` | Nunca se cachea |
| Petición al remoto | Lleva identidad según la estrategia del remoto e ID de correlación |
| `@ContentSlot` con contenido | Pintado en la misma respuesta |
| `@ContentSlot` vacío, caído o lento | Se pinta el fallback; la pantalla no falla |
| Clave de slot inválida o duplicada | Error de compilación |
| Compilación de app con slots | Se genera el descriptor con todos los slots |

Tests del remoto con un servidor HTTP de prueba (WireMock o equivalente) que permita simular latencia y errores.

## Prompt de arranque para la sesión en IntelliJ

Para pegar al abrir la sesión en el repo de Mateu, con esta spec guardada como `docs/specs/microfrontend-server-resolution.md`:

```markdown
Vas a implementar la spec docs/specs/microfrontend-server-resolution.md en este repositorio (Mateu).

Reglas de trabajo:
- Trabaja por las fases del apartado "Plan de trabajo". Al terminar cada fase, detente, resume qué has cambiado y por qué, y espera mi revisión.
- Empieza por la fase 1 (exploración): responde los "Puntos a descubrir" leyendo el código y propón el encaje. No escribas código en esa fase.
- El comportamiento por defecto de los microfrontends existentes no puede cambiar. Los tests actuales deben seguir pasando sin modificarlos.
- No cambies renderers más allá de lo mínimo que exija pintar un fragmento ya resuelto.
- Identidad, caché y registro de remotos van detrás de interfaces; nada cableado.
- Si algo de la spec choca con cómo está construido Mateu, no lo fuerces: explícame el conflicto y propón alternativas.
- Cada criterio de aceptación tiene que acabar cubierto por un test.
```
