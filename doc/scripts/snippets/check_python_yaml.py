"""Checks the Python and YAML snippets of the docs (driven by doc/scripts/check-snippets.mjs).

    python check_python_yaml.py python <snippets.json> <results.json>
    python check_python_yaml.py yaml   <snippets.json> <results.json> <specs-schema.json>

Python: each snippet becomes a module and ONE mypy run checks them all against the installed
`mateu-ui` (``pip install ./backend/python[dev,all]``). Like the Java samples, the Python ones leave
most imports out, so they are inferred: a free name exported by ``mateu_ui.uidl``,
``mateu_ui.uidl.components``, ``mateu_ui.dtos`` or ``mateu_ui.fastapi`` is imported from there, a
few standard-library names (``Annotated``, ``Enum``, ``date``…) from where they live, and any other
free name — the sample's own ``store``, ``repo``, ``Product`` — is declared ``Any``, so it is never
the reason a snippet fails. What fails: a Mateu name that does not exist, a keyword a Mateu
decorator/record does not take, a wrong attribute of a Mateu object, a syntax error, and an import
of the deprecated pre-beta packages (``mateu_uidl``, ``mateu_dtos``, ``mateu_core``,
``mateu_fastapi`` — the docs teach ``mateu_ui.*``).

YAML: a snippet whose top level declares ``type:`` (or a ``$schema`` / yaml-language-server
modeline) is validated against backend/shared/uidl/specs-schema.json — the branch of its kind
(``type: UI``, ``Routes``, ``Sources``…) or, for any other type, the component definition branch.
"""
from __future__ import annotations

import ast
import builtins
import importlib
import inspect
import json
import os
import re
import subprocess
import sys
import tempfile
import textwrap
import warnings

MATEU_MODULES = ["mateu_ui.uidl", "mateu_ui.uidl.components", "mateu_ui.dtos", "mateu_ui.fastapi"]
DEPRECATED = {"mateu_uidl", "mateu_dtos", "mateu_core", "mateu_fastapi"}
STDLIB = {
    "Annotated": "typing", "Any": "typing", "Optional": "typing", "ClassVar": "typing",
    "Enum": "enum", "IntEnum": "enum", "StrEnum": "enum",
    "date": "datetime", "datetime": "datetime", "time": "datetime", "timedelta": "datetime",
    "Decimal": "decimal", "dataclass": "dataclasses", "field": "dataclasses",
    "dataclasses": None, "uuid": None, "json": None, "asyncio": None, "os": None, "re": None,
}


def mateu_index() -> dict[str, list[str]]:
    """name -> the Mateu modules exporting it, in MATEU_MODULES order."""
    index: dict[str, list[str]] = {}
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        for name in MATEU_MODULES:
            try:
                mod = importlib.import_module(name)
            except Exception:  # pragma: no cover - an optional extra not installed
                continue
            exported = list(getattr(mod, "__all__", [])) + [
                n for n in dir(mod) if not n.startswith("_") and not inspect.ismodule(getattr(mod, n))]
            for n in dict.fromkeys(exported):
                if name not in index.setdefault(n, []):
                    index[n].append(name)
    return index


def java_names() -> set[str]:
    """Public type names of the Java authoring API (uidl + core's declarative layer): a free name of
    a Python sample that is one of these (`AutoCrud`) is the wrong language's vocabulary, not the
    sample's own type."""
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "backend", "shared")
    names: set[str] = set()
    for sub in ("uidl/src/main/java", "core/src/main/java/io/mateu/core/infra/declarative"):
        for dirpath, _, filenames in os.walk(os.path.join(root, sub)):
            names.update(f[:-5] for f in filenames if f.endswith(".java"))
    return names


class Names(ast.NodeVisitor):
    """Every name a snippet loads, and every name it binds anywhere (scope-insensitive on purpose)."""

    def __init__(self) -> None:
        self.loaded: list[str] = []
        self.bound: set[str] = set()
        self.called: set[str] = set()  # used as a decorator or called: `@app(...)`, `ui("x")`

    def visit_Call(self, node: ast.Call) -> None:
        if isinstance(node.func, ast.Name):
            self.called.add(node.func.id)
        self.generic_visit(node)

    def _decorators(self, node: ast.FunctionDef | ast.AsyncFunctionDef | ast.ClassDef) -> None:
        for d in node.decorator_list:
            if isinstance(d, ast.Name):
                self.called.add(d.id)

    def visit_Name(self, node: ast.Name) -> None:
        (self.loaded.append if isinstance(node.ctx, ast.Load) else self.bound.add)(node.id)

    def visit_FunctionDef(self, node: ast.FunctionDef | ast.AsyncFunctionDef) -> None:
        self._decorators(node)
        self.bound.add(node.name)
        for a in node.args.posonlyargs + node.args.args + node.args.kwonlyargs:
            self.bound.add(a.arg)
        for a in (node.args.vararg, node.args.kwarg):
            if a:
                self.bound.add(a.arg)
        self.generic_visit(node)

    visit_AsyncFunctionDef = visit_FunctionDef  # type: ignore[assignment]

    def visit_Lambda(self, node: ast.Lambda) -> None:
        for a in node.args.posonlyargs + node.args.args + node.args.kwonlyargs:
            self.bound.add(a.arg)
        self.generic_visit(node)

    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        self._decorators(node)
        self.bound.add(node.name)
        self.generic_visit(node)

    def visit_Import(self, node: ast.Import) -> None:
        for a in node.names:
            self.bound.add((a.asname or a.name).split(".")[0])

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        for a in node.names:
            self.bound.add(a.asname or a.name)

    def visit_ExceptHandler(self, node: ast.ExceptHandler) -> None:
        if node.name:
            self.bound.add(node.name)
        self.generic_visit(node)

    def visit_arg(self, node: ast.arg) -> None:
        self.bound.add(node.arg)
        self.generic_visit(node)  # its annotation: `request: SearchRequest`


