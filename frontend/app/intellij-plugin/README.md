# Mateu IntelliJ plugin

An IntelliJ IDEA plugin that renders Mateu model-driven Java UIs **inside the IDE**, using the full
platform: a **dockable tool window**, IDE **menus**, and **native components** (SwingX `JXDatePicker`
date fields, real popups, tabs). It speaks Mateu's `/mateu/v3/sync` wire contract and reuses the same
framework-agnostic renderers as the desktop variants.

Running as a plugin (rather than a standalone window) is what unlocks the IDE-frame features — tool
windows/docking and menus only exist inside a running IDE with a project open.

## What it provides

- **Tool window "Mateu"** (`MateuToolWindowFactory`, right-anchored, dockable/movable/floatable). Its
  content is the Mateu app shell — a sidebar menu + a tabbed workspace (`TabbedWorkspace`) where each
  menu entry opens a closeable tab backed by its own independent `AppContext`.
- **Menu**: a top-level *Mateu* menu with *Show Mateu Window* (`ShowMateuAction`).
- **Native date fields**: `FormFieldRenderer` renders date fields with `org.jdesktop.swingx.JXDatePicker`
  (a formatted field + a real calendar dropdown), bundled in the platform.

Rendering (`api` / `state` / `ui`) is shared with the lightweight `intellij-platform` renderer.

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

Per-view detachable docking via `DockManager`/`ContentManager` (each Mateu view as a dockable
Content), richer actions/toolbar, and wiring Mateu actions to IDE notifications.
