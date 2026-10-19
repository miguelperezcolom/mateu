"""The validator's rules beyond the corpus cases (``conformance/mcp/README.md``): the limits, the root
classification of every file kind, scalar typing, the discriminated walk's edges, suggestions and
JSONPath escaping — over the real ``specs-schema.json`` and, for shapes it does not contain, over a
tiny schema of its own."""

from __future__ import annotations

import pytest

from mateu_ui.core.authoring import UidlValidator, ValidationContext, specs_schema
from mateu_ui.core.authoring import validator as v


def validate(text, context=None):
    return UidlValidator(specs_schema()).validate(text, context)


def codes(report):
    return [i["code"] for i in report["errors"]], [i["code"] for i in report["warnings"]]


def test_empty_and_null_documents():
    assert validate(None)["errors"][0]["code"] == "empty"
    assert validate("~\n")["errors"] == [{"code": "empty", "message": "The YAML is empty.", "path": "$"}]
    assert validate("# just a comment\n")["errors"][0]["code"] == "empty"


def test_too_large():
    report = validate("a: " + "x" * v.MAX_YAML_BYTES)
    assert report["errors"] == [
        {"code": "too_large", "message": "The YAML is larger than the 262144-byte limit.", "path": "$"}
    ]
    assert report["kind"] is None


def test_too_complex_stops_the_walk(monkeypatch):
    monkeypatch.setattr(v, "MAX_NODES", 5)
    report = validate("type: VerticalLayout\ncontent:\n" + "".join("  - type: Text\n    text: x\n" for _ in range(5)))
    assert report["errors"] == [
        {"code": "too_complex", "message": "The YAML is too complex to validate (more than 5 nodes).", "path": "$"}
    ]


def test_a_recursive_alias_is_bounded():
    # an anchor referenced from inside itself: the composed tree is a cycle, the walk is not endless
    looping = "type: Routes\nroutes:\n  - route: x\n    children: &root\n      - {route: y, children: *root}\n"
    assert validate(looping)["errors"][-1]["code"] == "too_complex"


def test_a_multi_document_stream_is_a_syntax_error():
    report = validate("a: 1\n---\nb: 2\n")
    assert codes(report) == (["yaml_syntax"], [])
    assert report["errors"][0]["message"].endswith(".")
    assert report["errors"][0]["line"] >= 1


def test_a_non_mapping_root_is_of_no_known_kind():
    report = validate("just text\n")
    assert report["kind"] is None
    assert report["errors"][0]["code"] == "unknown_kind"
    assert (report["errors"][0]["line"], report["errors"][0]["column"]) == (1, 1)


@pytest.mark.parametrize(
    "text, kind",
    [
        ("type: UI\nbasePath: /x\n", "mount"),
        ("type: Routes\nroutes: []\n", "routes"),
        ("type: Sources\nsources: []\n", "sources"),
        ("type: Actions\nactions: []\n", "actions"),
        ("type: Translations\nmessages: {}\n", "translations"),
        ("type: Environment\nsources: {}\n", "environment"),
        ("type: Types\ntypes: []\n", "types"),
        ("type: Project\nrenderer: vaadin\n", "project"),
        ("content: []\n", "partial"),
        ("components: []\n", "components"),
        ("routes: []\n", "routes"),
        ("actions: []\n", "actions"),
        ("types: []\n", "types"),
        ("messages: {}\n", "translations"),
        ("sources: []\n", "sources"),
        ("sources: {}\n", "environment"),
        ("layoutDelta: {}\n", "envelope"),
        ("type: ~\n", "component"),
        ("type: [a]\n", "component"),
    ],
)
def test_every_kind_is_classified(text, kind):
    assert validate(text)["kind"] == kind


def test_sources_that_are_neither_list_nor_mapping_are_of_no_kind():
    assert validate("sources: x\n")["errors"][0]["code"] == "unknown_kind"


def test_a_root_with_a_null_or_non_scalar_type():
    assert codes(validate("type: ~\n")) == (["missing_type"], [])
    report = validate("type: [a]\n")
    assert report["errors"][0]["code"] == "wrong_type"
    assert report["errors"][0]["path"] == "$.type"
    assert report["errors"][0]["message"] == "Expected a string, found a list."


def test_an_app_shell_is_not_checked_for_undeclared_actions():
    report = validate("type: AppShell\nmenu:\n  - type: RouteLink\n    actionId: nope\n")
    assert "undeclared_action" not in codes(report)[1]


def test_declared_actions_and_the_catalogue_silence_the_action_check():
    page = (
        "type: VerticalLayout\nactions:\n  - id: save\n  - ~\n  - id: ~\ncontent:\n"
        "  - type: Button\n    actionId: save\n  - type: Button\n    actionId: shared\n"
        "  - type: Button\n    actionId: other\n"
    )
    report = validate(page, ValidationContext.of(actions=["shared"]))
    assert [w["message"].split('"')[1] for w in report["warnings"]] == ["other"]
    envelope = "layout:\n  type: Button\n  actionId: x\n"
    assert codes(validate(envelope))[1] == ["undeclared_action"]
    assert codes(validate("modelView: a.B\n" + envelope))[1] == []


