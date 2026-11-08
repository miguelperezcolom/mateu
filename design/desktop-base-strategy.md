# What the Mateu desktop app is built on (3.0 and after)

Status: **proposal for the owner** (2026-11-08). Prototype: `.github/workflows/desktop-base.yml` +
`desktop-base-package.yml`, branch `desktop/community-from-source`. The release pipeline
(`desktop.yml`) is **unchanged** by this work.

## TL;DR

- JetBrains did **not** stop publishing an open-source IntelliJ IDEA. It stopped publishing
  *IntelliJ IDEA Community Edition* on `download.jetbrains.com`. Since 2025.3 the same Apache-2.0
  product ships as **IntelliJ IDEA Open Source**, and a JetBrains bot attaches its installers for
  every release to the `idea/<version>` GitHub Release of `JetBrains/intellij-community`:
  macOS `.dmg` (x64 + aarch64), Linux `.tar.gz`, Windows `.win.zip` + `.exe`. This covers each line
  JetBrains still patches (2025.3.x, 2026.1.x, 2026.2.x, 2026.3).
- **Recommendation for 3.0: package the JetBrains-built IntelliJ IDEA Open Source 2026.3 from those
  GitHub Release assets.** It is the same flow as today: the base is downloaded and repacked. It only
  needs a different URL and file names, plus a sha256 check against the release's digest.
