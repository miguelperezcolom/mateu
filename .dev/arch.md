

# Principios básicos

- mínimo código --> menos errores, máxima mantenibilidad
- respetar reglas arquitectura --> escalabilidad y mantenibilidad a largo plazo
- ddd --> mejor patrón que he probado, aunque implica un montón de boilerplate --> lo suplo con imaginación e inventiva

- el diseño bien entendido no genera complejidad accidental. Si eso pasa, es que no estamos aplicando bien los patrones, o no estamos aplicando el patrón corrrecto

# Diseño de un sistema

- DDD es el mejor paradigma que he encontrado, pero hay que entender que solo aplica a la parte de escritura. Hay que combinarlo con CQRS y con arquitectura hexagonal
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
- un microservicio por subdominio/contexto, pero no convertir cada componente en un microservicio
- mejor una bd por microservicio (es más mantenible), pero necesita de una bd para hacer joins. Esta bd la alimentamos de los eventos que lanzamos desde los diferentes microservicios
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

# value objects

Value Object
→ nunca null
→ siempre válido

Campo
→ decide si existe o no


Semantic Value Object
Money, DateRange, Email, BookingLocator

Type-safe Wrapper
LeadName, Comments, PassengerAge

Type-safe wrapper → seguridad de tipos
Semantic VO       → modelo de dominio


Todo campo → value object (type-safe wrapper)
Algunos value objects → semantic (definidos en spec)

Type-safe wrapper
→ evita errores
→ simple
→ 1 campo

Semantic Value Object
→ modela negocio
→ tiene reglas
→ puede tener comportamiento


Type-safe wrapper
→ evitar errores de tipo

Semantic VO
→ modelar reglas de negocio

Usar directamente (ej: Money)

NO wrappear automáticamente

Solo crear wrapper si:
→ el campo tiene significado propio
→ o reglas adicionales


Primitivo        → no tiene significado
Wrapper          → da significado
Semantic VO      → modela comportamiento

// ❌ mal
private String salePrice;

// ✔ bien
private Money salePrice;

// ❌ innecesario (por defecto)
private BookingSalePrice salePrice;

// ✔ solo si hay reglas propias
private BookingSalePrice salePrice;


String / int
→ nunca en dominio

Type-safe wrapper
→ default para campos simples

Semantic VO
→ usar directamente

Wrapper de semantic VO
→ solo si añade reglas o significado nuevo

fields:
salePrice:
type: Money
wrapper: BookingSalePrice