def deprecated_imports(tree: ast.AST) -> list[tuple[int, str]]:
    out = []
    for node in ast.walk(tree):
        mods = [a.name for a in node.names] if isinstance(node, ast.Import) else (
            [node.module] if isinstance(node, ast.ImportFrom) and node.module else [])
        for m in mods:
            if m.split(".")[0] in DEPRECATED:
                out.append((node.lineno, f"imports the deprecated `{m}`: use `mateu_ui.{m.split('.')[0][len('mateu_'):]}`"
                            + m[len(m.split('.')[0]):]))
    return out


def check_python(snippets: list[dict]) -> list[dict]:
    index = mateu_index()
    java_only = java_names() - set(index)
    results = {s["id"]: {"id": s["id"], "status": "pass", "errors": [], "assumed": []} for s in snippets}
    work = tempfile.mkdtemp(prefix="mateu-py-snippets-")
    files: dict[str, tuple[dict, int]] = {}
    for s in snippets:
        code = textwrap.dedent(s["code"])
        r = results[s["id"]]
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            r["status"] = "fail"
            r["errors"].append({"line": e.lineno or 0, "message": f"syntax error: {e.msg}"})
            continue
        for line, msg in deprecated_imports(tree):
            r["status"] = "fail"
            r["errors"].append({"line": line, "message": msg})
        names = Names()
        names.visit(tree)
        header = ["from typing import Any"]
        assumed = []
        free = [n for n in dict.fromkeys(names.loaded) if n not in names.bound and not hasattr(builtins, n)]
        # a name two modules export (`Text`: the field marker in mateu_ui.uidl, the component in
        # mateu_ui.uidl.components) comes from the module the snippet's other names come from
        votes: dict[str, int] = {}
        for n in free:
            if len(index.get(n, [])) == 1:
                votes[index[n][0]] = votes.get(index[n][0], 0) + 1
        for n in free:
            if n in names.bound or hasattr(builtins, n):
                continue
            # a lowercase Mateu name (`app`, `ui`, `button`) is the decorator only when the snippet
            # uses it as one; `app.middleware(...)` is the sample's FastAPI app
            if n in index and (n[0].isupper() or n in names.called):
                home = max(index[n], key=lambda mod: (votes.get(mod, 0), -index[n].index(mod)))
                header.append(f"from {home} import {n}")
            elif n in java_only:
                r["status"] = "fail"
                r["errors"].append({"line": 0, "message": f"`{n}` is a name of the Java API; mateu-ui has none"})
                header.append(f"{n}: Any")
            elif n in STDLIB:
                header.append(f"import {n}" if STDLIB[n] is None else f"from {STDLIB[n]} import {n}")
            else:
                header.append(f"{n}: Any")
                assumed.append(n)
        r["assumed"] = assumed
        path = os.path.join(work, f"snippet_{s['id']}.py")
        with open(path, "w") as f:
            # the header on ONE line, so line N of the snippet is line N + 1 of the module
            f.write("; ".join(header) + "\n" + code + "\n")
        files[path] = (s, 1)
    if files:
        cmd = [sys.executable, "-m", "mypy", "--no-error-summary", "--show-error-codes",
               "--check-untyped-defs", "--ignore-missing-imports",
               "--cache-dir", os.path.join(os.path.dirname(os.path.abspath(__file__)), "target", "mypy-cache"),
               "--disable-error-code", "annotation-unchecked", "--allow-redefinition",
               "--disable-error-code", "no-redef",
               "--config-file", os.devnull, *files]
        out = subprocess.run(cmd, capture_output=True, text=True, cwd=work).stdout
        for line in out.splitlines():
            m = re.match(r"(.+?\.py):(\d+): (error): (.*)", line)
            if not m:
                continue
            path = os.path.join(work, os.path.basename(m.group(1)))
            if path not in files:
                continue
            s, offset = files[path]
            r = results[s["id"]]
            r["status"] = "fail"
            r["errors"].append({"line": int(m.group(2)) - offset, "message": m.group(4)})
    return list(results.values())


