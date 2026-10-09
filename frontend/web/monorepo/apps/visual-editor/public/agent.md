# Mateu visual editor: UI definitions from an AI agent

Mateu renders a UI from a declarative model. One way to author that model is YAML files under
`src/main/resources/specs/ui/`. People edit those files in the **Mateu visual editor**, a WYSIWYG
canvas that runs in a browser, in IntelliJ and in VS Code.

You, the agent, write the YAML and hand it back as a **share link**. The person opens the link in
their editor, sees the screen rendered, refines it, and saves it into their project.

## What to deliver

**Reply with a share link on the editor address the person gave you** (if they gave none, use
`http://localhost:5199/`). If you cannot run code, reply with the JSON document below in a code
block instead; the editor's **Open link…** accepts the bare JSON too.

Do not decode, verify or round-trip your own link: the editor validates it when it opens and says
what is wrong.

To make the link:

1. Save the document (below) to a file, e.g. `design.json`. Do not inline it in a shell command;
   quoting breaks.
2. Run one of these on the file, with the editor address, and reply with the printed link.

```js
// Node (link.mjs): node link.mjs design.json http://localhost:5199/
import { readFileSync } from "node:fs";
import { deflateRawSync } from "node:zlib";
const [file, base = "http://localhost:5199/"] = process.argv.slice(2);
console.log(base.split("#")[0] + "#mateuz=" + deflateRawSync(readFileSync(file, "utf8")).toString("base64url"));
```

```python
# Python (link.py): python link.py design.json http://localhost:5199/
import sys, zlib, base64
data = open(sys.argv[1], "rb").read()
base = (sys.argv[2] if len(sys.argv) > 2 else "http://localhost:5199/").split("#")[0]
c = zlib.compressobj(9, zlib.DEFLATED, -15)          # raw deflate, no header
raw = c.compress(data) + c.flush()
print(base + "#mateuz=" + base64.urlsafe_b64encode(raw).decode().rstrip("="))
```

With no way to compress, `#mateu=` followed by the URI-encoded JSON also works.

The link is long (a few KB). That is expected: the whole design travels in it, in the URL fragment,
which is never sent to any server. Keep the document under about 200 KB.

## The document

```jsonc
{
  "v": 1,                          // always 1
  "path": "customers.yaml",        // the file, relative to specs/ui/ (optional but recommended)
  "yaml": "type: VerticalLayout\n…",   // the file's content: the file the editor opens
  "files": {                       // optional: the REST of the mount, path → content
    "routes.yaml": "type: Routes\n…"
  }
}
```

Only `yaml` is opened in the canvas. `files` matters when the screen references other files (a
route table, a `sources.yaml` catalogue, a partial); a browser editor loads them as the mount, an
IDE editor loads only `yaml` (the person creates the others).

## The YAML

The authoritative contract is the generated JSON Schema, published on master:

- Every file kind (`oneOf`): https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json
- The component catalog: https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/uidl-schema.json

Use only component `type`s and keys the schema declares. A key it does not know makes the whole
file fail to parse, and the page answers "Not found.".

A **page** is one root component: a mapping with a `type:`, and, for containers, a `content:` list.

```yaml
type: VerticalLayout
spacing: true
padding: true
content:
  - type: Text
    text: "Customer"
    container: h2
  - type: FormLayout
    content:
      - type: FormField
        id: name            # camelCase; binds to the view model property of the same name
        label: "Name"
        dataType: string
      - type: FormField
        id: email
        label: "Email"
        dataType: string
        stereotype: email
  - type: HorizontalLayout
    spacing: true
    content:
      - type: Button
        label: "Save"
        actionId: save
        buttonStyle: primary
```

Rules that keep a page valid:

- `dataType` is one of: integer, string, number, date, time, dateTime, bool, array, file, status,
  money, component, menu, range, action, actionGroup. There is **no** `decimal`: use `number` or `money`.
- A stack is `VerticalLayout`, a row is `HorizontalLayout`, fields go in a `FormLayout`.
- A page bound to a Java view model names it once at the root (`modelView: com.acme.CustomerView`);
  its fields' `id`s and buttons' `actionId`s must be that class's members. A page with **no** view
  model omits `modelView:` entirely.
- A classless page can still read and write through REST: a `Listing` with `rowsSource: { ref: <name> }`,
  and a top-level `actions:` list whose entries (`id` = a button's `actionId`) carry a `restAction`
  with `source: { ref: <name> }`. The named sources live in `sources.yaml` (send it in `files`). A
  complete example, a CRUD with no Java: https://github.com/miguelperezcolom/mateu/tree/master/demo/demo-starwars/src/main/resources/specs/ui

Other file kinds are discriminated by `type:` at the root: `UI` (a mount), `AppShell` (title, variant,
menu), `Routes` (route → `definition` page + optional `viewModel`), and the `sources.yaml` catalogue.
The schema above describes each one.

Spend your effort on the right components, sensible labels and ids, and the structure the person
described. Spacing and fine layout they will adjust in the canvas.
