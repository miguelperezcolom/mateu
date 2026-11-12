---
title: "Verify what you download"
description: "How to check that a Mateu artifact is the one the project built and published — Maven signatures, GitHub build provenance attestations, SHA-256 checksums, PyPI and NuGet signatures, macOS notarization, Windows Authenticode and the Android signing key."
---

Everything Mateu distributes is built by GitHub Actions from a tagged commit of
[miguelperezcolom/mateu](https://github.com/miguelperezcolom/mateu), by the release workflow
(`.github/workflows/buid-and-publish.yml`) and the workflows it calls once the release's tests have
passed. This page tells you how to check, for each kind of artifact, that the file you have is the
one that workflow produced — what a security team usually asks before approving a dependency.

| Artifact | Where | Signed with | Provenance attestation |
|---|---|---|---|
| Java jars, poms (`io.mateu:*`) | Maven Central | OpenPGP (`.asc` beside every file) | ✅ every jar |
| Python package `mateu-ui` | PyPI | PEP 740 attestation (trusted publishing only) | ✅ sdist + wheel |
| .NET packages `Mateu.*` | nuget.org | nuget.org repository signature | ✅ every `.nupkg` |
| IntelliJ plugin | JetBrains Marketplace, GitHub release | JetBrains Marketplace signature (+ author signature when configured) | ✅ |
| VS Code extension | VS Code Marketplace, Open VSX | Marketplace signature | ✅ the `.vsix` |
| Desktop app (macOS, Linux, Windows) | GitHub release | macOS: Developer ID + notarization (when configured, else ad-hoc); Windows: Authenticode (when configured) | ✅ |
| Android APK | GitHub release | APK Signature Scheme v2+, Mateu's key | ✅ |
| Redwood embedded component, SBOMs | GitHub release | — | ✅ |
| All GitHub release assets | GitHub release | — | ✅ + `SHA256SUMS` |

Attestations and `SHA256SUMS` exist from the first release built with the provenance job (late
3.0 betas, November 2026); earlier releases have the signatures only.

## Build provenance attestations (any file)

The release workflow's `provenance` job signs a [SLSA build provenance](https://slsa.dev/provenance/)
statement for every file it distributes, with a short-lived [Sigstore](https://www.sigstore.dev/)
certificate bound to the workflow run, and stores it on the repository. It says: *this file, with
this SHA-256, was produced by `buid-and-publish.yml` running at this tag and commit*. With the
[GitHub CLI](https://cli.github.com/):

```bash
gh attestation verify mateu-core-3.0.0.jar --repo miguelperezcolom/mateu
gh attestation verify mateu_ui-3.0.0-py3-none-any.whl --repo miguelperezcolom/mateu
gh attestation verify mateu-desktop-3.0.0-linux.tar.gz --repo miguelperezcolom/mateu
```

To also require that it came from the release workflow (and not another workflow of the repository):

```bash
gh attestation verify mateu-core-3.0.0.jar --repo miguelperezcolom/mateu \
  --signer-workflow miguelperezcolom/mateu/.github/workflows/buid-and-publish.yml
```

The attestations are listed under the repository's **Attestations** page as well. Offline
verification (`gh attestation download` + `--bundle`) works the same way.

:::note[Files a store changes]
A store that re-signs what it receives changes its bytes. The **JetBrains Marketplace** adds its own
signature to the plugin zip, so verify the attestation against the copy attached to the GitHub
release (`mateu-intellij-plugin-<version>.zip`), and trust the Marketplace download through the
signature the IDE checks on install.
:::

## SHA-256 checksums (GitHub release assets)

Every framework release carries a `SHA256SUMS` file listing the release's assets. Download it next
to the files you want and check them:

```bash
sha256sum --check --ignore-missing SHA256SUMS
# macOS: shasum -a 256 --check --ignore-missing SHA256SUMS
```

GitHub also shows each asset's SHA-256 on the release page and in `gh release view <tag> --json assets`.
A checksum proves the file is the one on the release; the attestation proves who built it.

## Maven Central (jars)

Every file in `io.mateu` on Maven Central has an OpenPGP signature beside it (`.asc`), made with the
project's release key — Central refuses unsigned uploads.

```bash
V=3.0.0
curl -fsSLO https://repo1.maven.org/maven2/io/mateu/mateu-core/$V/mateu-core-$V.jar
curl -fsSLO https://repo1.maven.org/maven2/io/mateu/mateu-core/$V/mateu-core-$V.jar.asc
gpg --auto-key-locate keyserver --keyserver hkps://keyserver.ubuntu.com --verify mateu-core-$V.jar.asc mateu-core-$V.jar
```

`Good signature` means the jar is intact and was signed by the key `gpg` names. Check that key
against the one you already trust for Mateu (pin its fingerprint in your build), since anybody can
upload a key to a keyserver. To check every Mateu dependency of a Maven build at once, use the
[pgpverify plugin](https://www.simplify4u.org/pgpverify-maven-plugin/):

```bash
mvn org.simplify4u.plugins:pgpverify-maven-plugin:check
```

## PyPI (`mateu-ui`)

When the project publishes through PyPI's trusted publishing, every file carries a
[PEP 740](https://peps.python.org/pep-0740/) attestation that names this repository and workflow —
the project page shows it under *Verified details*. You can check it with
[pypi-attestations](https://pypi.org/project/pypi-attestations/):

```bash
pip download mateu-ui==3.0.0 --no-deps -d dist
python -m pypi_attestations verify pypi --repository https://github.com/miguelperezcolom/mateu \
  pypi:mateu_ui-3.0.0-py3-none-any.whl
```

The GitHub attestation works on the same files: `gh attestation verify dist/*.whl --repo miguelperezcolom/mateu`.

## NuGet (`Mateu.*`)

nuget.org adds a **repository signature** to every package it accepts, which `dotnet` checks:

```bash
dotnet nuget verify --all Mateu.Core.3.0.0.nupkg
```

The packages carry no *author* signature: that needs a code-signing certificate from a public CA
(NuGet accepts no self-signed one), which the project does not hold. The build provenance
attestation covers the gap — it ties the `.nupkg` to this repository's release workflow:
`gh attestation verify Mateu.Core.3.0.0.nupkg --repo miguelperezcolom/mateu` (download the package
from nuget.org first: `https://www.nuget.org/api/v2/package/Mateu.Core/3.0.0`).

## The desktop app

### macOS

```bash
codesign --verify --deep --strict --verbose=2 /Applications/Mateu.app
codesign -dv --verbose=2 /Applications/Mateu.app 2>&1 | grep -E 'Authority|TeamIdentifier|flags'
spctl --assess --type execute --verbose=2 /Applications/Mateu.app
xcrun stapler validate mateu-desktop-3.0.0-macos-aarch64.dmg
```

A release signed with Mateu's Developer ID shows `Authority=Developer ID Application: …`, the
hardened runtime (`flags=…runtime`) and `source=Notarized Developer ID` from `spctl`. A release built
without the signing certificate is signed **ad-hoc** (`Signature=adhoc`): it is still checked by its
attestation and checksum, but Gatekeeper asks you to confirm the first launch (right-click ▸ Open).
The release workflow refuses to publish a Developer ID build whose signature, hardened runtime or
notarization ticket does not check out.

### Windows

```powershell
Get-AuthenticodeSignature .\mateu-desktop-3.0.0-windows-setup.exe | Format-List Status, SignerCertificate
Get-AuthenticodeSignature "<install folder>\bin\idea64.exe" | Format-List Status, SignerCertificate
```

When the release is Authenticode-signed, the setup shows `Status: Valid` with Mateu's certificate.
The IntelliJ binaries inside keep **JetBrains'** signature — Mateu never re-signs them, and the
release workflow fails if that signature does not survive the packaging. An unsigned setup makes
SmartScreen warn on first run; verify it by its attestation and checksum.

### Linux

The `.tar.gz` is not signed; verify it with `gh attestation verify` or `SHA256SUMS`.

## The Android APK

```bash
apksigner verify --print-certs mateu-app-v3.0.0-android.apk | grep SHA-256
```

The certificate's SHA-256 must be one of the fingerprints Mateu publishes for app links at
[`https://mateu.io/.well-known/assetlinks.json`](https://mateu.io/.well-known/assetlinks.json)
(the sideloaded APK's key and the Google Play signing key). Every APK is signed with the same key,
which is also why a new one installs over the previous one. The store builds come from the stores
themselves, which verify them on install.

## The IDE plugins

The JetBrains Marketplace and the VS Code Marketplace sign what they distribute and the IDEs check
those signatures on install — there is nothing to do by hand. To tie a plugin to this repository,
verify the attestation of the copy from the GitHub release (IntelliJ) or of the `.vsix` you
downloaded.

## SBOMs

Each release also attaches CycloneDX SBOMs (see the [Support policy](/reference/support-policy/#software-bill-of-materials)).
They are attested like any other asset, so you can check an SBOM is the one the release produced
before feeding it to your scanner.

## Reporting a problem

An artifact that fails any of these checks may have been tampered with: do not use it, and report it
privately as described in [SECURITY.md](https://github.com/miguelperezcolom/mateu/blob/master/SECURITY.md).
