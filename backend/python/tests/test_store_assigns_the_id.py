"""A create whose store saves the record WITHOUT an id is refused, never answered "Saved" (GA review
2, B-1). Since the technical-id rule (beta.65) a creation form has no input for a plain ``id`` and
a create never takes one from the client: the store must assign it. A store that does not — the
pattern the manuals taught before — saved every new record under the same empty key, each create
replacing the last behind a success toast. Java's FilteredAutoCrud.create and .NET's crud create
answer the same text."""

from __future__ import annotations

import sys
import uuid
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
import pytest  # noqa: E402

from mateu_ui.uidl import Crud, EditableOnlyWhenCreating, Required, UserFacingException, ui  # noqa: E402

MODULE = sys.modules[__name__]

NO_ID = (
    "The record was saved without an id. The store must assign the id of a new record, or the "
    "id field must be marked EditableOnlyWhenCreating so the user types it."
)


class Product:
    id: Annotated[str, Required()] = ""
    name: Annotated[str, Required()] = ""


FORGETFUL: dict[str, Product] = {}
ASSIGNING: dict[str, Product] = {}
TYPED: dict[str, "Typed"] = {}


@ui("forgetful")
class Forgetful(Crud[Product]):
    """The pre-beta.65 manual example: keyed by an id nobody assigns."""

    def fetch(self, search):
        return list(FORGETFUL.values())

    def get(self, id):
        return FORGETFUL.get(id)

    def save(self, entity):
        FORGETFUL[entity.id] = entity


@ui("assigning")
class Assigning(Crud[Product]):
    def fetch(self, search):
        return list(ASSIGNING.values())

    def get(self, id):
        return ASSIGNING.get(id)

    def save(self, entity):
        if not entity.id:
            entity.id = uuid.uuid4().hex[:8]
        ASSIGNING[entity.id] = entity


class Typed:
    id: Annotated[str, Required(), EditableOnlyWhenCreating()] = ""
    name: str = ""


@ui("typed")
class TypedCrud(Crud[Typed]):
    def fetch(self, search):
        return list(TYPED.values())

    def get(self, id):
        return TYPED.get(id)

    def save(self, entity):
        TYPED[entity.id] = entity


def create(cls, route, state):
    inc = SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        route=f"/{route}/new", server_side_type=type_name(cls), action_id="create", component_state=state,
    ))
    return [(m.variant, m.text) for m in inc.messages]


def test_a_store_that_assigns_no_id_is_told_so_instead_of_saved():
    """Raised as a UserFacingException: the error boundary shows it as written."""
    FORGETFUL.clear()
    with pytest.raises(UserFacingException) as refused:
        create(Forgetful, "forgetful", {"id": "P-1", "name": "first"})
    assert refused.value.message == NO_ID


def test_a_store_that_assigns_the_id_creates_one_record_per_create():
    ASSIGNING.clear()
    for name in ("first", "second"):
        assert ("success", "Saved") in create(Assigning, "assigning", {"name": name})
    assert sorted(p.name for p in ASSIGNING.values()) == ["first", "second"]
    assert "" not in ASSIGNING


def test_an_id_the_user_types_is_kept():
    TYPED.clear()
    assert ("success", "Saved") in create(TypedCrud, "typed", {"id": "P-1", "name": "first"})
    assert list(TYPED) == ["P-1"]
