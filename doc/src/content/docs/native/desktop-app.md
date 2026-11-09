---
title: "The Mateu desktop app"
description: "Ship Mateu UIs as an installable desktop app for macOS, Windows and Linux: hub or fixed builds, installers, mateu:// links, automatic updates and white-label builds."
---

The **Mateu desktop app** is IntelliJ IDEA Open Source, renamed, with the Mateu plugin preinstalled
and the IDE chrome hidden: users see your Mateu UI in a native window, not an IDE. It is built by one
Gradle task in `frontend/app/intellij-plugin`, and every Mateu release publishes ready-made installers
on its [GitHub release](https://github.com/miguelperezcolom/mateu/releases/latest).

## What it is built on

Since 3.0-beta.54 the app is built on **IntelliJ IDEA Open Source 2026.3** (Apache-2.0). This is the
open-source IntelliJ IDEA that replaced IntelliJ IDEA Community Edition from 2025.3 on. The betas up to
3.0-beta.53 were built on IntelliJ IDEA Community 2025.2.6.4.

- The base is the set of installers JetBrains attaches to the `idea/<version>` release of
  [JetBrains/intellij-community](https://github.com/JetBrains/intellij-community/releases): the macOS
  `.dmg` (Intel and Apple silicon), the Linux `.tar.gz` and the Windows `.win.zip`. The build checks
  each download against a pinned SHA-256, which is the digest the release lists. It refuses to package
  a file that does not match.
- The base is not modified. On Windows, JetBrains' own binaries (`idea64.exe`, the runtime, the DLLs)
  keep their JetBrains Authenticode signature. On macOS the app is signed again after it is renamed:
  ad hoc, or with a Developer ID and notarization when the release has the certificates.
- Before a release reaches installed apps, CI starts each packaged app (macOS, Linux and Windows) and
  checks that the Mateu plugin loaded.
- The Mateu plugin from the JetBrains Marketplace still supports IntelliJ IDEA 2025.2 and later. Only
  the base of the desktop app changed.

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
| `-Pinstaller.ideVersion` | Another IntelliJ IDEA Open Source release to build on (default `2026.3`); its SHA-256 is read from that release |
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
`HKCU\Software\Classes\mateu`. Installing a newer setup over it keeps the user's settings. The folder
is fixed: the setup does not ask where to install, and refuses a folder there that holds anything else.
The uninstaller removes what it installed, by name, and only then the folder if it is empty.

The setup published on the GitHub release is **not code-signed** yet, so Windows **SmartScreen**
stops it the first time with *"Windows protected your PC"*. To install it, check that the file came
from the [Mateu releases page](https://github.com/miguelperezcolom/mateu/releases) (each release
lists its files with their SHA-256), then click **More info ▸ Run anyway**. A browser may also flag
the download as uncommon: keep it from the downloads list. Files unzipped from the portable `.zip`
carry the same download mark; if Windows warns when you run `mateu.bat`, unblock the zip
(**Properties ▸ Unblock**) before extracting it. A white-label build you sign
with your own Authenticode certificate shows none of this.

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

**A link asks before anything is looked up.** A `mateu://add?u=…` link can come from any web page, so
the app first shows the address it names and asks whether to look it up — nothing is sent to that address
(no manifest, no walk up a page's path) until you say yes; then the usual confirm step shows the UI's
name and sign-in. A server on this machine is never followed to another address (no redirects from
`localhost`, `127.x`, `[::1]`), and an address that answers without a Mateu manifest is not added.

## Signing in

A UI that declares a sign-in in its manifest (`auth`: the OpenID Connect issuer and client, the same
the [phone app](/native/react-native/#3-signing-in-to-a-secured-backend) uses) is signed in to with the
**OAuth 2.0 Device Authorization Grant** — the usual flow for a desktop app, with no local redirect
server: the app shows a short code and opens the provider's page in the browser, you sign in there and
confirm the code, and the app gets its tokens. The access token stays in memory; the refresh token is
kept in the operating system's credential store (Keychain, Windows Credential Manager, KWallet/libsecret,
through IntelliJ's PasswordSafe) and renews the access token when the backend answers 401 — once per UI
for the whole app, even with several windows open on it. A refresh token the provider no longer accepts
(`invalid_grant`) is deleted, and you are asked to sign in again.

**One sign-in per UI.** Each UI of your list keeps its own session (keyed by its address, its provider
and its client): switching to another UI and back finds you still signed in, a token of one UI is never
sent to another UI or to another provider, **Sign out** signs you out of the open UI only, and removing
a UI from the list deletes what was stored to sign in to it. Both also ask the provider to **revoke** the
refresh token when its discovery document names a `revocation_endpoint` (RFC 7009) — the token is deleted
locally whatever the provider answers. A UI whose manifest moves to another provider or client starts a
new session, and the token stored for the old one is deleted when the new one is stored.

At the identity provider, the client needs the **device grant** switched on — in Keycloak, *Clients ▸
your client ▸ Capability config ▸ OAuth 2.0 Device Authorization Grant*. A client set up for the phone
(public, Standard flow, PKCE **S256**) serves the desktop app as it is once that switch is on: the app
sends a PKCE challenge with the device request too. The full list of Keycloak settings is on the
[phone app page](/native/react-native/#3-signing-in-to-a-secured-backend).

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
operating system. 3.0-beta.54 is such a release, because it moves the app from IntelliJ IDEA
Community 2025.2 to IntelliJ IDEA Open Source 2026.3. Apps installed from an earlier beta show this
notice once. The settings and the list of UIs are kept:

- **macOS**: drag the new app over the old one. The data in `~/Library/Application Support/<name>`
  stays.
- **Windows**: the new setup upgrades the installed app in place.
- **Linux**: run `install.sh` from the new bundle.

On its first start, IntelliJ IDEA 2026.3 moves the 2025.2 settings over.

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
    "ideVersion": "2026.3",
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

## Long tasks and notifications

A `LongTask` runs in the app's Background Tasks (status bar and Background Tasks window), never in a
modal window, so the rest of the app stays usable. A blocking task also covers the screen that
started it, with its progress and Cancel. Tasks still running when the app is closed are followed
again when it is reopened, if the server still has them. The bell opens the app's inbox, with the
same filters and category groups as the web ([Notification inbox](/ux-patterns/notification-inbox/)).

## Trying the UI you are developing

The hub app is also where a developer looks at the UI they are building, in a window of its own and
not inside the IDE they write it in: the **Mateu App** run configuration's *Desktop (Mateu app)* target
in IntelliJ, and `"mateu.liveRun.openIn": "desktop"` (or *Mateu: Open Running App in the Desktop App*)
in VS Code, start the app in development mode and hand the desktop app
`mateu://add?u=http://localhost:<port>`. It confirms the UI as with any link and opens it. The development server names its live-reload
events in its manifest (`devEvents`), and the desktop app follows them while the UI is open: a YAML
edit, the reload the IDE fires after a HotSwap, or a restart reloads the app shell and every open Mateu
view — values typed and not saved are lost (see [Live reload](/java-user-manual/build/live-reload/#on-the-desktop-and-the-phone)).

- Plain `http` is accepted for **this machine only** (`localhost`, `127.x`, `[::1]`), in every build —
  that is where the IDE's app runs. Any other plain-http address is refused, as before. A dev app on
  this machine may also use a plain-http identity provider on this machine (a local Keycloak).
- On macOS the IDE opens the link with the desktop app by bundle id (`io.mateu.desktop`): on Apple
  silicon the phone app, installed from the App Store, claims `mateu://` as well.
- No desktop app installed: the IDE says so and offers the download (the latest release) or the old
  way, its own **Mateu** tool window.

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
Before the feed goes up, each packaged app is started on CI (macOS, Linux under Xvfb, Windows) and
must load the Mateu plugin. A manual run with `dry_run` builds and checks every installer without
publishing anything.
