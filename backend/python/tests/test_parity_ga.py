"""3.0 GA parity with Java, beyond what the wire corpus pins: the save-side mass-assignment rule
of ``GeneratedValue()`` / ``EditableOnlyWhenCreating()`` (Java's ClientWritableFields), the
``type: Project`` renderer-mismatch warning (Java's ProjectRendererCheck) and the page blocks'
supplier-over-field precedence."""

from __future__ import annotations

import copy
import logging
import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, project_renderer, type_name  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    Crud,
    EditableOnlyWhenCreating,
    GeneratedValue,
    Header,
    HeaderSupplier,
    inline_editing,
    ui,
)
from mateu_ui.uidl import components as fluent  # noqa: E402

MODULE = sys.modules[__name__]


class Numbers:
    def generate(self):
        return "T-100"


class Ticket:
    id: str = ""
    reference: Annotated[str, GeneratedValue(Numbers)] = ""
    code: Annotated[str, EditableOnlyWhenCreating()] = ""
    title: str = ""


STORE: dict[str, Ticket] = {}


def _seed():
    STORE.clear()
    t = Ticket()
    t.id, t.reference, t.code, t.title = "T-001", "T-001", "INC", "Printer jam"
    STORE["T-001"] = t


@ui("ga-tickets")
@inline_editing
class Tickets(Crud[Ticket]):
    def fetch(self, search):
        return list(STORE.values())

    def get(self, id):
        t = STORE.get(id)
        return copy.copy(t) if t is not None else None

    def save(self, entity):
        if not entity.id:
            entity.id = f"T-{len(STORE) + 1:03d}"
        STORE[entity.id] = entity

    def delete(self, id):
        STORE.pop(id, None)


def handle(**rq):
    return SyncHandler(MateuRegistry(MODULE)).handle(
        RunActionRq(server_side_type=type_name(Tickets), **rq)
    )


def test_an_edit_keeps_the_stored_server_owned_values_whatever_the_client_sends():
    _seed()
    handle(route="/ga-tickets/T-001/edit", action_id="save",
           component_state={"reference": "HACKED", "code": "HACKED", "title": "Jammed"})
    stored = STORE["T-001"]
    assert (stored.reference, stored.code, stored.title) == ("T-001", "INC", "Jammed")


def test_a_create_keeps_the_generated_value_the_server_handed_out_and_the_creating_only_code():
    _seed()
    handle(route="/ga-tickets/new", action_id="create",
           component_state={"reference": "T-100", "code": "NEW", "title": "Paper"})
    created = next(t for t in STORE.values() if t.title == "Paper")
    assert (created.reference, created.code) == ("T-100", "NEW")


def test_an_inline_edited_row_cannot_write_a_server_owned_value():
    _seed()
    handle(action_id="update-row", initiator_component_id="c1",
           parameters={"_editedRow": {"id": "T-001", "code": "X", "reference": "X", "title": "Row"}})
    stored = STORE["T-001"]
    assert (stored.reference, stored.code, stored.title) == ("T-001", "INC", "Row")


def test_the_creation_form_starts_with_the_generated_value():
    _seed()
    frag = handle(route="/ga-tickets/new").model_dump(by_alias=True, mode="json")["fragments"][0]
    assert frag["component"]["initialData"]["reference"] == "T-100"


# ── A technical id (Java's TechnicalId / CrudTechnicalIdSyncTest) ────────────────────────────


class Sku:
    id: Annotated[str, EditableOnlyWhenCreating()] = ""
    title: str = ""


SKUS: dict[str, Sku] = {}


@ui("ga-skus")
class Skus(Crud[Sku]):
    def fetch(self, search):
        return list(SKUS.values())

    def get(self, id):
        return SKUS.get(id)

    def save(self, entity):
        if not entity.id:
            entity.id = "generated"
        SKUS[entity.id] = entity

    def delete(self, id):
        SKUS.pop(id, None)


def _field_ids(node, out: list) -> list:
    if isinstance(node, dict):
        if node.get("type") == "FormField":
            out.append(node.get("fieldId"))
        for v in node.values():
            _field_ids(v, out)
    elif isinstance(node, list):
        for v in node:
            _field_ids(v, out)
    return out


def test_a_technical_id_has_no_input_on_the_creation_form_and_is_never_taken_from_a_create():
    _seed()
    form = handle(route="/ga-tickets/new").model_dump(by_alias=True, mode="json")
    assert "title" in _field_ids(form, []) and "id" not in _field_ids(form, [])
    # a create naming an existing id does not overwrite it: the store assigns a new one
    handle(route="/ga-tickets/new", action_id="create",
           component_state={"id": "T-001", "reference": "T-100", "title": "Forged"})
    assert STORE["T-001"].title == "Printer jam"
    assert len(STORE) == 2


