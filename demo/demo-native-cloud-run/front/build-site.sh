#!/usr/bin/env bash
# Builds the static Redwood front end (for Netlify) that talks to the Mateu backend at BACKEND_URL.
#   front/build-site.sh https://mateu-native-demo-xxxx.run.app
# The backend serves Mateu's default renderer. This script builds the SAME app with the Redwood
# renderer instead (`-Predwood`, into target/redwood-app), runs it locally just long enough to take
# its index page, and ships that page plus Redwood's static assets. The page has no <mateu-ui>
# element, so the Redwood app runs in its hosted mode (hash routes, #/products) and calls the backend
# named by the app constant mateuBaseUrl. The backend must allow the site's origin
# (MATEU_CORS_ALLOWED_ORIGINS).
set -euo pipefail
BACKEND_URL="${1:?backend url}"; BACKEND_URL="${BACKEND_URL%/}"
here="$(cd "$(dirname "$0")" && pwd)"
project="$(cd "$here/.." && pwd)"
SITE="$here/site"
PORT="${PORT:-8199}"

# 1. The app with the Redwood renderer (target/quarkus-app keeps the default renderer).
(cd "$project" && mvn -B -q -Predwood package -DskipTests -Dquarkus.package.output-directory=redwood-app)
APP="$project/target/redwood-app"
JAR="$(ls "$APP"/lib/main/io.mateu.mateu-redwood-*.jar | head -1)"

# 2. Its static assets.
rm -rf "$SITE" "$here/.jar" && mkdir -p "$SITE" "$here/.jar"
unzip -q "$JAR" 'static/*' -d "$here/.jar" && cp -R "$here/.jar/static/." "$SITE/" && rm -rf "$here/.jar"

# 3. Its index page, as the server renders it. Serving the page touches no Firestore, so no
#    credentials are needed.
java -Dquarkus.http.port="$PORT" -jar "$APP/quarkus-run.jar" > "$here/.redwood-app.log" 2>&1 &
pid=$!
trap 'kill $pid 2>/dev/null || true' EXIT
for _ in $(seq 1 60); do
  curl -fsS "http://localhost:$PORT/" -o "$SITE/index.html" 2>/dev/null && break
  sleep 1
done
[ -s "$SITE/index.html" ] || { echo "the Redwood app did not start, see $here/.redwood-app.log"; exit 1; }
kill $pid 2>/dev/null || true; rm -f "$here/.redwood-app.log"

# 4. Hosted mode, pointed at the backend.
python3 - "$SITE" "$BACKEND_URL" <<'PY'
import json, re, sys
site, backend = sys.argv[1], sys.argv[2]
p = f'{site}/index.html'; s = open(p).read()
s = re.sub(r'<mateu-ui[^>]*>.*?</mateu-ui>', '', s, flags=re.S)
s = re.sub(r'<link[^>]*/mateu/v3/pwa/[^>]*>\s*', '', s)
s = re.sub(r'<script[^>]*/mateu/v3/pwa/[^>]*></script>\s*', '', s)
open(p, 'w').write(s)
p = f'{site}/_redwood/app-flow.json'; a = json.load(open(p))
a['constants']['mateuBaseUrl']['defaultValue'] = backend; json.dump(a, open(p, 'w'))
p = f'{site}/_redwood/bundles/vb-app-bundle.js'; s = open(p).read()
old = '\\"mateuBaseUrl\\":{\\"type\\":\\"string\\",\\"defaultValue\\":\\"\\"'
assert s.count(old) == 1, 'mateuBaseUrl constant not found in the bundle'
open(p, 'w').write(s.replace(old, old[:-4] + '\\"' + backend + '\\"'))
PY

# The site's own address also works for the Mateu phone/desktop app (a QR of the page, a pasted link):
# it asks <site>/mateu/v3/manifest and then talks to <site>/mateu/v3/…, which Netlify proxies to the backend.
cat > "$SITE/_redirects" <<R
/mateu/*  $BACKEND_URL/mateu/:splat  200
R
cat > "$SITE/_headers" <<'H'
/_redwood/*
  Cache-Control: public, max-age=300
H
echo "site ready in $SITE ($(du -sh "$SITE" | cut -f1)) -> $BACKEND_URL"
