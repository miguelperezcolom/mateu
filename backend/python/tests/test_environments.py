"""Deployment environments for the REST source catalogue (the Python mirror of Java's
EnvironmentsSyncTest): the active environment's overrides (baseUrl / url / headers / proxy) are
overlaid on sources.yaml for the wire AND the proxy, literal credential headers are warned about."""

from __future__ import annotations

from urllib.parse import urlparse

import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import environments  # noqa: E402
from mateu_core.rest_source_registry import RestSourceRegistry  # noqa: E402

SOURCES = """
sources:
  - name: orders
    source:
      url: https://api.acme.com/v1/orders?page=${page}
      headers: {X-Tenant: acme}
  - name: payments
    source:
      url: /api/payments
  - name: untouched
    source:
      url: https://keep.acme.com/x
"""


def specs(tmp_path: Path) -> Path:
    (tmp_path / "sources.yaml").write_text(SOURCES)
    (tmp_path / "environments").mkdir()
    (tmp_path / "environments" / "pre.yaml").write_text(
        "sources:\n"
        "  orders:\n    baseUrl: https://pre.api.acme.com\n"
        "    headers: {X-Api-Key: '${secret.ORDERS_KEY}'}\n"
        "  payments: {url: 'https://pre.pay.acme.com/v1/payments', proxy: true}\n"
        "  ghost: {baseUrl: https://nowhere}\n"
    )
    (tmp_path / "pro-env.yaml").write_text(
        "type: Environment\nname: pro\nsources:\n  orders: {baseUrl: 'https://api.acme.com/base/'}\n"
    )
    return tmp_path


def test_rebase_keeps_path_query_and_placeholders():
    assert environments.rebase("https://a.com/v1/x?p=${page}", "https://b.com") == "https://b.com/v1/x?p=${page}"
    assert environments.rebase("https://a.com", "https://b.com/") == "https://b.com"
    assert environments.rebase("/api/x", "https://b.com/base") == "https://b.com/base/api/x"
    assert environments.rebase("api/x", "https://b.com") == "https://b.com/api/x"


def test_no_active_environment_leaves_the_catalogue_as_authored(tmp_path, monkeypatch):
    monkeypatch.delenv("MATEU_ENVIRONMENT", raising=False)
    registry = RestSourceRegistry(str(specs(tmp_path)))
    assert registry.get("orders").source.url == "https://api.acme.com/v1/orders?page=${page}"


def test_the_active_environment_repoints_the_named_sources(tmp_path, monkeypatch):
    monkeypatch.setenv("MATEU_ENVIRONMENT", "pre")
    registry = RestSourceRegistry(str(specs(tmp_path)))
    orders = registry.get("orders").source
    assert orders.url == "https://pre.api.acme.com/v1/orders?page=${page}"
    assert orders.headers == {"X-Tenant": "acme", "X-Api-Key": "${secret.ORDERS_KEY}"}
    payments = registry.get("payments").source
    assert payments.url == "https://pre.pay.acme.com/v1/payments" and payments.proxy is True
    assert registry.get("untouched").source.url == "https://keep.acme.com/x"
    # the wire catalogue (AppMetadata.rest_sources) carries the overlay too
    wire = {e.name: e for e in registry.wire()}
    assert urlparse(wire["orders"].source.url).netloc == "pre.api.acme.com"
    # the proxy resolves a by-ref descriptor against the same catalogue
    from mateu_dtos import RestDataSource

    assert registry.resolve(RestDataSource(ref="payments")).url == "https://pre.pay.acme.com/v1/payments"


def test_a_typed_environment_file_and_an_explicit_name(tmp_path, monkeypatch):
    monkeypatch.setenv("MATEU_ENVIRONMENT", "pre")
    registry = RestSourceRegistry(str(specs(tmp_path)), environment="pro")
    assert registry.get("orders").source.url == "https://api.acme.com/base/v1/orders?page=${page}"


def test_an_unknown_environment_warns_and_changes_nothing(tmp_path, monkeypatch, caplog):
    monkeypatch.setenv("MATEU_ENVIRONMENT", "qa")
    with caplog.at_level(logging.WARNING, logger="mateu.environments"):
        registry = RestSourceRegistry(str(specs(tmp_path)))
        assert urlparse(registry.get("orders").source.url).netloc == "api.acme.com"
    assert any("'qa'" in r.message for r in caplog.records)


def test_a_literal_credential_header_is_warned_about(caplog):
    with caplog.at_level(logging.WARNING, logger="mateu.environments"):
        environments.parse(
            {"type": "Environment", "name": "x", "sources": {"s": {"headers": {"Authorization": "Bearer abc"}}}},
            "x.yaml",
        )
    assert any("never put a secret" in r.message for r in caplog.records)
