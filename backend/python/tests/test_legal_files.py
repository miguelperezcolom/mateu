"""The sdist and the wheel carry the project's licence and NOTICE (``license-files`` in pyproject.toml):
Apache-2.0 §4 wants them in every copy. A build cannot reach above backend/python, so the package keeps
its own copies of the repository's files — pinned byte-equal here, so they cannot drift."""

from __future__ import annotations

import tomllib
from pathlib import Path

import pytest

PACKAGE = Path(__file__).resolve().parents[1]


def _repo_root() -> Path | None:
    for parent in PACKAGE.parents:
        if (parent / "LICENSE.txt").is_file() and (parent / "NOTICE").is_file():
            return parent
    return None


ROOT = _repo_root()


@pytest.mark.skipif(ROOT is None, reason="the repository root is not present")
@pytest.mark.parametrize("name", ["LICENSE.txt", "NOTICE"])
def test_the_package_copy_is_the_repository_file(name):
    assert ROOT is not None
    assert (PACKAGE / name).read_bytes() == (ROOT / name).read_bytes(), (
        f"backend/python/{name} drifted from the repository's {name}: cp ../../{name} ."
    )


def test_both_files_are_declared_as_license_files_and_go_into_the_sdist():
    project = tomllib.loads((PACKAGE / "pyproject.toml").read_text(encoding="utf-8"))
    assert project["project"]["license-files"] == ["LICENSE.txt", "NOTICE"]
    sdist = project["tool"]["hatch"]["build"]["targets"]["sdist"]["include"]
    assert "LICENSE.txt" in sdist and "NOTICE" in sdist
