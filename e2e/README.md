# Mateu E2E Test Suite

End-to-end tests for Mateu applications, using [Playwright](https://playwright.dev/).

---

## Structure

```
e2e/
├── playwright.config.ts       # Playwright configuration (one project per app)
├── tests/
│   └── mvc-app1/              # Tests for mvc-app1
│       ├── simple-form.spec.ts  # HTML/routing tests
│       └── api.spec.ts          # Mateu REST API tests
└── sut/                       # Subject Under Test — the apps being tested
    ├── modules/
    │   └── sample1/           # Pure Java module: @UI class definitions
    └── apps/
        └── mvc-app1/          # Spring Boot MVC app, depends on sample1
```

### `sut/modules/` — UI definition modules

Plain Java modules that contain classes annotated with `@UI`. They have **no dependency on any
framework** (Spring, Quarkus, etc.) — only on `io.mateu:uidl`.

During build, the `annotation-processor-indexer` runs and writes a manifest file
`META-INF/mateu/ui-registrations` into the jar. This file lists every `@UI` class in the module
so that downstream apps can generate the necessary controllers without having access to the
source files.

### `sut/apps/` — Runnable applications

Spring Boot (or other framework) apps that pull in one or more UI modules as dependencies and
wire them into a runnable server. The annotation processor generates controllers at compile time
by reading the `META-INF/mateu/ui-registrations` index from the dependency jars.

---

## How the cross-module annotation processing works

This is the key non-obvious part of the setup.

### Problem

Java annotation processors only see source files of the module being compiled. If `@UI` classes
live in a separate module (`sample1`), the framework-specific AP (`annotation-processor-mvc`)
would normally never see them and generate nothing.

### Solution — two-step indexing

**Step 1 — index module** (`sample1/pom.xml`):

Add `annotation-processor-indexer` to both `<dependencies>` and `<annotationProcessorPaths>`:

```xml
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>annotation-processor-indexer</artifactId>
    <version>${mateu.version}</version>
    <scope>provided</scope>
</dependency>
```

```xml
<annotationProcessorPaths>
    <path>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.18.40</version>
    </path>
    <path>
        <groupId>io.mateu</groupId>
        <artifactId>annotation-processor-indexer</artifactId>
        <version>${mateu.version}</version>
    </path>
</annotationProcessorPaths>
```

`MateuUIIndexerProcessor` runs during `sample1`'s compilation and writes
`META-INF/mateu/ui-registrations` into the jar with one entry per `@UI` class:

```
class=io.mateu.sample1.SimpleForm
simpleClassName=SimpleForm
path=
indexHtmlPath=/static/_index.html
...
---
class=io.mateu.sample1.MenuApp
simpleClassName=MenuApp
path=/app
...
```

**Step 2 — app module** (`mvc-app1/pom.xml`):

Add `sample1` **both** as a regular dependency AND inside `<annotationProcessorPaths>`:

```xml
<!-- Regular compile dependency -->
<dependency>
    <groupId>io.mateu.e2e</groupId>
    <artifactId>sample1</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</dependency>
```

```xml
<annotationProcessorPaths>
    <path>...</path> <!-- lombok -->
    <path>
        <groupId>io.mateu</groupId>
        <artifactId>annotation-processor-mvc</artifactId>
        <version>${mateu.version}</version>
    </path>
    <!-- sample1 must also be on the AP classpath so the processor
         can read META-INF/mateu/ui-registrations from the jar -->
    <path>
        <groupId>io.mateu.e2e</groupId>
        <artifactId>sample1</artifactId>
        <version>1.0.0-SNAPSHOT</version>
    </path>
</annotationProcessorPaths>
```

`MateuIndexedUIProcessor` (declared with `@SupportedAnnotationTypes("*")`) fires on every
compilation even when there are no source-level `@UI` classes. In its final round it reads the
index from the classpath and generates the Spring MVC controllers
(`SimpleFormController`, `SimpleFormMateuController`, …).

---

## Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 18+
- Mateu artifacts installed in local Maven repo (`0.0.1-MATEU`)

---

## Build & run

### 1. Build the UI definition module

```bash
cd sut/modules/sample1
mvn clean install
```

This compiles the `@UI` classes and produces a jar with `META-INF/mateu/ui-registrations`.

### 2. Start the app

```bash
cd sut/apps/mvc-app1
mvn spring-boot:run
```

At compile time Maven runs the annotation processor, which reads the index from `sample1.jar`
and generates the Spring MVC controllers. The app starts on **http://localhost:8080**.

Generated endpoints:

| URL | Description |
|-----|-------------|
| `GET /` | HTML shell for `SimpleForm` |
| `GET /app` | HTML shell for `MenuApp` |
| `GET /app/**` | SPA sub-routes — forwarded to `/app` by `SpaRedirectFilter` |
| `POST /mateu/v3/**` | Mateu API for `SimpleForm` |
| `POST /app/mateu/v3/**` | Mateu API for `MenuApp` |

### 3. Install Playwright (first time only)

```bash
cd e2e          # root of this folder
npm install
npx playwright install chromium
```

### 4. Run the tests

```bash
# app must already be running (step 2)
npm test
```

Other useful commands:

```bash
npm run test:headed    # open a real browser window
npm run test:ui        # Playwright interactive UI mode
npm run report         # open the last HTML report
```

---

## Mateu REST API — quick reference

All endpoints accept and return JSON.

### Load initial UI

```
POST /{baseUrl}/mateu/v3/components/_/action
{ "route": "/", "actionId": "__load__" }
```

Response shape (`UIIncrementDto`):

```json
{
  "commands": [{ "type": "SetWindowTitle", "data": "My App" }],
  "messages": [],
  "fragments": [{ "component": { "type": "ClientSide", "metadata": { ... } } }]
}
```

### Run a button action

```
POST /{baseUrl}/mateu/v3/components/_/action
{
  "route": "/",
  "actionId": "greet",
  "componentState": { "name": "World" }
}
```

Success response:

```json
{
  "messages": [{ "variant": "success", "text": "Hello World!" }],
  "fragments": []
}
```

### Notes

- `baseUrl` is `""` for the root UI (`@UI("")`) and `/app` for `@UI("/app")`.
- `actionId` corresponds to the method name annotated with `@Button`.
- `componentState` mirrors the field names of the `@UI` class.
- Validation errors are returned as messages with `"variant": "warning"` or `"error"`.

---

## Adding a new UI module or app

1. Create a new Maven module under `sut/modules/` with the `annotation-processor-indexer` AP.
2. Define your `@UI` classes there and run `mvn install`.
3. Create (or update) a `sut/apps/` module that depends on the new module — add it to both
   `<dependencies>` and `<annotationProcessorPaths>`.
4. Add a new Playwright project entry in `playwright.config.ts` pointing to the app's port.
5. Add test files under `tests/<app-name>/`.
