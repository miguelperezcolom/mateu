# The remote apps of the Mateu Explorer's "Distributed UIs" area (demo/demo-explorer/remotes), one
# image per target. Build first: (cd demo/demo-explorer/remotes && mvn -B -ntp clean package -DskipTests)
#
#   docker buildx build --platform linux/amd64 -f deploy/demos/demo-explorer-remotes.Dockerfile \
#     --target java-remote   -t miguelperezcolom/demo-explorer-java-remote:$V   --push .
#   …--target yaml-remote    -t miguelperezcolom/demo-explorer-yaml-remote:$V   --push .
#   …--target static-remote  -t miguelperezcolom/demo-explorer-static-remote:$V --push .
#   …--target python-remote  -t miguelperezcolom/demo-explorer-python-remote:$V --push .

FROM eclipse-temurin:21-jre-alpine AS jre
RUN addgroup -S app && adduser -S -G app -u 10001 app
WORKDIR /opt/app
ENV JAVA_TOOL_OPTIONS="-Djava.io.tmpdir=/tmp -XX:MaxRAMPercentage=75"
USER 10001
ENTRYPOINT ["java", "-jar", "app.jar"]

FROM jre AS java-remote
COPY --chown=app:app demo/demo-explorer/remotes/java-remote/target/explorer-java-remote-1.0-SNAPSHOT.jar app.jar
ENV JAVA_REMOTE_PORT=8641
EXPOSE 8641

FROM jre AS yaml-remote
COPY --chown=app:app demo/demo-explorer/remotes/yaml-remote/target/explorer-yaml-remote-1.0-SNAPSHOT.jar app.jar
ENV YAML_REMOTE_PORT=8642
EXPOSE 8642

# The static bundle: plain files behind nginx (unprivileged, port 8080), with the SPA fallback and
# the CORS header the federating shell needs to read manifest.json from the browser.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS static-remote
COPY demo/demo-explorer/remotes/static-remote/target/mateu-bundle /usr/share/nginx/html
RUN printf '%s\n' \
  'server {' \
  '  listen 8080;' \
  '  root /usr/share/nginx/html;' \
  '  add_header Access-Control-Allow-Origin "*" always;' \
  '  location / { try_files $uri $uri/ /index.html; }' \
  '}' > /etc/nginx/conf.d/default.conf
EXPOSE 8080

FROM python:3.12-alpine AS python-remote
RUN adduser -S -u 10001 app
WORKDIR /opt/app
COPY demo/demo-explorer/remotes/python-remote/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY demo/demo-explorer/remotes/python-remote/main.py .
ENV PYTHON_REMOTE_PORT=8644 PYTHON_REMOTE_HOST=0.0.0.0
USER 10001
EXPOSE 8644
ENTRYPOINT ["python", "main.py"]
