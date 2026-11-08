"""The page-level breadcrumb members (``PageMetadata.breadcrumbs`` / ``no_breadcrumbs``): a trail the
page declares (``@breadcrumbs`` / ``BreadcrumbsSupplier``, which wins), ``@no_breadcrumbs`` on a page,
an embedded view's page and a page under a back-link app through a routes.yaml chain. The Python
mirror of Java's ``NoBreadcrumbsSyncTest``, ``EmbeddedViewBreadcrumbsSyncTest`` and
``RoutedTabsChromeSyncTest``; the conformance cases page-no-breadcrumbs, page-breadcrumbs and
page-back-link-chain pin the wire.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.core.page_breadcrumbs import inside_back_link_app  # noqa: E402
from mateu_ui.core.route_registry import RouteRegistry  # noqa: E402
from mateu_ui.dtos import ClientSideComponent, PageMetadata, ServerSideComponent  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    BackLink,
    BreadcrumbsSupplier,
    action,
    app,
    breadcrumbs,
    no_breadcrumbs,
    title,
    ui,
)
from mateu_ui.uidl import components as fluent  # noqa: E402


@ui("/crumbs-supplied")
@title("Supplied")
@breadcrumbs(("Declared", "/declared"))
class CrumbsSupplied(BreadcrumbsSupplier):
    name: str | None = None

    def breadcrumbs(self):
        return [fluent.Breadcrumb(text="Home", link="/"), fluent.Breadcrumb(text="Customers", link="/customers")]


@ui("/crumbs-off-but-declared")
@title("Both")
@no_breadcrumbs
@breadcrumbs(fluent.Breadcrumb(text="Home", link="/"))
class CrumbsOffButDeclared:
    name: str | None = None


@ui("/crumbs-plain")
@title("Plain")
class CrumbsPlain:
    name: str | None = None


@ui("/crumbs-host")
@title("Host")
class CrumbsHost:
    x: str = "hi"

    @action
    def open_page(self) -> fluent.Drawer:
        return fluent.Drawer(id="d", header_title="Details", content=fluent.EmbeddedView(CrumbsPlain()))


@app("Crumbs master", back_link=BackLink.PARENT)
class CrumbsBackLinkMaster:
    id: str | None = None


@app("Crumbs plain master")
class CrumbsPlainMaster:
    id: str | None = None


class CrumbsTab:
    note: str | None = "tab"


MODULE = sys.modules[__name__]


def _pages(node, out: list) -> list:
    if isinstance(node, ClientSideComponent):
        if isinstance(node.metadata, PageMetadata):
            out.append(node.metadata)
        content = getattr(node.metadata, "content", None)
        if content is not None and not isinstance(content, str):
            _pages(content, out)
        for child in node.children:
            _pages(child, out)
    elif isinstance(node, ServerSideComponent):
        for child in node.children:
            _pages(child, out)
    return out


def _pages_of(increment) -> list:
    out: list = []
    for fragment in increment.fragments:
        _pages(fragment.component, out)
    return out


def _page(cls) -> PageMetadata:
    inc = SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(server_side_type=type_name(cls)))
    return _pages_of(inc)[0]


def test_a_supplier_wins_over_the_declared_decorator():
    page = _page(CrumbsSupplied)
    assert [(b.text, b.link) for b in page.breadcrumbs] == [("Home", "/"), ("Customers", "/customers")]
    assert page.no_breadcrumbs is None


def test_no_breadcrumbs_turns_the_automatic_trail_off_and_a_declared_one_still_travels():
    page = _page(CrumbsOffButDeclared)
    assert page.no_breadcrumbs is True
    assert [(b.text, b.link) for b in page.breadcrumbs] == [("Home", "/")]


def test_a_page_declaring_nothing_leaves_both_members_null():
    page = _page(CrumbsPlain)
    assert page.breadcrumbs is None
    assert page.no_breadcrumbs is None


def test_an_embedded_views_page_carries_no_trail_of_its_own():
    inc = SyncHandler(MateuRegistry(MODULE)).handle(
        RunActionRq(route="/crumbs-host", action_id="openPage", server_side_type=type_name(CrumbsHost),
                    initiator_component_id="cmp-1")
    )
    pages = _pages_of(inc)
    assert pages
    assert all(p.no_breadcrumbs is True for p in pages)


def test_pages_under_a_back_link_app_of_their_routes_yaml_chain_carry_no_trail(tmp_path):
    (tmp_path / "routes.yaml").write_text(
        f"""routes:
  - route: crumbs-bl/:id
    viewModel: {type_name(CrumbsBackLinkMaster)}
    children:
      - route: tab
        viewModel: {type_name(CrumbsTab)}
  - route: crumbs-plain-master/:id
    viewModel: {type_name(CrumbsPlainMaster)}
    children:
      - route: tab
        viewModel: {type_name(CrumbsTab)}
"""
    )
    handler = SyncHandler(MateuRegistry(MODULE))
    handler.routes = RouteRegistry(str(tmp_path))
    under = _pages_of(handler.handle(RunActionRq(
        route="/crumbs-bl/7/tab", consumed_route="/crumbs-bl/7", server_side_type=type_name(CrumbsTab),
    )))
    assert under
    assert all(p.no_breadcrumbs is True for p in under)
    assert inside_back_link_app(handler.routes, handler.registry, "/crumbs-bl/7/tab")
    # past the child: the tab's own business (a record, /new) is still under the master
    assert inside_back_link_app(handler.routes, handler.registry, "/crumbs-bl/7/tab/new")
    # the master itself is the chain's leaf, not under itself
    assert not inside_back_link_app(handler.routes, handler.registry, "/crumbs-bl/7")

    plain = _pages_of(handler.handle(RunActionRq(
        route="/crumbs-plain-master/7/tab", consumed_route="/crumbs-plain-master/7",
        server_side_type=type_name(CrumbsTab),
    )))
    assert plain
    assert all(p.no_breadcrumbs is None for p in plain)


@ui("/crumbs-app")
@app("Crumbless app")
@no_breadcrumbs
class CrumblessApp:
    """@no_breadcrumbs on the app class: no trail on any of its pages (AppDto.noBreadcrumbs)."""


def test_no_breadcrumbs_on_the_app_class_turns_the_trail_off_for_the_whole_app():
    inc = SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(server_side_type=type_name(CrumblessApp)))
    meta = inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]["metadata"]
    assert meta["noBreadcrumbs"] is True
    assert meta.get("backRoute") is None
