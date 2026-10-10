# Security policy

## Reporting a vulnerability

**Do not open a public issue, pull request or discussion for a security problem.**

Report it privately through GitHub's private vulnerability reporting:

1. Go to the repository's **Security** tab → **Advisories** →
   [**Report a vulnerability**](https://github.com/miguelperezcolom/mateu/security/advisories/new).
2. Describe the issue, the affected version(s) and module(s) (`mateu-mvc`, `mateu-vaadin`, the .NET or
   Python backend…), and how to reproduce it — a minimal `@UI` class or request is ideal.
3. Say whether you want to be credited, and how.

Only the maintainers and you can see the report. If you cannot use GitHub, ask on
[Discord](https://discord.gg/YFb9utDMYK) for a private contact channel — without details of the
vulnerability.

## What to expect

| Step | Target |
|---|---|
| Acknowledgement of your report | within **3 business days** |
| First assessment (accepted / needs info / not a vulnerability) and severity | within **10 business days** |
| Fix released for a **critical** or **high** severity issue | within **30 days** of the assessment |
| Fix released for **medium** / **low** severity | in the next scheduled release, within **90 days** |

We coordinate disclosure with you: the advisory is published (with a CVE when applicable) once a
fixed release is on Maven Central, normally no later than 90 days after the report. If a fix needs
longer, we tell you why and agree a new date.

## Supported versions

| Version | Supported |
|---|---|
| Latest 3.x release (currently the 3.0 pre-releases) | ✅ security fixes |
| Older 3.0 alphas | ❌ — upgrade to the latest release ([migration guide](https://mateu.io/reference/migrating-from-alpha/)) |
| 1.x / 2.x | ❌ |

From 3.0 GA on, security fixes go to the **latest minor of the current major**; see
[Stability & versioning](https://mateu.io/reference/stability-and-versioning/).

## Scope

In scope: the framework artifacts published from this repository (`io.mateu:*` on Maven Central, the
.NET and Python packages, the web and native renderers, the Maven plugins and the IDE plugins).

Out of scope: the demo applications and their hosted instances (`demo.mateu.io`, `swapi.ec1.mateu.io`),
which run with throw-away data, and vulnerabilities in third-party dependencies that do not affect
Mateu — report those upstream (we track them with Dependabot and CodeQL). The dependency
advisories we cannot fix by upgrading, and the overrides we carry for the rest, are listed with
their reasons in [SECURITY-DEPENDENCIES.md](SECURITY-DEPENDENCIES.md).

## Hardening guidance

How to run a Mateu app safely — token verification, CSP, CORS, secrets in REST sources — is in
[Deploy to production](https://mateu.io/java-user-manual/build/deploy-to-production/).
