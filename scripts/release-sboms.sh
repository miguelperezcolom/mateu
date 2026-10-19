#!/usr/bin/env bash
# Generates the CycloneDX SBOMs (JSON, spec 1.6) of a framework release, one per ecosystem:
#
#   scripts/release-sboms.sh v3.0-beta.3 out/sbom
#
#   mateu-<v>-maven.cdx.json          every published io.mateu Maven artifact and its dependencies
#                                     (cyclonedx-maven-plugin makeAggregateBom over backend/; the
#                                     provided scope is kept — the app supplies it, Mateu needs it —,
#                                     the test scope and the internal modules are left out)
#   mateu-<v>-web-renderer.cdx.json   the production npm dependencies bundled into the Vaadin web
#                                     renderer (workspaces mateu-vaadin + the shared lib mateu),
#                                     read from the committed lockfile
#   mateu-<v>-python.cdx.json         the mateu-ui wheel's installed dependency set
#   mateu-<v>-dotnet.cdx.json         the four Mateu.* NuGet packages and their package references
#
# The release workflow (.github/workflows/buid-and-publish.yml, job `sbom`) runs it and attaches the
# files to the GitHub release. Normal builds never run it: nothing is bound to a Maven phase.
#
# It STAMPS THE RELEASE VERSION INTO THE CHECKOUT, exactly like the release jobs do (the poms'
# 0.0.1-MATEU, the Python _version.py), so run it in CI or in a throwaway worktree — it refuses to
# run elsewhere unless MATEU_SBOM_STAMP=1. Needs mvn + JDK 21, node/npx, python3 and the dotnet SDK.
# MAVEN_ARGS is passed to Maven (e.g. -Dmaven.repo.local=…).
set -euo pipefail
tag=${1:?usage: $0 <release tag, e.g. v3.0-beta.3> <output dir>}
out=${2:?usage: $0 <release tag> <output dir>}
[[ $tag =~ ^v[0-9]+\.[0-9]+ ]] || { echo "not a framework release tag: $tag" >&2; exit 2; }
if [[ "${CI:-}" != "true" && "${MATEU_SBOM_STAMP:-}" != "1" ]]; then
  echo "This rewrites versions in the checkout; run it in CI or a throwaway worktree with MATEU_SBOM_STAMP=1." >&2
  exit 2
fi

# Tool versions, pinned (bump deliberately).
CYCLONEDX_MAVEN=2.9.1
CYCLONEDX_NPM=6.0.1
CYCLONEDX_PY=7.5.0
CYCLONEDX_DOTNET=6.3.1

root=$(cd "$(dirname "$0")/.." && pwd)
mkdir -p "$out"
out=$(cd "$out" && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

version=${tag#v}                                                             # Maven: 3.0-beta.3
nuget=$(echo "$version" | sed -E 's/^([0-9]+)\.([0-9]+)(-|$)/\1.\2.0\3/')   # NuGet: 3.0.0-beta.3
cd "$root"

echo "== Maven ($version)"
grep -rl '<version>0.0.1-MATEU</version>' --include=pom.xml backend \
  | xargs sed -i.bak "s/0\.0\.1\-MATEU/$version/g"
find backend -name 'pom.xml.bak' -delete
# shellcheck disable=SC2086 # MAVEN_ARGS is a list of flags
mvn -B -q ${MAVEN_ARGS:-} -f backend/pom.xml \
  "org.cyclonedx:cyclonedx-maven-plugin:$CYCLONEDX_MAVEN:makeAggregateBom" \
  -DoutputFormat=json -DoutputName=mateu-sbom -DschemaVersion=1.6 \
  -DincludeTestScope=false -DincludeSystemScope=false \
  -Dcyclonedx.skipNotDeployed=false -DexcludeTestProject=true \
  -DexcludeArtifactId=mateu-integration-tests,mateu-coverage
cp backend/target/mateu-sbom.json "$out/mateu-$version-maven.cdx.json"

echo "== npm (web renderer)"
# The lockfile alone (no node_modules needed), production dependencies only.
(cd frontend/web/monorepo && npx -y "@cyclonedx/cyclonedx-npm@$CYCLONEDX_NPM" \
  --package-lock-only --omit dev --workspace mateu-vaadin --workspace mateu \
  --no-include-workspace-root --flatten-components --mc-type library --spec-version 1.6 \
  --output-reproducible --output-file "$work/npm.json")
jq --arg v "$version" '.metadata.component.name = "mateu-web-renderer" | .metadata.component.version = $v' \
  "$work/npm.json" > "$out/mateu-$version-web-renderer.cdx.json"

echo "== Python"
python3 backend/python/scripts/set_version.py "$tag" > /dev/null
python3 -m venv "$work/wheel"
"$work/wheel/bin/pip" install -q ./backend/python
pyversion=$("$work/wheel/bin/python" -c 'import mateu_ui; print(mateu_ui.__version__)')
"$work/wheel/bin/python" -m pip uninstall -q -y pip    # the SBOM lists the wheel's deps, not the installer
python3 -m venv "$work/cdx"
"$work/cdx/bin/pip" install -q "cyclonedx-bom==$CYCLONEDX_PY"
"$work/cdx/bin/cyclonedx-py" environment "$work/wheel/bin/python" \
  --pyproject backend/python/pyproject.toml --mc-type library --sv 1.6 --output-reproducible \
  -o "$work/py.json"
# The pyproject's version is dynamic (read from _version.py at build time): put it in.
jq --arg v "$pyversion" '.metadata.component.version = $v' "$work/py.json" > "$out/mateu-$version-python.cdx.json"

echo "== .NET ($nuget)"
dotnet tool install CycloneDX --version "$CYCLONEDX_DOTNET" --tool-path "$work/dotnet-tools" > /dev/null
# Mateu.AspNetCore references the other three packages; MateuVersion (an env var is an MSBuild
# property) stamps the project references the way `dotnet pack -p:MateuVersion` does.
(cd backend/dotnet && MateuVersion="$nuget" "$work/dotnet-tools/dotnet-CycloneDX" \
  src/Mateu.AspNetCore/Mateu.AspNetCore.csproj --recursive --include-project-references --set-nuget-purl \
  --set-name Mateu.AspNetCore --set-version "$nuget" --set-type Library --spec-version 1.6 \
  --output-format Json --output "$work" --filename dotnet.json > /dev/null)
cp "$work/dotnet.json" "$out/mateu-$version-dotnet.cdx.json"

for f in "$out"/mateu-"$version"-*.cdx.json; do
  echo "$(basename "$f"): $(jq '.components | length' "$f") components"
done
