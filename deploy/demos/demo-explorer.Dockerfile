# The Mateu Explorer (demo/demo-explorer) on the Vaadin renderer.
# Build first: (cd demo/demo-explorer && mvn -B -ntp clean package -DskipTests)
# The Redwood twin: build with clean + -Dmateu.renderer=mateu-redwood and tag it demo-explorer-redwood.
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S app && adduser -S -G app -u 10001 app
WORKDIR /opt/app
COPY --chown=app:app demo/demo-explorer/target/demo-explorer-1.0-SNAPSHOT.jar app.jar
ENV SERVER_PORT=8640 JAVA_TOOL_OPTIONS="-Djava.io.tmpdir=/tmp -XX:MaxRAMPercentage=75"
USER app
EXPOSE 8640
ENTRYPOINT ["java", "-jar", "app.jar"]