def test_an_id_the_user_chooses_on_create_keeps_its_input():
    SKUS.clear()
    skus = SyncHandler(MateuRegistry(MODULE))
    form = skus.handle(
        RunActionRq(server_side_type=type_name(Skus), route="/ga-skus/new")
    ).model_dump(by_alias=True, mode="json")
    assert {"id", "title"} <= set(_field_ids(form, []))
    skus.handle(RunActionRq(
        server_side_type=type_name(Skus), route="/ga-skus/new", action_id="create",
        component_state={"id": "SKU-1", "title": "Lamp"},
    ))
    assert list(SKUS) == ["SKU-1"]


# ── type: Project ────────────────────────────────────────────────────────────────────────────


class _Files:
    def __init__(self, files: set[str]):
        self.files = files

    def read(self, relative):
        return b"x" if relative in self.files else None


def test_a_project_naming_redwood_on_a_vaadin_server_is_warned(tmp_path, caplog):
    (tmp_path / "project.yaml").write_text("type: Project\nrenderer: redwood\n")
    with caplog.at_level(logging.WARNING, logger="mateu.project"):
        message = project_renderer.warn_on_startup(_Files({"_index.html"}), tmp_path)
    assert message is not None and "says renderer: redwood, but this server serves vaadin" in message
    assert "io.mateu:mateu-redwood instead of io.mateu:mateu-vaadin" in message
    assert any("says renderer: redwood" in r.getMessage() for r in caplog.records)


def test_no_warning_when_they_agree_when_nothing_is_served_or_nothing_is_declared(tmp_path):
    (tmp_path / "project.yaml").write_text("type: Project\nrenderer: redwood\n")
    redwood = _Files({"_index.html", project_renderer.REDWOOD_MARKER})
    assert project_renderer.warn_on_startup(redwood, tmp_path) is None
    assert project_renderer.warn_on_startup(None, tmp_path) is None
    empty = tmp_path / "empty"
    empty.mkdir()
    assert project_renderer.warn_on_startup(_Files({"_index.html"}), empty) is None


def test_a_type_project_file_anywhere_under_the_specs_is_read(tmp_path):
    (tmp_path / "settings").mkdir()
    (tmp_path / "settings" / "mine.yaml").write_text("type: Project\nrenderer: redwood\n")
    assert project_renderer.read(tmp_path) == "redwood"
    assert project_renderer.parse("type: Project\n") == "vaadin"
    assert project_renderer.parse("type: Form\n") is None


# ── page blocks ──────────────────────────────────────────────────────────────────────────────


@ui("ga-blocks")
class Blocks(HeaderSupplier):
    banner: Annotated[fluent.Text, Header()] = fluent.Text(text="from the field")
    name: str = "Ada"

    def header(self):
        return [fluent.Text(text="from the supplier")]


def test_a_header_supplier_wins_over_the_header_fields():
    inc = SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(server_side_type=type_name(Blocks)))
    page = inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]["children"][0]
    assert [h["metadata"]["text"] for h in page["metadata"]["header"]] == ["from the supplier"]


# ── per-request field suppliers (Java's ReadOnly/Required/Visibility/Colspan suppliers) ─────

from mateu_ui.uidl import (  # noqa: E402
    ColspanSupplier,
    OverlineSupplier,
    PostHydrationHandler,
    ReadOnlySupplier,
    RequiredSupplier,
    TitlePlaceholderSupplier,
    VisibilitySupplier,
    form_layout,
    overline,
)


@ui("ga-suppliers")
@overline("Declared")
@form_layout(columns=2)
class Supplied(OverlineSupplier, TitlePlaceholderSupplier, VisibilitySupplier, ReadOnlySupplier,
               RequiredSupplier, ColspanSupplier, PostHydrationHandler):
    name: str = "Ada"
    secret: str = "x"
    code: str = "C"
    total: int = 0
    doubled: int = 0

    def overline(self):
        return "Supplied"

    def title_placeholder(self):
        return "New one"

    def is_hidden(self, field_name):
        return field_name == "secret"

    def is_read_only(self, field_name):
        return field_name == "code"

    def is_required(self, field_name):
        return field_name == "name"

    def colspan(self, field_name):
        return 2 if field_name == "name" else 0

    def on_hydrated(self):
        self.doubled = self.total * 2


def _fields(node, out):
    if isinstance(node, dict):
        if node.get("type") == "FormField":
            out[node["fieldId"]] = node
        for v in node.values():
            _fields(v, out)
    elif isinstance(node, list):
        for v in node:
            _fields(v, out)
    return out


def test_the_field_suppliers_decide_per_request():
    inc = SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(server_side_type=type_name(Supplied)))
    page = inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]["children"][0]
    assert page["metadata"]["overline"] == "Supplied"
    assert page["metadata"]["titlePlaceholder"] == "New one"
    fields = _fields(page, {})
    assert "secret" not in fields
    assert fields["code"]["readOnly"] is True
    assert fields["name"]["required"] is True and fields["name"]["colspan"] == 2


def test_post_hydration_runs_once_the_state_is_bound():
    handler = SyncHandler(MateuRegistry(MODULE))
    view = Supplied()
    handler.bind_state(view, {"total": 21})
    assert view.doubled == 42
