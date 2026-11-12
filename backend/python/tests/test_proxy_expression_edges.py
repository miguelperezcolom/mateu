"""The proxied leg's expression subset at its edges: JavaScript's meaning for the corners the shared
corpus (``conformance/client/source-templates.json``) does not reach — coercions, strict/loose
equality, division by zero, the members and methods each type answers, and what is refused."""

import math

import pytest

from mateu_ui.core.proxy_expression import UNDEFINED, Unsupported, evaluate, is_supported, text

STATE = {
    "n": 5,
    "s": "Hello",
    "e": "",
    "l": [1.0, "a", None],
    "o": {"k": "v"},
    "t": True,
    "f": False,
    "nan": math.nan,
    "z": 0,
    "bag": {1, 2},
}


@pytest.mark.parametrize("expression, expected", [
    # strings: escapes, a conditional that looks like optional chaining
    (r"'a\nb\tc\rd\'e'", "a\nb\tc\rd'e"),
    ("state.t ?.5 : 1", 0.5),
    # truthiness and number coercion
    ("!state.nan", True),
    ("!state.e", True),
    ("!state.o", False),
    ("+null", 0.0),
    ("+undefined", math.nan),
    ("false || 'x'", "x"),
    ("+state.t + +state.f", 1.0),
    ("+state.e", 0.0),
    ("+'12'", 12.0),
    ("String(state.o)", "[object Object]"),
    ("String(state.l)", "1,a,"),
    # equality
    ("'a' == 'a'", True),
    ("state.s != 'Hello'", False),
    ("null === 0", False),
    ("null === null", True),
    ("state.t === true", True),
    ("'1' === 1", False),
    ("state.o === state.o", True),
    ("state.l !== state.l", False),
    ("1 == '1'", True),
    # comparison
    ("'abc' < 'abd'", True),
    ("state.nan < 1", False),
    ("1 >= state.nan", False),
    ("2 >= 2", True),
    ("3 <= 2", False),
    ("'b' > 'a'", True),
    # arithmetic
    ("0 || 5", 5.0),
    ("state.z && 1", 0),
    ("7 - 2", 5.0),
    ("1 / 0", math.inf),
    ("-1 / 0", -math.inf),
    ("7 % 4", 3.0),
    # calls in an untaken branch are never run
    ("true ? 1 : String(undefined.x)", 1.0),
    ("JSON.stringify(state.bag)", ""),
    # members
    ("state.l.foo", UNDEFINED),
    ("state.l[1]", "a"),
    ("state.l[7]", UNDEFINED),
    ("state.l.length", 3.0),
    ("state.s.length", 5.0),
    ("state.s[0]", "H"),
    ("state.s.x", UNDEFINED),
    ("state.s[-1]", UNDEFINED),
    ("state.n.x", UNDEFINED),
    ("state.missing?.[0]", UNDEFINED),
    # methods
    ("state.s.slice('x', 2)", "He"),
    ("state.s.slice(3, 1)", ""),
    ("state.s.substring(3, 1)", "el"),
    ("state.s.padStart(8, '*')", "***Hello"),
    ("state.s.padEnd(2)", "Hello"),
    ("state.s.indexOf('l')", 2.0),
    ("state.s.toString()", "Hello"),
    ("state.t.toString()", "true"),
    ("state.nan.toFixed(2)", "NaN"),
    ("state.n.toString()", "5"),
    ("state.l.join('-')", "1-a-"),
    ("state.l.includes('a')", True),
    ("state.l.indexOf(null)", 2.0),
    ("state.l.slice(-2)", ["a", None]),
    ("state.l.slice(2, 1)", []),
    ("state.l.toString()", "1,a,"),
    ("Math.round(state.nan)", math.nan),
    ("Math.min(1, state.nan)", math.nan),
    ("Math.max(1, 3)", 3.0),
])
def test_javascript_meaning(expression, expected):
    value = evaluate(expression, STATE, None)
    if isinstance(expected, float) and math.isnan(expected):
        assert math.isnan(value)
    else:
        assert value == expected


@pytest.mark.parametrize("expression", [
    "'open", "1 +", "(1", "1.2.3", "JSON.parse(state.s)", "JSON(1)", ")", "state.'x'", "(1)(2)", "1 2", "#",
])
def test_outside_the_subset_is_refused(expression):
    with pytest.raises(Unsupported):
        evaluate(expression, STATE, None)
    assert not is_supported(expression)


@pytest.mark.parametrize("expression", [
    "state.s.padStart(20000)", "state.s.join()", "state.n.join()", "state.l.trim()",
    "state.o.toString()", "state.t.trim()", "state.missing.x",
])
def test_runtime_errors_are_not_syntax_errors(expression):
    with pytest.raises(ValueError):
        evaluate(expression, STATE, None)


def test_the_helpers():
    assert repr(UNDEFINED) == "undefined"
    assert text({"a": 1}) == "[object Object]"
    assert is_supported("state.a.b")  # fails at run time with an empty state, but parses
