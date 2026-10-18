"""A surface that names a catalogue source by ``ref`` must not carry the decorator's DEFAULTS: what
a surface declares wins over the entry, so a defaulted ``value_path="value"`` would override the
entry's ``code`` and every option would read an absent key (Java's
``FieldMetadataExtractor.getOptionsSource``, .NET's ``RestOptionsOf``)."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core.mapper.fields import FieldMapperMixin  # noqa: E402
from mateu_ui.core.reflection import view_fields  # noqa: E402
from mateu_ui.uidl import RestOptions, rest_action, rest_data, rest_listing  # noqa: E402


class Shipping:
    by_ref: Annotated[str | None, RestOptions(source="currencies")] = None
    overridden: Annotated[str | None, RestOptions(source="currencies", label_path="title")] = None
    inline: Annotated[str | None, RestOptions(url="/api/c")] = None


def _options(name: str):
    field = next(f for f in view_fields(Shipping) if f.name == name)
    return FieldMapperMixin._rest_options(field)


def test_a_by_ref_field_carries_only_the_name():
    src = _options("by_ref")
    assert src.ref == "currencies"
    assert (src.method, src.value_path, src.label_path) == ("", "", "")


def test_an_explicit_value_still_overrides_the_entry():
    src = _options("overridden")
    assert (src.ref, src.label_path, src.value_path) == ("currencies", "title", "")


def test_an_inline_request_keeps_its_defaults():
    src = _options("inline")
    assert (src.method, src.value_path, src.label_path) == ("GET", "value", "label")


@rest_listing(source="orders")
@rest_data(source="profile")
class ByRefScreen:
    @rest_action(source="approve")
    def approve(self):
        return None


def test_by_ref_listing_data_and_action_leave_the_method_to_the_entry():
    assert FieldMapperMixin._rest_listing(ByRefScreen).method == ""
    assert FieldMapperMixin._rest_data(ByRefScreen).source.method == ""
    assert FieldMapperMixin._rest_action(ByRefScreen.approve).source.method == ""


def test_an_inline_action_keeps_its_declared_method():
    @rest_action(url="/api/x", method="PUT")
    def act():
        return None

    assert FieldMapperMixin._rest_action(act).source.method == "PUT"
