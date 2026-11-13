"""NM11: update-row (inline editing) is a write path like save, so it gets save's protection — a
ReadOnly() field keeps the stored value, an id with no stored row is refused (never inserted), a row
carrying only some columns keeps the other fields — and only a crud that edits inline offers it.
Mirrors Java's InlineEditWriteProtectionSyncTest and .NET's InlineEditWriteProtectionTests."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Annotated

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.core.action_guard import MateuForbiddenException  # noqa: E402
from mateu_ui.uidl import Crud, ReadOnly, inline_editing, title, ui  # noqa: E402

MODULE = sys.modules[__name__]


class Part:
    id: str = ""
    name: str = ""
    code: Annotated[str, ReadOnly()] = ""
    units: int = 0


_PARTS: dict[str, Part] = {}


class _PartsBase(Crud[Part]):
    def fetch(self, search):
        return _PARTS.values()

    def get(self, id_):
        return _PARTS.get(id_)

    def save(self, entity):
        _PARTS[entity.id] = entity


@ui("nm11-inline-parts")
@title("Parts")
@inline_editing
class InlineParts(_PartsBase):
    pass


@ui("nm11-plain-parts")
@title("Parts")
class PlainParts(_PartsBase):
    pass


def _seed():
    _PARTS.clear()
    p = Part()
    p.id, p.name, p.code, p.units = "p1", "Bolt", "B-01", 10
    _PARTS["p1"] = p


def _update_row(crud, row):
    return SyncHandler(MateuRegistry(MODULE)).handle(
        RunActionRq(
            action_id="update-row",
            server_side_type=type_name(crud),
            initiator_component_id="c1",
            parameters={"_editedRow": row},
        )
    )


def test_a_read_only_field_keeps_the_stored_value():
    _seed()
    _update_row(InlineParts, {"id": "p1", "name": "Bolt M8", "code": "HACKED", "units": 12})
    assert (_PARTS["p1"].name, _PARTS["p1"].units, _PARTS["p1"].code) == ("Bolt M8", 12, "B-01")


def test_an_id_with_no_stored_row_is_refused_never_inserted():
    _seed()
    inc = _update_row(InlineParts, {"id": "p-new", "name": "Injected"})
    assert "p-new" not in _PARTS
    assert inc.messages and inc.messages[0].variant == "error"


def test_a_row_carrying_only_some_columns_keeps_the_other_fields():
    _seed()
    _update_row(InlineParts, {"id": "p1", "units": 99})
    assert (_PARTS["p1"].name, _PARTS["p1"].units, _PARTS["p1"].code) == ("Bolt", 99, "B-01")


def test_a_crud_that_does_not_edit_inline_refuses_it():
    _seed()
    with pytest.raises(MateuForbiddenException):
        _update_row(PlainParts, {"id": "p1", "name": "X"})
    assert _PARTS["p1"].name == "Bolt"


# ── GA review P4: hidden editor fields and the client's Version ─────────────────────────────

from mateu_ui.uidl import HiddenInEditor, HiddenInList, Version  # noqa: E402


class Account:
    id: str = ""
    name: str = ""
    is_admin: Annotated[bool, HiddenInEditor()] = False
    internal_code: Annotated[str, HiddenInList()] = "IC-1"
    version: Annotated[int, Version()] = 0


_ACCOUNTS: dict[str, Account] = {}


@ui("p4-inline-accounts")
@title("Accounts")
@inline_editing
class InlineAccounts(Crud[Account]):
    def fetch(self, search):
        return _ACCOUNTS.values()

    def get(self, id_):
        stored = _ACCOUNTS.get(id_)
        if stored is None:
            return None
        import copy

        return copy.copy(stored)

    def save(self, entity):
        _ACCOUNTS[entity.id] = entity


def _seed_accounts():
    _ACCOUNTS.clear()
    a = Account()
    a.id, a.name, a.is_admin, a.version = "u1", "Ann", False, 1
    _ACCOUNTS["u1"] = a


def test_a_hidden_in_editor_field_takes_nothing_from_the_row():
    _seed_accounts()
    _update_row(InlineAccounts, {"id": "u1", "name": "Ann B", "isAdmin": True, "version": 1})
    assert (_ACCOUNTS["u1"].name, _ACCOUNTS["u1"].is_admin) == ("Ann B", False)


def test_the_row_is_saved_from_the_stored_version_not_the_clients():
    _seed_accounts()
    _update_row(InlineAccounts, {"id": "u1", "name": "Ann B", "version": 999})
    assert (_ACCOUNTS["u1"].name, _ACCOUNTS["u1"].version) == ("Ann B", 2)


def test_an_overwrite_also_moves_from_the_stored_version():
    _seed_accounts()
    _ACCOUNTS["u1"].version = 5
    SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        action_id="update-row", server_side_type=type_name(InlineAccounts), initiator_component_id="c1",
        parameters={"_editedRow": {"id": "u1", "name": "Mine", "version": 1}, "_forceOverwrite": True},
    ))
    assert (_ACCOUNTS["u1"].name, _ACCOUNTS["u1"].version) == ("Mine", 6)


def test_a_stale_row_is_still_a_conflict():
    _seed_accounts()
    _ACCOUNTS["u1"].version = 3
    _update_row(InlineAccounts, {"id": "u1", "name": "Stale", "version": 1})
    assert _ACCOUNTS["u1"].name == "Ann"


def test_a_field_the_listing_does_not_show_takes_nothing_from_the_row():
    _seed_accounts()
    _update_row(InlineAccounts, {"id": "u1", "name": "Ann C", "internalCode": "forged", "version": 1})
    assert (_ACCOUNTS["u1"].name, _ACCOUNTS["u1"].internal_code) == ("Ann C", "IC-1")
