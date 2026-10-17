"""M-A6: HeaderBadge had only ``color`` and showed a bool as a "True"/"False" chip; Java's
``@BadgeInHeader`` shows its label while true, nothing while false, and never renders the field
in the form body."""

import json
from typing import Annotated

from mateu_core.mapper import ReflectionMapper
from mateu_uidl import BadgeInHeader, HeaderBadge, Label, ui


@ui("/badged-booking")
class BadgedBooking:
    vip: Annotated[bool, HeaderBadge(color="success", label="VIP")] = True
    overbooked: Annotated[bool, BadgeInHeader(color="warning")] = True
    late_checkout: Annotated[bool, HeaderBadge(), Label("Late check-out")] = True
    cancelled: Annotated[bool, HeaderBadge(color="error")] = False
    status: Annotated[str, HeaderBadge()] = "Confirmed"
    empty: Annotated[str | None, HeaderBadge()] = None
    guest: str = "Ana"


def test_a_bool_badge_shows_its_label_while_true_and_nothing_while_false():
    badges = [(b.text, b.color) for b in ReflectionMapper().badges(BadgedBooking, BadgedBooking())]
    assert badges == [
        ("VIP", "success"),
        ("Overbooked", "warning"),
        ("Late check-out", "normal"),
        ("Confirmed", "normal"),
    ]


def test_header_badge_fields_are_not_form_fields():
    mapper = ReflectionMapper()
    rendered = json.dumps(
        mapper.map_view(BadgedBooking, BadgedBooking(), "/badged-booking").model_dump(by_alias=True)
    )
    assert '"fieldId": "guest"' in rendered
    assert '"fieldId": "vip"' not in rendered
    assert '"fieldId": "status"' not in rendered
