"""The proxied leg of the source-template corpus (conformance/client/source-templates.json): the
Python server must send the URL the browser would — the same corpus Java, .NET, libs/mateu and
Redwood run."""

import json
from pathlib import Path

import pytest

from mateu_ui.core import proxy_expression
from mateu_ui.core.url_template import interpolate_url, resolve_expression, template_text

CORPUS = json.loads(
    (Path(__file__).resolve().parents[3] / "conformance" / "client" / "source-templates.json").read_text()
)


def _url(template: str, state: dict) -> str:
    return interpolate_url(template, lambda expr: template_text(resolve_expression(expr, state, lambda _k: None)))


@pytest.mark.parametrize("case", CORPUS["cases"], ids=[c["name"] for c in CORPUS["cases"]])
def test_the_proxied_leg_sends_what_the_browser_would(case):
    assert _url(case["template"], case["state"]) == case["expected"]


def test_an_expression_outside_the_subset_renders_empty_and_is_flagged():
    assert proxy_expression.is_supported("(state.page ?? 0) * 20")
    assert not proxy_expression.is_supported("state.items.map(i => i.id)")
    assert _url("https://api.example.com/x?ids=${state.items.map(i => i.id)}", {"items": []}) == (
        "https://api.example.com/x?ids="
    )


def test_secrets_only_through_the_secret_root_and_data_is_browser_only():
    assert template_text(resolve_expression("secret.API_KEY ?? 'none'", {}, lambda k: "s3cret" + k)) == "s3cretAPI_KEY"
    assert template_text(resolve_expression("data.id", {"id": 1}, lambda _k: None)) == ""


def _ev(expression, state=None):
    return proxy_expression.text(proxy_expression.evaluate(expression, state or {}, None))


def test_javascript_semantics_of_the_subset():
    assert _ev("1 + 2 * 3") == "7"
    assert _ev("'a' + 1") == "a1"
    assert _ev("state.x ? 'y' : 'n'", {"x": 0}) == "n"
    assert _ev("!state.x") == "true"
    assert _ev("state.l.length", {"l": [1, 2]}) == "2"
    assert _ev("JSON.stringify(state.o)", {"o": {"a": 1}}) == '{"a":1}'
    assert _ev("encodeURIComponent('a b!')") == "a%20b!"
    assert _ev("10 / 4") == "2.5"
    assert _ev("null == undefined") == "true"
