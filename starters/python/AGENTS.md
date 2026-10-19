# AGENTS.md

Guidance for AI coding assistants (Claude Code, Codex, Cursor, Copilot…) working in this project.
`CLAUDE.md` imports this file, so both conventions read the same text.

## What this is

A [Mateu](https://mateu.io) app on **FastAPI (Python 3.11+)**. Mateu is a **model-driven UI
system**: you declare the model once — classes decorated `@ui` — and Mateu derives the forms,
CRUD screens, navigation and app shell. There is no frontend code to write: this backend answers
the Mateu wire (`POST /mateu/v3/sync/{route}`) and any Mateu renderer renders it.

## Layout

```
requirements.txt        the Mateu package (mateu-ui on PyPI) + its dependencies
main.py                 the FastAPI app; add_mateu(app, views) mounts the views module
views.py                the UI: the app shell (@app Shell — menu Home, Products — with HomeRouteSupplier
                        picking the home page), the home page (a Welcome at @ui("home")) and the
                        model (Product) with its Crud[Product] at @ui("products")
test_starter.py         smoke test: the shell, the home page and the CRUD answer on the sync endpoint
```

## Run

```bash
pip install -r requirements.txt
uvicorn main:app --port 8080          # sync API on http://localhost:8080
MATEU_UI=mateu-vaadin-<version>.jar uvicorn main:app --port 8080   # + the web page at http://localhost:8080
pytest -q
```

To see the app in a browser, point `MATEU_UI` (or `add_mateu(..., ui=...)`) at the web renderer:
the `io.mateu:mateu-vaadin` jar of your Mateu version from Maven Central
(`curl -LO https://repo1.maven.org/maven2/io/mateu/mateu-vaadin/<version>/mateu-vaadin-<version>.jar`),
or its extracted `static/` folder. The server then serves the page and its assets like a Java app.
Without it the server answers the sync API only — run a renderer against it instead, e.g. from a
Mateu checkout `MATEU_BACKEND=http://localhost:8080 npm run dev` in `frontend/web/monorepo/apps/vaadin`,
or the React Native app with `EXPO_PUBLIC_MATEU_BACKEND_URL=http://localhost:8080`.

## Rules to respect

- **View models are per request.** A `@ui` class is instantiated fresh for every request: keep
  shared data in a module-level store or a service, never in instance attributes you expect to
  survive between requests.
- A CRUD is a `Crud[T]` implementing `fetch`, `get`, `save` and `delete`. Implement `save` and
  `delete` for real: their defaults do nothing, so a CRUD without them answers "Saved" and drops
  the data.
- **Actions are declared.** Only a `@button`/`@toolbar`/`@action` method, or an action id the view
  itself names (a fluent button, a trigger), runs; any other action id answers 403. An action that
  changes attributes re-renders the view by returning `self` (returning `None` shows nothing new;
  a list `[self, Message(...)]` shows the toast but does not re-render).
- A read-only form field is `PlainText()` (or `@read_only` on the whole view); the `ReadOnly()`
  marker only applies to columns of an `@inline_editing` Crud.
- Field behaviour comes from `Annotated[...]` markers (`Required()`, `Section(...)`…); class and
  method features from decorators (`@title`, `@ui`…). Use snake_case. Check the docs before
  inventing an API.
- Do not hand-write routes or frontend code for the UI — declare the model.

## References

- **Claude Code plugin `mateu`** (the skills that know this API): `/plugin marketplace add
  miguelperezcolom/mateu`, then `/plugin install mateu@mateu`. A project made by the New Project
  wizards already enables it in `.claude/settings.json` — trust the folder and install it once.
  Skills for this project: `mateu-python` (Python screens, Crud[...], the app shell), `mateu-run` (run + screenshot), `mateu-yaml` (YAML specs). Guide: https://mateu.io/build-uis-with-ai/
- Docs: https://mateu.io (Python user manual: https://mateu.io/python-user-manual/).
- For AI tools: https://mateu.io/llms.txt, https://mateu.io/mateu-ai-compact.md and
  https://mateu.io/mateu-ai-full.md (Java-first; https://mateu.io/reference/language-rosetta/
  maps every annotation to its Python marker/decorator).
- Source: https://github.com/miguelperezcolom/mateu
