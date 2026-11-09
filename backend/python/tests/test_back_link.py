"""``@app(back_link=BackLink.PARENT)`` (Java's ``@App(backLink = PARENT)``), a YAML shell's
``backLink:`` / ``pageTitle:`` and a ``@remote_menu``'s ``shellLabel`` / ``routePrefix`` — the
conformance case ``app-back-link`` and the YAML golden ``app-shell-back-link`` pin the wire; these
pin the resolution rules around it (mirror of the .NET ``BackLinkTests``)."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent))

from test_yaml_app_shell import handler as yaml_handler  # noqa: E402

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, mobile_manifest, type_name  # noqa: E402
from mateu_ui.core import yaml_app_shell  # noqa: E402
from mateu_ui.dtos import MenuItem  # noqa: E402
from mateu_ui.uidl import AppShell, AppSupplier, BackLink, app, menu_item, remote_menu, ui  # noqa: E402

MODULE = sys.modules[__name__]


@ui("/backlink-tests/sales-orders")
class BackLinkOrders:
    name: str | None = None


@ui("/backlink-tests/sales-orders/7/detail")
@app("Order", back_link=BackLink.PARENT)
class BackLinkDeepApp:
    @menu_item("Overview")
    def overview(self):
        return None


@ui("/backlink-top")
@app("Top", back_link="PARENT")
class BackLinkTopApp:
    @menu_item("Overview")
    def overview(self):
        return None


@ui("/backlink-tests/sales-orders/code")
@app("Code shell")
class BackLinkCodeShellApp(AppSupplier):
    def get_app(self):
        return AppShell(
            title="Code shell",
            menu=[MenuItem(label="Overview", route="/overview", server_side_type="")],
            back_link=BackLink.PARENT,
        )


@ui("/backlink-tests/plain")
@app("Plain")
@remote_menu("Workflow", "https://wf.example.com", path="/workflow")
@remote_menu("", "https://forms.example.com", path="forms")
@remote_menu("Bare", "https://bare.example.com")
class BackLinkPlainApp:
    @menu_item("Overview")
    def overview(self):
        return None


def app_of(cls) -> dict:
    increment = SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(server_side_type=type_name(cls)))
    return increment.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]["metadata"]


def test_the_link_walks_up_past_routes_that_resolve_to_nothing_and_humanizes_an_untitled_parent():
    meta = app_of(BackLinkDeepApp)
    assert meta["noBreadcrumbs"] is True
    assert meta["backRoute"] == "/backlink-tests/sales-orders"
    assert meta["backLabel"] == "Sales orders"


def test_an_app_with_nothing_above_it_drops_the_trail_and_draws_no_link():
    meta = app_of(BackLinkTopApp)
    assert meta["noBreadcrumbs"] is True
    assert meta.get("backRoute") is None
    assert meta.get("backLabel") is None


def test_a_code_shell_decides_its_own_back_link_and_the_default_stays_the_trail():
    meta = app_of(BackLinkCodeShellApp)
    assert meta["noBreadcrumbs"] is True
    assert meta["backRoute"] == "/backlink-tests/sales-orders"
    plain = app_of(BackLinkPlainApp)
    assert not plain.get("noBreadcrumbs")
    assert plain.get("backRoute") is None


def test_an_unknown_back_link_is_refused():
    with pytest.raises(ValueError):
        app("Bad", back_link="UP")


def test_a_remote_menu_with_a_path_claims_its_route_prefix_and_its_declared_label():
    menu = app_of(BackLinkPlainApp)["menu"]
    named = next(m for m in menu if m.get("baseUrl") == "https://wf.example.com")
    assert (named["label"], named["shellLabel"], named["path"], named["routePrefix"]) == (
        "Workflow", True, "/workflow", "/workflow"
    )
    unnamed = next(m for m in menu if m.get("baseUrl") == "https://forms.example.com")
    assert (unnamed["label"], unnamed["shellLabel"], unnamed["routePrefix"]) == ("Forms", False, "/forms")
    bare = next(m for m in menu if m.get("baseUrl") == "https://bare.example.com")
    assert bare.get("routePrefix") is None


def test_a_yaml_mount_is_presented_by_its_shell_and_its_page_title_names_it_when_it_has_no_title(tmp_path):
    (tmp_path / "routes.yaml").write_text('type: Routes\nroutes:\n  - route: ""\n    layout: shell.yaml\n')
    (tmp_path / "shell.yaml").write_text(
        "type: AppShell\n"
        "pageTitle: Acme records\n"
        "logo: /logo.png\n"
        'accentColor: "#00796b"\n'
        "backLink: PARENT\n"
        "menu:\n"
        "  - {type: RouteLink, label: Home, route: home}\n"
    )
    h = yaml_handler(tmp_path)
    meta = h.handle(RunActionRq(route="")).model_dump(by_alias=True, mode="json")["fragments"][0]["component"][
        "metadata"
    ]
    assert meta["noBreadcrumbs"] is True
    assert meta.get("backRoute") is None
    shell = yaml_app_shell.mount_shell(h, "")
    assert shell is not None
    manifest = mobile_manifest.manifest(yaml_app_shell.manifest_source(shell))
    assert (manifest["name"], manifest["icon"], manifest["themeColor"]) == ("Acme records", "/logo.png", "#00796b")
    # a shell's title wins over its pageTitle
    titled = yaml_app_shell.manifest_source({"title": "Records", "pageTitle": "Acme records"})
    assert mobile_manifest.manifest(titled)["name"] == "Records"
