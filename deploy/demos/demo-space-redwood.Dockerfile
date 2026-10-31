# Build first: (cd demo/demo-space && mvn -B -ntp clean package -DskipTests -Predwood-bundle -Dmateu.bundle.environment=public)
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY deploy/demos/demo-space-redwood/nginx.conf /etc/nginx/conf.d/default.conf
COPY demo/demo-space/target/mateu-bundle/ /usr/share/nginx/html/
# the app's own static files (the logo the app shell names)
COPY demo/demo-space/src/main/resources/static/images/ /usr/share/nginx/html/images/
EXPOSE 8080
