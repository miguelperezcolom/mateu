FROM azul/zulu-openjdk-alpine:21.0.8-21.44-x86

COPY target/demo-admin-panel-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8091

ENTRYPOINT ["java","-jar","/app.jar"]
