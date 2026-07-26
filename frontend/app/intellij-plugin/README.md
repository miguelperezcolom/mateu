# Mateu IntelliJ plugin

An IntelliJ IDEA plugin that renders Mateu model-driven Java UIs **inside the IDE**, using the full
platform: a **dockable tool window**, IDE **menus**, and **native components** (SwingX `JXDatePicker`
date fields, real popups, tabs). It speaks Mateu's `/mateu/v3/sync` wire contract and reuses the same
framework-agnostic renderers as the desktop variants.

Running as a plugin (rather than a standalone window) is what unlocks the IDE-frame features — tool
windows/docking and menus only exist inside a running IDE with a project open.

## What it provides

- **Navigator tool window "Mateu"** (`MateuToolWindowFactory`, right-anchored, dockable): its content
  is the app-shell **menu**.
- **Crud listings in the bottom tool window** ("Mateu", like Find/Search results) and **details in the
  central editor** — the IDE-native pattern. `MateuViewManager` loads a view once, detects on first
  content whether it's a Crud (`AppContext.onFirstContent`) and routes it: a Crud listing → a tab in
  the bottom tool window; a non-Crud page and the **detail opened from a row double-click** → an editor
  tab. Editor tabs are backed by `MateuFileEditorProvider` + `MateuVirtualFile` and get native editor
  docking (split / drag-out to floating windows). Re-selecting a menu entry re-focuses its view.
- **Menu**: a top-level *Mateu* menu with *Show Mateu Window* (`ShowMateuAction`).
- **Native date fields**: `FormFieldRenderer` renders date fields with `org.jdesktop.swingx.JXDatePicker`
  (a formatted field + a real calendar dropdown), bundled in the platform.

Rendering (`api` / `state` / `ui`) uses an imperative `AppContext`/`MateuApiClient` model
(originally ported from the retired JavaFX renderer) on Swing + Kotlin UI DSL v2.

## App registry (production installables)

A production build of the plugin should not hardcode its backend: set `mateu.registryUrl` +
`mateu.appId` in the bundled `application.properties` (system properties override them, e.g.
`./gradlew runIde -Dmateu.registryUrl=… -Dmateu.appId=…`). At boot the plugin fetches
`{registryUrl}/{appId}.json` — the same renderer-agnostic contract the React Native renderer
uses — and reads the Mateu `baseUrl`, the launch `parameters` (seeded into `appState`) and the
`intellij` requirements block (`requiredPluginVersion`, `requiredIdeBuild`, `downloadUrl`).
An unmet requirement blocks the app behind an **Update required** panel whose *Update now* button
runs the IDE's own **Check for Updates** flow (installs plugin AND platform updates) and opens the
`downloadUrl` when provided; *Check again* re-reads the registry. See `plugin/AppRegistry.kt` and
the boot gate in `plugin/MateuProjectService.kt`. Headless verification:

```bash
./gradlew -q registryProbe
```

## Installer (plugin + IntelliJ in one bundle)

```bash
./gradlew buildInstaller                              # linux tar.gz (default)
./gradlew buildInstaller -Pinstaller.platform=windows
./gradlew buildInstaller -Pinstaller.platform=macos   # → build/installer/Mateu.app (+ .zip, .dmg)
./gradlew buildInstaller -Pinstaller.platform=macos -Pinstaller.arch=intel
./gradlew buildInstaller -Pmateu.registryUrl=https://registry.example.com -Pmateu.appId=demo-admin-panel
```

**linux / windows** → `build/installer/mateu-desktop-<version>-<platform>.tar.gz|.zip` (~1.2 GB):
**IntelliJ IDEA Community with the Mateu plugin preinstalled**, fully **portable** (config/system/log
live in `data/` inside the bundle — it never touches an existing IDE install), first-boot prompts
pre-answered, and a `mateu.sh` / `mateu.bat` launcher that opens the bundled workspace directly.

