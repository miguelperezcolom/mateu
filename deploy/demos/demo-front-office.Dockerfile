FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S app && adduser -S -G app -u 10001 app
WORKDIR /opt/app
COPY --chown=app:app demo/demo-front-office/target/demo-front-office-0.0.1-SNAPSHOT.jar app.jar
ENV SERVER_PORT=8594 SPRING_H2_CONSOLE_ENABLED=false JAVA_TOOL_OPTIONS="-Djava.io.tmpdir=/tmp -XX:MaxRAMPercentage=75"
USER app
EXPOSE 8594
ENTRYPOINT ["java", "-jar", "app.jar"]
