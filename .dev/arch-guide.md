

# Principios básicos

- mínimo código --> menos errores, máxima mantenibilidad
- respetar reglas arquitectura --> escalabilidad y mantenibilidad a largo plazo
- ddd --> mejor patrón que he probado, aunque implica un montón de boilerplate --> lo suplo con imaginación e inventiva

- el diseño bien entendido no genera complejidad accidental. Si eso pasa, es que no estamos aplicando bien los patrones, o no estamos aplicando el patrón corrrecto

# Diseño de un sistema

- DDD es el mejor paradigma que he encontrado para sistemas de una cierta complejidad, pero hay que entender que solo aplica a la parte de escritura. Hay que combinarlo con CQRS y con arquitectura hexagonal
- DDD táctico + arquitectura hexagonal:
  - capas:
    - aplicación
      - casos de uso
      - interfaces
        - queries
        - repositorios
        - gateways
    - dominio
      - agregados
        - lo más pequeños posibles
        - el aggregate root es el punto de entrada al agregado
        - entities y value objects
      - servicios de dominio
        - para lógica de negocio que excede el agregado
      - en el dominio se garantizan las invariantes de negocio/dominio
    - infraestructura
      - in
        - async
        - sync
        - ui
      - out
        - gateways
        - persistencia
- un microservicio por subdominio/contexto, pero no convertir cada componente en un microservicio. monolito modular antes que microservicios. Microservicios solo cuando es realmente necesario un despliegue independiente. Desarrollamos como si fuese un monolito, desplegamos como microservicios. Diseñamos con límites claros (bounded contexts) y alta cohesión interna. Podemos desplegar como monolito modular o como microservicios según necesidades de independencia.
- mejor una bd por microservicio (es más mantenible), pero necesita de una bd para hacer joins. Esta bd la alimentamos de los eventos que lanzamos desde los diferentes microservicios. En otras palabras: Para consultas transversales entre contextos se construyen read models/proyecciones específicas, alimentadas por eventos, evitando joins operacionales entre bases de datos de escritura.
- la ui es un adaptador de entrada más, exactamente igual que una api o un consumidor de eventos
- la lógica se empuja siempre lo más al centro posible. Si puede estar en el value object, no está en el agregado. Si puede estar en el agregado, no estás en un servicio de dominio, ...


# Apis

- no creo apis si no las necesito
- mejor async que sync
- normalmente, el consumidor de las apis es la UI. Si la UI es un adaptador más, no necesito las apis
  - ejemplo: viajes urbis, quotravel, las pocs que hemos hecho
- Las apis las podemos generar automáticamente a partir de los casos de uso y de las interfaces que las queries. Esto es, creamos una interfaz en la capa de infraestructura y la anotamos. Luego, con un procesadr de anotaciones, se genera el código del consumidor de eventos o los controladores.

# algunos patrones básicos

. outbox para garantizar la atomicidad de las transacctiones, incluyendo el lanzamiento de los eventos
- inbox para no procesar 2 veces el mismo evento. Si falla la transacción, no se graba el id del evento como consumido

# lectura con jdbc, escritura con jpa
WRITE SIDE (comandos)
→ DDD + agregados
→ repositorios (Spring Data JPA o equivalente)

READ SIDE (queries)
→ JDBC directo
→ DTOs / proyecciones
→ sin dominio

La UI puede consumir queries optimizadas sin pasar por dominio; esas queries viven en adaptadores/controladores/read models, no en el dominio. No necesita de dominio ni de repositorios. SQL directo en lugar de JPA.

# value objects

Value Object
→ nunca null
→ siempre válido

Campo
→ decide si existe o no

En dominio no usamos primitivos para conceptos de negocio.

Todo campo de dominio se modela como:
→ Type-safe Wrapper, por defecto
→ Semantic Value Object, cuando existe o cuando hay reglas/comportamiento

¿Por qué wrappeamos los primitivos?
→ porque al generarlos no tienen coste manual
→ aportan significado explícito
→ evitan errores de tipo
→ permiten evolucionar hacia reglas sin refactor

