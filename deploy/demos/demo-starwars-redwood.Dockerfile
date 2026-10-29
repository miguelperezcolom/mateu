# Build first: (cd demo/demo-starwars && mvn -B -ntp clean package -DskipTests -Predwood-bundle -Dmateu.version=<release>)
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY deploy/demos/starwars-redwood/nginx.conf /etc/nginx/conf.d/default.conf
COPY demo/demo-starwars/target/mateu-bundle/ /usr/share/nginx/html/
# the app's own static files (the Mateu logo the app shell and the UI manifest name)
COPY demo/demo-starwars/src/main/resources/static/images/ /usr/share/nginx/html/images/
# ...with the logo for Redwood's DARK global header, which draws it 22 px high: Mateu's wordmark in
# white (mateu.png; the demo's square black-on-white face was a tiny white square there), and the
# face, inverted on a dark round, as the mobile app's icon (mateu-icon.png) — which this site's own
# UI manifest names instead of the logo (the generated one would name the wordmark)
COPY deploy/demos/starwars-redwood/images/ /usr/share/nginx/html/images/
COPY deploy/demos/starwars-redwood/mateu/v3/manifest /usr/share/nginx/html/mateu/v3/manifest
EXPOSE 8080
