"""Proxy-mode REST fetches (__restfetch__): the declared source, ${secret.X} injection, the server-side call (Java's RunActionUseCase.resolveSecret / RestSourceResolver)."""

from __future__ import annotations

import copy
import json
import os
import re
from typing import Any, Callable
import urllib.error
import urllib.request

from mateu_ui.dtos import UIIncrement

from .. import sample_sources
from ..url_template import interpolate_url, resolve_expression, secret_env_name, template_text
from ._base import MixinBase
from ._common import (
    log,
    RunActionRq,
)


class ProxyError(Exception):
    """A proxied call that failed: a >=400 upstream status, or a transport error (status 0).
    ``detail`` is what the service said about it (its error body), for the user — or None."""

    def __init__(self, status: int, message: str, detail: str | None = None) -> None:
        super().__init__(message)
        self.status = status
        self.detail = detail


_SERVICE_MESSAGE_MAX = 300


def _clipped(text: str) -> str | None:
    clean = re.sub(r"\s+", " ", re.sub(r"[\x00-\x09\x0b-\x1f\x7f]", "", text)).strip()
    if not clean:
        return None
    if len(clean) > _SERVICE_MESSAGE_MAX:
        return clean[: _SERVICE_MESSAGE_MAX - 1] + "…"
    return clean


def service_message_of(body: str | None) -> str | None:
    """What an error body says, for a person (Java's RestProxyCalls.serviceMessageOf, same rule):
    a JSON object's ``message``, ``detail`` (RFC 7807), ``error`` (a string, or an object with a
    message) or ``title``; else short plain text (never HTML or a list); control characters out,
    whitespace folded, at most 300 characters; None when there is nothing worth showing."""
    if body is None:
        return None
    text = body.strip()
    if not text:
        return None
    if text.startswith("{"):
        try:
            obj = json.loads(text)
        except ValueError:
            return None
        if not isinstance(obj, dict):
            return None
        for key in ("message", "detail", "error", "title"):
            value = obj.get(key)
            if isinstance(value, str) and value.strip():
                return _clipped(value)
            if isinstance(value, dict):
                nested = value.get("message")
                if isinstance(nested, str) and nested.strip():
                    return _clipped(nested)
        return None
    if text.startswith(("<", "[")) or len(text) > _SERVICE_MESSAGE_MAX:
        return None
    return _clipped(text)


def _restfetch_error(status: int, detail: str | None = None) -> UIIncrement:
    """A failed proxied call rides back on ``_restfetchError`` (Java's restFetchError, same texts):
    an empty ``_restfetch`` read as success, and the renderer toasted "Saved" over a write that
    never happened. ``detail`` — what the service said — is what the renderer shows when present."""
    suffix = f" (HTTP {status})" if status > 0 else ""
    error: dict[str, Any] = {"status": status, "message": "Request failed" + suffix}
    if detail:
        error["detail"] = detail
    return UIIncrement(app_data={"_restfetchError": error})


class _NoRedirects(urllib.request.HTTPRedirectHandler):
    """A 3xx is not followed: urllib would re-send every header — a ``${secret.X}`` included — to
    wherever the answer points, and the origin rules cover only the first hop. Refused here, it
    surfaces as an ``HTTPError``, a failed call like any other (Java's client does not follow either)."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


_OPENER = urllib.request.build_opener(_NoRedirects)


def _open(request: urllib.request.Request, timeout: float):
    """The proxy's one way out to the network."""
    return _OPENER.open(request, timeout=timeout)


#: the proxy's own routing keys: what to call, never a value to interpolate
_ROUTING_PARAMETERS = frozenset({"_sourceKind", "_sourceId", "_forEachSelectedRow"})


def _call_state(rq: RunActionRq) -> dict:
    """The state a proxied call interpolates with: the component state with the action's parameters
    over it — a kanban move's ``_cardId``/``_toColumnId`` reach ``${state._toColumnId}`` as on the
    browser's direct leg (Java's RestProxyCalls.callState)."""
    state = dict(rq.component_state or {})
    for key, value in (rq.parameters or {}).items():
        if key not in _ROUTING_PARAMETERS:
            state[key] = value
    return state


def _declares_json(headers: dict | None) -> bool:
    """Whether the request declares a JSON body (a ``Content-Type`` naming json) — then the values
    interpolated into the body are JSON-escaped (Java's TemplateInterpolator.declaresJson)."""
    return any(
        name.lower() == "content-type" and value is not None and "json" in str(value).lower()
        for name, value in (headers or {}).items()
    )


def _json_escape(value: str) -> str:
    """The value as the inside of a JSON string literal (Java's TemplateInterpolator.jsonEscape)."""
    return json.dumps(value, ensure_ascii=False)[1:-1]


