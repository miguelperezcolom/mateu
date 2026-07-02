# Mateu IntelliJ Platform renderer (standalone Swing)

A desktop renderer for Mateu UIs built on the **real IntelliJ Platform** — it renders with the
**Kotlin UI DSL v2** (`com.intellij.ui.dsl.builder.panel`) plus JetBrains Swing components
(`JBTable`, `JBTabbedPane`, `Splitter`, `JBTextField`…) and the IntelliJ (Darcula) Look & Feel.

It speaks Mateu's wire contract, calls a running backend over HTTP and renders the returned
`UIIncrementDto` with native platform widgets. It is the platform-native counterpart of the JavaFX
renderer (`frontend/app/javafx`) and the Compose/Jewel renderer (`frontend/app/compose`) — this one
is a **standalone Swing app** (not an IntelliJ plugin) that brings up just enough of the platform UI
runtime to render outside the IDE.

## How it renders standalone (no full IDE)

This app does **not** boot a full IntelliJ `Application` (that path needs a real product-modules
install layout the Maven artifacts don't carry). Instead `PlatformBootstrap` prepares the minimum
the DSL/L&F need: private temp `idea.home/config/system` paths, a precomputed HiDPI scale
(`JBUIScale`), and the installed `DarculaLaf`. That is enough for the Kotlin UI DSL v2 and the JB
components to paint. The IntelliJ-launcher `--add-opens`/`--add-exports` VM args are set in
`build.gradle.kts`.

## Structure

```
src/main/kotlin/io/mateu/ijp/
  Main.kt                     entry point: bootstrap → read config → window → initial load
  bootstrap/PlatformBootstrap.kt   paths + JBUIScale + Darcula L&F
  api/MateuApiClient.kt       java.net.http + Jackson (JsonNode); POST {baseUrl}/mateu/v3/sync/{route}
  api/Json.kt                 Kotlin ergonomics over Jackson JsonNode
  state/AppSession.kt         shared services (client, appState, executor, window)
  state/AppContext.kt         per-view nav state + slot registry + applyIncrement/Fragment/Command
  ui/ComponentRenderer.kt     dispatch by metadata.type → JComponent
  ui/AppRenderer.kt           app shell: Splitter(menu | ux_main content slot)
  ui/PageRenderer.kt          page header / body / buttons
  ui/Forms.kt                 Form / FormLayout (Kotlin UI DSL v2) / FormRow
  ui/FormFieldRenderer.kt     dataType/stereotype → JB input, writing back to componentState
  ui/Containers.kt            Section / SubSection / Card / Badge / Anchor / ProgressBar
  ui/Layouts.kt               VBox / HBox / Tabs (JBTabbedPane) / Accordion / Split
  ui/CrudRenderer.kt          JBTable grid: columns, rows, toolbar, search, pagination, row → detail
  ui/Buttons.kt / Widgets.kt  button DTO → JButton; shared layout helpers
src/main/resources/application.properties   backend config
```

## Configure the backend

Edit `src/main/resources/application.properties`:

```properties
mateu.baseUrl=http://localhost:8080
mateu.route=/
mateu.config={}
```

Point `mateu.baseUrl` at any running Mateu backend (e.g. a demo app, or `http://localhost:8592`).

## Run

```bash
./gradlew run              # launch the desktop app
./gradlew compileKotlin    # compile only
```

JDK 21 is used (pinned via `gradle/gradle-daemon-jvm.properties` + the Kotlin/Java toolchain), so it
builds regardless of the JDK running Gradle. Platform artifacts resolve from the JetBrains
`intellij-repository` (see `build.gradle.kts`); the targeted platform build is one `platformVersion`
string.

## Status / not yet implemented

Implemented and verified against a live backend: app shell + recursive menu, Page, Form/FormField
(all data types), Section/Card, Tabs, and the Crud grid (search, pagination, row→detail navigation).

Not yet: multi-column FormLayout (`maxColumns`/`colspan` are read but laid out one field per row),
per-cell action/link columns in the grid (row double-click opens the detail/edit view instead),
real modal dialogs, and a HiDPI-aware scale (fixed at 1.0). Forms currently stretch to fill the page
height rather than top-aligning.
```