def test_a_mapping_where_a_component_goes():
    report = validate("type: VerticalLayout\ncontent:\n  - just text\n")
    assert report["errors"][0] == {
        "code": "wrong_type",
        "message": 'Expected a mapping, found "just text".',
        "path": "$.content[0]",
        "line": 3,
        "column": 5,
    }


def test_a_non_scalar_type_and_an_enum_given_a_mapping():
    report = validate("type: VerticalLayout\ncontent:\n  - type: {a: 1}\n")
    assert report["errors"][0]["path"] == "$.content[0].type"
    report = validate("type: FormField\nid: x\ndataType: {a: 1}\n")
    assert report["errors"][0]["message"] == "Expected a string, found a mapping."


def test_quoted_scalars_are_strings_and_plain_nulls_fit_anything():
    assert validate('type: FormField\nid: x\nrequired: "~"\n')["errors"][0]["code"] == "wrong_type"
    assert validate("type: FormField\nid: x\nrequired: NULL\noptions: ~\n")["valid"] is True
    assert validate("type: FormField\nid: x\nrequired: TRUE\ncolspan: ' 3 '\n")["valid"] is True


def test_numbers_by_their_text():
    assert validate("type: FormField\nid: x\nmin: 1.5e3\nmax: .5\nstep: 2\n")["valid"] is True
    report = validate("type: FormField\nid: x\nmin: 1.2.3\n")
    assert report["errors"][0]["message"] == 'Expected a number, found "1.2.3".'


def test_unknown_keys_of_a_non_scalar_key_are_skipped():
    assert validate("type: FormField\nid: x\n? [a]\n: 1\n")["warnings"] == []


def test_additional_properties_are_walked():
    report = validate("type: Translations\nmessages:\n  hello: [not, a, string]\n")
    assert report["errors"][0]["path"] == "$.messages.hello"


TINY = {
    "oneOf": [{"allOf": [{"$ref": "#/$defs/Component"}, {"type": "object", "properties": {}}]}],
    "$defs": {
        "Component": {"oneOf": [{"$ref": "#/$defs/Tiny"}]},
        "Tiny": {
            "type": "object",
            "properties": {
                "type": {"const": "Tiny"},
                "a": {"type": ["integer", "boolean", "string"]},
                "b": {"type": ["integer", "boolean"]},
                "c": {"enum": [1, True, None]},
                "d": {"type": "weird"},
                "e": {"$ref": "#/$defs/Fam"},
                "f": {"type": "object", "additionalProperties": True},
            },
        },
        "Fam": {"oneOf": [{"$ref": "#/$defs/NoConst"}]},
        "NoConst": {"type": "object", "properties": {"x": {"type": "string"}}},
    },
}


def test_shapes_the_specs_schema_does_not_have():
    tiny = UidlValidator(TINY)
    report = tiny.validate("type: Tiny\nb: x\nc: maybe\nd: q\ne: {type: NoConst, x: y}\nf: {any: 1}\n")
    assert [i["message"] for i in report["errors"]] == [
        'Expected an integer or a boolean, found "x".',
        '"maybe" is not a valid c — use one of: 1, true, null.',
    ]
    assert tiny.validate("type: Tiny\ne: {type: NoKonst}\n")["errors"][0]["message"] == (
        'Unknown Fam type "NoKonst". Did you mean "NoConst"?'
    )
    assert tiny.validate("type: Tiny\ne: {}\n")["errors"][0]["message"] == (
        'Missing "type": a Fam must say which one it is.'
    )
    assert tiny.validate("type: Tiny\n")["valid"] is True


def test_a_schema_without_the_expected_branch_is_a_bug_not_a_report():
    with pytest.raises(RuntimeError):
        UidlValidator({"oneOf": []}).validate("- a\n")


def test_suggestions():
    assert v.suggest("LABEL", ["id", "label"]) == "label"
    assert v.suggest("labl", ["id", "label"]) == "label"
    assert v.suggest("ab", ["xy"]) is None  # distance 2 is not smaller than the length
    assert v.suggest("zzzzzz", ["label"]) is None
    assert v.suggest("x", []) is None
    assert v.levenshtein("kitten", "sitting") == 3
    assert v.levenshtein("", "abc") == 3


def test_json_path_segments_and_quoting():
    assert v.segment("label") == ".label"
    assert v.segment("my-key") == "['my-key']"
    assert v.segment("it's\\") == "['it\\'s\\\\']"
    assert v.quote('a"b\\c') == '"a\\"b\\\\c"'


def test_a_deep_document_does_not_crash():
    deep = "type: VerticalLayout\ncontent:\n" + "".join(
        "  " * i + "  - type: VerticalLayout\n" + "  " * i + "    content:\n" for i in range(400)
    )
    report = validate(deep)
    assert report["kind"] in (None, "component")
    assert isinstance(report["errors"], list)
