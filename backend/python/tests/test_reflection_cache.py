"""A view's annotations are resolved ONCE per class: with ``eval_str`` every call used to ``eval``
each string annotation again, several times per request (~20% of a listing load, 2026-11 —
design/performance/baseline-2026-11.md). A forward reference that does not resolve yet is not
cached, so it resolves once its class exists."""

from __future__ import annotations

import inspect
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import reflection  # noqa: E402
from mateu_ui.core.sync_handler import _walkable_fields  # noqa: E402
from mateu_ui.dtos import FormFieldMetadata  # noqa: E402


class Cached:
    name: str = ""
    age: int = 0


def test_annotations_are_resolved_once_per_class(monkeypatch):
    calls = []
    real = inspect.get_annotations

    def counting(obj, **kwargs):
        calls.append(obj)
        return real(obj, **kwargs)

    monkeypatch.setattr(reflection.inspect, "get_annotations", counting)
    first = [f.name for f in reflection.view_fields(Cached)]
    resolved = len(calls)
    second = [f.name for f in reflection.view_fields(Cached)]
    assert first == second == ["name", "age"]
    assert len(calls) == resolved  # the second call evaluated nothing
    # callers get a copy: mutating it never changes the cache
    reflection._local_hints(Cached).clear()
    assert [f.name for f in reflection.view_fields(Cached)] == ["name", "age"]


def test_a_forward_reference_not_defined_yet_is_not_cached():
    class Early:
        later: Later  # noqa: F821 - never defined: the reference cannot resolve

    assert reflection._local_hints(Early) == {"later": "Later"}  # unevaluated, not cached
    assert Early not in reflection._HINTS


def test_the_reference_walk_skips_scalar_fields_by_declared_type():
    walkable = _walkable_fields(FormFieldMetadata)
    assert "label" not in walkable and "readOnly" not in walkable and "read_only" not in walkable
