"""Remote push: the reserved ``_push-register`` / ``_push-unregister`` actions, the delivery of one
push (off the request thread; gone tokens unregistered) and Mateu's opt-in Expo sender (stdlib
HTTP — no SDK). Mirrors Java's ``PushActionRunner`` / ``Push`` / ``ExpoPushSender`` (EXPERIMENTAL)."""

from __future__ import annotations

import json
import logging
import os
import re
import threading
import urllib.error
import urllib.request
from urllib.parse import urlparse

from mateu_ui.uidl.push import (
    InMemoryPushTokenStore,
    PushMessage,
    PushNotifications,
    PushResult,
    PushSender,
    PushToken,
    PushTokenStore,
)

log = logging.getLogger("mateu_ui.push")

REGISTER_ACTION = "_push-register"
UNREGISTER_ACTION = "_push-unregister"
PUSH_ACTIONS = (REGISTER_ACTION, UNREGISTER_ACTION)

_TOKEN = re.compile(r"[\x21-\x7E]{1,4096}")
_DEVICE = re.compile(r"[A-Za-z0-9._:-]{1,128}")
_PLATFORMS = {"ios", "android", "web"}

_warned = False
_warn_lock = threading.Lock()


def expo_enabled_from_env() -> bool:
    """``MATEU_PUSH_EXPO_ENABLED`` (true/1/yes) turns Mateu's Expo sender on."""
    return os.environ.get("MATEU_PUSH_EXPO_ENABLED", "").strip().lower() in ("true", "1", "yes")


def default_store_warned(store: PushTokenStore) -> PushTokenStore:
    """``store``, with one WARN the first time Mateu's in-memory default is used."""
    global _warned
    if isinstance(store, InMemoryPushTokenStore):
        with _warn_lock:
            if not _warned:
                _warned = True
                log.warning(
                    "Push tokens are kept in memory (no push_token_store): they are lost on restart"
                    " and not shared across processes. Pass add_mateu(push_token_store=...) to keep them."
                )
    return store


def valid_token(token) -> bool:
    return isinstance(token, str) and _TOKEN.fullmatch(token) is not None


def web_url(value) -> str | None:
    """An http(s) url, else None."""
    if not isinstance(value, str) or len(value) > 2048:
        return None
    try:
        parsed = urlparse(value)
    except ValueError:
        return None
    return value if parsed.scheme in ("http", "https") and parsed.hostname else None


def token_of(token: str, platform, device_id, ui) -> PushToken:
    """The registration a request's parameters describe (unusable values dropped)."""
    return PushToken(
        token=token,
        platform=platform if platform in _PLATFORMS else None,
        device_id=device_id if isinstance(device_id, str) and _DEVICE.fullmatch(device_id) else None,
        ui=web_url(ui),
    )


def owner_of(principal: str | None, session_id: str | None) -> str | None:
    """Who a registration is for: the principal, else the anonymous session, else None."""
    if principal and str(principal).strip():
        return principal
    if session_id and session_id.strip() and len(session_id) <= 128:
        return PushNotifications.session_key(session_id)
    return None


def deliver_now(principal: str, message: PushMessage, sender: PushSender, store: PushTokenStore) -> None:
    """Sends ``message`` to ``principal``'s phones and unregisters what the sender reports gone."""
    try:
        tokens = store.tokens_for(principal)
        if not tokens:
            return
        result = sender.send(message, tokens)
        for gone in (result.unregistered_tokens if result else ()):
            store.unregister(gone)
    except Exception as e:  # noqa: BLE001 — a failing push must not fail anything
        log.warning("A push could not be sent: %s", e)


def deliver(principal: str, message: PushMessage, sender: PushSender | None, store: PushTokenStore) -> None:
    """The same, off the calling thread (nothing when push is off)."""
    if sender is None or not principal:
        return
    threading.Thread(
        target=deliver_now, args=(principal, message, sender, store), name="mateu-push", daemon=True
    ).start()


class ExpoPushSender(PushSender):
    """Mateu's optional sender over Expo's push service: batches of at most 100, the access token
    (``MATEU_PUSH_EXPO_ACCESS_TOKEN``) as a bearer token, a ``DeviceNotRegistered`` ticket reports
    its token gone. Expo's receipts are not polled."""

    DEFAULT_URL = "https://exp.host/--/api/v2/push/send"
    BATCH = 100
    CHANNEL = "mateu"

    def __init__(self, url: str | None = None, access_token: str | None = None, timeout: float = 30.0):
        self.url = url or self.DEFAULT_URL
        self.access_token = access_token or None
        self.timeout = timeout

    @classmethod
    def message_for(cls, message: PushMessage, token: PushToken) -> dict:
        data = dict(message.data or {})
        if token.ui:
            data["ui"] = token.ui
        if message.route:
            data["route"] = message.route
        if message.id is not None:
            data["id"] = message.id
        out = {"to": token.token, "title": message.title or "Notification"}
        if message.text:
            out["body"] = message.text
        out.update({"data": data, "sound": "default", "channelId": cls.CHANNEL})
        return out

    def send(self, message: PushMessage, tokens: list) -> PushResult:
        accepted = 0
        gone: list = []
        for start in range(0, len(tokens), self.BATCH):
            batch = tokens[start : start + self.BATCH]
            body = json.dumps([self.message_for(message, t) for t in batch]).encode("utf-8")
            headers = {"Content-Type": "application/json", "Accept": "application/json"}
            if self.access_token:
                headers["Authorization"] = "Bearer " + self.access_token
            request = urllib.request.Request(self.url, data=body, headers=headers, method="POST")
            try:
                with urllib.request.urlopen(request, timeout=self.timeout) as response:  # noqa: S310
                    tickets = json.loads(response.read().decode("utf-8")).get("data") or []
            except (urllib.error.URLError, OSError, ValueError) as e:
                log.warning("Expo push: a batch of %d could not be sent: %s", len(batch), e)
                continue
            for token, ticket in zip(batch, tickets):
                if ticket.get("status") == "ok":
                    accepted += 1
                elif (ticket.get("details") or {}).get("error") == "DeviceNotRegistered":
                    gone.append(token.token)
                else:
                    log.warning("Expo push refused a message: %s", ticket.get("message", ""))
        return PushResult(accepted=accepted, unregistered_tokens=tuple(gone))
