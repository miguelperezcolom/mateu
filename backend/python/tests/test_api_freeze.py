"""The pre-beta API freeze (design/api-freeze-review.md), Python side: the right spelling of the
hamburger variant, the deprecation of the old one (a ``DeprecationWarning`` naming the
replacement), the parity aliases, and ``__all__`` covering what the package exports."""

import sys
import warnings
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import mateu_ui.uidl  # noqa: E402
from mateu_ui.core.mapper import ReflectionMapper  # noqa: E402
from mateu_ui.uidl import AppVariant, app, menu_item, title, ui  # noqa: E402
from mateu_ui.uidl.components import ContentLayout, DashboardLayout  # noqa: E402


@ui("freeze-home")
@title("Freeze home")
class FreezeHome:
    name: str | None = None


@app("Hamburger", variant=AppVariant.HAMBURGER_MENU)
class HamburgerApp:
    @menu_item("Home")
    def home(self) -> "FreezeHome":
        return FreezeHome()


def wire_variant(cls) -> str:
    return ReflectionMapper().map_app(cls).metadata.variant


def test_the_right_spelling_is_the_wire_value():
    # since 3.0-alpha.412 servers send HAMBURGER_MENU; the renderers accept both spellings
    assert wire_variant(HamburgerApp) == "HAMBURGER_MENU"


def test_a_plain_string_still_works():
    @app("Strings", variant="HAMBURGER_MENU")
    class StringApp:
        @menu_item("Home")
        def home(self) -> "FreezeHome":
            return FreezeHome()

    assert wire_variant(StringApp) == "HAMBURGER_MENU"


def test_the_old_misspelling_warns_naming_the_replacement_and_keeps_working():
    with pytest.warns(DeprecationWarning, match="AppVariant.HAMBURGER_MENU"):

        @app("Old", variant="HAMBURGUER_MENU")
        class OldApp:
            @menu_item("Home")
            def home(self) -> "FreezeHome":
                return FreezeHome()

    assert wire_variant(OldApp) == "HAMBURGER_MENU"


def test_other_variants_travel_unchanged():
    assert AppVariant.to_wire(AppVariant.TILES) == "TILES"
    assert AppVariant.to_wire("") == ""
    with warnings.catch_warnings():
        warnings.simplefilter("error")  # a current variant never warns

        @app("Tiles", variant=AppVariant.TILES)
        class TilesApp:
            pass


def test_the_deprecated_layouts_warn_naming_their_replacement():
    with pytest.warns(DeprecationWarning, match="ResponsiveGrid"):
        DashboardLayout()
    with pytest.warns(DeprecationWarning, match="ResponsiveGrid"):
        ContentLayout()


def test_parity_aliases_are_the_same_objects():
    assert mateu_ui.uidl.BadgeInHeader is mateu_ui.uidl.HeaderBadge
    assert mateu_ui.uidl.PageWidthStyle is mateu_ui.uidl.PageWidth


def test_every_public_export_is_in_all():
    """``from mateu_ui.uidl import *`` must not silently drop public API: every public name the
    package binds (not modules, not private, not typing helpers) is listed in ``__all__``."""
    import types

    exported = set(mateu_ui.uidl.__all__)
    missing = sorted(
        name
        for name, value in vars(mateu_ui.uidl).items()
        if not name.startswith("_")
        and not isinstance(value, types.ModuleType)
        and name not in exported
        and name not in {"annotations", "T", "C", "D", "E", "F", "I", "R"}
    )
    assert missing == [], f"public names missing from mateu_ui.uidl.__all__: {missing}"
    assert all(hasattr(mateu_ui.uidl, n) for n in exported)


