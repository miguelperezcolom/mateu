"""``type: AppShell`` definitions bound to a mount route (the Python mirror of Java's
AppShellFlowSyncTest / YamlCardMenusSyncTest / AppShellExtrasSyncTest): the three Java fixtures
(backend/shared/core/src/test/resources/mount-home/<case>/specs/ui) are served by the Python YAML
loader and the whole increment must equal the Java golden the browser expander is pinned by
(libs/mateu …/expander/__fixtures__/app-shell*.golden.json), normalised like the conformance
corpus. No allow-list. Plus: per-caller ``access:`` on menu items, the mount's ``home:``, the
variant defaults and the ``_appsource`` proxy of the shell's REST sources."""

from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent))

from test_wire_conformance import normalise  # noqa: E402

from mateu_ui.core import MateuForbiddenException, MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_ui.core.rest_source_registry import RestSourceRegistry  # noqa: E402
from mateu_ui.core.route_registry import RouteRegistry  # noqa: E402
from mateu_ui.core.yaml_spec_loader import YamlSpecLoader  # noqa: E402
from mateu_ui.uidl import Identity  # noqa: E402

REPO = Path(__file__).resolve().parents[3]
MOUNT_HOME = REPO / "backend/shared/core/src/test/resources/mount-home"
GOLDENS = REPO / "frontend/web/monorepo/libs/mateu/src/mateu/ui/infra/expander/__fixtures__"
MODULE = sys.modules[__name__]


def handler(directory: Path, roles=None) -> SyncHandler:
    h = SyncHandler(
        MateuRegistry(MODULE),
        rest_sources=RestSourceRegistry(directory=str(directory)),
        identity_provider=(lambda: Identity(roles=tuple(roles))) if roles is not None else None,
    )
    h.routes = RouteRegistry(str(directory))
    h.yaml_specs = YamlSpecLoader(str(directory), h.routes)
    return h


def fixture(tmp_path: Path, case: str) -> Path:
    target = tmp_path / "ui"
    shutil.copytree(MOUNT_HOME / case / "specs/ui", target)
    return target


def load(h: SyncHandler, route: str = "") -> dict:
    return h.handle(RunActionRq(route=route)).model_dump(by_alias=True, mode="json")


@pytest.mark.parametrize(
    "case,golden",
    [
        ("shell-flows", "app-shell"),
        ("card-menus", "app-shell-card-menus"),
        ("shell-extras", "app-shell-extras"),
    ],
)
def test_a_yaml_app_shell_matches_the_java_golden(tmp_path, case, golden):
    expected = json.loads((GOLDENS / f"{golden}.golden.json").read_text())
    assert normalise(load(handler(fixture(tmp_path, case)))) == normalise(expected)


def app_of(increment: dict) -> dict:
    return increment["fragments"][0]["component"]["metadata"]


def write_mount(tmp_path: Path, shell: str, descriptor_extra: str = "") -> Path:
    (tmp_path / "app.ui.yaml").write_text(
        f"type: UI\nbasePath: /\nroutes:\n  - routes.yaml\n{descriptor_extra}"
    )
    (tmp_path / "routes.yaml").write_text(
        "type: Routes\nroutes:\n"
        "  - {route: '', layout: shell.yaml}\n"
        "  - {route: home, layout: page.yaml}\n"
        "  - {route: orders, layout: page.yaml}\n"
    )
    (tmp_path / "page.yaml").write_text("type: Text\ntext: A page\n")
    (tmp_path / "shell.yaml").write_text(shell)
    return tmp_path


SHELL_WITH_ACCESS = """
type: AppShell
title: Back office
menu:
  - {type: RouteLink, label: Home, route: home}
  - {type: RouteLink, label: Orders, route: orders, access: {roles: [sales]}}
"""


def test_a_menu_item_the_caller_may_not_reach_is_gone(tmp_path):
    specs = write_mount(tmp_path, SHELL_WITH_ACCESS)
    anonymous = [m["label"] for m in app_of(load(handler(specs, roles=())))["menu"]]
    sales = [m["label"] for m in app_of(load(handler(specs, roles=("sales",))))["menu"]]
    assert anonymous == ["Home"]
    assert sales == ["Home", "Orders"]


