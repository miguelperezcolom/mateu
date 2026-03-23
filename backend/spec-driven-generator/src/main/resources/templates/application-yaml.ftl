server:
    port: 8091

app:
    features:
        data-source: mem

spring:
    # --- Configuración de Spring Cloud Stream ---
    cloud:
        function:
            definition: consumeOutbox;consumeUpstream;consumeWorkerEvent
        stream:
            kafka:
                binder:
                    # Centralizamos la conexión aquí para el Binder
                    brokers: localhost:9092
                    auto-create-topics: true
                bindings:
                    # INPUTS
                    consumeOutbox-in-0:
                        destination: outbox
                        group: orchestrator-group
                    consumeUpstream-in-0:
                        destination: upstream
                        group: orchestrator-group
                    consumeWorkerEvent-in-0:
                        destination: downstream
                        group: worker-group # Añade un grupo para persistir el offset

                    # OUTPUTS (Para StreamBridge)
                    upstream: # Nombre usado en streamBridge.send("upstream", ...)
                        destination: upstream
                    downstream: # Nombre usado en streamBridge.send("downstream", ...)
                        destination: downstream
                    outbox:
                        destination: outbox

    # --- Configuración de Base de Datos (PostgreSQL) ---
    datasource:
        url: jdbc:postgresql://127.0.0.1:5432/workflow
        username: user_app
        password: user_password
        driver-class-name: org.postgresql.Driver

    hikari:
        connection-timeout: 20000
        maximum-pool-size: 10

    jpa:
        database-platform: org.hibernate.dialect.PostgreSQLDialect
        hibernate:
            ddl-auto: update
        show-sql: true
        properties:
            hibernate:
                format_sql: true

# --- Configuración de Kafka Nativo ---
    kafka:
        bootstrap-servers: localhost:9092
        consumer:
            group-id: my-group
            auto-offset-reset: earliest
            key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
            value-deserializer: org.apache.kafka.common.serialization.StringDeserializer
        producer:
            key-serializer: org.apache.kafka.common.serialization.StringSerializer
            # IMPORTANTE: Cambiado a ByteArraySerializer para evitar el ClassCastException [B cannot be cast to String
            value-serializer: org.apache.kafka.common.serialization.ByteArraySerializer

    logging:
        level:
            org.hibernate.SQL: DEBUG
            org.hibernate.orm.jdbc.bind: TRACE
            org.springframework.kafka: INFO
            # He añadido este para que veas errores detallados del binder si algo falla
            org.springframework.cloud.stream: INFO