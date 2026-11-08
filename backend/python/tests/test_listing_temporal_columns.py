"""A date / datetime / time field is a listing column of that dataType (Java's ColumnTypeMapper),
so the renderers write it in the UI's locale instead of the ISO text the row carries."""

import datetime
from typing import Optional

import pytest

from mateu_ui.core.mapper.crud import listing_data_type


@pytest.mark.parametrize(
    "t, expected",
    [
        (datetime.date, "date"),
        (datetime.datetime, "dateTime"),
        (datetime.time, "time"),
        (Optional[datetime.date], "date"),
        (int, "integer"),
        (float, "number"),
        (bool, "bool"),
        (str, "string"),
    ],
)
def test_a_listing_column_keeps_the_type_of_its_field(t, expected):
    assert listing_data_type(t) == expected
