FROM azul/zulu-openjdk-alpine:17.0.11-17.50-x86

#RUN apk add --no-cache msttcorefonts-installer fontconfig
#RUN update-ms-fonts

COPY target/demo-vaadin-webflux-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8091

ENTRYPOINT ["java","-jar","/app.jar"]