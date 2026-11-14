"""A capability listing's save starts from ``edit(id)`` and its create from ``creation_form()``,
and takes from the client only what the form lets the user write (the cross-backend rule .NET's
fix agent aligned on; Java builds them the same way): a blank object filled from the wire wrote
read-only, hidden and server-owned fields and dropped the stored values the form did not carry."""

from __future__ import annotations

import copy
import sys

import pytest
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    Creatable,
    Editable,
    HiddenInCreate,
    HiddenInEditor,
    Listing,
    ReadOnly,
    ui,
)

MODULE = sys.modules[__name__]


class Account:
    id: str = ""
    name: str = ""
    balance: Annotated[float, ReadOnly()] = 0.0
    is_admin: Annotated[bool, HiddenInEditor()] = False
    created_by: Annotated[str, HiddenInCreate()] = "server"
    notes: str = ""


STORE: dict[str, Account] = {}
SAVED: list[Account] = []
CREATED: list[Account] = []


@ui("cap-accounts")
class CapAccounts(Listing[Account], Editable[Account, str], Creatable[Account, str]):
    def search(self, request, http=None):
        return list(STORE.values())

    def edit(self, id, http=None):
        stored = STORE.get(id)
        return copy.copy(stored) if stored is not None else None

    def save(self, editor, http=None):
        SAVED.append(editor)
        return editor.id

    def creation_form(self, http=None):
        form = Account()
        form.created_by = "server-default"
        return form

    def create(self, form, http=None):
        CREATED.append(form)
        return "a2"


def _seed():
    STORE.clear(), SAVED.clear(), CREATED.clear()
    a = Account()
    a.id, a.name, a.balance, a.is_admin, a.notes = "a1", "Ann", 50.0, False, "kept"
    STORE["a1"] = a


def _run(route, action_id, state):
    return SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        route=route, consumed_route="cap-accounts", server_side_type=type_name(CapAccounts),
        action_id=action_id, initiator_component_id="c1", component_state=state,
    ))


def test_a_save_starts_from_the_stored_record_and_writes_only_editable_fields():
    _seed()
    _run("cap-accounts/a1/edit", "save", {"name": "Ann B", "balance": 1e9, "isAdmin": True, "id": "zz"})
    saved = SAVED[-1]
    assert (saved.id, saved.name, saved.balance, saved.is_admin, saved.notes) == ("a1", "Ann B", 50.0, False, "kept")


def test_a_save_for_a_record_that_no_longer_exists_saves_nothing():
    _seed()
    from mateu_ui.uidl import UserFacingException

    # refused through the error boundary, with Java's and .NET's text (GA round 2, N2)
    with pytest.raises(UserFacingException, match="no longer exists"):
        _run("cap-accounts/gone/edit", "save", {"name": "X"})
    assert SAVED == []


def test_a_create_starts_from_the_creation_form_and_writes_only_creatable_fields():
    _seed()
    _run("cap-accounts/new", "create", {"name": "New", "balance": 1e9, "createdBy": "forged"})
    created = CREATED[-1]
    assert (created.name, created.balance, created.created_by) == ("New", 0.0, "server-default")


# ── a save keeps the STORED value of what the caller may not write — never nulls it ─────────

from mateu_ui.uidl import Crud, DisabledUnless, EyesOnly, Identity, ReadOnlyUnless, inline_editing  # noqa: E402


class Staffer:
    id: str = ""
    name: str = ""
    salary: Annotated[float | None, EyesOnly(roles=["hr"])] = None
    grade: Annotated[str | None, ReadOnlyUnless(roles=["hr"])] = None
    badge: Annotated[str | None, DisabledUnless(roles=["hr"])] = None


STAFF: dict[str, Staffer] = {}


@ui("staffers")
@inline_editing
class Staffers(Crud[Staffer]):
    def fetch(self, search):
        return list(STAFF.values())

    def get(self, id_):
        return STAFF.get(id_)

    def save(self, entity):
        STAFF[entity.id] = entity


def _seed_staff():
    STAFF.clear()
    s = Staffer()
    s.id, s.name, s.salary, s.grade, s.badge = "s1", "Sam", 3000.0, "B2", "K-9"
    STAFF["s1"] = s


def _staff_call(route, action_id, state=None, parameters=None):
    SyncHandler(MateuRegistry(MODULE), identity_provider=lambda: Identity(roles=("viewer",))).handle(RunActionRq(
        route=route, consumed_route="/staffers", server_side_type=type_name(Staffers), action_id=action_id,
        initiator_component_id="c1", component_state=state or {}, parameters=parameters or {},
    ))


def _kept():
    s = STAFF["s1"]
    return (s.salary, s.grade, s.badge)


def test_an_editor_save_keeps_what_the_caller_may_not_write():
    _seed_staff()
    # sent blank (the field is not drawn / is locked) or forged: the stored value stays
    _staff_call("staffers/s1/edit", "save", {"name": "Sam B", "salary": None, "grade": "", "badge": None})
    assert STAFF["s1"].name == "Sam B" and _kept() == (3000.0, "B2", "K-9")
    _staff_call("staffers/s1/edit", "save", {"name": "Sam C", "salary": 1, "grade": "Z", "badge": "X"})
    assert STAFF["s1"].name == "Sam C" and _kept() == (3000.0, "B2", "K-9")


def test_an_inline_row_edit_keeps_what_the_caller_may_not_write():
    _seed_staff()
    _staff_call("staffers", "update-row", parameters={"_editedRow": {
        "id": "s1", "name": "Sam D", "salary": None, "grade": None, "badge": None,
    }})
    assert STAFF["s1"].name == "Sam D" and _kept() == (3000.0, "B2", "K-9")
