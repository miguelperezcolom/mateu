"""W-V-TABLE-ID: a listing whose rows open by click leaves its technical id out of the columns
(Java TechnicalIdColumnTest, .NET TechnicalIdColumnTests)."""

from typing import Annotated

from mateu_ui.core.mapper.crud import without_technical_id
from mateu_ui.core.reflection import view_fields
from mateu_ui.uidl import Label


class Generated:
    id: str
    name: str


class Named:
    id: Annotated[str, Label("Code")]
    name: str


class OnlyId:
    id: str


def names(cls, clickable=True):
    return [f.name for f in without_technical_id(view_fields(cls), clickable)]


def test_the_id_is_left_out_when_the_rows_open():
    assert names(Generated) == ["name"]


def test_a_labelled_id_is_a_column_the_developer_wants_shown():
    assert names(Named) == ["id", "name"]


def test_rows_that_do_not_open_keep_their_id():
    assert names(Generated, clickable=False) == ["id", "name"]


def test_the_only_column_stays():
    assert names(OnlyId) == ["id"]
