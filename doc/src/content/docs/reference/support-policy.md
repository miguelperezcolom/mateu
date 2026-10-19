---
title: "Support policy"
description: "Which Mateu versions get bug and security fixes, which Java, .NET, Python, framework, IDE and device versions are supported, and how to report a vulnerability."
---

This page says which releases receive fixes and which platforms a release supports. What may
change between releases — public API, deprecation, the wire — is in
[Stability & versioning](/reference/stability-and-versioning/); the limitations of the current
release are in [Known issues](/reference/known-issues/).

## Which versions get fixes

| Line | Bug fixes | Security fixes |
|---|---|---|
| **Latest minor of 3.x** (`3.N`) | ✅ in patch releases `3.N.x` | ✅ |
| **Previous minor** (`3.N-1`) | ❌ — upgrade to the latest minor | ✅ critical and high severity, for **6 months** after `3.N` is released |
| Older 3.x minors | ❌ | ❌ |
| **3.0 pre-releases** (`-alpha.N`, `-beta.N`) | only in the next pre-release | only in the next pre-release |
| 1.x / 2.x | ❌ | ❌ |

- **Pre-releases.** Until `3.0.0` is out, fixes ship only in the next beta: there are no patch
  releases of a beta. Alphas are not supported — upgrade with
  [Migrating from alpha](/reference/migrating-from-alpha/).
- **A minor is a safe upgrade.** A minor release never breaks the public API or the wire (see
  [Stability & versioning](/reference/stability-and-versioning/)), so the fix for a bug in an older
  minor is the upgrade.
- **Next major.** When `4.0` is released, the last `3.x` minor receives security fixes for
  **12 months**.
- **One version per app.** Every `io.mateu` artifact, the .NET packages, the Python wheel and the
  renderers of one release share one version number; a fix is released for all of them at once.
  Never mix versions in one app (use the `io.mateu:mateu-bom`).

## Supported platforms

What a release is built and tested against. A version outside these ranges may work, but a problem
that only reproduces there is not treated as a bug.

### Servers

| Platform | Supported | Tested in CI |
|---|---|---|
| **Java** | 21 or later (the artifacts are compiled for Java 21) | 21 |
| Spring Boot (MVC and WebFlux) | 4.x — **Spring Boot 3 is not supported** | 4.1 |
| Quarkus | 3.x | 3.38 |
| Micronaut | 4.x | 4.10 |
| Helidon MP | 4.x | 4.5 |
| Build tool | Maven 3.9+ or Gradle 8+ | Maven 3.9 |
| **.NET** (`Mateu.*` packages, ASP.NET Core) | `net8.0` and `net10.0` | both |
| **Python** (`mateu-ui` on PyPI, FastAPI) | 3.11 or later; FastAPI ≥ 0.110, Pydantic 2 (≥ 2.6), PyYAML ≥ 6 | 3.11, 3.12, 3.13, and the lowest declared dependency versions |

The supported range of a runtime follows its vendor: when Microsoft ends support for a .NET
version, or Python for a Python version, Mateu drops it in the next minor and says so in the
CHANGELOG. .NET 8 reaches its end of support on 10 November 2026.

### Renderers and tools

| Platform | Supported |
|---|---|
| **Web renderers** (Vaadin, Redwood) | current versions of Chrome, Edge, Firefox and Safari (desktop, and Safari on iOS / Chrome on Android). The Redwood renderer loads Oracle JET from Oracle's CDN, so the browser must reach it |
| **React Native app** | iOS and Android as supported by Expo SDK 57 (React Native 0.86) |
| **IntelliJ plugin** | IntelliJ IDEA 2025.2 and 2025.3 (builds `252`–`253.*`). The range is raised once the JetBrains plugin verifier passes on the next line |
| **VS Code extension** | VS Code 1.85 or later |
| **Node.js** | not needed to *use* Mateu — the renderers ship pre-built inside their jars. Building the renderers, the docs or the e2e suite from source needs Node 24 |

## Reporting a problem

- **Bugs and questions:** [GitHub issues](https://github.com/miguelperezcolom/mateu/issues) and
  [Discord](https://discord.gg/YFb9utDMYK). Say which Mateu version, server (Java adapter, .NET or
  Python) and renderer you use; a minimal `@UI` class or YAML file that reproduces it is ideal.
- **Security vulnerabilities:** never in a public issue. Report them privately through GitHub's
  [private vulnerability reporting](https://github.com/miguelperezcolom/mateu/security/advisories/new),
  as described in [SECURITY.md](https://github.com/miguelperezcolom/mateu/blob/master/SECURITY.md),
  which also states the response times (acknowledgement within 3 business days, a fix for critical
  and high severity within 30 days of the assessment).

## Software bill of materials

Every framework release attaches CycloneDX SBOMs (JSON) to its
[GitHub release](https://github.com/miguelperezcolom/mateu/releases): one for the Maven artifacts,
one for the web renderer bundle (the production npm dependencies of the Vaadin renderer and the
shared client library), one for the Python wheel and one for the .NET packages. Use them to check a
release against your vulnerability scanner or licence policy. The dependency advisories that cannot
be fixed by upgrading are listed with their reasons in
[SECURITY-DEPENDENCIES.md](https://github.com/miguelperezcolom/mateu/blob/master/SECURITY-DEPENDENCIES.md).
