"""Proxy-mode REST fetches (__restfetch__): the declared source, ${secret.X} injection, the server-side call (Java's RunActionUseCase.resolveSecret / RestSourceResolver)."""

from __future__ import annotations

import json
import os
import re
from typing import Any
import urllib.request

from mateu_dtos import UIIncrement

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
            source = self.mapper.resolve_rest_source(cls, kind, source_id)
            if source is not None:
                json_obj = self._fetch_proxy(source, rq.component_state)
        return UIIncrement(app_data={"_restfetch": json_obj})

    def _fetch_proxy(self, source, state: dict) -> Any:
        """Fetch a resolved source server-side (url/headers/body interpolated); an empty object on
        any non-2xx or transport error."""
        try:
            url = self._interpolate(source.url, state)
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
        """Resolve a secret: the injected provider first, then the same-named env var."""
        if self._secrets is not None:
            value = self._secrets(key)
            if value is not None:
                return value
        return os.environ.get(key)

    def _interpolate(self, template: str | None, state: dict) -> str:
        """Interpolate ${state.x}/${secret.X} placeholders (unknown → empty)."""
        if not template:
            return template or ""

        def repl(m: re.Match) -> str:
            expr = m.group(1).strip()
            if expr.startswith("state."):
                v = state.get(expr[6:])
                return "" if v is None else str(v)
            if expr.startswith("secret."):
                return self._resolve_secret(expr[7:]) or ""
            return ""

        return re.sub(r"\$\{([^}]+)\}", repl, template)
