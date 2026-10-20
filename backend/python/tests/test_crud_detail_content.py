"""``DetailContentSupplier``: a crud's record page shows the content its record supplies (an item
overview: key-info card + tabs) instead of the read-only form, under the crud's own title and
toolbar; the edit and create forms of the same class keep their forms (Java's
CrudDetailContentSyncTest)."""

import json
import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.uidl import Crud, DetailContentSupplier, ItemOverview, Panel, ui  # noqa: E402
from mateu_ui.uidl.components import Button, Text, VerticalLayout  # noqa: E402


class StudentOverview(ItemOverview):
    key_info: VerticalLayout
    personal: Annotated[Text, Panel("Personal data")]
    enrolment: Annotated[Text, Panel("Enrolment")]

    def __init__(self, student: "Student"):
        self.key_info = VerticalLayout(
            content=(Text(text=f"Email: {student.email}"), Button(label="Edit", action_id="edit"))
        )
        self.personal = Text(text=f"Name: {student.name}")
        self.enrolment = Text(text="Enrolled since 2024")


class Student(DetailContentSupplier):
    id: str = ""
    name: str = ""
    email: str | None = None

    def __init__(self, id="", name="", email=None):
        self.id, self.name, self.email = id, name, email

    def __str__(self):
        return self.name

    def detail_content(self):
        # a record can keep the default read-only form (here: the one with no email)
        return StudentOverview(self) if self.email else None


STUDENTS = [Student("1", "Ada Lovelace", "ada@example.com"), Student("2", "Alan Turing")]


@ui("students")
class Students(Crud[Student]):
    def fetch(self, search):
        return STUDENTS

    def get(self, id):
        return next((s for s in STUDENTS if s.id == id), None)

    def save(self, entity):
        pass


MODULE = sys.modules[__name__]


def open_route(route: str) -> dict:
    inc = SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        route=route, consumed_route="/students", server_side_type=type_name(Students),
        action_id="", initiator_component_id="c1", component_state={},
    ))
    return json.loads(inc.model_dump_json(by_alias=True))


def nodes(tree) -> list[dict]:
    out = []

    def walk(node):
        if isinstance(node, dict):
            out.append(node)
            for value in node.values():
                walk(value)
        elif isinstance(node, list):
            for value in node:
                walk(value)

    walk(tree)
    return out


def metadata(tree, type_: str) -> list[dict]:
    return [n for n in nodes(tree) if n.get("type") == type_]


def page(tree) -> dict:
    return metadata(tree, "Page")[0]


def field_ids(tree) -> list[str]:
    return [m.get("fieldId") for m in metadata(tree, "FormField")]


def test_the_record_page_keeps_the_cruds_title_and_toolbar():
    p = page(open_route("/students/1"))
    assert p["title"] == "Ada Lovelace"
    assert [b["actionId"] for b in p["toolbar"]] == ["cancel-view", "edit"]


def test_the_record_page_content_is_the_one_the_record_supplies():
    tree = open_route("/students/1")
    assert metadata(tree, "TabLayout")
    texts = [m.get("text") for m in metadata(tree, "Text")]
    assert "Email: ada@example.com" in texts and "Name: Ada Lovelace" in texts
    assert "name" not in field_ids(tree) and "email" not in field_ids(tree)


def test_a_record_that_supplies_nothing_keeps_the_read_only_form():
    tree = open_route("/students/2")
    assert not metadata(tree, "TabLayout")
    assert "name" in field_ids(tree)


def test_the_edit_and_create_forms_are_not_affected():
    for route in ("/students/1/edit", "/students/new"):
        tree = open_route(route)
        assert not metadata(tree, "TabLayout"), route
        assert "name" in field_ids(tree), route
