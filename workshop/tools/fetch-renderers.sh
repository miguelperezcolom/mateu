#!/usr/bin/env bash
# Downloads the two web renderers — io.mateu:mateu-vaadin and io.mateu:mateu-redwood — of the release
# the labs pin, from Maven Central, into workshop/renderers/. The C# and Python tracks point
# MATEU_UI at one of them to serve the web page (the Java track gets them as a Maven dependency).
#
#   workshop/tools/fetch-renderers.sh
#   MATEU_UI=$PWD/workshop/renderers/mateu-vaadin.jar dotnet run        # or: uvicorn main:app --port 8080
#   MATEU_UI=$PWD/workshop/renderers/mateu-redwood.jar dotnet run
#
# Run it before the session: the labs then need no network for the renderers.
set -euo pipefail
cd "$(dirname "$0")/.."
version=$(sed -n 's#.*<mateu.version>\(.*\)</mateu.version>.*#\1#p' labs/01-first-app/java/start/pom.xml | head -1)
mkdir -p renderers
for r in mateu-vaadin mateu-redwood; do
  url="https://repo1.maven.org/maven2/io/mateu/$r/$version/$r-$version.jar"
  echo "$r $version ← $url"
  curl -fsSL -o "renderers/$r.jar" "$url"
done
echo "Done: $(pwd)/renderers"
