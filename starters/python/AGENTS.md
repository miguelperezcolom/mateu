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
views.py                the model (Product) and the UI (a Crud[Product] mounted with @ui("products"))
test_starter.py         smoke test: the CRUD answers on the sync endpoint
```

## Run

```bash
pip install -r requirements.txt
uvicorn main:app --port 8080          # sync API on http://localhost:8080
pytest -q
```

## Rules to respect

- **View models are per request.** A `@ui` class is instantiated fresh for every request: keep
  shared data in a module-level store or a service, never in instance attributes you expect to
  survive between requests.
- A CRUD is a `Crud[T]` implementing `fetch`, `get`, `save` and `delete`.
- Field behaviour comes from `Annotated[...]` markers (`Required()`, `Section(...)`…); class and
  method features from decorators (`@title`, `@ui`…). Use snake_case. Check the docs before
  inventing an API.
- Do not hand-write routes or frontend code for the UI — declare the model.

## References

- Docs: https://mateu.io (Python user manual: https://mateu.io/python-user-manual/).
- For AI tools: https://mateu.io/llms.txt, https://mateu.io/mateu-ai-compact.md and
  https://mateu.io/mateu-ai-full.md (Java-first; https://mateu.io/reference/language-rosetta/
  maps every annotation to its Python marker/decorator).
- Source and Claude Code skills: https://github.com/miguelperezcolom/mateu (`.claude/skills/`).
