# Build first: (cd demo/demo-starwars && mvn -B -ntp clean package -DskipTests -Predwood-bundle -Dmateu.version=<release>)
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY deploy/demos/starwars-redwood/nginx.conf /etc/nginx/conf.d/default.conf
COPY demo/demo-starwars/target/mateu-bundle/ /usr/share/nginx/html/
EXPOSE 8080
