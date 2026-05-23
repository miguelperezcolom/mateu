---
title: "YAML UI Definition"
---

Mateu can render a page defined entirely in a **YAML file** — no Java class required.

When the framework receives a request for a route that has no matching Java class, it looks for a YAML file in the classpath and uses it to build the component tree automatically.

## How it works

1. A request arrives for route `my-app/my-page`.
2. Mateu finds no `@Route`-annotated Java class for that route.
3. Mateu looks for `specs/ui/my-app/my-page.yaml` in the classpath.
4. If found, it deserializes the file into a component tree and renders it.
5. If not found, Mateu falls back to "Not found".

## File location

Place YAML files under `src/main/resources/specs/ui/`, mirroring the route structure:

| Route | YAML file |
|---|---|
| `hello` | `src/main/resources/specs/ui/hello.yaml` |
| `demo/hello` | `src/main/resources/specs/ui/demo/hello.yaml` |
| `admin/users/list` | `src/main/resources/specs/ui/admin/users/list.yaml` |

## File format

Every YAML file must have a root `type` field that names the component to render. All nested components also need a `type`.

```yaml
type: VerticalLayout
spacing: true
padding: true
content:
  - type: Text
    text: "Hello from YAML!"
    container: h1
  - type: Text
    text: "This page was defined in a YAML file, without any Java class."
  - type: HorizontalLayout
    spacing: true
    content:
      - type: Button
        label: "Save"
        actionId: save
        buttonStyle: primary
      - type: Button
        label: "Cancel"
        actionId: cancel
        buttonStyle: secondary
  - type: FormLayout
    content:
      - type: FormField
        id: name
        label: "Name"
        dataType: string
        required: true
      - type: FormField
        id: email
        label: "Email"
        dataType: string
        stereotype: email
      - type: FormField
        id: birthDate
        label: "Birth date"
        dataType: date
```

## Available types

All component types from the [`io.mateu.uidl.data`](../supported-components/) package are supported.
Use the exact class name as the `type` value.

**Layout components:** `VerticalLayout`, `HorizontalLayout`, `FormLayout`, `TabLayout`, `SplitLayout`, `MasterDetailLayout`, `AccordionLayout`, `BoardLayout`, `CarouselLayout`, `Grid`, …

**Content components:** `Text`, `Markdown`, `Image`, `Icon`, `Badge`, `KPI`, `Chart`, `ProgressBar`, `Anchor`, `Bpmn`, `Workflow`, …

**Input components:** `FormField`, `CustomField`, `FormSection`, `FormRow`, …

**Action components:** `Button`, `Dialog`, `ConfirmDialog`, …

**Navigation:** `RouteLink`, `Menu`, `Directory`, `Breadcrumbs`, …

The complete list of types and their fields is in the JSON Schema:
`backend/shared/uidl/uidl-schema.json`

## IntelliSense setup

The project ships a JSON Schema at `backend/shared/uidl/uidl-schema.json`.
Connecting your editor to it gives you **autocompletion**, **field validation**, and **documentation tooltips** while editing YAML files.

---

### VS Code

**Option A — workspace settings (recommended)**

Install the [YAML extension by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml), then add this to `.vscode/settings.json`:

```json
{
  "yaml.schemas": {
    "./backend/shared/uidl/uidl-schema.json": "src/**/specs/ui/**/*.yaml"
  }
}
```

This activates IntelliSense for every `*.yaml` file under any `specs/ui/` directory in the project.

**Option B — per-file comment**

Add this comment at the top of any individual YAML file:

```yaml
# yaml-language-server: $schema=../../../backend/shared/uidl/uidl-schema.json
type: VerticalLayout
...
```

Adjust the relative path so it points to `uidl-schema.json` from the YAML file's location.

---

### IntelliJ IDEA

1. Open **Settings** (`⌘,` / `Ctrl+Alt+S`).
2. Go to **Languages & Frameworks → Schemas and DTDs → JSON Schema Mappings**.
3. Click **+** to add a new mapping.
4. Fill in:
   - **Name:** `Mateu UIDL`
   - **Schema file or URL:** click the folder icon and select `backend/shared/uidl/uidl-schema.json`
   - **Schema version:** `JSON Schema version 7`
5. Under **File path pattern**, click **+** and enter: `specs/ui/**/*.yaml`
6. Click **OK**.

IntelliJ will now provide autocompletion and validation for all YAML files under `specs/ui/`.

> **Tip:** If IntelliJ shows a yellow bar saying "Schema is not applied", make sure the file path pattern matches — use `specs/ui` without a leading slash.

---

## Hybrid: YAML layout + Java logic with `@UISpec`

A pure YAML file has no Java class, so it cannot run server-side logic. A pure Java `ComponentTreeSupplier` has no YAML file, so the layout is hard-coded.

`@UISpec` is the middle ground: a **Java ViewModel class** whose component tree is loaded from a YAML file. The Java class provides state (fields), actions (methods), rules, and validations; the YAML file defines the layout.

```java
@Route("customer-form")
@UISpec("specs/ui/customer-form.yaml")
public class CustomerFormViewModel {

    public String name;
    public String email;

    @Button
    public void save() { ... }
}
```

The YAML file at `src/main/resources/specs/ui/customer-form.yaml` defines the component tree rendered for this class. Mateu combines the two: layout from YAML, behaviour from Java.

See [`@UISpec`](../annotations/uispec/) for the full reference.

## When to use YAML vs Java

| Situation | Recommendation |
|---|---|
| Static informational page (about, help, landing) | Pure YAML file |
| Page with server-side logic, computed fields, actions | `@UISpec` or `ComponentTreeSupplier` |
| Prototype or low-code scenario | Pure YAML file |
| Page that needs dependency injection or DB access | `@UISpec` or Java class |
| Designer-managed layout, developer-managed logic | `@UISpec` |
| Fully dynamic / programmatic layout | `ComponentTreeSupplier` |

YAML pages and Java pages can coexist freely in the same application.
