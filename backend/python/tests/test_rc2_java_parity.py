"""rc.2: the behaviour Java changed in its GA round-2 fixes (PR #1229), held in Python too.

- J1 residual: a layout-less authored route (``pages/:name`` + ``viewModel:``) is served BY
  CONVENTION from ``<path>.yaml``, so it does not make the definition access check stand down: a
  restricted route's layout file is not served through it.
- A crud's ``action-on-row-<x>`` / ``action-on-view-<x>`` naming no method (a button renamed since
  the tab opened) is refused 403 like any other unknown action.
- J7: an anonymous caller's idempotency share is also keyed by its client address; the answers stay
  scoped by the caller alone.
- J6 does not apply: the ports have no default free-text match — ``Crud.fetch(search)`` is the
  app's, so the framework never matches a restricted field on its own."""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, idempotency_keys, type_name  # noqa: E402
from mateu_ui.core.route_registry import RouteRegistry  # noqa: E402
from mateu_ui.core.yaml_spec_loader import YamlSpecLoader  # noqa: E402
from mateu_ui.uidl import Crud, Identity, Message, list_toolbar_button, ui, view_toolbar_button  # noqa: E402

MODULE = sys.modules[__name__]


def _page(text: str) -> str:
    return f"layout:\n  type: VerticalLayout\n  content:\n    - {{type: Text, text: {text}}}\n"


class PageVm:
    name: str = ""


def _j1_handler(tmp_path) -> SyncHandler:
    (tmp_path / "pages").mkdir()
    (tmp_path / "routes.yaml").write_text(
        "routes:\n"
        "  - route: backoffice/users/:id\n    layout: pages/user.yaml\n    access: {roles: [admin]}\n"
        f"  - route: pages/:name\n    viewModel: {type_name(PageVm)}\n"
        "  - route: open/:id\n    layout: pages/open.yaml\n"
    )
    (tmp_path / "pages" / "user.yaml").write_text(_page("USER-PAGE"))
    (tmp_path / "pages" / "other.yaml").write_text(_page("OTHER-PAGE"))
    (tmp_path / "pages" / "open.yaml").write_text(_page("OPEN-PAGE"))
    h = SyncHandler(MateuRegistry(MODULE), identity_provider=lambda: None)
    h.routes = RouteRegistry(str(tmp_path))
    h.yaml_specs = YamlSpecLoader(str(tmp_path), h.routes)
    return h


def _load(h: SyncHandler, route: str) -> str:
    try:
        return json.dumps(h.handle(RunActionRq(route=route, action_id="")).model_dump(by_alias=True, mode="json"))
    except Exception as e:  # noqa: BLE001 - a refusal is an answer here
        return type(e).__name__


def test_j1_a_layout_less_route_does_not_serve_a_restricted_layout_file(tmp_path):
    assert "USER-PAGE" not in _load(_j1_handler(tmp_path), "/pages/user")


def test_j1_control_a_layout_less_route_still_serves_unrestricted_pages_by_convention(tmp_path):
    h = _j1_handler(tmp_path)
    assert "OTHER-PAGE" in _load(h, "/pages/other")
    assert "OPEN-PAGE" in _load(h, "/open/7")


# ── Renamed crud actions ─────────────────────────────────────────────────────────────────────────


@dataclass
class RcProduct:
    id: str = ""
    name: str = ""


@ui("rc-renamed-products")
class RcProducts(Crud[RcProduct]):
    def fetch(self, search):
        return [RcProduct("1", "Bolt")]

    @list_toolbar_button("Replenish")
    def replenish(self):
        return Message("replenished")

    @view_toolbar_button("Archive")
    def archive(self, record: RcProduct):
        return Message("archived")


def _crud(action_id: str, route: str = "rc-renamed-products"):
    return SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        route=route, consumed_route=route, server_side_type=type_name(RcProducts), action_id=action_id,
        component_state={"crud_selected_items": []},
    ))


def test_the_current_row_button_runs():
    assert "replenished" in json.dumps(_crud("action-on-row-replenish").model_dump(by_alias=True, mode="json"))


@pytest.mark.parametrize("action_id,route", [
    ("action-on-row-restock", "rc-renamed-products"),
    ("action-on-view-restock", "rc-renamed-products/1"),
])
def test_a_renamed_crud_action_is_refused_like_any_unknown_action(action_id, route):
    with pytest.raises(Exception) as refused:
        _crud(action_id, route)
    assert type(refused.value).__name__ == "MateuForbiddenException"
    assert "no such action" in str(refused.value)


# ── J7: the anonymous share is per client address ────────────────────────────────────────────────


def test_j7_an_anonymous_share_is_keyed_by_the_client_address_a_named_one_is_not():
    anon = idempotency_keys.caller_of(None)
    assert idempotency_keys.share_of(anon, None, "10.0.0.1") != idempotency_keys.share_of(anon, None, "10.0.0.2")
    assert idempotency_keys.share_of(anon, None, None) == anon
    ana = Identity(name="ana")
    named = idempotency_keys.caller_of(ana)
    assert idempotency_keys.share_of(named, ana, "10.0.0.1") == named


def test_j7_one_anonymous_address_filling_its_share_leaves_the_others_theirs(monkeypatch):
    monkeypatch.setattr(idempotency_keys, "max_entries_per_caller", 1)
    anon = idempotency_keys.caller_of(None)
    a, b = (idempotency_keys.share_of(anon, None, ip) for ip in ("10.0.0.1", "10.0.0.2"))
    seen: list[str] = []

    def run_b():
        seen.append("b")
        return "B"

    def run_a():
        # while address A's keyed run is in flight (its share full), address B is still admitted
        seen.append(idempotency_keys.once(anon, "save", "rc2-key-b", run_b, share=b))
        return "A"

    assert idempotency_keys.once(anon, "save", "rc2-key-a", run_a, share=a) == "A"
    assert seen == ["b", "B"]
    # the answer is the CALLER's: a retry of the same key from another address replays it
    assert idempotency_keys.once(anon, "save", "rc2-key-a", lambda: "again", share=b) == "A"
