"""Proxy-mode REST fetches (__restfetch__): the declared source, ${secret.X} injection, the server-side call (Java's RunActionUseCase.resolveSecret / RestSourceResolver)."""

from __future__ import annotations

import json
import os
import re
from typing import Any
import urllib.request

from mateu_dtos import UIIncrement

from ..url_template import interpolate_url, secret_env_name
from ._base import MixinBase
from ._common import (
    log,
    RunActionRq,
)


class ProxyHandlerMixin(MixinBase):
    # ── Proxy-mode external fetch (__restfetch__) ───────────────────────────────
    def _rest_fetch_response(self, rq: RunActionRq) -> UIIncrement:
        """Resolve the DECLARED source of the routed view by _sourceKind/_sourceId, interpolate
        ${state.x}/${secret.X}, fetch server-side and return the raw JSON on app_data._restfetch
        (an empty object on any failure — the renderer maps it as in direct mode)."""
        json_obj: Any = {}
        cls = self.registry.resolve(rq.server_side_type, rq.route)
        if cls is not None:
            kind = rq.parameters.get("_sourceKind")
            source_id = rq.parameters.get("_sourceId")
            instance = None
            if isinstance(cls, type):
                try:
                    instance = cls()
                    self.bind_state(instance, rq.component_state or {})
                except Exception as e:  # noqa: BLE001 - the annotations still answer
                    log.warning("__restfetch__: %s could not be instantiated (%s)", cls, e)
                    instance = None
            source = self.mapper.resolve_rest_source(cls, kind, source_id, instance)
            if source is not None:
                json_obj = self._fetch_proxy(source, rq.component_state)
        return UIIncrement(app_data={"_restfetch": json_obj})

    def _fetch_proxy(self, source, state: dict) -> Any:
        """Fetch a resolved source server-side (url/headers/body interpolated); an empty object on
        any non-2xx or transport error."""
        try:
            # values percent-encoded by position: client state cannot steer the server's request
            url = interpolate_url(source.url or "", lambda expr: self._value_of(expr, state))
            if not url.lower().startswith(("http://", "https://")):
                # urllib also opens file:// and ftp:// — a proxy source is an HTTP endpoint only.
                log.warning("Proxy fetch refused: %r is not an http(s) url", url)
                return {}
            method = (source.method or "GET").upper()
            data = None
            if method not in ("GET", "HEAD") and source.body:
                data = self._interpolate(source.body, state).encode()
            req = urllib.request.Request(url, data=data, method=method)
            req.add_header("Accept", "application/json")
            for name, value in (source.headers or {}).items():
                req.add_header(name, self._interpolate(value, state))
            with urllib.request.urlopen(req, timeout=self.proxy_timeout_seconds) as resp:
                if resp.status >= 400:
                    return {}
                return json.loads(resp.read().decode())
        except (urllib.error.URLError, ValueError, OSError) as e:
            log.warning("Proxy fetch failed for %s: %s", getattr(source, "url", "?"), e)
            return {}

    def _resolve_secret(self, key: str) -> str | None:
        """Resolve a secret: the injected provider first, then the environment — but ONLY variables
        prefixed ``MATEU_SECRET_`` (``${secret.API_TOKEN}`` reads ``MATEU_SECRET_API_TOKEN``). A
        template must not be able to read just any variable of the process (database passwords,
        cloud credentials) and send it to an endpoint."""
        if self._secrets is not None:
            value = self._secrets(key)
            if value is not None:
                return value
        return os.environ.get(secret_env_name(key))

    def _value_of(self, expr: str, state: dict) -> str:
        """The string a ${state.x}/${secret.X} placeholder resolves to (unknown → empty)."""
        if expr.startswith("state."):
            v = state.get(expr[6:])
            if v is None:
                return ""
            if isinstance(v, bool):
                return "true" if v else "false"
            return str(v)
        if expr.startswith("secret."):
            return self._resolve_secret(expr[7:]) or ""
        return ""

    def _interpolate(self, template: str | None, state: dict) -> str:
        """Interpolate ${state.x}/${secret.X} placeholders (unknown → empty)."""
        if not template:
            return template or ""
        return re.sub(
            r"\$\{([^}]+)\}", lambda m: self._value_of(m.group(1).strip(), state), template
        )
