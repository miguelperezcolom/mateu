"""The pre-beta API freeze (design/api-freeze-review.md), Python side: the right spelling of the
hamburger variant, the deprecation of the old one (a ``DeprecationWarning`` naming the
replacement), the parity aliases, and ``__all__`` covering what the package exports."""

import sys
import warnings
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import mateu_uidl  # noqa: E402
from mateu_core.mapper import ReflectionMapper  # noqa: E402
from mateu_uidl import AppVariant, app, menu_item, title, ui  # noqa: E402
from mateu_uidl.components import ContentLayout, DashboardLayout  # noqa: E402


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


def test_the_right_spelling_travels_under_the_wire_name_every_renderer_reads():
    assert wire_variant(HamburgerApp) == "HAMBURGUER_MENU"


def test_a_plain_string_still_works():
    @app("Strings", variant="HAMBURGER_MENU")
    class StringApp:
        @menu_item("Home")
        def home(self) -> "FreezeHome":
            return FreezeHome()

    assert wire_variant(StringApp) == "HAMBURGUER_MENU"


def test_the_old_misspelling_warns_naming_the_replacement_and_keeps_working():
    with pytest.warns(DeprecationWarning, match="AppVariant.HAMBURGER_MENU"):

        @app("Old", variant="HAMBURGUER_MENU")
        class OldApp:
            @menu_item("Home")
            def home(self) -> "FreezeHome":
                return FreezeHome()

    assert wire_variant(OldApp) == "HAMBURGUER_MENU"


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
    assert mateu_uidl.BadgeInHeader is mateu_uidl.HeaderBadge
    assert mateu_uidl.PageWidthStyle is mateu_uidl.PageWidth


def test_every_public_export_is_in_all():
    """``from mateu_uidl import *`` must not silently drop public API: every public name the
    package binds (not modules, not private, not typing helpers) is listed in ``__all__``."""
    import types

    exported = set(mateu_uidl.__all__)
    missing = sorted(
        name
        for name, value in vars(mateu_uidl).items()
        if not name.startswith("_")
        and not isinstance(value, types.ModuleType)
        and name not in exported
        and name not in {"annotations", "T", "C", "D", "E", "F", "I", "R"}
    )
    assert missing == [], f"public names missing from mateu_uidl.__all__: {missing}"
    assert all(hasattr(mateu_uidl, n) for n in exported)
