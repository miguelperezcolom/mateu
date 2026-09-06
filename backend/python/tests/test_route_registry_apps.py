"""A deployment can ship a 100%-DSL app — a ``type: UI`` mount declared in ``specs/ui/**`` with NO
Python class — and it is announced by :meth:`RouteRegistry.apps` exactly like a class-based ``@ui``
app. Two producers, one table (authored — the DSL mount — wins on a base-path collision), the same
rule the routes and sources use. The Python mirror of Java's ``RouteRegistryAppsTest`` and .NET's
``RouteRegistryAppsTests``.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

DSL_MOUNT = Path(__file__).resolve().parent / "specs" / "dsl-mount"

from mateu_core.route_registry import AppRef, RouteEntry, RouteRegistry  # noqa: E402


def _registry() -> RouteRegistry:
    return RouteRegistry(str(DSL_MOUNT))


def test_a_class_less_dsl_mount_is_announced_as_an_app():
    apps = _registry().apps()
    back_office = next(a for a in apps if a.route == "back-office")
    assert back_office.is_dsl()  # no Python class backs it
    assert back_office.class_name is None
    assert back_office.definition == "back-office-shell.yaml"


def test_a_dsl_mount_wins_over_a_class_at_the_same_base_path():
    derived = [AppRef("back-office", "legacy.BackOffice", None)]
    apps = _registry().apps(derived)
    back_office = next(a for a in apps if a.route == "back-office")
    assert back_office.is_dsl()  # authored wins — the class is replaced
    assert back_office.class_name is None


def test_a_derived_class_with_no_dsl_mount_survives_the_union():
    derived = [AppRef("shop", "demo.Shop", None)]
    apps = _registry().apps(derived)
    shop = next(a for a in apps if a.route == "shop")
    assert not shop.is_dsl()
    assert shop.class_name == "demo.Shop"


# ── key-level merge of the seeded scopes (mirrors Java's seedsOverrideAtTheKeyLevelNotByDeepMerge) ──


def test_seeds_override_at_the_key_level_not_by_deep_merge():
    # The four scopes merge by KEY, not deeply: a client value for a key wins over the route's seed
    # for that same key OUTRIGHT — nested maps are not merged.
    entry = RouteEntry(route="reports", view_model="X", state={"prefs": {"a": 1}})
    resolved = entry.resolve_params({"prefs": {"b": 2}})
    # the client's `prefs` wins whole — NOT {a:1, b:2}
    assert resolved["prefs"] == {"b": 2}
