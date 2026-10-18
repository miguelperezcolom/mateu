"""Deprecated top-level aliases: ``mateu_uidl`` → ``mateu_ui.uidl`` and friends.

Before 3.0-beta the wheel installed four generic top-level packages (``mateu_uidl``,
``mateu_dtos``, ``mateu_core``, ``mateu_fastapi``). They now live under the one ``mateu_ui``
namespace. The old names keep working for the whole 3.x line through two pieces:

1. each old top-level package is a one-line shim calling :func:`alias`, which emits ONE
   ``DeprecationWarning`` naming the new path and swaps itself in ``sys.modules`` for the new
   module, so ``import mateu_core`` *is* ``mateu_ui.core``;
2. a meta-path finder (:class:`_AliasFinder`, installed once) that answers every submodule import
   under an old name (``from mateu_core.mapper import ReflectionMapper``) with the module already
   imported under the new name.

The second piece is what keeps identities intact: without it ``mateu_core.mapper`` would be
loaded a SECOND time from the same file under another name, with its own copies of every class,
so an ``isinstance`` check or a registry lookup would silently disagree between the two spellings.
"""

from __future__ import annotations

import importlib
import importlib.abc
import importlib.machinery
import importlib.util
import sys
import types
import warnings

#: old top-level name → new module path
ALIASES: dict[str, str] = {
    "mateu_uidl": "mateu_ui.uidl",
    "mateu_dtos": "mateu_ui.dtos",
    "mateu_core": "mateu_ui.core",
    "mateu_fastapi": "mateu_ui.fastapi",
}


def _target(fullname: str) -> str | None:
    head, dot, rest = fullname.partition(".")
    new = ALIASES.get(head)
    if new is None:
        return None
    return new + dot + rest


class _AliasLoader(importlib.abc.Loader):
    def __init__(self, target: str) -> None:
        self._target = target
        self._spec: importlib.machinery.ModuleSpec | None = None

    def create_module(self, spec):  # noqa: D102 - the real module, imported under its new name
        module = importlib.import_module(self._target)
        self._spec = module.__spec__
        return module

    def exec_module(self, module) -> None:  # noqa: D102 - already executed under its new name
        # The import machinery stamped the ALIAS spec on the real module; give it back its own, so
        # it keeps reporting its canonical name (reload, pickling, tracebacks).
        module.__spec__ = self._spec


class _AliasFinder(importlib.abc.MetaPathFinder):
    def find_spec(self, fullname, path=None, target=None):  # noqa: D102
        if "." not in fullname:
            # The top-level shims are real files: let the ordinary finders load them, so the
            # deprecation warning is raised from the shim the user imported.
            return None
        new = _target(fullname)
        if new is None:
            return None
        if importlib.util.find_spec(new) is None:
            return None
        return importlib.machinery.ModuleSpec(fullname, _AliasLoader(new), is_package=_is_package(new))


def _is_package(name: str) -> bool:
    spec = importlib.util.find_spec(name)
    return bool(spec is not None and spec.submodule_search_locations is not None)


_FINDER = _AliasFinder()


def install() -> None:
    """Put the alias finder in front of the path-based finders (idempotent)."""
    if _FINDER not in sys.meta_path:
        sys.meta_path.insert(0, _FINDER)


def alias(old: str) -> types.ModuleType:
    """Called by the shim ``old/__init__.py``: warn once, then become the new module."""
    new = ALIASES[old]
    install()
    warnings.warn(
        f"'{old}' is deprecated and will be removed in Mateu 4: import '{new}' instead "
        f"(e.g. 'from {new} import ...'). The mateu-ui wheel now installs one top-level "
        f"package, 'mateu_ui'.",
        DeprecationWarning,
        # 1 = here, 2 = the shim, 3 = the user's import line (warnings.warn skips the import
        # machinery's own frames by itself)
        stacklevel=3,
    )
    module = importlib.import_module(new)
    sys.modules[old] = module
    return module
