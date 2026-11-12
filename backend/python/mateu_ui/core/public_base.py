"""The PUBLIC base path of the app — the Python twin of Java's ``io.mateu.core.infra.PublicBase``
and .NET's ``PublicBase``: the path in front of everything it serves as the BROWSER sees it, ``""``
at the root of a host, ``"/crm"`` under an ASGI ``root_path`` (``uvicorn --root-path /crm``,
``FastAPI(root_path=…)``) or behind a reverse proxy that serves the app at ``/crm/`` and strips the
prefix before forwarding.

It is the explicit prefix (``add_mateu(public_base_path=…)``, else ``MATEU_PUBLIC_BASE_PATH``; Java's
``mateu.public-base-path``) followed by the request's ``root_path``. ``X-Forwarded-Prefix`` is NOT
read here: the header comes from the client unless a proxy overwrites it, and uvicorn does not
apply it; a proxy that strips a prefix is declared with the setting or with ``--root-path``.

Only the served page needs it (its assets, its ``<mateu-ui baseUrl>``, the PWA links); everything
else answers the path it receives. A value that is not a plain path is ignored: it ends up in markup.
"""

from __future__ import annotations

import os
import re

#: The explicit prefix, when not passed to ``add_mateu(public_base_path=…)``.
ENV_VAR = "MATEU_PUBLIC_BASE_PATH"

_PLAIN_PATH = re.compile(r"(/[A-Za-z0-9._~-]+)+")


def normalize(value: str | None) -> str:
    """``value`` as a base path (``""`` or ``"/a/b"``), ``""`` when blank, ``"/"`` or not a plain path."""
    if value is None:
        return ""
    v = value.strip()
    if "," in v:  # a proxy that chains prefixes: the first one is the client-facing one
        v = v.split(",", 1)[0].strip()
    v = v.rstrip("/")
    if not v:
        return ""
    if not v.startswith("/"):
        v = "/" + v
    return v if _PLAIN_PATH.fullmatch(v) else ""


def of(root_path: str | None, configured: str | None = None) -> str:
    """The public base of a request: the configured prefix (else :data:`ENV_VAR`) followed by its
    ASGI ``root_path``."""
    explicit = configured if configured is not None and configured.strip() else os.environ.get(ENV_VAR)
    return normalize(explicit) + normalize(root_path)


_ROOT_RELATIVE_ATTR = re.compile(r"""(\s(?:src|href|data-src)\s*=\s*)(["'])/(?!/)""", re.IGNORECASE)
_VB_BASE_URL = re.compile(r"""(\bBASE_URL\s*:\s*)(["'])/(?!/)""")


def rewrite(html: str, public_base: str | None) -> str:
    """``html`` with its root-relative URLs (``src``, ``href``, ``data-src``, a Redwood page's
    ``<base href="/">`` and ``BASE_URL``) under ``public_base``; a no-op for ``""``."""
    b = normalize(public_base)
    if not b:
        return html
    html = _ROOT_RELATIVE_ATTR.sub(lambda m: m.group(1) + m.group(2) + b + "/", html)
    return _VB_BASE_URL.sub(lambda m: m.group(1) + m.group(2) + b + "/", html)
