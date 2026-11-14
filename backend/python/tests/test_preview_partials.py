"""``__preview__`` renders any YAML a caller posts: a ``type: Partial`` in it may only name a partial
UNDER the specs directory, and the access keys a partial carries apply to the caller like on a
served page (GA review 2, Y2: ``ref: ../../secret.yaml`` rendered a file outside, and a partial's
``eyesOnly:`` text reached anyone). Request-supplied refs are not cached forever either."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, yaml_preview  # noqa: E402
from mateu_ui.core.partial_registry import PartialRegistry  # noqa: E402
from mateu_ui.uidl import Identity  # noqa: E402

MODULE = sys.modules[__name__]


@pytest.fixture
def specs(tmp_path, monkeypatch):
    root = tmp_path / "specs" / "ui"
    (root / "partials").mkdir(parents=True)
    (tmp_path / "outside.yaml").write_text("type: Text\ntext: OUTSIDE-SECRET\n")
    (root / "partials" / "admin.yaml").write_text(
        "type: Text\ntext: ADMIN-ONLY\neyesOnly: {roles: [admin]}\n"
    )
    (root / "partials" / "open.yaml").write_text("type: Text\ntext: OPEN-TEXT\n")
    registry = PartialRegistry(str(root))
    monkeypatch.setattr(yaml_preview, "_DEFAULT_PARTIALS", registry)
    return registry


def preview(text: str, roles=()) -> str:
    h = SyncHandler(MateuRegistry(MODULE), identity_provider=lambda: Identity(roles=tuple(roles)))
    inc = h.handle(RunActionRq(action_id="__preview__", parameters={"_yaml": text}))
    return json.dumps(inc.model_dump(by_alias=True, mode="json"))


@pytest.mark.parametrize("ref", ["../../outside.yaml", "/../../outside.yaml", "partials/../../../outside.yaml"])
def test_a_partial_outside_the_specs_directory_is_not_read(specs, ref):
    assert "OUTSIDE-SECRET" not in preview(f"type: Partial\nref: {ref}\n")


def test_a_partial_under_the_specs_directory_still_renders(specs):
    assert "OPEN-TEXT" in preview("type: Partial\nref: open\n")


def test_the_access_keys_of_a_partial_apply_to_the_caller(specs):
    assert "ADMIN-ONLY" not in preview("type: Partial\nref: admin\n")
    assert "ADMIN-ONLY" in preview("type: Partial\nref: admin\n", roles=("admin",))


def test_the_access_keys_of_the_posted_yaml_apply_too(specs):
    text = "type: Text\ntext: INLINE-ADMIN\neyesOnly: {roles: [admin]}\n"
    assert "INLINE-ADMIN" not in preview(text)


def test_refs_that_name_nothing_are_not_cached(specs):
    for i in range(50):
        preview(f"type: Partial\nref: missing-{i}\n")
    assert len(specs._by_ref) < 50
