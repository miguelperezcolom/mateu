# Mateu renderer on the full IntelliJ Platform (ApplicationStarter)

A desktop renderer for Mateu UIs that runs on the **full IntelliJ Platform** — the whole platform
`Application` is booted, so real platform services are available (`JBPopupFactory`, the IntelliJ
Look & Feel, HiDPI scale, a tabbed workspace, …). Unlike the lightweight `intellij-platform` sibling
(which renders with JB Swing widgets **without** booting an Application, so it can't use those
services), this variant gets the real thing.

It renders in its **own window** (not inside the IDE UI): the platform is launched straight into a
custom `ApplicationStarter` (the `mateu` command) which opens the Mateu window and never shows the
IDE welcome screen.

## How it works

- **`MateuStarter`** implements `com.intellij.openapi.application.ApplicationStarter` (command
  `mateu`, `isHeadless = false`). The platform boots a full `Application`, then calls
  `MateuStarter.main(...)`, which reads the backend config, builds the session + window and kicks off
  the initial load.
- Rendering reuses the same framework-agnostic renderers as the lightweight variant (`api` / `state`
  / `ui`), speaking the `/mateu/v3/sync` wire contract via Jackson `JsonNode`.
- **`TabbedWorkspace`** (the platform value-add) gives a tabbed content area: each menu entry opens a
  closeable tab backed by its own independent `AppContext` (its own route / nav state), like a
  power-user workspace.

## The platform without a download

The build uses an **already-installed IntelliJ IDEA** as the platform (`local(idePath)` in
`build.gradle.kts`). An installed IDE carries the full product-modules layout
(`modules/module-descriptors.dat`) that loose Maven artifacts lack — which is exactly why the full
Application boots here but not in the lightweight variant.

Override the install path if yours differs:

```
./gradlew runIde -Pmateu.idePath=/path/to/idea
```

Requires **Gradle 9** (the IntelliJ Platform Gradle Plugin 2.17 needs it — the wrapper is already
pinned) and a JDK/JBR 21 (the install's own JBR is used at runtime).

## Configure the backend

`src/main/resources/application.properties`:

```properties
mateu.baseUrl=http://localhost:8592
mateu.route=/
mateu.config={}
```

`8592` pairs with the repo's `demo/demo-admin-panel` (`mvn spring-boot:run`).

## Run

```bash
./gradlew runIde        # boots the platform straight into the `mateu` window
```

## Status / next steps

Working: full-platform boot via ApplicationStarter, app shell with recursive menu, the tabbed
workspace (closeable tabs, independent contexts), Page / Form / Crud / Form fields incl. the calendar
date picker, all rendering **locally** (not a remote-dev backend).

Next: detachable docking via `DockManager`, using platform date-picker/JBPopup components directly,
and a standalone launch wrapper (a script that runs the install's launcher with the `mateu` command)
so it starts without Gradle. Note the popup factory resolves to the remote-dev backend variant under
IntelliJ **Ultimate**; basing on IntelliJ **Community** avoids that.
