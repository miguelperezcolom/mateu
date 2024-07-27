FROM azul/zulu-openjdk-alpine:17-latest
COPY target/demo-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8091

RUN apk add --no-cache msttcorefonts-installer fontconfig
RUN update-ms-fonts

ENTRYPOINT ["java","-jar","/app.jar"]