Type-safe Wrapper
→ simple
→ 1 campo
→ aporta seguridad de tipos y significado
→ ejemplos: LeadName, Comments, PassengerAge

Semantic Value Object
→ modela negocio
→ tiene reglas
→ puede tener comportamiento
→ ejemplos: Money, DateRange, Email, BookingLocator

Reglas:
→ los wrappers simples se generan automáticamente
→ los wrappers simples no deben contener lógica compleja
→ los Semantic Value Objects se usan directamente cuando ya existen
→ solo se crea un wrapper sobre un Semantic VO si añade reglas o significado nuevo

// ❌ mal
private String salePrice;

// ✔ bien
private Money salePrice;

// ❌ innecesario
private BookingSalePrice salePrice;

// ✔ solo si añade reglas propias
private BookingSalePrice salePrice;

fields:
salePrice:
type: Money
wrapper: BookingSalePrice

# evitar bolierplate

spec.json → generador → esqueleto DDD → lógica de negocio

El desarrollador no necesita implementar infraestructura DDD repetitiva; sí debe entender el modelo de negocio y las reglas del estilo arquitectónico. De hecho, no puede tocar nada que no sea rellenar los hucos que el generador deja, para aquellas inveriantes y lógica que no hemos podido definir declarativamente. La UI, las apis, los eventos y los controladores y los tests se generan a partir de la spce, que es la verdadera fuente de la verdad.

Limitar las posibilidades de acción del desarrollador es intencionado. Queremos una base de código limpia y homogénea. Si hace falta añadir algo, lo añadimos desde la idp.

En la spec podemos definir el gerkhin de los tests bdd, mientras que los tests de integración y unitarios se generan a partir de la spec, dejando huecos para que el desarrollador los rellene si es necesario.

Es una IDP opinionada, no un simple generador. Enlaza con git, kafka, kubernetes, crea bases de datos, tópicos, y despliega el proyecto directamente en el entorno de desarrollo. Es decir, desde la spec ya tenemos en minutos un proyecto funcional.

- La spec está versionada y asociada a cada despliegue
- La spec es la fuente de verdad: los cambios manuales fuera de los puntos permitidos se pierden al regenerar
- No se permite lógica de negocio fuera de los puntos definidos por el generador

# el flujo

1. El arquitecto modela utilizando archi/sparx o crea el proyecto directamente en la UI y luego lo exporta a archi/sparx. Aquí ya podemos generar y desplegar el proyecto, para irlo validando con la gente de negocio/product owner, en modo agile
2. El tech lead completa el HLA añadiendo agregados, repositorios, definición de las apis y eventos. También puede añadir reglas de negocio y validaciones. También puede añadir un texto explicativo de las deciciones y justificaciones.
3. EL DT se genera a partir de la spec y de lo que ha añadido el tech lead.
4. En cualquier momento se actualiza y redespliega el piloto funcional, que se ha generado a partir de la spec y actualizado con los cambios del tech lead. De esta manera podemos probar y validar los cambios en tiempo real, también con el product owner/la gente de negocio, en modo agile.
5. Una vez aprobado el DT, se puede proceder a rellenar los hucos que falten.
6. Los cambios en la spec se pueden aplicar directamente en el DT y al proyecto aunque esté en producción. Ojo, que quede claro: Ningún cambio generado llega a producción sin pipeline, validaciones, migraciones, compatibilidad y aprobación. 
7. La spec es la fuente de verdad, y siempre está conectada a la realidad.

Queda pendiente definir el flujo para aplicar los cambios en los diferentes entornos. Se puede, por ejemplo, fácilmente integrar con/añadir un sistema de gestión de cambios.

Hay que añadir gobernanza: migraciones, compatibilidad, versionado de eventos/APIs, rollback, feature flags, aprobación, observabilidad.

Los cambios deben ser backward compatible o versionados (eventos/APIs).