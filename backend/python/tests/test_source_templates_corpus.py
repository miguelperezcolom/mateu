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


_S = {"s": "Apollo", "n": 1, "tags": ["a", "b", "c"], "price": -2.345}


@pytest.mark.parametrize(
    "expression,expected",
    [
        ("1e3", "1000"),
        ("2.5E-1 * 4", "1"),
        ("state.n === 1", "true"),
        ("state.n === '1'", "false"),
        ("state.n !== '1'", "true"),
        ("state.n == '1'", "true"),
        ("null === undefined", "false"),
        ("state.missing === undefined", "true"),
        ("true === 1", "false"),
        ("state.tags === state.tags", "true"),
        ("state.s[0]", "A"),
        ("state.s[99]", ""),
        ("state.s.toLowerCase()", "apollo"),
        ("state.s.toUpperCase()", "APOLLO"),
        ("'  x  '.trim()", "x"),
        ("state.s.includes('pol')", "true"),
        ("state.s.startsWith('Ap') && !state.s.endsWith('x')", "true"),
        ("state.s.indexOf('o')", "2"),
        ("state.s.slice(1, 3)", "po"),
        ("state.s.slice(-2)", "lo"),
        ("state.s.slice(4, 1)", ""),
        ("state.s.substring(3, 1)", "po"),
        ("state.s.substring(2)", "ollo"),
        ("'7'.padStart(3, '0')", "007"),
        ("'7'.padEnd(3)", "7  "),
        ("'ab'.padStart(5, 'xy')", "xyxab"),
        ("'abc'.padStart(2)", "abc"),
        ("state.s.toString()", "Apollo"),
        ("state.price.toFixed(2)", "-2.35"),
        ("(1.005).toFixed(2)", "1.00"),
        ("(3).toFixed()", "3"),
        ("state.n.toString()", "1"),
        ("true.toString()", "true"),
        ("state.tags.join('|')", "a|b|c"),
        ("state.tags.join()", "a,b,c"),
        ("state.tags.includes('b')", "true"),
        ("state.tags.indexOf('c')", "2"),
        ("state.tags.indexOf('z')", "-1"),
        ("state.tags.slice(1)", "b,c"),
        ("state.tags.slice(2, 1)", ""),
        ("state.tags.toString()", "a,b,c"),
        ("Math.round(2.5) + Math.round(-2.5)", "1"),
        ("Math.floor(2.7) + Math.ceil(2.1) + Math.abs(-1)", "6"),
        ("Math.max(state.missing ?? 0, 1)", "1"),
        ("Math.min(3, 1, 2)", "1"),
        ("Math.max(1, 'x')", "NaN"),
        ("Math.max()", "-Infinity"),
        ("state.missing?.toLowerCase() ?? 'none'", "none"),
        ("state.n ? 'y' : state.missing.toLowerCase()", "y"),
    ],
)
def test_the_browser_subset_beyond_the_corpus(expression, expected):
    assert _ev(expression, _S) == expected


@pytest.mark.parametrize(
    "expression", ["state.s.split(',')", "state.s.replace('a', 'b')", "Math.random()", "state.s.slice(1 2)"]
)
def test_a_call_outside_the_allow_list_is_unsupported(expression):
    assert not proxy_expression.is_supported(expression)
    with pytest.raises(proxy_expression.Unsupported):
        proxy_expression.evaluate(expression, _S, None)


@pytest.mark.parametrize("expression", ["state.missing.toLowerCase()", "true.trim()", "state.n.toFixed(101)"])
def test_a_method_of_nothing_or_of_the_wrong_value_is_a_runtime_error(expression):
    with pytest.raises(ValueError):
        proxy_expression.evaluate(expression, _S, None)
