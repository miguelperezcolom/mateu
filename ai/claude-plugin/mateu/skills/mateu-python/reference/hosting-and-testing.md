# Python hosting, security, YAML, differences from Java, tests

## `add_mateu`

```python
from fastapi import FastAPI
from mateu_ui.core.identity import identity_from_claims
from mateu_ui.fastapi import add_mateu
import views

app = FastAPI()
add_mateu(
    app, views,                                   # any number of modules / classes
    cors_origins=["https://app.example.com"],     # CORS is OFF unless you list origins
    secrets_provider=lambda key: None,            # ${secret.KEY} in PROXIED REST sources
    dev=False,                                    # True (or MATEU_ERRORS_DETAILED=true) shows exceptions
    ui=None,                                      # path to the mateu-vaadin jar / static dir (or MATEU_UI)
)

def verify_with_your_idp(header):                 # YOUR token check (e.g. PyJWT + JWKS) — not Mateu's
    return None

@app.middleware("http")
async def authenticate(request, call_next):
    claims = verify_with_your_idp(request.headers.get("authorization"))
    if claims is not None:
        request.state.mateu_identity = identity_from_claims(claims)   # roles/groups/scopes/permissions
    return await call_next(request)
```

- Mateu never decodes a token. Identity = `request.state.mateu_identity`, else Starlette's
  `AuthenticationMiddleware` (`request.user` + `request.auth.scopes`). No identity → every
  `EyesOnly`/`ReadOnlyUnless`/`DisabledUnless`/`@eyes_only` gate denies. `Audience()` is a
  projection the client controls, never security.
- Secrets fall back ONLY to the env var `MATEU_SECRET_<KEY>`.
- Errors: `UserFacingException` shows as written; anything else → "Something went wrong / … Reference:
  <id>" (the correlation id, also in the `X-Mateu-Correlation-Id` header), logged under `mateu.errors`.
- Other options: `translator=` (a `Translator` subclass), `base_url=`, `identity_provider=`,
  `proxy_timeout_seconds=`, `environment=`, `mcp=` (MCP endpoint, off by default).

## YAML specs served by a Python app

The server also reads `specs/ui/**` under the working directory (`MATEU_SPECS_DIR` to change it):
`type: UI` mounts, `routes.yaml` (`viewModel:`/`view_model: views.Tickets` — module path +
class — with `fixedParams`), page layouts, `partials/`, `sources.yaml` (sample data only with
`MATEU_SOURCES_MOCK=true`), types, translations. Not in this port: `type: AppShell` (use `@app`
or `AppSupplier`), a listing's `rowRoute`, the static-bundle exporter. Authoring the YAML itself →
skill `mateu-yaml`.

## How Python differs from Java (same wire, different declaration)

| Java | Python |
|---|---|
| `@UI("/x")` on a class | `@ui("x")` |
| `@UI("")` + `@Menu` fields | `@app("Title")` + `@menu_item` methods (return annotation = target) |
| `AutoCrud<T>` + `CrudStore<T>` | `Crud[T]`: `fetch`/`get`/`save`/`delete` (+ `find` for pushdown) |
| `@NotCreatable`, `@NotDeletable` | `display()` returning a `CrudDisplay` with toggles off |
| `WizardStep` fields + `@WizardCompletionAction` | `Step(n)` markers + `complete()` / `@wizard_completion_action` |
| `@Action(shortcut, timeoutMillis)` | `@shortcut`, `@action_options` (+ `@action` to declare) |
| `@KPI` field | `@kpi("Title")` method |
| `@BadgeInHeader` | `HeaderBadge(color=…)` marker |
| `@Size` (length) | `Length(min=, max=)` |
| `HttpRequest` parameter | a parameter annotated `ActionRequest` (or named `request`) |
| `new State(this)` | `return self` |
| `URI.create("/x")` | `return "/x"` |
| `OptionsSupplier` | the view's `options(field_name)` method |
| composed annotation | an `Annotated[...]` alias |

Full map: https://mateu.io/reference/language-rosetta/ — supported features:
https://mateu.io/reference/parity/.

## Tests (pytest + TestClient)

```python
from fastapi.testclient import TestClient
import main

client = TestClient(main.app)

def sync(route: str, action_id: str = "", state: dict | None = None, status: int = 200) -> str:
    r = client.post(f"/mateu/v3/sync/{route}",
                    json={"route": route, "actionId": action_id, "componentState": state or {}})
    assert r.status_code == status, r.text
    return r.text

def test_products_load():
    assert "Products" in sync("products")

def test_greet_rerenders():
    assert "Hi, Ana" in sync("signup-form", "greet", {"name": "Ana", "email": "a@b.co"})

def test_undeclared_action_is_refused():
    sync("signup-form", "dropTables", status=403)
```

The request body is `{route, actionId, componentState, parameters?}`; `actionId: ""` loads the
route (no `serverSideType` needed; a leading `/` on the route is optional). A rejected validation
answers 200 with an error message — a `@button` says "There are validation errors" plus the list,
a Crud create/save says "Please fill: <Field>", so match on the field name, not the wording. Needs
`httpx` (and `pytest`) installed.

### Testing a `Crud`

Loading a listing returns its COLUMNS, not its rows: the browser asks for the rows with the
`search` action right after the load. The CRUD lifecycle as action ids on the wire:

| Step | Route | `actionId` | `componentState` / result |
|---|---|---|---|
| rows | `customers` | `search` | rows at `fragments[0].data.crud.page.content` |
| new form | `customers/new` | `""` | the creation form (buttons `cancel-new`, `create`) |
| create | `customers/new` | `create` | the fields → "Saved" message + `NavigateTo /customers` |
| edit form | `customers/<id>/edit` | `""` | buttons `cancel-edit`, `save` |
| save | `customers/<id>/edit` | `save` | the fields → "Saved" + `NavigateTo` |
| delete | `customers` | `delete` | `{"crud_selected_items": [{"id": "<id>"}]}` → "Deleted" |

```python
def rows(route: str) -> list[dict]:
    r = client.post(f"/mateu/v3/sync/{route}", json={"route": route, "actionId": "search", "componentState": {}})
    return r.json()["fragments"][0]["data"]["crud"]["page"]["content"]

def test_create_persists():
    sync("customers/new", "create", {"name": "Ada", "email": "ada@x.io", "tier": "Gold"})
    assert any(r["name"] == "Ada" for r in rows("customers"))
```

The store is usually module-level, so a test that writes should clean up after itself (or reset
the store in a fixture). To see it render: run uvicorn with `MATEU_UI` set and open `http://localhost:8080/<route>`.
