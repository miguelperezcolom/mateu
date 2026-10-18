# Release notes template — 3.0 betas

Copy this file to the session scratchpad, fill it from the CHANGELOG section of the release (same
content, same order) and publish with
`gh release create v3.0-beta.N --target master --title "Mateu v3.0-beta.N" --notes-file <file>`.
Delete the sections that are empty; keep the last three.

---

<one or two sentences: what this beta is about, and whether upgrading is recommended>

## Behaviour changes
- <anything an app can notice without changing its code; say how to keep the old behaviour>

## Security
- <fixed vulnerabilities and hardened defaults; advisory link once published>

## Added
- <new API, marked (experimental) when it carries @Experimental>

## Fixed
- <bug fixes, one line each, naming the backends/renderers affected>

## Deprecated
- <old name → new name; removable from 3.0-beta.N+1 at the earliest>

## Known issues
The current limitations, each with its workaround, are listed in
[Known issues](https://mateu.io/reference/known-issues/). New in this release:
- <limitation found while preparing this release, or "none">

## Upgrading
Bump every Mateu dependency to `3.0-beta.N` (Maven `io.mateu:mateu-bom`, NuGet `3.0.0-beta.N`,
PyPI `mateu-ui==3.0.0bN`). From an alpha, read
[Migrating from alpha](https://mateu.io/reference/migrating-from-alpha/) first. Which versions get
fixes, and the supported Java / .NET / Python / IDE versions:
[Support policy](https://mateu.io/reference/support-policy/).

## Software bill of materials
CycloneDX SBOMs (JSON) are attached to this release by the release workflow:
`mateu-<version>-maven.cdx.json`, `-web-renderer.cdx.json`, `-python.cdx.json`, `-dotnet.cdx.json`.
