FROM azul/zulu-openjdk-alpine:21.0.8-21.44-x86

#RUN apk add --no-cache msttcorefonts-installer fontconfig
#RUN update-ms-fonts

COPY target/demo-vaadin-micronaut-0.1.jar app.jar
EXPOSE 8091

ENTRYPOINT ["java","-jar","/app.jar"]