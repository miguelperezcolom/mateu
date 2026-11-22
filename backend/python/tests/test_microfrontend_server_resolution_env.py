"""Tests for environment-variable-based remote configuration (issue #1282).

``MATEU_REMOTES=orders,content`` with per-remote
``MATEU_REMOTES_<ID>_BASE_URL`` / ``MATEU_REMOTES_<ID>_TIMEOUT_MS`` /
``MATEU_REMOTES_<ID>_IDENTITY`` variables.

All tests use ``monkeypatch.setenv`` / ``monkeypatch.delenv`` so they never
leak environment state to other tests, and they drive ``remotes_from_env``
directly (unit) or through ``DefaultRemoteRegistry`` (integration).
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi import FastAPI  # noqa: E402

from mateu_ui.core.microfrontends import (  # noqa: E402
    DefaultRemoteRegistry,
    RemoteIdentityStrategies,
    remotes_from_env,
)
from mateu_ui.fastapi import add_mateu  # noqa: E402
from mateu_ui.uidl.remote import (  # noqa: E402
    RemoteCatalogSupplier,
    RemoteDescriptor,
    RemoteIdentityStrategy,
)


# ── helpers ───────────────────────────────────────────────────────────────────


def _registry(*suppliers, remotes=(), env_remotes=None) -> DefaultRemoteRegistry:
    """Build a DefaultRemoteRegistry the same way configure_microfrontends does."""
    return DefaultRemoteRegistry(list(suppliers), remotes, env_remotes=env_remotes)


# ── Test 1: multiple remotes from environment ─────────────────────────────────


def test_multiple_remotes_from_env(monkeypatch):
    """MATEU_REMOTES with two IDs: both remotes are registered."""
    monkeypatch.setenv("MATEU_REMOTES", "orders,content")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_BASE_URL", "https://orders.example.com")
    monkeypatch.setenv("MATEU_REMOTES_CONTENT_BASE_URL", "https://content.example.com")

    remotes = remotes_from_env()

    assert len(remotes) == 2
    ids = {r.id for r in remotes}
    assert ids == {"orders", "content"}
    urls = {r.id: r.base_url for r in remotes}
    assert urls["orders"] == "https://orders.example.com"
    assert urls["content"] == "https://content.example.com"


def test_multiple_remotes_registered_in_registry(monkeypatch):
    """Both env remotes appear when queried through the registry."""
    monkeypatch.setenv("MATEU_REMOTES", "orders,content")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_BASE_URL", "https://orders.example.com")
    monkeypatch.setenv("MATEU_REMOTES_CONTENT_BASE_URL", "https://content.example.com")

    registry = _registry()

    assert registry.by_id("orders").base_url == "https://orders.example.com"
    assert registry.by_id("content").base_url == "https://content.example.com"


# ── Test 2: timeout configuration ────────────────────────────────────────────


def test_timeout_read_correctly(monkeypatch):
    """MATEU_REMOTES_ORDERS_TIMEOUT_MS is parsed into an int and stored."""
    monkeypatch.setenv("MATEU_REMOTES", "orders")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_BASE_URL", "https://orders.example.com")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_TIMEOUT_MS", "5000")

    remotes = remotes_from_env()
    assert len(remotes) == 1
    assert remotes[0].timeout_ms == 5000


def test_timeout_absent_gives_none(monkeypatch):
    """When the timeout variable is absent the descriptor carries None (global default)."""
    monkeypatch.setenv("MATEU_REMOTES", "orders")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_BASE_URL", "https://orders.example.com")
    monkeypatch.delenv("MATEU_REMOTES_ORDERS_TIMEOUT_MS", raising=False)

    remotes = remotes_from_env()
    assert remotes[0].timeout_ms is None


def test_zero_timeout_is_ignored_with_warning(monkeypatch, caplog):
    """MATEU_REMOTES_ORDERS_TIMEOUT_MS=0 is ignored with a warning and timeout_ms is None."""
    monkeypatch.setenv("MATEU_REMOTES", "orders")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_BASE_URL", "https://orders.example.com")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_TIMEOUT_MS", "0")

    with caplog.at_level(logging.WARNING, logger="mateu_ui.microfrontends"):
        remotes = remotes_from_env()

    assert len(remotes) == 1
    assert remotes[0].timeout_ms is None
    assert any("TIMEOUT_MS" in r.getMessage() and "positive integer" in r.getMessage()
               for r in caplog.records)


def test_negative_timeout_is_ignored_with_warning(monkeypatch, caplog):
    """Negative MATEU_REMOTES_ORDERS_TIMEOUT_MS is ignored with a warning and timeout_ms is None."""
    monkeypatch.setenv("MATEU_REMOTES", "orders")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_BASE_URL", "https://orders.example.com")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_TIMEOUT_MS", "-500")

    with caplog.at_level(logging.WARNING, logger="mateu_ui.microfrontends"):
        remotes = remotes_from_env()

    assert len(remotes) == 1
    assert remotes[0].timeout_ms is None
    assert any("TIMEOUT_MS" in r.getMessage() and "positive integer" in r.getMessage()
               for r in caplog.records)


# ── Test 3: identity configuration ───────────────────────────────────────────


def test_identity_read_correctly(monkeypatch):
    """MATEU_REMOTES_ORDERS_IDENTITY is stored verbatim on the descriptor."""
    monkeypatch.setenv("MATEU_REMOTES", "orders")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_BASE_URL", "https://orders.example.com")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_IDENTITY", "forward-authorization")

    remotes = remotes_from_env()
    assert remotes[0].identity == "forward-authorization"


def test_identity_absent_gives_none(monkeypatch):
    """When the identity variable is absent the descriptor carries None."""
    monkeypatch.setenv("MATEU_REMOTES", "orders")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_BASE_URL", "https://orders.example.com")
    monkeypatch.delenv("MATEU_REMOTES_ORDERS_IDENTITY", raising=False)

    remotes = remotes_from_env()
    assert remotes[0].identity is None


def test_valid_identity_strategy_resolves(monkeypatch):
    """Built-in identity strategies resolve successfully against RemoteIdentityStrategies."""
    monkeypatch.setenv("MATEU_REMOTES", "fwd,anon")
    monkeypatch.setenv("MATEU_REMOTES_FWD_BASE_URL", "https://fwd.example.com")
    monkeypatch.setenv("MATEU_REMOTES_FWD_IDENTITY", "forward-authorization")
    monkeypatch.setenv("MATEU_REMOTES_ANON_BASE_URL", "https://anon.example.com")
    monkeypatch.setenv("MATEU_REMOTES_ANON_IDENTITY", "none")

    strategies = RemoteIdentityStrategies()
    remotes = remotes_from_env()
    by_id = {r.id: r for r in remotes}

    assert strategies.of(by_id["fwd"]).name() == "forward-authorization"
    assert strategies.of(by_id["anon"]).name() == "none"


def test_invalid_identity_strategy_raises_on_resolution(monkeypatch):
    """An unknown identity strategy raises ValueError at resolution time (existing validation)."""
    monkeypatch.setenv("MATEU_REMOTES", "orders")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_BASE_URL", "https://orders.example.com")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_IDENTITY", "orders-service")

    strategies = RemoteIdentityStrategies()
    remotes = remotes_from_env()
    assert remotes[0].identity == "orders-service"

    with pytest.raises(ValueError, match=r"Remote orders names the identity strategy 'orders-service'"):
        strategies.of(remotes[0])


# ── Test 4: hyphen-to-underscore ID mapping ───────────────────────────────────


def test_hyphen_in_id_maps_to_underscore_in_env_var_name(monkeypatch):
    """order-service → MATEU_REMOTES_ORDER_SERVICE_BASE_URL etc."""
    monkeypatch.setenv("MATEU_REMOTES", "order-service")
    monkeypatch.setenv("MATEU_REMOTES_ORDER_SERVICE_BASE_URL", "https://orders.example.com")
    monkeypatch.setenv("MATEU_REMOTES_ORDER_SERVICE_TIMEOUT_MS", "5000")
    monkeypatch.setenv("MATEU_REMOTES_ORDER_SERVICE_IDENTITY", "forward-authorization")

    remotes = remotes_from_env()
    assert len(remotes) == 1
    r = remotes[0]
    assert r.id == "order-service"
    assert r.base_url == "https://orders.example.com"
    assert r.timeout_ms == 5000
    assert r.identity == "forward-authorization"


# ── Test 5: explicit remote takes precedence over env remote ──────────────────


def test_explicit_remote_wins_over_env_remote(monkeypatch):
    """An add_mateu(remotes=[...]) descriptor overwrites the env one with the same id."""
    monkeypatch.setenv("MATEU_REMOTES", "orders")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_BASE_URL", "https://environment-orders.example.com")

    explicit = RemoteDescriptor("orders", "https://application-orders.example.com")
    registry = _registry(remotes=(explicit,))

    assert registry.by_id("orders").base_url == "https://application-orders.example.com"


# ── Test 6: RemoteCatalogSupplier precedence ──────────────────────────────────


def test_supplier_remote_wins_over_env_remote(monkeypatch):
    """A RemoteCatalogSupplier-provided remote with the same id wins over the env remote."""
    monkeypatch.setenv("MATEU_REMOTES", "orders")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_BASE_URL", "https://environment-orders.example.com")

    class SuppliedOrders(RemoteCatalogSupplier):
        def remotes(self):
            return [RemoteDescriptor("orders", "https://supplier-orders.example.com")]

    registry = _registry(SuppliedOrders())
    assert registry.by_id("orders").base_url == "https://supplier-orders.example.com"


def test_explicit_beats_supplier_beats_env(monkeypatch):
    """Full precedence chain: explicit > supplier > env."""
    monkeypatch.setenv("MATEU_REMOTES", "orders")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_BASE_URL", "https://env-orders.example.com")

    class Supplier(RemoteCatalogSupplier):
        def remotes(self):
            return [RemoteDescriptor("orders", "https://supplier-orders.example.com")]

    explicit = RemoteDescriptor("orders", "https://explicit-orders.example.com")
    registry = _registry(Supplier(), remotes=(explicit,))

    assert registry.by_id("orders").base_url == "https://explicit-orders.example.com"


# ── Test 7: missing base URL ──────────────────────────────────────────────────


def test_missing_base_url_skips_remote_with_warning(monkeypatch, caplog):
    """A remote ID with no matching base URL variable is skipped, with a warning logged."""
    monkeypatch.setenv("MATEU_REMOTES", "orders,content")
    monkeypatch.delenv("MATEU_REMOTES_ORDERS_BASE_URL", raising=False)
    monkeypatch.setenv("MATEU_REMOTES_CONTENT_BASE_URL", "https://content.example.com")

    with caplog.at_level(logging.WARNING, logger="mateu_ui.microfrontends"):
        remotes = remotes_from_env()

    assert len(remotes) == 1
    assert remotes[0].id == "content"
    assert any("orders" in r.getMessage() and "skipped" in r.getMessage()
               for r in caplog.records)


def test_empty_base_url_skips_remote(monkeypatch, caplog):
    """An explicitly empty MATEU_REMOTES_<ID>_BASE_URL is treated as missing."""
    monkeypatch.setenv("MATEU_REMOTES", "orders")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_BASE_URL", "")

    with caplog.at_level(logging.WARNING, logger="mateu_ui.microfrontends"):
        remotes = remotes_from_env()

    assert remotes == []
    assert any("orders" in r.getMessage() for r in caplog.records)


# ── Test 8: invalid base URL ──────────────────────────────────────────────────


def test_invalid_base_url_is_refused_by_registry_with_warning(monkeypatch, caplog):
    """An invalid URL reaches _register and is logged as a warning (existing behaviour)."""
    monkeypatch.setenv("MATEU_REMOTES", "orders")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_BASE_URL", "not-a-url")

    with caplog.at_level(logging.WARNING, logger="mateu_ui.microfrontends"):
        registry = _registry()

    assert registry.by_id("orders") is None
    assert any("orders" in r.getMessage() for r in caplog.records)


# ── Test 9: mixed valid and invalid remotes ───────────────────────────────────


def test_valid_remotes_registered_even_when_others_invalid(monkeypatch, caplog):
    """Valid remotes in MATEU_REMOTES register even when neighbouring entries are bad."""
    monkeypatch.setenv("MATEU_REMOTES", "bad,good")
    monkeypatch.setenv("MATEU_REMOTES_BAD_BASE_URL", "not-a-url")
    monkeypatch.setenv("MATEU_REMOTES_GOOD_BASE_URL", "https://good.example.com")

    with caplog.at_level(logging.WARNING, logger="mateu_ui.microfrontends"):
        registry = _registry()

    assert registry.by_id("bad") is None
    assert registry.by_id("good") is not None
    assert registry.by_id("good").base_url == "https://good.example.com"


def test_missing_url_and_valid_url_in_same_list(monkeypatch, caplog):
    """Missing-URL entries skip cleanly while valid entries still land."""
    monkeypatch.setenv("MATEU_REMOTES", "no-url,content")
    monkeypatch.delenv("MATEU_REMOTES_NO_URL_BASE_URL", raising=False)
    monkeypatch.setenv("MATEU_REMOTES_CONTENT_BASE_URL", "https://content.example.com")

    with caplog.at_level(logging.WARNING, logger="mateu_ui.microfrontends"):
        registry = _registry()

    assert registry.by_id("no-url") is None
    assert registry.by_id("content").base_url == "https://content.example.com"


# ── Test 10: empty and whitespace entries ─────────────────────────────────────


def test_empty_and_whitespace_entries_in_mateu_remotes_are_skipped(monkeypatch):
    """'orders, ,content,' — empty items between commas produce no invalid descriptors."""
    monkeypatch.setenv("MATEU_REMOTES", "orders, ,content,")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_BASE_URL", "https://orders.example.com")
    monkeypatch.setenv("MATEU_REMOTES_CONTENT_BASE_URL", "https://content.example.com")

    remotes = remotes_from_env()

    assert len(remotes) == 2
    assert {r.id for r in remotes} == {"orders", "content"}


def test_mateu_remotes_blank_gives_no_remotes(monkeypatch):
    """When MATEU_REMOTES is blank the function returns an empty list."""
    monkeypatch.setenv("MATEU_REMOTES", "")

    assert remotes_from_env() == []


def test_mateu_remotes_absent_gives_no_remotes(monkeypatch):
    """When MATEU_REMOTES is not set the function returns an empty list."""
    monkeypatch.delenv("MATEU_REMOTES", raising=False)

    assert remotes_from_env() == []


# ── Additional regression: malformed timeout does not block valid remote ───────


def test_malformed_timeout_is_ignored_and_remote_is_still_registered(monkeypatch, caplog):
    """A non-integer TIMEOUT_MS logs a warning but the remote is still registered."""
    monkeypatch.setenv("MATEU_REMOTES", "orders")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_BASE_URL", "https://orders.example.com")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_TIMEOUT_MS", "not-a-number")

    with caplog.at_level(logging.WARNING, logger="mateu_ui.microfrontends"):
        remotes = remotes_from_env()

    assert len(remotes) == 1
    assert remotes[0].base_url == "https://orders.example.com"
    assert remotes[0].timeout_ms is None
    assert any("TIMEOUT_MS" in r.getMessage() for r in caplog.records)


# ── Regression: programmatic registration still works ─────────────────────────


def test_programmatic_remotes_still_work_without_env(monkeypatch):
    """Existing add_mateu(remotes=[...]) behaviour is not broken."""
    monkeypatch.delenv("MATEU_REMOTES", raising=False)

    explicit = RemoteDescriptor("orders", "https://orders.example.com", 300)
    registry = _registry(remotes=(explicit,))

    assert registry.by_id("orders").base_url == "https://orders.example.com"
    assert registry.by_id("orders").timeout_ms == 300


def test_supplier_still_works_without_env(monkeypatch):
    """Existing RemoteCatalogSupplier behaviour is not broken."""
    monkeypatch.delenv("MATEU_REMOTES", raising=False)

    class MySupplier(RemoteCatalogSupplier):
        def remotes(self):
            return [RemoteDescriptor("svc", "https://svc.example.com")]

    registry = _registry(MySupplier())
    assert registry.by_id("svc").base_url == "https://svc.example.com"


# ── Regression: existing explicit-beats-supplier rule unchanged ───────────────


def test_existing_explicit_beats_supplier_rule_is_preserved(monkeypatch):
    """Existing test: an explicit remote wins over a supplier one with the same id."""
    monkeypatch.delenv("MATEU_REMOTES", raising=False)

    class Sup(RemoteCatalogSupplier):
        def remotes(self):
            return [RemoteDescriptor("orders", "https://supplier.example.com")]

    explicit = RemoteDescriptor("orders", "https://explicit.example.com", 5)
    registry = _registry(Sup(), remotes=(explicit,))

    assert registry.by_id("orders").base_url == "https://explicit.example.com"


# ── env_remotes=() suppresses environment reads (test isolation) ──────────────


def test_env_remotes_empty_list_suppresses_environment_reads(monkeypatch):
    """Passing env_remotes=() bypasses os.environ even when MATEU_REMOTES is set."""
    monkeypatch.setenv("MATEU_REMOTES", "orders")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_BASE_URL", "https://orders.example.com")

    registry = _registry(env_remotes=())
    assert registry.by_id("orders") is None


# ── all three fields together ─────────────────────────────────────────────────


def test_full_remote_configuration_all_fields(monkeypatch):
    """All three per-remote variables are read and stored correctly together."""
    monkeypatch.setenv("MATEU_REMOTES", "orders,content")

    monkeypatch.setenv("MATEU_REMOTES_ORDERS_BASE_URL", "https://orders.example.com")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_TIMEOUT_MS", "5000")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_IDENTITY", "forward-authorization")

    monkeypatch.setenv("MATEU_REMOTES_CONTENT_BASE_URL", "https://content.example.com")
    monkeypatch.setenv("MATEU_REMOTES_CONTENT_TIMEOUT_MS", "3000")
    monkeypatch.setenv("MATEU_REMOTES_CONTENT_IDENTITY", "none")

    remotes = remotes_from_env()
    by_id = {r.id: r for r in remotes}

    assert by_id["orders"].base_url == "https://orders.example.com"
    assert by_id["orders"].timeout_ms == 5000
    assert by_id["orders"].identity == "forward-authorization"

    assert by_id["content"].base_url == "https://content.example.com"
    assert by_id["content"].timeout_ms == 3000
    assert by_id["content"].identity == "none"


# ── integration: add_mateu(...) application setup ─────────────────────────────


def test_add_mateu_registers_and_resolves_env_remotes(monkeypatch):
    """An environment-configured remote is registered through add_mateu() and resolves correctly."""
    monkeypatch.setenv("MATEU_REMOTES", "orders")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_BASE_URL", "https://orders.example.com")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_TIMEOUT_MS", "5000")
    monkeypatch.setenv("MATEU_REMOTES_ORDERS_IDENTITY", "forward-authorization")

    app = FastAPI()
    handler = add_mateu(app)

    registry = handler.microfrontends.registry
    remote = registry.by_id("orders")
    assert remote is not None
    assert remote.id == "orders"
    assert remote.base_url == "https://orders.example.com"
    assert remote.timeout_ms == 5000
    assert remote.identity == "forward-authorization"

    # URL-based resolution
    resolved = registry.for_url("https://orders.example.com/api/v1/orders")
    assert resolved is not None
    assert resolved.id == "orders"
    assert resolved.base_url == "https://orders.example.com"

    # Strategy resolution
    strategy = handler.microfrontends.identities.of(remote)
    assert strategy.name() == "forward-authorization"


# ── path-based base URL support ────────────────────────────────────────────────


def test_path_based_base_url_registered_and_resolved(monkeypatch):
    """A path-based base URL (/_content-hub) is accepted, preserved, and resolves correctly."""
    monkeypatch.setenv("MATEU_REMOTES", "content-hub")
    monkeypatch.setenv("MATEU_REMOTES_CONTENT_HUB_BASE_URL", "/_content-hub")
    monkeypatch.setenv("MATEU_REMOTES_CONTENT_HUB_TIMEOUT_MS", "2500")
    monkeypatch.setenv("MATEU_REMOTES_CONTENT_HUB_IDENTITY", "none")

    remotes = remotes_from_env()
    assert len(remotes) == 1
    remote = remotes[0]
    assert remote.id == "content-hub"
    assert remote.base_url == "/_content-hub"
    assert remote.timeout_ms == 2500
    assert remote.identity == "none"

    registry = _registry()
    registered = registry.by_id("content-hub")
    assert registered is not None
    assert registered.base_url == "/_content-hub"
    assert registered.timeout_ms == 2500

    # Server-side remote resolution works correctly for path-based URL and sub-paths
    assert registry.for_url("/_content-hub") == registered
    assert registry.for_url("/_content-hub/slots/header") == registered
    assert registry.for_url("/_other") is None

    # Also verify through add_mateu() setup
    app = FastAPI()
    handler = add_mateu(app, self_base_url="https://app.example.com")
    app_registry = handler.microfrontends.registry
    app_remote = app_registry.by_id("content-hub")
    assert app_remote is not None
    assert app_remote.base_url == "/_content-hub"
    assert app_registry.for_url("/_content-hub/slots/header") == app_remote