- **The prototype is proven on CI** ([run 42501111668](https://github.com/miguelperezcolom/mateu/actions/runs/42501111668), §2.2).
  Both bases (JetBrains' release assets, and our own source build of `idea/2026.3` in **43 min** on
  a standard runner) were packaged into all four installers by the existing `buildInstaller`. The
  packaged app starts and **loads the unchanged Mateu plugin** on macOS, Linux and Windows. The
  release assets are **JetBrains-signed and notarized**; our source build is unsigned.
- **Keep the build from source as the fallback, and later as the branded product.** The prototype
  shows our own CI can build it from the tag with JetBrains' own recipe. Use it only if JetBrains
  stops attaching binaries, or (3.1+) when we want a Mateu-branded, stripped base.
- **Do not use the unified IntelliJ IDEA binary** (the free tier of the commercial product). It is
  under JetBrains' proprietary terms, not Apache-2.0, it bundles Ultimate plugins, and it shows
  licensing and consent flows. Nothing in its terms lets us redistribute it.
- **Do not stay on 2025.2 for long.** It still gets security fixes today, but only partial ones (see
  §1.4). Its end is close.

## 1. Findings

### 1.1 What JetBrains distributes now

| | Until 2025.2 | From 2025.3 |
|---|---|---|
| Open-source product | IntelliJ IDEA **Community Edition** (`IC`), `download.jetbrains.com/idea/ideaIC-<v>.*` | IntelliJ IDEA **Open Source** (same `IC` product code, same artifacts layout: `out/idea-ce`, `ideaIC-<build>`), **GitHub Releases** of `JetBrains/intellij-community` |
| Commercial product | Ultimate (`IU`) | **Unified IntelliJ IDEA**: one installer, free core features plus a subscription |

Evidence:
- JetBrains, [*IntelliJ IDEA moves to the unified distribution*](https://blog.jetbrains.com/idea/2025/07/intellij-idea-moves-to-the-unified-distribution/)
  and [*the plan*](https://blog.jetbrains.com/idea/2025/07/intellij-idea-unified-distribution-plan/):
  2025.3 is the last release with a separate Community download. The source stays open, and
  open-source builds are published to GitHub Releases, built with GitHub Actions. The open-source
  build has only the open-source components (no Backup and Sync, LSP, AI Assistant, Code With Me).
- JetBrains sales FAQ, [*free IntelliJ IDEA for commercial software*](https://sales.jetbrains.com/hc/en-gb/articles/360021922640):
  "Community Editions are no longer distributed as a separate product" but "still remain available
  via GitHub".
- JetBrains' product feed (`data.services.jetbrains.com/products/releases?code=IIC`) ends at 2025.3.
  That entry already points at the unified `idea-2025.3.tar.gz` (1.5 GB), and
  `download.jetbrains.com/idea/ideaIC-2026.3.tar.gz` returns 404. The IntelliJ Platform Gradle
  Plugin can no longer resolve `intellijIdeaCommunity()` for 2025.3+
  ([JetBrains platform notes for 2025.3](https://blog.jetbrains.com/platform/2025/11/intellij-platform-2025-3-what-plugin-developers-should-know/)).
- GitHub Releases of [`JetBrains/intellij-community`](https://github.com/JetBrains/intellij-community/releases),
  checked 2026-11-08 via the API. Assets are uploaded by `intellij-release-bot[bot]`, about 1.5 h
  after the tag. Each asset carries a `sha256:` digest in the API.

  | Release | Assets | Sizes |
  |---|---|---|
  | `idea/2026.3` (= `idea/263.7307.200`, 2026-11-04) | `idea-2026.3{,-aarch64}.{dmg,tar.gz,win.zip,exe}` | dmg 773/761 MB, tar.gz 817 MB, win.zip 837 MB |
  | `idea/2026.2.4`, `idea/2026.1.5.1`, `idea/2025.3.6.2` | same set (`idea-` prefix) | ~760–840 MB |
  | `idea/2025.2.6.4` | `ideaIC-2025.2.6.4…` (all 8) | 808–868 MB |

  The 2025.2.6.4 GitHub assets are **not** byte-identical to the `download.jetbrains.com` ones
  (sha256 of the `.tar.gz`: GitHub `61d58ad6…`, download.jetbrains.com `3662d856…`). They are
  separate builds of the same tag. They are JetBrains-signed and notarized (§2.3).
- Downstream distributions already switched. Arch Linux's official package is now
  [`intellij-idea-oss`](https://gitlab.archlinux.org/archlinux/packaging/packages/intellij-idea-oss/-/blob/main/PKGBUILD)
  (2026.2.4, `license=Apache-2.0`, `replaces=intellij-idea-community-edition`). It is **built from
  source**: `./installers.cmd -Dintellij.build.target.os=linux -Dbuild.number=262.11879.100`.
  Flathub ships "IntelliJ IDEA Open Source" 2026.3 under the old Community app id. The AUR
  Community package [was deleted](https://lists.archlinux.org/archives/list/aur-requests@lists.archlinux.org/thread/XS3U4HTFARYSHYM2YDPGT2ULENUNUOID).

### 1.2 Licensing and trademarks

- **IntelliJ IDEA Open Source / intellij-community: Apache-2.0.** Redistribution, modification and
  derivative works are allowed. Keep the LICENSE/NOTICE files (the IDE's `license/` folder, which
  `buildInstaller` already keeps) and mark the modified files. JetBrains' own
  [Community Edition Terms 1.2](https://www.jetbrains.com/legal/docs/toolbox/user_community.html)
  describe Community as "open source software subject to the Apache 2.0 license" plus proprietary
  plugins under [separate terms](https://www.jetbrains.com/legal/community-bundled-plugins). The
  terms say nothing on redistribution or derivatives. Per the FAQ, the Open Source build drops the
  proprietary parts, so it is a *cleaner* base than the IC 2025.2 we ship today.
- **The unified IntelliJ IDEA (free tier).** It is "free to use for both commercial and non-commercial
  projects" (FAQ), but it is the commercial product under the
  [JetBrains user agreement](https://www.jetbrains.com/legal/docs/toolbox/user/). That agreement
  licenses *use*. Only "Redistributable Products" with their own agreements may be redistributed,
  and an IDE is not one ([sales FAQ](https://sales.jetbrains.com/hc/en-gb/articles/4403459067538)).
  **Repackaging it is not an option**, whatever the price.
- **Trademarks.** Apache-2.0 §6 grants **no** right to use the licensor's trade names or marks.
  "IntelliJ" is a registered JetBrains mark. JetBrains' Marketplace rules forbid "IntelliJ" or any
  JetBrains product name in plugin names
  ([approval guidelines](https://plugins.jetbrains.com/docs/marketplace/jetbrains-marketplace-approval-guidelines.html)),
  and the [brand page](https://www.jetbrains.com/company/brand/) allows attribution such as
  "Built using IntelliJ IDEA". For us this means:
  - The product is **"Mateu"**, never "Mateu IntelliJ" and no JetBrains logo. macOS already does
    this (`CFBundleName`, icon, bundle id `io.mateu.desktop`).
  - Linux and Windows still show IntelliJ's own launcher names, splash screen and About box, which
    is exactly what we ship today on IC 2025.2. That is a faithful unmodified base plus our plugin,
    and it reads as "Built on IntelliJ IDEA Open Source", which is fair attribution. A fully
    rebranded product (product name, splash, About, icons in `ApplicationInfo`) needs the
    from-source path (§3, option C). That is the clean answer if we ever sell or brand the desktop
    app harder.
  - Not legal advice. Before GA, a short check by a lawyer of "repackaged Apache-2.0 JetBrains
    binary + our plugin, our name on macOS" is worth one email.

### 1.3 Building intellij-community from source

- Official recipe ([README](https://github.com/JetBrains/intellij-community/blob/master/README.md#building-intellij-idea)):
  1. Check out `intellij-community` and `JetBrains/android` at **the same tag**.
  2. Run `./installers.cmd`. On Unix it runs `build/run_build_target.sh … //build:i_build_target`
     (Bazel, migration in progress), which calls `OpenSourceCommunityInstallersBuildTarget`.
  3. Or use the Docker image the repo ships (`Dockerfile`, target `intellij_idea`).

  Options are system properties from `BuildOptions.kt`: `intellij.build.target.os`,
  `intellij.build.target.arch`, `intellij.build.skip.build.steps`, `build.number`.
- **JetBrains builds it on free GitHub runners.** The repo's own `IntelliJ_IDEA.yml` runs on every
  `idea/20*` tag and nightly. It runs `ide_build_and_upload.yml` and `.github/actions/build_ide`,
  then a macOS job for the dmg. Recipe: free disk, add **30 GB swap** ("the IDE build may hit OOM
  (exit 137) with the default 16 GB RAM"), `docker build --target intellij_idea`, then
  `docker run … installers.cmd`. **One `ubuntu-latest` job cross-builds Linux, Windows and macOS.**
  Timings from JetBrains' runs (GitHub API):

  | Run | Build job |
  |---|---|
  | `idea/2026.3` (2026-11-04) | 59 min (`build_ide` step 57.7 min) + 6 min dmg |
  | `idea/2026.2.4`, `idea/2025.2.6.4`, `idea/2026.1.5.1` (2026-10-30) | 53 / 45 / 22 min (the last ones warm) |
  | `master` nightly | 50–65 min |

  The artifacts are `linux.tar.gz` 829 MB, `windows.exe` 623 MB, `mac-aarch64.sit` 807 MB and
  `.dmg` 777 MB (unsigned, retention 1 day).
- Two details of the build target matter for us:
  - `OpenSourceCommunityInstallersBuildTarget` always skips the **Windows .zip**, cross-platform zip,
    sources archive and plugin archives, "to spare the GitHub runner's disk". Our packaging repacks
    the zip, so the prototype removes that skip with a one-line `sed`.
  - Without `-Dbuild.number` the build calls itself `263.7307.SNAPSHOT`. JetBrains tags each release
    twice (`idea/2026.3` = `idea/263.7307.200`), so the prototype resolves the numeric tag and
    passes it, as Arch does.
- Product identity of a source build: `ideaIC-<build>.*`, macOS `IntelliJ IDEA OSS.app`, Linux
  root `idea-oss/`, Windows "IntelliJ IDEA Open Source". Its bundled plugins include
  `com.intellij.java` and JSON as essential plugins, plus YAML, which our plugin needs.

### 1.4 How long 2025.2 lasts

JetBrains' support page says previous versions get security fixes depending on severity, with no
fixed window ([*What versions are supported*](https://intellij-support.jetbrains.com/hc/en-us/articles/360019574859)).
The most recent data point is the **eMudhra certificate distrust (October 2026)**. IntelliJ IDEA
fixes shipped for 2026.3 RC, 2026.2.4, 2026.1.5.1, 2025.3.6.2 and **2025.2.6.4**. **2025.1 and
older got nothing.** And "the 2025.2.6.* updates contain only the runtime fix: the JCEF fix comes
as a separate hotfix" ([report](https://pasqualepillitteri.it/fr/news/29453/jetbrains-bloque-certificats-emudhra-mise-a-jour-ide)).
The Mateu plugin uses JCEF for the visual editor. So:

- 2025.2 (released 2025-08) is the **oldest line still patched**, and only partially.
- 2025.1 was dropped at about 18 months. At the same pace, 2025.2 drops around **Q1–Q2 2027**. This
  is an extrapolation, not a JetBrains commitment.
- 2026.3 (2026-11-04) is the line with the longest runway: about 18–24 months on the same pattern.

### 1.5 What others do

- **Android Studio** is the reference product built on the open platform. Google keeps
  `tools/idea` (its intellij-community fork), `tools/adt/idea` and `tools/base`, and builds with
  Bazel (`//tools/adt/idea/studio:android-studio`); see
  [*Build Android Studio*](https://android.googlesource.com/platform/tools/base/+/studio-master-dev/studio.md).
  It is fully rebranded and ships under Google's own terms. It needs a Google-sized team to follow
  the platform, so it is not a model for us.
- **JetBrains Gateway / JetBrains Client**: proprietary, and for remote development. Not a base.
  **Fleet** is not on the IntelliJ Platform. Neither is relevant.
- **Distributors** (Arch, Flathub, Homebrew casks) moved to IntelliJ IDEA Open Source, built from
  source (Arch) or from the GitHub Release assets.
- A "lightweight" platform-only product (just `intellij.platform.*` plus our plugin, no Java IDE)
  is technically possible from source: write a custom `ProductProperties`, as PyCharm does in the
  same repo. But it is a product of our own to maintain against each platform release.
  `bundledPlugin("com.intellij.java")` and YAML PSI would also have to be kept or dropped from
  the plugin. That is a 3.x project, not a 3.0 one.

## 2. Prototype on CI

### 2.1 What was added (behind a flag, default untouched)

- `buildInstaller` (`frontend/app/intellij-plugin/build.gradle.kts`):
  - `-Pinstaller.ideArchive` already existed. It now also accepts a source build's **macOS
    `.sit`/`.zip`** (unpacked with `ditto`) and a **win.zip with a top-level folder** (hoisted).
  - New `-Pinstaller.ideVersion=<v>` names the base. It is baked into the app
    (`mateu.desktop.ideVersion`) and the update feed. The default is the old `ideVersion`.
  - Every IDE file we append to (`idea.properties`, `*.vmoptions`) must exist (`layoutFile`). A
    renamed file in a newer base fails the build instead of silently losing the hub/focused flags.
  - With none of these properties set, behaviour is identical: IC 2025.2.6.4 from
    download.jetbrains.com.
- `.github/workflows/desktop-base.yml` runs on a push to `desktop/community-from-source`, or by
  dispatch once merged (inputs `ide_tag`, `base`, `reuse_run_id`). No release trigger, artifacts
  only.
  - `from-source`: JetBrains' recipe at the tag, with the real build number and the Windows zip
    kept. It uploads `base-from-source-{linux,windows,macos-intel,macos-aarch64}` (7 days).
    `reuse_run_id` lets a later run package an earlier build without rebuilding. The Actions cache
    can't hold this: the repo's cache already sits at its 10 GB cap.
  - `package-oss-release` / `package-from-source` call `desktop-base-package.yml`:
    1. Fetch the base and verify its sha256 against the release digest.
    2. Inspect the signatures (macOS `codesign`/`spctl`/`stapler`, Windows `osslsigncode`).
    3. Run the **existing** `buildInstaller` (macOS aarch64 + intel, Linux, Windows).
    4. **Smoke-launch** the packaged app: macOS aarch64 natively, Linux under Xvfb, Windows on
       `windows-latest`. It passes only if `idea.log` says `Loaded custom plugins: … Mateu`.
    5. Upload the installers (3 days).

### 2.2 Results

Run [42501111668](https://github.com/miguelperezcolom/mateu/actions/runs/42501111668) on
`idea/2026.3` (`263.7307.200`), 2026-11-08: **11/11 jobs green, both bases, all four
installers, every smoke test passed.**

Each smoke test launched the packaged app (macOS aarch64 natively, Linux under Xvfb, Windows on
`windows-latest`) and read its `idea.log`:
`IDE: IntelliJ IDEA (build #IC-263.7307.200 …)` and then
`Loaded custom plugins: Mateu (io.mateu.ijp.plugin, 0.1.1)`, with no `ERROR` lines and no `io.mateu`
exceptions. **The Mateu plugin (compiled against IC 2025.2.6.4, `sinceBuild 252`) loads unchanged
on IntelliJ IDEA Open Source 2026.3.**

**Building the base from source** (`from-source`, one `ubuntu-latest` job, cold, no cache):

| Step | Time |
|---|---|
| free disk + 30 GB swap | 1.3 min |
| checkout intellij-community + android (shallow) | 1 min |
| Docker image | 25 s |
| `installers.cmd` (all OSes × x64/aarch64, Windows zip kept, `.exe` skipped) | **39.5 min** (2368 s) |
| upload 4 bases | 31 s |
| **job total** | **43 min** |

- Disk: 82 GB used of 145 GB at the end. Peak RAM was not measured; 156 MB of the swap was in use at
  the end. There were no failures and nothing to iterate on: the `sed` that keeps the Windows zip
  and the `-Dbuild.number` lookup worked first time.
- It produced `ideaIC-263.7307.200` for each OS and arch:

  | Archive | x64 | aarch64 |
  |---|---|---|
  | `.tar.gz` | 831 MB | 847 MB |
  | `.win.zip` | 851 MB | 818 MB |
  | `.sit` | 820 MB | 809 MB |

  Plus SPDX SBOMs, a third-party-libraries list and `product-info.json`. The product reports itself
  as `IC-263.7307.200`, the same build as JetBrains' release, with a different build date.

**Packaging each base** with the existing `buildInstaller`. Package time is the `buildInstaller`
step, plugin build included:

| Installer | OSS release base | Package | From-source base | Package |
|---|---|---|---|---|
| macOS aarch64 `.dmg` | 916 MB | 4.5 min | 926 MB | 7.7 min |
| macOS intel `.dmg` | 933 MB | 9.6 min | 941 MB | 8.4 min |
| Linux `.tar.gz` | 827 MB | 5.3 min | 840 MB | 4.2 min |
| Windows `-setup.exe` / `.zip` | 598 / 846 MB | 20.5 min (NSIS) | 627 / 860 MB | 17.9 min |
| Base download | 6–23 s, sha256 = release digest | | artifact from the same run | |

The sizes are about what the 2025.2 base gives today. The base is ~800–870 MB either way, so
dropping Community for OSS costs nothing in size.

### 2.3 Signing

| | JetBrains' OSS release assets | Our source build |
|---|---|---|
| macOS `.app` | **Developer ID Application: JetBrains s.r.o. (2ZEFAR8TH3)**, hardened runtime; `spctl`: *accepted, source=Notarized Developer ID*; notarization ticket stapled | unsigned (`spctl`: *rejected, no usable signature*) |
| Windows `idea64.exe` | **Authenticode, CN=JetBrains s.r.o.**, DigiCert timestamp | no signature |

So the GitHub Release assets are JetBrains' *official*, signed and notarized builds. They are not a
CI by-product. For us, though, signing is decided by `buildInstaller`, whichever base we use.
- **macOS**: modifying the bundle (plist, launcher wrapper, staged plugin) invalidates JetBrains'
  signature. We already re-sign: ad-hoc, or with our Developer ID + notarization when the
  `MACOS_*` secrets are set. The base's signature never reaches the user, so for macOS the bases are
  equivalent.
- **Windows**: we don't touch JetBrains' binaries (`idea64.exe`, the JBR, the DLLs), so on the OSS
  release base **they stay JetBrains-signed**. That helps SmartScreen and antivirus reputation. Our
  NSIS setup `.exe` is unsigned in both cases (as today). On the source base *every* `.exe`/`.dll`
  is unsigned, a real disadvantage until we have an Authenticode certificate.

## 3. Options

| | A. Stay on IC 2025.2.x | **B. IntelliJ IDEA Open Source, JetBrains' GitHub Release assets** | C. IntelliJ IDEA Open Source built by us from the tag | D. Unified IntelliJ IDEA (free tier) |
|---|---|---|---|---|
| Legal | Apache-2.0 + IC's proprietary bundled plugins (as today) | **Apache-2.0**, open-source components only | Apache-2.0; we can rebrand fully | Proprietary EULA, **no redistribution right** |
| Security patches | Ending (partial already, §1.4) | JetBrains' patch releases, ~1.5 h after the tag | Same tags; rebuilding is ours (43 min CI per tag, measured) | n/a |
| Work for 3.0 | None | Small: URL/naming in `buildInstaller` (prototyped) + feed `ideVersion` | Medium: the prototype workflow + caching + upkeep of the build recipe (Bazel migration churn) | — |
| Binaries | JetBrains-signed | **JetBrains-signed + notarized** (macOS re-signed by us anyway; Windows exes stay JetBrains-signed) | Unsigned (Windows exes/DLLs too) | — |
| CI cost per release | ~0 (download) | ~0 (6–23 s download from GitHub) | +43 min `ubuntu-latest` (30 GB swap, 82 GB disk), or reuse a base built once per tag | — |
| Risks | Stuck on platform 252; JCEF unpatched; plugin can't adopt new APIs | JetBrains stops attaching binaries (the FAQ says it will keep doing so); bases not byte-identical to old IC | Recipe breaks between tags (Bazel); we own a 1 GB artefact pipeline | Licence |
| Branding | IntelliJ inside (Linux/Windows) | Same as today | **Own product name, splash, About, icons** | — |

**Recommended: B for 3.0, with C kept green as the fallback and the path to a branded 3.x base.**
A is only acceptable for the next weeks. D is out.

## 4. Migration (B)

1. `buildInstaller`: add `-Pinstaller.ideSource=oss-release` (or switch the default) that downloads
   from `https://github.com/JetBrains/intellij-community/releases/download/idea/<v>/idea-<v>{,-aarch64}.dmg|.tar.gz|.win.zip`.
   For 2025.x the asset prefix is `ideaIC-`. Verify the sha256 against the release API digest
   (`gh api …/releases/tags/idea/<v>` → `.assets[].digest`), the way the prototype does.
2. Pin the base in one place, `desktopIdeVersion = "2026.3"`, apart from `ideVersion`. The plugin can
   keep compiling against IC 2025.2.6.4 (`sinceBuild = 252`, open-ended, and `verifyPlugin`
   already covers 2026.1/2.3). Move compilation to `intellijIdea("2026.3")` only when the plugin
   wants 2026 APIs. That also drops 2025.x users of the Marketplace plugin, so it is a separate
   decision.
3. `desktop.yml`: nothing structural changes (the base is still downloaded). Optionally cache the
   base per version: the repo cache is full, so a GitHub Release asset of ours or a
   `base-<version>` workflow artifact is better.
4. Keep `desktop-base.yml` (from-source) as a manual check before each base bump, and if JetBrains
   ever stops publishing.
5. Update docs: `doc/…/native/desktop-app.md` ("built on IntelliJ IDEA Open Source 2026.3"), the
   README "Installer" section, CLAUDE.md, NOTICE (attribution: "Built using IntelliJ IDEA Open
   Source, © JetBrains s.r.o., Apache-2.0").
6. Bump the base on JetBrains' patch releases of the chosen line (2026.3.x). Each bump is a
   **reinstall** for users (next section), so batch them with Mateu releases.

### What changes for users (auto-update)

The updater already handles a base change:
1. `UpdateFeed.platform.ideVersion` differs from the app's `mateu.desktop.ideVersion`.
2. `UpdateCheck` returns `ReinstallNeeded`.
3. The user sees a one-time notification, "A new version of Mateu needs to be reinstalled… runs on
   a newer platform (2026.3)", with **Download**, which opens the installer of their platform from
   the feed.

The plugin-only update path is never used across bases, since a plugin built for another platform
might not load. What the user keeps:
- **macOS**: `~/Library/Application Support/Mateu` (hub list, settings, plugin dir); same bundle id,
  drag the new app over the old one.
- **Windows**: the NSIS upgrade keeps `data\config` and the workspace.
- **Linux**: `install.sh` from the new bundle keeps `data/config` and the workspace.

IntelliJ migrates the 2025.2 config in place on the first 2026.3 start. Who is affected: apps
installed from the 3.0 betas (all IC 2025.2.6.4). From the first release on B, they get one
reinstall prompt.

## 5. What ships in 3.0 vs later

| 3.0 (GA) | 3.1+ |
|---|---|
| Base = IntelliJ IDEA Open Source **2026.3.x** from JetBrains' GitHub Release assets (option B), sha256-verified | Branded base from source (option C): Mateu product name, splash, About, icons; bundled-plugin set trimmed (Groovy, Android, Kotlin compiler, Maven/Gradle UIs the desktop hub never uses: a smaller download) |
| `desktop-base.yml` kept as a manual from-source check | Decide whether to compile the plugin against 2026.x (`intellijIdea()`) |
| One reinstall prompt for beta users | A "platform-only" product (custom `ProductProperties`) if the Java IDE parts become dead weight |
| NOTICE/attribution, doc updates | Developer ID signing + notarization of the macOS app (secrets already supported by `desktop.yml`) |
