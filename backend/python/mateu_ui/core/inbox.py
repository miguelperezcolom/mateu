"""``inbox`` messages kept server-side (Java's inbox storage in ``RunActionUseCase``): an ``inbox``
Message an AUTHENTICATED caller receives is stored in the app's ``InboxStore`` (Mateu's in-memory
default unless the app gives one) and published to the caller's other sessions; the bell then lists
the supplier's entries plus the stored ones (EXPERIMENTAL)."""

from __future__ import annotations

import time
import uuid

from mateu_ui.dtos import UIIncrement

#: The format of a stored entry's ``when`` (server local time), identical in the three backends.
WHEN_FORMAT = "%Y-%m-%d %H:%M"


def entry_of(message, entry_id: str):
    """The inbox entry an ``inbox`` message becomes: title, text, variant, unread, the server's local
    time, and only the actions that carry a ``route`` (an ``action_id`` needs the screen that sent
    the message)."""
    from mateu_ui.uidl.messages import MessageAction
    from mateu_ui.uidl.suppliers import AppNotification

    actions = [
        MessageAction(label=a.label, action_id=None, parameters=None, route=a.route, style=a.style)
        for a in (message.actions or [])
        if a.route
    ]
    return AppNotification(
        id=entry_id,
        # a toast with no title is its text: the entry's title must say something
        title=message.title or message.text or "",
        text=(message.text or None) if message.title else None,
        route=None,
        unread=True,
        when=time.strftime(WHEN_FORMAT, time.localtime()),
        variant=message.variant or None,
        actions=actions,
    )


def store_messages(increment: UIIncrement, principal: str | None, store) -> UIIncrement:
    """Stores the ``inbox`` messages of ``increment`` for ``principal`` (nothing for an anonymous
    caller) and publishes each entry; answers the increment with every stored message's ``key``
    set to its entry id."""
    from mateu_ui.uidl.live_notifications import LiveNotifications

    if store is None or not principal or not str(principal).strip():
        return increment
    messages = []
    changed = False
    for message in increment.messages:
        if message.persistence != "inbox":
            messages.append(message)
            continue
        entry_id = message.key or f"inbox-{uuid.uuid4()}"
        entry = entry_of(message, entry_id)
        store.add(principal, entry)
        LiveNotifications.publish(principal, entry)
        if message.key != entry_id:
            message = message.model_copy(update={"key": entry_id})
            changed = True
        messages.append(message)
    return increment.model_copy(update={"messages": messages}) if changed else increment
