"""Page templates in YAML — ``template:`` on a ``type: Form`` (the Python mirror of Java's
PageTemplateSyncTest): each fixture of the Java suite (backend/shared/core/src/test/resources/specs/
ui) is served by the Python YAML loader and its component must equal the Java golden the browser
expander is pinned by (libs/mateu …/expander/__fixtures__/<name>.golden.json), normalised like the
conformance corpus. No allow-list: every template matches exactly."""

from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent))

from test_wire_conformance import normalise  # noqa: E402

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_ui.core import page_templates  # noqa: E402
from mateu_ui.core.mapper import ReflectionMapper  # noqa: E402
from mateu_ui.core.yaml_preview import build_from_yaml, parse_text_reporting  # noqa: E402
from mateu_ui.core.yaml_spec_loader import YamlSpecLoader  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    DashboardLandingPage,
    ItemOverviewPage,
    TemplateImage,
    WelcomePage,
)
from mateu_ui.uidl import components as fluent  # noqa: E402

REPO = Path(__file__).resolve().parents[3]
SPECS = REPO / "backend/shared/core/src/test/resources/specs/ui"
GOLDENS = REPO / "frontend/web/monorepo/libs/mateu/src/mateu/ui/infra/expander/__fixtures__"
MODULE = sys.modules[__name__]

FIXTURES = [
    "item-overview-page",
    "item-overview-photo",
    "welcome-page",
    "dashboard-page",
    "general-overview-page",
    "collection-detail-page",
    "collection-detail-empty",
    "foldout-page",
    "multimedia-page",
    "create-edit-page",
    "guided-process-page",
    "data-management-page",
    "hero-search-page",
]


def served(tmp_path, name: str) -> dict:
    shutil.copy(SPECS / f"{name}.yaml", tmp_path / f"{name}.yaml")
    h = SyncHandler(MateuRegistry(MODULE))
    h.yaml_specs = YamlSpecLoader(str(tmp_path), h.routes)
    inc = h.handle(RunActionRq(route=name))
    return inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]


@pytest.mark.parametrize("name", FIXTURES)
def test_a_templated_yaml_page_matches_the_java_golden(tmp_path, name):
    golden = json.loads((GOLDENS / f"{name}.golden.json").read_text())
    assert normalise(served(tmp_path, name)) == normalise(golden["fragments"][0]["component"])


def test_the_template_rides_the_form_metadata_and_its_slots_are_named(tmp_path):
    form = served(tmp_path, "item-overview-page")
    assert form["metadata"]["template"] == {
        "type": "ItemOverviewPage",
        # no alt declared: the page's title is the image's (Java's PageTemplates.altOf)
        "avatar": {"src": "${state.image}", "initials": "LS", "alt": "${state.name}"},
        "photo": None,
    }
    (row,) = form["children"]
    assert row["id"] == "item-overview"
    panel, main = row["children"]
    assert (panel["id"], main["id"]) == ("item-overview-panel", "item-overview-main")
    slots = [c["id"] for c in panel["metadata"]["content"]["children"]]
    assert slots == ["item-overview-media", "item-overview-body", "item-overview-footer"]


@pytest.mark.parametrize(
    "name", ["welcome-page", "multimedia-page", "data-management-page", "hero-search-page"]
)
def test_a_template_that_owns_the_header_takes_the_title_and_toolbar(tmp_path, name):
    meta = served(tmp_path, name)["metadata"]
    assert meta["noHeader"] is True
    assert meta["toolbar"] == []


def test_a_free_page_carries_no_template(tmp_path):
    (tmp_path / "free.yaml").write_text("type: Form\ntitle: Free\ncontent:\n  - {type: Text, text: x}\n")
    h = SyncHandler(MateuRegistry(MODULE))
    h.yaml_specs = YamlSpecLoader(str(tmp_path), h.routes)
    form = h.handle(RunActionRq(route="free")).model_dump(by_alias=True, mode="json")
    meta = form["fragments"][0]["component"]["metadata"]
    assert meta["template"] is None
    assert meta["noHeader"] is False


def test_an_unknown_template_leaves_the_page_free_and_is_reported():
    text = "type: Form\ntitle: T\ntemplate: {type: NoSuchPage}\ncontent:\n  - {type: Text, text: x}\n"
    tree = build_from_yaml(text)
    assert isinstance(tree, fluent.Form) and tree.template is None
    _, problem = parse_text_reporting(text)
    assert problem == "Unknown page template: NoSuchPage"


def test_a_code_authored_form_fills_a_template_too():
    form = fluent.Form(
        title="Luke",
        toolbar=(fluent.Button(label="Edit", action_id="edit"),),
        template=ItemOverviewPage(
            avatar=TemplateImage(initials="LS"), body=(fluent.Text(text="Jedi"),)
        ),
        content=(fluent.Text(text="Main"),),
    )
    wire = json.loads(ReflectionMapper().map_component(form).model_dump_json(by_alias=True))
    assert wire["metadata"]["template"]["avatar"] == {"src": None, "initials": "LS", "alt": "Luke"}
    assert wire["metadata"]["toolbar"][0]["actionId"] == "edit"  # the item keeps its header
    media = wire["children"][0]["children"][0]["metadata"]["content"]["children"][0]
    assert media["id"] == "item-overview-media"
    assert media["children"][0]["metadata"]["type"] == "Avatar"
    assert media["children"][0]["metadata"]["abbreviation"] == "LS"


def test_a_dashboard_puts_only_metric_cards_in_the_band():
    form = fluent.Form(
        template=DashboardLandingPage(
            kpi=(fluent.MetricCard(title="A", value="1"), fluent.Text(text="note"))
        ),
        content=(fluent.Text(text="panel"),),
    )
    kinds = [type(c).__name__ for c in page_templates.content_of(form)]
    assert kinds == ["Scoreboard", "Text", "DashboardLayout"]


def test_the_welcome_tone_reads_spectras_dark_prefix():
    assert page_templates.tone_of("dark-slate").value == "slate"
    assert page_templates.tone_of("plum").value == "plum"
    assert page_templates.tone_of("auto") is None
    assert page_templates.tone_of("chartreuse") is None
    assert page_templates.tone_of(None) is None


def test_each_template_implies_its_page_type():
    assert page_templates.page_type_of(WelcomePage()) == "landing"
    assert page_templates.page_type_of(ItemOverviewPage()) == "detail"
    assert page_templates.page_type_of(DashboardLandingPage()) == "dashboard"
    assert page_templates.page_type_of(None) is None


def test_a_declared_alt_wins_over_the_page_title_on_the_wire_and_on_the_drawn_image():
    form = fluent.Form(
        title="Luke",
        template=ItemOverviewPage(photo=TemplateImage(src="/luke.png", alt="Luke on Tatooine")),
    )
    wire = json.loads(ReflectionMapper().map_component(form).model_dump_json(by_alias=True))
    assert wire["metadata"]["template"]["photo"]["alt"] == "Luke on Tatooine"
    media = wire["children"][0]["children"][0]["metadata"]["content"]["children"][0]
    assert media["children"][0]["metadata"] == {"type": "Image", "src": "/luke.png", "alt": "Luke on Tatooine"}
