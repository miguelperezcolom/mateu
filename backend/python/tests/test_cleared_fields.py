"""A cleared input clears the field on the server (Java's ClearedFieldsHydrationTest): keeping the
initializer made the screen (an empty field) and the server (the old value) disagree."""

from __future__ import annotations

import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, SyncHandler  # noqa: E402


class Booking:
    nights: int | None = 3
    departure: date | None = date(2026, 8, 19)
    note: str = "kept"


def test_a_cleared_number_or_date_is_cleared():
    booking = Booking()
    handler = SyncHandler(MateuRegistry(sys.modules[__name__]))
    handler.bind_state(booking, {"nights": None, "departure": "", "note": ""})
    assert booking.nights is None
    assert booking.departure is None
    # for a str, empty IS a value
    assert booking.note == ""
