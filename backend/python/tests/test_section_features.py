"""Sync tests for the Section(property_list=True) / Section(frameless=True) flags and the
BulletedList marker + fluent component — the Python mirror of Java's ``PropertyListSyncTest``,
``FramelessSectionSyncTest`` and ``BulletedListSyncTest``."""

import sys
from pathlib import Path
from typing import Annotated

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import (  # noqa: E402
    BulletedList,
    ComponentTreeSupplier,
    FileUpload,
    Message,
    Section,
    SeparatorBefore,
    Step,
    Wizard,
    title,
    ui,
    wizard_progress,
)
from mateu_uidl import components as fluent  # noqa: E402


@ui("sections-property-list")
@title("Property list")
class PropertyListForm:
    """Property-list section + a regular section (Java: @Section(propertyList=true))."""

    documento: Annotated[str, Section("Documento", property_list=True)] = "12345678X"
    nombre: str = "María"
    email: Annotated[str, Section("Otros")] = ""


@ui("sections-frameless")
@title("Frameless")
class FramelessForm:
    """A frameless band next to a framed section (Java: @Section(frameless=true))."""

    aviso: Annotated[str, Section("Banda", frameless=True)] = "sin marco"
    nombre: Annotated[str, Section("Datos")] = "María"


@ui("sections-bulleted")
@title("Bulleted")
class BulletedForm:
    """BulletedList() marker on a collection field."""

    preferencias: Annotated[list[str], BulletedList()] = ["Almohada extra", "Planta alta"]


@ui("sections-bulleted-fluent")
@title("Bulleted fluent")
class BulletedFluentView(ComponentTreeSupplier):
    """The fluent BulletedList component in a component-tree view."""

    def component(self):
        return fluent.BulletedList(items=("Vista mar", "Cuna"))


@ui("sections-file-upload")
@title("File upload")
class FileUploadForm:
    """FileUpload(accept=".csv") on a str field (Java: @FileUpload(accept = ".csv"))."""

    attachment: Annotated[str | None, FileUpload(accept=".csv")] = None
    plain: str | None = None


@ui("sections-separator")
@title("Separator")
class SeparatorForm:
    """SeparatorBefore() on a field (Java: @SeparatorBefore)."""

    nombre: str = "María"
    email: Annotated[str, SeparatorBefore()] = ""


@ui("sections-text-size")
@title("Text size")
class TextSizeView(ComponentTreeSupplier):
    """The fluent Text with a size."""

    def component(self):
        return fluent.Text(text="pequeño", size="xs")


@ui("sections-notice")
@title("Notice")
class NoticeView(ComponentTreeSupplier):
    """The fluent Notice (compact inline banner) in a component-tree view."""

    def component(self):
        return fluent.Notice(
            text="2 quejas pendientes", theme="danger", action_label="Revisar", action_id="review"
        )


@ui("sections-wizard-steps")
@title("Steps wizard")
@wizard_progress("steps")
class StepsWizard(Wizard):
    """wizard_progress("steps"): connected bullets instead of the progress bar."""

    a: Annotated[str | None, Step(1)] = None
    b: Annotated[str | None, Step(2)] = None

    def complete(self) -> Message:
        return Message("done")


MODULE = sys.modules[__name__]


# ── Helpers (same walking approach as test_layout_inference) ────────────────────
def component_tree(view_cls) -> dict:
    handler = SyncHandler(MateuRegistry(MODULE))
    inc = handler.handle(RunActionRq(server_side_type=type_name(view_cls)))
    return inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]


def walk(node):
    if not isinstance(node, dict):
        return
    yield node
    meta = node.get("metadata")
    if isinstance(meta, dict) and isinstance(meta.get("content"), dict):
        yield from walk(meta["content"])
    for child in node.get("children") or []:
        yield from walk(child)


def all_metadata(root, meta_type: str) -> list[dict]:
    return [
        c
        for c in walk(root)
        if isinstance(c.get("metadata"), dict) and c["metadata"].get("type") == meta_type
    ]


def field(root, field_id: str) -> dict:
    return next(
        c["metadata"]
        for c in all_metadata(root, "FormField")
        if c["metadata"]["fieldId"] == field_id
    )


# ── Property-list sections ──────────────────────────────────────────────────────
def test_property_list_section_marks_its_fields_as_read_only_property_rows():
    tree = component_tree(PropertyListForm)
    assert field(tree, "documento")["propertyRow"] is True
    assert field(tree, "documento")["readOnly"] is True
    assert field(tree, "nombre")["propertyRow"] is True
    # fields of other sections are unaffected
    assert field(tree, "email")["propertyRow"] is False
    assert field(tree, "email")["readOnly"] is False


# ── Frameless sections ──────────────────────────────────────────────────────────
def test_frameless_section_emits_no_section_card_while_the_others_keep_theirs():
    tree = component_tree(FramelessForm)
    titles = [c["metadata"]["title"] for c in all_metadata(tree, "FormSection")]
    assert titles == ["Datos"]
    # the frameless section's field still travels
    assert field(tree, "aviso")["initialValue"] == "sin marco"


# ── Bulleted lists ──────────────────────────────────────────────────────────────
def test_bulleted_list_marker_becomes_its_stereotype():
    tree = component_tree(BulletedForm)
    assert field(tree, "preferencias")["stereotype"] == "bulletedList"


def test_file_upload_marker_becomes_its_stereotype_and_the_accept_travels_as_an_attribute():
    tree = component_tree(FileUploadForm)
    f = field(tree, "attachment")
    assert f["stereotype"] == "fileUpload"
    # Java parity: the accept filter rides in the generic attributes list.
    assert f["attributes"] == [{"key": "accept", "value": ".csv"}]
    # fields without the marker keep an empty attributes list and the regular stereotype
    assert field(tree, "plain")["stereotype"] == "regular"
    assert field(tree, "plain")["attributes"] == []


def test_fluent_bulleted_list_travels_as_its_dto_with_items():
    tree = component_tree(BulletedFluentView)
    lists = all_metadata(tree, "BulletedList")
    assert len(lists) == 1
    assert lists[0]["metadata"]["items"] == ["Vista mar", "Cuna"]


# ── Separators & text sizes ─────────────────────────────────────────────────────
def test_separator_before_paints_a_full_width_divider_above_the_field():
    tree = component_tree(SeparatorForm)
    separators = all_metadata(tree, "Separator")
    assert len(separators) == 1
    assert separators[0]["metadata"]["attributes"] == {"data-colspan": "2"}


def test_text_size_travels_on_the_wire():
    tree = component_tree(TextSizeView)
    text = next(
        c["metadata"] for c in all_metadata(tree, "Text") if c["metadata"]["text"] == "pequeño"
    )
    assert text["size"] == "xs"


# ── Notices ─────────────────────────────────────────────────────────────────────
def test_notice_travels_with_theme_text_and_action():
    tree = component_tree(NoticeView)
    notices = all_metadata(tree, "Notice")
    assert len(notices) == 1
    m = notices[0]["metadata"]
    assert m["text"] == "2 quejas pendientes"
    assert m["theme"] == "danger"
    assert m["actionLabel"] == "Revisar"
    assert m["actionId"] == "review"


# ── Wizard progress styles ──────────────────────────────────────────────────────
def test_wizard_progress_steps_emits_connected_bullets_instead_of_the_bar():
    tree = component_tree(StepsWizard)
    assert all_metadata(tree, "ProgressBar") == []
    steppers = all_metadata(tree, "ProgressSteps")
    assert len(steppers) == 1
    assert [s["status"] for s in steppers[0]["metadata"]["steps"]] == ["current", "upcoming"]
