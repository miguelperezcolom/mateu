"""Push notifications on the Mateu mobile app (EXPERIMENTAL; mirrors Java's
``io.mateu.uidl.data.PushRegistration`` and ``io.mateu.uidl.interfaces.PushTokenRegistry``).

Mateu ships UI only: the token store and the sending are the app's. An ``@app`` class implementing
:class:`PushTokenRegistry` makes the phone offer "Notifications on this phone"; turning it on
registers the device's Expo push token with THIS UI (``_push-register``), turning it off or
removing the UI unregisters it (``_push-unregister``). Send with Expo Push Service
(``POST https://exp.host/--/api/v2/push/send``) and ``"data": {"mateu": {"ui": <ui_key>, "route":
"/orders/42"}}``: the phone opens that route of this UI when the notification is tapped.
"""

from __future__ import annotations

from dataclasses import dataclass

#: The push service of the Mateu mobile app (Expo Push Service → APNs / FCM).
EXPO = "expo"


@dataclass(frozen=True)
class PushRegistration:
    """One device asking ONE UI for push notifications (or to stop them), already validated.

    ``token`` is the device's Expo push token (keep it like a credential); ``service`` is
    ``"expo"``; ``platform`` ``"ios"`` or ``"android"``; ``ui_key`` the opaque key the app drew for
    THIS UI on THIS device — send it back in every push as ``data.mateu.ui``; ``principal`` the
    caller the host framework authenticated (None = anonymous), never a value from the request."""

    token: str
    service: str
    platform: str
    ui_key: str
    principal: str | None = None


class PushTokenRegistry:
    """Implemented by the ``@app`` class to take the Mateu mobile app's push registrations. Scope
    each registration to its ``principal``, and unregister only a token that principal
    registered."""

    def register_push_token(self, registration: PushRegistration) -> None:
        """The device wants this UI's notifications (sent again on every app start: be idempotent)."""
        raise NotImplementedError

    def unregister_push_token(self, registration: PushRegistration) -> None:
        """The device no longer wants them (turned off, or the UI was removed from the phone)."""
        raise NotImplementedError
