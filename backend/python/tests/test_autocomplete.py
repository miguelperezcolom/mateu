"""Java's AutocompleteSyncTest in the port (WCAG 1.3.5 Identify Input Purpose): a field about the
user carries its HTML autocomplete token — declared with Autocomplete(), inferred only for an
editable email field."""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Annotated

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler
from mateu_ui.uidl import Autocomplete, Stereotype, ui
from mateu_ui.uidl import components as fluent
from mateu_ui.core.input_purpose import input_purpose


@ui("/autocomplete")
@dataclass
class SignUpForm:
    first_name: Annotated[str, Autocomplete("given-name")] = ""
    phone: Annotated[str, Autocomplete("tel")] = ""
    email: Annotated[str, Stereotype("email")] = ""
    referrer_email: Annotated[str, Stereotype("email"), Autocomplete("off")] = ""
    notes: str = ""


def _fields(node, out):
    if isinstance(node, dict):
        if node.get("type") == "FormField":
            out[node.get("fieldId")] = node
        for v in node.values():
            _fields(v, out)
    elif isinstance(node, list):
        for v in node:
            _fields(v, out)
    return out


def test_a_declared_purpose_travels_and_an_email_field_is_inferred():
    inc = SyncHandler(MateuRegistry(SignUpForm)).handle(RunActionRq(route="/autocomplete", consumedRoute="/autocomplete"))
    fields = _fields(json.loads(inc.model_dump_json(by_alias=True, exclude_none=True)), {})
    assert fields["firstName"]["autocomplete"] == "given-name"
    assert fields["phone"]["autocomplete"] == "tel"
    assert fields["email"]["autocomplete"] == "email"
    assert fields["referrerEmail"]["autocomplete"] == "off"
    assert "autocomplete" not in fields["notes"]


def test_the_rule_matches_java():
    assert input_purpose(None, "email", False) == "email"
    assert input_purpose(None, "email", True) is None
    assert input_purpose(" tel ", "regular", True) == "tel"
    assert fluent.FormField(field_id="x", autocomplete="postal-code").autocomplete == "postal-code"
