"""Sync tests for ``@welcome_banner`` — the Python mirror of Java's ``WelcomeBannerSyncTest``:
the decorator prepends the Redwood "Welcome Banner" element to the page content as a plain
centered HeroSection with id "welcome-banner" (there is no new wire type — the HeroSection IS
the welcome banner), and an empty banner title falls back to the view's page title.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import title, ui, welcome_banner  # noqa: E402


# ── (a) A form carrying a @welcome_banner with title and subtitle ─────────────
@ui("welcome-banner-form")
@title("Onboarding")
@welcome_banner(title="Find your flow", subtitle="Three steps and you are done")
class WelcomeBannerForm:
    name: str = "n"


# ── (b) A form whose @welcome_banner leaves the title empty ───────────────────
@ui("welcome-banner-default-title")
@title("Onboarding")
@welcome_banner()
class DefaultTitleWelcomeBannerForm:
    name: str = "n"


MODULE = sys.modules[__name__]


# ── Helpers ─────────────────────────────────────────────────────────────────────
def component_tree(view_cls) -> dict:
    handler = SyncHandler(MateuRegistry(MODULE))
    inc = handler.handle(RunActionRq(server_side_type=type_name(view_cls)))
    return inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]


def page_children(root) -> list[dict]:
    (page,) = root["children"]
    assert page["metadata"]["type"] == "Page"
    return page["children"]


# ── (a) The banner is prepended as a centered HeroSection ─────────────────────
def test_the_welcome_banner_is_the_first_page_child():
    children = page_children(component_tree(WelcomeBannerForm))
    banner = children[0]
    assert banner["type"] == "ClientSide"
    assert banner["id"] == "welcome-banner"
    meta = banner["metadata"]
    assert meta["type"] == "HeroSection"
    assert meta["title"] == "Find your flow"
    assert meta["subtitle"] == "Three steps and you are done"
    assert meta["centered"] is True
    # The form content still follows the banner.
    assert len(children) > 1


# ── (b) An empty banner title falls back to the page title ────────────────────
def test_an_empty_banner_title_falls_back_to_the_page_title():
    children = page_children(component_tree(DefaultTitleWelcomeBannerForm))
    meta = children[0]["metadata"]
    assert meta["type"] == "HeroSection"
    assert meta["title"] == "Onboarding"
    assert meta["centered"] is True