def test_every_public_component_is_in_all():
    """The freeze pins ``mateu_ui.uidl.components`` by its ``__all__`` (``public-exports.json``,
    ``public-signatures.json``), so a public class or function the module defines but leaves out of
    ``__all__`` could be renamed, removed or re-signatured with no failure (the review found 27 —
    VerticalLayout, FormField, Card… — unpinned). Every public name the module DEFINES (or re-binds
    from another Mateu module) must be listed."""
    import inspect
    import types

    import mateu_ui.uidl.components as components

    exported = set(components.__all__)
    missing = sorted(
        name
        for name, value in vars(components).items()
        if not name.startswith("_")
        and not isinstance(value, types.ModuleType)
        and (inspect.isclass(value) or inspect.isfunction(value))
        and getattr(value, "__module__", "").startswith("mateu_ui")
        and name not in exported
    )
    assert missing == [], f"public names missing from mateu_ui.uidl.components.__all__: {missing}"
    assert all(hasattr(components, n) for n in exported)


def test_size_the_length_constraint_warns_naming_length_and_keeps_validating():
    import warnings

    from mateu_ui.core.validation import field_constraints  # noqa: F401  (Size is still a Length)
    from mateu_ui.uidl import Length, Size

    with pytest.warns(DeprecationWarning, match="use Length"):
        old = Size(min=2, max=4)
    assert isinstance(old, Length)
    assert (old.min, old.max) == (2, 4)
    with warnings.catch_warnings():
        warnings.simplefilter("error")
        Length(min=2, max=4)  # the replacement does not warn


def test_secured_warns_naming_eyes_only():
    from mateu_ui.uidl import secured

    with pytest.warns(DeprecationWarning, match="eyes_only"):

        @secured("admin")
        class Guarded:
            pass

    assert Guarded.__mateu_secured__ == "admin"  # still accepted (and enforced: test_secured_enforced)


# ── M-A7: the package shape ─────────────────────────────────────────────────────────────────


def test_no_published_export_is_removed():
    """``tests/api/public-exports.json`` is the published surface (frozen for 3.x from 3.0-beta.1):
    every name in it must still be exported — removing or renaming one is a breaking change, so
    deprecate it instead (keep the old name working with a ``DeprecationWarning`` naming the new
    one). A NEW export fails too until it is added to the file (rerun with ``MATEU_API_WRITE=true``
    and commit it), so the review sees it. Signatures: ``test_public_surface.py``."""
    import importlib
    import json
    import os

    path = Path(__file__).parent / "api" / "public-exports.json"
    published = json.loads(path.read_text())
    actual = {module: sorted(importlib.import_module(module).__all__) for module in published}
    if os.environ.get("MATEU_API_WRITE", "").lower() == "true":
        path.write_text(json.dumps(actual, indent=1) + "\n")
        published = actual
    removed = {m: sorted(set(names) - set(actual[m])) for m, names in published.items()}
    removed = {m: n for m, n in removed.items() if n}
    assert removed == {}, (
        f"exports removed from the frozen 3.x API: {removed} — keep them, deprecated "
        "(a DeprecationWarning naming the replacement), see reference/stability-and-versioning.md")
    for module, names in published.items():
        mod = importlib.import_module(module)
        assert all(hasattr(mod, n) for n in names), module
    added = {m: sorted(set(actual[m]) - set(names)) for m, names in published.items()}
    added = {m: n for m, n in added.items() if n}
    assert added == {}, (
        f"new exports not pinned yet: {added} — rerun with MATEU_API_WRITE=true and commit "
        "tests/api/public-exports.json")


def test_private_helpers_do_not_leak_into_the_namespace():
    for name in ("_Banner", "_Fab", "_ListToolbarButton", "_maybe_bare"):
        assert not hasattr(mateu_ui.uidl, name), name


def test_the_request_types_are_public():
    import mateu_ui.core
    from mateu_ui.core import MateuRequest, RunActionRq, current_request
    from mateu_ui.uidl import ActionRequest

    assert {"MateuRequest", "current_request", "RunActionRq"} <= set(mateu_ui.core.__all__)
    assert current_request() is None
    assert isinstance(RunActionRq(action_id="x"), ActionRequest)
    assert MateuRequest(headers={"a": "b"}).header("A") == "b"


