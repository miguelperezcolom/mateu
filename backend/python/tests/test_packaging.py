"""The PyPI package: version translation from the release tag and the package layout."""

from __future__ import annotations

import importlib
import sys
import tomllib
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import set_version  # noqa: E402

PACKAGES = ["mateu_uidl", "mateu_dtos", "mateu_core", "mateu_fastapi"]


@pytest.mark.parametrize(
    "tag,expected",
    [
        ("v3.0-alpha.406", "3.0.0a406"),
        ("3.0-alpha.1", "3.0.0a1"),
        ("v3.0-beta.2", "3.0.0b2"),
        ("v3.0-rc.1", "3.0.0rc1"),
        ("v3.0", "3.0.0"),
        ("v3.0.1", "3.0.1"),
        ("v3.1.0", "3.1.0"),
    ],
)
def test_release_tags_translate_to_pep440(tag, expected):
    assert set_version.pep440(tag) == expected


def test_a_non_release_tag_is_refused():
    with pytest.raises(ValueError):
        set_version.pep440("mateu-desktop-1.2")


def test_stamp_rewrites_only_the_version_line(tmp_path):
    f = tmp_path / "_version.py"
    f.write_text('"""doc"""\n\n__version__ = "3.0.0.dev0"\n')
    assert set_version.stamp("v3.0-alpha.406", f) == "3.0.0a406"
    assert f.read_text() == '"""doc"""\n\n__version__ = "3.0.0a406"\n'


def test_the_wheel_ships_exactly_the_four_packages_typed():
    meta = tomllib.loads((ROOT / "pyproject.toml").read_text())
    assert meta["project"]["name"] == "mateu-ui"
    assert meta["tool"]["hatch"]["build"]["targets"]["wheel"]["packages"] == PACKAGES
    for pkg in PACKAGES:
        assert (ROOT / pkg / "py.typed").is_file(), f"{pkg} is not marked typed"
        importlib.import_module(pkg)


def test_pydantic_is_capped_below_the_next_major():
    deps = tomllib.loads((ROOT / "pyproject.toml").read_text())["project"]["dependencies"]
    assert any(d.startswith("pydantic") and "<3" in d for d in deps)


def test_the_version_is_exposed():
    import mateu_core

    assert mateu_core.__version__
