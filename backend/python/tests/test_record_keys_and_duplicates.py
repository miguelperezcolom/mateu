"""Which record a write touches (GA round 2, N2/N3 — Java's CapabilityListingSyncTest and
FilteredAutoCrud.create, .NET's GaFollowUpTests hold the same rules and texts):

* N2 — a capability listing's save (Editable without Navigable: the drawer edit) finds the edited
  record's id the way the listing does — ``id``, else the row's first field — so a record keyed by
  a business code is found; one the listing does not hold is refused, never created.
* N3 — a crud create whose (typed) id names a stored record is refused after the permission check:
  built from a creation form it would REPLACE that record.
"""

from __future__ import annotations

import sys
from dataclasses import dataclass, replace
from pathlib import Path
from typing import Annotated

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuForbiddenException, MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    Crud, Editable, EditableOnlyWhenCreating, Listing, ReadOnly, UserFacingException, ui,
)

MODULE = sys.modules[__name__]

NO_LONGER_EXISTS = "This record no longer exists. Reload the list to see the current records."
ALREADY_EXISTS = "A record with this id already exists. Choose another id, or open the record to edit it."


@dataclass
class Booking:
    code: str = ""
    guest: str = ""
    total: Annotated[float, ReadOnly()] = 0.0


BOOKINGS: dict[str, Booking] = {}


@ui("key-bookings")
class Bookings(Listing[Booking], Editable):
    def search(self, request, http=None):
        return list(BOOKINGS.values())

    def edit(self, id):
        stored = BOOKINGS.get(id)
        return replace(stored) if stored is not None else None

    def save(self, editor):
        BOOKINGS[editor.code] = editor
        return editor.code


class Sku:
    id: Annotated[str, EditableOnlyWhenCreating()] = ""
    title: str = ""


SKUS: dict[str, Sku] = {}


@ui("key-skus")
class Skus(Crud[Sku]):
    def fetch(self, search):
        return list(SKUS.values())

    def get(self, id):
        return SKUS.get(id)

    def save(self, entity):
        SKUS[entity.id] = entity


@ui("key-skus-no-edit")
class SkusNoEdit(Skus):
    def can_edit(self) -> bool:
        return False


def run(cls, route, action, state):
    return SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        route=route, server_side_type=type_name(cls), action_id=action, component_state=state,
    ))


@pytest.fixture(autouse=True)
def _seed():
    BOOKINGS.clear()
    BOOKINGS["B-1"] = Booking("B-1", "Ana", 120.0)
    BOOKINGS["B-2"] = Booking("B-2", "Bob", 80.0)
    SKUS.clear()
    yield


def test_a_drawer_save_finds_a_record_keyed_by_its_code_and_keeps_its_read_only_values():
    run(Bookings, "key-bookings", "save", {"code": "B-1", "guest": "Ana Edited", "total": 0})
    assert (BOOKINGS["B-1"].guest, BOOKINGS["B-1"].total) == ("Ana Edited", 120.0)
    assert len(BOOKINGS) == 2


def test_a_drawer_save_of_a_record_the_listing_does_not_hold_is_refused():
    with pytest.raises(UserFacingException) as refused:
        run(Bookings, "key-bookings", "save", {"code": "B-9", "guest": "Nobody", "total": 999})
    assert refused.value.message == NO_LONGER_EXISTS
    assert "B-9" not in BOOKINGS


def test_a_capability_save_at_a_record_route_saves_that_record_whatever_code_is_posted():
    run(Bookings, "key-bookings/B-1/edit", "save", {"code": "B-2", "guest": "Hijack"})
    assert BOOKINGS["B-2"].guest == "Bob"
    assert BOOKINGS["B-1"].guest == "Hijack"


def test_a_create_whose_typed_id_already_exists_is_refused():
    run(Skus, "key-skus/new", "create", {"id": "SKU-1", "title": "Lamp"})
    with pytest.raises(UserFacingException) as refused:
        run(Skus, "key-skus/new", "create", {"id": "SKU-1", "title": "Other"})
    assert refused.value.message == ALREADY_EXISTS
    assert SKUS["SKU-1"].title == "Lamp"


def test_the_permission_check_comes_first():
    SKUS["SKU-1"] = Sku()
    SKUS["SKU-1"].id, SKUS["SKU-1"].title = "SKU-1", "Lamp"
    with pytest.raises(MateuForbiddenException):
        run(SkusNoEdit, "key-skus-no-edit/new", "create", {"id": "SKU-1", "title": "Other"})
    assert SKUS["SKU-1"].title == "Lamp"
