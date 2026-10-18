"""The pre-beta top-level names (``mateu_uidl``, ``mateu_dtos``, ``mateu_core``, ``mateu_fastapi``)
keep importing as deprecated aliases of ``mateu_ui.*`` — one warning naming the new path, and the
SAME module objects (a second copy of a module would mean a second copy of every class)."""

from __future__ import annotations

import importlib
import subprocess
import sys
import textwrap
import warnings
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

ALIASES = {
    "mateu_uidl": "mateu_ui.uidl",
    "mateu_dtos": "mateu_ui.dtos",
    "mateu_core": "mateu_ui.core",
    "mateu_fastapi": "mateu_ui.fastapi",
}


@pytest.fixture
def fresh_aliases():
    """Forget the old names so each test imports them from scratch (the new modules stay)."""

    def forget():
        for name in list(sys.modules):
            if name.split(".")[0] in ALIASES:
                del sys.modules[name]

    forget()
    yield
    forget()


@pytest.mark.parametrize("old,new", sorted(ALIASES.items()))
def test_an_old_name_warns_once_naming_the_new_path_and_is_the_new_module(fresh_aliases, old, new):
    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter("always")
        module = importlib.import_module(old)
        importlib.import_module(old)  # a second import is served from sys.modules: no new warning
    deprecations = [w for w in caught if issubclass(w.category, DeprecationWarning)]
    assert len(deprecations) == 1
    assert f"import '{new}' instead" in str(deprecations[0].message)
    assert module is importlib.import_module(new)


def test_submodule_imports_under_the_old_name_are_the_same_objects(fresh_aliases):
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", DeprecationWarning)
        from mateu_core.mapper import ReflectionMapper as old_mapper
        from mateu_core.sync_handler.dispatch import __name__ as dispatch_name
        import mateu_uidl.components as old_components
        from mateu_dtos import UIIncrement as OldIncrement

    from mateu_ui.core.mapper import ReflectionMapper
    from mateu_ui.dtos import UIIncrement
    from mateu_ui.uidl import components

    assert old_mapper is ReflectionMapper
    assert old_components is components
    assert OldIncrement is UIIncrement
    # the module keeps reporting its canonical name, whichever spelling imported it first
    assert dispatch_name == "mateu_ui.core.sync_handler.dispatch"
    assert sys.modules["mateu_core.mapper"].__spec__.name == "mateu_ui.core.mapper"


def test_an_unknown_submodule_of_an_old_name_is_still_not_found(fresh_aliases):
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", DeprecationWarning)
        with pytest.raises(ModuleNotFoundError):
            importlib.import_module("mateu_core.does_not_exist")


def test_the_warning_points_at_the_importing_line_in_a_fresh_interpreter(tmp_path):
    script = tmp_path / "app.py"
    script.write_text(
        textwrap.dedent(
            """
            import warnings
            warnings.simplefilter("always")
            from mateu_core.mapper import ReflectionMapper  # line 4
            import mateu_ui.core.mapper
            assert ReflectionMapper is mateu_ui.core.mapper.ReflectionMapper
            """
        )
    )
    result = subprocess.run(
        [sys.executable, str(script)],
        capture_output=True,
        text=True,
        cwd=tmp_path,
        env={"PYTHONPATH": str(ROOT), "PATH": ""},
        check=True,
    )
    lines = [line for line in result.stderr.splitlines() if "DeprecationWarning" in line]
    assert len(lines) == 1, result.stderr
    assert lines[0].startswith(f"{script}:4: DeprecationWarning: 'mateu_core' is deprecated")


def test_importing_the_namespace_alone_loads_no_subpackage():
    result = subprocess.run(
        [sys.executable, "-c", "import sys, mateu_ui; print(sorted(m for m in sys.modules if m.startswith('mateu')))"],
        capture_output=True,
        text=True,
        env={"PYTHONPATH": str(ROOT), "PATH": ""},
        check=True,
    )
    assert result.stdout.strip() == "['mateu_ui', 'mateu_ui._version']"
