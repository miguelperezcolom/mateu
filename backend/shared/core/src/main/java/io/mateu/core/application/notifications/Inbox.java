package io.mateu.core.application.notifications;

import io.mateu.dtos.MessageDto;
import io.mateu.dtos.MessagePersistenceDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.LiveNotifications;
import io.mateu.uidl.data.AppNotification;
import io.mateu.uidl.data.MessageAction;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.InboxStore;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * The server side of {@code inbox} messages: an answer that carries a {@code Message} with
 * persistence {@code inbox} for a SIGNED-IN caller stores it in the caller's {@link InboxStore}
 * (the app's bean, else Mateu's {@link InMemoryInboxStore}) and pushes it to the caller's other
 * sessions ({@link LiveNotifications}) — so it is in the bell after a reload, in another tab, on
 * another device. The message's {@code key} becomes the entry id (stamped on the wire message when
 * it had none), so the browser's own session entry and the stored one are the same entry.
 *
 * <p>An anonymous caller's inbox messages are not stored: there is no principal to keep them for.
 */
public final class Inbox {

  private static final InMemoryInboxStore DEFAULT = new InMemoryInboxStore();
  private static final DateTimeFormatter WHEN = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

  private Inbox() {}

  /** The store in use: the app's {@code InboxStore} bean, else Mateu's in-memory one. */
  public static InboxStore store() {
    try {
      var beans = io.mateu.uidl.di.MateuBeanProvider.getSingletonBeans(InboxStore.class);
      if (!beans.isEmpty()) {
        return beans.iterator().next();
      }
    } catch (RuntimeException noContainer) {
      // no bean provider (a plain unit test): the default store
    }
    return DEFAULT;
  }

  /** The signed-in caller's name, or null for an anonymous caller. */
  public static String principalOf(HttpRequest httpRequest) {
    if (httpRequest == null) {
      return null;
    }
    var name = io.mateu.core.infra.security.IdentityResolver.resolve(httpRequest).name();
    return name == null || name.isBlank() ? null : name;
  }

  /** {@code increment} with its inbox messages stored (and keyed); unchanged when it has none. */
  public static UIIncrementDto storeMessages(UIIncrementDto increment, HttpRequest httpRequest) {
    if (increment == null
        || increment.messages().stream()
            .noneMatch(m -> m.persistence() == MessagePersistenceDto.inbox)) {
      return increment;
    }
    // resolved only now: most answers carry no inbox message (RequestBudgetTest)
    var principal = principalOf(httpRequest);
    if (principal == null) {
      return increment;
    }
    var store = store();
    var messages = new ArrayList<MessageDto>(increment.messages().size());
    boolean changed = false;
    for (var message : increment.messages()) {
      if (message.persistence() != MessagePersistenceDto.inbox) {
        messages.add(message);
        continue;
      }
      var keyed = message;
      if (message.key() == null || message.key().isBlank()) {
        keyed = withKey(message, "inbox-" + UUID.randomUUID());
        changed = true;
      }
      var entry = entryOf(keyed);
      try {
        store.add(principal, entry);
        LiveNotifications.publish(principal, entry);
      } catch (RuntimeException e) {
        // the toast still shows: a store that fails must not fail the action
        org.slf4j.LoggerFactory.getLogger(Inbox.class)
            .warn("Could not store an inbox message: {}", e.toString());
      }
      messages.add(keyed);
    }
    return changed ? withMessages(increment, messages) : increment;
  }

  /** The inbox entry an {@code inbox} message becomes. */
  static AppNotification entryOf(MessageDto message) {
    var actions = new ArrayList<MessageAction>();
    for (var action : message.actions()) {
      // an actionId needs the screen that sent the message: only routes still make sense later
      if (action.route() != null && !action.route().isBlank()) {
        actions.add(new MessageAction(action.label(), null, null, action.route(), action.style()));
      }
    }
    var title = message.title() != null && !message.title().isBlank() ? message.title() : null;
    return AppNotification.builder()
        .id(message.key())
        .title(title != null ? title : message.text())
        .text(title != null ? message.text() : null)
        .unread(true)
        .when(LocalDateTime.now().format(WHEN))
        .variant(variantOf(message))
        .actions(List.copyOf(actions))
        .build();
  }

  private static NotificationVariant variantOf(MessageDto message) {
    if (message.variant() == null) {
      return null;
    }
    try {
      return NotificationVariant.valueOf(message.variant().name());
    } catch (IllegalArgumentException e) {
      return null;
    }
  }

  private static MessageDto withKey(MessageDto m, String key) {
    return new MessageDto(
        m.variant(),
        m.position(),
        m.title(),
        m.text(),
        m.duration(),
        m.undoLabel(),
        m.undoActionId(),
        m.undoParameters(),
        m.persistence(),
        m.actions(),
        key);
  }

  private static UIIncrementDto withMessages(UIIncrementDto i, List<MessageDto> messages) {
    return new UIIncrementDto(
        i.commands(),
        messages,
        i.fragments(),
        i.banners(),
        i.appendBanners(),
        i.appData(),
        i.appState(),
        i.wireVersion(),
        i.restSources(),
        i.fragmentCache());
  }
}
