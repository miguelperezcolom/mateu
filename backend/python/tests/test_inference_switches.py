"""The global inference switches (mirror of Java's InferenceSwitchesTest): environment variables,
with the class decorator always winning."""

from mateu_core import layout_inference, page_inference
from mateu_core.inference_switches import (
    LAYOUT,
    PAGE,
    layout_inference_enabled,
    page_inference_enabled,
)
from mateu_uidl import auto_layout


class Plain:
    name: str = ""


@auto_layout(False)
class OptedOut:
    name: str = ""


def test_defaults_are_layout_off_and_page_on(monkeypatch):
    monkeypatch.delenv(LAYOUT, raising=False)
    monkeypatch.delenv(PAGE, raising=False)
    assert layout_inference_enabled() is False
    assert page_inference_enabled() is True
    assert layout_inference.enabled(Plain) is False
    assert page_inference.enabled(Plain) is True


def test_the_switches_turn_each_inference_on_and_off(monkeypatch):
    monkeypatch.setenv(LAYOUT, "true")
    monkeypatch.setenv(PAGE, "false")
    assert layout_inference.enabled(Plain) is True
    assert page_inference.enabled(Plain) is False


def test_the_decorator_wins_over_the_switch(monkeypatch):
    monkeypatch.setenv(LAYOUT, "true")
    assert layout_inference.enabled(OptedOut) is False