**macos** → `build/installer/Mateu.app` (+ `mateu-desktop-<version>-macos.zip` and a double-click
`…-macos.dmg` with a drag-to-`/Applications` shortcut): the Community `.app`
**rebranded "Mateu"** — app name (`CFBundleName`) + icon (`branding/mateu.icns`, the Mateu star on a
brand-gradient squircle). The `.dmg` is mounted, the `.app` copied out and modified: the plugin is
**staged** in `Contents/Resources/mateu-plugin` and a **launcher wrapper** (`Contents/MacOS/idea`)
installs it into the custom plugins dir + opens the bundled workspace on first run — because a folder
dropped into `Contents/plugins` is ignored (only manifest-declared bundled plugins load there; a
third-party plugin must load from `idea.plugins.path`). Config/system/log/plugins live under
`~/Library/Application Support|Caches|Logs/Mateu`. By default the bundle is **re-signed ad-hoc**
(modifying it invalidates the original signature); unsigned → first launch needs **right-click ▸ Open**
(or `xattr -dr com.apple.quarantine Mateu.app`).

### Signing & notarization (no right-click on first launch)

Pass a **Developer ID Application** identity to sign with the hardened runtime, and a **notarytool
keychain profile** to notarize + staple — the result launches with a normal double-click:

```bash
./gradlew buildInstaller -Pinstaller.platform=macos \
  -Pmacos.sign.identity="Developer ID Application: Your Name (TEAMID)" \
  -Pmacos.notarize.profile=mateu-notary
```

Prerequisites (Apple Developer Program membership required):
1. Install a **Developer ID Application** certificate in your login keychain (Xcode ▸ Settings ▸
   Accounts ▸ Manage Certificates, or developer.apple.com). Check with
   `security find-identity -v -p codesigning`.
2. Store notarization credentials once as a keychain profile:
   ```bash
   xcrun notarytool store-credentials mateu-notary \
     --apple-id you@example.com --team-id TEAMID --password <app-specific-password>
   # or --key/--key-id/--issuer for an App Store Connect API key
   ```

`-Pmacos.sign.identity` alone signs (Developer ID, hardened runtime) but doesn't notarize; both flags
together sign + notarize the `.dmg` and staple the ticket onto the `.dmg` and the `.app`. Note: the
launcher is a shell script set as `CFBundleExecutable` — if notarization ever rejects that, the
fallback is a tiny native launcher stub.

Passing `-Pmateu.registryUrl`/`-Pmateu.appId` bakes the app-registry coordinates into the launcher VM
options (they override the plugin's bundled `application.properties`). The IDE archive downloads once
into `build/installer/downloads/` and is reused.

## Run / debug

```bash
./gradlew runIde        # launches an IDE (from the configured platform) with the plugin installed
```

Then open a project and reveal the **Mateu** tool window (right sidebar, or *Mateu ▸ Show Mateu Window*).

By default the platform is a downloaded **IntelliJ IDEA Community** (`intellijIdeaCommunity`, pure
local mode — no remote-dev backend). On the first `runIde` it shows the JetBrains agreement once.
Override with a local install (no download):

```bash
./gradlew runIde -Pmateu.idePath=/path/to/idea       # e.g. your IDEA Ultimate
./gradlew runIde -Pmateu.ideVersion=2025.2.5         # or a specific Community version
```

Requires **Gradle 9** (IntelliJ Platform Gradle Plugin 2.17) and JDK/JBR 21.

## Configure the backend

`src/main/resources/application.properties`:

```properties
mateu.baseUrl=http://localhost:8592
mateu.route=/
mateu.config={}
```

`8592` pairs with the repo's `demo/demo-admin-panel` (`mvn spring-boot:run`).

## Package

```bash
./gradlew buildPlugin   # → build/distributions/*.zip, installable via Settings ▸ Plugins ▸ Install from Disk
```

## Next steps

Richer actions/toolbar in the Mateu menu, closing a view's cached `MateuVirtualFile` when its editor
tab is closed, and wiring Mateu messages to IDE notifications.