from mateu_ui.uidl import ActionRequest, Message, action  # noqa: E402

SEEN: dict = {}


@ui("freeze-request")
class RequestView:
    name: str = ""

    @action
    def echo(self, rq: ActionRequest):
        SEEN["rq"] = rq
        return Message(f"{rq.action_id}:{rq.parameters.get('n')}")


def test_an_action_parameter_typed_action_request_receives_the_request():
    from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler
    from mateu_ui.core.registry import type_name

    handler = SyncHandler(MateuRegistry(sys.modules[__name__]))
    inc = handler.handle(RunActionRq(
        route="/freeze-request", consumed_route="/freeze-request",
        server_side_type=type_name(RequestView), action_id="echo",
        initiator_component_id="c1", parameters={"n": 7},
    ))
    assert SEEN["rq"].action_id == "echo"
    assert inc.messages[0].text == "echo:7"


def test_the_progress_step_clash_is_resolved_by_add_and_deprecate():
    from mateu_ui.uidl import Step as WizardStepMarker
    from mateu_ui.uidl.components import ProgressStep, Step

    assert WizardStepMarker(2).step == 2  # the wizard marker keeps the top-level name
    with warnings.catch_warnings():
        warnings.simplefilter("error")
        ProgressStep(id="s1", title="Cart")
    with pytest.warns(DeprecationWarning, match="ProgressStep"):
        old = Step(id="s1", title="Cart")
    assert isinstance(old, ProgressStep)


def test_bare_kpi_uses_the_method_name_and_keeps_the_method():
    from mateu_ui.uidl import kpi

    class Page:
        @kpi
        def open_orders(self):
            return 3

        @kpi("Revenue")
        def revenue(self):
            return 10

    assert callable(Page.open_orders) and Page().open_orders() == 3
    assert Page.open_orders.__mateu_kpi__ == "Open orders"
    assert Page.revenue.__mateu_kpi__ == "Revenue"
    assert kpi("A") == kpi("A")


def test_markers_compare_by_value():
    from mateu_ui.uidl import Aggregate, AggregateFunction, Audience, PlainText, PrimaryColumn
    from mateu_ui.uidl import PhotoCapture, Searchable, Tooltip, TreeSelect

    assert Tooltip("a") == Tooltip("a")
    assert Aggregate() == Aggregate(AggregateFunction.sum) == Aggregate("sum")
    assert PrimaryColumn("c") == PrimaryColumn("c")
    assert TreeSelect(True) == TreeSelect(leaves_only=True)
    assert PlainText() == PlainText() and PhotoCapture() == PhotoCapture()
    assert Audience("staff", "guest") == Audience("staff", "guest")
    assert Searchable(FreezeHome) == Searchable(FreezeHome)
    with pytest.raises(Exception):
        Tooltip("a").value = "b"  # frozen
    with pytest.raises(ValueError, match="sum"):
        Aggregate("total")


@pytest.mark.parametrize(
    "build",
    [
        lambda: mateu_ui.uidl.page_width("wide"),
        lambda: mateu_ui.uidl.page_template("home"),
        lambda: mateu_ui.uidl.size("big"),
        lambda: mateu_ui.uidl.form_layout(labels_aside="left"),
        lambda: mateu_ui.uidl.wizard_progress("dots"),
        lambda: mateu_ui.uidl.banner(theme="ALERT"),
        lambda: mateu_ui.uidl.menu_group("G", display="tiles"),
        lambda: app("Bad", variant="SIDEBAR"),
    ],
)
def test_enum_valued_decorators_reject_unknown_values(build):
    with pytest.raises(ValueError, match="is not one of"):
        build()


def test_enum_valued_decorators_accept_the_member_its_value_or_its_name():
    from mateu_ui.uidl import PageWidth, page_width

    for spelling in (PageWidth.FULL_WIDTH, "fullWidth", "FULL_WIDTH"):
        @page_width(spelling)
        class Wide:
            pass

        assert Wide.__mateu_page_width__ == "fullWidth"
