# Stage 1: the native executable, built with Mandrel for linux/amd64 (what Cloud Run runs).
FROM quay.io/quarkus/ubi9-quarkus-mandrel-builder-image:jdk-25 AS build
USER root
WORKDIR /project
RUN curl -fsSL https://archive.apache.org/dist/maven/maven-3/3.9.11/binaries/apache-maven-3.9.11-bin.tar.gz | tar xz -C /opt
COPY pom.xml .
COPY src src
RUN /opt/apache-maven-3.9.11/bin/mvn -B -q package -DskipTests \
      -Dquarkus.native.enabled=true -Dquarkus.package.jar.enabled=false \
      -Dquarkus.native.native-image-xmx=6g

# Stage 2: just the executable on a minimal base.
FROM quay.io/quarkus/ubi9-quarkus-micro-image:2.0
WORKDIR /work
COPY --from=build /project/target/*-runner /work/application
EXPOSE 8080
USER 1001
CMD ["./application", "-Dquarkus.http.host=0.0.0.0", "-Dquarkus.http.port=8080"]
