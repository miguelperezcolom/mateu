---
title: "The Mateu desktop app"
description: "Ship Mateu UIs as an installable desktop app for macOS, Windows and Linux: hub or fixed builds, installers, mateu:// links, automatic updates and white-label builds."
---

The **Mateu desktop app** is IntelliJ IDEA Community, rebranded, with the Mateu plugin preinstalled
and the IDE chrome hidden: users see your Mateu UI in a native window, not an IDE. It is built by one
Gradle task in `frontend/app/intellij-plugin`, and every Mateu release publishes ready-made installers
on its [GitHub release](https://github.com/miguelperezcolom/mateu/releases/latest).

## Two variants: hub or fixed

| | `hub` (default) | `fixed` |
|---|---|---|
| What it opens | A list of UIs the user adds (QR code, address, or a `mateu://add?u=…` link) | One UI, chosen at build time |
| `mateu://` links | Registered: clicking one opens the app | Not claimed (a fixed app never steals the hub's links) |
| Typical use | The public Mateu app; a team's internal app hub | A product: "Acme Admin" for your customers |

```bash
cd frontend/app/intellij-plugin

# the hub (what the release ships)
./gradlew buildInstaller -Pinstaller.platform=macos

# a fixed app bound to one UI — a base URL…
./gradlew buildInstaller -Pinstaller.platform=windows \
  -Pmateu.variant=fixed -Pmateu.baseUrl=https://admin.example.com

# …or app-registry coordinates
./gradlew buildInstaller -Pinstaller.platform=linux \
  -Pmateu.variant=fixed -Pmateu.registryUrl=https://registry.example.com -Pmateu.appId=admin
```

A `fixed` build without a base URL or registry coordinates fails. Passing either without
`-Pmateu.variant` means `fixed`.

| Property | Meaning |
|---|---|
| `-Pinstaller.platform` | `linux` (default), `windows` or `macos` |
| `-Pinstaller.arch` | macOS only: `aarch64` (default) or `intel` |
| `-Pmateu.variant` | `hub` or `fixed` (see above) |
| `-Pmateu.productName` | The app's name (default `Mateu`): window title, `.app` name, menu entries, install folder |
| `-Pmateu.baseUrl`, `-Pmateu.registryUrl` + `-Pmateu.appId` | The UI a `fixed` app is bound to |
| `-Pmateu.updateUrl` | The update feed (below); empty or `none` = no updates |
| `-Pmateu.bundleId` | macOS bundle identifier (default `io.mateu.desktop`, or `io.mateu.desktop.<name>`) |
| `-Pinstaller.ideArchive` | A local IntelliJ archive (`.dmg`, `.tar.gz` or `.win.zip`) instead of downloading it |

These become VM options of the app (`-Dmateu.variant`, `-Dmateu.baseUrl`, `-Dmateu.productName`,
`-Dmateu.updateUrl`, plus `-Dmateu.focused=true`, `-Dmateu.desktop.platform` and
`-Dmateu.desktop.ideVersion` for the updater).

## Installing

Every build lands in `build/installer/`.

### macOS

`mateu-desktop-<version>-macos-<arch>.dmg`: open it and drag the app to **Applications**. Its
settings live in `~/Library/Application Support/<name>`. The app has a bundle identifier of its own,
so it never collides with an installed IntelliJ IDEA, and the hub variant registers the `mateu`
URL scheme.

Unsigned builds are signed ad hoc: the first launch needs **right-click ▸ Open** (or
`xattr -dr com.apple.quarantine /Applications/Mateu.app`). To sign with a Developer ID and notarize:

```bash
./gradlew buildInstaller -Pinstaller.platform=macos \
  -Pmacos.sign.identity="Developer ID Application: Your Name (TEAMID)" \
  -Pmacos.notarize.profile=mateu-notary
```

The notary profile is created once with `xcrun notarytool store-credentials mateu-notary …`.

### Windows

`mateu-desktop-<version>-windows-setup.exe` installs **for the current user, without admin rights**,
into `%LOCALAPPDATA%\Programs\<name>`: Start-menu and desktop shortcuts, an entry in **Apps &
features** (with its uninstaller) and, in the hub variant, the `mateu://` protocol under
`HKCU\Software\Classes\mateu`. Installing a newer setup over it keeps the user's settings.

The setup is built with [NSIS](https://nsis.sourceforge.io): `makensis` must be on the `PATH`
(`sudo apt-get install nsis`, `brew install makensis`). Without it the build still produces the
**portable** `mateu-desktop-<version>-windows.zip` — unzip anywhere and run `mateu.bat`.

### Linux

`mateu-desktop-<version>-linux.tar.gz` is portable: unpack it and run `mateu.sh`. To install it for
the current user, run the bundled script:

```bash
tar -xzf mateu-desktop-<version>-linux.tar.gz
./mateu-desktop-<version>/install.sh            # → ~/.local/share/<name> + an applications-menu entry
./mateu-desktop-<version>/install.sh --uninstall
```

`install.sh` adds a `.desktop` entry and, in the hub variant, makes the app the handler of `mateu://`
links (`xdg-mime default <name>.desktop x-scheme-handler/mateu`). Running a newer bundle's
`install.sh` upgrades in place, keeping the settings and the workspace.

## Updates

The app keeps its Mateu plugin up to date by itself:

1. Shortly after startup, and then every 12 hours, it reads the **update feed**.
2. When the feed offers a newer version, the plugin is downloaded, its **SHA-256 is checked**, and it
   is **staged** next to the installed one — the running plugin is never touched.
3. A single notification says **"Mateu &lt;version&gt; is ready"** with a **Restart** action. Restarting
   (now or whenever the user next starts the app) swaps the staged plugin in before the app starts;
   if the swap fails, the previous plugin is kept.

When a release needs a newer IntelliJ build under it, the app does not patch the platform: it shows
**"A new version of Mateu needs to be reinstalled"** with a link to the installer for the user's
operating system.

A UI can also ask for an update. When one is added or opened, the hub compares its manifest
(`wireVersion`, `mateuVersion`) with this app — the same rule as the phone app,
[Can this app open that UI?](/ux-patterns/mobile-app/#can-this-app-open-that-ui). One on a wire this
app does not understand is not added or opened, and **Update Mateu** checks the feed at once; one on
a newer Mateu release opens with a note offering the same. With no newer version in the feed, it
says so.

IntelliJ's own update checks are switched off in the desktop app — it never offers to update to
IntelliJ IDEA (`-Dide.no.platform.update`), and plugin update checks are off too, since the Mateu
plugin is updated by the app itself.

### The update feed

By default the app reads the feed of the latest Mateu release:

```
https://github.com/miguelperezcolom/mateu/releases/latest/download/mateu-desktop-update.json
```

```json
{
  "version": "3.0-beta.27",
  "plugin": { "url": "https://…/mateu-intellij-plugin-3.0-beta.27.zip", "sha256": "…" },
  "platform": {
    "ideVersion": "2025.2.6.3",
    "installers": {
      "macos-aarch64": "https://…-macos-aarch64.dmg", "macos-intel": "https://…-macos-intel.dmg",
      "linux": "https://…-linux.tar.gz", "windows": "https://…-windows-setup.exe"
    }
  },
  "notes": "…"
}
```

Versions are ordered numerically, with `alpha` < `beta` < `rc` < the final release. Download links
must be `https`. Generate a feed for your own release with
`./gradlew desktopUpdateFeed -Pfeed.downloadBase=<URL where the files are published>`; it writes
`build/installer/mateu-desktop-update.json` with the SHA-256 of the plugin zip it just built.

Point an app at another feed with `-Pmateu.updateUrl=https://…` at build time (or `-Dmateu.updateUrl`
in its VM options); `-Pmateu.updateUrl=none` builds an app that never updates itself.

## White-label builds

A product of your own is a `fixed` build with your name, and usually your own feed (or none):

```bash
./gradlew buildInstaller -Pinstaller.platform=macos \
  -Pmateu.productName="Acme Admin" -Pmateu.variant=fixed \
  -Pmateu.baseUrl=https://admin.acme.example \
  -Pmateu.updateUrl=https://downloads.acme.example/acme-admin-update.json
```

- The name is used for the window title, the `.app`, the Start-menu and desktop shortcuts, the
  install folder and the settings folder, so two white-label apps never share settings.
- Leave `mateu.updateUrl` unset and the app follows **Mateu's** releases; for a product you ship on
  your own schedule, publish your own feed (built with `desktopUpdateFeed`) or pass `none`.
- A `fixed` app does not register `mateu://`: links meant for the hub keep opening the hub.

## Releases

Every Mateu release (`v3.0-beta.N`) builds the hub installers for every operating system
(`.github/workflows/desktop.yml`) and attaches them to its GitHub release, together with the plugin
zip and the update feed — the feed last, so it never points at a file that is not there yet.