class ProxyHandlerMixin(MixinBase):
    # ── Proxy-mode external fetch (__restfetch__) ───────────────────────────────
    def _rest_fetch_response(self, rq: RunActionRq) -> UIIncrement:
        """Resolve the DECLARED source of the routed view by _sourceKind/_sourceId, interpolate
        ${state.x}/${secret.X}, fetch server-side and return the raw JSON on app_data._restfetch
        (an empty object when the view declares no such source). A failed call (>=400 upstream, or
        a transport error) answers app_data._restfetchError ``{status, message}`` instead."""
        cls = self.registry.resolve(rq.server_side_type, rq.route)
        if cls is None:
            # a definition-only page (no class): the source is the one its OWN `actions:` — or its
            # layout's listings / selects — declare for that kind and id, resolved against the
            # server's catalogue (Java's SeededYamlPage as a RestSourceSupplier) — the only channel
            # that injects ${secret.X} for such a page
            declared = self._definition_source(rq)
            if declared is not None:
                return self._proxied_answer(declared, rq)
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
                return self._proxied_answer(source, rq)
        return UIIncrement(app_data={"_restfetch": {}})

    def _proxied_answer(self, source, rq: RunActionRq) -> UIIncrement:
        """What ``__restfetch__`` answers for a source the page declares, a class view's or a
        definition-only page's alike (Java's RestProxyCalls.fetch)."""
        kind = rq.parameters.get("_sourceKind")
        source_id = rq.parameters.get("_sourceId")
        if sample_sources.enabled() and source.sample is not None:
            # SAMPLE mode (opt-in only): the proxied twin of the browser's short-circuit, so both
            # legs agree — a read gets the sample, a write succeeds without persisting anything,
            # and the endpoint is never called.
            method = (source.method or "GET").strip().upper()
            sample = copy.deepcopy(source.sample) if method in ("", "GET", "HEAD") else {}
            return UIIncrement(app_data={"_restfetch": sample})
        if not getattr(source, "proxy", False) and getattr(source, "url", None):
            # a DIRECT source is the browser's to call: proxying it on request ran a server-side
            # call (with ${secret.X} resolved) the author never asked for
            from ..action_guard import MateuForbiddenException

            raise MateuForbiddenException(
                f"Forbidden: __restfetch__ {kind}/{source_id} is not a proxied source"
            )
        # A route's fixedParams win over the client's state and the action's parameters on this
        # leg too (fixed > client state > …, as on the hydrating path): a pin enforced only when
        # hydrating the view would be a suggestion to a proxied url (Java's RestProxyCalls.fetch).
        match = self.routes.match(rq.route) if getattr(self, "routes", None) else None
        fixed = dict(match.entry.fixed_params or {}) if match is not None else {}
        state = {**_call_state(rq), **fixed}
        if str(rq.parameters.get("_forEachSelectedRow")).lower() == "true":
            return self._for_each_selected_row(source, state, fixed)
        try:
            return UIIncrement(app_data={"_restfetch": self._fetch_proxy(source, state)})
        except ProxyError as e:
            return _restfetch_error(e.status, e.detail)

    def _definition_source(self, rq: RunActionRq):
        """The resolved source the definition-only page declares for ``_sourceKind``/``_sourceId``
        (an action of its ``actions:``, a listing's rows, a select's options), or None when the route
        has no such page/source (or the caller is refused that action)."""
        from ..translations import locale_of
        from ..yaml_spec_loader import definition_sources, source_for

        spec = self.yaml_specs.load_spec_for(rq.route, self.mapper.authorized, locale_of(self.mapper))
        if spec is None or spec.model_view:
            return None
        kind = rq.parameters.get("_sourceKind")
        source_id = str(rq.parameters.get("_sourceId") or "")
        if kind == "action" and source_id in spec.refused_actions:
            return None
        resolve = self.rest_sources.resolve if self.rest_sources is not None else None
        return source_for(definition_sources(spec, resolve), kind, source_id)

    def _for_each_selected_row(self, source, state: dict, fixed: dict) -> UIIncrement:
        """Bulk (``forEachSelectedRow``): the loop runs HERE, once per selected listing row, each row
        merged over the state so ``.../people/${state.id}`` resolves to that row's id — except the
        route's ``fixed`` params, which a row cannot override — one round trip, the secret stays
        server-side (Java's RestProxyCalls.forEachSelectedRow)."""
        rows = state.get("crud_selected_items")
        rows = rows if isinstance(rows, list) else []
        failed = 0
        first: ProxyError | None = None
        for row in rows:
            row_state = dict(state)
            if isinstance(row, dict):
                row_state.update({str(k): v for k, v in row.items()})
            row_state.update(fixed)
            try:
                self._fetch_proxy(source, row_state)
            except ProxyError as e:
                failed += 1
                first = first or e
        if first is not None:
            # a failed row must not read as success: surface it rather than reload as if all done
            suffix = f" (HTTP {first.status})" if first.status > 0 else ""
            error: dict[str, Any] = {"status": first.status, "message": f"{failed} of {len(rows)} failed{suffix}"}
            if first.detail:
                error["detail"] = first.detail
            return UIIncrement(app_data={"_restfetchError": error})
        # the rows are gone; the client reloads the listing (successRoute), so no body is needed
        return UIIncrement(app_data={"_restfetch": {}})

    def _own_base_url(self) -> str | None:
        """This server's origin: the configured ``self_base_url`` (add_mateu / MATEU_SELF_BASE_URL),
        else the adapter's view of the local socket; None when neither is known."""
        from .. import microfrontends as mfe
        from ..request_context import current_request

        resolver = getattr(self, "microfrontends", None)
        settings = getattr(resolver, "settings", None)
        configured = getattr(settings, "self_base_url", None) or mfe._sane_self_base_url(
            os.environ.get("MATEU_SELF_BASE_URL")
        )
        if configured:
            return configured
        request = current_request()
        return mfe._sane_self_base_url(getattr(request, "self_base_url", None))

    def _fetch_proxy(self, source, state: dict) -> Any:
        """Fetch a resolved source server-side (url/headers/body interpolated) and return its JSON
        (an empty body — a 204 — is an empty object). Raises :class:`ProxyError` on a non-2xx or a
        transport error, so the failure is surfaced rather than mistaken for success."""
        # Logged by its TEMPLATE, never the resolved url: that may carry a ${secret.X}.
        template = getattr(source, "url", None) or "?"
        try:
            # values percent-encoded by position: client state cannot steer the server's request
            url = interpolate_url(source.url or "", lambda expr: self._value_of(expr, state))
            if url.startswith("/") and not url.startswith("//"):
                # a RELATIVE url is this app's own endpoint, as on the browser's direct leg:
                # resolved against the configured self base url, else the local socket — never a
                # request header (Java RestProxyCalls.absolute)
                own = self._own_base_url()
                if own is None:
                    log.warning(
                        "Proxy fetch of %r needs this server's base url: set"
                        " add_mateu(self_base_url=...) / MATEU_SELF_BASE_URL",
                        template,
                    )
                    raise ProxyError(0, "relative url without a self base url")
                url = own + url
            if not url.lower().startswith(("http://", "https://")):
                # urllib also opens file:// and ftp:// — a proxy source is an HTTP endpoint only.
                log.warning("Proxy fetch refused: %r is not an http(s) url", template)
                raise ProxyError(0, "not an http(s) url")
            method = (source.method or "GET").upper()
            data = None
            if method not in ("GET", "HEAD") and source.body:
                # The values go into the body ESCAPED when the request declares JSON: a quote or a
                # newline in a value would otherwise close the string early (or inject members).
                escape = _json_escape if _declares_json(source.headers) else None
                data = self._interpolate(source.body, state, escape).encode()
            req = urllib.request.Request(url, data=data, method=method)
            req.add_header("Accept", "application/json")
            for name, value in (source.headers or {}).items():
                req.add_header(name, self._interpolate(value, state))
            with _open(req, self.proxy_timeout_seconds) as resp:
                if resp.status >= 400:
                    raise ProxyError(resp.status, f"HTTP {resp.status}")
                body = resp.read().decode()
                return json.loads(body) if body.strip() else {}
        except ProxyError:
            raise
        except urllib.error.HTTPError as e:  # urllib raises for a >=400 answer
            log.warning("Proxy fetch failed for %s: HTTP %s", template, e.code)
            try:
                detail = service_message_of(e.read().decode(errors="replace"))
            except Exception:  # noqa: BLE001 - no body to read: the generic text then
                detail = None
            raise ProxyError(e.code, f"HTTP {e.code}", detail) from e
        except (urllib.error.URLError, ValueError, OSError) as e:
            log.warning("Proxy fetch failed for %s: %s", template, type(e).__name__)
            raise ProxyError(0, type(e).__name__) from e

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
        """The string a ${state.x}/${state.x.y}/${secret.X} placeholder resolves to (unknown → empty;
        a money value → its amount; ``a ?? b`` and ``encodeURIComponent(x)`` as in the browser)."""
        return template_text(resolve_expression(expr, state, self._resolve_secret))

    def _interpolate(
        self, template: str | None, state: dict, escape: Callable[[str], str] | None = None
    ) -> str:
        """Interpolate ${state.x}/${secret.X} placeholders (unknown → empty); ``escape`` is applied
        to each VALUE, never to the template's own punctuation."""
        if not template:
            return template or ""

        def value(m: re.Match[str]) -> str:
            v = self._value_of(m.group(1).strip(), state)
            return escape(v) if escape is not None else v

        return re.sub(r"\$\{([^}]+)\}", value, template)
