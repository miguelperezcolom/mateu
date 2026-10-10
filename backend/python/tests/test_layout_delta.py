"""``layoutDelta:`` — the human's decisions re-applied over the INFERRED layout on every request (the
Python mirror of Java's LayoutDeltaTest / LayoutDeltaApplierTest / LayoutDeltaSpecTest)."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Annotated

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_core.layout_delta import LayoutDelta  # noqa: E402
from mateu_core.yaml_spec_loader import YamlSpecLoader  # noqa: E402
from mateu_uidl import Section, ui  # noqa: E402

MODULE = sys.modules[__name__]


@ui("delta-contact")
class Contact:
    name: str = "Ada"
    email: str = "ada@example.com"
    phone: str = ""
    internal_note: str = "secret-ish"


@ui("delta-sections")
class Sectioned:
    a: Annotated[str, Section("One")] = ""
    b: Annotated[str, Section("One")] = ""
    c: Annotated[str, Section("Two")] = ""
    d: Annotated[str, Section("Two")] = ""


def fields_in_order(inc) -> list[dict]:
    out = []

    def walk(n):
        if isinstance(n, dict):
            meta = n.get("metadata")
            if isinstance(meta, dict) and meta.get("type") == "FormField":
                out.append(meta)
            for v in n.values():
                walk(v)
        elif isinstance(n, list):
            for v in n:
                walk(v)

    walk(inc.model_dump(by_alias=True, mode="json"))
    return out


def handler_with(tmp_path, route: str, yaml_text: str) -> SyncHandler:
    (tmp_path / f"{route}.yaml").write_text(yaml_text)
    h = SyncHandler(MateuRegistry(MODULE))
    h.yaml_specs = YamlSpecLoader(str(tmp_path), h.routes)
    return h


def test_the_delta_reorders_hides_and_overrides_over_inference(tmp_path):
    h = handler_with(
        tmp_path,
        "delta-contact",
        f"viewModel: {type_name(Contact)}\n"
        "layoutDelta:\n"
        "  order: [email, name]\n"
        "  hidden: [internalNote]\n"
        "  overrides:\n"
        "    name: {label: Full name, colspan: 2}\n",
    )
    fields = fields_in_order(h.handle(RunActionRq(route="delta-contact")))
    assert [f["fieldId"] for f in fields] == ["email", "name", "phone"]
    name = fields[1]
    assert (name["label"], name["colspan"]) == ("Full name", 2)


def test_a_field_the_model_grows_keeps_its_inferred_place_and_stale_entries_are_ignored(tmp_path):
    h = handler_with(
        tmp_path,
        "delta-contact",
        f"viewModel: {type_name(Contact)}\n"
        "layoutDelta: {order: [ghost, internalNote], hidden: [alsoGone]}\n",
    )
    ids = [f["fieldId"] for f in fields_in_order(h.handle(RunActionRq(route="delta-contact")))]
    # internalNote moves first WITHIN its row (the inferred form lays two fields per row); the
    # ghost entries match nothing and nothing disappears
    assert ids == ["name", "email", "internalNote", "phone"]


def test_order_never_moves_a_field_between_containers(tmp_path):
    h = handler_with(
        tmp_path,
        "delta-sections",
        f"viewModel: {type_name(Sectioned)}\nlayoutDelta: {{order: [d, b, c, a]}}\n",
    )
    ids = [f["fieldId"] for f in fields_in_order(h.handle(RunActionRq(route="delta-sections")))]
    # within "One": b before a; within "Two": d before c — but One stays before Two
    assert ids == ["b", "a", "d", "c"]


def test_an_empty_delta_changes_nothing(tmp_path):
    h = handler_with(tmp_path, "delta-contact", f"viewModel: {type_name(Contact)}\nlayoutDelta: {{}}\n")
    ids = [f["fieldId"] for f in fields_in_order(h.handle(RunActionRq(route="delta-contact")))]
    assert ids == ["name", "email", "phone", "internalNote"]


def test_the_delta_is_reapplied_on_every_render(tmp_path):
    h = handler_with(
        tmp_path, "delta-contact", f"viewModel: {type_name(Contact)}\nlayoutDelta: {{hidden: [phone]}}\n"
    )
    for _ in range(2):
        ids = [f["fieldId"] for f in fields_in_order(h.handle(RunActionRq(route="delta-contact")))]
        assert "phone" not in ids


@pytest.mark.parametrize(
    "inferred,expected",
    [
        (["a", "b", "c"], ["c", "a", "b"]),
        (["a", "b", "c", "new"], ["c", "a", "b", "new"]),
        (["a", "c"], ["c", "a"]),
    ],
)
def test_apply_to_keeps_unmentioned_fields_in_their_inferred_order(inferred, expected):
    delta = LayoutDelta(order=("c", "ghost", "a"), hidden=("x",))
    assert delta.apply_to(inferred) == expected
