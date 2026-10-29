FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S app && adduser -S -G app -u 10001 app
WORKDIR /opt/app
COPY --chown=app:app demo/demo-starwars/target/demo-starwars-1.0-SNAPSHOT.jar app.jar
ENV SERVER_PORT=8600 JAVA_TOOL_OPTIONS="-Djava.io.tmpdir=/tmp -XX:MaxRAMPercentage=75"
USER app
EXPOSE 8600
ENTRYPOINT ["java", "-jar", "app.jar"]
