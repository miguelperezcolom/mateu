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

Rendering (`api` / `state` / `ui`) ports the imperative `AppContext`/`MateuApiClient` model from the
JavaFX renderer (`frontend/app/javafx`) to Swing + Kotlin UI DSL v2.

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