SPEC_KINDS = ["UI", "Routes", None, "Sources", "Actions", "Translations", "Environment", "Types", "Project"]
COMPONENT_BRANCH = 9


def wants_schema(code: str) -> bool:
    # a bare route file (`routes:` at the top, no `type:`) is a Routes file too: left unchecked, the
    # deprecated `definition:` key survived in the route samples for months
    return bool(re.search(r"^type:\s*\S", code, re.M) or re.search(r"\$schema", code)
                or re.search(r"^routes:\s*$", code, re.M))


def closed(node, in_all_of=False):
    """The schema with every plain object schema CLOSED (no keys beyond its `properties`), so a
    misspelt key (`layot:`) fails instead of being ignored. The published schema stays open (an
    editor must not flag what a newer Mateu accepts); the docs are checked against today's keys.
    Objects merged through `allOf` stay open — closing one half would reject the other's keys."""
    if isinstance(node, list):
        return [closed(n, in_all_of) for n in node]
    if not isinstance(node, dict):
        return node
    out = {k: closed(v, in_all_of or k == "allOf") if k != "properties" else
           {pk: closed(pv) for pk, pv in v.items()} for k, v in node.items()}
    if (not in_all_of and "properties" in node and "additionalProperties" not in node
            and "allOf" not in node and "anyOf" not in node and "oneOf" not in node):
        out["additionalProperties"] = False
    return out


def check_yaml(snippets: list[dict], schema_path: str) -> list[dict]:
    import jsonschema
    import yaml

    schema = closed(json.load(open(schema_path)))
    defs = {"$schema": schema["$schema"], "$defs": schema["$defs"]}
    validators = {}

    def validator(branch: int):
        if branch not in validators:
            validators[branch] = jsonschema.Draft7Validator({**defs, **schema["oneOf"][branch]})
        return validators[branch]

    results = []
    for s in snippets:
        r = {"id": s["id"], "status": "pass", "errors": [], "assumed": []}
        results.append(r)
        if not wants_schema(s["code"]):
            r["status"] = "skipped"
            continue
        try:
            # elisions: `content: [...]`, `{…}`, a `- ...` item
            code = re.sub(r"\[\s*(\.\.\.|…)\s*\]", "[]", s["code"])
            code = re.sub(r"\{\s*(\.\.\.|…)\s*\}", "{}", code)
            code = re.sub(r"(?m)^\s*-\s*(\.\.\.|…)\s*$", "", code)
            docs = [d for d in yaml.safe_load_all(code) if d is not None]
        except yaml.YAMLError as e:
            mark = getattr(e, "problem_mark", None)
            r["status"] = "fail"
            r["errors"].append({"line": (mark.line + 1) if mark else 0, "message": f"not YAML: {e}"})
            continue
        for doc in docs:
            if not isinstance(doc, dict):
                continue
            if "type" not in doc and isinstance(doc.get("routes"), list):
                doc = {"type": "Routes", **doc}
            kind = doc.get("type")
            if kind == "Routes":
                for i, entry in enumerate(doc.get("routes") or []):
                    if isinstance(entry, dict) and "definition" in entry:
                        r["status"] = "fail"
                        r["errors"].append({"line": 0, "message":
                            f"routes[{i}]: `definition:` is the deprecated alias of `layout:` — use `layout:`"})
            branch = SPEC_KINDS.index(kind) if kind in SPEC_KINDS else (
                COMPONENT_BRANCH if kind else 10 if "layout" in doc or "layoutDelta" in doc else None)
            if branch is None:
                r["status"] = "skipped"
                continue
            # a component validates against its own definition: the errors of a oneOf over every
            # component type would point at whichever branch failed deepest
            v = validator(branch)
            if branch == COMPONENT_BRANCH and kind in schema["$defs"]:
                own = dict(schema["$defs"][kind])
                if "properties" in own:  # plus the page-level keys a root definition may carry
                    extras = next(p for p in schema["oneOf"][branch]["allOf"] if "properties" in p)
                    own["properties"] = {**own["properties"], **extras["properties"]}
                v = jsonschema.Draft7Validator({**defs, **own})
            errors = sorted(v.iter_errors(doc), key=lambda e: (len(e.absolute_path), e.message))
            if errors:
                # with a oneOf deep in the tree the most specific error is the deepest one
                best = jsonschema.exceptions.best_match(errors)
                r["status"] = "fail"
                where = "/".join(str(p) for p in best.absolute_path) or "(root)"
                r["errors"].append({"line": 0, "message": f"{where}: {best.message[:300]}"})
    return results


def main() -> None:
    lang, src, dst = sys.argv[1:4]
    snippets = json.load(open(src))
    results = check_python(snippets) if lang == "python" else check_yaml(snippets, sys.argv[4])
    json.dump(results, open(dst, "w"), indent=1)


if __name__ == "__main__":
    main()
