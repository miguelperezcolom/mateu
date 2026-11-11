"""Button groups and split buttons (Java's ButtonGroup / @Toolbar(group, groupPrimary)): the
fluent shape is pinned by the button-groups conformance case; these pin the declared toolbar
groups and the YAML ones."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_ui.core.yaml_preview import build_from_yaml  # noqa: E402
from mateu_ui.uidl import title, toolbar, ui  # noqa: E402
from mateu_ui.uidl import components as fl  # noqa: E402

CALLS: list[str] = []


@ui("/split-toolbar-page")
@title("Split toolbar")
class SplitToolbarPage:
    name: str = "Ada"

    @toolbar(group="save", group_primary=True, button_style="primary", order=1)
    def save(self):
        CALLS.append("save")

    @toolbar("Save as draft", group="save", order=2)
    def save_draft(self):
        CALLS.append("saveDraft")

    @toolbar(group="export", order=3)
    def csv(self):
        CALLS.append("csv")

    @toolbar(group="export", order=4)
    def pdf(self):
        CALLS.append("pdf")


def _run(action_id: str = ""):
    return SyncHandler(MateuRegistry(sys.modules[__name__])).handle(RunActionRq(
        route="/split-toolbar-page", consumed_route="/split-toolbar-page", action_id=action_id,
        server_side_type=f"{__name__}.SplitToolbarPage", component_state={"name": "Ada"},
    ))


def test_a_group_with_a_primary_is_a_split_button_and_one_without_a_dropdown():
    server = _run().fragments[0].component
    page = server.children[0].metadata
    assert len(page.toolbar) == 2
    save, export = page.toolbar
    assert save.split is True and save.action_id == "save" and save.button_style == "primary"
    assert [c.label for c in save.children] == ["Save as draft"]
    assert export.split is False and export.action_id == "" and export.label == "Export"
    assert [c.action_id for c in export.children] == ["csv", "pdf"]
    assert {"save", "saveDraft", "csv", "pdf"} <= {a.id for a in server.actions}


def test_every_member_of_a_group_runs():
    CALLS.clear()
    _run("saveDraft")
    _run("pdf")
    assert CALLS == ["saveDraft", "pdf"]


def test_the_fluent_helpers():
    split = fl.Button.split(fl.Button(label="Save", action_id="save"), fl.Button(label="Draft", action_id="draft"))
    assert split.action_id == "save" and [b.action_id for b in split.buttons] == ["draft"]
    group = fl.Button.group("Export", fl.Button(label="CSV", action_id="csv"))
    assert group.action_id == "" and len(group.buttons) == 1


def test_a_yaml_button_group_with_a_primary_is_a_split_button():
    form = build_from_yaml("""
type: Form
title: Orders
toolbar:
  - type: ButtonGroup
    primary: {type: Button, label: Save, actionId: save}
    buttons:
      - {type: Button, label: Save as draft, actionId: saveDraft}
content:
  - type: ButtonGroup
    label: Export
    buttons:
      - {type: Button, label: CSV, actionId: csv}
""")
    split = form.toolbar[0]
    assert split.action_id == "save" and [b.action_id for b in split.buttons] == ["saveDraft"]
    group = form.content[0]
    assert group.action_id == "" and group.label == "Export" and [b.action_id for b in group.buttons] == ["csv"]
