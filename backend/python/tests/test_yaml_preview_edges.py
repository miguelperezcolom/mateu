"""How the Python YAML loader reads what an author writes by hand: malformed YAML, a bare list
at the top, horizontal rows, option shorthands, generic components with enums and dates, and a
value the component refuses (shown as unsupported instead of crashing the page)."""

from datetime import date

from mateu_ui.core.partial_registry import PartialRegistry
from mateu_ui.core.yaml_preview import build_from_yaml, parse_spec_with_delta
from mateu_ui.uidl import BannerTheme
from mateu_ui.uidl import components as fluent
from mateu_ui.uidl.components import Gantt, MetricCard, MetricTrend


def test_malformed_yaml_yields_nothing_instead_of_raising():
    assert parse_spec_with_delta("a: [unclosed") == (None, None, None)


def test_a_partial_of_several_components_in_a_single_slot_stacks_them():
    partials = PartialRegistry()
    partials.register("pair", [{"type": "Text", "text": "one"}, {"type": "Text", "text": "two"}])
    _, layout, _ = parse_spec_with_delta("layout:\n  type: Partial\n  ref: pair\n", partials)
    assert isinstance(layout, fluent.VerticalLayout)
    assert [c.text for c in layout.content] == ["one", "two"]


def test_an_empty_or_scalar_layout_is_no_component():
    assert parse_spec_with_delta("layout: []\n")[1] is None
    assert parse_spec_with_delta("layout: 42\n")[1] is None


def test_a_horizontal_layout_spaces_by_default_and_options_accept_bare_values():
    tree = build_from_yaml(
        "type: HorizontalLayout\n"
        "content:\n"
        "  - type: FormField\n    id: size\n    stereotype: select\n    options: [S, M, {value: L, label: Large}, null]\n"
        "  - type: Text\n    text: x\n"
        "  - not-a-node\n"
    )
    assert isinstance(tree, fluent.HorizontalLayout) and tree.spacing is True
    field = tree.content[0]
    assert field.options == (("S", "S"), ("M", "M"), ("L", "Large"))


def test_generic_components_read_enums_dates_and_nested_value_objects():
    card = build_from_yaml("type: MetricCard\ntitle: Sales\ntrend: " + list(MetricTrend)[0].name + "\nvalue: 3\n")
    assert isinstance(card, MetricCard)
    assert card.trend is list(MetricTrend)[0] and card.value == "3"
    gantt = build_from_yaml(
        "type: Gantt\ntasks:\n  - id: t1\n    start: 2026-05-01\n    end: '2026-05-03'\n    progress: '50'\n"
    )
    assert isinstance(gantt, Gantt)
    task = gantt.tasks[0]
    assert (task.start, task.end, task.progress) == (date(2026, 5, 1), date(2026, 5, 3), 50.0)


def test_an_unknown_enum_value_is_kept_as_authored():
    card = build_from_yaml("type: MetricCard\ntrend: sideways\n")
    assert card.trend == "sideways"


def test_a_value_the_component_refuses_renders_as_unsupported():
    tree = build_from_yaml("type: Gantt\ntasks:\n  - start: not-a-date\n")
    assert isinstance(tree, fluent.Text) and tree.text == "Unsupported component: Gantt"


def test_a_form_header_reads_toolbar_buttons_and_unknown_banner_themes_fall_back_to_info():
    form = build_from_yaml(
        "type: Form\ntitle: T\n"
        "toolbar:\n  - label: Save\n    actionId: save\n    buttonStyle: primary\n"
        "banners:\n  - theme: neon\n    title: Hi\n  - theme: warning\n"
        "recordSwitcher:\n  type: context\n  optionsSource: hotels\n"
    )
    assert [(b.label, b.action_id, b.button_style) for b in form.toolbar] == [("Save", "save", "primary")]
    assert [b.theme for b in form.banners] == [BannerTheme.INFO, BannerTheme.WARNING]
    assert form.record_switcher.options_source.ref == "hotels"