def test_the_home_is_the_shells_own_then_the_mounts_then_the_first_leaf(tmp_path):
    plain = "type: AppShell\ntitle: T\nmenu:\n  - {type: RouteLink, label: Home, route: home}\n  - {type: RouteLink, label: Orders, route: orders}\n"

    def home_of(name: str, shell: str, descriptor_extra: str = "") -> str:
        (tmp_path / name).mkdir()
        return app_of(load(handler(write_mount(tmp_path / name, shell, descriptor_extra))))["homeRoute"]

    assert home_of("first-leaf", plain) == "home"
    assert home_of("mount-home", plain, "home: orders\n") == "orders"
    assert home_of("own", plain + "homeRoute: home\n", "home: orders\n") == "home"


@pytest.mark.parametrize(
    "declared,expected",
    [(None, "TABS"), ("MENU_ON_TOP", "MENU_ON_TOP"), ("HAMBURGUER_MENU", "HAMBURGER_MENU")],
)
def test_the_variant_defaults_like_javas_app_shell(tmp_path, declared, expected):
    shell = "type: AppShell\ntitle: T\nmenu:\n  - {type: RouteLink, label: Home, route: home}\n"
    if declared:
        shell += f"variant: {declared}\n"
    assert app_of(load(handler(write_mount(tmp_path, shell))))["variant"] == expected


def test_a_shell_emits_no_window_title_of_its_own(tmp_path):
    shell = "type: AppShell\ntitle: T\nmenu:\n  - {type: RouteLink, label: Home, route: home}\n"
    assert load(handler(write_mount(tmp_path, shell)))["commands"] == []


SHELL_WITH_SOURCES = """
type: AppShell
title: T
contextSelectors:
  - fieldName: hotel
    optionsSource: {url: "https://api.example.com/hotels", proxy: true, sample: [{value: H1, label: Palma}]}
notifications:
  source: {url: "https://api.example.com/inbox", itemsPath: items}
menu:
  - {type: RouteLink, label: Home, route: home}
"""


def app_source(h: SyncHandler, role: str, field: str = "") -> dict:
    rq = RunActionRq(route="", action_id="_appsource", parameters={"_appSource": role, "_field": field})
    return h.handle(rq).model_dump(by_alias=True, mode="json")["appData"]


def test_the_appsource_proxy_answers_only_what_the_shell_declares(tmp_path, monkeypatch):
    h = handler(write_mount(tmp_path, SHELL_WITH_SOURCES))
    assert app_source(h, "globalSearch")["_restfetchError"]["status"] == 404
    with pytest.raises(MateuForbiddenException):
        app_source(h, "notifications")  # a DIRECT source is the browser's to fetch
    monkeypatch.setenv("MATEU_SOURCES_MOCK", "true")
    assert app_source(h, "contextOptions", "hotel")["_restfetch"] == [{"value": "H1", "label": "Palma"}]


def test_a_proxied_sources_request_never_reaches_the_client(tmp_path):
    shell = SHELL_WITH_SOURCES.replace(
        'itemsPath: items}', 'itemsPath: items, proxy: true, headers: {X-Api-Key: "${secret.INBOX}"}}'
    )
    app = app_of(load(handler(write_mount(tmp_path, shell))))
    assert app["notificationsSource"]["proxy"] is True
    assert app["notificationsSource"].get("headers") is None


def test_a_fresh_deep_link_under_the_shell_answers_the_shell_aimed_at_the_route(tmp_path):
    shell = (
        "type: AppShell\ntitle: T\nmenu:\n  - {type: RouteLink, label: Home, route: home}\n"
        "  - {type: RouteLink, label: Orders, route: orders}\n"
    )
    h = handler(write_mount(tmp_path, shell))
    fresh = h.handle(RunActionRq(route="orders", consumed_route="_empty"))
    meta = fresh.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]["metadata"]
    assert meta["type"] == "App"
    # aimed at the route as Java aims it (conformance/bundle pins this answer)
    assert meta["homeRoute"] == "/orders"
    # the shell's content load of that route is the page itself
    content = h.handle(RunActionRq(route="orders", consumed_route=""))
    page = content.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]
    assert page["metadata"]["text"] == "A page"
