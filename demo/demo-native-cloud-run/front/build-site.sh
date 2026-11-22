#!/usr/bin/env bash
# Builds the static Redwood front (for Netlify) that talks to the Mateu backend at BACKEND_URL.
#   front/build-site.sh https://mateu-native-demo-xxxx.run.app [redwood-jar]
# The page is the backend's own index page without its <mateu-ui> element, so the Redwood app
# runs in its hosted mode (hash routes, #/products) and calls the backend named by the app
# constant mateuBaseUrl. The backend must allow the site's origin (MATEU_CORS_ALLOWED_ORIGINS).
set -euo pipefail
BACKEND_URL="${1:?backend url}"; BACKEND_URL="${BACKEND_URL%/}"
here="$(cd "$(dirname "$0")" && pwd)"
JAR="${2:-$(ls "$here"/../target/quarkus-app/lib/main/io.mateu.mateu-redwood-*.jar | head -1)}"
SITE="$here/site"
rm -rf "$SITE" "$here/.jar" && mkdir -p "$SITE" "$here/.jar"
unzip -q "$JAR" 'static/*' -d "$here/.jar" && cp -R "$here/.jar/static/." "$SITE/" && rm -rf "$here/.jar"
curl -fsS "$BACKEND_URL/" -o "$SITE/index.html"
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
