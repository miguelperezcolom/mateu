"""Remote push (``@app(os_notifications=True)`` beyond an app in front) — Java's
``io.mateu.uidl.push`` / ``PushTokenStore`` / ``PushSender`` / ``PushNotifications``.

The phone app registers its push token with the reserved ``_push-register`` action and removes it
with ``_push-unregister``; every ``inbox`` message Mateu stores for a signed-in caller — and every
:meth:`PushNotifications.send` — then reaches the app's :class:`PushSender` with that caller's
tokens. Mateu ships UI only: storage and delivery are the app's (``add_mateu(push_token_store=…,
push_sender=…)``), or Mateu's opt-in Expo sender (``expo_push=True`` /
``MATEU_PUSH_EXPO_ENABLED=true``). Mateu's default store is in memory and LOST ON RESTART
(EXPERIMENTAL)."""

from __future__ import annotations

import threading
from abc import ABC, abstractmethod
from collections import OrderedDict
from dataclasses import dataclass, field
from typing import Callable


@dataclass(frozen=True)
class PushToken:
    """One phone's push address: the push service's token, the platform (``ios`` | ``android``),
    a device id drawn once per install, and the base url the phone knows this UI by (a push
    carries it back so a tap opens THIS UI)."""

    token: str
    platform: str | None = None
    device_id: str | None = None
    ui: str | None = None


@dataclass(frozen=True)
class PushMessage:
    """What a push says: a title, an optional text, the route a tap opens and an optional id that
    collapses repeats. ``data`` is extra key/value data; Mateu adds ``ui`` and ``route``."""

    title: str | None
    text: str | None = None
    route: str | None = None
    id: str | None = None
    data: dict = field(default_factory=dict)

    @staticmethod
    def of(entry) -> "PushMessage":
        """The push an inbox entry (``AppNotification``) becomes: its title, text and route (or
        its first action's)."""
        route = entry.route or next((a.route for a in (entry.actions or []) if a.route), None)
        return PushMessage(title=entry.title, text=entry.text, route=route, id=entry.id)


@dataclass(frozen=True)
class PushResult:
    """How many pushes the service accepted, and the tokens it said are no longer valid (Mateu
    unregisters those)."""

    accepted: int = 0
    unregistered_tokens: tuple = ()


class PushTokenStore(ABC):
    """Where the phones' push tokens are kept. ``principal`` is the identity the host
    authenticated; an anonymous caller's token is kept under ``session:<X-Session-Id>``."""

    @abstractmethod
    def register(self, principal: str, token: PushToken) -> None:
        """Keeps ``token`` for ``principal``; the same token, or another token of the same device,
        replaces the previous entry, whoever it belonged to."""

    @abstractmethod
    def unregister(self, token: str) -> None:
        """Forgets this token, whoever it was registered for."""

    @abstractmethod
    def tokens_for(self, principal: str) -> list:
        """The tokens of ``principal``'s phones."""


class PushSender(ABC):
    """Sends a push to phones. Each push must carry, as data, ``ui`` = the token's ``ui`` and
    ``route`` = the message's route. Called off the request thread."""

    @abstractmethod
    def send(self, message: PushMessage, tokens: list) -> PushResult:
        """Sends ``message`` to ``tokens``; reports the tokens the service no longer knows."""


class InMemoryPushTokenStore(PushTokenStore):
    """Mateu's default store: in memory, bounded (10 tokens per principal, 10 000 principals),
    per process, LOST ON RESTART."""

    def __init__(self, max_per_principal: int = 10, max_principals: int = 10_000):
        self.max_per_principal = max_per_principal
        self.max_principals = max_principals
        self._lock = threading.Lock()
        self._tokens: "OrderedDict[str, list]" = OrderedDict()

    def _remove_where(self, match) -> None:
        for key in list(self._tokens):
            kept = [t for t in self._tokens[key] if not match(t)]
            if kept:
                self._tokens[key] = kept
            else:
                del self._tokens[key]

    def register(self, principal: str, token: PushToken) -> None:
        if not principal or token is None or not token.token:
            return
        with self._lock:
            self._remove_where(
                lambda t: t.token == token.token
                or (t.device_id is not None and t.device_id == token.device_id and t.ui == token.ui)
            )
            tokens = self._tokens.setdefault(principal, [])
            self._tokens.move_to_end(principal)
            tokens.append(token)
            del tokens[: max(0, len(tokens) - self.max_per_principal)]
            while len(self._tokens) > self.max_principals:
                self._tokens.popitem(last=False)

    def unregister(self, token: str) -> None:
        with self._lock:
            self._remove_where(lambda t: t.token == token)

    def tokens_for(self, principal: str) -> list:
        with self._lock:
            return list(self._tokens.get(principal, []))


class PushNotifications:
    """Sends a push notification to a user's phones — it reaches the phone while the Mateu app is
    suspended or closed. Mateu already sends one for every ``inbox`` message it stores for a
    signed-in caller; call this for what your own code puts in the inbox. Nothing is sent unless
    the app has a sender and the phone registered; off the calling thread; never raises."""

    _listeners: list = []
    _lock = threading.Lock()

    @classmethod
    def send(cls, principal: str, message) -> None:
        """Sends ``message`` (a :class:`PushMessage`, or an ``AppNotification``) to ``principal``'s
        phones."""
        if not principal or not str(principal).strip() or message is None:
            return
        if not isinstance(message, PushMessage):
            message = PushMessage.of(message)
        with cls._lock:
            listeners = list(cls._listeners)
        for listener in listeners:
            try:
                listener(principal, message)
            except Exception:  # noqa: BLE001 — a broken delivery must not fail the caller
                pass

    @classmethod
    def send_to_session(cls, session_id: str, message) -> None:
        """Sends ``message`` to the phone of an ANONYMOUS session (its ``X-Session-Id``)."""
        if session_id and str(session_id).strip():
            cls.send(cls.session_key(session_id), message)

    @staticmethod
    def session_key(session_id: str) -> str:
        """The store key of an anonymous session's tokens."""
        return "session:" + session_id

    @classmethod
    def subscribe(cls, deliver: Callable[[str, PushMessage], None]) -> Callable[[], None]:
        """The framework's delivery listens here; answers the unsubscribe. An app does not need it."""
        with cls._lock:
            cls._listeners.append(deliver)

        def unsubscribe() -> None:
            with cls._lock:
                if deliver in cls._listeners:
                    cls._listeners.remove(deliver)

        return unsubscribe
