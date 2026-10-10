#!/usr/bin/env bash
# Points the starters and the "start here" demos at a released Mateu version.
#
#   scripts/bump-example-version.sh 3.0-alpha.407
#
# Only poms that already pin a RELEASE (3.0-…) are touched; the showcase demos that track master
# (mateu.version = 0.0.1-MATEU) are left alone. Run it once the release is visible on Maven Central
# (https://repo1.maven.org/maven2/io/mateu/mvc-core/maven-metadata.xml), not when the tag is pushed:
# a starter pinned to a version Central does not have yet fails for everyone who copies it.
set -euo pipefail
new=${1:?usage: $0 <version, e.g. 3.0-alpha.407>}
cd "$(dirname "$0")/.."
files=$(grep -rlE '<mateu.version>[0-9]+\.[0-9]+-[a-z]+\.[0-9]+</mateu.version>' --include=pom.xml starters demo || true)
for f in $files; do
  sed -E -i.bak "s#<mateu.version>[0-9]+\.[0-9]+-[a-z]+\.[0-9]+</mateu.version>#<mateu.version>$new</mateu.version>#" "$f"
  rm -f "$f.bak"
  echo "$f → $new"
done
