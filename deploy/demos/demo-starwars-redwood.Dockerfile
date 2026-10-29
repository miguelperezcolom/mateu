# Build first: (cd demo/demo-starwars && mvn -B -ntp clean package -DskipTests -Predwood-bundle -Dmateu.version=<release>)
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY deploy/demos/starwars-redwood/nginx.conf /etc/nginx/conf.d/default.conf
COPY demo/demo-starwars/target/mateu-bundle/ /usr/share/nginx/html/
# the app's own static files (the Mateu logo the app shell and the UI manifest name)
COPY demo/demo-starwars/src/main/resources/static/images/ /usr/share/nginx/html/images/
# ...with the logo INVERTED (white face on a dark round): Redwood's global header is dark, where the
# demo's black-on-white logo showed as a white square
COPY deploy/demos/starwars-redwood/images/ /usr/share/nginx/html/images/
EXPOSE 8080
