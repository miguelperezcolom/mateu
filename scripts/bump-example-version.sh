#!/usr/bin/env bash
# Points the starters, the "start here" demos, the AI reference files (doc/public/mateu-ai-*.md)
# and the AI plugins' versions at a released Mateu version.
#
#   scripts/bump-example-version.sh 3.0-alpha.407
#   scripts/bump-example-version.sh 3.0.0          # a GA / patch release
#
# Only poms that already pin a RELEASE (3.0-…) are touched; the showcase demos that track master
# (mateu.version = 0.0.1-MATEU) are left alone. Run it once the release is visible on Maven Central
# (https://repo1.maven.org/maven2/io/mateu/mateu-mvc/maven-metadata.xml), not when the tag is pushed:
# a starter pinned to a version Central does not have yet fails for everyone who copies it.
set -euo pipefail
new=${1:?usage: $0 <version, e.g. 3.0-alpha.407 or 3.0.0>}
# A release is either a pre-release (3.0-beta.5) or a GA/patch version (3.0.0, 3.1.2) — never the
# reactor's 0.0.1-MATEU, which the patterns below cannot match (it is followed by -MATEU).
REL='[0-9]+\.[0-9]+(-[a-z]+\.[0-9]+|\.[0-9]+)'
[[ $new =~ ^$REL$ ]] || { echo "not a release version: $new (e.g. 3.0-alpha.407, 3.0.0)" >&2; exit 2; }
cd "$(dirname "$0")/.."
files=$(grep -rlE "<mateu.version>$REL</mateu.version>" --include=pom.xml starters demo || true)
files="$files $(grep -lE "<mateu.version>$REL</mateu.version>" doc/public/*.md || true)"
for f in $files; do
  sed -E -i.bak "s#<mateu.version>$REL</mateu.version>#<mateu.version>$new</mateu.version>#" "$f"
  rm -f "$f.bak"
  echo "$f → $new"
done
# The starters' YAML (and the AGENTS.md beside it) point `$schema` at the schemas OF THE RELEASE they
# pin — the raw files at tag v<version>, never master, which can be ahead of that release. The New
# Project generator rewrites the same URL to the version it writes (new-project.json `replacements`).
for f in $(grep -rlE "raw\.githubusercontent\.com/miguelperezcolom/mateu/v$REL/backend/shared/uidl/" starters || true); do
  sed -E -i.bak "s#(raw\.githubusercontent\.com/miguelperezcolom/mateu/)v$REL(/backend/shared/uidl/)#\1v$new\3#g" "$f"   # \2 is REL's own group
  rm -f "$f.bak"
  echo "$f (\$schema) → v$new"
done
# The .NET and Python starters name the published packages (NuGet 3.0.0-beta.N, PyPI 3.0.0bN; a GA
# 3.0.0 is 3.0.0 on both) — inside the repository they build the sources instead.
nuget=$(echo "$new" | sed -E 's#^([0-9]+)\.([0-9]+)-#\1.\2.0-#')
pypi=$(echo "$new" | sed -E -e 's#^([0-9]+)\.([0-9]+)-([a-z]+)\.([0-9]+)$#\1.\2.0\3\4#' -e 's#alpha#a#' -e 's#beta#b#')
sed -E -i.bak "s#(<PackageReference Include=\"Mateu\.[A-Za-z]+\" Version=\")[^\"]+\"#\1$nuget\"#" starters/dotnet/MateuStarter.csproj
sed -E -i.bak "s#^mateu-ui==.*#mateu-ui==$pypi#" starters/python/requirements.txt
rm -f starters/dotnet/MateuStarter.csproj.bak starters/python/requirements.txt.bak
echo "starters/dotnet → $nuget, starters/python → $pypi"
# The .NET and Python READMEs download the web renderer of a release to serve it (MATEU_UI=…).
# (The doc site's guides write MATEU_VERSION, which the docs build resolves — nothing to bump there.)
for f in backend/dotnet/README.md backend/python/README.md; do
  sed -E -i.bak -e "s#^V=$REL\$#V=$new#" \
                -e "s#mateu-vaadin-$REL\.jar#mateu-vaadin-$new.jar#g" "$f"
  rm -f "$f.bak"
  echo "$f → $new"
done
# The Claude Code and Codex manifests carry the release as a semver version
# (3.0-beta.4 → 3.0.0-beta.4; a GA 3.0.0 stays 3.0.0): installed plugins only update when it changes.
semver=$(echo "$new" | sed -E 's#^([0-9]+)\.([0-9]+)-#\1.\2.0-#')
for manifest in ai/claude-plugin/mateu/{.claude-plugin,.codex-plugin}/plugin.json; do
  sed -E -i.bak "s#\"version\": \"[^\"]+\"#\"version\": \"$semver\"#" "$manifest"
  rm -f "$manifest.bak"
  echo "$manifest → $semver"
done
# The public-API compatibility check compares against the last release too (backend/pom.xml).
# Moving it means the reviewed exclusions in backend/api-compat/japicmp-exclusions.properties
# described the diff against the OLD baseline — review and reset them in the same commit.
sed -E -i.bak "s#<mateu.japicmp.baseline>[^<]+</mateu.japicmp.baseline>#<mateu.japicmp.baseline>$new</mateu.japicmp.baseline>#" backend/pom.xml
rm -f backend/pom.xml.bak
echo "backend/pom.xml (japicmp baseline) → $new"
